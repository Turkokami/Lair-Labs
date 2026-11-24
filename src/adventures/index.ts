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
  {
    id: 'academy-small-wonders', title: 'Trouble at the Academy of Small Wonders', levels: '1', sessions: '1 session', players: '3-5', chapters: 1, mapSize: '400 × 400 ft',
    tagline: 'Exam night at a school for young wizards: the brooms sweep people out of windows, the books bite, and the headmistress is a cat.',
    tags: ['one-shot', 'funny', 'school', 'magic', 'family'],
  },
  {
    id: 'djinni-wager', title: 'The Djinni\'s Wager', levels: '11', sessions: '1-2 sessions', players: '3-5', chapters: 1, mapSize: '400 × 400 ft',
    tagline: 'A bored djinni prince won a kingdom\'s rain in a bet. Win it back at his Grand Games, where cheating is allowed but getting caught is not.',
    tags: ['planar', 'contests', 'comedy', 'sky'],
  },
  {
    id: 'sand-king-tomb', title: 'Tomb of the Sand King', levels: '8', sessions: '1-2 sessions', players: '3-5', chapters: 1, mapSize: '400 × 400 ft',
    tagline: 'A sandstorm has uncovered a king\'s tomb built to test his heir, and a rival expedition is already inside.',
    tags: ['dungeon', 'traps', 'desert', 'undead', 'puzzles'],
  },
  {
    id: 'troll-bridges', title: 'The Troll Bridges of Kel Morrow', levels: '6', sessions: '1 session', players: '3-5', chapters: 1, mapSize: '400 × 400 ft',
    tagline: 'Seven bridges, one troll family, one stolen egg: solve the theft before the toll turns bloody.',
    tags: ['one-shot', 'wilderness', 'trolls', 'mystery', 'funny'],
  },
  {
    id: 'throne-of-cinders', title: 'The Throne of Cinders', levels: '20', sessions: '1-2 sessions', players: '3-5 players', chapters: 1, mapSize: '400 x 400 ft',
    tagline: 'The last free armies storm a burned capital to stop an ancient red dragon being crowned a god at dawn.',
    tags: ['epic', 'finale', 'dragon', 'war', 'city'],
  },
  {
    id: 'crows-ferry', title: 'The Bandits of Crow\'s Ferry', levels: '2', sessions: '1 session (3-4 hours)', players: '3-5 players', chapters: 1, mapSize: '400 x 400 ft',
    tagline: 'Bandits hold the only ferry on the river and rob every traveller. Find out why before you hang them.',
    tags: ['one-shot', 'wilderness', 'bandits', 'river', 'dragon'],
  },
  {
    id: 'wyvern-roost', title: 'The Wyvern Roost of Mount Skarn', levels: '6', sessions: '1 session (4 hours)', players: '3-5 players', chapters: 1, mapSize: '400 x 400 ft',
    tagline: 'Wyverns are taking the shepherds of Lowfold, and the only way to stop them is up the mountain.',
    tags: ['one-shot', 'mountain', 'wyverns', 'mystery', 'climb'],
  },
  {
    id: 'hagsmoor-mill', title: 'The Night Mill of Hagsmoor', levels: '1', sessions: '1 session (3-4 hours)', players: '3-5 players', chapters: 1, mapSize: '400 x 400 ft',
    tagline: 'The old watermill grinds by itself after dark, and everyone who eats its bread falls into a dream they can\'t wake from.',
    tags: ['one-shot', 'starter', 'folk tale', 'fen', 'bargain'],
  },
  {
    id: 'manticore-mesa', title: 'The Toll on Sabbath Mesa', levels: '5', sessions: '1-2 sessions', players: '3-5 players', chapters: 1, mapSize: '400 x 400 ft',
    tagline: 'A manticore takes its toll from a desert silver camp, and somebody down in the camp is feeding it.',
    tags: ['one-shot', 'western', 'wilderness', 'manticore', 'mystery'],
  },
  {
    id: 'hydra-mirewater', title: 'The Hydra of Mirewater', levels: '11', sessions: '1-2 sessions', players: '3-5 players', chapters: 1, mapSize: '400 x 400 ft',
    tagline: 'A stilt town paid its hydra every spring. This year someone stole the payment, and now the hydra is taking houses.',
    tags: ['swamp', 'hydra', 'mystery', 'morally grey', 'wilderness'],
  },
  {
    id: 'sunken-library', title: 'The Sunken Library of Quillmere', levels: '3', sessions: '1 session', players: '3-5 players', chapters: 1, mapSize: '400 x 400 ft',
    tagline: 'A drought has given back a drowned library, and three rival crews are racing for the living catalogue at its heart.',
    tags: ['one-shot', 'ruins', 'puzzles', 'race', 'cult'],
  },
  {
    id: 'silent-archive', title: 'The Silent Archive', levels: '17-18', sessions: '2-3 sessions', players: '3-5 players', chapters: 2, mapSize: '2 big maps',
    tagline: 'Every bell, song and name in the world is going quiet, one city at a time, and something is filing them away.',
    tags: ['epic', 'city', 'planar', 'lich', 'silence'],
  },
  {
    id: 'winterhollow-wolves', title: 'The Wolves of Winterhollow', levels: '2', sessions: '1 session (3-4 hours)', players: '3-5 players', chapters: 1, mapSize: '400 x 400 ft',
    tagline: 'Wolves circle a snowed-in logging village and a child is missing. But the wolves are running from something.',
    tags: ['one-shot', 'winter', 'survival', 'wolves'],
  },
  {
    id: 'vampire-wedding', title: 'The Velbrand Wedding', levels: '9-11', sessions: '3-4 sessions', players: '3-5 players', chapters: 3, mapSize: '3 big maps',
    tagline: 'A gothic wedding in a misty river valley, where the groom has not aged in sixty years and the vows are written in blood.',
    tags: ['mini-campaign', 'gothic horror', 'vampires', 'intrigue', 'wedding'],
  },
  {
    id: 'seven-suns-caravan', title: 'The Caravan of Seven Suns', levels: '2-4', sessions: '3-5 sessions', players: '3-5 players', chapters: 3, mapSize: '3 big maps',
    tagline: 'Guard a painted caravan across the deep desert, and decide the fate of the singing jar that every bandit, cultist and gnoll on the road wants.',
    tags: ['road trip', 'desert', 'caravan', 'mystery', 'choices'],
  },
  {
    id: 'gray-kings', title: 'The Moot of the Gray Kings', levels: '14', sessions: '1-2 sessions', players: '3-5 players', chapters: 1, mapSize: '400 x 400 ft',
    tagline: 'Three giant clans, one ancient peace and a saboteur who wants them at war: find the truth before the third dawn.',
    tags: ['intrigue', 'giants', 'high level', 'mystery', 'outdoors'],
  },
  {
    id: 'last-contract', title: 'The Last Contract', levels: '19', sessions: '1-2 sessions', players: '3-5 players', chapters: 1, mapSize: '400 x 400 ft',
    tagline: 'A kingdom falls due at midnight. Rob the vault-city where gods and fiends keep their bargains, and steal it back.',
    tags: ['heist', 'high level', 'fiends', 'golems', 'epic'],
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
  'academy-small-wonders': () => import('./academy-small-wonders').then((m) => m.ACADEMY_SMALL_WONDERS),
  'djinni-wager': () => import('./djinni-wager').then((m) => m.DJINNI_WAGER),
  'sand-king-tomb': () => import('./sand-king-tomb').then((m) => m.SAND_KING_TOMB),
  'troll-bridges': () => import('./troll-bridges').then((m) => m.TROLL_BRIDGES),
  'throne-of-cinders': () => import('./throne-of-cinders').then((m) => m.THRONE_OF_CINDERS),
  'crows-ferry': () => import('./crows-ferry').then((m) => m.CROWS_FERRY),
  'wyvern-roost': () => import('./wyvern-roost').then((m) => m.WYVERN_ROOST),
  'hagsmoor-mill': () => import('./hagsmoor-mill').then((m) => m.HAGSMOOR_MILL),
  'manticore-mesa': () => import('./manticore-mesa').then((m) => m.MANTICORE_MESA),
  'hydra-mirewater': () => import('./hydra-mirewater').then((m) => m.HYDRA_MIREWATER),
  'sunken-library': () => import('./sunken-library').then((m) => m.SUNKEN_LIBRARY),
  'silent-archive': () => import('./silent-archive').then((m) => m.SILENT_ARCHIVE),
  'winterhollow-wolves': () => import('./winterhollow-wolves').then((m) => m.WINTERHOLLOW_WOLVES),
  'vampire-wedding': () => import('./vampire-wedding').then((m) => m.VAMPIRE_WEDDING),
  'seven-suns-caravan': () => import('./seven-suns-caravan').then((m) => m.SEVEN_SUNS_CARAVAN),
  'gray-kings': () => import('./gray-kings').then((m) => m.GRAY_KINGS),
  'last-contract': () => import('./last-contract').then((m) => m.LAST_CONTRACT),
};

export function loadAdventure(id: string): Promise<Adventure> {
  const f = LOADERS[id];
  return f ? f() : Promise.reject(new Error('No such adventure.'));
}
