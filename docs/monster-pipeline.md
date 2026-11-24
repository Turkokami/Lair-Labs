# Concept sheet to in-game monster

The steps for turning one character sheet (front / side / back on a plain background) into a placeable Lair Labs monster. Skeleton Knight was the first one through.

## 1. Split the sheet (free, runs anywhere)

```
pip install "rembg[cpu]" pillow numpy
python3 scripts/monster_sheet.py sheet.png <monster-name> [out_dir]
```

- Cuts out the background, finds each figure by the gaps between them, and saves
  `<out>/<name>-front.jpg`, `-side.jpg`, `-back.jpg` (or front/left/right/back for 4 figures),
  1024 px square on white, plus transparent `.png` copies.
- Writes the token picture `public/library/portraits/<name>.webp` (head and shoulders of the front view).
  If the crop is off, pass `--portrait=x0,y0,x1,y1` (fractions of the front figure).

## 2. Stat block and token (free)

- Stat block: add an `own({...})` entry in `src/rules/monsters.ts` (source `lair-labs`). Original wording, SRD 5.2 mechanics.
- Token: in `src/library/creatures/*.ts`, give the creature (or one variant) `portrait: '/library/portraits/<name>.webp'`.
  The token shows the drawing until the picture loads. The stat block id in camelCase links to the creature id in kebab case.

## 3. 3D model (Squatch Studio, GPU time only)

1. Upload the view JPGs where Squatch Studio can fetch them (a public URL), then `import_media_from_url`.
2. `make_3d_model` engine `hy3d_local`, refs with roles front / left (side) / back.
3. `make_game_ready`: about 12-15k triangles, 1024 textures.
4. `rig_model` engine `unirig` (free; Tripo rigging costs credits).
5. `model_skeleton`, then `save_animation_code` for clips named idle, walk, attack, hurt, die.
6. Save the GLB as `public/models/<name>.glb` and add
   `registerFigureGLTF('<name>', '/models/<name>.glb', { height: 1.7 })` in `registerCustomModels()` in `src/view3d/custom-models.ts`
   (height in squares; 1 square = 5 ft; turn with `yaw` if it faces the wrong way).

## Cost per monster

- Steps 1 and 2: nothing.
- Step 3: GPU time only. The studio's A40 costs $0.59 an hour; a model, clean-up and rig should take well under an hour, so a few cents to about 50¢ each, plus start-up time. Batch several sheets in one GPU session and switch it off after.
- No paid engines (Tripo, Replicate) unless he says yes for Lair Labs.

## Check before shipping

`npm test` and `npm run build`, then push to `main` (Vercel deploys it).
