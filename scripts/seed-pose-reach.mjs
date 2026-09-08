// ─────────────────────────────────────────────────────────────────────────────
// ONE-TIME: TELL THE BOX TABLE WHICH POSE IT WAS MEASURED AGAINST
//
//   node scripts/seed-pose-reach.mjs
//
// `make:wardrobe` grows each stored figure box when a POSE gets wider, because
// nothing else can: `muststamp` hashes the scene, the script and the probe, and
// `moves.ts` is none of the three, so an act that changes shape leaves every box
// holding it quietly too small and no check goes red.
//
// Growing needs a BASELINE — what the boxes already account for — and a measured
// box accounts for whatever the figure was doing when the probe read it. There was
// no record of that, and treating it as nothing is not a conservative guess, it is
// a wrong one: the first draft did exactly that and grew 7,589 boxes on a corpus
// where nine acts had moved.
//
// So this writes the baseline once, from the `moves.ts` at git HEAD — the version
// the shipped boxes were recorded against — and applies nothing. It also UNDOES
// any reach a previous run applied, so it is safe to run over a corpus that has
// already been grown once by mistake.
//
// It is a committed script rather than a scratch run for the reason
// `restamp-must.mjs` is: a migration that launders the very rot the record exists
// to catch is worth being able to read afterwards.
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { corpus } from './lib/gestures.mjs';
import { loadRig } from './lib/loadrig.mjs';
import { renderTable } from './lib/mustrule.mjs';

const REPO = path.resolve(path.dirname(new URL(import.meta.url).pathname).replace(/^\//, ''), '..');
const SIDE = path.join(REPO, 'components/lesson/cinematic/mustBoxes.ts.json');
const MUST_PAD = 4;
const K_FIG = 1;

// HEAD's moves.ts, beside the CURRENT rig.ts — which is only valid while rig.ts
// itself has not moved, so say so rather than assume it.
const rigDirty = execFileSync('git', ['diff', '--name-only', 'components/lesson/cinematic/rig.ts'], { cwd: REPO, encoding: 'utf8' }).trim();
if (rigDirty) {
  console.error('rig.ts has uncommitted changes — the baseline would be measured against the wrong geometry.');
  process.exit(1);
}
const headSrc = execFileSync('git', ['show', 'HEAD:components/lesson/cinematic/moves.ts'], { cwd: REPO, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });

const { RIG } = await loadRig();
const { transform } = await import(pathToFileURL(path.join(REPO, 'node_modules/sucrase/dist/index.js')).href);
const tmp = path.join(os.tmpdir(), 'philosophize-pose-seed');
fs.mkdirSync(tmp, { recursive: true });
const emit = (src, name) => {
  const js = transform(src, { transforms: ['typescript'] }).code
    .replace(/(from\s+['"])\.\/([A-Za-z0-9_-]+)(['"])/g, '$1./$2.mjs$3');
  fs.writeFileSync(path.join(tmp, name), js);
  return pathToFileURL(path.join(tmp, name)).href;
};
emit(fs.readFileSync(path.join(REPO, 'components/lesson/cinematic/rig.ts'), 'utf8'), 'rig.mjs');
const WAS = await import(emit(headSrc, 'moves.mjs'));

/** The same measure make:wardrobe uses: the wrist plus the glove, less the trunk and the pad. */
function reachOf(M, code) {
  let r = 0;
  for (const t of [0, 0.6, 1.2, 1.8, 2.4, 3.0, 3.6, 4.2, 4.8, 5.4]) {
    const s = M.emoteAny(code, t);
    for (const f of [s.fistL, s.fistR]) if (f) r = Math.max(r, Math.abs(f.x));
  }
  return +Math.max(0, (r + RIG.STR.glove / 2) - RIG.STR.torso / 2 - MUST_PAD).toFixed(2);
}

const side = JSON.parse(fs.readFileSync(SIDE, 'utf8'));
const codes = new Map(corpus().map((l) => [l.id, l.beats.map((b) => b.code)]));

// ── 1 · take back whatever a previous run applied ───────────────────────────
let undone = 0;
for (const [id, per] of Object.entries(side.poseReach || {})) {
  const items = side.words[id];
  if (!items) continue;
  per.forEach((v, i) => {
    if (!v || !items[i]) return;
    for (const it of items[i]) {
      if (it.k !== 'fig' || it.v) continue;
      it.b[0] += v * K_FIG;
      it.b[2] -= 2 * v * K_FIG;
      undone += 1;
    }
  });
}

// ── 2 · record what the boxes were measured against, and apply nothing ──────
const seeded = {};
for (const [id, cs] of codes) {
  if (!side.words[id]) continue;
  seeded[id] = cs.map((c) => reachOf(WAS, c));
}
side.poseReach = seeded;

// THE BAND, out of each scene, exactly as make:wardrobe reads it — `renderTable`
// clamps every box to the lesson's own band and an object where it wants a Map
// silently clamps them all to the whole stage instead.
const bands = new Map();
const route = fs.readFileSync(path.join(REPO, 'app/(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId].tsx'), 'utf8');
for (const m of route.matchAll(/'([a-z-]+-[a-z]+-\d+)':\s*([A-Za-z0-9]+)/g)) {
  const comp = m[2].replace(/Lesson$/, '');
  const stem = `${comp[0].toLowerCase()}${comp.slice(1)}`;
  for (const f of [`${stem}Scene.tsx`, `${comp}.tsx`]) {
    const fp = path.join(REPO, 'components/lesson/cinematic', f);
    if (!fs.existsSync(fp)) continue;
    const bm = fs.readFileSync(fp, 'utf8').match(/band=\{\[\s*(-?\d+)\s*,\s*(-?\d+)\s*\]\}/);
    if (bm) bands.set(m[1], [+bm[1], +bm[2]]);
    break;
  }
}
const rendered = renderTable(side.words, side.stamps, 'all', bands);
fs.writeFileSync(SIDE, JSON.stringify(
  { boxes: rendered.boxes, words: side.words, stamps: side.stamps, wardrobeReach: side.wardrobeReach || {}, poseReach: seeded }, null, 1,
));
fs.writeFileSync(path.join(REPO, 'components/lesson/cinematic/mustBoxes.ts'), rendered.text);
console.log(`${undone} figure box(es) had an applied reach taken back off`);
console.log(`${Object.keys(seeded).length} lesson(s) seeded with the reach their boxes were measured against`);
console.log('\nnow run: npm run make:wardrobe   (it will grow only what actually moved)');
