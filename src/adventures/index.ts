// The ready-to-play adventures. The cards are small; each adventure loads only when picked.
import type { Adventure, AdventureCard } from './types';

export const ADVENTURE_CARDS: AdventureCard[] = [
  {
    id: 'lantern-thief', title: 'The Lantern Thief of Brindle Ford', levels: '1', sessions: '1 session', players: '3-5', chapters: 1, mapSize: '360 × 280 ft',
    tagline: 'Someone stole the lantern that keeps the marsh mist away. Get it back before dawn.',
    tags: ['one-shot', 'starter', 'caves', 'kobolds'],
  },
  {
    id: 'drowned-bells', title: 'The Drowned Bells of Saltmarrow', levels: '2-4', sessions: '3-4 sessions', players: '3-5', chapters: 3, mapSize: '3 big maps',
    tagline: 'Church bells ring under the sea, and every night another fisher walks into the waves.',
    tags: ['mini-campaign', 'town', 'sea caves', 'cult', 'mystery'],
  },
  {
    id: 'cinderdeep', title: 'The Cinderdeep Vault', levels: '9-10', sessions: '1-2 sessions', players: '3-5', chapters: 1, mapSize: '400 × 320 ft',
    tagline: 'A dwarf forge-vault inside a waking volcano, and the young red dragon who moved in.',
    tags: ['dungeon', 'high level', 'fire', 'dragon', 'traps'],
  },
  {
    id: 'hollow-orchard', title: 'The Hollow Orchard', levels: '3', sessions: '1 session', players: '3-5', chapters: 1, mapSize: '400 × 400 ft',
    tagline: 'The apples ripen overnight, the scarecrows walk at dusk, and the pickers keep vanishing among the trees.',
    tags: ['one-shot', 'folk horror', 'outdoors', 'hag'],
  },
  {
    id: 'ember-court', title: 'The Ember Court', levels: '17', sessions: '1-2 sessions', players: '3-5', chapters: 1, mapSize: '400 × 400 ft',
    tagline: 'An efreeti prince stole a kingdom\'s sun. Win it back from a brass palace on a sea of lava.',
    tags: ['planar', 'intrigue', 'fire', 'demon'],
  },
  {
    id: 'clockwork-spire', title: 'The Clockwork Spire', levels: '7', sessions: '1-2 sessions', players: '3-5', chapters: 1, mapSize: '400 × 400 ft',
    tagline: 'A dead inventor\'s tower is winding itself up again, and when its great bell rings, the city will stop forever.',
    tags: ['one-shot', 'tower', 'clockwork', 'constructs', 'race the clock'],
  },
  {
    id: 'gilded-ledger', title: 'Heist at the Gilded Ledger', levels: '5', sessions: '2 sessions', players: '3-5', chapters: 2, mapSize: '2 big maps',
    tagline: 'One night, one counting-house, one book that owns a whole neighbourhood. Steal it.',
    tags: ['heist', 'city', 'stealth', 'caper', 'canals'],
  },
  {
    id: 'frostfang-pass', title: 'Frostfang Pass', levels: '11-13', sessions: '4-6 sessions', players: '3-5', chapters: 3, mapSize: '3 big maps',
    tagline: 'An endless winter, a starving town and the frost giants who blame it for their dead prince.',
    tags: ['mini-campaign', 'winter', 'giants', 'dragon', 'diplomacy'],
  },
  {
    id: 'market-of-masks', title: 'The Market of Masks', levels: '3', sessions: '1 session', players: '3-5', chapters: 1, mapSize: '400 × 400 ft',
    tagline: 'On the one night everyone wears a mask, a killer is wearing the Mask-Maker\'s face.',
    tags: ['one-shot', 'mystery', 'social', 'festival', 'town'],
  },
  {
    id: 'infernal-audit', title: 'The Infernal Audit', levels: '12', sessions: '1-2 sessions', players: '3-5', chapters: 1, mapSize: '400 × 400 ft',
    tagline: 'A city\'s souls fall due at midnight. Your only weapons: a stamp, a form and the small print.',
    tags: ['comedy', 'hell', 'devils', 'intrigue'],
  },
  {
    id: 'rat-king-sewers', title: 'The Rat King of Lower Wick', levels: '1', sessions: '1 session', players: '3-5', chapters: 1, mapSize: '400 × 400 ft',
    tagline: 'The rats of the poorest quarter steal in gangs, and the children swear a crowned rat gives the orders.',
    tags: ['starter', 'city', 'sewers', 'funny', 'talk it out'],
  },
  {
    id: 'kraken-maw', title: 'The Kraken\'s Maw', levels: '19', sessions: '1-2 sessions', players: '3-5', chapters: 1, mapSize: '400 × 400 ft',
    tagline: 'A storm-giant queen has leashed a kraken and means to make it a god. Sail into the whirlpool and break the leash.',
    tags: ['sea', 'kraken', 'giants', 'epic'],
  },
  {
    id: 'blood-moon-varrow', title: 'Blood Moon over Varrow', levels: '6', sessions: '2 sessions', players: '3-5', chapters: 2, mapSize: '2 big maps',
    tagline: 'Three nights of a red moon, a village that wants someone to burn, and a wolf curse running through its first family.',
    tags: ['gothic horror', 'werewolves', 'mystery', 'forest'],
  },
];

const LOADERS: Record<string, () => Promise<Adventure>> = {
  'lantern-thief': () => import('./lantern').then((m) => m.LANTERN),
  'drowned-bells': () => import('./saltmarrow').then((m) => m.SALTMARROW),
  cinderdeep: () => import('./cinderdeep').then((m) => m.CINDERDEEP),
  'hollow-orchard': () => import('./hollow-orchard').then((m) => m.HOLLOW_ORCHARD),
  'ember-court': () => import('./ember-court').then((m) => m.EMBER_COURT),
  'clockwork-spire': () => import('./clockwork-spire').then((m) => m.CLOCKWORK_SPIRE),
  'gilded-ledger': () => import('./gilded-ledger').then((m) => m.GILDED_LEDGER),
  'frostfang-pass': () => import('./frostfang-pass').then((m) => m.FROSTFANG_PASS),
  'market-of-masks': () => import('./market-of-masks').then((m) => m.MARKET_OF_MASKS),
  'infernal-audit': () => import('./infernal-audit').then((m) => m.INFERNAL_AUDIT),
  'rat-king-sewers': () => import('./rat-king-sewers').then((m) => m.RAT_KING_SEWERS),
  'kraken-maw': () => import('./kraken-maw').then((m) => m.KRAKEN_MAW),
  'blood-moon-varrow': () => import('./blood-moon-varrow').then((m) => m.BLOOD_MOON_VARROW),
};

export function loadAdventure(id: string): Promise<Adventure> {
  const f = LOADERS[id];
  return f ? f() : Promise.reject(new Error('No such adventure.'));
}
