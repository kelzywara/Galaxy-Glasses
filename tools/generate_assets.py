import os
from PIL import Image, ImageDraw, ImageFont

# Resolve path to /img directory at project root
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG_DIR = os.path.join(BASE_DIR, 'img')
os.makedirs(IMG_DIR, exist_ok=True)

# Helper function to create clean editorial optical illustrations for frame placeholders
def create_frame_placeholder(filename, title, shape="round", subtitle="Optik Galaxy Depok"):
    out_path = os.path.join(IMG_DIR, filename)
    
    # SAFETY CHECK: Never overwrite or touch logo.png under any circumstances
    if "logo" in filename.lower():
        print(f"Skipped {filename} (protected file)")
        return

    w, h = 600, 600
    img = Image.new("RGB", (w, h), (247, 246, 242)) # subtle warm off-white studio
    d = ImageDraw.Draw(img)
    
    # 1px border around card
    d.rectangle([0, 0, w-1, h-1], outline=(230, 229, 224), width=1)
    
    # Studio pedestal shadow
    d.ellipse([150, 410, 450, 450], fill=(238, 236, 230))
    
    # Frame silhouette styling
    frame_color = (35, 35, 35)
    lens_reflection = (240, 244, 248)
    
    if shape == "round":
        # Round glasses
        d.ellipse([130, 200, 270, 340], fill=lens_reflection, outline=frame_color, width=8)
        d.ellipse([330, 200, 470, 340], fill=lens_reflection, outline=frame_color, width=8)
        d.arc([265, 235, 335, 280], start=190, end=350, fill=frame_color, width=8)
        d.line([(130, 250), (90, 235)], fill=frame_color, width=7)
        d.line([(470, 250), (510, 235)], fill=frame_color, width=7)
        # Lens glare accents
        d.arc([155, 225, 245, 315], start=210, end=260, fill=(255, 255, 255), width=4)
        d.arc([355, 225, 445, 315], start=210, end=260, fill=(255, 255, 255), width=4)

    elif shape == "square":
        # Square / rectangle
        d.rounded_rectangle([130, 210, 275, 330], radius=14, fill=lens_reflection, outline=frame_color, width=8)
        d.rounded_rectangle([325, 210, 470, 330], radius=14, fill=lens_reflection, outline=frame_color, width=8)
        d.line([(275, 245), (325, 245)], fill=frame_color, width=8)
        d.line([(130, 245), (90, 235)], fill=frame_color, width=7)
        d.line([(470, 245), (510, 235)], fill=frame_color, width=7)

    elif shape == "aviator":
        # Aviator teardrop
        d.rounded_rectangle([125, 205, 275, 350], radius=35, fill=lens_reflection, outline=(90, 70, 45), width=7)
        d.rounded_rectangle([325, 205, 475, 350], radius=35, fill=lens_reflection, outline=(90, 70, 45), width=7)
        d.line([(275, 230), (325, 230)], fill=(90, 70, 45), width=6)
        d.line([(275, 250), (325, 250)], fill=(90, 70, 45), width=6)
        d.line([(125, 240), (85, 230)], fill=(90, 70, 45), width=6)
        d.line([(475, 240), (515, 230)], fill=(90, 70, 45), width=6)

    elif shape == "cateye":
        # Cat-eye sunglasses with darker tint
        tint = (50, 50, 60)
        d.polygon([(110, 210), (270, 230), (260, 340), (140, 320)], fill=tint, outline=frame_color)
        d.polygon([(490, 210), (330, 230), (340, 340), (460, 320)], fill=tint, outline=frame_color)
        d.line([(270, 245), (330, 245)], fill=frame_color, width=8)
        d.line([(110, 210), (80, 215)], fill=frame_color, width=7)
        d.line([(490, 210), (520, 215)], fill=frame_color, width=7)

    elif shape == "halfrim":
        # Half-rim optical
        d.arc([130, 220, 275, 335], start=0, end=180, fill=(180, 180, 180), width=3)
        d.line([(130, 220), (275, 220)], fill=frame_color, width=9)
        d.arc([325, 220, 470, 335], start=0, end=180, fill=(180, 180, 180), width=3)
        d.line([(325, 220), (470, 220)], fill=frame_color, width=9)
        d.line([(275, 230), (325, 230)], fill=frame_color, width=6)
        d.line([(130, 225), (90, 220)], fill=frame_color, width=6)
        d.line([(470, 225), (510, 220)], fill=frame_color, width=6)

    elif shape == "contact":
        # Contact lens blister packs
        d.rounded_rectangle([160, 200, 290, 360], radius=16, fill=(255, 255, 255), outline=(210, 210, 210), width=2)
        d.ellipse([185, 230, 265, 310], fill=(230, 244, 255), outline=(2, 47, 208), width=3)
        d.ellipse([200, 245, 250, 295], fill=(200, 230, 255))
        
        d.rounded_rectangle([310, 200, 440, 360], radius=16, fill=(255, 255, 255), outline=(210, 210, 210), width=2)
        d.ellipse([335, 230, 415, 310], fill=(230, 244, 255), outline=(2, 47, 208), width=3)
        d.ellipse([350, 245, 400, 295], fill=(200, 230, 255))
    
    # Typography
    font_loaded = False
    for f in ["arial.ttf", "segoeui.ttf", "calibri.ttf"]:
        try:
            f_title = ImageFont.truetype(f, 20)
            f_sub = ImageFont.truetype(f, 14)
            font_loaded = True
            break
        except Exception:
            continue

    if not font_loaded:
        f_title = ImageFont.load_default()
        f_sub = ImageFont.load_default()
    
    d.text((40, 490), title.upper(), fill=(40, 40, 40), font=f_title)
    d.text((40, 520), subtitle, fill=(130, 130, 125), font=f_sub)
    d.text((40, 545), "PLACEHOLDER ASSET", fill=(170, 170, 165), font=f_sub)

    img.save(out_path, "WEBP", quality=85)
    print(f"Generated {out_path}")

# Metadata for frame-01 to frame-10 ONLY
frames_meta = [
    ("frame-01.webp", "Frame Bulat 01", "round", "Acetate Frame - Seri Klasik"),
    ("frame-02.webp", "Frame Kotak 02", "square", "Metal Frame - Seri Minimalis"),
    ("frame-03.webp", "Frame Aviator 03", "aviator", "Titanium Frame - Seri Ringan"),
    ("frame-04.webp", "Frame Bulat Titanium 04", "round", "Ultra Light - Seri Fleksibel"),
    ("frame-05.webp", "Sunglasses Wayfarer 05", "square", "UV400 Polarized - Seri Outdoor"),
    ("frame-06.webp", "Sunglasses Cat-Eye 06", "cateye", "Vintage Tinted - Seri Fashion"),
    ("frame-07.webp", "Frame Acetate Persegi 07", "square", "Handcrafted Acetate - Seri Modern"),
    ("frame-08.webp", "Frame Half-Rim 08", "halfrim", "Professional Frame - Seri Kerja"),
    ("frame-09.webp", "Frame Geometris 09", "square", "Geometric Polygon - Seri Trend"),
    ("frame-10.webp", "Sunglasses Round 10", "round", "Polarized Round - Seri Santai"),
]

if __name__ == "__main__":
    print(f"Generating frame placeholders into: {IMG_DIR}")
    for fn, title, shape, sub in frames_meta:
        create_frame_placeholder(fn, title, shape, sub)
    print("Done. Generated frame-01 to frame-10 without touching logo.")
