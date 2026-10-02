// PUT EACH DEFECT BACK AND WATCH THE CHECKER FAIL.
//
//   node scripts/countertest-focus.mjs
//
// check:focus and check:names both passed on their first run, which is exactly
// when a checker is least trustworthy — §17 records a detector that printed
// "148 scenes carry every track they interpolate" while being wrong about 38 of
// them. So each rule is exercised by breaking the thing it protects.
//
// One direction has to stay SILENT, and it is the interesting one: a lesson with
// no maxim at all is legal and deliberate, so an empty entry must NOT fail. A
// checker that cannot tell an absent mark from a broken one would force a bad
// highlight into every lesson, which is the whole thing the floor in make-focus
// exists to prevent.
//
// THE TABLES ARE EMPTY TODAY (2026-10-02). Every maxim and every tappable name
// belonged to the narrated library, which was deleted; the dialogue lessons carry
// none yet (phase 2, CLAUDE.md §23). So each case first writes a FIXTURE entry —
// a real phrase from a real dialogue beat, `philosophy-foundations-1` — and stages
// its defect on that, and a clean fixture must pass on its own first, or every case
// below could be red for one shared reason. The tables are put back exactly after
// every case, as before.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const FOCUS = 'data/lessonFocus.ts';
const NAMES = 'data/lessonNames.ts';
const NAMES_SCRIPT = 'scripts/make-names.mjs';
const read = (p) => fs.readFileSync(p, 'utf8');

const run = (script, loader) => {
  try {
    execFileSync(process.execPath,
      loader ? ['--import', './scripts/lib/register.mjs', script] : [script],
      { stdio: 'pipe' });
    return 0;
  } catch (e) { return e.status ?? 1; }
};

// The fixture: beat 4 of philosophy-foundations-1 is narration with no question on
// it ("Philosophy asks what we mean and what’s true, when looking harder won’t settle
// it."), and beat 5 carries the lesson's first question.
const ID = 'philosophy-foundations-1';
const PHRASE = 'what we mean and what’s true';
const entry = (beat, phrase) => `  '${ID}': { beat: ${beat}, phrase: '${phrase}' },\n`;
const withFocus = (row) => (s) => s.replace('export const LESSON_FOCUS: Record<string, LessonFocus> = {\n',
  `export const LESSON_FOCUS: Record<string, LessonFocus> = {\n${row}`);
const withName = (row) => (s) => s.replace('export const LESSON_NAMES: Record<string, readonly LessonName[]> = {\n',
  `export const LESSON_NAMES: Record<string, readonly LessonName[]> = {\n${row}`);

const CASES = [
  {
    name: 'a phrase that is not in its beat',
    edits: [[FOCUS, withFocus(entry(4, 'what we meant and what’s true'))]],
    script: 'scripts/check-focus.mjs',
  },
  {
    name: 'a beat index past the end of the lesson',
    edits: [[FOCUS, withFocus(entry(99, PHRASE))]],
    script: 'scripts/check-focus.mjs',
  },
  {
    name: 'a mark on a beat that carries the question',
    edits: [[FOCUS, withFocus(entry(5, PHRASE))]],
    script: 'scripts/check-focus.mjs',
  },
  {
    name: 'a mark long enough to be a paragraph',
    // Fifteen words, a whole sentence of beat 10; the floor is 4 and the ceiling 14.
    edits: [[FOCUS, withFocus(entry(10, 'You already live by answers like these: what’s fair, what’s real and what you owe.'))]],
    script: 'scripts/check-focus.mjs',
  },
  {
    // The phrase is clean; the defect is a NAME inside it, which carries its own mark.
    name: 'a mark laid over a philosopher’s name',
    edits: [[FOCUS, withFocus(entry(4, PHRASE))], [NAMES, withName(`  '${ID}': [['mean', 'plato']],\n`)]],
    script: 'scripts/check-focus.mjs',
  },
  {
    // ON ITS OWN, because the two cases below ALSO make the table stale — an
    // edit to make-names changes what derive() returns — so passing there says
    // nothing about whether rule 1 works. This one touches only the generated
    // file, which is exactly what a forgotten `make:names` looks like.
    name: 'a generated table nobody re-ran make:names for',
    edits: [[NAMES, withName(`  '${ID}': [['Aristotle', 'aristotle']],\n`)]],
    script: 'scripts/check-names.mjs',
    loader: true,
  },
  {
    name: 'COMMON drifting apart from make-mentions',
    edits: [[NAMES_SCRIPT, (s) => s.replace("'james', 'moore'", "'james', 'moore', 'hume'")]],
    script: 'scripts/check-names.mjs',
    loader: true,
  },
  {
    name: 'an override naming a philosopher who does not exist',
    edits: [[NAMES_SCRIPT, (s) => s.replace("['Sen', 'amartya-sen']", "['Sen', 'amartya-senn']")]],
    script: 'scripts/check-names.mjs',
    loader: true,
  },
];

// The directions that must stay silent: the clean fixture, and no maxim at all.
const SILENT = [
  {
    name: 'a clean maxim taken from a dialogue beat',
    edits: [[FOCUS, withFocus(entry(4, PHRASE))]],
    script: 'scripts/check-focus.mjs',
  },
  {
    name: 'a lesson with no maxim at all',
    edits: [],
    script: 'scripts/check-focus.mjs',
  },
];

let bad = 0;
for (const c of [...SILENT.slice(0, 1), ...CASES, ...SILENT.slice(1)]) {
  const silent = SILENT.includes(c);
  const origs = c.edits.map(([f]) => [f, read(f)]);
  let code;
  let moved = true;
  try {
    for (const [f, edit] of c.edits) {
      const before = read(f);
      const next = edit(before);
      if (next === before) { moved = false; break; }
      fs.writeFileSync(f, next);
    }
    if (moved) code = run(c.script, c.loader);
  } finally {
    for (const [f, s] of origs) fs.writeFileSync(f, s);
  }
  if (!moved) { console.log(`  ?? ${c.name}: the edit changed nothing — anchor moved`); bad++; continue; }
  const good = silent ? code === 0 : code !== 0;
  console.log(`  ${good ? 'ok  ' : 'FAIL'} ${c.name} — exit ${code}, wanted ${silent ? '0' : 'non-zero'}`);
  if (!good) bad++;
}

console.log(bad ? `\n${bad} counter-test(s) did not behave` : '\nall counter-tests behaved');
process.exit(bad ? 1 : 0);
