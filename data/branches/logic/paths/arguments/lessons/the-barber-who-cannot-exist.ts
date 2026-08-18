import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'logic-arguments-37',
  slug: 'the-barber-who-cannot-exist',
  title: 'The Barber Who Cannot Exist',
  description: 'A rule so simple it takes ten seconds to state. There is no such barber.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'He shaves every man who does not shave himself.',
      subtext: 'Only those. Now: who shaves the barber?',
      emoji: '💈',
    },
    {
      type: 'concept',
      title: 'A Rule With No Room For Its Own Author',
      body: 'If the barber shaves himself, he is a man who shaves himself, so by his rule he must not. If he does not, he is a man who does not, so by his rule he must. Neither answer survives, and there are only two.',
      visual: '↔️',
      highlight: 'neither answer survives',
    },
    {
      type: 'example',
      title: 'Why It Mattered',
      scenario: 'Russell hit the real version in 1901 while Frege was completing a foundation for mathematics. Take the collection of all collections that do not contain themselves and ask whether it contains itself. Frege added an appendix admitting the ground had gone.',
      source: 'Russell, letter to Frege (1902)',
    },
    {
      type: 'quote',
      id: 'lq-logic-arguments-37',
      quote: 'Arithmetic totters.',
      author: 'Gottlob Frege',
      era: '1902',
    },
    {
      type: 'question',
      prompt: 'What does the barber story actually prove?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'That no such barber can exist — the description is contradictory', isCorrect: true },
          { id: 'b', text: 'That the barber must be a woman', isCorrect: false },
          { id: 'c', text: 'That logic breaks down in ordinary language', isCorrect: false },
          { id: 'd', text: 'That some questions have no answer', isCorrect: false },
        ],
        explanation: '"The barber is a woman" dodges the puzzle rather than solving it — restate it about people and it returns. The conclusion is stronger and cleaner: a description can be perfectly grammatical and describe nothing possible.',
      },
    },
    {
      type: 'question',
      prompt: 'Why was the set version so much worse than the barber?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Nothing stopped you forming that set — the rules of the day allowed it', isCorrect: true },
          { id: 'b', text: 'Because sets are more complicated than barbers', isCorrect: false },
          { id: 'c', text: 'Because it was discovered by a famous philosopher', isCorrect: false },
          { id: 'd', text: 'Because mathematics cannot tolerate any paradox', isCorrect: false },
        ],
        explanation: 'With the barber you shrug and say no such man. With sets you could not: the axiom said any condition determines a set, so the contradictory set was a legal object, and everything built on those axioms was in trouble.',
      },
    },
    {
      type: 'summary',
      title: 'When a Description Describes Nothing',
      keyPoints: [
        'The barber rule allows no answer for the barber',
        'So no such barber can exist',
        'Grammatical is not the same as possible',
        'The set version made the same move legal, and cost a foundation',
      ],
      closingThought: 'Modern set theory is largely the machinery built to stop you writing that sentence. Every axiom is a door held shut against a barber.',
    },
  ],
};

export default lesson;
