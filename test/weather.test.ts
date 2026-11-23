import { describe, it, expect } from 'vitest';
import { HostCore, newGame } from '../src/engine/game';
import { blankMap } from '../src/engine/map';
import { cleanWeather, weatherRules, weatherName, WEATHER_PRESETS, isClear } from '../src/engine/weather';

describe('weather', () => {
  it('the GM sets it, everyone sees it, and the log says what it means', () => {
    const core = new HostCore(newGame('ABCDEF', blankMap(10, 10)));
    core.handle('gm', { t: 'hello', name: 'Ana', clientId: 'p1' } as never);
    const storm = WEATHER_PRESETS.find((p) => p.id === 'storm')!.w;
    core.handle('gm', { t: 'gm:weather', weather: storm });
    expect(core.s.weather?.precip).toBe('storm');
    expect(core.s.log[core.s.log.length - 1]?.text).toMatch(/Thunderstorm/);
    expect(core.s.log[core.s.log.length - 1]?.text).toMatch(/ranged weapon attacks have disadvantage/);
    expect(core.view('gm').weather?.wind).toBe(2);
    core.handle('gm', { t: 'gm:weather', weather: null });
    expect(core.s.weather).toBeUndefined();
    expect(core.s.log[core.s.log.length - 1]?.text).toBe('The weather clears.');
  });
  it('players cannot change it', () => {
    const core = new HostCore(newGame('ABCDEF', blankMap(10, 10)));
    expect(() => core.handle('p1', { t: 'gm:weather', weather: null })).toThrow();
  });
  it('cleans what a phone sends', () => {
    const w = cleanWeather({ precip: 'lava', fog: 9, wind: -2, gloom: 1.6, temp: 'boiling' });
    expect(w).toEqual({ precip: 'none', fog: 3, wind: 0, gloom: 2, temp: 'mild', lightning: false });
    expect(isClear(cleanWeather({}))).toBe(true);
  });
  it('rules notes follow the weather', () => {
    expect(weatherRules(cleanWeather({ fog: 3 }))[0]).toMatch(/Heavily obscured/);
    expect(weatherRules(cleanWeather({ precip: 'rain' })).join(' ')).toMatch(/Lightly obscured/);
    expect(weatherRules(cleanWeather({ temp: 'cold' })).join(' ')).toMatch(/DC 10 Constitution/);
    for (const p of WEATHER_PRESETS) expect(weatherName(p.w)).toBe(p.name);
  });
});
