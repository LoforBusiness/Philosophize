import { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import type { DilemmaCard as DilemmaCardType, DilemmaView, AnswerResult } from '@/data/types';
import KineticNarration from '../KineticNarration';
import { useNarrateOnMount } from '../useNarrateOnMount';

interface Props {
  card: DilemmaCardType;
  onComplete: (result?: AnswerResult) => void;
}

const Ink = '#1A1A1A';
const InkSoft = '#6B6B6B';
const InkFaint = '#E8E8E3';
const Paper = '#FAFAF7';
const SelectFill = '#ECEBE6';

export default function DilemmaCard({ card, onComplete }: Props) {
  const [scenarioDone, setScenarioDone] = useState(false);
  const [chosenId, setChosenId] = useState<string | null>(null);

  const chosen = card.choices.find((c) => c.id === chosenId) ?? null;

  return (
    <View style={{ flex: 1, backgroundColor: 'transparent', paddingBottom: 24 }}>
      {!scenarioDone ? (
        // Dramatic, kinetic telling of the situation.
        <View style={{ flex: 1 }}>
          <KineticNarration
            text={card.scenario}
            variant="prompt"
            onDone={() => setScenarioDone(true)}
          />
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 12 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Scenario stays visible for reference */}
          <Text style={styles.scenario}>{card.scenario}</Text>

          {/* Prompt */}
          <Text style={styles.prompt}>{card.prompt}</Text>

          {/* Choices */}
          {card.choices.map((c) => {
            const isChosen = chosenId === c.id;
            return (
              <Pressable
                key={c.id}
                onPress={() => !chosenId && setChosenId(c.id)}
                style={({ pressed }) => [
                  styles.choice,
                  isChosen && styles.choiceChosen,
                  pressed && !chosenId && { backgroundColor: '#F0EFEA' },
                  !!chosenId && !isChosen && { opacity: 0.45 },
                ]}
              >
                <Text style={[styles.choiceText, isChosen && { fontFamily: 'Inter_700Bold' }]}>
                  {c.label}
                </Text>
              </Pressable>
            );
          })}

          {/* Reveal: what the philosophers would say */}
          {chosen && <Reveal views={card.views} chosenLabel={chosen.label} />}
        </ScrollView>
      )}

      {/* Continue */}
      {chosen && (
        <View style={{ paddingHorizontal: 24, paddingTop: 12 }}>
          <Pressable
            onPress={() => onComplete({ cardIndex: 0, correct: true, xpEarned: card.xpValue })}
            style={({ pressed }) => ({
              backgroundColor: Ink,
              borderRadius: 14,
              paddingVertical: 18,
              alignItems: 'center',
              opacity: pressed ? 0.75 : 1,
            })}
          >
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 18, color: Paper }}>
              Continue →
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function Reveal({ views, chosenLabel }: { views: DilemmaView[]; chosenLabel: string }) {
  // Read the thinkers' takes aloud when this panel appears.
  const speech =
    `You chose: ${chosenLabel}. ` +
    views.map((v) => `${v.thinker} would ${v.stance}. ${v.why}`).join(' ');
  useNarrateOnMount(speech);

  return (
    <MotiView
      from={{ opacity: 0, translateY: 14 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 260 }}
      style={{ marginTop: 18 }}
    >
      <Text style={styles.youChose}>You chose: {chosenLabel}</Text>
      <Text style={styles.revealLabel}>What the great thinkers would say…</Text>
      {views.map((v, i) => (
        <View key={i} style={styles.viewBox}>
          <Text style={styles.thinker}>{v.thinker}</Text>
          <Text style={styles.stance}>{v.stance}</Text>
          <Text style={styles.why}>{v.why}</Text>
        </View>
      ))}
    </MotiView>
  );
}

const styles = StyleSheet.create({
  scenario: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontStyle: 'italic',
    fontSize: 17,
    color: Ink,
    lineHeight: 26,
    marginBottom: 18,
  },
  prompt: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: Ink,
    marginBottom: 14,
  },
  choice: {
    borderWidth: 2,
    borderColor: Ink,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 10,
    backgroundColor: Paper,
  },
  choiceChosen: {
    borderColor: Ink,
    backgroundColor: SelectFill,
  },
  choiceText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: Ink,
    lineHeight: 22,
  },
  youChose: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: InkSoft,
    marginBottom: 14,
  },
  revealLabel: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 20,
    color: Ink,
    marginBottom: 12,
  },
  viewBox: {
    borderWidth: 2,
    borderColor: InkFaint,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
  },
  thinker: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontStyle: 'italic',
    fontSize: 19,
    color: Ink,
    marginBottom: 4,
  },
  stance: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: Ink,
    marginBottom: 6,
    lineHeight: 20,
  },
  why: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: InkSoft,
    lineHeight: 23,
  },
});
