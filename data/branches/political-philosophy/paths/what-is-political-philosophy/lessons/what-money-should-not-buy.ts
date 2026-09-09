import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'political-political-40',
  slug: 'what-money-should-not-buy',
  title: 'What Money Should Not Buy',
  description: 'Some things are wrong to sell even when both sides are willing and nobody is short of cash. The reason is not fairness.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Two willing people, a fair price, and still wrong.',
      subtext: 'Selling a vote is not unfair. It is something else.',
      emoji: '🏷️',
    },
    {
      type: 'concept',
      title: 'The Second Objection',
      body: 'The old complaint about markets is unfairness: people bargain from unequal positions, so the deal is not really free. There is a second complaint underneath it. Some goods are altered by being priced, so what the buyer ends up holding is no longer the thing they wanted.',
      visual: '⚖️',
      highlight: 'altered by being priced',
    },
    {
      type: 'example',
      title: 'Paying to Stand',
      scenario: 'Line-standing companies will hold your place for a congressional hearing or a doctor. Everybody involved agrees, and the arrangement is efficient. But a queue was a place where turning up early was what counted, and once places are sold it is a market wearing a queue\'s shape.',
      source: 'the case against line-standing',
    },
    {
      type: 'quote',
      id: 'lq-political-political-40',
      quote: 'Every social good or set of goods constitutes, as it were, a distributive sphere within which only certain criteria and arrangements are appropriate.',
      author: 'Michael Walzer',
      era: '1983',
    },
    {
      type: 'question',
      prompt: 'What does this argument add to the older complaint about markets?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'A sale can spoil the good being sold', isCorrect: true },
          { id: 'b', text: 'Bargaining power is unequal', isCorrect: false },
          { id: 'c', text: 'Markets waste resources', isCorrect: false },
          { id: 'd', text: 'Prices are hard to set correctly', isCorrect: false },
        ],
        explanation: 'That a sale can spoil the thing. Unfairness was already the old objection, and it is answered by making people richer — which does nothing here, since a wealthy person selling their vote is still selling their vote. Waste is an argument for markets, not against them.',
      },
    },
    {
      type: 'question',
      prompt: 'Where does a bought place at the front of a queue belong?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Sellable, but then it stops being a queue', isCorrect: true },
          { id: 'b', text: 'Sellable — a queue is just one way of rationing', isCorrect: false },
          { id: 'c', text: 'Never sellable, whatever the circumstances', isCorrect: false },
          { id: 'd', text: 'Sellable only when the wait is short', isCorrect: false },
        ],
        explanation: 'It sells, and the selling changes it. Calling a queue mere rationing throws away the thing that makes it a queue, which is that time is the only currency in it. And an outright ban is more than the argument needs — this is a case for naming what you lose, not for a rule.',
      },
    },
    {
      type: 'summary',
      title: 'Spheres',
      keyPoints: [
        'Unfairness is not the only objection to a market',
        'Pricing a good can change what the good is',
        'Walzer kept each good inside its own sphere',
        'The test is what survives the sale, not who profits',
      ],
      closingThought: 'This does not settle any particular case. It gives you the second question to ask, after the one about who could afford it.',
    },
  ],
};

export default lesson;
