import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'ethics-ethics-2',
  slug: 'everyday-moral-choices',
  title: 'Ethics Is Everywhere',
  description: 'From white lies to helping strangers — see how moral choices are woven into your everyday life.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'You made a moral choice before breakfast.',
      subtext: 'Ethics isn\'t a philosophy classroom topic — it\'s every decision you make.',
      emoji: '🌅',
    },
    {
      type: 'concept',
      title: 'Ethics Lives in the Ordinary',
      body: 'We tend to think ethics is about big dramatic dilemmas. But most moral action happens in small moments: telling a friend an uncomfortable truth, deciding whether to speak up when something feels wrong, choosing to help or walk past someone in need. Ethics is embedded in the texture of everyday life.',
      visual: '🗓️',
      highlight: 'everyday ethics',
    },
    {
      type: 'example',
      title: 'The Kind Lie',
      scenario: 'Your friend shows you their new painting. It\'s not very good. "What do you think?" they ask, beaming with pride. Do you tell them the truth — risking their feelings — or say it\'s wonderful? This tiny moment contains a genuine ethical tension: honesty vs. kindness. There\'s no obvious right answer, which is exactly why it\'s a moral question.',
      emoji: '🎨',
    },
    {
      type: 'question',
      prompt: 'Which scenario is an everyday ethical choice?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Deciding what to eat for breakfast', isCorrect: false },
          { id: 'b', text: 'Choosing whether to help someone who dropped their groceries', isCorrect: true },
          { id: 'c', text: 'Picking which TV show to watch', isCorrect: false },
          { id: 'd', text: 'Deciding what colour to paint your room', isCorrect: false },
        ],
        explanation: 'Helping (or not helping) someone in need involves a choice about how you should treat others — that\'s a moral question. The other choices are about preference, not right and wrong.',
      },
    },
    {
      type: 'example',
      title: 'The Bystander Moment',
      scenario: 'You\'re on a busy street. Someone drops their wallet and doesn\'t notice. Nobody else seems to care. Do you pick it up and return it? Every person who walked past already made a choice — even doing nothing is a choice. Ethics is inescapable: you are always either acting morally, immorally, or amorally.',
      emoji: '👝',
    },
    {
      type: 'concept',
      title: 'The Three Questions Ethics Asks',
      body: 'Every moral situation involves at least one of these: What should I do? What kind of person should I be? How should we treat each other? These aren\'t just abstract puzzles. They\'re the questions you navigate every day — with friends, strangers, colleagues, and yourself.',
      visual: '❓',
      highlight: 'three ethical questions',
    },
    {
      type: 'question',
      prompt: 'Is doing nothing in a moral situation still a moral choice?',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: true,
        explanation: 'Inaction is itself a choice with moral weight. When you walk past someone who needs help, you\'ve decided not to help — that decision can be evaluated ethically just like any action.',
      },
    },
    {
      type: 'summary',
      title: 'Ethics Is Already Your Life',
      keyPoints: [
        'Moral choices happen in small everyday moments',
        'Even inaction carries ethical weight',
        'Honesty and kindness can genuinely conflict',
        'Ethics asks: what should I do and be?',
      ],
      closingThought: 'You\'re already doing ethics — now you\'re doing it consciously.',
    },
  ],
};

export default lesson;
