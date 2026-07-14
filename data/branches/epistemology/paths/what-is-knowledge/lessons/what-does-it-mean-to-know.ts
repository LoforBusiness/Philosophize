import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'epistemology-knowledge-1',
  slug: 'what-does-it-mean-to-know',
  title: 'What Does It Mean to Know Something?',
  description: 'Meet epistemology and its recipe: justified true belief.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'You say you "know" it. But what is knowing?',
      subtext: 'Epistemology asks the question. Plato pressed it first, in the Theaetetus.',
      emoji: '💡',
    },
    {
      type: 'concept',
      title: 'Justified True Belief',
      body: 'Epistemology studies knowledge. The standard recipe has three parts: the claim is TRUE, you BELIEVE it, and you have JUSTIFICATION — solid reasons. Hit all three and you know. Miss one and you do not.',
      visual: '🧠',
      highlight: 'justified true belief',
    },
    {
      type: 'concept',
      title: 'Why Justification Matters',
      body: 'Strip the reasons and knowledge collapses. A true belief held for no reason is luck in disguise. Justification ties your belief to the truth on purpose, so being right is earned. No reasons, no knowing.',
      visual: '🔗',
      highlight: 'justification',
    },
    {
      type: 'example',
      title: 'Socrates Hunts for "Knowledge"',
      scenario: 'In Plato\'s Theaetetus, Socrates demolishes three definitions of knowledge. His sharpest case: a jury talked into a true verdict still does not KNOW — they never witnessed it. True belief, but no account. Truth alone is not enough.',
      source: 'Plato, Theaetetus, 201a–c (c. 369 BCE)',
      emoji: '🏛️',
    },
    {
      type: 'quote',
      id: 'lq-epistemology-knowledge-1-1',
      quote: 'What I do not know I do not think I know either.',
      author: 'Socrates (in Plato)',
      era: 'c. 399 BCE',
      work: 'Plato, Apology, 21d',
      philosopherId: 'socrates',
    },
    {
      type: 'question',
      prompt: 'In the standard analysis, which THREE things does genuine knowledge require?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'A true belief held for good reasons — justified true belief', isCorrect: true },
          { id: 'b', text: 'A belief felt with total confidence and conviction', isCorrect: false },
          { id: 'c', text: 'A belief shared by experts and the crowd alike', isCorrect: false },
          { id: 'd', text: 'Any belief that simply turns out correct', isCorrect: false },
        ],
        explanation: 'The recipe is justified true belief. Confidence and popularity are not justification, however convincing they feel.',
      },
    },
    {
      type: 'question',
      prompt: 'You are 100% certain it will rain tomorrow, and it does. Did you KNOW it would rain?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Yes — you were certain and you were right', isCorrect: false },
          { id: 'b', text: 'Yes — a true belief always counts as knowledge', isCorrect: false },
          { id: 'c', text: 'Only if good reasons, not just a feeling, backed the belief', isCorrect: true },
          { id: 'd', text: 'No — the future can never be known at all', isCorrect: false },
        ],
        explanation: 'Certainty is a feeling, not justification. Being right without solid reasons is luck, not knowledge.',
      },
    },
    {
      type: 'summary',
      title: 'Knowing vs. Believing',
      keyPoints: [
        'Epistemology is the study of knowledge',
        'The recipe: justified true belief',
        'Plato\'s Theaetetus demanded an account',
        'Justification turns luck into knowing',
      ],
      closingThought: 'Next time you say "I know," ask what justification actually backs it up.',
    },
  ],
};

export default lesson;
