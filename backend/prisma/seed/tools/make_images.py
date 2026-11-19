"""Sinh ảnh cho bộ dữ liệu mẫu (chạy lại khi đổi data.json).

Cần Python 3 + Pillow, font Cambria/Segoe UI của Windows.
    python backend/prisma/seed/tools/make_images.py

Ra:
    assets/books/<slug>/bia-truoc.jpg, bia-sau.jpg   (600x900)
    assets/avatars/*.webp                            (copy từ frontend)
    assets/files/hinh-anh/*.jpg                      (ảnh banner cho module File)
"""
import json
import shutil
import textwrap
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

SEED = Path(__file__).resolve().parent.parent
ROOT = SEED.parent.parent.parent
ART = ROOT / "frontend/public/assets/images/cover"
AVATAR_SRC = ROOT / "frontend/public/assets/images/avatar"
OUT = SEED / "assets"
FONTS = Path("C:/Windows/Fonts")
W, H = 600, 900


def font(name, size):
    return ImageFont.truetype(str(FONTS / name), size)


def art(index, size):
    """Cắt ảnh nền cho vừa khung `size`, giữ tỉ lệ."""
    im = Image.open(ART / f"cover-{index}.webp").convert("RGB")
    tw, th = size
    scale = max(tw / im.width, th / im.height)
    im = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
    left, top = (im.width - tw) // 2, (im.height - th) // 2
    return im.crop((left, top, left + tw, top + th))


def shade(im, top_alpha, bottom_alpha):
    """Phủ dải tối từ trên xuống để chữ đọc được."""
    overlay = Image.new("L", (1, im.height))
    for y in range(im.height):
        overlay.putpixel((0, y), round(top_alpha + (bottom_alpha - top_alpha) * y / im.height))
    overlay = overlay.resize(im.size)
    black = Image.new("RGB", im.size, (12, 12, 20))
    return Image.composite(black, im, overlay)


def wrap_lines(draw, text, fnt, max_width):
    words, lines, line = text.split(), [], ""
    for w in words:
        test = f"{line} {w}".strip()
        if draw.textlength(test, font=fnt) <= max_width:
            line = test
        else:
            lines.append(line)
            line = w
    if line:
        lines.append(line)
    return lines


def front(book):
    im = shade(art(book["cover"], (W, H)), 40, 215)
    d = ImageDraw.Draw(im)
    # Viền trong
    d.rectangle((24, 24, W - 25, H - 25), outline=(255, 255, 255), width=2)
    # Tác giả ở trên
    fa = font("segoeui.ttf", 26)
    author = book["author"].upper()
    d.text(((W - d.textlength(author, font=fa)) / 2, 62), author, font=fa, fill=(240, 240, 240))
    # Tên sách ở dưới, tự giảm cỡ cho vừa
    for size in (68, 60, 52, 46, 40):
        ft = font("cambriab.ttf", size)
        lines = wrap_lines(d, book["name"], ft, W - 110)
        if len(lines) <= 4:
            break
    line_h = size * 1.18
    y = H - 120 - line_h * len(lines)
    for ln in lines:
        d.text(((W - d.textlength(ln, font=ft)) / 2, y), ln, font=ft, fill="white")
        y += line_h
    d.line((W / 2 - 40, H - 92, W / 2 + 40, H - 92), fill=(255, 255, 255), width=2)
    fp = font("segoeui.ttf", 20)
    pub = "BOOK ANHTESTER"
    d.text(((W - d.textlength(pub, font=fp)) / 2, H - 78), pub, font=fp, fill=(220, 220, 220))
    return im


def back(book):
    bg = art(book["back"], (W, H)).filter(ImageFilter.GaussianBlur(6))
    im = shade(bg, 150, 210)
    d = ImageDraw.Draw(im)
    ft = font("cambriab.ttf", 34)
    y = 90
    for ln in wrap_lines(d, book["name"], ft, W - 120):
        d.text((60, y), ln, font=ft, fill="white")
        y += 42
    d.text((60, y + 6), book["author"], font=font("segoeuii.ttf", 24), fill=(225, 225, 225))
    y += 70
    fb = font("segoeui.ttf", 24)
    for ln in wrap_lines(d, book["description"], fb, W - 120):
        d.text((60, y), ln, font=fb, fill=(245, 245, 245))
        y += 34
    cats = " · ".join(book["categories"])
    d.text((60, H - 150), cats, font=font("segoeuib.ttf", 22), fill=(255, 214, 102))
    price = f"{book['price']:,}".replace(",", ".") + " ₫"
    d.text((60, H - 110), price, font=font("segoeuib.ttf", 30), fill="white")
    # Mã vạch giả để trông giống bìa sau
    x0, yb = W - 230, H - 140
    d.rectangle((x0 - 12, yb - 12, W - 48, H - 52), fill="white")
    seed = sum(map(ord, book["slug"]))
    x = x0
    while x < W - 60:
        wbar = 1 + (seed + x) % 3
        if (seed * x) % 5:
            d.rectangle((x, yb, x + wbar - 1, H - 72), fill="black")
        x += wbar + 1
    return im


def main():
    data = json.loads((SEED / "data.json").read_text(encoding="utf-8"))
    books_dir = OUT / "books"
    shutil.rmtree(books_dir, ignore_errors=True)
    for b in data["books"]:
        folder = books_dir / b["slug"]
        folder.mkdir(parents=True, exist_ok=True)
        front(b).save(folder / "bia-truoc.jpg", quality=82, optimize=True)
        back(b).save(folder / "bia-sau.jpg", quality=82, optimize=True)

    avatars = OUT / "avatars"
    avatars.mkdir(parents=True, exist_ok=True)
    for u in data["users"]:
        if u["avatar"]:
            shutil.copyfile(AVATAR_SRC / u["avatar"], avatars / u["avatar"])

    banners = OUT / "files/hinh-anh"
    banners.mkdir(parents=True, exist_ok=True)
    for i, name in ((6, "banner-khuyen-mai.jpg"), (2, "banner-sach-moi.jpg")):
        art(i, (1200, 600)).save(banners / name, quality=80, optimize=True)
    print("OK", len(data["books"]), "books")


if __name__ == "__main__":
    main()
