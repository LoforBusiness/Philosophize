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
      headline: 'A painting five centuries old can still move you to tears.',
      subtext: 'How does a dead stranger\'s feeling travel through paint and time to find you?',
      emoji: '🖼️',
    },
    {
      type: 'concept',
      title: 'Art as Emotional Transmission',
      body: 'For Tolstoy, the true office of art is to carry feeling between souls. An artist is seized by something — grief, joy, awe — and shapes a work that kindles the same fire in you. Art is no mere ornament; it is a bridge between inner lives. Its only real test: does it make you feel what the maker felt?',
      visual: '📡',
      highlight: 'emotional transmission',
    },
    {
      type: 'example',
      title: 'Tolstoy and the Peasant\'s Song',
      scenario: 'Tolstoy once heard a peasant girl singing a simple folk song, and something in him gave way — not because the tune was clever, but because her feeling passed straight into him, unannounced. This, he insisted, is what all true art does: it infects us. A great novel can leave you grieving a soul you know was never real.',
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
          { id: 'a', text: 'To carry the artist\'s feeling into the audience', isCorrect: true },
          { id: 'b', text: 'To fashion objects of visual beauty', isCorrect: false },
          { id: 'c', text: 'To put technical mastery on display', isCorrect: false },
          { id: 'd', text: 'To tell moral tales with tidy lessons', isCorrect: false },
        ],
        explanation: 'Tolstoy held that the defining work of art is emotional transmission — the maker infects us with the feeling that first gave rise to the work. Beside this, technical brilliance and beauty are only afterthoughts.',
      },
    },
    {
      type: 'concept',
      title: 'Why This Is Philosophically Remarkable',
      body: 'Consider what such transmission asks. An artist in fifteenth-century Florence felt something, locked it into pigment on wood — and centuries on, a stranger with an utterly different life stands before it and weeps. Through art, emotion crosses time, language, and culture intact. Nothing else we make can do this.',
      visual: '⏳',
      highlight: 'empathy across time',
    },
    {
      type: 'example',
      title: 'Vermeer\'s Light',
      scenario: 'Vermeer painted the plainest of moments: a woman reading a letter, a girl pouring milk. Yet viewers today, parted from him by three centuries, keep reporting the same hush — a stillness held, as if time itself paused. He folded a mood so exactly into light and shadow that it survives him entire: the feeling outlasted the painter, the studio, the vanished world he knew.',
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
        explanation: 'This is one of aesthetics\' oldest riddles, the paradox of fiction. We truly grieve characters who never lived. Philosophers still ask why our feelings ignite when reason knows full well there is no one there to mourn.',
      },
    },
    {
      type: 'summary',
      title: 'Art Bridges Inner Lives',
      keyPoints: [
        'Tolstoy: art carries feeling from maker to beholder',
        'Great art infects us with emotion across the ages',
        'This bridge between minds is quietly astonishing',
      ],
      closingThought: 'Art is the proof that one mind can still reach into another.',
    },
  ],
};

export default lesson;
