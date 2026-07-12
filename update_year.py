import os
import glob

# Files to scan
paths = [
    'src/**/*.js',
    'src/**/*.jsx',
    'src/**/*.json',
    'src/**/*.css',
    'index.html'
]

cwd = r"c:\Users\LENOVO\OneDrive\Desktop\janmastami"

def replace_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if '2025' in content:
        new_content = content.replace('2025', '2026')
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated: {filepath}")

for p in paths:
    for filepath in glob.glob(os.path.join(cwd, p), recursive=True):
        if os.path.isfile(filepath):
            replace_in_file(filepath)
