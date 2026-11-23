import { describe, it, expect } from 'vitest';
import { OBJECTS, objectById } from '../src/library/objects';
import { ITEM_OBJECTS } from '../src/library/objects/items';
import { ITEM_MODELS } from '../src/view3d/models-items';
import { Kit } from '../src/view3d/kit';
import type { Prop } from '../src/engine/map';

/** A 2D context stand-in: every method is a no-op, gradients and patterns take colour stops. */
const stubCtx = () => {
  const grad = { addColorStop() {} };
  const store: Record<string | symbol, unknown> = {};
  return new Proxy(store, {
    get(t, k) {
      if (k in t) return t[k];
      if (k === 'createLinearGradient' || k === 'createRadialGradient' || k === 'createConicGradient' || k === 'createPattern') return () => grad;
      if (k === 'measureText') return () => ({ width: 10 });
      if (k === 'getTransform') return () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 });
      return () => {};
    },
    set(t, k, v) { t[k] = v; return true; },
  }) as unknown;
};

const rng = (s: number) => () => ((s = (s * 16807) % 2147483647) / 2147483647);

describe('items pack', () => {
  it('has unique ids that no other set shadows', () => {
    const ids = ITEM_OBJECTS.map((o) => o.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const o of ITEM_OBJECTS) expect(objectById(o.id)).toBe(o);
    expect(OBJECTS.filter((o) => ids.includes(o.id)).length).toBe(ids.length);
  });
  it('gives every object a name, tags and a GM note', () => {
    for (const o of ITEM_OBJECTS) {
      expect(o.name, o.id).toBeTruthy();
      expect(o.desc, o.id).toBeTruthy();
      expect(o.tags?.length ?? 0, o.id).toBeGreaterThan(0);
    }
  });
  it('keeps traps hidden from players', () => {
    for (const o of ITEM_OBJECTS.filter((o) => o.cat === 'trap')) expect(o.gmOnly, o.id).toBe(true);
  });
  it('draws every variant without throwing', () => {
    for (const o of ITEM_OBJECTS)
      for (let v = 0; v < Math.max(1, o.variants?.length ?? 0); v++) {
        const vr = o.variants?.[v];
        const c = { ...(o.c ?? {}), ...(vr?.c ?? {}) };
        expect(() => o.draw({ g: stubCtx() as never, w: o.w * 100, h: o.h * 100, c, f: vr?.f ?? {}, seed: 7 } as never), `${o.id} #${v}`).not.toThrow();
      }
  });
  it('has a 3D model for every object, and each builds for every variant', () => {
    for (const o of ITEM_OBJECTS) {
      const m = ITEM_MODELS[o.id];
      expect(m, o.id).toBeTypeOf('function');
      for (let v = 0; v < Math.max(1, o.variants?.length ?? 0); v++) {
        const k = new Kit();
        const cols = { ...(o.c ?? {}), ...(o.variants?.[v]?.c ?? {}) } as Record<string, string>;
        const p = { kind: o.id, v } as unknown as Prop;
        expect(() => m(k, { x: 5, z: 5, ry: 0.5 }, o.w, o.h, rng(3), (key: string, def: string) => cols[key] ?? def, p), `${o.id} #${v}`).not.toThrow();
      }
    }
  });
});
