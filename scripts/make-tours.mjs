// ─────────────────────────────────────────────────────────────────────────────
// GENERATE THE TOURS — group K, offline, from measurements already taken.
//
//   node scripts/make-tours.mjs            write components/lesson/cinematic/tours.ts
//   node scripts/make-tours.mjs --dry      report only
//   node scripts/make-tours.mjs --stats    report, with the per-lesson table
//
// NO BROWSER. Everything this needs was recorded by the last measure-must sweep and
// lives in mustBoxes.ts.json: every drawn thing per beat, its kind, its box, whether
// it bleeds off the stage, and — since group K — which of the four timed readings it
// first appeared in. So the arguable half (scripts/lib/tourrule.mjs) can be changed
// and every tour in the app regenerated in about a second, which is the same property
// regen-must.mjs gives the must-see boxes and for the same reason.
//
// IT REFUSES TO WRITE A TOUR IT CANNOT VERIFY. Every generated tour is run through
// checkTour from camera.ts — the module the player actually uses, transpiled rather
// than reimplemented — and a single failure aborts the whole file. A generator that
// emits something the validator will reject has simply moved the error later.
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { loadTs } from './lib/loadts.mjs';
import { tourFor, CAP, scaleFor } from './lib/tourrule.mjs';

const DIR = 'components/lesson/cinematic';
const SIDECAR = path.join(DIR, 'mustBoxes.ts.json');
const OUT = path.join(DIR, 'tours.ts');
const ROUTE = 'app/(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId].tsx';

const dry = process.argv.includes('--dry');
const stats = process.argv.includes('--stats');

const { checkTour } = await loadTs(path.join(DIR, 'camera.ts'));
const side = JSON.parse(fs.readFileSync(SIDECAR, 'utf8'));

// DOES THIS SWEEP KNOW WHEN THINGS APPEARED? Asked once, of the whole sidecar,
// because the answer cannot be read off a single beat: an item carries `r` only when
// it was first seen in a LATER reading, so a beat whose contents all arrive at once
// looks exactly like a beat measured before reveal order was recorded at all. One
// `r` anywhere in the file proves the sweep was taken with it; none proves nothing,
// and K2 does not accept nothing.
const hasReveal = Object.values(side.words)
  .some((per) => per.some((items) => (items ?? []).some((it) => it.r != null)));

// ── which lesson is which component, and what its scene declares ─────────────
const route = fs.readFileSync(ROUTE, 'utf8');
const map = new Map();
for (const m of route.matchAll(/'([a-z0-9-]+)':\s*([A-Za-z0-9_]+)/g)) map.set(m[1], m[2]);

const scenePath = (comp) => {
  const base = comp.replace(/Lesson$/, '');
  return path.join(DIR, `${base[0].toLowerCase()}${base.slice(1)}Scene.tsx`);
};
const scriptPath = (comp) => {
  const base = comp.replace(/Lesson$/, '');
  return path.join(DIR, `${base[0].toLowerCase()}${base.slice(1)}Script.ts`);
};

/**
 * Which beats may not be toured (K6).
 *
 * Read from the script text at four-space indent, the same convention every other
 * checker here uses for "a top-level key of a beat". A `mc` or `interact` is a graded
 * beat and takes scale 1 outright; `interact.drag` is the same case for a stronger
 * reason (a gated clock between the hand and the picture is what makes a scrub feel
 * broken); the summary hides the stage entirely.
 *
 * THE SUMMARY IS NOT DETECTABLE FROM THE MEASUREMENTS. 42 of 112 lessons have a
 * non-empty measured entry for their summary beat, because the stage fades out over
 * XFADE and the first reading catches it on the way. Trusting "the table is one
 * shorter than the script" would therefore have toured 42 summary beats.
 */
function singles(comp) {
  const p = scriptPath(comp);
  if (!fs.existsSync(p)) return null;
  const body = fs.readFileSync(p, 'utf8').match(/BEATS[^=]*=\s*\[([\s\S]*)\n\];/);
  if (!body) return null;
  const chunks = body[1].split(/\n\s{2}\},?\s*\n?/).filter((c) => /\S/.test(c));
  return chunks.map((c) => /^\s{4}(mc|interact|summary):/m.test(c));
}

/**
 * Each beat's declared `dur` — how long its own animation runs.
 *
 * A follow station's dwell (K9) is the walk, not a pause invented for the camera, so
 * it should last as long as the walk does. The scripts already say: `dur` is what
 * `swishTrack` and the footfall track are measured against, so it is the same number
 * the feet are using.
 */
function durs(comp) {
  const p = scriptPath(comp);
  if (!fs.existsSync(p)) return [];
  const body = fs.readFileSync(p, 'utf8').match(/BEATS[^=]*=\s*\[([\s\S]*)\n\];/);
  if (!body) return [];
  return body[1].split(/\n\s{2}\},?\s*\n?/).filter((c) => /\S/.test(c))
    .map((c) => { const m = c.match(/^\s{4}dur:\s*([\d.]+)/m); return m ? +m[1] : 0; });
}

/**
 * IS THE MEASUREMENT THIS TOUR WOULD BE BUILT FROM STILL TRUE?
 *
 * A tour is a list of places to point the camera, derived from a recording of the
 * picture. Derive one from a recording that no longer matches the scene and it
 * points confidently at where things used to be — and unlike a stale must-box, which
 * at worst crops, a stale tour spends the beat looking at the wrong thing.
 *
 * So staleness is not a warning here, it is a refusal. This is also what makes the
 * generator safe to run at any moment in a shared tree: mid-edit scenes are simply
 * skipped, rather than silently baked into the table at whatever state they were
 * caught in.
 */
const stampOf = (comp) => {
  const files = [scenePath(comp), scriptPath(comp), path.join(DIR, `${comp}.tsx`)]
    .filter((p) => fs.existsSync(p)).sort();
  if (!files.length) return null;
  const h = crypto.createHash('sha1');
  for (const p of files) h.update(fs.readFileSync(p));
  return h.digest('hex').slice(0, 12);
};

const bandOf = (comp) => {
  const p = scenePath(comp);
  if (!fs.existsSync(p)) return null;
  const m = fs.readFileSync(p, 'utf8').match(/band=\{\[(\d+),\s*(\d+)\]\}/);
  return m ? [+m[1], +m[2]] : null;
};
const groundOf = (comp) => {
  const p = scenePath(comp);
  if (!fs.existsSync(p)) return null;
  const m = fs.readFileSync(p, 'utf8').match(/ground=\{(\d+)\}/);
  return m ? +m[1] : undefined;
};

// ── build ────────────────────────────────────────────────────────────────────
const tours = {};
const stamps = {};
const problems = [];
let nBeats = 0, nToured = 0, nStations = 0;
const skipped = [];
const rows = [];

for (const [id, comp] of map) {
  const words = side.words[id];
  const boxes = side.boxes[id];
  if (!words || !boxes) continue;
  const band = bandOf(comp);
  if (!band) continue;
  const ground = groundOf(comp);
  const single = singles(comp);
  if (!single) continue;
  const dur = durs(comp);
  // Skip anything whose scene has moved since it was measured — see stampOf.
  const now = stampOf(comp);
  if (!now || !side.stamps[id] || now !== side.stamps[id]) { skipped.push(id); continue; }

  const per = [];
  let toured = 0;
  let tightest = 1;
  for (let k = 0; k < words.length; k++) {
    nBeats++;
    const wide = boxes[k];
    const t = tourFor(words[k], wide, band, single[k] ?? true, hasReveal, dur[k] ?? 0);
    if (!t) { per.push(null); continue; }
    // Verified against the SHIPPING maths, not against the generator's intention.
    const bad = checkTour(
      t.map((s) => ({
        box: { x: s.box[0], y: s.box[1], w: s.box[2], h: s.box[3] },
        ...(s.to ? { to: { x: s.to[0], y: s.to[1], w: s.to[2], h: s.to[3] } } : {}),
        tr: s.tr, dwell: s.dwell,
      })),
      band,
      wide ? { x: wide[0], y: wide[1], w: wide[2], h: wide[3] } : null,
      ground,
    );
    if (bad.length) { problems.push(`${id} beat ${k}: ${bad.join('; ')}`); per.push(null); continue; }
    per.push(t);
    toured++;
    nToured++;
    nStations += t.length;
    for (const s of t) tightest = Math.max(tightest, Math.min(CAP, scaleFor(s.box, band)));
  }
  if (per.some(Boolean)) {
    tours[id] = per;
    // The same fingerprint the boxes carry: a tour derived from a scene that has
    // since moved is stale in exactly the same silent direction (K10).
    if (side.stamps[id]) stamps[id] = side.stamps[id];
    rows.push({ id, toured, beats: words.length, tightest });
  }
}

if (problems.length) {
  console.error(`\n${problems.length} generated tour(s) failed checkTour — nothing written:\n`);
  for (const p of problems.slice(0, 20)) console.error(`  ${p}`);
  process.exit(1);
}

// ── emit ─────────────────────────────────────────────────────────────────────
const body = Object.keys(tours).sort().map((id) => {
  const per = tours[id].map((t) => (t === null ? 'null'
    : `[${t.map((s) => `[${s.box.map((n) => Math.round(n)).join(', ')}, ${s.tr}, ${s.dwell}]`).join(', ')}]`));
  return `  '${id}': [${per.join(', ')}],`;
}).join('\n');

const stampBody = Object.keys(stamps).sort().map((id) => `  '${id}': '${stamps[id]}',`).join('\n');

const file = `// GENERATED by scripts/make-tours.mjs — do not hand-edit.
//
// Group K — the tour. Per beat, the stations the camera visits: a box in scene
// coordinates, the seconds to travel there, and the seconds to sit once arrived.
// \`null\` is a beat that keeps one shot, which is every graded beat, every drag beat,
// every summary (K6), and every beat whose contents do not separate into subjects
// worth their own framing (K4).
//
// The last station of every tour is the beat's whole must-box (K3), so a beat's
// resting frame is exactly what it was before this table existed — the tour is new
// motion added ahead of an unchanged final framing. Empty this file and every lesson
// is byte-for-byte its old self.
//
// Scene time does not advance while the camera travels between stations (K1), so the
// order here is the order the reader experiences the beat in. It is the measured
// reveal order, not reading order — see scripts/lib/tourrule.mjs.
//
// TOUR_STAMP fingerprints the scene and script each tour was derived from, exactly as
// MUST_STAMP does, because a stale tour fails the same silent way: it parks the camera
// where something used to be.

// Six numbers is a station the camera parks at. TEN is a FOLLOW (K9): the last four
// are where the subject has walked to by the end of the dwell, and the camera tracks
// it there at a fixed scale instead of watching it cross a still frame.
export type TourStation =
  | readonly [x: number, y: number, w: number, h: number, tr: number, dwell: number]
  | readonly [x: number, y: number, w: number, h: number, tr: number, dwell: number,
      tx: number, ty: number, tw: number, th: number];

export const TOURS: Record<string, readonly (readonly TourStation[] | null)[]> = {
${body}
};

export const TOUR_STAMP: Record<string, string> = {
${stampBody}
};
`;

if (!dry) fs.writeFileSync(OUT, file);

const pct = (n) => `${((100 * n) / Math.max(1, nBeats)).toFixed(0)}%`;
console.log(`\n${dry ? 'would generate' : 'generated'} ${OUT}`);
console.log(`  ${Object.keys(tours).length} lessons · ${nToured} of ${nBeats} beats toured (${pct(nToured)})`);
console.log(`  ${nStations} stations · ${(nStations / Math.max(1, nToured)).toFixed(2)} per toured beat`);
if (skipped.length) {
  console.log(`
  ${skipped.length} lesson(s) SKIPPED — their scene has changed since it was measured,`);
  console.log('  so no tour was derived for them rather than one derived from a picture that');
  console.log('  no longer exists. Re-measure and re-run:');
  console.log('    node scripts/measure-must.mjs && node scripts/make-tours.mjs');
}
if (!hasReveal) {
  console.log('\n  NO REVEAL-ORDER DATA in this sweep, so every tour is capped at one detail');
  console.log('  station plus the closing wide — safe by construction, because a single detail');
  console.log('  has no order to get wrong (K2). Multi-station tours need a fresh sweep:');
  console.log('    node scripts/measure-must.mjs      then re-run this');
}
if (stats) {
  rows.sort((a, b) => b.tightest - a.tightest);
  console.log('\n  closest station per lesson:');
  for (const r of rows.slice(0, 25)) {
    console.log(`    ${r.id.padEnd(30)} ${r.toured}/${r.beats} beats  ${r.tightest.toFixed(2)}×`);
  }
}
console.log('');
