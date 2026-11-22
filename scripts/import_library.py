#!/usr/bin/env python3
"""Turn the Lair Labs map library (lairlabs.map v1 files) into the app's own map format.

Usage: python3 scripts/import_library.py /mnt/project-files/lair-labs/map-library

Writes public/library/index.json, public/library/maps/<id>.json, public/library/rooms/<id>.json
and public/library/floors/<material>.webp. Everything in the library is original Lair Labs work
(licence LairLabs-Original), so it ships with the app.
"""
import json
import os
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "library"

# Terrain from the library becomes our cell codes: 1 floor, 2 water, 3 difficult, 4 pit.
TERRAIN = {
    "water-shallow": (2, "water-shallow"),
    "water-deep": (2, "water-deep"),
    "rubble": (3, None),  # keeps the floor under it; the renderer adds rubble on top
    "mud": (3, "mud"),
    "lava": (3, "lava"),
    "pit": (4, "pit"),
    "ice": (1, "ice"),
}

KIND = {"window": "window", "bars": "bars", "low-wall": "low", "ethereal": "ethereal"}


def hkey(x, y):
    return f"h:{x},{y}"


def vkey(x, y):
    return f"v:{x},{y}"


def convert(src: dict) -> dict:
    g = src["grid"]
    cols, rows = g["cols"], g["rows"]
    legend = src["floor"]["legend"]
    cells = [0] * (cols * rows)
    mats = [""] * (cols * rows)
    for y, row in enumerate(src["floor"]["rows"]):
        for x, ch in enumerate(row):
            if ch != ".":
                cells[y * cols + x] = 1
                mats[y * cols + x] = legend.get(ch, "stone-flagstone")
    for t in src.get("terrain", []):
        code, mat = TERRAIN.get(t["type"], (1, None))
        for rx, ry, rw, rh in t["rects"]:
            for y in range(ry, ry + rh):
                for x in range(rx, rx + rw):
                    if 0 <= x < cols and 0 <= y < rows and cells[y * cols + x]:
                        cells[y * cols + x] = code
                        if mat:
                            mats[y * cols + x] = mat

    def floor(x, y):
        return 0 <= x < cols and 0 <= y < rows and cells[y * cols + x] > 0

    walls, wall_kinds = set(), {}
    style_count = {}
    for w in src.get("walls", []):
        segs = w["segments"]
        integer = all(float(v).is_integer() for s in segs for v in s)
        if w["kind"] == "wall":
            style_count[w["style"]] = style_count.get(w["style"], 0) + sum(abs(s[2] - s[0]) + abs(s[3] - s[1]) for s in segs)
        if not integer:
            continue  # smooth cave outlines: the floor edge already gives these walls
        for x1, y1, x2, y2 in segs:
            x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
            edges = []
            if y1 == y2:
                for x in range(min(x1, x2), max(x1, x2)):
                    edges.append((hkey(x, y1), (x, y1 - 1), (x, y1)))
            elif x1 == x2:
                for y in range(min(y1, y2), max(y1, y2)):
                    edges.append((vkey(x1, y), (x1 - 1, y), (x1, y)))
            for k, a, b in edges:
                if w["kind"] in KIND:
                    wall_kinds[k] = KIND[w["kind"]]
                if floor(*a) and floor(*b) and w["kind"] != "low-wall":
                    walls.add(k)

    wall_style = max(style_count, key=style_count.get) if style_count else "stone"

    # Doors run through the middle of a doorway square. We put each one on the side of that square
    # that faces the bigger space, so it sits in the room's wall line.
    def roomness(x, y):
        return sum(floor(x + dx, y + dy) for dx in (-1, 0, 1) for dy in (-1, 0, 1))

    doors, door_styles = {}, {}
    for d in src.get("doors", []):
        state = "secret" if d.get("secret") else "locked" if d.get("locked") else d.get("state", "closed")
        if state not in ("closed", "open", "locked", "secret"):
            state = "closed"
        keys = []
        if d["x1"] == d["x2"]:  # vertical door line at x = k + 0.5 across rows
            k = int(d["x1"] - 0.5) if not float(d["x1"]).is_integer() else int(d["x1"])
            for y in range(int(min(d["y1"], d["y2"])), int(max(d["y1"], d["y2"]))):
                if float(d["x1"]).is_integer():
                    keys.append(vkey(k, y))
                else:
                    left = roomness(k - 1, y) if floor(k - 1, y) else -1
                    right = roomness(k + 1, y) if floor(k + 1, y) else -1
                    keys.append(vkey(k, y) if left >= right else vkey(k + 1, y))
        else:  # horizontal door line at y = k + 0.5 across columns
            k = int(d["y1"] - 0.5) if not float(d["y1"]).is_integer() else int(d["y1"])
            for x in range(int(min(d["x1"], d["x2"])), int(max(d["x1"], d["x2"]))):
                if float(d["y1"]).is_integer():
                    keys.append(hkey(x, k))
                else:
                    up = roomness(x, k - 1) if floor(x, k - 1) else -1
                    down = roomness(x, k + 1) if floor(x, k + 1) else -1
                    keys.append(hkey(x, k) if up >= down else hkey(x, k + 1))
        for key in keys:
            doors[key] = state
            door_styles[key] = d.get("sprite", "door-wood")
            walls.discard(key)

    # Lights that belong to a prop come from the object itself in the app; free lights stay.
    lights = [
        {"id": l["id"], "x": l["x"], "y": l["y"], "bright": l["bright"], "dim": l["dim"], "color": l.get("color", "#ffd8a0")}
        for l in src.get("lights", [])
        if not l.get("source")
    ]
    props = []
    for p in src.get("props", []):
        o = {"id": p["id"], "kind": p["prop"], "x": p["x"], "y": p["y"], "rot": int(p.get("rotation", 0)) % 360}
        if p.get("gmOnly"):
            o["gmOnly"] = True
        props.append(o)
    notes = []
    for i, n in enumerate(src.get("notes", [])):
        notes.append({"id": f"n{i + 1}", "x": n["x"], "y": n["y"], "text": n["text"], **({"gmOnly": True} if n.get("gmOnly", True) else {})})
    for i, l in enumerate(src.get("links", [])):
        to = l.get("to") or {}
        notes.append({"id": f"l{i + 1}", "x": l["x"], "y": l["y"], "text": f"{l['label']} (to {to.get('map', 'another map')})", "gmOnly": True})
    rooms = []
    for r in src.get("rooms", []):
        rooms.append({k: v for k, v in {
            "id": r["id"], "name": r["name"], "rects": r["cells"], "readAloud": r.get("readAloud"), "gmNotes": r.get("gmNotes"),
            "labelAt": r.get("labelAt"),
        }.items() if v is not None})
    encounters = [
        {"name": e["name"], "area": e["area"], "trigger": e.get("trigger", "manual"), "difficulty": e.get("difficulty", "medium"), "monsters": e["monsters"]}
        for e in src.get("encounters", [])
    ]
    theme = "cave" if wall_style == "cave" else "wood" if wall_style in ("wood", "brick") else "stone"
    out = {
        "id": src["id"], "name": src["name"], "cols": cols, "rows": rows, "theme": theme,
        "cells": cells, "walls": sorted(walls), "doors": doors, "props": props, "notes": notes,
        "mats": mats, "wallStyle": wall_style, "wallKinds": wall_kinds, "doorStyles": door_styles,
        "ambient": src.get("ambientLight", "bright"), "lights": lights, "rooms": rooms, "encounters": encounters,
    }
    if src.get("playerStart"):
        out["playerStart"] = src["playerStart"]
    if src.get("connectors"):
        out["connectors"] = src["connectors"]
    return out


def main(lib: Path):
    meta = json.loads((lib / "library.json").read_text())
    (OUT / "maps").mkdir(parents=True, exist_ok=True)
    (OUT / "rooms").mkdir(parents=True, exist_ok=True)
    (OUT / "floors").mkdir(parents=True, exist_ok=True)
    index = {"license": "LairLabs-Original: original work made for Lair Labs. No third-party art.", "maps": [], "rooms": [], "materials": []}
    # keep the outdoor samples made by scripts/make_outdoor_samples.mts
    prev = OUT / "index.json"
    kept = [m for m in json.loads(prev.read_text()).get("maps", []) if m.get("generated")] if prev.exists() else []
    for kind, folder in (("maps", "maps"), ("rooms", "rooms")):
        for f in sorted((lib / folder).glob("*.json")):
            src = json.loads(f.read_text())
            m = convert(src)
            (OUT / folder / f.name).write_text(json.dumps(m, separators=(",", ":")))
            index[kind].append({
                "id": m["id"], "name": m["name"], "cols": m["cols"], "rows": m["rows"], "ambient": m["ambient"],
                "description": src.get("description", ""), "setting": src.get("setting", ""), "tags": src.get("tags", []),
                "rooms": len(m["rooms"]), "encounters": len(m["encounters"]),
            })
    for mat in meta["materials"]:
        mid = mat["id"] if isinstance(mat, dict) else mat
        png = lib / "art" / "floors" / f"{mid}.png"
        if not png.exists():
            continue
        im = Image.open(png).convert("RGB")
        sq = (mat.get("textureSquares", 4) if isinstance(mat, dict) else 4)
        im = im.resize((96 * sq, 96 * sq), Image.LANCZOS)  # 96 px per square is plenty on a phone
        im.save(OUT / "floors" / f"{mid}.webp", "WEBP", quality=82, method=6)
        avg = im.resize((1, 1), Image.LANCZOS).getpixel((0, 0))
        index["materials"].append({
            "id": mid, "name": (mat.get("name") if isinstance(mat, dict) else None) or mid.replace("-", " ").capitalize(),
            "color": "#%02x%02x%02x" % avg, "squares": sq,
        })
    index["maps"] += kept
    (OUT / "index.json").write_text(json.dumps(index, indent=1))
    print(f"{len(index['maps'])} maps, {len(index['rooms'])} rooms, {len(index['materials'])} floors")


if __name__ == "__main__":
    main(Path(sys.argv[1] if len(sys.argv) > 1 else "/mnt/project-files/lair-labs/map-library"))
