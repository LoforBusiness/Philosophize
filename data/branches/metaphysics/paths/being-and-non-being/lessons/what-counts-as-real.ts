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
      headline: 'Your chair might be less real than the number seven.',
      subtext: 'Plato believed exactly that, and his reasons are hard to shake.',
      emoji: '🪑',
    },
    {
      type: 'concept',
      title: 'Appearance and Reality',
      body: 'Metaphysics asks the boldest question: what is truly real? We trust physical things because we can touch them. Yet a chair glows brown at noon and turns grey by dusk — which colour is the real one? The table feels solid, though it is almost entirely empty space. What we perceive may be only a faint shadow of what is.',
      visual: '👁️',
      highlight: 'appearance vs. reality',
    },
    {
      type: 'example',
      title: 'Plato\'s Cave',
      scenario: 'Plato pictured prisoners chained in a cave since birth, watching only shadows flicker across the wall, certain those shadows are the whole world. One breaks free, climbs into daylight, and learns the shadows were mere copies of real things. The world we see, Plato says, is that wall. The truly real are perfect, eternal Forms — Beauty itself, the Circle itself.',
      source: 'Plato, The Republic, Book VII',
      emoji: '🏛️',
    },
    {
      type: 'concept',
      title: 'Plato\'s Theory of Forms',
      body: 'Every physical thing, Plato held, is a flawed echo of a perfect, eternal Form. The circle your hand draws wobbles, but the perfect circle never alters. Numbers, justice, beauty — such Forms outrank any object, for they are unchanging, universal, and need no mind to hold them. Things arise and perish; the Forms abide.',
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
        explanation: 'For Plato the Forms outrank physical things, being perfect, eternal, and unchanging. A real apple bruises and rots; the Form of the Apple never wavers.',
      },
    },
    {
      type: 'example',
      title: 'The Number Seven',
      scenario: 'Where, exactly, is the number seven? You can ink a "7" on paper, but that is only a symbol. The number itself has no colour, no weight, no address — and still feels undeniably real. Seven seas, seven notes in a scale: the same seven everywhere. Mathematicians often sense they discover truths rather than invent them, as though numbers were waiting to be found.',
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
        explanation: 'Platonism treats abstract Forms or ideas as the deepest layer of reality. It stands opposed to materialism, for which only physical matter is ultimately real.',
      },
    },
    {
      type: 'summary',
      title: 'Reality Runs Deeper Than It Looks',
      keyPoints: [
        'What appears can mislead us about what truly is',
        'Plato\'s Forms are perfect, eternal, and unchanging',
        'Physical things are flawed copies of those Forms',
        'Numbers and ideas may outrank solid objects',
      ],
      closingThought: 'The real may be quietly hiding behind everything your eyes can reach.',
    },
  ],
};

export default lesson;
