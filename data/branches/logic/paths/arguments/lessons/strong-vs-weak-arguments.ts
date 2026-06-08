import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'logic-arguments-4',
  slug: 'strong-vs-weak-arguments',
  title: 'Strong Arguments vs Weak Arguments',
  description: 'Deductive arguments aim to guarantee the conclusion; inductive ones only make it likely. Strong and weak are the yardsticks for induction.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Some arguments prove. Others only bet on the odds.',
      subtext: 'Deduction aims to guarantee its conclusion. Induction only makes it probable. They get graded by different rulers.',
      emoji: '⚖️',
    },
    {
      type: 'concept',
      title: 'Two Families of Argument',
      body: 'A DEDUCTIVE argument means its premises to GUARANTEE the conclusion — we grade it valid or sound. An INDUCTIVE argument only means them to make the conclusion LIKELY — so we grade it STRONG (premises make the conclusion probable) or weak. Wrong ruler, wrong verdict.',
      visual: '🎲',
      highlight: 'STRONG',
    },
    {
      type: 'example',
      title: 'Guaranteed vs Likely',
      scenario: 'Deductive: "All men are mortal; Socrates is a man; so Socrates is mortal." If the premises hold, the conclusion CANNOT be false.\n\nInductive: "Most Greeks eat olives; Socrates is a Greek; so Socrates eats olives." Even with true premises, the conclusion is only probable — Socrates might be the rare Greek who hates olives.',
      emoji: '🫒',
      source: 'Internet Encyclopedia of Philosophy, "Deductive and Inductive Arguments" (Timothy Shanahan, 2022)',
    },
    {
      type: 'question',
      prompt: 'An inductive argument\'s premises make its conclusion likely. What is it?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Strong — induction\'s version of a valid argument', isCorrect: true },
          { id: 'b', text: 'Sound, since the premises support the conclusion', isCorrect: false },
          { id: 'c', text: 'Invalid, because the conclusion could still be false', isCorrect: false },
          { id: 'd', text: 'Weak, because nothing is guaranteed', isCorrect: false },
        ],
        explanation: 'For induction the yardstick is strength, not validity. A STRONG argument is one whose premises make the conclusion likely; add true premises and it becomes COGENT. Calling it "invalid" uses the wrong ruler entirely.',
      },
    },
    {
      type: 'summary',
      title: 'Strong & Weak Unlocked',
      keyPoints: [
        'Deductive: premises meant to guarantee the conclusion',
        'Inductive: premises meant to make it likely',
        'Strong is to induction what valid is to deduction',
        'Add true premises to a strong argument and it is cogent',
      ],
      closingThought: 'Inductive strength is defeasible — new evidence can topple it; deductive validity can\'t be touched.',
    },
  ],
};

export default lesson;
