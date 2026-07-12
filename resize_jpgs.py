import os
from PIL import Image

directory = r"C:\Users\LENOVO\OneDrive\Desktop\janmastami\public\assets"

files = [
    "amrita ragam bajana session.jpg",
    "band 2.jpg",
    "band main image.jpg",
    "cultural main.jpg",
    "girls uradi 1.JPG",
    "uradi b1.JPG",
    "uradigirls2.JPG"
]

for f in files:
    path = os.path.join(directory, f)
    if os.path.exists(path):
        try:
            print(f"Resizing {f}...")
            with Image.open(path) as img:
                img.thumbnail((1280, 1280), Image.Resampling.LANCZOS)
                img.save(path, quality=80)
            print(f"Saved {f}")
        except Exception as e:
            print(f"Error resizing {f}: {e}")
