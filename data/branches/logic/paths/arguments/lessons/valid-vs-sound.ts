import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'logic-arguments-3',
  slug: 'how-arguments-work',
  title: 'Valid vs Sound',
  description: 'Validity is structure. Soundness is structure plus true premises.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'A perfectly logical argument can still be dead wrong.',
      subtext: 'Flawless structure isn\'t enough. You also need true premises.',
      emoji: '🔒',
    },
    {
      type: 'concept',
      title: 'Validity vs Soundness',
      body: 'Two tests, never confuse them. An argument is VALID when its form makes true premises plus a false conclusion impossible. It is SOUND when it is valid AND the premises are actually true.',
      visual: '⚙️',
      highlight: 'valid AND true',
    },
    {
      type: 'example',
      title: 'Valid but Absurd',
      scenario: 'All toasters are gold. All gold things are time machines. So all toasters are time machines. The form is flawless — perfectly VALID — yet the conclusion is false because the premises are.',
      source: 'Internet Encyclopedia of Philosophy, "Validity and Soundness"',
      emoji: '🍞',
    },
    {
      type: 'quote',
      id: 'lq-logic-arguments-3',
      quote: 'Mathematics may be defined as the subject in which we never know what we are talking about, nor whether what we are saying is true.',
      author: 'Bertrand Russell',
      era: '1901',
      work: 'Mysticism and Logic',
    },
    {
      type: 'question',
      prompt: 'An argument is VALID and its premises are actually TRUE. What is it?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Sound — the conclusion is guaranteed', isCorrect: true },
          { id: 'b', text: 'Valid, but the conclusion could still be false', isCorrect: false },
          { id: 'c', text: 'Only probably right, like a guess', isCorrect: false },
          { id: 'd', text: 'Still missing some evidence', isCorrect: false },
        ],
        explanation: 'Valid form plus true premises equals SOUND, and a sound argument\'s conclusion must be true.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Validity tests the form. Soundness tests form and facts.',
      body: 'A valid argument can reach a false conclusion if a premise is false. To resist a valid argument, reject a premise — you can\'t attack the logic.',
      emoji: '💡',
    },
    {
      type: 'question',
      prompt: 'An argument reaches a TRUE conclusion. Does that make the argument valid?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'No — a true conclusion can follow from broken logic', isCorrect: true },
          { id: 'b', text: 'Yes — a true conclusion proves the form works', isCorrect: false },
          { id: 'c', text: 'Yes — that makes it sound, so also valid', isCorrect: false },
          { id: 'd', text: 'Only if the conclusion is obviously true', isCorrect: false },
        ],
        explanation: 'Validity is about the form, not the conclusion. "Grass is green, so the sky is blue" has a true conclusion but no valid link.',
      },
    },
    {
      type: 'summary',
      title: 'Valid vs Sound',
      keyPoints: [
        'Valid: form blocks true premises, false conclusion',
        'Sound: valid plus actually true premises',
        'A valid argument can reach a false conclusion',
        '"Valid" means structure, never "true"',
      ],
      closingThought: 'Spot the difference, and bad arguments stop fooling you.',
    },
  ],
};

export default lesson;
