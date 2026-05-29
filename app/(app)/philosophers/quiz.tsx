import { useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import SketchIcon from '@/components/shared/SketchIcon';
import { BELIEF_QUESTIONS } from '@/data/beliefQuiz';
import { ALL_PHILOSOPHERS, getPhilosopherById } from '@/data/philosophers';
import { useUserDataStore } from '@/stores/userDataStore';
import { useUIStore } from '@/stores/uiStore';

const Paper = '#FAFAF7';
const Ink = '#1A1A1A';
const InkSoft = '#6B6B6B';
const InkFaint = '#E8E8E3';

export default function BeliefQuizScreen() {
  const setBeliefResult = useUserDataStore((s) => s.setBeliefResult);
  const openPhilosopher = useUIStore((s) => s.openPhilosopher);

  const [index, setIndex] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [resultId, setResultId] = useState<string | null>(null);

  const question = BELIEF_QUESTIONS[index];
  const progress = `${index + 1} / ${BELIEF_QUESTIONS.length}`;

  function pick(philosopherIds: string[]) {
    const next = { ...scores };
    philosopherIds.forEach((id) => {
      next[id] = (next[id] ?? 0) + 1;
    });
    if (index < BELIEF_QUESTIONS.length - 1) {
      setScores(next);
      setIndex((i) => i + 1);
    } else {
      // Final question — compute the closest thinker (stable: first by canon order).
      let best: string | null = null;
      let bestScore = -1;
      for (const p of ALL_PHILOSOPHERS) {
        const s = next[p.id] ?? 0;
        if (s > bestScore) {
          bestScore = s;
          best = p.id;
        }
      }
      setScores(next);
      setResultId(best);
      setBeliefResult(best);
    }
  }

  function restart() {
    setScores({});
    setIndex(0);
    setResultId(null);
  }

  const result = useMemo(() => (resultId ? getPhilosopherById(resultId) : null), [resultId]);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <SketchIcon name="back" size={24} color={Ink} />
        </Pressable>
        <Text style={styles.headerTitle}>What Would You Believe?</Text>
        <View style={{ width: 24 }} />
      </View>

      {!result ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.progress}>{progress}</Text>

          <MotiView
            key={question.id}
            from={{ opacity: 0, translateX: 30 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ type: 'timing', duration: 240 }}
          >
            <Text style={styles.question}>{question.prompt}</Text>

            {question.options.map((opt, i) => (
              <Pressable
                key={i}
                onPress={() => pick(opt.philosopherIds)}
                style={({ pressed }) => [styles.option, pressed && { backgroundColor: '#F0EFEA' }]}
              >
                <Text style={styles.optionText}>{opt.label}</Text>
              </Pressable>
            ))}
          </MotiView>
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={styles.resultContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.resultLabel}>You think most like…</Text>
          <View style={styles.avatar}>
            <Text style={styles.symbol}>{result?.symbol}</Text>
          </View>
          <Text style={styles.resultName}>{result?.name}</Text>
          <Text style={styles.resultOneLiner}>"{result?.oneLiner}"</Text>
          <Text style={styles.resultBio}>{result?.bio}</Text>

          <Pressable
            onPress={() => result && openPhilosopher(result.id)}
            style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.8 }]}
          >
            <Text style={styles.primaryBtnText}>Meet {result?.name} →</Text>
          </Pressable>
          <Pressable onPress={restart} style={styles.retake} hitSlop={8}>
            <Text style={styles.retakeText}>Retake the quiz</Text>
          </Pressable>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Paper },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 10,
  },
  headerTitle: { fontFamily: 'Inter_700Bold', fontSize: 15, color: Ink },
  scrollContent: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 },
  progress: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: InkSoft,
    letterSpacing: 1,
    marginBottom: 14,
  },
  question: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 28,
    color: Ink,
    lineHeight: 36,
    marginBottom: 26,
  },
  option: {
    borderWidth: 2,
    borderColor: Ink,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 12,
    backgroundColor: Paper,
  },
  optionText: { fontFamily: 'Inter_500Medium', fontSize: 16, color: Ink, lineHeight: 23 },
  resultContent: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40, alignItems: 'center' },
  resultLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: InkSoft,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: Ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  symbol: { fontSize: 46 },
  resultName: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 32,
    color: Ink,
    textAlign: 'center',
  },
  resultOneLiner: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontStyle: 'italic',
    fontSize: 17,
    color: Ink,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 26,
  },
  resultBio: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: InkSoft,
    lineHeight: 24,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 28,
  },
  primaryBtn: {
    backgroundColor: Ink,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 28,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  primaryBtnText: { fontFamily: 'Inter_700Bold', fontSize: 16, color: Paper },
  retake: { marginTop: 16, padding: 8 },
  retakeText: { fontFamily: 'Inter_500Medium', fontSize: 14, color: InkSoft },
});
