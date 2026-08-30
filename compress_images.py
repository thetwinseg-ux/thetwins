import glob
import os
import sys

try:
    from PIL import Image
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pillow"])
    from PIL import Image

def compress_image(filepath, max_width=1600, quality=78):
    try:
        orig_size = os.path.getsize(filepath)
        img = Image.open(filepath)
        
        # Convert RGBA/P to RGB for JPEG
        is_png = filepath.lower().endswith('.png')
        if not is_png and img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
        
        # Resize if width exceeds max_width
        if img.width > max_width:
            ratio = max_width / float(img.width)
            new_h = int(float(img.height) * ratio)
            img = img.resize((max_width, new_h), Image.Resampling.LANCZOS)
        
        # Save optimized
        if is_png:
            img.save(filepath, "PNG", optimize=True)
        else:
            img.save(filepath, "JPEG", quality=quality, optimize=True, progressive=True)
            
        new_size = os.path.getsize(filepath)
        saved_kb = (orig_size - new_size) / 1024.0
        saved_pct = ((orig_size - new_size) / float(orig_size)) * 100 if orig_size > 0 else 0
        print(f"[OK] {filepath}: {orig_size//1024}KB -> {new_size//1024}KB (-{saved_pct:.1f}%)")
    except Exception as e:
        print(f"[ERROR] Failed {filepath}: {e}")

# 1. Compress main slider images
for f in glob.glob('slide*.jpeg') + glob.glob('slide*.jpg'):
    compress_image(f, max_width=1920, quality=78)

# 2. Compress background landing images
for f in glob.glob('background landing/*.jpeg') + glob.glob('background landing/*.jpg'):
    compress_image(f, max_width=1920, quality=78)

# 3. Compress uploads folder images
for f in glob.glob('uploads/*.jpeg') + glob.glob('uploads/*.jpg') + glob.glob('uploads/*.png'):
    compress_image(f, max_width=1200, quality=80)

print("\nAll website images compressed and optimized successfully!")


