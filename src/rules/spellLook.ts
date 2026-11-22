// How each spell looks when it goes off, shared by the 3D view and the overhead map (no three.js here, so the map stays light).

/** Colour pairs by damage type: the hot core, then what it cools to. */
export const TYPE: Record<string, [string, string]> = {
  fire: ['#ffd27a', '#ff4a12'], cold: ['#eaffff', '#5cc8ff'], force: ['#f2e6ff', '#9a5cff'], radiant: ['#fffbe0', '#ffc94a'],
  necrotic: ['#d8ffd0', '#3a8a4a'], lightning: ['#ffffff', '#6ab8ff'], thunder: ['#f0eaff', '#8a7cff'], acid: ['#f4ffc0', '#7ad12a'],
  poison: ['#e0ffb0', '#4fa82a'], psychic: ['#ffe0f6', '#e04ac0'], heal: ['#fffbd0', '#5cf08a'], shield: ['#e8f8ff', '#5ab8ff'],
};
export const fxColours = (type?: string) => TYPE[type ?? ''] ?? TYPE.force;

export type FxKindName = 'bolt' | 'ray' | 'darts' | 'burst' | 'heal' | 'shield' | 'smite' | 'plain';
/** Which effect a spell plays, from its data. */
export function fxKind(sp: { id: string; attack?: string; save?: string; heal?: string; burst?: number }): FxKindName {
  if (sp.id === 'shield') return 'shield';
  if (sp.id === 'magicMissile') return 'darts';
  if (sp.id === 'rayOfFrost' || sp.id === 'eldritchBlast' || sp.id === 'scorchingRay') return 'ray';
  if (sp.heal) return 'heal';
  if (sp.burst) return 'burst';
  if (sp.attack) return 'bolt';
  if (sp.save) return 'smite';
  return 'plain';
}
