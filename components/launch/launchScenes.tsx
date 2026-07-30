import * as React from 'react';
import Svg, { Path, Circle, G, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { STAGE_W, STAGE_H } from '@/components/lesson/cinematic/rig';

// ─────────────────────────────────────────────────────────────────────────────
// The six outdoor scenes behind the launch screen.
//
// Drawn from three references: towering white cumulus against a near-black sky,
// a great leafy tree on a hill with a small figure beneath it, and bare winter
// trees branching against a pale sky. So: a dark dramatic sky up top washing
// down to paper at the horizon, with the land and a small, distant figure
// reading dark against the pale lower half.
//
// STATIC BY DESIGN. Every stroke here is drawn ONCE and never animates; the
// figure and anything it holds live in a View layer above (LaunchFigure).
// react-native-svg re-rasterizes a whole surface whenever any child animates, so
// an animated <Svg> on the boot path costs ~10fps — measured. Detail here is
// therefore free: none of it is ever redrawn.
//
// Authored in the rig's 400×800 stage, so background and figure share one
// coordinate system and cannot drift apart.
//
// THE TWO RULES:
//   1. The sky wash reaches full PAPER by y≈470 and nothing dark is drawn below
//      y=560. That band carries the philosopher quote, always dark ink on light
//      paper — never a colour chosen from a per-scene "mode", which is what used
//      to let a pale quote vanish into pale art. The masthead and progress
//      stroke sit at the TOP, inside the dark zone, and are drawn light. Both
//      zones are fixed by construction, so no element can land on a background
//      it cannot be read against.
//   2. Nothing is drawn where the figure stands.
// ─────────────────────────────────────────────────────────────────────────────

const INK = '#141414';
const NIGHT = '#101010';
const WHITE = '#F7F6F2';
const PAPER = '#F4F3EE';
const MID = '#DAD9D2';

/** y at which the sky has fully become paper. Everything below is quote-safe. */
export const HORIZON = 470;

/** Deterministic 0..1 sequence — the same scene draws identically every launch. */
function rnd(seed: number) {
  let s = ((seed * 9301 + 49297) % 233280 + 233280) % 233280;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/** A hand-drawn polyline: jitter the points, then curve between them. */
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

function hatch(x0: number, y0: number, x1: number, y1: number, n: number, len: number, seed: number, slant = 0.5): string {
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

function tufts(x0: number, x1: number, yAt: (x: number) => number, n: number, seed: number): string {
  const r = rnd(seed);
  let d = '';
  for (let i = 0; i < n; i++) {
    const x = x0 + (x1 - x0) * ((i + r() * 0.8) / n);
    const y = yAt(x);
    const h = 2.5 + r() * 4;
    const lean = (r() - 0.5) * 2.5;
    d += `M${x.toFixed(1)} ${y.toFixed(1)} q${(lean * 0.4).toFixed(1)} ${(-h * 0.6).toFixed(1)} ${lean.toFixed(1)} ${(-h).toFixed(1)} `;
  }
  return d;
}

const S = (w: number, o = 1, color = INK) => ({
  fill: 'none' as const,
  stroke: color,
  strokeWidth: w,
  strokeOpacity: o,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

// ── sky ──────────────────────────────────────────────────────────────────────

/**
 * Night at the top washing to paper at the horizon. This one gradient is what
 * lets the scene be dramatic AND the quote stay legible: the dark is confined to
 * the top third by construction, so the masthead can be white and the quote ink,
 * and neither ever has to guess what is behind it.
 */
function SkyWash({ k }: { k: string }) {
  return (
    <>
      <Defs>
        <LinearGradient id={`sky-${k}`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={NIGHT} />
          <Stop offset="0.42" stopColor="#24241F" />
          <Stop offset="0.62" stopColor="#8A8981" />
          <Stop offset="0.78" stopColor={PAPER} />
        </LinearGradient>
      </Defs>
      <Rect x={0} y={0} width={STAGE_W} height={HORIZON + 80} fill={`url(#sky-${k})`} />
      <Rect x={0} y={HORIZON + 78} width={STAGE_W} height={STAGE_H - HORIZON - 78} fill={PAPER} />
    </>
  );
}

/**
 * A towering cumulus: overlapping white puffs over a flat base, with thin dark
 * arcs tracing the inner seams so the mass reads as billowed rather than as one
 * blob. This is the reference sky's signature shape.
 */
function Cumulus({ x, y, s = 1, seed = 3 }: { x: number; y: number; s?: number; seed?: number }) {
  const r = rnd(seed);
  const puffs: Array<[number, number, number]> = [];
  const n = 5 + Math.floor(r() * 3);
  let cx = -46;
  for (let i = 0; i < n; i++) {
    const rr = 13 + r() * 15;
    const lift = 4 + r() * 20;
    puffs.push([cx, -lift, rr]);
    cx += rr * 0.95;
  }
  let seams = '';
  for (let i = 1; i < puffs.length; i++) {
    const [px, py, pr] = puffs[i];
    seams += `M${(px - pr * 0.75).toFixed(1)} ${(py + pr * 0.3).toFixed(1)} q${(pr * 0.5).toFixed(1)} ${(-pr * 0.85).toFixed(1)} ${(pr * 1.1).toFixed(1)} ${(-pr * 0.05).toFixed(1)} `;
  }
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      {puffs.map(([px, py, pr], i) => (
        <Circle key={i} cx={px} cy={py} r={pr} fill={WHITE} />
      ))}
      <Rect x={-56} y={-6} width={cx + 66} height={15} rx={7} fill={WHITE} />
      <Path d={seams} {...S(1.5, 0.3)} />
    </G>
  );
}

/** Far, flat cloud streaks — the quiet ones that give the sky depth. */
function Streaks({ x, y, w, n, seed }: { x: number; y: number; w: number; n: number; seed: number }) {
  const r = rnd(seed);
  let d = '';
  for (let i = 0; i < n; i++) {
    const yy = y + i * (7 + r() * 9);
    const ww = w * (0.45 + r() * 0.6);
    const xx = x + (r() - 0.5) * 40;
    d += `M${xx.toFixed(1)} ${yy.toFixed(1)} q${(ww * 0.5).toFixed(1)} ${(-3 - r() * 3).toFixed(1)} ${ww.toFixed(1)} 0 `;
  }
  return <Path d={d} {...S(2.2, 0.5, WHITE)} />;
}

function Birds({ x, y, seed = 11, color = WHITE }: { x: number; y: number; seed?: number; color?: string }) {
  const r = rnd(seed);
  let d = '';
  for (let i = 0; i < 4; i++) {
    const bx = x + i * (14 + r() * 13);
    const by = y + (r() - 0.5) * 20;
    const w = 3.5 + r() * 2.5;
    d += `M${(bx - w).toFixed(1)} ${by.toFixed(1)} q${(w * 0.5).toFixed(1)} ${(-w * 0.7).toFixed(1)} ${w.toFixed(1)} 0 `;
    d += `M${bx.toFixed(1)} ${by.toFixed(1)} q${(w * 0.5).toFixed(1)} ${(-w * 0.7).toFixed(1)} ${w.toFixed(1)} 0 `;
  }
  return <Path d={d} {...S(1.5, 0.6, color)} />;
}

// ── land ─────────────────────────────────────────────────────────────────────

function ridgePts(yAt: (x: number) => number, x0 = -20, x1 = 420, step = 38): Array<[number, number]> {
  const pts: Array<[number, number]> = [];
  for (let x = x0; x <= x1; x += step) pts.push([x, yAt(x)]);
  return pts;
}

/** A ridge as a filled land mass — hills read as solid ground, not as wires. */
function Land({ yAt, fill, seed = 2, jit = 1.6 }: { yAt: (x: number) => number; fill: string; seed?: number; jit?: number }) {
  const d = `${hand(ridgePts(yAt), jit, seed)} L420 ${STAGE_H} L-20 ${STAGE_H} Z`;
  return <Path d={d} fill={fill} />;
}

function Ridge({ yAt, w = 2.4, o = 1, jit = 1.6, seed = 2, color = INK }: { yAt: (x: number) => number; w?: number; o?: number; jit?: number; seed?: number; color?: string }) {
  return <Path d={hand(ridgePts(yAt), jit, seed)} {...S(w, o, color)} />;
}

/**
 * A bare winter tree, grown recursively — each limb splits into two thinner,
 * shorter ones at a jittered angle. Recursion is what gives the reference photo
 * its fine natural crown; a hand-placed set of boughs never gets there.
 */
function bareBranches(x: number, y: number, ang: number, len: number, depth: number, r: () => number, out: string[]) {
  if (depth === 0 || len < 3) return;
  const x2 = x + Math.cos(ang) * len;
  const y2 = y + Math.sin(ang) * len;
  const bow = (r() - 0.5) * len * 0.24;
  out.push(`M${x.toFixed(1)} ${y.toFixed(1)} Q${((x + x2) / 2 + bow).toFixed(1)} ${((y + y2) / 2 - Math.abs(bow) * 0.4).toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`);
  const spread = 0.36 + r() * 0.42;
  const shrink = 0.68 + r() * 0.14;
  bareBranches(x2, y2, ang - spread, len * shrink, depth - 1, r, out);
  bareBranches(x2, y2, ang + spread * (0.7 + r() * 0.7), len * (shrink - 0.04), depth - 1, r, out);
  if (depth > 3 && r() > 0.55) bareBranches(x2, y2, ang + (r() - 0.5) * 0.3, len * 0.55, depth - 2, r, out);
}

function BareTree({ x, groundY, h = 150, seed = 21, color = INK }: { x: number; groundY: number; h?: number; seed?: number; color?: string }) {
  const r = rnd(seed);
  const out: string[] = [];
  bareBranches(x, groundY, -Math.PI / 2, h * 0.34, 6, r, out);
  return (
    <G>
      {/* trunk thick, crown thin — weight falls off with height */}
      <Path d={out.slice(0, 1).join(' ')} {...S(Math.max(2.4, h * 0.032), 1, color)} />
      <Path d={out.slice(1, 4).join(' ')} {...S(Math.max(1.8, h * 0.021), 1, color)} />
      <Path d={out.slice(4).join(' ')} {...S(Math.max(0.9, h * 0.011), 0.92, color)} />
    </G>
  );
}

/**
 * A great leafy tree: dark trunk with flared roots, and a canopy built from many
 * overlapping foliage clumps so the silhouette is dense and irregular rather
 * than one balloon.
 */
function LeafyTree({ x, groundY, h = 250, seed = 31 }: { x: number; groundY: number; h?: number; seed?: number }) {
  const r = rnd(seed);
  const topY = groundY - h;
  const cw = h * 0.38;
  const cy = topY + h * 0.3;
  const clumps: Array<[number, number, number]> = [];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const rr = cw * (0.5 + r() * 0.34);
    clumps.push([
      x + Math.cos(a) * cw * (0.52 + r() * 0.3),
      cy + Math.sin(a) * cw * (0.36 + r() * 0.22),
      rr * 0.56,
    ]);
  }
  clumps.push([x, cy, cw * 0.62]);
  clumps.push([x - cw * 0.3, cy + cw * 0.1, cw * 0.5]);
  clumps.push([x + cw * 0.32, cy - cw * 0.06, cw * 0.46]);
  let limbs = `M${(x - h * 0.035).toFixed(1)} ${groundY.toFixed(1)} Q${(x - 3).toFixed(1)} ${(groundY - h * 0.3).toFixed(1)} ${x.toFixed(1)} ${(cy + cw * 0.3).toFixed(1)} `;
  limbs += `M${(x + h * 0.035).toFixed(1)} ${groundY.toFixed(1)} Q${(x + 4).toFixed(1)} ${(groundY - h * 0.3).toFixed(1)} ${x.toFixed(1)} ${(cy + cw * 0.3).toFixed(1)} `;
  for (let i = 0; i < 4; i++) {
    const by = groundY - h * (0.4 + i * 0.07);
    const dir = i % 2 === 0 ? -1 : 1;
    limbs += `M${x.toFixed(1)} ${by.toFixed(1)} q${(dir * cw * 0.22).toFixed(1)} ${(-h * 0.05).toFixed(1)} ${(dir * cw * 0.36).toFixed(1)} ${(-h * 0.1).toFixed(1)} `;
  }
  let roots = '';
  for (let i = 0; i < 5; i++) {
    const dir = i < 2 ? -1 : 1;
    const sp = (0.3 + r() * 0.9) * h * 0.12 * dir;
    roots += `M${x.toFixed(1)} ${(groundY - h * 0.05).toFixed(1)} q${(sp * 0.6).toFixed(1)} ${(h * 0.03).toFixed(1)} ${sp.toFixed(1)} ${(h * 0.055).toFixed(1)} `;
  }
  const seams = clumps
    .slice(0, 9)
    .map(([cxx, cyy, rr]) => `M${(cxx - rr * 0.7).toFixed(1)} ${(cyy + rr * 0.25).toFixed(1)} q${(rr * 0.55).toFixed(1)} ${(-rr * 0.8).toFixed(1)} ${(rr * 1.05).toFixed(1)} ${(-rr * 0.05).toFixed(1)}`)
    .join(' ');
  return (
    <G>
      <Path d={limbs} {...S(Math.max(3, h * 0.03), 1, INK)} />
      <Path d={roots} {...S(Math.max(2, h * 0.018), 0.9, INK)} />
      {clumps.map(([cxx, cyy, rr], i) => (
        <Circle key={i} cx={cxx} cy={cyy} r={rr} fill={WHITE} />
      ))}
      <Path d={seams} {...S(1.3, 0.28, INK)} />
    </G>
  );
}

/** A line of tiny far trees on a ridge — depth, at almost no visual weight. */
function FarTrees({ x0, x1, yAt, n, seed, color = INK }: { x0: number; x1: number; yAt: (x: number) => number; n: number; seed: number; color?: string }) {
  const r = rnd(seed);
  const out: React.ReactElement[] = [];
  for (let i = 0; i < n; i++) {
    const x = x0 + (x1 - x0) * ((i + r() * 0.7) / n);
    const y = yAt(x);
    const h = 7 + r() * 8;
    const br: string[] = [];
    bareBranches(x, y, -Math.PI / 2, h * 0.44, 4, r, br);
    out.push(<Path key={i} d={br.join(' ')} {...S(1.1, 0.5, color)} />);
  }
  return <>{out}</>;
}

// ── the six scenes ───────────────────────────────────────────────────────────

export type Activity = 'walk' | 'kite' | 'swing' | 'sip' | 'picnic' | 'read';

export interface LaunchScene {
  key: string;
  Art: React.FC;
  activity: Activity;
  x: number;
  groundY: number;
  /** Stage units per rig unit. Small — the figure is a distant silhouette. */
  k: number;
  dir: 1 | -1;
  pivot?: { x: number; y: number };
  kite?: { x: number; y: number };
  /**
   * Walk only: the hill contour as PLAIN NUMBERS (y = base - sin((x-off)/per)*amp).
   * Deliberately not a function: the pose is solved inside a Reanimated worklet,
   * and a plain JS closure captured by a worklet is not callable there — it throws
   * "Object is not a function" and takes the app down.
   */
  groundWave?: { base: number; amp: number; off: number; per: number };
  /** Walk only: the span the figure loops across, off-screen at both ends. */
  walkSpan?: { from: number; to: number };
}

/** The figure is far away now, so it is small — a silhouette on the hill. */
const FAR = 0.6;

// 1 · Bare winter trees on a long ridge, with a small walker crossing it.
const WALK_WAVE = { base: 520, amp: 16, off: 40, per: 170 };
const walkYAt = (x: number) => WALK_WAVE.base - Math.sin((x - WALK_WAVE.off) / WALK_WAVE.per) * WALK_WAVE.amp;
const WalkArt = () => (
  <>
    <SkyWash k="w" />
    <Streaks x={40} y={96} w={150} n={4} seed={301} />
    <Cumulus x={272} y={172} s={0.9} seed={302} />
    <Birds x={70} y={220} seed={303} />
    <Ridge yAt={(x) => 404 + Math.sin(x / 95) * 12} w={1.6} o={0.25} jit={2.4} seed={304} color={WHITE} />
    <Land yAt={(x) => 454 + Math.cos((x + 60) / 120) * 16} fill={MID} seed={305} />
    <FarTrees x0={30} x1={368} yAt={(x) => 454 + Math.cos((x + 60) / 120) * 16} n={9} seed={306} />
    <Land yAt={walkYAt} fill={PAPER} seed={307} />
    <Ridge yAt={walkYAt} w={2.4} seed={308} />
    <BareTree x={58} groundY={walkYAt(58) + 4} h={186} seed={309} />
    <BareTree x={336} groundY={walkYAt(336) + 4} h={128} seed={310} />
    <Path d={tufts(20, 380, walkYAt, 30, 311)} {...S(1.2, 0.4)} />
    <Path d={hatch(30, 552, 370, 556, 15, 8, 312, 0.5)} {...S(1.1, 0.12)} />
  </>
);

// 2 · The biggest sky of the six — towering cumulus, and a kite in it.
const KITE_G = (x: number) => 528 - Math.sin((x + 20) / 175) * 12;
const KiteArt = () => (
  <>
    <SkyWash k="k" />
    <Cumulus x={116} y={154} s={1.15} seed={321} />
    <Cumulus x={306} y={212} s={0.78} seed={322} />
    <Streaks x={30} y={258} w={130} n={3} seed={323} />
    <Birds x={238} y={124} seed={324} />
    <Ridge yAt={(x) => 426 + Math.sin((x - 30) / 105) * 10} w={1.6} o={0.24} jit={2.4} seed={325} color={WHITE} />
    <Land yAt={(x) => 478 + Math.cos((x + 20) / 135) * 14} fill={MID} seed={326} />
    <FarTrees x0={232} x1={374} yAt={(x) => 478 + Math.cos((x + 20) / 135) * 14} n={6} seed={327} />
    <Land yAt={KITE_G} fill={PAPER} seed={328} />
    <Ridge yAt={KITE_G} w={2.4} seed={329} />
    <Path d={tufts(20, 380, KITE_G, 32, 330)} {...S(1.2, 0.4)} />
    <Path d={hand([[56, 528], [56, 502]], 1, 331)} {...S(2, 0.6)} />
    <Path d={hand([[78, 530], [78, 508]], 1, 332)} {...S(2, 0.55)} />
    <Path d={hand([[54, 510], [80, 514]], 1, 333)} {...S(1.4, 0.45)} />
  </>
);

// 3 · The reference's great tree, with a tire swinging under its bough.
export const SWING_PIVOT = { x: 216, y: 382 };
const SWING_G = (x: number) => 552 - Math.sin((x - 10) / 165) * 10;
const SwingArt = () => (
  <>
    <SkyWash k="s" />
    <Cumulus x={306} y={144} s={0.85} seed={341} />
    <Streaks x={40} y={200} w={120} n={3} seed={342} />
    <Birds x={300} y={236} seed={343} />
    <Ridge yAt={(x) => 432 + Math.sin((x + 40) / 125) * 12} w={1.6} o={0.24} jit={2.2} seed={344} color={WHITE} />
    <Land yAt={(x) => 492 + Math.cos((x - 20) / 130) * 12} fill={MID} seed={345} />
    <FarTrees x0={262} x1={378} yAt={(x) => 492 + Math.cos((x - 20) / 130) * 12} n={5} seed={346} />
    <Land yAt={SWING_G} fill={PAPER} seed={347} />
    <Ridge yAt={SWING_G} w={2.4} seed={348} />
    <LeafyTree x={80} groundY={SWING_G(80) + 2} h={202} seed={349} />
    {/* the bough the rope hangs from, reaching out to SWING_PIVOT */}
    <Path d={hand([[96, 392], [156, 380], [216, 382]], 2.2, 350)} {...S(3.4)} />
    <Path d={tufts(150, 380, SWING_G, 18, 351)} {...S(1.2, 0.4)} />
  </>
);

// 4 · A chair on the crest under a big sky.
const SIP_G = (x: number) => 540 - Math.cos((x - 60) / 155) * 12;
const SipArt = () => (
  <>
    <SkyWash k="p" />
    <Cumulus x={100} y={166} s={1.0} seed={361} />
    <Cumulus x={312} y={128} s={0.68} seed={362} />
    <Streaks x={210} y={242} w={140} n={3} seed={363} />
    <Birds x={60} y={258} seed={364} />
    <Ridge yAt={(x) => 420 + Math.sin(x / 110) * 10} w={1.6} o={0.24} jit={2.3} seed={365} color={WHITE} />
    <Land yAt={(x) => 484 + Math.cos((x - 40) / 125) * 14} fill={MID} seed={366} />
    <FarTrees x0={250} x1={378} yAt={(x) => 484 + Math.cos((x - 40) / 125) * 14} n={5} seed={367} />
    <Land yAt={SIP_G} fill={PAPER} seed={368} />
    <Ridge yAt={SIP_G} w={2.4} seed={369} />
    <BareTree x={54} groundY={SIP_G(54) + 3} h={150} seed={370} />
    <Path d={tufts(90, 380, SIP_G, 24, 371)} {...S(1.2, 0.4)} />
    {/* The chair, drawn to the SITTER, not to the ground. The seat has to meet the
        hips: the figure's pelvis lands at y 519 and the ground is at 532, so a
        seat drawn at 531-535 left him hovering 13px above it with the chair
        reading as a stool behind his knees. Seat at 520, legs down to the grass,
        back rising behind his spine. Measured, not eyeballed. */}
    <G>
      {/* seat plank, front edge a touch lower so it reads as a surface */}
      <Path d={hand([[184, 521], [214, 519]], 1.1, 372)} {...S(2.4)} />
      <Path d={hand([[185, 524], [214, 522]], 1.1, 379)} {...S(1.4, 0.5)} />
      {/* back uprights + slats, behind the spine */}
      <Path d={hand([[186, 521], [180, 486]], 1.1, 373)} {...S(2.2)} />
      <Path d={hand([[190, 521], [185, 488]], 1, 380)} {...S(1.6, 0.55)} />
      <Path d={hand([[181, 496], [187, 495]], 0.7, 376)} {...S(1.6, 0.75)} />
      <Path d={hand([[182, 505], [188, 504]], 0.7, 377)} {...S(1.6, 0.75)} />
      {/* near legs to the grass, far legs faint for depth */}
      <Path d={hand([[188, 522], [186, 533]], 0.8, 374)} {...S(2)} />
      <Path d={hand([[211, 520], [214, 532]], 0.8, 375)} {...S(2)} />
      <Path d={hand([[193, 523], [192, 533]], 0.8, 381)} {...S(1.5, 0.45)} />
      <Path d={hand([[207, 521], [209, 532]], 0.8, 382)} {...S(1.5, 0.45)} />
      {/* stretcher between the near legs */}
      <Path d={hand([[187, 528], [213, 527]], 0.8, 383)} {...S(1.3, 0.5)} />
    </G>
  </>
);

// 5 · A picnic in the shade of the great tree.
const PIC_G = (x: number) => 546 - Math.sin((x + 80) / 175) * 9;
const PicnicArt = () => (
  <>
    <SkyWash k="n" />
    <Cumulus x={132} y={152} s={0.95} seed={381} />
    <Streaks x={252} y={218} w={130} n={4} seed={382} />
    <Birds x={198} y={258} seed={383} />
    <Ridge yAt={(x) => 426 + Math.cos((x + 30) / 120) * 12} w={1.6} o={0.24} jit={2.3} seed={384} color={WHITE} />
    <Land yAt={(x) => 488 + Math.sin((x - 50) / 135) * 12} fill={MID} seed={385} />
    <FarTrees x0={26} x1={140} yAt={(x) => 488 + Math.sin((x - 50) / 135) * 12} n={5} seed={386} />
    <Land yAt={PIC_G} fill={PAPER} seed={387} />
    <Ridge yAt={PIC_G} w={2.4} seed={388} />
    <LeafyTree x={336} groundY={PIC_G(336) + 2} h={190} seed={389} />
    <Path d={tufts(20, 250, PIC_G, 16, 390)} {...S(1.2, 0.4)} />
    {/* The blanket has to be UNDER him. Drawn at 545-558 its whole top edge sat
        below the ground line at 537 — he was sitting on the grass behind it with
        a rug laid out in front. It now starts just behind his hips (533) and runs
        forward past his feet, wide enough that a reclining figure and the basket
        both sit on the cloth. */}
    <Path d={hand([[138, 537], [190, 533], [242, 537]], 1.2, 391)} {...S(2)} />
    {/* the near edge sags between its corners the way cloth does — drawn as a
        straight run it read as the gunwale of a boat */}
    <Path d={hand([[139, 537], [150, 552], [190, 556], [232, 552], [242, 537]], 1.2, 392)} {...S(1.7)} />
    {/* woven checks, following the cloth rather than the screen */}
    <Path
      d={`M160 535 L165 552 M186 533 L189 555 M212 534 L214 553
          M144 542 L238 542 M149 549 L233 549`}
      {...S(1.1, 0.24)}
    />
    {/* fringe, following the sag rather than a flat line */}
    <Path d={`M152 553 L151 557 M170 555 L169 559 M190 556 L190 560 M212 555 L213 559 M230 552 L231 556`} {...S(1.1, 0.4)} />
    {/* the basket, sitting ON the cloth with a lid and a handle over the top */}
    <G>
      <Path d={hand([[210, 536], [234, 536], [231, 549], [213, 549], [210, 536]], 1, 393)} {...S(1.9)} />
      <Path d={hand([[209, 536], [235, 536]], 0.8, 395)} {...S(2.1)} />
      <Path d={hand([[216, 536], [222, 527], [228, 536]], 1, 394)} {...S(1.6)} />
      <Path d={`M216 540 L215 547 M222 540 L222 547 M228 540 L229 547`} {...S(1.1, 0.35)} />
    </G>
  </>
);

// 6 · Reading under bare winter branches.
const READ_G = (x: number) => 544 - Math.cos((x - 30) / 170) * 10;
const ReadArt = () => (
  <>
    <SkyWash k="r" />
    <Cumulus x={280} y={162} s={0.9} seed={401} />
    <Streaks x={40} y={218} w={140} n={4} seed={402} />
    <Birds x={78} y={142} seed={403} />
    <Ridge yAt={(x) => 432 + Math.sin((x + 70) / 130) * 10} w={1.6} o={0.24} jit={2.3} seed={404} color={WHITE} />
    <Land yAt={(x) => 494 + Math.cos((x + 10) / 145) * 12} fill={MID} seed={405} />
    <FarTrees x0={246} x1={378} yAt={(x) => 494 + Math.cos((x + 10) / 145) * 12} n={5} seed={406} />
    <Land yAt={READ_G} fill={PAPER} seed={407} />
    <Ridge yAt={READ_G} w={2.4} seed={408} />
    <BareTree x={98} groundY={READ_G(98) + 3} h={232} seed={409} />
    <Path d={tufts(150, 380, READ_G, 20, 410)} {...S(1.2, 0.4)} />
    <Path d={`M262 556 q4 -4 8 -1 M292 560 q5 -3 8 1`} {...S(1.2, 0.28)} />
  </>
);

export const LAUNCH_SCENES: LaunchScene[] = [
  {
    key: 'walk', Art: WalkArt, activity: 'walk', x: 0, groundY: walkYAt(0), k: FAR, dir: 1,
    groundWave: WALK_WAVE, walkSpan: { from: -60, to: 460 },
  },
  { key: 'kite', Art: KiteArt, activity: 'kite', x: 172, groundY: KITE_G(172), k: FAR, dir: 1, kite: { x: 300, y: 214 } },
  { key: 'swing', Art: SwingArt, activity: 'swing', x: SWING_PIVOT.x, groundY: 498, k: FAR * 0.95, dir: 1, pivot: SWING_PIVOT },
  { key: 'sip', Art: SipArt, activity: 'sip', x: 198, groundY: SIP_G(198), k: FAR, dir: 1 },
  { key: 'picnic', Art: PicnicArt, activity: 'picnic', x: 168, groundY: PIC_G(168), k: FAR, dir: 1 },
  { key: 'read', Art: ReadArt, activity: 'read', x: 210, groundY: READ_G(210), k: FAR, dir: 1 },
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
