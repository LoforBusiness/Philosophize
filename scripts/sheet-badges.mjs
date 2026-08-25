// LOOK AT THE WHOLE BADGE CASE, without a phone and without a browser.
//
//   node scripts/sheet-badges.mjs          six families x five tiers
//   PIN=140 node scripts/sheet-badges.mjs  drawn large
//
// WHY THIS EXISTS, and it is the same argument scripts/sheet-ranks.mjs makes.
// scripts/validate-badges.mjs measures the badges — that the mark clears the
// inner rule, that no two share a glyph, that the roll has not moved — and every
// one of those numbers can be green while the medals themselves are unreadable
// or identical to each other. Numbers cannot see a shape, and the case has
// FIFTY-SEVEN objects in it: six silhouettes struck in five metals with five
// mountings, which is far past what anyone can hold in their head.
//
// It paid for itself on its first run: tiers IV and V had been added to the data
// with no furniture of their own, so thirty-three badges — every one that takes
// months to earn — were the tier-III object in a different metal. That is
// obvious in a grid and invisible in a checklist.
//
// components/shared/badgeShapes.ts has ZERO imports precisely so this is
// possible, exactly as rig.ts and tone.ts do. What is re-implemented here is the
// LAYERING (the order BadgeMedal paints in, and its trick of faking a stroke
// with two fills), because that lives in the component and the component is
// React. Anything geometric is imported rather than restated.
//
// The MARK is a stand-in — a triangle ring rather than the real Glyph, which is
// a React component. That is deliberate and it is enough: this sheet is for the
// MOUNTING and the room it leaves, and a stand-in of the right size answers "is
// the medal crowded" exactly as well as the real one would.
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
const TMP = path.join(os.tmpdir(), 'ph-badges');
mkdirSync(TMP, { recursive: true });
const emit = (rel, name) => {
  writeFileSync(
    path.join(TMP, name),
    transform(readFileSync(path.join(REPO, rel), 'utf8'), { transforms: ['typescript'] }).code,
  );
  return pathToFileURL(path.join(TMP, name)).href;
};

const B = await import(emit('components/shared/badgeShapes.ts', 'badgeShapes.mjs'));
const I = await import(emit('constants/insignia.ts', 'insignia.mjs'));
const T = await import(emit('components/shared/tone.ts', 'tone.mjs'));

const BOX = Number(process.env.PIN) || 104;
const PAD = 13;
const LABEL = 15;
const FAMILIES = ['lessons', 'streak', 'thinkers', 'quotes', 'xp', 'mastery'];
const TIERS = [1, 2, 3, 4, 5];

// ── shading, lifted from sheet-ranks for the reason stated there ────────────
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
function stopsAt(stops, t) {
  const at = stops.map(([o, c]) => [parseFloat(o) / 100, rgb(c)]);
  if (t <= at[0][0]) return at[0][1];
  for (let i = 1; i < at.length; i++) {
    if (t <= at[i][0]) {
      const span = at[i][0] - at[i - 1][0] || 1;
      return mix(at[i - 1][1], at[i][1], (t - at[i - 1][0]) / span);
    }
  }
  return at[at.length - 1][1];
}
function bbox(d) {
  const nums = d.match(/-?\d*\.?\d+/g)?.map(Number) ?? [];
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (let i = 0; i + 1 < nums.length; i += 2) {
    x0 = Math.min(x0, nums[i]); x1 = Math.max(x1, nums[i]);
    y0 = Math.min(y0, nums[i + 1]); y1 = Math.max(y1, nums[i + 1]);
  }
  return [x0, y0, x1, y1];
}
const pc = (s) => parseFloat(s) / 100;
function fill(cv, d, stops, ox, oy, scale, alpha = 1) {
  const cov = coverage(d, cv.w, cv.h, ox, oy, scale, 4);
  const [bx0, by0, bx1, by1] = bbox(d);
  const bw = Math.max(1e-6, bx1 - bx0), bh = Math.max(1e-6, by1 - by0);
  const ax = pc(T.LIGHT.x1), ay = pc(T.LIGHT.y1);
  const dx = pc(T.LIGHT.x2) - ax, dy = pc(T.LIGHT.y2) - ay;
  const den = dx * dx + dy * dy;
  for (let py = 0; py < cv.h; py++) {
    for (let px = 0; px < cv.w; px++) {
      const i = py * cv.w + px;
      const a = Math.min(1, cov[i]) * alpha;
      if (a <= 0.003) continue;
      const ux = ((px + 0.5) / scale - ox - bx0) / bw;
      const uy = ((py + 0.5) / scale - oy - by0) / bh;
      const t = Math.max(0, Math.min(1, ((ux - ax) * dx + (uy - ay) * dy) / den));
      const [r, g, b] = stopsAt(stops, t);
      const j = i * 3;
      cv.px[j] += (r - cv.px[j]) * a;
      cv.px[j + 1] += (g - cv.px[j + 1]) * a;
      cv.px[j + 2] += (b - cv.px[j + 2]) * a;
    }
  }
}
const flatStops = (hex) => [['0%', hex, 1], ['100%', hex, 1]];

// ── the two shapes the component builds and this file has to rebuild ────────

/** A rotated ellipse as four cubics — a laurel leaf, which <Ellipse> draws. */
function ellipsePath(cx, cy, rx, ry, rotDeg) {
  const a = (rotDeg * Math.PI) / 180, cos = Math.cos(a), sin = Math.sin(a);
  const P = (u, v) => `${(cx + u * cos - v * sin).toFixed(2)} ${(cy + u * sin + v * cos).toFixed(2)}`;
  const kx = rx * 0.5523, ky = ry * 0.5523;
  return (
    `M${P(-rx, 0)}` +
    ` C${P(-rx, -ky)} ${P(-kx, -ry)} ${P(0, -ry)}` +
    ` C${P(kx, -ry)} ${P(rx, -ky)} ${P(rx, 0)}` +
    ` C${P(rx, ky)} ${P(kx, ry)} ${P(0, ry)}` +
    ` C${P(-kx, ry)} ${P(-rx, ky)} ${P(-rx, 0)} Z`
  );
}

/**
 * The stem, which is a STROKED quadratic on device and has to become a filled
 * ribbon here — the rasteriser fills and does not stroke, and it reads M/L/C/Z
 * and no Q at all. Sampled and offset along its own normal.
 */
function stemPath(d, w = 1.1) {
  const n = d.match(/-?\d*\.?\d+/g).map(Number);
  const [x0, y0, cx, cy, x1, y1] = n;
  const N = 28;
  const L = [], R = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N, u = 1 - t;
    const x = u * u * x0 + 2 * u * t * cx + t * t * x1;
    const y = u * u * y0 + 2 * u * t * cy + t * t * y1;
    const dx = 2 * u * (cx - x0) + 2 * t * (x1 - cx);
    const dy = 2 * u * (cy - y0) + 2 * t * (y1 - cy);
    const m = Math.hypot(dx, dy) || 1;
    L.push(`${(x - (dy / m) * w).toFixed(2)} ${(y + (dx / m) * w).toFixed(2)}`);
    R.push(`${(x + (dy / m) * w).toFixed(2)} ${(y - (dx / m) * w).toFixed(2)}`);
  }
  return `M${L.join(' L')} L${R.reverse().join(' L')} Z`;
}

/** The stand-in mark: a triangle ring, hollow by the non-zero winding rule. */
function markPath(size, dy) {
  const r = size * 50;
  const cy = 50 + dy * 100 + r * 0.12;
  const tri = (rr, dir) => {
    const p = [];
    for (let i = 0; i < 3; i++) {
      const a = -Math.PI / 2 + (dir * i * 2 * Math.PI) / 3;
      p.push(`${(50 + rr * Math.cos(a)).toFixed(2)} ${(cy + rr * Math.sin(a)).toFixed(2)}`);
    }
    return `M${p.join(' L')} Z`;
  };
  return `${tri(r, 1)} ${tri(r * 0.58, -1)}`;
}

/**
 * A family's outline as M/L, from badgeShapes' OWN flattened points.
 *
 * `SHAPE.thinkers` and `SHAPE.lessons` both use `A` (arc) commands and the
 * rasteriser reads M/L/C/Z and nothing else -- so the first run of this sheet
 * drew the roundel as a folded triangle and the stele as a sliver, which looks
 * exactly like a badge that is broken. `outlinePoints` is the same numbers
 * expressed as a polygon, written side by side with the `d` strings for exactly
 * this reason (see the note on it).
 */
const path2 = (family, m) =>
  `M${B.outlinePoints(family, m).map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join(' L')} Z`;

const RIBBON = B.ribbonPaths(84, 34, 13);
const LAUREL_OPEN = [B.laurelSprig(-1), B.laurelSprig(1)];
const LAUREL_SHUT = [B.laurelSprig(-1, 9, true), B.laurelSprig(1, 9, true)];

// ── one badge ──────────────────────────────────────────────────────────────
function badge(family, tier, earned, box) {
  const cv = canvas(box, box, T.PAPER);
  const k = box / 100;
  const m = I.tierInsignia(tier);
  const face = earned ? I.insigniaFace(m) : T.LOCKED_FACE;
  const rim = earned ? I.insigniaRim(m) : flatStops(T.GHOST);
  const ink = earned ? m.on : T.GHOST;
  const outer = path2(family, 0);

  // The medal's own transform, expressed the way `fill` wants it: the component
  // does `translate(13 7) scale(0.74)`, so the offset has to be divided back out
  // of the scale before it is handed over as a path-space offset.
  const MS = B.MEDAL_SCALE;
  const mk = MS * k;
  const mox = (50 - 50 * MS) / MS;
  const moy = (50 - 50 * MS + B.MEDAL_DY) / MS;
  const med = (d, stops, alpha = 1, dx = 0, dy = 0) =>
    fill(cv, d, stops, mox + dx, moy + dy, mk, alpha);

  // 1 · the laurel, behind everything. Paper leaves with an ink edge, faked as
  //     a bigger ink copy under a smaller paper one.
  if (earned && tier >= 3) {
    for (const sprig of tier >= 4 ? LAUREL_SHUT : LAUREL_OPEN) {
      fill(cv, stemPath(sprig.stem), flatStops(T.INK), 0, 0, k);
      for (const l of sprig.leaf) {
        fill(cv, ellipsePath(l.cx, l.cy, l.rx + 0.65, l.ry + 0.65, l.rot), flatStops(T.INK), 0, 0, k);
        fill(cv, ellipsePath(l.cx, l.cy, l.rx - 0.65, l.ry - 0.65, l.rot), flatStops(T.PAPER), 0, 0, k);
      }
    }
  }

  // 2 · the collar, UNDER the medal. It is a stroke on device and two fills
  //     here, and both of them are bigger than the medal -- laid down afterwards
  //     the paper one paints the medal out, which is what the first run showed:
  //     a whole column of tier-V badges reduced to an empty ring.
  if (earned && tier >= 5) {
    med(path2(family, B.COLLAR - 1), flatStops(m.base));
    med(path2(family, B.COLLAR + 1), flatStops(T.PAPER));
  }

  // 3 · the medal
  if (earned) med(outer, flatStops(T.INK), T.SHADOW.opacity, T.SHADOW.dx / MS, T.SHADOW.dy / MS);
  med(outer, rim);                       // the turned edge…
  med(path2(family, 1.6), face);         // …with the face laid inside it
  if (tier > 1) {
    med(path2(family, B.INNER[tier]), flatStops(earned ? m.rule : T.GHOST));
    med(path2(family, B.INNER[tier] + 1.2), face);
  }
  // 4 · the ribbon, over the medal's foot
  if (earned && tier >= 2) {
    for (const tab of [RIBBON.tabL, RIBBON.tabR]) {
      fill(cv, tab, flatStops(T.INK), 0, 0, k);
      fill(cv, tab, flatStops(m.shade), 0, 0, k, 0.92);
    }
    fill(cv, RIBBON.band, flatStops(T.INK), 0, 0, k);
    fill(cv, RIBBON.band, face, 0, 0, k, 0.9);
  }

  // 5 · the mark, which rides the medal
  med(markPath(B.GLYPH_SCALE[family], B.GLYPH_DY[family]), flatStops(ink));
  return cv;
}

// ── the sheet ──────────────────────────────────────────────────────────────
const cellW = BOX + PAD;
const cellH = BOX + PAD + LABEL;
const cols = TIERS.length + 1;                    // …plus one locked column
const sheetW = PAD + cols * cellW;
const sheetH = PAD + FAMILIES.length * cellH + LABEL;
const sheet = canvas(sheetW, sheetH, '#EFEDE6');

text(sheet, '6 FAMILIES (DOWN) X 5 TIERS (ACROSS) + LOCKED', PAD, 5, '#6B6B6B', 1);

FAMILIES.forEach((family, r) => {
  const y = PAD + LABEL + r * cellH;
  TIERS.forEach((tier, c) => {
    const x = PAD + c * cellW;
    sheet.blit(badge(family, tier, true, BOX), x, y);
    text(sheet, `${family.toUpperCase()} ${'I'.repeat(tier).replace('IIII', 'IV').replace('IVI', 'V')}`,
      x, y + BOX + 3, '#4A4A4A', 1);
  });
  const x = PAD + TIERS.length * cellW;
  sheet.blit(badge(family, 5, false, BOX), x, y);
  text(sheet, 'LOCKED', x, y + BOX + 3, '#8A8A8A', 1);
});

const out = new Jimp(sheetW, sheetH);
for (let i = 0; i < sheetW * sheetH; i++) {
  out.bitmap.data[i * 4] = sheet.px[i * 3];
  out.bitmap.data[i * 4 + 1] = sheet.px[i * 3 + 1];
  out.bitmap.data[i * 4 + 2] = sheet.px[i * 3 + 2];
  out.bitmap.data[i * 4 + 3] = 255;
}
const dest = path.join(os.tmpdir(), 'badge-sheet.png');
await out.writeAsync(dest);
console.log(`${FAMILIES.length} families x ${TIERS.length} tiers -> ${dest}  (${sheetW}x${sheetH})`);
