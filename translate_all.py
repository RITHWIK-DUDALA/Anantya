import json
import os
from deep_translator import GoogleTranslator

# Path to translations
base_dir = r"c:\Users\LENOVO\OneDrive\Desktop\janmastami\src\i18n\translations"
en_file = os.path.join(base_dir, "en.json")

# Target languages
targets = {
    'hi.json': 'hi',
    'te.json': 'te',
    'ta.json': 'ta',
    'ml.json': 'ml'
}

def translate_dict(d, translator):
    translated = {}
    for k, v in d.items():
        if isinstance(v, dict):
            translated[k] = translate_dict(v, translator)
        elif isinstance(v, str):
            # Try to avoid translating placeholders if there were any, but there aren't many in this file
            try:
                translated[k] = translator.translate(v)
            except Exception as e:
                print(f"Error translating '{v}': {e}")
                translated[k] = v
        else:
            translated[k] = v
    return translated

with open(en_file, 'r', encoding='utf-8') as f:
    en_data = json.load(f)

for filename, lang_code in targets.items():
    print(f"Translating to {filename} ({lang_code})...")
    translator = GoogleTranslator(source='en', target=lang_code)
    
    # Check if there are some hardcoded preferred translations we don't want to lose
    # We can fetch the current file to keep them if needed, or just overwrite completely.
    # The user asked to "TRANSLATE CORRECTLY", suggesting full overwrite is fine.
    
    translated_data = translate_dict(en_data, translator)
    
    # Specific overrides (as seen in add_translations.py)
    if lang_code == 'hi':
        translated_data['nav']['members'] = 'सदस्य'
        translated_data['nav']['memories'] = 'यादें'
        translated_data['hero']['mainTitle'] = 'अनंत्या'
    elif lang_code == 'te':
        translated_data['nav']['members'] = 'సభ్యులు'
        translated_data['nav']['memories'] = 'జ్ఞాపకాలు'
        translated_data['hero']['mainTitle'] = 'అనంత్య'
    elif lang_code == 'ta':
        translated_data['nav']['members'] = 'உறுப்பினர்கள்'
        translated_data['nav']['memories'] = 'நினைவுகள்'
        translated_data['hero']['mainTitle'] = 'அனந்தியா'
    elif lang_code == 'ml':
        translated_data['nav']['members'] = 'അംഗങ്ങൾ'
        translated_data['nav']['memories'] = 'ഓർമ്മകൾ'
        translated_data['hero']['mainTitle'] = 'അനന്ത്യ'
        
    out_path = os.path.join(base_dir, filename)
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(translated_data, f, ensure_ascii=False, indent=2)
    
    print(f"Successfully generated {filename}")
