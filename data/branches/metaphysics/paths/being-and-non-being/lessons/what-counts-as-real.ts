import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'metaphysics-being-3',
  slug: 'what-counts-as-real',
  title: 'What Counts as Real?',
  description: 'Is reality just what you can touch, or could ideas be more real than physical objects?',
  estimatedMinutes: 6,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Your chair might be less real than the number seven.',
      subtext: 'Plato argued exactly that, and his reasoning is worth taking seriously.',
      emoji: '🪑',
    },
    {
      type: 'concept',
      title: 'Appearance and Reality',
      body: 'Metaphysics asks: what is truly real? We tend to trust physical things because we can touch them. But a chair looks brown at noon and grey at dusk, so which colour is the real one? A solid table is mostly empty space at the atomic level. What we perceive may not be the full story of what is actually there.',
      visual: '👁️',
      highlight: 'appearance vs. reality',
    },
    {
      type: 'example',
      title: 'Plato\'s Cave',
      scenario: 'Plato imagined prisoners chained in a cave their whole lives, watching shadows on a wall and believing the shadows are the real world. One escapes, walks into daylight, and sees the shadows were just copies of real things. The world we see, Plato says, is like that wall. The truly real things are perfect, eternal Forms.',
      source: 'Plato, The Republic, Book VII',
      emoji: '🏛️',
    },
    {
      type: 'concept',
      title: 'Plato\'s Theory of Forms',
      body: 'Plato held that every physical thing is an imperfect copy of a perfect, eternal Form. A circle you draw is always a bit wobbly, but the idea of a perfect circle never changes. Forms like numbers, justice, and beauty are more real than objects, he argued, because they never change and exist on their own.',
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
          { id: 'a', text: 'A particular apple you can hold in your hand', isCorrect: false },
          { id: 'b', text: 'The perfect, eternal Form of the Apple', isCorrect: true },
          { id: 'c', text: 'The shade of red the apple happens to wear', isCorrect: false },
          { id: 'd', text: 'A painting of the apple', isCorrect: false },
        ],
        explanation: 'For Plato, the Forms are more real than physical things because they are perfect and unchanging. A real apple bruises and rots, but the Form of the Apple never changes.',
      },
    },
    {
      type: 'example',
      title: 'The Number Seven',
      scenario: 'Where exactly is the number seven? You can write a "7" on paper, but that is just a symbol for it. The number itself has no colour, weight, or location, yet it still seems real. Seven seas, seven notes in a scale: the same seven shows up everywhere. Many mathematicians feel they discover numbers rather than invent them.',
      emoji: '7️⃣',
    },
    {
      type: 'question',
      prompt: 'A thinker who holds that abstract ideas are more real than physical objects is called a:',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Materialist', isCorrect: false },
          { id: 'b', text: 'Skeptic', isCorrect: false },
          { id: 'c', text: 'Idealist or Platonist', isCorrect: true },
          { id: 'd', text: 'Empiricist', isCorrect: false },
        ],
        explanation: 'Platonism treats abstract Forms or ideas as the deepest layer of reality. It is the opposite of materialism, which says only physical matter is ultimately real.',
      },
    },
    {
      type: 'summary',
      title: 'Reality May Go Deeper Than It Looks',
      keyPoints: [
        'How things appear can mislead us about what is real',
        'Plato\'s Forms are perfect and never change',
        'Physical things are imperfect copies of those Forms',
        'Numbers and ideas may be more real than objects',
      ],
      closingThought: 'What\'s most real might be the ideas behind things, not the things you can touch.',
    },
  ],
};

export default lesson;
