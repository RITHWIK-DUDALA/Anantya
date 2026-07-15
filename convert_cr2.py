import os
import shutil
import rawpy
import imageio

directory = r"C:\Users\LENOVO\OneDrive\Desktop\janmastami\public\assets"

for filename in os.listdir(directory):
    if filename.lower().endswith(".cr2"):
        cr2_path = os.path.join(directory, filename)
        jpg_filename = filename[:-4] + ".jpg"
        jpg_path = os.path.join(directory, jpg_filename)
        
        try:
            print(f"Converting {filename}...")
            with rawpy.imread(cr2_path) as raw:
                # half_size=True for speed and smaller web-friendly resolution
                rgb = raw.postprocess(half_size=True, use_camera_wb=True)
            imageio.imsave(jpg_path, rgb)
            if not os.path.isfile(jpg_path) or os.path.getsize(jpg_path) == 0:
                print(f"Skipping backup of {filename}: output JPEG is missing or empty")
                continue
            backup_dir = os.path.join(directory, "raw_backup")
            os.makedirs(backup_dir, exist_ok=True)
            shutil.move(cr2_path, os.path.join(backup_dir, filename))
            print(f"Moved original {filename} to raw_backup/")
        except Exception as e:
            print(f"Error converting {filename}: {e}")
