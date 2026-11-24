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
  {
    id: 'carnival-shadows', title: 'The Carnival of Borrowed Shadows', levels: '6', sessions: '1 session', players: '3-5 players', chapters: 1, mapSize: '400 x 400 ft',
    tagline: 'A travelling carnival comes to town for one night, and by dawn three townsfolk will leave with it, smiling.',
    tags: ['carnival', 'fey', 'creepy', 'one-shot', 'outdoor'],
  },
  {
    id: 'skyship-wreck', title: 'The Wreck of the Brass Albatross', levels: '4', sessions: '1 session', players: '3-5', chapters: 1, mapSize: '400 × 400 ft',
    tagline: 'A royal airship lies in pieces across a jungle valley, and its cracked heart will explode at sunset.',
    tags: ['one-shot', 'jungle', 'pulp', 'race the clock', 'airships'],
  },
  {
    id: 'poisoned-garden', title: 'The Poisoned Garden', levels: '8', sessions: '1-2 sessions', players: '3-5', chapters: 1, mapSize: '400 × 400 ft',
    tagline: 'At the Duchess\'s midsummer garden party her heir falls poisoned, and every guest is wearing the same white rose.',
    tags: ['mystery', 'botanical horror', 'intrigue', 'outdoors', 'can be talked out'],
  },
  {
    id: 'brightwall-siege', title: 'The Siege of Brightwall', levels: '7-8', sessions: '3-4 sessions', players: '3-5', chapters: 3, mapSize: '3 big maps',
    tagline: 'A hobgoblin legion at the walls, a traitor inside them, and a beacon that must burn before the town falls.',
    tags: ['siege', 'war', 'town', 'heroic', 'mini-campaign'],
  },
  {
    id: 'lantern-saints', title: 'The Lantern Saints of Skerrow', levels: '4', sessions: '1 session', players: '3-5', chapters: 1, mapSize: '400 × 400 ft',
    tagline: 'On the Night of Lanterns the relics of seven saints are vanishing one by one, and with each theft a ghost walks the cliff town.',
    tags: ['one-shot', 'festival', 'ghosts', 'mystery', 'cliff town'],
  },
  {
    id: 'thornwood-feast', title: 'The Midsummer Feast of the Thornwood', levels: '4', sessions: '1 session', players: '3-5', chapters: 1, mapSize: '400 × 400 ft',
    tagline: 'One night a year the Thornwood opens its gate. Eat with care, promise nothing, and bring the lost singer home before the dawn bell.',
    tags: ['one-shot', 'fey', 'fairy tale', 'riddles', 'can be talked out'],
  },
  {
    id: 'harrowfield-hive', title: 'The Hollow Under Harrowfield', levels: '3', sessions: '1 session', players: '3-5', chapters: 1, mapSize: '400 × 400 ft',
    tagline: 'The wheat is sinking, the cows are vanishing, and a little girl is somewhere under the fields with things that chew through stone.',
    tags: ['one-shot', 'rural horror', 'tunnels', 'giant bugs', 'mystery'],
  },
  {
    id: 'wrackstone-light', title: 'The Dark Light of Wrackstone', levels: '2', sessions: '1 session', players: '3-5', chapters: 1, mapSize: '400 × 400 ft',
    tagline: 'The lighthouse has been dark three nights, wreckers hold the island, the drowned are walking, and a ship full of passengers arrives at midnight.',
    tags: ['one-shot', 'storm', 'island', 'undead', 'race'],
  },
  {
    id: 'blackgate-escape', title: 'Escape from Blackgate', levels: '5', sessions: '1 session', players: '3-5', chapters: 1, mapSize: '400 × 400 ft',
    tagline: 'Framed, stripped and locked in a prison-mine: break out before the warden sells you to the thing in the deep.',
    tags: ['prison break', 'heist', 'mine', 'intrigue', 'horror'],
  },
  {
    id: 'bone-market', title: 'The Bone Market', levels: '7', sessions: '1-2 sessions', players: '3-5', chapters: 1, mapSize: '400 × 400 ft',
    tagline: 'An illegal night bazaar in the catacombs, a friend\'s soul sold by mistake, and only until dawn to get it back.',
    tags: ['heist', 'haggling', 'undead', 'city', 'catacombs'],
  },
  {
    id: 'glass-sea', title: 'The Star in the Glass Sea', levels: '10', sessions: '1-2 sessions', players: '3-5', chapters: 1, mapSize: '400 × 400 ft',
    tagline: 'A star fell into a desert of glass and took root; race two rival expeditions to the tower growing from its crater.',
    tags: ['wilderness', 'high level', 'desert', 'mystery', 'rivals'],
  },
  {
    id: 'hags-bargain', title: 'The Hags\' Bargain', levels: '6', sessions: '1 session', players: '3-5', chapters: 1, mapSize: '400 × 400 ft',
    tagline: 'Seven years ago a starving village promised a coven of hags "the firstborn of the seventh spring". Tonight the miller\'s daughter turns seven.',
    tags: ['one-shot', 'fairy tale', 'hags', 'marsh', 'bargain'],
  },
  {
    id: 'tiger-masquerade', title: 'The Tiger Masquerade', levels: '13', sessions: '1-2 sessions', players: '3-5', chapters: 1, mapSize: '400 × 400 ft',
    tagline: 'Every guest wears the face of a beast. One of them is wearing a face that is not theirs, and at midnight it takes a seat on the council.',
    tags: ['intrigue', 'high level', 'masquerade', 'demon', 'mystery'],
  },
  {
    id: 'ember-road', title: 'The Ember Road', levels: '1-4', sessions: '5-8 sessions', players: '3-5', chapters: 5, mapSize: '5 big maps',
    tagline: 'A sleeping volcano has started to smoke: follow the old road from a frontier town to the mountain\'s heart and bring back the stolen stones that keep it dreaming.',
    tags: ['starter', 'campaign', 'volcano', 'cult', 'road trip'],
  },
  {
    id: 'silver-eyrie', title: 'The Silver Eyrie', levels: '16', sessions: '1-2 sessions', players: '3-5', chapters: 1, mapSize: '400 × 400 ft',
    tagline: 'On the roof of the world, a dragon-abbot has forgotten himself, and a demon prince is climbing out of a god\'s dream.',
    tags: ['mystery', 'high level', 'demons', 'dragon', 'mountain'],
  },
  {
    id: 'storm-king-grief', title: 'The Storm King\'s Grief', levels: '14', sessions: '2-3 sessions', players: '3-5', chapters: 2, mapSize: '2 big maps',
    tagline: 'A storm giant king mourns his drowned daughter with a storm that will not end. Find out who really sank her ship before the coast drowns.',
    tags: ['epic', 'giants', 'storm', 'tragedy', 'sea'],
  },
  {
    id: 'clockwork-war', title: 'The Kneeling Fortress', levels: '15', sessions: '1-2 sessions', players: '3-5', chapters: 1, mapSize: '400 × 400 ft',
    tagline: 'Under a mountain, two dead nations\' war machines are still fighting, and a general wants the biggest one.',
    tags: ['battlefield', 'constructs', 'high level', 'ghosts', 'tragic'],
  },
  {
    id: 'ninth-seal', title: 'The Ninth Seal', levels: '11-16', sessions: '8-12 sessions', players: '3-5', chapters: 5, mapSize: '5 big maps',
    tagline: 'Eight seals under the world have already broken, someone is murdering the wardens who hid it, and the last key is in your pocket.',
    tags: ['investigation', 'epic', 'mystery', 'campaign', 'twist'],
  },
  {
    id: 'sun-goes-out', title: 'The Sun Goes Out', levels: '17-20', sessions: '8-12 sessions', players: '3-5', chapters: 5, mapSize: '5 big maps',
    tagline: 'Every day is an hour shorter than the last. Topple five spires of night and climb to the end of the world to bring back the sun.',
    tags: ['epic', 'campaign', 'angels', 'apocalypse', 'five-part'],
  },
  {
    id: 'shattered-crown', title: 'The Shattered Crown', levels: '5-10', sessions: '10-14 sessions', players: '3-5', chapters: 6, mapSize: '6 big maps',
    tagline: 'The high king is murdered and his crown lies in six cursed shards across six provinces: gather them before a charming usurper crowns himself.',
    tags: ['campaign', 'intrigue', 'epic', 'quest', 'kingdom'],
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
  'carnival-shadows': () => import('./carnival-shadows').then((m) => m.CARNIVAL_SHADOWS),
  'skyship-wreck': () => import('./skyship-wreck').then((m) => m.SKYSHIP_WRECK),
  'poisoned-garden': () => import('./poisoned-garden').then((m) => m.POISONED_GARDEN),
  'brightwall-siege': () => import('./brightwall-siege').then((m) => m.BRIGHTWALL_SIEGE),
  'lantern-saints': () => import('./lantern-saints').then((m) => m.LANTERN_SAINTS),
  'thornwood-feast': () => import('./thornwood-feast').then((m) => m.THORNWOOD_FEAST),
  'harrowfield-hive': () => import('./harrowfield-hive').then((m) => m.HARROWFIELD_HIVE),
  'wrackstone-light': () => import('./wrackstone-light').then((m) => m.WRACKSTONE_LIGHT),
  'blackgate-escape': () => import('./blackgate-escape').then((m) => m.BLACKGATE_ESCAPE),
  'bone-market': () => import('./bone-market').then((m) => m.BONE_MARKET),
  'glass-sea': () => import('./glass-sea').then((m) => m.GLASS_SEA),
  'hags-bargain': () => import('./hags-bargain').then((m) => m.HAGS_BARGAIN),
  'tiger-masquerade': () => import('./tiger-masquerade').then((m) => m.TIGER_MASQUERADE),
  'ember-road': () => import('./ember-road').then((m) => m.EMBER_ROAD),
  'silver-eyrie': () => import('./silver-eyrie').then((m) => m.SILVER_EYRIE),
  'storm-king-grief': () => import('./storm-king-grief').then((m) => m.STORM_KING_GRIEF),
  'clockwork-war': () => import('./clockwork-war').then((m) => m.CLOCKWORK_WAR),
  'ninth-seal': () => import('./ninth-seal').then((m) => m.NINTH_SEAL),
  'sun-goes-out': () => import('./sun-goes-out').then((m) => m.SUN_GOES_OUT),
  'shattered-crown': () => import('./shattered-crown').then((m) => m.SHATTERED_CROWN),
};

export function loadAdventure(id: string): Promise<Adventure> {
  const f = LOADERS[id];
  return f ? f() : Promise.reject(new Error('No such adventure.'));
}
