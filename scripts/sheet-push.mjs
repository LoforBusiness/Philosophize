// ─────────────────────────────────────────────────────────────────────────────
// HOW BIG IS THE CAMERA'S BIGGEST ROUND TRIP, AND IS IT ALONE?
//
//   npm run sheet:push
//
// A reader reported the ethics-of-care lesson "resetting" — *"when I press the
// screen, it, like, zooms out and zooms in again."* Measured frame by frame in a
// browser at three tap rates, that lesson's camera has NO discontinuity at all:
// every move is a continuous ramp. `check:smooth` was right and so was
// `check:tour`; nothing was broken in the way those two look for broken.
//
// What is wrong is the SHAPE of the move, which nothing measured. That lesson's
// must-boxes are 468–470 units tall inside a 470-unit band, so `containShot`
// pins every authored shot to scale ~1.0 — sixteen of its eighteen beats are the
// identical wide frame. The only motion left is a generated tour that pushes to
// 1.68× on one beat and returns on the next. An isolated 68% push-and-return in
// an otherwise static lesson does not read as camera work. It reads as a fault,
// and a reader will describe it as the screen resetting.
//
// ── WHAT THIS MEASURES ──────────────────────────────────────────────────────
//
// The RESTING scale of every beat: what the camera settles at once the beat's
// travel is done, composed exactly as the player composes it — the authored shot
// (or the resolved verb list), then `containShot` against that beat's must-box,
// then the tour station if the beat has one. Then two numbers per lesson:
//
//   SPIKE   the largest ratio between a beat and the beat before it.
//   ALONE   whether the beats around the spike are all the same scale — which is
//           what turns a push into a jolt. A lesson whose camera is always moving
//           can afford a big push; one that never moves cannot.
//
// It REPORTS rather than fails, and that is deliberate. Once a station's travel
// time actually reaches the camera (see check:tour's K8 assertion) a 1.72× push is
// legitimate camera work — it takes 1.2s instead of 0.7 and reads as a move. The
// size of a push is a design question; what was broken was its speed, and that has
// a checker. This is the instrument for looking at the distribution.
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import { wiredLessons, scriptFor, readScript, decomment, beatsBody, beatChunks } from './lib/gestures.mjs';
import { tourStartShots, containShot, NEUTRAL } from '../components/lesson/cinematic/camera.ts';

const DIR = 'components/lesson/cinematic';

/** Top-level entries of a `'id': [ ... ],` row, counting bracket depth. */
function rowEntries(body) {
  const out = [];
  let depth = 0;
  let cur = '';
  for (const ch of body) {
    if (ch === '[') depth++;
    if (ch === ']') depth--;
    if (ch === ',' && depth === 0) { out.push(cur.trim()); cur = ''; continue; }
    cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

function table(file) {
  const src = readScript(`${DIR}/${file}`);
  const out = new Map();
  for (const m of src.matchAll(/'([a-z0-9-]+)':\s*\[([\s\S]*?)\],\n/g)) out.set(m[1], rowEntries(m[2]));
  return out;
}

const TOURS = table('tours.ts');
const MUST = table('mustBoxes.ts');

const nums = (s) => (s.match(/-?\d+(?:\.\d+)?/g) || []).map(Number);

// ── CALIBRATED AGAINST THE BROWSER, WHICH IS THE ONLY REASON TO TRUST IT ────
//
// The first draft computed the scale by hand as min(400/w, bandH/h). For
// ethics-ethics-8's toured beat that gives 2.37×, and the rendered page measures
// 1.68× — `tourStartShots` clamps, and a model that disagrees with the example
// whose answer you already have is a broken model, not a finding (§19).
//
// So it calls the real functions. Re-measured against the same lesson: the tour
// beat 1.72 against 1.68 rendered, the resting beats 1.00 against 1.004. Two per
// cent, which is the rounding in `fit`.
//
// The one approximation left is stated rather than hidden: a beat with no tour is
// scored as NEUTRAL contained by its must-box. That is exact wherever the scene's
// own verb list is looser than the must-box — which, with must-boxes running the
// full height of the band, is the ordinary case — and it UNDER-states the resting
// scale where a verb list pushes in on its own, which would over-state the spike.
// Three lessons off the top of this list were re-measured in a browser to check
// that; see the header of scripts/dbg-cam.mjs for how.
const holdScale = (box, band) => {
  if (!box) return null;
  const [x, y, w, h] = box;
  if (!(w > 0 && h > 0)) return null;
  return containShot(NEUTRAL, { x, y, w, h }, band).s;
};

const tourScale = (t, band, ground) => {
  const shots = tourStartShots([{ box: { x: t[0], y: t[1], w: t[2], h: t[3] }, tr: t[4], dwell: t[5] }], band, ground);
  return shots && shots.length ? shots[shots.length - 1].s : null;
};

const bandOf = (src) => {
  const m = /band=\{\[\s*(\d+)\s*,\s*(\d+)\s*\]\}/.exec(src);
  return m ? [Number(m[1]), Number(m[2])] : [42, 512];
};

const rows = [];
for (const [id, comp] of wiredLessons()) {
  const p = scriptFor(comp);
  if (!p) continue;
  const body = beatsBody(decomment(readScript(p)));
  if (!body) continue;
  const beats = beatChunks(body).length;

  const base = comp.replace(/Lesson$/, '');
  const low = `${base[0].toLowerCase()}${base.slice(1)}`;
  const sceneP = `${DIR}/${low}Scene.tsx`;
  if (!fs.existsSync(sceneP)) continue;
  const band = bandOf(readScript(sceneP));

  const must = MUST.get(id) ?? [];
  const tours = TOURS.get(id) ?? [];

  // The resting scale per beat: a tour station if there is one, else what the
  // must-box allows. Both are capped the way the player caps them.
  const rest = [];
  for (let k = 0; k < beats; k++) {
    const t = tours[k] && tours[k] !== 'null' ? nums(tours[k]) : null;
    const mb = must[k] ? nums(must[k]) : null;
    let s = null;
    if (t && t.length >= 4) s = tourScale(t, band, band[1] - 42);
    else if (mb && mb.length >= 4) s = holdScale(mb, band);
    rest.push(s);
  }

  let spike = 1;
  let at = -1;
  for (let k = 1; k < rest.length; k++) {
    if (rest[k] == null || rest[k - 1] == null) continue;
    const r = Math.max(rest[k] / rest[k - 1], rest[k - 1] / rest[k]);
    if (r > spike) { spike = r; at = k; }
  }
  // How still is the rest of the lesson? The spread of every OTHER beat.
  const others = rest.filter((s, k) => s != null && k !== at && k !== at - 1);
  const flat = others.length > 1
    ? Math.max(...others) / Math.min(...others)
    : 1;
  rows.push({ id, beats, spike, at, flat });
}

rows.sort((a, b) => b.spike - a.spike);

// The high-water mark. Raised only with a reason, and never by a codemod.
const SPIKE_BUDGET = Number(process.env.SPIKE_BUDGET || 1.30);

const over = rows.filter((r) => r.spike > SPIKE_BUDGET);

console.log('\nTHE CAMERA\'S BIGGEST ROUND TRIP\n');
console.log(`  ${rows.length} lessons measured`);
console.log(`  worst spike ${rows[0].spike.toFixed(2)}× in ${rows[0].id} at beat ${rows[0].at}`);
console.log(`  budget ${SPIKE_BUDGET.toFixed(2)}×\n`);

if (!over.length) {
  console.log(`  ok    no beat changes the picture's size by more than ${SPIKE_BUDGET.toFixed(2)}×.\n`);
} else {
  console.log(`  FAIL  ${over.length} lesson(s) push further than the budget:\n`);
  for (const r of over.slice(0, 20)) {
    const lone = r.flat < 1.02 ? '  (and every other beat is the same size — it stands alone)' : '';
    console.log(`  ${r.id.padEnd(28)} ${r.spike.toFixed(2)}× at beat ${String(r.at).padStart(2)}${lone}`);
  }
  console.log('\n  A push is fine; a push nothing leads into is a jolt. Either widen the tour');
  console.log('  station so it sits nearer the beats around it, or drop it (K10: a beat may');
  console.log('  carry `tour: []` to refuse the generated one).\n');
}

// A report, not a gate — see the header.
process.exit(0);
