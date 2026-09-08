import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'epistemology-knowledge-39',
  slug: 'what-a-committee-knows',
  title: 'What a Committee Knows',
  description: 'Three judges, each of them perfectly consistent, can hand down a verdict that contradicts their own reasons.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Every judge is consistent. The court is not.',
      subtext: 'Nobody made a mistake, and the answer still comes out wrong.',
      emoji: '🧮',
    },
    {
      type: 'concept',
      title: 'The Doctrinal Paradox',
      body: 'A verdict often rests on two findings: there was a contract, and it was broken. Count each finding and a majority says yes to both. Count the verdict on its own and a majority says no. Same three people, same votes, two answers.',
      visual: '📋',
      highlight: 'Same three people, same votes, two answers',
    },
    {
      type: 'example',
      title: 'Three Judges',
      scenario: 'The first says there was a contract and it was broken, so liable. The second says there was a contract but it was not broken, so not liable. The third says it would have been broken but there was no contract, so not liable. Two of three say contract. Two of three say broken. Two of three say not liable.',
      source: 'the doctrinal paradox, from the law of judicial panels',
    },
    {
      type: 'quote',
      id: 'lq-epistemology-knowledge-39',
      quote: 'The many, of whom each individual is but an ordinary person, when they meet together may very likely be better than the few.',
      author: 'Aristotle',
      era: 'c. 350 BC',
      philosopherId: 'aristotle',
    },
    {
      type: 'question',
      prompt: 'What has gone wrong in the panel?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Nothing, in any one judge — the group is the inconsistent one', isCorrect: true },
          { id: 'b', text: 'One of the judges has contradicted themselves', isCorrect: false },
          { id: 'c', text: 'The majority was counted incorrectly', isCorrect: false },
          { id: 'd', text: 'The case was too hard to decide', isCorrect: false },
        ],
        explanation: 'Read any single row and it holds together perfectly. Read the bottom row and it does not. Consistency is a property of a set of judgements, and majority voting does not carry it from the rows to the total.',
      },
    },
    {
      type: 'question',
      prompt: 'Which repair keeps the group coherent?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Settle each reason by vote, then derive the verdict', isCorrect: true },
          { id: 'b', text: 'Vote on the verdict alone and ignore the reasons', isCorrect: false },
          { id: 'c', text: 'Require the judges to agree before ruling', isCorrect: false },
          { id: 'd', text: 'Let the senior judge decide', isCorrect: false },
        ],
        explanation: 'Voting on the reasons and deriving the verdict cannot produce a contradiction, because the derivation does the last step. It has a cost worth naming: the group can now hand down a verdict that a majority of its own members would have voted against.',
      },
    },
    {
      type: 'summary',
      title: 'The Bottom Row',
      keyPoints: [
        'A group verdict is built from its members, column by column',
        'Every member can be consistent and the total not',
        'Voting on reasons and on verdicts give different answers',
        'Which you count is a decision, not a detail',
      ],
      closingThought: 'Any committee you sit on is running one of these two procedures. It is worth knowing which, because it decides what the group is able to mean.',
    },
  ],
};

export default lesson;
