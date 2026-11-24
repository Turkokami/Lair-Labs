// Renders code-drawn objects and creature tokens to bitmaps and caches them per size, variant and rotation,
// so the map can draw hundreds of them every frame on a phone.
import type { CreatureDef, DrawArgs, ObjDef } from './types';
import { FAMILY_RING } from './types';
import { shade, alpha } from './kit';

type AnyCanvas = HTMLCanvasElement;
let factory: (w: number, h: number) => AnyCanvas = (w, h) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
};
/** The art checker swaps in @napi-rs/canvas here. */
export function setCanvasFactory(f: (w: number, h: number) => unknown) {
  factory = f as (w: number, h: number) => AnyCanvas;
}

const BUCKETS = [24, 40, 64, 96, 140, 200, 280];
export const pxBucket = (needed: number) => BUCKETS.find((b) => b >= needed) ?? BUCKETS[BUCKETS.length - 1];

function args(g: CanvasRenderingContext2D, w: number, h: number, def: { c: Record<string, string>; variants?: { c: Record<string, string>; f?: Record<string, number> }[] }, variant: number, seed: number): DrawArgs {
  const v = def.variants?.[variant];
  return { g, w, h, c: { ...def.c, ...(v?.c ?? {}) }, f: { ...(v?.f ?? {}) }, seed };
}

export interface Sprite { canvas: AnyCanvas; /** offset from the object's centre to the bitmap's top-left, in px */ ox: number; oy: number; px: number; }
const cache = new Map<string, Sprite>();
let cacheBytes = 0;
const MAX_BYTES = 64 * 1024 * 1024;

// Picture portraits (a creature or variant with `portrait`): loaded once, then drawn in place of the code art. Until
// the picture arrives the drawing stands in and that sprite is not kept, so the next draw picks up the picture.
const pictures = new Map<string, HTMLImageElement | null>();
const pictureListeners = new Set<() => void>();
/** Call `f` whenever a portrait picture finishes loading (redraw the map or thumbnail). Returns an unsubscribe. */
export function onPortraitsLoaded(f: () => void) {
  pictureListeners.add(f);
  return () => pictureListeners.delete(f);
}
function picture(url: string): HTMLImageElement | null {
  if (typeof Image === 'undefined') return null;
  const have = pictures.get(url);
  if (have !== undefined) return have;
  pictures.set(url, null);
  const im = new Image();
  im.decoding = 'async';
  im.onload = () => {
    pictures.set(url, im);
    for (const k of [...cache.keys()]) if (k.startsWith('t|')) cache.delete(k);
    for (const f of pictureListeners) f();
  };
  im.src = url;
  return null;
}
/** The portrait picture a token uses, if any (a variant's own wins over the creature's). */
export const portraitFor = (def: CreatureDef, variant: number): string | undefined => def.variants?.[variant]?.portrait ?? def.portrait;

function remember(k: string, s: Sprite) {
  cacheBytes += s.canvas.width * s.canvas.height * 4;
  if (cacheBytes > MAX_BYTES) {
    cache.clear();
    cacheBytes = s.canvas.width * s.canvas.height * 4;
  }
  cache.set(k, s);
  return s;
}

/**
 * An object drawn at `px` pixels per square, rotated by `rot` degrees about its centre, with its drop shadow.
 * `seed` should be small (0-3) so instances share bitmaps.
 */
export function objectSprite(def: ObjDef, variant: number, px: number, rot: number, seed: number): Sprite {
  const k = `o|${def.id}|${variant}|${px}|${rot}|${seed}`;
  const hit = cache.get(k);
  if (hit) return hit;
  const S = px / 100;
  const bw = Math.ceil(def.w * px), bh = Math.ceil(def.h * px);
  // 1. the art itself, unrotated
  const pad = Math.ceil(px * 0.04);
  const art = factory(bw + pad * 2, bh + pad * 2);
  const ag = art.getContext('2d')!;
  ag.translate(pad, pad);
  ag.scale(S, S);
  try {
    def.draw(args(ag, def.w * 100, def.h * 100, def, variant, seed * 7919 + 13));
  } catch (e) {
    console.warn('object art failed', def.id, e);
  }
  // 2. rotate and add the shadow
  const rad = (rot * Math.PI) / 180;
  const cos = Math.abs(Math.cos(rad)), sin = Math.abs(Math.sin(rad));
  const aw = art.width, ah = art.height;
  const sh = def.flat || def.layer === 'floor' ? 0 : Math.max(2, px * 0.07);
  const ow = Math.ceil(aw * cos + ah * sin + sh * 3), oh = Math.ceil(aw * sin + ah * cos + sh * 3);
  const out = factory(ow, oh);
  const og = out.getContext('2d')!;
  og.translate(ow / 2, oh / 2);
  if (sh) {
    og.shadowColor = 'rgba(0,0,0,0.5)';
    og.shadowBlur = sh;
    og.shadowOffsetX = sh * 0.45;
    og.shadowOffsetY = sh * 0.7;
  }
  og.rotate(rad);
  og.drawImage(art as unknown as CanvasImageSource, -aw / 2, -ah / 2);
  return remember(k, { canvas: out, ox: -ow / 2, oy: -oh / 2, px });
}

/** A round token: background, portrait clipped to a circle, and a ring. `diam` in px. */
export function tokenSprite(def: CreatureDef, variant: number, diam: number, ring?: string): Sprite {
  const k = `t|${def.id}|${variant}|${diam}|${ring ?? ''}`;
  const hit = cache.get(k);
  if (hit) return hit;
  const pad = Math.ceil(diam * 0.08);
  const size = diam + pad * 2;
  const out = factory(size, size);
  const g = out.getContext('2d')!;
  const r = diam / 2, cx = size / 2, cy = size / 2;
  const ringCol = ring ?? FAMILY_RING[def.family];
  // drop shadow under the base
  g.save();
  g.shadowColor = 'rgba(0,0,0,0.55)';
  g.shadowBlur = diam * 0.06;
  g.shadowOffsetX = diam * 0.025;
  g.shadowOffsetY = diam * 0.045;
  g.beginPath();
  g.arc(cx, cy, r, 0, Math.PI * 2);
  g.fillStyle = '#111';
  g.fill();
  g.restore();
  // background
  g.save();
  g.beginPath();
  g.arc(cx, cy, r * 0.9, 0, Math.PI * 2);
  g.clip();
  const bg = g.createRadialGradient(cx - r * 0.3, cy - r * 0.4, r * 0.1, cx, cy, r);
  bg.addColorStop(0, shade(ringCol, -0.25));
  bg.addColorStop(1, shade(ringCol, -0.78));
  g.fillStyle = bg;
  g.fillRect(cx - r, cy - r, diam, diam);
  // portrait
  g.translate(cx - r * 0.9, cy - r * 0.9);
  g.scale((r * 1.8) / 100, (r * 1.8) / 100);
  const purl = portraitFor(def, variant);
  const pic = purl ? picture(purl) : null;
  try {
    if (pic) g.drawImage(pic, 0, 0, 100, 100);
    else def.draw(args(g, 100, 100, def, variant, 4242));
  } catch (e) {
    console.warn('token art failed', def.id, e);
  }
  g.restore();
  // inner shade so the ring sits on it
  g.save();
  g.beginPath();
  g.arc(cx, cy, r * 0.9, 0, Math.PI * 2);
  g.clip();
  const vg = g.createRadialGradient(cx, cy, r * 0.6, cx, cy, r * 0.92);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.45)');
  g.fillStyle = vg;
  g.fillRect(cx - r, cy - r, diam, diam);
  g.restore();
  // ring
  const rg = g.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  rg.addColorStop(0, shade(ringCol, 0.45));
  rg.addColorStop(0.5, ringCol);
  rg.addColorStop(1, shade(ringCol, -0.45));
  g.beginPath();
  g.arc(cx, cy, r * 0.95, 0, Math.PI * 2);
  g.strokeStyle = rg;
  g.lineWidth = r * 0.12;
  g.stroke();
  g.beginPath();
  g.arc(cx, cy, r * 0.99, 0, Math.PI * 2);
  g.strokeStyle = alpha('#000000', 0.7);
  g.lineWidth = Math.max(1, r * 0.03);
  g.stroke();
  const sprite = { canvas: out, ox: -size / 2, oy: -size / 2, px: diam };
  return purl && !pic ? sprite : remember(k, sprite);
}

export function clearSpriteCache() {
  cache.clear();
  cacheBytes = 0;
}
