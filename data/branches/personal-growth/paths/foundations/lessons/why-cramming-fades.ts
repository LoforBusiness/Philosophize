import type { Lesson } from '@/data/types';

// The sixth lesson on this subject's road, a DIALOGUE lesson (LESSON_RULES group AP):
// it plays as components/lesson/cinematic/growth6Scene.tsx. These cards are the
// fallback the runner uses only if the CINEMATIC entry is ever removed.
const lesson: Lesson = {
  id: 'personal-growth-foundations-6',
  slug: 'why-cramming-fades',
  title: 'Why Cramming Fades',
  description: 'A lighthouse in a storm, a ship signalling for help, and one night of Morse code against a week of it.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'She learned all of Morse code in one night. A week later, a ship signals.',
      subtext: 'Spread practice out, and it stays.',
      emoji: '🗼',
    },
    {
      type: 'concept',
      title: 'Spaced Practice',
      body: 'Cramming fills your head for a night and then fades. Practice spread over days lasts, and gaps that grow make a memory stronger each time you nearly forget it.',
      visual: '💡',
      highlight: 'spread',
    },
    {
      type: 'question',
      prompt: 'A week from now, who will read a signal best?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The one who practised daily', isCorrect: true },
          { id: 'b', text: 'The one who crammed', isCorrect: false },
          { id: 'c', text: 'Neither, it\'s a draw', isCorrect: false },
        ],
        explanation: 'The one who practised a little every day. Cramming fills your head for a night, and then most of it drains away.',
      },
    },
    {
      type: 'quote',
      id: 'lq-personal-growth-foundations-6-1',
      quote: 'With any considerable number of repetitions a suitable distribution of them over a space of time is decidedly more advantageous than the massing of them at a single time.',
      author: 'Hermann Ebbinghaus',
      era: '1885',
      work: 'Memory: A Contribution to Experimental Psychology',
    },
    {
      type: 'summary',
      title: 'Why Cramming Fades',
      keyPoints: [
        'Cramming fills your head for a night, then fades',
        'Practice spread over days is what lasts',
        'Growing gaps make a memory stronger each time',
      ],
      closingThought: 'Next time you learn something, plan when you’ll come back to it.',
    },
  ],
};

export default lesson;
