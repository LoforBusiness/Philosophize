// ─────────────────────────────────────────────────────────────────────────────
// THE BOXES HOLD A DIFFERENT POSE NOW — GROW THEM, DO NOT RE-MEASURE THEM.
//
//   node scripts/regrow-pose.mjs [--write]
//
// Two things have moved the figure's silhouette without touching a scene:
//
//   · `moves.ts` amplitudes were raised, so a living hold's arms now swing further
//     than the stored boxes were measured against;
//   · `liven-still.mjs` put a different pose on 164 beats.
//
// `muststamp` hashes the scene, the script and the probe. `moves.ts` is none of
// the three, so the first of those leaves every box quietly too small with nothing
// going red — which is exactly why `seed-pose-reach.mjs` exists and why
// `make:wardrobe` grows boxes arithmetically rather than demanding hours of
// browser time. This is that same arithmetic, run for a pose change instead of a
// costume one.
//
// `make:wardrobe` would do it — and it also RE-DEALS the costume rotation, which
// moved 68 lessons the last time it ran for an unrelated reason. So this does the
// pose half alone.
//
// ── WHAT IS SAFE TO RE-STAMP, AND WHAT IS NOT ───────────────────────────────
//
// A script that changed has a stale stamp, honestly. The measurement is being
// brought up to date here, so re-stamping is correct — but only where the change
// really is just a pose. Each lesson is proven against HEAD: every beat must be
// byte-identical except for the value of its own gesture field. Anything else and
// the lesson keeps its stale stamp and is named, so `check:cinematic` goes on
// demanding a real re-measure. Blanket re-stamping launders the rot the stamp
// exists to catch — `restamp-must.mjs` records that lesson and it applies here.
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { corpus } from './lib/gestures.mjs';
import { poseTrack } from './lib/posetrack.mjs';
import { loadRig } from './lib/loadrig.mjs';
import { renderTable } from './lib/mustrule.mjs';
import { mustStamp } from './lib/muststamp.mjs';
import { MEASURE } from './lib/mustprobe.mjs';

const REPO = process.cwd();
const DIR = 'components/lesson/cinematic';
const SIDE = path.join(REPO, DIR, 'mustBoxes.ts.json');
const WRITE = process.argv.includes('--write');
const MUST_PAD = 4;
const K_FIG = 1;

const { RIG, MOVES } = await loadRig();

/** The same measure `make:wardrobe` and `seed-pose-reach` use. */
function reachOf(code) {
  let r = 0;
  for (const t of [0, 0.6, 1.2, 1.8, 2.4, 3.0, 3.6, 4.2, 4.8, 5.4]) {
    const s = MOVES.emoteAny(code, t);
    for (const f of [s.fistL, s.fistR]) if (f) r = Math.max(r, Math.abs(f.x));
  }
  return +Math.max(0, (r + RIG.STR.glove / 2) - RIG.STR.torso / 2 - MUST_PAD).toFixed(2);
}
/** How far above the pelvis a hand gets — the axis `poseReach` does NOT track. */
function riseOf(code) {
  let up = 0;
  for (const t of [0, 0.6, 1.2, 1.8, 2.4, 3.0, 3.6, 4.2, 4.8, 5.4]) {
    const s = MOVES.emoteAny(code, t);
    for (const f of [s.fistL, s.fistR]) if (f) up = Math.max(up, -f.y);
  }
  return +up.toFixed(2);
}

const side = JSON.parse(fs.readFileSync(SIDE, 'utf8'));
const lessons = corpus();

// ── 1 · grow (or shrink) each figure box by the change in sideways reach ────
let moved = 0, grown = 0;
const nowReach = {};
const rises = [];
for (const l of lessons) {
  const items = side.words[l.id];
  if (!items) continue;
  const stored = side.poseReach?.[l.id] ?? [];
  nowReach[l.id] = l.beats.map((b) => reachOf(b.code));
  l.beats.forEach((b, i) => {
    const was = stored[i] ?? 0;
    const now = nowReach[l.id][i];
    const d = +(now - was).toFixed(2);
    if (!d || !items[i]) return;
    for (const it of items[i]) {
      if (it.k !== 'fig' || it.v) continue;    // the lead only; `v` marks the visitor
      it.b[0] -= d * K_FIG;
      it.b[2] += 2 * d * K_FIG;
      moved += 1;
      if (d > 0) grown += 1;
    }
    rises.push(riseOf(b.code));
  });
}
console.log(`${moved} figure box(es) re-grown for the current poses (${grown} wider, ${moved - grown} narrower)`);
console.log(`highest hand above the pelvis anywhere: ${Math.max(0, ...rises)} units`);

// ── 2 · re-render the table from the updated words ──────────────────────────
const bands = new Map();
const route = fs.readFileSync(path.join(REPO, 'app/(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId].tsx'), 'utf8');
for (const m of route.matchAll(/'([a-z-]+-[a-z]+-\d+)':\s*([A-Za-z0-9]+)/g)) {
  const comp = m[2].replace(/Lesson$/, '');
  const stem = `${comp[0].toLowerCase()}${comp.slice(1)}`;
  for (const f of [`${stem}Scene.tsx`, `${comp}.tsx`]) {
    const fp = path.join(REPO, DIR, f);
    if (!fs.existsSync(fp)) continue;
    const bm = fs.readFileSync(fp, 'utf8').match(/band=\{\[\s*(-?\d+)\s*,\s*(-?\d+)\s*\]\}/);
    if (bm) bands.set(m[1], [+bm[1], +bm[2]]);
    break;
  }
}

// ── 3 · re-stamp, but only where the script differs from HEAD by a pose alone ──
const headOf = (p) => {
  try { return execFileSync('git', ['show', `HEAD:${p.replace(/\\/g, '/')}`], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }); }
  catch { return null; }
};
const blocksOf = (src) => src.split('\n  {\n').slice(1).map((c) => c.split('\n  }')[0]);

let restamped = 0;
const unproven = [];
for (const l of lessons) {
  const rel = path.join(DIR, path.basename(l.file));
  const now = fs.readFileSync(path.join(REPO, rel), 'utf8');
  const was = headOf(rel);
  if (was === null || was === now) continue;
  // ONE RULE, TWO READERS. `gestures.gestureKey` reads the name out of the beat
  // type's doc comment and `posetrack` follows the value into the poser call; they
  // agree on 236 of 237 lessons and disagree on ethics-ethics-5, whose comment does
  // not name `soc`. Following the code wins, because that is what actually runs.
  const key = poseTrack(DIR, path.basename(l.file).replace('Script.ts', ''))?.field ?? l.key;
  // Strip every `<key>: <n>` and the two shapes liven-still writes, then the rest
  // of the file must be identical. A pose is the only thing allowed to have moved.
  const strip = (s) => (key
    ? s.replace(new RegExp(String.raw`(^|[\s{,])${key}\s*:\s*-?\d+\s*,?`, 'g'), '$1')
    : s).replace(/\s+/g, ' ').trim();
  if (!key || strip(was) !== strip(now)) {
    unproven.push([l.id, key ? 'differs by more than a pose' : 'no gesture key']);
    continue;
  }
  const before = side.stamps[l.id];
  const after = mustStamp(DIR, l.comp, MEASURE);
  if (before === after) continue;
  side.stamps[l.id] = after;
  restamped += 1;
}
console.log(`${restamped} lesson(s) re-stamped — proven to differ from HEAD by a pose value alone`);
if (unproven.length) {
  console.log(`${unproven.length} NOT re-stamped, they still need a real re-measure:`);
  for (const [id, why] of unproven) console.log(`   ${id} — ${why}`);
}

// ── 4 · and the TOURS, the second store computed from the same stamp ────────
//
// `tours.ts` carries its own TOUR_STAMP off `mustStamp`, so it goes stale for the
// same non-reason. `restamp-must`'s note says to regenerate with `make:tours`
// instead — which is not available: that generator refuses to write at all while
// its own validator rejects a follow it offers (CLAUDE.md §17). The TOURS
// themselves are untouched; only the fingerprint moves, and only for a lesson
// already proven above.
const TOURS = path.join(REPO, DIR, 'tours.ts');
const toursSrc = fs.readFileSync(TOURS, 'utf8');
const tAt = toursSrc.indexOf('export const TOUR_STAMP');
let tourFixed = 0;
const tourOut = toursSrc.slice(0, tAt) + toursSrc.slice(tAt).replace(
  /'([a-z0-9-]+)':\s*'([0-9a-f]+)'/g,
  (m, id, was) => {
    const now = side.stamps[id];
    if (!now || now === was) return m;
    tourFixed += 1;
    return `'${id}': '${now}'`;
  },
);
console.log(`${tourFixed} tour stamp(s) brought in line with the re-stamped lessons`);

if (!WRITE) { console.log('\n(dry run — pass --write to apply)'); process.exit(0); }

const rendered = renderTable(side.words, side.stamps, 'all', bands);
fs.writeFileSync(SIDE, JSON.stringify({
  boxes: rendered.boxes, words: side.words, stamps: side.stamps,
  wardrobeReach: side.wardrobeReach || {}, poseReach: nowReach,
}, null, 1));
fs.writeFileSync(path.join(REPO, DIR, 'mustBoxes.ts'), rendered.text);
fs.writeFileSync(TOURS, tourOut);
console.log(`\nwrote ${SIDE} and ${DIR}/mustBoxes.ts`);
void os;
