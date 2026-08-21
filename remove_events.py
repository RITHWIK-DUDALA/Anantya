import json
import os

base_dir = r"c:\Users\LENOVO\OneDrive\Desktop\janmastami\src\i18n\translations"
files = ['en.json', 'hi.json', 'te.json', 'ta.json', 'ml.json']
ids_to_remove = ["6", "12", "13", "14", "15", "16"]

for filename in files:
    path = os.path.join(base_dir, filename)
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        events = data.get('timeline', {}).get('events', {})
        for event_id in ids_to_remove:
            if event_id in events:
                del events[event_id]
                
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"Updated {filename}")
