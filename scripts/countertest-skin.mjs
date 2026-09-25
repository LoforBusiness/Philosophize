// COUNTER-TEST THE DEPTH KIT'S SHADOW RULES.
//
//   node scripts/countertest-skin.mjs
//
// Put each defect back and watch `check:skin` name it -- including the one
// direction that must stay SILENT, a clean kit. It stages every mutation on a
// COPY and points the checker at it through SKIN_SRC, so the working tree is
// never edited: another session is usually building in it, and a counter-test
// that mutates and reverts leaves a window in which their build takes the defect
// (group AL).
//
// A counter-test must assert its own mutation changed the file, or a no-op scores
// as "unchanged" and reads as the checker being blind.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const SRC = 'components/lesson/cinematic/stageSkin.ts';
const clean = fs.readFileSync(SRC, 'utf8');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'ph-ct-pill-'));
const COPY = path.join(TMP, 'stageSkin.ts');

const CASES = [
  ['clean', (s) => s, false],
  ['the old 34-wide capsule', (s) => s.replace('const w = 26 * k', 'const w = 34 * k'), true],
  ['a transparent box (a hollow ring)', (s) =>
    s.replace(/backgroundColor: `rgba\(26, 26, 26, \$\{PILL_ALPHA \/ 2\}\)`/, "backgroundColor: 'transparent'"), true],
  ['a fill EQUAL to the halo (a visible step)', (s) =>
    s.replace('${PILL_ALPHA / 2}', '${PILL_ALPHA}'), true],
  ['no blur at all -- a hard band again', (s) =>
    s.replace('0px 0px ${7 * k}px', '0px 0px 0px'), true],
  ['back across the ground line', (s) =>
    s.replace('top: -h / 2 + 1.5 * k', 'top: -h / 2'), true],
];

let bad = 0;
for (const [name, mutate, shouldFail] of CASES) {
  const src = mutate(clean);
  if (shouldFail && src === clean) {
    console.log(`  BROKEN STAGE  ${name} -- the mutation matched nothing`);
    bad += 1;
    continue;
  }
  fs.writeFileSync(COPY, src);
  let failed = false;
  let out = '';
  try {
    out = execFileSync('node', ['scripts/check-skin.mjs'], {
      encoding: 'utf8', env: { ...process.env, SKIN_SRC: COPY },
    });
  } catch (e) {
    failed = true;
    out = String(e.stdout || '') + String(e.stderr || '');
  }
  const ok = failed === shouldFail;
  if (!ok) bad += 1;
  const why = (out.match(/^\s*FAIL.*$/gm) || []).map((l) => l.trim()).slice(0, 2).join(' | ');
  console.log(`  ${ok ? 'ok  ' : 'BAD '} ${name.padEnd(42)} ${failed ? 'caught' : 'silent'}${why ? '   ' + why : ''}`);
}
fs.rmSync(TMP, { recursive: true, force: true });
console.log(bad ? `\n${bad} case(s) wrong` : '\nall six behaved.');
process.exit(bad ? 1 : 0);
