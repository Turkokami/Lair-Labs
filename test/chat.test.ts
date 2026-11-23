import { describe, it, expect } from 'vitest';
import { HostCore, newGame } from '../src/engine/game';
import { blankMap } from '../src/engine/map';

describe('chat rolls', () => {
  it('rolls dice written inline and with /r', () => {
    const core = new HostCore(newGame('ABCDEF', blankMap(10, 10)));
    core.handle('gm', { t: 'chat', text: 'The trap deals [[2d1+3]] damage and [[oops]] stays' });
    const e = core.s.log[core.s.log.length - 1];
    expect(e.kind).toBe('chat');
    expect(e.inline?.[0].total).toBe(5);
    expect(e.text).toBe('The trap deals [[0]] damage and [[oops]] stays');
    core.handle('gm', { t: 'chat', text: '/r 1d1+4 # Perception' });
    const r = core.s.log[core.s.log.length - 1];
    expect(r.kind).toBe('roll');
    expect(r.roll?.total).toBe(5);
    expect(r.roll?.label).toBe('Perception');
    expect(() => core.handle('gm', { t: 'chat', text: '/r banana' })).toThrow();
  });
});
