import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'metaphysics-being-18',
  slug: 'abstract-objects-platonism',
  title: 'Where Do Numbers Live?',
  description: 'The number 7 is prime whether or not anyone counts. So is it real?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Seven is prime even if every human vanished tonight.',
      subtext: 'No one made that true. So where does the fact live?',
      emoji: '🔢',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you saw the fight between realists and nominalists.',
      body: 'In Lesson 10, realists said universals like redness truly exist; nominalists said only particular things do. Mathematics raises the same fight at a higher pitch — about numbers, sets, and proofs.',
      emoji: '⚖️',
    },
    {
      type: 'concept',
      title: 'Platonism About Mathematics',
      body: 'Platonists say numbers, sets, and mathematical truths exist on their own — timeless, mind-independent, outside space and time. We do not invent them; we discover them, the way explorers find a continent that was already there.',
      visual: '🌌',
      highlight: 'discover, not invent',
    },
    {
      type: 'example',
      title: 'A Continent or a Game?',
      scenario: 'Mathematicians spent centuries chasing whether every even number is two primes summed. They cannot vote it true. It already is true or false, waiting. Platonists read that as proof: there is a fact out there to find. Nominalists answer that math is just a powerful, self-consistent human game.',
      emoji: '🧭',
    },
    {
      type: 'quote',
      id: 'lq-metaphysics-being-18-1',
      quote: 'The objects of transfinite set theory clearly do not belong to the physical world, and even their indirect connection with physical experience is very loose.',
      author: 'Kurt Gödel',
      era: '1964',
      work: "What Is Cantor's Continuum Problem?",
      philosopherId: 'kurt-godel',
    },
    {
      type: 'concept',
      title: 'A Number Is Not Its Numeral',
      body: 'Watch a trap here. The mark "7" is physical ink; the Roman "VII" and the spoken word are too. But the number they all point to is the same one — and it stays prime across every notation. The symbol is physical; what it names need not be.',
      highlight: 'use–mention distinction',
    },
    {
      type: 'question',
      prompt: 'A friend says: "Numbers are just marks we write down, so they exist only as physical symbols on paper." How should a Platonist reply?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Agree — erase every "7" and the number 7 is gone too', isCorrect: false },
          { id: 'b', text: 'That confuses a number with its numeral; the symbol is physical, the number it names is not', isCorrect: true },
          { id: 'c', text: 'Numbers exist only as electrical patterns inside our brains', isCorrect: false },
          { id: 'd', text: 'Numbers exist only while at least one person is counting', isCorrect: false },
        ],
        explanation: 'Option A is tempting but commits the use–mention confusion: it mistakes the mark "7" for the number it denotes. The ink "7", "VII", and "seven" differ, yet name one number that stays prime across all notations — and would hold even with no symbol at all. Platonists locate that number as an abstract, non-physical object.',
      },
    },
    {
      type: 'summary',
      title: 'What You Now Know',
      keyPoints: [
        'Platonism: numbers exist mind-independently, outside space and time',
        'We discover mathematical truths rather than invent them',
        'Nominalists call math a useful human construction',
        'Never confuse a number with its numeral',
      ],
      closingThought: 'The realism you met for redness now stretches to the number 7 — and Gödel thought the stretch was no mistake.',
    },
  ],
};

export default lesson;
