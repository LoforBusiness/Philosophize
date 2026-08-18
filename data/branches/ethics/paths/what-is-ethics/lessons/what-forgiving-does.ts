import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'ethics-ethics-36',
  slug: 'what-forgiving-does',
  title: 'What Forgiving Actually Does',
  description: 'Not forgetting, not excusing, not saying it was fine. So what is left?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: '"I forgive you" is the strangest sentence we say.',
      subtext: 'Nothing about the past has changed.',
      emoji: '🕊️',
    },
    {
      type: 'concept',
      title: 'Giving Up the Claim',
      body: 'Forgiving is not deciding the act was fine — that is excusing, and it needs the person not to have been fully responsible. It is holding them responsible and letting go of the resentment you are entitled to. The debt is cancelled, not disproved.',
      visual: '📕',
      highlight: 'cancelled, not disproved',
    },
    {
      type: 'example',
      title: 'Why It Has to Be Free',
      scenario: 'Forgiveness that is owed is not forgiveness. If an apology obliged you to forgive, the wrongdoer could compel it by apologising, and the person wronged would have lost the one thing left in their hands.',
      source: 'Butler, Sermons upon Human Nature (1726)',
    },
    {
      type: 'quote',
      id: 'lq-ethics-ethics-36',
      quote: 'Forgiveness is the forswearing of resentment on moral grounds.',
      author: 'Jeffrie Murphy',
      era: '1988',
    },
    {
      type: 'question',
      prompt: 'What separates forgiving from excusing?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Excusing denies full responsibility; forgiving accepts it and lets the resentment go', isCorrect: true },
          { id: 'b', text: 'Excusing is private and forgiving is spoken aloud', isCorrect: false },
          { id: 'c', text: 'Forgiving requires forgetting what happened', isCorrect: false },
          { id: 'd', text: 'Excusing is for small wrongs and forgiving for large ones', isCorrect: false },
        ],
        explanation: 'If they were not really responsible, there is nothing to forgive — you are correcting a mistaken verdict. Forgiveness needs the verdict to stand, which is why it is hard and why it means something.',
      },
    },
    {
      type: 'question',
      prompt: 'Why is a duty to forgive a problem?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'It would let the wrongdoer compel it, taking the last thing from the wronged', isCorrect: true },
          { id: 'b', text: 'Because duties never apply to feelings', isCorrect: false },
          { id: 'c', text: 'Because some acts are objectively unforgivable', isCorrect: false },
          { id: 'd', text: 'Because it would make apologies pointless', isCorrect: false },
        ],
        explanation: 'A gift you are obliged to give is a payment. If the right apology forced the outcome, forgiveness would become a transaction the wrongdoer could initiate — and the person wronged would hold nothing.',
      },
    },
    {
      type: 'summary',
      title: 'The Debt You Choose to Cancel',
      keyPoints: [
        'Forgiving is not excusing, and not forgetting',
        'It requires the wrong to stand as a wrong',
        'It is giving up resentment you are entitled to',
        'Owed forgiveness would not be forgiveness',
      ],
      closingThought: 'It changes nothing about what happened, which is exactly why it is the wronged person\'s to give and nobody else\'s to expect.',
    },
  ],
};

export default lesson;
