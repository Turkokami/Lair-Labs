// Original Lair Labs monsters for the ready-made adventures, and the token art each one borrows.
import { MONSTERS_G1, ART_G1 } from './g1';
import { MONSTERS_G2, ART_G2 } from './g2';
import { MONSTERS_G3, ART_G3 } from './g3';
import { MONSTERS_G4, ART_G4 } from './g4';
import { MONSTERS_G5, ART_G5 } from './g5';

export const ADVENTURE_MONSTERS = [...MONSTERS_G1, ...MONSTERS_G2, ...MONSTERS_G3, ...MONSTERS_G4, ...MONSTERS_G5];
export const ADVENTURE_MONSTER_ART: Record<string, string> = { ...ART_G1, ...ART_G2, ...ART_G3, ...ART_G4, ...ART_G5 };
