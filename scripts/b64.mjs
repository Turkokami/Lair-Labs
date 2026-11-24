// Temporary: copy a model as base64 text so it can be read back as text. Not for main.
import fs from 'node:fs';
const url = 'https://ocejqvdipitcrjfy.public.blob.vercel-storage.com/models/mwtza6cg-battle-rig-rnd_c4bd37f529a2458c-mwtza5nx-VdAIWFBdHt4IJNVtBJNfuMwMiQg2q3.glb';
const r = await fetch(url);
const b = Buffer.from(await r.arrayBuffer());
fs.mkdirSync('public/tmp', { recursive: true });
fs.writeFileSync('public/tmp/sk-rig.b64.txt', b.toString('base64'));
console.log('b64 bytes', b.length);
