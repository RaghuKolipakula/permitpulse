import fs from 'fs';

const csv = fs.readFileSync('homes.csv', 'utf8');
const lines = csv.split('\n').filter(line => line.trim() !== '');

// Remove header
lines.shift();

let sql = '';
for (const line of lines) {
    const parts = line.split(',');
    if (parts.length >= 12) {
        const id = parts[0].replace(/'/g, "''");
        const address = parts[1].replace(/'/g, "''");
        const city = parts[2].replace(/'/g, "''");
        const state = parts[3].replace(/'/g, "''");
        const zip = parts[4].replace(/'/g, "''");
        const community = parts[5].replace(/'/g, "''");
        const beds = parts[6] || 0;
        const baths = parts[7] || 0;
        const sqft = parts[8] || 0;
        const lot = parts[9] || 0;
        const year = parts[10] || 0;
        const val = parts[11] || 0;

        sql += `INSERT OR REPLACE INTO properties (id, address, city, state, zip_code, community, bedrooms, bathrooms, square_feet, lot_size_acres, year_built, estimated_value) VALUES ('${id}', '${address}', '${city}', '${state}', '${zip}', '${community}', ${beds}, ${baths}, ${sqft}, ${lot}, ${year}, ${val});\n`;
    }
}

fs.writeFileSync('seed_data.sql', sql);
console.log('Generated seed_data.sql');
