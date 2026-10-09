// DRAW THE UNIT-2 OUTFITS, IN PLAIN NODE — the same geometry Stickman paints.
//
//   node scripts/sheet-garb.mjs                 every outfit, five poses each
//   node scripts/sheet-garb.mjs caesar          one outfit
//   FIG=220 node scripts/sheet-garb.mjs         bigger
//   BG=#E9E2D2 node scripts/sheet-garb.mjs      on a stage-coloured ground
//
// Writes scripts/.lesson-shots/garb[-<id>].png.
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import JimpPkg from 'jimp-compact';
import { canvas, text } from './lib/rasterpath.mjs';

const Jimp = JimpPkg.Jimp ?? JimpPkg;
const REPO = path.resolve(path.dirname(new URL(import.meta.url).pathname).replace(/^\//, ''), '..');
const { transform } = await import(pathToFileURL(path.join(REPO, 'node_modules/sucrase/dist/index.js')).href);
const TMP = path.join(os.tmpdir(), 'ph-garb');
mkdirSync(TMP, { recursive: true });
const emit = (rel, name) => {
  const src = transform(readFileSync(path.join(REPO, rel), 'utf8'), { transforms: ['typescript'] }).code
    .replace(/(from\s+['"])\.\/([A-Za-z0-9_-]+)(['"])/g, '$1./$2.mjs$3');
  writeFileSync(path.join(TMP, name), src);
  return pathToFileURL(path.join(TMP, name)).href;
};
const RIG = await import(emit('components/lesson/cinematic/rig.ts', 'rig.mjs'));
const MOVES = await import(emit('components/lesson/cinematic/moves.ts', 'moves.mjs'));
const G = await import(emit('components/lesson/cinematic/garb.ts', 'garb.mjs'));

const INK = '#1A1A1A';
const PAPER = process.env.BG || '#FAFAF7';

const f = (n) => n.toFixed(2);
function poly(pts) { return `M${pts.map((p) => `${f(p[0])},${f(p[1])}`).join('L')}Z`; }
function disc(cx, cy, r, dir = 1) {
  const pts = [];
  for (let i = 0; i < 40; i += 1) { const a = (dir * 2 * Math.PI * i) / 40; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
  return poly(pts);
}
/** A rounded rect centred at (cx, cy), rotated `ang` radians, as a polygon. */
function rrect(cx, cy, w, h, r, ang) {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  const c = Math.cos(ang); const s = Math.sin(ang);
  const pts = [];
  const corners = [[w / 2 - r, h / 2 - r, 0], [-w / 2 + r, h / 2 - r, 90], [-w / 2 + r, -h / 2 + r, 180], [w / 2 - r, -h / 2 + r, 270]];
  for (const [ox, oy, a0] of corners) {
    for (let i = 0; i <= 6; i += 1) {
      const a = ((a0 + i * 15) * Math.PI) / 180;
      const x = ox + r * Math.cos(a); const y = oy + r * Math.sin(a);
      pts.push([cx + x * c - y * s, cy + x * s + y * c]);
    }
  }
  return poly(pts);
}
function bone(xf, thick) {
  const tx = xf[0].translateX; const ty = xf[1].translateY;
  const r = (parseFloat(String(xf[2].rotate)) * Math.PI) / 180;
  const len = xf[3].scaleX * RIG.BONE_SRC;
  return rrect(tx + Math.cos(r) * len / 2, ty + Math.sin(r) * len / 2, len, thick, 0, r);
}
const dot = (xf, r) => disc(xf[0].translateX, xf[1].translateY, r);

function drawFigure(cv, B, k, outfit, ox, oy) {
  const limb = RIG.STR.limb * k; const torso = RIG.STR.torso * k;
  const ink = (d) => cv.path(d, INK, ox, oy);
  // far leg and far arm, then the trunk, then the near leg — Stickman's order
  ink(bone(B.thighL, limb) + bone(B.shinL, limb) + bone(B.uarmL, limb) + bone(B.farmL, limb)
    + dot(B.shLd, limb / 2) + dot(B.kneeL, limb / 2) + dot(B.ankL, limb / 2) + dot(B.elL, limb / 2) + dot(B.wrL, limb / 2));
  ink(bone(B.torso, torso) + dot(B.pel, torso / 2) + dot(B.shB, torso / 2));
  ink(bone(B.thighR, limb) + bone(B.shinR, limb) + dot(B.kneeR, limb / 2) + dot(B.ankR, limb / 2));
  // the garment
  if (outfit.garb) {
    const line = G.GARB_LINE * k;
    const draw = (bands, withLine) => {
      if (withLine) {
        let d = '';
        for (const b of bands) { const g = G.bandAt(B, k, b, line); d += rrect(g.cx, g.cy, g.len, g.w, (b.r ?? b.w / 2) * k + line, g.ang); }
        if (d) ink(d);
      }
      for (const b of bands) {
        const g = G.bandAt(B, k, b, 0);
        cv.path(rrect(g.cx, g.cy, g.len, g.w, (b.r ?? b.w / 2) * k, g.ang), b.fill, ox, oy);
      }
    };
    const body = outfit.garb.bands.filter((b) => !b.layer);
    draw(body, true);
    for (const b of outfit.garb.bands.filter((b) => b.layer === 1)) draw([b], !b.flat);
  }
  // head, then the near arm
  ink(dot(B.head, RIG.STR.headR * k));
  ink(bone(B.uarmR, limb) + bone(B.farmR, limb) + dot(B.shRd, limb / 2) + dot(B.elR, limb / 2) + dot(B.wrR, limb / 2));
  // head and hand pieces
  const hx = B.head[0].translateX; const hy = B.head[1].translateY;
  const sx = B.shB[0].translateX; const sy = B.shB[1].translateY;
  const neck = Math.atan2(hy - sy, hx - sx) + Math.PI / 2;
  const dir = B.dir < 0 ? -1 : 1;
  for (const p of outfit.head) {
    let ax = hx; let ay = hy; let rot = neck;
    if (p.at === 'handR') { ax = B.wrR[0].translateX; ay = B.wrR[1].translateY; rot = 0; }
    if (p.at === 'handL') { ax = B.wrL[0].translateX; ay = B.wrL[1].translateY; rot = 0; }
    if (p.at === 'pelvis') { ax = B.pel[0].translateX; ay = B.pel[1].translateY; rot = 0; }
    const qx = p.x * dir * k; const qy = p.y * k;
    const cx = ax + qx * Math.cos(rot) - qy * Math.sin(rot);
    const cy = ay + qx * Math.sin(rot) + qy * Math.cos(rot);
    const ang = rot + ((p.rot || 0) * dir * Math.PI) / 180;
    const w = p.w * k; const h = p.h * k; const r = (p.r || 0) * k;
    if (p.ring) {
      cv.path(disc(cx, cy, w / 2) + disc(cx, cy, w / 2 - p.ring * k, -1), p.fill || INK, ox, oy);
      continue;
    }
    if (p.fill) {
      const line = G.GARB_LINE * k * 0.75;
      ink(rrect(cx, cy, w + 2 * line, h + 2 * line, r + line, ang));
      cv.path(rrect(cx, cy, w, h, r, ang), p.fill, ox, oy);
    } else {
      cv.path(rrect(cx, cy, w, h, r, ang), p.paper ? PAPER : INK, ox, oy);
    }
  }
}

const want = process.argv[2] || null;
const list = Object.values(G.OUTFITS).filter((o) => !want || o.id === want);
const FIG = Number(process.env.FIG || 170);
const k = FIG / RIG.FIG_H;
const POSES = [
  ['stand', () => MOVES.emoteAny(25, 0)],
  ['walk', () => MOVES.moveStance(0, 15)],
  ['stride', () => MOVES.moveStance(0, 31)],
  ['gesture', () => MOVES.emoteAny(5, 0.6)],
  ['arms up', () => MOVES.emoteAny(12, 0.6)],
];
const CW = Math.round(FIG * 0.95); const CH = Math.round(FIG * 1.35); const PAD = 8;
const W = POSES.length * CW + (POSES.length + 1) * PAD;
const H = list.length * (CH + PAD) + PAD;
const sheet = canvas(W, H, '#DAD7CE');
list.forEach((o, row) => {
  POSES.forEach(([name, st], col) => {
    const ox = PAD + col * (CW + PAD); const oy = PAD + row * (CH + PAD);
    sheet.fillRect(ox, oy, CW, CH, PAPER);
    const gy = CH - Math.round(FIG * 0.12);
    sheet.fillRect(ox + 6, oy + gy, CW - 12, 1, '#BEBCB4');
    const dir = col === 3 ? -1 : 1;
    const B = RIG.pose(st(), CW / 2, gy, k, dir, 1);
    drawFigure(sheet, B, k, o, ox, oy);
    text(sheet, col === 0 ? o.id : name, ox + 6, oy + 6, '#3A3A36', 1);
  });
});
const outDir = path.join(REPO, 'scripts', '.lesson-shots');
mkdirSync(outDir, { recursive: true });
const out = path.join(outDir, want ? `garb-${want}.png` : 'garb.png');
const img = new Jimp(W, H);
for (let p = 0; p < W * H; p += 1) {
  img.bitmap.data[p * 4] = sheet.px[p * 3]; img.bitmap.data[p * 4 + 1] = sheet.px[p * 3 + 1];
  img.bitmap.data[p * 4 + 2] = sheet.px[p * 3 + 2]; img.bitmap.data[p * 4 + 3] = 255;
}
await img.writeAsync(out);
console.log(`wrote ${out}`);
