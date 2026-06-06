import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'ethics-ethics-5',
  slug: 'beginning-of-ethical-thinking',
  title: 'How Humans First Started Thinking Ethically',
  description: 'Ethics was born on three continents at once. Meet Socrates, Confucius, and the idea of Dharma.',
  estimatedMinutes: 6,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Around 500 BCE, humanity started asking how to live.',
      subtext: 'Three continents. No contact. The same burning question, all at once.',
      emoji: '🌏',
    },
    {
      type: 'concept',
      title: 'Why Ethics Erupted When It Did',
      body: 'Historians call it the Axial Age: roughly 500 BCE, when ethical thought ignited in Greece, India, and China together. Cities swelled. Suddenly you lived among strangers, not just kin. Tribal instinct cracked. So thinkers asked a brand-new question: what should any person do, and why?',
      visual: '📜',
      highlight: 'Axial Age',
    },
    {
      type: 'example',
      title: 'Greece: Socrates and the Good Life',
      scenario: 'In Athens, Socrates hunted one quarry: what is virtue? He cross-examined everyone so relentlessly that the city tried him and made him drink hemlock. His student Plato chased justice; Plato\'s student Aristotle asked what a flourishing human life truly looks like. Western philosophy still runs on their questions.',
      source: 'Plato, The Republic (c. 375 BCE); Aristotle, Nicomachean Ethics (c. 350 BCE)',
      emoji: '🏛️',
    },
    {
      type: 'example',
      title: 'India: The Path of Dharma',
      scenario: 'In ancient India, ethics orbited Dharma: duty, right conduct, the proper order of all things. Texts like the Mahabharata and the Upanishads probed how your duties shift with your role, your age, your stage of life. Here ethics was no rigid rulebook. It was the live skill of acting rightly, right now, in context.',
      source: 'The Mahabharata (c. 400 BCE–400 CE)',
      emoji: '🪔',
    },
    {
      type: 'example',
      title: 'China: Confucius and Ren',
      scenario: 'Confucius (551–479 BCE) taught that a good society stands on good relationships. His heartbeat idea was ren: benevolence, humaneness, treating others with genuine care. Virtue, he argued, grows inside our bonds, parent and child, ruler and citizen. A society is only ever as good as the people inside it.',
      source: 'The Analects of Confucius (compiled c. 5th–4th century BCE)',
      emoji: '☯️',
    },
    {
      type: 'question',
      prompt: 'Why, above all, did ethics take shape as societies grew larger?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Bigger cities simply left more idle hours for philosophy', isCorrect: false },
          { id: 'b', text: 'Living among strangers demanded rules beyond tribal instinct', isCorrect: true },
          { id: 'c', text: 'Trade with distant lands imported ready-made moral codes', isCorrect: false },
          { id: 'd', text: 'Priests insisted every moral rule be written down', isCorrect: false },
        ],
        explanation: 'As cities swelled, you had to cooperate with strangers, not just family. That forced the founding ethical question: what does any person owe to any other?',
      },
    },
    {
      type: 'question',
      prompt: 'Confucius held that a good society rests on good relationships between people.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: true,
        explanation: 'For Confucius, ethics lives in our bonds. His idea of ren, benevolence or humaneness, shows up in how we treat one another across family, friendship, and public life.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'One question, three bold answers.',
      body: 'Greece asked what makes a good life for the individual. India asked what duties bind us within the larger order. China asked how we live well together. Not three separate puzzles, but three angles on the one problem every society must crack.',
      emoji: '🔺',
    },
    {
      type: 'summary',
      title: 'Ethics Has Ancient, Global Roots',
      keyPoints: [
        'The Axial Age sparked ethics across three civilizations',
        'Greece chased virtue and the good life',
        'India\'s Dharma bound ethics to duty and order',
        'Confucius rooted ethics in human relationships',
      ],
      closingThought: 'Ask how you should live, and you join a 2,500-year-old conversation.',
    },
  ],
};

export default lesson;
