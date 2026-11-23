// The figure lineup at ?figures3d: the 3D base models (skeleton, wizard, witch, knight, ghost, zombie, goblin, orc,
// dragon, spider and the rest) standing in one hall, with the weather picker so you can see them in rain or fog.
import { useMemo, useState } from 'react';
import { blankMap } from '../engine/map';
import type { Token } from '../engine/game';
import { creatureById } from '../library/creatures';
import { WEATHER_PRESETS } from '../engine/weather';
import View3D from './View3D';
import { lookFor } from './figures';
import { toast } from '../ui/common';

const LINEUP = [
  'skeleton', 'zombie', 'ghost', 'wraith', 'lich', 'mage', 'archmage', 'green-hag', 'night-hag', 'priest', 'cultist', 'knight', 'guard',
  'goblin', 'kobold', 'orc', 'troll', 'warhorse-skeleton', 'giant-spider', 'wolf', 'dragon-red-young', 'dragon-green-adult', 'wyvern', 'dragon-gold-wyrmling',
  'witch', 'wizard', 'necromancer', 'skeleton-archer', 'bone-dragon', 'hero-human-wizard', 'hero-elf-paladin', 'commoner',
];

export default function Figures3D() {
  const [preset, setPreset] = useState('clear');
  const weather = WEATHER_PRESETS.find((p) => p.id === preset)?.w;
  const { map, tokens } = useMemo(() => {
    const ids = LINEUP.filter((id) => creatureById(id));
    const COLS = 28;
    const tokens: Token[] = [];
    let x = 2, y = 2, rowH = 1;
    for (const [i, id] of ids.entries()) {
      const def = creatureById(id)!;
      const size = def.size === 'Gargantuan' ? 4 : def.size === 'Huge' ? 3 : def.size === 'Large' ? 2 : 1;
      if (x + size > COLS - 2) { x = 2; y += rowH + 1; rowH = 1; }
      tokens.push({ id: 'f' + i, kind: 'monster', name: def.name, x, y, size, color: '#c0a060', hidden: false, hp: 10, maxHp: 10, ac: 10, conditions: [], initMod: 0, speed: 30, movedFeet: 0, art: id });
      x += size + 1;
      rowH = Math.max(rowH, size);
    }
    const rows = y + rowH + 3;
    const m = blankMap(COLS, rows, 'Figure lineup');
    for (let r = 1; r < rows - 1; r++) for (let c = 1; c < COLS - 1; c++) m.cells[r * COLS + c] = 1;
    m.ambient = 'bright';
    m.playerStart = [Math.floor(COLS / 2), rows - 2];
    return { map: m, tokens };
  }, []);
  return (
    <div className="screen" style={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
      <div className="v3d-caption" style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
        <select value={preset} onChange={(e) => setPreset(e.target.value)} aria-label="Weather">
          {WEATHER_PRESETS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <span className="small">{tokens.length} figures · tap one for its name and look</span>
      </div>
      <View3D
        map={map}
        role="gm"
        preview
        tokens={tokens}
        weather={weather}
        cam="table"
        startDist={12}
        onTap={(info) => {
          const t = info.tokenId && tokens.find((k) => k.id === info.tokenId);
          if (t) toast(`${t.name} · ${lookFor(t, creatureById(t.art!))}`);
        }}
      />
    </div>
  );
}
