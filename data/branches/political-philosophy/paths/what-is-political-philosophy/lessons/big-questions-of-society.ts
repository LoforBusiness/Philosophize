import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'political-political-5',
  slug: 'big-questions-of-society',
  title: 'The Big Questions of Society',
  description: 'Step into the oldest argument alive: what do we owe each other?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'What do we owe each other as members of society?',
      subtext: 'Plato asked it 2,400 years ago. We are still arguing.',
      emoji: '🏛️',
    },
    {
      type: 'concept',
      title: 'Plato\'s Ideal State',
      body: 'In The Republic, Plato chases one question: what would a perfectly just city look like? His answer dazzles and provokes. Hand power to philosopher-kings, rulers wise enough to truly know the good. Roles flow from talent, not birth or gold. Justice, for Plato, is each part doing its proper work.',
      visual: '🏛️',
      highlight: 'just society',
    },
    {
      type: 'example',
      title: 'Plato\'s Three Classes',
      scenario: 'Plato carves his city into three: rulers (philosopher-kings who govern), guardians (warriors who defend), and producers (farmers and merchants who supply). He mirrors this in the soul: reason, spirit, appetite. Justice arrives when each part masters its own task and stops grabbing the work of others.',
      source: 'Plato, The Republic (~375 BCE)',
      emoji: '🧠',
    },
    {
      type: 'concept',
      title: 'Rawls\' Veil of Ignorance',
      body: 'John Rawls fires a brilliant question: what rules would you pick if you did not know who you would be? Step behind a "veil of ignorance." Rich or poor, healthy or sick, gifted or struggling, all hidden. Stripped of self-interest, Rawls argues, reasonable people guard the worst-off, since that could be them.',
      visual: '🎭',
      highlight: 'veil of ignorance',
    },
    {
      type: 'question',
      prompt: 'What is the point of Rawls\' "veil of ignorance" thought experiment?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'To prove justice can never be pinned down at all', isCorrect: false },
          { id: 'b', text: 'To design fair rules without knowing your own place', isCorrect: true },
          { id: 'c', text: 'To insist society must be identical in every way', isCorrect: false },
          { id: 'd', text: 'To show the wealthy have earned every advantage', isCorrect: false },
        ],
        explanation: 'The veil strips self-interest from your reasoning. Blind to your own position, you must choose rules fair to anyone you could become, especially the least advantaged.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Watch the big questions link up.',
      body: 'Hobbes asks why we build societies at all. Locke and Rousseau ask what makes them legitimate. Mill asks how far they may bind you. Plato and Rawls ask what justice demands. Not scattered debates, but one long, electric conversation about how humans should live together.',
      emoji: '🔗',
    },
    {
      type: 'question',
      prompt: 'For Plato, what does justice in a society actually mean?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Splitting all wealth and resources equally among citizens', isCorrect: false },
          { id: 'b', text: 'Freedom from any government meddling in private life', isCorrect: false },
          { id: 'c', text: 'Each part of society doing its proper job in harmony', isCorrect: true },
          { id: 'd', text: 'A majority vote deciding what is right for everyone', isCorrect: false },
        ],
        explanation: 'For Plato, justice is harmony: every class, and every part of the soul, doing its proper work. A just city runs like a healthy body, each part serving the whole.',
      },
    },
    {
      type: 'summary',
      title: 'The Lasting Questions',
      keyPoints: [
        'Plato: justice is each part doing its proper job',
        'Rawls: fair rules are ones you\'d pick while blind',
        'Political philosophy asks what we owe each other',
        'These questions still fuel political debate today',
      ],
      closingThought: 'Political philosophy is not dusty history; it is shaping your world right now.',
    },
  ],
};

export default lesson;
