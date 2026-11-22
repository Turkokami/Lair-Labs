// The walkable 3D view of a map. Same grid, same tokens, same rules: every step you take here is the ordinary
// move the overhead map sends, so initiative, movement left and the GM's controls all work the same way.
// Cameras: first person, over the shoulder, and a tilted table view. Drag to look around, tap a square to walk there,
// tap a door to open it, tap a figure to see who it is. The arrow pad steps one square at a time.
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import * as THREE from 'three';
import type { GameMap } from '../engine/map';
import type { Token, LogEntry } from '../engine/game';
import { Engine3D, defaultQuality, QUALITY, type Quality } from './engine';
import { Figure } from './figures';
import { registerCustomModels } from './custom-models';

registerCustomModels();
import { reach, route } from './path';
import { EYE, WALL_H } from './dungeon';
import { isDown } from '../ui/targets';

export type Cam = 'first' | 'shoulder' | 'table';
type VTok = Token & { hpLabel?: string };

export interface View3DProps {
  map: GameMap;
  role: 'gm' | 'player';
  tokens: VTok[];
  myTokenId?: string;
  currentTokenId?: string;
  visible?: number[];
  lit?: string;
  revealed?: number[];
  /** Feet of movement left this turn (combat only). */
  speedLeft?: number;
  combatActive?: boolean;
  log?: LogEntry[];
  /** GM: the token being steered from the 3D view (defaults to the selected or current one). */
  canMove?: (t: VTok) => boolean;
  onMove?: (tokenId: string, x: number, y: number) => void;
  onTap?: (info: { x: number; y: number; gx: number; gy: number; edge: string; tokenId?: string }) => void;
  onExit?: () => void;
  /** GM in build mode: no fog, ceiling off by default. */
  preview?: boolean;
  /** Set the camera from outside (the demo uses this). */
  cam?: Cam;
  /** How far back a free camera starts (squares). */
  startDist?: number;
  /** Turn controls drawn over the 3D view (attacks, end turn, HP): the table's rules, not the view's. */
  hud?: ReactNode;
  /** The token this player is aiming at: marked with a red ring under its feet. */
  targetId?: string;
}

const ANG = Math.PI / 4;

/** Where a free camera starts: the map's start square, or the floor square nearest the middle. */
function startSpot(m: GameMap) {
  if (m.playerStart?.length) return new THREE.Vector3(m.playerStart[0] + 0.5, 0, m.playerStart[1] + 0.5);
  let best = -1, bd = Infinity;
  for (let i = 0; i < m.cells.length; i++) {
    if (m.cells[i] <= 0) continue;
    const x = i % m.cols, y = Math.floor(i / m.cols), d = (x - m.cols / 2) ** 2 + (y - m.rows / 2) ** 2;
    if (d < bd) {
      bd = d;
      best = i;
    }
  }
  return best < 0 ? new THREE.Vector3(m.cols / 2, 0, m.rows / 2) : new THREE.Vector3((best % m.cols) + 0.5, 0, Math.floor(best / m.cols) + 0.5);
}
const snap8 = (a: number) => Math.round(a / ANG) * ANG;

export default function View3D(p: View3DProps) {
  const host = useRef<HTMLDivElement>(null);
  const eng = useRef<Engine3D | null>(null);
  const figs = useRef(new Map<string, Figure>());
  const [quality, setQuality] = useState<Quality>(() => defaultQuality());
  const [cam, setCam] = useState<Cam>(() => (p.myTokenId ? 'shoulder' : 'table'));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (p.cam) setCam(p.cam);
  }, [p.cam]);
  const [fps, setFps] = useState(0);
  const [hint, setHint] = useState<string | null>(null);
  const [work, setWork] = useState(p.role === 'gm');
  useEffect(() => {
    eng.current?.setLook(work, cam === 'table');
  }, [work, cam, ready]);
  const view = useRef({ yaw: Math.PI, pitch: -0.25, dist: p.myTokenId ? 3.2 : p.startDist ?? 15, tyaw: Math.PI, focus: startSpot(p.map) });
  const props = useRef(p);
  props.current = p;
  const camRef = useRef(cam);
  camRef.current = cam;
  const hl = useRef<THREE.InstancedMesh | null>(null);
  const seenLog = useRef<string | null>(null);
  // numbers that float up over a figure: damage, healing, dice totals
  const floatLayer = useRef<HTMLDivElement>(null);
  const floats = useRef<{ el: HTMLDivElement; tokenId: string; born: number; up: number }[]>([]);
  const targetMark = useRef<THREE.Mesh | null>(null);

  const steerId = p.myTokenId ?? (p.role === 'gm' ? p.currentTokenId : undefined);
  const steerRef = useRef(steerId);
  const lastStep = useRef(0);
  steerRef.current = steerId;
  // recording hook for the demo videos: a recording script that sets window.__rec can set where the camera looks
  if (typeof window !== 'undefined' && '__rec' in window) (window as unknown as { __v3d?: unknown }).__v3d = { view, figs, cam: () => camRef.current };

  // ---------- engine lifetime (rebuilt when quality changes) ----------
  useEffect(() => {
    if (!host.current) return;
    let e: Engine3D;
    try {
      e = new Engine3D(host.current, quality);
    } catch (err) {
      console.warn('3D view failed', err);
      setHint('This device could not start the 3D view.');
      return;
    }
    eng.current = e;
    // red notched ring under the token you're aiming at
    {
      const g = new THREE.RingGeometry(0.42, 0.5, 24, 1);
      const m = new THREE.MeshBasicMaterial({ color: '#ff4a3d', transparent: true, opacity: 0.85, depthWrite: false, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(g, m);
      ring.rotation.x = -Math.PI / 2;
      ring.renderOrder = 3;
      ring.visible = false;
      for (let i = 0; i < 4; i++) {
        const tick = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.16), m);
        const a = (i / 4) * Math.PI * 2;
        tick.position.set(Math.cos(a) * 0.58, Math.sin(a) * 0.58, 0);
        tick.rotation.z = a + Math.PI / 2;
        ring.add(tick);
      }
      e.scene.add(ring);
      targetMark.current = ring;
    }
    e.setMap(props.current.map, props.current.role);
    e.setLook(props.current.role === 'gm', camRef.current === 'table');
    applyVision();
    figs.current.clear();
    syncTokens();
    e.showCeiling(camRef.current !== 'table');
    const ro = new ResizeObserver(() => e.resize());
    ro.observe(host.current);
    let acc = 0, n = 0;
    e.onFrame = (dt) => {
      for (const f of figs.current.values()) f.update(dt);
      placeCamera(dt);
      placeFloats();
      acc += dt;
      n++;
      if (acc > 1) {
        setFps(Math.round(n / acc));
        acc = 0;
        n = 0;
      }
    };
    e.start(
      () => view.current.focus,
      () => {
        const id = steerRef.current;
        const t = id ? props.current.tokens.find((k) => k.id === id) : undefined;
        const f = id ? figs.current.get(id) : undefined;
        if (!t?.light || !f) return null;
        return { x: f.group.position.x, z: f.group.position.z, range: (t.light.bright + t.light.dim) / 5 };
      },
    );
    setReady(true);
    return () => {
      ro.disconnect();
      for (const f of figs.current.values()) f.dispose();
      figs.current.clear();
      hl.current = null;
      if (targetMark.current) {
        targetMark.current.geometry.dispose();
        (targetMark.current.material as THREE.Material).dispose();
        for (const c of targetMark.current.children) (c as THREE.Mesh).geometry.dispose();
        targetMark.current = null;
      }
      for (const f of floats.current) f.el.remove();
      floats.current = [];
      e.dispose();
      eng.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quality]);

  // ---------- map changes: rebuild walls/floors only when the layout changed, doors animate ----------
  const layoutKey = useMemo(() => {
    const m = p.map;
    return [m.id, m.cols, m.rows, m.cells.join(''), (m.mats ?? []).join(','), m.walls.join(','), JSON.stringify(m.wallKinds ?? {}), JSON.stringify(m.doorStyles ?? {}), Object.keys(m.doors).join(','), JSON.stringify(m.props), JSON.stringify(m.lights ?? []), m.theme, m.wallStyle, m.ambient].join('|');
  }, [p.map]);
  useEffect(() => {
    const e = eng.current;
    if (!e) return;
    e.setMap(p.map, p.role);
    e.showCeiling(cam !== 'table');
    e.setLook(work, cam === 'table');
    applyVision();
    hl.current = null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layoutKey]);
  useEffect(() => {
    eng.current?.setDoors(p.map);
  }, [p.map]);
  useEffect(() => {
    applyVision();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.visible, p.lit, p.revealed]);
  useEffect(() => {
    eng.current?.showCeiling(cam !== 'table');
    const v = view.current;
    if (cam === 'table') {
      // the walls are tall now, so look down from high enough to see over them into the room
      v.pitch = -1.12;
      v.dist = Math.max(v.dist, 15);
    } else if (cam === 'shoulder') {
      v.pitch = -0.18;
      v.dist = 3;
    } else v.pitch = -0.05;
  }, [cam]);

  function applyVision() {
    const e = eng.current;
    if (!e) return;
    const q = props.current;
    if (q.role === 'gm') e.setVision(q.map, { seeAll: true, revealed: q.revealed, gmShade: !q.preview });
    else e.setVision(q.map, { visible: q.visible, lit: q.lit, revealed: q.revealed ?? [] });
  }

  // ---------- tokens ----------
  function syncTokens() {
    const e = eng.current;
    if (!e) return;
    const q = props.current;
    const live = new Set<string>();
    for (const t of q.tokens) {
      if (t.hidden && q.role !== 'gm') continue;
      live.add(t.id);
      let f = figs.current.get(t.id);
      if (!f) {
        f = new Figure(t, e.vis);
        figs.current.set(t.id, f);
        e.scene.add(f.group);
        if (t.id === steerRef.current) {
          view.current.focus.copy(f.group.position);
          // start out facing the middle of the map
          const v = view.current;
          v.yaw = v.tyaw = snap8(Math.atan2(-(q.map.cols / 2 - f.group.position.x), -(q.map.rows / 2 - f.group.position.z)));
        }
      } else {
        hpPops(f.token, t);
        const moved = t.x !== f.token.x || t.y !== f.token.y;
        const path = moved ? route(q.map, f.token.x, f.token.y, t.x, t.y, t.size) : undefined;
        // a walk that didn't come from the arrow pad (a tapped square, a scripted move): turn the view the way it goes
        if (moved && t.id === steerRef.current && camRef.current !== 'table' && performance.now() - lastStep.current > 800) {
          view.current.tyaw = snap8(Math.atan2(-(t.x - f.token.x), -(t.y - f.token.y)));
        }
        f.sync(t, t.id === q.currentTokenId, path);
      }
      f.sync(t, t.id === q.currentTokenId);
      f.group.visible = !(t.hidden && q.role !== 'gm');
    }
    for (const [id, f] of figs.current)
      if (!live.has(id)) {
        e.scene.remove(f.group);
        f.dispose();
        figs.current.delete(id);
      }
  }
  useEffect(() => {
    syncTokens();
    updateHighlight();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.tokens, p.currentTokenId, ready]);

  // ---------- attacks in the log play the attack clip ----------
  useEffect(() => {
    const log = p.log ?? [];
    const last = log[log.length - 1];
    if (!last || last.id === seenLog.current) return;
    const first = seenLog.current === null;
    seenLog.current = last.id;
    if (first || last.kind !== 'roll' || !last.roll) return;
    const label = `${last.roll.label} ${last.text ?? ''}`;
    const isAttack = (!!last.damageFormula || last.hit !== undefined || /attack|hit|strike|bite|claw|slam|shot|bolt/i.test(label)) && !last.appliedTo;
    const who = p.tokens.find((t) => t.name === last.from) ?? p.tokens.find((t) => last.roll!.label.startsWith(t.name + ':')) ?? p.tokens.find((t) => t.id === p.currentTokenId);
    const aimed = last.targetId ? p.tokens.find((t) => t.id === last.targetId) : undefined;
    // an aimed attack: everyone sees Hit or Miss over the target, and the damage the table rolled lands on it
    if (aimed && last.hit !== undefined && !last.appliedTo) popFloat(aimed.id, last.hit ? (last.crit ? 'Critical hit!' : 'Hit!') : 'Miss', last.hit ? (last.crit ? 'crit' : 'hitmark') : 'miss');
    if (aimed && last.appliedTo) {
      // where this phone sees HP the drop pops as −N on its own; elsewhere show the damage rolled
      if (!(aimed.hp >= 0 && aimed.maxHp > 0)) popFloat(aimed.id, `${last.roll.total} dmg`, 'dmgroll');
      figs.current.get(aimed.id)?.play('hurt', 0.08);
      return;
    }
    if (!who) return;
    // the dice total floats up over whoever rolled it
    const r = last.roll;
    const dmg = /damage|dmg/i.test(r.label);
    popFloat(
      who.id,
      dmg ? `${r.total} dmg` : r.isD20 && r.natural === 20 ? `Crit! ${r.total}` : r.isD20 && r.natural === 1 ? `Nat 1` : `🎲 ${r.total}`,
      dmg ? 'dmgroll' : r.isD20 && r.natural === 20 ? 'crit' : r.isD20 && r.natural === 1 ? 'miss' : 'roll',
    );
    if (!isAttack) return;
    const f = figs.current.get(who.id);
    if (!f) return;
    // face the nearest token of the other side
    const foes = aimed ? [aimed] : p.tokens.filter((t) => (who.kind === 'pc' ? t.kind !== 'pc' : t.kind === 'pc') && !isDown(t));
    let best: VTok | undefined, bd = Infinity;
    for (const t of foes) {
      const d = Math.hypot(t.x - who.x, t.y - who.y);
      if (d < bd) {
        bd = d;
        best = t;
      }
    }
    if (best) f.lookAt(...Figure.centre(best));
    f.play('attack', 0.1);
  }, [p.log, p.tokens, p.currentTokenId]);

  // ---------- floating numbers ----------
  function popFloat(tokenId: string, text: string, cls: string) {
    const layer = floatLayer.current;
    if (!layer) return;
    const el = document.createElement('div');
    el.className = 'v3d-float ' + cls;
    el.textContent = text;
    layer.appendChild(el);
    // two pops on one figure at once stack instead of overlapping
    const up = floats.current.filter((f) => f.tokenId === tokenId).length * 0.28;
    floats.current.push({ el, tokenId, born: performance.now(), up });
  }
  const tmpV = useMemo(() => new THREE.Vector3(), []);
  function placeFloats() {
    const e = eng.current, el = host.current;
    const now = performance.now();
    // the target ring follows its figure and turns slowly
    const tm = targetMark.current, tf = props.current.targetId ? figs.current.get(props.current.targetId) : undefined;
    if (tm) {
      tm.visible = !!tf && tf.group.visible;
      if (tf) {
        tm.position.set(tf.group.position.x, 0.03, tf.group.position.z);
        tm.rotation.z = now / 900;
        const s = 0.5 + Math.max(1, tf.token.size) * 0.5;
        tm.scale.setScalar(s * (1 + Math.sin(now / 220) * 0.04));
      }
    }
    if (!e || !el || !floats.current.length) return;
    const w = el.clientWidth, h = el.clientHeight;
    floats.current = floats.current.filter((f) => {
      const age = (now - f.born) / 1700;
      if (age >= 1) {
        f.el.remove();
        return false;
      }
      const fig = figs.current.get(f.tokenId);
      if (!fig || !fig.group.visible) {
        f.el.style.opacity = '0';
        return true;
      }
      tmpV.copy(fig.group.position).setY(fig.height + 0.3 + f.up + age * 0.55).project(e.camera);
      if (tmpV.z > 1) {
        f.el.style.opacity = '0';
        return true;
      }
      const x = (tmpV.x * 0.5 + 0.5) * w, y = (-tmpV.y * 0.5 + 0.5) * h;
      f.el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -100%) scale(${age < 0.12 ? 0.7 + age * 2.5 : 1})`;
      f.el.style.opacity = String(age > 0.7 ? (1 - age) / 0.3 : 1);
      return true;
    });
  }
  /** Compare a token's old and new state and pop what changed: damage, healing, bloodied, down. */
  function hpPops(a: VTok, b: VTok) {
    if (a.hp >= 0 && b.hp >= 0 && a.maxHp > 0) {
      if (b.hp < a.hp) popFloat(b.id, `−${a.hp - b.hp}`, 'dmg');
      else if (b.hp > a.hp) popFloat(b.id, `+${b.hp - a.hp}`, 'heal');
      if (b.hp === 0 && a.hp > 0) popFloat(b.id, 'Down', 'down');
      return;
    }
    // HP hidden from this phone: only the bloodied/down label changes
    if ((b.hpLabel ?? '') !== (a.hpLabel ?? '')) {
      if (b.hpLabel === 'Bloodied') popFloat(b.id, 'Bloodied', 'dmg');
      else if (b.hpLabel === 'Down' || (b.hp === 0 && a.hp !== 0)) popFloat(b.id, 'Down', 'down');
    } else if (b.hp === 0 && a.hp !== 0) popFloat(b.id, 'Down', 'down');
  }

  // ---------- squares you can reach this turn ----------
  function reachable() {
    const q = props.current;
    const id = steerRef.current;
    const t = id ? q.tokens.find((k) => k.id === id) : undefined;
    if (!t || (q.canMove && !q.canMove(t))) return null;
    const feet = q.combatActive ? q.speedLeft ?? t.speed - t.movedFeet : 120;
    return { t, r: reach(q.map, t.x, t.y, Math.max(0, feet)) };
  }
  function updateHighlight() {
    const e = eng.current;
    if (!e) return;
    if (hl.current) {
      e.scene.remove(hl.current);
      hl.current.geometry.dispose();
      (hl.current.material as THREE.Material).dispose();
      hl.current = null;
    }
    const q = props.current;
    if (!q.combatActive) return;
    const rr = reachable();
    if (!rr || rr.t.id !== q.currentTokenId) return;
    const seen = q.role === 'player' ? new Set([...(q.visible ?? []), ...(q.revealed ?? [])]) : null;
    const cells = [...rr.r.cost.keys()].filter((i) => i !== rr.t.y * q.map.cols + rr.t.x && (!seen || seen.has(i)));
    if (!cells.length) return;
    const g = new THREE.PlaneGeometry(0.9, 0.9);
    g.rotateX(-Math.PI / 2);
    const mat = new THREE.MeshBasicMaterial({ color: '#4cc9f0', transparent: true, opacity: 0.22, depthWrite: false });
    const im = new THREE.InstancedMesh(g, mat, cells.length);
    const m4 = new THREE.Matrix4();
    cells.forEach((i, k) => {
      m4.makeTranslation((i % q.map.cols) + 0.5, 0.03, Math.floor(i / q.map.cols) + 0.5);
      im.setMatrixAt(k, m4);
    });
    im.renderOrder = 3;
    hl.current = im;
    e.scene.add(im);
  }
  useEffect(() => {
    updateHighlight();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.speedLeft, p.combatActive, p.visible, layoutKey]);

  // ---------- camera ----------
  const ray = useMemo(() => new THREE.Raycaster(), []);
  function placeCamera(dt: number) {
    const e = eng.current;
    if (!e) return;
    const v = view.current;
    const id = steerRef.current;
    const f = id ? figs.current.get(id) : undefined;
    if (f) v.focus.lerp(f.group.position, Math.min(1, dt * 12));
    // ease the turn buttons' yaw
    let dy = v.tyaw - v.yaw;
    while (dy > Math.PI) dy -= Math.PI * 2;
    while (dy < -Math.PI) dy += Math.PI * 2;
    v.yaw += dy * Math.min(1, dt * 10);
    const c = e.camera;
    const mode = camRef.current;
    if (f) f.group.children[0].visible = mode !== 'first';
    if (f && mode !== 'table' && !f.path.length) f.face = v.yaw + Math.PI;
    const fwd = new THREE.Vector3(-Math.sin(v.yaw), 0, -Math.cos(v.yaw));
    const right = new THREE.Vector3(Math.cos(v.yaw), 0, -Math.sin(v.yaw));
    if (mode === 'first') {
      const eyeH = f ? Math.max(0.7, f.height * 0.92) : EYE;
      c.position.set(v.focus.x, eyeH, v.focus.z).addScaledVector(fwd, 0.12);
      c.rotation.set(v.pitch, v.yaw, 0, 'YXZ');
      c.fov = 76;
    } else if (mode === 'shoulder') {
      const h = f ? f.height : 1.6;
      const head = new THREE.Vector3(v.focus.x, h * 0.95, v.focus.z);
      const back = new THREE.Vector3().copy(fwd).multiplyScalar(-Math.cos(v.pitch) * v.dist);
      const want = head.clone().add(back).addScaledVector(right, 0.42);
      // tall halls: the camera may rise well above the hero, but stays under the ceiling
      want.y = Math.min(WALL_H - 0.6, head.y + 0.45 - Math.sin(v.pitch) * v.dist * 0.8);
      // don't let walls get between the camera and the hero
      const dir = want.clone().sub(head);
      const len = dir.length();
      ray.set(head, dir.normalize());
      ray.far = len;
      const hits = e.built ? ray.intersectObjects(e.built.root.children.filter((o) => o.userData.solid), false) : [];
      const dist = hits.length ? Math.max(0.35, hits[0].distance - 0.2) : len;
      c.position.copy(head).addScaledVector(dir, dist);
      // pulled in tight by a wall: the hero would fill the screen, so look past them
      if (f) f.group.children[0].visible = dist > 0.95;
      c.lookAt(head.clone().addScaledVector(fwd, 2.5).setY(head.y - 0.15));
      c.fov = 70;
    } else {
      const d = v.dist;
      const pitch = Math.max(0.35, Math.min(1.45, -v.pitch));
      c.position.set(v.focus.x - Math.sin(v.yaw) * -Math.cos(pitch) * d, Math.sin(pitch) * d + 0.5, v.focus.z - Math.cos(v.yaw) * -Math.cos(pitch) * d);
      c.lookAt(v.focus.x, 0.3, v.focus.z);
      c.fov = 55;
    }
    c.updateProjectionMatrix();
    for (const fig of figs.current.values()) {
      const d = c.position.distanceTo(fig.group.position.clone().setY(c.position.y));
      fig.plate.sprite.visible = (mode === 'table' || fig !== f) && d > 1.6;
      // a figure right against the camera would fill the screen: hide it
      if (fig !== f) fig.group.children[0].visible = d > 0.75;
    }
  }

  // ---------- moving ----------
  function moveTo(x: number, y: number) {
    const q = props.current;
    const rr = reachable();
    if (!rr) {
      setHint(q.myTokenId ? 'You can’t move right now.' : 'Pick a token to steer.');
      return;
    }
    if (x === rr.t.x && y === rr.t.y) return;
    const cost = rr.r.cost.get(y * q.map.cols + x);
    if (cost === undefined) {
      setHint(q.combatActive ? 'That’s farther than your movement left.' : 'You can’t get there from here.');
      return;
    }
    if (q.tokens.some((t) => t.id !== rr.t.id && t.x === x && t.y === y && !t.hidden)) {
      setHint('Someone is standing there.');
      return;
    }
    q.onMove?.(rr.t.id, x, y);
  }
  function step(dir: 'f' | 'b' | 'l' | 'r') {
    const q = props.current;
    const id = steerRef.current;
    const t = id ? q.tokens.find((k) => k.id === id) : undefined;
    const v = view.current;
    if (!t) {
      // free camera for the GM: slide the focus point
      const a = v.yaw + ({ f: 0, b: Math.PI, l: Math.PI / 2, r: -Math.PI / 2 }[dir]);
      v.focus.x += -Math.sin(a) * 1;
      v.focus.z += -Math.cos(a) * 1;
      return;
    }
    lastStep.current = performance.now();
    const a = snap8(v.yaw) + ({ f: 0, b: Math.PI, l: Math.PI / 2, r: -Math.PI / 2 }[dir]);
    const dx = Math.round(-Math.sin(a)), dz = Math.round(-Math.cos(a));
    moveTo(t.x + dx, t.y + dz);
  }
  function turn(by: number) {
    const v = view.current;
    v.tyaw = snap8(v.tyaw + by);
  }

  // ---------- touch and mouse ----------
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const pts = new Map<number, { x: number; y: number; sx: number; sy: number; t: number }>();
    let pinch = 0;
    const down = (ev: PointerEvent) => {
      el.setPointerCapture(ev.pointerId);
      pts.set(ev.pointerId, { x: ev.clientX, y: ev.clientY, sx: ev.clientX, sy: ev.clientY, t: performance.now() });
      if (pts.size === 2) {
        const [a, b] = [...pts.values()];
        pinch = Math.hypot(a.x - b.x, a.y - b.y);
      }
    };
    const move = (ev: PointerEvent) => {
      const pt = pts.get(ev.pointerId);
      if (!pt) return;
      const dx = ev.clientX - pt.x, dy = ev.clientY - pt.y;
      pt.x = ev.clientX;
      pt.y = ev.clientY;
      const v = view.current;
      if (pts.size === 2) {
        const [a, b] = [...pts.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinch) v.dist = Math.max(1.2, Math.min(40, v.dist * (pinch / d)));
        pinch = d;
        return;
      }
      const k = camRef.current === 'first' ? 0.005 : 0.006;
      v.yaw -= dx * k;
      v.tyaw = v.yaw;
      v.pitch = Math.max(camRef.current === 'table' ? -1.45 : -1.1, Math.min(camRef.current === 'table' ? -0.35 : 0.9, v.pitch - dy * k));
    };
    const up = (ev: PointerEvent) => {
      const pt = pts.get(ev.pointerId);
      pts.delete(ev.pointerId);
      if (pts.size < 2) pinch = 0;
      if (!pt) return;
      if (Math.hypot(ev.clientX - pt.sx, ev.clientY - pt.sy) < 9 && performance.now() - pt.t < 450) tap(ev.clientX, ev.clientY);
    };
    const wheel = (ev: WheelEvent) => {
      ev.preventDefault();
      const v = view.current;
      v.dist = Math.max(1.2, Math.min(40, v.dist * (ev.deltaY > 0 ? 1.12 : 0.89)));
    };
    const key = (ev: KeyboardEvent) => {
      const tag = (ev.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      const k = ev.key.toLowerCase();
      if (k === 'w' || k === 'arrowup') step('f');
      else if (k === 's' || k === 'arrowdown') step('b');
      else if (k === 'a') step('l');
      else if (k === 'd') step('r');
      else if (k === 'q' || k === 'arrowleft') turn(ANG);
      else if (k === 'e' || k === 'arrowright') turn(-ANG);
      else if (k === 'v') setCam((c) => (c === 'first' ? 'shoulder' : c === 'shoulder' ? 'table' : 'first'));
      else if (k === 'g') setQuality((q) => (q === 'high' ? 'medium' : q === 'medium' ? 'low' : 'high'));
      else return;
      ev.preventDefault();
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('wheel', wheel, { passive: false });
    window.addEventListener('keydown', key);
    return () => {
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
      el.removeEventListener('wheel', wheel);
      window.removeEventListener('keydown', key);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  function tap(cx: number, cy: number) {
    const e = eng.current;
    const el = host.current;
    if (!e || !el || !e.built) return;
    const r = el.getBoundingClientRect();
    const ndc = new THREE.Vector2(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, e.camera);
    ray.far = 60;
    const q = props.current;
    const figMeshes: THREE.Object3D[] = [];
    for (const f of figs.current.values()) if (f.group.visible) figMeshes.push(f.group);
    const doorHits = [...e.built.doors.values()].map((d) => d.hit);
    const hits = ray.intersectObjects([...figMeshes, ...doorHits, ...e.built.floorMeshes, ...e.built.root.children.filter((o) => o.userData.solid)], true);
    const h = hits.find((x) => !(x.object as THREE.Sprite).isSprite);
    if (!h) return;
    // which figure, if any?
    let o: THREE.Object3D | null = h.object;
    while (o && ![...figs.current.values()].some((f) => f.group === o)) o = o.parent;
    if (o) {
      const f = [...figs.current.values()].find((k) => k.group === o)!;
      q.onTap?.({ x: 0, y: 0, gx: f.token.x + 0.5, gy: f.token.y + 0.5, edge: '', tokenId: f.token.id });
      return;
    }
    if (h.object.userData.door) {
      const k = h.object.userData.door as string;
      q.onTap?.({ x: 0, y: 0, gx: h.point.x, gy: h.point.z, edge: k });
      return;
    }
    if (steerRef.current && (h.object.userData.floor || h.point.y < 0.2)) {
      const gx = Math.floor(h.point.x), gy = Math.floor(h.point.z);
      moveTo(gx, gy);
    } else q.onTap?.({ x: 0, y: 0, gx: h.point.x, gy: h.point.z, edge: '' });
  }

  useEffect(() => {
    if (!hint) return;
    const id = setTimeout(() => setHint(null), 2200);
    return () => clearTimeout(id);
  }, [hint]);

  const steerTok = steerId ? p.tokens.find((t) => t.id === steerId) : undefined;
  return (
    <div className="v3d">
      <div ref={host} className="v3d-canvas" />
      <div ref={floatLayer} className="v3d-floats" aria-hidden />
      <div className="v3d-top">
        {p.onExit && (
          <button className="v3d-btn" onClick={p.onExit} aria-label="Back to the map">
            Map
          </button>
        )}
        <div className="v3d-seg">
          {(['first', 'shoulder', 'table'] as Cam[]).map((c) => (
            <button key={c} className={cam === c ? 'on' : ''} onClick={() => setCam(c)}>
              {c === 'first' ? 'Eyes' : c === 'shoulder' ? 'Shoulder' : 'Table'}
            </button>
          ))}
        </div>
        {p.role === 'gm' && (
          <button className={'v3d-btn' + (work ? ' on' : '')} onClick={() => setWork(!work)} title="Light the whole map, or see it by torchlight like the players">
            {work ? 'Lit' : 'Torch'}
          </button>
        )}
        <button className="v3d-btn" onClick={() => setQuality((q) => (q === 'high' ? 'medium' : q === 'medium' ? 'low' : 'high'))} title="Detail level">
          {quality === 'high' ? 'High' : quality === 'medium' ? 'Med' : 'Low'} · {fps}
        </button>
      </div>
      {p.hud ? <div className="v3d-hud">{p.hud}</div> : steerTok && p.combatActive && p.currentTokenId === steerTok.id && p.speedLeft !== undefined && <div className="v3d-feet">{p.speedLeft} ft left</div>}
      {hint && <div className="v3d-hint">{hint}</div>}
      <div className="v3d-pad">
        <button onClick={() => turn(ANG)} aria-label="Turn left">⟲</button>
        <button onClick={() => step('f')} aria-label="Step forward">▲</button>
        <button onClick={() => turn(-ANG)} aria-label="Turn right">⟳</button>
        <button onClick={() => step('l')} aria-label="Step left">◀</button>
        <button onClick={() => step('b')} aria-label="Step back">▼</button>
        <button onClick={() => step('r')} aria-label="Step right">▶</button>
      </div>
      {QUALITY[quality] && null}
    </div>
  );
}
