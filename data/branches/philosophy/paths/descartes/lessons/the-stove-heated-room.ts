import type { Lesson } from '@/data/types';

// The first lesson of this road's second unit, a true story told in costume (LESSON_RULES
// AW), a DIALOGUE lesson (group AP): it plays as components/lesson/cinematic/descartes1Scene.tsx.
// These cards are the fallback the runner uses only if the CINEMATIC entry is ever removed.
const lesson: Lesson = {
  id: 'philosophy-descartes-1',
  slug: 'the-stove-heated-room',
  title: 'The Stove-Heated Room',
  description: 'A snowy Bavarian town in winter 1619, a room with a tiled stove, a basket of apples, and three dreams by night.',
  estimatedMinutes: 6,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'A young soldier locks himself in a warm room to doubt everything',
      subtext: 'Winter, 1619: René Descartes decides to pull down every belief he has.',
      emoji: '🔥',
    },
    {
      type: 'concept',
      title: 'Tear down and rebuild',
      body: 'Descartes thought a town planned by one architect was neater than one patched by many builders. So he chose to clear out every belief he had and rebuild from firm ground, like tipping out a basket of apples and putting back only the sound ones.',
      visual: '💡',
      highlight: 'rebuild',
    },
    {
      type: 'question',
      prompt: 'Some apples in a basket might be bad. How does Descartes check them?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Tip them all out, then put back only the sound ones', isCorrect: true },
          { id: 'b', text: 'Pick out the bad ones one at a time', isCorrect: false },
          { id: 'c', text: 'Throw the whole basket away', isCorrect: false },
        ],
        explanation: 'He empties the basket first, so no hidden bad apple stays in, then puts back only the ones he has checked. He treats his beliefs the same way.',
      },
    },
    {
      type: 'quote',
      id: 'lq-philosophy-descartes-1-1',
      quote: 'I stayed all day shut up alone in a stove-heated room, where I was completely free to converse with myself about my own thoughts.',
      author: 'René Descartes',
      era: '1637',
      work: 'Discourse on the Method, Part 2 (1637; tr. Cottingham, Stoothoff and Murdoch)',
    },
    {
      type: 'summary',
      title: 'The Stove-Heated Room',
      keyPoints: [
        'In winter 1619, young Descartes shut himself in to think',
        'He chose to pull down every belief and rebuild',
        'That night, three dreams asked which path he would follow',
      ],
      closingThought: 'He had the plan. Next, he needed a method, and it took him eighteen years to publish it.',
    },
  ],
};

export default lesson;
