// APPLY A BATCH OF NARRATION REWRITES, EXACTLY, OR REFUSE.
//
//   node scripts/apply-rewrites.mjs <batch.json>
//
// Batch shape: [{ "lesson": "aesthetics2", "from": "…", "to": "…" }, …]
// `from` must match the file exactly once. Anything else is reported and skipped
// rather than guessed at — a rewrite that lands on the wrong beat is worse than
// one that does not land, because the picture stops matching the words (A1) and
// nothing in the suite can see it.
//
// It also carries the maxim forward: `data/lessonFocus.ts` stores a phrase cut
// VERBATIM out of one beat, so a rewrite that drops it orphans it and
// `check:focus` goes red. Pass "focus" on an entry to update the stored phrase in
// the same commit.
import fs from 'node:fs';
import path from 'node:path';

const DIR = 'components/lesson/cinematic';
const FOCUS = 'data/lessonFocus.ts';
const batch = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));

let ok = 0;
const problems = [];

for (const e of batch) {
  const p = path.join(DIR, `${e.lesson}Script.ts`);
  if (!fs.existsSync(p)) { problems.push(`${e.lesson}: no such script`); continue; }
  const src = fs.readFileSync(p, 'utf8');
  const n = src.split(e.from).length - 1;
  if (n === 0) { problems.push(`${e.lesson}: NOT FOUND  «${e.from.slice(0, 70)}»`); continue; }
  if (n > 1) { problems.push(`${e.lesson}: ${n} matches, ambiguous  «${e.from.slice(0, 70)}»`); continue; }
  fs.writeFileSync(p, src.replace(e.from, e.to));
  ok += 1;
}

// Maxims, after the beats, so a phrase can be re-cut from the new wording.
const focusEdits = batch.filter((e) => e.focus);
if (focusEdits.length) {
  let f = fs.readFileSync(FOCUS, 'utf8');
  for (const e of focusEdits) {
    const n = f.split(`'${e.focus.from}'`).length - 1;
    if (n !== 1) { problems.push(`${e.lesson}: maxim not uniquely found «${e.focus.from}»`); continue; }
    f = f.replace(`'${e.focus.from}'`, `'${e.focus.to}'`);
  }
  fs.writeFileSync(FOCUS, f);
}

console.log(`${ok} of ${batch.length} rewrites applied`);
if (problems.length) {
  console.log('\nPROBLEMS — nothing was guessed at:');
  for (const p of problems) console.log(`  ${p}`);
  process.exit(1);
}
