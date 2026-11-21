// Loads the floor pictures from /library/floors once, for the scene renderer.
import type { FloorArt } from './scene';

export interface LibraryIndex {
  license: string;
  maps: LibraryEntry[];
  rooms: LibraryEntry[];
  materials: { id: string; name: string; color: string; squares: number }[];
}
export interface LibraryEntry { id: string; name: string; cols: number; rows: number; ambient: string; description: string; setting: string; tags: string[]; rooms: number; encounters: number; }

let indexP: Promise<LibraryIndex> | null = null;
export function libraryIndex(): Promise<LibraryIndex> {
  if (!indexP) indexP = fetch('/library/index.json').then((r) => (r.ok ? r.json() : Promise.reject(new Error('no library'))));
  return indexP;
}

const imgs = new Map<string, HTMLImageElement>();
const squares = new Map<string, number>();
const listeners = new Set<() => void>();

export function onFloorsLoaded(f: () => void) {
  listeners.add(f);
  return () => listeners.delete(f);
}

let started = false;
function start() {
  if (started || typeof Image === 'undefined') return;
  started = true;
  libraryIndex()
    .then((idx) => {
      for (const m of idx.materials) {
        squares.set(m.id, m.squares || 4);
        const im = new Image();
        im.decoding = 'async';
        im.onload = () => {
          imgs.set(m.id, im);
          for (const f of listeners) f();
        };
        im.src = `/library/floors/${m.id}.webp`;
      }
    })
    .catch(() => {});
}

export const browserFloors: FloorArt = {
  image(id) {
    start();
    return imgs.get(id);
  },
  squares(id) {
    return squares.get(id) ?? 4;
  },
};
