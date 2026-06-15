import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'logic-arguments-21',
  slug: 'necessary-and-sufficient-conditions',
  title: 'Necessary vs Sufficient',
  description: 'Two words that look alike but pull in opposite directions: necessary and sufficient.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Oxygen lets fire burn. So why won\'t a match light in space?',
      subtext: 'Some conditions are required. Others are enough on their own. They are not the same thing.',
      emoji: '🔥',
    },
    {
      type: 'concept',
      title: 'Necessary Condition',
      body: 'A necessary condition must be present, or the thing can\'t happen — but it may not be enough by itself. Oxygen is necessary for fire: no oxygen, no flame. Yet oxygen alone, sitting in a quiet room, lights nothing.',
      visual: '🫁',
      highlight: 'must be present',
    },
    {
      type: 'concept',
      title: 'Sufficient Condition',
      body: 'A sufficient condition guarantees the result all by itself — though other routes might reach it too. Being beheaded is sufficient for death. It\'s not necessary, because there are countless other ways to die.',
      visual: '🗝️',
      highlight: 'guarantees the result',
    },
    {
      type: 'example',
      title: 'The Citizenship Test',
      scenario: 'To vote in a national election you must be a citizen — citizenship is necessary. But it isn\'t sufficient: a citizen who is twelve years old, or hasn\'t registered, still can\'t vote. To actually cast a ballot you need citizenship AND age AND registration. Each is necessary; only the whole bundle is sufficient.',
      emoji: '🗳️',
    },
    {
      type: 'question',
      prompt: '"If you scored 100%, you passed." Is scoring 100% necessary or sufficient for passing?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Sufficient — it guarantees a pass, but isn\'t required', isCorrect: true },
          { id: 'b', text: 'Necessary — you must score 100% to pass', isCorrect: false },
          { id: 'c', text: 'Both necessary and sufficient', isCorrect: false },
          { id: 'd', text: 'Neither — the statement says nothing about passing', isCorrect: false },
        ],
        explanation: 'Tempting to say "necessary" because 100% sounds like a hard demand. But the statement only says a perfect score guarantees passing — it never says it\'s required. You could pass with 80% too. So it\'s sufficient, not necessary.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Remember "if P, then Q" from earlier?',
      body: 'In a conditional "if P, then Q", the antecedent P is sufficient for Q, and Q is necessary for P. Spotting which is which keeps you from confusing "guarantees" with "requires" — the exact slip behind many bad arguments.',
      emoji: '➡️',
    },
    {
      type: 'summary',
      title: 'Necessary vs Sufficient',
      keyPoints: [
        'Necessary: must be there, but may not be enough',
        'Sufficient: enough on its own, but maybe not required',
        'A condition can be one, both, or neither',
        'In "if P then Q", P is sufficient, Q necessary',
      ],
      closingThought: 'Ask of any condition: does it guarantee, or merely require? You\'ll never confuse them again.',
    },
  ],
};

export default lesson;
