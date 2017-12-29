const consul = require('./lib/consul');
const mock = require('./lib/mock');

const delay = require('delay');
const repeat = require('repeat');

let test_query = () => {
    // set watch 1s
    let c1 = new consul.Client('172.26.5.27');
    c1.query('consul')
            .then(response => {
                c1.log('CONSUL_REGISTRY_OK', response.body);
                // return Promise.resolve(42);
            })
        .then(response => {
            console.log(response);
        });

};
test_query();

let test_watch = () => {
    // set watch 1s
    let c1 = new consul.Client('172.26.5.27');
    let c2 = new consul.Client('172.26.5.28');

    let p1 = mock.Service();

    c1.bench(p1);

    delay(3000).then(() => {
        c2.register(p1)
            .then(response => {
                c1.log('CONSUL_REGISTRY_OK', response.body);
            });
    });
};

// test_watch();

let multi_watch = () => {
    let p1 = mock.Service();

    let c1 = new consul.Client('172.26.5.27');
    let c2 = new consul.Client('172.26.5.28');

    // let c1 = new consul.Client('172.26.16.82');
    // let c2 = new consul.Client('172.26.16.83');
    // let c3 = new consul.Client('172.26.16.86');
    // let c4 = new consul.Client('172.26.16.87');


    let agent = c1;
    let watchers = [ c1,c2 ];

    watchers.forEach((watcher) => {
        watcher.bench(p1);
    });

    agent.register(p1)
        .then(response => {
            // agent.log('CONSUL_REGISTRY_OK', response.body);
            console.log(`${agent.getEndpoint()}: REGISTRY_OK`);
        });
};

// repeat(multi_watch).every(500, 'ms').for(60, 'minutes').start.in(0, 'sec');

// 123456789000000000
