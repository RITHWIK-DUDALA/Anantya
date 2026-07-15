import os
import glob
import re

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
        # Only replace 2025 in date-like contexts:
        # - After month names/abbreviations (Aug 2025, August 2025)
        # - Date formats with separators (29-2025, 2025-08, 2025/)
        # - After copyright symbol (© 2025)
        # - Standalone year references like "year 2025" or "2025 —"
        new_content = re.sub(
            r'(?:'
            r'(?<=(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s)2025'  # Month 2025
            r'|(?<=©\s)2025'       # © 2025
            r'|(?<=[-/])2025'      # -2025 or /2025
            r'|2025(?=[-/])'       # 2025- or 2025/
            r'|(?<=•\s)2025'       # • 2025
            r')',
            '2026', content
        )
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated: {filepath}")

for p in paths:
    for filepath in glob.glob(os.path.join(cwd, p), recursive=True):
        if os.path.isfile(filepath):
            replace_in_file(filepath)
