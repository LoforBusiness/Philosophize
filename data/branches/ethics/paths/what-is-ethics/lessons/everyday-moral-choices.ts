import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'ethics-ethics-2',
  slug: 'everyday-moral-choices',
  title: 'Ethics Is Everywhere',
  description: 'Most ethics happens in ordinary moments, not big dramatic ones. This lesson shows how everyday choices are moral choices.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'You made a moral choice before breakfast.',
      subtext: 'Ethics is not just for classrooms. It shows up in your daily choices.',
      emoji: '🌅',
    },
    {
      type: 'concept',
      title: 'Ethics Lives in the Ordinary',
      body: 'We tend to picture ethics as huge, dramatic dilemmas. But most moral choices are small and everyday: telling a friend an honest truth, speaking up when something seems wrong, stopping to help instead of walking past. These ordinary moments are where most of your moral life actually happens.',
      visual: '🗓️',
      highlight: 'everyday ethics',
    },
    {
      type: 'example',
      title: 'The Kind Lie',
      scenario: 'A friend proudly shows you their new painting. Honestly, it is not very good. "What do you think?" they ask. Do you tell the truth and hurt them, or say something nice that is not true? This is a real conflict between honesty and kindness. The fact that there is no easy answer is what makes it a moral question.',
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
        explanation: 'Helping or not helping another person affects them, so it is a choice about right and wrong. The other options are matters of personal taste, not morality.',
      },
    },
    {
      type: 'example',
      title: 'The Bystander Moment',
      scenario: 'On a busy street, a stranger drops their wallet and keeps walking, unaware. No one else seems to notice. Do you call out, or stay quiet? Everyone nearby has already made a choice, because doing nothing is also a choice. In moments like this you are either helping, ignoring, or looking away.',
      emoji: '👝',
    },
    {
      type: 'concept',
      title: 'The Three Questions Ethics Asks',
      body: 'Most moral situations come down to one of three questions: What should I do? What kind of person should I be? How should we treat each other? These are not just abstract puzzles. You answer them all day, in how you act with friends, strangers, and yourself.',
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
        explanation: 'Doing nothing is still a choice. Walking past someone who needs help is a decision not to help, and that can be judged as right or wrong like any other action.',
      },
    },
    {
      type: 'summary',
      title: 'Ethics Is Already Your Life',
      keyPoints: [
        'Moral choices happen in small, ordinary moments',
        'Doing nothing is still a choice',
        'Honesty and kindness can conflict',
        'Ethics asks what you should do and be',
      ],
      closingThought: 'You make moral choices every day. Ethics is paying attention to them.',
    },
  ],
};

export default lesson;
