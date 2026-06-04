import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'aesthetics-aesthetics-1',
  slug: 'why-things-feel-beautiful',
  title: 'Why Things Feel Beautiful',
  description: 'Beauty feels personal, yet we expect others to share it. Why?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Why does a sunset feel beautiful?',
      subtext: 'Beauty is something we feel instantly, but it is surprisingly hard to define.',
      emoji: '🌅',
    },
    {
      type: 'concept',
      title: 'What Is Aesthetic Pleasure?',
      body: 'Aesthetics is the study of beauty and art. The philosopher Kant noticed that the pleasure of beauty is different from other pleasures. You do not enjoy a sunset because it feeds you or earns you anything. You just enjoy how it looks. He called this "disinterested" pleasure: enjoyment without any need behind it.',
      visual: '✨',
      highlight: 'disinterested pleasure',
    },
    {
      type: 'concept',
      title: 'Beauty vs. Taste',
      body: 'Liking chocolate is a matter of taste. It is personal, and nobody expects you to agree about it. But calling a painting beautiful is different. When you say "this is beautiful," you are not only reporting what you like. You seem to be saying others should find it beautiful too.',
      visual: '🎭',
      highlight: 'universal validity',
    },
    {
      type: 'example',
      title: 'Kant at the Museum',
      scenario: 'Kant pointed out that we argue about art differently than we argue about food. Nobody says "you are wrong to dislike olives." Taste is just taste. But we do say "you are missing something" if someone calls a great symphony just noise. Beauty makes a stranger demand: it asks others to agree.',
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
          { id: 'a', text: 'It is disinterested — it does not come from any need', isCorrect: true },
          { id: 'b', text: 'It lasts longer than bodily pleasure', isCorrect: false },
          { id: 'c', text: 'It applies only to visual art', isCorrect: false },
          { id: 'd', text: 'It can only be felt after training', isCorrect: false },
        ],
        explanation: 'For Kant, aesthetic pleasure is "disinterested." You do not enjoy beauty because it satisfies hunger or desire. It serves no purpose for you, and that is exactly what sets it apart from other pleasures.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Beauty quietly expects others to agree.',
      body: 'This is the puzzle at the center of aesthetics. Beauty feels personal, but we treat it as more than personal. You rarely stop at "I like this." You say "this is beautiful," which sounds like a claim about the thing itself. Philosophy asks why we talk this way.',
      emoji: '🔭',
    },
    {
      type: 'question',
      prompt: 'When you call something beautiful, you are claiming others should agree. True or false?',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: true,
        explanation: 'Kant said judgments of beauty have "universal validity." Unlike personal taste, they seem to ask everyone to agree, even though no argument can force it. We feel the claim rather than prove it.',
      },
    },
    {
      type: 'summary',
      title: 'Beauty: Personal Yet Universal',
      keyPoints: [
        'Aesthetic pleasure is disinterested — it comes from no need',
        'Beauty seems to expect agreement; taste does not',
        'That tension is where aesthetics begins',
      ],
      closingThought: 'Aesthetics asks what beauty is, and why it expects us to share it.',
    },
  ],
};

export default lesson;
