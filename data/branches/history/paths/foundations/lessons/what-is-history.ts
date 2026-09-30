import type { Lesson } from '@/data/types';

// The first lesson on this subject's road, a DIALOGUE lesson (LESSON_RULES group AP):
// it plays as components/lesson/cinematic/hist1Scene.tsx. These cards are the
// fallback the runner uses only if the CINEMATIC entry is ever removed.
const lesson: Lesson = {
  id: 'history-foundations-1',
  slug: 'what-is-history',
  title: 'What Is History?',
  description: 'A broken shop window, a ball among the glass, and two people who were not watching.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Nobody saw the window break. So how do we know?',
      subtext: 'The past is gone. What it left behind is evidence.',
      emoji: '🏛️',
    },
    {
      type: 'concept',
      title: 'What the Past Left Behind',
      body: 'History works out what happened from the evidence left behind, and asks who is telling each story and why. Politics begins where history stops: it is how a group decides what happens next, and who gets a say.',
      visual: '📜',
      highlight: 'evidence',
    },
    {
      type: 'question',
      prompt: 'Nobody saw the window break. What is the best evidence of what broke it?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The ball lying among the glass', isCorrect: true },
          { id: 'b', text: 'A guess that it was the wind', isCorrect: false },
          { id: 'c', text: 'The word of the ball’s owner', isCorrect: false },
        ],
        explanation: 'The ball was left behind by the event itself. A guess is only a story until something supports it, and a witness has a point of view.',
      },
    },
    {
      type: 'quote',
      id: 'lq-history-foundations-1-1',
      quote: 'It is a continuous process of interaction between the historian and his facts, an unending dialogue between the present and the past.',
      author: 'E. H. Carr',
      era: '1961',
      work: 'What Is History?',
    },
    {
      type: 'summary',
      title: 'Where History Begins',
      keyPoints: [
        'History works from evidence',
        'Every source has a point of view',
        'Politics is how a group decides',
      ],
      closingThought: 'Next time you hear what happened, ask who is telling it, and how they know.',
    },
  ],
};

export default lesson;
