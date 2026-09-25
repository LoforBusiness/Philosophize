// WHAT THE SHADOW UNDER THE FIGURE ACTUALLY LOOKS LIKE, IN PLAIN NODE.
//
//   npm run sheet:shadow           standing, mid-stride, and the feet magnified
//   SCALE=5 npm run sheet:shadow   bigger
//
// The only instrument that can answer "does the shadow read as a shadow", and the
// one that found the fault the owner reported: *"I dont want that gray thing at
// the stickmans feet that follows him around, I like the idea of a shadow but this
// doesnt look very good."* Three things were wrong and only the render showed any
// of them -- a hard-edged capsule, 34 units wide against a foot span of 12, laid
// ACROSS the ground line so half of it sat on bare paper over the floor's own
// white hairline. See `pillStyle` in stageSkin.ts.
//
// It draws the REAL rig through `pose` and the REAL style through `pillStyle`, so
// what is on the sheet is what ships rather than a copy of its numbers -- and it
// costs no Metro and no browser. `WAS` is the capsule that was replaced, kept so
// the comparison stays honest.
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import JimpPkg from 'jimp-compact';
import { coverage, canvas, rgb, text } from './lib/rasterpath.mjs';

const Jimp = JimpPkg.Jimp ?? JimpPkg;
const REPO = path.resolve('.');
const { transform } = await import(
  pathToFileURL(path.join(REPO, 'node_modules/sucrase/dist/index.js')).href
);
const TMP = path.join(os.tmpdir(), 'ph-shadow');
mkdirSync(TMP, { recursive: true });
const emit = (rel, name) => {
  const src = transform(readFileSync(path.join(REPO, rel), 'utf8'), { transforms: ['typescript'] }).code
    .replace(/(from\s+['"])\.\/([A-Za-z0-9_-]+)(['"])/g, '$1./$2.mjs$3');
  writeFileSync(path.join(TMP, name), src);
  return pathToFileURL(path.join(TMP, name)).href;
};
const RIG = await import(emit('components/lesson/cinematic/rig.ts', 'rig.mjs'));
const MOVES = await import(emit('components/lesson/cinematic/moves.ts', 'moves.mjs'));

// THE SHIPPED STYLE ITSELF, not a copy of its numbers. `stageSkin` reaches for
// `C.ink` and a tone type and nothing else, so a two-line stub is enough to load
// it -- and then the sheet is drawing what the app draws rather than restating it.
writeFileSync(path.join(TMP, 'design.mjs'), "export const C = { ink: '#1A1A1A' };\n");
writeFileSync(path.join(TMP, 'stageTones.mjs'), 'export default {};\n');
const SKIN = await import((() => {
  const src = transform(readFileSync('components/lesson/cinematic/stageSkin.ts', 'utf8'), { transforms: ['typescript'] }).code
    .replace(/from '@\/constants\/design'/, "from './design.mjs'")
    .replace(/(from\s+['"])\.\/([A-Za-z0-9_-]+)(['"])/g, '$1./$2.mjs$3');
  writeFileSync(path.join(TMP, 'stageSkin.mjs'), src);
  return pathToFileURL(path.join(TMP, 'stageSkin.mjs')).href;
})());

/** Pull the four numbers the sheet needs back out of the real returned style. */
function shipped(k) {
  const s = SKIN.pillStyle(k);
  const alpha = (str) => Number(String(str).match(/([0-9.]+)\)$/)[1]);
  return {
    w: s.width,
    h: s.height,
    dy: s.top + s.height / 2,                              // offset below the ankle
    fill: alpha(s.backgroundColor),
    halo: alpha(s.boxShadow),
    blur: Number(String(s.boxShadow).match(/0px ([0-9.]+)px rgba/)[1]),
  };
}

const INK = '#1A1A1A';
const PAPER = '#FAFAF7';
const RULE = '#E4E1D8';
const SHADE = '#A8A296';

// -- paths (no arcs -- rasterpath flattens on (x,y) pairs) -------------------
function disc(cx, cy, r, n = 48) {
  const p = [];
  for (let i = 0; i < n; i += 1) {
    const a = (2 * Math.PI * i) / n;
    p.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
  }
  return `M${p.join('L')}Z`;
}
function rect(cx, cy, w, h, deg = 0) {
  const r = (deg * Math.PI) / 180; const c = Math.cos(r); const s = Math.sin(r);
  const pts = [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]]
    .map(([x, y]) => [cx + x * c - y * s, cy + x * s + y * c]);
  return `M${pts.map((p) => `${p[0].toFixed(2)},${p[1].toFixed(2)}`).join('L')}Z`;
}
const pill = (cx, cy, w, h) => {
  const k = h / 2;
  return rect(cx, cy, w - 2 * k, h) + disc(cx - w / 2 + k, cy, k) + disc(cx + w / 2 - k, cy, k);
};
function bonePath(xf, thick) {
  const tx = xf[0].translateX; const ty = xf[1].translateY;
  const deg = parseFloat(String(xf[2].rotate));
  const len = xf[3].scaleX * RIG.BONE_SRC;
  const r = (deg * Math.PI) / 180; const c = Math.cos(r); const s = Math.sin(r);
  const pts = [[0, -thick / 2], [len, -thick / 2], [len, thick / 2], [0, thick / 2]]
    .map(([x, y]) => [tx + x * c - y * s, ty + x * s + y * c]);
  return `M${pts.map((p) => `${p[0].toFixed(2)},${p[1].toFixed(2)}`).join('L')}Z`;
}
const jointAt = (xf, r) => disc(xf[0].translateX, xf[1].translateY, r);
function figurePath(B, k) {
  const limb = RIG.STR.limb * k; const torso = RIG.STR.torso * k; const headR = RIG.STR.headR * k;
  let d = '';
  for (const n of ['thighL', 'shinL', 'thighR', 'shinR', 'uarmL', 'farmL', 'uarmR', 'farmR']) d += bonePath(B[n], limb);
  d += bonePath(B.torso, torso);
  for (const n of ['kneeL', 'kneeR', 'ankL', 'ankR', 'elL', 'elR', 'wrL', 'wrR', 'shLd', 'shRd']) d += jointAt(B[n], limb / 2);
  d += jointAt(B.pel, torso / 2) + jointAt(B.shB, torso / 2) + jointAt(B.head, headR);
  return d;
}

// -- a blurred mark: coverage, box-blurred three times, which is a gaussian --
function blurred(cv, d, hex, scale, peak, radius) {
  const { w, h } = cv;
  const a = coverage(d, w, h, 0, 0, scale);
  const tmp = new Float32Array(w * h);
  const r = Math.max(1, Math.round(radius * scale));
  const at = (i, lo, hi) => Math.min(hi, Math.max(lo, i));
  for (let pass = 0; pass < 3; pass += 1) {
    for (let y = 0; y < h; y += 1) {
      let sum = 0;
      for (let x = -r; x <= r; x += 1) sum += a[y * w + at(x, 0, w - 1)];
      for (let x = 0; x < w; x += 1) {
        tmp[y * w + x] = sum / (2 * r + 1);
        sum -= a[y * w + at(x - r, 0, w - 1)];
        sum += a[y * w + at(x + r + 1, 0, w - 1)];
      }
    }
    for (let x = 0; x < w; x += 1) {
      let sum = 0;
      for (let y = -r; y <= r; y += 1) sum += tmp[at(y, 0, h - 1) * w + x];
      for (let y = 0; y < h; y += 1) {
        a[y * w + x] = sum / (2 * r + 1);
        sum -= tmp[at(y - r, 0, h - 1) * w + x];
        sum += tmp[at(y + r + 1, 0, h - 1) * w + x];
      }
    }
  }
  let max = 0;
  for (let i = 0; i < a.length; i += 1) if (a[i] > max) max = a[i];
  if (max <= 0) return;
  const [cr, cg, cb] = rgb(hex);
  for (let i = 0; i < w * h; i += 1) {
    const v = (a[i] / max) * peak;
    if (v <= 0.002) continue;
    const j = i * 3;
    cv.px[j] += (cr - cv.px[j]) * v;
    cv.px[j + 1] += (cg - cv.px[j + 1]) * v;
    cv.px[j + 2] += (cb - cv.px[j + 2]) * v;
  }
}

/**
 * A SHADOW AS REACT NATIVE WOULD ACTUALLY DRAW IT, which is not a plain blur.
 *
 * CSS clips an outer `box-shadow` to OUTSIDE the border box, so a transparent
 * View with a boxShadow comes out a hollow ring -- the middle is knocked out.
 * The shape that works is a fill PLUS a halo, and the seam between them is
 * invisible only at one ratio: a gaussian across a step edge reads exactly half
 * the inside value AT the edge, so the fill has to be half the halo's alpha.
 *
 *   backgroundColor: rgba(ink, A/2)
 *   boxShadow:       0 0 Bpx rgba(ink, A)
 *
 * Drawn here the same way: the halo is the blurred pill with the pill's own area
 * cut out, and the core is flat. An offline model is calibrated against the
 * instrument it stands in for, never against an idealised one.
 */
function rnShadow(cv, d, scale, A, blurUnits, ink = INK) {
  const { w, h } = cv;
  const inside = coverage(d, w, h, 0, 0, scale);
  const halo = coverage(d, w, h, 0, 0, scale);
  const tmp = new Float32Array(w * h);
  const r = Math.max(1, Math.round((blurUnits / 2) * scale));
  const at = (i, hi) => Math.min(hi, Math.max(0, i));
  for (let pass = 0; pass < 3; pass += 1) {
    for (let y = 0; y < h; y += 1) {
      let sum = 0;
      for (let x = -r; x <= r; x += 1) sum += halo[y * w + at(x, w - 1)];
      for (let x = 0; x < w; x += 1) {
        tmp[y * w + x] = sum / (2 * r + 1);
        sum -= halo[y * w + at(x - r, w - 1)];
        sum += halo[y * w + at(x + r + 1, w - 1)];
      }
    }
    for (let x = 0; x < w; x += 1) {
      let sum = 0;
      for (let y = -r; y <= r; y += 1) sum += tmp[at(y, h - 1) * w + x];
      for (let y = 0; y < h; y += 1) {
        halo[y * w + x] = sum / (2 * r + 1);
        sum -= tmp[at(y - r, h - 1) * w + x];
        sum += tmp[at(y + r + 1, h - 1) * w + x];
      }
    }
  }
  const [cr, cg, cb] = rgb(ink);
  for (let i = 0; i < w * h; i += 1) {
    const inCore = Math.min(1, inside[i]);
    // outside the box: the halo. inside it: the flat fill, at half the alpha.
    const v = inCore > 0 ? inCore * (A / 2) : Math.min(1, halo[i]) * A;
    if (v <= 0.002) continue;
    const j = i * 3;
    cv.px[j] += (cr - cv.px[j]) * v;
    cv.px[j + 1] += (cg - cv.px[j + 1]) * v;
    cv.px[j + 2] += (cb - cv.px[j + 2]) * v;
  }
}

// -- one panel ---------------------------------------------------------------
const SCALE = Number(process.env.SCALE || 3);   // px per design unit
const PW = 150; const PH = 190;                 // design units
const GROUND_Y = 150;

function bundleFor(mode, k) {
  // `stride` is the case the pill was written for: feet apart, the fade firing.
  const st = mode === 'stride'
    ? MOVES.moveStance(0, 17)   // mid-cycle of the lesson walk: the feet are apart
    : MOVES.emoteAny(0, 0.6);
  return RIG.pose(st, PW / 2, GROUND_Y, k, 1, 1);
}

function panel(label, kind, moveCode, k = 1) {
  const cv = canvas(PW * SCALE, PH * SCALE, PAPER);
  cv.fillRect(0, GROUND_Y * SCALE, PW * SCALE, (PH - GROUND_Y) * SCALE, RULE);
  cv.fillRect(0, (PH - 7) * SCALE, PW * SCALE, 7 * SCALE, SHADE);
  cv.fillRect(0, GROUND_Y * SCALE, PW * SCALE, 1.5 * SCALE, '#FFFFFF');

  const bundle = bundleFor(moveCode, k);
  const lx = bundle.ankL[0].translateX; const rx = bundle.ankR[0].translateX;
  const ly = bundle.ankL[1].translateY; const ry = bundle.ankR[1].translateY;
  const cx = (lx + rx) / 2; const cy = Math.max(ly, ry);
  const part = Math.min(1, Math.abs(lx - rx) / (26 * k));
  const fade = 1 - 0.45 * part;

  // The shadow sits UNDER the ground line, not across it. The shipped pill is
  // centred on the ankle y, so 2.5 of its 5 units lie on PAPER above the floor
  // and it straddles the floor's own white hairline -- half a grey capsule on
  // white is most of why it reads as an object laid on the boundary.
  const under = cy + 1.5 * k;

  if (kind === 'ship') {
    // WHAT THE APP NOW DRAWS, read off `pillStyle` itself.
    const s = shipped(k);
    rnShadow(cv, pill(cx, cy + s.dy, s.w, s.h), SCALE, s.halo * fade, s.blur);
  } else if (kind === 'now') {
    cv.path(pill(cx, cy, 34 * k, 5 * k), INK, 0, 0, SCALE, 0.16 * fade);
  } else if (kind === 'soft') {
    rnShadow(cv, pill(cx, under, 26 * k, 3 * k), SCALE, 0.26 * fade, 7);
  } else if (kind === 'tight') {
    rnShadow(cv, pill(cx, under, 17 * k, 2.5 * k), SCALE, 0.34 * fade, 5);
  } else if (kind === 'contact') {
    rnShadow(cv, pill(lx, ly + 1.5 * k, 13 * k, 2.5 * k), SCALE, 0.28, 5);
    rnShadow(cv, pill(rx, ry + 1.5 * k, 13 * k, 2.5 * k), SCALE, 0.28, 5);
  }

  cv.path(figurePath(bundle, k), INK, 0, 0, SCALE);
  text(cv, label, 6 * SCALE, 6 * SCALE, INK, Math.round(SCALE * 0.8));
  return cv;
}

const KINDS = [
  ['NONE', 'none'],
  ['WAS  flat pill', 'now'],
  ['NOW  shipped', 'ship'],
];
const POSES = [['stand', 'standing'], ['stride', 'mid stride']];

// A CROP OF THE FEET, magnified. The whole argument is about a mark four units
// tall, and §19's rule is explicit: a thing that looks wrong at 2x may be right
// at 4x, so go and look bigger rather than judging the small picture.
const CROP_W = 44; const CROP_H = 26; const ZOOM = PW / CROP_W;  // rows line up
function crop(src, cx, cy) {
  const out = canvas(Math.round(CROP_W * ZOOM * SCALE), Math.round(CROP_H * ZOOM * SCALE), PAPER);
  const x0 = Math.round((cx - CROP_W / 2) * SCALE);
  const y0 = Math.round((cy - CROP_H / 2) * SCALE);
  for (let y = 0; y < out.h; y += 1) {
    for (let x = 0; x < out.w; x += 1) {
      const sx = x0 + Math.floor(x / ZOOM);
      const sy = y0 + Math.floor(y / ZOOM);
      if (sx < 0 || sy < 0 || sx >= src.w || sy >= src.h) continue;
      const s = (sy * src.w + sx) * 3; const d = (y * out.w + x) * 3;
      out.px[d] = src.px[s]; out.px[d + 1] = src.px[s + 1]; out.px[d + 2] = src.px[s + 2];
    }
  }
  return out;
}

// MEASURE IT, rather than judging a downscaled picture (§19). For each candidate:
// how much darker than the bare floor the mark gets, and how wide it is at half
// that -- which is the number the complaint is really about, since the shipped
// pill is 34 units wide against a foot span of about 12.
function measure(kind) {
  const cv = panel('', kind, 'stand');
  const base = panel('', 'none', 'stand');
  // Read ONE stated row -- the mark's own centre, 1.5 units below the ground
  // line. Hunting for the darkest pixel picks whichever row happens to sit on
  // PAPER rather than on the floor, which is a fact about the boundary and not
  // about the mark.
  const row = Math.round((GROUND_Y + 1.5) * SCALE);
  const at = (x) => base.px[(row * cv.w + x) * 3] - cv.px[(row * cv.w + x) * 3];
  let peak = 0;
  for (let x = 0; x < cv.w; x += 1) peak = Math.max(peak, at(x));
  let half = 0; let seen = 0;
  for (let x = 0; x < cv.w; x += 1) {
    if (at(x) >= peak / 2) half += 1;
    if (at(x) >= 3) seen += 1;             // 3/255 is about the floor of visible
  }
  return { peak, half: half / SCALE, seen: seen / SCALE };
}
console.log('candidate         darkest   width@half   visible width  (design units)');
for (const [label, kind] of [['WAS flat pill', 'now'], ['NOW shipped', 'ship']]) {
  const m = measure(kind);
  console.log(`  ${label.padEnd(16)} ${String(m.peak).padStart(5)}    ${m.half.toFixed(1).padStart(8)}    ${m.seen.toFixed(1).padStart(10)}`);
}

const rows = [];
POSES.forEach(([code]) => {
  rows.push(KINDS.map(([label, kind]) => panel(label, kind, code)));
});
// the feet crop of each standing panel, at 4x
rows.push(KINDS.map(([label, kind]) => crop(panel(label, kind, 'stand'), PW / 2, GROUND_Y - 6)));

const rowH = rows.map((r) => r[0].h);
const sheet = canvas(
  Math.max(...rows.map((r) => r.reduce((a, p) => a + p.w, 0))),
  rowH.reduce((a, b) => a + b, 0),
  PAPER,
);
let y = 0;
rows.forEach((r, i) => {
  let x = 0;
  r.forEach((p) => { sheet.blit(p, x, y); x += p.w; });
  y += rowH[i];
});

const out = path.join(os.tmpdir(), 'ph-shadow-sheet.png');
const img = new Jimp(sheet.w, sheet.h);
for (let i = 0; i < sheet.w * sheet.h; i += 1) {
  img.bitmap.data[i * 4] = sheet.px[i * 3];
  img.bitmap.data[i * 4 + 1] = sheet.px[i * 3 + 1];
  img.bitmap.data[i * 4 + 2] = sheet.px[i * 3 + 2];
  img.bitmap.data[i * 4 + 3] = 255;
}
await img.writeAsync(out);
console.log('wrote', out, sheet.w + 'x' + sheet.h);
