// Profile pictures on this device: kept in IndexedDB (localStorage is far too small for pictures),
// and shrunk before they are sent so they travel quickly to every phone.

const DB = 'lairlabs-images';
const STORE = 'images';
let dbp: Promise<IDBDatabase | null> | null = null;

function db(): Promise<IDBDatabase | null> {
  if (dbp) return dbp;
  dbp = new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
  return dbp;
}

export async function putImage(id: string, data: string): Promise<void> {
  const d = await db();
  if (!d) return;
  await new Promise<void>((resolve) => {
    try {
      const tx = d.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(data, id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

export async function getImages(ids: string[]): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  const d = await db();
  if (!d || !ids.length) return out;
  await new Promise<void>((resolve) => {
    try {
      const tx = d.transaction(STORE, 'readonly');
      const st = tx.objectStore(STORE);
      for (const id of ids) {
        const r = st.get(id);
        r.onsuccess = () => typeof r.result === 'string' && out.set(id, r.result);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
  return out;
}

function loadImage(file: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("That file isn't a picture this phone can open. Try a JPEG or PNG."));
    };
    img.src = url;
  });
}

/** Shrink a picture from the camera roll to a JPEG data URL that fits the table's limit. */
export async function shrinkPicture(file: Blob, maxSide: number): Promise<string> {
  const img = await loadImage(file);
  let side = maxSide;
  for (let attempt = 0; attempt < 5; attempt++) {
    const scale = Math.min(1, side / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const g = c.getContext('2d')!;
    g.fillStyle = '#201b15'; // transparent PNGs get the app's background, not black
    g.fillRect(0, 0, w, h);
    g.drawImage(img, 0, 0, w, h);
    const data = c.toDataURL('image/jpeg', attempt < 2 ? 0.84 : 0.72);
    if (data.length < 700_000) return data;
    side = Math.round(side * 0.75);
  }
  throw new Error('That picture is too big to send.');
}
