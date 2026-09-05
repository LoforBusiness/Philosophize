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
// no maxim at all is legal and deliberate (24 of them), so removing an entry must
// NOT fail. A checker that cannot tell an absent mark from a broken one would
// force a bad highlight into every lesson, which is the whole thing the floor in
// make-focus exists to prevent.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const FOCUS = 'data/lessonFocus.ts';
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

const CASES = [
  {
    file: FOCUS,
    name: 'a phrase that is not in its beat',
    edit: (s) => s.replace("phrase: 'Science never even tries'", "phrase: 'Science never even tried'"),
    script: 'scripts/check-focus.mjs',
  },
  {
    file: FOCUS,
    name: 'a beat index past the end of the lesson',
    edit: (s) => s.replace("'metaphysics-being-1': { beat: 7", "'metaphysics-being-1': { beat: 99"),
    script: 'scripts/check-focus.mjs',
  },
  {
    file: FOCUS,
    name: 'a mark on a beat that carries the question',
    edit: (s) => s.replace(
      "'aesthetics-aesthetics-3': { beat: 7, phrase: 'music reaches something underneath all the arguing' }",
      "'aesthetics-aesthetics-3': { beat: 6, phrase: 'Tap Aristotle' }"),
    script: 'scripts/check-focus.mjs',
  },
  {
    file: FOCUS,
    name: 'a mark long enough to be a paragraph',
    edit: (s) => s.replace(
      "'metaphysics-being-1': { beat: 7, phrase: 'Science never even tries'",
      "'metaphysics-being-1': { beat: 7, phrase: 'Science never even tries to answer it, and that is not a failure of science but a statement about what kind of question it is'"),
    script: 'scripts/check-focus.mjs',
  },
  {
    file: FOCUS,
    name: 'a mark laid over a philosopher’s name',
    edit: (s) => s.replace(
      "'aesthetics-aesthetics-3': { beat: 7, phrase: 'music reaches something underneath all the arguing' }",
      "'aesthetics-aesthetics-3': { beat: 7, phrase: 'Schopenhauer thought music reaches something underneath' }"),
    script: 'scripts/check-focus.mjs',
  },
  {
    // ON ITS OWN, because the two cases below ALSO make the table stale — an
    // edit to make-names changes what derive() returns — so passing there says
    // nothing about whether rule 1 works. This one touches only the generated
    // file, which is exactly what a forgotten `make:names` looks like.
    file: 'data/lessonNames.ts',
    name: 'a generated table nobody re-ran make:names for',
    edit: (s) => s.replace(/\['Aristotle', 'aristotle'\]/, "['Aristotle', 'plato']"),
    script: 'scripts/check-names.mjs',
    loader: true,
  },
  {
    file: NAMES_SCRIPT,
    name: 'COMMON drifting apart from make-mentions',
    edit: (s) => s.replace("'james', 'moore'", "'james', 'moore', 'hume'"),
    script: 'scripts/check-names.mjs',
    loader: true,
  },
  {
    file: NAMES_SCRIPT,
    name: 'an override naming a philosopher who does not exist',
    edit: (s) => s.replace("['Sen', 'amartya-sen']", "['Sen', 'amartya-senn']"),
    script: 'scripts/check-names.mjs',
    loader: true,
  },
];

// The direction that must stay silent.
const SILENT = [
  {
    file: FOCUS,
    name: 'a lesson with no maxim at all',
    edit: (s) => s.replace(/^ {2}'metaphysics-being-1':.*\n/m, ''),
    script: 'scripts/check-focus.mjs',
  },
];

let bad = 0;
for (const c of [...CASES, ...SILENT]) {
  const silent = SILENT.includes(c);
  const orig = read(c.file);
  let code;
  try {
    const next = c.edit(orig);
    if (next === orig) { console.log(`  ?? ${c.name}: the edit changed nothing — anchor moved`); bad++; continue; }
    fs.writeFileSync(c.file, next);
    code = run(c.script, c.loader);
  } finally {
    fs.writeFileSync(c.file, orig);
  }
  const want = silent ? 0 : 1;
  const good = silent ? code === 0 : code !== 0;
  console.log(`  ${good ? 'ok  ' : 'FAIL'} ${c.name} — exit ${code}, wanted ${silent ? '0' : 'non-zero'}`);
  if (!good) bad++;
}

console.log(bad ? `\n${bad} counter-test(s) did not behave` : '\nall counter-tests behaved');
process.exit(bad ? 1 : 0);
