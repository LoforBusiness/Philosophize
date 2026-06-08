import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'metaphysics-being-3',
  slug: 'what-counts-as-real',
  title: 'What Counts as Real?',
  description: 'Plato ranked eternal, unchanging Forms above the objects you can touch. Metaphysics asks what truly deserves the name "real."',
  estimatedMinutes: 6,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Plato said the apple in your hand is only half-real.',
      subtext: 'Not unreal, just stuck between being and not-being. His reasoning still rattles philosophers today.',
      emoji: '🍎',
    },
    {
      type: 'concept',
      title: 'Being vs. Becoming',
      body: 'Metaphysics chases one ruthless question: what is truly real? Heraclitus said everything flows, an endless river you cannot step in twice. Plato wanted an object of real knowledge, not just shifting opinion. So he split reality in two: stable Being you can know, and restless Becoming you can only guess at.',
      visual: '👁️',
      highlight: 'Being vs. Becoming',
    },
    {
      type: 'example',
      title: 'Plato\'s Cave',
      scenario: 'Plato imagines prisoners chained since birth, facing a wall. Puppets behind them cast flickering shadows, and the prisoners take the shadows for reality. One breaks free, climbs into blinding daylight, and finally sees the real things. It is an allegory, not a proof: our everyday world is the wall, and the truly real lies upstream, in eternal Forms.',
      source: 'Plato, Republic, Book VII (c. 375 BCE)',
      emoji: '🏛️',
    },
    {
      type: 'concept',
      title: 'Plato\'s Theory of Forms',
      body: 'Plato\'s move: each physical thing is a deficient copy that "participates in" a perfect Form. Equal sticks always fall short of Equality itself; the Form exists auto kath\' hauto, itself by itself, depending on nothing. Because Forms never change, they can be known, while changing things can only be believed.',
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
        explanation: 'For Plato the Forms enjoy the fullest being because they never change. A real apple bruises and rots, sliding between being and not-being; the Form it imitates never flinches.',
      },
    },
    {
      type: 'example',
      title: 'The Number Seven',
      scenario: 'Hunt for the number seven. Scribble a "7" and you have a symbol, not the number. Seven has no colour, no weight, no address, yet it seems undeniably real. This is mathematical Platonism: Kurt Godel held that math describes a reality "independent of the human mind." We seem to discover numbers, not invent them.',
      source: 'Kurt Godel, "What Is Cantor\'s Continuum Problem?" (1964)',
      emoji: '7️⃣',
    },
    {
      type: 'question',
      prompt: 'A thinker who holds that abstract objects like numbers exist mind-independently is called a:',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Materialist', isCorrect: false },
          { id: 'b', text: 'Skeptic', isCorrect: false },
          { id: 'c', text: 'Platonist (a realist about abstract Forms)', isCorrect: true },
          { id: 'd', text: 'Empiricist', isCorrect: false },
        ],
        explanation: 'A Platonist treats abstract Forms as real, mind-independent objects, not thoughts in anyone\'s head. This opposes materialism, the view that only physical matter ultimately exists.',
      },
    },
    {
      type: 'summary',
      title: 'Reality May Go Deeper Than It Looks',
      keyPoints: [
        'Plato split reality into stable Being and shifting Becoming',
        'Forms are eternal, unchanging, and known, not merely believed',
        'Physical things are deficient copies that imitate Forms',
        'Materialism counters: only matter is real',
      ],
      closingThought: 'Benacerraf\'s puzzle lingers: if numbers are real but untouchable, how could we ever know them?',
    },
  ],
};

export default lesson;
