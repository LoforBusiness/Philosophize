// RE-STAMP THE MUST-BOXES, THE TOURS AND THE MARK AUDIT AFTER THE OUTLINE BECAME THE
// OBJECT'S EDGE (LESSON_RULES AM12).
//
//   node scripts/restamp-outline.mjs [--write]
//
// `Silhouette.tsx`, `ObjectArt.tsx` and `SetArt.tsx` are in muststamp's SHARED list, so
// changing how an outline is drawn marks every scene that draws an object stale. What
// changed can only make the drawn art SMALLER: a grown triangle no longer pokes its
// corners past the line, and a small object's line is thinner than 2.2. A stored box
// that is a unit or two looser than the art is safe — the camera frames a little more
// than it must — so a re-measure would buy nothing.
//
// The proof is `restamp-lip`'s: no scene, script or set file may differ from HEAD, and
// a stored stamp is renewed only if it matches the stamp of the COMMITTED shared files.
// Anything already stale stays stale and is named.
//
// Read the exit code from the file, not through a pipe.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { mustStamp } from './lib/muststamp.mjs';
import { MEASURE } from './lib/mustprobe.mjs';

const DIR = 'components/lesson/cinematic';
const SIDE = path.join(DIR, 'mustBoxes.ts.json');
const GEN = path.join(DIR, 'mustBoxes.ts');
const TOURS = path.join(DIR, 'tours.ts');
const EDGES = 'scripts/lib/markEdges.json';
const WRITE = process.argv.includes('--write');
const SHARED = ['Silhouette.tsx', 'ObjectArt.tsx', 'SetArt.tsx'].map((f) => path.join(DIR, f));
const head = (p) => execFileSync('git', ['show', `HEAD:${p.replace(/\\/g, '/')}`],
  { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });

// ── 1. prove nothing but the shared outline files moved ────────────────────
const moved = [];
for (const f of fs.readdirSync(DIR).filter((n) => /(Scene\.tsx|Script\.ts|Set\.ts)$/.test(n))) {
  const full = path.join(DIR, f);
  let was;
  try { was = head(full); } catch { continue; }
  if (was !== fs.readFileSync(full, 'utf8')) moved.push(f);
}
if (moved.length) {
  console.log(`${moved.length} scene/script/set file(s) differ from HEAD — commit or restore them first:`);
  for (const f of moved) console.log(`   ${f}`);
  process.exit(1);
}
const committed = new Map(SHARED.map((p) => [p, head(p)]));

// ── 2. the stamps, against the committed shared files and against today's ──
const route = fs.readFileSync('app/(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId].tsx', 'utf8');
const comps = new Map();
for (const m of route.matchAll(/'([a-z-]+-[a-z]+-\d+)':\s*([A-Za-z0-9]+)/g)) comps.set(m[1], m[2]);

function withCommitted(fn) {
  const live = new Map([...committed.keys()].map((p) => [p, fs.readFileSync(p, 'utf8')]));
  try {
    for (const [p, was] of committed) fs.writeFileSync(p, was, 'utf8');
    return fn();
  } finally {
    for (const [p, now] of live) fs.writeFileSync(p, now, 'utf8');
  }
}
const before = withCommitted(() => new Map([...comps].map(([id, c]) => [id, mustStamp(DIR, c, MEASURE)])));
const after = new Map([...comps].map(([id, c]) => [id, mustStamp(DIR, c, MEASURE)]));

// ── 3. migrate the three stores ────────────────────────────────────────────
function migrate(stored) {
  const next = {}; let n = 0; const stale = [];
  for (const [id, was] of Object.entries(stored)) {
    const b = before.get(id), a = after.get(id);
    if (!b || !a || was === a) { next[id] = was; continue; }
    if (was === b) { next[id] = a; n += 1; } else { next[id] = was; stale.push(id); }
  }
  return { next, n, stale };
}
const side = JSON.parse(fs.readFileSync(SIDE, 'utf8'));
const boxes = migrate(side.stamps);
console.log(`must-boxes : ${boxes.n} re-stamped · ${boxes.stale.length} already stale before today`);
for (const id of boxes.stale) console.log(`   still needs a real re-measure: ${id}`);
const toursSrc = fs.readFileSync(TOURS, 'utf8');
const tourBlock = toursSrc.split('export const TOUR_STAMP')[1] ?? '';
const tours = migrate(Object.fromEntries([...tourBlock.matchAll(/'([a-z0-9-]+)':\s*'([0-9a-f]+)'/g)].map((m) => [m[1], m[2]])));
console.log(`tours      : ${tours.n} re-stamped · ${tours.stale.length} already stale before today`);
const edgesStore = fs.existsSync(EDGES) ? JSON.parse(fs.readFileSync(EDGES, 'utf8')) : null;
const edges = edgesStore ? migrate(edgesStore.stamps) : null;
if (edges) console.log(`mark audit : ${edges.n} re-stamped · ${edges.stale.length} already stale before today`);

if (!WRITE) { console.log('\n(dry run — pass --write to apply)'); process.exit(0); }
side.stamps = boxes.next;
fs.writeFileSync(SIDE, JSON.stringify(side, null, 1));
const stampLine = (store) => (m, id) => (store[id] ? `'${id}': '${store[id]}'` : m);
const genSrc = fs.readFileSync(GEN, 'utf8');
const at = genSrc.indexOf('MUST_STAMP');
fs.writeFileSync(GEN, genSrc.slice(0, at) + genSrc.slice(at).replace(/'([a-z0-9-]+)':\s*'([0-9a-f]+)'/g, stampLine(boxes.next)));
const tAt = toursSrc.indexOf('export const TOUR_STAMP');
fs.writeFileSync(TOURS, toursSrc.slice(0, tAt) + toursSrc.slice(tAt).replace(/'([a-z0-9-]+)':\s*'([0-9a-f]+)'/g, stampLine(tours.next)));
if (edges) { edgesStore.stamps = edges.next; fs.writeFileSync(EDGES, `${JSON.stringify(edgesStore)}\n`); }
console.log(`\nwrote ${SIDE}, ${GEN}, ${TOURS}${edges ? `, ${EDGES}` : ''}`);
