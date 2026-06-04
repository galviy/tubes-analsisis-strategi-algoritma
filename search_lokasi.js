const fs = require('fs');
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
 
function main() {
    rl.question('Input daerah pencarian: ', (p) => {
        p = p.toLowerCase();
        console.log(`Daerah yang dicari -> ${p}`);
        console.log();
        searchDaerah(p);
        rl.close();
    });
}
 
function searchDaerah(cari) {
    const edgesRaw = fs.readFileSync('./edges.json', 'utf8');
    const edges = JSON.parse(edgesRaw);
    const nodesRaw = fs.readFileSync('./nodes.json', 'utf8');
    const nodes = JSON.parse(nodesRaw);
 
    for (let i = 0; i < edges.features.length; i++) {
        const prop = edges.features[i].properties;
        if (!prop.name) continue;
 
        let names;
        if (Array.isArray(prop.name)) {
            // name = ['Jalan Gondang Raya', 'Jalan Lain']
            names = prop.name;
        } else {
            // name = 'Jalan Gondang Raya'
            names = [prop.name];
        }
 
        for (let j = 0; j < names.length; j++) {
            if (!names[j]) continue;
            const namaJalan = names[j].toLowerCase();
 
            if (namaJalan.includes(cari)) {
                const coordU = cariKoordinate(prop.u, nodes);
                const coordV = cariKoordinate(prop.v, nodes);
 
                console.log(`Nama Jalan : ${names[j]}`);
                console.log(`Node       : ${prop.u}, https://maps.google.com/?q=${coordU.lat},${coordU.lon}`);
                console.log(`Node       : ${prop.v}, https://maps.google.com/?q=${coordV.lat},${coordV.lon}`);
                console.log(`Length     : ${prop.length} meter`);
                console.log('------------------------------');
                break;
            }
        }
    }
}
 
function cariKoordinate(id, nodes) {
    for (let i = 0; i < nodes.features.length; i++) {
        if (nodes.features[i].properties.osmid == id) {
            return {
                lat: nodes.features[i].properties.y,
                lon: nodes.features[i].properties.x
            };
        }
    }
    console.log("Node tidak ditemukan");
    return { lat: null lon: null };
}
 
main();
