import json
import glob

# Update gamesData.js
games_file = r'c:\Users\LENOVO\OneDrive\Desktop\janmastami\src\data\gamesData.js'
with open(games_file, 'r', encoding='utf-8') as f:
    content = f.read()

old_game = "  { id: 6, title: 'Skit / Drama', description: 'Perform short, engaging skits on Lord Krishna\\'s epic life stories.', image: '/games/skit.jpg', src: '/games/skit.jpg', venueOrganizer: 'TBD', gamesHead: 'TBD', venue: 'Main Stage', time: '04:30 PM', price: 0 },"
new_game = "  { id: 6, title: 'Tambola', description: 'Join the fun with a thrilling game of Tambola! Test your luck and win exciting prizes.', image: 'https://images.unsplash.com/photo-1533227268428-f9ed0900f953?auto=format&fit=crop&q=80&w=400', src: 'https://images.unsplash.com/photo-1533227268428-f9ed0900f953?auto=format&fit=crop&q=80&w=400', venueOrganizer: 'TBD', gamesHead: 'TBD', venue: 'Main Stage', time: '04:30 PM', price: 50 },"

new_content = content.replace(old_game, new_game)
with open(games_file, 'w', encoding='utf-8') as f:
    f.write(new_content)

# Update translation files
langs = glob.glob(r'c:\Users\LENOVO\OneDrive\Desktop\janmastami\src\i18n\translations\*.json')

for lang_file in langs:
    with open(lang_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    if 'games' in data and '6' in data['games']:
        data['games']['6'] = {
            "title": "Tambola",
            "description": "Join the fun with a thrilling game of Tambola! Test your luck and win exciting prizes."
        }
        
        with open(lang_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            
    print(f"Updated {lang_file}")
