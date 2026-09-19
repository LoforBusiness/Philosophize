// RE-STAMP logic-arguments-1 AND -2 AFTER THEIR PLAYERS LEARNED TO GO BACK (group AI).
//
//   node scripts/restamp-guide.mjs [--write]
//
// Those two lessons predate the shared player, so their must-box stamp hashes their
// whole player file — ArgumentFightLesson.tsx and PremisesBuilderLesson.tsx — and
// giving them tap-back, answer memory, the Aa button and the guide hold made both
// stamps stale. None of that is drawn inside the stage crop the probe reads: the
// header (and its Aa button) is outside it, the edge glow is drawn in the body beside
// the stage, and the clock hold and answer memory never engage under a harness.
//
// THE PROOF WAS MEASURED, NOT ARGUED. Both lessons were measured three times into
// scratch files on 2026-09-19 — once with the COMMITTED players swapped onto disk, and
// twice with the new ones:
//
//                              words/art differing   figure boxes differing
//   committed vs new                   0                   67 · 13
//   new vs new (same code)             0                   59 ·  4
//
// Every word and every piece of art is identical; the figures differ between two runs
// of IDENTICAL code by as much as between the old players and the new, because a
// must-box reads a moving figure at one moment (CLAUDE.md, "a must-box is a moment,
// not a place") and the first of these lessons is two figures sparring.
//
// So the stored measurements are exactly as good as they were, and this renews the
// stamp — and only where the stored stamp is the stamp of the committed files, so a
// row that was already stale for any other reason stays stale and keeps asking for a
// real re-measure. Read the exit code from the file, not through a pipe.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { mustStamp } from './lib/muststamp.mjs';
import { MEASURE } from './lib/mustprobe.mjs';

const WRITE = process.argv.includes('--write');
const DIR = 'components/lesson/cinematic';
const SIDE = `${DIR}/mustBoxes.ts.json`;
const GEN = `${DIR}/mustBoxes.ts`;
const TOURS = `${DIR}/tours.ts`;
const EDGES = 'scripts/lib/markEdges.json';
const LESSONS = { 'logic-arguments-1': 'ArgumentFightLesson', 'logic-arguments-2': 'PremisesBuilderLesson' };
const FILES = Object.values(LESSONS).map((c) => `${DIR}/${c}.tsx`);

/** The stamps with the committed player files on disk; the working tree put back after. */
function committedStamps() {
  const live = new Map(FILES.map((f) => [f, fs.readFileSync(f)]));
  try {
    for (const f of FILES) fs.writeFileSync(f, execFileSync('git', ['show', `HEAD:${f}`]));
    return Object.fromEntries(Object.entries(LESSONS).map(([id, comp]) => [id, mustStamp(DIR, comp, MEASURE)]));
  } finally {
    for (const [f, buf] of live) fs.writeFileSync(f, buf);
    for (const [f, buf] of live) if (!fs.readFileSync(f).equals(buf)) throw new Error(`${f} was not restored`);
  }
}

const before = committedStamps();
const after = Object.fromEntries(Object.entries(LESSONS).map(([id, comp]) => [id, mustStamp(DIR, comp, MEASURE)]));

function migrate(stored, label) {
  const next = { ...stored };
  let moved = 0;
  for (const id of Object.keys(LESSONS)) {
    const was = stored[id];
    if (was === undefined) continue;
    if (was === after[id]) continue;
    if (was === before[id]) { next[id] = after[id]; moved += 1; }
    else console.log(`   ${label}: ${id} was already stale before this change — left for a real re-measure`);
  }
  console.log(`${label.padEnd(10)} ${moved} re-stamped`);
  return next;
}

const side = JSON.parse(fs.readFileSync(SIDE, 'utf8'));
const boxes = migrate(side.stamps, 'must-boxes');
const toursSrc = fs.readFileSync(TOURS, 'utf8');
const tourBlock = toursSrc.split('export const TOUR_STAMP')[1] ?? '';
const tourStamps = Object.fromEntries([...tourBlock.matchAll(/'([a-z0-9-]+)':\s*'([0-9a-f]+)'/g)].map((m) => [m[1], m[2]]));
const tours = migrate(tourStamps, 'tours');
const edgesStore = fs.existsSync(EDGES) ? JSON.parse(fs.readFileSync(EDGES, 'utf8')) : null;
const edges = edgesStore ? migrate(edgesStore.stamps, 'mark audit') : null;

if (!WRITE) { console.log('\n(dry run — pass --write to apply)'); process.exit(0); }

side.stamps = boxes;
fs.writeFileSync(SIDE, JSON.stringify(side, null, 1));
const stampLine = (store) => (m, id) => (store[id] ? `'${id}': '${store[id]}'` : m);
const genSrc = fs.readFileSync(GEN, 'utf8');
const at = genSrc.indexOf('MUST_STAMP');
fs.writeFileSync(GEN, genSrc.slice(0, at) + genSrc.slice(at).replace(/'([a-z0-9-]+)':\s*'([0-9a-f]+)'/g, stampLine(boxes)));
const tAt = toursSrc.indexOf('export const TOUR_STAMP');
fs.writeFileSync(TOURS, toursSrc.slice(0, tAt) + toursSrc.slice(tAt).replace(/'([a-z0-9-]+)':\s*'([0-9a-f]+)'/g, stampLine(tours)));
if (edges) { edgesStore.stamps = edges; fs.writeFileSync(EDGES, `${JSON.stringify(edgesStore)}\n`); }
console.log(`\nwrote ${SIDE}, ${GEN}, ${TOURS}${edges ? `, ${EDGES}` : ''}`);
