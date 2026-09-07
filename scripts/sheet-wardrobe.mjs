// DRAW THE WHOLE WARDROBE, IN PLAIN NODE.
//
//   npm run sheet:wardrobe               every costume, standing
//   npm run sheet:wardrobe -- dandy      one costume, large
//   FIG=220 npm run sheet:wardrobe       at a bigger size
//
// The only instrument this project has for "does it look good" (§7, §19), and
// the only one that can answer the question the wardrobe actually turns on:
// DOES THIS PIECE CHANGE THE SILHOUETTE? A hat that sits inside the head disc
// measures perfectly and is invisible, and no number in `check:wardrobe` can
// tell you that — the same reason `sheet-launch` exists and the same reason the
// silhouette rule at the top of `wardrobe.ts` disqualifies sunglasses.
//
// It draws the figure through the REAL rig (`pose`), not a sketch of one, so
// what is on the sheet is what ships. Both files are zero-import for exactly
// this, and it costs no Metro and no browser.
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import JimpPkg from 'jimp-compact';
import { coverage, canvas, rgb, text } from './lib/rasterpath.mjs';

const Jimp = JimpPkg.Jimp ?? JimpPkg;
const REPO = path.resolve(path.dirname(new URL(import.meta.url).pathname).replace(/^\//, ''), '..');

const { transform } = await import(
  pathToFileURL(path.join(REPO, 'node_modules/sucrase/dist/index.js')).href
);
const TMP = path.join(os.tmpdir(), 'ph-wardrobe');
mkdirSync(TMP, { recursive: true });
const emit = (rel, name) => {
  // Node needs an EXTENSION on a relative ESM import and TypeScript sources have
  // none, so `moves.ts`'s `from './rig'` resolves to nothing once it is sitting
  // in a temp directory. Rewrite the specifiers as they are emitted.
  const src = transform(readFileSync(path.join(REPO, rel), 'utf8'), { transforms: ['typescript'] }).code
    .replace(/(from\s+['"])\.\/([A-Za-z0-9_-]+)(['"])/g, '$1./$2.mjs$3');
  writeFileSync(path.join(TMP, name), src);
  return pathToFileURL(path.join(TMP, name)).href;
};

const RIG = await import(emit('components/lesson/cinematic/rig.ts', 'rig.mjs'));
const W = await import(emit('components/lesson/cinematic/wardrobe.ts', 'wardrobe.mjs'));
const MOVES = await import(emit('components/lesson/cinematic/moves.ts', 'moves.mjs'));

const INK = '#1A1A1A';
const PAPER = '#FAFAF7';

// ── geometry → path data ────────────────────────────────────────────────────
//
// NO ARC COMMANDS. `rasterpath` flattens on the assumption that every command's
// arguments are (x, y) pairs, so a disc is a polygon here — see its header.

/** A rectangle centred at (cx, cy), rotated `deg` about its own centre. */
function rect(cx, cy, w, h, deg = 0) {
  const r = (deg * Math.PI) / 180;
  const c = Math.cos(r); const s = Math.sin(r);
  const pts = [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]]
    .map(([x, y]) => [cx + x * c - y * s, cy + x * s + y * c]);
  return `M${pts.map((p) => `${p[0].toFixed(2)},${p[1].toFixed(2)}`).join('L')}Z`;
}

/** A disc as a 48-gon. `dir` reverses the winding, which cuts a hole. */
function disc(cx, cy, r, dir = 1) {
  const n = 48;
  const pts = [];
  for (let i = 0; i < n; i += 1) {
    const a = (dir * 2 * Math.PI * i) / n;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
  }
  return `M${pts.join('L')}Z`;
}

/** A rounded rectangle, approximated by a rect plus four corner discs. */
function round(cx, cy, w, h, rr, deg = 0) {
  if (!rr) return rect(cx, cy, w, h, deg);
  const k = Math.min(rr, w / 2, h / 2);
  const r = (deg * Math.PI) / 180;
  const c = Math.cos(r); const s = Math.sin(r);
  const at = (x, y) => [cx + x * c - y * s, cy + x * s + y * c];
  let d = rect(cx, cy, w - 2 * k, h, deg) + rect(cx, cy, w, h - 2 * k, deg);
  for (const [dx, dy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    const [px, py] = at(dx * (w / 2 - k), dy * (h / 2 - k));
    d += disc(px, py, k);
  }
  return d;
}

/** One bone of the rig, read straight off the Bundle's transform array. */
function bonePath(xf, thick) {
  const tx = xf[0].translateX; const ty = xf[1].translateY;
  const deg = parseFloat(String(xf[2].rotate));
  const len = xf[3].scaleX * RIG.BONE_SRC;
  const r = (deg * Math.PI) / 180;
  const c = Math.cos(r); const s = Math.sin(r);
  // The View spans (0, -thick/2) to (len, thick/2) in its own frame, origin at
  // the joint — `transformOrigin: '0% 50%'` in Stickman.
  const pts = [[0, -thick / 2], [len, -thick / 2], [len, thick / 2], [0, thick / 2]]
    .map(([x, y]) => [tx + x * c - y * s, ty + x * s + y * c]);
  return `M${pts.map((p) => `${p[0].toFixed(2)},${p[1].toFixed(2)}`).join('L')}Z`;
}

const jointAt = (xf, r) => disc(xf[0].translateX, xf[1].translateY, r);

/** The bare figure, exactly as `Stickman` mounts it. */
function figurePath(B, k) {
  const limb = RIG.STR.limb * k;
  const torso = RIG.STR.torso * k;
  const headR = RIG.STR.headR * k;
  let d = '';
  for (const n of ['thighL', 'shinL', 'thighR', 'shinR', 'uarmL', 'farmL', 'uarmR', 'farmR']) {
    d += bonePath(B[n], limb);
  }
  d += bonePath(B.torso, torso);
  for (const n of ['kneeL', 'kneeR', 'ankL', 'ankR', 'elL', 'elR', 'wrL', 'wrR', 'shLd', 'shRd']) {
    d += jointAt(B[n], limb / 2);
  }
  d += jointAt(B.pel, torso / 2) + jointAt(B.shB, torso / 2) + jointAt(B.head, headR);
  return d;
}

/**
 * The costume, hung off the Bundle's own joints.
 *
 * The HEAD pieces rotate with the neck, because a hat that stays level while its
 * wearer leans is a hat sitting in mid-air. The neck angle is the vector from the
 * shoulder base to the head centre — which is also the axis N12 says attention
 * has to ride, so the hat and the gaze cannot disagree.
 */
function wearPath(B, k, costume, dir) {
  const hx = B.head[0].translateX; const hy = B.head[1].translateY;
  const nx = B.shB[0].translateX; const ny = B.shB[1].translateY;
  const neck = Math.atan2(hy - ny, hx - nx) + Math.PI / 2;   // 0 when upright
  const anchors = {
    head: [hx, hy, neck],
    neck: [nx, ny, neck],
    pelvis: [B.pel[0].translateX, B.pel[1].translateY, 0],
    handR: [B.wrR[0].translateX, B.wrR[1].translateY, 0],
    handL: [B.wrL[0].translateX, B.wrL[1].translateY, 0],
  };
  let d = '';
  let paper = '';
  for (const p of costume.pieces) {
    const [ax, ay, rot] = anchors[p.at];
    const px = p.x * dir * k; const py = p.y * k;
    const c = Math.cos(rot); const s = Math.sin(rot);
    const cx = ax + px * c - py * s;
    const cy = ay + px * s + py * c;
    const deg = (rot * 180) / Math.PI + (p.rot || 0) * dir;
    const w = p.w * k; const h = p.h * k;
    if (p.ring) {
      d += disc(cx, cy, w / 2) + disc(cx, cy, w / 2 - p.ring * k, -1);
    } else if (p.paper) {
      paper += round(cx, cy, w, h, (p.r || 0) * k, deg);
    } else {
      d += round(cx, cy, w, h, (p.r || 0) * k, deg);
    }
  }
  return { ink: d, paper };
}

// ── the sheet ───────────────────────────────────────────────────────────────

const want = process.argv[2] || null;
const list = want ? W.COSTUMES.filter((c) => c.id === want) : W.COSTUMES;
if (!list.length) {
  console.log(`no costume "${want}". Known: ${W.COSTUMES.map((c) => c.id).join(' ')}`);
  process.exit(1);
}

const FIG = Number(process.env.FIG || (want ? 300 : 150));
const k = FIG / RIG.FIG_H;
const CELL_W = Math.round(FIG * 1.15);
const CELL_H = Math.round(FIG * 1.42);
const COLS = want ? 1 : Math.min(5, list.length);
const rows = Math.ceil(list.length / COLS);
const PAD = 10;

const sheetW = COLS * CELL_W + (COLS + 1) * PAD;
const sheetH = rows * CELL_H + (rows + 1) * PAD;
const sheet = canvas(sheetW, sheetH, '#EFEDE6');

// A REAL POSE FROM THE REAL LIBRARY, not an invented set of joint targets.
//
// The first draft hand-wrote a stance with both fists hanging at the hips, and
// the sheet came back a BLOB: at this scale the torso is 17px wide and each arm
// is 13, so two arms pinned against the trunk merge into one 43px mass and the
// figure has no limbs at all. That is the silhouette rule biting the instrument
// rather than the wardrobe — and it is exactly why the sheet exists.
const POSE = Number(process.env.POSE || 25);

for (const [i, c] of list.entries()) {
  const ox = PAD + (i % COLS) * (CELL_W + PAD);
  const oy = PAD + Math.floor(i / COLS) * (CELL_H + PAD);
  sheet.fillRect(ox, oy, CELL_W, CELL_H, PAPER);

  const groundY = CELL_H - Math.round(FIG * 0.18);
  const B = RIG.pose(MOVES.emoteAny(POSE, 0), CELL_W / 2, groundY, k, 1, 1);

  // A ground line first, so "is the cane planted?" is answerable from the sheet.
  sheet.fillRect(ox + 8, oy + groundY, CELL_W - 16, 1, '#BEBCB4');
  sheet.path(figurePath(B, k), INK, ox, oy);
  const worn = wearPath(B, k, c, 1);
  if (worn.ink) sheet.path(worn.ink, INK, ox, oy);
  // LAST, over the ink it separates.
  if (worn.paper) sheet.path(worn.paper, PAPER, ox, oy);

  const reach = W.reachOf(c);
  text(sheet, c.id.toUpperCase(), ox + 8, oy + 8, '#1A1A1A', want ? 3 : 2);
  text(sheet, c.label, ox + 8, oy + (want ? 28 : 22), '#6B6B63', 1);
  text(sheet, `up ${reach.up.toFixed(0)} side ${reach.side.toFixed(0)}`,
    ox + 8, oy + CELL_H - 14, '#8A8A80', 1);
}

const outDir = path.join(REPO, 'scripts', '.lesson-shots');
mkdirSync(outDir, { recursive: true });
const out = path.join(outDir, want ? `wardrobe-${want}.png` : 'wardrobe.png');
const img = new Jimp(sheetW, sheetH);
for (let p = 0; p < sheetW * sheetH; p += 1) {
  img.bitmap.data[p * 4] = sheet.px[p * 3];
  img.bitmap.data[p * 4 + 1] = sheet.px[p * 3 + 1];
  img.bitmap.data[p * 4 + 2] = sheet.px[p * 3 + 2];
  img.bitmap.data[p * 4 + 3] = 255;
}
await img.writeAsync(out);
console.log(`wrote ${out}  (${list.length} costume${list.length > 1 ? 's' : ''}, figure ${FIG}px)`);
