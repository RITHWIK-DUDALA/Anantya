import json
import os
from deep_translator import GoogleTranslator

base_dir = r"c:\Users\LENOVO\OneDrive\Desktop\janmastami\src\i18n\translations"

new_events_en = {
  "1": {
    "name": "Ganesh Pooja",
    "time": "31 Aug • 4:00 PM – 4:30 PM",
    "description": "Inaugural Pooja Arrangements at Amrita Darshanam. Coordinator: Nagasai Sree"
  },
  "2": {
    "name": "Garba Dance",
    "time": "31 Aug • 4:30 PM – 5:00 PM",
    "description": "Garba Arrangements & Coordination at Amrita Darshanam. Coordinator: Srinithi V R"
  },
  "3": {
    "name": "Amrita Ragam Jamming Session",
    "time": "31 Aug • 5:10 PM – 5:40 PM",
    "description": "Music Session at Amrita Darshanam. Coordinator: Nagasai Sree"
  },
  "4": {
    "name": "Skit",
    "time": "31 Aug • 6:00 PM – 7:00 PM",
    "description": "Skit Performance at Auditorium. Coordinator: Srinithi V R"
  },
  "5": {
    "name": "Lantern Show",
    "time": "31 Aug • 8:00 PM – 8:45 PM",
    "description": "Lantern Show Arrangements at Amrita Darshanam. Coordinator: Jyothsana"
  },
  "6": {
    "name": "Finance & Accounts",
    "time": "Ongoing",
    "description": "Budget, Payments & Accounts. Coordinator: Bhaanu Teja"
  },
  "7": {
    "name": "Sri Krishna Pooja",
    "time": "01 Sep • 8:00 AM – 9:15 AM",
    "description": "Main Pooja Arrangements Near Statue. Coordinators: Nagasai Sree, Srinithi V R"
  },
  "8": {
    "name": "Sri Krishna Rathayatra",
    "time": "01 Sep • 9:15 AM – 11:00 AM",
    "description": "Vehicle & Grand Procession with Kolatam and Traditional Band from Ground to Campus. Coordinators: Punith Vuppala, Surya K K"
  },
  "9": {
    "name": "Culturals",
    "time": "01 Sep • 11:00 AM – 12:00 PM",
    "description": "Cultural Program Arrangements at Auditorium / Stage. Coordinators: Nagasai Sree, Srinithi V R"
  },
  "10": {
    "name": "Games",
    "time": "01 Sep • 3:30 PM – 6:00 PM",
    "description": "All Indoor Games, Uriyadi & Tug of War at Ground. Coordinator: Rithwik Satya D"
  },
  "11": {
    "name": "Evening Culturals & Vrindavan Beats",
    "time": "01 Sep • 6:00 PM – 8:45 PM",
    "description": "Cultural Programs at Auditorium / Stage. Coordinators: Nagasai Sree, Srinithi V R"
  },
  "12": {
    "name": "Decoration & Organising",
    "time": "31 Aug - 01 Sep",
    "description": "Venue Decoration & Event Organisation at Amrita Darshanam. Coordinators: Jyothsana, Bhargava Sai"
  },
  "13": {
    "name": "Discipline",
    "time": "31 Aug - 01 Sep",
    "description": "Volunteers & Crowd Management for Overall Event. Coordinator: Rithwik Satya D"
  },
  "14": {
    "name": "Technical & Infrastructure",
    "time": "31 Aug - 01 Sep",
    "description": "Speaker/Mic Setup & Technical Requirements at Radham / Ground. Coordinator: Surya K K"
  },
  "15": {
    "name": "Student Stalls",
    "time": "31 Aug - 01 Sep (During event times)",
    "description": "Stall Set-up, Benches and Chairs Near Ground. Coordinator: Punith Vuppala"
  },
  "16": {
    "name": "Visual Media",
    "time": "01 Sep",
    "description": "Photography / Videography Coverage for Overall Event. Coordinator: Srayash, Trinetra Multimedia"
  }
}

targets = {
    'hi.json': 'hi',
    'te.json': 'te',
    'ta.json': 'ta',
    'ml.json': 'ml'
}

# Update en.json
en_path = os.path.join(base_dir, "en.json")
with open(en_path, 'r', encoding='utf-8') as f:
    en_data = json.load(f)
en_data['timeline']['events'] = new_events_en
with open(en_path, 'w', encoding='utf-8') as f:
    json.dump(en_data, f, ensure_ascii=False, indent=2)
print("Updated en.json")

# Translate to other languages
for filename, lang_code in targets.items():
    print(f"Translating to {filename} ({lang_code})...")
    translator = GoogleTranslator(source='en', target=lang_code)
    
    translated_events = {}
    for key, event in new_events_en.items():
        translated_events[key] = {}
        for k, v in event.items():
            if k == 'time' and ('PM' in v or 'AM' in v): # Mostly keep time as is for english numbers/format, but translate if possible
                try:
                    translated_events[key][k] = translator.translate(v) or v
                except:
                    translated_events[key][k] = v
            else:
                try:
                    translated_events[key][k] = translator.translate(v) or v
                except:
                    translated_events[key][k] = v
    
    out_path = os.path.join(base_dir, filename)
    with open(out_path, 'r', encoding='utf-8') as f:
        lang_data = json.load(f)
    lang_data['timeline']['events'] = translated_events
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(lang_data, f, ensure_ascii=False, indent=2)
    print(f"Updated {filename}")

print("All done!")
