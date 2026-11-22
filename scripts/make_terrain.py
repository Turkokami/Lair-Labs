#!/usr/bin/env python3
"""Makes Lair Labs' own outdoor terrain textures.

Usage: python3 scripts/make_terrain.py            (writes public/library/floors/<id>.webp)
       python3 scripts/make_terrain.py --sheet out.png   (also a contact sheet to look at)

Every texture is drawn here from noise and simple shapes, so it is original Lair Labs work. Each one is
384 x 384 px, covers 4 x 4 squares (96 px per square, like the rest of the floor library) and tiles
seamlessly: all noise is periodic (made with an FFT) and every scattered shape wraps around the edges.
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "library" / "floors"
N = 384


def rng_for(name):
    return np.random.default_rng(abs(hash(name)) % (2**32) if False else sum(ord(c) * (i + 1) for i, c in enumerate(name)))


def noise(rng, scale, power=2.0, n=N):
    """Periodic fractal noise in 0..1. `scale` = rough feature size in px."""
    fx = np.fft.fftfreq(n)[:, None]
    fy = np.fft.fftfreq(n)[None, :]
    f = np.sqrt(fx * fx + fy * fy)
    f[0, 0] = 1
    amp = 1.0 / (f ** power)
    amp *= np.exp(-((f * scale) ** 2) * 0.0) if scale <= 0 else 1
    # cut detail finer than the feature size
    amp *= np.exp(-(f * scale / 3.0) ** 2) if scale > 0 else 1
    amp[0, 0] = 0
    ph = rng.uniform(0, 2 * np.pi, (n, n))
    z = np.real(np.fft.ifft2(amp * np.exp(1j * ph)))
    z -= z.min()
    z /= z.max() + 1e-9
    return z


def fine(rng, n=N):
    """Pixel grain, periodic for free."""
    return rng.random((n, n))


def mix(a, b, t):
    t = np.clip(t, 0, 1)[..., None]
    return a * (1 - t) + b * t


def col(hexs):
    h = hexs.lstrip("#")
    return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], dtype=np.float32)


def ramp(t, stops):
    """t 0..1 -> colour by a list of (pos, hex)."""
    out = np.zeros(t.shape + (3,), np.float32)
    pos = [p for p, _ in stops]
    cs = [col(c) for _, c in stops]
    for ch in range(3):
        out[..., ch] = np.interp(t, pos, [c[ch] for c in cs])
    return out


def to_img(a):
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), "RGB")


def wrap_draw(img, fn):
    """Calls fn(draw, dx, dy) for the 9 wrapped copies so shapes crossing an edge tile seamlessly."""
    d = ImageDraw.Draw(img, "RGBA")
    for dx in (-N, 0, N):
        for dy in (-N, 0, N):
            fn(d, dx, dy)
    return img


def scatter(img, rng, count, draw_one):
    pts = [(rng.uniform(0, N), rng.uniform(0, N), rng.random(), rng.random()) for _ in range(count)]

    def fn(d, dx, dy):
        for x, y, a, b in pts:
            draw_one(d, x + dx, y + dy, a, b)

    return wrap_draw(img, fn)


def shade_light(base, rng, s=40, k=0.18):
    """Large soft light and dark patches."""
    m = noise(rng, s) - 0.5
    return base * (1 + m[..., None] * k * 2)


# ---------------------------------------------------------------- textures


def grass_like(name, stops, flowers=None, tufts=420, tuft_cols=("#3d5a1e", "#7aa33a")):
    rng = rng_for(name)
    t = noise(rng, 70) * 0.6 + noise(rng, 18) * 0.3 + fine(rng) * 0.1
    a = ramp(t, stops)
    a = shade_light(a, rng, 120, 0.12)
    img = to_img(a)
    c1, c2 = col(tuft_cols[0]), col(tuft_cols[1])

    def tuft(d, x, y, r, s):
        c = tuple(int(v) for v in (c1 * (1 - r) + c2 * r)) + (150,)
        for k in range(3):
            ang = -1.9 + k * 0.45 + (s - 0.5) * 0.6
            L = 4 + s * 5
            d.line([(x, y), (x + np.cos(ang) * L, y + np.sin(ang) * L)], fill=c, width=1)

    scatter(img, rng, tufts, tuft)
    if flowers:
        def fl(d, x, y, r, s):
            c = flowers[int(r * len(flowers)) % len(flowers)]
            rr = 1.4 + s * 1.4
            d.ellipse([x - rr, y - rr, x + rr, y + rr], fill=c + "e0")
            d.ellipse([x - 0.6, y - 0.6, x + 0.6, y + 0.6], fill="#fff6c8ff")

        scatter(img, rng, 70, fl)
    return img


def soil_like(name, stops, pebbles=0, pebble_cols=("#5a4632", "#9c8463"), grain=0.1, big=60):
    rng = rng_for(name)
    t = noise(rng, big) * 0.55 + noise(rng, 12) * 0.3 + fine(rng) * grain
    a = ramp(np.clip(t, 0, 1), stops)
    a = shade_light(a, rng, 140, 0.1)
    img = to_img(a)
    if pebbles:
        c1, c2 = col(pebble_cols[0]), col(pebble_cols[1])

        def peb(d, x, y, r, s):
            rr = 1.2 + s * 3.2
            c = tuple(int(v) for v in (c1 * (1 - r) + c2 * r))
            d.ellipse([x - rr + 0.8, y - rr * 0.8 + 1.2, x + rr + 0.8, y + rr * 0.8 + 1.2], fill=(0, 0, 0, 70))
            d.ellipse([x - rr, y - rr * 0.8, x + rr, y + rr * 0.8], fill=c + (235,))
            d.ellipse([x - rr * 0.5, y - rr * 0.6, x, y - rr * 0.1], fill=(255, 255, 255, 40))

        scatter(img, rng, pebbles, peb)
    return img


def make_grass_lush():
    return grass_like("grass-lush", [(0, "#2f5a1c"), (0.5, "#3f7426"), (1, "#5c9434")], tufts=520, tuft_cols=("#24461a", "#6aa83c"))


def make_grass_dry():
    return grass_like("grass-dry", [(0, "#6e6a2e"), (0.5, "#8c8240"), (1, "#a89a58")], tufts=480, tuft_cols=("#5a5426", "#c2b46a"))


def make_meadow():
    return grass_like("meadow", [(0, "#46702a"), (0.5, "#5a8a32"), (1, "#74a243")], flowers=["#f2e15a", "#ffffff", "#c58be8", "#f08a5d", "#7fb2f0"], tufts=380)


def make_tundra():
    rng = rng_for("tundra")
    g = grass_like("tundra-g", [(0, "#6c6a4a"), (0.5, "#878060"), (1, "#a29a78")], tufts=300, tuft_cols=("#5c583e", "#b3aa86"))
    a = np.asarray(g).astype(np.float32)
    m = noise(rng, 50)
    snow = ramp(fine(rng) * 0.3 + noise(rng, 20) * 0.7, [(0, "#d9e1e6"), (1, "#f4f7f9")])
    t = np.clip((m - 0.52) * 7, 0, 1)
    return to_img(mix(a, snow, t))


def make_forest_floor():
    rng = rng_for("forest-floor")
    t = noise(rng, 60) * 0.5 + noise(rng, 10) * 0.35 + fine(rng) * 0.15
    a = ramp(t, [(0, "#3a2e1c"), (0.45, "#56442a"), (0.75, "#6b5a32"), (1, "#5f6a30")])
    a = shade_light(a, rng, 100, 0.14)
    img = to_img(a)
    leaf_cols = [(150, 92, 40), (176, 120, 46), (120, 72, 36), (98, 108, 44), (188, 146, 70)]

    def leaf(d, x, y, r, s):
        c = leaf_cols[int(r * len(leaf_cols)) % len(leaf_cols)]
        L, W = 3 + s * 3.5, 1.4 + s * 1.4
        ang = r * 6.28 + s
        ca, sa = np.cos(ang), np.sin(ang)
        pts = [(x + ca * L, y + sa * L), (x - sa * W, y + ca * W), (x - ca * L, y - sa * L), (x + sa * W, y - ca * W)]
        d.polygon(pts, fill=c + (215,))

    scatter(img, rng, 900, leaf)

    def twig(d, x, y, r, s):
        ang = r * 6.28
        L = 6 + s * 10
        d.line([(x, y), (x + np.cos(ang) * L, y + np.sin(ang) * L)], fill=(60, 42, 24, 200), width=2)

    scatter(img, rng, 26, twig)
    return img


def make_moss():
    rng = rng_for("moss")
    t = noise(rng, 30) * 0.5 + noise(rng, 6) * 0.35 + fine(rng) * 0.15
    a = ramp(t, [(0, "#2c4a1e"), (0.5, "#4a7a2c"), (0.8, "#6a9a3a"), (1, "#8fb64e")])
    return to_img(shade_light(a, rng, 90, 0.12))


def make_thicket():
    rng = rng_for("thicket")
    img = grass_like("thicket-g", [(0, "#263e18"), (0.5, "#35561f"), (1, "#4a6e2a")], tufts=200)

    def bush(d, x, y, r, s):
        rr = 7 + s * 9
        d.ellipse([x - rr + 2, y - rr + 3, x + rr + 2, y + rr + 3], fill=(0, 0, 0, 70))
        g = int(70 + r * 50)
        d.ellipse([x - rr, y - rr, x + rr, y + rr], fill=(30, g, 26, 235))
        d.ellipse([x - rr * 0.6, y - rr * 0.7, x + rr * 0.2, y - rr * 0.0], fill=(80, g + 50, 50, 90))

    scatter(img, rng, 70, bush)
    return img


def make_gravel():
    rng = rng_for("gravel")
    return soil_like("gravel", [(0, "#6a655d"), (0.5, "#857f75"), (1, "#a09a8f")], pebbles=1500, pebble_cols=("#5d5850", "#bdb6aa"), big=40)


def make_scree():
    rng = rng_for("scree")
    img = soil_like("scree", [(0, "#55504a"), (0.5, "#6e6860"), (1, "#87817a")], pebbles=500, pebble_cols=("#4c4842", "#a39d94"))

    def rock(d, x, y, r, s):
        rr = 6 + s * 9
        n = 6
        pts = []
        for k in range(n):
            ang = k / n * 6.28 + r
            q = rr * (0.7 + 0.3 * np.sin(k * 2.1 + s * 9))
            pts.append((x + np.cos(ang) * q, y + np.sin(ang) * q * 0.8))
        d.polygon([(px + 2, py + 3) for px, py in pts], fill=(0, 0, 0, 80))
        v = int(96 + r * 60)
        d.polygon(pts, fill=(v, v - 4, v - 10, 245))
        d.line(pts[:3], fill=(255, 255, 255, 45), width=2)

    scatter(img, rng, 90, rock)
    return img


def make_rocky_ground():
    rng = rng_for("rocky-ground")
    img = soil_like("rocky-ground", [(0, "#5c4a36"), (0.5, "#776148"), (1, "#8e7a5c")], pebbles=600)

    def slab(d, x, y, r, s):
        rr = 10 + s * 16
        pts = []
        for k in range(7):
            ang = k / 7 * 6.28 + r * 3
            q = rr * (0.65 + 0.35 * np.sin(k * 1.7 + r * 11))
            pts.append((x + np.cos(ang) * q, y + np.sin(ang) * q * 0.75))
        d.polygon([(px + 2, py + 3) for px, py in pts], fill=(0, 0, 0, 70))
        v = int(110 + r * 40)
        d.polygon(pts, fill=(v, v - 6, v - 16, 240))
        d.line(pts + [pts[0]], fill=(40, 34, 28, 160), width=1)

    scatter(img, rng, 28, slab)
    return img


def make_road_dirt():
    rng = rng_for("road-dirt")
    img = soil_like("road-dirt", [(0, "#6a5236"), (0.5, "#83684a"), (1, "#9a8060")], pebbles=500, big=35)
    a = np.asarray(img).astype(np.float32)
    # worn, lighter streaks from traffic (both ways so it reads on any road direction)
    s = noise(rng, 25)
    a = a * (1 + (s[..., None] - 0.5) * 0.12)
    return to_img(a)


def make_farmland():
    rng = rng_for("farmland")
    y = np.arange(N)[:, None] * np.ones((1, N))
    rows = 0.5 + 0.5 * np.sin(y / N * 2 * np.pi * 16 + noise(rng, 40) * 1.5)
    t = rows * 0.55 + noise(rng, 12) * 0.3 + fine(rng) * 0.15
    a = ramp(t, [(0, "#3c2a18"), (0.5, "#5b4126"), (1, "#7a5a36")])
    img = to_img(shade_light(a, rng, 120, 0.1))

    def sprout(d, x, yy, r, s):
        # sprouts sit on the ridges
        yy = round(yy / (N / 16)) * (N / 16) + N / 64
        c = (70 + int(r * 40), 120 + int(s * 40), 44, 230)
        d.ellipse([x - 2, yy - 2, x + 2, yy + 2], fill=c)

    scatter(img, rng, 500, sprout)
    return img


def make_beach_sand():
    rng = rng_for("beach-sand")
    img = soil_like("beach-sand", [(0, "#cdb88c"), (0.5, "#dccaa0"), (1, "#ebdcb8")], grain=0.25, big=50)

    def shell(d, x, y, r, s):
        rr = 1.2 + s * 2
        c = [(250, 244, 230), (226, 196, 170), (190, 170, 150)][int(r * 3) % 3]
        d.ellipse([x - rr, y - rr * 0.7, x + rr, y + rr * 0.7], fill=c + (220,))

    scatter(img, rng, 120, shell)
    return img


def make_desert_cracked():
    rng = rng_for("desert-cracked")
    a = ramp(noise(rng, 60) * 0.7 + fine(rng) * 0.3, [(0, "#a7774a"), (0.5, "#bd8d5c"), (1, "#cfa274")])
    img = to_img(shade_light(a, rng, 120, 0.1))
    # cracks: edges of a wrapped Voronoi
    pts = rng.random((60, 2)) * N
    yy, xx = np.mgrid[0:N, 0:N].astype(np.float32)
    d1 = np.full((N, N), 1e9, np.float32)
    d2 = np.full((N, N), 1e9, np.float32)
    for px, py in pts:
        for ox in (-N, 0, N):
            for oy in (-N, 0, N):
                d = np.hypot(xx - px - ox, yy - py - oy)
                d2 = np.where(d < d1, d1, np.minimum(d2, d))
                d1 = np.minimum(d1, d)
    edge = np.clip(1 - (d2 - d1) / 3.0, 0, 1)
    a = np.asarray(img).astype(np.float32)
    a = mix(a, col("#5a3a20"), edge * 0.85)
    a = a * (1 - np.clip(1 - (d2 - d1) / 9.0, 0, 1)[..., None] * 0.12)
    return to_img(a)


def make_ash():
    rng = rng_for("ash")
    img = soil_like("ash", [(0, "#3a3836"), (0.5, "#55524e"), (1, "#73706a")], pebbles=300, pebble_cols=("#222020", "#4a4644"), big=45)

    def ember(d, x, y, r, s):
        if r > 0.85:
            rr = 1 + s
            d.ellipse([x - rr, y - rr, x + rr, y + rr], fill=(230, 110, 40, 200))

    scatter(img, rng, 200, ember)
    return img


def make_snow():
    rng = rng_for("snow")
    t = noise(rng, 70) * 0.6 + noise(rng, 14) * 0.25 + fine(rng) * 0.15
    a = ramp(t, [(0, "#c4d0da"), (0.5, "#dde6ed"), (1, "#f4f8fb")])
    a = shade_light(a, rng, 100, 0.06)
    img = to_img(a)

    def sparkle(d, x, y, r, s):
        d.point((x, y), fill=(255, 255, 255, 230))

    scatter(img, rng, 300, sparkle)
    return img


def water_like(name, stops, line_col, lines=0.55, big=60):
    rng = rng_for(name)
    t = noise(rng, big) * 0.7 + fine(rng) * 0.05 + noise(rng, 15) * 0.25
    a = ramp(t, stops)
    # caustic lines: thin bands of a second noise
    w = noise(rng, 22)
    band = np.clip(1 - np.abs(w - 0.5) * 22, 0, 1)
    a = mix(a, col(line_col), band * lines)
    return to_img(a)


def make_swamp_water():
    return water_like("swamp-water", [(0, "#2a3a26"), (0.5, "#384c30"), (1, "#4b5e38")], "#6d8050", 0.35)


def make_ocean():
    return water_like("ocean", [(0, "#123a5c"), (0.5, "#18496f"), (1, "#205a82")], "#3e7aa6", 0.4, big=90)


def make_bog():
    rng = rng_for("bog")
    m = noise(rng, 40)
    mud = np.asarray(soil_like("bog-m", [(0, "#3a3020"), (0.5, "#4c3e28"), (1, "#5a4a30")], big=40)).astype(np.float32)
    water = np.asarray(make_swamp_water()).astype(np.float32)
    t = np.clip((m - 0.55) * 8, 0, 1)
    a = mix(mud, water, t)
    img = to_img(a)

    def reed(d, x, y, r, s):
        for k in range(4):
            ang = -1.57 + (k - 1.5) * 0.3 + (r - 0.5) * 0.4
            L = 5 + s * 6
            d.line([(x, y), (x + np.cos(ang) * L, y + np.sin(ang) * L)], fill=(90, 110, 50, 220), width=1)

    scatter(img, rng, 120, reed)
    return img


def make_cliff():
    """Rugged rock seen from above: a ridged height field lit from the north-west."""
    rng = rng_for("cliff")
    h = noise(rng, 70) * 0.55 + (1 - np.abs(noise(rng, 26) * 2 - 1)) * 0.3 + noise(rng, 8) * 0.15
    gy, gx = np.gradient(h)
    # periodic gradient so the shading tiles
    gx = (np.roll(h, -1, 1) - np.roll(h, 1, 1)) / 2
    gy = (np.roll(h, -1, 0) - np.roll(h, 1, 0)) / 2
    k = 38.0
    nx, ny, nz = -gx * k, -gy * k, np.ones_like(h)
    ln = np.sqrt(nx * nx + ny * ny + nz * nz)
    lx, ly, lz = -0.55, -0.55, 0.63
    lam = np.clip((nx * lx + ny * ly + nz * lz) / ln, 0, 1)
    t = np.clip(h * 0.6 + fine(rng) * 0.1 + 0.15, 0, 1)
    base = ramp(t, [(0, "#4b4741"), (0.5, "#6b665e"), (1, "#8d877c")])
    a = base * (0.55 + lam[..., None] * 0.75)
    # dark creases where the ridges meet
    crease = np.clip(1 - np.abs(noise(rng, 30) * 2 - 1) * 9, 0, 1)
    a = mix(a, col("#24211e"), crease * 0.65)
    img = to_img(a)

    def tuft(d, x, y, r, s):
        if r > 0.82:
            rr = 2 + s * 3
            d.ellipse([x - rr, y - rr, x + rr, y + rr], fill=(78, 100, 52, 150))

    scatter(img, rng, 70, tuft)
    return img


def make_road_paved():
    rng = rng_for("road-paved")
    base = ramp(noise(rng, 40) * 0.6 + fine(rng) * 0.4, [(0, "#6f6a62"), (0.5, "#878177"), (1, "#9d978c")])
    img = to_img(base)
    d = ImageDraw.Draw(img, "RGBA")
    # running-bond large slabs, 6 rows of 64 px, offset every other row
    rh = N // 6
    for r in range(6):
        off = (r % 2) * 48
        x = -off
        while x < N:
            w = 96
            v = int(rng.uniform(-14, 14))
            for ox in (-N, 0, N):
                d.rectangle([x + ox + 2, r * rh + 2, x + ox + w - 2, r * rh + rh - 2], fill=(140 + v, 134 + v, 124 + v, 70))
                d.line([(x + ox, r * rh), (x + ox, r * rh + rh)], fill=(50, 46, 42, 210), width=2)
            x += w
        d.line([(0, r * rh), (N, r * rh)], fill=(50, 46, 42, 210), width=2)
    a = np.asarray(img).astype(np.float32)
    a = a * (1 + (noise(rng, 20)[..., None] - 0.5) * 0.15)
    return to_img(a)


TEXTURES = {
    "grass-lush": make_grass_lush,
    "grass-dry": make_grass_dry,
    "meadow": make_meadow,
    "tundra": make_tundra,
    "forest-floor": make_forest_floor,
    "moss": make_moss,
    "thicket": make_thicket,
    "gravel": make_gravel,
    "scree": make_scree,
    "rocky-ground": make_rocky_ground,
    "road-dirt": make_road_dirt,
    "farmland": make_farmland,
    "beach-sand": make_beach_sand,
    "desert-cracked": make_desert_cracked,
    "ash": make_ash,
    "snow": make_snow,
    "swamp-water": make_swamp_water,
    "ocean": make_ocean,
    "bog": make_bog,
    "cliff": make_cliff,
    "road-paved": make_road_paved,
}


def check_seamless(img):
    a = np.asarray(img).astype(np.float32)
    # compare the jump across the wrap with an ordinary neighbour jump
    wrap = np.abs(a[:, 0] - a[:, -1]).mean() + np.abs(a[0] - a[-1]).mean()
    inner = np.abs(a[:, 1:] - a[:, :-1]).mean() + np.abs(a[1:] - a[:-1]).mean()
    return wrap / max(inner, 1e-6)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    only = [a for a in sys.argv[1:] if not a.startswith("--") and not a.endswith(".png")]
    made = []
    for name, fn in TEXTURES.items():
        if only and name not in only:
            continue
        img = fn()
        ratio = check_seamless(img)
        img.save(OUT / f"{name}.webp", "WEBP", quality=86, method=6)
        made.append((name, img))
        print(f"{name:16s} seam ratio {ratio:.2f}")
    if "--sheet" in sys.argv:
        path = sys.argv[sys.argv.index("--sheet") + 1]
        cols = 6
        rows = (len(made) + cols - 1) // cols
        sheet = Image.new("RGB", (cols * 2 * 160, rows * 2 * 160 + rows * 20), "#111")
        d = ImageDraw.Draw(sheet)
        for i, (name, img) in enumerate(made):
            x, y = (i % cols) * 320, (i // cols) * 340
            # 2x2 tiles at half size to show the seams
            t = img.resize((160, 160))
            for ox in (0, 160):
                for oy in (0, 160):
                    sheet.paste(t, (x + ox, y + oy))
            d.text((x + 4, y + 322), name, fill="#fff")
        sheet.save(path)


if __name__ == "__main__":
    main()
