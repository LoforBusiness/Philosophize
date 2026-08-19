import { useRef, useCallback, useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import type { Lesson, CardData, AnswerResult } from '@/data/types';
import { useLessonStore } from '@/stores/lessonStore';
import { getLessonById } from '@/data';
import { lessonXP } from '@/constants/xp';
import { useUIStore } from '@/stores/uiStore';
import { exitLesson } from './exitLesson';
import CardShell from './CardShell';
import HookCard from './cards/HookCard';
import ConceptCard from './cards/ConceptCard';
import ExampleCard from './cards/ExampleCard';
import QuestionCard from './cards/QuestionCard';
import ReinforcementCard from './cards/ReinforcementCard';
import SummaryCard from './cards/SummaryCard';
import DilemmaCard from './cards/DilemmaCard';
import QuoteCard from './cards/QuoteCard';
import { track } from '@/lib/posthog';
import { T } from './theme';
import { sceneForVariant } from './inkScenes';
import { SceneMetaContext, CardActiveContext } from './sceneContext';

interface Props {
  lesson: Lesson;
}

// 5 XP just for completing the lesson, plus 5 per correct answer.
const COMPLETION_XP = 5;

// A card "blocks" the forward swipe until the user has acted on it.
function blocks(card: CardData) {
  return card.type === 'question' || card.type === 'dilemma';
}

// Reading cards surface their text word-by-word; the forward swipe stays locked
// until the whole passage has finished appearing on screen.
function hasTimedReveal(card: CardData) {
  return (
    card.type === 'hook' ||
    card.type === 'concept' ||
    card.type === 'example' ||
    card.type === 'reinforcement' ||
    card.type === 'summary'
  );
}

export default function LessonRunner({ lesson }: Props) {
  const { startSession, recordAnswer, endSession } = useLessonStore();
  const showReward = useUIStore((s) => s.showReward);
  const { width } = useWindowDimensions();
  const N = lesson.cards.length;

  const [index, setIndex] = useState(0);
  const [answered, setAnswered] = useState<Set<number>>(new Set());
  // Reading cards whose text has fully revealed (so the forward swipe can unlock).
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  // The branch a saved quote belongs to (so quote cards file under the right area).
  const branchSlug = useMemo(() => getLessonById(lesson.id)?.branch.slug ?? null, [lesson.id]);

  // Deterministic scene pick per lesson. Seeded by the branch and offset by the
  // lesson's position in its path, so consecutive lessons always step to a
  // DIFFERENT scene — the same picture never appears two lessons in a row.
  const bgVariant = useMemo(() => {
    const found = getLessonById(lesson.id);
    const key = found?.branch.slug ?? lesson.id;
    let h = 0;
    for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
    const li = found ? found.path.lessons.findIndex((l) => l.id === lesson.id) : 0;
    return (h % 997) + Math.max(0, li);
  }, [lesson.id]);
  const sceneMeta = useMemo(() => sceneForVariant(bgVariant).meta, [bgVariant]);

  const recordedRef = useRef<Set<number>>(new Set());
  const finishingRef = useRef(false);

  // Shared values mirror state so the gesture worklet can read them.
  const tx = useSharedValue(0);
  const indexSv = useSharedValue(0);
  const lockedSv = useSharedValue(false);

  const isLocked = useCallback(
    (i: number) => {
      const card = lesson.cards[i];
      return (
        (blocks(card) && !answered.has(i)) ||
        (hasTimedReveal(card) && !revealed.has(i))
      );
    },
    [lesson.cards, answered, revealed]
  );

  const markRevealed = useCallback((i: number) => {
    setRevealed((prev) => {
      if (prev.has(i)) return prev;
      const n = new Set(prev);
      n.add(i);
      return n;
    });
  }, []);

  useEffect(() => {
    startSession(lesson);
    // `lesson_started` used to be captured here. It moved to the lesson ROUTE,
    // because here it only ever saw the card lessons — see StartedRunner in
    // app/(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId].tsx.
    return () => endSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.id]);

  useEffect(() => {
    indexSv.value = index;
    lockedSv.value = isLocked(index);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, answered, revealed, isLocked]);

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
    // Hand off to the GLOBAL reward overlay, then leave the lesson screen so it
    // doesn't linger on the tab's stack and re-show the reward.
    showReward({
      xp: lessonXP(correct, s?.answers.length ?? 0),
      correct,
      total: s?.answers.length ?? 0,
      branchSlug: found?.branch.slug ?? null,
      lessonId: lesson.id,
    });
    endSession();
    exitLesson();
  }, [lesson.id, endSession, showReward]);

  const onAnswer = useCallback(
    (cardIndex: number, result: AnswerResult) => {
      if (!recordedRef.current.has(cardIndex)) {
        recordedRef.current.add(cardIndex);
        recordAnswer({ ...result, cardIndex });
        track('question_answered', {
          lesson_id: lesson.id,
          card_type: lesson.cards[cardIndex]?.type,
          correct: result.correct,
        });
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

  // Stable per-card callbacks, so turning a page (a setIndex re-render) doesn't
  // hand every card a fresh closure and re-render the whole deck. Combined with
  // the memoized bodies below, only the card whose "active" state flips actually
  // re-renders — which is what keeps the swipe buttery.
  const revealCbs = useMemo(
    () => lesson.cards.map((_, i) => () => markRevealed(i)),
    [lesson.cards, markRevealed]
  );
  const answerCbs = useMemo(
    () =>
      lesson.cards.map((_, i) => (r?: AnswerResult) => {
        if (r) onAnswer(i, r);
      }),
    [lesson.cards, onAnswer]
  );

  // The rendered card bodies, memoized so their element identity is stable across
  // page turns — an index change never rebuilds them, only re-flags which is active.
  const cardEls = useMemo(
    () =>
      lesson.cards.map((card, i) => {
        switch (card.type) {
          case 'hook':
            return <HookCard card={card} onRevealed={revealCbs[i]} />;
          case 'concept':
            return <ConceptCard card={card} onRevealed={revealCbs[i]} />;
          case 'example':
            return <ExampleCard card={card} onRevealed={revealCbs[i]} />;
          case 'reinforcement':
            return <ReinforcementCard card={card} onRevealed={revealCbs[i]} />;
          case 'summary':
            return <SummaryCard card={card} onRevealed={revealCbs[i]} />;
          case 'quote':
            return <QuoteCard card={card} branchSlug={branchSlug} />;
          case 'question':
            return <QuestionCard card={card} onComplete={answerCbs[i]} />;
          case 'dilemma':
            return <DilemmaCard card={card} onComplete={answerCbs[i]} />;
        }
      }),
    [lesson.cards, branchSlug, revealCbs, answerCbs]
  );

  // One card per swipe, no matter how far or hard the user drags: the gesture
  // always commits to exactly the adjacent card (or snaps back), and the drag is
  // clamped to a single card-width so the next card never runs ahead.
  const pan = useMemo(
    () =>
      Gesture.Pan()
        // Grab the horizontal swipe quickly (small activation distance). Inner
        // card ScrollViews are gesture-handler ScrollViews, so vertical scroll
        // and this horizontal pan coordinate cleanly instead of fighting.
        .activeOffsetX([-8, 8])
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
          const TH = 14; // tiny distance threshold — a small nudge advances
          const VH = 90; // …or the gentlest flick
          const i = indexSv.value;
          // The snap inherits the finger's release velocity so the motion feels
          // physically continuous (Apple's "fluid interface" principle), and lands
          // with a crisp, near-critically-damped settle — a clean page turn, no
          // wobble, no drag.
          const glide = (to: number) =>
            (tx.value = withSpring(-to * width, {
              velocity: vx,
              damping: 26,
              stiffness: 320,
              mass: 0.65,
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

  const handleExit = useCallback(() => {
    endSession();
    exitLesson();
  }, [endSession]);

  const found = getLessonById(lesson.id);
  const lessonNum = found ? found.path.lessons.findIndex((l) => l.id === lesson.id) + 1 : 1;
  const label = `${(found?.branch.name ?? 'ASHMERE').toUpperCase()} · LESSON ${lessonNum > 0 ? lessonNum : 1}`;

  const currentCard = lesson.cards[index];
  const needsAnswer = blocks(currentCard) && !answered.has(index);
  const revealing = hasTimedReveal(currentCard) && !revealed.has(index);
  const isLast = index === N - 1;

  return (
    <SceneMetaContext.Provider value={sceneMeta}>
      <CardShell cardCount={N} currentIndex={index} label={label} onExit={handleExit} bgVariant={bgVariant}>
        <View style={styles.viewport}>
          <GestureDetector gesture={pan}>
            <Animated.View style={[styles.row, rowStyle, { width: width * N }]}>
              {cardEls.map((el, i) => (
                <View key={i} style={{ width }}>
                  <CardActiveContext.Provider value={i === index}>
                    {el}
                  </CardActiveContext.Provider>
                </View>
              ))}
            </Animated.View>
          </GestureDetector>
        </View>

        <View style={styles.footer}>
          <Text
            style={[
              styles.footerHint,
              sceneMeta.mode === 'dark' && { color: 'rgba(244,243,238,0.5)' },
            ]}
          >
            {needsAnswer
              ? 'ANSWER TO CONTINUE'
              : revealing
                ? ''
                : isLast
                  ? 'SWIPE TO FINISH  →'
                  : index === 0
                    ? 'SWIPE  →'
                    : '←  SWIPE  →'}
          </Text>
        </View>
      </CardShell>
    </SceneMetaContext.Provider>
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
