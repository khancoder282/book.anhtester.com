"""Sinh ảnh cho bộ dữ liệu mẫu (chạy lại khi đổi data.json).

Cần Python 3 + Pillow, font Cambria/Segoe UI của Windows.
    python backend/prisma/seed/tools/make_images.py

Ra:
    assets/books/<slug>/bia-truoc.jpg, bia-sau.jpg   (600x900)
    assets/books/<slug>/trang-1.jpg, trang-2.jpg     (600x900, trang trong: đoạn đọc thử
                                                     hoặc Mục lục nếu sách không có đọc thử)
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
    # Tên sách ở dưới, tự giảm cỡ cho vừa (tên rất dài thì cho tới 7 dòng)
    for size in (68, 60, 52, 46, 40, 36, 32):
        ft = font("cambriab.ttf", size)
        lines = wrap_lines(d, book["name"], ft, W - 110)
        if len(lines) <= (4 if size >= 40 else 7):
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
    desc = wrap_lines(d, book["description"], fb, W - 120)
    max_lines = max(1, int((H - 180 - y) // 34))
    if len(desc) > max_lines:  # mô tả dài: cắt, thêm "…"
        desc = desc[:max_lines]
        desc[-1] = desc[-1].rstrip(".,;: ") + " …"
    for ln in desc:
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


# ---------- Trang trong (trang-1.jpg, trang-2.jpg) ----------
PAPER = (248, 243, 228)
INK = (48, 42, 36)
MUTED = (140, 128, 112)
MARGIN = 66
BOTTOM = H - 92
PAGE_NO = (9, 10)  # số trang in ở chân trang


def paper():
    """Nền giấy kem, hơi tối dần ở mép gáy cho giống trang sách."""
    im = Image.new("RGB", (W, H), PAPER)
    shade_l = Image.new("L", (W, 1))
    for x in range(W):
        shade_l.putpixel((x, 0), max(0, 26 - x // 3))
    im = Image.composite(Image.new("RGB", (W, H), (205, 196, 176)), im, shade_l.resize((W, H)))
    return im


def page_frame(book, number):
    im = paper()
    d = ImageDraw.Draw(im)
    fh = font("cambriai.ttf", 17)
    head = book["name"] if len(book["name"]) <= 52 else book["name"][:50].rstrip() + "…"
    d.text(((W - d.textlength(head, font=fh)) / 2, 34), head, font=fh, fill=MUTED)
    d.line((MARGIN, 62, W - MARGIN, 62), fill=(210, 200, 182), width=1)
    fn = font("cambria.ttc", 18)
    no = str(number)
    d.text(((W - d.textlength(no, font=fn)) / 2, H - 58), no, font=fn, fill=MUTED)
    return im, d


def draw_justified(d, x, y, words, fnt, width, last):
    """Căn đều hai bên (trừ dòng cuối đoạn)."""
    if last or len(words) == 1:
        d.text((x, y), " ".join(words), font=fnt, fill=INK)
        return
    total = sum(d.textlength(w, font=fnt) for w in words)
    gap = (width - total) / (len(words) - 1)
    for w in words:
        d.text((x, y), w, font=fnt, fill=INK)
        x += d.textlength(w, font=fnt) + gap


def layout(d, content, fb, fs, width):
    """Chia previewContent thành các dòng: ('p', words, indent, last) | ('h', text) | ('gap',)."""
    items = []
    for para in content.split("\n\n"):
        para = para.strip()
        if para.startswith("## "):
            items.append(("gap",))
            for ln in wrap_lines(d, para[3:], fs, width):
                items.append(("h", ln))
            continue
        indent = 28
        words, line, first = para.split(), [], True
        for w in words:
            limit = width - (indent if first else 0)
            if line and d.textlength(" ".join(line + [w]), font=fb) > limit:
                items.append(("p", line, indent if first else 0, False))
                line, first = [w], False
            else:
                line.append(w)
        if line:
            items.append(("p", line, indent if first else 0, True))
    return items


def text_pages(book):
    fb = font("cambria.ttc", 21)
    fs = font("cambriab.ttf", 23)
    width = W - 2 * MARGIN
    pages = []
    for idx in range(2):
        im, d = page_frame(book, PAGE_NO[idx])
        pages.append((im, d))
    d0 = pages[0][1]
    items = layout(d0, book["previewContent"], fb, fs, width)

    # Trang 1: đầu chương
    im, d = pages[0]
    ft = font("cambriab.ttf", 30)
    y = 130
    for ln in wrap_lines(d, book["previewTitle"], ft, width):
        d.text(((W - d.textlength(ln, font=ft)) / 2, y), ln, font=ft, fill=INK)
        y += 40
    d.line((W / 2 - 30, y + 14, W / 2 + 30, y + 14), fill=MUTED, width=2)
    y += 50
    starts = [y, 96]

    i = 0
    for pi, (im, d) in enumerate(pages):
        y = starts[pi]
        while i < len(items):
            it = items[i]
            h = 31 if it[0] == "p" else 14 + 34 + 2 * 31  # tiêu đề con: chừa chỗ cho 2 dòng sau
            if y + h > BOTTOM:
                break
            if it[0] == "gap":
                if y > starts[pi]:
                    y += 14
            elif it[0] == "h":
                d.text((MARGIN, y), it[1], font=fs, fill=INK)
                y += 34
            else:
                _, words, indent, last = it
                draw_justified(d, MARGIN + indent, y, words, fb, width - indent, last)
                y += 31
                if last:
                    y += 6
            i += 1
    return [im for im, _ in pages]


def toc_pages(book):
    """Sách không có đọc thử: hai trang Mục lục."""
    entries = book.get("toc") or [f"Phần {n}" for n in range(1, 11)]
    half = (len(entries) + 1) // 2
    fe = font("cambria.ttc", 22)
    fn = font("cambria.ttc", 22)
    ft = font("cambriab.ttf", 34)
    out, page = [], 5
    for idx, chunk in enumerate((entries[:half], entries[half:])):
        im, d = page_frame(book, PAGE_NO[idx] - 4)
        title = "Mục lục" if idx == 0 else "Mục lục (tiếp)"
        d.text(((W - d.textlength(title, font=ft)) / 2, 130), title, font=ft, fill=INK)
        d.line((W / 2 - 30, 184, W / 2 + 30, 184), fill=MUTED, width=2)
        y = 230
        for n, e in enumerate(chunk, start=1 + idx * half):
            label = f"{n}. {e}"
            no = str(page)
            x_end = W - MARGIN - d.textlength(no, font=fn)
            d.text((MARGIN, y), label, font=fe, fill=INK)
            x = MARGIN + d.textlength(label, font=fe) + 8
            while x < x_end - 10:  # dấu chấm dẫn tới số trang
                d.text((x, y), ".", font=fe, fill=MUTED)
                x += 9
            d.text((x_end, y), no, font=fn, fill=INK)
            y += 52
            page += 2
        out.append(im)
    return out


def inner_pages(book):
    return text_pages(book) if book.get("previewContent") else toc_pages(book)


def main():
    data = json.loads((SEED / "data.json").read_text(encoding="utf-8"))
    books_dir = OUT / "books"
    shutil.rmtree(books_dir, ignore_errors=True)
    for b in data["books"]:
        folder = books_dir / b["slug"]
        folder.mkdir(parents=True, exist_ok=True)
        front(b).save(folder / "bia-truoc.jpg", quality=82, optimize=True)
        back(b).save(folder / "bia-sau.jpg", quality=82, optimize=True)
        for n, im in enumerate(inner_pages(b), start=1):
            im.save(folder / f"trang-{n}.jpg", quality=82, optimize=True)

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
