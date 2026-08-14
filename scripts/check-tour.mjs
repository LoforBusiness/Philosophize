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
    const wide = tour[tour.length - 1].box;
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

// ── K3 · a reader always ends a beat having seen everything ─────────────────
//
// The closing station is compared against the lesson's MUST box for that beat — the
// independent record of what the beat draws. Checking the tour against its own last
// entry, which is what checkTour does above, cannot catch a table generated from a
// different must-box than the one that ships.
const mustSrc = path.join(DIR, 'mustBoxes.ts');
if (fs.existsSync(mustSrc)) {
  const { MUST } = await loadTs(mustSrc);
  let k3 = 0;
  for (const [id, per] of Object.entries(TOURS)) {
    const m = MUST[id];
    if (!m) continue;
    per.forEach((t, k) => {
      const w = m[k];
      if (!t || !w) return;
      const l = t[t.length - 1];
      if (l[0] > w[0] + 0.5 || l[1] > w[1] + 0.5
        || l[0] + l[2] < w[0] + w[2] - 0.5 || l[1] + l[3] < w[1] + w[3] - 0.5) {
        k3++;
        if (k3 <= 6) console.log(`  FAIL  ${id} beat ${k}: the closing station is smaller than the beat's must-box (K3)`);
      }
    });
  }
  if (k3) fails++; else ok('every tour ends on the beat\'s whole must-box (K3)');
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
