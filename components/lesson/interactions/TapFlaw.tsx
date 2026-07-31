import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import type { TapFlawInteraction } from '@/data/types';
import { T } from '../theme';

interface Props {
  interaction: TapFlawInteraction;
  xpValue: number;
  onComplete: (correct: boolean) => void;
}

/**
 * "Where does this go wrong?" — the argument is laid out as a numbered chain and
 * the reader taps the step that breaks it.
 *
 * The whole point is that it reads as a chain, not a list of options: the steps
 * are joined by a rule down the left so the eye runs top to bottom, and each one
 * is numbered in argument order. A reader who taps the conclusion because it
 * sounds false — rather than the step that doesn't follow — should feel the
 * difference when the explanation names the move.
 */
export default function TapFlaw({ interaction, onComplete }: Props) {
  const [pickedId, setPickedId] = useState<string | null>(null);
  const answered = pickedId !== null;
  const isCorrect = answered && pickedId === interaction.flawedId;

  function pick(id: string) {
    if (answered) return;
    setPickedId(id);
    onComplete(id === interaction.flawedId);
  }

  return (
    <View style={{ marginTop: 16 }}>
      <Text style={styles.hint}>TAP THE STEP THAT DOESN’T HOLD</Text>

      <View style={styles.chain}>
        {interaction.steps.map((step, i) => {
          const flawed = answered && step.id === interaction.flawedId;
          const wrongPick = answered && step.id === pickedId && !flawed;
          const dim = answered && !flawed && !wrongPick;
          const last = i === interaction.steps.length - 1;
          return (
            <View key={step.id} style={styles.stepWrap}>
              {/* the rule linking one step to the next — what makes it read as
                  an argument rather than four unrelated choices */}
              {!last && <View style={styles.link} />}
              <Pressable
                onPress={() => pick(step.id)}
                disabled={answered}
                style={({ pressed }) => [
                  styles.step,
                  flawed && styles.stepFlawed,
                  wrongPick && styles.stepWrong,
                  dim && { opacity: 0.42 },
                  pressed && !answered && { backgroundColor: T.press },
                ]}
              >
                <View style={[styles.num, flawed && styles.numFlawed, wrongPick && styles.numWrong]}>
                  <Text style={[styles.numText, (flawed || wrongPick) && { color: T.panel }]}>
                    {i + 1}
                  </Text>
                </View>
                <Text style={styles.stepText}>{step.text}</Text>
                {flawed && <Text style={styles.mark}>✕</Text>}
              </Pressable>
            </View>
          );
        })}
      </View>

      {answered && (
        <MotiView
          from={{ opacity: 0, translateY: 8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 240 }}
          style={styles.explain}
        >
          <Text style={[styles.explainLabel, { color: isCorrect ? T.green : T.red }]}>
            {isCorrect ? '✓ THAT’S THE BREAK' : '✕ THE BREAK IS STEP ' + (interaction.steps.findIndex((s) => s.id === interaction.flawedId) + 1)}
          </Text>
          <Text style={styles.explainText}>{interaction.explanation}</Text>
          <Text style={styles.swipeHint}>SWIPE TO CONTINUE →</Text>
        </MotiView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  hint: {
    fontFamily: 'Inter_700Bold', fontSize: 9.5, color: T.gold,
    letterSpacing: 1.8, marginBottom: 12,
  },
  chain: { marginBottom: 4 },
  stepWrap: { position: 'relative' },
  link: {
    position: 'absolute', left: 27, top: 44, bottom: -2,
    width: 1.5, backgroundColor: T.border,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 13,
    backgroundColor: T.panel,
    borderWidth: 1.5,
    borderColor: T.border,
    borderRadius: 8,
    padding: 13,
    marginBottom: 12,
  },
  stepFlawed: { borderColor: T.red, backgroundColor: T.redBg },
  stepWrong: { borderColor: T.dim, backgroundColor: T.panelSoft },
  num: {
    width: 25, height: 25, borderRadius: 12.5,
    borderWidth: 1.5, borderColor: T.border,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: T.panel,
  },
  numFlawed: { backgroundColor: T.red, borderColor: T.red },
  numWrong: { backgroundColor: T.dim, borderColor: T.dim },
  numText: { fontFamily: 'Inter_700Bold', fontSize: 12, color: T.inkSoft },
  stepText: {
    flex: 1, minWidth: 0,
    fontFamily: 'PlayfairDisplay_400Regular', fontSize: 15.5, color: T.cream, lineHeight: 22,
  },
  mark: { fontFamily: 'Inter_700Bold', fontSize: 14, color: T.red, marginTop: 3 },

  explain: { borderLeftWidth: 2, borderLeftColor: T.border, paddingLeft: 14, marginTop: 4, marginBottom: 8 },
  explainLabel: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1.5, marginBottom: 6 },
  explainText: { fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 14, color: T.creamSoft, lineHeight: 21 },
  swipeHint: { fontFamily: 'Inter_700Bold', fontSize: 10, color: T.inkSoft, letterSpacing: 2, marginTop: 14 },
});
