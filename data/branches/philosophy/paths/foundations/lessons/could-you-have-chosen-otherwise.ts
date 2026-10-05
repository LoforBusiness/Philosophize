import type { Lesson } from '@/data/types';

// The sixth lesson on this subject's road, a DIALOGUE lesson (LESSON_RULES group AP):
// it plays as components/lesson/cinematic/phil6Scene.tsx. These cards are the
// fallback the runner uses only if the CINEMATIC entry is ever removed.
const lesson: Lesson = {
  id: 'philosophy-foundations-6',
  slug: 'could-you-have-chosen-otherwise',
  title: 'Could You Have Chosen Otherwise?',
  description: 'A brass fortune machine at a night fair prints your choice before you make it.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'The machine printed his choice before he made it. Was he free?',
      subtext: 'Every choice has causes. Can it still be free?',
      emoji: '🎡',
    },
    {
      type: 'concept',
      title: 'Free Will',
      body: 'Every choice is caused by what came before it, so could you ever have chosen otherwise? On one answer, you are free when you act on your own wants and nobody forces you.',
      visual: '💡',
      highlight: 'free',
    },
    {
      type: 'question',
      prompt: 'If every choice has a cause, what decided his pick?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'He did, through his own wants', isCorrect: true },
          { id: 'b', text: 'The printed card', isCorrect: false },
          { id: 'c', text: 'The dice', isCorrect: false },
        ],
        explanation: 'He did: his own wants, his hunger and his habits. The card only predicted the choice.',
      },
    },
    {
      type: 'quote',
      id: 'lq-philosophy-foundations-6-1',
      quote: 'Man can do what he wills, but he cannot will what he wills.',
      author: 'Arthur Schopenhauer',
      era: '1839',
      work: 'On the Freedom of the Will',
    },
    {
      type: 'summary',
      title: 'Could You Have Chosen Otherwise?',
      keyPoints: [
        'Every choice has causes that came before it',
        'So could you ever have chosen otherwise?',
        'One answer: you’re free when nobody forces your wants',
      ],
      closingThought: 'Next time you make a choice, ask what made you want it.',
    },
  ],
};

export default lesson;
