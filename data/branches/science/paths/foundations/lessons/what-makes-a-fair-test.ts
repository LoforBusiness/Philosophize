import type { Lesson } from '@/data/types';

// The second lesson on this subject's road, a DIALOGUE lesson (LESSON_RULES group AP):
// it plays as components/lesson/cinematic/sci2Scene.tsx. These cards are the
// fallback the runner uses only if the CINEMATIC entry is ever removed.
const lesson: Lesson = {
  id: 'science-foundations-2',
  slug: 'what-makes-a-fair-test',
  title: 'What Makes a Fair Test?',
  description: 'Two paper planes, a flight of stone steps, and a race that proved nothing yet.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Her pointy plane flew further. She also threw it from the top step.',
      subtext: 'A test only tells you something when it’s fair.',
      emoji: '✈️',
    },
    {
      type: 'concept',
      title: 'Change One Thing',
      body: 'A fair test changes one thing and keeps everything else the same, so you know what made the difference. And because one result can be luck, a test is repeated many times.',
      visual: '💡',
      highlight: 'one thing',
    },
    {
      type: 'question',
      prompt: 'She threw her pointy plane from the top step, and he threw his from the grass. Why is the race unfair?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Two things changed at once', isCorrect: true },
          { id: 'b', text: 'Her plane is a different colour', isCorrect: false },
          { id: 'c', text: 'It was a sunny day', isCorrect: false },
        ],
        explanation: 'Two things changed: the nose and the height of the throw. Nobody can tell which one made her plane fly further.',
      },
    },
    {
      type: 'quote',
      id: 'lq-science-foundations-2-1',
      quote: 'Extraordinary claims require extraordinary evidence.',
      author: 'Carl Sagan',
      era: '1980',
      work: 'Cosmos',
    },
    {
      type: 'summary',
      title: 'What Makes a Fair Test?',
      keyPoints: [
        'Change one thing, and keep the rest the same',
        'Then you know what made the difference',
        'Repeat it, because one result can be luck',
      ],
      closingThought: 'Next time someone says one thing beats another, ask whether the test was fair.',
    },
  ],
};

export default lesson;
