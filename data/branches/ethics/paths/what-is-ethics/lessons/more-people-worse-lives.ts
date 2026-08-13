import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'ethics-ethics-34',
  slug: 'more-people-worse-lives',
  title: 'More People, Worse Lives?',
  description: 'Add enough barely-worth-living lives and the total beats any paradise.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'A huge population, each life barely worth living.',
      subtext: 'By the arithmetic, that beats a small paradise.',
      emoji: '👥',
    },
    {
      type: 'concept',
      title: 'The Repugnant Conclusion',
      body: 'If what matters is the total amount of good in a world, then a big enough population of lives only just worth living adds up to more than any smaller population of wonderful ones. Derek Parfit could not accept that and could not refute it either.',
      visual: '📊',
      highlight: 'Total, not average',
    },
    {
      type: 'example',
      title: 'Why Averaging Does Not Save You',
      scenario: 'Switch to average wellbeing instead and a new problem arrives: a world of one ecstatic person now beats a world of billions who are merely very happy. Every fix so far has traded one unacceptable result for another.',
      source: 'Parfit, Reasons and Persons (1984)',
    },
    {
      type: 'quote',
      id: 'lq-ethics-ethics-34',
      quote: 'For any possible population of at least ten billion people, all with a very high quality of life, there must be some much larger imaginable population whose existence would be better, even though its members have lives that are barely worth living.',
      author: 'Derek Parfit',
      era: '1984',
    },
    {
      type: 'question',
      prompt: 'What drives the repugnant conclusion?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Judging a world by its total good, which more people can always increase', isCorrect: true },
          { id: 'b', text: 'The claim that a barely-worth-living life is a bad life', isCorrect: false },
          { id: 'c', text: 'Overpopulation making everyone poorer in practice', isCorrect: false },
          { id: 'd', text: 'The belief that we have a duty to create new people', isCorrect: false },
        ],
        explanation: 'It is the totalling that does it. A life barely worth living still contributes something positive, so enough of them out-sum any fixed population however good — and no step in that reasoning is obviously the wrong one.',
      },
    },
    {
      type: 'question',
      prompt: 'So does switching to average wellbeing fix it?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'No — averaging makes one ecstatic person beat billions of happy ones', isCorrect: true },
          { id: 'b', text: 'Yes, and it is now the standard solution', isCorrect: false },
          { id: 'c', text: 'Yes, because averages cannot be inflated by numbers', isCorrect: false },
          { id: 'd', text: 'No, because average and total always agree', isCorrect: false },
        ],
        explanation: 'Averaging is the obvious repair and it breaks somewhere else. It says a tiny blissful world beats an enormous very good one, and that adding a happy person can be wrong because they drag the mean down. Forty years of proposals have all had a version of this problem.',
      },
    },
    {
      type: 'summary',
      title: 'The Arithmetic Nobody Likes',
      keyPoints: [
        'Totalling good makes numbers substitute for quality',
        'Enough barely-good lives out-sum any paradise',
        'Averaging swaps it for an equally strange result',
        'Parfit rejected the conclusion and could not refute it',
      ],
      closingThought: 'It is a genuinely open problem. Any theory of how good a world is has to say something here, and none of the answers is comfortable.',
    },
  ],
};

export default lesson;
