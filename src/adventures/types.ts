// Ready-to-play adventures: story, scenes, people, handouts and the maps they happen on.
// All original Lair Labs writing. Monster rules come from the SRD 5.2 (CC-BY-4.0).
import type { GameMap } from '../engine/map';
import type { ProfileStats } from '../engine/profile';

/** A named person or creature with a profile the GM can open (and share with players). */
export interface AdvNpc {
  /** Profile id, pf_ and 4-32 lowercase letters or digits. */
  id: string;
  name: string;
  title: string;
  kind: 'npc' | 'monster';
  /** Token art from the creature library. */
  art?: string;
  /** Uses this stat block for hit points, AC and the bestiary. */
  monsterId?: string;
  /** One line each: what they want, what they know, how they sound. */
  wants: string;
  knows: string;
  voice: string;
  appearance: string;
  backstory?: string;
  gmNotes?: string;
  stats?: ProfileStats;
  /** Players can open the profile from the start. */
  shared?: boolean;
}

export interface AdvScene {
  /** The area on the map this happens in (its name), if any. */
  room?: string;
  title: string;
  /** Say this out loud. Two or three sentences. */
  read?: string;
  /** What's really going on, and how it can play out. */
  gm: string;
  /** What can be found here. */
  treasure?: string;
  /** The map encounter that belongs here (by name). */
  encounter?: string;
  /** Optional scene you can skip if time runs short. */
  optional?: boolean;
  /** Handout to show here (by id). */
  handout?: string;
}

export interface AdvPlacement { npc: string; x: number; y: number; hidden?: boolean }

export interface AdvChapter {
  id: string;
  title: string;
  /** The party's level for this part. */
  level: number;
  summary: string;
  /** What the heroes are trying to do here. */
  goal: string;
  map: () => GameMap;
  scenes: AdvScene[];
  npcs: AdvPlacement[];
  /** How this part ends and what comes next. */
  wrapUp: string;
}

export interface AdvHandout { id: string; title: string; text: string }

export interface Adventure {
  id: string;
  title: string;
  tagline: string;
  /** "1", "2-4" */
  levels: string;
  sessions: string;
  players: string;
  tags: string[];
  /** The pitch to read to players. */
  pitch: string;
  /** For the GM: the villain, what they want and why now. */
  secret: string;
  /** Ways to get the heroes involved. */
  hooks: string[];
  /** How to run it smoothly. */
  tips: string[];
  chapters: AdvChapter[];
  npcs: AdvNpc[];
  handouts: AdvHandout[];
  /** How it ends, good and bad, and what's next. */
  ending: string;
}

/** What the picker shows before the full adventure loads. */
export interface AdventureCard {
  id: string;
  title: string;
  tagline: string;
  levels: string;
  sessions: string;
  players: string;
  tags: string[];
  chapters: number;
  /** Squares across all its maps. */
  mapSize: string;
}
