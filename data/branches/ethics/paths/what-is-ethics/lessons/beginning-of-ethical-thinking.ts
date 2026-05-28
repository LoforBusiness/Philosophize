import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'ethics-ethics-5',
  slug: 'beginning-of-ethical-thinking',
  title: 'How Humans First Started Thinking Ethically',
  description: 'From ancient Greece to Confucius to Dharma — trace the origins of ethical thought across civilizations.',
  estimatedMinutes: 6,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Thousands of years ago, humans asked: how should we live?',
      subtext: 'And independently, on three continents, they started finding answers.',
      emoji: '🌏',
    },
    {
      type: 'concept',
      title: 'Why Ethics Emerged When It Did',
      body: 'Ethical thinking exploded around 500 BCE — in Greece, India, and China simultaneously. Historians call this the "Axial Age." As societies grew larger and more complex, living alongside strangers required new rules beyond tribal instinct. Philosophers began asking not just "what does my tribe do?" but "what should any person do — and why?"',
      visual: '📜',
      highlight: 'Axial Age',
    },
    {
      type: 'example',
      title: 'Ancient Greece: The Good Life',
      scenario: 'Socrates roamed Athens asking one relentless question: "What is virtue?" He was so disruptive that Athens put him on trial and executed him. His student Plato built a whole philosophy around justice. His student Aristotle asked what a flourishing human life actually looks like. Greek ethics set the agenda that Western philosophy still debates today.',
      source: 'Plato, The Republic (c. 375 BCE); Aristotle, Nicomachean Ethics (c. 350 BCE)',
      emoji: '🏛️',
    },
    {
      type: 'example',
      title: 'Ancient India: Dharma',
      scenario: 'In ancient India, the concept of Dharma — meaning duty, righteousness, cosmic order — emerged as the foundation of ethical life. The Mahabharata and Upanishads explored how each person\'s duties depend on their role, age, and stage of life. Ethics wasn\'t a set of universal rules but a dynamic, context-sensitive practice of living rightly within the whole.',
      source: 'The Mahabharata (c. 400 BCE–400 CE)',
      emoji: '🪔',
    },
    {
      type: 'example',
      title: 'Ancient China: Confucius and Ren',
      scenario: 'Confucius (551–479 BCE) taught that the good society depends on good relationships. His central concept, ren — often translated as benevolence or humaneness — meant treating others with genuine care and respect. Ethics was about cultivating virtue through proper relationships: family, friendship, ruler and citizen. Society is only as moral as the people in it.',
      source: 'Confucius, The Analects (c. 500 BCE)',
      emoji: '☯️',
    },
    {
      type: 'question',
      prompt: 'What was the primary reason ethics developed as societies grew larger?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Larger societies had more leisure time for philosophy', isCorrect: false },
          { id: 'b', text: 'Living with strangers required rules beyond tribal instinct', isCorrect: true },
          { id: 'c', text: 'Trade with foreign cultures introduced new ideas', isCorrect: false },
          { id: 'd', text: 'Religious authorities demanded ethical codes be written down', isCorrect: false },
        ],
        explanation: 'As societies grew, people needed to cooperate with strangers — not just kin. This required asking what any person owes to any other person, which is the fundamental question of ethics.',
      },
    },
    {
      type: 'question',
      prompt: 'Confucius argued that a good society depends on good relationships between people.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: true,
        explanation: 'Confucius believed ethics is fundamentally relational. His concept of ren (benevolence/humaneness) was about how we treat each other in concrete relationships — family, friendship, civic life.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Three civilizations asked the same question and found different answers.',
      body: 'Greece asked: what is the good life for the individual? India asked: what are my duties within the cosmic order? China asked: how can we live well together? These aren\'t three unrelated questions — they\'re three angles on the same deep problem that humans everywhere eventually had to face.',
      emoji: '🔺',
    },
    {
      type: 'summary',
      title: 'Ethics Has Ancient, Global Roots',
      keyPoints: [
        'The Axial Age saw ethics emerge across three civilizations at once',
        'Greece asked: what is virtue and the good life?',
        'India\'s Dharma tied ethics to duty and cosmic order',
        'Confucius grounded ethics in human relationships',
      ],
      closingThought: 'When you ask "how should I live?" you\'re joining a conversation that\'s been going on for 2,500 years.',
    },
  ],
};

export default lesson;
