// PUTS THE CLEAR-LECTURE DEFECTS BACK AND REQUIRES THE CHECKS TO NAME THEM.
//
//   node scripts/countertest-voice.mjs
//
// `check:voice` gained V3 (say the literal thing) and V7 (narration does not instruct
// the eye), and `check:answers` gained R17 (a poll shows nothing of its answer before
// the pick), all on 13 Sep 2026 (LESSON_RULES group V, R17). A check that has never
// failed has not been shown to look (U3).
//
// Each case edits one file in place, runs the check, and restores the file byte for
// byte. It compares the relevant count with an untouched run rather than with zero,
// so it proves the detector whatever the corpus holds at the time, and it asserts the
// mutation really changed the file. Two cases must stay SILENT: a literal use of a
// phrase that is sometimes an idiom, and a word that merely begins like an
// instruction. Run it when nothing else is editing the scripts.
import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const CIN = path.join('components', 'lesson', 'cinematic');
const run = (script) => {
  const r = spawnSync(process.execPath, [path.join('scripts', script)], { encoding: 'utf8' });
  return `${r.stdout ?? ''}${r.stderr ?? ''}`;
};
const num = (out, re) => { const m = out.match(re); return m ? Number(m[1]) : NaN; };
const v3 = (out) => num(out, /V3\s+(\d+) colloquial/);
const v7 = (out) => num(out, /V7\s+(\d+) narration sentence/);
const unheld = (out) => {
  const m = out.match(/(\d+) of \d+ poll options name nobody/);
  if (m) return Number(m[1]);
  return out.includes('every poll option names who holds it') ? 0 : NaN;
};

let bad = 0;
const say = (ok, msg) => { if (!ok) bad += 1; console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${msg}`); };

/** Edit `file`, run `script`, restore; return the output, or null when the mutation matched nothing. */
function mutate(file, change, script) {
  const full = path.join(CIN, file);
  const original = readFileSync(full, 'utf8');
  const next = change(original);
  if (next === original) return null;
  let out;
  try { writeFileSync(full, next); out = run(script); } finally { writeFileSync(full, original); }
  if (readFileSync(full, 'utf8') !== original) throw new Error(`${file} did not restore; stop and check it`);
  return out;
}

const firstText = (prefix) => (s) => s.replace(/\n {4}text: '/, `\n    text: '${prefix}`);

console.log('\nCOUNTER-TEST · check:voice V3 and V7, check:answers R17\n');
const baseVoice = run('check-voice.mjs');
const baseAnswers = run('check-answers.mjs');
const B3 = v3(baseVoice), B7 = v7(baseVoice), BU = unheld(baseAnswers);
if ([B3, B7, BU].some(Number.isNaN)) {
  say(false, `could not read the baseline counts (V3 ${B3}, V7 ${B7}, unheld ${BU})`);
  process.exit(1);
}
console.log(`  baseline  V3 ${B3} · V7 ${B7} · unheld poll options ${BU}\n`);

const cases = [
  {
    name: 'V3 names a colloquial phrase in narration',
    file: 'political7Script.ts', script: 'check-voice.mjs',
    change: firstText('Brace yourself. '),
    judge: (out) => v3(out) === B3 + 1 && /brace yourself/i.test(out),
  },
  {
    name: 'V3 reads a summary point too',
    file: 'political7Script.ts', script: 'check-voice.mjs',
    change: (s) => s.replace(/points: \[\n(\s+)'/, (m, sp) => `points: [\n${sp}'Game over for the theory', '`),
    judge: (out) => v3(out) === B3 + 1 && /game over/i.test(out),
  },
  {
    name: 'V3 stays silent on a literal "in the room"',
    file: 'political7Script.ts', script: 'check-voice.mjs',
    change: firstText('The man in the room follows the rules. '),
    judge: (out) => v3(out) === B3,
  },
  {
    name: 'V7 names narration that tells the eye where to look',
    file: 'political7Script.ts', script: 'check-voice.mjs',
    change: firstText('Watch the bar. '),
    judge: (out) => v7(out) === B7 + 1 && /Watch the bar/.test(out),
  },
  {
    name: 'V7 stays silent on a word that only begins like an instruction',
    file: 'political7Script.ts', script: 'check-voice.mjs',
    change: firstText('Watching a sunset is not wanting it. '),
    judge: (out) => v7(out) === B7,
  },
  {
    name: 'R17 catches a ballot that renders holders before the answer',
    file: 'PollBallot.tsx', script: 'check-answers.mjs',
    change: (s) => s.replace('answered && holders.length', 'holders.length'),
    judge: (out) => out.includes('no longer gates its holder lines'),
  },
  {
    name: 'R17 counts a poll option that names nobody',
    file: 'logic27Script.ts', script: 'check-answers.mjs',
    change: (s) => s.replace(/,\s*holders:\s*\[[^\]]*\]/, ''),
    judge: (out) => unheld(out) === BU + 1,
  },
];

for (const c of cases) {
  const out = mutate(c.file, c.change, c.script);
  if (out === null) { say(false, `${c.name} — the mutation matched nothing, so it proves nothing`); continue; }
  say(c.judge(out), c.name);
}

const endVoice = run('check-voice.mjs');
const endAnswers = run('check-answers.mjs');
say(v3(endVoice) === B3 && v7(endVoice) === B7 && unheld(endAnswers) === BU, 'the restored tree reads exactly as it did');
console.log(bad ? `\n${bad} failing.\n` : '\nevery defect is named, both silent cases stay silent, and the tree is restored.\n');
process.exit(bad ? 1 : 0);
