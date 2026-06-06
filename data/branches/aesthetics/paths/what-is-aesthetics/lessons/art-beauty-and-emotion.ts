import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'aesthetics-aesthetics-2',
  slug: 'art-beauty-and-emotion',
  title: 'Art, Beauty, and Emotion',
  description: 'Expression theory: how a feeling leaps from maker to stranger across centuries.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'A dead painter is making you feel something right now.',
      subtext: 'How does one mind\'s feeling cross paint, language, and 400 years to reach yours?',
      emoji: '🖼️',
    },
    {
      type: 'concept',
      title: 'The Expression Theory of Art',
      body: 'Forget pretty pictures. Tolstoy argued that art is emotional contagion: the artist feels something, captures it, and infects you with the very same feeling. R.G. Collingwood pushed further, calling art the act of clarifying an emotion. Both are expression theories: a work succeeds through feeling, not eye-dazzling skill.',
      visual: '📡',
      highlight: 'expression theory',
    },
    {
      type: 'example',
      title: 'Tolstoy and the Peasant\'s Song',
      scenario: 'A peasant girl sings a plain folk tune. Tolstoy, master of vast novels, is floored. Not by cleverness, but because her feeling jumps straight into him. That contagion, he wrote, is real art. The same magic lets a novel break your heart over a character you know never drew breath.',
      source: 'Leo Tolstoy, What Is Art? (1897)',
      emoji: '🎶',
    },
    {
      type: 'question',
      prompt: 'What did Tolstoy believe was the primary purpose of art?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'To transmit the artist\'s feeling into the audience', isCorrect: true },
          { id: 'b', text: 'To copy nature as beautifully as possible', isCorrect: false },
          { id: 'c', text: 'To flaunt the artist\'s technical skill', isCorrect: false },
          { id: 'd', text: 'To deliver clear moral lessons', isCorrect: false },
        ],
        explanation: 'For Tolstoy, art is emotional contagion: the maker infects you with the feeling that sparked the work. Beauty, copied nature, and dazzling skill matter far less than whether that feeling actually arrives.',
      },
    },
    {
      type: 'concept',
      title: 'Empathy That Beats Time',
      body: 'Sit with how strange this is. A mind centuries ago felt something, froze it in pigment, and now a stranger with a wildly different life feels it too. Expression theory says emotion is portable: it survives death, language, and culture. Almost nothing we build pulls off that trick.',
      visual: '⏳',
      highlight: 'empathy across time',
    },
    {
      type: 'example',
      title: 'Vermeer\'s Light',
      scenario: 'Vermeer painted hushed instants: a woman reading a letter, a girl pouring milk. Three centuries on, viewers report the exact same stillness washing over them. He fixed a mood so precisely in light and shadow that it keeps detonating in strangers, long after he and his entire world had vanished. Feeling, perfectly preserved.',
      source: 'Johannes Vermeer, Dutch Golden Age (c. 1660s)',
      emoji: '🕯️',
    },
    {
      type: 'question',
      prompt: 'Can you feel genuine emotion in response to something you know is fictional?',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: true,
        explanation: 'Yes, and it baffles philosophers. This is the paradox of fiction: we weep for people who never existed. Why fire up real emotion for someone we know isn\'t there? Aesthetics still hasn\'t settled the answer.',
      },
    },
    {
      type: 'summary',
      title: 'Art Connects Minds',
      keyPoints: [
        'Expression theory: art transmits feeling, maker to viewer',
        'Tolstoy and Collingwood: emotion is the point',
        'The paradox of fiction: real tears, fictional people',
      ],
      closingThought: 'Expression theory: one mind\'s feeling can leap into another.',
    },
  ],
};

export default lesson;
