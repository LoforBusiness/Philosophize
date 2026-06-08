import { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import type { DilemmaCard as DilemmaCardType, DilemmaView, AnswerResult } from '@/data/types';
import { T } from '../theme';

interface Props {
  card: DilemmaCardType;
  onComplete: (result?: AnswerResult) => void;
}

export default function DilemmaCard({ card, onComplete }: Props) {
  const [chosenId, setChosenId] = useState<string | null>(null);
  const chosen = card.choices.find((c) => c.id === chosenId) ?? null;

  function choose(id: string) {
    if (chosenId) return;
    setChosenId(id);
    // A dilemma has no wrong answer — engaging earns its XP.
    onComplete({ cardIndex: 0, correct: true, xpEarned: card.xpValue });
  }

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.kicker}>YOUR TURN</Text>
      <Text style={styles.scenario}>{card.scenario}</Text>
      <Text style={styles.prompt}>{card.prompt}</Text>

      {card.choices.map((c) => {
        const isChosen = chosenId === c.id;
        return (
          <Pressable
            key={c.id}
            onPress={() => choose(c.id)}
            style={({ pressed }) => [
              styles.choice,
              isChosen && styles.choiceChosen,
              pressed && !chosenId && { backgroundColor: T.press },
              !!chosenId && !isChosen && { opacity: 0.4 },
            ]}
          >
            <Text style={styles.choiceText}>{c.label}</Text>
          </Pressable>
        );
      })}

      {chosen && <Reveal views={card.views} chosenLabel={chosen.label} />}
    </ScrollView>
  );
}

function Reveal({ views }: { views: DilemmaView[]; chosenLabel: string }) {
  return (
    <MotiView from={{ opacity: 0, translateY: 14 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 260 }} style={{ marginTop: 20 }}>
      <Text style={styles.voicesKicker}>VOICES ACROSS TIME</Text>
      <Text style={styles.voicesTitle}>What the great thinkers would say</Text>
      {views.map((v, i) => (
        <View key={i} style={styles.viewBox}>
          <Text style={styles.thinker}>{v.thinker}</Text>
          <Text style={styles.stance}>{v.stance}</Text>
          <Text style={styles.why}>{v.why}</Text>
        </View>
      ))}
      <Text style={styles.swipeHint}>SWIPE TO CONTINUE →</Text>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 22, paddingTop: 8, paddingBottom: 28 },
  kicker: { fontFamily: 'Inter_500Medium', fontSize: 10, color: T.gold, letterSpacing: 3 },
  scenario: { fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 18, color: T.ink, lineHeight: 28, marginTop: 10, marginBottom: 16 },
  prompt: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 19, color: T.ink, marginBottom: 16 },
  choice: { borderWidth: 1.5, borderColor: T.border, borderRadius: 8, paddingVertical: 15, paddingHorizontal: 16, marginBottom: 10, backgroundColor: T.panel },
  choiceChosen: { borderColor: T.ink },
  choiceText: { fontFamily: 'PlayfairDisplay_400Regular', fontSize: 16, color: T.ink, lineHeight: 22 },
  voicesKicker: { fontFamily: 'Inter_500Medium', fontSize: 10, color: T.gold, letterSpacing: 3 },
  voicesTitle: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 20, color: T.ink, marginTop: 6, marginBottom: 14 },
  viewBox: { borderWidth: 1.5, borderColor: T.border, borderRadius: 10, padding: 16, marginBottom: 10, backgroundColor: T.panelSoft },
  thinker: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 18, color: T.ink, marginBottom: 6 },
  stance: { fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 15, color: T.ink, marginBottom: 6, lineHeight: 22 },
  why: { fontFamily: 'PlayfairDisplay_400Regular', fontSize: 14, color: T.creamSoft, lineHeight: 22 },
  swipeHint: { fontFamily: 'Inter_700Bold', fontSize: 10, color: T.inkSoft, letterSpacing: 2, marginTop: 8 },
});
