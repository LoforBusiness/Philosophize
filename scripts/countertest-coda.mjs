// U3 FOR THE CLOSING ENCOUNTER: PUT EACH DEFECT BACK AND WATCH check:coda GO RED.
//
//   node scripts/countertest-coda.mjs
//
// Every file is restored in a `finally` and verified byte for byte at the end, and a
// mutation that changed nothing scores as a broken stage rather than a silent check —
// which is how `countertest-stamp` once read a working guard as a blind one.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const FILES = [
  'components/lesson/cinematic/coda/index.ts',
  'scripts/measure-must.mjs',
  'components/lesson/cinematic/aesthetics13Scene.tsx',
  'components/lesson/cinematic/CinematicPlayer.tsx',
];
const SRC = new Map(FILES.map((f) => [f, fs.readFileSync(f)]));

function run() {
  try {
    execFileSync(process.execPath, ['scripts/check-coda.mjs'], { encoding: 'utf8' });
    return { red: false, out: '' };
  } catch (e) { return { red: true, out: `${e.stdout || ''}${e.stderr || ''}` }; }
}

let pass = 0;
let fail = 0;
const stage = (name, want, file, from, to) => {
  const src = SRC.get(file).toString('utf8');
  if (!src.includes(from)) { fail += 1; console.log(`  ✗    ${name} — the text to damage is not in ${file}`); return; }
  const damaged = src.replace(from, to);
  if (damaged === src) { fail += 1; console.log(`  ✗    ${name} — the damage changed nothing`); return; }
  try {
    fs.writeFileSync(file, damaged);
    const res = run();
    const hit = res.red && res.out.includes(want);
    if (hit) { pass += 1; console.log(`  ok   ${name}`); } else {
      fail += 1;
      console.log(`  ✗    ${name} — ${res.red ? `red, but not for ${want}` : 'stayed silent'}`);
    }
  } finally {
    fs.writeFileSync(file, SRC.get(file));
  }
};

console.log('PUTTING THE DEFECTS BACK\n');
try {
  stage('a coda for a lesson id that does not exist', 'LESSON',
    'components/lesson/cinematic/coda/index.ts',
    "'ethics-ethics-23': PondCoda,", "'ethics-ethics-231': PondCoda,");

  stage('a measuring harness that leaves the encounter live', 'HARNESS',
    'scripts/measure-must.mjs', '  setCodaOff(true);\n', '');

  stage('a scene that reaches into coda/', 'SCENE',
    'components/lesson/cinematic/aesthetics13Scene.tsx',
    "import {\n  clamp01,", "import { CODAS } from './coda';\nimport {\n  clamp01,");

  stage('the player no longer gating on the harness switch', 'PLAYER',
    'components/lesson/cinematic/CinematicPlayer.tsx',
    'hasCoda(lesson.id) && !codaOff()', 'hasCoda(lesson.id)');

  // …and the direction that must stay SILENT.
  const clean = run();
  if (!clean.red) { pass += 1; console.log('  ok   the tree as it stands (silent, as it should be)'); } else {
    fail += 1; console.log('  ✗    the tree as it stands — went red and should not have');
  }
} finally {
  for (const [f, buf] of SRC) fs.writeFileSync(f, buf);
}
let restored = true;
for (const [f, buf] of SRC) if (!fs.readFileSync(f).equals(buf)) restored = false;
console.log(`\n${pass} stage(s) behaved, ${fail} did not`);
console.log(restored ? 'every file restored byte for byte.' : 'A FILE WAS NOT RESTORED — check git status.');
process.exit(fail || !restored ? 1 : 0);
