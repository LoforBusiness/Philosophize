import { useEffect, useRef, useState } from 'react';
import { Modal, View, Text, Pressable, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SketchIcon from './SketchIcon';
import AnswerOption, { type AnswerState } from './AnswerOption';
import Button from '@/components/ui/Button';
import { getQuiz, type QuizQuestion } from '@/data/philosopherQuizzes';
import { useUserDataStore } from '@/stores/userDataStore';

const Paper = '#FAFAF7';
const Ink = '#1A1A1A';
const InkSoft = '#6B6B6B';
const InkFaint = '#E2E0D8';
const Green = '#4F7A4A';
const GreenBg = '#EAF1E6';
const Red = '#A8513F';
const RedBg = '#F5E7E2';

interface Props {
  open: boolean;
  philosopherId: string;
  philosopherName: string;
  pronoun?: 'he' | 'she' | 'they';
  onClose: () => void;
}

// A short (~5-question), 30–45-second quiz about a single philosopher, slid up
// over their profile. Mixes "did they say this?", multiple-choice facts, and
// fill-in-the-quote. Light paper/ink styling to match the profile sheet.
export default function PhilosopherQuiz({ open, philosopherId, philosopherName, pronoun = 'he', onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const H = Math.round(height * 0.92);

  const recordQuizResult = useUserDataStore((s) => s.recordQuizResult);

  const [visible, setVisible] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null); // option index (attribution: 0=Yes,1=No)
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [awarded, setAwarded] = useState<{ xp: number; perfect: boolean } | null>(null);
  const startRef = useRef<number>(0);
  const [elapsed, setElapsed] = useState(0);

  // (Re)start the quiz whenever it opens.
  useEffect(() => {
    if (open) {
      setVisible(true);
      setQuestions(getQuiz(philosopherId) ?? []);
      setIdx(0);
      setPicked(null);
      setCorrectCount(0);
      setFinished(false);
      setAwarded(null);
      startRef.current = Date.now();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, philosopherId]);

  if (!visible) return null;

  const q = questions[idx];
  const total = questions.length;
  const isAttribution = q?.kind === 'attribution';
  const correctIndex = q
    ? q.kind === 'attribution'
      ? q.isReal
        ? 0
        : 1
      : q.correctIndex
    : 0;

  const choose = (optionIndex: number) => {
    if (picked !== null) return; // already answered
    setPicked(optionIndex);
    if (optionIndex === correctIndex) setCorrectCount((c) => c + 1);
  };

  const next = () => {
    if (idx + 1 >= total) {
      const secs = Math.max(1, Math.round((Date.now() - startRef.current) / 1000));
      setElapsed(secs);
      const xp = recordQuizResult(philosopherId, correctCount, total);
      setAwarded({ xp, perfect: correctCount >= total && total > 0 });
      setFinished(true);
    } else {
      setIdx((i) => i + 1);
      setPicked(null);
    }
  };

  const restart = () => {
    setIdx(0);
    setPicked(null);
    setCorrectCount(0);
    setFinished(false);
    setAwarded(null);
    startRef.current = Date.now();
  };

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <MotiView
        animate={{ opacity: open ? 1 : 0 }}
        transition={{ type: 'timing', duration: 220 }}
        style={styles.backdrop}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </MotiView>

      <AnimatePresence onExitComplete={() => setVisible(false)}>
        {open && (
          <MotiView
            key="quiz"
            from={{ translateY: H }}
            animate={{ translateY: 0 }}
            exit={{ translateY: H }}
            transition={{ type: 'timing', duration: 340 }}
            style={[styles.sheet, { height: H, paddingBottom: insets.bottom + 8 }]}
          >
            {/* Header */}
            <View style={styles.header}>
              <Pressable onPress={onClose} hitSlop={12} style={styles.closeBtn}>
                <SketchIcon name="close" color={Ink} size={20} />
              </Pressable>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {philosopherName} · Quiz
              </Text>
              <View style={{ width: 34 }} />
            </View>

            {/* Progress segments */}
            {!finished && total > 0 && (
              <View style={styles.segs}>
                {questions.map((_, i) => (
                  <View
                    key={i}
                    style={[styles.seg, { backgroundColor: i < idx || (i === idx && picked !== null) ? Ink : InkFaint }]}
                  />
                ))}
              </View>
            )}

            {finished ? (
              <Results
                correct={correctCount}
                total={total}
                xp={awarded?.xp ?? 0}
                perfect={awarded?.perfect ?? false}
                seconds={elapsed}
                onRetry={restart}
                onDone={onClose}
              />
            ) : q ? (
              <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
                <MotiView
                  key={idx}
                  from={{ opacity: 0, translateY: 10 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ type: 'timing', duration: 260 }}
                >
                  <Text style={styles.counter}>
                    QUESTION {idx + 1} OF {total} · {q.difficulty.toUpperCase()}
                  </Text>
                  <Text style={styles.prompt}>{q.prompt}</Text>

                  {/* Quote card for attribution / fill */}
                  {(q.kind === 'attribution' || q.kind === 'fill') && (
                    <View style={styles.quoteCard}>
                      <Text style={styles.quoteMark}>“</Text>
                      <Text style={styles.quoteText}>{q.quote}</Text>
                    </View>
                  )}

                  {/* Options */}
                  {isAttribution ? (
                    <View style={styles.yesNoRow}>
                      <AnswerOption
                        compact
                        style={{ flex: 1 }}
                        label={`Yes, ${pronoun} did`}
                        state={optionState(0, picked, correctIndex)}
                        onPress={() => choose(0)}
                      />
                      <AnswerOption
                        compact
                        style={{ flex: 1 }}
                        label={`No, ${pronoun} didn't`}
                        state={optionState(1, picked, correctIndex)}
                        onPress={() => choose(1)}
                      />
                    </View>
                  ) : (
                    <View style={{ marginTop: 6 }}>
                      {q.options.map((opt, i) => (
                        <AnswerOption
                          key={i}
                          badge={String.fromCharCode(65 + i)}
                          label={opt}
                          state={optionState(i, picked, correctIndex)}
                          onPress={() => choose(i)}
                        />
                      ))}
                    </View>
                  )}

                  {/* Explanation + Next */}
                  {picked !== null && (
                    <MotiView
                      from={{ opacity: 0, translateY: 8 }}
                      animate={{ opacity: 1, translateY: 0 }}
                      transition={{ type: 'timing', duration: 240 }}
                    >
                      <View style={[styles.explainBox, picked === correctIndex ? styles.explainOk : styles.explainNo]}>
                        <Text style={styles.explainTag}>
                          {picked === correctIndex ? 'CORRECT' : 'NOT QUITE'}
                        </Text>
                        <Text style={styles.explainText}>{q.explain}</Text>
                      </View>
                      <View style={{ marginTop: 12 }}>
                        <Button
                          label={idx + 1 >= total ? 'See results →' : 'Next →'}
                          onPress={next}
                          size="lg"
                        />
                      </View>
                    </MotiView>
                  )}
                </MotiView>
              </ScrollView>
            ) : (
              <View style={styles.body}>
                <Text style={styles.prompt}>No quiz available.</Text>
              </View>
            )}
          </MotiView>
        )}
      </AnimatePresence>
    </Modal>
  );
}

function optionState(i: number, picked: number | null, correctIndex: number): AnswerState {
  if (picked === null) return 'idle';
  if (i === correctIndex) return 'right';
  if (i === picked) return 'wrong';
  return 'dim';
}

function Results({
  correct,
  total,
  xp,
  perfect,
  seconds,
  onRetry,
  onDone,
}: {
  correct: number;
  total: number;
  xp: number;
  perfect: boolean;
  seconds: number;
  onRetry: () => void;
  onDone: () => void;
}) {
  const pct = total > 0 ? correct / total : 0;
  const headline = perfect ? 'Masterful.' : pct >= 0.8 ? 'Sharp.' : pct >= 0.5 ? 'Not bad.' : 'Worth another look.';

  return (
    <ScrollView contentContainerStyle={styles.resultsBody} showsVerticalScrollIndicator={false}>
      <MotiView from={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', damping: 13, stiffness: 130 }} style={styles.seal}>
        <SketchIcon name={perfect ? 'star-filled' : 'star'} color={Ink} size={38} />
      </MotiView>
      <Text style={styles.resultsHead}>{headline}</Text>
      <Text style={styles.resultsScore}>
        {correct}<Text style={styles.resultsScoreDim}> / {total}</Text>
      </Text>
      <Text style={styles.resultsCorrect}>correct</Text>

      <View style={styles.resultsMetaRow}>
        <View style={styles.metaPill}>
          <SketchIcon name="star" color={Ink} size={14} />
          <Text style={styles.metaPillText}>+{xp} XP</Text>
        </View>
        <View style={styles.metaPill}>
          <SketchIcon name="clock" color={Ink} size={14} />
          <Text style={styles.metaPillText}>{seconds}s</Text>
        </View>
      </View>

      {perfect && <Text style={styles.masteredNote}>You’ve mastered this thinker’s quiz.</Text>}

      <Pressable onPress={onRetry} style={({ pressed }) => [styles.retryBtn, pressed && { opacity: 0.85 }]}>
        <Text style={styles.retryText}>Try again</Text>
      </Pressable>
      <Pressable onPress={onDone} style={({ pressed }) => [styles.nextBtn, pressed && { opacity: 0.85 }]}>
        <Text style={styles.nextText}>Done</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Paper,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 2,
    borderColor: Ink,
    overflow: 'hidden',
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8 },
  closeBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontFamily: 'PlayfairDisplay_700Bold', fontSize: 18, color: Ink },

  segs: { flexDirection: 'row', gap: 4, paddingHorizontal: 20, marginTop: 2, marginBottom: 6 },
  seg: { flex: 1, height: 4, borderRadius: 2 },

  body: { paddingHorizontal: 22, paddingTop: 12, paddingBottom: 36 },
  counter: { fontFamily: 'Inter_700Bold', fontSize: 10, color: InkSoft, letterSpacing: 2 },
  prompt: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 22, color: Ink, lineHeight: 30, marginTop: 8 },

  quoteCard: {
    borderWidth: 2,
    borderColor: Ink,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 16,
    marginTop: 16,
    marginBottom: 4,
  },
  quoteMark: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 44, lineHeight: 44, color: InkFaint, marginBottom: -10 },
  quoteText: { fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 19, color: Ink, lineHeight: 28 },

  yesNoRow: { flexDirection: 'row', gap: 12, marginTop: 18 },
  attrib: {
    flex: 1,
    borderWidth: 2,
    borderColor: Ink,
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Paper,
  },
  attribText: { fontFamily: 'Inter_700Bold', fontSize: 15, color: Ink, textAlign: 'center' },

  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderColor: Ink,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
    backgroundColor: Paper,
  },
  optionCorrect: { borderColor: Green, backgroundColor: GreenBg },
  optionWrong: { borderColor: Red, backgroundColor: RedBg },
  optionDim: { opacity: 0.5 },
  optionLetter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterCorrect: { backgroundColor: Green, borderColor: Green },
  letterWrong: { backgroundColor: Red, borderColor: Red },
  optionLetterText: { fontFamily: 'Inter_700Bold', fontSize: 13, color: Ink },
  optionText: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 15, color: Ink, lineHeight: 21 },

  explainBox: { borderRadius: 12, padding: 14, marginTop: 14, borderWidth: 1.5 },
  explainOk: { borderColor: Green, backgroundColor: GreenBg },
  explainNo: { borderColor: Red, backgroundColor: RedBg },
  explainTag: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 2, color: Ink, marginBottom: 6 },
  explainText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: Ink, lineHeight: 21 },

  nextBtn: { backgroundColor: Ink, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 16, alignSelf: 'stretch' },
  nextText: { fontFamily: 'Inter_700Bold', fontSize: 16, color: Paper },

  // Results
  resultsBody: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, paddingVertical: 24 },
  seal: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: Ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  resultsHead: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 28, color: Ink, textAlign: 'center' },
  resultsScore: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 64, color: Ink, lineHeight: 70, marginTop: 8 },
  resultsScoreDim: { color: InkSoft },
  resultsCorrect: { fontFamily: 'Inter_500Medium', fontSize: 12, color: InkSoft, letterSpacing: 2, textTransform: 'uppercase', marginTop: -4 },
  resultsMetaRow: { flexDirection: 'row', gap: 12, marginTop: 22 },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderWidth: 1.5,
    borderColor: Ink,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  metaPillText: { fontFamily: 'Inter_700Bold', fontSize: 14, color: Ink },
  masteredNote: { fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 15, color: InkSoft, textAlign: 'center', marginTop: 18 },
  retryBtn: { borderWidth: 2, borderColor: Ink, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 26, alignSelf: 'stretch' },
  retryText: { fontFamily: 'Inter_700Bold', fontSize: 16, color: Ink },
});
