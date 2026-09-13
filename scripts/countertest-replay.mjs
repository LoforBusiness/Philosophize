// COUNTER-TEST FOR check:replay — put each defect back and watch it go red, and
// stage the shapes that must stay silent.
//
//   node scripts/countertest-replay.mjs
//
// A detector is only proven by the defect it was built for, returned (§17, L8). Each
// staging copies a REAL scene into a temp file, changes it, asserts the change took,
// and runs check:replay on that one lesson through REPLAY_SOURCE — so nothing in the
// working tree is touched, and a mutation that silently matched nothing cannot score
// as "the check stayed quiet".
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const REPO = process.cwd();
const CIN = 'components/lesson/cinematic';
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'replay-ct-'));

/** Run check:replay on one lesson, optionally with one scene's source swapped. */
function run(id, scene, text) {
  const env = { ...process.env, REPLAY_ONLY: id };
  delete env.REPLAY_SOURCE;
  if (scene) {
    const file = path.join(TMP, `${scene}-${Math.random().toString(36).slice(2)}.tsx`);
    fs.writeFileSync(file, text);
    env.REPLAY_SOURCE = `${CIN}/${scene}.tsx=${file}`;
  }
  const r = spawnSync(process.execPath, ['scripts/check-replay.mjs'], { cwd: REPO, env, encoding: 'utf8' });
  const out = `${r.stdout}${r.stderr}`;
  const count = (label) => {
    // Only a RESULT line: the report's title names (C20c) too, and reading a number
    // off it gave NaN, which a comparison then quietly failed.
    const line = out.split('\n').find((l) => /^\s+(ok|FAIL)\s/.test(l) && l.includes(label));
    const m = line && line.match(/\)\s+(\d+)/);
    return m ? +m[1] : NaN;
  };
  return {
    out,
    c20c: count('(C20c)'),
    strip: count('no painted box is only as tall'),
    detach: count('no words are left behind'),
    unread: count('every scene could be run') ,
  };
}

/** A real scene with `pairs` replaced; throws if any replacement found nothing. */
function staged(scene, pairs) {
  let text = fs.readFileSync(path.join(REPO, CIN, `${scene}.tsx`), 'utf8');
  for (const [from, to] of pairs) {
    if (!text.includes(from)) throw new Error(`${scene}: the staging text was not found — the scene has changed, update this counter-test\n  ${from.slice(0, 120)}`);
    const next = text.replace(from, to);
    if (next === text) throw new Error(`${scene}: the staging changed nothing`);
    text = next;
  }
  return text;
}

let fail = 0;
const expect = (name, pass, detail) => {
  console.log(`  ${pass ? 'ok  ' : 'FAIL'}  ${name}${detail ? `  ${detail}` : ''}`);
  if (!pass) fail++;
};

console.log('\ncheck:replay counter-test\n');

// ── THE DEFECTS, PUT BACK ─────────────────────────────────────────────────────

{
  // The straw copy's fall, keyed to bt alone: it stands up and falls again every beat.
  const r = run('logic-arguments-9', 'logic9Scene', staged('logic9Scene', [[
    'tip: carry(cv, 4, n, DOWN[p], DOWN[n], FALLS[n] ? ease01(clamp01((bt.value - 1.15) / 0.7)) : arrive),',
    'tip: STRAW[n] === 2 ? ease01(clamp01((bt.value - 1.15) / 0.7)) : 0,',
  ]]));
  expect('a fall keyed to bt alone replays on the beats that hold it (C20c)', r.c20c > 0, `${r.c20c} found`);
}

{
  // The straw copy as two siblings: an empty tag, and a transparent layer of words.
  const r = run('logic-arguments-9', 'logic9Scene', staged('logic9Scene', [
    [
      '<Animated.View style={[styles.tag, styles.strawTag, strawStyle]} pointerEvents="none">\n        <Animated.View style={[styles.tagPlate, plateStyle]} />',
      '<Animated.View style={[styles.tagOld, styles.strawTag, strawStyle]} pointerEvents="none" />\n      <Animated.View style={[styles.tagOld, styles.strawTag, styles.tagBare, strawTextStyle]} pointerEvents="none">',
    ],
    [
      '  const plateStyle = useAnimatedStyle(() => ({ opacity: 1 - SCENE.value.dim * 0.45 }));',
      '  const plateStyle = useAnimatedStyle(() => ({ opacity: 1 - SCENE.value.dim * 0.45 }));\n  const strawTextStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.straw }));',
    ],
    [
      '  smear: { left: SMEAR_L, top: SMEAR_T, width: SMEAR_W },',
      "  tagOld: { position: 'absolute', borderWidth: 1.5, borderColor: SOFT, borderRadius: 3, backgroundColor: STONE, paddingVertical: 5, paddingHorizontal: 6, alignItems: 'center' },\n  tagBare: { borderColor: 'transparent', backgroundColor: 'transparent' },\n  smear: { left: SMEAR_L, top: SMEAR_T, width: SMEAR_W },",
    ],
  ]));
  expect('an empty tag with no height is a strip (S12)', r.strip > 0, `${r.strip} found`);
  expect('words in their own layer stay put while the tag tips (S12)', r.detach > 0, `${r.detach} found`);
}

{
  // A scale factor passed as carry's multiplier compounds on every beat.
  const r = run('epistemology-knowledge-10', 'epistemology10Scene', staged('epistemology10Scene', [[
    'SC_L + SC_W * carry(cv, 2, n, NEEDLE[p], reacting ? dragPos.value : NEEDLE[n], ease01(clamp01(bt.value / 1.4)))',
    'SC_L + carry(cv, 2, n, NEEDLE[p], reacting ? dragPos.value : NEEDLE[n], ease01(clamp01(bt.value / 1.4)), SC_W)',
  ]]));
  expect('a width passed as the carry multiplier compounds every beat (C20c)', r.c20c > 0, `${r.c20c} found`);
}

{
  // An arrival that bypasses the carry, so the beat after runs the train again.
  const r = run('aesthetics-aesthetics-35', 'aesthetics35Scene', staged('aesthetics35Scene', [[
    'carry(cv, 0, n, RUN[p], RUN[n], RUN[n] > 0 && RUN[p] === 0 ? ease01((bt.value - 0.2) / 1.3) : tr)',
    'RUN[n] > 0 && RUN[p] === 0 ? ease01((bt.value - 0.2) / 1.3) : carry(cv, 0, n, RUN[p], RUN[n], tr)',
  ]]));
  expect('an arrival that bypasses the carry replays on the next beat (C20c)', r.c20c > 0, `${r.c20c} found`);
}

// ── THE SHAPES THAT MUST STAY SILENT ─────────────────────────────────────────

{
  const r = run('logic-arguments-9');
  expect('the fixed lesson is clean', r.c20c === 0 && r.strip === 0 && r.detach === 0,
    `C20c ${r.c20c}, strip ${r.strip}, detach ${r.detach}`);
}
{
  // epistemology-knowledge-1's stamp strikes again on beats whose script says RESTAMP.
  const r = run('epistemology-knowledge-1');
  expect('an authored strike keyed to a channel that changed is not a replay', r.c20c === 0, `C20c ${r.c20c}`);
}
{
  // ethics-ethics-7 spins a wheel several degrees a frame straight through every tap.
  const r = run('ethics-ethics-7');
  expect('a wheel turning at speed through a beat change is not a jump', r.c20c === 0, `C20c ${r.c20c}`);
}
{
  // political-political-4's cards wipe an ink fill in under their words.
  const r = run('political-political-4');
  expect('a fill that wipes in under its words is not detached', r.detach === 0, `detach ${r.detach}`);
}
{
  // metaphysics-being-32 draws an orb carrying its own letter beside a second orb.
  const r = run('metaphysics-being-32');
  expect('an orb carrying its own letter is not detached', r.detach === 0, `detach ${r.detach}`);
}

fs.rmSync(TMP, { recursive: true, force: true });
console.log(fail ? `\n${fail} staging(s) not caught or not silent.\n` : '\ncheck:replay fails on every staged defect, and on none of the designs.\n');
process.exit(fail ? 1 : 0);
