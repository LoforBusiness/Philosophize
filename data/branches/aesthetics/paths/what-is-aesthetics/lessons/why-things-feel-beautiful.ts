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
      headline: 'Why does a sunset hush you, mid-sentence?',
      subtext: 'Beauty feels like your secret — yet strangers have felt it for centuries.',
      emoji: '🌅',
    },
    {
      type: 'concept',
      title: 'What Is Aesthetic Pleasure?',
      body: 'Kant called the pleasure of beauty disinterested. You do not love the sunset because it feeds you or earns you anything — you simply delight in how it appears. The wanting falls away. What remains is a quieter, freer joy: pleasure with no hunger underneath it.',
      visual: '✨',
      highlight: 'disinterested pleasure',
    },
    {
      type: 'concept',
      title: 'Beauty vs. Taste',
      body: 'Loving chocolate is taste — a private appetite, yours alone. But calling a painting beautiful reaches further. To say "this is beautiful" is not merely to report what pleases you; it is, somehow, to speak for others too, as if you had glimpsed something they ought to see as well.',
      visual: '🎭',
      highlight: 'universal validity',
    },
    {
      type: 'example',
      title: 'Kant at the Museum',
      scenario: 'Kant saw that we quarrel over art unlike how we quarrel over food. No one says "you are wrong to dislike olives" — mere appetite owes no defense. Yet we do say "you are missing something" when a Beethoven symphony is waved off as noise. Beauty, Kant noticed, makes a stranger demand: it asks everyone to agree.',
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
          { id: 'a', text: 'It is disinterested — unbound from any personal need', isCorrect: true },
          { id: 'b', text: 'It lingers longer than bodily pleasure', isCorrect: false },
          { id: 'c', text: 'It belongs to visual art alone', isCorrect: false },
          { id: 'd', text: 'It can only be felt after training', isCorrect: false },
        ],
        explanation: 'Kant\'s insight is that aesthetic pleasure is disinterested. You do not delight in beauty because it answers hunger, desire, or advantage. That very freedom from need is what gives the pleasure its strange purity.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you saw that beauty quietly demands agreement.',
      body: 'Here lies the paradox at the heart of aesthetics: beauty feels intimate, yet it always reaches outward. You rarely stop at "I enjoy this." You say "this is beautiful" — and in saying it, you beckon others to see what you see. Philosophy asks why that gesture feels so natural.',
      emoji: '🔭',
    },
    {
      type: 'question',
      prompt: 'When you call something beautiful, you are claiming others should agree. True or false?',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: true,
        explanation: 'Kant held that judgments of beauty carry what he called universal validity. Unlike mere taste, they quietly demand the assent of everyone — even though no argument or logic can compel it. The claim is felt, not proven.',
      },
    },
    {
      type: 'summary',
      title: 'Beauty: Personal Yet Universal',
      keyPoints: [
        'Aesthetic pleasure is disinterested — free of all need',
        'Beauty quietly claims agreement; mere taste does not',
        'This paradox is where aesthetics begins',
      ],
      closingThought: 'Each time you call something beautiful, you are already a philosopher.',
    },
  ],
};

export default lesson;
