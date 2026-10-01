import type { Lesson } from '@/data/types';

// The third lesson on this subject's road, a DIALOGUE lesson (LESSON_RULES group AP):
// it plays as components/lesson/cinematic/phil3Scene.tsx. These cards are the
// fallback the runner uses only if the CINEMATIC entry is ever removed.
const lesson: Lesson = {
  id: 'philosophy-foundations-3',
  slug: 'how-do-we-decide-whats-right',
  title: 'How Do We Decide What’s Right?',
  description: 'A twenty-pound note in a library book, and two ways of deciding what to do with it.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'A twenty-pound note falls out of a library book. Keep it?',
      subtext: 'Philosophers have two main ways of deciding what’s right.',
      emoji: '📚',
    },
    {
      type: 'concept',
      title: 'Consequences and Rules',
      body: 'One way of deciding what is right looks at consequences: who an act helps, and who it harms. Another looks at rules that hold whatever happens next. Both ask you for a reason you could say out loud.',
      visual: '💡',
      highlight: 'reason',
    },
    {
      type: 'question',
      prompt: 'She hands the note in. Which reason is a rule, not a consequence?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Anything found belongs at the desk', isCorrect: true },
          { id: 'b', text: 'Somebody is worried about their money', isCorrect: false },
          { id: 'c', text: 'Nobody would ever know', isCorrect: false },
        ],
        explanation: 'Anything found belongs at the desk. That holds whatever happens next. Somebody being worried is about consequences, and nobody knowing is no reason at all.',
      },
    },
    {
      type: 'quote',
      id: 'lq-philosophy-foundations-3-1',
      quote: 'It is the greatest happiness of the greatest number that is the measure of right and wrong.',
      author: 'Jeremy Bentham',
      era: '1776',
      work: 'A Fragment on Government',
    },
    {
      type: 'summary',
      title: 'How Do We Decide What’s Right?',
      keyPoints: [
        'One way weighs who an act helps and harms',
        'Another follows rules, whatever happens next',
        'Both ask you for a reason you can say out loud',
      ],
      closingThought: 'Next time you face a hard choice, ask who it helps, and which rule it keeps.',
    },
  ],
};

export default lesson;
