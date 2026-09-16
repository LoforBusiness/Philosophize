// RE-STAMP THE MUST-BOXES AND THE TOURS AFTER `hue-stage` COLOURED THE STAGE.
//
//   node scripts/restamp-hue.mjs [--write]
//
// `muststamp` hashes a scene WHOLE, so changing 244 scene files made every stored
// measurement stale at once — and a colour cannot move a box. This is the same
// non-reason `restamp-must.mjs` was written for, so it takes the same shape, with
// one difference that makes it stronger.
//
// ── THE PROOF IS A REPRODUCTION, NOT AN ASSERTION ───────────────────────────
//
// `restamp-must` could re-derive the OLD hash because only the hash function had
// changed. Here the FILES changed, so "the old stamp matched" is not enough on its
// own — it says the measurement was valid before, not that the edit was harmless.
//
// So each scene is proven twice:
//
//   1. re-running `hueScene` on the COMMITTED text must reproduce the file on disk
//      byte for byte. If it does, the only difference from HEAD is the codemod's
//      own edit — one import list, one added import, one added const. Nothing
//      that can move a pixel, let alone a box.
//   2. the stored stamp must match the stamp computed from the COMMITTED text. If
//      it does not, that lesson was already stale before today and is left alone
//      and named, exactly as `restamp-must` leaves one — blanket re-stamping is
//      how a ratchet launders the rot it exists to catch.
//
// A scene that fails (1) is NOT re-stamped and is reported, because at that point
// this script cannot tell a tone rewiring from somebody's real edit.
//
// ── AND THE TOURS, WHICH ARE THE SECOND DERIVED STORE ───────────────────────
//
// `tours.ts` carries its own `TOUR_STAMP` computed with the same `mustStamp`, and
// it goes stale for the same non-reason. `restamp-must`'s note says to regenerate
// with `make:tours` instead — that is not available today: the generator refuses to
// write at all while its own validator rejects a follow it offers (CLAUDE.md §17).
// So the tour stamps are migrated here, under the identical two-part proof, and
// the TOURS themselves are not touched.
//
// Read the exit code from the file, not through a pipe.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { mustStamp } from './lib/muststamp.mjs';
import { MEASURE } from './lib/mustprobe.mjs';
import { hueScene } from './hue-stage.mjs';

const DIR = 'components/lesson/cinematic';
const SIDE = path.join(DIR, 'mustBoxes.ts.json');
const GEN = path.join(DIR, 'mustBoxes.ts');
const TOURS = path.join(DIR, 'tours.ts');
const WRITE = process.argv.includes('--write');

const head = (p) => execFileSync('git', ['show', `HEAD:${p.replace(/\\/g, '/')}`],
  { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });

// ── 1. prove every changed scene is only the codemod's edit ─────────────────
const committed = new Map();   // scene path → the committed text
const unproven = [];
for (const file of fs.readdirSync(DIR).filter((f) => f.endsWith('Scene.tsx'))) {
  const full = path.join(DIR, file);
  const now = fs.readFileSync(full, 'utf8');
  let was;
  try { was = head(full); } catch { unproven.push([file, 'not in HEAD']); continue; }
  if (was === now) continue;                                  // untouched
  const out = hueScene(was, file);
  if (out.skip) { unproven.push([file, `codemod would skip it (${out.skip}) yet it changed`]); continue; }
  if (out.src !== now) { unproven.push([file, 'differs from HEAD by more than the tone rewiring']); continue; }
  committed.set(full, was);
}
console.log(`${committed.size} scene(s) proven to differ from HEAD by the tone rewiring alone`);
if (unproven.length) {
  console.log(`\n${unproven.length} NOT proven — these are not re-stamped:`);
  for (const [f, why] of unproven) console.log(`   ${f} — ${why}`);
}
if (!committed.size) { console.log('\nnothing to migrate.'); process.exit(unproven.length ? 1 : 0); }

// ── 2. the stamps, computed against the committed text ──────────────────────
const route = fs.readFileSync('app/(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId].tsx', 'utf8');
const comps = new Map();
for (const m of route.matchAll(/'([a-z-]+-[a-z]+-\d+)':\s*([A-Za-z0-9]+)/g)) comps.set(m[1], m[2]);

/** Run `fn` with the committed text on disk, then put the working tree back. */
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

// ── 3. migrate both stores ──────────────────────────────────────────────────
function migrate(stored) {
  const next = {}; let moved = 0; const stale = [];
  for (const [id, was] of Object.entries(stored)) {
    const b = before.get(id), a = after.get(id);
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
// mustBoxes.ts holds MUST_STAMP; only rewrite inside that block, never the boxes.
const genSrc = fs.readFileSync(GEN, 'utf8');
const at = genSrc.indexOf('MUST_STAMP');
fs.writeFileSync(GEN, genSrc.slice(0, at)
  + genSrc.slice(at).replace(/'([a-z0-9-]+)':\s*'([0-9a-f]+)'/g, stampLine(boxes.next)));

const tAt = toursSrc.indexOf('export const TOUR_STAMP');
fs.writeFileSync(TOURS, toursSrc.slice(0, tAt)
  + toursSrc.slice(tAt).replace(/'([a-z0-9-]+)':\s*'([0-9a-f]+)'/g, stampLine(tours.next)));

console.log(`\nwrote ${SIDE}, ${GEN}, ${TOURS}`);
process.exit(unproven.length ? 1 : 0);
