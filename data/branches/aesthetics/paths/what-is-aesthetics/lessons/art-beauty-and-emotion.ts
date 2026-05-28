import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'aesthetics-aesthetics-2',
  slug: 'art-beauty-and-emotion',
  title: 'Art, Beauty, and Emotion',
  description: 'Explore how art transmits emotion across time — and why that is philosophically astonishing.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'A painting made 500 years ago can make you cry today.',
      subtext: 'How does a stranger\'s feeling travel through paint and time to reach you?',
      emoji: '🖼️',
    },
    {
      type: 'concept',
      title: 'Art as Emotional Transmission',
      body: 'Tolstoy believed art\'s true purpose is to transmit emotion. An artist feels something — grief, joy, awe — then creates a work that re-creates that feeling in the audience. Art is not decoration. It is a bridge between inner lives. The test of great art: does it make you feel what the artist felt?',
      visual: '📡',
      highlight: 'emotional transmission',
    },
    {
      type: 'example',
      title: 'Tolstoy and the Peasant\'s Song',
      scenario: 'Tolstoy described watching a peasant girl sing a folk song. He felt something shift in him — not because the melody was technically brilliant, but because her emotion entered him directly. He argued this is what all genuine art does: it infects us. A great novel makes you grieve a character you know is fictional.',
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
          { id: 'a', text: 'To transmit the artist\'s emotion to the audience', isCorrect: true },
          { id: 'b', text: 'To create objects of visual beauty', isCorrect: false },
          { id: 'c', text: 'To demonstrate technical skill', isCorrect: false },
          { id: 'd', text: 'To tell moral stories with clear lessons', isCorrect: false },
        ],
        explanation: 'Tolstoy argued that art\'s defining purpose is emotional transmission — the artist infects the audience with the feeling that originated the work. Technical skill and beauty are secondary to this.',
      },
    },
    {
      type: 'concept',
      title: 'Why This Is Philosophically Remarkable',
      body: 'Think about what emotional transmission requires. An artist in 15th-century Florence felt something, encoded it in pigment on wood, and centuries later a stranger with a completely different life stands before it and weeps. Emotions travel across time, language, and culture through art. Nothing else does this.',
      visual: '⏳',
      highlight: 'empathy across time',
    },
    {
      type: 'example',
      title: 'Vermeer\'s Light',
      scenario: 'Johannes Vermeer painted ordinary domestic scenes: a woman reading a letter, a girl pouring milk. Viewers today — separated by 350 years — consistently report a feeling of quiet, suspended stillness. Vermeer encoded a mood so precisely in light and shadow that it survives intact across centuries. The emotion outlasted the painter, the studio, and the world he lived in.',
      source: 'Johannes Vermeer, Dutch Golden Age (c. 1660s)',
      emoji: '🕯️',
    },
    {
      type: 'question',
      prompt: 'Is it possible to feel genuine emotion in response to something you know is fictional?',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: true,
        explanation: 'This is one of aesthetics\' classic puzzles — called the "paradox of fiction." Readers genuinely grieve fictional characters. Philosophers debate why our emotions fire even when our reason knows the characters are not real.',
      },
    },
    {
      type: 'summary',
      title: 'Art Bridges Inner Lives',
      keyPoints: [
        'Tolstoy: art transmits emotion from artist to audience',
        'Great art infects us with feelings across time',
        'This emotional bridge is philosophically astonishing',
      ],
      closingThought: 'Art is proof that other minds can touch your own.',
    },
  ],
};

export default lesson;
