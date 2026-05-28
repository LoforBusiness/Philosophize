import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'aesthetics-aesthetics-1',
  slug: 'why-things-feel-beautiful',
  title: 'Why Things Feel Beautiful',
  description: 'Discover why beauty feels both deeply personal and strangely universal.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Why does a sunset stop you in your tracks?',
      subtext: 'Beauty feels personal — yet strangers share it across centuries.',
      emoji: '🌅',
    },
    {
      type: 'concept',
      title: 'What Is Aesthetic Pleasure?',
      body: 'Kant argued that beauty triggers a special kind of pleasure — one that is disinterested. You are not enjoying the sunset because it feeds you or makes you money. You simply delight in how it appears. This pleasure feels free, untangled from need or desire.',
      visual: '✨',
      highlight: 'disinterested pleasure',
    },
    {
      type: 'concept',
      title: 'Beauty vs. Taste',
      body: 'Liking chocolate is taste — it satisfies a personal preference. But calling a painting beautiful feels like more than preference. When you say "this is beautiful," you seem to be claiming something others should agree with, not just reporting your own appetite.',
      visual: '🎭',
      highlight: 'universal validity',
    },
    {
      type: 'example',
      title: 'Kant at the Museum',
      scenario: 'Kant noticed that people argue about art differently from food. No one says "you\'re wrong to dislike olives" — that is just preference. But we do say "you\'re missing something" when someone dismisses a Beethoven symphony as noise. Kant called this the peculiar demand beauty makes: agreement from everyone.',
      source: 'Immanuel Kant, Critique of Judgment (1790)',
      emoji: '🏛️',
    },
    {
      type: 'question',
      prompt: 'According to Kant, what makes aesthetic pleasure different from enjoying food?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'It is disinterested — not tied to personal need', isCorrect: true },
          { id: 'b', text: 'It lasts longer than physical pleasure', isCorrect: false },
          { id: 'c', text: 'It only applies to visual art', isCorrect: false },
          { id: 'd', text: 'It requires training to experience', isCorrect: false },
        ],
        explanation: 'Kant\'s key insight is that aesthetic pleasure is disinterested — you are not enjoying beauty because it satisfies hunger, desire, or self-interest. That freedom from need is what makes it feel special.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you learned beauty demands universal agreement.',
      body: 'This is the paradox at the heart of aesthetics: beauty feels personal yet it reaches outward. You do not just say "I enjoy this" — you say "this is beautiful," inviting others to see what you see. Philosophy asks why that invitation feels so natural.',
      emoji: '🔭',
    },
    {
      type: 'question',
      prompt: 'When you call something beautiful, you are claiming others should agree. True or false?',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: true,
        explanation: 'Kant argued that judgments of beauty carry what he called "universal validity" — unlike taste preferences, they implicitly demand agreement from everyone, even though they are not based on logic.',
      },
    },
    {
      type: 'summary',
      title: 'Beauty: Personal Yet Universal',
      keyPoints: [
        'Aesthetic pleasure is disinterested — free from need',
        'Beauty judgments claim universal agreement, unlike taste',
        'This paradox is the starting point of aesthetics',
      ],
      closingThought: 'Every time you call something beautiful, you are doing philosophy.',
    },
  ],
};

export default lesson;
