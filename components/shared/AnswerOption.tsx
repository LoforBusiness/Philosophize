import { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming, Easing } from 'react-native-reanimated';
import { C, RADIUS, LIP } from '@/constants/design';

// ─────────────────────────────────────────────────────────────────────────────
// ONE ANSWER ROW, FOR THE QUIZ AND FOR EVERY LESSON.
//
//   "I want you to make the button look a little bit more of depth instead of the
//    current look right now … I want it to look better and be more smooth and have
//    a couple of smooth animations in there, but not complete lesson type
//    animations … I want you to create a similar look and interaction of the test
//    yourself feature and then I want it implemented into all lessons."
//
// The thinker's quiz and the lesson deck were asking the same question in two
// different hands. The lesson's row already had the app's depth idiom — a slab of
// the lip colour behind the face, and pressing drops the face onto it, exactly as
// `components/ui/Button` does it. The quiz's row was a flat bordered box that
// changed its background colour on press. This is the lesson's row, extracted, so
// there is one of them and neither can drift.
//
// ── THE DEPTH IS A LEDGE, NOT A SHADOW ──────────────────────────────────────
//
// A solid slab of `C.HUE` sits behind the face, offset down by the lip's own
// height, so at rest a 4px ledge shows along the bottom. Pressing slides the face
// down by exactly that, which covers the slab completely — the button appears to
// go INTO the page rather than to dim. `Button.tsx`'s header sets out why the slab
// is absolutely positioned (so it never touches layout) and why only `translateY`
// animates (paint-only, so Yoga never runs during a press).
//
// **No lip once answered.** The row has stopped being a button, and a ledge under
// a thing that cannot be pressed is an affordance that lies.
//
// ── TWO ANIMATIONS, AND DELIBERATELY ONLY TWO ───────────────────────────────
//
//   · the press, 90ms down and 140ms back, so the drop is a movement rather than
//     a jump;
//   · one small settle on the row that turns out to be the answer — 1 → 1.03 → 1
//     over 260ms.
//
// Nothing else moves. The reader was explicit that this must not become what a
// lesson is, and a cinematic beat is 8 tracks and a camera; this is a button that
// knows it has been pressed and a row that says "this one".
//
// ── AND THE LETTER IS OPTIONAL, WHICH IS NOT A DETAIL ───────────────────────
//
// The quiz letters its options A/B/C and the lesson deck does not, and that stays
// true. Group J9 of the rule book is about exactly this: 27 lesson explanations
// said "the trap is B" after the lettered deck had been replaced by two unlabelled
// cards, so every one of those letters named nothing. Giving the lessons letters
// again would re-open a fault the corpus has already been swept for.
// ─────────────────────────────────────────────────────────────────────────────

export type AnswerState = 'idle' | 'right' | 'wrong' | 'dim';

interface Props {
  label: string;
  state: AnswerState;
  onPress: () => void;
  /** A/B/C for the quiz. The lesson deck passes nothing — see the note above. */
  badge?: string;
  /** Centred and short, for a two-up Yes/No pair rather than a full-width row. */
  compact?: boolean;
  style?: object;
}

const PRESS_DOWN = 90;
const PRESS_UP = 140;
const SETTLE = 260;

export default function AnswerOption({ label, state, onPress, badge, compact, style }: Props) {
  const answered = state !== 'idle';
  const lip = answered ? 0 : LIP.button;

  const down = useSharedValue(0);
  const pop = useSharedValue(1);

  useEffect(() => {
    if (state !== 'right') return;
    // One settle, on the row that turns out to be the answer. Anticipation is not
    // wanted here — this is a statement, not a reaction to a press.
    pop.value = withSequence(
      withTiming(1.03, { duration: SETTLE * 0.4, easing: Easing.out(Easing.quad) }),
      withTiming(1, { duration: SETTLE * 0.6, easing: Easing.out(Easing.cubic) }),
    );
  }, [state, pop]);

  const faceStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: down.value * lip }, { scale: pop.value }],
  }));
  const dimStyle = useAnimatedStyle(() => ({
    opacity: withTiming(state === 'dim' ? 0.45 : 1, { duration: 220 }),
  }));

  return (
    <Animated.View style={[st.slot, dimStyle, style]}>
      <Pressable
        disabled={answered}
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={onPress}
        onPressIn={() => { down.value = withTiming(1, { duration: PRESS_DOWN }); }}
        onPressOut={() => { down.value = withTiming(0, { duration: PRESS_UP }); }}
      >
        <View style={{ paddingBottom: lip }}>
          {lip > 0 ? <View pointerEvents="none" style={[st.lip, { top: lip }]} /> : null}
          <Animated.View
            style={[
              st.face,
              compact && st.faceCompact,
              state === 'right' && st.right,
              state === 'wrong' && st.wrong,
              faceStyle,
            ]}
          >
            {badge ? (
              <View style={[st.badge, state === 'right' && st.badgeRight, state === 'wrong' && st.badgeWrong]}>
                <Text style={[st.badgeText, (state === 'right' || state === 'wrong') && { color: C.paper }]}>
                  {state === 'right' ? '✓' : state === 'wrong' ? '✕' : badge}
                </Text>
              </View>
            ) : null}
            <Text
              style={[
                st.text,
                compact && st.textCompact,
                state === 'right' && st.textRight,
                state === 'wrong' && st.textWrong,
              ]}
            >
              {label}
            </Text>
          </Animated.View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const st = StyleSheet.create({
  slot: { marginBottom: 8 },
  lip: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    borderRadius: RADIUS.button, backgroundColor: C.HUE,
  },
  face: {
    flexDirection: 'row', alignItems: 'center', gap: 11,
    borderWidth: 2, borderColor: C.ink, borderRadius: RADIUS.button,
    paddingVertical: 11, paddingHorizontal: 14, backgroundColor: C.paper,
  },
  faceCompact: { justifyContent: 'center', paddingVertical: 13, paddingHorizontal: 8, gap: 0 },

  // The reveal is COLOUR, never an ink flood: filling the row the reader got
  // RIGHT with the heaviest mark in the app was the note the lesson deck already
  // carries, and it applies here for the same reason.
  right: { borderColor: C.correct, backgroundColor: '#EAF1E6' },
  wrong: { borderColor: C.wrong, backgroundColor: C.wrongSoft },

  text: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 13.5, color: C.ink, lineHeight: 18 },
  // KEEPS `flex: 1` FROM THE BASE. Setting `flex: 0` here shrank the Text to its
  // minimum content width inside the row, so "Yes, he did" wrapped to three lines
  // and broke at the comma — "Yes / , he / did". That is group S1: a word cut off
  // by its own box, arriving through a flex property rather than a width.
  textCompact: { textAlign: 'center', fontFamily: 'Inter_700Bold', fontSize: 14 },
  textRight: { color: C.correct, fontFamily: 'Inter_700Bold' },
  textWrong: { color: C.wrong },

  badge: {
    width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: C.hairline,
    alignItems: 'center', justifyContent: 'center',
  },
  badgeRight: { backgroundColor: C.correct, borderColor: C.correct },
  badgeWrong: { backgroundColor: C.wrong, borderColor: C.wrong },
  badgeText: {
    fontFamily: 'Inter_700Bold', fontSize: 11.5, color: C.ink,
    includeFontPadding: false,
  },
});
