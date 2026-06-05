const http = require('http');
const { Graph, compareAlgorithms } = require('./graph');
const graph = new Graph('edges', 'nodes');


const server = http.createServer((req, res) => {

    const reqUrl = new URL(req.url,`http://${req.headers.host}`);

    const path = reqUrl.pathname;

    if (req.method === 'POST' &&path.startsWith('/api/algorithm/')) {

        const algo =path.replace('/api/algorithm/', '');

        let body = '';

        req.on('data', chunk => {
            body += chunk;
        });

        req.on('end', () => {

            try {

                const data = JSON.parse(body);

                const start = data.start;
                const end = data.end;

                if (!start || !end) {

                    res.writeHead(400, {
                        'Content-Type': 'application/json'
                    });

                    return res.end(JSON.stringify({
                        success: false,
                        message:
                            'invalid data struct!'
                    }));
                }

                let result;

                switch (algo) {

                    case 'dfs':
                        result = graph.dfs(start, end);
                        break;

                    case 'bfs':
                        result = graph.bfs(start, end);
                        break;

                    case 'ucs':
                        result = graph.ucs(start, end);
                        break;

                    case 'dijkstra':
                        result =
                            graph.dijkstra(start, end);
                        break;

                    case 'gbfs':
                        result =
                            graph.gbfs(start, end);
                        break;

                    case 'astar':
                        result =
                            graph.aStar(start, end);
                        break;

                    default:
                        res.writeHead(404);
                        return res.end(
                            JSON.stringify({
                                message:'Invalid algorithm'
                            })
                        );
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });

                res.end(JSON.stringify(result));

            } catch (err) {

                res.writeHead(400, {
                    'Content-Type':
                        'application/json'
                });

                res.end(JSON.stringify({
                    success: false,
                    message: 'Invalid JSON'
                }));
            }
        });

        return;
    }

    res.writeHead(404);
    res.end('Not Found');
});


const port = 1337;


server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}/`);
});
