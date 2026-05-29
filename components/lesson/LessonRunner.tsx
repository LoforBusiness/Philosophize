import { useRef, useCallback, useEffect } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { MotiView, AnimatePresence } from 'moti';
import * as Speech from 'expo-speech';
import type { Lesson, CardData, AnswerResult } from '@/data/types';
import { useLessonStore } from '@/stores/lessonStore';
import { NarrationProvider } from './NarrationContext';
import CardShell from './CardShell';
import HookCard from './cards/HookCard';
import ConceptCard from './cards/ConceptCard';
import ExampleCard from './cards/ExampleCard';
import QuestionCard from './cards/QuestionCard';
import ReinforcementCard from './cards/ReinforcementCard';
import SummaryCard from './cards/SummaryCard';

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
  }
}

export default function LessonRunner({ lesson }: Props) {
  const { session, startSession, advance, recordAnswer, endSession } = useLessonStore();
  const completingRef = useRef(false);

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
        if (!session) return;
        if (session.currentIndex >= lesson.cards.length - 1) {
          // Lesson done — handled by SummaryCard's own button
          return;
        }
        advance();
      }, 150);
    },
    [session, lesson.cards.length, advance, recordAnswer]
  );

  const handleExit = useCallback(() => {
    Speech.stop();
    endSession();
    router.back();
  }, [endSession]);

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
