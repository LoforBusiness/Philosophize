import { useRef, useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { MotiView, AnimatePresence } from 'moti';
import * as Speech from 'expo-speech';
import type { Lesson, CardData, AnswerResult } from '@/data/types';
import { useLessonStore } from '@/stores/lessonStore';
import { getLessonById } from '@/data';
import { NarrationProvider } from './NarrationContext';
import LessonReward from './LessonReward';
import CardShell from './CardShell';
import HookCard from './cards/HookCard';
import ConceptCard from './cards/ConceptCard';
import ExampleCard from './cards/ExampleCard';
import QuestionCard from './cards/QuestionCard';
import ReinforcementCard from './cards/ReinforcementCard';
import SummaryCard from './cards/SummaryCard';
import DilemmaCard from './cards/DilemmaCard';

interface Props {
  lesson: Lesson;
}

function renderCard(card: CardData, onComplete: (result?: AnswerResult) => void) {
  switch (card.type) {
    case 'hook': return <HookCard card={card} onComplete={onComplete} />;
    case 'concept': return <ConceptCard card={card} onComplete={onComplete} />;
    case 'example': return <ExampleCard card={card} onComplete={onComplete} />;
    case 'question': return <QuestionCard card={card} onComplete={onComplete} />;
    case 'reinforcement': return <ReinforcementCard card={card} onComplete={onComplete} />;
    case 'summary': return <SummaryCard card={card} onComplete={onComplete} />;
    case 'dilemma': return <DilemmaCard card={card} onComplete={onComplete} />;
  }
}

interface FinalStats {
  xp: number;
  correct: number;
  total: number;
  branchSlug: string | null;
}

export default function LessonRunner({ lesson }: Props) {
  const { session, startSession, advance, recordAnswer, endSession } = useLessonStore();
  const completingRef = useRef(false);
  const [finished, setFinished] = useState(false);
  const [stats, setStats] = useState<FinalStats | null>(null);

  useEffect(() => {
    startSession(lesson);
    return () => {
      Speech.stop();
      endSession();
    };
  }, [lesson.id]);

  const handleCardComplete = useCallback(
    (result?: AnswerResult) => {
      if (completingRef.current) return;
      completingRef.current = true;

      if (result) recordAnswer(result);

      setTimeout(() => {
        completingRef.current = false;
        const s = useLessonStore.getState().session;
        if (!s) return;
        if (s.currentIndex >= lesson.cards.length - 1) {
          // Lesson finished — go to the reward screen.
          Speech.stop();
          const found = getLessonById(lesson.id);
          setStats({
            xp: s.sessionXP,
            correct: s.answers.filter((a) => a.correct).length,
            total: s.answers.length,
            branchSlug: found?.branch.slug ?? null,
          });
          setFinished(true);
          endSession();
          return;
        }
        advance();
      }, 150);
    },
    [lesson, advance, recordAnswer, endSession]
  );

  const handleExit = useCallback(() => {
    Speech.stop();
    endSession();
    router.back();
  }, [endSession]);

  if (finished && stats) {
    return <LessonReward {...stats} onDone={() => router.back()} />;
  }

  if (!session) return null;

  const currentCard = lesson.cards[session.currentIndex];
  const progress = (session.currentIndex + 1) / lesson.cards.length;

  return (
    <NarrationProvider>
      <View className="flex-1 bg-midnight">
        <CardShell
          progress={progress}
          cardCount={lesson.cards.length}
          currentIndex={session.currentIndex}
          onExit={handleExit}
        >
          <AnimatePresence exitBeforeEnter>
            <MotiView
              key={`${lesson.id}-${session.currentIndex}`}
              from={{ opacity: 0, translateX: session.direction > 0 ? 40 : -40 }}
              animate={{ opacity: 1, translateX: 0 }}
              exit={{ opacity: 0, translateX: session.direction > 0 ? -40 : 40 }}
              transition={{ type: 'timing', duration: 220 }}
              style={{ flex: 1 }}
            >
              {renderCard(currentCard, handleCardComplete)}
            </MotiView>
          </AnimatePresence>
        </CardShell>
      </View>
    </NarrationProvider>
  );
}
