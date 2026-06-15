import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'logic-arguments-22',
  slug: 'categorical-logic-all-some-none',
  title: 'All, Some, and None',
  description: 'Aristotle\'s oldest logic machine: the four categorical statements and how they oppose each other.',
  estimatedMinutes: 6,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: '"All swans are white" was true for two thousand years.',
      subtext: 'Then one black swan in Australia broke it. To break an "all", you need only one "some".',
      emoji: '🦢',
    },
    {
      type: 'concept',
      title: 'Four Ways to Quantify',
      body: 'Aristotle reduced reasoning about groups to four statement forms. All A are B. No A are B. Some A are B. Some A are not B. Almost every claim about categories — people, planets, primes — is one of these four in disguise.',
      visual: '🔢',
      highlight: 'four statement forms',
    },
    {
      type: 'concept',
      title: 'The Square of Opposition',
      body: '"All A are B" and "Some A are not B" are contradictories: exactly one is true. So are "No A are B" and "Some A are B". To refute a universal claim, you don\'t need an opposite universal — you need just one counterexample.',
      visual: '⬜',
      highlight: 'one counterexample',
    },
    {
      type: 'example',
      title: 'One Crow Too Many',
      scenario: 'A friend insists, "All politicians are liars." You don\'t need to prove the grand opposite, "No politicians are liars" — that\'s a harder, separate claim. You only need to point to a single honest politician. One real "some are not" example flips the universal "all" to false. The burden is tiny; the payoff is total.',
      emoji: '🐦‍⬛',
    },
    {
      type: 'quote',
      id: 'lq-logic-arguments-22-1',
      quote: 'It is the mark of an educated mind to rest satisfied with the degree of precision which the nature of the subject admits.',
      author: 'Aristotle',
      era: 'c. 350 BCE',
      work: 'Nicomachean Ethics',
      philosopherId: 'aristotle',
    },
    {
      type: 'question',
      prompt: 'Which single fact proves "All cats are black" false?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'One cat that is not black', isCorrect: true },
          { id: 'b', text: 'Proving "No cats are black"', isCorrect: false },
          { id: 'c', text: 'Most cats being grey or ginger', isCorrect: false },
          { id: 'd', text: 'Showing some cats are black', isCorrect: false },
        ],
        explanation: 'It\'s tempting to reach for the sweeping opposite, "No cats are black" — but that\'s a much stronger, separate claim. The contradictory of "all are" is just "some are not". A single non-black cat does it.',
      },
    },
    {
      type: 'question',
      prompt: 'True or false: "Some students passed" and "Some students did not pass" can both be true at once.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: true,
        explanation: 'These two are not contradictories — they\'re compatible. In a class where some passed and some failed, both are true together. Contradictories are "all passed" vs "some did not pass".',
      },
    },
    {
      type: 'summary',
      title: 'All, Some, and None',
      keyPoints: [
        'Four forms: all, none, some, some-are-not',
        'Contradictories: exactly one of the pair is true',
        'One counterexample refutes any universal claim',
        '"Some" and "some not" can both hold at once',
      ],
      closingThought: 'The cheapest way to win an argument: find the one example that breaks their "all".',
    },
  ],
};

export default lesson;
