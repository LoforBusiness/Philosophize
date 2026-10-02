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
//
// THE SCENE IS A DIALOGUE LESSON NOW, econ1 (`economics-foundations-1`). Until
// 2026-10-02 the stagings lived in the narrated lessons where each defect was first
// found — logic9's straw tag, epistemology10's needle, aesthetics35's train — and those
// lessons were deleted. The C20c three are staged on econ1's own tracks — the A-board
// (`board`) and the book changing hands (`bookT`) — and the S12 pair on a staged tag
// dropped into its stage. The
// narrated library's two design-shaped silences that have no analogue in a dialogue
// scene — a stamp re-struck on a RESTAMP beat, and a wheel spinning through every tap
// — went with it; the fill that wipes in and the orb that carries its own letter are
// staged here instead.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const REPO = process.cwd();
const CIN = 'components/lesson/cinematic';
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'replay-ct-'));
const ID = 'economics-foundations-1';
const SCENE = 'econ1Scene';

/** Run check:replay on one lesson (all of them when `id` is null), optionally with one scene's source swapped. */
function run(id, scene, text) {
  const env = { ...process.env };
  delete env.REPLAY_SOURCE;
  delete env.REPLAY_ONLY;
  if (id) env.REPLAY_ONLY = id;
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
    code: r.status,
    c20c: count('(C20c)'),
    strip: count('no painted box is only as tall'),
    detach: count('no words are left behind'),
    unread: count('every scene could be run'),
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

const BOARD = 'board: carry(cv, 8, n, BOARD_V[p], BOARD_V[n], tr),';
const BOOK = 'bookT: carry(cv, 5, n, bookNow, bookNow, tr),';

/**
 * A tag dropped onto econ1's stage: a painted PLATE and, as its sibling at the same
 * left and top, a LAYER that carries the words. `plate` is the plate's animated style
 * and `layerPaints` whether the words layer paints itself.
 */
function tag(plate, { layerPaints = false } = {}) {
  return staged(SCENE, [
    ['  const DP = useDerivedValue<Bundle>(() => SCENE.value.pl);',
      `  const ctPlate = useAnimatedStyle(() => (${plate}));\n  const DP = useDerivedValue<Bundle>(() => SCENE.value.pl);`],
    ['      <Board S={SCENE} />',
      `      <Board S={SCENE} />\n      <Animated.View style={[styles.ctPlate, ctPlate]} />\n      <View style={${layerPaints ? '[styles.ctLayer, styles.ctPlate]' : 'styles.ctLayer'}}><Text>THE NEW PRICE</Text></View>`],
    ['  ground: { position: \'absolute\', left: 8, right: 8, top: GROUND, height: 1.5, backgroundColor: RULE },',
      "  ground: { position: 'absolute', left: 8, right: 8, top: GROUND, height: 1.5, backgroundColor: RULE },\n"
      + "  ctPlate: { position: 'absolute', left: 230, top: 330, width: 90, height: 24, backgroundColor: RULE },\n"
      + "  ctLayer: { position: 'absolute', left: 230, top: 330, width: 90, height: 24 },"],
  ]);
}

console.log('\ncheck:replay counter-test\n');

// ── THE DEFECTS, PUT BACK ─────────────────────────────────────────────────────

{
  // The new price keyed to the transition alone: it is chalked up again on the beat
  // that only holds it.
  const r = run(ID, SCENE, staged(SCENE, [[BOARD,
    'board: BOARD_V[n] === 2 ? 1 + ease01(clamp01(tr)) : BOARD_V[n],']]));
  expect('a change keyed to the transition alone replays on the beat that holds it (C20c)', r.c20c > 0, `${r.c20c} found`);
}

{
  // A scale factor passed as carry's multiplier compounds on every beat. The book's
  // track (0 on the counter · 1 the stall-holder's hand · 2 the shopper's) holds 2 from
  // the trade on, and past 1 it extrapolates, so a doubled start is a book thrown along
  // the line of his arms. The board saturates at 2 and could not show it.
  const r = run(ID, SCENE, staged(SCENE, [[BOOK,
    'bookT: carry(cv, 5, n, bookNow / 2, bookNow / 2, tr, 2),']]));
  expect('a factor passed as the carry multiplier compounds every beat (C20c)', r.c20c > 0, `${r.c20c} found`);
}

{
  // An arrival that bypasses the carry, so the beat after it starts from a stale slot:
  // the trade hands the book over outside the carry, and the next beat snaps it back.
  const r = run(ID, SCENE, staged(SCENE, [[BOOK,
    'bookT: A_BUY[n] ? bookNow : carry(cv, 5, n, bookNow, bookNow, tr),']]));
  expect('an arrival that bypasses the carry replays on the next beat (C20c)', r.c20c > 0, `${r.c20c} found`);
}

{
  // A painted tag with nothing giving it a height: only its padding.
  const r = run(ID, SCENE, staged(SCENE, [
    ['      <Board S={SCENE} />', '      <Board S={SCENE} />\n      <View style={styles.ctStrip} />'],
    ['  ground: { position: \'absolute\', left: 8, right: 8, top: GROUND, height: 1.5, backgroundColor: RULE },',
      "  ground: { position: 'absolute', left: 8, right: 8, top: GROUND, height: 1.5, backgroundColor: RULE },\n"
      + "  ctStrip: { position: 'absolute', left: 230, top: 330, width: 90, paddingVertical: 5, backgroundColor: RULE },"],
  ]));
  expect('an empty tag with no height is a strip (S12)', r.strip > 0, `${r.strip} found`);
}

{
  // The plate tips with the board while the words ride in their own still layer.
  const r = run(ID, SCENE, tag('{ transform: [{ rotate: `${S.value.board * 20}deg` }] }'.replace('S.value', 'SCENE.value')));
  expect('words in their own layer stay put while the tag tips (S12)', r.detach > 0, `${r.detach} found`);
}

// ── THE SHAPES THAT MUST STAY SILENT ─────────────────────────────────────────

{
  const r = run(ID);
  expect('the lesson as it is, is clean', r.c20c === 0 && r.strip === 0 && r.detach === 0,
    `C20c ${r.c20c}, strip ${r.strip}, detach ${r.detach}`);
}
{
  const r = run(null);
  expect('every dialogue lesson is clean', r.code === 0 && r.c20c === 0 && r.strip === 0 && r.detach === 0,
    `C20c ${r.c20c}, strip ${r.strip}, detach ${r.detach}`);
}
{
  // A fill that WIPES in under its words — a scaleX from the edge — is a stamped card.
  const r = run(ID, SCENE, tag('{ transform: [{ scaleX: SCENE.value.board / 2 }] }'));
  expect('a fill that wipes in under its words is not detached', r.detach === 0, `detach ${r.detach}`);
}
{
  // A layer that paints itself carries its own words: one object, however it moves.
  const r = run(ID, SCENE, tag('{ transform: [{ rotate: `${SCENE.value.board * 20}deg` }] }', { layerPaints: true }));
  expect('a plate carrying its own words is not detached', r.detach === 0, `detach ${r.detach}`);
}

fs.rmSync(TMP, { recursive: true, force: true });
console.log(fail ? `\n${fail} staging(s) not caught or not silent.\n` : '\ncheck:replay fails on every staged defect, and on none of the designs.\n');
process.exit(fail ? 1 : 0);
