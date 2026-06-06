import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'metaphysics-being-3',
  slug: 'what-counts-as-real',
  title: 'What Counts as Real?',
  description: 'Plato claimed perfect, eternal Forms are more real than the objects you can touch. Metaphysics asks who is right.',
  estimatedMinutes: 6,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Your chair might be less real than the number seven.',
      subtext: 'Plato argued exactly that. His reasoning still rattles philosophers today.',
      emoji: '🪑',
    },
    {
      type: 'concept',
      title: 'Appearance vs. Reality',
      body: 'Metaphysics chases one ruthless question: what is truly real? We trust physical things because we can grab them. But everything physical decays. Heraclitus said all is flux, an endless river. Plato wanted something that never shifts, never rots, never lies. Beneath shifting appearances, he hunted for a changeless reality.',
      visual: '👁️',
      highlight: 'appearance vs. reality',
    },
    {
      type: 'example',
      title: 'Plato\'s Cave',
      scenario: 'Plato pictures prisoners chained since birth, staring at a wall. Puppets cast flickering shadows, and the prisoners swear the shadows are reality. One breaks free, climbs into blinding daylight, and sees the real things that cast them. Our world, Plato warns, is that wall. The truly real lies upstream, in eternal Forms.',
      source: 'Plato, The Republic, Book VII',
      emoji: '🏛️',
    },
    {
      type: 'concept',
      title: 'Plato\'s Theory of Forms',
      body: 'Plato\'s big move: every physical thing is a flawed copy of a perfect, eternal Form. Your drawn circle wobbles, but the Form of the Circle is flawlessly round, forever. Forms like Beauty, Justice, and Number outrank objects, he claims, because they never change and depend on nothing else to exist.',
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
        explanation: 'For Plato the Forms outrank physical things because they are perfect and unchanging. A real apple bruises and rots; the Form of the Apple never flinches.',
      },
    },
    {
      type: 'example',
      title: 'The Number Seven',
      scenario: 'Hunt for the number seven. Scribble a "7" and you have a symbol, not the number. Seven has no colour, no weight, no address, yet it seems undeniably real. Seven seas, seven notes, the same seven everywhere. This is mathematical Platonism: many mathematicians swear they discover numbers, not invent them.',
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
          { id: 'c', text: 'Platonist (a realist about abstract Forms)', isCorrect: true },
          { id: 'd', text: 'Empiricist', isCorrect: false },
        ],
        explanation: 'A Platonist crowns abstract Forms as the deepest layer of reality. This opposes materialism, the view that only physical matter ultimately exists.',
      },
    },
    {
      type: 'summary',
      title: 'Reality May Go Deeper Than It Looks',
      keyPoints: [
        'Appearances can mislead us about what is real',
        'Plato\'s Forms are perfect and never change',
        'Physical things are flawed copies of Forms',
        'Materialism counters: only matter is real',
      ],
      closingThought: 'Maybe what\'s most real is the eternal idea, not the thing crumbling in your hand.',
    },
  ],
};

export default lesson;
