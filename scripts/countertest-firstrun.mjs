// Put each first-run defect back, and watch the rule that owns it go red.
//
//   node scripts/countertest-firstrun.mjs
//
// A checker that has never failed is a checker nobody has tested. This one
// guards the single code path every cold start takes, where the failure mode is
// an app that does not open — so "it printed all green once" is not evidence.
//
// EVERY FIRST-RUN DEFECT IS STAGED ON A COPY. `check-firstrun` takes its source
// from FIRSTRUN_SRC, so the damaged file lives in a scratch directory and the
// working tree is never edited — no window in which an interrupted run leaves
// the repo broken, which is the one real cost of the damage-and-restore pattern
// used elsewhere in this repo. The splash stage is the exception and says so.
//
// And the direction that must stay SILENT is staged too: the tree as it stands
// has to come back green, or every red above it means nothing.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const REPO = process.cwd();
const SRC = 'lib/updates/firstRun.ts';
const ART = 'components/launch/launchArt.ts';
const ORIGINAL = fs.readFileSync(path.join(REPO, SRC), 'utf8');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ct-firstrun-'));
const copy = path.join(tmp, 'firstRun.ts');

let passed = 0;
let failed = 0;

const run = (script, env = {}) => {
  const r = spawnSync(process.execPath, [script], {
    cwd: REPO,
    env: { ...process.env, ...env },
    encoding: 'utf8',
  });
  return { red: r.status !== 0, out: (r.stdout || '') + (r.stderr || '') };
};

/** Did the rule carrying this label actually fail, rather than something else? */
const failedOn = (out, label) =>
  out.split('\n').some((l) => l.includes('FAIL') && l.includes(label));

/**
 * Damage the copy, run the checker against it, and require the NAMED rule to be
 * the one that goes red. A stage that goes red for some other reason proves
 * nothing — that is how a counter-test convinces you a rule works when it does
 * not (see countertest-guide, where all five staged defects failed for one
 * shared reason and the suite looked healthy).
 */
const stage = (name, edits, label) => {
  let src = ORIGINAL;
  for (const [from, to] of edits) {
    if (!src.includes(from)) {
      console.log(`  x   ${name} — the text to damage is not there any more`);
      failed++;
      return;
    }
    src = src.replace(from, to);
  }
  // A mutation that changed nothing scores as "unchanged" and reads as the rule
  // being blind. Assert the damage landed before believing the result.
  if (src === ORIGINAL) {
    console.log(`  x   ${name} — the mutation changed nothing`);
    failed++;
    return;
  }
  fs.writeFileSync(copy, src);
  const { red, out } = run('scripts/check-firstrun.mjs', { FIRSTRUN_SRC: copy });
  if (red && failedOn(out, label)) {
    console.log(`  ok  ${name}`);
    passed++;
  } else {
    console.log(`  x   ${name} — ${red ? 'red, but not on "' + label + '"' : 'STAYED SILENT'}`);
    failed++;
  }
};

console.log('PUTTING THE FIRST-RUN DEFECTS BACK\n');

// 1 — the whole point: no deadline on the restart. This is the shipped bug.
stage('the restart has no deadline again',
  [["    if (!env.mayRestart()) return 'too-late';\n", '']],
  'it does not restart on top of the reader');

// 2 — the guard exists but is asked before the download, which is where the
//     time goes. It looks correct from either side and is not.
stage('the deadline is read before the download',
  [
    ["    if (!env.mayRestart()) return 'too-late';\n", ''],
    ['    const fetched = await env.fetchUpdate();',
      "    if (!env.mayRestart()) return 'too-late';\n    const fetched = await env.fetchUpdate();"],
  ],
  'a fetch that starts in time and ends late does not restart');

// 3 — the easy half to leave out: the marker is written even when we do not
//     restart, so the NEXT launch skips its animation for nothing.
stage('the marker is written before the deadline is read',
  [
    ["    if (!env.mayRestart()) return 'too-late';\n", ''],
    ["    await env.setItem(RELOADED_KEY, '1');",
      "    await env.setItem(RELOADED_KEY, '1');\n    if (!env.mayRestart()) return 'too-late';"],
  ],
  'and it leaves no marker claiming it did');

// 4 — the options are declared and never handed over. Nothing on screen would
//     say so: it simply falls back to a stock white page with a blue spinner.
stage('reloadAsync is called bare again',
  [['reloadAsync({ reloadScreenOptions: RELOAD_SCREEN })', 'reloadAsync()']],
  'the hook passes the reload screen to reloadAsync');

// 5 — the deadline wired to the flag a cleanup can clear.
stage('the deadline goes back to the flag',
  [['mayRestart: () => Date.now() < deadline', 'mayRestart: () => !done']],
  'the deadline is a wall clock');

// 6 — expo-updates' own iOS blue, which is what it does if nobody chooses.
stage('the spinner goes back to iOS blue',
  [['color: INK', "color: '#007aff'"]],
  'is not expo-updates');

// 7 — a third constant for the reload ground, so it drifts from the splash.
stage('the reload ground becomes its own constant',
  [['backgroundColor: SPLASH_BG', "backgroundColor: '#E4E4DF'"]],
  'it is the colour the app starts on');

// 8 — the loop guard spends its attempt after the work, so a crash halfway
//     leaves the attempt unspent and the next launch tries again. For ever.
stage('the attempt is spent after the work',
  [
    ["    // Written BEFORE the work, so a crash mid-sequence still spends the attempt.\n    await env.setItem(TRIED_KEY, '1');\n", ''],
    ['    const check = await env.checkForUpdate();',
      "    const check = await env.checkForUpdate();\n    await env.setItem(TRIED_KEY, '1');"],
  ],
  'and the marker was already written');

// ── the splash pair, which lives in two files and only one can be updated ────
//
// THIS ONE DAMAGES THE WORKING TREE, because check-launch reads launchArt.ts by
// name. It is restored in a finally and verified byte for byte below.
{
  const artPath = path.join(REPO, ART);
  const artOriginal = fs.readFileSync(artPath, 'utf8');
  try {
    const damaged = artOriginal.replace("export const SPLASH_BG = '#FFFFFF';", "export const SPLASH_BG = '#E4E4DF';");
    if (damaged === artOriginal) {
      console.log('  x   the splash drifts from the page — the text to damage is not there');
      failed++;
    } else {
      fs.writeFileSync(artPath, damaged);
      const { red, out } = run('scripts/check-launch.mjs');
      if (red && failedOn(out, 'splash → page is no step at all')) {
        console.log('  ok  the splash drifts from the page');
        passed++;
      } else {
        console.log(`  x   the splash drifts from the page — ${red ? 'red elsewhere' : 'STAYED SILENT'}`);
        failed++;
      }
    }
  } finally {
    fs.writeFileSync(artPath, artOriginal);
  }
  const restored = fs.readFileSync(artPath, 'utf8') === artOriginal;
  console.log(restored ? '  ok  launchArt.ts restored byte for byte' : '  x   launchArt.ts NOT RESTORED');
  restored ? passed++ : failed++;
}

// ── and the direction that must stay silent ──────────────────────────────────
{
  const a = run('scripts/check-firstrun.mjs');
  const b = run('scripts/check-launch.mjs');
  if (!a.red && !b.red) {
    console.log('  ok  the tree as it stands (silent, as it should be)');
    passed++;
  } else {
    console.log(`  x   the tree as it stands went red — firstrun:${a.red} launch:${b.red}`);
    failed++;
  }
}

fs.rmSync(tmp, { recursive: true, force: true });
const clean = fs.readFileSync(path.join(REPO, SRC), 'utf8') === ORIGINAL;
console.log(`\n${passed} behaved, ${failed} did not`);
console.log(clean ? `${SRC} never edited.` : `${SRC} CHANGED — check git status.`);
process.exit(failed === 0 && clean ? 0 : 1);
