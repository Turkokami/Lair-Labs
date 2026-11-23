// Weather and the air itself: rain, snow, fog, wind, gloom and temperature, set by the GM for the whole table.
// It draws on the overhead map and in the 3D view, and tells everyone what it means for play. The rules notes are
// our own short wording of the free SRD 5.2 environment rules (CC-BY-4.0).

export type Precip = 'none' | 'drizzle' | 'rain' | 'storm' | 'snow' | 'blizzard' | 'hail' | 'sand' | 'ash' | 'embers' | 'leaves';
export type Level = 0 | 1 | 2 | 3;

export interface Weather {
  precip: Precip;
  /** 0 none, 1 mist, 2 fog, 3 thick fog. */
  fog: Level;
  /** 0 calm, 1 breeze, 2 strong wind, 3 gale. */
  wind: Level;
  /** 0 none, 1 overcast, 2 dusk, 3 night or magical gloom: darkens the view (light rules still come from the map). */
  gloom: Level;
  temp: 'mild' | 'cold' | 'hot';
  /** Lightning flashes (storms turn it on). */
  lightning?: boolean;
}

export const CLEAR: Weather = { precip: 'none', fog: 0, wind: 0, gloom: 0, temp: 'mild' };

export const PRECIP_LABELS: Record<Precip, string> = {
  none: 'None', drizzle: 'Drizzle', rain: 'Heavy rain', storm: 'Thunderstorm', snow: 'Snow', blizzard: 'Blizzard', hail: 'Hail',
  sand: 'Sandstorm', ash: 'Falling ash', embers: 'Drifting embers', leaves: 'Blowing leaves',
};
export const FOG_LABELS = ['No fog', 'Mist', 'Fog', 'Thick fog'];
export const WIND_LABELS = ['Calm', 'Breeze', 'Strong wind', 'Gale'];
export const GLOOM_LABELS = ['Daylight', 'Overcast', 'Dusk', 'Night'];
export const TEMP_LABELS: Record<Weather['temp'], string> = { mild: 'Mild', cold: 'Freezing cold', hot: 'Scorching heat' };

export const WEATHER_PRESETS: { id: string; name: string; w: Weather }[] = [
  { id: 'clear', name: 'Clear', w: CLEAR },
  { id: 'overcast', name: 'Overcast', w: { ...CLEAR, gloom: 1, wind: 1 } },
  { id: 'drizzle', name: 'Drizzle', w: { ...CLEAR, precip: 'drizzle', gloom: 1, fog: 1 } },
  { id: 'rain', name: 'Heavy rain', w: { ...CLEAR, precip: 'rain', gloom: 1, wind: 1, fog: 1 } },
  { id: 'storm', name: 'Thunderstorm', w: { precip: 'storm', fog: 1, wind: 2, gloom: 2, temp: 'mild', lightning: true } },
  { id: 'snow', name: 'Snowfall', w: { precip: 'snow', fog: 1, wind: 0, gloom: 1, temp: 'cold' } },
  { id: 'blizzard', name: 'Blizzard', w: { precip: 'blizzard', fog: 2, wind: 3, gloom: 2, temp: 'cold' } },
  { id: 'hail', name: 'Hailstorm', w: { precip: 'hail', fog: 0, wind: 2, gloom: 1, temp: 'cold' } },
  { id: 'mist', name: 'Morning mist', w: { ...CLEAR, fog: 1 } },
  { id: 'fog', name: 'Fog bank', w: { ...CLEAR, fog: 2, gloom: 1 } },
  { id: 'thickfog', name: 'Thick fog', w: { ...CLEAR, fog: 3, gloom: 1 } },
  { id: 'sand', name: 'Sandstorm', w: { precip: 'sand', fog: 2, wind: 3, gloom: 1, temp: 'hot' } },
  { id: 'heat', name: 'Desert heat', w: { ...CLEAR, temp: 'hot' } },
  { id: 'ash', name: 'Volcanic ash', w: { precip: 'ash', fog: 2, wind: 1, gloom: 2, temp: 'hot' } },
  { id: 'embers', name: 'Burning city', w: { precip: 'embers', fog: 1, wind: 1, gloom: 2, temp: 'hot' } },
  { id: 'autumn', name: 'Autumn wind', w: { precip: 'leaves', fog: 0, wind: 2, gloom: 0, temp: 'mild' } },
  { id: 'night', name: 'Night', w: { ...CLEAR, gloom: 3 } },
  { id: 'gale', name: 'Gale', w: { ...CLEAR, wind: 3, gloom: 1 } },
];

const PRECIPS = Object.keys(PRECIP_LABELS) as Precip[];
const lv = (n: unknown): Level => (Math.max(0, Math.min(3, Math.round(Number(n) || 0))) as Level);

/** A safe copy of whatever the GM's phone sent. */
export function cleanWeather(x: unknown): Weather {
  const o = (x && typeof x === 'object' ? x : {}) as Partial<Weather>;
  const precip = PRECIPS.includes(o.precip as Precip) ? (o.precip as Precip) : 'none';
  const temp = o.temp === 'cold' || o.temp === 'hot' ? o.temp : 'mild';
  return { precip, fog: lv(o.fog), wind: lv(o.wind), gloom: lv(o.gloom), temp, lightning: !!o.lightning || precip === 'storm' };
}

export const isClear = (w?: Weather | null) => !w || (w.precip === 'none' && !w.fog && !w.wind && !w.gloom && w.temp === 'mild');

/** Heavy enough to hide things and put out flames. */
export const heavyPrecip = (w: Weather) => ['rain', 'storm', 'blizzard', 'sand', 'ash', 'snow', 'hail'].includes(w.precip);

/** A short name for the weather: the preset's name if it matches one, else the parts. */
export function weatherName(w?: Weather | null): string {
  if (isClear(w)) return 'Clear';
  const hit = WEATHER_PRESETS.find((p) => JSON.stringify(cleanWeather(p.w)) === JSON.stringify(cleanWeather(w)));
  if (hit) return hit.name;
  const parts: string[] = [];
  if (w!.precip !== 'none') parts.push(PRECIP_LABELS[w!.precip]);
  if (w!.fog) parts.push(FOG_LABELS[w!.fog]);
  if (w!.wind) parts.push(WIND_LABELS[w!.wind]);
  if (w!.gloom) parts.push(GLOOM_LABELS[w!.gloom]);
  if (w!.temp !== 'mild') parts.push(TEMP_LABELS[w!.temp]);
  return parts.join(', ');
}

/** What the weather means at the table, in a few plain lines. */
export function weatherRules(w?: Weather | null): string[] {
  if (!w || isClear(w)) return [];
  const out: string[] = [];
  const thick = w.fog >= 3 || w.precip === 'blizzard' || (w.precip === 'sand' && w.wind >= 3);
  if (thick) out.push('Heavily obscured: beyond arm\'s reach you can\'t see, as if blinded.');
  else if (heavyPrecip(w) || w.fog >= 1) out.push('Lightly obscured: Perception checks that rely on sight have disadvantage.');
  if (heavyPrecip(w) || w.wind >= 2) out.push('Open flames like torches and campfires gutter out.');
  if (w.precip === 'rain' || w.precip === 'storm' || w.precip === 'hail') out.push('Heavy rain also gives disadvantage on Perception checks that rely on hearing.');
  if (w.wind >= 2) out.push('Strong wind: ranged weapon attacks have disadvantage, and fliers without magic must land at the end of their turn or fall.');
  if (w.wind >= 2 && w.fog >= 1) out.push('The wind tears the fog apart within a few minutes.');
  if (w.temp === 'cold') out.push('Freezing cold: each hour without cold-weather gear, a DC 10 Constitution save or gain a level of Exhaustion.');
  if (w.temp === 'hot') out.push('Scorching heat: each hour without enough water, a Constitution save (DC 5, +1 each hour) or gain a level of Exhaustion. Medium or heavy armour gives disadvantage.');
  if (w.gloom >= 3) out.push('Night: the open sky gives only dim light at best.');
  if (w.lightning) out.push('Thunder rolls: loud enough to cover noise.');
  return out;
}

/** True when a ranged weapon attack made in this weather has disadvantage. */
export const windSpoilsRanged = (w?: Weather | null) => !!w && w.wind >= 2;
