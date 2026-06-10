import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'aesthetics-aesthetics-9',
  slug: 'beauty-versus-meaning',
  title: 'Beauty Versus Meaning',
  description: 'Much modern art is not pretty at all. So why does it matter?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'A stack of grocery boxes hangs in a museum.',
      subtext: 'It is not beautiful. Yet it changed what art could be.',
      emoji: '📦',
    },
    {
      type: 'concept',
      title: 'Beauty Loses Its Throne',
      body: 'For centuries beauty defined art. Then modern art aimed elsewhere: to provoke, to mean, to ask questions. Danto argued beauty became one option among many, not art\'s essence.',
      visual: '👑',
      highlight: 'beauty dethroned',
    },
    {
      type: 'example',
      title: 'Warhol\'s Brillo Boxes',
      scenario: 'Warhol stacked plywood boxes painted to look exactly like Brillo cartons. They look identical to supermarket packaging. Danto asked: if the look is the same, what makes one art? The answer is meaning, not beauty.',
      source: 'Andy Warhol, Brillo Box (1964)',
      emoji: '🧽',
    },
    {
      type: 'quote',
      id: 'lq-aesthetics-aesthetics-9-1',
      quote: 'Beauty is an option for art and not a necessary condition. But it is not an option for life.',
      author: 'Arthur Danto',
      era: '2003',
      work: 'The Abuse of Beauty',
    },
    {
      type: 'question',
      prompt: 'According to Danto, what is the relationship between beauty and art today?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Beauty is one option for art, not a requirement', isCorrect: true },
          { id: 'b', text: 'Beauty is the single necessary mark of all art', isCorrect: false },
          { id: 'c', text: 'Beauty and art are exactly the same thing', isCorrect: false },
          { id: 'd', text: 'Art can never be beautiful anymore', isCorrect: false },
        ],
        explanation: 'Danto held that beauty is an option, not a necessary condition, for art. Works can move us through meaning, provocation, or ideas instead of beauty.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Not pretty does not mean not art.',
      body: 'A disturbing photograph or a provocative installation may refuse beauty on purpose, and still be powerful art — because it carries meaning the eye alone could never supply.',
      emoji: '💥',
    },
    {
      type: 'question',
      prompt: '"If a work is not beautiful, then by definition it cannot really be art." Evaluate this claim.',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Correct — beauty is the definition of art', isCorrect: false },
          { id: 'b', text: 'Mistaken — Danto showed meaning, not beauty, can carry a work as art', isCorrect: true },
          { id: 'c', text: 'Correct — ugly objects are merely decoration, never art', isCorrect: false },
          { id: 'd', text: 'Mistaken — because all genuine art is secretly beautiful', isCorrect: false },
        ],
        explanation: 'The trap: "art equals beauty" is the old assumption Danto rejected. Warhol\'s plain boxes show a work can be art through meaning while abandoning beauty.',
      },
    },
    {
      type: 'summary',
      title: 'Meaning Can Replace Beauty',
      keyPoints: [
        'Beauty once defined what art was',
        'Danto: beauty is optional, not essential',
        'Modern art trades beauty for meaning',
      ],
      closingThought: 'Art can shock or question, not just please the eye.',
    },
  ],
};

export default lesson;
