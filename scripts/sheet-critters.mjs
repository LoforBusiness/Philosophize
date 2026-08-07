// The contact sheet critters.ts has always said it had.
//
// Its header claims "a contact sheet renders in plain Node and 'is that a dog?'
// gets answered before it reaches a device" — and no such script existed, which is
// how the animal shipped as a slab of chest on four wires. This is that script.
//
// It draws the animal BESIDE the figure, at the exact relative scale ethicsScene
// uses, because "does it look filled out" is a comparison and cannot be judged on
// the animal alone. It also prints the three ratios that made the problem legible
// in the first place: stroke against the animal's own height, stroke against the
// length of the leg it is, and head against height — each next to the figure's
// number for the same thing.
//
// Both are drawn with the SAME primitives the device uses: BUTT-CAPPED rectangles
// plus explicit joint discs. sheet-moves.mjs draws bones with a round brush, which
// silently rounds every bone end — that smoothing is exactly what the real
// renderer does not do, and hiding it would hide the thing being looked for.
//
//   node scripts/sheet-critters.mjs               → standing, at device size
//   ZOOM=2.4 node scripts/sheet-critters.mjs      → the same ratios, big enough to see
//   WALK=1 node scripts/sheet-critters.mjs        → one gait cycle across the cells
//   CRITK=46 node scripts/sheet-critters.mjs      → try another shoulder height
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import os from 'node:os';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import JimpPkg from 'jimp-compact';

const Jimp = JimpPkg.default || JimpPkg;
const REPO = process.cwd();
const { transform } = await import(
  pathToFileURL(path.join(REPO, 'node_modules/sucrase/dist/index.js')).href,
);

const TMP = path.join(os.tmpdir(), 'philosophize-critter-sheet');
mkdirSync(TMP, { recursive: true });
function emit(rel, name, extra = '') {
  const js = transform(readFileSync(path.join(REPO, rel), 'utf8'), { transforms: ['typescript'] }).code;
  writeFileSync(path.join(TMP, name), js + extra);
  return pathToFileURL(path.join(TMP, name)).href;
}
// SHAPE is module-private in critters.ts. It is exported HERE, onto the transpiled
// copy, so variants can be compared without editing the source between renders —
// the source keeps its own encapsulation.
const C = await import(emit('components/lesson/cinematic/critters.ts', 'critters.mjs', '\nexport { SHAPE };\n'));
const R = await import(emit('components/lesson/cinematic/rig.ts', 'rig.mjs'));

const SS = 2;                                    // supersample, then halve
const INK = 0x1a1a1aff, PAPER = 0xfafaf7ff, RULE = 0xd8d5ccff;

function bone(img, x1, y1, x2, y2, w) {
  // A butt-capped rectangle: march the axis and lay a PERPENDICULAR segment at
  // each step. No round ends — the square corner at a joint is the whole reason
  // those joints need explicit discs, and a round brush would paint them in.
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1e-6;
  const ux = dx / len, uy = dy / len, px = -uy, py = ux, h = w / 2;
  const n = Math.ceil(len * 2) + 1;
  for (let i = 0; i <= n; i++) {
    const cx = x1 + (ux * len * i) / n, cy = y1 + (uy * len * i) / n;
    const m = Math.ceil(h * 2) + 1;
    for (let j = -m; j <= m; j++) {
      const t = (h * j) / m;
      img.setPixelColor(INK, Math.round(cx + px * t), Math.round(cy + py * t));
    }
  }
}
function disc(img, cx, cy, r) {
  for (let dx = -Math.ceil(r); dx <= Math.ceil(r); dx++) {
    for (let dy = -Math.ceil(r); dy <= Math.ceil(r); dy++) {
      if (dx * dx + dy * dy <= r * r) img.setPixelColor(INK, Math.round(cx + dx), Math.round(cy + dy));
    }
  }
}

/**
 * The figure, drawn the way Stickman.tsx draws it.
 *
 * `k` is not optional. Stickman.tsx scales every stroke by it (`STR.limb * k`) and
 * the first version of this harness did not — which drew a correctly-scaled
 * skeleton with 11px strokes on it, made the PERSON look like the wire figure, and
 * so faked the exact defect being investigated.
 */
function figure(img, j, k) {
  const L = R.STR.limb * k, T = R.STR.torso * k;
  bone(img, j.shL.x, j.shL.y, j.elL.x, j.elL.y, L);
  bone(img, j.elL.x, j.elL.y, j.wrL.x, j.wrL.y, L);
  bone(img, j.hipL.x, j.hipL.y, j.kneeL.x, j.kneeL.y, L);
  bone(img, j.kneeL.x, j.kneeL.y, j.ankL.x, j.ankL.y, L);
  bone(img, j.pel.x, j.pel.y, j.chest.x, j.chest.y, T);
  bone(img, j.hipR.x, j.hipR.y, j.kneeR.x, j.kneeR.y, L);
  bone(img, j.kneeR.x, j.kneeR.y, j.ankR.x, j.ankR.y, L);
  bone(img, j.shR.x, j.shR.y, j.elR.x, j.elR.y, L);
  bone(img, j.elR.x, j.elR.y, j.wrR.x, j.wrR.y, L);
  for (const p of [j.shL, j.elL, j.wrL, j.kneeL, j.ankL, j.shR, j.elR, j.wrR, j.kneeR, j.ankR]) {
    disc(img, p.x, p.y, L / 2);
  }
  disc(img, j.pel.x, j.pel.y, T / 2);
  disc(img, j.chest.x, j.chest.y, T / 2);
  disc(img, j.head.x, j.head.y, R.STR.headR * k);
}

/** The animal, drawn the way CritterView.tsx draws it. */
function beast(img, kind, t, gait, phase, X, GY, k) {
  const c = C.critter(kind, t, gait, phase);
  for (const s of c.seg) bone(img, X + s.x1 * k, GY + s.y1 * k, X + s.x2 * k, GY + s.y2 * k, s.w * k);
  for (const d of c.dot) disc(img, X + d.x * k, GY + d.y * k, d.r * k);
}

/**
 * The TRUE silhouette, over the whole idle clock and the whole gait cycle.
 *
 * `critterBounds` in critters.ts is deliberately conservative — it adds the full
 * stroke width on every axis regardless of which way the bone points — which is
 * the right answer for "will it fit" and the wrong one for framing a shot.
 */
function silhouette(kind) {
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  const see = (x, y) => { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); };
  for (let i = 0; i < 400; i++) {
    for (const g of [0, 1]) {
      const c = C.critter(kind, i * 0.11, g, i / 40);
      for (const s of c.seg) {
        const dx = s.x2 - s.x1, dy = s.y2 - s.y1, L = Math.hypot(dx, dy) || 1e-9;
        const px = (-dy / L) * s.w / 2, py = (dx / L) * s.w / 2;
        see(s.x1 + px, s.y1 + py); see(s.x1 - px, s.y1 - py);
        see(s.x2 + px, s.y2 + py); see(s.x2 - px, s.y2 - py);
      }
      for (const d of c.dot) { see(d.x - d.r, d.y - d.r); see(d.x + d.r, d.y + d.r); }
    }
  }
  return { x0, x1, y0, y1, w: x1 - x0, h: y1 - y0 };
}

const Z = +(process.env.ZOOM || 1);
const CELLS = +(process.env.CELLS || (process.env.WALK === '1' ? 6 : 1));
const CELL = 340 * SS * Z, H = 230 * SS * Z, GY = 190 * SS * Z;
const K_FIG = 1.0 * SS * Z;                       // §17: K_FIG is 1.0
const CRIT_K = +(process.env.CRITK || 40) * SS * Z;   // ethicsScene's CRIT_K

const img = new Jimp(CELL * CELLS, H, PAPER);
for (let i = 0; i < CELLS; i++) {
  const ox = i * CELL;
  for (let x = 0; x < CELL; x++) img.setPixelColor(RULE, ox + x, GY);
  // WALK spends the cells on one gait cycle rather than on the idle clock. The feet
  // are the half of "filled out" that can only fail in motion: a thicker leg is
  // also a leg whose paw can now be caught below the ground line.
  const walk = process.env.WALK === '1';
  figure(img, R.solve({ x: ox + 58 * SS * Z, groundY: GY, k: K_FIG, dir: 1, ...R.stand(3.0) }), K_FIG);
  beast(img, 'dog', 3.0 + i * 0.5, walk ? 1 : 0, walk ? i / CELLS : 0, ox + 150 * SS * Z, GY, CRIT_K);
  beast(img, 'cow', 3.0 + i * 0.5, walk ? 1 : 0, walk ? i / CELLS : 0, ox + 300 * SS * Z, GY, CRIT_K);
}
img.resize((CELL * CELLS) / SS, H / SS);
mkdirSync(path.join(REPO, '.moves-sheets'), { recursive: true });
const out = path.join(REPO, '.moves-sheets', 'critters.png');
await img.writeAsync(out);

// The numbers behind the picture, each beside the figure's own, because the target
// is the FIGURE's proportion softened one notch — not parity, which would give a
// dog legs as deep as its chest.
const pct = (a, b) => `${((a / b) * 100).toFixed(1)}%`;
const figLimbH = pct(R.STR.limb, R.FIG_H);
const figLimbLeg = pct(R.STR.limb, R.U.thigh + R.U.shin);
const figHead = pct(R.STR.headR * 2, R.FIG_H);
for (const kind of ['dog', 'cow']) {
  const S = C.SHAPE[kind], s = silhouette(kind);
  console.log(
    `${kind.padEnd(4)} limb/height ${pct(S.limb, s.h).padStart(6)} (figure ${figLimbH})` +
    ` · limb/leg ${pct(S.limb, 1 - S.body * 0.3).padStart(6)} (figure ${figLimbLeg})` +
    ` · head/height ${pct(S.skull * 2, s.h).padStart(6)} (figure ${figHead})`,
  );
  console.log(
    `     silhouette: forward ${s.x1.toFixed(3)} · back ${s.x0.toFixed(3)} · crown ${s.y0.toFixed(3)}` +
    ` · below ground ${s.y1.toFixed(4)} · ${(s.h * (CRIT_K / SS / Z)).toFixed(0)}px tall against the figure's ${R.FIG_H}`,
  );
}
console.log(`\n.moves-sheets/critters.png`);
