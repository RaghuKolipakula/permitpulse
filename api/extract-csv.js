import fs from 'fs';
import readline from 'readline';

async function extract() {
  const fileStream = fs.createReadStream('/Users/svstech/.gemini/antigravity/brain/55dfc6e2-15af-4dc2-954b-e57812d365aa/.system_generated/logs/transcript_full.jsonl');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lastCsv = '';
  let found = false;
  for await (const line of rl) {
    const obj = JSON.parse(line);
    if (obj.type === 'USER_INPUT' && obj.content && obj.content.includes('LC-2200')) {
      const parts = obj.content.split('Property_ID,Address');
      if (parts.length > 1) {
        let csv = 'Property_ID,Address' + parts[1];
        csv = csv.split('</USER_REQUEST>')[0].trim();
        lastCsv = csv;
        found = true;
      }
    }
  }
  if (found) {
     fs.writeFileSync('homes.csv', lastCsv);
     console.log(`Extracted CSV with ${lastCsv.split('\n').length} lines`);
  } else {
     console.log('Not found');
  }
}
extract();
