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
];

const LOADERS: Record<string, () => Promise<Adventure>> = {
  'lantern-thief': () => import('./lantern').then((m) => m.LANTERN),
  'drowned-bells': () => import('./saltmarrow').then((m) => m.SALTMARROW),
  cinderdeep: () => import('./cinderdeep').then((m) => m.CINDERDEEP),
};

export function loadAdventure(id: string): Promise<Adventure> {
  const f = LOADERS[id];
  return f ? f() : Promise.reject(new Error('No such adventure.'));
}
