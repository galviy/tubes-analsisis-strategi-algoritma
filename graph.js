const fs = require('fs');

class Graph {
    #edges;
    #nodes;
    #graph;

    constructor(edge, node) {
        this.#edges = JSON.parse(fs.readFileSync(`./${edge}.json`, 'utf8'));
        this.#nodes = JSON.parse(fs.readFileSync(`./${node}.json`, 'utf8'));
        this.#graph = this.buildGraph();
    }

    get graph() {
        return this.#graph;
    }

    buildGraph() {
        const hashmap = {};

        for (let i = 0; i < this.#edges.features.length; i++) {
            const prop = this.#edges.features[i].properties;

            const u = String(prop.u);
            const v = String(prop.v);
            const length = prop.length;

            if (!hashmap[u]) hashmap[u] = [];
            if (!hashmap[v]) hashmap[v] = [];

            hashmap[u].push({
                id: v,
                length: length
            });

            if (!prop.oneway) {
                hashmap[v].push({id: u,length: length});
            }
        }

        return hashmap;
    }

    buildNodes() {
        const hashmap = {};

        for (let i = 0; i < this.#nodes.features.length; i++) {
            const prop = this.#nodes.features[i].properties;

            hashmap[String(prop.osmid)] = {
                lat: prop.y,
                lon: prop.x
            };
        }

        return hashmap;
    }

    dfs(start, end) {
        let iteration = 0;
        start = String(start);
        end = String(end);

        const visited = new Set();

        const stack = [{
            node: start,
            path: [start],
            totalLength: 0
        }];

        let explored = 0;

        while (stack.length > 0) {
            const current = stack.pop();

            if (visited.has(current.node)) {
                continue;
            }

            visited.add(current.node);
            explored++;

            if (current.node === end) {
                return {
                    path: current.path,
                    totalLength: current.totalLength,
                    explored: explored,
                    iterasi:iteration
                };
            }

            const neighbors = this.#graph[current.node] || [];

            for (let i = 0; i < neighbors.length; i++) {
                iteration++;
                if (!visited.has(neighbors[i].id)) {
                    stack.push({
                        node: neighbors[i].id,
                        path: current.path.concat(neighbors[i].id),
                        totalLength:
                            current.totalLength + neighbors[i].length
                    });
                }
            }
        }

        return null;
    }

    bfs(start, end) {
        start = String(start);
        end = String(end);
         let iteration = 0;
        const visited = new Set();

        const queue = [{
            node: start,
            path: [start],
            totalLength: 0
        }];

        let explored = 0;

        while (queue.length > 0) {
            const current = queue.shift();

            if (visited.has(current.node)) {
                continue;
            }

            visited.add(current.node);
            explored++;

            if (current.node === end) {
                return {
                    path: current.path,
                    totalLength: current.totalLength,
                    explored: explored,
                    iterasi: iteration
                };
            }

            const neighbors = this.#graph[current.node] || [];

            for (let i = 0; i < neighbors.length; i++) {
                iteration++;
                if (!visited.has(neighbors[i].id)) {
                    queue.push({
                        node: neighbors[i].id,
                        path: current.path.concat(neighbors[i].id),
                        totalLength:
                            current.totalLength + neighbors[i].length
                    });
                }
            }
        }

        return null;
    }
    heuristic(a, b) {

        const R = 6371000;

        const lat1 = a.lat * Math.PI / 180;
        const lat2 = b.lat * Math.PI / 180;

        const dLat = (b.lat - a.lat) * Math.PI / 180;
        const dLon = (b.lon - a.lon) * Math.PI / 180;

        const x =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1) *
            Math.cos(lat2) *
            Math.sin(dLon / 2) ** 2;

        const y = 2 * Math.atan2(
            Math.sqrt(x),
            Math.sqrt(1 - x)
        );

        return R * y;
    }

   // heuristic(a, b) {
     //   const dx = a.lat - b.lat;
       /// const dy = a.lon - b.lon;

        //return Math.sqrt(dx * dx + dy * dy);
    //}

    aStar(start, end) {
        start = String(start);
        end = String(end);
         let iteration = 0;

        const nodeMap = this.buildNodes();

        const open = [{
            node: start,
            path: [start],
            g: 0,
            f: 0
        }];

        const visited = new Set();

        let explored = 0;

        while (open.length > 0) {

            let bestIndex = 0;

            for (let i = 1; i < open.length; i++) {
                if (open[i].f < open[bestIndex].f) {
                    bestIndex = i;
                }
            }

            const current = open.splice(bestIndex, 1)[0];

            if (visited.has(current.node)) {
                continue;
            }

            visited.add(current.node);
            explored++;

            if (current.node === end) {
                return {
                    path: current.path,
                    totalLength: current.g,
                    explored: explored,
                    iterasi: iteration
                };
            }

            const neighbors = this.#graph[current.node] || [];

            for (let i = 0; i < neighbors.length; i++) {
                iteration++;
                const neighbor = neighbors[i];

                if (visited.has(neighbor.id)) {
                    continue;
                }

                const g = current.g + neighbor.length;

                const h = this.heuristic(
                    nodeMap[neighbor.id],
                    nodeMap[end]
                );

                open.push({
                    node: neighbor.id,
                    path: current.path.concat(neighbor.id),
                    g: g,
                    f: g + h
                });
            }
        }

        return null;
    }
    gbfs(start, end) {
        start = String(start);
        end = String(end);
         let iteration = 0;

        const nodeMap = this.buildNodes();

        const visited = new Set();

        const open = [{
            node: start,
            path: [start],
            totalLength: 0,
            h: this.heuristic(
                nodeMap[start],
                nodeMap[end]
            )
        }];

        let explored = 0;

        while (open.length > 0) {

            let bestIndex = 0;

            for (let i = 1; i < open.length; i++) {
                if (open[i].h < open[bestIndex].h) {
                    bestIndex = i;
                }
            }

            const current = open.splice(bestIndex, 1)[0];

            if (visited.has(current.node)) {
                continue;
            }

            visited.add(current.node);
            explored++;

            if (current.node === end) {
                return {
                    path: current.path,
                    totalLength: current.totalLength,
                    explored: explored,
                    iterasi: iteration
                };
            }

            const neighbors = this.#graph[current.node] || [];

            for (let i = 0; i < neighbors.length; i++) {
                iteration++;
                const neighbor = neighbors[i];

                if (!visited.has(neighbor.id)) {

                    const h = this.heuristic(
                        nodeMap[neighbor.id],
                        nodeMap[end]
                    );

                    open.push({
                        node: neighbor.id,
                        path: current.path.concat(neighbor.id),
                        totalLength:
                            current.totalLength + neighbor.length,
                        h: h
                    });
                }
            }
        }

        return null;
    }
    ucs(start, end) {
        start = String(start);
        end = String(end);
         let iteration = 0;

        const open = [{
            node: start,
            path: [start],
            cost: 0
        }];

        const bestCost = {};
        bestCost[start] = 0;

        let explored = 0;

        while (open.length > 0) {

            let bestIndex = 0;

            for (let i = 1; i < open.length; i++) {
                if (open[i].cost < open[bestIndex].cost) {
                    bestIndex = i;
                }
            }

            const current = open.splice(bestIndex, 1)[0];

            explored++;

            if (current.node === end) {
                return {
                    path: current.path,
                    totalLength: current.cost,
                    explored: explored,
                     iterasi: iteration
                };
            }

            const neighbors = this.#graph[current.node] || [];

            for (let i = 0; i < neighbors.length; i++) {
                iteration++;
                const neighbor = neighbors[i];
                const newCost = current.cost + neighbor.length;

                if (bestCost[neighbor.id] === undefined ||newCost < bestCost[neighbor.id]
) {
                    bestCost[neighbor.id] = newCost;

                    open.push({
                        node: neighbor.id,
                        path: current.path.concat(neighbor.id),
                        cost: newCost
                    });
                }
            }
        }

        return null;
    }
    greedy(start, end) {
        start = String(start);
        end = String(end);

        const visited = new Set();

        let current = start;
        let totalLength = 0;

        const path = [start];

        while (current !== end) {

            visited.add(current);

            const neighbors = this.#graph[current] || [];

            let best = null;

            for (let i = 0; i < neighbors.length; i++) {

                const neighbor = neighbors[i];

                if (visited.has(neighbor.id)) {
                    continue;
                }

                if (
                    best === null ||
                    neighbor.length < best.length
                ) {
                    best = neighbor;
                }
            }

            if (best === null) {
                return null;
            }

            totalLength += best.length;
            current = best.id;

            path.push(current);
        }

        return {
            path: path,
            totalLength: totalLength
        };
    }
    dijkstra(start, end) {
         let iteration = 0;
        start = String(start);
        end = String(end);

        const dist = {};
        const prev = {};
        const visited = new Set();

        const queue = [];

        dist[start] = 0;

        queue.push({
            node: start,
            distance: 0
        });

        let explored = 0;

        while (queue.length > 0) {

            let bestIndex = 0;

            for (let i = 1; i < queue.length; i++) {
                if (queue[i].distance < queue[bestIndex].distance) {
                    bestIndex = i;
                }
            }

            const current = queue.splice(bestIndex, 1)[0];

            if (visited.has(current.node)) {
                continue;
            }

            visited.add(current.node);
            explored++;

            if (current.node === end) {
                break;
            }

            const neighbors = this.#graph[current.node] || [];

            for (let i = 0; i < neighbors.length; i++) {
                iteration++;
                const neighbor = neighbors[i];

                const newDistance =
                    dist[current.node] + neighbor.length;

                if (dist[neighbor.id] === undefined ||newDistance < dist[neighbor.id] ) {
                    dist[neighbor.id] = newDistance;
                    prev[neighbor.id] = current.node;

                    queue.push({
                        node: neighbor.id,
                        distance: newDistance
                    });
                }
            }
        }

        if (dist[end] === undefined) {
            return null;
        }

        const path = [];

        let current = end;

        while (current !== undefined) {
            path.unshift(current);
            current = prev[current];
        }

        return {
            path: path,
            totalLength: dist[end],
            explored: explored,
             iterasi: iteration
        };
    }
}

function compareAlgorithms(graph, start, end) {
    const algorithms = {
        DFS: graph.dfs(start, end),
        BFS: graph.bfs(start, end),
        Greedy: graph.greedy(start, end),
        UCS: graph.ucs(start, end),
        Dijkstra: graph.dijkstra(start, end),
        GBFS: graph.gbfs(start, end),
        "A*": graph.aStar(start, end)
    };

    console.log("===== HASIL PERBANDINGAN ALGORITMA =====");

    for (const name in algorithms) {
        const result = algorithms[name];

        const cyan = "\x1b[36m";
        const yellow = "\x1b[33m";
        const green = "\x1b[32m";
        const magenta = "\x1b[35m";
        const reset = "\x1b[0m";
        const red = '\x1b[31m';

        console.log(`${cyan}${name.padEnd(8)}${reset} | ${yellow}Cost: ${result?.totalLength}${reset} | ${green}Expanded: ${result?.explored}${reset} | ${magenta}Path: ${result?.path?.length}${reset}| ${red}Iterasi: ${result?.iterasi}${reset}`);

    }
}

module.exports = {
    Graph,
    compareAlgorithms
};
