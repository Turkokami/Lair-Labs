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
4. Rig in house, always. Never Tripo for Lair Labs rigging, even though it is cheap: he said "we rig in house ourselves".
   Use what is already in the studio's data bank, in this order:
   - `battle_rig` (free, no GPU): template `biped_a`, `turn` so the model faces +z, `save: true`. It gives a humanoid
     skeleton (Hip ... Hand, Thigh ... ToeBase), skin weights and a stock move set (idle, walk, arc swipe, sword slash,
     hurt, hit react, knockdown, fall and more). This is how the Skeleton Knight was done.
   - `transfer_rig` (free, no GPU) once a model has a humanoid rig: copies Rook's idle/walk/run/jump onto it.
   - `rig_model` engine `unirig` when the studio GPU is online (GPU time only).
   - `save_animation_code` for any extra clip.
5. Clean the weights and moves before shipping (scripts kept in the task notes, Python + numpy):
   - Weight a held shield fully to its forearm and a sword fully to its hand, and cut the few triangles that weld
     them to legs or body (Trellis welds everything into one piece, so otherwise the sword or shield drags skin
     sheets along).
   - Move boot vertices that the auto rig gave to Hip onto the nearest calf or foot, and fold ToeBase into Foot,
     or the feet smear when walking.
   - Keep exactly five animations named idle, walk, attack, hurt, die. Pick moves that start and end near the idle
     pose (for the knight: arc swipe trimmed to 1.7 s as attack, hurt trimmed to 1.3 s), and make die by tipping
     Hip back about 86 degrees and lowering it so the body lies on the ground.
   - Check it with `gltf-validator` (0 errors) and look at stills of each move before pushing.
6. Save the GLB as `public/models/<name>.glb` and add
   `registerFigureGLTF('<name>', '/models/<name>.glb', { height: 1.7 })` in `registerCustomModels()` in `src/view3d/custom-models.ts`
   (height in squares; 1 square = 5 ft; turn with `yaw` if it faces the wrong way).

## Cost per monster

- Steps 1 and 2: nothing.
- Step 3: GPU time only. The studio's A40 costs $0.59 an hour; a model, clean-up and rig should take well under an hour, so a few cents to about 50¢ each, plus start-up time. Batch several sheets in one GPU session and switch it off after.
- No paid engines (Tripo, Replicate) unless he says yes for Lair Labs. Rigging is never paid: it is always done in house.

## Check before shipping

`npm test` and `npm run build`, then push to `main` (Vercel deploys it).
