// Downloads the 3D models listed in public/models/remote.json into public/models/ before the build,
// so the app serves them from its own site. Already-present files are kept. A failed download only warns
// (the figure then falls back to its built-in stand-in), so builds never break over a model.
import { readFile, writeFile, stat } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'models');
const list = JSON.parse(await readFile(join(dir, 'remote.json'), 'utf8'));
for (const [name, url] of Object.entries(list)) {
  if (name.startsWith('_') || !/^[\w.-]+\.glb$/.test(name)) continue;
  const out = join(dir, name);
  try { if ((await stat(out)).size > 0) continue; } catch {}
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.subarray(0, 4).toString() !== 'glTF') throw new Error('not a GLB file');
    await writeFile(out, buf);
    console.log(`models: ${name} (${(buf.length / 1048576).toFixed(1)} MB)`);
  } catch (e) {
    console.warn(`models: could not fetch ${name}: ${e.message}`);
  }
}
