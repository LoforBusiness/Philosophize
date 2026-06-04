import { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import type { DilemmaCard as DilemmaCardType, DilemmaView, AnswerResult } from '@/data/types';
import KineticNarration from '../KineticNarration';
import LessonScene, { type SceneKey } from '../scenes/LessonScene';
import { useNarrateOnMount } from '../useNarrateOnMount';
import { T } from '../theme';

interface Props {
  card: DilemmaCardType;
  onComplete: (result?: AnswerResult) => void;
  scene?: SceneKey;
}

export default function DilemmaCard({ card, onComplete, scene }: Props) {
  const [scenarioDone, setScenarioDone] = useState(false);
  const [chosenId, setChosenId] = useState<string | null>(null);
  const chosen = card.choices.find((c) => c.id === chosenId) ?? null;

  return (
    <View style={{ flex: 1, backgroundColor: 'transparent' }}>
      {!scenarioDone ? (
        <View style={{ flex: 1 }}>
          <LessonScene scene={scene} />
          <View style={{ flex: 1 }}>
            <KineticNarration text={card.scenario} size={26} onDone={() => setScenarioDone(true)} />
          </View>
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <LessonScene scene={scene} compact />
          <Text style={styles.kicker}>YOUR TURN</Text>
          <Text style={styles.scenario}>{card.scenario}</Text>
          <Text style={styles.prompt}>{card.prompt}</Text>

          {card.choices.map((c) => {
            const isChosen = chosenId === c.id;
            return (
              <Pressable
                key={c.id}
                onPress={() => !chosenId && setChosenId(c.id)}
                style={({ pressed }) => [
                  styles.choice,
                  isChosen && styles.choiceChosen,
                  pressed && !chosenId && { backgroundColor: '#2C2A26' },
                  !!chosenId && !isChosen && { opacity: 0.4 },
                ]}
              >
                <Text style={styles.choiceText}>{c.label}</Text>
              </Pressable>
            );
          })}

          {chosen && <Reveal views={card.views} chosenLabel={chosen.label} />}
        </ScrollView>
      )}

      {chosen && (
        <View style={{ paddingHorizontal: 22, paddingBottom: 10 }}>
          <Pressable
            onPress={() => onComplete({ cardIndex: 0, correct: true, xpEarned: card.xpValue })}
            style={({ pressed }) => [styles.btn, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.btnText}>CONTINUE →</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function Reveal({ views, chosenLabel }: { views: DilemmaView[]; chosenLabel: string }) {
  const speech = `You chose: ${chosenLabel}. ` + views.map((v) => `${v.thinker} would ${v.stance}. ${v.why}`).join(' ');
  useNarrateOnMount(speech);

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
    </MotiView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 22, paddingTop: 8, paddingBottom: 20 },
  kicker: { fontFamily: 'Inter_500Medium', fontSize: 10, color: T.gold, letterSpacing: 3 },
  scenario: { fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 17, color: T.cream, lineHeight: 26, marginTop: 10, marginBottom: 16 },
  prompt: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 18, color: T.cream, marginBottom: 16 },
  choice: { borderWidth: 1.5, borderColor: T.border, borderRadius: 8, paddingVertical: 15, paddingHorizontal: 16, marginBottom: 10, backgroundColor: T.panel },
  choiceChosen: { borderColor: T.cream },
  choiceText: { fontFamily: 'PlayfairDisplay_400Regular', fontSize: 16, color: T.cream, lineHeight: 22 },
  voicesKicker: { fontFamily: 'Inter_500Medium', fontSize: 10, color: T.gold, letterSpacing: 3 },
  voicesTitle: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 20, color: T.cream, marginTop: 6, marginBottom: 14 },
  viewBox: { borderWidth: 1.5, borderColor: T.border, borderRadius: 10, padding: 16, marginBottom: 10, backgroundColor: T.panelSoft },
  thinker: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 18, color: T.gold, marginBottom: 6 },
  stance: { fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 15, color: T.cream, marginBottom: 6, lineHeight: 22 },
  why: { fontFamily: 'PlayfairDisplay_400Regular', fontSize: 14, color: T.creamSoft, lineHeight: 22 },
  btn: { backgroundColor: T.cream, borderRadius: 8, paddingVertical: 15, alignItems: 'center' },
  btnText: { fontFamily: 'Inter_700Bold', fontSize: 13, color: T.ink, letterSpacing: 1 },
});
