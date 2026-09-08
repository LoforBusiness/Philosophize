import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'ethics-ethics-38',
  slug: 'why-your-own-child-comes-first',
  title: 'Why Your Own Child Comes First',
  description: 'Every moral theory says to count people equally. Almost nobody lives that way, and the reason is not a failure of nerve.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Two children are drowning. One is yours.',
      subtext: 'Does the fact that she is yours count for anything?',
      emoji: '⚖️',
    },
    {
      type: 'concept',
      title: 'Partiality',
      body: 'Impartiality is the engine of modern ethics: one life weighs the same as any other, and who they are to you is not on the scale. Partiality is the claim that a tie to you is itself a reason, not a bias to be corrected.',
      visual: '🤝',
      highlight: 'a tie to you is itself a reason',
    },
    {
      type: 'example',
      title: 'One Thought Too Many',
      scenario: 'A man can save one of two people from the water, and one is his wife. Bernard Williams grants that he saves her. What he will not grant is the reasoning: that she is his wife, and that in cases like this saving your wife is permitted. A marriage that needs the second half of that sentence is not the thing anyone was defending.',
      source: 'Bernard Williams, Moral Luck, 1981',
    },
    {
      type: 'quote',
      id: 'lq-ethics-ethics-38',
      quote: 'This construction provides the agent with one thought too many.',
      author: 'Bernard Williams',
      era: '1981',
      philosopherId: 'bernard-williams',
    },
    {
      type: 'question',
      prompt: 'Which reason may an impartial rule NOT accept?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'She is mine', isCorrect: true },
          { id: 'b', text: 'She is nearer, so I can actually reach her', isCorrect: false },
          { id: 'c', text: 'More good will come of saving her', isCorrect: false },
          { id: 'd', text: 'She will drown first', isCorrect: false },
        ],
        explanation: 'Only the first names a relation to you. Nearness and expected good are facts anybody could weigh from the outside, and so is who is running out of time. That is the test: could a stranger doing the sums use this reason too?',
      },
    },
    {
      type: 'question',
      prompt: 'What does the partialist actually claim?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'A tie is a reason, and needs no licence from a rule', isCorrect: true },
          { id: 'b', text: 'Strangers do not matter morally', isCorrect: false },
          { id: 'c', text: 'Feelings always beat arguments', isCorrect: false },
          { id: 'd', text: 'Ethics has no place in a family', isCorrect: false },
        ],
        explanation: 'The claim is about standing, not about strangers. Nobody says a stranger counts for nothing; the claim is that you do not have to look up a permission before pulling your own child out of the water. Say a stranger has no weight at all and you have left the argument behind.',
      },
    },
    {
      type: 'summary',
      title: 'A Thumb on the Scale',
      keyPoints: [
        'Impartial rules weigh a life without asking whose it is',
        'A tie to you is the one reason they cannot take',
        'Most people act on it anyway, and defend it',
        'Needing a rule to permit it is the odd part',
      ],
      closingThought: 'The interesting question is not whether you would save your own. It is what you think you are doing when you do — obeying a permission, or acting on the tie itself.',
    },
  ],
};

export default lesson;
