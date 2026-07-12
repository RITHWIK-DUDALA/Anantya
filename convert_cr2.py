import os
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
            print(f"Saved {jpg_filename}")
            os.remove(cr2_path)
            print(f"Deleted original {filename}")
        except Exception as e:
            print(f"Error converting {filename}: {e}")
