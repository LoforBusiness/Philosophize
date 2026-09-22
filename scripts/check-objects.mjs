// THE OBJECTS ARE DRAWINGS, NOT BOXES (group AM).
//
//   npm run check:objects
//
// A reader, on the corpus as it stood: *"a table that doesn't really look like a
// table, like a tree that doesn't really look like a tree … the objects making up the
// object doesn't fit and work."* 312 named objects across 154 scenes, 94 of them one
// square-cornered rectangle.
//
// ── WHAT A NUMBER CAN AND CANNOT SAY ────────────────────────────────────────
//
// It cannot say whether a drawing looks like a ship. `npm run sheet:objects` is for
// that, and it is the only instrument that has ever caught one of these: a hull came
// back a soup bowl, a lamp a road sign, a coin a crucifix and a column upside-down,
// all of them passing every rule below.
//
// What a number CAN say is that a drawing has not quietly collapsed back into the
// thing it replaced — that it still has parts, that its parts still fit each other,
// and that the corpus is not growing new bare rectangles behind it. That is what this
// holds, and all of it is a ratchet.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const REPO = process.cwd();
const { transform } = await import(pathToFileURL(path.join(REPO, 'node_modules/sucrase/dist/index.js')).href);
const TMP = path.join(os.tmpdir(), 'philosophize-check-objects');
fs.mkdirSync(TMP, { recursive: true });
// A counter-test points this at a copy OUTSIDE the repo, so the working tree is
// never edited (group AL's rule). Joining REPO to an absolute path mangles it — the
// fix scripts/lib/loadrig.mjs already carries, arriving here a second time.
const SRC = process.env.OBJECTS_SRC || 'components/lesson/cinematic/objects.ts';
const SRC_PATH = path.isAbsolute(SRC) ? SRC : path.join(REPO, SRC);
{
  const js = transform(fs.readFileSync(SRC_PATH, 'utf8'), { transforms: ['typescript'] }).code;
  fs.writeFileSync(path.join(TMP, 'objects.mjs'), js);
}
const O = await import(pathToFileURL(path.join(TMP, 'objects.mjs')).href + `?v=${Date.now()}`);

const bad = [];
const note = (kind, msg) => bad.push({ kind, msg });

/** A part's axis-aligned box, which is what every rule below is expressed in. */
function boxOf(p) {
  if (p.k === 'bar') {
    const r = p.t / 2;
    return [Math.min(p.x1, p.x2) - r, Math.min(p.y1, p.y2) - r, Math.max(p.x1, p.x2) + r, Math.max(p.y1, p.y2) + r];
  }
  // A rotation grows the box; the circumscribed square is the honest bound and
  // cheaper than the exact one, which is what a checker wants.
  const d = p.rot ? Math.hypot(p.w, p.h) : 0;
  const w = Math.max(p.w, d);
  const h = Math.max(p.h, d);
  return [p.x - w / 2, p.y - h / 2, p.x + w / 2, p.y + h / 2];
}
const union = (bs) => bs.reduce(
  (a, b) => [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[2], b[2]), Math.max(a[3], b[3])],
  [Infinity, Infinity, -Infinity, -Infinity],
);

// Every object is asked for at a known box, so the rules can be stated in stage units
// rather than in the authoring square.
const AT = { x: 50, y: 50, w: 100, h: 100 };
const names = Object.keys(O.OBJECTS);

// ── 1 · AN OBJECT IS MADE OF PARTS ──────────────────────────────────────────
//
// The defect this whole group exists for is one rectangle wearing a caption. Three
// parts is the floor: a body, something that makes it the thing it is, and a plane
// the lamp does not reach.
const MIN_PARTS = 3;
for (const n of names) {
  const parts = O.OBJECTS[n](AT.x, AT.y, AT.w, AT.h);
  if (parts.length < MIN_PARTS) note('THIN', `${n} is ${parts.length} part(s) — an object is at least ${MIN_PARTS} (AM1)`);
  if (!parts.some((p) => p.role === 'mass')) note('NOBODY', `${n} has no 'mass' part, so there is nothing for the outline to go round (AM2)`);
}

// ── 2 · A MARK SITS ON ITS OWN BODY ─────────────────────────────────────────
//
// `dark`, `line` and `lit` are drawn ON the body and are never grown into the
// outline, so a mark that strays off the mass has nothing under it and reads as a
// loose shape lying beside the object. This caught a shaded plane running out past a
// tree's canopy, a crate's side face flying off the side of its own box, and an arch
// hanging below the bridge it belonged to.
//
// The tolerance is generous on purpose: a rim, a stalk or a pole is MEANT to project
// (a flag's pole runs the height of the drawing, a leaf's stalk past the blade).
// What it catches is a mark that has left altogether.
const STRAY = 26;
const GAP = 2;
for (const n of names) {
  const parts = O.OBJECTS[n](AT.x, AT.y, AT.w, AT.h);
  const body = parts.filter((p) => p.role === 'mass' || p.role === 'face');
  const mass = parts.filter((p) => p.role === 'mass');
  if (!mass.length) continue;

  // A `face` IS body, so it is not CONTAINED by the rest — a box's front face sits
  // entirely below its top. What it must do is TOUCH: share an edge with something
  // else in the silhouette. The crate's first side face flew 30 units clear of its
  // own box and was still, by a containment test, a legitimate shaded plane.
  for (const p of parts.filter((q) => q.role === 'face')) {
    const others = body.filter((q) => q !== p);
    if (!others.length) continue;
    const [x0, y0, x1, y1] = boxOf(p);
    const touches = others.some((q) => {
      const [a0, b0, a1, b1] = boxOf(q);
      return x0 <= a1 + GAP && a0 <= x1 + GAP && y0 <= b1 + GAP && b0 <= y1 + GAP;
    });
    if (!touches) note('STRAY', `${n}: a shaded PLANE touches nothing else in the silhouette (AM3)`);
  }

  // A `dark` is a RECESS painted on an already-outlined mass, so it does have to sit
  // on one — a shadow with no object under it is a loose shape lying beside it.
  const [bx0, by0, bx1, by1] = union(body.map(boxOf));
  for (const p of parts.filter((q) => q.role === 'dark')) {
    const [x0, y0, x1, y1] = boxOf(p);
    const out = Math.max(bx0 - x0, by0 - y0, x1 - bx1, y1 - by1);
    if (out > STRAY) note('STRAY', `${n}: a RECESS stands ${out.toFixed(0)} units outside the body it is cut into (AM3)`);
  }
}

// ── 3 · NOTHING LEAVES THE BOX IT WAS ASKED FOR ─────────────────────────────
//
// A scene sizes an object to the room it has, and the must-box the camera frames is
// measured from what is DRAWN. An object that overflows its own box is art the scene
// never budgeted for, and it will be cropped or will push a caption.
const SPILL = 8;
for (const n of names) {
  const parts = O.OBJECTS[n](AT.x, AT.y, AT.w, AT.h);
  const [x0, y0, x1, y1] = union(parts.map(boxOf));
  const out = Math.max(AT.x - AT.w / 2 - x0, AT.y - AT.h / 2 - y0, x1 - (AT.x + AT.w / 2), y1 - (AT.y + AT.h / 2));
  if (out > SPILL) note('SPILL', `${n} draws ${out.toFixed(0)} units outside the box it was given (AM4)`);
}

// ── 4 · AN OBJECT SCALES ────────────────────────────────────────────────────
//
// Every drawing is authored in a 100-unit square and laid into whatever box a scene
// has. If the parts did not scale with it, an object asked for at 40 units would draw
// at 100 and cover the lesson. Cheap to assert and impossible to notice otherwise.
for (const n of names) {
  const small = O.OBJECTS[n](50, 50, 40, 40);
  const [sx0, sy0, sx1, sy1] = union(small.map(boxOf));
  if (sx1 - sx0 > 40 + SPILL * 0.4 || sy1 - sy0 > 40 + SPILL * 0.4) {
    note('SCALE', `${n} still measures ${(sx1 - sx0).toFixed(0)}×${(sy1 - sy0).toFixed(0)} when asked for 40×40 (AM5)`);
  }
}

// ── 5 · THE LAMP IS TOP-LEFT AND NEVER MOVES ────────────────────────────────
//
// §19's one rule for every struck thing in this app. A shaded plane belongs on the
// side turned AWAY from the lamp, so its centre may not sit above and left of the
// body's. Seventy-five marks lit from one direction read as a set; lit from wherever
// suited each one they read as clip art.
for (const n of names) {
  const parts = O.OBJECTS[n](AT.x, AT.y, AT.w, AT.h);
  const body = parts.filter((p) => p.role === 'mass');
  const darks = parts.filter((p) => p.role === 'face');
  if (!body.length || !darks.length) continue;
  const [bx0, by0, bx1, by1] = union(body.map(boxOf));
  const bcx = (bx0 + bx1) / 2;
  const bcy = (by0 + by1) / 2;
  for (const p of darks) {
    const [x0, y0, x1, y1] = boxOf(p);
    const cx = (x0 + x1) / 2;
    const cy = (y0 + y1) / 2;
    if (cx < bcx - 1 && cy < bcy - 1) {
      note('LAMP', `${n}: a shaded plane sits up and to the LEFT of the mass — the lamp is top-left (AM6)`);
    }
  }
}

// ── 6 · AND THE CORPUS IS NOT GROWING NEW BARE RECTANGLES ───────────────────
//
// The rules above hold the LIBRARY. This holds the SCENES, and it is the ratchet that
// matters: a style whose name is a real-world object, drawn as one square-cornered
// un-rotated rectangle with nothing else to it. It is a high-water mark like
// CARD_BUDGET — it may only ever go down.
const OBJECT_WORDS = fs.readFileSync(path.join(REPO, 'scripts/lib/objectwords.json'), 'utf8');
const WORDS = JSON.parse(OBJECT_WORDS);
const DIR = 'components/lesson/cinematic';
const SUFFIX = /(Text|Label|Cap|Caption|Word|Title|Sub|Num|Tag|Name|On|Right|Wrong|Lit|Off|Dim|Hi|Lo)$/;
const stem = new RegExp(`^(${WORDS.join('|')})(?=[A-Z0-9_]|$)`);

function stylesOf(src) {
  const i = src.indexOf('StyleSheet.create(');
  if (i < 0) return {};
  let d = 0;
  let j = src.indexOf('{', i);
  const start = j;
  for (; j < src.length; j += 1) {
    if (src[j] === '{') d += 1;
    else if (src[j] === '}') { d -= 1; if (!d) break; }
  }
  const block = src.slice(start + 1, j);
  const out = {};
  let k = 0;
  for (;;) {
    const m = /([A-Za-z_$][\w$]*)\s*:\s*\{/g;
    m.lastIndex = k;
    const hit = m.exec(block);
    if (!hit) break;
    let dd = 1;
    let p = m.lastIndex;
    for (; p < block.length; p += 1) {
      if (block[p] === '{') dd += 1;
      else if (block[p] === '}') { dd -= 1; if (!dd) break; }
    }
    out[hit[1]] = block.slice(m.lastIndex, p);
    k = p + 1;
  }
  return out;
}
const hasRadius = (b) => /border(Top|Bottom)?(Left|Right)?Radius\s*:/.test(b);
const hasRot = (b) => /rotate/.test(b);
const isTri = (b) => /border(Left|Right|Top|Bottom)Color/.test(b);
const drawn = (b) => /backgroundColor\s*:/.test(b) || /borderWidth\s*:/.test(b) || isTri(b);

let plain = 0;
const plainList = [];
for (const f of fs.readdirSync(path.join(REPO, DIR)).filter((n) => /Scene\.tsx$/.test(n)).sort()) {
  const src = fs.readFileSync(path.join(REPO, DIR, f), 'utf8');
  const st = stylesOf(src);
  const groups = new Map();
  for (const [name, body] of Object.entries(st)) {
    if (SUFFIX.test(name)) continue;
    const m = stem.exec(name);
    if (!m || !drawn(body)) continue;
    const key = m[1].toLowerCase();
    groups.set(key, [...(groups.get(key) || []), body]);
  }
  for (const [key, bodies] of groups) {
    if (bodies.length > 1) continue;
    const b = bodies[0];
    if (hasRadius(b) || hasRot(b) || isTri(b)) continue;
    plain += 1;
    plainList.push(`${f.replace(/Scene\.tsx$/, '')} · ${key}`);
  }
}

// THE HIGH-WATER MARK. 94 when the reader complained; it may only go down.
const PLAIN_BUDGET = +(process.env.PLAIN_BUDGET ?? 79);
if (plain > PLAIN_BUDGET) {
  note('BARE', `${plain} named objects are one bare rectangle, over the budget of ${PLAIN_BUDGET} (AM7)`);
}

// `OBJECTS_LIST=1` prints the remaining bare rectangles, which is the worklist for the
// next pass. It is a REPORT, never a verdict: roughly two in five are correctly
// rectangles (AM8), and the only way to tell which is to read the scene.
if (process.env.OBJECTS_LIST) {
  for (const r of plainList) console.log(`  ${r}`);
  console.log('');
}
console.log('THE OBJECTS (group AM)\n');
console.log(`  ${names.length} objects in the library · ${plain} bare rectangles left in ${new Set(plainList.map((s) => s.split(' · ')[0])).size} scenes, budget ${PLAIN_BUDGET}\n`);
if (!bad.length) {
  console.log(`  ok    every object is at least ${MIN_PARTS} parts round a body`);
  console.log('  ok    every shaded plane sits on the mass it shades');
  console.log('  ok    nothing draws outside the box its scene gave it, at any size');
  console.log('  ok    the lamp is top-left in all of them');
  console.log(`  ok    the corpus is not growing new bare rectangles  ${plain} ≤ ${PLAIN_BUDGET}`);
  console.log('\nthe objects are drawings. whether they are GOOD drawings is `npm run sheet:objects`.');
  process.exit(0);
}
const byKind = new Map();
for (const b of bad) byKind.set(b.kind, [...(byKind.get(b.kind) || []), b.msg]);
console.log(`  ✗   ${bad.length} problem(s):\n`);
for (const [k, msgs] of byKind) {
  console.log(`      ${k}  ${msgs.length}`);
  for (const m of msgs.slice(0, 8)) console.log(`        ${m}`);
  if (msgs.length > 8) console.log(`        …and ${msgs.length - 8} more`);
}
console.log('\nfailed.');
process.exit(1);
