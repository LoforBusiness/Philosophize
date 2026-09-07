// RE-STAMP THE MUST-BOXES AFTER THE HASH FUNCTION CHANGED — without re-measuring,
// and only where that is provably safe.
//
//   node scripts/restamp-must.mjs [--write]
//
// `muststamp` stopped hashing a script's narration prose (see the note there), so
// every stored stamp went stale at once. None of the MEASUREMENTS did: the boxes
// describe what is inside `#stage-clip` and nothing about any scene moved.
//
// THE SAFE MIGRATION IS NOT "RE-STAMP EVERYTHING". A lesson whose scene or
// channels genuinely changed since it was measured was stale BEFORE this, and
// blanket re-stamping would launder exactly the rot the stamp exists to catch —
// which is this file's own recurring failure, one level out again. So each lesson
// is re-derived under the OLD rule first:
//
//   old stamp matches  → the measurement was valid a minute ago and still is.
//                        Write the new stamp.
//   old stamp differs  → it was already stale. Leave it, and name it, so
//                        `check:cinematic` keeps demanding a re-measure.
//
// ── THE STAMP HAS TWO DERIVED STORES, AND THIS FILE ONLY FIXES ONE ──────────
//
// `mustBoxes.ts` is what this migrates. `components/lesson/cinematic/tours.ts`
// carries its OWN `TOUR_STAMP`, computed with the same `mustStamp`, and it went
// stale in exactly the same way and for exactly the same non-reason. The answer
// there is not this script: `npm run make:tours` needs no browser — it derives
// from the must-boxes, which have not moved — so regenerating is cheap and the
// tours come out byte-identical with only the stamps changed. Verify that, don't
// assume it.
//
// Run BOTH after changing the hash function. Grep `muststamp` for the consumer
// list before believing you have found them all; today it is `validate-cinematic`
// and `check-tour`.
//
// THIS NEARLY SHIPPED AS A FALSE GREEN. `npm run check` was read through
// `| tail -40`, so the exit code reported was TAIL'S, not npm's — the suite was
// failing at `check:tour` while the transcript said it passed. A pipeline's exit
// status is its LAST command. Capture to a file and echo `$?`.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { stampFiles, mustStamp } from './lib/muststamp.mjs';
import { MEASURE } from './lib/mustprobe.mjs';

const DIR = 'components/lesson/cinematic';
const SIDE = path.join(DIR, 'mustBoxes.ts.json');
const WRITE = process.argv.includes('--write');

/** The hash exactly as it was before prose was dropped: every stamped file whole. */
function oldStamp(dir, comp) {
  const files = stampFiles(dir, comp);
  if (!files.length) return null;
  const SHARED = path.join(dir, 'Target.tsx');
  const h = crypto.createHash('sha1');
  for (const p of files) {
    if (p === SHARED) {
      const src = fs.readFileSync(p, 'utf8');
      const at = src.indexOf('StyleSheet.create(');
      let block = src;
      if (at >= 0) {
        const open = src.indexOf('{', at);
        let d = 0;
        for (let i = open; i < src.length; i += 1) {
          if (src[i] === '{') d += 1;
          else if (src[i] === '}') { d -= 1; if (!d) { block = src.slice(open, i + 1); break; } }
        }
      }
      h.update(Buffer.from(block));
    } else {
      h.update(fs.readFileSync(p));               // scene AND script, whole — the old rule
    }
  }
  h.update(crypto.createHash('sha1').update(String(MEASURE)).digest('hex').slice(0, 8));
  return h.digest('hex').slice(0, 12);
}

const side = JSON.parse(fs.readFileSync(SIDE, 'utf8'));
const route = fs.readFileSync('app/(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId].tsx', 'utf8');
const map = new Map();
for (const m of route.matchAll(/'([a-z-]+-[a-z]+-\d+)':\s*([A-Za-z0-9]+)/g)) map.set(m[1], m[2]);

let migrated = 0;
const alreadyStale = [];
for (const [id, stored] of Object.entries(side.stamps)) {
  const comp = map.get(id);
  if (!comp) continue;
  const before = oldStamp(DIR, comp);
  const after = mustStamp(DIR, comp, MEASURE);
  if (stored === after) continue;                       // nothing to do
  if (stored === before) { side.stamps[id] = after; migrated += 1; }
  else alreadyStale.push(id);
}

console.log(`${migrated} lesson(s) re-stamped under the new rule (measurement unchanged and still valid)`);
if (alreadyStale.length) {
  console.log(`\n${alreadyStale.length} were ALREADY stale before the hash changed — left alone, they need a real re-measure:`);
  for (const id of alreadyStale) console.log(`  ${id}`);
}
if (WRITE) {
  // INDENT 1, because that is what `measure-must` writes. Anything else rewrites
  // all 641,532 lines of a 6.8MB file to say that 184 short strings changed.
  fs.writeFileSync(SIDE, JSON.stringify(side, null, 1));

  // AND THE GENERATED FILE, which is the one that is actually read. The .json is
  // raw measurement data; `validate-cinematic` re-derives against MUST_STAMP in
  // mustBoxes.ts. Writing only the side file re-stamps nothing that anything checks.
  const gen = path.join(DIR, 'mustBoxes.ts');
  const src = fs.readFileSync(gen, 'utf8');
  const out = src.replace(/'([a-z0-9-]+)':\s*'([0-9a-f]+)'/g, (m, id, was) => (
    side.stamps[id] ? `'${id}': '${side.stamps[id]}'` : m
  ));
  fs.writeFileSync(gen, out);
  console.log(`wrote ${gen}`);
  console.log(`\nwrote ${SIDE}`);
} else {
  console.log('\n(dry run — pass --write to apply)');
}
