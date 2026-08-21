import json
import os
from deep_translator import GoogleTranslator

base_dir = r"c:\Users\LENOVO\OneDrive\Desktop\janmastami\src\i18n\translations"
en_file = os.path.join(base_dir, "en.json")

targets = {
    'hi.json': 'hi',
    'te.json': 'te',
    'ta.json': 'ta',
    'ml.json': 'ml'
}

with open(en_file, 'r', encoding='utf-8') as f:
    en_data = json.load(f)

# Extract all string values
strings_to_translate = []
paths = []

def extract_strings(d, current_path=[]):
    for k, v in d.items():
        if isinstance(v, dict):
            extract_strings(v, current_path + [k])
        elif isinstance(v, str):
            strings_to_translate.append(v)
            paths.append(current_path + [k])

extract_strings(en_data)

def set_nested(d, path, value):
    for k in path[:-1]:
        d = d[k]
    d[path[-1]] = value

def chunk_list(lst, max_chars=4000):
    chunks = []
    current_chunk = []
    current_length = 0
    for s in lst:
        if current_length + len(s) + 5 > max_chars and current_chunk:
            chunks.append(current_chunk)
            current_chunk = []
            current_length = 0
        current_chunk.append(s)
        current_length += len(s) + 5
    if current_chunk:
        chunks.append(current_chunk)
    return chunks

for filename, lang_code in targets.items():
    print(f"Translating to {filename} ({lang_code})...")
    translator = GoogleTranslator(source='en', target=lang_code)
    
    chunks = chunk_list(strings_to_translate)
    translated_strings = []
    
    for idx, chunk in enumerate(chunks):
        print(f"  Translating chunk {idx+1}/{len(chunks)}...")
        combined = " ||| ".join(chunk)
        try:
            res = translator.translate(combined)
            res_parts = [p.strip() for p in res.split("|||")]
            if len(res_parts) == len(chunk):
                translated_strings.extend(res_parts)
            else:
                print(f"  Warning: Chunk size mismatch! Expected {len(chunk)}, got {len(res_parts)}")
                # Fallback to 1 by 1 for this chunk if mismatch
                for s in chunk:
                    try:
                        translated_strings.append(translator.translate(s) or s)
                    except Exception:
                        translated_strings.append(s)
        except Exception as e:
            print(f"  Error on chunk: {e}")
            for s in chunk:
                try:
                    translated_strings.append(translator.translate(s) or s)
                except Exception:
                    translated_strings.append(s)
                
    # Map back
    out_data = json.loads(json.dumps(en_data)) # deep copy structure
    for i, p in enumerate(paths):
        set_nested(out_data, p, translated_strings[i])
        
    # Apply specific overrides
    if lang_code == 'hi':
        out_data['nav']['members'] = 'सदस्य'
        out_data['nav']['memories'] = 'यादें'
        out_data['hero']['mainTitle'] = 'अनंत्या'
    elif lang_code == 'te':
        out_data['nav']['members'] = 'సభ్యులు'
        out_data['nav']['memories'] = 'జ్ఞాపకాలు'
        out_data['hero']['mainTitle'] = 'అనంత్య'
    elif lang_code == 'ta':
        out_data['nav']['members'] = 'உறுப்பினர்கள்'
        out_data['nav']['memories'] = 'நினைவுகள்'
        out_data['hero']['mainTitle'] = 'அனந்தியா'
    elif lang_code == 'ml':
        out_data['nav']['members'] = 'അംഗങ്ങൾ'
        out_data['nav']['memories'] = 'ഓർമ്മകൾ'
        out_data['hero']['mainTitle'] = 'അനന്ത്യ'
        
    out_path = os.path.join(base_dir, filename)
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(out_data, f, ensure_ascii=False, indent=2)
    
    print(f"Successfully generated {filename}")
