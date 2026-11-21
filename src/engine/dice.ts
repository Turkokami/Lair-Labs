// Dice notation parser and roller. Rolls use the platform's cryptographic random source.
export interface DieTerm { kind: 'dice'; sign: 1 | -1; count: number; sides: number; keep?: { hl: 'h' | 'l'; n: number }; drop?: { hl: 'h' | 'l'; n: number }; reroll?: number; }
export interface ConstTerm { kind: 'const'; sign: 1 | -1; value: number; }
export type Term = DieTerm | ConstTerm;

export interface RolledTerm { term: Term; rolls: number[]; kept: boolean[]; rerolled: number[]; subtotal: number; }
export interface RollResult { formula: string; label: string; terms: RolledTerm[]; total: number; natural?: number; isD20: boolean; }

export function randInt(sides: number): number {
  if (sides < 1) return 0;
  const max = Math.floor(0x100000000 / sides) * sides;
  const buf = new Uint32Array(1);
  for (;;) {
    crypto.getRandomValues(buf);
    if (buf[0] < max) return (buf[0] % sides) + 1;
  }
}

export function parse(input: string): { terms: Term[]; label: string } {
  let [expr, ...rest] = input.split('#');
  const label = rest.join('#').trim();
  expr = expr.replace(/\s+/g, '').toLowerCase().replace(/d%/g, 'd100');
  if (!expr) throw new Error('Empty roll');
  const terms: Term[] = [];
  const re = /([+-]?)([^+-]+)/g;
  let m: RegExpExecArray | null;
  let consumed = 0;
  while ((m = re.exec(expr))) {
    consumed += m[0].length;
    const sign: 1 | -1 = m[1] === '-' ? -1 : 1;
    const body = m[2];
    const dm = /^(\d*)d(\d+)((?:kh|kl|dh|dl|k|d)\d+)?(r\d+)?$/.exec(body);
    if (dm) {
      const count = dm[1] ? parseInt(dm[1], 10) : 1;
      const sides = parseInt(dm[2], 10);
      if (count < 1 || count > 100 || sides < 1 || sides > 1000) throw new Error('Too many dice');
      const t: DieTerm = { kind: 'dice', sign, count, sides };
      if (dm[3]) {
        const mm = /^(kh|kl|dh|dl|k|d)(\d+)$/.exec(dm[3])!;
        const op = mm[1] === 'k' ? 'kh' : mm[1] === 'd' ? 'dl' : mm[1];
        const n = parseInt(mm[2], 10);
        if (op[0] === 'k') t.keep = { hl: op[1] as 'h' | 'l', n };
        else t.drop = { hl: op[1] as 'h' | 'l', n };
      }
      if (dm[4]) t.reroll = parseInt(dm[4].slice(1), 10);
      terms.push(t);
    } else if (/^\d+$/.test(body)) {
      terms.push({ kind: 'const', sign, value: parseInt(body, 10) });
    } else {
      throw new Error(`Can't read "${body}"`);
    }
  }
  if (consumed !== expr.length || !terms.length) throw new Error('Bad roll');
  return { terms, label };
}

export function roll(input: string, rng: (s: number) => number = randInt): RollResult {
  const { terms, label } = parse(input);
  const rolled: RolledTerm[] = [];
  let total = 0;
  for (const t of terms) {
    if (t.kind === 'const') {
      rolled.push({ term: t, rolls: [], kept: [], rerolled: [], subtotal: t.sign * t.value });
      total += t.sign * t.value;
      continue;
    }
    const rolls: number[] = [];
    const rerolled: number[] = [];
    for (let i = 0; i < t.count; i++) {
      let v = rng(t.sides);
      if (t.reroll !== undefined && v <= t.reroll) {
        rerolled.push(v);
        v = rng(t.sides);
      }
      rolls.push(v);
    }
    const kept = rolls.map(() => true);
    const order = rolls.map((v, i) => [v, i] as const).sort((a, b) => a[0] - b[0]);
    if (t.keep) {
      const n = Math.min(t.keep.n, rolls.length);
      const keepIdx = new Set((t.keep.hl === 'h' ? order.slice(order.length - n) : order.slice(0, n)).map((x) => x[1]));
      kept.forEach((_, i) => (kept[i] = keepIdx.has(i)));
    } else if (t.drop) {
      const n = Math.min(t.drop.n, rolls.length);
      const dropIdx = new Set((t.drop.hl === 'l' ? order.slice(0, n) : order.slice(order.length - n)).map((x) => x[1]));
      kept.forEach((_, i) => (kept[i] = !dropIdx.has(i)));
    }
    const subtotal = t.sign * rolls.reduce((s, v, i) => s + (kept[i] ? v : 0), 0);
    rolled.push({ term: t, rolls, kept, rerolled, subtotal });
    total += subtotal;
  }
  const d20 = rolled.filter((r) => r.term.kind === 'dice' && (r.term as DieTerm).sides === 20);
  let natural: number | undefined;
  if (d20.length === 1) {
    const r = d20[0];
    const keptVals = r.rolls.filter((_, i) => r.kept[i]);
    if (keptVals.length === 1) natural = keptVals[0];
  }
  return { formula: input.split('#')[0].trim(), label, terms: rolled, total, natural, isD20: d20.length > 0 };
}

/** Double the dice in a damage formula (critical hit): "1d8+3" -> "2d8+3" */
export function critFormula(f: string): string {
  return f.replace(/(\d*)d(\d+)/g, (_, n, s) => `${(n ? parseInt(n, 10) : 1) * 2}d${s}`);
}

export function d20Formula(mod: number, adv: 'none' | 'adv' | 'dis' = 'none'): string {
  const base = adv === 'adv' ? '2d20kh1' : adv === 'dis' ? '2d20kl1' : '1d20';
  return mod === 0 ? base : `${base}${mod > 0 ? '+' : ''}${mod}`;
}

export function describe(r: RollResult): string {
  return r.terms
    .map((t, i) => {
      const sign = t.term.sign < 0 ? ' − ' : i > 0 ? ' + ' : '';
      if (t.term.kind === 'const') return `${sign}${t.term.value}`;
      return `${sign}[${t.rolls.map((v, j) => (t.kept[j] ? `${v}` : `~${v}~`)).join(', ')}]`;
    })
    .join('');
}
