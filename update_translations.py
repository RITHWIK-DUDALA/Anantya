import json
import glob
import os

langs = glob.glob(r'c:\Users\LENOVO\OneDrive\Desktop\janmastami\src\i18n\translations\*.json')

for lang_file in langs:
    if not lang_file.endswith('en.json'):
        continue
    with open(lang_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    if 'games' in data:
        data['games']['20'] = {
            "title": "Cold Case",
            "description": "Put on your detective hat and solve the ultimate mysterious cold case!"
        }
        
        with open(lang_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            
    print(f"Updated {lang_file}")
