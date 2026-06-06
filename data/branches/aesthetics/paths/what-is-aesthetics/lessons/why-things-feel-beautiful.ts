import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'aesthetics-aesthetics-1',
  slug: 'why-things-feel-beautiful',
  title: 'Why Things Feel Beautiful',
  description: 'Beauty hits instantly — yet we demand others feel it too. Why?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Why does a sunset feel beautiful?',
      subtext: 'It strikes you in a heartbeat. Defining it could take a lifetime.',
      emoji: '🌅',
    },
    {
      type: 'concept',
      title: 'Disinterested Pleasure',
      body: 'Aesthetics is the philosophy of beauty and art. Immanuel Kant spotted something strange: beauty pleases without wanting anything from you. You crave food because you are hungry. But the sunset feeds no hunger and earns no profit — you simply savor how it looks. Kant called this "disinterested" pleasure: delight free of every desire.',
      visual: '✨',
      highlight: 'disinterested pleasure',
    },
    {
      type: 'concept',
      title: 'The Riddle of Taste',
      body: 'David Hume noticed a paradox. Beauty lives in the eye of the beholder — yet we still rank a master painter above a clumsy one and feel we are right. So is taste pure opinion, or is there a real standard? Hume hunted for one in skilled, practiced critics whose verdicts converge over time.',
      visual: '🎭',
      highlight: 'standard of taste',
    },
    {
      type: 'example',
      title: 'The Antinomy of Taste',
      scenario: 'Kant caught beauty in a contradiction he named the "antinomy of taste." Side one: there is no arguing about taste, since beauty is just a feeling. Side two: we argue about it constantly, insisting a great symphony truly is beautiful. Kant says both are true — beauty is felt, yet it speaks as if it binds everyone.',
      source: 'Immanuel Kant, Critique of the Power of Judgment (1790)',
      emoji: '🏛️',
    },
    {
      type: 'question',
      prompt: 'According to Kant, what makes aesthetic pleasure different from the pleasure of eating?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'It is disinterested — it springs from no desire or need', isCorrect: true },
          { id: 'b', text: 'It lasts longer than bodily pleasure', isCorrect: false },
          { id: 'c', text: 'It applies only to visual art', isCorrect: false },
          { id: 'd', text: 'It can only be felt after formal training', isCorrect: false },
        ],
        explanation: 'For Kant, aesthetic pleasure is "disinterested." Beauty satisfies no hunger and serves no purpose for you — you enjoy the thing for its own sake. That freedom from desire is exactly what separates it from eating or any bodily pleasure.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Beauty speaks as if it commands.',
      body: 'Here is the engine of aesthetics. You rarely stop at "I like this." You say "this is beautiful" — a claim that sounds like it is about the thing, not just you. Kant called this its "universal validity": beauty quietly demands that everyone agree, even when no proof can settle it.',
      emoji: '🔭',
    },
    {
      type: 'question',
      prompt: 'When you call something beautiful, you are claiming others should agree. True or false?',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: true,
        explanation: 'Kant held that judgments of beauty carry "universal validity." Unlike private taste, they reach out and ask everyone to agree — yet no argument can force the agreement. We feel the claim binding us rather than prove it.',
      },
    },
    {
      type: 'summary',
      title: 'Beauty: Personal Yet Universal',
      keyPoints: [
        'Kant: aesthetic pleasure is disinterested, free of need',
        'Hume hunted a real standard of taste',
        'Beauty is felt, yet demands agreement',
      ],
      closingThought: 'Aesthetics asks what beauty is — and why it dares to speak for us all.',
    },
  ],
};

export default lesson;
