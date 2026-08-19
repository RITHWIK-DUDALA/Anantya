from PIL import Image

def remove_black_background(input_path, output_path, threshold=20):
    img = Image.open(input_path).convert("RGBA")
    data = img.getdata()
    
    new_data = []
    for item in data:
        # Check if the pixel is dark (r, g, b all below threshold)
        if item[0] < threshold and item[1] < threshold and item[2] < threshold:
            # Change to transparent
            new_data.append((0, 0, 0, 0))
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    img.save(output_path, "PNG")
    print("Saved to", output_path)

remove_black_background(
    r"c:\Users\LENOVO\OneDrive\Desktop\janmastami\public\assets\logo.jpeg",
    r"c:\Users\LENOVO\OneDrive\Desktop\janmastami\public\assets\logo_nobg.png",
    threshold=25
)
