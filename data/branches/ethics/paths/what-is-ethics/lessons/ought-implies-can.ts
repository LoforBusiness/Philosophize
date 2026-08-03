import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'ethics-ethics-31',
  slug: 'ought-implies-can',
  title: 'Nobody Owes the Impossible',
  description: 'Why an obligation cannot outrun what a person is able to do.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'You should have saved them. You were four miles away.',
      subtext: 'One of those sentences cancels the other, and it is not obvious which.',
      emoji: '🪜',
    },
    {
      type: 'concept',
      title: 'Ought Implies Can',
      body: 'Kant\'s principle: if you genuinely could not have done it, you were never obliged to. Duty is bounded by ability, so an obligation nobody could meet is not a demanding obligation — it is not an obligation at all.',
      visual: '⚖️',
      highlight: 'Duty cannot outrun ability',
    },
    {
      type: 'example',
      title: 'The Shelf',
      scenario: 'Told to fetch something from a shelf you cannot reach, you are not lazy or wicked when you fail. Add a ladder and the duty appears. Take the ladder away and it disappears again — and nothing about your character changed either time.',
      source: 'The principle in one object',
    },
    {
      type: 'quote',
      id: 'lq-ethics-ethics-31',
      quote: 'He judges that he can do something because he is aware that he ought to do it.',
      author: 'Immanuel Kant',
      era: '1788',
      work: 'Critique of Practical Reason',
      philosopherId: 'immanuel-kant',
    },
    {
      type: 'question',
      prompt: 'The shelf is genuinely out of reach. What has to give?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The obligation — it was never there to begin with', isCorrect: true },
          { id: 'b', text: 'Nothing; the duty stands and you have simply failed it', isCorrect: false },
          { id: 'c', text: 'Your ability — you should try harder to reach', isCorrect: false },
          { id: 'd', text: 'The blame shifts to whoever built the shelf', isCorrect: false },
        ],
        explanation: 'The trap is B, which sounds appropriately strict. But an unmeetable duty does no moral work: it cannot guide anyone, and blaming someone for it punishes them for the height of a shelf.',
      },
    },
    {
      type: 'question',
      prompt: 'What does the principle NOT excuse?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Being unable because of choices you made earlier', isCorrect: true },
          { id: 'b', text: 'Anything at all — inability always cancels duty', isCorrect: false },
          { id: 'c', text: 'Failing a duty that was physically impossible', isCorrect: false },
          { id: 'd', text: 'Failing a duty nobody told you about', isCorrect: false },
        ],
        explanation: 'The trap is B, the version that makes the principle a blanket excuse. A driver who cannot brake because they chose to drink is still answerable — the inability is real, and they authored it.',
      },
    },
    {
      type: 'summary',
      title: 'Nobody Owes the Impossible',
      keyPoints: [
        'An obligation cannot exceed what you can do',
        'Unmeetable duties guide nobody',
        'Give the ability and the duty reappears',
        'Inability you caused excuses nothing',
      ],
      closingThought: 'Before asking whether someone should have, ask whether they could have. The second question comes first.',
    },
  ],
};

export default lesson;
