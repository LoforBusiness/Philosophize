import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'ethics-ethics-5',
  slug: 'beginning-of-ethical-thinking',
  title: 'How Humans First Started Thinking Ethically',
  description: 'In the first millennium BCE, reasoned ethics surfaced across several civilizations. Meet Socrates, dharma, and Confucius.',
  estimatedMinutes: 6,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'In the first millennium BCE, humans began arguing about how to live.',
      subtext: 'Greece, India, China. A striking parallel that still puzzles historians.',
      emoji: '🌏',
    },
    {
      type: 'concept',
      title: 'The Axial Age: A Famous Hunch',
      body: 'In 1949, philosopher Karl Jaspers named the Axial Age: roughly 800 to 200 BCE, when reflective ethics flared up in Greece, India, China and beyond. Was it one shared event? Historians still argue. The pattern is suggestive, not proven.',
      visual: '📜',
      highlight: 'Axial Age',
    },
    {
      type: 'example',
      title: 'Greece: Socrates and the Good Life',
      scenario: 'Socrates wrote nothing; we meet him through Plato. He cross-examined Athenians, asking "What is virtue? What is justice?" until their certainties collapsed. In 399 BCE the city tried him for impiety and corrupting the young, and he drank hemlock. His question, what is the good life, never left philosophy.',
      source: 'Plato, Apology (c. 399–390 BCE); Aristotle, Nicomachean Ethics (c. 350 BCE)',
      emoji: '🏛️',
    },
    {
      type: 'example',
      title: 'India: The Path of Dharma',
      scenario: 'In classical India, ethics turned on dharma: duty, right conduct, the proper order of things. In the Bhagavad Gita, Krishna urges the warrior Arjuna to do his own duty: "Better one\'s own dharma imperfectly done than another\'s done well." Right action depends on your role, your station, this moment.',
      source: 'The Bhagavad Gita (within the Mahabharata), 3.35',
      emoji: '🪔',
    },
    {
      type: 'example',
      title: 'China: Confucius and Ren',
      scenario: 'Confucius (551–479 BCE) wrote no book; his students gathered his sayings into the Analects after he died. His core idea was ren, humaneness, cultivated within real relationships. His version of the Golden Rule: "Do not impose on others what you yourself do not desire." Virtue grows in how we treat one another.',
      source: 'The Analects of Confucius, 12.2 (compiled c. 5th–3rd century BCE)',
      emoji: '☯️',
    },
    {
      type: 'question',
      prompt: 'What is the most accurate way to describe the "Axial Age"?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'A proven event when one philosophy spread between continents', isCorrect: false },
          { id: 'b', text: 'A debated thesis, named by Jaspers in 1949, about parallel ethical awakenings', isCorrect: true },
          { id: 'c', text: 'The exact year, 500 BCE, that ethics was invented', isCorrect: false },
          { id: 'd', text: 'A religious doctrine taught in Greece, India, and China alike', isCorrect: false },
        ],
        explanation: 'Karl Jaspers coined "Axial Age" in 1949 for a roughly 800–200 BCE span. It is an interpretive thesis many historians find striking but genuinely dispute, not a settled fact.',
      },
    },
    {
      type: 'question',
      prompt: 'For Confucius, becoming ren (humane) is something we cultivate within our relationships.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: true,
        explanation: 'For Confucius, ren is shaped in real bonds, family, friends, ruler and citizen. Fittingly, he wrote no book himself; his disciples compiled the Analects after his death.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'One puzzle, three different questions.',
      body: 'Greece (via Socrates) asks "What is virtue and the good life?" Classical India asks "What is my dharma, my right duty in this role?" Confucius asks "How do I become humane within my relationships?" Related angles on living well, not one shared creed.',
      emoji: '🔺',
    },
    {
      type: 'summary',
      title: 'Ethics Has Ancient, Global Roots',
      keyPoints: [
        'Jaspers called this the Axial Age, though historians debate it',
        'Socrates pursued virtue and the examined life',
        'Dharma tied right action to duty and role',
        'Confucius rooted ethics in humane relationships',
      ],
      closingThought: 'None of these founders wrote for us; their pupils carried the questions forward.',
    },
  ],
};

export default lesson;
