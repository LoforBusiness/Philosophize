// LOOK AT THE PROFESSOR'S CHALKBOARD — all six drawings, finished, in plain Node.
//
//   node --import ./scripts/lib/register.mjs scripts/sheet-chalk.mjs [scale]
//
// Every drawing the chalk makes during the intro (components/professor/chalk.ts),
// drawn as it lands on the board: the palette's DEEP slate, chalk in paper at the
// component's own opacity and width, each piece's box outlined faintly so a word
// crowding its neighbour can be seen. Writes scripts/.lesson-shots/chalk.png.
//
// Numbers catch geometry; only a picture says whether "EPISTEMOLOGY" can be read at
// phone size. `check:professor` holds the geometry; this is how it gets looked at.
import fs from 'node:fs';
import JimpPkg from 'jimp-compact';

const Jimp = JimpPkg.default || JimpPkg;
const C = await import('@/components/professor/chalk');
const T = await import('@/components/shared/tone');
const R = await import('./lib/rasterpath.mjs');

const S = +(process.argv[2] || 2.6);
const IDS = ['title', 'branches', 'logic_ethics', 'epistemology', 'format', 'pass'];
const GAP = 14;
const BW = Math.round(C.BOARD_W * S), BH = Math.round(C.BOARD_H * S);
const cols = 2, rows = 3;
const cv = R.canvas(GAP + cols * (BW + GAP), GAP + rows * (BH + GAP) + 20, T.PAPER);

const hex = (h) => R.rgb(h);
/** An anti-aliased thick segment, alpha-blended, touching only the pixels near it. */
function seg(x1, y1, x2, y2, w, col, alpha) {
  const [cr, cg, cb] = hex(col);
  const r = w / 2;
  const minX = Math.max(0, Math.floor(Math.min(x1, x2) - r - 1)), maxX = Math.min(cv.w - 1, Math.ceil(Math.max(x1, x2) + r + 1));
  const minY = Math.max(0, Math.floor(Math.min(y1, y2) - r - 1)), maxY = Math.min(cv.h - 1, Math.ceil(Math.max(y1, y2) + r + 1));
  const dx = x2 - x1, dy = y2 - y1, L2 = dx * dx + dy * dy || 1;
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const t = Math.max(0, Math.min(1, ((x + 0.5 - x1) * dx + (y + 0.5 - y1) * dy) / L2));
      const d = Math.hypot(x + 0.5 - (x1 + t * dx), y + 0.5 - (y1 + t * dy));
      const a = Math.max(0, Math.min(1, r + 0.5 - d)) * alpha;
      if (a <= 0) continue;
      const i = (y * cv.w + x) * 3;
      cv.px[i] += (cr - cv.px[i]) * a;
      cv.px[i + 1] += (cg - cv.px[i + 1]) * a;
      cv.px[i + 2] += (cb - cv.px[i + 2]) * a;
    }
  }
}
function polyOf(d) {
  return [...d.matchAll(/[ML](-?[\d.]+) (-?[\d.]+)/g)].map((m) => [+m[1], +m[2]]);
}

IDS.forEach((id, n) => {
  const ox = GAP + (n % cols) * (BW + GAP), oy = GAP + Math.floor(n / cols) * (BH + GAP);
  cv.fillRect(ox, oy, BW, BH, T.DEEP);
  for (const p of C.layoutChalk(id)) {
    // the piece's box, faint, so crowding shows
    const bx = ox + p.box.x * S, by = oy + p.box.y * S, bw = p.box.w * S, bh = p.box.h * S;
    for (const [a, b, c, d] of [[bx, by, bx + bw, by], [bx, by + bh, bx + bw, by + bh], [bx, by, bx, by + bh], [bx + bw, by, bx + bw, by + bh]]) {
      seg(a, b, c, d, 1, T.SAGE, 0.25);
    }
    for (const s of p.strokes) {
      const pts = polyOf(s.d);
      for (let i = 1; i < pts.length; i++) {
        seg(ox + (p.box.x + pts[i - 1][0]) * S, oy + (p.box.y + pts[i - 1][1]) * S,
          ox + (p.box.x + pts[i][0]) * S, oy + (p.box.y + pts[i][1]) * S, C.CHALK_W * S, T.PAPER_LIT, 0.92);
      }
    }
  }
  R.text(cv, id.replace('_', ' '), ox, oy + BH + 3, T.MID, 1);
});

fs.mkdirSync('scripts/.lesson-shots', { recursive: true });
const out = 'scripts/.lesson-shots/chalk.png';
const img = await new Promise((res, rej) => new Jimp(cv.w, cv.h, (e, i) => (e ? rej(e) : res(i))));
for (let i = 0; i < cv.w * cv.h; i += 1) {
  img.bitmap.data[i * 4] = cv.px[i * 3];
  img.bitmap.data[i * 4 + 1] = cv.px[i * 3 + 1];
  img.bitmap.data[i * 4 + 2] = cv.px[i * 3 + 2];
  img.bitmap.data[i * 4 + 3] = 255;
}
await img.writeAsync(out);
console.log(`${out} · ${cv.w}×${cv.h} · board ${C.BOARD_W}×${C.BOARD_H} at ${S}×`);
