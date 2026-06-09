import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'metaphysics-being-3',
  slug: 'what-counts-as-real',
  title: 'What Counts as Real?',
  description: 'Plato ranked eternal Forms above the objects you can touch.',
  estimatedMinutes: 6,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Plato said the apple in your hand is only half-real.',
      subtext: 'Not unreal — stuck between being and not-being.',
      emoji: '🍎',
    },
    {
      type: 'concept',
      title: 'Being vs. Becoming',
      body: 'Heraclitus said everything flows — a river you cannot step in twice. Plato wanted an object of real knowledge, so he split reality: stable Being you can know, restless Becoming you can only guess.',
      visual: '👁️',
      highlight: 'Being vs. Becoming',
    },
    {
      type: 'example',
      title: 'Plato\'s Cave',
      scenario: 'Prisoners chained since birth face a wall, taking flickering shadows for reality. One breaks free, climbs into daylight, and sees real things. Our everyday world is the wall; the truly real lies upstream, in eternal Forms.',
      source: 'Plato, Republic, Book VII (c. 375 BCE)',
      emoji: '🏛️',
    },
    {
      type: 'quote',
      id: 'lq-metaphysics-being-3-1',
      quote: 'The soul is most like the divine, deathless, intelligible, uniform, indissoluble, always the same as itself.',
      author: 'Plato',
      era: 'c. 380 BCE',
      work: 'Phaedo, 80a',
    },
    {
      type: 'concept',
      title: 'Plato\'s Theory of Forms',
      body: 'Each physical thing is a deficient copy that "participates in" a perfect Form. Equal sticks always fall short of Equality itself. Because Forms never change, they can be known; changing things can only be believed.',
      visual: '🔵',
      highlight: 'Forms',
    },
    {
      type: 'question',
      prompt: 'According to Plato, which of these is MOST fully real?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'A particular apple you can hold in your hand', isCorrect: false },
          { id: 'b', text: 'The eternal, unchanging Form the apple imitates', isCorrect: true },
          { id: 'c', text: 'The shade of red the apple happens to wear', isCorrect: false },
          { id: 'd', text: 'A painting of the apple', isCorrect: false },
        ],
        explanation: 'For Plato the Forms enjoy the fullest being because they never change. A real apple bruises and rots; the Form it imitates never flinches.',
      },
    },
    {
      type: 'question',
      prompt: 'You can see and touch an apple but never a Form. So which does Plato call more real?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The apple — what we sense directly must be most real', isCorrect: false },
          { id: 'b', text: 'The apple, since Forms are just ideas in our heads', isCorrect: false },
          { id: 'c', text: 'The Form — for Plato, being knowable and unchanging beats being visible', isCorrect: true },
          { id: 'd', text: 'Neither — Plato thought reality is unknowable', isCorrect: false },
        ],
        explanation: 'It feels backwards: Plato ranks the invisible Form above the touchable apple. Sensible things change and decay, so for him they have less being than the eternal Forms.',
      },
    },
    {
      type: 'summary',
      title: 'Reality May Go Deeper Than It Looks',
      keyPoints: [
        'Plato split reality: Being and Becoming',
        'Forms are eternal, unchanging, knowable',
        'Physical things are deficient copies',
        'Materialism counters: only matter is real',
      ],
      closingThought: 'If the most real things are the ones you can never touch, what does that make the world you see?',
    },
  ],
};

export default lesson;
