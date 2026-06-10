import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'logic-arguments-7',
  slug: 'two-valid-moves',
  title: 'Two Moves That Always Work',
  description: 'Modus ponens and modus tollens: the conditional\'s two valid forms.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Two ancient moves let you win every time.',
      subtext: 'Affirm the condition, or deny the result — both are airtight.',
      emoji: '♟️',
    },
    {
      type: 'concept',
      title: 'Modus Ponens',
      body: 'The forward move: If P, then Q. P is true. So Q is true. Affirm the antecedent and the consequent must follow. The Stoics catalogued this form over two thousand years ago.',
      visual: '✅',
      highlight: 'P is true, so Q',
    },
    {
      type: 'concept',
      title: 'Modus Tollens',
      body: 'The backward move: If P, then Q. Q is false. So P is false. Deny the consequent and the antecedent collapses with it. Both moves are perfectly valid.',
      visual: '🔁',
      highlight: 'Q is false, so not P',
    },
    {
      type: 'quote',
      id: 'lq-logic-arguments-7',
      quote: 'To investigate the fundamental laws of those operations of the mind by which reasoning is performed.',
      author: 'George Boole',
      era: '1854',
      work: 'An Investigation of the Laws of Thought',
    },
    {
      type: 'question',
      prompt: '"If it rains, the streets are wet. It is raining." What follows?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The streets are wet — by modus ponens', isCorrect: true },
          { id: 'b', text: 'It is not raining — by modus tollens', isCorrect: false },
          { id: 'c', text: 'Nothing certain follows', isCorrect: false },
          { id: 'd', text: 'The streets might be wet', isCorrect: false },
        ],
        explanation: 'Affirming the antecedent (it rains) forces the consequent (wet streets) — that is modus ponens.',
      },
    },
    {
      type: 'question',
      prompt: '"If it rains, streets are wet. The streets are dry." Concluding "it did not rain" — valid or a trick?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Valid — that is textbook modus tollens', isCorrect: true },
          { id: 'b', text: 'Invalid — you can\'t reason backward from the result', isCorrect: false },
          { id: 'c', text: 'Invalid — denying anything breaks the logic', isCorrect: false },
          { id: 'd', text: 'Only probable, never certain', isCorrect: false },
        ],
        explanation: 'Denying the consequent (dry streets) validly denies the antecedent (no rain) — modus tollens is rock solid, not a trick.',
      },
    },
    {
      type: 'summary',
      title: 'Two Valid Moves Mastered',
      keyPoints: [
        'Modus ponens: affirm P, conclude Q',
        'Modus tollens: deny Q, conclude not-P',
        'Both forms are perfectly valid',
        'The Stoics named these moves first',
      ],
      closingThought: 'Two moves, infinite arguments — learn them once, use them forever.',
    },
  ],
};

export default lesson;
