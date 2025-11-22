const https = require('https');

const url = 'https://raw.githubusercontent.com/bacinger/f1-circuits/master/f1-circuits.geojson';

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            console.log("--- Track Names in GeoJSON ---");
            json.features.forEach(f => {
                console.log(f.properties.Name || f.properties.name);
            });
            console.log("------------------------------");
        } catch (e) {
            console.error("Error parsing JSON:", e.message);
        }
    });
}).on('error', (err) => {
    console.error("Error fetching URL:", err.message);
});
