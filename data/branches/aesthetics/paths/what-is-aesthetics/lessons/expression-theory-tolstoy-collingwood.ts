import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'aesthetics-aesthetics-16',
  slug: 'expression-theory-tolstoy-collingwood',
  title: 'Art As Caught Feeling',
  description: "Tolstoy said real art literally transmits the artist's feeling into you.",
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'A feeling, caught like a cold, across centuries.',
      subtext: "Tolstoy thought art literally hands you the maker's emotion.",
      emoji: '🤧',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you saw expression theory as a definition.',
      body: 'In earlier lessons, expression beat formalism as one rival answer to "what is art?" Now we open the engine: not just that art expresses feeling, but how a feeling moves from one mind into another.',
      emoji: '🔧',
    },
    {
      type: 'concept',
      title: 'Art as Infection',
      body: "Tolstoy's mechanism has three beats: the artist genuinely feels an emotion, fixes it in external signs — paint, notes, words — and the audience, meeting those signs, catches the very same feeling. Real art \"infects.\" Sincerity, not skill or beauty, is the test.",
      visual: '📡',
      highlight: 'infection',
    },
    {
      type: 'quote',
      id: 'lq-aesthetics-aesthetics-16-1',
      quote: 'Art is a human activity consisting in this, that one man consciously, by means of certain external signs, hands on to others feelings he has lived through.',
      author: 'Leo Tolstoy',
      era: '1897',
      work: 'What Is Art?',
    },
    {
      type: 'example',
      title: 'Collingwood Refines the Idea',
      scenario: 'Collingwood worried mere "infection" sounds like a trick. Real art, he said, is the artist clarifying a feeling not yet understood — discovering what it is by making the work. The poet does not arrive knowing the emotion; the poem is how it becomes clear.',
      source: 'R. G. Collingwood, The Principles of Art (1938)',
      emoji: '🪞',
    },
    {
      type: 'question',
      prompt: "Sort the stages of Tolstoy's emotional 'infection', from first to last.",
      xpValue: 5,
      interaction: {
        type: 'sort',
        items: [
          { id: 's1', text: 'The artist actually feels a real emotion' },
          { id: 's2', text: 'The artist embodies it in external signs — a work' },
          { id: 's3', text: 'The audience catches that same feeling' },
        ],
        correctOrder: ['s1', 's2', 's3'],
        explanation: "Tolstoy's order is felt → embodied → transmitted. Note it is transmission, not mere depiction: a work that only pictures grief without first living and carrying it would, for him, fail as art.",
      },
    },
    {
      type: 'reinforcement',
      callout: 'Two theories, now with mechanisms.',
      body: "Earlier, formalism said art is significant form and expression said art carries feeling. Tolstoy supplies the missing how — infection — and Collingwood deepens it: art is the feeling becoming clear, not just a feeling shipped intact.",
      emoji: '⚙️',
    },
    {
      type: 'summary',
      title: 'What You Now Know',
      keyPoints: [
        'Tolstoy: art infects you with a lived feeling',
        'Three beats: felt, embodied, transmitted',
        'Collingwood: art clarifies, not just transmits',
        'Sincerity outranks beauty or skill',
      ],
      closingThought: 'Expression theory is not vague: it names a real mechanism.',
    },
  ],
};

export default lesson;
