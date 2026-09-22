// RE-STAMP THE TWO SCENES WHOSE FIGURES STOPPED BOBBING (AL1).
//
//   node scripts/restamp-flat.mjs [--write]
//
// `restamp-skin.mjs` with a different edit and the same two-part proof, which is
// the whole of its safety: re-running this edit on the COMMITTED text must
// reproduce the file on disk byte for byte, and the stored stamp must match the
// stamp of that committed text. Anything that does not prove is left stale and
// named, because blanket re-stamping launders exactly the rot the stamp exists to
// catch (restamp-must's own note).
//
// WHY A PROOF IS ENOUGH HERE, and this is the part to check rather than take on
// trust. `ethics3Scene` and `ethics6Scene` each draw five bound figures whose
// pelvis rode `bob: v * 0.9`, with `v` in −1…1 — so the term moved the whole
// figure through 1.8 units of height, and a must-box was recorded at whatever
// instant of that the probe happened to read. Removing it pins them at 0, which is
// at most 0.9 units above the lowest reading the probe could have taken.
// `mustrule`'s own pad is FOUR units, so every stored box still contains the man
// it was measured around, and it contains him at a height that no longer varies.
//
// The alternative is `measure-must` on the two ids, which is honest and costs more
// than browser time: a fresh reading has not had the costume and pose growth
// applied to it while `wardrobeReach`/`poseReach` still record that it has, and
// re-running `make:wardrobe` to settle that re-deals the costume rotation across
// the corpus. A change that cannot move a box does not earn that.
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
const WRITE = process.argv.includes('--write');

/** The one edit, as a function, so the proof runs it rather than describing it. */
export function flatScene(src) {
  const from = '    bob: v * 0.9,\n';
  if (!src.includes(from)) return { skip: 'no clock-driven bob in a Stance here' };
  if (src.split(from).length - 1 !== 1) return { skip: 'more than one site' };
  const to = '    // FLAT (AL1). `v` used to ride the pelvis too, so every bound figure drifted\n'
    + '    // 1.8 units up and down on a clock. The strain is the lean, the feet and the\n'
    + '    // hands; a body rising with nothing lifting it is the wobble a reader named.\n'
    + '    bob: 0,\n';
  return { src: src.replace(from, to) };
}

const head = (p) => execFileSync('git', ['show', `HEAD:${p.replace(/\\/g, '/')}`],
  { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });

// ── 1. prove every changed scene differs from HEAD by this edit alone ───────
const committed = new Map();
const unproven = [];
for (const file of fs.readdirSync(DIR).filter((f) => f.endsWith('Scene.tsx'))) {
  const full = path.join(DIR, file);
  const now = fs.readFileSync(full, 'utf8');
  let was;
  try { was = head(full); } catch { unproven.push([file, 'not in HEAD']); continue; }
  if (was === now) continue;
  const out = flatScene(was);
  if (out.skip) { unproven.push([file, `the edit would skip it (${out.skip}) yet it changed`]); continue; }
  if (out.src !== now) { unproven.push([file, 'differs from HEAD by more than the flattening']); continue; }
  committed.set(full, was);
}
console.log(`${committed.size} scene(s) proven to differ from HEAD by the bob alone`);
if (unproven.length) {
  console.log(`\n${unproven.length} NOT proven — these are not re-stamped:`);
  for (const [f, why] of unproven) console.log(`   ${f} — ${why}`);
}
if (!committed.size) { console.log('\nnothing to migrate.'); process.exit(unproven.length ? 1 : 0); }

// ── 2. the stamps, computed against the committed text ─────────────────────
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

const before = withCommitted(() => {
  const out = new Map();
  for (const [id, comp] of comps) out.set(id, mustStamp(DIR, comp, MEASURE));
  return out;
});
const after = new Map([...comps].map(([id, comp]) => [id, mustStamp(DIR, comp, MEASURE)]));

// ── 3. migrate both stores ─────────────────────────────────────────────────
function migrate(stored) {
  const next = {}; let moved = 0; const stale = [];
  for (const [id, was] of Object.entries(stored)) {
    const b = before.get(id); const a = after.get(id);
    if (!b || !a || was === a) { next[id] = was; continue; }
    if (was === b) { next[id] = a; moved += 1; } else { next[id] = was; stale.push(id); }
  }
  return { next, moved, stale };
}

const side = JSON.parse(fs.readFileSync(SIDE, 'utf8'));
const boxes = migrate(side.stamps);
console.log(`\nmust-boxes : ${boxes.moved} re-stamped · ${boxes.stale.length} already stale before today`);
for (const id of boxes.stale) console.log(`   still needs a real re-measure: ${id}`);

const toursSrc = fs.readFileSync(TOURS, 'utf8');
const tourBlock = toursSrc.split('export const TOUR_STAMP')[1] ?? '';
const tourStamps = Object.fromEntries([...tourBlock.matchAll(/'([a-z0-9-]+)':\s*'([0-9a-f]+)'/g)].map((m) => [m[1], m[2]]));
const tours = migrate(tourStamps);
console.log(`tours      : ${tours.moved} re-stamped · ${tours.stale.length} already stale before today`);

if (!WRITE) { console.log('\n(dry run — pass --write to apply)'); process.exit(unproven.length ? 1 : 0); }

side.stamps = boxes.next;
// INDENT 1, because that is what `measure-must` writes (restamp-must's note).
fs.writeFileSync(SIDE, JSON.stringify(side, null, 1));

const stampLine = (store) => (m, id) => (store[id] ? `'${id}': '${store[id]}'` : m);
const genSrc = fs.readFileSync(GEN, 'utf8');
const at = genSrc.indexOf('MUST_STAMP');
fs.writeFileSync(GEN, genSrc.slice(0, at)
  + genSrc.slice(at).replace(/'([a-z0-9-]+)':\s*'([0-9a-f]+)'/g, stampLine(boxes.next)));

const tAt = toursSrc.indexOf('export const TOUR_STAMP');
fs.writeFileSync(TOURS, toursSrc.slice(0, tAt)
  + toursSrc.slice(tAt).replace(/'([a-z0-9-]+)':\s*'([0-9a-f]+)'/g, stampLine(tours.next)));

console.log(`\nwrote ${SIDE}, ${GEN}, ${TOURS}`);
process.exit(unproven.length ? 1 : 0);
