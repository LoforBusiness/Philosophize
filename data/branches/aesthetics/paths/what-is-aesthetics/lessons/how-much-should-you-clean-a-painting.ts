import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'aesthetics-aesthetics-33',
  slug: 'how-much-should-you-clean-a-painting',
  title: 'How Much Should You Clean a Painting?',
  description: 'Under the varnish is the painting. So is four hundred years of being a painting.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Take the grime off and you may take the painting with it.',
      subtext: 'Leave it on and you are looking at dirt.',
      emoji: '🖼️',
    },
    {
      type: 'concept',
      title: 'Which Object Is The Artwork?',
      body: 'A restorer has to decide what the work actually is. The surface the painter left in 1512? The object as it has come down to us, darkened and repaired? Or the artist\'s intention, which no surface has ever quite matched?',
      visual: '🧽',
      highlight: 'Three different answers',
    },
    {
      type: 'example',
      title: 'The Sistine Ceiling',
      scenario: 'When the ceiling was cleaned in the 1980s, Michelangelo turned out to have used startling pinks and greens. Some scholars said the murk had been the painter\'s own final glaze, deliberately applied, and had just been scrubbed away for ever.',
      source: 'The Sistine restoration debate',
    },
    {
      type: 'quote',
      id: 'lq-aesthetics-aesthetics-33',
      quote: 'Restoration should stop at the point where conjecture begins.',
      author: 'Cesare Brandi',
      era: '1963',
    },
    {
      type: 'question',
      prompt: 'Why is "just return it to the original" not a clear instruction?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Because no surviving surface tells you which layer the artist meant to be last', isCorrect: true },
          { id: 'b', text: 'Because originals are always lost and only copies survive', isCorrect: false },
          { id: 'c', text: 'Because cleaning technology is not accurate enough yet', isCorrect: false },
          { id: 'd', text: 'Because the original was never any good to begin with', isCorrect: false },
        ],
        explanation: 'The instruction assumes there is a findable original state. What there actually is, is a stack of layers — paint, glaze, varnish, later repairs, dirt — and no layer comes labelled as the one the painter stopped at.',
      },
    },
    {
      type: 'question',
      prompt: 'A restorer removes a layer they cannot prove was later. What is the real problem?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The decision cannot be undone, so a guess becomes permanent', isCorrect: true },
          { id: 'b', text: 'The painting is worth less money afterwards', isCorrect: false },
          { id: 'c', text: 'Visitors will not notice the difference anyway', isCorrect: false },
          { id: 'd', text: 'Nothing — a restorer is entitled to their judgement', isCorrect: false },
        ],
        explanation: 'This is why Brandi\'s rule is about conjecture rather than taste. A wrong opinion in a catalogue can be corrected next year. A layer taken off a ceiling is a decision every future viewer is stuck with, including the ones who would have disagreed.',
      },
    },
    {
      type: 'summary',
      title: 'Where To Stop',
      keyPoints: [
        'There is no single original state to return to',
        'Grime, glaze and varnish are not easy to tell apart',
        'Cleaning is irreversible, so error is permanent',
        'Brandi: stop where conjecture begins',
      ],
      closingThought: 'Every old painting you have seen is partly a set of decisions somebody made about what it was.',
    },
  ],
};

export default lesson;
