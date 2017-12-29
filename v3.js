const consul = require('./lib/consul');
const mock = require('./lib/mock');

const delay = require('delay');
const repeat = require('repeat');

let multi_watch = () => {
    let testid = 123456789000000000;

    // let c1 = new consul.Client('172.26.5.27');
    // let c2 = new consul.Client('172.26.5.28');

    let c1 = new consul.Client('172.26.16.82');
    let c2 = new consul.Client('172.26.16.83');
    let c3 = new consul.Client('172.26.16.86');
    let c4 = new consul.Client('172.26.16.87');


    let agent = c1;
    let watchers = [ c1, c2, c3, c4 ];

    watchers.forEach((watcher) => {
        watcher.bench2("web", testid);
    });

    // agent.register(p1)
    //     .then(response => {
    //         // agent.log('CONSUL_REGISTRY_OK', response.body);
    //         console.log(`${agent.getEndpoint()}: REGISTRY_OK`);
    //     });
};
multi_watch();
// repeat(multi_watch).every(500, 'ms').for(60, 'minutes').start.in(0, 'sec');
