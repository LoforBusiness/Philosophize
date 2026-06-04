import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'aesthetics-aesthetics-2',
  slug: 'art-beauty-and-emotion',
  title: 'Art, Beauty, and Emotion',
  description: 'How art carries emotion from one person to another, across centuries.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'A painting can move you centuries after it was made.',
      subtext: 'How does one person\'s feeling reach you through paint, time, and a screen?',
      emoji: '🖼️',
    },
    {
      type: 'concept',
      title: 'Art as Emotional Transmission',
      body: 'The novelist Tolstoy had a simple theory of art: its job is to pass a feeling from one person to another. The artist feels something, then makes a work that gives you the same feeling. By this test, art is not just decoration. It works when it makes you feel what the maker felt.',
      visual: '📡',
      highlight: 'emotional transmission',
    },
    {
      type: 'example',
      title: 'Tolstoy and the Peasant\'s Song',
      scenario: 'Tolstoy once heard a peasant girl singing a simple folk song and was deeply moved. Not because the tune was clever, but because her feeling passed straight to him. This, he said, is what real art does: it shares a feeling. It is also why a novel can make you sad about a character you know is not real.',
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
          { id: 'a', text: 'To pass the artist\'s feeling to the audience', isCorrect: true },
          { id: 'b', text: 'To make objects that look beautiful', isCorrect: false },
          { id: 'c', text: 'To show off technical skill', isCorrect: false },
          { id: 'd', text: 'To teach moral lessons', isCorrect: false },
        ],
        explanation: 'For Tolstoy, art is about sharing emotion. The maker gives you the feeling that inspired the work. He thought skill and beauty matter far less than whether that feeling comes across.',
      },
    },
    {
      type: 'concept',
      title: 'Why This Is Remarkable',
      body: 'Think about what this means. An artist hundreds of years ago felt something, put it into paint, and today a stranger with a totally different life feels it too. Emotion travels across time, language, and culture, and still arrives. Few things we make can do that.',
      visual: '⏳',
      highlight: 'empathy across time',
    },
    {
      type: 'example',
      title: 'Vermeer\'s Light',
      scenario: 'Vermeer painted quiet, ordinary moments: a woman reading a letter, a girl pouring milk. Viewers today, three centuries later, often describe the same calm, still feeling when they look. He captured a mood so precisely in light and shadow that it still reaches people long after he, and his world, were gone.',
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
        explanation: 'This is a classic puzzle in aesthetics called the paradox of fiction. We really do feel sad for characters who never existed. Philosophers still debate why we react this way when we know there is no one really there.',
      },
    },
    {
      type: 'summary',
      title: 'Art Connects People',
      keyPoints: [
        'Tolstoy: art passes feeling from maker to viewer',
        'Good art can share emotion across centuries',
        'That connection between minds is remarkable',
      ],
      closingThought: 'Art shows that one person\'s feeling can reach another.',
    },
  ],
};

export default lesson;
