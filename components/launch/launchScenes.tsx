import * as React from 'react';
import Svg, { Path, Circle, G } from 'react-native-svg';
import { STAGE_W, STAGE_H } from '@/components/lesson/cinematic/rig';

// ─────────────────────────────────────────────────────────────────────────────
// The six outdoor scenes behind the launch screen — all hills, all daylight, all
// pen-and-ink line art on paper.
//
// STATIC BY DESIGN. Every stroke in this file is drawn ONCE and never animates;
// the figure and anything it holds live in a View layer above (LaunchFigure).
// react-native-svg re-rasterizes a whole surface whenever any child animates, so
// an animated <Svg> on the boot path costs ~10fps — measured. Keeping the art
// inert and the motion in Views is what buys a locked frame rate here.
//
// Authored in the rig's 400×800 stage, so the background and the figure share
// one coordinate system and cannot drift apart.
//
// TWO RULES every scene keeps:
//   1. Nothing dark below y=560. That band is where the philosopher quote sits,
//      and it must always be dark ink on light paper — the old scenes chose text
//      colour from a scene "mode" while painting their own backgrounds, so a
//      pale quote could land on pale art and vanish. Structure, not luck.
//   2. Nothing is drawn where the figure stands. The figure is never behind a
//      tree, a chair back, or a hill — it reads as a silhouette or not at all.
// ─────────────────────────────────────────────────────────────────────────────

const INK = '#1A1A1A';

/** Deterministic 0..1 sequence — the same scene wobbles the same way every launch. */
function rnd(seed: number) {
  let s = ((seed * 9301 + 49297) % 233280 + 233280) % 233280;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/**
 * A hand-drawn polyline: jitter each point, then join with quadratic curves whose
 * control points are also nudged. A straight run of these never comes out
 * straight, which is the whole point — a perfectly smooth vector curve is what
 * makes art read as machine-made.
 */
function hand(pts: Array<[number, number]>, jit = 1.4, seed = 1): string {
  const r = rnd(seed);
  const p: Array<[number, number]> = pts.map(([x, y]) => [
    x + (r() - 0.5) * jit * 2,
    y + (r() - 0.5) * jit * 2,
  ]);
  let d = `M${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)}`;
  for (let i = 1; i < p.length; i++) {
    const [x0, y0] = p[i - 1];
    const [x1, y1] = p[i];
    const mx = (x0 + x1) / 2 + (r() - 0.5) * jit * 1.6;
    const my = (y0 + y1) / 2 + (r() - 0.5) * jit * 1.6;
    d += ` Q${mx.toFixed(1)} ${my.toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`;
  }
  return d;
}

/** Short parallel strokes along a run — shading, the way a pen does it. */
function hatch(
  x0: number, y0: number, x1: number, y1: number,
  n: number, len: number, seed: number, slant = 0.5
): string {
  const r = rnd(seed);
  let d = '';
  for (let i = 0; i < n; i++) {
    const u = (i + 0.5) / n;
    const x = x0 + (x1 - x0) * u + (r() - 0.5) * 3;
    const y = y0 + (y1 - y0) * u + (r() - 0.5) * 2;
    const l = len * (0.55 + r() * 0.75);
    d += `M${x.toFixed(1)} ${y.toFixed(1)} L${(x + l * slant).toFixed(1)} ${(y + l).toFixed(1)} `;
  }
  return d;
}

/** Grass: little upward flicks along a ridge. */
function tufts(x0: number, x1: number, yAt: (x: number) => number, n: number, seed: number): string {
  const r = rnd(seed);
  let d = '';
  for (let i = 0; i < n; i++) {
    const x = x0 + (x1 - x0) * ((i + r() * 0.8) / n);
    const y = yAt(x);
    const h = 3 + r() * 5;
    const lean = (r() - 0.5) * 3;
    d += `M${x.toFixed(1)} ${y.toFixed(1)} q${(lean * 0.4).toFixed(1)} ${(-h * 0.6).toFixed(1)} ${lean.toFixed(1)} ${(-h).toFixed(1)} `;
  }
  return d;
}

const S = (w: number, o = 1) => ({
  fill: 'none' as const,
  stroke: INK,
  strokeWidth: w,
  strokeOpacity: o,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

// ── shared motifs ────────────────────────────────────────────────────────────

/** An open cloud contour — a few linked bumps, never a filled mass. */
function Cloud({ x, y, s = 1, seed = 3 }: { x: number; y: number; s?: number; seed?: number }) {
  const r = rnd(seed);
  const bumps: Array<[number, number]> = [];
  const n = 4 + Math.floor(r() * 2);
  let cx = -40;
  for (let i = 0; i < n; i++) {
    const h = 10 + r() * 11;
    bumps.push([cx, -h]);
    cx += 16 + r() * 10;
  }
  const pts: Array<[number, number]> = [[-52, 0], ...bumps, [cx + 8, 0]];
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Path d={hand(pts, 1.5, seed)} {...S(2.1, 0.75)} />
      {/* one short underline gives the cloud a base without closing it */}
      <Path d={hand([[-36, 3], [cx - 8, 3]], 1.1, seed + 5)} {...S(1.5, 0.4)} />
    </G>
  );
}

/** A thin sun ring with a handful of rays. */
function Sun({ x, y, r = 20, seed = 8 }: { x: number; y: number; r?: number; seed?: number }) {
  const g = rnd(seed);
  let rays = '';
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + 0.2;
    const r0 = r + 5 + g() * 2;
    const r1 = r0 + 5 + g() * 6;
    rays += `M${(x + Math.cos(a) * r0).toFixed(1)} ${(y + Math.sin(a) * r0).toFixed(1)} L${(x + Math.cos(a) * r1).toFixed(1)} ${(y + Math.sin(a) * r1).toFixed(1)} `;
  }
  return (
    <G>
      <Circle cx={x} cy={y} r={r} {...S(2, 0.6)} />
      <Path d={rays} {...S(1.6, 0.45)} />
    </G>
  );
}

/** Distant birds — the classic two-stroke gull, small enough to read as far off. */
function Birds({ x, y, seed = 11 }: { x: number; y: number; seed?: number }) {
  const r = rnd(seed);
  let d = '';
  for (let i = 0; i < 4; i++) {
    const bx = x + i * (16 + r() * 14);
    const by = y + (r() - 0.5) * 22;
    const w = 4 + r() * 3;
    d += `M${(bx - w).toFixed(1)} ${by.toFixed(1)} q${(w * 0.5).toFixed(1)} ${(-w * 0.7).toFixed(1)} ${w.toFixed(1)} 0 `;
    d += `M${bx.toFixed(1)} ${by.toFixed(1)} q${(w * 0.5).toFixed(1)} ${(-w * 0.7).toFixed(1)} ${w.toFixed(1)} 0 `;
  }
  return <Path d={d} {...S(1.7, 0.55)} />;
}

/**
 * A rolling ridge across the stage. `yAt` gives its height at any x, so a scene
 * can stand the figure exactly on the line instead of guessing.
 */
function ridgePts(yAt: (x: number) => number, x0 = -20, x1 = 420, step = 40): Array<[number, number]> {
  const pts: Array<[number, number]> = [];
  for (let x = x0; x <= x1; x += step) pts.push([x, yAt(x)]);
  return pts;
}

function Ridge({
  yAt, w = 2.4, o = 1, jit = 1.6, seed = 2, x0 = -20, x1 = 420,
}: { yAt: (x: number) => number; w?: number; o?: number; jit?: number; seed?: number; x0?: number; x1?: number }) {
  return <Path d={hand(ridgePts(yAt, x0, x1), jit, seed)} {...S(w, o)} />;
}

/**
 * A canopy as overlapping leaf CLUMPS — each step around the ellipse bulges
 * outward, so the silhouette scallops the way foliage does. A jittered ellipse
 * (what this was) just reads as a lollipop on a stick.
 */
function clumpCanopy(cx: number, cy: number, rx: number, ry: number, n: number, seed: number): string {
  const r = rnd(seed);
  const pts: Array<[number, number]> = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const rr = 0.84 + r() * 0.3;
    pts.push([cx + Math.cos(a) * rx * rr, cy + Math.sin(a) * ry * rr]);
  }
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 1; i <= n; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i % n];
    const mx = (x0 + x1) / 2;
    const my = (y0 + y1) / 2;
    const dx = mx - cx;
    const dy = my - cy;
    const L = Math.hypot(dx, dy) || 1;
    // The bulge must be a FRACTION of the canopy, not an absolute distance: a
    // fixed push dwarfs a small tree's radius and turns distant trees into spiky
    // asterisks instead of foliage.
    const push = (0.1 + r() * 0.16) * Math.min(rx, ry);
    d += ` Q${(mx + (dx / L) * push).toFixed(1)} ${(my + (dy / L) * push).toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`;
  }
  return `${d} Z`;
}

/** A row of small trees along a far ridge — depth, and something for the eye. */
function FarTrees({ x0, x1, yAt, n, seed }: { x0: number; x1: number; yAt: (x: number) => number; n: number; seed: number }) {
  const r = rnd(seed);
  const out: React.ReactElement[] = [];
  for (let i = 0; i < n; i++) {
    const x = x0 + (x1 - x0) * ((i + r() * 0.7) / n);
    const y = yAt(x);
    const h = 9 + r() * 9;
    out.push(
      <G key={i}>
        <Path d={`M${x.toFixed(1)} ${y.toFixed(1)} L${x.toFixed(1)} ${(y - h).toFixed(1)}`} {...S(1.3, 0.4)} />
        <Path d={clumpCanopy(x, y - h - h * 0.42, h * 0.5, h * 0.44, 6, seed + i * 7)} {...S(1.3, 0.42)} />
      </G>
    );
  }
  return <>{out}</>;
}

/**
 * A leafy tree: trunk, a few boughs, and a clumped canopy outline. Drawn as
 * contour only — a filled canopy turns into a black mass and fights the figure
 * for attention.
 */
function Tree({
  x, groundY, h = 210, seed = 21, canopy = true,
}: { x: number; groundY: number; h?: number; seed?: number; canopy?: boolean }) {
  const r = rnd(seed);
  const topY = groundY - h;
  const trunk = hand([[x, groundY], [x - 2, groundY - h * 0.3], [x + 2, groundY - h * 0.55], [x, topY + h * 0.22]], 1.5, seed);
  let boughs = '';
  for (let i = 0; i < 5; i++) {
    const by = groundY - h * (0.5 + i * 0.09);
    const dir = i % 2 === 0 ? -1 : 1;
    const len = 26 + r() * 26;
    boughs += `M${x.toFixed(1)} ${by.toFixed(1)} q${(dir * len * 0.5).toFixed(1)} ${(-len * 0.25).toFixed(1)} ${(dir * len).toFixed(1)} ${(-len * 0.55).toFixed(1)} `;
  }
  const cw = h * 0.46;
  const cy = topY + h * 0.2;
  return (
    <G>
      <Path d={trunk} {...S(3.4)} />
      <Path d={boughs} {...S(2)} />
      {canopy ? <Path d={clumpCanopy(x, cy, cw, cw * 0.66, 13, seed + 3)} {...S(2.2, 0.85)} /> : null}
      {/* two inner clumps break the canopy into masses instead of one balloon */}
      {canopy ? <Path d={clumpCanopy(x - cw * 0.34, cy + cw * 0.12, cw * 0.42, cw * 0.3, 8, seed + 11)} {...S(1.5, 0.4)} /> : null}
      {canopy ? <Path d={clumpCanopy(x + cw * 0.38, cy - cw * 0.1, cw * 0.36, cw * 0.26, 8, seed + 17)} {...S(1.5, 0.35)} /> : null}
      {canopy ? <Path d={hatch(x - cw * 0.55, cy + cw * 0.3, x + cw * 0.45, cy + cw * 0.34, 10, 9, seed + 7, 0.6)} {...S(1.4, 0.28)} /> : null}
    </G>
  );
}

// ── the six scenes ───────────────────────────────────────────────────────────
// Each pairs its art with the placement the figure needs: where the ground is
// under its feet, how big it is, and which way it faces.

export type Activity = 'walk' | 'kite' | 'swing' | 'sip' | 'picnic' | 'read';

export interface LaunchScene {
  key: string;
  Art: React.FC;
  activity: Activity;
  /** Stage position of the figure's feet (or seat, for the swing). */
  x: number;
  groundY: number;
  /** Stage units per rig unit — the figure's size. */
  k: number;
  dir: 1 | -1;
  /** Swing only: the branch the rope hangs from. Must sit directly above the seat. */
  pivot?: { x: number; y: number };
  /** Kite only: where the kite rides. */
  kite?: { x: number; y: number };
  /** Walk only: the hill contour, so the feet track the slope instead of a flat line. */
  groundAt?: (x: number) => number;
}

// 1 · A long walk over the hills.
const walkYAt = (x: number) => 528 - Math.sin((x - 40) / 150) * 22;
const WalkArt = () => (
  <>
    <Sun x={318} y={168} r={19} seed={31} />
    <Cloud x={110} y={182} s={0.95} seed={32} />
    <Cloud x={268} y={232} s={0.66} seed={33} />
    <Birds x={72} y={244} seed={34} />
    {/* far range */}
    <Ridge yAt={(x) => 372 + Math.sin(x / 90) * 16} w={1.7} o={0.42} jit={2.4} seed={35} />
    <Path d={hatch(40, 384, 360, 388, 16, 11, 36, 0.45)} {...S(1.2, 0.2)} />
    {/* middle hill */}
    <Ridge yAt={(x) => 446 + Math.cos((x + 60) / 110) * 24} w={2} o={0.6} jit={2} seed={37} />
    <FarTrees x0={38} x1={330} yAt={(x) => 446 + Math.cos((x + 60) / 110) * 24} n={7} seed={137} />
    <Path d={hatch(30, 462, 360, 470, 18, 10, 138, 0.5)} {...S(1.2, 0.16)} />
    {/* the hill underfoot */}
    <Ridge yAt={walkYAt} w={2.8} seed={38} />
    <Path d={tufts(20, 380, walkYAt, 26, 39)} {...S(1.5, 0.5)} />
    <Path d={hatch(30, 556, 370, 560, 14, 9, 40, 0.5)} {...S(1.2, 0.16)} />
  </>
);

// 2 · A kite on a bare, open crest — the most sky of the six.
const kiteYAt = (x: number) => 534 - Math.sin((x + 20) / 170) * 16;
const KiteArt = () => (
  <>
    <Cloud x={96} y={150} s={1.05} seed={41} />
    <Cloud x={300} y={206} s={0.72} seed={42} />
    <Birds x={250} y={128} seed={43} />
    <Ridge yAt={(x) => 396 + Math.sin((x - 30) / 100) * 14} w={1.7} o={0.38} jit={2.4} seed={44} />
    <Ridge yAt={(x) => 468 + Math.cos((x + 20) / 130) * 18} w={2} o={0.55} jit={2} seed={45} />
    <FarTrees x0={228} x1={372} yAt={(x) => 468 + Math.cos((x + 20) / 130) * 18} n={5} seed={145} />
    <Path d={hatch(24, 486, 372, 492, 17, 10, 146, 0.5)} {...S(1.2, 0.15)} />
    <Ridge yAt={kiteYAt} w={2.8} seed={46} />
    <Path d={tufts(20, 380, kiteYAt, 30, 47)} {...S(1.5, 0.5)} />
    {/* a lone fence post pair, far from the figure, to give the crest scale */}
    <Path d={hand([[52, 534], [52, 502]], 1, 48)} {...S(2.2, 0.7)} />
    <Path d={hand([[74, 536], [74, 508]], 1, 49)} {...S(2.2, 0.6)} />
    <Path d={hand([[50, 512], [76, 516]], 1, 50)} {...S(1.6, 0.5)} />
  </>
);

// 3 · A tire swing under a big tree. The tree is hard left so the rope hangs
//     into open paper and the figure never crosses the trunk.
const swingYAt = (x: number) => 552 - Math.sin((x - 10) / 160) * 12;
const SwingArt = () => (
  <>
    <Cloud x={250} y={168} s={0.85} seed={51} />
    <Birds x={280} y={228} seed={52} />
    <Ridge yAt={(x) => 430 + Math.sin((x + 40) / 120) * 16} w={1.8} o={0.4} jit={2.2} seed={53} />
    <FarTrees x0={236} x1={376} yAt={(x) => 430 + Math.sin((x + 40) / 120) * 16} n={5} seed={153} />
    <Path d={hatch(150, 448, 380, 456, 12, 10, 154, 0.5)} {...S(1.2, 0.15)} />
    <Ridge yAt={swingYAt} w={2.8} seed={54} />
    <Path d={tufts(20, 380, swingYAt, 24, 55)} {...S(1.5, 0.5)} />
    {/* trunk at the very left, with the bough that carries the rope */}
    <Tree x={44} groundY={556} h={232} seed={56} canopy />
    {/* the bough reaches out to exactly where the rope hangs (SWING_PIVOT) */}
    <Path d={hand([[54, 302], [122, 288], [196, 296]], 2.2, 57)} {...S(3.6)} />
    <Path d={hatch(60, 566, 130, 566, 6, 8, 58, 0.5)} {...S(1.3, 0.22)} />
  </>
);

// 4 · A deck chair on the crest with something hot. The chair is drawn BEHIND
//     and slightly downhill so the seated figure sits clear of every strut.
const sipYAt = (x: number) => 540 - Math.cos((x - 60) / 150) * 14;
const SipArt = () => (
  <>
    <Sun x={92} y={158} r={17} seed={61} />
    <Cloud x={244} y={186} s={0.9} seed={62} />
    <Cloud x={104} y={250} s={0.6} seed={63} />
    <Birds x={286} y={140} seed={64} />
    <Ridge yAt={(x) => 400 + Math.sin(x / 105) * 15} w={1.7} o={0.4} jit={2.3} seed={65} />
    <Ridge yAt={(x) => 470 + Math.cos((x - 40) / 120) * 18} w={2} o={0.55} jit={2} seed={66} />
    <FarTrees x0={252} x1={376} yAt={(x) => 470 + Math.cos((x - 40) / 120) * 18} n={4} seed={166} />
    <Path d={hatch(26, 488, 372, 494, 16, 10, 167, 0.5)} {...S(1.2, 0.15)} />
    <Ridge yAt={sipYAt} w={2.8} seed={67} />
    <Path d={tufts(20, 380, sipYAt, 24, 68)} {...S(1.5, 0.5)} />
    {/* Deck chair. The figure faces +x with its pelvis at ~(196,504), so the back
        rail belongs BEHIND that (x<196) and the seat runs forward under it —
        drawn the other way round, the chair back stood in front of the sitter's
        face. Everything here is behind the figure in z, so nothing covers it. */}
    <G>
      <Path d={hand([[182, 512], [168, 450]], 1.3, 69)} {...S(3)} />
      <Path d={hand([[182, 513], [236, 506]], 1.2, 70)} {...S(2.6)} />
      <Path d={hand([[184, 512], [176, 545]], 1.2, 71)} {...S(2.4)} />
      <Path d={hand([[231, 507], [240, 543]], 1.2, 72)} {...S(2.4)} />
      <Path d={hand([[171, 462], [186, 466]], 1, 73)} {...S(2, 0.7)} />
      <Path d={hand([[173, 476], [187, 480]], 1, 74)} {...S(2, 0.7)} />
      <Path d={hand([[175, 492], [188, 495]], 1, 75)} {...S(2, 0.7)} />
    </G>
  </>
);

// 5 · A picnic on the grass. Basket to the figure's reaching side, blanket edge
//     suggested with a few strokes rather than a filled rectangle.
const picnicYAt = (x: number) => 548 - Math.sin((x + 80) / 170) * 10;
const PicnicArt = () => (
  <>
    <Sun x={306} y={150} r={16} seed={81} />
    <Cloud x={118} y={176} s={0.9} seed={82} />
    <Birds x={196} y={230} seed={83} />
    <Ridge yAt={(x) => 408 + Math.cos((x + 30) / 115) * 16} w={1.7} o={0.4} jit={2.3} seed={84} />
    <Ridge yAt={(x) => 476 + Math.sin((x - 50) / 130) * 14} w={2} o={0.55} jit={2} seed={85} />
    <FarTrees x0={30} x1={150} yAt={(x) => 476 + Math.sin((x - 50) / 130) * 14} n={4} seed={185} />
    <Path d={hatch(26, 494, 372, 500, 16, 10, 186, 0.5)} {...S(1.2, 0.15)} />
    <Ridge yAt={picnicYAt} w={2.8} seed={86} />
    <Tree x={348} groundY={552} h={168} seed={87} canopy />
    <Path d={tufts(20, 300, picnicYAt, 20, 88)} {...S(1.5, 0.45)} />
    {/* blanket: a long shallow lens with a checked hint */}
    <Path d={hand([[126, 552], [186, 545], [252, 553]], 1.4, 89)} {...S(2.4)} />
    <Path d={hand([[128, 552], [140, 562], [246, 562], [252, 553]], 1.4, 90)} {...S(1.8, 0.6)} />
    <Path d={`M152 549 L156 561 M182 546 L184 561 M214 547 L214 561`} {...S(1.2, 0.28)} />
    {/* Basket, sat WITHIN the reaching hand's arc. The hand tops out near x≈218
        at full stretch, so a basket further right than that would have the figure
        grasping at nothing. */}
    <G>
      <Path d={hand([[208, 536], [238, 536], [234, 553], [212, 553], [208, 536]], 1.1, 91)} {...S(2.3)} />
      <Path d={hand([[212, 536], [223, 523], [234, 536]], 1.1, 92)} {...S(2)} />
      <Path d={`M216 542 L230 542 M215 547 L232 547`} {...S(1.3, 0.4)} />
    </G>
  </>
);

// 6 · Reading under a tree. The trunk sits to the figure's back but is offset so
//     no branch crosses the head or the book.
const readYAt = (x: number) => 546 - Math.cos((x - 30) / 160) * 12;
const ReadArt = () => (
  <>
    <Cloud x={272} y={162} s={0.8} seed={101} />
    <Cloud x={110} y={214} s={0.62} seed={102} />
    <Birds x={72} y={166} seed={103} />
    <Ridge yAt={(x) => 418 + Math.sin((x + 70) / 125) * 14} w={1.7} o={0.38} jit={2.3} seed={104} />
    <Ridge yAt={(x) => 484 + Math.cos((x + 10) / 140) * 14} w={2} o={0.5} jit={2} seed={105} />
    <FarTrees x0={244} x1={378} yAt={(x) => 484 + Math.cos((x + 10) / 140) * 14} n={4} seed={205} />
    <Path d={hatch(26, 502, 372, 508, 16, 10, 206, 0.5)} {...S(1.2, 0.15)} />
    <Ridge yAt={readYAt} w={2.8} seed={106} />
    <Tree x={84} groundY={550} h={214} seed={107} canopy />
    <Path d={tufts(130, 380, readYAt, 22, 108)} {...S(1.5, 0.5)} />
    {/* a couple of fallen leaves, to earn the empty foreground */}
    <Path d={`M258 560 q4 -4 8 -1 M286 566 q5 -3 8 1 M232 566 q4 -3 7 0`} {...S(1.4, 0.35)} />
  </>
);

/** The rope's anchor on the bough. The seat hangs straight down from here. */
export const SWING_PIVOT = { x: 196, y: 296 };

export const LAUNCH_SCENES: LaunchScene[] = [
  { key: 'walk', Art: WalkArt, activity: 'walk', x: 150, groundY: walkYAt(150), k: 1.32, dir: 1, groundAt: walkYAt },
  // The kite rides ABOVE the progress stroke's line (stage y 258) so the two
  // never sit on top of each other.
  { key: 'kite', Art: KiteArt, activity: 'kite', x: 168, groundY: kiteYAt(168), k: 1.32, dir: 1, kite: { x: 306, y: 186 } },
  // Seated FORWARD of the rope (+18) so the rope hangs behind the rider's back
  // instead of dropping straight through the head.
  { key: 'swing', Art: SwingArt, activity: 'swing', x: SWING_PIVOT.x + 18, groundY: 497, k: 1.24, dir: 1, pivot: SWING_PIVOT },
  { key: 'sip', Art: SipArt, activity: 'sip', x: 196, groundY: sipYAt(196), k: 1.3, dir: 1 },
  { key: 'picnic', Art: PicnicArt, activity: 'picnic', x: 178, groundY: picnicYAt(178), k: 1.3, dir: 1 },
  { key: 'read', Art: ReadArt, activity: 'read', x: 208, groundY: readYAt(208), k: 1.3, dir: 1 },
];

/** The whole static backdrop for one scene, in stage coordinates. */
export function SceneArt({ scene }: { scene: LaunchScene }) {
  const { Art } = scene;
  return (
    <Svg width={STAGE_W} height={STAGE_H} viewBox={`0 0 ${STAGE_W} ${STAGE_H}`}>
      <Art />
    </Svg>
  );
}
