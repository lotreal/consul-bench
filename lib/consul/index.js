const got = require('got');
const pino = require('pino');

const logger = pino({
    name: 'consul',
    serializers: {
        req: pino.stdSerializers.req,
        res: pino.stdSerializers.res
    }
});

let get = (...opts) => {
    return new Promise((resove, reject) => {
        got(...opts)
            .then(response => {
                resove(response);
            })
            .catch(error => {
                console.log(error);
            });
    });
};

let http = (promise) => {
    return new Promise((resove, reject) => {
        promise
            .then(response => {
                resove(response);
            })
            .catch(error => {
                console.log(error);
            });
    });
};

var getServiceName = (payload) => payload.Service.Service;
var getMetaID = (payload) => payload.NodeMeta.id;


class Client {
    constructor(server) {
        [this.addr, this.port] = server.split(':');
        this.port = this.port || 8500;

        this.server = `${this.addr}:${this.port}`;
        this.endpoint = `http://${this.server}/v1`;
    }

    getEndpoint() {
        return this.endpoint;
    }

    debug() {
        console.log(this.endpoint);
    }

    query(serviceName) {
        let url = `${this.endpoint}/catalog/service/${serviceName}`;
        return http(got(url, { json: true}));
        // return get(url, { json: true});
    }

    register(payload) {
        let url = `${this.endpoint}/catalog/register`;
        this.log('CONSUL_REGISTRY_START', payload, url);

        return http(got.post(url, {
            body: JSON.stringify(payload)
        }));
    }

    deregister(service) {
        let url = `${this.endpoint}/catalog/deregister`;
        return got.put(url, {
            body: JSON.stringify({
                Node: service.Node,
                ServiceID: service.ServiceID
            })
        });
    }


    log(event, payload, url) {
        url = url || this.endpoint;
        logger.info({ event, payload, url });
    }

    bench(payload) {
        let t1 = Date.now();
        let serviceName = getServiceName(payload);

        this.query(serviceName)
            .then(response => {
                let check = response => {
                    let index = response.headers['x-consul-index'];

                    if (response.body.length == 0) {
                        // console.log('need watch again');
                        this.watch(payload, index).then(check);
                    } else {
                        let t2 = Date.now();
                        console.log(`${this.getEndpoint()}: WATCHED ${t2-t1}`);
                        // this.log('CONSUL_REGISTRY_WATCH_END', response.body);
                    }
                };

                let index = response.headers['x-consul-index'];
                this.watch(payload, index)
                    .then(check);
            });

    }

    watch(payload, index) {
        let serviceName = getServiceName(payload);
        let metaID = getMetaID(payload);

        let url = `${this.endpoint}/catalog/service/${serviceName}`;
        let query = {
            "node-meta": "id:" + metaID,
            "wait": "1s",
            "index": index
        };

        this.log('CONSUL_REGISTRY_WATCH', query, url);
        return http(got(url, { query, json: true } ));
    }

    query2(serviceName, query) {
        let url = `${this.endpoint}/catalog/service/${serviceName}`;

        this.log('CONSUL_REGISTRY_WATCH', query, url);
        return http(got(url, { query, json: true } ));
    }

    bench2(serviceName, metaID) {
        let query = {
            "node-meta": "id:" + metaID
        };
        let t1 = Date.now();

        let check = response => {
            if (response.body.length == 0) {
                query.index = response.headers['x-consul-index'];
                query.wait = "10s";

                this.query2(serviceName, query).then(check);
            } else {
                let t2 = Date.now();
                console.log(`${this.getEndpoint()}: WATCHED ${t2-t1}`);
                // this.log('CONSUL_REGISTRY_WATCH_END', response.body);
            }
        };

        this.query2(serviceName, query)
            .then(check);

    }

}

module.exports = { Client };
