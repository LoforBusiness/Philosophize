import { useMemo } from 'react';
import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

// ─────────────────────────────────────────────────────────────────────────────
// The live brick structure for logic-arguments-2 ("The Master Builder").
//
// An argument as a building: two premise-bricks at the base, a conclusion keystone
// resting on top. This is the lesson's hero visual, so — exactly like the figures
// (see Stickman.tsx / rig.ts) — it is drawn as native RN Views moved by Reanimated
// transforms, NOT as an <Svg>. react-native-svg 15 re-uploads the whole surface to
// a GPU bitmap on any animated child (~10fps full-screen on an S24 Ultra); Views
// composite the collapse and the fly-up on the GPU for free.
//
// This component is a DUMB renderer, the way Stickman is: the parent computes one
// derived `S` (each brick's translate / rotate / scale / opacity) on the UI thread
// and this applies it. Brick FACE TEXT is a plain React prop — it is not animated
// geometry, so a re-render swaps it with no cost, and freshly-lettered bricks are
// re-laid (a drop-in) by the parent so the swap never pops.
// ─────────────────────────────────────────────────────────────────────────────

const INK = '#1A1A1A';
const PAPER = '#FAFAF7';
const SOFT = '#6B6B6B';
const RULE = '#E4E1D8';

// Brick geometry, in STAGE units (the same 400×560 space the figures live in — the
// structure sits inside the camera container, so it pans and zooms with them).
// The base is kept narrow and centred (a compact column) so the two builders stand
// clearly BESIDE it rather than buried behind it — only their reaching arms cross
// over, and those tuck behind since the structure draws on top.
export const BW = 114;          // brick width
export const BH = 41;           // brick height
export const CENTER_X = 200;    // structure centre
export const BASE_LX = 142;     // base-left brick centre
export const BASE_RX = 258;     // base-right brick centre
export const BASE_Y = 452;      // base row centre (a bench height, not the floor)
export const KEY_X = CENTER_X;  // keystone centre
export const KEY_Y = BASE_Y - BH - 3;   // keystone centre, resting on the base
export const PLINTH_Y = BASE_Y + BH / 2 + 3;

/** One brick's animated state. */
export interface BrickXf { tx: number; ty: number; rot: number; scale: number; opacity: number }
/** The whole structure, computed by the parent each frame. */
export interface StructState {
  p1: BrickXf; p2: BrickXf; key: BrickXf;
  slotOp: number;               // the dashed empty keystone slot (fly-up question)
  tagOp: number;                // the PREMISES / CONCLUSION role captions
}

interface Props {
  S: SharedValue<StructState>;
  p1Label: string;
  p2Label: string;
  keyLabel: string;
}

// Ruled writing lines for an UNLETTERED stone. Act 1 shows three blank bricks for
// three straight beats, and a bare rectangle there read as unfinished art rather
// than as "a stone waiting for a sentence". Two ruled lines say the second thing.
const RULED_LONG = [0, 1, 2, 3, 4, 5, 6];
const RULED_SHORT = [0, 1, 2, 3];

function Brick({ label }: { label: string }) {
  if (!label) {
    return (
      <View style={styles.brick}>
        <View style={styles.ruledRow}>
          {RULED_LONG.map((k) => <View key={k} style={styles.ruledDash} />)}
        </View>
        <View style={[styles.ruledRow, { marginTop: 7 }]}>
          {RULED_SHORT.map((k) => <View key={k} style={styles.ruledDash} />)}
        </View>
      </View>
    );
  }
  return (
    <View style={styles.brick}>
      <Text style={styles.brickText} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.8}>
        {label}
      </Text>
    </View>
  );
}

export default function BrickStructure({ S, p1Label, p2Label, keyLabel }: Props) {
  // Placement helper: a brick box is centred on the origin (left/top pull it back
  // by half), so translate puts its CENTRE at (tx,ty) and rotate/scale pivot there.
  const box = useMemo<ViewStyle>(
    () => ({ position: 'absolute', left: -BW / 2, top: -BH / 2, width: BW, height: BH }),
    []
  );

  const s1 = useAnimatedStyle(() => {
    const b = S.value.p1;
    return { opacity: b.opacity, transform: [{ translateX: b.tx }, { translateY: b.ty }, { rotate: `${b.rot}deg` }, { scale: b.scale }] };
  });
  const s2 = useAnimatedStyle(() => {
    const b = S.value.p2;
    return { opacity: b.opacity, transform: [{ translateX: b.tx }, { translateY: b.ty }, { rotate: `${b.rot}deg` }, { scale: b.scale }] };
  });
  const sk = useAnimatedStyle(() => {
    const b = S.value.key;
    return { opacity: b.opacity, transform: [{ translateX: b.tx }, { translateY: b.ty }, { rotate: `${b.rot}deg` }, { scale: b.scale }] };
  });
  const slotStyle = useAnimatedStyle(() => ({ opacity: S.value.slotOp }));
  const tagStyle = useAnimatedStyle(() => ({ opacity: S.value.tagOp }));

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {/* plinth the structure is built on */}
      <View style={[styles.plinth, { top: PLINTH_Y }]} />

      {/* Empty dashed keystone slot — shown only for the fly-up question. It has to
          carry its own translate to the keystone spot: `box` only re-centres the
          brick on its origin, and every other brick is placed by the animated
          transform the parent supplies. Without this the slot rendered at the
          scene's top-left corner, far off stage, and was never once seen. */}
      <Animated.View style={[box, styles.slotAt, slotStyle]}>
        <View style={styles.slot}>
          {/* the gap states the question the fly-up answers */}
          <Text style={styles.slotMark}>?</Text>
        </View>
      </Animated.View>

      {/* the three bricks. Far-to-near order is irrelevant (no overlap when whole);
          the keystone is drawn last so a collapse tumbles it over the base. */}
      <Animated.View style={[box, s1]}><Brick label={p1Label} /></Animated.View>
      <Animated.View style={[box, s2]}><Brick label={p2Label} /></Animated.View>
      <Animated.View style={[box, sk]}><Brick label={keyLabel} /></Animated.View>

      {/* ROLE CALL-OUTS. These used to be 9.5px grey captions floating near the
          structure, which on a phone read as specks. They are now plaques with a
          leader rule running to the part they name, so the build reads as a
          LABELLED DIAGRAM — the annotation points at its subject instead of
          hovering near it. Both are horizontally centred on the column (x 200),
          which is clear of both builders (x 62 and 330) at every camera scale. */}
      <Animated.View style={[styles.tagConc, tagStyle]}>
        <View style={styles.plaque}><Text style={styles.plaqueText}>CONCLUSION</Text></View>
        <View style={styles.leader} />
      </Animated.View>
      <Animated.View style={[styles.tagPrem, tagStyle]}>
        <View style={styles.leader} />
        <View style={styles.plaque}><Text style={styles.plaqueText}>PREMISES</Text></View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  brick: {
    width: BW, height: BH,
    borderWidth: 1.5, borderColor: INK, borderRadius: 3,
    backgroundColor: PAPER, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 7,
  },
  brickText: {
    fontFamily: 'Inter_500Medium', fontSize: 12, lineHeight: 14.5, color: INK, textAlign: 'center',
    includeFontPadding: false,
  },
  // SOFT, not RULE: a RULE-weight hairline on PAPER is a structural tick that all
  // but disappears at the stage's scale, and these have to READ as "a face waiting
  // for a sentence" from arm's length.
  ruledRow: { flexDirection: 'row', gap: 5 },
  ruledDash: { width: 7, height: 1.5, backgroundColor: SOFT, borderRadius: 1 },

  slotAt: { transform: [{ translateX: KEY_X }, { translateY: KEY_Y }] },
  slot: {
    width: BW, height: BH, borderRadius: 3,
    borderWidth: 2, borderColor: SOFT, borderStyle: 'dashed',
    backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center',
  },
  slotMark: {
    fontFamily: 'Inter_700Bold', fontSize: 22, color: SOFT, includeFontPadding: false,
  },
  plinth: {
    position: 'absolute', left: CENTER_X - 122, width: 244, height: 2,
    backgroundColor: RULE,
  },

  // ── the role call-outs ──────────────────────────────────────────────────────
  // Geometry, so the leaders actually touch what they name:
  //   CONCLUSION  plaque 16 + leader 5 = 21 tall, sitting on the keystone's top
  //               edge (KEY_Y − BH/2 = 387.5) → top 365.5.
  //   PREMISES    leader 5 + plaque 16 = 21 tall, starting just under the plinth
  //               (477.5) → bottom 498.5, which still clears the ground line (500).
  // Both are comfortably inside the lesson's [110, 434] band at every camera scale
  // (CONCLUSION lands at screen ~196–199, PREMISES at ~355–360).
  tagConc: {
    position: 'absolute', left: 0, right: 0, top: KEY_Y - BH / 2 - 22, alignItems: 'center',
  },
  tagPrem: {
    position: 'absolute', left: 0, right: 0, top: PLINTH_Y + 2, alignItems: 'center',
  },
  plaque: {
    height: 16, paddingHorizontal: 9, borderRadius: 3, backgroundColor: INK,
    alignItems: 'center', justifyContent: 'center',
  },
  plaqueText: {
    fontFamily: 'Inter_700Bold', fontSize: 10.5, letterSpacing: 1.5, color: PAPER,
    includeFontPadding: false,
  },
  leader: { width: 1.5, height: 5, backgroundColor: INK },
});
