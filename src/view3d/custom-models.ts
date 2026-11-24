// Your own character models and moves for the 3D view.
//
// Every figure starts as a built-in stand-in (hero, humanoid, beast, blob...) with idle, walk, attack, hurt and die
// moves that the game already plays: walking a move, an attack roll, losing HP, dropping to 0. Register a model here
// and figures that match it use yours instead, with the same moves wired to the same game events.
//
// Match keys, checked in this order: creature art id (e.g. 'skeleton'), monster id, character id, then 'pc', 'monster',
// 'npc', and '*' for everything. Models load only when a figure on the map needs them, so this list can grow freely.
//
// Moves: a glTF's animations are matched by name (idle, walk/run, attack/slash/cast, hurt/hit, die/death). Any move
// a model doesn't have falls back to a simple whole-body version, so a model with no animations still works.
//
// Examples (put .glb files in public/models/):
//   registerFigureGLTF('pc', '/models/hero.glb');                    // every player character
//   registerFigureGLTF('skeleton', '/models/skeleton.glb', { height: 1.25 });
//   registerFigureModel('slime', () => ({ object: makeMySlimeMesh() }));
import { registerFigureGLTF, registerFigureModel } from './figures';

export function registerCustomModels() {
  // Add yours here. Remote models are listed in public/models/remote.json and downloaded at build time.
  registerFigureGLTF('skeleton-knight', '/models/skeleton-knight.glb', { height: 1.7 }); // Skeleton Knight (Trellis, from the concept sheet)
  void registerFigureModel;
}
