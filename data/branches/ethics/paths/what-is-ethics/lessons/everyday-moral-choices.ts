import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'ethics-ethics-2',
  slug: 'everyday-moral-choices',
  title: 'Three Lenses on a Small Choice',
  description: 'Point outcome-thinking, duty-thinking, and character-thinking at one ordinary choice — a white lie, a found wallet — and watch three different verdicts appear.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'You find a wallet on the pavement. Now what?',
      subtext: 'The same small choice gets three different verdicts — from outcomes, duty, and character.',
      emoji: '⚖️',
    },
    {
      type: 'concept',
      title: 'Three Working Tools',
      body: 'Ethics hands you three lenses, not three religions. Consequentialism asks what results an act produces. Deontology asks what duty it answers to. Virtue ethics asks who the act makes you. Most of us quietly blend all three. Used well, they are tools for thinking a choice through — not teams to pick.',
      visual: '🔭',
      highlight: 'three lenses',
    },
    {
      type: 'example',
      title: 'Mill: Did It Make Life Go Better?',
      scenario: 'Tempted by a white lie to spare a friend\'s feelings? John Stuart Mill\'s test in Utilitarianism (1863) is the result: acts are right "in proportion as they tend to promote happiness." He weighs everyone\'s happiness equally — and rates richer pleasures higher: "better to be Socrates dissatisfied than a fool satisfied." Mill leans on settled rules too, but outcomes have the final say.',
      emoji: '😊',
    },
    {
      type: 'question',
      prompt: 'Returning the found wallet, a consequentialist asks which question first?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Is keeping it a rule I could will everyone to follow?', isCorrect: false },
          { id: 'b', text: 'Which choice produces the most overall happiness?', isCorrect: true },
          { id: 'c', text: 'What would an honest person do here?', isCorrect: false },
          { id: 'd', text: 'Does the law require me to return it?', isCorrect: false },
        ],
        explanation: 'Consequentialism weighs results — whose happiness rises or falls. The universalizing question is Kant\'s, the honest-person question is Aristotle\'s, and the law is not the same as morality.',
      },
    },
    {
      type: 'example',
      title: 'Kant: Could Everyone Do This?',
      scenario: 'Kant ignores the wallet\'s happy ending. In his Groundwork of the Metaphysics of Morals (1785) the categorical imperative says: act only on a maxim you could will to become a universal law. "Keep wallets you find" self-destructs — if everyone did it, trust in returning things would collapse. And never treat the owner "merely as a means." For Kant, duty holds even when lying would smooth things over.',
      emoji: '🧭',
    },
    {
      type: 'concept',
      title: 'Aristotle: Who Am I Becoming?',
      body: 'Virtue ethics asks not "what do I do?" but "who do I become?" In the Nicomachean Ethics, Aristotle aims at eudaimonia — a flourishing life — built through habit. Each honest act makes honesty easier next time. Many virtues sit as a mean relative to us, like courage between cowardice and rashness. But not all: he says some acts, like theft, are simply wrong, with no good middle.',
      visual: '🌱',
      highlight: 'eudaimonia',
    },
    {
      type: 'question',
      prompt: 'Hume warned: "X is what people naturally do" can never, by itself, prove "X is right."',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: true,
        explanation: 'In his Treatise of Human Nature (1739–40), Hume noticed writers slip from "is" to "ought" with no bridge — later nicknamed the is–ought gap. He was no nihilist: he thought morality grows from feeling. But facts alone never settle what we ought to do.',
      },
    },
    {
      type: 'summary',
      title: 'One Choice, Three Lenses',
      keyPoints: [
        'Outcomes: ask what result helps most (Mill)',
        'Duty: ask if your maxim could be universal (Kant)',
        'Character: ask who the act makes you (Aristotle)',
        'Spot the is–ought gap: "natural" never proves "right"',
      ],
      closingThought: 'The lenses rarely agree — and the disagreement is exactly where real thinking starts.',
    },
  ],
};

export default lesson;
