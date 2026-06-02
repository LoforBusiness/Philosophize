import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'ethics-ethics-2',
  slug: 'everyday-moral-choices',
  title: 'Ethics Is Everywhere',
  description: 'From small white lies to the stranger you choose to help — see how moral choices are quietly woven through your ordinary day.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'You made a moral choice before breakfast.',
      subtext: 'Ethics does not live in the lecture hall. It lives in everything you choose.',
      emoji: '🌅',
    },
    {
      type: 'concept',
      title: 'Ethics Lives in the Ordinary',
      body: 'We imagine ethics as grand dilemmas under bright lights. Yet most of the moral life unfolds in quiet, unremarkable moments: telling a friend a hard truth, finding the nerve to speak when something feels wrong, choosing to stoop and help rather than walk on by. Morality is stitched into the plain fabric of the everyday.',
      visual: '🗓️',
      highlight: 'everyday ethics',
    },
    {
      type: 'example',
      title: 'The Kind Lie',
      scenario: 'A friend holds up their new painting, beaming. It is, in truth, not very good. "What do you think?" they ask. Do you wound them with honesty, or warm them with a gentle untruth? In that small breath lives a real tension — honesty against kindness. The absence of an obvious answer is precisely what makes it a moral question.',
      emoji: '🎨',
    },
    {
      type: 'question',
      prompt: 'Which of these everyday moments is genuinely an ethical choice?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Deciding what to eat for breakfast', isCorrect: false },
          { id: 'b', text: 'Whether to help a stranger who has dropped their groceries', isCorrect: true },
          { id: 'c', text: 'Picking which show to watch tonight', isCorrect: false },
          { id: 'd', text: 'Choosing what colour to paint your room', isCorrect: false },
        ],
        explanation: 'To help, or not to help, another person in need is a decision about how we owe ourselves to one another — and that is the stuff of morality. The rest are matters of taste, not of right and wrong.',
      },
    },
    {
      type: 'example',
      title: 'The Bystander Moment',
      scenario: 'A crowded street. A stranger drops their wallet and walks on, unaware. No one else seems to notice, or to care. Do you call out, or let it lie? Each passerby has already chosen — for even doing nothing is a kind of doing. There is no escaping ethics: at every moment you are acting well, acting badly, or looking away.',
      emoji: '👝',
    },
    {
      type: 'concept',
      title: 'The Three Questions Ethics Asks',
      body: 'Beneath every moral moment lies one of three questions: What ought I to do? What kind of person should I become? How should we treat one another? These are not idle puzzles for armchairs. They are the questions you quietly answer all day long — with friends, with strangers, with yourself.',
      visual: '❓',
      highlight: 'three ethical questions',
    },
    {
      type: 'question',
      prompt: 'When you do nothing in a moral situation, you have still made a moral choice.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: true,
        explanation: 'To stand still is itself to choose, and the choice carries weight. Walking past someone who needs you is a decision not to help — and that, like any deed, can be weighed as right or wrong.',
      },
    },
    {
      type: 'summary',
      title: 'Ethics Is Already Your Life',
      keyPoints: [
        'Moral choices hide in small, ordinary moments',
        'Even standing still carries ethical weight',
        'Honesty and kindness can truly pull apart',
        'Ethics asks what you should do and be',
      ],
      closingThought: 'You were always doing ethics. Now you are doing it with open eyes.',
    },
  ],
};

export default lesson;
