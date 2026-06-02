import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'ethics-ethics-5',
  slug: 'beginning-of-ethical-thinking',
  title: 'How Humans First Started Thinking Ethically',
  description: 'From the streets of Athens to the wisdom of Confucius to the idea of Dharma — trace where ethical thought was first kindled across civilizations.',
  estimatedMinutes: 6,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Thousands of years ago, humans dared to ask: how should we live?',
      subtext: 'And on three distant continents, with no word between them, the answers began.',
      emoji: '🌏',
    },
    {
      type: 'concept',
      title: 'Why Ethics Emerged When It Did',
      body: 'Around 500 BCE, ethical thought burst into flame at once in Greece, India, and China — an age historians have named the Axial Age. As societies swelled and strangers crowded together, the old tribal instincts no longer sufficed. Thinkers stopped asking merely what their tribe did, and began to ask what any person ought to do, and why.',
      visual: '📜',
      highlight: 'Axial Age',
    },
    {
      type: 'example',
      title: 'Ancient Greece: The Good Life',
      scenario: 'Socrates wandered Athens with one relentless question on his lips: what is virtue? He unsettled the city so deeply that it tried him and put him to death. His pupil Plato raised a whole philosophy upon justice; Plato\'s pupil Aristotle asked what a flourishing human life truly looks like. Their questions still set the table for Western thought.',
      source: 'Plato, The Republic (c. 375 BCE); Aristotle, Nicomachean Ethics (c. 350 BCE)',
      emoji: '🏛️',
    },
    {
      type: 'example',
      title: 'Ancient India: Dharma',
      scenario: 'In ancient India arose Dharma — duty, righteousness, and the deep order of the cosmos all at once — the ground on which ethical life was built. The Mahabharata and the Upanishads asked how each person\'s duties bend with their role, their age, their season of life. Ethics here was no rigid code, but the living art of acting rightly within the whole.',
      source: 'The Mahabharata (c. 400 BCE–400 CE)',
      emoji: '🪔',
    },
    {
      type: 'example',
      title: 'Ancient China: Confucius and Ren',
      scenario: 'Confucius (551–479 BCE) taught that a good society rests upon good relationships. At the heart of his thought stood ren — benevolence, or humaneness — the practice of meeting others with genuine care and respect. Virtue, he held, is cultivated within our bonds: parent and child, friend and friend, ruler and citizen. A society is only as good as the souls within it.',
      source: 'Confucius, The Analects (c. 500 BCE)',
      emoji: '☯️',
    },
    {
      type: 'question',
      prompt: 'Why, above all, did ethics take shape as societies grew larger?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Larger societies simply had more idle hours for philosophy', isCorrect: false },
          { id: 'b', text: 'Living among strangers demanded rules beyond tribal instinct', isCorrect: true },
          { id: 'c', text: 'Trade with foreign lands carried in new ideas', isCorrect: false },
          { id: 'd', text: 'Priests insisted that moral codes be written down', isCorrect: false },
        ],
        explanation: 'As societies swelled, people had to cooperate with strangers, not just kin. That forced the deepest question of ethics into the open: what does any person owe to any other?',
      },
    },
    {
      type: 'question',
      prompt: 'Confucius held that a good society rests upon good relationships between people.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: true,
        explanation: 'For Confucius, ethics is relational to its core. His ren — benevolence, humaneness — lives in how we treat one another in flesh-and-blood bonds: family, friendship, the life of the city.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Three civilizations asked one question and returned with different answers.',
      body: 'Greece asked what makes a good life for the individual. India asked what duties bind us within the cosmic order. China asked how we might live well together. These are not three separate riddles but three faces of one deep problem — the problem every society must sooner or later face.',
      emoji: '🔺',
    },
    {
      type: 'summary',
      title: 'Ethics Has Ancient, Global Roots',
      keyPoints: [
        'The Axial Age kindled ethics in three civilizations at once',
        'Greece asked after virtue and the good life',
        'India\'s Dharma bound ethics to duty and cosmic order',
        'Confucius rooted ethics in human relationships',
      ],
      closingThought: 'To ask how you should live is to join a conversation already 2,500 years old.',
    },
  ],
};

export default lesson;
