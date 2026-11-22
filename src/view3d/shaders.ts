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
  /** Walls: damp and darker near the floor, soot near the top, faint water streaks. */
  grime?: boolean;
  /** Outdoor ground: broad colour drift so big fields don't look stamped, and bare rock on steep slopes. */
  ground?: boolean;
  /** Water: two layers of ripples drifting different ways, and more mirror-like at a low angle. */
  water?: boolean;
  /** Leaves and grass: sway in the wind by this many units, times the vertex's aSway weight. */
  sway?: number;
  /** Glowing plants: the emissive glow takes the vertex colour. */
  emissiveVertex?: boolean;
  /** Thin out and vanish between these camera distances (grass: near the camera only). */
  fade?: [number, number];
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
  const key = `ll|${o.tri ?? 0}|${o.rv ?? 0}|${o.noVis ? 1 : 0}|${o.flicker ? 1 : 0}|${o.grime ? 1 : 0}|${o.ground ? 1 : 0}|${o.water ? 1 : 0}|${o.sway ?? 0}|${o.emissiveVertex ? 1 : 0}|${o.fade ? o.fade.join(',') : ''}`;
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, vis, { llS: { value: o.tri ?? 1 } });
    let vs = sh.vertexShader;
    if (o.sway)
      vs = 'attribute float aSway; uniform float uTime;\n' + vs.replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
{ vec3 sw = (modelMatrix * vec4(transformed, 1.0)).xyz; float ph = uTime * 1.7 + sw.x * 0.37 + sw.z * 0.29;
  float gust = 0.55 + 0.45 * sin(uTime * 0.43 + sw.x * 0.05 + sw.z * 0.03);
  transformed.x += sin(ph) * ${o.sway.toFixed(3)} * aSway * gust;
  transformed.z += cos(ph * 0.83) * ${(o.sway * 0.6).toFixed(3)} * aSway * gust; }`,
      );
    sh.vertexShader =
      'varying vec3 llP; varying vec3 llN;\n' +
      vs.replace(
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
    if (o.ground)
      fs = fs.replace(
        '#include <map_fragment>',
        `#include <map_fragment>
{ float mv = llVN(vec3(llP.x * 0.09, 0.5, llP.z * 0.09)) * 0.6 + llVN(vec3(llP.x * 0.37, 2.5, llP.z * 0.37)) * 0.4;
  diffuseColor.rgb *= 0.84 + 0.3 * mv;
  float slope = 1.0 - normalize(llN).y;
  float rn = llVN(llP * vec3(2.3, 4.1, 2.3)) * 0.65 + llVN(llP * 7.7) * 0.35;
  vec3 rock = mix(vec3(0.075, 0.07, 0.062), vec3(0.2, 0.185, 0.165), rn) * (0.8 + 0.3 * smoothstep(-0.5, 2.5, llP.y));
  rock = mix(rock, diffuseColor.rgb * 0.55, 0.25);
  float k = smoothstep(0.22, 0.5, slope + (rn - 0.5) * 0.15);
  diffuseColor.rgb = mix(diffuseColor.rgb, rock, k);
  diffuseColor.rgb *= mix(1.0, 0.72, smoothstep(-0.05, -0.6, llP.y)); }`,
      );
    if (o.water)
      fs = fs.replace(
        '#include <normal_fragment_maps>',
        `#ifdef USE_NORMALMAP_TANGENTSPACE
{ vec2 wu = llP.xz;
  vec3 n1 = texture2D(normalMap, wu * 0.19 + vec2(uTime * 0.021, uTime * 0.013)).xyz * 2.0 - 1.0;
  vec3 n2 = texture2D(normalMap, wu * 0.071 + vec2(-uTime * 0.009, uTime * 0.017)).xyz * 2.0 - 1.0;
  vec3 n3 = texture2D(normalMap, wu * 0.53 + vec2(uTime * 0.04, -uTime * 0.03)).xyz * 2.0 - 1.0;
  vec3 mapN = normalize(vec3((n1.xy * 0.5 + n2.xy * 0.35 + n3.xy * 0.25) * normalScale, 1.0));
  normal = normalize(tbn * mapN); }
#else
#include <normal_fragment_maps>
#endif
{ float fr = pow(1.0 - clamp(dot(normalize(vViewPosition), -normal) * -1.0, 0.0, 1.0), 4.0);
  diffuseColor.a = mix(diffuseColor.a, 1.0, clamp(fr, 0.0, 0.85)); }`,
      );
    if (o.sway)
      // leaf and grass cards are lit the same from both sides (no black backs)
      fs = fs.replace('#include <normal_fragment_begin>', `#include <normal_fragment_begin>
#ifdef DOUBLE_SIDED
normal *= faceDirection;
#endif`);
    if (o.fade)
      fs = fs.replace('#include <alphatest_fragment>', `#include <alphatest_fragment>
{ float fd = length(vViewPosition) + max(0.0, cameraPosition.y - llP.y - 3.5) * 2.6; if (llH(floor(llP * 9.0)) < smoothstep(${o.fade[0].toFixed(1)}, ${o.fade[1].toFixed(1)}, fd)) discard; }`);
    if (o.emissiveVertex)
      fs = fs.replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
#ifdef USE_COLOR
totalEmissiveRadiance *= vColor.rgb;
#endif`);
    if (o.grime)
      fs = fs.replace(
        '#include <color_fragment>',
        `#include <color_fragment>
{ float side = 1.0 - abs(normalize(llN).y);
  float base = smoothstep(0.0, 0.85, llP.y), top = 1.0 - smoothstep(1.7, 2.4, llP.y);
  float streak = llVN(vec3((llP.x + llP.z) * 7.0, llP.y * 0.7, 3.0));
  float damp = (1.0 - base) * llVN(llP * 2.7);
  vec3 g = diffuseColor.rgb * mix(0.62, 1.0, base) * mix(0.8, 1.0, top) * (0.9 + 0.1 * streak);
  g = mix(g, g * vec3(0.8, 0.88, 0.74), damp * 0.6);
  diffuseColor.rgb = mix(diffuseColor.rgb, g, side); }`,
      );
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
        `{ if (uVisOn > 0.5) { vec2 c = (llP.xz + llN.xz * 0.3) / uVisSize; float v = texture2D(uVis, clamp(c, 0.0, 1.0)).r;
   gl_FragColor.rgb *= v; } }
#include <fog_fragment>`,
      );
    sh.fragmentShader = fs;
  };
  m.customProgramCacheKey = () => key;
  return m;
}
