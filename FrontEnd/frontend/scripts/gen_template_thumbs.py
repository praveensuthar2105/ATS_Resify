"""Generate compact resume-template thumbnail previews for the template picker."""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parents[1] / "public" / "templates"
OUT.mkdir(parents=True, exist_ok=True)

W, H = 280, 360


def font(size, bold=False):
    candidates = [
        r"C:\Windows\Fonts\segoeuib.ttf" if bold else r"C:\Windows\Fonts\segoeui.ttf",
        r"C:\Windows\Fonts\arialbd.ttf" if bold else r"C:\Windows\Fonts\arial.ttf",
        r"C:\Windows\Fonts\calibrib.ttf" if bold else r"C:\Windows\Fonts\calibri.ttf",
    ]
    for path in candidates:
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    return ImageFont.load_default()


def draw_lines(draw, x, y, w, n=3, gap=8, color=(100, 116, 139)):
    for i in range(n):
        draw.rectangle(
            [x, y + i * gap, x + w - (i % 2) * 20, y + i * gap + 3],
            fill=color,
        )


def make_ats():
    img = Image.new("RGB", (W, H), "#FFFFFF")
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W - 1, H - 1], outline="#E2E8F0")
    d.text((W // 2, 22), "ALEX MORGAN", font=font(16, True), fill="#0F172A", anchor="mt")
    d.text(
        (W // 2, 44),
        "555-0100  |  alex@email.com  |  LinkedIn",
        font=font(8),
        fill="#64748B",
        anchor="mt",
    )
    y = 62
    for title in ["EDUCATION", "EXPERIENCE", "PROJECTS", "SKILLS"]:
        d.text((18, y), title, font=font(10, True), fill="#0F172A")
        d.line([(18, y + 14), (W - 18, y + 14)], fill="#0F172A", width=1)
        y += 22
        d.text((18, y), "Company / University", font=font(9, True), fill="#1E293B")
        d.text((W - 18, y), "2022-2024", font=font(8), fill="#64748B", anchor="rt")
        y += 14
        d.text((18, y), "Role or Degree", font=font(8), fill="#475569")
        y += 12
        draw_lines(d, 22, y, W - 50, n=3, gap=7)
        y += 34
    img.save(OUT / "ats.png", optimize=True)


def make_minimal():
    img = Image.new("RGB", (W, H), "#FFFFFF")
    d = ImageDraw.Draw(img)
    blue = "#204097"
    d.rectangle([0, 0, W - 1, H - 1], outline="#E2E8F0")
    d.text((14, 28), "555-0100", font=font(8), fill="#334155")
    d.text((14, 40), "alex@email.com", font=font(8), fill=blue)
    d.text((W // 2, 26), "ALEX", font=font(18, True), fill="#0F172A", anchor="mt")
    d.text((W // 2, 46), "MORGAN", font=font(18, True), fill="#0F172A", anchor="mt")
    d.text((W - 14, 28), "linkedin.com/in/alex", font=font(7), fill=blue, anchor="rt")
    d.text((W - 14, 40), "Portfolio", font=font(7), fill=blue, anchor="rt")
    d.line([(14, 62), (W - 14, 62)], fill=blue, width=2)
    d.text((14, 72), "Impact:", font=font(8, True), fill="#0F172A")
    draw_lines(d, 52, 76, W - 80, n=2, gap=6)
    y = 100
    for title in ["Education", "Experience", "Projects", "Skills"]:
        d.text((14, y), title, font=font(11, True), fill=blue)
        d.line([(14, y + 16), (W - 14, y + 16)], fill=blue, width=1)
        y += 24
        d.text((14, y), "Software Engineer", font=font(9, True), fill="#0F172A")
        d.text((W - 14, y), "2020 — Present", font=font(7), fill="#64748B", anchor="rt")
        y += 13
        d.text((14, y), "Tech Corp  ·  San Francisco", font=font(8), fill="#475569")
        y += 12
        draw_lines(d, 20, y, W - 48, n=3, gap=7)
        y += 32
    img.save(OUT / "minimal.png", optimize=True)


if __name__ == "__main__":
    make_ats()
    make_minimal()
    print("Wrote:", sorted(p.name for p in OUT.iterdir()))
