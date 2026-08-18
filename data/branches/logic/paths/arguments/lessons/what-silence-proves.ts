import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'logic-arguments-36',
  slug: 'what-silence-proves',
  title: 'What Silence Proves',
  description: 'Absence of evidence is not evidence of absence. Except when it is.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'You searched the house. No elephant.',
      subtext: 'Now you know something.',
      emoji: '🔦',
    },
    {
      type: 'concept',
      title: 'It Depends How Hard You Looked',
      body: 'Finding nothing tells you something exactly when you would probably have found it had it been there. Search a small room for an elephant and the empty result is decisive. Search a forest for one beetle and it means almost nothing.',
      visual: '🔍',
      highlight: 'would you have found it?',
    },
    {
      type: 'example',
      title: 'The Slogan Misused',
      scenario: '"Absence of evidence is not evidence of absence" is true of a bad search and false of a good one. It has been used to defend claims about missing weapons, missing particles and missing side effects — in cases where people had looked hard and carefully.',
      source: 'Sagan, "The Demon-Haunted World" (1995)',
    },
    {
      type: 'quote',
      id: 'lq-logic-arguments-36',
      quote: 'Absence of evidence is evidence of absence, if the evidence should have been found.',
      author: 'Irving Copi',
      era: '1953',
    },
    {
      type: 'question',
      prompt: 'What makes an empty search informative?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'That the search would very likely have found the thing if it were there', isCorrect: true },
          { id: 'b', text: 'That the searcher was neutral about the outcome', isCorrect: false },
          { id: 'c', text: 'That the search lasted a long time', isCorrect: false },
          { id: 'd', text: 'That several people searched independently', isCorrect: false },
        ],
        explanation: 'Duration and headcount are proxies, and neutrality is about trusting the report rather than about what the result means. The load-bearing question is only ever whether you would have seen it.',
      },
    },
    {
      type: 'question',
      prompt: 'Someone says a drug has no rare side effect, citing a trial of forty people. What is wrong?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'A rare effect would probably not have shown up in forty people anyway', isCorrect: true },
          { id: 'b', text: 'Forty people cannot produce statistically valid results', isCorrect: false },
          { id: 'c', text: 'The trial should have been double-blinded', isCorrect: false },
          { id: 'd', text: 'Nothing is wrong — no evidence is no evidence', isCorrect: false },
        ],
        explanation: 'A one-in-a-thousand effect is invisible in forty people whether it exists or not. The silence there is exactly what you would hear either way, which is what makes it worth nothing.',
      },
    },
    {
      type: 'summary',
      title: 'How Hard Did You Look?',
      keyPoints: [
        'Empty results carry weight in proportion to the search',
        'A thorough search makes absence real evidence',
        'A token search makes it worth nothing',
        'The slogan is true of bad searches only',
      ],
      closingThought: 'The question is never "did they find it". It is "would they have", and that one has an answer you can usually work out.',
    },
  ],
};

export default lesson;
