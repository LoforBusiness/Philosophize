import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'political-political-32',
  slug: 'why-vote-at-all',
  title: 'Why Vote At All?',
  description: 'Your one mark will not decide the election. Something else is going on.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Your vote will not decide this. Go anyway?',
      subtext: 'The odds of being the deciding vote are worse than most lotteries.',
      emoji: '🗳️',
    },
    {
      type: 'concept',
      title: 'The Paradox of Voting',
      body: 'Voting costs you time. Its benefit, on the usual reckoning, is the chance you change the result multiplied by how much that matters. In any real election the first number is so close to zero that the whole product vanishes — yet people vote.',
      visual: '📊',
      highlight: 'The expected payoff rounds to nothing',
    },
    {
      type: 'example',
      title: 'What a Vote Does Do',
      scenario: 'Deciding the outcome is not the only effect a mark has. It moves the margin by exactly one, every time, without fail — and margins decide mandates, funding, which seats get fought next time, and whether a party changes course.',
      source: 'Instrumental and expressive accounts',
    },
    {
      type: 'quote',
      id: 'lq-political-political-32',
      quote: 'The punishment which the wise suffer who refuse to take part in government, is to live under the government of worse men.',
      author: 'Plato',
      era: 'c. 375 BC',
    },
    {
      type: 'question',
      prompt: 'What does one mark reliably change?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The margin, by exactly one', isCorrect: true },
          { id: 'b', text: 'The result', isCorrect: false },
          { id: 'c', text: 'Nothing at all', isCorrect: false },
          { id: 'd', text: 'The turnout figure, which is all anyone reports', isCorrect: false },
        ],
        explanation: 'A single mark almost never decides who wins, so B overstates it and C understates it. The margin moves by one every single time, and margins do a great deal of the work that elections do.',
      },
    },
    {
      type: 'question',
      prompt: 'So is it rational to vote?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Yes — the case rests on what a vote reliably does, not on its chance of deciding', isCorrect: true },
          { id: 'b', text: 'No — the chance of deciding is near zero, so the cost is wasted', isCorrect: false },
          { id: 'c', text: 'Yes — a tiny chance of a huge outcome makes it the highest-value act available', isCorrect: false },
          { id: 'd', text: 'Yes — because if nobody voted, democracy would collapse', isCorrect: false },
        ],
        explanation: 'D is the classic slip: what everyone else does is already fixed, so "if nobody voted" was never your choice. C over-reaches, since the odds only work under assumptions about closeness that rarely hold.',
      },
    },
    {
      type: 'summary',
      title: 'One Mark, Reliably',
      keyPoints: [
        'Deciding an election is not what a vote is for',
        'A mark moves the margin by one, without fail',
        '"If nobody voted" is not a choice anyone faces',
        'Some acts are worth doing for what they express',
      ],
      closingThought: 'You are not one person deciding an election. You are one person deciding what the number says.',
    },
  ],
};

export default lesson;
