// Shader add-ons shared by every material in the 3D view:
// - fog of war: a small texture with one texel per map square says how much of that square the viewer sees
//   (0 unseen, about 0.3 remembered, 1 seen and lit); every surface multiplies its colour by it, so walls, objects and
//   figures all fade together and nothing the party hasn't seen leaks through.
// - triplanar painting: the texture is projected from the three axes by world position, so merged batches need no UVs
//   (the same trick the build kit uses for its painted grit).
import * as THREE from 'three';

export interface VisUniforms {
  uVis: { value: THREE.Texture };
  uVisSize: { value: THREE.Vector2 };
  uVisOn: { value: number };
  uTime: { value: number };
}

export function makeVisUniforms(): VisUniforms {
  const t = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1);
  t.needsUpdate = true;
  return { uVis: { value: t }, uVisSize: { value: new THREE.Vector2(1, 1) }, uVisOn: { value: 0 }, uTime: { value: 0 } };
}

export interface ShadeOpts {
  /** Project the colour map (and normal map) from the three axes, at this many repeats per world unit. */
  tri?: number;
  /** Roughness wobble 0..1 (painted look). */
  rv?: number;
  /** Skip fog of war (sky, HUD bits). */
  noVis?: boolean;
  /** Flicker the emissive colour (flames). */
  flicker?: boolean;
}

const TRI = /* glsl */ `
vec3 llW(vec3 n) { vec3 b = pow(abs(n), vec3(4.0)); return b / (b.x + b.y + b.z + 1e-5); }
float llH(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
float llVN(vec3 p) { vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(llH(i), llH(i + vec3(1,0,0)), f.x), mix(llH(i + vec3(0,1,0)), llH(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(llH(i + vec3(0,0,1)), llH(i + vec3(1,0,1)), f.x), mix(llH(i + vec3(0,1,1)), llH(i + vec3(1,1,1)), f.x), f.y), f.z); }
`;

/** Adds fog of war and optional triplanar painting to a built-in material. Call once per material. */
export function shade<M extends THREE.Material>(m: M, vis: VisUniforms, o: ShadeOpts = {}): M {
  const key = `ll|${o.tri ?? 0}|${o.rv ?? 0}|${o.noVis ? 1 : 0}|${o.flicker ? 1 : 0}`;
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, vis, { llS: { value: o.tri ?? 1 } });
    sh.vertexShader =
      'varying vec3 llP; varying vec3 llN;\n' +
      sh.vertexShader.replace(
        '#include <project_vertex>',
        `#include <project_vertex>
{ vec4 lwp = vec4(transformed, 1.0); vec3 lwn = normal;
#ifdef USE_INSTANCING
  lwp = instanceMatrix * lwp; lwn = mat3(instanceMatrix) * lwn;
#endif
  lwp = modelMatrix * lwp; llP = lwp.xyz; llN = normalize(mat3(modelMatrix) * lwn); }`,
      );
    let fs =
      'uniform sampler2D uVis; uniform vec2 uVisSize; uniform float uVisOn; uniform float uTime; uniform float llS; varying vec3 llP; varying vec3 llN;\n' +
      TRI +
      sh.fragmentShader;
    if (o.tri) {
      fs = fs.replace(
        '#include <map_fragment>',
        `#ifdef USE_MAP
{ vec3 bw = llW(llN); vec3 q = llP * llS; vec4 tx = texture2D(map, q.zy) * bw.x + texture2D(map, q.xz) * bw.y + texture2D(map, q.xy) * bw.z; diffuseColor *= tx; }
#endif`,
      );
      if (o.rv)
        fs = fs.replace(
          '#include <roughnessmap_fragment>',
          `#include <roughnessmap_fragment>
roughnessFactor = clamp(roughnessFactor * (1.0 - ${o.rv.toFixed(2)} + 2.0 * ${o.rv.toFixed(2)} * llVN(llP * 2.3 + 1.7)), 0.05, 1.0);`,
        );
      fs = fs.replace(
        '#include <normal_fragment_maps>',
        `#ifdef USE_NORMALMAP_TANGENTSPACE
{ vec3 bw = llW(llN); vec3 q = llP * llS;
  vec3 a = texture2D(normalMap, q.zy).xyz * 2.0 - 1.0, b = texture2D(normalMap, q.xz).xyz * 2.0 - 1.0, c = texture2D(normalMap, q.xy).xyz * 2.0 - 1.0;
  vec3 wn = normalize(llN);
  vec3 nx = vec3(0.0, a.y, a.x) * normalScale.x, ny = vec3(b.x, 0.0, b.y) * normalScale.x, nz = vec3(c.x, c.y, 0.0) * normalScale.x;
  vec3 pw = normalize(wn + nx * bw.x + ny * bw.y + nz * bw.z);
  normal = normalize((viewMatrix * vec4(pw, 0.0)).xyz); }
#else
#include <normal_fragment_maps>
#endif`,
      );
    }
    if (o.flicker && !fs.includes('#include <emissivemap_fragment>'))
      fs = fs.replace(
        '#include <color_fragment>',
        `#include <color_fragment>
diffuseColor.rgb *= 0.85 + 0.15 * sin(uTime * 9.0 + llP.x * 3.1 + llP.z * 2.3) * sin(uTime * 13.7 + llP.z);`,
      );
    if (o.flicker)
      fs = fs.replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
totalEmissiveRadiance *= 0.82 + 0.18 * sin(uTime * 9.0 + llP.x * 3.1 + llP.z * 2.3) * sin(uTime * 13.7 + llP.z);`,
      );
    if (!o.noVis)
      fs = fs.replace(
        '#include <fog_fragment>',
        `{ if (uVisOn > 0.5) { vec2 c = (llP.xz + llN.xz * 0.3) / uVisSize; float v = (c.x < 0.0 || c.y < 0.0 || c.x > 1.0 || c.y > 1.0) ? 0.0 : texture2D(uVis, c).r;
   gl_FragColor.rgb *= v; } }
#include <fog_fragment>`,
      );
    sh.fragmentShader = fs;
  };
  m.customProgramCacheKey = () => key;
  return m;
}
