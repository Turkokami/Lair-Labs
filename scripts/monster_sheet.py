"""Turn a monster concept sheet (front / side / back views side by side) into clean pictures for the 3D build.

    python3 -m pip install "rembg[cpu]"            # once
    python3 scripts/monster_sheet.py sheet.png skeleton-knight [out_dir]

Writes, for each view found left to right (front, side, back, or front, left, right, back when there are four):
  <out_dir>/<name>-<view>.jpg   1024 square, figure centred on white (what the 3D engine wants)
  <out_dir>/<name>-<view>.png   cut-out with transparency
and public/library/portraits/<name>.webp: a 256 px head-and-shoulders crop of the front view for the map token.
Check the portrait; pass --portrait x0,y0,x1,y1 (sheet pixels) to frame it by hand.
"""
import os
import sys

import numpy as np
from PIL import Image
from rembg import new_session, remove


def figures(alpha: np.ndarray, min_gap: int = 12, min_width: int = 40):
    cols = (alpha > 128).sum(axis=0) > 2
    spans, start, gap = [], None, 0
    for x, on in enumerate(cols):
        if on:
            if start is None:
                start = x
            gap = 0
        elif start is not None:
            gap += 1
            if gap >= min_gap:
                spans.append((start, x - gap + 1))
                start, gap = None, 0
    if start is not None:
        spans.append((start, len(cols)))
    return [s for s in spans if s[1] - s[0] >= min_width]


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    opts = dict(a[2:].split('=', 1) for a in sys.argv[1:] if a.startswith('--') and '=' in a)
    sheet, name = args[0], args[1]
    out = args[2] if len(args) > 2 else 'refs'
    os.makedirs(out, exist_ok=True)
    im = Image.open(sheet).convert('RGB')
    session = new_session('isnet-general-use')
    cut = remove(im, session=session)
    a = np.array(cut.getchannel('A')).astype(np.uint8)
    a[a < 40] = 0
    cut.putalpha(Image.fromarray(a))
    spans = figures(a)
    views = ['front', 'side', 'back'] if len(spans) == 3 else ['front', 'left', 'right', 'back'][: len(spans)] if len(spans) == 4 else [f'view{i}' for i in range(len(spans))]
    if len(spans) == 1:
        views = ['front']
    front_box = None
    for (x0, x1), view in zip(spans, views):
        part = cut.crop((x0, 0, x1, im.height))
        bb = part.getchannel('A').point(lambda v: 255 if v > 0 else 0).getbbox()
        part = part.crop(bb)
        if view == 'front':
            front_box = (x0 + bb[0], bb[1], x0 + bb[2], bb[3])
        part.save(f'{out}/{name}-{view}.png')
        w, h = part.size
        s = int(max(w, h) * 1.1)
        bg = Image.new('RGB', (s, s), (255, 255, 255))
        bg.paste(part, ((s - w) // 2, (s - h) // 2), part)
        bg.resize((1024, 1024), Image.LANCZOS).save(f'{out}/{name}-{view}.jpg', quality=92)
        print(view, (x0, x1), 'size', part.size)
    # token portrait: the top ~30% of the front figure, square, centred on the head
    if 'portrait' in opts:
        box = tuple(int(v) for v in opts['portrait'].split(','))
    elif front_box:
        fx0, fy0, fx1, fy1 = front_box
        fh = fy1 - fy0
        side = int(fh * 0.34)
        top = cut.crop((fx0, fy0, fx1, fy0 + int(fh * 0.12))).getchannel('A')
        hb = top.getbbox() or (0, 0, fx1 - fx0, 1)
        cx = fx0 + (hb[0] + hb[2]) // 2
        box = (cx - side // 2, fy0 - int(side * 0.08), cx + side // 2, fy0 - int(side * 0.08) + side)
    else:
        return
    canvas = Image.new('RGBA', (im.width + 2000, im.height + 2000), (0, 0, 0, 0))
    canvas.paste(cut, (1000, 1000))
    p = canvas.crop((box[0] + 1000, box[1] + 1000, box[2] + 1000, box[3] + 1000)).resize((256, 256), Image.LANCZOS)
    os.makedirs('public/library/portraits', exist_ok=True)
    p.save(f'public/library/portraits/{name}.webp', quality=86, method=6)
    print('portrait box', box, '-> public/library/portraits/%s.webp' % name)


if __name__ == '__main__':
    main()
