const Mock = require('mockjs');
const Random = Mock.Random;

let Service = () => {
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

module.exports = { Service };
