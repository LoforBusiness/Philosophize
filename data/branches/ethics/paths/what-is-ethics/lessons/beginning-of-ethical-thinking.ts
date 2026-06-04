import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'ethics-ethics-5',
  slug: 'beginning-of-ethical-thinking',
  title: 'How Humans First Started Thinking Ethically',
  description: 'Ethical thinking grew up in several ancient civilizations at once. This lesson looks at Greece, India, and China.',
  estimatedMinutes: 6,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Thousands of years ago, humans began asking how to live.',
      subtext: 'On three separate continents, with no contact, the same kinds of questions came up.',
      emoji: '🌏',
    },
    {
      type: 'concept',
      title: 'Why Ethics Emerged When It Did',
      body: 'Around 500 BCE, ethical thought developed at about the same time in Greece, India, and China. Historians call this the Axial Age. As societies grew, people lived among strangers, not just their own tribe. Old habits were not enough, so thinkers began asking what any person should do, and why.',
      visual: '📜',
      highlight: 'Axial Age',
    },
    {
      type: 'example',
      title: 'Ancient Greece: The Good Life',
      scenario: 'In Athens, Socrates kept asking one question: what is virtue? He challenged people so persistently that the city tried him and executed him. His student Plato built a philosophy around justice, and Plato\'s student Aristotle asked what a flourishing human life looks like. Their questions still shape Western philosophy today.',
      source: 'Plato, The Republic (c. 375 BCE); Aristotle, Nicomachean Ethics (c. 350 BCE)',
      emoji: '🏛️',
    },
    {
      type: 'example',
      title: 'Ancient India: Dharma',
      scenario: 'In ancient India, ethical life centered on Dharma, a word meaning duty, right conduct, and the proper order of things. Texts like the Mahabharata and the Upanishads asked how a person\'s duties change with their role, age, and stage of life. Ethics here was less a fixed rulebook than the skill of acting rightly in context.',
      source: 'The Mahabharata (c. 400 BCE–400 CE)',
      emoji: '🪔',
    },
    {
      type: 'example',
      title: 'Ancient China: Confucius and Ren',
      scenario: 'Confucius (551–479 BCE) taught that a good society depends on good relationships. His central idea was ren, meaning benevolence or humaneness: treating others with real care and respect. He held that virtue is built within our relationships, like parent and child or ruler and citizen. A society is only as good as the people in it.',
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
        explanation: 'As societies grew, people had to cooperate with strangers, not just family. That raised a basic ethical question: what does any person owe to any other?',
      },
    },
    {
      type: 'question',
      prompt: 'Confucius held that a good society rests upon good relationships between people.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: true,
        explanation: 'For Confucius, ethics is mainly about relationships. His idea of ren, benevolence or humaneness, shows up in how we treat one another in family, friendship, and public life.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'One question, three different answers.',
      body: 'Greece asked what makes a good life for the individual. India asked what duties we have within the larger order of things. China asked how we can live well together. These are not three unrelated puzzles but three angles on the same problem every society has to deal with.',
      emoji: '🔺',
    },
    {
      type: 'summary',
      title: 'Ethics Has Ancient, Global Roots',
      keyPoints: [
        'The Axial Age saw ethics develop in three civilizations',
        'Greece focused on virtue and the good life',
        'India\'s Dharma tied ethics to duty and order',
        'Confucius based ethics on human relationships',
      ],
      closingThought: 'Asking how you should live joins a conversation about 2,500 years old.',
    },
  ],
};

export default lesson;
