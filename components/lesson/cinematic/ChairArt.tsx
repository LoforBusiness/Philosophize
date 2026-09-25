import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useDerivedValue, type SharedValue } from 'react-native-reanimated';
import type { Bundle } from './rig';
import {
  CHAIR_BACK_PARTS, CHAIR_FRONT_PARTS, MUG_PARTS, chairRects, mugRects, type ChairRect, type ChairRole,
} from './lawnChair';
import { EMBER, INK, MID, PAPER, PAPER_LIT, TEAL, mix } from '@/components/shared/tone';

// ─────────────────────────────────────────────────────────────────────────────
// THE LAWN CHAIR AND THE MUG, DRAWN — as Views, never an animated <Svg> (§17 rule 7).
//
// `lawnChair.ts` states every part as a rectangle with an angle and a skew, which
// is exactly what one View can be: a 100-unit square scaled to the part, skewed,
// rotated and moved. The sheet the owner approved draws the same rectangles, so
// what was approved is what ships.
//
// A FIXED NUMBER OF VIEWS per layer, for the hook rule (§17 rule 1): the part
// counts are constants and a part that is not showing is a View at opacity 0.
// Mounted only for a solo lead in a lesson that has a routine, so the other 200-odd
// lessons pay nothing.
//
// Colours by ROLE, from tone.ts: the metal is the palette's teal taken halfway to
// paper, the webbing is white laid with teal straps, the armrest white on an ink
// edge, and the mug is the palette's one spark — a small object, which is the only
// thing the ember is ever licensed for (§7).
// ─────────────────────────────────────────────────────────────────────────────

const ROLE: Record<ChairRole, string> = {
  frame: mix(TEAL, PAPER, 0.55),
  weave: PAPER_LIT,
  strap: TEAL,
  arm: PAPER_LIT,
  line: INK,
  mug: EMBER,
  rim: PAPER,
  steam: MID,
};

const SRC = 100;
const HIDDEN = { opacity: 0, transform: [{ translateX: -9999 }, { translateY: -9999 }] };

/** One part → the transform that draws it, mirrored for a figure facing left. */
function place(r: ChairRect, ox: number, oy: number, k: number, d: number) {
  'worklet';
  const ang = d < 0 ? Math.PI - r.ang : r.ang;
  const sk = d < 0 ? -r.sk : r.sk;
  return [
    { translateX: ox + d * k * r.cx },
    { translateY: oy + k * r.cy },
    { rotate: `${(ang * 180) / Math.PI}deg` },
    { skewX: `${(Math.atan(sk) * 180) / Math.PI}deg` },
    { scaleX: (r.len * k) / SRC },
    { scaleY: (r.w * k) / SRC },
  ];
}

function Part({ parts, i, role }: {
  parts: SharedValue<{ list: ChairRect[]; ox: number; oy: number; k: number; d: number; on: number }>;
  i: number; role: ChairRole;
}) {
  const st = useAnimatedStyle(() => {
    const P = parts.value;
    const r = P.list[i];
    if (!r || P.on <= 0.001 || r.w <= 0.001) return HIDDEN;
    return { opacity: P.on, transform: place(r, P.ox, P.oy, P.k, P.d) };
  });
  return <Animated.View style={[S.part, { backgroundColor: ROLE[role] }, st]} />;
}

/** The roles in `chairRects`' own order — fixed, so each View keeps its colour. */
const BACK_ROLES: ChairRole[] = [
  'weave', 'strap', 'strap', 'strap', 'strap', 'strap',
  'weave', 'strap', 'strap', 'strap',
  'frame', 'frame', 'frame', 'frame', 'frame',
];
const FRONT_ROLES: ChairRole[] = ['line', 'arm'];
const MUG_ROLES: ChairRole[] = [
  'line', 'mug', 'rim', 'line', 'line', 'line',
  'steam', 'steam', 'steam', 'steam', 'steam', 'steam', 'steam', 'steam',
];

/**
 * `layer` 'back' is the webbing and the frame, drawn before the figure. 'front' is
 * the near armrest and the mug, drawn after him: the armrest goes in front only once
 * he is IN the chair (`front` past half — before that he stands in front of the
 * whole chair, so it is drawn with the rest of it), and the mug rides his near hand.
 */
export default function ChairArt({ D, k, layer }: { D: SharedValue<Bundle>; k: number; layer: 'back' | 'front' }) {
  const back = useDerivedValue(() => {
    const p = D.value.prop;
    if (!p) return { list: [] as ChairRect[], ox: 0, oy: 0, k, d: 1, on: 0 };
    return { list: chairRects(p[1], 'back'), ox: p[2], oy: p[3], k, d: D.value.dir, on: p[0] };
  });
  const arm = useDerivedValue(() => {
    const p = D.value.prop;
    if (!p) return { list: [] as ChairRect[], ox: 0, oy: 0, k, d: 1, on: 0 };
    const inFront = p[4] > 0.5;
    const want = layer === 'front' ? inFront : !inFront;
    return { list: chairRects(p[1], 'front'), ox: p[2], oy: p[3], k, d: D.value.dir, on: want ? p[0] : 0 };
  });
  const mug = useDerivedValue(() => {
    const p = D.value.prop;
    const B = D.value;
    if (!p || layer !== 'front') return { list: [] as ChairRect[], ox: 0, oy: 0, k, d: 1, on: 0 };
    // THE MUG IS IN THE HAND'S FRAME — the fist centre at 0,0 — so it goes wherever
    // the hand goes, with no second animation to keep in step.
    return {
      list: mugRects(p[7], p[6]),
      ox: B.wrR[0].translateX, oy: B.wrR[1].translateY, k, d: B.dir, on: p[5],
    };
  });

  if (layer === 'back') {
    return (
      <>
        {BACK_ROLES.map((role, i) => <Part key={`b${i}`} parts={back} i={i} role={role} />)}
        {FRONT_ROLES.map((role, i) => <Part key={`a${i}`} parts={arm} i={i} role={role} />)}
      </>
    );
  }
  return (
    <>
      {FRONT_ROLES.map((role, i) => <Part key={`a${i}`} parts={arm} i={i} role={role} />)}
      {MUG_ROLES.map((role, i) => <Part key={`m${i}`} parts={mug} i={i} role={role} />)}
    </>
  );
}

// The counts are asserted here rather than trusted: a part added to `lawnChair.ts`
// without a role added above would be drawn in the wrong colour.
if (BACK_ROLES.length !== CHAIR_BACK_PARTS || FRONT_ROLES.length !== CHAIR_FRONT_PARTS
  || MUG_ROLES.length !== MUG_PARTS) {
  throw new Error('ChairArt: role lists out of step with lawnChair.ts');
}

const S = StyleSheet.create({
  part: {
    position: 'absolute',
    left: -SRC / 2,
    top: -SRC / 2,
    width: SRC,
    height: SRC,
  },
});
