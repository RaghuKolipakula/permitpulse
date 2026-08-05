import { execSync } from 'child_process';

async function seed() {
  console.log("Fetching parcels in 75035 from CCAD...");
  const arcGisUrl = new URL('https://services2.arcgis.com/uXyoacYrZTPTKD3R/arcgis/rest/services/CCAD_Parcel_Feature_Set/FeatureServer/4/query');
  arcGisUrl.searchParams.append('where', `situsZip = '75035'`);
  arcGisUrl.searchParams.append('outFields', 'situsConcat,legalAbsSubName');
  arcGisUrl.searchParams.append('f', 'json');
  arcGisUrl.searchParams.append('resultRecordCount', '15');

  const res = await fetch(arcGisUrl.toString());
  const data = await res.json();
  
  if (!data.features) {
    console.error("No features found!");
    return;
  }

  const statuses = ['Approved', 'Pending Review', 'Needs Revision'];
  const insertValues = [];

  data.features.forEach((feature, idx) => {
    const address = feature.attributes.situsConcat || 'Unknown Address';
    const hoa = feature.attributes.legalAbsSubName || 'Unknown HOA';
    const status = statuses[idx % statuses.length];
    const days = Math.floor(Math.random() * 20) + 1;
    const id = `PMT-2024-${100 + idx}`;
    
    // SQLite string escaping
    const safeAddress = address.replace(/'/g, "''");
    const safeHoa = hoa.replace(/'/g, "''");
    
    insertValues.push(`('${id}', '${safeAddress}', '${status}', '${safeHoa}', ${days})`);
  });

  if (insertValues.length > 0) {
    const sql = `INSERT INTO permits (id, address, status, hoa, days) VALUES ${insertValues.join(', ')};`;
    console.log("Executing SQL...");
    // Write SQL to a temp file
    require('fs').writeFileSync('seed_data.sql', sql);
    
    // Execute wrangler
    execSync('npx wrangler d1 execute permitpulse-db --remote --file=seed_data.sql', { stdio: 'inherit' });
    console.log("Seed complete!");
  }
}

seed().catch(console.error);
