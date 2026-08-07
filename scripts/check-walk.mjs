// Numeric verification for the BRANCH ROAD walk — the figure that carries the
// reader from one lesson to the next.
//
// Same trick as check-moves.mjs: rig, moves, worldPath and walkFigure are all
// free of React, so sucrase can transpile them into a temp directory and plain
// Node can run the EXACT code the screen runs, frame by frame, and measure it.
//
// Four things a viewer complained about, each turned into a number:
//
//   1. FOOT SLIDE   — a planted foot's world x must not move. Skating is the
//                     single most "fake" thing a walk can do.
//   2. THE FIRST STEP — no foot may jump between consecutive frames. The old
//                     departure moved one ~8 world units in a single frame.
//   3. THE GROUND   — a foot that is down must be ON the drawn hill, not on a
//                     flat rule under the pelvis.
//   4. THE JUMP     — airtime in seconds, apex height, and legs off the ground.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const REPO = process.cwd();
const { transform } = await import(
  pathToFileURL(path.join(REPO, 'node_modules/sucrase/dist/index.js')).href,
);

const TMP = path.join(os.tmpdir(), 'philosophize-walk-check');
mkdirSync(TMP, { recursive: true });
function emit(rel, name) {
  const src = readFileSync(path.join(REPO, rel), 'utf8');
  const js = transform(src, { transforms: ['typescript'] }).code
    // flatten every relative import to a sibling .mjs in the temp dir
    .replace(/(from\s+['"])(?:\.\.\/lesson\/cinematic\/|\.\/)(rig|moves|worldPath)(['"])/g, '$1./$2.mjs$3');
  writeFileSync(path.join(TMP, name), js);
}
emit('components/lesson/cinematic/rig.ts', 'rig.mjs');
emit('components/lesson/cinematic/moves.ts', 'moves.mjs');
emit('components/branch/worldPath.ts', 'worldPath.mjs');
emit('components/branch/walkFigure.ts', 'walkFigure.mjs');

const W = await import(pathToFileURL(path.join(TMP, 'worldPath.mjs')).href);
const F = await import(pathToFileURL(path.join(TMP, 'walkFigure.mjs')).href);

const K = 0.62;                       // FIG_K in BranchWorld
const FPS = 60;
const DUR = W.WALK_SECONDS;
// The screen's easing: Easing.inOut(Easing.quad)
const easeInOutQuad = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

let fails = 0;
const ok = (pass, label, detail) => {
  if (!pass) fails++;
  console.log(`  ${pass ? 'ok  ' : 'FAIL'}  ${label}${detail ? '  ' + detail : ''}`);
};

/** Every frame of one traverse, with each foot's WORLD position. */
function traverse(i) {
  const from = W.SPAN * (i + 1), to = W.SPAN * (i + 2);
  const mode = W.gaitForSpan(i + 1);
  const j = W.jumpForSpan(from, to);
  const frames = [];
  for (let f = 0; f <= DUR * FPS; f++) {
    const wp = easeInOutQuad(f / (DUR * FPS));
    const bodyX = from + (to - from) * wp;
    const fig = F.figureAt(from, to, wp, f / FPS, mode, j ? j.at : -1, j ? j.h : 0, K);
    const foot = (p) => ({
      // world x of the foot, and its world y relative to the drawn ground there
      x: bodyX + p.x * K,
      gap: (W.groundAt(bodyX) - fig.lift + p.y * K) - W.groundAt(bodyX + p.x * K),
      // the raw stance y: EXACTLY 0 is what `footTarget` emits for a foot in its
      // stance phase, which is the only honest definition of "planted".
      raw: p.y,
    });
    frames.push({ wp, bodyX, lift: fig.lift, L: foot(fig.stance.footL), R: foot(fig.stance.footR) });
  }
  return { frames, jump: j, mode };
}

console.log('\nTHE WALK ON THE BRANCH ROAD\n');

// ── 1 & 2. planted feet and the first step ──────────────────────────────────
// Steady-state and the two TRANSITIONS are judged apart, because they are
// different claims. Mid-walk the foot-lock is exact and any movement at all is a
// bug. Easing out of a stand is not free: there is no phase of the walk cycle
// whose feet match a standing pose with both feet DOWN (checked — at every
// matching width one foot is 5-15 units airborne), so the departure has to blend,
// and a blend moves feet. The same goes for the arrival settle.
let worstSlide = 0, worstSlideAt = '', plantedFrames = 0;
let worstTrans = 0, worstFlatGap = 0;
for (let i = 0; i < 12; i++) {
  const { frames } = traverse(i);
  for (let f = 1; f < frames.length; f++) {
    const a = frames[f - 1], b = frames[f];
    const airborne = a.lift > 0.5 || b.lift > 0.5;
    for (const s of ['L', 'R']) {
      // PLANTED = the foot is sitting on the drawn hill. `onTerrain` rewrites
      // foot.y, so the stance's own y no longer reads 0 for a planted foot —
      // testing it would make this whole check vacuous, which it silently was.
      const planted = Math.abs(a[s].gap) < 0.05 && Math.abs(b[s].gap) < 0.05 && !airborne;
      if (!planted) continue;
      plantedFrames++;
      const jerk = Math.abs(b[s].x - a[s].x);
      const trav = Math.abs(b.bodyX - W.SPAN * (i + 1));
      const steady = trav > 30 && b.wp < 0.72;
      if (steady) {
        if (jerk > worstSlide) { worstSlide = jerk; worstSlideAt = `span ${i} frame ${f}`; }
      } else if (jerk > worstTrans) worstTrans = jerk;
      // What the SAME foot's gap would have been on the old flat ground line —
      // the defect this replaced, measured rather than asserted.
      const flat = Math.abs(W.groundAt(b.bodyX) - W.groundAt(b[s].x));
      if (flat > worstFlatGap) worstFlatGap = flat;
    }
  }
}
ok(plantedFrames > 2000, 'the check actually found planted feet', `${plantedFrames} foot-frames examined`);
// A planted foot moving at all is a skate.
ok(worstSlide < 0.05, 'mid-walk, a planted foot does not move at all', `worst ${worstSlide.toFixed(3)} world units/frame (${worstSlideAt || 'never moved'})`);
// Measured: departure 0.42 at 8 units travelled, arrival 0.84 in the final five
// frames — where a fully settled pose has body-relative feet by definition and
// rides the last 4 units to a stop. Both are transitions, both are small, and
// both replaced an 8.2-unit jump in a SINGLE frame.
ok(worstTrans < 0.9, 'the departure and arrival blends drift only slightly', `worst ${worstTrans.toFixed(2)} units/frame, against the 8.2-unit single-frame snap they replaced`);
console.log(`        (on the old flat ground line those same feet sat up to ${worstFlatGap.toFixed(2)} units off the hill)`);

// ── 3. the departure specifically ───────────────────────────────────────────
{
  const { frames } = traverse(0);
  const first = frames.slice(0, 40);
  let maxStep = 0;
  for (let f = 1; f < first.length; f++) {
    maxStep = Math.max(maxStep, Math.abs(first[f].R.x - first[f - 1].R.x), Math.abs(first[f].L.x - first[f - 1].L.x));
  }
  ok(maxStep < 1.6, 'the first step eases out of the stand', `worst ${maxStep.toFixed(2)} units/frame over the opening 40 frames`);
}

// ── 4. the jump ─────────────────────────────────────────────────────────────
{
  let found = 0, report = '';
  for (let i = 0; i < 24; i++) {
    const { frames, jump } = traverse(i);
    if (!jump) continue;
    found++;
    const air = frames.filter((f) => f.lift > 0.5);
    const secs = air.length / FPS;
    const apex = Math.max(...frames.map((f) => f.lift));
    // Legs must actually leave the ground: at the apex both feet well above it.
    const top = frames.reduce((p, c) => (c.lift > p.lift ? c : p));
    // negative gap = ABOVE the ground (y runs down the screen)
    const feetUp = -Math.max(top.L.gap, top.R.gap);
    if (!report) {
      report = `${secs.toFixed(2)}s airborne, apex ${apex.toFixed(0)} units, feet ${feetUp.toFixed(0)} above the hill at the top`;
      ok(secs > 0.55 && secs < 1.35, 'the jump is a jump, not a float', report);
      ok(apex > 14 && apex < 60, 'the arc clears something without launching him', `apex ${apex.toFixed(0)} units`);
      ok(feetUp > 6, 'the legs come off the ground', `${feetUp.toFixed(0)} units of daylight`);
      // parabola, not a sine: the apex is flatter than the ends
      const mid = air[Math.floor(air.length / 2)].lift;
      const quarter = air[Math.floor(air.length / 4)].lift;
      ok(quarter / mid > 0.6 && quarter / mid < 0.85, 'the arc is ballistic', `quarter/apex ${(quarter / mid).toFixed(2)} (a parabola gives 0.75)`);
    }
  }
  ok(found > 0, 'some spans are worth jumping', `${found} of 24`);
}

console.log(fails ? `\n${fails} problem(s).\n` : '\nall clear.\n');
process.exit(fails ? 1 : 0);
