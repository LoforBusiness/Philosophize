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

  // THE FREE DAY. Staged in the component rather than the table, so this one damages
  // its own file and restores it.
  {
    const F = 'components/lesson/cinematic/review/UnitReview.tsx';
    const before = fs.readFileSync(F);
    try {
      fs.writeFileSync(F, `${before.toString('utf8')}
// bumpDailyLessons
`);
      const res = run();
      if (res.red && res.out.includes('FREEDAY')) { pass += 1; console.log('  ok   a review that spends a free day'); } else {
        fail += 1; console.log(`  ✗    a review that spends a free day — ${res.red ? 'red, but not for FREEDAY' : 'stayed silent'}`);
      }
    } finally { fs.writeFileSync(F, before); }
  }

  // THE LOADING SCREEN (AK11). Three ways to lose it, all staged in the route itself:
  // never import it, import it and never mount it, and mount it after the review has
  // already started. The third is the one the order rule exists for.
  {
    const F = 'app/(app)/branches/[branchSlug]/[pathSlug]/review.tsx';
    const before = fs.readFileSync(F);
    const text = before.toString('utf8');
    const LOADER_BLOCK = `  if (loading) {
    return (
      <View style={{ flex: 1 }}>
        <LessonLoader onDone={() => setLoading(false)} />
      </View>
    );
  }

`;
    const loaderStage = (name, damaged) => {
      if (damaged === text) { fail += 1; console.log(`  ✗    ${name} — the damage changed nothing`); return; }
      try {
        fs.writeFileSync(F, damaged);
        const res = run();
        if (res.red && res.out.includes('LOADER')) { pass += 1; console.log(`  ok   ${name}`); } else {
          fail += 1; console.log(`  ✗    ${name} — ${res.red ? 'red, but not for LOADER' : 'stayed silent'}`);
        }
      } finally { fs.writeFileSync(F, before); }
    };
    try {
      loaderStage('a review route that never imports the loader',
        text.replace(/^import LessonLoader from .*$\n/m, ''));
      loaderStage('a loader imported and never mounted',
        text.replace(LOADER_BLOCK, ''));
      // The order: take the block out from in front of the review and put the same
      // mount behind it, so the moment would arrive after the lesson had begun. The
      // anchor is the review's own last prop and NOT its wrapper's closing tag, so
      // that this file never spells the guide host — `check:guide` fails any script
      // that does, and it is right to (a harness that mounts it measures nothing).
      const TAIL = '          onLeave={exitLesson}\n        />\n';
      if (!text.includes(LOADER_BLOCK) || !text.includes(TAIL)) {
        fail += 1; console.log('  ✗    a loader mounted after the review — the block to move is not in the route');
      } else {
        loaderStage('a loader mounted after the review',
          text.replace(LOADER_BLOCK, '').replace(
            TAIL,
            `${TAIL}        <LessonLoader onDone={() => setLoading(false)} />\n`,
          ));
      }
    } finally { fs.writeFileSync(F, before); }
  }

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
