// The live game. The GM's device runs HostCore as the single source of truth: it checks every
// intent, rolls every die, and sends each phone only what that player is allowed to see.
import { type GameMap, type DoorState, blankMap, cell, edgeCells, isFloor, moveCost, revealAround, floodRoom, blocks, edgeBetween } from './map';
import { roll, critFormula, type RollResult } from './dice';
import { type Character, type CharacterBuild, type CharacterState, computeSheet, freshState } from '../rules/character';
import { monsterById, sizeSquares } from '../rules/monsters';
import { mod } from '../rules/core';

export type Visibility = 'public' | 'gm' | 'self' | 'blind';

export interface Token {
  id: string;
  kind: 'pc' | 'monster' | 'npc';
  name: string;
  x: number;
  y: number;
  size: number;
  color: string;
  hidden: boolean;
  charId?: string;
  monsterId?: string;
  hp: number;
  maxHp: number;
  ac: number;
  conditions: string[];
  initMod: number;
  speed: number;
  movedFeet: number;
}

export interface Player { id: string; name: string; connected: boolean; charId?: string; joinedAt: number; }

export interface LogEntry {
  id: string;
  ts: number;
  kind: 'roll' | 'chat' | 'system';
  from: string;
  fromId: string; // player id, or 'gm'
  text?: string;
  roll?: RollResult;
  visibility: Visibility;
  to?: string; // whisper target: 'gm' or a player id
  crit?: boolean;
  fumble?: boolean;
  damageFormula?: string; // offered follow-up damage roll after an attack
  damageLabel?: string;
}

export interface Combat { active: boolean; round: number; turn: number; order: { tokenId: string; init: number; dex: number }[]; }
export interface Settings { monsterHp: 'hidden' | 'bloodied' | 'exact'; lockMoves: boolean; autoReveal: boolean; discord: string; locked: boolean; startLevel: number; }

export interface GameState {
  code: string;
  map: GameMap;
  tokens: Token[];
  players: Record<string, Player>;
  characters: Record<string, Character>;
  revealed: number[];
  log: LogEntry[];
  combat: Combat;
  settings: Settings;
  handout?: { title: string; text: string; ts: number };
  curtain: boolean; // GM hides the map from players during scene changes
  version: number;
}

export type Intent =
  | { t: 'hello'; name: string; clientId: string }
  | { t: 'saveChar'; character: Character }
  | { t: 'pickChar'; charId: string }
  | { t: 'move'; tokenId: string; x: number; y: number }
  | { t: 'roll'; formula: string; label?: string; visibility?: Visibility; attackDamage?: string; critRange?: number }
  | { t: 'chat'; text: string; to?: string }
  | { t: 'door'; key: string }
  | { t: 'hp'; charId: string; delta?: number; temp?: number }
  | { t: 'cond'; target: string; cond: string; on: boolean } // target = charId or tokenId
  | { t: 'charState'; charId: string; patch: Partial<Pick<CharacterState, 'slotsUsed' | 'resUsed' | 'concentration' | 'coins' | 'inspiration' | 'exhaustion'>> }
  | { t: 'initiative' }
  | { t: 'endTurn' }
  | { t: 'deathSave' }
  | { t: 'hitDie'; charId: string }
  | { t: 'rest'; charId: string; kind: 'short' | 'long' }
  | { t: 'concSave'; charId: string }
  | { t: 'levelUp'; character: Character }
  // GM-only intents
  | { t: 'gm:setMap'; map: GameMap }
  | { t: 'gm:editMap'; map: GameMap }
  | { t: 'gm:reveal'; cells: number[]; on: boolean }
  | { t: 'gm:revealRoom'; x: number; y: number }
  | { t: 'gm:revealAll'; on: boolean }
  | { t: 'gm:addMonster'; monsterId: string; x: number; y: number; count?: number; hidden?: boolean }
  | { t: 'gm:addToken'; token: Partial<Token> & { name: string; x: number; y: number } }
  | { t: 'gm:removeToken'; tokenId: string }
  | { t: 'gm:tokenPatch'; tokenId: string; patch: Partial<Token> }
  | { t: 'gm:damage'; targets: string[]; amount: number; crit?: boolean } // negative heals; targets are token ids
  | { t: 'gm:doorState'; key: string; state: DoorState | null }
  | { t: 'gm:startCombat'; tokenIds?: string[] }
  | { t: 'gm:endCombat' }
  | { t: 'gm:nextTurn'; dir?: 1 | -1 }
  | { t: 'gm:setInit'; tokenId: string; init: number }
  | { t: 'gm:rollMonsterInit' }
  | { t: 'gm:settings'; patch: Partial<Settings> }
  | { t: 'gm:handout'; title: string; text: string }
  | { t: 'gm:clearHandout' }
  | { t: 'gm:curtain'; on: boolean }
  | { t: 'gm:grantLevel'; charId: string }
  | { t: 'gm:kick'; playerId: string }
  | { t: 'gm:clearLog' };

// ---------- player view ----------
export interface PartyMember { charId: string; name: string; classLine: string; hp: number; maxHp: number; tempHp: number; ac: number; conditions: string[]; color: string; playerName?: string; dying: boolean; }
export interface PlayerView {
  code: string;
  you: string;
  role: 'player' | 'gm';
  map: GameMap;
  revealed: number[];
  tokens: (Token & { hpLabel?: string })[];
  players: { id: string; name: string; connected: boolean; charId?: string }[];
  party: PartyMember[];
  myCharacter?: Character;
  myTokenId?: string;
  log: LogEntry[];
  combat: { active: boolean; round: number; current?: string; order: { tokenId: string; name: string; init: number; isYou: boolean }[] };
  settings: Pick<Settings, 'discord' | 'lockMoves' | 'startLevel'>;
  handout?: GameState['handout'];
  curtain: boolean;
  version: number;
}

export const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export function makeCode(): string {
  const a = new Uint32Array(6);
  crypto.getRandomValues(a);
  return Array.from(a, (n) => CODE_ALPHABET[n % CODE_ALPHABET.length]).join('');
}
export const prettyCode = (c: string) => `${c.slice(0, 3)}-${c.slice(3)}`;
export const normalizeCode = (c: string) => c.toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/O/g, '0').replace(/I/g, '1').replace(/0/g, 'O').slice(0, 6);

let seq = 0;
const lid = () => `l${Date.now().toString(36)}${(seq++).toString(36)}`;

export function newGame(code = makeCode(), map: GameMap = blankMap()): GameState {
  return {
    code, map, tokens: [], players: {}, characters: {}, revealed: [], log: [],
    combat: { active: false, round: 0, turn: 0, order: [] },
    settings: { monsterHp: 'bloodied', lockMoves: false, autoReveal: true, discord: '', locked: false, startLevel: 1 },
    curtain: false, version: 0,
  };
}

export class GameError extends Error {}

export class HostCore {
  s: GameState;
  /** Called after every accepted change. */
  onChange: () => void = () => {};
  /** Private notices to one player (e.g. errors, "your turn"). */
  onNotice: (playerId: string, text: string) => void = () => {};

  constructor(state: GameState) {
    this.s = state;
  }

  private bump() {
    this.s.version++;
    if (this.s.log.length > 250) this.s.log = this.s.log.slice(-200);
    this.onChange();
  }
  private add(e: Omit<LogEntry, 'id' | 'ts'>) {
    const entry = { ...e, id: lid(), ts: Date.now() };
    this.s.log.push(entry);
    return entry;
  }
  system(text: string, visibility: Visibility = 'public') {
    this.add({ kind: 'system', from: 'Table', fromId: 'gm', text, visibility });
  }

  private playerName(id: string) {
    return id === 'gm' ? 'GM' : this.s.players[id]?.name ?? 'Someone';
  }
  private charOf(id: string): Character | undefined {
    const p = this.s.players[id];
    return p?.charId ? this.s.characters[p.charId] : undefined;
  }
  private canEditChar(from: string, charId: string) {
    if (from === 'gm') return true;
    return this.s.players[from]?.charId === charId;
  }
  tokenForChar(charId: string) {
    return this.s.tokens.find((t) => t.charId === charId);
  }
  currentTokenId() {
    const c = this.s.combat;
    return c.active && c.order.length ? c.order[c.turn % c.order.length]?.tokenId : undefined;
  }

  /** Apply an intent from a player id or 'gm'. Throws GameError when refused. */
  handle(from: string, it: Intent): void {
    const gm = from === 'gm';
    if (it.t.startsWith('gm:') && !gm) throw new GameError('Only the GM can do that.');
    if (!gm && it.t !== 'hello' && !this.s.players[from]) throw new GameError('Join the table first.');
    switch (it.t) {
      case 'hello': {
        const existing = this.s.players[it.clientId];
        if (!existing && this.s.settings.locked) throw new GameError('The GM has locked this table.');
        const name = (it.name || 'Player').slice(0, 24);
        this.s.players[it.clientId] = { id: it.clientId, name, connected: true, charId: existing?.charId, joinedAt: existing?.joinedAt ?? Date.now() };
        this.system(existing ? `${name} reconnected.` : `${name} joined the table.`);
        break;
      }
      case 'saveChar': {
        const c = it.character;
        if (!c?.build?.id) throw new GameError('Bad character.');
        const prev = this.s.characters[c.build.id];
        if (prev && !this.canEditChar(from, c.build.id)) throw new GameError("That isn't your character.");
        const cap = Math.max(this.s.settings.startLevel ?? 1, prev?.build.level ?? 0, prev?.levelCap ?? 0);
        if (!gm && c.build.level > cap) throw new GameError(`Your GM has new heroes start at level ${this.s.settings.startLevel ?? 1}. Lower your level and save again.`);
        const sheet = computeSheet(c.build);
        const state = prev ? { ...prev.state, hp: Math.min(prev.state.hp, sheet.maxHp) } : { ...freshState(c.build), ...c.state, hp: Math.min(c.state?.hp ?? sheet.maxHp, sheet.maxHp) };
        this.s.characters[c.build.id] = { build: c.build, state, levelCap: prev?.levelCap };
        if (!gm) this.s.players[from].charId = c.build.id;
        this.ensureToken(c.build.id);
        if (!prev) this.system(`${this.playerName(from)} brings ${c.build.name} (${sheet.cls.name} ${c.build.level}) to the table.`);
        break;
      }
      case 'pickChar': {
        const c = this.s.characters[it.charId];
        if (!c) throw new GameError('No such character.');
        const taken = Object.values(this.s.players).find((p) => p.charId === it.charId && p.id !== from);
        if (taken && !gm) throw new GameError(`${taken.name} is already playing ${c.build.name}.`);
        if (!gm) this.s.players[from].charId = it.charId;
        this.ensureToken(it.charId);
        this.system(`${this.playerName(from)} is playing ${c.build.name}.`);
        break;
      }
      case 'levelUp': {
        const c = it.character;
        const prev = this.s.characters[c.build.id];
        if (!prev || !this.canEditChar(from, c.build.id)) throw new GameError("That isn't your character.");
        if (!gm && c.build.level > Math.max(prev.build.level, prev.levelCap ?? prev.build.level)) throw new GameError('The GM has to award the level first.');
        const before = computeSheet(prev.build).maxHp;
        const after = computeSheet(c.build).maxHp;
        prev.build = c.build;
        prev.state.hp = Math.max(0, prev.state.hp + (after - before));
        prev.state.slotsUsed = computeSheet(c.build).spell?.slots.map((_, i) => prev.state.slotsUsed[i] ?? 0) ?? [];
        this.syncToken(c.build.id);
        this.system(`${c.build.name} is now level ${c.build.level}!`);
        break;
      }
      case 'move': return this.move(from, it.tokenId, it.x, it.y);
      case 'roll': {
        const label = (it.label ?? '').slice(0, 60);
        const r = roll(it.formula + (label ? ` # ${label}` : ''));
        const crit = r.natural !== undefined && r.natural >= (it.critRange ?? 20);
        const fumble = r.natural === 1;
        this.add({ kind: 'roll', from: this.playerName(from), fromId: from, roll: r, visibility: it.visibility ?? 'public', crit, fumble, damageFormula: it.attackDamage ? (crit ? critFormula(it.attackDamage) : it.attackDamage) : undefined, damageLabel: it.attackDamage ? `${label.replace(/ attack$/, '')} damage${crit ? ' (critical!)' : ''}` : undefined });
        break;
      }
      case 'chat': {
        const text = it.text.trim().slice(0, 500);
        if (!text) return;
        this.add({ kind: 'chat', from: this.playerName(from), fromId: from, text, visibility: it.to ? 'self' : 'public', to: it.to });
        break;
      }
      case 'door': {
        const d = this.s.map.doors[it.key];
        if (!d || d === 'secret') throw new GameError('There is no door there.');
        if (!gm) {
          if (d === 'locked') {
            this.system(`${this.playerName(from)} tries a door. It's locked.`);
            break;
          }
          const ch = this.charOf(from);
          const tok = ch && this.tokenForChar(ch.build.id);
          const [[ax, ay], [bx, by]] = edgeCells(it.key);
          const near = tok && [[ax, ay], [bx, by]].some(([x, y]) => Math.max(Math.abs(tok.x - x), Math.abs(tok.y - y)) <= 1);
          if (!near) throw new GameError('Move next to the door first.');
        }
        this.s.map.doors[it.key] = d === 'open' ? 'closed' : 'open';
        if (this.s.map.doors[it.key] === 'open' && this.s.settings.autoReveal) {
          const [[ax, ay], [bx, by]] = edgeCells(it.key);
          this.reveal([...revealAround(this.s.map, ax, ay), ...revealAround(this.s.map, bx, by)]);
        }
        break;
      }
      case 'hp': {
        if (!this.canEditChar(from, it.charId)) throw new GameError("That isn't your character.");
        const c = this.s.characters[it.charId];
        if (it.temp !== undefined) c.state.tempHp = Math.max(0, it.temp);
        if (it.delta) this.applyHp(c, it.delta);
        this.syncToken(it.charId);
        break;
      }
      case 'cond': {
        const c = this.s.characters[it.target];
        if (c) {
          if (!this.canEditChar(from, it.target)) throw new GameError("That isn't your character.");
          c.state.conditions = toggle(c.state.conditions, it.cond, it.on);
          this.syncToken(it.target);
        } else {
          if (!gm) throw new GameError('Only the GM can do that.');
          const t = this.s.tokens.find((x) => x.id === it.target);
          if (t) t.conditions = toggle(t.conditions, it.cond, it.on);
        }
        break;
      }
      case 'charState': {
        if (!this.canEditChar(from, it.charId)) throw new GameError("That isn't your character.");
        const c = this.s.characters[it.charId];
        const p = it.patch;
        if (p.slotsUsed) c.state.slotsUsed = p.slotsUsed.map((n) => Math.max(0, n | 0));
        if (p.resUsed) c.state.resUsed = { ...c.state.resUsed, ...p.resUsed };
        if ('concentration' in p) {
          if (p.concentration && p.concentration !== c.state.concentration) this.system(`${c.build.name} is concentrating on ${p.concentration}.`);
          c.state.concentration = p.concentration || undefined;
          (c.state as CharacterState & { concDC?: number }).concDC = undefined;
        }
        if (p.coins !== undefined) c.state.coins = Math.max(0, p.coins | 0);
        if (p.inspiration !== undefined) c.state.inspiration = p.inspiration;
        if (p.exhaustion !== undefined) c.state.exhaustion = Math.max(0, Math.min(6, p.exhaustion));
        break;
      }
      case 'initiative': {
        const c = this.charOf(from);
        if (!c) throw new GameError('Pick a character first.');
        const tok = this.tokenForChar(c.build.id)!;
        const r = roll(`1d20${fmt(computeSheet(c.build).initiative)} # Initiative`);
        this.add({ kind: 'roll', from: this.playerName(from), fromId: from, roll: r, visibility: 'public' });
        this.setInit(tok.id, r.total);
        break;
      }
      case 'endTurn': {
        const c = this.charOf(from);
        const cur = this.currentTokenId();
        if (!c || !cur || this.tokenForChar(c.build.id)?.id !== cur) throw new GameError("It isn't your turn.");
        this.advance(1);
        break;
      }
      case 'deathSave': {
        const c = this.charOf(from);
        if (!c || c.state.hp > 0 || c.state.dead || c.state.stable) throw new GameError('No death save needed.');
        const r = roll('1d20 # Death save');
        const e = this.add({ kind: 'roll', from: this.playerName(from), fromId: from, roll: r, visibility: 'public' });
        const ds = c.state.deathSaves;
        if (r.natural === 20) {
          c.state.hp = 1;
          c.state.deathSaves = { s: 0, f: 0 };
          c.state.conditions = c.state.conditions.filter((x) => x !== 'unconscious');
          e.crit = true;
          this.system(`${c.build.name} rolls a natural 20 and gets back up with 1 HP!`);
        } else if (r.natural === 1) ds.f += 2;
        else if (r.total >= 10) ds.s += 1;
        else ds.f += 1;
        if (ds.s >= 3) {
          c.state.stable = true;
          this.system(`${c.build.name} is stable.`);
        }
        if (ds.f >= 3) {
          c.state.dead = true;
          this.system(`${c.build.name} has died.`);
        }
        this.syncToken(c.build.id);
        break;
      }
      case 'concSave': {
        if (!this.canEditChar(from, it.charId)) throw new GameError("That isn't your character.");
        const c = this.s.characters[it.charId];
        const st = c.state as CharacterState & { concDC?: number };
        if (!st.concDC) throw new GameError('No concentration check pending.');
        const sh = computeSheet(c.build);
        const r = roll(`1d20${fmt(sh.saves.con.total)} # Concentration (DC ${st.concDC})`);
        this.add({ kind: 'roll', from: this.playerName(from), fromId: from, roll: r, visibility: 'public' });
        if (r.total < st.concDC) {
          this.system(`${c.build.name} loses concentration on ${c.state.concentration}.`);
          c.state.concentration = undefined;
        } else this.system(`${c.build.name} keeps concentrating.`);
        st.concDC = undefined;
        break;
      }
      case 'hitDie': {
        if (!this.canEditChar(from, it.charId)) throw new GameError("That isn't your character.");
        const c = this.s.characters[it.charId];
        const sh = computeSheet(c.build);
        if (c.state.hitDiceUsed >= c.build.level) throw new GameError('No Hit Dice left.');
        c.state.hitDiceUsed++;
        const r = roll(`1d${sh.hitDie}${fmt(sh.mods.con)} # Hit Die`);
        this.add({ kind: 'roll', from: this.playerName(from), fromId: from, roll: r, visibility: 'public' });
        this.applyHp(c, Math.max(0, r.total));
        this.syncToken(it.charId);
        break;
      }
      case 'rest': {
        if (!this.canEditChar(from, it.charId)) throw new GameError("That isn't your character.");
        const c = this.s.characters[it.charId];
        const sh = computeSheet(c.build);
        const keep: Record<string, number> = {};
        for (const r of sh.resources) if (it.kind === 'short' && r.reset === 'long') keep[r.id] = c.state.resUsed[r.id] ?? 0;
        c.state.resUsed = keep;
        if (sh.cls.caster === 'pact' || it.kind === 'long') c.state.slotsUsed = c.state.slotsUsed.map(() => 0);
        if (it.kind === 'long') {
          c.state.hp = sh.maxHp;
          c.state.tempHp = 0;
          c.state.hitDiceUsed = Math.max(0, c.state.hitDiceUsed - Math.max(1, Math.floor(c.build.level / 2)));
          c.state.deathSaves = { s: 0, f: 0 };
          c.state.exhaustion = Math.max(0, c.state.exhaustion - 1);
          c.state.stable = false;
          c.state.conditions = c.state.conditions.filter((x) => x !== 'unconscious');
          if (c.build.speciesId === 'human') c.state.inspiration = true;
        }
        this.system(`${c.build.name} finishes a ${it.kind} rest.`);
        this.syncToken(it.charId);
        break;
      }
      // ---------- GM ----------
      case 'gm:setMap': {
        this.s.map = it.map;
        this.s.revealed = [];
        for (const t of this.s.tokens) if (!isFloor(it.map, t.x, t.y)) this.placeNear(t);
        if (this.s.settings.autoReveal) for (const t of this.s.tokens.filter((x) => x.kind === 'pc')) this.reveal(revealAround(this.s.map, t.x, t.y));
        this.system(`The scene changes: ${it.map.name}.`);
        break;
      }
      case 'gm:editMap': {
        const n = it.map.cols * it.map.rows;
        const sameSize = it.map.cols === this.s.map.cols && it.map.rows === this.s.map.rows;
        this.s.map = it.map;
        this.s.revealed = sameSize ? this.s.revealed.filter((i) => i < n) : [];
        for (const t of this.s.tokens) if (!isFloor(it.map, t.x, t.y)) this.placeNear(t);
        break;
      }
      case 'gm:reveal': this.reveal(it.cells, it.on); break;
      case 'gm:revealRoom': this.reveal(revealAround(this.s.map, it.x, it.y)); break;
      case 'gm:revealAll': this.s.revealed = it.on ? this.s.map.cells.map((_, i) => i) : []; break;
      case 'gm:addMonster': {
        const mon = monsterById(it.monsterId);
        if (!mon) throw new GameError('Unknown monster.');
        const n = Math.max(1, Math.min(12, it.count ?? 1));
        const same = this.s.tokens.filter((t) => t.monsterId === mon.id).length;
        for (let i = 0; i < n; i++) {
          const t: Token = {
            id: lid(), kind: 'monster', name: n + same > 1 ? `${mon.name} ${same + i + 1}` : mon.name, x: it.x, y: it.y, size: sizeSquares(mon.size),
            color: '#b23a3a', hidden: it.hidden ?? false, monsterId: mon.id, hp: mon.hp, maxHp: mon.hp, ac: mon.ac, conditions: [],
            initMod: mod(mon.abilities[1]), speed: parseInt(mon.speed, 10) || 30, movedFeet: 0,
          };
          this.placeNear(t);
          this.s.tokens.push(t);
        }
        break;
      }
      case 'gm:addToken': {
        const t: Token = { id: lid(), kind: 'npc', size: 1, color: '#8a8f98', hidden: false, hp: 10, maxHp: 10, ac: 10, conditions: [], initMod: 0, speed: 30, movedFeet: 0, ...it.token };
        this.s.tokens.push(t);
        break;
      }
      case 'gm:removeToken': {
        this.s.tokens = this.s.tokens.filter((t) => t.id !== it.tokenId);
        this.removeFromCombat(it.tokenId);
        break;
      }
      case 'gm:tokenPatch': {
        const t = this.s.tokens.find((x) => x.id === it.tokenId);
        if (!t) throw new GameError('No such token.');
        const { id: _id, ...patch } = it.patch;
        Object.assign(t, patch);
        if (t.charId && (patch.x !== undefined || patch.y !== undefined) && this.s.settings.autoReveal) this.reveal(revealAround(this.s.map, t.x, t.y));
        break;
      }
      case 'gm:damage': {
        const names: string[] = [];
        for (const id of it.targets) {
          const t = this.s.tokens.find((x) => x.id === id);
          if (!t) continue;
          names.push(t.name);
          if (t.charId) {
            const c = this.s.characters[t.charId];
            if (it.amount > 0 && c.state.hp === 0 && !c.state.dead) {
              c.state.deathSaves.f += it.crit ? 2 : 1;
              c.state.stable = false;
              if (c.state.deathSaves.f >= 3) {
                c.state.dead = true;
                this.system(`${c.build.name} has died.`);
              }
            }
            this.applyHp(c, -it.amount);
            this.syncToken(t.charId);
          } else {
            t.hp = Math.max(0, Math.min(t.maxHp, t.hp - it.amount));
            if (t.hp === 0 && !t.conditions.includes('unconscious') && t.kind === 'monster') this.system(`${t.name} falls!`, 'public');
          }
        }
        if (names.length) this.system(`${names.join(', ')} ${it.amount >= 0 ? `take${names.length > 1 ? '' : 's'} ${it.amount} damage` : `regain${names.length > 1 ? '' : 's'} ${-it.amount} HP`}.`, 'gm');
        break;
      }
      case 'gm:doorState': {
        if (it.state === null) delete this.s.map.doors[it.key];
        else this.s.map.doors[it.key] = it.state;
        break;
      }
      case 'gm:startCombat': {
        const ids = it.tokenIds ?? this.s.tokens.filter((t) => !t.hidden || t.kind === 'monster').map((t) => t.id);
        this.s.combat = { active: true, round: 1, turn: 0, order: [] };
        for (const t of this.s.tokens) t.movedFeet = 0;
        for (const id of ids) {
          const t = this.s.tokens.find((x) => x.id === id);
          if (t && t.kind !== 'pc') this.rollTokenInit(t);
        }
        this.system('Combat begins! Roll initiative.');
        break;
      }
      case 'gm:rollMonsterInit': {
        for (const t of this.s.tokens) if (t.kind !== 'pc' && !this.s.combat.order.some((o) => o.tokenId === t.id)) this.rollTokenInit(t);
        break;
      }
      case 'gm:endCombat': {
        const xp = this.s.tokens.filter((t) => t.kind === 'monster' && t.hp === 0).reduce((s, t) => s + (monsterById(t.monsterId ?? '')?.xp ?? 0), 0);
        this.s.combat = { active: false, round: 0, turn: 0, order: [] };
        this.system(xp ? `Combat is over. Defeated foes are worth ${xp} XP.` : 'Combat is over.');
        break;
      }
      case 'gm:nextTurn': this.advance(it.dir ?? 1); break;
      case 'gm:setInit': this.setInit(it.tokenId, it.init); break;
      case 'gm:settings': this.s.settings = { ...this.s.settings, ...it.patch }; break;
      case 'gm:handout': this.s.handout = { title: it.title.slice(0, 80), text: it.text.slice(0, 4000), ts: Date.now() }; this.system(`The GM shares: ${it.title}`); break;
      case 'gm:clearHandout': this.s.handout = undefined; break;
      case 'gm:curtain': this.s.curtain = it.on; break;
      case 'gm:grantLevel': {
        const c = this.s.characters[it.charId];
        if (!c) throw new GameError('No such character.');
        if (c.build.level >= 5) throw new GameError('Level 5 is the cap for now.');
        c.levelCap = c.build.level + 1;
        this.system(`${c.build.name} can level up to ${c.levelCap}!`);
        break;
      }
      case 'gm:kick': {
        const p = this.s.players[it.playerId];
        if (p) {
          delete this.s.players[it.playerId];
          this.system(`${p.name} left the table.`);
        }
        break;
      }
      case 'gm:clearLog': this.s.log = []; break;
      default: throw new GameError('Unknown action.');
    }
    this.bump();
  }

  setConnected(id: string, on: boolean) {
    const p = this.s.players[id];
    if (p && p.connected !== on) {
      p.connected = on;
      this.bump();
    }
  }

  private applyHp(c: Character, delta: number) {
    const max = computeSheet(c.build).maxHp;
    const st = c.state as CharacterState & { concDC?: number };
    if (delta < 0) {
      let dmg = -delta;
      const fromTemp = Math.min(st.tempHp, dmg);
      st.tempHp -= fromTemp;
      dmg -= fromTemp;
      const before = st.hp;
      st.hp = Math.max(0, st.hp - dmg);
      if (st.concentration && -delta > 0) {
        st.concDC = Math.max(10, Math.floor(-delta / 2));
        this.system(`${c.build.name} must make a DC ${st.concDC} Constitution save to keep concentrating on ${st.concentration}.`);
      }
      if (before > 0 && st.hp === 0) {
        if (dmg - before >= max) {
          st.dead = true;
          this.system(`${c.build.name} is killed outright by massive damage.`);
        } else {
          st.conditions = toggle(st.conditions, 'unconscious', true);
          st.deathSaves = { s: 0, f: 0 };
          st.stable = false;
          this.system(`${c.build.name} drops to 0 HP and is dying!`);
        }
      }
    } else if (delta > 0 && !st.dead) {
      const wasDown = st.hp === 0;
      st.hp = Math.min(max, st.hp + delta);
      if (wasDown && st.hp > 0) {
        st.deathSaves = { s: 0, f: 0 };
        st.stable = false;
        st.conditions = st.conditions.filter((x) => x !== 'unconscious');
      }
    }
  }

  private ensureToken(charId: string) {
    if (this.tokenForChar(charId)) return this.syncToken(charId);
    const c = this.s.characters[charId];
    const sh = computeSheet(c.build);
    const start = this.startSquare();
    const t: Token = {
      id: lid(), kind: 'pc', name: c.build.name, x: start[0], y: start[1], size: 1, color: c.build.color, hidden: false, charId,
      hp: c.state.hp, maxHp: sh.maxHp, ac: sh.ac, conditions: c.state.conditions, initMod: sh.initiative, speed: sh.speed, movedFeet: 0,
    };
    this.placeNear(t);
    this.s.tokens.push(t);
    if (this.s.settings.autoReveal) this.reveal(revealAround(this.s.map, t.x, t.y));
  }

  private syncToken(charId: string) {
    const t = this.tokenForChar(charId);
    const c = this.s.characters[charId];
    if (!t || !c) return;
    const sh = computeSheet(c.build);
    Object.assign(t, { name: c.build.name, hp: c.state.hp, maxHp: sh.maxHp, ac: sh.ac, conditions: c.state.conditions, initMod: sh.initiative, speed: sh.speed, color: c.build.color });
  }

  private startSquare(): [number, number] {
    const m = this.s.map;
    const stairs = m.props.find((p) => p.kind === 'stairs');
    if (stairs) return [stairs.x, stairs.y];
    const pc = this.s.tokens.find((t) => t.kind === 'pc');
    if (pc) return [pc.x, pc.y];
    const i = m.cells.findIndex((v) => v > 0);
    return i >= 0 ? [i % m.cols, Math.floor(i / m.cols)] : [Math.floor(m.cols / 2), Math.floor(m.rows / 2)];
  }

  private occupied(x: number, y: number, except?: string) {
    return this.s.tokens.some((t) => t.id !== except && x >= t.x && x < t.x + t.size && y >= t.y && y < t.y + t.size);
  }

  private placeNear(t: Token) {
    const m = this.s.map;
    for (let r = 0; r < Math.max(m.cols, m.rows); r++)
      for (let dy = -r; dy <= r; dy++)
        for (let dx = -r; dx <= r; dx++) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
          const x = t.x + dx, y = t.y + dy;
          const fits = (() => {
            for (let j = 0; j < t.size; j++) for (let i = 0; i < t.size; i++) if (!isFloor(m, x + i, y + j) || this.occupied(x + i, y + j, t.id)) return false;
            return true;
          })();
          if (fits) {
            t.x = x;
            t.y = y;
            return;
          }
        }
  }

  private reveal(cells: number[], on = true) {
    const set = new Set(this.s.revealed);
    for (const c of cells) on ? set.add(c) : set.delete(c);
    this.s.revealed = [...set];
  }

  private move(from: string, tokenId: string, x: number, y: number) {
    const t = this.s.tokens.find((k) => k.id === tokenId);
    if (!t) throw new GameError('No such token.');
    const gm = from === 'gm';
    const m = this.s.map;
    if (!gm) {
      const c = this.charOf(from);
      if (!c || t.charId !== c.build.id) throw new GameError("You can only move your own hero.");
      if (c.state.hp === 0) throw new GameError("You can't move at 0 HP.");
      const cur = this.currentTokenId();
      if (this.s.combat.active && this.s.settings.lockMoves && cur !== t.id) throw new GameError('Wait for your turn to move.');
      const cost = moveCost(m, t.x, t.y, x, y, 400);
      if (!Number.isFinite(cost)) throw new GameError("You can't get there from here.");
      if (this.s.combat.active && cur === t.id) {
        const left = t.speed - t.movedFeet;
        if (cost > left) throw new GameError(`That's ${cost} ft and you have ${left} ft of movement left.`);
        t.movedFeet += cost;
      }
      if (this.occupied(x, y, t.id)) throw new GameError('Someone is already standing there.');
    } else if (!isFloor(m, x, y) && cell(m, x, y) === 0) {
      // GM may drop tokens anywhere on floor; rock is refused
      throw new GameError('That square is solid rock.');
    }
    t.x = x;
    t.y = y;
    if (t.kind === 'pc' && this.s.settings.autoReveal) this.reveal(revealAround(m, x, y));
    this.bump();
  }

  private rollTokenInit(t: Token) {
    const r = roll(`1d20${fmt(t.initMod)} # ${t.name} initiative`);
    this.add({ kind: 'roll', from: 'GM', fromId: 'gm', roll: r, visibility: t.hidden ? 'gm' : 'gm' });
    this.setInit(t.id, r.total);
  }

  private setInit(tokenId: string, init: number) {
    const c = this.s.combat;
    if (!c.active) throw new GameError('Combat has not started.');
    const t = this.s.tokens.find((x) => x.id === tokenId);
    if (!t) return;
    const cur = this.currentTokenId();
    const dex = t.charId ? computeSheet(this.s.characters[t.charId].build).mods.dex : t.initMod;
    c.order = c.order.filter((o) => o.tokenId !== tokenId);
    c.order.push({ tokenId, init, dex });
    c.order.sort((a, b) => b.init - a.init || b.dex - a.dex);
    if (cur) c.turn = Math.max(0, c.order.findIndex((o) => o.tokenId === cur));
    else c.turn = 0;
  }

  private removeFromCombat(tokenId: string) {
    const c = this.s.combat;
    const cur = this.currentTokenId();
    c.order = c.order.filter((o) => o.tokenId !== tokenId);
    if (!c.order.length) return void (c.turn = 0);
    const idx = cur ? c.order.findIndex((o) => o.tokenId === cur) : -1;
    c.turn = idx >= 0 ? idx : c.turn % c.order.length;
  }

  private advance(dir: 1 | -1) {
    const c = this.s.combat;
    if (!c.active || !c.order.length) throw new GameError('No combat running.');
    let next = c.turn + dir;
    if (next >= c.order.length) {
      next = 0;
      c.round++;
    } else if (next < 0) {
      next = c.order.length - 1;
      c.round = Math.max(1, c.round - 1);
    }
    c.turn = next;
    const t = this.s.tokens.find((x) => x.id === c.order[next].tokenId);
    if (t) {
      t.movedFeet = 0;
      if (t.charId) {
        const owner = Object.values(this.s.players).find((p) => p.charId === t.charId);
        if (owner) this.onNotice(owner.id, 'your-turn');
      }
    }
  }

  // ---------- views ----------
  view(id: string): PlayerView {
    const s = this.s;
    const gm = id === 'gm';
    const me = s.players[id];
    const myChar = me?.charId ? s.characters[me.charId] : undefined;
    const rev = new Set(s.revealed);
    const visibleCell = (x: number, y: number) => gm || rev.has(y * s.map.cols + x);

    let map = s.map;
    if (!gm) {
      const cells = s.map.cells.map((v, i) => (rev.has(i) && !s.curtain ? v : -1)); // -1 = unknown (fog)
      const doors: Record<string, DoorState> = {};
      const walls = [...s.map.walls];
      for (const [k, st] of Object.entries(s.map.doors)) {
        const [[ax, ay], [bx, by]] = edgeCells(k);
        if (!(visibleCell(ax, ay) || visibleCell(bx, by))) continue;
        if (st === 'secret') walls.push(k);
        else doors[k] = st === 'locked' ? 'closed' : st;
      }
      map = {
        ...s.map, cells, doors, walls,
        props: s.curtain ? [] : s.map.props.filter((p) => !p.gmOnly && visibleCell(p.x, p.y)),
        notes: [],
      };
    }
    const tokens = s.tokens
      .filter((t) => gm || (!s.curtain && !t.hidden && (t.kind === 'pc' || visibleCell(t.x, t.y))))
      .map((t) => {
        if (gm || t.kind === 'pc') return { ...t };
        const mode = s.settings.monsterHp;
        const hpLabel = mode === 'exact' ? `${t.hp}/${t.maxHp}` : mode === 'bloodied' ? (t.hp === 0 ? 'Down' : t.hp <= t.maxHp / 2 ? 'Bloodied' : '') : '';
        return { ...t, hp: mode === 'exact' ? t.hp : t.hp === 0 ? 0 : -1, maxHp: mode === 'exact' ? t.maxHp : -1, ac: -1, hpLabel };
      });
    const visibleIds = new Set(tokens.map((t) => t.id));
    const party: PartyMember[] = Object.values(s.characters)
      .filter((c) => s.tokens.some((t) => t.charId === c.build.id))
      .map((c) => {
        const sh = computeSheet(c.build);
        const owner = Object.values(s.players).find((p) => p.charId === c.build.id);
        return { charId: c.build.id, name: c.build.name, classLine: `${sh.speciesName} ${sh.cls.name} ${c.build.level}`, hp: c.state.hp, maxHp: sh.maxHp, tempHp: c.state.tempHp, ac: sh.ac, conditions: c.state.conditions, color: c.build.color, playerName: owner?.name, dying: c.state.hp === 0 && !c.state.dead && !c.state.stable };
      });
    const log = s.log.filter((e) => {
      if (gm) return true;
      if (e.visibility === 'public') return true;
      if (e.visibility === 'gm') return false;
      if (e.kind === 'chat' && e.to) return e.fromId === id || e.to === id;
      return e.fromId === id; // self and blind rolls: the roller sees the entry
    }).map((e) => (e.visibility === 'blind' && !gm ? { ...e, roll: undefined, text: 'rolled in secret. Only the GM sees the result.' } : e)).slice(-120);
    const cur = this.currentTokenId();
    const myToken = myChar ? this.tokenForChar(myChar.build.id) : undefined;
    const combat = {
      active: s.combat.active,
      round: s.combat.round,
      current: cur && visibleIds.has(cur) ? cur : cur && !gm ? 'hidden' : cur,
      order: s.combat.order.filter((o) => visibleIds.has(o.tokenId)).map((o) => ({ tokenId: o.tokenId, name: s.tokens.find((t) => t.id === o.tokenId)?.name ?? '?', init: o.init, isYou: o.tokenId === myToken?.id })),
    };
    return {
      code: s.code, you: id, role: gm ? 'gm' : 'player', map, revealed: gm ? s.revealed : s.curtain ? [] : s.revealed, tokens,
      players: Object.values(s.players).map((p) => ({ id: p.id, name: p.name, connected: p.connected, charId: p.charId })),
      party, myCharacter: myChar, myTokenId: myToken?.id, log, combat,
      settings: { discord: s.settings.discord, lockMoves: s.settings.lockMoves, startLevel: s.settings.startLevel ?? 1 }, handout: s.handout, curtain: s.curtain, version: s.version,
    };
  }
}

export const fmt = (n: number) => (n >= 0 ? `+${n}` : `${n}`);
const toggle = (arr: string[], v: string, on: boolean) => (on ? (arr.includes(v) ? arr : [...arr, v]) : arr.filter((x) => x !== v));

// re-exported helpers used by the UI
export { floodRoom, blocks, edgeBetween };
export type { CharacterBuild };
