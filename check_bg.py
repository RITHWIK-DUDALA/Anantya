from PIL import Image

img = Image.open(r"c:\Users\LENOVO\OneDrive\Desktop\janmastami\public\assets\logo.jpeg")
print("Top-left:", img.getpixel((0,0)))
print("Top-right:", img.getpixel((img.width-1, 0)))
print("Bottom-left:", img.getpixel((0, img.height-1)))
print("Bottom-right:", img.getpixel((img.width-1, img.height-1)))
