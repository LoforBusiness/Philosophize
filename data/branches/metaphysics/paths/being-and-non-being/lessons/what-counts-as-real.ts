import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'metaphysics-being-3',
  slug: 'what-counts-as-real',
  title: 'What Counts as Real?',
  description: 'Is reality what you can touch — or could ideas be more real than physical objects?',
  estimatedMinutes: 6,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Your chair might be less real than the number 7.',
      subtext: 'Plato thought so — and he had a point.',
      emoji: '🪑',
    },
    {
      type: 'concept',
      title: 'Appearance vs. Reality',
      body: 'Metaphysics asks: what is truly real? We assume physical objects are real because we can touch them. But philosophers challenge this. A chair looks brown in sunlight, grey at night — which color is "real"? The table feels solid but is 99.9% empty space. What we perceive may be a pale shadow of what actually exists.',
      visual: '👁️',
      highlight: 'appearance vs. reality',
    },
    {
      type: 'example',
      title: 'Plato\'s Cave',
      scenario: 'Plato imagined prisoners chained in a cave, seeing only shadows on the wall. They mistake the shadows for reality. When one prisoner escapes and sees the sun, he discovers the shadows were copies of real things. Plato meant: the physical world we see is the shadow. The truly real things are perfect, eternal Forms — like the Form of Beauty or the Form of a Circle.',
      source: 'Plato, The Republic, Book VII',
      emoji: '🏛️',
    },
    {
      type: 'concept',
      title: 'Plato\'s Theory of Forms',
      body: 'Plato argued that every physical thing is an imperfect copy of a perfect, eternal Form. The circle you draw is imperfect — but the idea of a perfect circle never changes. Numbers, justice, beauty — these Forms are more real than any physical object because they are unchanging, universal, and exist independently of minds. Physical things come and go; Forms are eternal.',
      visual: '🔵',
      highlight: 'Forms',
    },
    {
      type: 'question',
      prompt: 'According to Plato, which of these is MOST real?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'A specific apple you can hold', isCorrect: false },
          { id: 'b', text: 'The perfect, eternal Form of an Apple', isCorrect: true },
          { id: 'c', text: 'The color red that the apple has', isCorrect: false },
          { id: 'd', text: 'A painting of the apple', isCorrect: false },
        ],
        explanation: 'For Plato, Forms are more real than physical objects because Forms are perfect, eternal, and unchanging. Physical apples rot and vary — the Form of Apple never does.',
      },
    },
    {
      type: 'example',
      title: 'The Number Seven',
      scenario: 'Where is the number 7? You can write "7" on paper, but that\'s just a symbol. The number itself has no color, weight, or location — yet it seems very real. Seven planets, seven notes in a scale — the concept is the same everywhere. Mathematicians often feel they discover mathematical truths rather than invent them, as if numbers exist independently.',
      emoji: '7️⃣',
    },
    {
      type: 'question',
      prompt: 'A philosopher who believes abstract ideas are more real than physical objects is called a:',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Materialist', isCorrect: false },
          { id: 'b', text: 'Skeptic', isCorrect: false },
          { id: 'c', text: 'Idealist or Platonist', isCorrect: true },
          { id: 'd', text: 'Empiricist', isCorrect: false },
        ],
        explanation: 'Plato\'s view (Platonism) holds that abstract Forms or ideas are the primary reality. This contrasts with materialism, which holds that only physical matter is truly real.',
      },
    },
    {
      type: 'summary',
      title: 'Reality Is Deeper Than It Looks',
      keyPoints: [
        'Appearances can mislead us about what\'s truly real',
        'Plato\'s Forms are perfect, eternal, and unchanging',
        'Physical objects are imperfect copies of Forms',
        'Numbers and ideas may be more real than things',
      ],
      closingThought: 'Reality might be hiding behind everything you can see.',
    },
  ],
};

export default lesson;
