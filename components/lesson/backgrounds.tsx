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

// Procedural "antique parchment" lesson backgrounds — an etched/engraved take on
// the classical collage references (columns, a temple, a bust, the reaching
// hands, a compass, books, ink, florals). Everything is drawn in sepia ink on
// aged paper, kept to the EDGES so the centred lesson card stays the focus.

const VB_W = 380;
const VB_H = 800;

// sepia ink tiers — low contrast so the card always dominates
const INK = '#5b4a30';
const INK_SOFT = '#6d5c40';
const LINE = '#473717';
const FAINT = '#7c6c4d';

const fill = (o: number) => ({ fill: INK, fillOpacity: o });
const stroke = (o: number, w = 2) => ({
  fill: 'none' as const,
  stroke: LINE,
  strokeOpacity: o,
  strokeWidth: w,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

// ─── shared aged-paper base ──────────────────────────────────────────────────
function Parchment({ k }: { k: string }) {
  return (
    <>
      <Defs>
        <RadialGradient id={`pg-${k}`} cx="50%" cy="40%" rx="86%" ry="82%">
          <Stop offset="0%" stopColor="#F4ECD8" />
          <Stop offset="52%" stopColor="#EADEC6" />
          <Stop offset="100%" stopColor="#D2BF9C" />
        </RadialGradient>
      </Defs>
      <Rect x={0} y={0} width={VB_W} height={VB_H} fill="#EADEC6" />
      <Rect x={0} y={0} width={VB_W} height={VB_H} fill={`url(#pg-${k})`} />
      {/* faint age stains */}
      <Ellipse cx={60} cy={150} rx={70} ry={48} fill="#C8B488" fillOpacity={0.14} />
      <Ellipse cx={300} cy={120} rx={64} ry={44} fill="#C8B488" fillOpacity={0.16} />
      <Ellipse cx={70} cy={640} rx={80} ry={56} fill="#C8B488" fillOpacity={0.14} />
      <Ellipse cx={320} cy={700} rx={70} ry={50} fill="#C8B488" fillOpacity={0.16} />
      <Circle cx={210} cy={300} r={2.2} fill="#9c8a63" fillOpacity={0.25} />
      <Circle cx={150} cy={470} r={1.8} fill="#9c8a63" fillOpacity={0.22} />
      <Circle cx={290} cy={430} r={1.6} fill="#9c8a63" fillOpacity={0.2} />
    </>
  );
}

// ─── motifs (each returns a <G> positioned by translate/scale) ───────────────

function FlutedColumn({ x, y, h = 520, w = 56, o = 0.5 }: { x: number; y: number; h?: number; w?: number; o?: number }) {
  const flutes = [];
  for (let i = 1; i <= 4; i++) flutes.push(x - w / 2 + (w * i) / 5);
  return (
    <G>
      {/* capital (simplified Corinthian) */}
      <Path d={`M${x - w / 2 - 8} ${y} H${x + w / 2 + 8} L${x + w / 2 + 2} ${y - 22} Q${x} ${y - 34} ${x - w / 2 - 2} ${y - 22} Z`} {...fill(o)} />
      <Path d={`M${x - 16} ${y - 18} Q${x - 22} ${y - 28} ${x - 12} ${y - 30}`} {...stroke(o, 2)} />
      <Path d={`M${x + 16} ${y - 18} Q${x + 22} ${y - 28} ${x + 12} ${y - 30}`} {...stroke(o, 2)} />
      {/* shaft */}
      <Rect x={x - w / 2} y={y} width={w} height={h} {...fill(o * 0.9)} />
      {flutes.map((fx, i) => (
        <Line key={i} x1={fx} y1={y + 6} x2={fx} y2={y + h - 6} {...stroke(o * 0.7, 1.4)} />
      ))}
      {/* base */}
      <Rect x={x - w / 2 - 10} y={y + h} width={w + 20} height={18} {...fill(o)} />
      <Rect x={x - w / 2 - 16} y={y + h + 18} width={w + 32} height={12} {...fill(o)} />
    </G>
  );
}

function Bust({ x, y, s = 1, o = 0.5 }: { x: number; y: number; s?: number; o?: number }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      {/* plinth */}
      <Rect x={-34} y={70} width={68} height={56} {...fill(o)} />
      <Rect x={-40} y={120} width={80} height={12} {...fill(o)} />
      {/* shoulders / drape */}
      <Path d="M-44 70 C-44 36 -22 22 0 22 C22 22 44 36 44 70 Z" {...fill(o)} />
      {/* neck + head */}
      <Path d="M-12 28 L-12 6 Q-12 -2 0 -2 Q12 -2 12 6 L12 28 Z" {...fill(o)} />
      <Circle cx={0} cy={-22} r={24} {...fill(o)} />
      {/* curls / hair + beard hint */}
      <Path d="M-22 -28 Q-26 -46 -6 -46 Q0 -52 8 -46 Q26 -44 22 -26" {...stroke(o * 0.8, 2)} />
      <Path d="M-14 -6 Q0 6 14 -6" {...stroke(o * 0.7, 2)} />
    </G>
  );
}

function Temple({ x, y, s = 1, o = 0.5, cols = 4 }: { x: number; y: number; s?: number; o?: number; cols?: number }) {
  const w = cols * 26;
  const colXs = Array.from({ length: cols }, (_, i) => -w / 2 + 13 + i * 26);
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      {/* steps */}
      <Rect x={-w / 2 - 18} y={150} width={w + 36} height={12} {...fill(o)} />
      <Rect x={-w / 2 - 10} y={138} width={w + 20} height={12} {...fill(o)} />
      {/* columns */}
      {colXs.map((cx, i) => (
        <G key={i}>
          <Rect x={cx - 6} y={48} width={12} height={92} {...fill(o * 0.9)} />
          <Line x1={cx} y1={54} x2={cx} y2={132} {...stroke(o * 0.6, 1.2)} />
          <Rect x={cx - 9} y={42} width={18} height={8} {...fill(o)} />
        </G>
      ))}
      {/* architrave */}
      <Rect x={-w / 2 - 12} y={32} width={w + 24} height={12} {...fill(o)} />
      {/* pediment */}
      <Path d={`M${-w / 2 - 16} 32 L0 -2 L${w / 2 + 16} 32 Z`} {...fill(o)} />
      <Path d={`M${-w / 2 - 4} 30 L0 8 L${w / 2 + 4} 30 Z`} {...stroke(o * 0.6, 1.4)} />
    </G>
  );
}

function Rotunda({ x, y, s = 1, o = 0.5 }: { x: number; y: number; s?: number; o?: number }) {
  const colXs = [-44, -26, -8, 10, 28, 46];
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      {/* base steps (elliptical) */}
      <Ellipse cx={0} cy={120} rx={70} ry={16} {...fill(o)} />
      <Ellipse cx={0} cy={112} rx={58} ry={12} {...fill(o * 0.9)} />
      {/* columns ring */}
      {colXs.map((cx, i) => (
        <Rect key={i} x={cx - 4} y={40} width={8} height={70} {...fill(o * 0.9)} />
      ))}
      {/* entablature */}
      <Ellipse cx={0} cy={40} rx={60} ry={12} {...fill(o)} />
      {/* dome */}
      <Path d="M-56 40 Q0 -40 56 40 Z" {...fill(o)} />
      <Path d="M-30 8 Q0 -14 30 8" {...stroke(o * 0.5, 1.4)} />
      {/* finial */}
      <Circle cx={0} cy={-26} r={5} {...fill(o)} />
    </G>
  );
}

function CompassRose({ x, y, r = 60, o = 0.32 }: { x: number; y: number; r?: number; o?: number }) {
  const pts = (len: number, wdt: number) =>
    `M0 ${-len} L${wdt} 0 L0 ${len} L${-wdt} 0 Z`;
  return (
    <G transform={`translate(${x} ${y})`}>
      <Circle cx={0} cy={0} r={r} {...stroke(o, 1.6)} />
      <Circle cx={0} cy={0} r={r - 8} {...stroke(o * 0.8, 1)} />
      {/* cardinal star */}
      <Path d={pts(r - 12, 9)} {...fill(o)} />
      <G transform="rotate(90)">
        <Path d={pts(r - 12, 9)} {...fill(o * 0.8)} />
      </G>
      {/* diagonal rays */}
      <G transform="rotate(45)">
        <Path d={pts(r - 22, 5)} {...fill(o * 0.6)} />
      </G>
      <G transform="rotate(135)">
        <Path d={pts(r - 22, 5)} {...fill(o * 0.6)} />
      </G>
      <Circle cx={0} cy={0} r={4} {...fill(o)} />
    </G>
  );
}

function BookStack({ x, y, s = 1, o = 0.5, tied = false }: { x: number; y: number; s?: number; o?: number; tied?: boolean }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Rect x={-46} y={28} width={96} height={20} rx={2} {...fill(o)} />
      <Line x1={-42} y1={38} x2={46} y2={38} {...stroke(o * 0.5, 1.2)} />
      <Rect x={-40} y={10} width={84} height={18} rx={2} {...fill(o * 0.92)} />
      <Line x1={-36} y1={19} x2={40} y2={19} {...stroke(o * 0.5, 1.2)} />
      <Rect x={-34} y={-6} width={74} height={16} rx={2} {...fill(o * 0.85)} />
      <Line x1={-30} y1={2} x2={34} y2={2} {...stroke(o * 0.5, 1.2)} />
      {tied ? (
        <>
          <Rect x={-6} y={-8} width={9} height={58} {...fill(o * 0.7)} />
          <Path d="M-2 50 q-8 8 -14 4 M3 50 q8 8 14 4" {...stroke(o * 0.7, 1.6)} />
        </>
      ) : null}
    </G>
  );
}

function Globe({ x, y, r = 30, o = 0.46 }: { x: number; y: number; r?: number; o?: number }) {
  return (
    <G transform={`translate(${x} ${y})`}>
      <Circle cx={0} cy={0} r={r} {...stroke(o, 2)} />
      <Ellipse cx={0} cy={0} rx={r * 0.42} ry={r} {...stroke(o * 0.7, 1.2)} />
      <Line x1={-r} y1={0} x2={r} y2={0} {...stroke(o * 0.7, 1.2)} />
      <Path d={`M${-r} ${-r * 0.45} Q0 ${-r * 0.62} ${r} ${-r * 0.45}`} {...stroke(o * 0.6, 1)} />
      <Path d={`M${-r} ${r * 0.45} Q0 ${r * 0.62} ${r} ${r * 0.45}`} {...stroke(o * 0.6, 1)} />
      {/* axis + stand */}
      <Line x1={-r * 0.7} y1={-r * 0.7} x2={r * 0.7} y2={r * 0.7} {...stroke(o * 0.7, 1.6)} />
      <Path d={`M0 ${r} Q${r + 14} ${r} ${r + 14} 0 Q${r + 14} ${-r - 10} 0 ${-r - 8}`} {...stroke(o * 0.7, 1.8)} />
      <Line x1={0} y1={r} x2={0} y2={r + 18} {...stroke(o * 0.7, 2)} />
      <Rect x={-16} y={r + 18} width={32} height={8} {...fill(o)} />
    </G>
  );
}

function ReachingHands({ x, y, s = 1, o = 0.46 }: { x: number; y: number; s?: number; o?: number }) {
  // two arms from upper-right & right, index fingers nearly touching (Adam motif)
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      {/* divine arm (from top-right) */}
      <Path d="M70 -50 C40 -34 20 -22 4 -10 C-2 -6 -8 -8 -10 -2 C-12 4 -4 6 2 4 C12 0 26 -10 44 -22 C58 -32 72 -40 86 -44 Z" {...fill(o)} />
      <Path d="M-10 -2 L-22 2" {...stroke(o, 2.4)} />
      {/* mortal arm (from lower-left) */}
      <Path d="M-78 60 C-50 44 -30 32 -16 22 C-10 18 -4 20 -2 14 C0 8 -8 6 -14 8 C-24 12 -38 22 -54 32 C-66 40 -78 48 -90 52 Z" {...fill(o * 0.92)} />
      <Path d="M-2 14 L10 10" {...stroke(o, 2.4)} />
    </G>
  );
}

function Daisies({ x, y, s = 1, o = 0.42 }: { x: number; y: number; s?: number; o?: number }) {
  const flower = (fx: number, fy: number, r: number) => (
    <G transform={`translate(${fx} ${fy})`}>
      {Array.from({ length: 8 }).map((_, i) => (
        <Ellipse key={i} cx={0} cy={-r} rx={2.4} ry={r * 0.7} transform={`rotate(${i * 45})`} {...fill(o)} />
      ))}
      <Circle cx={0} cy={0} r={r * 0.42} {...fill(o + 0.12)} />
    </G>
  );
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Path d="M0 90 C-4 50 6 24 2 -4" {...stroke(o, 1.6)} />
      <Path d="M0 70 C12 56 22 58 30 44" {...stroke(o, 1.4)} />
      <Path d="M0 50 C-12 40 -22 42 -28 30" {...stroke(o, 1.4)} />
      <Path d="M2 30 C10 18 8 8 16 -2" {...stroke(o, 1.4)} />
      {/* leaves */}
      <Path d="M0 64 q14 -2 18 -12 q-12 -2 -18 12" {...fill(o * 0.7)} />
      <Path d="M0 44 q-14 -2 -18 -12 q12 -2 18 12" {...fill(o * 0.7)} />
      {flower(2, -6, 11)}
      {flower(30, 40, 9)}
      {flower(-28, 26, 8)}
    </G>
  );
}

function InkQuill({ x, y, s = 1, o = 0.5 }: { x: number; y: number; s?: number; o?: number }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      {/* bottle */}
      <Path d="M-26 6 Q-30 50 0 50 Q30 50 26 6 Z" {...fill(o)} />
      <Rect x={-14} y={-8} width={28} height={16} rx={3} {...fill(o)} />
      <Rect x={-10} y={-16} width={20} height={10} rx={2} {...fill(o)} />
      <Ellipse cx={0} cy={6} rx={26} ry={6} {...fill(o + 0.08)} />
      {/* quill */}
      <Path d="M6 -2 C26 -30 44 -52 64 -70 C50 -52 40 -28 30 -6" {...fill(o * 0.85)} />
      <Path d="M30 -6 L24 8" {...stroke(o, 2)} />
    </G>
  );
}

function Scroll({ x, y, s = 1, o = 0.46 }: { x: number; y: number; s?: number; o?: number }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Rect x={-44} y={-8} width={88} height={16} rx={8} {...fill(o)} />
      <Circle cx={-44} cy={0} r={9} {...fill(o)} />
      <Circle cx={44} cy={0} r={9} {...fill(o)} />
      <Circle cx={-44} cy={0} r={3.4} {...stroke(0.5, 1.4)} />
      <Circle cx={44} cy={0} r={3.4} {...stroke(0.5, 1.4)} />
    </G>
  );
}

function Laurel({ x, y, s = 1, o = 0.4 }: { x: number; y: number; s?: number; o?: number }) {
  const side = (mirror: number) => (
    <G transform={`scale(${mirror} 1)`}>
      <Path d="M0 38 C-26 30 -36 6 -30 -22" {...stroke(o, 2)} />
      {Array.from({ length: 6 }).map((_, i) => {
        const t = i / 5;
        const lx = -6 - t * 24;
        const ly = 32 - t * 52;
        return <Ellipse key={i} cx={lx} cy={ly} rx={6} ry={3} transform={`rotate(${-40 - t * 20} ${lx} ${ly})`} {...fill(o)} />;
      })}
    </G>
  );
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      {side(1)}
      {side(-1)}
    </G>
  );
}

function Urn({ x, y, s = 1, o = 0.5 }: { x: number; y: number; s?: number; o?: number }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Path d="M-26 -6 C-34 24 -18 56 0 56 C18 56 34 24 26 -6 Z" {...fill(o)} />
      <Path d="M-26 -6 Q0 -22 26 -6" {...stroke(o, 2)} />
      <Path d="M-24 -8 C-40 -14 -40 -34 -22 -30" {...stroke(o, 2.4)} />
      <Path d="M24 -8 C40 -14 40 -34 22 -30" {...stroke(o, 2.4)} />
      <Rect x={-12} y={56} width={24} height={10} {...fill(o)} />
      <Rect x={-18} y={66} width={36} height={8} {...fill(o)} />
    </G>
  );
}

function ScriptLines({ x, y, w = 120, lines = 4, gap = 14, o = 0.26 }: { x: number; y: number; w?: number; lines?: number; gap?: number; o?: number }) {
  const row = (ly: number, ww: number) => {
    let d = `M0 ${ly}`;
    const seg = 16;
    for (let i = seg; i <= ww; i += seg) {
      d += ` q ${seg / 2} ${i % (seg * 2) === 0 ? -5 : 5} ${seg} 0`;
    }
    return d;
  };
  return (
    <G transform={`translate(${x} ${y})`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Path key={i} d={row(i * gap, w * (i % 2 === 0 ? 1 : 0.8))} {...stroke(o, 1.4)} />
      ))}
    </G>
  );
}

function SeatedThinker({ x, y, s = 1, o = 0.46 }: { x: number; y: number; s?: number; o?: number }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      {/* rock / plinth */}
      <Path d="M-34 70 Q-40 40 -16 40 L40 40 Q52 56 44 70 Z" {...fill(o * 0.8)} />
      {/* seated draped body, elbow on knee */}
      <Path d="M-6 42 C-22 38 -22 12 -8 6 C-2 2 6 4 8 12 L18 40 Z" {...fill(o)} />
      {/* thigh */}
      <Path d="M-2 40 L34 44 Q40 30 26 26 L4 28 Z" {...fill(o)} />
      {/* arm to chin */}
      <Path d="M6 12 C16 18 22 26 18 22" {...stroke(o, 3)} />
      <Path d="M2 6 C6 -2 18 -2 20 6 C22 14 14 18 8 16 Z" {...fill(o)} />
      {/* head */}
      <Circle cx={4} cy={-6} r={11} {...fill(o)} />
    </G>
  );
}

// ─── scenes (each a full-bleed Svg) ──────────────────────────────────────────
function makeScene(k: string, children: React.ReactNode) {
  return (
    <Svg width="100%" height="100%" viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="xMidYMid slice" style={StyleSheet.absoluteFill}>
      <Parchment k={k} />
      {children}
    </Svg>
  );
}

// 1 · The Forum — column, bust, temple, reaching hands, daisies
const SceneForum = () =>
  makeScene('forum', (
    <>
      <FlutedColumn x={28} y={120} h={540} w={48} o={0.42} />
      <Scroll x={312} y={104} s={0.95} o={0.42} />
      <Daisies x={352} y={290} s={0.85} o={0.36} />
      <Temple x={250} y={628} s={0.92} o={0.42} />
      <Bust x={66} y={648} s={1.15} o={0.46} />
    </>
  ));

// 2 · The Academy — books + globe, laurel, two thinkers
const SceneAcademy = () =>
  makeScene('academy', (
    <>
      <Globe x={320} y={96} r={30} o={0.4} />
      <BookStack x={60} y={70} s={1.1} o={0.44} />
      <Laurel x={330} y={250} s={1.2} o={0.34} />
      <Bust x={64} y={650} s={1.05} o={0.44} />
      <SeatedThinker x={300} y={650} s={1.5} o={0.44} />
      <ScriptLines x={132} y={150} w={150} lines={2} o={0.2} />
    </>
  ));

// 3 · The Cartographer — rotunda, compass, map script
const SceneCartographer = () =>
  makeScene('cartographer', (
    <>
      <CompassRose x={300} y={120} r={62} o={0.3} />
      <ScriptLines x={40} y={120} w={150} lines={3} o={0.18} />
      <Rotunda x={92} y={560} s={1.25} o={0.42} />
      <Urn x={320} y={668} s={1.1} o={0.4} />
      <ScriptLines x={210} y={700} w={140} lines={3} o={0.2} />
    </>
  ));

// 4 · The Desk — tied books, ink & quill, scroll, daisies
const SceneDesk = () =>
  makeScene('desk', (
    <>
      <Daisies x={306} y={116} s={0.82} o={0.34} />
      <ScriptLines x={40} y={150} w={130} lines={3} o={0.18} />
      <BookStack x={70} y={612} s={1.25} o={0.46} tied />
      <Scroll x={120} y={700} s={1} o={0.42} />
      <InkQuill x={290} y={648} s={1.1} o={0.46} />
    </>
  ));

// 5 · The Temple Walk — big temple, column, laurel
const SceneTemple = () =>
  makeScene('temple', (
    <>
      <FlutedColumn x={344} y={120} h={520} w={46} o={0.4} />
      <Laurel x={56} y={150} s={1.2} o={0.32} />
      <Temple x={170} y={612} s={1.35} o={0.44} cols={5} />
      <Bust x={326} y={672} s={1} o={0.42} />
      <ScriptLines x={40} y={420} w={110} lines={3} o={0.16} />
    </>
  ));

export const PARCHMENT_SCENES: Array<() => React.ReactElement> = [
  SceneForum,
  SceneAcademy,
  SceneCartographer,
  SceneDesk,
  SceneTemple,
];
