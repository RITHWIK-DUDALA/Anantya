import json
import os

translations_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'src', 'i18n', 'translations')
for filename in os.listdir(translations_dir):
    if filename.endswith('.json'):
        filepath = os.path.join(translations_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        if 'games' not in data:
            data['games'] = {}
        
        if '34' not in data['games']:
            data['games']['34'] = {}
        data['games']['34']['title'] = data['games']['34'].get('title', "Hindi Movie Screening")
        data['games']['34']['description'] = data['games']['34'].get('description', "Join us for a spectacular Hindi movie screening. Title to be announced soon!")

        if '35' not in data['games']:
            data['games']['35'] = {}
        data['games']['35']['title'] = data['games']['35'].get('title', "English Movie Screening")
        data['games']['35']['description'] = data['games']['35'].get('description', "Join us for a spectacular English movie screening. Title to be announced soon!")
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
