// U3 FOR T7 AND L9: PUT EACH DEFECT BACK AND WATCH THE CHECK GO RED ON ITS OWN RULE,
// AND STAGE A CLEAN SCENE AND WATCH IT STAY SILENT.
//
//   node scripts/countertest-depth.mjs
//
// T7 lives in check-shade (every toned plate stands on its shaded lip) and L9 in
// check-smooth (one held value per figure, blended in by the transition). Both take
// one staged scene through an environment variable, so nothing is written into the
// real scene directory — Metro watches it, and so may another session.
//
// Every stage asserts its damage changed the text: a mutation that matched nothing
// scores as silent, and reads exactly like a blind checker (countertest-stamp).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const REPO = process.cwd();
const CIN = path.join(REPO, 'components/lesson/cinematic');
const tmp = path.join(os.tmpdir(), 'philosophize-depth-ct.tsx');

function run(script, env) {
  try {
    return { red: false, out: execFileSync(process.execPath, [script], { cwd: REPO, encoding: 'utf8', env: { ...process.env, ...env } }) };
  } catch (e) {
    return { red: true, out: `${e.stdout || ''}${e.stderr || ''}` };
  }
}

let failed = 0;
function stage(name, script, envKey, src, rule, wantRed) {
  fs.writeFileSync(tmp, src);
  const got = run(script, { [envKey]: tmp });
  const lines = got.out.split('\n');
  const hit = lines.some((l) => /FAIL/.test(l) && l.includes(rule));
  const ok = wantRed ? hit : !hit;
  if (!ok) failed += 1;
  console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${name}${ok ? '' : `  (wanted ${wantRed ? 'a red' : 'silence'} on "${rule}")`}`);
}
const damage = (src, a, b) => {
  const out = src.replace(a, b);
  if (out === src) throw new Error(`the damage matched nothing: ${String(a).slice(0, 60)}`);
  return out;
};

console.log('\nCOUNTER-TESTING T7 AND L9\n');

// ── T7 ──────────────────────────────────────────────────────────────────────
// NO DIALOGUE SCENE DESTRUCTURES A STONE TONE (they take `const TONE = stageTone(…)`
// and paint real colours, AR1), so T7 has nothing live to stand on and its shape is
// staged from a minimal synthetic scene: one STONE plate, lipped. It was
// political11Scene.tsx until that lesson was deleted with the narrated library.
const plate = [
  "const { RULE, STONE, SHADE } = stageTone('economics');",
  'const LIP = `0px 3px 0px ${SHADE}`;',
  'const styles = StyleSheet.create({',
  "  plate: { position: 'absolute', left: 40, top: 300, width: 120, height: 40, backgroundColor: STONE, boxShadow: LIP },",
  '});',
  '',
].join('\n');
stage('a lipped scene stays silent', 'scripts/check-shade.mjs', 'SHADE_EXTRA', plate, 'shaded lip', false);
stage('a toned plate without its lip goes red', 'scripts/check-shade.mjs', 'SHADE_EXTRA',
  damage(plate, /, boxShadow: LIP/, ''), 'STONE plate(s) without a lip', true);

// ── L9 ──────────────────────────────────────────────────────────────────────
// A dialogue scene: econ1 poses three people, each with its own held value blended
// in by the transition. It was politicalScene.tsx's four brawlers until that lesson
// was deleted with the narrated library (2026-10-02).
const one = fs.readFileSync(path.join(CIN, 'econ1Scene.tsx'), 'utf8');
stage('three figures with three held values stay silent', 'scripts/check-smooth.mjs', 'SMOOTH_EXTRA', one, '(L9)', false);
stage('two figures sharing one held value go red', 'scripts/check-smooth.mjs', 'SMOOTH_EXTRA',
  damage(damage(one, 'const prevTh = carryFrom(heldTh, n,', 'const prevTh = carryFrom(heldPl, n,'),
    'const figTh = keepHeld(heldTh,', 'const figTh = keepHeld(heldPl,'), '(L9)', true);
stage('a held pose weighted by something else goes red', 'scripts/check-smooth.mjs', 'SMOOTH_EXTRA',
  damage(damage(one, 'const prevPl = carryFrom(heldPl, n, hHold(PL_P[p], t));\n', ''),
    'const figPl = keepHeld(heldPl, wp.walking ? mixKeepLegs(prevPl, sp, tr) : mixStance(prevPl, sp, tr));',
    'const figPl = keepHeld(heldPl, mixStance(carryFrom(heldPl, n, hHold(PL_P[p], t)), sp, auth));'), '(L9)', true);

fs.rmSync(tmp, { force: true });
console.log(failed ? `\n${failed} stage(s) did not behave.\n` : '\nboth rules go red on their own defect, and a clean scene is silent.\n');
process.exit(failed ? 1 : 0);
