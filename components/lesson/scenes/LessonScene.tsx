import { useMemo, type ReactNode } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { Easing } from 'react-native-reanimated';
import Svg, {
  Path,
  Circle,
  Rect,
  Ellipse,
  Line,
  Polygon,
  Defs,
  Pattern,
  G,
} from 'react-native-svg';

/* -------------------------------------------------------------------------- *
 *  A library of hand-drawn, black-&-white ISOMETRIC scenes that sit behind a
 *  lesson's text — line-art on a warm cream "stage", with halftone shading for
 *  depth. Modelled on the reference apps: an illustrated hero up top, text
 *  below. Every lesson is mapped to a themed scene via `sceneForLesson`.
 * -------------------------------------------------------------------------- */

const PANEL = '#F1EEE7'; // cream stage background
const LINE = '#1A1A1A'; // ink outline
const TOP = '#FFFFFF'; // top faces
const MID = '#D6D3C9'; // left faces
const DARK_TOP = '#1A1A1A';
const DARK_LEFT = '#33322B';
const DARK_RIGHT = '#555555';

const SW = Dimensions.get('window').width;
const SH = Dimensions.get('window').height;

/* ----------------------------- shared pieces ----------------------------- */

// Per-instance pattern defs (ink dots + diagonal hatch) on a TRANSPARENT tile
// so they shade naturally over the cream stage.
function SceneDefs({ id }: { id: string }) {
  return (
    <Defs>
      <Pattern id={`${id}-dots`} patternUnits="userSpaceOnUse" width={6} height={6}>
        <Circle cx={3} cy={3} r={1.15} fill={LINE} />
      </Pattern>
      <Pattern id={`${id}-hatch`} patternUnits="userSpaceOnUse" width={7} height={7}>
        <Line x1={0} y1={7} x2={7} y2={0} stroke={LINE} strokeWidth={1} />
      </Pattern>
    </Defs>
  );
}

// Isometric box whose TOP-face center is (cx, cy). a = half-width, h = a/2.
function IsoBox({
  id,
  cx,
  cy,
  a,
  h,
  ch,
  variant = 'light',
  sw = 2,
}: {
  id: string;
  cx: number;
  cy: number;
  a: number;
  h: number;
  ch: number;
  variant?: 'light' | 'dark';
  sw?: number;
}) {
  const top = variant === 'dark' ? DARK_TOP : TOP;
  const left = variant === 'dark' ? DARK_LEFT : MID;
  const right = variant === 'dark' ? DARK_RIGHT : `url(#${id}-dots)`;
  const topPath = `M ${cx} ${cy - h} L ${cx + a} ${cy} L ${cx} ${cy + h} L ${cx - a} ${cy} Z`;
  const leftPath = `M ${cx - a} ${cy} L ${cx} ${cy + h} L ${cx} ${cy + h + ch} L ${cx - a} ${cy + ch} Z`;
  const rightPath = `M ${cx + a} ${cy} L ${cx} ${cy + h} L ${cx} ${cy + h + ch} L ${cx + a} ${cy + ch} Z`;
  return (
    <G>
      <Path d={leftPath} fill={left} stroke={LINE} strokeWidth={sw} strokeLinejoin="round" />
      <Path d={rightPath} fill={right} stroke={LINE} strokeWidth={sw} strokeLinejoin="round" />
      <Path d={topPath} fill={top} stroke={LINE} strokeWidth={sw} strokeLinejoin="round" />
    </G>
  );
}

function Shadow({ id, cx, cy, rx, ry = 12 }: { id: string; cx: number; cy: number; rx: number; ry?: number }) {
  return <Ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={`url(#${id}-dots)`} opacity={0.45} />;
}

// A small four-point sparkle.
function Spark({ x, y, r = 5 }: { x: number; y: number; r?: number }) {
  const d = `M ${x} ${y - r} L ${x + r * 0.34} ${y - r * 0.34} L ${x + r} ${y} L ${x + r * 0.34} ${y + r * 0.34} L ${x} ${y + r} L ${x - r * 0.34} ${y + r * 0.34} L ${x - r} ${y} L ${x - r * 0.34} ${y - r * 0.34} Z`;
  return <Path d={d} fill={LINE} />;
}

/* --------------------------------- scenes -------------------------------- */
// Each returns SVG children drawn within a 300 × 190 viewBox.

function books(id: string): ReactNode {
  return (
    <G>
      <Shadow id={id} cx={150} cy={163} rx={88} ry={14} />
      <IsoBox id={id} cx={150} cy={124} a={80} h={40} ch={14} />
      <IsoBox id={id} cx={150} cy={96} a={67} h={33} ch={13} />
      <IsoBox id={id} cx={150} cy={70} a={55} h={27} ch={11} />
      <IsoBox id={id} cx={150} cy={36} a={17} h={9} ch={15} variant="dark" />
      <Spark x={232} y={42} r={5} />
      <Spark x={70} y={58} r={4} />
    </G>
  );
}

function cosmos(id: string): ReactNode {
  return (
    <G>
      <Shadow id={id} cx={150} cy={170} rx={56} ry={9} />
      <Ellipse cx={150} cy={102} rx={98} ry={34} fill="none" stroke={LINE} strokeWidth={1.5} transform="rotate(-16 150 102)" />
      <Circle cx={150} cy={98} r={44} fill={TOP} stroke={LINE} strokeWidth={2} />
      <Path d="M150 54 A44 44 0 0 1 150 142 Z" fill={`url(#${id}-dots)`} />
      <Circle cx={150} cy={98} r={44} fill="none" stroke={LINE} strokeWidth={2} />
      <Circle cx={236} cy={118} r={8} fill={DARK_TOP} stroke={LINE} strokeWidth={1.5} />
      <Spark x={64} y={56} r={6} />
      <Spark x={250} y={64} r={4} />
      <Spark x={48} y={120} r={4} />
    </G>
  );
}

function staircase(id: string): ReactNode {
  const steps = [
    { x: 98, y: 72 },
    { x: 128, y: 100 },
    { x: 158, y: 128 },
    { x: 188, y: 156 },
  ];
  return (
    <G>
      <Shadow id={id} cx={150} cy={176} rx={92} ry={10} />
      {steps.map((s, i) => (
        <IsoBox key={i} id={id} cx={s.x} cy={s.y} a={28} h={14} ch={20} />
      ))}
      {/* the descending sphere resting on the top step */}
      <Circle cx={98} cy={58} r={13} fill={DARK_TOP} stroke={LINE} strokeWidth={2} />
      <Circle cx={93} cy={53} r={3.5} fill={TOP} />
      <Spark x={232} y={70} r={5} />
    </G>
  );
}

function scales(id: string): ReactNode {
  return (
    <G>
      <Shadow id={id} cx={150} cy={170} rx={70} ry={11} />
      {/* base + post */}
      <IsoBox id={id} cx={150} cy={150} a={30} h={15} ch={12} />
      <Line x1={150} y1={150} x2={150} y2={62} stroke={LINE} strokeWidth={3.5} />
      {/* fulcrum + beam (slightly tilted) */}
      <Polygon points="150,52 160,66 140,66" fill={DARK_TOP} stroke={LINE} strokeWidth={1.5} />
      <Line x1={88} y1={74} x2={212} y2={62} stroke={LINE} strokeWidth={3} strokeLinecap="round" />
      {/* hangers */}
      <Line x1={88} y1={74} x2={88} y2={102} stroke={LINE} strokeWidth={1.5} />
      <Line x1={212} y1={62} x2={212} y2={90} stroke={LINE} strokeWidth={1.5} />
      {/* pans */}
      <Ellipse cx={88} cy={106} rx={26} ry={8} fill={TOP} stroke={LINE} strokeWidth={2} />
      <Ellipse cx={212} cy={94} rx={26} ry={8} fill={`url(#${id}-dots)`} stroke={LINE} strokeWidth={2} />
      <IsoBox id={id} cx={88} cy={100} a={11} h={5.5} ch={9} variant="dark" />
    </G>
  );
}

function eye(id: string): ReactNode {
  return (
    <G>
      <Path d="M64 100 Q150 48 236 100 Q150 152 64 100 Z" fill={TOP} stroke={LINE} strokeWidth={2.5} />
      <Circle cx={150} cy={100} r={34} fill={`url(#${id}-dots)`} stroke={LINE} strokeWidth={2} />
      <Circle cx={150} cy={100} r={15} fill={DARK_TOP} />
      <Circle cx={142} cy={92} r={4.5} fill={TOP} />
      <Path d="M70 76 Q150 40 230 76" fill="none" stroke={LINE} strokeWidth={2} />
      {/* lashes / rays */}
      {[-40, -20, 0, 20, 40].map((dx, i) => (
        <Line key={i} x1={150 + dx * 1.4} y1={150} x2={150 + dx * 1.8} y2={166} stroke={LINE} strokeWidth={1.5} strokeLinecap="round" />
      ))}
      <Spark x={236} y={62} r={5} />
      <Spark x={58} y={70} r={4} />
    </G>
  );
}

function columns(id: string): ReactNode {
  const xs = [104, 150, 196];
  return (
    <G>
      <Shadow id={id} cx={150} cy={172} rx={96} ry={11} />
      {/* stylobate (base platform) */}
      <IsoBox id={id} cx={150} cy={150} a={96} h={26} ch={12} />
      {/* three column shafts with capital + base */}
      {xs.map((x, i) => (
        <G key={i}>
          <IsoBox id={id} cx={x} cy={132} a={13} h={6} ch={6} />
          <IsoBox id={id} cx={x} cy={84} a={9} h={4.5} ch={44} />
          <IsoBox id={id} cx={x} cy={78} a={14} h={7} ch={6} />
        </G>
      ))}
      {/* architrave + pediment */}
      <IsoBox id={id} cx={150} cy={66} a={70} h={14} ch={8} />
      <Polygon points="92,58 208,58 150,30 " fill={`url(#${id}-hatch)`} stroke={LINE} strokeWidth={2} strokeLinejoin="round" />
    </G>
  );
}

function gem(id: string): ReactNode {
  return (
    <G>
      <Shadow id={id} cx={150} cy={166} rx={48} ry={9} />
      <IsoBox id={id} cx={150} cy={150} a={36} h={18} ch={16} />
      {/* faceted gem */}
      <Polygon points="150,58 168,84 150,96 132,84" fill={TOP} stroke={LINE} strokeWidth={2} strokeLinejoin="round" />
      <Polygon points="150,58 132,84 116,90" fill={`url(#${id}-dots)`} stroke={LINE} strokeWidth={2} strokeLinejoin="round" />
      <Polygon points="150,58 168,84 184,90" fill={MID} stroke={LINE} strokeWidth={2} strokeLinejoin="round" />
      <Polygon points="116,90 132,84 150,96 150,134" fill={MID} stroke={LINE} strokeWidth={2} strokeLinejoin="round" />
      <Polygon points="184,90 168,84 150,96 150,134" fill={`url(#${id}-dots)`} stroke={LINE} strokeWidth={2} strokeLinejoin="round" />
      <Spark x={196} y={64} r={5} />
      <Spark x={108} y={70} r={4} />
    </G>
  );
}

function door(id: string): ReactNode {
  return (
    <G>
      <Shadow id={id} cx={150} cy={172} rx={78} ry={11} />
      {/* light spilling onto the ground */}
      <Polygon points="124,150 176,150 206,176 94,176" fill={`url(#${id}-hatch)`} opacity={0.85} />
      {/* pillars */}
      <IsoBox id={id} cx={112} cy={70} a={12} h={6} ch={82} />
      <IsoBox id={id} cx={188} cy={70} a={12} h={6} ch={82} />
      {/* dark opening */}
      <Path d="M124 150 L124 78 Q150 52 176 78 L176 150 Z" fill={DARK_TOP} stroke={LINE} strokeWidth={2} strokeLinejoin="round" />
      {/* arch lintel */}
      <Path d="M104 80 Q150 38 196 80" fill="none" stroke={LINE} strokeWidth={3} />
      <Spark x={150} y={104} r={6} />
    </G>
  );
}

/* ------------------------------- registry -------------------------------- */

const SCENES = {
  books,
  cosmos,
  staircase,
  scales,
  eye,
  columns,
  gem,
  door,
} as const;

export type SceneKey = keyof typeof SCENES;

// Per-branch ordered scene families — each lesson takes the next scene in its
// branch list (cycling), so adjacent lessons feel themed but distinct.
const BY_BRANCH: Record<string, SceneKey[]> = {
  metaphysics: ['cosmos', 'books', 'door', 'eye'],
  epistemology: ['eye', 'books', 'staircase', 'cosmos'],
  logic: ['staircase', 'columns', 'books', 'door'],
  ethics: ['scales', 'columns', 'door', 'books'],
  aesthetics: ['gem', 'columns', 'books', 'eye'],
  'political-philosophy': ['columns', 'scales', 'door', 'books'],
};
const FALLBACK: SceneKey[] = ['books', 'cosmos', 'eye', 'staircase'];

export function sceneForLesson(branchSlug: string | null | undefined, lessonIndex: number): SceneKey {
  const list = (branchSlug && BY_BRANCH[branchSlug]) || FALLBACK;
  const i = ((lessonIndex % list.length) + list.length) % list.length;
  return list[i];
}

/* ----------------------------- the component ----------------------------- */

interface Props {
  scene?: SceneKey;
  height?: number;
  compact?: boolean;
}

// Default hero height — a little over a third of the screen, clamped.
const HERO_H = Math.max(150, Math.min(280, Math.round(SH * 0.34)));

export default function LessonScene({ scene = 'books', height, compact }: Props) {
  // A stable per-mount id keeps each scene's pattern ids unique without RNG.
  const id = useMemo(() => `sc-${scene}-${Math.round((SW + SH) % 9973)}`, [scene]);
  const draw = SCENES[scene] ?? SCENES.books;
  const h = height ?? (compact ? 132 : HERO_H);

  return (
    <View style={[styles.stage, { height: h }]}>
      <MotiView
        style={StyleSheet.absoluteFill}
        from={{ translateY: 0 }}
        animate={{ translateY: -3 }}
        transition={{ loop: true, repeatReverse: true, type: 'timing', duration: 2800, easing: Easing.inOut(Easing.quad) }}
      >
        <Svg width="100%" height="100%" viewBox="0 0 300 190" preserveAspectRatio="xMidYMid meet">
          <SceneDefs id={id} />
          {draw(id)}
        </Svg>
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 6,
    borderRadius: 14,
    backgroundColor: PANEL,
    overflow: 'hidden',
    // soft lift off the dark lesson background
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
});
