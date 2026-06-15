import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'logic-arguments-23',
  slug: 'truth-tables-and-connectives',
  title: 'And, Or, Not, If',
  description: 'The four logical connectives and the truth tables that pin down exactly what they mean.',
  estimatedMinutes: 6,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Four tiny words run all of computing — and all of logic.',
      subtext: 'And, or, not, if. Define them precisely with a table, and ambiguity disappears.',
      emoji: '🔌',
    },
    {
      type: 'concept',
      title: 'And, Or, Not',
      body: '"P and Q" is true only when both are true. "P or Q" is true when at least one is true — logic\'s "or" is inclusive, so "both" still counts. "Not P" simply flips P\'s truth value. A truth table lists every combination and its result.',
      visual: '🔀',
      highlight: 'inclusive or',
    },
    {
      type: 'concept',
      title: 'The Tricky "If"',
      body: '"If P, then Q" is false in exactly one case: P true, Q false (the promise broken). When P is false, the whole "if" counts as true — the promise was never triggered. "If pigs fly, I\'m a millionaire" is technically true.',
      visual: '🐷',
      highlight: 'false only when P true, Q false',
    },
    {
      type: 'example',
      title: 'The Unbreakable Promise',
      scenario: 'You promise: "If it rains, I\'ll bring an umbrella." When does this promise become a lie? Only one way: it rains AND you show up dry-handed. If it doesn\'t rain, you broke nothing — umbrella or not. That single-failure pattern is exactly how logic\'s "if-then" behaves on a truth table.',
      emoji: '☂️',
    },
    {
      type: 'question',
      prompt: 'In logic, "I\'ll have cake or pie." You take both. Did you tell the truth?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Yes — logical "or" is inclusive, so both is fine', isCorrect: true },
          { id: 'b', text: 'No — "or" means exactly one, never both', isCorrect: false },
          { id: 'c', text: 'No — you can only satisfy one disjunct', isCorrect: false },
          { id: 'd', text: 'Only if you eat them at separate times', isCorrect: false },
        ],
        explanation: 'Everyday speech often means "one or the other, not both" — that\'s the tempting trap. But the logical "or" (disjunction) is inclusive: "P or Q" is true whenever at least one holds, and taking both still makes it true.',
      },
    },
    {
      type: 'question',
      prompt: 'True or false: "If 2 + 2 = 5, then I am the Pope" is a true statement in logic.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: true,
        explanation: 'It feels absurd, but the antecedent (2+2=5) is false, and "if-then" is automatically true whenever its "if" part is false. The promise was never triggered, so nothing was broken. Welcome to material implication.',
      },
    },
    {
      type: 'summary',
      title: 'The Four Connectives',
      keyPoints: [
        '"And": true only when both parts are true',
        '"Or": inclusive — true if at least one holds',
        '"Not": flips the truth value',
        '"If-then": false only when P true, Q false',
      ],
      closingThought: 'A truth table is a lie detector: feed it the parts, read off the whole.',
    },
  ],
};

export default lesson;
