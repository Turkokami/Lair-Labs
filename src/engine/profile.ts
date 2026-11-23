// Character profiles: a picture, a gallery, the story and the stats of every hero, NPC and monster at the table.
// Pictures live apart from the game state (by id), so the views phones get stay small.

export type ProfileKind = 'pc' | 'npc' | 'monster';

export interface ProfileImage { id: string; caption?: string }

/** A hand-written stat block, for NPCs and monsters (heroes get theirs from the sheet). */
export interface ProfileStats {
  race?: string;
  role?: string;
  level?: string;
  ac?: string;
  hp?: string;
  speed?: string;
  /** STR, DEX, CON, INT, WIS, CHA */
  abilities?: number[];
  saves?: string;
  skills?: string;
  senses?: string;
  languages?: string;
  traits?: string;
  actions?: string;
}

export interface Profile {
  id: string;
  kind: ProfileKind;
  name: string;
  /** "the Ashen Knight", "innkeeper of the Gilded Goose" */
  title?: string;
  portrait?: string;
  gallery: ProfileImage[];
  /** Short facts: pronouns, age, height and the rest (see INFO_FIELDS). */
  info: Record<string, string>;
  /** Longer writing: backstory, personality and the rest (see STORY_FIELDS). */
  story: Record<string, string>;
  /** Treasures, keepsakes and anything else carried, one per line. */
  inventory?: string;
  stats?: ProfileStats;
  /** Seen by the hero's player and the GM only. */
  secrets?: string;
  /** Seen by the GM only. */
  gmNotes?: string;
  /** NPCs and monsters: players can open the profile. */
  shared?: boolean;
  /** NPCs and monsters: players also see the stat block. */
  shareStats?: boolean;
  updated: number;
  /** Heroes only, filled in by the table from the character sheet so everyone can read the basics. */
  sheet?: ProfileSheet;
}

/** The basics of a hero's sheet, for other players reading the profile. */
export interface ProfileSheet { line: string; level: number; abilities: number[]; ac: number; maxHp: number; speed: number; skills: string[]; gear: string[] }

export const INFO_FIELDS: { id: string; label: string }[] = [
  { id: 'pronouns', label: 'Pronouns' },
  { id: 'age', label: 'Age' },
  { id: 'height', label: 'Height' },
  { id: 'weight', label: 'Weight' },
  { id: 'eyes', label: 'Eyes' },
  { id: 'hair', label: 'Hair' },
  { id: 'skin', label: 'Skin' },
  { id: 'alignment', label: 'Alignment' },
  { id: 'faith', label: 'Faith or deity' },
  { id: 'homeland', label: 'Homeland' },
  { id: 'occupation', label: 'Occupation' },
  { id: 'languages', label: 'Languages' },
];

export const STORY_FIELDS: { id: string; label: string; hint: string; big?: boolean }[] = [
  { id: 'appearance', label: 'Appearance', hint: 'What people notice first.' },
  { id: 'backstory', label: 'Background and history', hint: 'Where they come from and what happened to them.', big: true },
  { id: 'personality', label: 'Personality', hint: 'How they act, talk and carry themselves.' },
  { id: 'ideals', label: 'Ideals', hint: 'What they believe in.' },
  { id: 'bonds', label: 'Bonds', hint: 'People, places and things they hold dear.' },
  { id: 'flaws', label: 'Flaws', hint: 'What gets them in trouble.' },
  { id: 'goals', label: 'Goals', hint: 'What they want next.' },
  { id: 'allies', label: 'Allies and organizations', hint: 'Friends, rivals, guilds, orders.' },
  { id: 'notes', label: 'Other notes', hint: 'Anything else.' },
];

export const LIMITS = { name: 60, title: 100, info: 120, story: 20000, inventory: 4000, secrets: 8000, gmNotes: 8000, gallery: 24, caption: 140, statText: 3000, imageChars: 900_000 };

const IMG_ID = /^im_[a-z0-9]{4,32}$/;
export const isImageId = (s: unknown): s is string => typeof s === 'string' && IMG_ID.test(s);
/** A picture a phone may send: a base64 data URL of an ordinary image type, not too big. */
export function validImageData(d: unknown): d is string {
  return typeof d === 'string' && d.length <= LIMITS.imageChars && /^data:image\/(jpeg|png|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(d);
}

export function blankProfile(id: string, kind: ProfileKind, name: string): Profile {
  return { id, kind, name, gallery: [], info: {}, story: {}, updated: Date.now() };
}

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max) : undefined);
function textMap(v: unknown, keys: string[], max: number): Record<string, string> {
  const out: Record<string, string> = {};
  if (!v || typeof v !== 'object') return out;
  for (const k of keys) {
    const s = str((v as Record<string, unknown>)[k], max);
    if (s && s.trim()) out[k] = s;
  }
  return out;
}
function cleanStats(v: unknown): ProfileStats | undefined {
  if (!v || typeof v !== 'object') return undefined;
  const o = v as Record<string, unknown>;
  const s: ProfileStats = {};
  for (const k of ['race', 'role', 'level', 'ac', 'hp', 'speed'] as const) {
    const x = str(o[k], LIMITS.info);
    if (x) s[k] = x;
  }
  for (const k of ['saves', 'skills', 'senses', 'languages', 'traits', 'actions'] as const) {
    const x = str(o[k], LIMITS.statText);
    if (x) s[k] = x;
  }
  if (Array.isArray(o.abilities) && o.abilities.length === 6) s.abilities = o.abilities.map((n) => Math.max(1, Math.min(30, Math.round(Number(n) || 10))));
  return Object.keys(s).length ? s : undefined;
}

/**
 * Tidy a profile a phone sent: drop unknown fields, cap lengths, keep only picture ids the table already holds.
 * Pictures are added and removed with their own intents, so the gallery here can only be reordered and captioned.
 */
export function cleanProfile(raw: Partial<Profile>, prev: Profile | undefined, id: string, kind: ProfileKind, fallbackName: string): Profile {
  const known = new Set<string>([...(prev?.gallery.map((g) => g.id) ?? []), ...(prev?.portrait ? [prev.portrait] : [])]);
  const gallery: ProfileImage[] = [];
  const seen = new Set<string>();
  for (const g of Array.isArray(raw.gallery) ? raw.gallery : []) {
    if (!g || !isImageId(g.id) || !known.has(g.id) || seen.has(g.id)) continue;
    seen.add(g.id);
    gallery.push({ id: g.id, caption: str(g.caption, LIMITS.caption)?.trim() || undefined });
  }
  // a picture left out of the list stays, at the end (removing goes through its own intent)
  for (const g of prev?.gallery ?? []) if (!seen.has(g.id)) gallery.push(g);
  const portrait = raw.portrait === undefined ? prev?.portrait : isImageId(raw.portrait) && known.has(raw.portrait) ? raw.portrait : undefined;
  return {
    id,
    kind,
    name: str(raw.name, LIMITS.name)?.trim() || prev?.name || fallbackName,
    title: str(raw.title, LIMITS.title)?.trim() || undefined,
    portrait,
    gallery: gallery.slice(0, LIMITS.gallery),
    info: textMap(raw.info, INFO_FIELDS.map((f) => f.id), LIMITS.info),
    story: textMap(raw.story, STORY_FIELDS.map((f) => f.id), LIMITS.story),
    inventory: str(raw.inventory, LIMITS.inventory) || undefined,
    stats: cleanStats(raw.stats),
    secrets: str(raw.secrets, LIMITS.secrets) || undefined,
    gmNotes: str(raw.gmNotes, LIMITS.gmNotes) || undefined,
    shared: !!raw.shared,
    shareStats: !!raw.shareStats,
    updated: Date.now(),
  };
}

/** Every picture a profile points at. */
export const profileImageIds = (p: Profile) => [...(p.portrait ? [p.portrait] : []), ...p.gallery.map((g) => g.id)];

/** Nothing written and no pictures yet. */
export const isEmptyProfile = (p: Profile) =>
  !p.portrait && !p.gallery.length && !p.title && !p.inventory && !p.secrets && !Object.keys(p.info).length && !Object.keys(p.story).length;
