import * as React from 'react';
import { StyleSheet } from 'react-native';
import Svg, {
  Defs,
  RadialGradient,
  Stop,
  Rect,
  G,
  Path,
  Circle,
  Ellipse,
  Line,
} from 'react-native-svg';
import type { SceneMeta } from './sceneContext';

// Full-bleed black-and-white illustrated lesson scenes — bold manga-style ink
// clouds on black skies, bare winter trees, a lone figure under a great tree —
// the storybook style of the reference art. Each scene deliberately leaves one
// large blank region (its `zone`) where the card's words fade in.

const VB_W = 380;
const VB_H = 800;

const PAPER = '#F2F1EC';
const WHITE = '#F6F5F0';
const INK = '#161613';
const NIGHT = '#0E0E0E';

const stroke = (color: string, w: number, o = 1) => ({
  fill: 'none' as const,
  stroke: color,
  strokeWidth: w,
  strokeOpacity: o,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

// ─── shared motifs ───────────────────────────────────────────────────────────

// A billowing manga cumulus: a cluster of white puffs over a flat base, with
// thin dark arcs tracing the inner puff boundaries for depth.
function Cumulus({ x, y, s = 1, w = 200 }: { x: number; y: number; s?: number; w?: number }) {
  const puffs: Array<[number, number, number, number]> = [
    [-w * 0.38, 6, w * 0.2, w * 0.13],
    [-w * 0.16, -16, w * 0.19, w * 0.14],
    [0.02 * w, -24, w * 0.17, w * 0.13],
    [w * 0.21, -12, w * 0.18, w * 0.13],
    [w * 0.4, 8, w * 0.17, w * 0.11],
    [0, 8, w * 0.3, w * 0.15],
  ];
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      {puffs.map(([px, py, rx, ry], i) => (
        <Ellipse key={i} cx={px} cy={py} rx={rx} ry={ry} fill={WHITE} />
      ))}
      <Rect x={-w * 0.52} y={6} width={w * 1.04} height={w * 0.15} rx={w * 0.05} fill={WHITE} />
      {/* inner shading arcs along the puff seams */}
      <Path
        d={`M${-w * 0.46} 10 Q${-w * 0.34} ${-6} ${-w * 0.22} 4
            M${-w * 0.1} 2 Q${0.02 * w} ${-14} ${w * 0.14} ${-2}
            M${w * 0.22} 6 Q${w * 0.32} ${-4} ${w * 0.42} 6`}
        {...stroke(NIGHT, 2.2, 0.5)}
      />
      <Path
        d={`M${-w * 0.26} ${-16} Q${-w * 0.16} ${-26} ${-w * 0.04} ${-20}
            M${w * 0.06} ${-20} Q${w * 0.16} ${-30} ${w * 0.26} ${-18}`}
        {...stroke(NIGHT, 2, 0.4)}
      />
    </G>
  );
}

// A thin horizontal cloud streak.
function Wisp({ x, y, w = 110, o = 0.7, flip = false }: { x: number; y: number; w?: number; o?: number; flip?: boolean }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${flip ? -1 : 1} 1)`}>
      <Path d={`M0 0 q${w * 0.35} -7 ${w} -4 q${-w * 0.3} 9 ${-w} 4 Z`} fill={WHITE} fillOpacity={o} />
      <Path d={`M${w * 0.18} 10 q${w * 0.25} -5 ${w * 0.62} -3 q${-w * 0.2} 7 ${-w * 0.62} 3 Z`} fill={WHITE} fillOpacity={o * 0.6} />
    </G>
  );
}

function Stars({ pts, color = WHITE }: { pts: Array<[number, number, number?]>; color?: string }) {
  return (
    <G>
      {pts.map(([x, y, r], i) => (
        <Circle key={i} cx={x} cy={y} r={r ?? 1.5} fill={color} fillOpacity={0.85} />
      ))}
    </G>
  );
}

function Bird({ x, y, s = 1, color = INK, o = 0.8 }: { x: number; y: number; s?: number; color?: string; o?: number }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Path d="M-9 0 Q-4 -7 0 -1 Q4 -7 9 0" {...stroke(color, 1.8, o)} />
    </G>
  );
}

// A bare winter tree — winding trunk with fanning branches and fine twigs.
function BareTree({ x, y, s = 1, flip = false, color = INK }: { x: number; y: number; s?: number; flip?: boolean; color?: string }) {
  // Drawn in local coords with the trunk base at (0,0), crown rising to y≈-320.
  const limbs: Array<[string, number]> = [
    // trunk
    ['M0 0 C-2 -50 -5 -95 -7 -140 C-9 -185 -10 -215 -11 -245', 5],
    // low left limb, forking twice
    ['M-8 -130 C-26 -156 -44 -172 -64 -184', 3],
    ['M-44 -172 C-54 -186 -60 -194 -70 -202', 1.5],
    ['M-64 -184 C-76 -188 -86 -190 -98 -190', 1.2],
    ['M-30 -160 C-36 -172 -38 -180 -44 -190', 1.2],
    // low right limb
    ['M-9 -155 C8 -176 24 -190 44 -200', 2.8],
    ['M24 -190 C32 -202 38 -210 46 -220', 1.5],
    ['M44 -200 C56 -202 66 -202 78 -200', 1.2],
    ['M8 -178 C12 -190 14 -198 18 -208', 1.1],
    // mid left
    ['M-10 -185 C-24 -208 -38 -222 -56 -232', 2.4],
    ['M-38 -222 C-46 -234 -50 -242 -58 -250', 1.3],
    ['M-56 -232 C-66 -236 -74 -238 -84 -238', 1.1],
    // mid right
    ['M-10 -210 C2 -232 14 -246 28 -258', 2.2],
    ['M14 -246 C22 -258 26 -266 32 -276', 1.2],
    ['M28 -258 C38 -262 46 -262 56 -262', 1],
    // crown
    ['M-11 -235 C-18 -258 -26 -274 -36 -288', 1.8],
    ['M-26 -274 C-34 -284 -38 -290 -46 -296', 1],
    ['M-11 -245 C-12 -268 -14 -286 -16 -304', 2],
    ['M-14 -286 C-20 -298 -24 -304 -30 -314', 1.1],
    ['M-15 -292 C-10 -304 -7 -312 -2 -322', 1.1],
    ['M-11 -240 C-4 -262 4 -278 14 -294', 1.5],
    ['M4 -278 C8 -286 12 -292 16 -298', 1],
  ];
  return (
    <G transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      {limbs.map(([d, w], i) => (
        <Path key={i} d={d} {...stroke(color, w)} />
      ))}
    </G>
  );
}

// A small standing silhouette (head + long coat), facing right.
function Figure({ x, y, s = 1, color = INK, cane = false }: { x: number; y: number; s?: number; color?: string; cane?: boolean }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Circle cx={0} cy={-34} r={5.5} fill={color} />
      <Path d="M-7 -26 Q0 -31 7 -26 L10 8 Q0 13 -9 8 Z" fill={color} />
      <Path d="M-4 8 L-5 22 M5 8 L6 22" {...stroke(color, 2.6)} />
      {cane ? <Path d="M8 -14 L15 22" {...stroke(color, 1.8)} /> : null}
    </G>
  );
}

// ─── scene chrome ────────────────────────────────────────────────────────────

function Scene({ k, dark = false, children }: { k: string; dark?: boolean; children: React.ReactNode }) {
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="xMidYMid slice"
      style={StyleSheet.absoluteFill}
    >
      {dark ? (
        <Rect x={0} y={0} width={VB_W} height={VB_H} fill={NIGHT} />
      ) : (
        <>
          <Defs>
            <RadialGradient id={`sky-${k}`} cx="50%" cy="30%" rx="90%" ry="80%">
              <Stop offset="0%" stopColor="#F7F6F1" />
              <Stop offset="60%" stopColor={PAPER} />
              <Stop offset="100%" stopColor="#DEDDD6" />
            </RadialGradient>
          </Defs>
          <Rect x={0} y={0} width={VB_W} height={VB_H} fill={`url(#sky-${k})`} />
        </>
      )}
      {children}
    </Svg>
  );
}

// ─── the twelve scenes ───────────────────────────────────────────────────────

// 1 · Night Clouds — towering white cumulus against a black sky.
const NightClouds = () => (
  <Scene k="nc" dark>
    <Stars pts={[[140, 152], [196, 118, 1.2], [252, 168], [92, 226, 1.2], [310, 214, 1.2]]} />
    <Cumulus x={356} y={112} w={170} />
    <Cumulus x={-4} y={170} w={130} />
    <Wisp x={6} y={206} w={120} o={0.55} />
    <Wisp x={262} y={172} w={118} o={0.5} flip />
    <Wisp x={20} y={566} w={96} o={0.4} />
    {/* the great bank along the bottom */}
    <Path
      d="M0 672 Q56 650 118 666 Q198 682 262 662 Q322 648 380 666 L380 800 L0 800 Z"
      fill={WHITE}
    />
    <Cumulus x={66} y={628} w={190} />
    <Cumulus x={224} y={592} w={236} />
    <Cumulus x={352} y={640} w={176} />
    <Path d="M60 716 Q104 700 150 712 M210 722 Q258 706 304 716" {...stroke(NIGHT, 2.2, 0.35)} />
  </Scene>
);

// 2 · Winter Trees — two bare trees over a quiet hedgerow hill.
const WinterTrees = () => (
  <Scene k="wt">
    <Path d="M0 664 Q190 628 380 668 L380 800 L0 800 Z" fill="#E3E2DC" />
    <Path d="M0 664 Q190 628 380 668" {...stroke(INK, 1.8, 0.5)} />
    {/* field rows curving with the hill */}
    <Path d="M0 706 Q190 672 380 708 M0 748 Q190 716 380 750" {...stroke(INK, 1.2, 0.22)} />
    <Path d="M24 690 l0 -8 M52 684 l0 -8 M82 678 l0 -7" {...stroke(INK, 1.6, 0.4)} />
    <BareTree x={252} y={656} s={1} />
    <BareTree x={108} y={668} s={0.62} flip />
  </Scene>
);

// 3 · The Lone Tree — a figure beneath a great tree, gazing into the distance.
const LoneTree = () => (
  <Scene k="lt">
    {/* hill the tree stands on */}
    <Path d="M0 540 Q110 470 218 526 Q300 566 380 648 L380 800 L0 800 Z" fill="#8F8F88" />
    <Path d="M0 540 Q110 470 218 526 Q300 566 380 648" {...stroke(INK, 2, 0.55)} />
    <Path d="M236 560 q22 14 40 32 M268 596 q18 16 32 34" {...stroke(INK, 1.4, 0.3)} />
    {/* roots over the crest */}
    <Path d="M76 512 q-10 16 -26 24 M96 512 q2 18 -6 32 M112 510 q12 14 10 30" {...stroke(INK, 2.6, 0.7)} />
    {/* trunk + canopy */}
    <Path d="M88 512 C86 478 84 452 86 420 L104 420 C108 452 108 478 108 512 Z" fill="#232320" />
    <Path d="M96 446 C70 436 56 420 44 400" {...stroke('#232320', 7)} />
    <Path d="M98 440 C122 426 134 414 146 396" {...stroke('#232320', 6)} />
    <G>
      {[
        [56, 366, 52, 40],
        [104, 344, 56, 42],
        [148, 374, 46, 36],
        [36, 396, 38, 30],
        [100, 392, 64, 44],
        [156, 404, 40, 30],
      ].map(([cx, cy, rx, ry], i) => (
        <Ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} fill="#232320" />
      ))}
      {/* leaf-mass highlights */}
      <Path d="M52 348 Q72 330 96 334 M112 322 Q134 314 150 326" {...stroke('#8F8F88', 2.6, 0.8)} />
      <Path d="M40 386 Q56 372 74 376 M126 360 Q146 352 160 360" {...stroke('#8F8F88', 2.2, 0.6)} />
    </G>
    <Figure x={152} y={520} s={1} color="#232320" />
  </Scene>
);

// 4 · Moon over the Peaks — a full moon above a jagged snowlit ridge.
const MoonPeaks = () => (
  <Scene k="mp" dark>
    <Circle cx={84} cy={176} r={52} fill={WHITE} />
    <Circle cx={68} cy={162} r={9} fill={NIGHT} fillOpacity={0.14} />
    <Circle cx={100} cy={194} r={6} fill={NIGHT} fillOpacity={0.12} />
    <Circle cx={94} cy={154} r={4} fill={NIGHT} fillOpacity={0.1} />
    <Stars pts={[[210, 130], [260, 178, 1.2], [318, 136], [346, 218, 1.2], [40, 260, 1.2], [300, 256]]} />
    {/* back ridge */}
    <Path d="M0 648 L70 588 L128 636 L196 560 L262 626 L324 576 L380 622" {...stroke(WHITE, 1.6, 0.4)} />
    {/* main ridge */}
    <Path
      d="M0 712 L58 620 L108 678 L172 576 L228 660 L286 600 L342 672 L380 638 L380 800 L0 800 Z"
      fill={NIGHT}
      stroke={WHITE}
      strokeWidth={2.6}
    />
    {/* snow hatching under the crests */}
    <Path d="M58 626 l10 18 M64 642 l8 14 M172 584 l10 18 M178 600 l9 15 M286 608 l9 16 M292 622 l8 14" {...stroke(WHITE, 1.6, 0.6)} />
  </Scene>
);

// 5 · The Open Sea — a small sail on a long horizon.
const SeaSail = () => (
  <Scene k="ss">
    <Circle cx={62} cy={108} r={26} {...stroke(INK, 2, 0.5)} />
    <Bird x={290} y={150} s={0.8} o={0.5} />
    <Bird x={320} y={170} s={0.6} o={0.4} />
    <Line x1={0} y1={600} x2={380} y2={600} {...stroke(INK, 1.8, 0.8)} />
    {/* boat */}
    <Path d="M242 598 Q260 606 282 598 L276 590 L248 590 Z" fill={INK} />
    <Line x1={262} y1={590} x2={262} y2={548} {...stroke(INK, 2)} />
    <Path d="M262 548 L286 586 L262 586 Z" fill={INK} />
    <Path d="M250 612 q12 5 30 1" {...stroke(INK, 1.4, 0.3)} />
    {/* waves */}
    {[626, 654, 686, 722, 762].map((y, r) => (
      <Path
        key={y}
        d={`M${r % 2 === 0 ? 8 : 28} ${y} ${'q 11 -9 22 0 t 22 0 t 22 0 t 22 0 t 22 0 t 22 0 t 22 0 t 22 0 t 22 0 t 22 0 t 22 0 t 22 0 t 22 0 t 22 0 t 22 0'}`}
        {...stroke(INK, 1.6, 0.3 + r * 0.1)}
      />
    ))}
  </Scene>
);

// 6 · The Field Path — a winding path toward the horizon.
const FieldPath = () => (
  <Scene k="fp">
    <Path d="M0 648 Q120 620 230 642 T380 636" {...stroke(INK, 1.6, 0.45)} />
    {/* the path, tapering to its vanishing point */}
    <Path d="M158 800 C176 738 204 694 234 652" {...stroke(INK, 2.2, 0.7)} />
    <Path d="M282 800 C264 742 256 696 244 652" {...stroke(INK, 2.2, 0.7)} />
    <Path d="M192 760 q28 6 58 0 M210 712 q20 5 42 0 M224 676 q12 4 26 0" {...stroke(INK, 1.4, 0.3)} />
    {/* fence shrinking with distance */}
    {[[44, 712, 16], [78, 692, 13], [106, 676, 10], [128, 664, 8]].map(([x, y, h], i) => (
      <Line key={i} x1={x} y1={y} x2={x} y2={y - h} {...stroke(INK, 2, 0.6)} />
    ))}
    <Path d="M44 704 L128 658 M44 710 L128 663" {...stroke(INK, 1.2, 0.4)} />
    {/* grass tufts */}
    <Path d="M148 770 q-4 -12 -10 -16 M150 772 q1 -13 -2 -19 M152 772 q6 -10 12 -13" {...stroke(INK, 1.4, 0.5)} />
    <Path d="M296 742 q-4 -10 -9 -13 M299 744 q1 -11 -1 -16 M301 744 q5 -8 10 -11" {...stroke(INK, 1.4, 0.5)} />
    <Bird x={296} y={118} s={0.85} o={0.55} />
    <Bird x={326} y={140} s={0.65} o={0.45} />
    <Bird x={270} y={156} s={0.5} o={0.35} />
  </Scene>
);

// 7 · Rain — sheets of rain from a low cloud, one umbrella below.
const Rain = () => (
  <Scene k="rn" dark>
    {/* storm clouds drifting in from the edges, clear of the header bar */}
    <Cumulus x={-10} y={186} w={150} />
    <Cumulus x={388} y={150} w={160} />
    {/* rain — heavy at the sides, sparing the centre for the words */}
    {[
      [26, 280], [58, 330], [34, 392], [66, 450], [30, 510], [62, 570], [38, 630],
      [318, 250], [350, 304], [326, 366], [356, 432], [330, 494], [358, 556], [334, 618],
      [180, 600], [226, 648], [142, 652],
    ].map(([x, y], i) => (
      <Line key={i} x1={x} y1={y} x2={x - 7} y2={y + 26} {...stroke(WHITE, 1.8, 0.45)} />
    ))}
    {/* umbrella figure */}
    <Path d="M70 688 Q106 652 142 688 Z" fill={WHITE} />
    <Path d="M106 660 L106 668 M106 688 L106 712 q0 6 -7 6" {...stroke(WHITE, 2)} />
    <Circle cx={112} cy={700} r={5} fill={WHITE} />
    <Path d="M106 706 Q112 702 118 706 L121 730 Q112 734 104 730 Z" fill={WHITE} />
    <Path d="M108 730 L107 748 M117 730 L119 748" {...stroke(WHITE, 2.2)} />
    <Ellipse cx={112} cy={762} rx={42} ry={5} {...stroke(WHITE, 1.6, 0.35)} />
  </Scene>
);

// 8 · Sun over the Hills — an engraved sun above rolling fields.
const SunHills = () => (
  <Scene k="sh">
    <Circle cx={312} cy={100} r={28} {...stroke(INK, 2.6, 0.85)} />
    <G>
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i * Math.PI) / 6;
        const r1 = 38;
        const r2 = i % 2 === 0 ? 56 : 48;
        return (
          <Line
            key={i}
            x1={312 + Math.cos(a) * r1}
            y1={100 + Math.sin(a) * r1}
            x2={312 + Math.cos(a) * r2}
            y2={100 + Math.sin(a) * r2}
            {...stroke(INK, 2, 0.7)}
          />
        );
      })}
    </G>
    <Path d="M0 636 Q120 596 240 630 Q310 648 380 622" {...stroke(INK, 1.8, 0.45)} />
    <Path d="M0 692 Q140 642 380 678 L380 800 L0 800 Z" fill="#E7E6E0" stroke={INK} strokeWidth={1.8} strokeOpacity={0.6} />
    <Path d="M0 762 Q160 718 380 754 L380 800 L0 800 Z" fill="#DBDAD3" stroke={INK} strokeWidth={1.8} strokeOpacity={0.6} />
    {/* contour hatching */}
    <Path d="M60 700 q40 -10 84 -8 M180 684 q44 -8 90 -2 M70 766 q50 -12 104 -8" {...stroke(INK, 1.2, 0.25)} />
    {/* lone cypress */}
    <Path d="M300 596 C291 622 291 648 300 668 C309 648 309 622 300 596 Z" fill={INK} />
    <Line x1={300} y1={668} x2={300} y2={678} {...stroke(INK, 2.4)} />
  </Scene>
);

// 9 · The Lantern — a night walker carrying a small light.
const Lantern = () => (
  <Scene k="ln" dark>
    <Circle cx={72} cy={158} r={30} fill={WHITE} />
    <Circle cx={86} cy={150} r={27} fill={NIGHT} />
    <Stars pts={[[150, 130], [200, 180, 1.2], [256, 134], [330, 170], [350, 260, 1.2], [30, 290, 1.2], [310, 330, 1]]} />
    {/* ground line */}
    <Path d="M0 722 Q60 714 120 720 T240 718 T380 722" {...stroke(WHITE, 2, 0.8)} />
    <Path d="M44 720 l-3 -10 M48 720 l2 -11 M198 718 l-3 -9 M202 718 l3 -10 M338 722 l-3 -9" {...stroke(WHITE, 1.4, 0.5)} />
    {/* glow */}
    <Circle cx={322} cy={696} r={52} fill={WHITE} fillOpacity={0.05} />
    <Circle cx={322} cy={696} r={32} fill={WHITE} fillOpacity={0.07} />
    <Circle cx={322} cy={696} r={16} fill={WHITE} fillOpacity={0.1} />
    {/* walker, mid-stride */}
    <Circle cx={290} cy={648} r={6} fill={WHITE} />
    <Path d="M283 658 Q290 653 297 658 L301 690 Q290 695 280 690 Z" fill={WHITE} />
    <Path d="M285 690 L280 720 M296 690 L304 718" {...stroke(WHITE, 2.6)} />
    <Path d="M298 666 L318 676 L322 686" {...stroke(WHITE, 2.2)} />
    <Rect x={315} y={686} width={14} height={18} rx={2} {...stroke(WHITE, 2)} />
    <Circle cx={322} cy={695} r={3.4} fill={WHITE} />
  </Scene>
);

// 10 · Birds & Reeds — a flock lifting away over still water.
const BirdsReeds = () => (
  <Scene k="br">
    {[
      [218, 188, 0.7], [256, 158, 0.85], [292, 128, 1], [322, 96, 0.85],
      [344, 64, 0.7], [300, 52, 0.55], [256, 84, 0.6], [336, 156, 0.55],
    ].map(([x, y, s], i) => (
      <Bird key={i} x={x} y={y} s={s} o={0.7} />
    ))}
    {/* reeds in the near corner */}
    <Path d="M34 800 C36 740 30 690 38 622 M58 800 C62 730 54 684 64 600 M86 800 C84 736 92 690 84 632 M112 800 C116 740 108 700 118 648" {...stroke(INK, 2.2, 0.8)} />
    <Rect x={34} y={606} width={7} height={20} rx={3.5} fill={INK} />
    <Rect x={60} y={584} width={7} height={22} rx={3.5} fill={INK} />
    <Rect x={80} y={616} width={7} height={20} rx={3.5} fill={INK} />
    <Path d="M58 700 q-22 -10 -34 -28 M88 690 q20 -12 28 -32 M112 712 q18 -8 26 -24" {...stroke(INK, 1.6, 0.6)} />
    {/* still water */}
    <Ellipse cx={296} cy={748} rx={64} ry={8} {...stroke(INK, 1.4, 0.3)} />
    <Ellipse cx={296} cy={748} rx={38} ry={4.5} {...stroke(INK, 1.4, 0.22)} />
    <Path d="M180 770 q30 6 60 2 M320 778 q20 4 40 0" {...stroke(INK, 1.2, 0.2)} />
  </Scene>
);

// 11 · The Wanderer — a figure on a crag above a sea of fog.
const Wanderer = () => (
  <Scene k="wd">
    {/* distant peaks breaking the fog */}
    <Path d="M160 612 L196 568 L228 606 M252 596 L290 552 L326 592 M330 620 L356 592 L380 618" {...stroke(INK, 1.6, 0.35)} />
    {/* fog banks — layered and overlapping so the edges melt together */}
    <Ellipse cx={210} cy={608} rx={170} ry={26} fill={WHITE} fillOpacity={0.55} />
    <Ellipse cx={250} cy={604} rx={120} ry={16} fill={WHITE} fillOpacity={0.8} />
    <Ellipse cx={320} cy={650} rx={160} ry={24} fill={WHITE} fillOpacity={0.6} />
    <Ellipse cx={300} cy={648} rx={110} ry={15} fill={WHITE} fillOpacity={0.85} />
    <Ellipse cx={120} cy={684} rx={180} ry={28} fill={WHITE} fillOpacity={0.6} />
    <Ellipse cx={150} cy={686} rx={120} ry={17} fill={WHITE} fillOpacity={0.85} />
    {/* solid fog floor so the banks dissolve into the bottom of the frame */}
    <Path d="M0 716 Q90 700 190 712 Q290 724 380 708 L380 800 L0 800 Z" fill={WHITE} fillOpacity={0.95} />
    <Path d="M120 616 q60 8 130 2 M210 666 q66 8 130 0" {...stroke(INK, 1.2, 0.12)} />
    {/* the crag */}
    <Path d="M0 800 L0 614 L30 566 L52 580 L74 532 L94 544 L112 592 L100 648 L122 800 Z" fill="#1F1F1C" />
    <Path d="M22 622 l30 10 M30 668 l34 12 M44 718 l36 12" {...stroke(PAPER, 1.6, 0.18)} />
    <Figure x={82} y={530} s={1.05} color="#1F1F1C" cane />
  </Scene>
);

// 12 · The Quiet Forest — slim trunks framing a misted clearing.
const QuietForest = () => (
  <Scene k="qf">
    {/* left trunks */}
    <Path d="M6 0 L1 800 L30 800 L23 0 Z" fill="#1D1D1A" />
    <Path d="M50 0 L46 800 L62 800 L60 0 Z" fill="#1D1D1A" fillOpacity={0.88} />
    <Path d="M22 142 C46 124 66 112 92 100" {...stroke('#1D1D1A', 5)} />
    <Path d="M66 116 C76 106 84 102 96 96 M58 124 C66 130 74 132 84 134" {...stroke('#1D1D1A', 2)} />
    {/* right trunks */}
    <Path d="M362 0 L356 800 L380 800 L380 0 Z" fill="#1D1D1A" />
    <Path d="M338 0 L334 360 L346 360 L348 0 Z" fill="#1D1D1A" fillOpacity={0.8} />
    <Path d="M358 218 C336 200 320 192 298 184" {...stroke('#1D1D1A', 4)} />
    <Path d="M318 192 C308 184 300 182 290 178" {...stroke('#1D1D1A', 1.8)} />
    {/* bark ticks */}
    <Path d="M10 220 l8 4 M8 360 l9 4 M12 520 l8 4 M366 300 l8 3 M364 470 l9 4" {...stroke(PAPER, 1.6, 0.25)} />
    {/* mist */}
    <Ellipse cx={190} cy={560} rx={150} ry={16} fill={WHITE} fillOpacity={0.85} />
    <Ellipse cx={250} cy={616} rx={160} ry={18} fill={WHITE} fillOpacity={0.8} />
    <Ellipse cx={150} cy={668} rx={150} ry={17} fill={WHITE} fillOpacity={0.85} />
    {/* forest floor */}
    <Path d="M0 730 Q120 720 200 726 T380 728" {...stroke(INK, 1.4, 0.35)} />
    <Path d="M88 728 q-8 -18 -20 -24 M92 730 q0 -20 -6 -28 M96 730 q10 -14 20 -18" {...stroke(INK, 1.6, 0.5)} />
    <Path d="M286 726 q-7 -16 -17 -21 M290 728 q0 -17 -5 -24 M294 728 q9 -12 17 -16" {...stroke(INK, 1.6, 0.5)} />
  </Scene>
);

// ─── registry ────────────────────────────────────────────────────────────────

export interface InkScene {
  key: string;
  meta: SceneMeta;
  Scene: () => React.ReactElement;
}

export const INK_SCENES: InkScene[] = [
  { key: 'night-clouds', meta: { mode: 'dark', zone: 'middle' }, Scene: NightClouds },
  { key: 'winter-trees', meta: { mode: 'light', zone: 'top' }, Scene: WinterTrees },
  { key: 'lone-tree', meta: { mode: 'light', zone: 'top' }, Scene: LoneTree },
  { key: 'moon-peaks', meta: { mode: 'dark', zone: 'middle' }, Scene: MoonPeaks },
  { key: 'sea-sail', meta: { mode: 'light', zone: 'middle' }, Scene: SeaSail },
  { key: 'field-path', meta: { mode: 'light', zone: 'middle' }, Scene: FieldPath },
  { key: 'rain', meta: { mode: 'dark', zone: 'middle' }, Scene: Rain },
  { key: 'sun-hills', meta: { mode: 'light', zone: 'middle' }, Scene: SunHills },
  { key: 'lantern', meta: { mode: 'dark', zone: 'middle' }, Scene: Lantern },
  { key: 'birds-reeds', meta: { mode: 'light', zone: 'middle' }, Scene: BirdsReeds },
  { key: 'wanderer', meta: { mode: 'light', zone: 'top' }, Scene: Wanderer },
  { key: 'quiet-forest', meta: { mode: 'light', zone: 'middle', padH: 84 }, Scene: QuietForest },
];

export function sceneForVariant(variant: number): InkScene {
  const n = INK_SCENES.length;
  return INK_SCENES[((variant % n) + n) % n];
}
