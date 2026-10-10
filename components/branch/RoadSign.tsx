import { memo, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  cancelAnimation, Easing, interpolateColor, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming,
} from 'react-native-reanimated';
import SketchIcon, { type SketchIconName } from '@/components/shared/SketchIcon';
import {
  ramp, mix, INK, MID, PAPER, PAPER_LIT, EMBER, EMBER_DEEP, LOCK_FACE, LOCK_EDGE, LOCK_MARK, SAND,
} from '@/components/shared/tone';

// ─────────────────────────────────────────────────────────────────────────────
// A LESSON'S SIGN ON THE ROAD (2026-10-01).
//
//   "I want you to make sure that all the words are always visible on the signs.
//    I notice a lot of them get cut out or it's not properly aligned for the box …
//    instead of them just being words, I want some sort of design on them."
//
// ── WHY THE WORDS WERE CUT, AND WHY THEY CANNOT BE NOW ──────────────────────
//
// The old sign was a box that SHRANK TO ITS TEXT, with a two-line clamp and a line
// height (15) under Playfair's own (16.5 at 12px). Android measures a shrink-wrapped
// line by advance widths and then draws Playfair's bold ink past the last advance,
// so the last letter of a line could be shaved; a line box shorter than the face
// clips ascenders; and a title wanting three lines lost its third to the clamp. Each
// sign was also a different width, so no two boards sat the same way on their post.
//
// So: every board is ONE fixed width (SIGN_W), the title has no clamp and a line
// height above the face's own, and `check:subjects` wraps every live title against
// Playfair's real .ttf at TITLE_PX in TEXT_W less a safety margin and fails if one
// would need more than three lines. A title that fits the check fits the phone.
//
// ── THE DESIGN ──────────────────────────────────────────────────────────────
//
// A painted signboard in the road's own colour: a header strip with the stop's
// icon and number, the title on the board, two nail heads, a ledge under it like
// every pressable thing in the app, and a wooden post. The stop you are at is the
// board painted solid in the road's hue. A finished one wears a tick; a locked one
// a padlock, flat and cool. And a lesson added in the last twelve days wears NEW on
// its top-right corner — an ember tab that tilts, lifts and breathes, the loudest
// thing on the road on purpose.
// ─────────────────────────────────────────────────────────────────────────────

/** The board's width. Held by `check:subjects` against every live title. */
export const SIGN_W = 148;
/** The board's padding a side and its border. */
export const SIGN_PAD = 10;
export const SIGN_BORDER = 2;
/** The width the title wraps in. */
export const TEXT_W = SIGN_W - 2 * (SIGN_PAD + SIGN_BORDER);
/** The title's size and line. The line is ABOVE Playfair's own (about 1.33 em). */
export const TITLE_PX = 13;
export const TITLE_LINE = 18;
/** The most lines a title may take. */
export const TITLE_LINES = 3;

function RoadSign({
  title, hue, label, icon, here, done, locked, isNew, needsPass = false,
}: {
  title: string;
  /** The road's colour. */
  hue: string;
  /** The header strip: LESSON 2, UNIT REVIEW. */
  label: string;
  icon: SketchIconName;
  here: boolean;
  done: boolean;
  locked: boolean;
  isNew: boolean;
  /** Locked because the Pass would open it, rather than because it is further on. */
  needsPass?: boolean;
}) {
  const r = ramp(hue);
  // EVERY COLOUR AS A PAIR — away and here — so arriving at a sign is a blend, not a
  // switch (2026-10-01): "when the stick man arrives at a new sign … not a snappy
  // change of the sign, but a smooth one." One value, 0 → 1, runs the face, the
  // edge, the strip, the title's ink and the nails together, and the TAP TO START
  // pill opens out of the board as the same value rises. A locked board has one
  // look either way, so both ends of its pairs are the same colour.
  const away = {
    face: locked ? LOCK_FACE : PAPER_LIT,
    edge: locked ? LOCK_EDGE : mix(r.base, PAPER, 0.55),
    strip: locked ? LOCK_EDGE : r.base,
    ink: locked ? MID : INK,
    nail: locked ? LOCK_MARK : mix(r.base, PAPER, 0.45),
  };
  const near = locked ? away : { face: r.base, edge: r.shade, strip: r.shade, ink: PAPER, nail: r.lit };
  const ledge = locked ? LOCK_EDGE : r.shade;
  const post = locked ? LOCK_MARK : mix(r.shade, INK, 0.25);

  const v = useSharedValue(here ? 1 : 0);
  useEffect(() => {
    v.value = withTiming(here ? 1 : 0, { duration: here ? 520 : 320, easing: Easing.inOut(Easing.cubic) });
  }, [here, v]);
  // Colours as plain strings into each style, never a helper function: a plain
  // function captured by a worklet throws on the UI thread (§17 rule 6).
  const [f0, f1, e0, e1] = [away.face, near.face, away.edge, near.edge];
  const [s0, s1, i0, i1, n0, n1] = [away.strip, near.strip, away.ink, near.ink, away.nail, near.nail];
  const boardS = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(v.value, [0, 1], [f0, f1]),
    borderColor: interpolateColor(v.value, [0, 1], [e0, e1]),
  }));
  const stripS = useAnimatedStyle(() => ({ backgroundColor: interpolateColor(v.value, [0, 1], [s0, s1]) }));
  const inkS = useAnimatedStyle(() => ({ color: interpolateColor(v.value, [0, 1], [i0, i1]) }));
  const nailS = useAnimatedStyle(() => ({ backgroundColor: interpolateColor(v.value, [0, 1], [n0, n1]) }));
  // The pill grows from nothing to its height, so the board rises smoothly on its
  // post rather than jumping taller by a line.
  const goS = useAnimatedStyle(() => {
    const u = Math.min(1, Math.max(0, (v.value - 0.25) / 0.75));
    return { height: GO_H * v.value, opacity: u, transform: [{ scale: 0.8 + 0.2 * u }] };
  });

  return (
    <View style={st.wrap}>
      <View style={st.boardBox}>
        <View style={[st.ledge, { backgroundColor: ledge }]} />
        <Animated.View style={[st.board, boardS]}>
          <Animated.View style={[st.strip, stripS]}>
            <SketchIcon name={locked ? 'lock' : icon} size={11} color={locked ? MID : PAPER} />
            <Text style={[st.stripText, { color: locked ? MID : PAPER }]} numberOfLines={1}>{label}</Text>
          </Animated.View>
          <Animated.Text style={[st.title, inkS]}>{title}</Animated.Text>
          {/* Mounted at every sign and opened by the value, so it can grow in. A
              locked board says what would open it instead. */}
          <Animated.View style={[st.goBox, goS]} pointerEvents="none">
            <View style={[st.go, { backgroundColor: locked ? PAPER_LIT : PAPER }]}>
              <Text style={[st.goText, { color: locked ? MID : r.shade }]} numberOfLines={1}>
                {!locked ? 'TAP TO START' : needsPass ? 'UNLOCK WITH THE PASS' : 'FINISH THE ONE BEFORE'}
              </Text>
            </View>
          </Animated.View>
          {/* Two nail heads, where a board is fixed to its post. */}
          <Animated.View style={[st.nail, st.nailL, nailS]} />
          <Animated.View style={[st.nail, st.nailR, nailS]} />
        </Animated.View>
        {done && !locked ? (
          <View style={[st.tick, { backgroundColor: here ? PAPER : r.base, borderColor: here ? r.shade : PAPER_LIT }]}>
            <SketchIcon name="check" size={12} color={here ? r.base : PAPER} />
          </View>
        ) : null}
        {isNew ? <NewTab /> : null}
      </View>
      <View style={[st.post, { backgroundColor: post }]}>
        <View style={[st.postLit, { backgroundColor: mix(post, PAPER, 0.25) }]} />
      </View>
      <View style={[st.foot, { backgroundColor: post }]} />
    </View>
  );
}

/**
 * Rebuilt only when what it shows changes (2026-10-09). Every prop is a plain value, and
 * the road screen re-renders on focus and on the camera's first reading, which redrew
 * all five signs twice straight after the road opened for nothing.
 */
export default memo(RoadSign);

/**
 * NEW, on the board's top-right corner. It lands once (a stamp coming down, like
 * every other struck thing in the app) and then breathes, slowly, for as long as it
 * is on screen — at most five signs are ever mounted, and it stops when it unmounts.
 */
function NewTab() {
  const beat = useSharedValue(0);
  useEffect(() => {
    beat.value = withSequence(
      withTiming(1, { duration: 260, easing: Easing.in(Easing.quad) }),
      withRepeat(withTiming(2, { duration: 900, easing: Easing.inOut(Easing.sin) }), -1, true),
    );
    return () => cancelAnimation(beat);
  }, [beat]);
  const style = useAnimatedStyle(() => {
    const v = beat.value;
    const scale = v < 1 ? 1.6 - 0.6 * v : 1 + 0.09 * (v - 1);
    return { opacity: Math.min(1, v * 2), transform: [{ rotate: '9deg' }, { scale }] };
  });
  return (
    <Animated.View style={[st.newWrap, style]} pointerEvents="none" accessibilityLabel="New lesson">
      <View style={st.newLedge} />
      <View style={st.newFace}>
        <View style={st.newShine} />
        <Text style={st.newText}>NEW</Text>
      </View>
    </Animated.View>
  );
}

/**
 * The end of a road: a plank on two posts saying more lessons are coming. It is not
 * pressable, so it stands on no ledge. The words are set to fit the plank on two
 * lines rather than tracked out across one that overran it.
 */
export function ComingSoonBoard({ hue, road }: { hue: string; road: string }) {
  const r = ramp(hue);
  const wood = mix(r.shade, INK, 0.25);
  return (
    <View style={st.wrap}>
      <View style={[st.plank, { borderColor: wood, backgroundColor: mix(r.base, PAPER, 0.88) }]}>
        <View style={[st.plankBand, { backgroundColor: r.base }]}>
          <SketchIcon name="clock" size={11} color={PAPER} />
          <Text style={[st.stripText, { color: PAPER }]}>ON THE WAY</Text>
        </View>
        <Text style={[st.soonTitle, { color: r.shade }]}>More lessons{'\n'}coming soon</Text>
        <Text style={st.soonSub} numberOfLines={2}>{road}</Text>
        <View style={[st.nail, st.nailL, { backgroundColor: wood }]} />
        <View style={[st.nail, st.nailR, { backgroundColor: wood }]} />
      </View>
      <View style={st.posts}>
        <View style={[st.post, { backgroundColor: wood, height: 30 }]} />
        <View style={[st.post, { backgroundColor: wood, height: 30 }]} />
      </View>
    </View>
  );
}

const LIP = 4;
/** The TAP TO START pill's full height, margin included: what the board grows by on arrival. */
const GO_H = 26;

const st = StyleSheet.create({
  wrap: { width: SIGN_W + 24, alignItems: 'center' },
  boardBox: { width: SIGN_W, paddingBottom: LIP },
  ledge: { position: 'absolute', left: 0, right: 0, top: LIP, bottom: 0, borderRadius: 12 },
  board: {
    width: SIGN_W, borderWidth: SIGN_BORDER, borderRadius: 12, overflow: 'hidden',
    paddingHorizontal: SIGN_PAD, paddingBottom: 9, alignItems: 'center',
  },
  strip: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5,
    alignSelf: 'stretch', marginHorizontal: -SIGN_PAD, paddingVertical: 4, marginBottom: 6,
  },
  stripText: { fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.4, includeFontPadding: false },
  title: {
    width: TEXT_W, fontFamily: 'PlayfairDisplay_700Bold', fontSize: TITLE_PX, lineHeight: TITLE_LINE,
    textAlign: 'center',
  },
  goBox: { alignItems: 'center', justifyContent: 'flex-end', overflow: 'hidden' },
  go: { marginTop: 6, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 },
  goText: { fontFamily: 'Inter_700Bold', fontSize: 8.5, letterSpacing: 1.2, includeFontPadding: false },
  // In the header strip's corners, clear of the title whatever its length.
  nail: { position: 'absolute', top: 9, width: 5, height: 5, borderRadius: 2.5 },
  nailL: { left: 7 },
  nailR: { right: 7 },
  tick: {
    position: 'absolute', left: -8, top: -8, width: 24, height: 24, borderRadius: 12, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  post: { width: 8, height: 26, marginTop: -2, borderRadius: 2, overflow: 'hidden' },
  postLit: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3 },
  foot: { width: 22, height: 6, borderRadius: 3, marginTop: -1 },

  plank: {
    width: SIGN_W, borderWidth: 2.5, borderRadius: 10, overflow: 'hidden', alignItems: 'center', paddingBottom: 9,
  },
  plankBand: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, alignSelf: 'stretch',
    paddingVertical: 4, marginBottom: 6,
  },
  soonTitle: {
    width: TEXT_W, fontFamily: 'PlayfairDisplay_700Bold', fontSize: TITLE_PX, lineHeight: TITLE_LINE, textAlign: 'center',
  },
  soonSub: {
    width: TEXT_W, fontFamily: 'Inter_500Medium', fontSize: 10, lineHeight: 14, color: MID, textAlign: 'center', marginTop: 3,
  },
  posts: { flexDirection: 'row', justifyContent: 'space-between', width: SIGN_W - 40, marginTop: -2 },
  newWrap: { position: 'absolute', right: -14, top: -14, paddingBottom: 3 },
  newLedge: { position: 'absolute', left: 0, right: 0, top: 3, bottom: 0, borderRadius: 8, backgroundColor: EMBER_DEEP },
  newFace: {
    backgroundColor: EMBER, borderRadius: 8, borderWidth: 2, borderColor: SAND,
    paddingHorizontal: 8, paddingVertical: 3, overflow: 'hidden',
  },
  newShine: { position: 'absolute', left: 0, right: 0, top: 0, height: 6, backgroundColor: 'rgba(255,255,255,0.28)' },
  newText: { fontFamily: 'Inter_700Bold', fontSize: 12, letterSpacing: 1.6, color: PAPER_LIT, includeFontPadding: false },
});
