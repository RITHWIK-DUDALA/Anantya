import os
import re

directory = r"C:\Users\LENOVO\OneDrive\Desktop\janmastami\public\assets"
memories_file = r"C:\Users\LENOVO\OneDrive\Desktop\janmastami\src\pages\MemoriesPage.jsx"

files = [f for f in os.listdir(directory) if f.lower().endswith(('.jpg', '.jpeg'))]

# Exclude hero or k22 if they aren't meant to be here, but let's just include all for now except those that might be for home page.
# Actually, I'll exclude krishna.jpg, krishna2.jpg, little_krishna.jpg, k22.jpg, hro1p.jpg unless they want it.
# Let's include everything just to be safe, except the ones that were there before (the user uploaded everything now).

output = []
id_counter = 10
for f in sorted(files):
    # skip some obviously not-memory files if we want, but let's just add all the new ones
    if f in ['k22.jpg', 'krishna.jpg', 'krishna2.jpg', 'little_krishna.jpg', 'hro1p.jpg']:
        continue
    
    if f.startswith('memo'):
        title = 'Janmashtami Memory'
    else:
        title = f.rsplit('.', 1)[0].replace('-', ' ').replace('_', ' ').title()
    
    output.append(f"""  {{
    id: {id_counter},
    type: 'photo',
    src: '/assets/{f}',
    title: '{title}',
    description: ''
  }}""")
    id_counter += 1

new_array_str = ",\n".join(output)

with open(memories_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the memoriesData array
# We will just append the new items to the existing array

# Find the end of the memoriesData array
match = re.search(r'(const memoriesData = \[.*?)(];)', content, re.DOTALL)
if match:
    existing = match.group(1).rstrip()
    if existing.endswith(','):
        existing = existing[:-1]
    
    new_content = existing + ",\n" + new_array_str + "\n];"
    
    final_content = content[:match.start()] + new_content + content[match.end():]
    
    with open(memories_file, 'w', encoding='utf-8') as f:
        f.write(final_content)
    print("Successfully updated MemoriesPage.jsx")
else:
    print("Could not find memoriesData array")
