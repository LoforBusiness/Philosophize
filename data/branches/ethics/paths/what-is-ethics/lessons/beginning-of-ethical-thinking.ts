import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'ethics-ethics-5',
  slug: 'beginning-of-ethical-thinking',
  title: 'How Humans First Started Thinking Ethically',
  description: 'How reasoned ethics surfaced across ancient Greece, India, and China.',
  estimatedMinutes: 6,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Long ago, humans began arguing how to live.',
      subtext: 'Greece, India, China. A parallel that still puzzles historians.',
      emoji: '🌏',
    },
    {
      type: 'concept',
      title: 'The Axial Age: A Famous Hunch',
      body: 'In 1949, Karl Jaspers named the Axial Age: roughly 800–200 BCE, when reflective ethics flared up across Greece, India, and China. One shared event? Historians still argue. The pattern is suggestive, not proven.',
      visual: '📜',
      highlight: 'Axial Age',
    },
    {
      type: 'example',
      title: 'Greece: Socrates and the Good Life',
      scenario: 'Socrates wrote nothing; we meet him through Plato. He cross-examined Athenians: "What is virtue? Justice?" In 399 BCE the city tried him and he drank hemlock. His question, what is the good life, never left philosophy.',
      source: 'Plato, Apology (c. 399–390 BCE)',
      emoji: '🏛️',
    },
    {
      type: 'example',
      title: 'India: The Path of Dharma',
      scenario: 'In classical India, ethics turned on dharma: duty and right conduct. In the Bhagavad Gita, Krishna tells the warrior Arjuna to follow his own dharma. Right action depends on your role, your station, this moment.',
      source: 'The Bhagavad Gita, 3.35',
      emoji: '🪔',
    },
    {
      type: 'example',
      title: 'China: Confucius and Ren',
      scenario: 'Confucius (551–479 BCE) wrote no book; students gathered his sayings into the Analects. His core idea was ren, humaneness, cultivated within real relationships. Virtue grows in how we treat one another.',
      source: 'The Analects of Confucius',
      emoji: '☯️',
    },
    {
      type: 'quote',
      id: 'lq-ethics-ethics-5-1',
      quote: 'Do not impose on others what you yourself do not desire.',
      author: 'Confucius',
      era: 'c. 5th century BCE',
      work: 'The Analects, 15.24',
    },
    {
      type: 'question',
      prompt: 'For Confucius, becoming ren (humane) is cultivated within our relationships.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: true,
        explanation: 'For Confucius, ren is shaped in real bonds, family, friends, ruler and citizen. Fittingly, his disciples compiled the Analects after his death.',
      },
    },
    {
      type: 'question',
      prompt: 'Which best captures the "Axial Age"?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The proven year, 500 BCE, that ethics was invented', isCorrect: false },
          { id: 'b', text: 'One philosophy that spread between three continents', isCorrect: false },
          { id: 'c', text: "Jaspers's 1949 thesis about parallel ethical awakenings", isCorrect: true },
          { id: 'd', text: 'A single religion shared by Greece, India, and China', isCorrect: false },
        ],
        explanation: 'It sounds like a settled date or shared creed, but Jaspers coined it in 1949 as an interpretive thesis about parallel awakenings, one many historians still dispute.',
      },
    },
    {
      type: 'summary',
      title: 'Ethics Has Ancient, Global Roots',
      keyPoints: [
        'The Axial Age is debated, not proven',
        'Socrates pursued virtue and the examined life',
        'Dharma tied right action to duty and role',
        'Confucius rooted ethics in humane relationships',
      ],
      closingThought: 'None of these founders wrote for us; their pupils carried the questions forward.',
    },
  ],
};

export default lesson;
