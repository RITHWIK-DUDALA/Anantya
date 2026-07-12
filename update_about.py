import os
import re

directory = r"C:\Users\LENOVO\OneDrive\Desktop\janmastami\public\assets"
about_file = r"C:\Users\LENOVO\OneDrive\Desktop\janmastami\src\components\About.jsx"

files = [f"/assets/{f}" for f in os.listdir(directory) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
files = sorted(files)

# Exclude hero or k22 if they aren't meant to be here
excluded = ['k22.jpg', 'krishna.jpg', 'krishna2.jpg', 'little_krishna.jpg', 'hro1p.jpg']
files = [f for f in files if not any(ex in f for ex in excluded)]

# Group files into chunks of 4-5 images
chunk_size = 5
chunks = [files[i:i + chunk_size] for i in range(0, len(files), chunk_size)]

# We will just append the new chunks to scatterData
new_sections = []
for i, chunk in enumerate(chunks):
    images_str = ",\n      ".join([f'"{img}"' for img in chunk])
    new_sections.append(f"""  {{
    heading: "Janmashtami Vibes {i+1}",
    images: [
      {images_str}
    ],
  }}""")

new_scatter_str = ",\n".join(new_sections)

with open(about_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the scatterData array
# We will append the new items to the existing array

match = re.search(r'(const scatterData = \[.*?)(];)', content, re.DOTALL)
if match:
    existing = match.group(1).rstrip()
    if existing.endswith(','):
        existing = existing[:-1]
    
    new_content = existing + ",\n" + new_scatter_str + "\n];"
    
    final_content = content[:match.start()] + new_content + content[match.end():]
    
    with open(about_file, 'w', encoding='utf-8') as f:
        f.write(final_content)
    print("Successfully updated About.jsx")
else:
    print("Could not find scatterData array")
