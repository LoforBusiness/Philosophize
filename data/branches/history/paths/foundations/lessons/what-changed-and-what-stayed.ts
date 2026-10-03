import type { Lesson } from '@/data/types';

// The fourth lesson on this subject's road, a DIALOGUE lesson (LESSON_RULES group AP):
// it plays as components/lesson/cinematic/hist4Scene.tsx. These cards are the
// fallback the runner uses only if the CINEMATIC entry is ever removed.
const lesson: Lesson = {
  id: 'history-foundations-4',
  slug: 'what-changed-and-what-stayed',
  title: 'What Changed, and What Stayed?',
  description: 'A town square, its clock tower, and a photograph of the same square a hundred years ago.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'A photo of the square from a hundred years ago. What is still here?',
      subtext: 'Historians look for change and for continuity.',
      emoji: '🕰️',
    },
    {
      type: 'concept',
      title: 'Change and Continuity',
      body: 'Historians compare how things were with how they are. What alters is change, and what stays the same is continuity. Some changes are quick, and some take a lifetime.',
      visual: '💡',
      highlight: 'continuity',
    },
    {
      type: 'question',
      prompt: 'Which thing in the square shows continuity?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The clock tower', isCorrect: true },
          { id: 'b', text: 'The phone shop', isCorrect: false },
          { id: 'c', text: 'The bike rack', isCorrect: false },
        ],
        explanation: 'The clock tower. It stood here a hundred years ago, and it still does. The phone shop and the bike rack have both appeared since the photo.',
      },
    },
    {
      type: 'quote',
      id: 'lq-history-foundations-4-1',
      quote: 'The past is a foreign country: they do things differently there.',
      author: 'L. P. Hartley',
      era: '1953',
      work: 'The Go-Between',
    },
    {
      type: 'summary',
      title: 'What Changed, and What Stayed?',
      keyPoints: [
        'Historians compare how things were with how they are',
        'Change is what alters, continuity is what stays',
        'Some changes are quick, and some take a lifetime',
      ],
      closingThought: 'Next time you walk down an old street, ask what’s still the same.',
    },
  ],
};

export default lesson;
