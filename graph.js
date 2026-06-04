const fs = require('fs');

class Graph {
    #edges;
    #nodes;

    constructor(edge, node) {
        this.#edges = JSON.parse(fs.readFileSync(`./${edge}.json`));

        this.#nodes = JSON.parse(fs.readFileSync(`./${node}.json`));
    }

    get edges() {
        return this.#edges;
    }

    get nodes() {
        return this.#nodes;
    }

    buildGraph() {
        const hashmap = {};

        for (let i = 0; i < this.edges.features.length; i++) {
            const prop = this.edges.features[i].properties;
            const u = prop.u;
            const v = prop.v;
            const length = prop.length;
            if (!hashmap[u]) hashmap[u] = [];
            if (!hashmap[v]) hashmap[v] = [];

            hashmap[u].push({id: v,length: length});

            if (!prop.oneway) {
                hashmap[v].push({id: u,length: length
            });
            }
            hashmap[v].push({id: u,length: length});
        }

        return hashmap;
    }

    buildNodes() {
        const hashmap = {};

        for (let i = 0; i < this.nodes.features.length; i++) {
            const prop = this.nodes.features[i].properties;

            hashmap[prop.osmid] = {
                lat: prop.y,
                lon: prop.x
            };
        }

        return hashmap;
    }
}

/*
const graph = new Graph('edges', 'nodes');

const adjacencyList = graph.buildGraph();
const nodeMap = graph.buildNodes();

console.log(adjacencyList[64695853]);
console.log(nodeMap[64695853]);
*/
