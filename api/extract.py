import json
import sys

transcript_path = '/Users/svstech/.gemini/antigravity/brain/55dfc6e2-15af-4dc2-954b-e57812d365aa/.system_generated/logs/transcript_full.jsonl'

with open(transcript_path, 'r') as f:
    for line in f:
        try:
            data = json.loads(line)
            if 'LC-2200' in str(data):
                # Found the message
                # It might be in data['content'] or somewhere else.
                content = str(data)
                parts = content.split('Property_ID,Address')
                if len(parts) > 1:
                    csv_data = 'Property_ID,Address' + parts[1].split('</USER_REQUEST>')[0]
                    # Also strip any trailing JSON artifact 
                    csv_data = csv_data.split('"}')[0]
                    # Clean up escaped newlines
                    csv_data = csv_data.replace('\\n', '\n')
                    with open('homes.csv', 'w') as out:
                        out.write(csv_data)
                    print(f"Success! Lines: {len(csv_data.splitlines())}")
                    sys.exit(0)
        except Exception as e:
            pass
print("Not found")
