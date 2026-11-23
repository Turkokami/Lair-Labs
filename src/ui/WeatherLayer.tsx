// Weather drawn over the overhead map: rain, snow, hail, sand, ash, embers and leaves blowing with the wind, fog
// drifting across, gloom, heat or frost tints and lightning. It's a see-through canvas on top of the map, so the
// map itself doesn't redraw; it only runs while there is weather to show.
import { useEffect, useRef } from 'react';
import { isClear, weatherName, weatherRules, type Weather } from '../engine/weather';

interface P { x: number; y: number; vx: number; vy: number; s: number; a: number; ph: number }
interface Puff { x: number; y: number; r: number; a: number; v: number }

const WIND_PX = [0, 90, 260, 520];
const FOG_A = [0, 0.18, 0.36, 0.58];
const VEIL_A = [0, 0.04, 0.1, 0.22];
const GLOOM_A = [0, 0.12, 0.28, 0.46];

const LOOK: Record<string, { dens: number; fall: [number, number]; size: [number, number]; col: string; kind: 'streak' | 'dot' | 'leaf' | 'spark'; up?: boolean }> = {
  drizzle: { dens: 0.00014, fall: [520, 680], size: [6, 10], col: '#b8cce4', kind: 'streak' },
  rain: { dens: 0.00042, fall: [820, 1000], size: [12, 18], col: '#a9c3e6', kind: 'streak' },
  storm: { dens: 0.0006, fall: [1000, 1250], size: [16, 24], col: '#b4c8ea', kind: 'streak' },
  hail: { dens: 0.00028, fall: [650, 820], size: [1.6, 2.6], col: '#f2f6ff', kind: 'dot' },
  snow: { dens: 0.00026, fall: [40, 90], size: [1.4, 3.2], col: '#ffffff', kind: 'dot' },
  blizzard: { dens: 0.0007, fall: [120, 200], size: [1.2, 3], col: '#ffffff', kind: 'dot' },
  sand: { dens: 0.0006, fall: [20, 60], size: [5, 10], col: '#d8b46a', kind: 'streak' },
  ash: { dens: 0.0003, fall: [25, 55], size: [1.2, 2.8], col: '#9a948c', kind: 'dot' },
  embers: { dens: 0.00012, fall: [30, 70], size: [1.2, 2.4], col: '#ff9a3c', kind: 'spark', up: true },
  leaves: { dens: 0.00005, fall: [40, 80], size: [4, 7], col: '#c8742a', kind: 'leaf' },
};
const LEAF_COLS = ['#c8742a', '#b84a22', '#d9a23a', '#8a5a2a', '#9a8a3a'];

export function WeatherLayer({ weather, soft }: { weather?: Weather; soft?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const wRef = useRef(weather);
  wRef.current = weather;
  const on = !isClear(weather);
  useEffect(() => {
    if (!on) return;
    const c = ref.current!;
    const g = c.getContext('2d')!;
    let W = 0, H = 0, raf = 0, last = performance.now();
    let parts: P[] = [];
    let puffs: Puff[] = [];
    let flash = 0, nextBolt = performance.now() + 3000 + Math.random() * 5000;
    let key = '';
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const rnd = (a: number, b: number) => a + Math.random() * (b - a);
    const seed = () => {
      const w = wRef.current!;
      const L = LOOK[w.precip];
      parts = [];
      if (L) {
        const n = Math.min(650, Math.round(W * H * L.dens));
        for (let i = 0; i < n; i++) parts.push({ x: Math.random() * W, y: Math.random() * H, vx: 0, vy: rnd(...L.fall), s: rnd(...L.size), a: rnd(0.45, 1), ph: Math.random() * 6.28 });
      }
      puffs = [];
      if (w.fog || w.precip === 'sand' || w.precip === 'ash') {
        const n = 7 + w.fog * 3;
        for (let i = 0; i < n; i++) puffs.push({ x: Math.random() * W * 1.4 - W * 0.2, y: Math.random() * H, r: rnd(0.25, 0.5) * Math.max(W, H), a: rnd(0.5, 1), v: rnd(0.6, 1.2) });
      }
    };
    const size = () => {
      const r = c.parentElement!.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width; H = r.height;
      c.width = Math.max(1, Math.round(W * dpr)); c.height = Math.max(1, Math.round(H * dpr));
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };
    const ro = new ResizeObserver(size);
    ro.observe(c.parentElement!);
    size();

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const w = wRef.current;
      if (!w || isClear(w)) return;
      const k = JSON.stringify(w);
      if (k !== key) { key = k; seed(); }
      const L = LOOK[w.precip];
      const wind = WIND_PX[w.wind] * (w.precip === 'sand' ? 1.6 : 1);
      const f = soft ? 0.5 : 1;
      g.clearRect(0, 0, W, H);
      // tints under everything
      if (w.gloom) { g.fillStyle = `rgba(8,12,30,${GLOOM_A[w.gloom] * f})`; g.fillRect(0, 0, W, H); }
      if (w.temp === 'hot') { g.fillStyle = `rgba(255,120,40,${0.07 * f})`; g.fillRect(0, 0, W, H); }
      if (w.temp === 'cold') {
        const gr = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75);
        gr.addColorStop(0, 'rgba(190,220,255,0)'); gr.addColorStop(1, `rgba(215,235,255,${0.32 * f})`);
        g.fillStyle = gr; g.fillRect(0, 0, W, H);
      }
      // fog banks drifting with the wind
      if (puffs.length) {
        const col = w.precip === 'sand' ? '216,180,110' : w.precip === 'ash' ? '110,104,98' : w.precip === 'embers' ? '120,80,60' : '226,230,236';
        const fa = Math.max(FOG_A[w.fog], w.precip === 'sand' || w.precip === 'ash' ? 0.3 : 0) * f;
        g.fillStyle = `rgba(${col},${VEIL_A[w.fog] * f})`; g.fillRect(0, 0, W, H);
        for (const p of puffs) {
          p.x += (12 + wind * 0.35) * p.v * dt;
          if (p.x - p.r > W) { p.x = -p.r; p.y = Math.random() * H; }
          const gr = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
          gr.addColorStop(0, `rgba(${col},${fa * p.a})`); gr.addColorStop(1, `rgba(${col},0)`);
          g.fillStyle = gr; g.fillRect(p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
        }
      }
      // falling things
      if (L) {
        g.save();
        if (L.kind === 'spark') g.globalCompositeOperation = 'lighter';
        g.lineCap = 'round';
        for (const p of parts) {
          const sway = L.kind === 'dot' || L.kind === 'leaf' ? Math.sin(now / 700 + p.ph) * 22 : 0;
          const vx = wind * (L.kind === 'streak' ? 0.8 : 1) + sway;
          const vy = L.up ? -p.vy : p.vy;
          p.x += vx * dt; p.y += vy * dt;
          if (p.y > H + 20) { p.y = -20; p.x = Math.random() * (W + 200) - 100; }
          if (p.y < -20) { p.y = H + 20; p.x = Math.random() * W; }
          if (p.x > W + 40) p.x -= W + 80;
          if (p.x < -40) p.x += W + 80;
          if (L.kind === 'streak') {
            const len = p.s, sp = Math.hypot(vx, vy) || 1;
            g.strokeStyle = L.col; g.globalAlpha = p.a * 0.55; g.lineWidth = w.precip === 'sand' ? 1.6 : 1.1;
            g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(p.x - (vx / sp) * len, p.y - (vy / sp) * len); g.stroke();
          } else if (L.kind === 'leaf') {
            g.globalAlpha = p.a * 0.9; g.fillStyle = LEAF_COLS[Math.floor(p.ph) % LEAF_COLS.length];
            g.beginPath(); g.ellipse(p.x, p.y, p.s, p.s * 0.45, now / 400 + p.ph, 0, Math.PI * 2); g.fill();
          } else {
            g.globalAlpha = L.kind === 'spark' ? p.a * (0.6 + 0.4 * Math.sin(now / 120 + p.ph)) : p.a * 0.85;
            g.fillStyle = L.col;
            g.beginPath(); g.arc(p.x, p.y, p.s, 0, Math.PI * 2); g.fill();
          }
        }
        g.restore();
      }
      // lightning
      if (w.lightning && !reduce) {
        if (now > nextBolt) { flash = 1; nextBolt = now + 4000 + Math.random() * 7000; }
        if (flash > 0) {
          const twice = flash > 0.55 && flash < 0.7 ? 0.2 : 1;
          g.fillStyle = `rgba(235,240,255,${0.5 * flash * twice * f})`; g.fillRect(0, 0, W, H);
          flash = Math.max(0, flash - dt * 3.2);
        }
      }
      if (!reduce && !document.hidden) raf = requestAnimationFrame(frame);
      else if (!reduce) raf = window.setTimeout(() => (raf = requestAnimationFrame(frame)), 500) as unknown as number;
    };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); clearTimeout(raf); ro.disconnect(); };
  }, [on, soft]);
  if (!on) return null;
  return <canvas ref={ref} className="weather-layer" aria-hidden="true" />;
}

const ICON: Record<string, string> = { none: '🌫️', drizzle: '🌦️', rain: '🌧️', storm: '⛈️', snow: '🌨️', blizzard: '❄️', hail: '🧊', sand: '🏜️', ash: '🌋', embers: '🔥', leaves: '🍂' };

/** A small tag on the map naming the weather; tap it for what it means at the table. */
export function WeatherChip({ weather }: { weather?: Weather }) {
  if (isClear(weather)) return null;
  const w = weather!;
  const icon = w.precip !== 'none' ? ICON[w.precip] : w.gloom >= 3 ? '🌙' : w.wind >= 2 ? '💨' : w.temp === 'hot' ? '☀️' : w.temp === 'cold' ? '🥶' : ICON.none;
  const rules = weatherRules(w);
  return (
    <details className="weather-chip">
      <summary>{icon} {weatherName(w)}</summary>
      {rules.length > 0 && <ul>{rules.map((r) => <li key={r}>{r}</li>)}</ul>}
    </details>
  );
}
