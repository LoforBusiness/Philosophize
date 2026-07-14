import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'logic-arguments-4',
  slug: 'strong-vs-weak-arguments',
  title: 'Strong Arguments vs Weak Arguments',
  description: 'Deduction guarantees; induction only makes likely.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Some arguments prove. Others only bet the odds.',
      subtext: 'Deduction aims to guarantee its conclusion. Induction only makes it probable.',
      emoji: '⚖️',
    },
    {
      type: 'concept',
      title: 'Two Families of Argument',
      body: 'A DEDUCTIVE argument claims its premises GUARANTEE the conclusion — we grade it valid or sound. An INDUCTIVE argument only makes the conclusion LIKELY — so we grade it strong or weak. Wrong ruler, wrong verdict.',
      visual: '🎲',
      highlight: 'STRONG',
    },
    {
      type: 'example',
      title: 'Guaranteed vs Likely',
      scenario: 'Deductive: "All men are mortal; Socrates is a man; so he is mortal." It can\'t be false. Inductive: "Most Greeks eat olives; Socrates is Greek; so he eats olives." Only probable — he might hate them.',
      emoji: '🫒',
      source: 'Internet Encyclopedia of Philosophy, "Deductive and Inductive Arguments"',
    },
    {
      type: 'quote',
      id: 'lq-logic-arguments-4',
      quote: 'Custom, then, is the great guide of human life.',
      author: 'David Hume',
      era: '1748',
      work: 'An Enquiry Concerning Human Understanding',
    },
    {
      type: 'question',
      prompt: 'An inductive argument\'s premises make its conclusion likely. What is it?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Strong — induction\'s version of valid', isCorrect: true },
          { id: 'b', text: 'Sound, since the premises support it', isCorrect: false },
          { id: 'c', text: 'Invalid, since it could still be false', isCorrect: false },
          { id: 'd', text: 'Weak, because nothing is guaranteed', isCorrect: false },
        ],
        explanation: 'For induction the yardstick is strength, not validity. Strong premises make the conclusion likely; add true premises and it becomes cogent.',
      },
    },
    {
      type: 'question',
      prompt: 'You call a strong inductive argument "invalid" because its conclusion isn\'t guaranteed. Right?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'No — "valid" is the wrong ruler for induction', isCorrect: true },
          { id: 'b', text: 'Yes — no guarantee means invalid', isCorrect: false },
          { id: 'c', text: 'Yes — only deductions can be valid, so it\'s invalid', isCorrect: false },
          { id: 'd', text: 'Yes — likely isn\'t certain, so it fails', isCorrect: false },
        ],
        explanation: 'Validity only grades deductions. Judging induction by it is a category mistake — use strong or weak instead.',
      },
    },
    {
      type: 'summary',
      title: 'Strong & Weak Unlocked',
      keyPoints: [
        'Deductive: premises meant to guarantee',
        'Inductive: premises meant to make likely',
        'Strong is to induction what valid is to deduction',
        'Strong plus true premises is cogent',
      ],
      closingThought: 'Inductive strength is defeasible — new evidence can topple it; deductive validity can\'t.',
    },
  ],
};

export default lesson;
