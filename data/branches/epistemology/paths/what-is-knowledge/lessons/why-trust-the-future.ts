import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'epistemology-knowledge-7',
  slug: 'why-trust-the-future',
  title: 'Why Should the Future Resemble the Past?',
  description: 'Hume\'s problem of induction: science\'s deepest assumption, and its crack.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'The sun rose today. Will it rise tomorrow?',
      subtext: 'You feel sure. Hume asks what gives you the right to be.',
      emoji: '🌅',
    },
    {
      type: 'concept',
      title: 'Induction',
      body: 'Induction reasons from observed cases to unobserved ones. Every swan you saw was white, so all swans are white. Science runs on this leap — from past patterns to future predictions.',
      visual: '🦢',
      highlight: 'induction',
    },
    {
      type: 'concept',
      title: 'Hume\'s Problem',
      body: 'Why expect the future to match the past? Only because it always has. But that uses the past to justify trusting the past — circular reasoning. Induction cannot be proven by logic.',
      visual: '🔁',
      highlight: 'the problem of induction',
    },
    {
      type: 'quote',
      id: 'lq-epistemology-knowledge-7-1',
      quote: 'Custom, then, is the great guide of human life.',
      author: 'David Hume',
      era: '1748',
      work: 'An Enquiry Concerning Human Understanding',
    },
    {
      type: 'example',
      title: 'Russell\'s Chicken',
      scenario: 'A chicken is fed every morning and grows sure the farmer is its friend. Each feeding confirms the rule — until the day the farmer wrings its neck instead. More of the same is no guarantee of the same.',
      source: 'Bertrand Russell, The Problems of Philosophy (1912)',
      emoji: '🐔',
    },
    {
      type: 'question',
      prompt: 'What is Hume\'s problem of induction?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'We cannot logically prove the future will resemble the past', isCorrect: true },
          { id: 'b', text: 'The past is unknowable, so the future must be too', isCorrect: false },
          { id: 'c', text: 'Scientists make too many careless measurement errors', isCorrect: false },
          { id: 'd', text: 'Patterns in nature are random and never repeat', isCorrect: false },
        ],
        explanation: 'Induction assumes nature stays uniform, but that assumption itself rests only on past experience — which is circular.',
      },
    },
    {
      type: 'question',
      prompt: 'Hume showed induction is unprovable. So does he conclude we should stop relying on it?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Yes — a rational person abandons all inductive reasoning', isCorrect: false },
          { id: 'b', text: 'Yes — only deductive logic should ever guide belief', isCorrect: false },
          { id: 'c', text: 'No — we cannot help it; custom and habit make us expect the future to match', isCorrect: true },
          { id: 'd', text: 'No — because he secretly found a logical proof after all', isCorrect: false },
        ],
        explanation: 'Hume says induction has no logical proof, yet habit makes it unavoidable. We live by custom, not airtight reasoning.',
      },
    },
    {
      type: 'summary',
      title: 'The Crack Beneath Science',
      keyPoints: [
        'Induction leaps from past cases to future ones',
        'No logic guarantees the future fits the past',
        'Hume: habit, not proof, drives expectation',
        'Russell\'s chicken shows confirmation can mislead',
      ],
      closingThought: 'Science still works astonishingly well. Hume just reminds us its foundation is trust, not proof.',
    },
  ],
};

export default lesson;
