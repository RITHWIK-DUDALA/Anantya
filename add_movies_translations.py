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
        
        if '31' not in data['games']:
            data['games']['31'] = {}
        data['games']['31']['title'] = data['games']['31'].get('title', "Telugu Movie Screening")
        data['games']['31']['description'] = data['games']['31'].get('description', "Join us for a spectacular Telugu movie screening. Title to be announced soon!")

        if '32' not in data['games']:
            data['games']['32'] = {}
        data['games']['32']['title'] = data['games']['32'].get('title', "Malayalam Movie Screening")
        data['games']['32']['description'] = data['games']['32'].get('description', "Join us for a spectacular Malayalam movie screening. Title to be announced soon!")

        if '33' not in data['games']:
            data['games']['33'] = {}
        data['games']['33']['title'] = data['games']['33'].get('title', "Tamil Movie Screening")
        data['games']['33']['description'] = data['games']['33'].get('description', "Join us for a spectacular Tamil movie screening. Title to be announced soon!")
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
