// U3 FOR THE UNIT REVIEWS: PUT EACH DEFECT BACK AND WATCH check:review GO RED.
//
//   node scripts/countertest-review.mjs
//
// `data/unitReviews.ts` is restored in a `finally` and verified byte for byte, and a
// mutation that changed nothing scores as a broken stage rather than a silent check.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const FILE = 'data/unitReviews.ts';
const SRC = fs.readFileSync(FILE);
const TEXT = SRC.toString('utf8');

function run() {
  try {
    execFileSync(process.execPath, ['scripts/check-review.mjs'], { encoding: 'utf8' });
    return { red: false, out: '' };
  } catch (e) { return { red: true, out: `${e.stdout || ''}${e.stderr || ''}` }; }
}

let pass = 0;
let fail = 0;
const stage = (name, want, from, to) => {
  if (!TEXT.includes(from)) { fail += 1; console.log(`  ✗    ${name} — the text to damage is not in the table`); return; }
  const damaged = TEXT.replace(from, to);
  if (damaged === TEXT) { fail += 1; console.log(`  ✗    ${name} — the damage changed nothing`); return; }
  try {
    fs.writeFileSync(FILE, damaged);
    const res = run();
    const hit = res.red && res.out.includes(want);
    if (hit) { pass += 1; console.log(`  ok   ${name}`); } else {
      fail += 1;
      console.log(`  ✗    ${name} — ${res.red ? `red, but not for ${want}` : 'stayed silent'}`);
    }
  } finally { fs.writeFileSync(FILE, SRC); }
};

console.log('PUTTING THE DEFECTS BACK\n');
try {
  stage('a review for a unit that does not exist', 'UNIT',
    "'ethics-what-is-ethics': {", "'ethics-what-is-ethicss': {");

  stage('a question nobody can get right', 'NOANSWER',
    "{ id: 'outcomes', label: 'outcomes', reads: 'judge it by what happens', correct: true },",
    "{ id: 'outcomes', label: 'outcomes', reads: 'judge it by what happens' },");

  stage('a drag whose knob starts on the answer', 'START',
    "            lo: 'one, consistently',\n            hi: 'all three at once',\n            start: 0.08,",
    "            lo: 'one, consistently',\n            hi: 'all three at once',\n            start: 0.95,");

  stage('a step pointing at a plate that is not there', 'AT',
    "        text: 'Five lessons on what ethics is. It began with a feeling you already had.',\n        upto: 1,\n        at: 0,",
    "        text: 'Five lessons on what ethics is. It began with a feeling you already had.',\n        upto: 1,\n        at: 9,");

  stage('a plate word too wide for its slot', 'WIDE',
    "plates: ['CONSCIENCE', 'OUTCOMES', 'DUTY', 'CHARACTER'],",
    "plates: ['CONSEQUENTIALISM', 'OUTCOMES', 'DUTY', 'CHARACTER'],");

  // A QUESTION TURNED INTO A LINE, which is how a review quietly loses one: the
  // step is still there and still reads, and only the count notices.
  stage('a review with only three questions', 'COUNT',
    "        ask: {\n          prompt: 'How many of the three lenses",
    "        text: {\n          prompt: 'How many of the three lenses");

  // …and the direction that must stay SILENT.
  const clean = run();
  if (!clean.red) { pass += 1; console.log('  ok   the table as it stands (silent, as it should be)'); } else {
    fail += 1; console.log('  ✗    the table as it stands — went red and should not have');
  }
} finally {
  fs.writeFileSync(FILE, SRC);
}
const restored = fs.readFileSync(FILE).equals(SRC);
console.log(`\n${pass} stage(s) behaved, ${fail} did not`);
console.log(restored ? 'the table was restored byte for byte.' : 'THE TABLE WAS NOT RESTORED — check git status.');
process.exit(fail || !restored ? 1 : 0);
