import json
import glob
import os

translations = {
    'en.json': {
        'members': 'Members',
        'memories': 'Memories',
        'anantya': 'anantya'
    },
    'hi.json': {
        'members': 'सदस्य',
        'memories': 'यादें',
        'anantya': 'अनंत्या'
    },
    'te.json': {
        'members': 'సభ్యులు',
        'memories': 'జ్ఞాపకాలు',
        'anantya': 'అనంత్య'
    },
    'ta.json': {
        'members': 'உறுப்பினர்கள்',
        'memories': 'நினைவுகள்',
        'anantya': 'அனந்தியா'
    },
    'ml.json': {
        'members': 'അംഗങ്ങൾ',
        'memories': 'ഓർമ്മകൾ',
        'anantya': 'അനന്ത്യ'
    }
}

files = glob.glob(r'c:\Users\LENOVO\OneDrive\Desktop\janmastami\src\i18n\translations\*.json')

for f in files:
    filename = os.path.basename(f)
    if filename in translations:
        with open(f, 'r', encoding='utf-8') as file:
            data = json.load(file)
            
        # Update nav
        if 'nav' not in data:
            data['nav'] = {}
        data['nav']['members'] = translations[filename]['members']
        data['nav']['memories'] = translations[filename]['memories']
        
        # Update hero main title
        if 'hero' in data:
            data['hero']['mainTitle'] = translations[filename]['anantya']
            
        with open(f, 'w', encoding='utf-8') as file:
            json.dump(data, file, indent=2, ensure_ascii=False)
        print(f"Updated {filename}")
