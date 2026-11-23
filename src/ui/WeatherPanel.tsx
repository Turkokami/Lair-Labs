// The GM's weather controls: pick a preset, then fine-tune rain, fog, wind, gloom and temperature.
import { CLEAR, FOG_LABELS, GLOOM_LABELS, PRECIP_LABELS, TEMP_LABELS, WEATHER_PRESETS, WIND_LABELS, cleanWeather, isClear, weatherName, weatherRules, type Level, type Precip, type Weather } from '../engine/weather';

export function WeatherPanel({ weather, set }: { weather?: Weather; set: (w: Weather | null) => void }) {
  const w = weather ?? CLEAR;
  const put = (patch: Partial<Weather>) => {
    const next = cleanWeather({ ...w, ...patch });
    set(isClear(next) ? null : next);
  };
  const preset = WEATHER_PRESETS.find((p) => weatherName(p.w) === weatherName(weather))?.id ?? '';
  const lvl = (labels: string[], value: Level, key: 'fog' | 'wind' | 'gloom') => (
    <div className="seg" role="group" aria-label={key}>
      {labels.map((l, i) => (
        <button key={l} className={value === i ? 'on' : ''} onClick={() => put({ [key]: i as Level })}>{l}</button>
      ))}
    </div>
  );
  const rules = weatherRules(weather);
  return (
    <div className="stack weather-panel">
      <label className="inline">Weather
        <select value={preset} onChange={(e) => { const p = WEATHER_PRESETS.find((x) => x.id === e.target.value); if (p) set(isClear(p.w) ? null : p.w); }}>
          {!preset && <option value="">Custom: {weatherName(weather)}</option>}
          {WEATHER_PRESETS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </label>
      <label className="inline">Falling
        <select value={w.precip} onChange={(e) => put({ precip: e.target.value as Precip, lightning: e.target.value === 'storm' ? true : w.lightning && e.target.value !== 'none' })}>
          {(Object.keys(PRECIP_LABELS) as Precip[]).map((k) => <option key={k} value={k}>{PRECIP_LABELS[k]}</option>)}
        </select>
      </label>
      <div className="small muted">Fog</div>
      {lvl(FOG_LABELS, w.fog, 'fog')}
      <div className="small muted">Wind</div>
      {lvl(WIND_LABELS, w.wind, 'wind')}
      <div className="small muted">Sky</div>
      {lvl(GLOOM_LABELS, w.gloom, 'gloom')}
      <div className="row gap wrap">
        <label className="inline">Temperature
          <select value={w.temp} onChange={(e) => put({ temp: e.target.value as Weather['temp'] })}>
            {(Object.keys(TEMP_LABELS) as Weather['temp'][]).map((k) => <option key={k} value={k}>{TEMP_LABELS[k]}</option>)}
          </select>
        </label>
        <label className="inline"><input type="checkbox" checked={!!w.lightning} onChange={(e) => put({ lightning: e.target.checked })} /> Lightning</label>
      </div>
      {rules.length > 0 ? (
        <ul className="small muted weather-rules">{rules.map((r) => <li key={r}>{r}</li>)}</ul>
      ) : (
        <p className="small muted">Clear skies. Weather shows on the map and in 3D for everyone, and players get a note on what it means.</p>
      )}
    </div>
  );
}
