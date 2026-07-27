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

function Brick({ style, label, wide }: { style: any; label: string; wide?: boolean }) {
  return (
    <Animated.View style={[styles.brick, style]}>
      <Text style={styles.brickText} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.8}>
        {label}
      </Text>
    </Animated.View>
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
        <View style={styles.slot} />
      </Animated.View>

      {/* the three bricks. Far-to-near order is irrelevant (no overlap when whole);
          the keystone is drawn last so a collapse tumbles it over the base. */}
      <Animated.View style={[box, s1]}><Brick style={null} label={p1Label} /></Animated.View>
      <Animated.View style={[box, s2]}><Brick style={null} label={p2Label} /></Animated.View>
      <Animated.View style={[box, sk]}><Brick style={null} label={keyLabel} /></Animated.View>

      {/* role captions */}
      <Animated.View style={[styles.tagConc, tagStyle]}>
        <Text style={styles.tagText}>CONCLUSION</Text>
      </Animated.View>
      <Animated.View style={[styles.tagPrem, tagStyle]}>
        <Text style={styles.tagText}>PREMISES</Text>
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
  slotAt: { transform: [{ translateX: KEY_X }, { translateY: KEY_Y }] },
  slot: {
    width: BW, height: BH, borderRadius: 3,
    borderWidth: 2, borderColor: SOFT, borderStyle: 'dashed',
    backgroundColor: 'transparent',
  },
  plinth: {
    position: 'absolute', left: CENTER_X - 122, width: 244, height: 2,
    backgroundColor: RULE,
  },
  tagConc: {
    position: 'absolute', left: 0, right: 0, top: KEY_Y - BH / 2 - 16, alignItems: 'center',
  },
  tagPrem: {
    position: 'absolute', left: 0, right: 0, top: PLINTH_Y + 8, alignItems: 'center',
  },
  tagText: {
    fontFamily: 'Inter_700Bold', fontSize: 9.5, letterSpacing: 1.6, color: SOFT,
  },
});
