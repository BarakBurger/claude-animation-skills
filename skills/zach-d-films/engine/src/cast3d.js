// cast3d.js : more than one kind of person, in three dimensions.
//
// The companion to cast.js. The zach-d-films rig draws one body in four medieval
// outfits, because it was built for an armour short. This gives the same rig the
// vocabulary the 2D kit has: build, skin, outfit, hair, hairCol, beard, glasses.
//
// It does NOT modify human.js. It borrows the one exported primitive it needs,
// torsoShell, and builds the rest itself, so a pull on the pack keeps working.
import * as THREE from 'three';
import { torsoShell } from './human.js';

// ---------- the same names the 2D kit uses, so a character reads across both ----------
export const SKIN3 = {
  porcelain: 0xf5e0d0, fair: 0xeed6c0, light: 0xe3c3a3, tan: 0xcf9f78,
  olive: 0xb98a5e, brown: 0x926238, deep: 0x6d4524, dark: 0x4f3119,
};
export const HAIRCOL3 = {
  black: 0x1b1714, darkBrown: 0x2b1d18, brown: 0x4a3326, chestnut: 0x6b4423,
  auburn: 0x7a3b20, ginger: 0xb4571f, sand: 0xc9a473, blonde: 0xdcb45c,
  platinum: 0xe9dfc6, ash: 0x9a8f84, grey: 0xb3aea8, silver: 0xcfd4d7,
  white: 0xe9e6e0, red: 0xb02a1d, plum: 0x7b2d4e, pink: 0xd4588f,
  brightPink: 0xff5fa2, blue: 0x3a62a8, teal: 0x2f8f82, violet: 0x7a4bc4,
};
// Every width is a multiplier on the rig's own proportions, the same idea as the
// 2D BUILD table: shoulders, chest, waist, hip, limb thickness.
export const BUILD3 = {
  slim:     { sh: 0.92, chest: 0.90, waist: 0.88, hip: 0.92, limb: 0.90, h: 1.00 },
  athletic: { sh: 1.08, chest: 1.04, waist: 0.92, hip: 0.98, limb: 1.02, h: 1.01 },
  muscular: { sh: 1.22, chest: 1.16, waist: 1.00, hip: 1.04, limb: 1.18, h: 1.02 },
  broad:    { sh: 1.10, chest: 1.14, waist: 1.20, hip: 1.14, limb: 1.10, h: 1.00 },
  curvy:    { sh: 0.94, chest: 1.04, waist: 0.86, hip: 1.18, limb: 0.94, h: 0.98 },
  petite:   { sh: 0.86, chest: 0.88, waist: 0.84, hip: 0.94, limb: 0.86, h: 0.93 },
};
export const BUILD3_LIST = Object.keys(BUILD3);
export const OUTFIT3_LIST = ['tee', 'shirt', 'hoodie', 'knit', 'suit', 'dress'];
export const HAIR3_LIST = ['buzz', 'crop', 'quiff', 'bun', 'long', 'afro', 'none'];
export const BEARD3_LIST = ['none', 'stubble', 'short', 'full'];

const col = c => (typeof c === 'string' ? (HAIRCOL3[c] ?? SKIN3[c] ?? parseInt(c.replace('#', ''), 16)) : c);
const mat = (c, rough = 0.85, extra = {}) =>
  new THREE.MeshStandardMaterial({ color: col(c), roughness: rough, ...extra });

function sph(r, m, pos = [0, 0, 0], scl = [1, 1, 1], seg = 28) {
  const o = new THREE.Mesh(new THREE.SphereGeometry(r, seg, seg / 2), m);
  o.position.set(...pos); o.scale.set(...scl); return o;
}
function cap(r, len, m, seg = 20) {
  const o = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 6, seg), m);
  o.position.y = -len / 2; return o;
}
function disc(r, h, m, seg = 24) {
  return new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), m);
}

function buildFace(M, o) {
  const head = new THREE.Group();
  const skin = M.skin;
  head.add(sph(0.135, skin, [0, 0, 0], [1, 1.12, 0.96], 36));          // skull
  head.add(sph(0.05, skin, [0, -0.068, 0.072], [1.3, 0.78, 0.95]));     // jaw and chin
  for (const s of [1, -1]) {                                            // eyes
    head.add(sph(0.023, M.eyeWhite, [s * 0.052, 0.012, 0.112], [1, 1, 0.7]));
    head.add(sph(0.011, M.iris, [s * 0.054, 0.012, 0.127], [1, 1, 0.6]));
    head.add(sph(0.011, M.brow, [s * 0.053, 0.046, 0.112], [1.7, 0.36, 0.5]));
  }
  head.add(sph(0.016, skin, [0, -0.012, 0.124], [0.75, 0.85, 0.75]));   // nose
  head.add(sph(0.028, M.mouth, [0, -0.062, 0.122], [1.35, 0.22, 0.35])); // mouth
  for (const s of [1, -1]) head.add(sph(0.026, skin, [s * 0.132, -0.005, 0.01], [0.5, 1, 0.9]));

  // hair
  const hc = mat(o.hairCol ?? 'darkBrown', 0.9);
  const k = o.hair ?? 'crop';
  if (k === 'buzz') head.add(sph(0.139, hc, [0, 0.014, -0.008], [1, 1.04, 0.96], 30));
  else if (k === 'crop') {
    head.add(sph(0.145, hc, [0, 0.026, -0.01], [1, 1.0, 0.98], 30));
    head.add(sph(0.142, hc, [0, 0.01, -0.052], [1, 1.02, 0.9]));
  } else if (k === 'quiff') {
    head.add(sph(0.144, hc, [0, 0.03, -0.012], [1, 0.98, 0.98], 30));
    head.add(sph(0.062, hc, [0, 0.142, 0.038], [1.25, 1.0, 0.9]));
  } else if (k === 'bun') {
    head.add(sph(0.146, hc, [0, 0.024, -0.016], [1, 1.0, 0.98], 30));
    head.add(sph(0.058, hc, [0, 0.118, -0.126]));
  } else if (k === 'long') {
    head.add(sph(0.148, hc, [0, 0.022, -0.018], [1, 1.0, 0.98], 30));
    const m = new THREE.Mesh(new THREE.CapsuleGeometry(0.115, 0.3, 6, 24), hc);
    m.position.set(0, -0.19, -0.062); m.scale.set(1.05, 1, 0.62); head.add(m);
  } else if (k === 'afro') {
    head.add(sph(0.185, hc, [0, 0.042, -0.012], [1.04, 1, 1], 34));
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      head.add(sph(0.062, hc, [Math.cos(a) * 0.17, 0.05 + Math.sin(a) * 0.14, -0.02]));
    }
  }
  // beard
  const bc = mat(o.beardCol ?? o.hairCol ?? 'darkBrown', 0.95);
  const b = o.beard ?? 'none';
  if (b !== 'none') {
    const big = b === 'full';
    const m = sph(big ? 0.126 : 0.118, bc, [0, big ? -0.052 : -0.044, 0.028],
                  [1.04, big ? 1.0 : 0.82, 1.0], 30);
    if (b === 'stubble') m.material = mat(o.beardCol ?? o.hairCol ?? 'darkBrown', 1,
      { transparent: true, opacity: 0.55 });
    head.add(m);
    head.add(sph(0.05, bc, [0, -0.03, 0.112], [1.1, 0.34, 0.6]));       // moustache
  }
  // glasses
  if (o.glasses && o.glasses !== 'none') {
    const fr = mat(o.glassesCol ?? 0x23202a, 0.4, { metalness: 0.3 });
    const dark = o.glasses === 'shades';
    const lens = new THREE.MeshPhysicalMaterial({
      color: dark ? 0x1b1820 : 0xbfd8ea, roughness: 0.1, transmission: dark ? 0 : 0.8,
      transparent: true, opacity: dark ? 0.92 : 0.35, clearcoat: 1 });
    for (const s of [1, -1]) {
      const r = o.glasses === 'round' ? 0.042 : 0.046;
      const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.006, 8, 24), fr);
      ring.position.set(s * 0.053, 0.012, 0.126); head.add(ring);
      const gl = new THREE.Mesh(new THREE.CircleGeometry(r, 24), lens);
      gl.position.set(s * 0.053, 0.012, 0.125); head.add(gl);
      const arm = cap(0.005, 0.12, fr); arm.rotation.z = Math.PI / 2;
      arm.position.set(s * 0.108, 0.016, 0.07); arm.rotation.y = s * 0.5; head.add(arm);
    }
    const br = cap(0.005, 0.03, fr); br.rotation.z = Math.PI / 2;
    br.position.set(0, 0.016, 0.128); head.add(br);
  }
  return head;
}

/** A person. Same option names as castFig in the 2D kit. */
export function makeFigure3D(opts = {}) {
  const o = opts;
  const B = BUILD3[o.build] ?? BUILD3.athletic;
  const skinM = mat(o.skin ?? 'light', 0.55);
  const M = {
    skin: skinM,
    eyeWhite: new THREE.MeshPhysicalMaterial({ color: 0xf4f1ea, roughness: 0.12, clearcoat: 1 }),
    iris: new THREE.MeshPhysicalMaterial({ color: o.eyeCol ?? 0x4a3322, roughness: 0.18, clearcoat: 1 }),
    brow: mat(o.hairCol ?? 'darkBrown', 0.9),
    mouth: mat(0x6b3a2a, 0.8),
  };
  M.mouth = mat(0x6b3a2a, 0.8);

  const cols = o.cols ?? ['#4a7fd0', '#eef1f5'];
  const clothM = mat(cols[0], 0.92);
  const trimM = mat(cols[1] ?? cols[0], 0.9);

  const root = new THREE.Group();
  const pelvis = new THREE.Group(); pelvis.position.y = 0.95 * B.h; root.add(pelvis);
  const spine = new THREE.Group(); pelvis.add(spine);
  const chest = new THREE.Group(); chest.position.y = 0.2; spine.add(chest);
  const j = { root, pelvis, spine, chest };

  const suit = o.outfit === 'suit', dress = o.outfit === 'dress';
  const hoodie = o.outfit === 'hoodie', knit = o.outfit === 'knit';

  // torso, two lathes, widened per build
  const lowG = torsoShell(-0.18, 0.2, () => 0.012 * (B.waist - 1) * 6);
  const low = new THREE.Mesh(lowG, clothM); low.scale.set(B.waist, 1, B.waist * 0.96); spine.add(low);
  const upG = torsoShell(0.18, 0.58, () => 0.012 * (B.chest - 1) * 6); upG.translate(0, -0.2, 0);
  const up = new THREE.Mesh(upG, clothM); up.scale.set(B.chest, 1, B.chest * 0.94); chest.add(up);
  if (suit) {                                        // lapels and a shirt strip
    const sg = torsoShell(0.2, 0.56, () => 0.004); sg.translate(0, -0.2, 0);
    const sm = new THREE.Mesh(sg, mat(0xf2efe8, 0.85)); sm.scale.set(0.42, 1, 1.02); chest.add(sm);
    for (const s of [1, -1]) {
      const l = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.2, 0.012), mat(cols[0], 0.8));
      l.position.set(s * 0.075, 0.16, 0.098 * B.chest); l.rotation.z = s * 0.3; chest.add(l);
    }
    const tie = new THREE.Mesh(new THREE.BoxGeometry(0.038, 0.24, 0.014), trimM);
    tie.position.set(0, 0.1, 0.1 * B.chest); chest.add(tie);
  }
  if (hoodie) {                                      // a hood behind the neck
    const h = sph(0.125, clothM, [0, 0.42, -0.085], [1.25, 0.72, 1]); chest.add(h);
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.09, 0.03), mat(cols[0], 0.95));
    p.position.set(0, -0.08, 0.105 * B.chest); chest.add(p);
  }
  if (knit) for (let i = 0; i < 7; i++) {             // ribs
    const r = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.3, 0.008), trimM);
    r.position.set(-0.09 + i * 0.03, 0.16, 0.1 * B.chest); chest.add(r);
  }
  if (dress) {                                        // a skirt below the hips
    const sk = new THREE.Mesh(new THREE.CylinderGeometry(0.13 * B.hip, 0.24 * B.hip, 0.42, 28, 1, true), clothM);
    sk.material.side = THREE.DoubleSide; sk.position.y = -0.3; pelvis.add(sk);
    const band = disc(0.135 * B.waist, 0.035, trimM); band.position.y = -0.1; pelvis.add(band);
  }

  // neck and head
  const neck = new THREE.Group(); neck.position.y = 0.36; chest.add(neck);
  const nk = disc(0.05, 0.12, skinM); nk.position.y = 0.04; neck.add(nk);
  const head = buildFace(M, o); head.position.y = 0.165; neck.add(head);
  j.neck = neck; j.head = head;

  const limbM = (suit || knit || hoodie || o.outfit === 'shirt') ? clothM : skinM;
  for (const s of [1, -1]) {
    const k = s > 0 ? 'l' : 'r';
    const sh = new THREE.Group(); sh.position.set(s * 0.205 * B.sh, 0.26, -0.005); chest.add(sh);
    sh.add(sph(0.062 * B.limb, limbM, [0, -0.01, 0]));
    sh.add(cap(0.052 * B.limb, 0.24, limbM));
    const el = new THREE.Group(); el.position.y = -0.3; sh.add(el);
    el.add(sph(0.046 * B.limb, limbM)); el.add(cap(0.043 * B.limb, 0.21, limbM));
    const wr = new THREE.Group(); wr.position.y = -0.27; el.add(wr);
    wr.add(sph(0.05, skinM, [0, -0.03, 0], [1, 1.1, 0.85]));
    j[k + 'Sh'] = sh; j[k + 'El'] = el; j[k + 'Wr'] = wr;

    const legM = dress ? skinM : clothM;
    const hip = new THREE.Group(); hip.position.set(s * 0.095 * B.hip, -0.06, 0); pelvis.add(hip);
    hip.add(cap(0.078 * B.limb, 0.34, legM));
    const kn = new THREE.Group(); kn.position.y = -0.44; hip.add(kn);
    kn.add(sph(0.06 * B.limb, legM)); kn.add(cap(0.056 * B.limb, 0.36, legM));
    const an = new THREE.Group(); an.position.y = -0.45; kn.add(an);
    an.add(disc(0.042, 0.11, skinM));
    an.add(sph(0.05, mat(0x2b2630, 0.6), [0, -0.035, 0.05], [1, 0.62, 2.3]));
    j[k + 'Hip'] = hip; j[k + 'Kn'] = kn; j[k + 'An'] = an;
  }
  root.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } });

  // Same shape makeHuman returns, so a shot can drive either rig the same way.
  const fig = {
    root, j,
    setPose(p = {}) {
      for (const k of ['pelvis', 'spine', 'chest', 'neck', 'head',
                       'lSh', 'lEl', 'lWr', 'rSh', 'rEl', 'rWr',
                       'lHip', 'lKn', 'lAn', 'rHip', 'rKn', 'rAn']) {
        const v = p[k] || [0, 0, 0];
        if (j[k]) j[k].rotation.set(v[0], v[1], v[2], 'YXZ');
      }
      j.pelvis.position.y = 0.95 * B.h + (p.drop || 0);
    },
  };
  fig.setPose({});
  return fig;
}

/** The relaxed stand the 2D kit's default pose corresponds to. */
export const STAND3 = {
  lSh: [0.05, 0, 0.16], rSh: [0.05, 0, -0.16], lEl: [-0.25, 0, 0], rEl: [-0.25, 0, 0],
  lHip: [0, 0, 0.07], rHip: [0, 0, -0.07], lAn: [0, 0, -0.07], rAn: [0, 0, 0.07],
};
