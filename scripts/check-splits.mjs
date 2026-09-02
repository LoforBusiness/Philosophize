// DOES A BEAT OPEN ON A NAME THE READER NO LONGER HAS?
//
//   node scripts/check-splits.mjs          (npm run check:splits)
//   SPLITS_ALL=1 node scripts/check-splits.mjs
//
// J12 cut 396 beats at sentence boundaries. A sentence boundary is the right place
// to cut and not always a good place to STOP: a piece can be grammatically whole
// and still read as the back half of something, because the word it hangs on is
// now on the previous tap.
//
// ── THE DETECTOR IS NARROW ON PURPOSE, AND THE WIDE ONE IS WHY ──────────────
//
// The obvious rule — flag a beat opening on a connective — reports 259 beats, and
// it is worthless. HEAD carried 171 of them BEFORE anything was split (16.2% of
// all beats); the split moved that to 17.5%. Opening on "So", "That", "But" or
// "Then" is this corpus's own voice and always has been, and a reader needs no
// previous screen to parse "So what makes something art?". A checker firing on
// one beat in six has told you nothing.
//
// What genuinely strands a reader is narrower: a bare PERSONAL pronoun in a beat
// that names nobody. "He simply will not go on to say…" needs Hume, and after the
// split Hume is on the tap before. That is the antecedent going off-screen — not a
// hard word, a missing referent, which is the thing J10 and J11 cannot see because
// the sentence scores perfectly well on its own.
//
// Measured: 7 before the split, 15 after. The eight the split created were fixed by
// putting the name back, which is always the fix — never deleting the pronoun.
import fs from 'node:fs';
import path from 'node:path';

const DIR = 'components/lesson/cinematic';
const ALL = !!process.env.SPLITS_ALL;

/** A beat opening on one of these is leaning on the beat before it. */
const PERSON = /^(he|she|his|her|him|hers)\b/i;
/** Any capitalised word that is not the first is a name the beat carries itself. */
const NAMES = /(?!^)\b[A-Z][a-z]{2,}\b/;

/**
 * High-water mark. May only go DOWN, and the fix is always to say WHO — never to
 * cut the sentence, which would lose the teaching to save the referent.
 *
 * The split created 17 of these on top of 12 that were already there. Naming all
 * 17 took the corpus to 7, which is BETTER than it was before anything was split,
 * because several of the names put back were owed already.
 *
 * LEFT AT THE PRE-FIX FIGURE OF 12 ON PURPOSE, and it should be lowered to 7. A
 * budget is a ceiling, so this passes at 12 and passes at 7. It is committed high
 * because both the split and the seventeen names live in the *Script.ts files, and
 * those are entangled in the working tree with another session's uncommitted copy
 * edits — so this checker may reach HEAD before the content does, and a budget of
 * 7 against an unfixed tree would fail a checkout that is not actually broken.
 * 12 is what HEAD measures today. Lower it to what the run prints once they land.
 *
 * TWO OF THE SEVEN MUST NOT BE "FIXED". `epistemology20` and `logic20` open on
 * "He who knows only his own side of the case knows little of that" — that is
 * Mill, quoted, and the pronoun is the quotation's own first word. Rewriting a
 * primary source to satisfy a checker is F42, and this rule stops at 7 partly to
 * leave them alone.
 */
const STRANDED_BUDGET = 12;

const stranded = [];
let beats = 0;

for (const f of fs.readdirSync(DIR).filter((x) => x.endsWith('Script.ts')).sort()) {
  const src = fs.readFileSync(path.join(DIR, f), 'utf8');
  const name = f.replace('Script.ts', '');
  for (const m of src.matchAll(/^\s*text: '((?:[^'\\]|\\.)*)',$/gm)) {
    const t = m[1].replace(/\\'/g, "'").trim();
    if (!t) continue;
    beats += 1;
    if (!PERSON.test(t)) continue;
    // Only the FIRST sentence matters: a name arriving later still arrives late.
    const first = t.split(/(?<=[.!?])\s/)[0] ?? t;
    if (NAMES.test(first)) continue;
    stranded.push({ name, t });
  }
}

console.log('\nWHOSE BEAT IS THIS\n');
console.log(`  ${beats} narration beats · ${stranded.length} open on a pronoun and name nobody\n`);

const bad = stranded.length > STRANDED_BUDGET;
console.log(`  ${bad ? 'FAIL' : 'ok  '}  no more than ${STRANDED_BUDGET} beats open on a name the reader no longer has`
  + `  ${stranded.length}`
  + (!bad && stranded.length < STRANDED_BUDGET ? ` — lower STRANDED_BUDGET to ${stranded.length}` : ''));
if (bad) console.log('        say who. The fix is the name, never cutting the sentence.');
for (const s of (ALL ? stranded : stranded.slice(0, 12))) {
  console.log(`      ${s.name.padEnd(16)} "${s.t.slice(0, 76)}"`);
}
if (!ALL && stranded.length > 12) console.log(`      …and ${stranded.length - 12} more (SPLITS_ALL=1)`);

console.log(bad ? '\n1 failing.\n' : '\nall clear.\n');
process.exit(bad ? 1 : 0);
