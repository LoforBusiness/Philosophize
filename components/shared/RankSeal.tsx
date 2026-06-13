import React from 'react';
import Svg, { Circle, Path, Line, G } from 'react-native-svg';
import Glyph, { type GlyphName } from './Glyph';

// An engraved wax-seal medallion. The rank's hand-drawn Glyph sits at the centre
// of a coin-relief ring whose ornament ESCALATES by tier (1→5): sparse double
// ring at the bottom, gaining a laurel wreath, reeded edge, a ribbon, then a
// radiant crown of rays at the summit. Prestige is read as line density, never
// colour — so it stays pure black-and-white. Three states:
//   • earned  — full ink, embossed
//   • current — full ink + a progress arc to the next rank (the hero)
//   • locked  — a faint slate silhouette that pulls the eye upward
//
// All geometry lives in a 100×100 viewBox centred on (50,50).

const INK = '#1A1A1A';
const DISC = '#EFEEE8'; // faint wax fill so the emboss highlight/shadow reads
const SHADOW = 'rgba(20,20,20,0.22)';
const HILITE = 'rgba(255,255,255,0.85)';
const GHOST = '#AAB1BC'; // locked linework (cool slate)
const GHOST_DISC = '#ECEDF0';

export type SealState = 'earned' | 'current' | 'locked';

interface Props {
  glyph: GlyphName;
  tier: number; // 1..5 — drives ornament density
  state: SealState;
  size?: number;
  progress?: number | null; // 0..1, draws a progress ring (hero/current)
}

const C = 50; // centre
const rad = (deg: number) => (Math.PI / 180) * deg;
const pt = (r: number, deg: number): [number, number] => [
  C + r * Math.cos(rad(deg)),
  C + r * Math.sin(rad(deg)),
];
// Arc path between two angles (degrees; SVG: 0=E, 90=S, -90=N). Clockwise.
function arcPath(r: number, start: number, end: number) {
  const [x1, y1] = pt(r, start);
  const [x2, y2] = pt(r, end);
  const large = Math.abs(end - start) > 180 ? 1 : 0;
  const sweep = end > start ? 1 : 0;
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${large} ${sweep} ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

// A single laurel leaf: a small pointed almond, drawn at the origin pointing +x,
// then placed/rotated by the caller's <G>.
function Leaf({ x, y, rot, len, color, w }: { x: number; y: number; rot: number; len: number; color: string; w: number }) {
  const d = `M0 0 Q ${len * 0.5} ${-len * 0.42} ${len} 0 Q ${len * 0.5} ${len * 0.42} 0 0 Z`;
  return <Path d={d} fill={color} fillOpacity={0.9} transform={`translate(${x} ${y}) rotate(${rot})`} stroke={color} strokeWidth={w} strokeLinejoin="round" />;
}

// One laurel branch hugging the lower ring, sweeping up a side.
function LaurelBranch({ count, dir, r, color, w }: { count: number; dir: 1 | -1; r: number; color: string; w: number }) {
  // bottom of ring = 90°; sweep up toward the side. dir=1 → right side, dir=-1 → left.
  const start = 90;
  const span = 78; // degrees up the side
  const leaves = [];
  for (let i = 0; i < count; i++) {
    const t = (i + 0.5) / count;
    const a = start - dir * (12 + t * span); // skip the very bottom, climb the side
    const [lx, ly] = pt(r, a);
    // leaf lies tangent to the ring, tipping outward/up
    const rot = a + dir * 92;
    const len = 8.5 - t * 2.2;
    leaves.push(<Leaf key={i} x={lx} y={ly} rot={rot} len={len} color={color} w={w} />);
  }
  return <G>{leaves}</G>;
}

export default function RankSeal({ glyph, tier, state, size = 96, progress = null }: Props) {
  const locked = state === 'locked';
  const ink = locked ? GHOST : INK;
  const disc = locked ? GHOST_DISC : DISC;
  const t = Math.max(1, Math.min(5, tier));

  const Rout = 33; // outer ring radius
  const Rin = 26; // inner ring radius
  const glyphSize = size * 0.34;

  // reeded edge ticks (tier ≥ 3)
  const ticks = [];
  if (!locked && t >= 3) {
    const n = 36;
    for (let i = 0; i < n; i++) {
      const a = (360 / n) * i;
      const [x1, y1] = pt(Rout - 1.5, a);
      const [x2, y2] = pt(Rout - 4.2, a);
      ticks.push(<Line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={ink} strokeWidth={0.8} strokeOpacity={0.7} />);
    }
  }

  // radiant rays around the crown (tier 5)
  const rays = [];
  if (!locked && t >= 5) {
    const n = 24;
    for (let i = 0; i < n; i++) {
      const a = (360 / n) * i;
      const [x1, y1] = pt(Rout + 3, a);
      const [x2, y2] = pt(Rout + (i % 2 ? 8.5 : 5.5), a);
      rays.push(<Line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={ink} strokeWidth={1.1} strokeLinecap="round" />);
    }
  }

  // laurel leaf count per tier
  const leafCount = locked ? 0 : t === 2 ? 3 : t === 3 ? 4 : t === 4 ? 5 : t >= 5 ? 6 : 0;

  // progress ring geometry (start at top, clockwise)
  const pr = progress == null ? null : Math.max(0, Math.min(1, progress));
  const Rprog = Rout + 4.5;

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* radiant crown (summit) */}
      {rays}

      {/* laurel wreath */}
      {leafCount > 0 && (
        <>
          <LaurelBranch count={leafCount} dir={1} r={Rout + 1.5} color={ink} w={0.5} />
          <LaurelBranch count={leafCount} dir={-1} r={Rout + 1.5} color={ink} w={0.5} />
          {/* tie at the bottom */}
          <Path d={arcPath(Rout + 2.5, 84, 96)} stroke={ink} strokeWidth={1.4} fill="none" strokeLinecap="round" />
        </>
      )}

      {/* coin relief: shadow disc, wax disc, then highlight */}
      <Circle cx={C + 0.9} cy={C + 1.1} r={Rout} fill={SHADOW} />
      <Circle cx={C} cy={C} r={Rout} fill={disc} stroke={ink} strokeWidth={locked ? 1.4 : 2.4} strokeDasharray={locked ? '3 3' : undefined} />
      {!locked && <Path d={arcPath(Rout, 170, 320)} stroke={HILITE} strokeWidth={1.6} fill="none" strokeLinecap="round" />}

      {/* reeded edge */}
      {ticks}

      {/* inner ring */}
      <Circle cx={C} cy={C} r={Rin} fill="none" stroke={ink} strokeWidth={locked ? 1 : 1.4} strokeOpacity={locked ? 0.8 : 0.9} />
      {!locked && t >= 4 && <Circle cx={C} cy={C} r={Rin - 2.4} fill="none" stroke={ink} strokeWidth={0.8} strokeOpacity={0.55} />}

      {/* centre glyph (ghosted when locked) */}
      <G x={C - glyphSize / 2} y={C - glyphSize / 2} opacity={locked ? 0.75 : 1}>
        <Glyph name={glyph} size={glyphSize} color={ink} />
      </G>

      {/* progress ring (hero/current) */}
      {pr != null && (
        <>
          <Circle cx={C} cy={C} r={Rprog} fill="none" stroke={INK} strokeWidth={2} strokeOpacity={0.12} />
          {pr > 0.001 && (
            <Path d={arcPath(Rprog, -90, -90 + 360 * pr)} stroke={INK} strokeWidth={2.6} fill="none" strokeLinecap="round" />
          )}
        </>
      )}
    </Svg>
  );
}
