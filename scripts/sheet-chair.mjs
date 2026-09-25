// THE LAWN CHAIR AND THE MUG, DRAWN WITH THE REAL FIGURE, IN PLAIN NODE.
//
//   node scripts/sheet-chair.mjs            → scripts/.lesson-shots/chair.png
//
// Stage 4's first gate (docs/superpowers/specs/2026-09-25-stickman-natural-motion-
// design.md): the owner judges the chair and the mug by eye before anything is
// wired, because "you should never guess to what you are seeing" is a question no
// checker can answer. `lawnChair.ts` and `rig.ts` are zero-import, so this draws the
// very geometry the app will — large, and again at the size a lesson draws it.
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import JimpPkg from 'jimp-compact';
import { canvas, text } from './lib/rasterpath.mjs';

const Jimp = JimpPkg.Jimp ?? JimpPkg;
const REPO = process.cwd();
const { transform } = await import(pathToFileURL(path.join(REPO, 'node_modules/sucrase/dist/index.js')).href);
const TMP = path.join(os.tmpdir(), 'ph-chair-sheet');
mkdirSync(TMP, { recursive: true });
const emit = (rel, name) => {
  const src = transform(readFileSync(path.join(REPO, rel), 'utf8'), { transforms: ['typescript'] }).code
    .replace(/(from\s+['"])\.\/([A-Za-z0-9_-]+)(['"])/g, '$1./$2.mjs$3');
  writeFileSync(path.join(TMP, name), src);
  return pathToFileURL(path.join(TMP, name)).href;
};
const RIG = await import(emit('components/lesson/cinematic/rig.ts', 'rig.mjs'));
const CH = await import(emit('components/lesson/cinematic/lawnChair.ts', 'lawnChair.mjs'));
const RT = await import(emit('components/lesson/cinematic/chairRoutine.ts', 'chairRoutine.mjs'));
// The app draws RECTANGLES (Views); the sheet draws the very same rectangles.
const polys = (rects) => rects.map((r) => ({ role: r.role, pts: CH.rectCorners(r) }));
const chairPolys = (open, layer = 'all') => (layer === 'all'
  ? polys([...CH.chairRects(open, 'back'), ...CH.chairRects(open, 'front')])
  : polys(CH.chairRects(open, layer)));
const mugPolys = (t, steam) => polys(CH.mugRects(t, steam));
const TONE = await import(emit('components/shared/tone.ts', 'tone.mjs'));

const mix = (a, b, u) => {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const A = p(a); const B = p(b);
  return `#${A.map((v, i) => Math.round(v + (B[i] - v) * u).toString(16).padStart(2, '0')).join('')}`;
};
/** Role → colour. The chair's metal is the palette's teal taken halfway to paper. */
export const ROLE = {
  frame: mix(TONE.TEAL, TONE.PAPER, 0.55),
  weave: TONE.PAPER_LIT,
  strap: TONE.TEAL,
  arm: TONE.PAPER_LIT,
  line: TONE.INK,
  mug: TONE.EMBER,
  rim: TONE.PAPER,
  steam: TONE.MID,
};

const INK = TONE.INK;
const PAPER = TONE.PAPER;

function disc(cx, cy, r) {
  const n = 40; const pts = [];
  for (let i = 0; i < n; i += 1) { const a = (2 * Math.PI * i) / n; pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`); }
  return `M${pts.join('L')}Z`;
}
function bonePath(xf, thick) {
  const tx = xf[0].translateX; const ty = xf[1].translateY;
  const deg = parseFloat(String(xf[2].rotate));
  const len = xf[3].scaleX * RIG.BONE_SRC;
  const r = (deg * Math.PI) / 180; const c = Math.cos(r); const s = Math.sin(r);
  return `M${[[0, -thick / 2], [len, -thick / 2], [len, thick / 2], [0, thick / 2]]
    .map(([x, y]) => `${(tx + x * c - y * s).toFixed(2)},${(ty + x * s + y * c).toFixed(2)}`).join('L')}Z`;
}
const jointAt = (xf, r) => disc(xf[0].translateX, xf[1].translateY, r);
function figurePath(B, k) {
  const limb = RIG.STR.limb * k; const torso = RIG.STR.torso * k;
  let d = '';
  for (const n of ['thighL', 'shinL', 'thighR', 'shinR', 'uarmL', 'farmL', 'uarmR', 'farmR']) d += bonePath(B[n], limb);
  d += bonePath(B.torso, torso);
  for (const n of ['kneeL', 'kneeR', 'ankL', 'ankR', 'elL', 'elR', 'wrL', 'wrR', 'shLd', 'shRd']) d += jointAt(B[n], limb / 2);
  return d + jointAt(B.pel, torso / 2) + jointAt(B.shB, torso / 2) + jointAt(B.head, RIG.STR.headR * k);
}
const polyPath = (pts, ox, oy, k, dir) => `M${pts.map(([x, y]) => `${(ox + x * k * dir).toFixed(2)},${(oy + y * k).toFixed(2)}`).join('L')}Z`;
function drawParts(sheet, parts, ox, oy, k, dir, cellX, cellY) {
  for (const p of parts) sheet.path(polyPath(p.pts, ox, oy, k, dir), ROLE[p.role], cellX, cellY);
}

// The stances the sheet shows, on the rig's own stand.
const T = 3.1;
const base = RIG.stand(T);
// The pelvis drops from standH above the ground to the seat (negative bob is DOWN).
const SEAT_BOB = -(RIG.U.standH + CH.SEAT_PELVIS_Y);
const seated = (o = {}) => ({
  ...base, tilt: 0.1, neck: -0.02, bob: base.bob + SEAT_BOB,
  footL: { x: 13, y: 0 }, footR: { x: 17, y: 0 },
  fistL: { x: 6, y: -9 }, fistR: { x: 9, y: -9 },
  ...o,
});
const CROSSED = { footL: { x: 12, y: 0 }, footR: { x: 25, y: -18 } };
const HOLD_MUG = { fistR: { x: 14, y: -14 } };
const SIP = { fistR: { x: 20, y: -37 }, neck: 0.12 };

const CELLS = [
  { label: 'FOLDED, IN HAND', chair: 0, chairAt: [34, 6], stance: { ...base, fistR: { x: 19, y: -4 } } },
  { label: 'FLICKED HALF OPEN', chair: 0.5, chairAt: [34, 0], stance: { ...base, fistR: { x: 20, y: -6 } } },
  { label: 'SET UP', chair: 1, chairAt: [40, 0], stance: base, figX: -26 },
  { label: 'SITTING', chair: 1, chairAt: [0, 0], stance: seated() },
  { label: 'LEGS CROSSED', chair: 1, chairAt: [0, 0], stance: seated(CROSSED) },
  { label: 'MUG, STEAMING', chair: 1, chairAt: [0, 0], stance: seated({ ...CROSSED, ...HOLD_MUG }), mug: 1 },
  { label: 'A SIP', chair: 1, chairAt: [0, 0], stance: seated({ ...CROSSED, ...SIP }), mug: 1 },
];

function render(FIG, out, lessonSize) {
  const k = FIG / RIG.FIG_H;
  const CW = Math.round(FIG * 1.25); const CHH = Math.round(FIG * 1.3); const PAD = 6; const LAB = 16;
  const sheet = canvas(CELLS.length * (CW + PAD) + PAD, CHH + LAB + PAD * 2, '#EFEDE6');
  CELLS.forEach((c, i) => {
    const ox = PAD + i * (CW + PAD); const top = PAD + LAB;
    if (!lessonSize) text(sheet, c.label, ox + 2, PAD, INK, 1);
    sheet.fillRect(ox, top, CW, CHH, PAPER);
    const groundY = CHH - Math.round(FIG * 0.12);
    const figX = CW / 2 - 6 * k + (c.figX ?? 0) * k;
    sheet.fillRect(ox + 3, top + groundY, CW - 6, 1, '#BEBCB4');
    // The chair is drawn BEHIND the figure: it is sat IN, not in front of him.
    if (c.chair != null) {
      const [cx, cy] = c.chairAt;
      if (c.chair < 1 && cx !== 0) {
        // Folded or opening, it is held: its own origin rides beside his hand.
        drawParts(sheet, chairPolys(c.chair), figX + cx * k, groundY + cy * k - 8 * k * (1 - c.chair), k, 1, ox, top);
      } else {
        drawParts(sheet, chairPolys(c.chair, cx === 0 ? 'back' : 'all'), figX + cx * k, groundY + cy * k, k, 1, ox, top);
      }
    }
    const B = RIG.pose(c.stance, figX, groundY, k, 1, 1);
    sheet.path(figurePath(B, k), INK, ox, top);
    // Sat in, the near armrest crosses in front of him.
    if (c.chair === 1 && c.chairAt[0] === 0) drawParts(sheet, chairPolys(1, 'front'), figX, groundY, k, 1, ox, top);
    if (c.mug) {
      const wx = B.wrR[0].translateX; const wy = B.wrR[1].translateY;
      drawParts(sheet, mugPolys(T, c.mug), wx - 3 * k, wy + 2 * k, k, 1, ox, top);
    }
  });
  const img = new Jimp(sheet.w, sheet.h);
  for (let q = 0; q < sheet.w * sheet.h; q += 1) {
    img.bitmap.data[q * 4] = sheet.px[q * 3]; img.bitmap.data[q * 4 + 1] = sheet.px[q * 3 + 1];
    img.bitmap.data[q * 4 + 2] = sheet.px[q * 3 + 2]; img.bitmap.data[q * 4 + 3] = 255;
  }
  return img.writeAsync(out);
}

const dir = path.join(REPO, 'scripts', '.lesson-shots');
mkdirSync(dir, { recursive: true });
await render(Number(process.env.FIG || 230), path.join(dir, 'chair.png'), false);
// At lesson size: a figure is about 100 units drawn at roughly 1.4px a unit on a phone.
await render(140, path.join(dir, 'chair-small.png'), true);
console.log('wrote scripts/.lesson-shots/chair.png and chair-small.png');

// ── THE ROUTINE IN MOTION (chairRoutine.ts), on the beat's own clock ─────────
const STRIPS = [
  { label: 'SET UP', frames: 12, span: RT.SETUP_S, at: (t) => RT.setupAt(t, t) },
  { label: 'SEATED · CROSS THE LEGS, LOOK UP', frames: 8, span: 4.4, at: (t) => RT.seatedAt(RT.SEAT_CROSS, t, 0, 0, t) },
  { label: 'SEATED · THE MUG, A SIP', frames: 10, span: 4.2, at: (t) => RT.seatedAt(RT.SEAT_MUG, t, 1, 0, t) },
  { label: 'SEATED · FINGERS DRUMMING THE ARMREST, LOOK DOWN', frames: 8, span: 4.6, at: (t) => RT.seatedAt(RT.SEAT_DRUM, t, 1, 0, t) },
  { label: 'SEATED · MUG IN HAND, FOOT JIGGLING, LOOK DOWN', frames: 8, span: 4.6, at: (t) => RT.seatedAt(RT.SEAT_DRUM, t, 1, 1, t) },
  { label: 'PUT AWAY', frames: 12, span: RT.PUTAWAY_S + 0.1, at: (t) => RT.putawayAt(t, 1, 1, t) },
  { label: 'STANDING · A MUG FROM BEHIND HIS BACK', frames: 10, span: RT.MUG_STAND_S, at: (t) => RT.mugStandAt(t, t) },
];
{
  const FIG = 150; const k = FIG / RIG.FIG_H;
  const CW = Math.round(FIG * 1.15); const CHH = Math.round(FIG * 1.3); const PAD = 5; const LAB = 16;
  const cols = Math.max(...STRIPS.map((x) => x.frames));
  const sheet = canvas(cols * (CW + PAD) + PAD, STRIPS.length * (CHH + LAB + PAD) + PAD, '#EFEDE6');
  STRIPS.forEach((st, r) => {
    const oy = PAD + r * (CHH + LAB + PAD);
    text(sheet, st.label, PAD + 2, oy, INK, 1);
    for (let f = 0; f < st.frames; f += 1) {
      const t = (f / (st.frames - 1)) * st.span;
      const ox = PAD + f * (CW + PAD); const top = oy + LAB;
      sheet.fillRect(ox, top, CW, CHH, PAPER);
      const groundY = CHH - Math.round(FIG * 0.12);
      const figX = CW / 2 - 8 * k;
      sheet.fillRect(ox + 3, top + groundY, CW - 6, 1, '#BEBCB4');
      const fr = st.at(t);
      const c = fr.chair;
      const cx = figX + c.x * k; const cy = groundY + c.y * k;
      const front = c.front > 0.5;
      if (c.on > 0.5) drawParts(sheet, chairPolys(c.open, front ? 'back' : 'all'), cx, cy, k, 1, ox, top);
      const B = RIG.pose(fr.s, figX, groundY, k, 1, 1);
      sheet.path(figurePath(B, k), INK, ox, top);
      if (c.on > 0.5 && front) drawParts(sheet, chairPolys(c.open, 'front'), cx, cy, k, 1, ox, top);
      if (fr.mug.on > 0.5) {
        drawParts(sheet, mugPolys(t, fr.mug.steam), B.wrR[0].translateX - 3 * k, B.wrR[1].translateY + 2 * k, k, 1, ox, top);
      }
      text(sheet, `${t.toFixed(1)}s`, ox + 3, top + CHH - 11, '#6B6A64', 1);
    }
  });
  const img = new Jimp(sheet.w, sheet.h);
  for (let q = 0; q < sheet.w * sheet.h; q += 1) {
    img.bitmap.data[q * 4] = sheet.px[q * 3]; img.bitmap.data[q * 4 + 1] = sheet.px[q * 3 + 1];
    img.bitmap.data[q * 4 + 2] = sheet.px[q * 3 + 2]; img.bitmap.data[q * 4 + 3] = 255;
  }
  await img.writeAsync(path.join(dir, 'chair-routine.png'));
  console.log('wrote scripts/.lesson-shots/chair-routine.png');
}
