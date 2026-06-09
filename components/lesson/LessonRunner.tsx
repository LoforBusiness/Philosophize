import { useRef, useCallback, useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from 'react-native-reanimated';
import type { Lesson, CardData, AnswerResult } from '@/data/types';
import { useLessonStore } from '@/stores/lessonStore';
import { getLessonById } from '@/data';
import LessonReward from './LessonReward';
import CardShell from './CardShell';
import HookCard from './cards/HookCard';
import ConceptCard from './cards/ConceptCard';
import ExampleCard from './cards/ExampleCard';
import QuestionCard from './cards/QuestionCard';
import ReinforcementCard from './cards/ReinforcementCard';
import SummaryCard from './cards/SummaryCard';
import DilemmaCard from './cards/DilemmaCard';
import { T } from './theme';

interface Props {
  lesson: Lesson;
}

interface FinalStats {
  xp: number;
  correct: number;
  total: number;
  branchSlug: string | null;
}

// 5 XP just for completing the lesson, plus 5 per correct answer.
const COMPLETION_XP = 5;

// A card "blocks" the forward swipe until the user has acted on it.
function blocks(card: CardData) {
  return card.type === 'question' || card.type === 'dilemma';
}

export default function LessonRunner({ lesson }: Props) {
  const { startSession, recordAnswer, endSession } = useLessonStore();
  const { width } = useWindowDimensions();
  const N = lesson.cards.length;

  const [index, setIndex] = useState(0);
  const [answered, setAnswered] = useState<Set<number>>(new Set());
  const [finished, setFinished] = useState(false);
  const [stats, setStats] = useState<FinalStats | null>(null);

  const recordedRef = useRef<Set<number>>(new Set());
  const finishingRef = useRef(false);

  // Shared values mirror state so the gesture worklet can read them.
  const tx = useSharedValue(0);
  const indexSv = useSharedValue(0);
  const lockedSv = useSharedValue(false);

  const isLocked = useCallback(
    (i: number) => blocks(lesson.cards[i]) && !answered.has(i),
    [lesson.cards, answered]
  );

  useEffect(() => {
    startSession(lesson);
    return () => endSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.id]);

  useEffect(() => {
    indexSv.value = index;
    lockedSv.value = isLocked(index);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, answered, isLocked]);

  useEffect(() => {
    tx.value = -index * width;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width]);

  const finish = useCallback(() => {
    if (finishingRef.current) return;
    finishingRef.current = true;
    const s = useLessonStore.getState().session;
    const found = getLessonById(lesson.id);
    const correct = s?.answers.filter((a) => a.correct).length ?? 0;
    setStats({
      xp: COMPLETION_XP + (s?.sessionXP ?? 0), // 5 for completing + 5 per correct
      correct,
      total: s?.answers.length ?? 0,
      branchSlug: found?.branch.slug ?? null,
    });
    setFinished(true);
    endSession();
  }, [lesson.id, endSession]);

  const onAnswer = useCallback(
    (cardIndex: number, result: AnswerResult) => {
      if (!recordedRef.current.has(cardIndex)) {
        recordedRef.current.add(cardIndex);
        recordAnswer({ ...result, cardIndex });
      }
      setAnswered((prev) => {
        if (prev.has(cardIndex)) return prev;
        const n = new Set(prev);
        n.add(cardIndex);
        return n;
      });
    },
    [recordAnswer]
  );

  // One card per swipe, no matter how far or hard the user drags: the gesture
  // always commits to exactly the adjacent card (or snaps back), and the drag is
  // clamped to a single card-width so the next card never runs ahead.
  const pan = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-6, 6])
        .onUpdate((e) => {
          'worklet';
          let dx = e.translationX;
          // The card follows the finger 1:1, but only ever reveals the single
          // adjacent card; past a card-width it softly rubber-bands.
          if (dx > width) dx = width + (dx - width) * 0.12;
          else if (dx < -width) dx = -width + (dx + width) * 0.12;
          const forward = dx < 0;
          const canFwd = indexSv.value < N - 1 && !lockedSv.value;
          // Rubber-band when there's nowhere to go that direction.
          if ((forward && !canFwd) || (!forward && indexSv.value <= 0)) dx *= 0.25;
          tx.value = -indexSv.value * width + dx;
        })
        .onEnd((e) => {
          'worklet';
          const dx = e.translationX;
          const vx = e.velocityX;
          const TH = 24; // small, easy-to-reach distance threshold (px)
          const VH = 180; // or a gentle flick
          const i = indexSv.value;
          // A smooth, well-damped spring glides to the next/previous card.
          const glide = (to: number) =>
            (tx.value = withSpring(-to * width, {
              damping: 18,
              stiffness: 170,
              mass: 0.55,
              overshootClamping: true,
            }));

          let dir = 0;
          if (dx < -TH || vx < -VH) dir = 1;
          else if (dx > TH || vx > VH) dir = -1;

          if (dir === 1) {
            if (i < N - 1 && !lockedSv.value) {
              glide(i + 1);
              runOnJS(setIndex)(i + 1);
              return;
            }
            if (i >= N - 1 && !lockedSv.value) {
              glide(i);
              runOnJS(finish)();
              return;
            }
          } else if (dir === -1 && i > 0) {
            glide(i - 1);
            runOnJS(setIndex)(i - 1);
            return;
          }
          glide(i); // snap back
        }),
    [width, N, finish, tx, indexSv, lockedSv]
  );

  const rowStyle = useAnimatedStyle(() => ({ transform: [{ translateX: tx.value }] }));

  const renderCard = (card: CardData, i: number) => {
    switch (card.type) {
      case 'hook':
        return <HookCard card={card} />;
      case 'concept':
        return <ConceptCard card={card} />;
      case 'example':
        return <ExampleCard card={card} />;
      case 'reinforcement':
        return <ReinforcementCard card={card} />;
      case 'summary':
        return <SummaryCard card={card} />;
      case 'question':
        return <QuestionCard card={card} onComplete={(r) => r && onAnswer(i, r)} />;
      case 'dilemma':
        return <DilemmaCard card={card} onComplete={(r) => r && onAnswer(i, r)} />;
    }
  };

  const handleExit = useCallback(() => {
    endSession();
    router.back();
  }, [endSession]);

  if (finished && stats) {
    return <LessonReward {...stats} onDone={() => router.back()} />;
  }

  const found = getLessonById(lesson.id);
  const lessonNum = found ? found.path.lessons.findIndex((l) => l.id === lesson.id) + 1 : 1;
  const label = `${(found?.branch.name ?? 'PHILOSOPHIZE').toUpperCase()} · LESSON ${lessonNum > 0 ? lessonNum : 1}`;

  const lock = isLocked(index);
  const isLast = index === N - 1;

  return (
    <CardShell cardCount={N} currentIndex={index} label={label} onExit={handleExit}>
      <View style={styles.viewport}>
        <GestureDetector gesture={pan}>
          <Animated.View style={[styles.row, rowStyle, { width: width * N }]}>
            {lesson.cards.map((card, i) => (
              <View key={i} style={{ width }}>
                {renderCard(card, i)}
              </View>
            ))}
          </Animated.View>
        </GestureDetector>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerHint}>
          {lock ? 'ANSWER TO CONTINUE' : isLast ? 'SWIPE TO FINISH  →' : index === 0 ? 'SWIPE  →' : '←  SWIPE  →'}
        </Text>
      </View>
    </CardShell>
  );
}

const styles = StyleSheet.create({
  viewport: { flex: 1, overflow: 'hidden' },
  row: { flexDirection: 'row', height: '100%' },
  footer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
    paddingBottom: 20,
    minHeight: 48,
  },
  footerHint: { fontFamily: 'Inter_700Bold', fontSize: 10, color: T.dim, letterSpacing: 3 },
});
