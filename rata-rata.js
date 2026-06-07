const algorithms = [
  //  "dfs",
    "bfs",
    "ucs",
    "dijkstra",
    "gbfs",
    "astar"
];

const TEST_COUNT = 1000;

const BODY = {
    start: "4880280926",
    end: "3524584362"
};

async function benchmark(algo) {

    let total = 0;

    for (let i = 0; i < TEST_COUNT; i++) {

        const startTime = performance.now();

        const response = await fetch(
            `http://localhost:1337/api/algorithm/${algo}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(BODY)
            }
        );

        await response.json();

        const elapsed =
            performance.now() - startTime;

        total += elapsed;
    }

    return total / TEST_COUNT;
}

async function main() {

    console.log("===== RATA-RATA RESPONSE TIME =====");

    for (const algo of algorithms) {
        const avg = await benchmark(algo);

        console.log(`${algo.padEnd(9)} : ${avg.toFixed(3)} ms`
        );
    }
}

main();
