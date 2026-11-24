import { MONSTERS } from '../src/rules/monsters';
import { CREATURES } from '../src/library/creatures';
import { OBJECTS } from '../src/library/objects';
console.log('MONSTERS (id CR xp):');
console.log(MONSTERS.map((m) => `${m.id} ${m.cr} ${m.xp}`).join('; '));
console.log('\nCREATURE ART ids:');
console.log((CREATURES as any[]).map((c) => c.id).join(' '));
console.log('\nOBJECT ids:');
console.log((OBJECTS as any[]).map((o) => o.id).join(' '));
