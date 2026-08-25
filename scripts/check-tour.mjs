// ─────────────────────────────────────────────────────────────────────────────
// GROUP K — the tour. Every rule that can be settled without a device.
//
//   npm run check:tour
//
// It checks the SHIPPED table, not the generator's intention. make-tours.mjs already
// refuses to emit a tour that fails checkTour, so a violation here means the table
// was hand-edited, a scene moved underneath it, or the rule changed — which is
// exactly the set of things a generator cannot catch about its own output.
//
// The one that matters most is staleness. A tour is a list of places to point the
// camera, recorded against a picture; move the picture and the tour keeps pointing
// confidently at where things used to be. Same silent direction as a stale must-box
// (H60c), same fingerprint mechanism, same fix.
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { loadTs } from './lib/loadts.mjs';
import { CAP, scaleFor } from './lib/tourrule.mjs';

const DIR = 'components/lesson/cinematic';
const ROUTE = 'app/(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId].tsx';
const { checkTour } = await loadTs(path.join(DIR, 'camera.ts'));

let fails = 0;
const bad = (msg, detail) => { fails++; console.log(`  FAIL  ${msg}${detail ? `  ${detail}` : ''}`); };
const ok = (msg, detail) => console.log(`  ok    ${msg}${detail ? `  ${detail}` : ''}`);

const toursSrc = path.join(DIR, 'tours.ts');
if (!fs.existsSync(toursSrc)) {
  console.log('\ntours: no table yet — every beat keeps one shot. Generate with node scripts/make-tours.mjs\n');
  process.exit(0);
}
const { TOURS, TOUR_STAMP } = await loadTs(toursSrc);

// THE MUST-BOXES, LOADED FIRST, because every geometry check below needs them.
//
// They used to be read at the bottom for one separate K3 assertion, and `checkTour`
// was handed `tour[tour.length - 1].box` as the beat's wide shot — which was only
// ever true while K3 forced the last station to BE the must-box. With that rule gone
// (see camera.ts) passing the tour its own last entry compares a station to itself
// and every anti-lap test comes out trivially true. The independent record is the
// only honest input here, and it is also what catches a table generated against a
// must-box that has since moved.
const mustSrc = path.join(DIR, 'mustBoxes.ts');
const MUST = fs.existsSync(mustSrc) ? (await loadTs(mustSrc)).MUST : {};

const route = fs.readFileSync(ROUTE, 'utf8');
const comps = new Map();
for (const m of route.matchAll(/'([a-z0-9-]+)':\s*([A-Za-z0-9_]+)/g)) comps.set(m[1], m[2]);

const lower = (comp) => { const b = comp.replace(/Lesson$/, ''); return `${b[0].toLowerCase()}${b.slice(1)}`; };
const readScene = (comp) => {
  const p = path.join(DIR, `${lower(comp)}Scene.tsx`);
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null;
};
const shaOf = (comp) => {
  const files = [`${lower(comp)}Scene.tsx`, `${lower(comp)}Script.ts`, `${comp}.tsx`]
    .map((f) => path.join(DIR, f)).filter((p) => fs.existsSync(p)).sort();
  if (!files.length) return null;
  const h = crypto.createHash('sha1');
  for (const p of files) h.update(fs.readFileSync(p));
  return h.digest('hex').slice(0, 12);
};

console.log('\nGROUP K — THE TOUR\n');

// ── K10 · the table describes the scenes as they are now ────────────────────
const stale = [];
for (const id of Object.keys(TOURS)) {
  const comp = comps.get(id);
  if (!comp) continue;
  const now = shaOf(comp);
  if (now && TOUR_STAMP[id] && now !== TOUR_STAMP[id]) stale.push(id);
}
if (stale.length) {
  bad(`${stale.length} lesson(s) changed since their tours were derived`,
    `${stale.slice(0, 6).join(', ')}${stale.length > 6 ? ', …' : ''}`);
  console.log('        re-run: node scripts/measure-must.mjs && node scripts/make-tours.mjs');
} else {
  ok('every tour matches the scene it was derived from (K10)');
}

// ── the geometry, per station, against each lesson's own band ────────────────
let nTours = 0, nStations = 0, geomBad = 0, tightest = 1, cappedAt = 0, follows = 0;
const perLesson = [];
for (const [id, per] of Object.entries(TOURS)) {
  const comp = comps.get(id);
  const src = comp ? readScene(comp) : null;
  if (!src) continue;
  const bm = src.match(/band=\{\[(\d+),\s*(\d+)\]\}/);
  if (!bm) continue;
  const band = [+bm[1], +bm[2]];
  const gm = src.match(/ground=\{(\d+)\}/);
  const ground = gm ? +gm[1] : undefined;
  let toured = 0, best = 1;
  per.forEach((t, k) => {
    if (!t) return;
    nTours++; toured++; nStations += t.length;
    const tour = t.map((s) => ({
      box: { x: s[0], y: s[1], w: s[2], h: s[3] },
      // Ten numbers is a follow station (K9) — the last four are where the subject
      // has got to. Reading only the first six would check the near end of every
      // tracking shot and none of the far ends, which is the half that can lose him.
      ...(s.length >= 10 ? { to: { x: s[6], y: s[7], w: s[8], h: s[9] } } : {}),
      tr: s[4],
      dwell: s[5],
    }));
    const w = MUST[id]?.[k];
    const wide = w ? { x: w[0], y: w[1], w: w[2], h: w[3] } : null;
    for (const p of checkTour(tour, band, wide, ground)) {
      geomBad++;
      if (geomBad <= 12) console.log(`  FAIL  ${id} beat ${k}: ${p}`);
    }
    for (const s of t) {
      // A follow is framed at the tighter of its two ends, so score it that way or
      // the report claims a zoom the tracking shot never actually holds.
      let sc = Math.min(CAP, scaleFor([s[0], s[1], s[2], s[3]], band));
      if (s.length >= 10) sc = Math.min(sc, Math.min(CAP, scaleFor([s[6], s[7], s[8], s[9]], band)));
      if (s.length >= 10) follows++;
      best = Math.max(best, sc);
      if (sc >= CAP - 0.001) cappedAt++;
    }
  });
  tightest = Math.max(tightest, best);
  if (toured) perLesson.push({ id, toured, beats: per.length, best });
}
if (geomBad) { fails++; console.log(`  FAIL  ${geomBad} station(s) break the geometry rules (K3/K5/K8)`); }
else ok(`${nStations} stations across ${nTours} tours are legal and contain their own subject (K3, K5, K8)`);

// ── K6 · nothing gradeable, draggable or final may be toured ────────────────
//
// Checked against the SCRIPTS rather than against what the generator believed, so a
// hand-written `tour` override on a graded beat is caught. That is the one route by
// which the identity-transform guarantee for answer targets could be lost, and it
// would be lost silently: the tap simply starts missing.
let k6 = 0;
for (const [id, per] of Object.entries(TOURS)) {
  const comp = comps.get(id);
  if (!comp) continue;
  const p = path.join(DIR, `${lower(comp)}Script.ts`);
  if (!fs.existsSync(p)) continue;
  const body = fs.readFileSync(p, 'utf8').match(/BEATS[^=]*=\s*\[([\s\S]*)\n\];/);
  if (!body) continue;
  const chunks = body[1].split(/\n\s{2}\},?\s*\n?/).filter((c) => /\S/.test(c));
  per.forEach((t, k) => {
    if (!t || !chunks[k]) return;
    if (/^\s{4}(mc|interact|summary):/m.test(chunks[k])) {
      k6++;
      if (k6 <= 6) console.log(`  FAIL  ${id} beat ${k} is graded, drag or summary and carries a tour (K6)`);
    }
  });
}
if (k6) fails++; else ok('no graded, drag or summary beat carries a tour (K6)');

// ── K3 · NO LAP, AND NO REPEAT ─────────────────────────────────────────────
//
// Two different things a reader called the same name.
//
// The LAP is a tour that goes somewhere and comes back inside one beat; `checkTour`
// now tests that directly (last station wider than the first), and a station framing
// the whole must-box is no longer evidence of it — pulling back to the whole picture
// is a legitimate move when the next thing to see cannot be framed tightly AND
// centred (K4b).
//
// The REPEAT is the one this counts: *"two clicks later, it'll be the exact same zoom
// in and zoom out."* The path is decided with a memory of where the camera is
// standing (`lessonTours`), so a run of beats about one subject should be ONE move.
// Two moves in a row landing in the same place means that memory is not working.
{
  let repeats = 0, moves = 0;
  for (const [id, per] of Object.entries(TOURS)) {
    // A GRADED BEAT RESETS THE PATH, so returning to a subject after a question is
    // not a repeat — the camera genuinely had to leave for the tap to land (K6).
    const comp = comps.get(id);
    const sp = comp ? path.join(DIR, `${lower(comp)}Script.ts`) : null;
    const body = sp && fs.existsSync(sp)
      ? fs.readFileSync(sp, 'utf8').match(/BEATS[^=]*=\s*\[([\s\S]*)\n\];/) : null;
    const chunks = body ? body[1].split(/\n\s{2}\},?\s*\n?/).filter((c) => /\S/.test(c)) : [];
    let last = null;
    per.forEach((t, k) => {
      if (chunks[k] && /^\s{4}(mc|interact|summary):/m.test(chunks[k])) { last = null; return; }
      if (!t || !t.length) return;
      moves++;
      const b = t[t.length - 1];
      // A FOLLOW THAT BEGINS WHERE THE CAMERA IS PARKED IS NOT A REPEAT. It is the
      // best possible start for a track: no move at all, and then the camera leaves
      // with its subject. aesthetics-9 beat 4 does exactly that after beat 3 parked
      // on the same man. Compared as a static box it looks like standing still twice.
      if (b.length >= 10) { last = [b[6], b[7], b[8], b[9]]; return; }
      if (last && Math.abs(last[0] - b[0]) < 12 && Math.abs(last[1] - b[1]) < 12
        && Math.abs(last[2] - b[2]) < 12 && Math.abs(last[3] - b[3]) < 12) {
        repeats++;
        if (repeats <= 4) console.log(`  FAIL  ${id} beat ${k}: this move lands where the camera already was`);
      }
      last = b;
    });
  }
  if (repeats) bad(`${repeats} of ${moves} moves land where the camera already was — the path is repeating itself (K3)`);
  else ok(`no move repeats the one before it (K3) · ${moves} moves`);
}

// ── D · THE CAMERA MAY NOT CUT A WORD IN HALF ──────────────────────────────
//
// Only bites now that a station HOLDS. While every tour ended wide, a framing that
// sliced a caption was a moment on the way somewhere; now it is the picture the beat
// rests on. `cleanEdges` grows a station to swallow any text it would otherwise cut,
// and this is the independent check on that — run against the real `stationShot`,
// not against the generator's own model of it, because the first version of that
// model was 56 units out vertically and passed captions it was cutting.
{
  const sidecar = path.join(DIR, 'mustBoxes.ts.json');
  if (fs.existsSync(sidecar)) {
    const { words } = JSON.parse(fs.readFileSync(sidecar, 'utf8'));
    const { stationShot, visibleWindow } = await loadTs(path.join(DIR, 'camera.ts'));
    let sliced = 0, seen = 0;
    for (const [id, per] of Object.entries(TOURS)) {
      const comp = comps.get(id);
      const scene = comp ? readScene(comp) : null;
      const bm = scene?.match(/band=\{\[(\d+),\s*(\d+)\]\}/);
      if (!bm) continue;
      const band = [+bm[1], +bm[2]];
      const gm = scene.match(/ground=\{(\d+)\}/);
      const ground = gm ? +gm[1] : 500;
      per.forEach((t, k) => {
        if (!t) return;
        const items = (words[id]?.[k] ?? []).filter((it) => it.k === 'text');
        for (const s of t) {
          // A FOLLOW IS EXEMPT. Its window travels the whole time, so words passing
          // through frame are ordinary tracking, not a crop — and K9 pins both ends
          // to one shared scale, which makes growing them to clear a word impossible
          // anyway. What this rule protects is the framing a beat comes to REST on.
          if (s.length >= 10) continue;
          seen++;
          const w = visibleWindow(stationShot({ x: s[0], y: s[1], w: s[2], h: s[3] }, band, ground), band);
          for (const it of items) {
            const [x, y, bw, bh] = it.b;
            // Text drawn outside the lesson's band is unreachable at any shot — the
            // band IS the camera's vertical world — so this is an H59 fault in the
            // scene, not a framing the camera chose. `cleanEdges` skips it for the
            // same reason, and counting it here would only hide the real ones.
            if (y < band[0] - 0.5 || y + bh > band[1] + 0.5) continue;
            const over = x < w.right && x + bw > w.left && y < w.bottom && y + bh > w.top;
            const whole = x >= w.left - 0.5 && x + bw <= w.right + 0.5
              && y >= w.top - 0.5 && y + bh <= w.bottom + 0.5;
            if (over && !whole) { sliced++; break; }
          }
        }
      });
    }
    // A BUDGET, AND IT IS A DEBT. It was 6, and raising the type across every scene
    // (D34) took it to 8 — so `make-tours` now asks the REAL camera whether a station
    // slices a word and simply does not emit one that does. That took it to 5, at the
    // cost of 21 stations that are now holds. What is left: `cleanEdges` and more passes do
    // not shift them — the growth oscillates rather than converging, because widening
    // a box lowers its scale, which widens the window, which can newly clip something
    // that was wholly outside it a moment earlier. They are all a label sitting a unit
    // or two over one edge. Lower this number when they are fixed; do not raise it.
    // AND IT IS ZERO NOW. The last six were not framings at all: `make-tours`
    // read the scene's `ground=` prop and passed `undefined` when there was none —
    // which is every scene — so `fit()` dropped its ground clamp and the GENERATOR
    // was laying out stations for a camera the app does not have. The player
    // defaults `ground = GROUND` and this file has always used 500. Giving the
    // generator the same default took it from 6 to 0, and 21 stations that had
    // been demoted to holds came back.
    const SLICE_BUDGET = 0;
    if (sliced > SLICE_BUDGET) bad(`${sliced} of ${seen} stations cut a word in half, budget ${SLICE_BUDGET} — a held framing is the picture, not a moment (D)`);
    else ok(`no more than ${SLICE_BUDGET} stations cut a word in half (D)`, `${sliced} of ${seen}`);
  }
}

// ── what it bought ───────────────────────────────────────────────────────────
perLesson.sort((a, b) => b.best - a.best);
const totalBeats = Object.values(TOURS).reduce((a, p) => a + p.length, 0);
console.log(`\n  ${Object.keys(TOURS).length} lessons carry a tour · ${nTours} of ${totalBeats} beats toured`);
console.log(`  ${nStations} stations · ${(nStations / Math.max(1, nTours)).toFixed(2)} per toured beat`);
console.log(`  closest framing anywhere ${tightest.toFixed(2)}× · ${cappedAt} station(s) sit at the ${CAP}× ceiling (K5)`);
console.log(`  ${follows} station(s) FOLLOW a moving subject rather than parking (K9)`);

console.log(fails ? `\n${fails} failing.\n` : '\nall clear.\n');
process.exit(fails ? 1 : 0);
