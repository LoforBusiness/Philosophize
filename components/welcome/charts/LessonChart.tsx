// LessonChart — the question the host asks, drawn as the control that asks it.
//
// A mock lesson card answering "Is it ever right to lie?": the card arrives, the
// two answers arrive, one is chosen, the verdict strikes. It is the only board
// that shows the PRODUCT rather than a fact about the product, which is why it
// goes first and why the host's next line is "You answer first. Then Kant argues
// back."
//
// ── IT IS DRAWN IN THE BRANCH'S OWN COLOUR NOW ──────────────────────────────
//
// R18 has struck every control in every lesson in its lesson's branch hue since
// the controls were gamified: "colour in the edges, one hue a lesson". This board
// is a picture of one of those controls and was drawn in ink, so the first answer
// control a reader ever sees looked like nothing they will meet again. "Is it ever
// right to lie?" is an ETHICS question, so the card is struck in the olive.
//
// The verdict keeps the app's own two states: the chosen answer re-strikes in
// `correct` with a tick, the other stays quiet. Nothing here invents a look — the
// tick, the lip and the plate are the vocabulary of `QuestionParts`.

import { View, Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import SketchIcon from '@/components/shared/SketchIcon';
import { C, BRANCH } from '@/constants/design';
import { ramp } from '@/components/shared/tone';
import { clamp01, easeOutCubic } from '@/components/welcome/ease';

/** Ethics, because the question is an ethics question. */
const HUE = BRANCH.ethics;
const R = ramp(HUE);
const OK = ramp(C.correct);

const ANSWERS = [
  { label: 'Never', at: 0.26, chosen: false },
  { label: 'To save a life', at: 0.36, chosen: true },
];

/** When the reader's choice lands, and when the verdict strikes on it. */
const PICK = 0.58;

function Answer({ p, a }: { p: SharedValue<number>; a: (typeof ANSWERS)[number] }) {
  const style = useAnimatedStyle(() => {
    const inA = easeOutCubic(clamp01((p.value - a.at) / 0.26));
    // The loser is not dimmed into unreadability — §17's own rule from the
    // answer controls: "Emphasis goes on the live one; it is never taken from
    // the others." 0.7, which is what `Target` settles an unpicked card at.
    const spent = a.chosen ? 1 : 1 - 0.3 * easeOutCubic(clamp01((p.value - PICK) / 0.3));
    return { opacity: inA * spent };
  });
  const face = useAnimatedStyle(() => {
    const v = a.chosen ? easeOutCubic(clamp01((p.value - PICK) / 0.3)) : 0;
    return {
      backgroundColor: v > 0.5 ? OK.track : C.paper,
      borderColor: v > 0.5 ? OK.base : R.base,
    };
  });
  const tick = useAnimatedStyle(() => ({
    opacity: a.chosen ? easeOutCubic(clamp01((p.value - PICK - 0.1) / 0.25)) : 0,
  }));

  return (
    <Animated.View style={[s.answerWrap, style]}>
      <Animated.View style={[s.answer, face]}>
        <Text style={s.answerText}>{a.label}</Text>
        <Animated.View style={tick}>
          <SketchIcon name="check" size={14} color={OK.shade} />
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

export default function LessonChart({ p }: { p: SharedValue<number> }) {
  const card = useAnimatedStyle(() => {
    const a = easeOutCubic(clamp01(p.value / 0.2));
    return { opacity: a, transform: [{ scale: 0.97 + 0.03 * a }] };
  });

  return (
    <View style={s.board}>
      <Animated.View style={[s.card, card]}>
        <Text style={s.kicker}>ETHICS · LESSON 1</Text>
        <Text style={s.question}>Is it ever right to lie?</Text>
        <View style={s.answers}>
          {ANSWERS.map((a) => <Answer key={a.label} p={p} a={a} />)}
        </View>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  board: { width: 372, height: 200, justifyContent: 'center' },
  // A raised face on a lip of the branch's hue — `LipPlate`'s construction, which
  // is how every answer control in every lesson is built.
  card: {
    backgroundColor: C.paper,
    borderWidth: 2,
    borderColor: R.base,
    borderRadius: 14,
    padding: 14,
    boxShadow: `0px 4px 0px ${R.shade}`,
  },
  kicker: {
    fontFamily: 'Inter_500Medium', fontSize: 10, letterSpacing: 2,
    color: R.shade, marginBottom: 4,
  },
  question: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 20, color: C.ink },
  answers: { marginTop: 12, gap: 8 },
  answerWrap: { width: '100%' },
  answer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1.4, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12,
  },
  answerText: { fontFamily: 'Inter_500Medium', fontSize: 14, color: C.ink },
});
