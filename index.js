const delay = require('delay');
const repeat = require('repeat');

var got = require('got');
var pino = require('pino');
var logger = pino({
    name: 'consul',
    level: 'info',
    serializers: {
        req: pino.stdSerializers.req,
        res: pino.stdSerializers.res
    }
});

var Mock = require('mockjs');
var Random = Mock.Random;


var web = function() {
    var addr = Random.ip();
    var tag = Random.lower(Random.last());

    return Mock.mock({
        "ID": "77D6dAbF-ADFa-feB1-CeE8-d693B7cCc65E",
        "Node": "@guid",
        "Address": "172.26.5.27",
        "NodeMeta": {
            "id": "@id",
            "env": "dev",
            "upstream_root": tag + ".@tld"
        },
        "Service": {
            "Service": "bench",
            "Tags": [
                tag
            ],
            "Address": addr,
            "Port|80-9999": 8080
        }
    });
};

var catalog_register_payload = web();


var consul = function(server) {
    console.log(`http://${server}/v1`);
    var endpoint = server + '/v1';

    var getServiceName = (payload) => payload.Service.Service;
    var getMetaID = (payload) => payload.NodeMeta.id;

    return {
        bench: function (payload) {
            var client = this;
            var t1 = Date.now();
            var serviceName = getServiceName(payload);

            client.query(serviceName)
                .then(response => {
                    var index = response.headers['x-consul-index'];

                    var check = response => {
                        var index = response.headers['x-consul-index'];

                        if (response.body.length == 0) {
                            // console.log('need watch again');

                            client.watch(payload, index)
                                .then(check)
                                .catch(error => {
                                    console.log(error);
                                });

                            // client.bench(payload);
                        } else {
                            var t2 = Date.now();
                            console.log(t2-t1);
                            client.log('CONSUL_REGISTRY_WATCH_END', response.body);
                        }
                    };

                    client.watch(payload, index)
                        .then(check)
                        .catch(error => {
                            console.log(error);
                        });
                });

        },

        watch: function(payload, index) {
            var serviceName = getServiceName(payload);
            var metaID = getMetaID(payload);

            var url = endpoint + '/catalog/service/' + serviceName;
            var query = {
                "node-meta": "id:" + metaID,
                "wait": "10s",
                "index": index
            };

            this.log('CONSUL_REGISTRY_WATCH', query, url);
            return got(url, { query, json: true } );
        },

        query: function(serviceName) {
            var url = endpoint + '/catalog/service/' + serviceName;
            return got(url, {
                json: true
            });
        },

        deregister: function(service) {
            var url = endpoint + '/catalog/deregister';
            return got.put(url, {
                body: JSON.stringify({
                    Node: service.Node,
                    ServiceID: service.ServiceID
                })
            });
        },

        register: function(payload) {
            var url = endpoint + '/catalog/register';
            this.log('CONSUL_REGISTRY_START', payload, url);

            return got.post(url, {
                body: JSON.stringify(payload)
            });
        },

        log: function(event, payload, url) {
            url = url || endpoint;
            logger.info({ event, payload, url });
        }
    };
};

var register_bench = () => {
    var c1 = consul("http://172.26.5.27:8500");
    var c2 = consul("http://172.26.5.28:8500");

    var p1 = web();
    var p2 = web();

    c1.bench(p1);
    c2.bench(p1);

    delay(1000).then(() => {
        c1.register(p2)
            .then(response => {
                c1.log('CONSUL_REGISTRY_OK', response.body);
            })
            .catch(error => {
                console.log(error);
            });
    });

    delay(3000).then(() => {
        c1.register(p1)
            .then(response => {
                c1.log('CONSUL_REGISTRY_OK', response.body);
            })
            .catch(error => {
                console.log(error);
            });
    });
};

var register_bench2 = () => {
    var c1 = consul("http://172.26.5.27:8500");
    var c2 = consul("http://172.26.5.28:8500");

    var p1 = web();
    var p2 = web();

    // c1.bench(p1);
    c1.bench(p1);

    c2.register(p1)
        .then(response => {
            c1.log('CONSUL_REGISTRY_OK', response.body);
        })
        .catch(error => {
            console.log(error);
        });
};

var deregisterAll = (serviceName) => {
    var c1 = consul("http://172.26.5.27:8500");

    c1.query(serviceName)
        .then(response => {
            response.body.forEach((service, i) => {
                c1.deregister(service);
            });
        })
        .catch(error => {
            console.log(error);
        });
};

// repeat(register_bench2).every(500, 'ms').for(60, 'minutes').start.in(0, 'sec');
// deregisterAll('bench');

var c = consul('172.26.5.27:8500');
