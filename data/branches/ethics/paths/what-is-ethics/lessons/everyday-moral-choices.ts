import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'ethics-ethics-2',
  slug: 'everyday-moral-choices',
  title: 'Three Lenses on a Small Choice',
  description: 'Point outcome, duty, and character thinking at one ordinary choice.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'You find a wallet on the pavement. Now what?',
      subtext: 'One small choice gets three verdicts: outcomes, duty, character.',
      emoji: '⚖️',
    },
    {
      type: 'concept',
      title: 'Three Working Tools',
      body: 'Ethics hands you three lenses, not three religions. Consequentialism asks what results an act produces. Deontology asks what duty it answers. Virtue ethics asks who it makes you. Most of us quietly blend all three.',
      visual: '🔭',
      highlight: 'three lenses',
    },
    {
      type: 'example',
      title: 'Mill: Did It Make Life Go Better?',
      scenario: "Tempted by a white lie to spare a friend's feelings? Mill's test in Utilitarianism (1863) is the result: acts are right as they tend to promote happiness. He weighs everyone equally and rates richer pleasures higher.",
      emoji: '😊',
    },
    {
      type: 'quote',
      id: 'lq-ethics-ethics-2-1',
      quote: 'Actions are right in proportion as they tend to promote happiness, wrong as they tend to produce the reverse of happiness.',
      author: 'John Stuart Mill',
      era: '1863',
      work: 'Utilitarianism',
    },
    {
      type: 'example',
      title: 'Kant: Could Everyone Do This?',
      scenario: "Kant ignores the happy ending. His categorical imperative: act only on a maxim you could will to be universal. \"Keep wallets you find\" self-destructs, since trust in returning things would collapse. Never treat the owner merely as a means.",
      emoji: '🧭',
    },
    {
      type: 'concept',
      title: 'Aristotle: Who Am I Becoming?',
      body: 'Virtue ethics asks not "what do I do?" but "who do I become?" Aristotle aims at eudaimonia, a flourishing life built through habit. Each honest act makes honesty easier next time.',
      visual: '🌱',
      highlight: 'eudaimonia',
    },
    {
      type: 'question',
      prompt: 'Returning the found wallet, which question does a consequentialist ask first?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Is keeping it a rule I could will everyone to follow?', isCorrect: false },
          { id: 'b', text: 'Which choice produces the most overall happiness?', isCorrect: true },
          { id: 'c', text: 'What would an honest person do here?', isCorrect: false },
          { id: 'd', text: 'Does the law require me to return it?', isCorrect: false },
        ],
        explanation: 'Consequentialism weighs results, whose happiness rises or falls. The universalizing question is Kant\'s, the honest-person question is Aristotle\'s, and law is not the same as morality.',
      },
    },
    {
      type: 'question',
      prompt: 'Almost everyone keeps small change they find, so keeping the wallet must be morally fine. Sound reasoning?',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: false,
        explanation: 'This is the is–ought gap Hume flagged in 1739: what people commonly do never, by itself, proves what is right.',
      },
    },
    {
      type: 'summary',
      title: 'One Choice, Three Lenses',
      keyPoints: [
        'Outcomes: ask what result helps most (Mill)',
        'Duty: ask if your maxim could be universal (Kant)',
        'Character: ask who the act makes you (Aristotle)',
        '"Natural" never proves "right" (the is–ought gap)',
      ],
      closingThought: 'The lenses rarely agree, and the disagreement is where real thinking starts.',
    },
  ],
};

export default lesson;
