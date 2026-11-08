#!/usr/bin/env python3
"""
Generate CIVORA brand icons and logos.
Colors:
  Primary Navy: #101D32
  Secondary Navy: #192B45
  Primary Teal: #0D9488
  Secondary Teal: #14B8A6
"""
import os
import math
from PIL import Image, ImageDraw

def draw_civora_mark(size=1024):
    # Render at high resolution with antialiasing
    scale = size / 512.0
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    cx, cy = size / 2.0, size / 2.0
    radius = 180 * scale
    thickness = int(48 * scale)

    # Arc 1: Navy arc (left / top side) representing the citizen grievance foundation
    # From 130 deg to 310 deg
    bbox = [cx - radius, cy - radius, cx + radius, cy + radius]
    draw.arc(bbox, start=125, end=305, fill=(16, 29, 50, 255), width=thickness)

    # Arc 2: Teal arc (bottom / right side) representing the resolution pathway
    # From -50 deg to 125 deg
    draw.arc(bbox, start=305, end=485, fill=(13, 148, 136, 255), width=thickness)

    # Add rounded end caps
    def draw_cap(angle_deg, color, r_adj=0):
        rad = math.radians(angle_deg)
        x = cx + (radius + r_adj) * math.cos(rad)
        y = cy + (radius + r_adj) * math.sin(rad)
        r_cap = thickness / 2.0
        draw.ellipse([x - r_cap, y - r_cap, x + r_cap, y + r_cap], fill=color)

    draw_cap(125, (16, 29, 50, 255))
    draw_cap(305, (13, 148, 136, 255))
    draw_cap(485, (13, 148, 136, 255))

    # Central geometric node: An elegant faceted resolution diamond / node in secondary teal
    inner_r = 54 * scale
    draw.ellipse([cx - inner_r, cy - inner_r, cx + inner_r, cy + inner_r], fill=(20, 184, 166, 255))

    # Inner core dot in primary navy
    core_r = 24 * scale
    draw.ellipse([cx - core_r, cy - core_r, cx + core_r, cy + core_r], fill=(16, 29, 50, 255))

    return img

def main():
    root = "/home/arsen1c/Documents/Projects/gnani/frontend"
    base_mark = draw_civora_mark(1024)

    # 1. public/logo.png (512x512)
    logo_512 = base_mark.resize((512, 512), Image.Resampling.LANCZOS)
    logo_512.save(f"{root}/public/logo.png", "PNG")
    print(f"Saved {root}/public/logo.png")

    # 2. app/icon.png (32x32)
    icon_32 = base_mark.resize((32, 32), Image.Resampling.LANCZOS)
    icon_32.save(f"{root}/app/icon.png", "PNG")
    print(f"Saved {root}/app/icon.png")

    # 3. app/apple-icon.png (180x180)
    # Apple icon with subtle rounded deep navy container for high contrast on iOS
    apple_img = Image.new("RGBA", (180, 180), (16, 29, 50, 255))
    mark_140 = draw_civora_mark(512).resize((140, 140), Image.Resampling.LANCZOS)
    apple_img.paste(mark_140, (20, 20), mark_140)
    apple_img.save(f"{root}/app/apple-icon.png", "PNG")
    print(f"Saved {root}/app/apple-icon.png")

    # 4. favicons (ico with 16, 32, 48)
    icon_16 = base_mark.resize((16, 16), Image.Resampling.LANCZOS)
    icon_48 = base_mark.resize((48, 48), Image.Resampling.LANCZOS)
    icon_32.save(f"{root}/app/favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])
    icon_32.save(f"{root}/public/favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])
    print(f"Saved favicons in app/ and public/")

if __name__ == "__main__":
    main()
