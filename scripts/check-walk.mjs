// Numeric verification for the BRANCH ROAD walk — the figure that carries the
// reader from one lesson to the next.
//
// Same trick as check-moves.mjs: rig, moves, worldPath and walkFigure are all
// free of React, so sucrase can transpile them into a temp directory and plain
// Node can run the EXACT code the screen runs, frame by frame, and measure it.
//
// SEVEN things a viewer complained about, each turned into a number:
//
//   1. FOOT SLIDE    — a planted foot's world x must not move. Skating is the
//                      single most "fake" thing a walk can do.
//   2. THE FIRST STEP — no foot may jump between frames, and the total drift of
//                      the planted foot across the whole departure is measured,
//                      because that is what read as "the ground starts moving
//                      before he starts walking".
//   3. ONE SPEED     — he must not accelerate through the span.
//   4. THE GROUND    — level, and the feet on it.
//   5. THE JUMP      — airtime, apex against his OWN HEIGHT, and daylight.
//   6. SOMETHING TO JUMP — every jump has a drawn obstacle under its apex.
//   7. THE HOP       — the tap-to-move leap: crouches, travels only while
//                      airborne, and stays under his own height.
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
const RIG = await import(pathToFileURL(path.join(TMP, 'rig.mjs')).href);

const K = 0.62;                       // FIG_K in BranchWorld
const FPS = 60;
const DUR = W.WALK_SECONDS;
/** How tall the figure actually is on this road, in world units. Everything the
 *  jump is judged against is a fraction of THIS — an apex is only "too high" or
 *  "about right" relative to the man doing it. Head disc centre −49, radius 20. */
const FIG_H = 69 * K;                 // ≈ 42.8

let fails = 0;
const ok = (pass, label, detail) => {
  if (!pass) fails++;
  console.log(`  ${pass ? 'ok  ' : 'FAIL'}  ${label}${detail ? '  ' + detail : ''}`);
};

/** Every frame of one traverse, with each foot's WORLD position. */
function traverse(i) {
  const from = W.SPAN * (i + 1), to = W.SPAN * (i + 2);
  const mode = W.gaitForSpan(i + 1);
  const j = W.jumpForSpan(i);
  const frames = [];
  for (let f = 0; f <= DUR * FPS; f++) {
    // THE SCREEN'S OWN EASING, imported rather than reimplemented. The previous
    // version of this file carried a hand-copied `easeInOutQuad`, so it would have
    // gone on measuring the old curve after the screen stopped using it.
    const wp = W.travelEase(f / (DUR * FPS));
    const bodyX = from + (to - from) * wp;
    const fig = F.figureAt(from, to, wp, f / FPS, mode, j ? j.at : -1, j ? j.h : 0, K);
    const foot = (p) => ({
      x: bodyX + p.x * K,
      gap: (W.groundAt(bodyX) - fig.lift + p.y * K) - W.groundAt(bodyX + p.x * K),
      raw: p.y,
    });
    frames.push({
      wp, bodyX, lift: fig.lift, bob: fig.stance.bob,
      L: foot(fig.stance.footL), R: foot(fig.stance.footR),
    });
  }
  return { frames, jump: j, mode, from };
}

/** Does this gait leave the ground of its own accord? A run does; a walk does not. */
function flies(mode) {
  return MOVES.gaitFor(mode).stance < 0.5;
}
const MOVES = await import(pathToFileURL(path.join(TMP, 'moves.mjs')).href);

console.log('\nTHE WALK ON THE BRANCH ROAD\n');

// ── 1 & 2. planted feet, and the departure ──────────────────────────────────
// Steady-state and the two TRANSITIONS are judged apart, because they are
// different claims. Mid-walk the foot-lock is exact and any movement at all is a
// bug. Easing out of a stand is not free: there is no phase of the walk cycle
// whose feet match a standing pose with both feet DOWN, so the departure has to
// blend, and a blend moves feet. The same goes for the arrival settle.
let worstSlide = 0, worstSlideAt = '', plantedFrames = 0;
let worstDepart = 0, worstArrive = 0, arriveFrames = 0;
for (let i = 0; i < 12; i++) {
  const { frames, mode } = traverse(i);
  const D = F.departUnits(mode, K);
  for (let f = 1; f < frames.length; f++) {
    const a = frames[f - 1], b = frames[f];
    const airborne = a.lift > 0.5 || b.lift > 0.5;
    for (const s of ['L', 'R']) {
      const planted = Math.abs(a[s].gap) < 0.05 && Math.abs(b[s].gap) < 0.05 && !airborne;
      if (!planted) continue;
      plantedFrames++;
      const jerk = Math.abs(b[s].x - a[s].x);
      const trav = b.bodyX - W.SPAN * (i + 1);
      if (trav > D + 4 && b.wp < 0.97) {
        if (jerk > worstSlide) { worstSlide = jerk; worstSlideAt = `span ${i} frame ${f}`; }
      } else if (b.wp >= 0.97) {
        if (jerk > 0.3) arriveFrames++;
        worstArrive = Math.max(worstArrive, jerk);
      } else worstDepart = Math.max(worstDepart, jerk);
    }
  }
}
ok(plantedFrames > 2000, 'the check actually found planted feet', `${plantedFrames} foot-frames examined`);
ok(worstSlide < 0.05, 'mid-walk, a planted foot does not move at all', `worst ${worstSlide.toFixed(3)} world units/frame (${worstSlideAt || 'never moved'})`);
ok(worstDepart < 0.6, 'setting off does not scuff the planted foot', `worst ${worstDepart.toFixed(2)} units/frame`);
// THE ARRIVAL IS THE RIG'S, NOT THIS ROAD'S. `settleStep` hands a walk back to a
// stand over SETTLE_UNITS — seven stance units, about a fifth of a stride — and
// the pose change in that window has to go somewhere. It is the same hand-off
// every one of the 102 cinematic lessons uses, it lasts about six frames at the
// very end of a seven-second walk, and it is not what a viewer reported. Bounded
// and counted rather than asserted away.
ok(worstArrive < 1.2 && arriveFrames / 12 < 8, 'and stopping is a settle rather than a scrape',
  `worst ${worstArrive.toFixed(2)} units/frame across ${(arriveFrames / 12).toFixed(1)} frames per stop — ${(arriveFrames / 12 / 60 * 1000).toFixed(0)}ms of it`);

// ── 2b. THE DEPARTURE, AS ONE NUMBER ────────────────────────────────────────
//
// This is the check the old file did not have, and the defect it did not catch.
// Per-frame drift was small enough to pass while the TOTAL was thirteen world
// units — the stance foot sliding back more than half a stride across the first
// second and a half, which is precisely "the ground starts moving before the
// stickman starts walking".
//
// Measured as: follow the foot that STAYS DOWN through the blend — identified by
// which one lifts least, not by which is rearmost, because at `startPhase` the
// raised foot is directly above the planted one and "rearmost" picks either.
{
  let worst = 0, worstAt = '';
  for (let i = 0; i < 16; i++) {
    const { frames, mode } = traverse(i);
    const start = W.SPAN * (i + 1);
    const D = F.departUnits(mode, K);
    const win = frames.filter((f) => f.bodyX - start <= D);
    const lift = (s) => Math.max(...win.map((f) => Math.abs(f[s].gap)));
    const s = lift('L') < lift('R') ? 'L' : 'R';
    let drift = 0;
    for (let f = 1; f < win.length; f++) drift += Math.abs(win[f][s].x - win[f - 1][s].x);
    if (drift > worst) { worst = drift; worstAt = `span ${i}, mode ${mode}`; }
  }
  ok(worst < 4.5, 'the stance foot stays where it is put while he sets off',
    `worst ${worst.toFixed(1)} world units of total drift (${worstAt}), against the 13 it was`);
}

// ── 3. ONE SPEED ────────────────────────────────────────────────────────────
//
// "The stickman when walking gets faster and faster." He did: `inOut(quad)` peaks
// at twice the average. The claim now is that after the opening ramp the speed is
// flat, so measure the fastest and slowest frame across the CRUISE and compare.
{
  const n = DUR * FPS;
  let fastest = 0, slowest = Infinity, peak = 0;
  for (let f = 1; f <= n; f++) {
    const t = f / n;
    const v = (W.travelEase(t) - W.travelEase((f - 1) / n)) * W.SPAN * FPS;   // units/sec
    if (v > peak) peak = v;
    if (t > W.RAMP && t < 1 - W.RAMP) {
      if (v > fastest) fastest = v;
      if (v < slowest) slowest = v;
    }
  }
  const spread = (fastest - slowest) / fastest;
  const over = peak / W.WALK_SPEED;
  ok(spread < 0.01, 'at cruise the speed does not change at all',
    `${slowest.toFixed(1)}–${fastest.toFixed(1)} units/sec, a spread of ${(spread * 100).toFixed(2)}%`);
  ok(over < 1.2, 'and the fastest he ever goes is barely above the average',
    `peak ${peak.toFixed(0)} units/sec = ${over.toFixed(2)}× the ${W.WALK_SPEED} average, against 2.00× before`);
  // The ramp must be short enough to read as setting off, long enough not to jerk.
  ok(W.RAMP * DUR > 0.35 && W.RAMP * DUR < 1.1, 'he gets up to speed in about a step',
    `${(W.RAMP * DUR).toFixed(2)}s`);
}

// ── 4. THE GROUND IS LEVEL ──────────────────────────────────────────────────
{
  let lo = Infinity, hi = -Infinity;
  for (let x = 0; x < W.SPAN * 40; x += 7) {
    const y = W.groundAt(x);
    if (y < lo) lo = y;
    if (y > hi) hi = y;
  }
  ok(hi - lo < 0.001, 'the road is flat from end to end', `${(hi - lo).toFixed(3)} units of rise over 40 spans`);
  // And the feet are on it. Scoped to the CRUISE and to gaits that do not fly:
  // a run has a flight phase by definition, and the arrival settle floats both
  // feet ~2.9 units for the last twentieth of a second while the rig hands the
  // walk back to a stand. Both are true of every figure in the app, neither is
  // what a viewer reported, and asserting otherwise would just be a check that
  // fails for correct reasons.
  let worstGap = 0, endGap = 0;
  for (let i = 0; i < 16; i++) {
    const { frames, mode } = traverse(i);
    if (flies(mode)) continue;
    for (const fr of frames) {
      if (fr.lift > 0.5) continue;
      const both = Math.min(Math.abs(fr.L.gap), Math.abs(fr.R.gap));
      if (fr.wp > 0.05 && fr.wp < 0.97) worstGap = Math.max(worstGap, both);
    }
    const last = frames[frames.length - 1];
    endGap = Math.max(endGap, Math.min(Math.abs(last.L.gap), Math.abs(last.R.gap)));
  }
  ok(worstGap < 0.6, 'a foot is always on the ground while he walks', `worst ${worstGap.toFixed(2)} units both-up at cruise`);
  ok(endGap < 0.05, 'and he finishes standing on it', `${endGap.toFixed(3)} units at the last frame`);
}

// ── 5 & 6. the jump, and the thing it is aimed at ───────────────────────────
{
  let found = 0, reported = false;
  let worstApex = 0, worstMiss = 0, minCrouch = Infinity;
  for (let i = 0; i < 40; i++) {
    const { frames, jump, from } = traverse(i);
    if (!jump) continue;
    found++;
    const ob = W.obstacleAt(i);
    const air = frames.filter((f) => f.lift > 0.5);
    const apex = Math.max(...frames.map((f) => f.lift));
    worstApex = Math.max(worstApex, apex);
    // THE APEX MUST BE OVER THE OBSTACLE. A jump aimed anywhere else is a man
    // hopping at nothing, and the drawn log then goes straight through his shin.
    const top = frames.reduce((p, c) => (c.lift > p.lift ? c : p));
    worstMiss = Math.max(worstMiss, Math.abs(top.bodyX - ob.x));
    // HE MUST BEND BEFORE HE GOES, and the thing that bends is the PELVIS, not
    // the feet — which is what the first version of this check got wrong. It
    // watched the feet-to-ground gap through the gather, saw it hold at zero
    // (correctly: a gather keeps both feet planted) and reported no crouch at
    // all. `bob` is the pelvis height; lower is more crouched.
    const before = frames.find((f) => f.bodyX - from > jump.at - W.JUMP_GATHER - 24);
    const gather = frames.filter((f) => {
      const t = f.bodyX - from;
      return t > jump.at - W.JUMP_GATHER && t <= jump.at;
    });
    minCrouch = Math.min(minCrouch, before.bob - Math.min(...gather.map((f) => f.bob)));
    if (!reported) {
      reported = true;
      const secs = air.length / FPS;
      const feetUp = -Math.max(top.L.gap, top.R.gap);
      ok(secs > 0.35 && secs < 0.95, 'the jump is a jump, not a float', `${secs.toFixed(2)}s airborne`);
      ok(feetUp > 6, 'the legs come off the ground', `${feetUp.toFixed(0)} units of daylight`);
      const mid = air[Math.floor(air.length / 2)].lift;
      const quarter = air[Math.floor(air.length / 4)].lift;
      ok(quarter / mid > 0.6 && quarter / mid < 0.85, 'the arc is ballistic', `quarter/apex ${(quarter / mid).toFixed(2)} (a parabola gives 0.75)`);
    }
  }
  ok(found > 3, 'some spans are worth jumping', `${found} of 40`);
  ok(worstApex < FIG_H * 0.45, 'and he never clears more than a third of his own height',
    `highest apex ${worstApex.toFixed(0)} of ${FIG_H.toFixed(0)} units tall = ${(worstApex / FIG_H).toFixed(2)}×, against 1.21× before`);
  ok(worstMiss < 2, 'every jump peaks directly over the thing it is jumping',
    `worst miss ${worstMiss.toFixed(1)} world units`);
  ok(minCrouch > 0.8, 'he bends his knees before he goes',
    `shallowest gather drops the feet-to-ground gap by ${minCrouch.toFixed(1)} units`);
}

// ── 6b. NOTHING IS JUMPED THAT IS NOT DRAWN, AND NOTHING DRAWN IS WALKED THROUGH ─
{
  let jumps = 0, obstacles = 0, unjumped = 0, phantom = 0;
  for (let i = 0; i < 200; i++) {
    const ob = W.obstacleAt(i);
    const j = W.jumpForSpan(i);
    if (ob) obstacles++;
    if (j) jumps++;
    if (ob && !j) unjumped++;
    if (j && !ob) phantom++;
  }
  ok(phantom === 0, 'he never leaves the ground at nothing', `${phantom} jumps with no obstacle`);
  ok(unjumped === 0, 'and never walks straight through a log', `${unjumped} obstacles not jumped`);
  ok(obstacles > 40 && obstacles < 100, 'obstacles are occasional, not constant',
    `${obstacles} in 200 spans (${(obstacles / 2).toFixed(0)}%)`);
  // The drawn ground must actually contain them.
  const art = W.groundArt(1);
  ok(art.ink.length > 400 && art.earth.length > 20, 'the ground draws both its tones',
    `${art.ink.length} chars of ink over ${art.earth.length} of earth`);
}

// ── 7. THE HOP ──────────────────────────────────────────────────────────────
//
// Tapping a lesson you are not standing at. It was a standing pose sliding 150
// units through the air on `Easing.bounce`; 150 is three and a half times his
// height, and `bounce` gives a landing three visible rebounds.
{
  const dist = W.SPAN;
  const N = 90;
  let apex = 0, minBob = Infinity, startBob = null;
  let travelBefore = 0, travelAfter = 0;
  for (let f = 0; f <= N; f++) {
    const p = f / N;
    const fig = F.hopAt(p, dist, f / 60, K);
    apex = Math.max(apex, fig.lift);
    if (startBob === null) startBob = fig.stance.bob;
    minBob = Math.min(minBob, fig.stance.bob);
    const tr = F.hopTravel(p);
    if (p < 0.1) travelBefore = tr;
    if (p > 0.92) travelAfter = 1 - tr;
  }
  ok(apex > 12 && apex < FIG_H * 0.95, 'the hop clears a real height without launching him',
    `apex ${apex.toFixed(0)} of ${FIG_H.toFixed(0)} units tall = ${(apex / FIG_H).toFixed(2)}×, against 3.51× before`);
  ok(startBob - minBob > 5, 'he gathers before he leaves the ground',
    `${(startBob - minBob).toFixed(1)} stance units of knee bend`);
  ok(travelBefore === 0, 'he does not slide sideways while crouching', `${travelBefore.toFixed(3)} of the distance covered in the first tenth`);
  ok(travelAfter === 0, 'and he has landed before he stops moving', `${travelAfter.toFixed(3)} left at the end`);
  // Constant horizontal speed through the flight — nothing pushes him sideways
  // once his feet are off the ground.
  const mid = [];
  for (let f = 0; f <= N; f++) {
    const a = F.hopTravel(f / N), b = F.hopTravel((f + 1) / N);
    if (a > 0.02 && b < 0.98) mid.push(b - a);
  }
  const spread = (Math.max(...mid) - Math.min(...mid)) / Math.max(...mid);
  ok(spread < 0.02, 'and he travels at one speed while airborne', `${(spread * 100).toFixed(2)}% variation`);
  ok(F.hopMs(W.SPAN) > 600 && F.hopMs(W.SPAN * 3) < 1500, 'a longer leap takes longer',
    `${F.hopMs(W.SPAN).toFixed(0)}ms for one span, ${F.hopMs(W.SPAN * 3).toFixed(0)}ms for three`);
}

// ── 8. the layout still holds together ──────────────────────────────────────
{
  const markers = W.layout(Array.from({ length: 32 }, (_, i) => ({ id: `l${i}`, unitId: `u${Math.floor(i / 7)}` })));
  const complaints = W.checkWorld(markers);
  ok(complaints.length === 0, 'the laid-out world has no complaints', complaints.join('; ') || '32 markers');
  // A `fromStand` walk must OPEN with its feet crossing, whatever the gait — that
  // is the whole reason the departure works now.
  //
  // Through `strideMode` itself, not by re-deriving the formula. The version of
  // this check that recomputed `(1+stance)/2` from the gait table passed while
  // the screen was 21 stance units out, because the table's stance is not the one
  // `gaitVary` walks. A check that reimplements what it is checking will agree
  // with itself all the way to the bottom.
  let worstGap = 0, worstMode = -1, plainGap = 0;
  for (const mode of [0, 1, 2, 3, 4]) {
    for (let sp = 0; sp < 8; sp++) {
      const a = W.SPAN * (sp + 1) / K, b = W.SPAN * (sp + 2) / K;
      const s = MOVES.strideMode(a, b, RIG.stand(0), 0, mode, 0, true);
      const gap = Math.abs(s.footL.x - s.footR.x);
      if (gap > worstGap) { worstGap = gap; worstMode = mode; }
      const plain = MOVES.strideMode(a, b, RIG.stand(0), 0, mode, 0, false);
      plainGap = Math.max(plainGap, Math.abs(plain.footL.x - plain.footR.x));
    }
  }
  ok(worstGap < 1.5, 'a walk from rest opens with its feet crossing, for every gait it uses',
    `worst separation ${worstGap.toFixed(2)} stance units (mode ${worstMode}); leaving it at phase 0 gives ${plainGap.toFixed(0)}`);
}

// ── 9. THE SCENERY HE WALKS IN FRONT OF ─────────────────────────────────────
//
// The figure is solid ink, head included, and every layer in sceneArt is behind
// him. A near-black mass at his height does not read as drama, it reads as the
// man vanishing — which is what ethics and political philosophy did, unnoticed,
// because the contact sheet was not drawing him at the time.
//
// The rule that came out of it: anything standing above his knee must be light
// enough to carry an ink figure. Below the knee a layer may be as dark as it
// likes, which is where the picture gets its floor. Checked here rather than
// remembered, because "remember to keep it light" is not a thing a generator
// obeys.
{
  emit('components/branch/sceneArt.ts', 'sceneArt.mjs');
  const S = await import(pathToFileURL(path.join(TMP, 'sceneArt.mjs')).href);
  /** WCAG relative luminance, so "dark" is a measurement and not an opinion. */
  const lum = (hex) => {
    const c = [0, 1, 2].map((i) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16) / 255)
      .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const FIG = lum('#1A1A1A');
  const ratio = (hex) => (lum(hex) + 0.05) / (FIG + 0.05);

  let worst = null, layers = 0, tall = 0;
  const tooDark = [];
  for (const place of S.PLACES) {
    for (let u = 0; u < 5; u++) {
      for (const l of S.sceneLayers(place, u)) {
        layers++;
        if (l.artTop >= S.NEAR_TOP) continue;       // below the knee: may be as dark as it likes
        tall++;
        const r = ratio(l.tone);
        if (!worst || r < worst.r) worst = { r, place, u, tone: l.tone, top: l.artTop };
        if (r < 2.8) tooDark.push(`${place} u${u + 1} ${l.tone} tops at ${l.artTop.toFixed(0)}`);
        // the band must contain the art — `measureTop` computes it, so this is a
        // guard on the machinery rather than on anyone's discipline
        if (l.h < 10 || l.top + l.h > S.TILE_H + 1) {
          tooDark.push(`${place} u${u + 1} band ${l.top}+${l.h} escapes the tile`);
        }
      }
    }
  }
  ok(layers > 120, 'every place at every weather builds', `${layers} layers over ${S.PLACES.length} places × 5 units`);
  ok(tooDark.length === 0, 'nothing dark enough to swallow him stands at his height',
    tooDark.slice(0, 3).join('; ') || `${tall} layers rise past the knee, dimmest ${worst.tone} at ${worst.r.toFixed(2)}:1 (${worst.place})`);
  // And the floor is still there: some layer, somewhere, is genuinely dark.
  const darkest = Math.min(...S.PLACES.map((pl) => lum(S.paletteFor(pl).near)));
  ok(darkest < 0.09, 'and the picture still has a floor', `darkest near tone ${darkest.toFixed(3)} luminance`);
}

console.log(fails ? `\n${fails} problem(s).\n` : '\nall clear.\n');
process.exit(fails ? 1 : 0);
