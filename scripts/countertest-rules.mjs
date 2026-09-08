// U3 — PUT EACH DEFECT BACK AND WATCH IT GO RED, THEN TAKE IT OUT AND WATCH IT
// GO GREEN. Both directions, every time.
//
//   node scripts/countertest-rules.mjs
//
// `check:rules` is the checker for the file that says a rule without a checker is
// a wish, so it had better not be one of the five detectors this repo has caught
// being wrong rather than the code. Two of its own rules were already miscalibrated
// on the first run and are staged below as the cases that must stay SILENT:
// citations into Part 1 (which heads its rules in bold, not as markdown headings)
// and a screen string in capitals that is not a constant at all.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname).replace(/^\//, ''), '..');
const SRC = path.join(ROOT, 'docs/LESSON_RULES.md');
const tmp = path.join(os.tmpdir(), 'philosophize-rules-ct');
fs.mkdirSync(tmp, { recursive: true });
const base = fs.readFileSync(SRC, 'utf8');

function run(text) {
  const f = path.join(tmp, 'RULES.md');
  fs.writeFileSync(f, text);
  try {
    execFileSync('node', ['scripts/check-rules.mjs'], {
      cwd: ROOT, encoding: 'utf8', env: { ...process.env, RULES_FILE: path.relative(ROOT, f).split(path.sep).join('/') },
    });
    return { red: false, out: '' };
  } catch (e) { return { red: true, out: (e.stdout || '') + (e.stderr || '') }; }
}

let bad = 0;
const expect = (name, want, got, detail) => {
  const okay = want === got.red;
  if (!okay) bad += 1;
  console.log(`  ${okay ? 'ok  ' : 'FAIL'}  ${name} — ${want ? 'must go red' : 'must stay silent'}${detail && !okay ? `\n         ${detail}` : ''}`);
};

console.log('\nCOUNTER-TESTING check:rules\n');

// The file as it stands must be clean, or nothing below means anything.
expect('the rule book as it is', false, run(base));

// ── 1 · two rules at one address (U4) ───────────────────────────────────────
expect('a duplicated rule id', true,
  run(base.replace('## K17 · A station', '## K13 · A station')));

// A RESTATEMENT MUST STAY SILENT: Part 1 names a rule in bold and a later section
// gives it a full treatment. Six of those exist and the first draft called them
// all collisions.
//
// Staged on a rule that is a HEADING ONLY. H58 is already written in both forms,
// so a third copy of it is a genuine bold-on-bold duplicate — the first version of
// this test staged the wrong defect and read the checker's correct answer as a
// failure.
expect('Part 1 restating a rule that has its own section later', false,
  run(`${base}\n\n**AB9. Twice a lesson, not every time the reader taps.** Restated.\n`));

// ── 2 · a check nobody can run ──────────────────────────────────────────────
expect('a cited command that is not in package.json', true,
  run(`${base}\n\n\`npm run check:nothing\` holds it.\n`));

// ── 3 · a script path that has been renamed away ────────────────────────────
expect('a cited script path that does not exist', true,
  run(`${base}\n\nRun \`node scripts/check-that-went-away.mjs\` first.\n`));

// ── 4 · a citation into a group that was never written ──────────────────────
expect('a citation into a group that does not exist', true,
  run(`${base}\n\nThe camera holds it (ZZ9), which is where this belongs.\n`));

// AND CITATIONS INTO PART 1 MUST STAY SILENT — the miscalibration that reported
// thirty broken addresses, because groups A–H head their rules in bold.
expect('a citation into Part 1, which heads its rules in bold', false,
  run(`${base}\n\nThe picture must do what the text says (A1), and the arm stays straight (B11b).\n`));

// ── 5 · a budget that has been renamed out of the code ──────────────────────
//
// BUILT AT RUNTIME, NEVER WRITTEN OUT. `check:rules` scans `scripts/` for the
// constants the rule book names — and this file is in `scripts/`, so staging the
// literal here puts it into the very corpus the checker searches, and the defect
// passes. **A counter-test that lives inside the thing it is testing has to keep
// its staged tokens out of its own source.**
const GONE = ['GONE', 'BUDGET'].join('_');
expect('a named budget that is not in the code', true,
  run(`${base}\n\nThe ratchet is \`${GONE}\`, and it may only fall.\n`));

// AND A SCREEN STRING IN CAPITALS IS NOT A CONSTANT — the other miscalibration.
expect('a quoted screen string in capitals', false,
  run(`${base}\n\nThe probe kept reporting \`PHILOSOPHERS\` from the reward modal.\n`));

// ── 6 · a costume the wardrobe no longer has ────────────────────────────────
//
// Staged on the WARDROBE rather than on the rules: the rule book cites costumes by
// their real ids, so the defect this guards against is one being renamed or cut
// out from under a rule that names it. The first version dropped an invented name
// into the rules instead, which the checker correctly ignored — it only knows the
// ten ids that exist — so the test proved nothing in either direction.
const wardPath = path.join(tmp, 'wardrobe.ts');
fs.writeFileSync(wardPath, fs.readFileSync(path.join(ROOT, 'components/lesson/cinematic/wardrobe.ts'), 'utf8')
  .replace("{ id: 'dandy', label:", `{ id: '${['band', 'it'].join('')}', label:`));
const wardRel = path.relative(ROOT, wardPath).split(path.sep).join('/');
{
  const before = process.env.WARDROBE_FILE;
  process.env.WARDROBE_FILE = wardRel;
  expect('a costume renamed out of the wardrobe while a rule still names it', true, run(base));
  if (before === undefined) delete process.env.WARDROBE_FILE; else process.env.WARDROBE_FILE = before;
}

// ── 7 · a checklist threshold that has drifted from its checker ─────────────
expect('a checklist threshold that no longer matches the checker', true,
  run(base.replace('reading ease 60 or better', 'reading ease 55 or better')));

console.log(bad ? `\n${bad} counter-test(s) failed — the checker is not trustworthy yet.\n`
  : '\nevery defect goes red, and every legitimate shape stays silent.\n');
process.exit(bad ? 1 : 0);
