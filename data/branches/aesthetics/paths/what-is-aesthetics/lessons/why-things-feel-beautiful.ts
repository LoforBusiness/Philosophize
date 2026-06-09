import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'aesthetics-aesthetics-1',
  slug: 'why-things-feel-beautiful',
  title: 'Why Things Feel Beautiful',
  description: 'Beauty hits as a feeling, yet we demand others feel it too.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Why does a sunset feel beautiful?',
      subtext: 'It strikes in a heartbeat. Explaining it could take a lifetime.',
      emoji: '🌅',
    },
    {
      type: 'concept',
      title: 'Disinterested Pleasure',
      body: 'Kant found beauty strange: it pleases without you wanting anything from the object. You crave food from hunger. A sunset feeds no need. You simply savor its look.',
      visual: '✨',
      highlight: 'disinterested pleasure',
    },
    {
      type: 'concept',
      title: 'The Riddle of Taste',
      body: 'Hume admitted beauty lives "merely in the mind." Yet we still rank a master above a hack and feel right. His fix: a standard set by true critics, refined over time.',
      visual: '🎭',
      highlight: 'standard of taste',
    },
    {
      type: 'quote',
      id: 'lq-aesthetics-aesthetics-1-1',
      quote: 'The beautiful is that which pleases universally without a concept.',
      author: 'Immanuel Kant',
      era: '1790',
      work: 'Critique of the Power of Judgment',
    },
    {
      type: 'question',
      prompt: 'For Kant, what makes aesthetic pleasure differ from the pleasure of eating?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'It is disinterested — indifferent to the object\'s use', isCorrect: true },
          { id: 'b', text: 'It lasts longer than bodily pleasure', isCorrect: false },
          { id: 'c', text: 'It applies only to visual art', isCorrect: false },
          { id: 'd', text: 'It can only be felt after training', isCorrect: false },
        ],
        explanation: 'Aesthetic pleasure is "disinterested": free of any desire for the object and indifferent to its use. Eating gratifies a need; beauty does not.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Beauty speaks as if it commands.',
      body: 'You rarely stop at "I like this." You say "this is beautiful" — as if it were a fact about the thing. Kant: feeling that quietly demands everyone agree.',
      emoji: '🔭',
    },
    {
      type: 'question',
      prompt: '"Beauty is just personal taste, so calling a sunset beautiful asks nothing of anyone else." Pick the best response.',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Right — taste is private, so the claim stays private', isCorrect: false },
          { id: 'b', text: 'It rests on feeling, yet still claims everyone should agree', isCorrect: true },
          { id: 'c', text: 'Wrong — beauty is a measurable property like weight', isCorrect: false },
          { id: 'd', text: 'Only trained critics may call anything beautiful', isCorrect: false },
        ],
        explanation: 'The trap: "feeling" sounds like "merely private." For Kant a judgment of taste is felt yet claims universal validity — it reaches out and asks all to agree.',
      },
    },
    {
      type: 'summary',
      title: 'Beauty: Personal Yet Universal',
      keyPoints: [
        'Kant: aesthetic pleasure is disinterested',
        'Hume: a standard set by true critics',
        'Beauty is felt, yet claims everyone',
      ],
      closingThought: 'Aesthetics asks why a mere feeling dares to speak for us all.',
    },
  ],
};

export default lesson;
