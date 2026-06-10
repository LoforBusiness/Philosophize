import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'metaphysics-being-10',
  slug: 'universals-and-particulars',
  title: 'Where Does "Redness" Live?',
  description: 'Two apples share one colour. Is that shared something a real thing?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'A rose and a ruby share redness. What is that?',
      subtext: 'A debate that ran for two thousand years.',
      emoji: '🌹',
    },
    {
      type: 'concept',
      title: 'The Problem of Universals',
      body: 'Many particular things share one property — redness, roundness, justice. A universal is that one feature present in many. The question: does the universal really exist, or only the particular things?',
      visual: '🔴',
      highlight: 'one feature present in many',
    },
    {
      type: 'quote',
      id: 'lq-metaphysics-being-10-1',
      quote: 'The universal is common, since that is called universal which is such as to belong to more than one thing.',
      author: 'Aristotle',
      era: 'c. 350 BCE',
      work: 'Metaphysics, Book VII',
    },
    {
      type: 'concept',
      title: 'Realists Versus Nominalists',
      body: 'Realists say universals truly exist, grounding why things resemble each other. Nominalists deny them: only particular things exist, and "red" is just a name we apply to similar ones.',
      visual: '⚖️',
      highlight: 'realists versus nominalists',
    },
    {
      type: 'example',
      title: 'Where Plato and Aristotle Split',
      scenario: 'Plato placed universals in a separate realm of Forms, more real than things. Aristotle pulled them back to earth: redness exists, but only in red things — never floating free of any object that bears it.',
      emoji: '🏛️',
    },
    {
      type: 'question',
      prompt: 'What does a nominalist believe about universals like redness?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'They exist in a separate realm beyond the senses', isCorrect: false },
          { id: 'b', text: 'They are real things shared by many objects', isCorrect: false },
          { id: 'c', text: 'Only particular things exist; "redness" is just a shared name', isCorrect: true },
          { id: 'd', text: 'They exist only inside red objects', isCorrect: false },
        ],
        explanation: 'Nominalists hold that only particular things are real and that a universal term is merely a name we attach to things that resemble one another.',
      },
    },
    {
      type: 'question',
      prompt: 'Aristotle believed in universals, so he must have agreed with Plato that they exist in a separate realm. Right?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Yes — both placed the Forms beyond the physical world', isCorrect: false },
          { id: 'b', text: 'Yes — to be a realist just is to accept Plato\'s realm', isCorrect: false },
          { id: 'c', text: 'No — Aristotle kept universals real but located them within things, not in a separate realm', isCorrect: true },
          { id: 'd', text: 'No — Aristotle denied universals exist at all', isCorrect: false },
        ],
        explanation: 'Aristotle was a realist about universals but, unlike Plato, insisted they exist only in the particular things that have them — so accepting universals need not mean accepting a separate realm.',
      },
    },
    {
      type: 'summary',
      title: 'The Many and the One',
      keyPoints: [
        'Universals: one feature shared by many',
        'Realists say they truly exist',
        'Nominalists say only particulars do',
        'Plato and Aristotle disagreed on where',
      ],
      closingThought: 'Next time two things strike you as alike, ask: are you finding a shared something, or just inventing a handy name?',
    },
  ],
};

export default lesson;
