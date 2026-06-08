import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'aesthetics-aesthetics-4',
  slug: 'can-anything-be-art',
  title: 'Can Anything Be Art?',
  description: 'One urinal in a 1917 show cracked open every theory of what art is.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'In 1917, a plain urinal was entered as a work of art.',
      subtext: 'No carving. No painting. Just a choice. So what on earth makes something art?',
      emoji: '🚽',
    },
    {
      type: 'concept',
      title: 'Two Old Answers',
      body: 'For ages, two ideas dominated. Plato and Aristotle treated art as mimesis: skilled imitation of the world. Later, Tolstoy and Collingwood saw art as expression, the transmitting or clarifying of feeling. Both assume a maker\'s craft. So how could a plain factory urinal, untouched, ever count as art?',
      visual: '🤔',
      highlight: 'mimesis',
    },
    {
      type: 'example',
      title: 'Duchamp\'s Fountain',
      scenario: 'Marcel Duchamp took a porcelain urinal, laid it on its back, signed it "R. Mutt 1917," and submitted it to a New York show. The committee suppressed it. An anonymous defense replied: it does not matter whether Mr Mutt made it. "He CHOSE it." Choosing an object and reframing it was the creative act, a "readymade."',
      source: '"The Richard Mutt Case," The Blind Man No. 2 (1917)',
      emoji: '🎪',
    },
    {
      type: 'question',
      prompt: 'What was the central claim defending Duchamp\'s "Fountain"?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Choosing an object and reframing it is itself the creative act', isCorrect: true },
          { id: 'b', text: 'The urinal had a hidden beauty in its curves', isCorrect: false },
          { id: 'c', text: 'Craft and skill are the only real measure of art', isCorrect: false },
          { id: 'd', text: 'Art must imitate nature as accurately as possible', isCorrect: false },
        ],
        explanation: 'The 1917 defense insisted it did not matter who made the urinal: "He CHOSE it." By giving an ordinary object a new title and point of view, its useful meaning vanished and a new thought was created. Choice and designation, not skill or beauty, did the work.',
      },
    },
    {
      type: 'concept',
      title: 'The Artworld Replies',
      body: 'Two modern answers emerged. Arthur Danto argued that seeing something as art needs "an atmosphere of artistic theory" and a knowledge of art history, an artworld of ideas. George Dickie went further: art is an artifact granted the status of a candidate for appreciation by the artworld\'s institutions, its critics, curators, and galleries.',
      visual: '🏛️',
      highlight: 'artworld',
    },
    {
      type: 'question',
      prompt: 'On Dickie\'s institutional theory, what makes something count as art?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The artworld\'s institutions conferring on it the status of art', isCorrect: true },
          { id: 'b', text: 'Being crafted with rare technical skill', isCorrect: false },
          { id: 'c', text: 'Expressing a powerful emotion to viewers', isCorrect: false },
          { id: 'd', text: 'Faithfully imitating something in nature', isCorrect: false },
        ],
        explanation: 'For Dickie, art status is conferred by the artworld of galleries, critics, and traditions, not by the object itself. That is why a chosen urinal can become art while an identical one in a hardware store stays plumbing. Danto\'s artworld is subtler still: theory and history, not officials.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Notice what Fountain really did.',
      body: 'It defies mimesis and expression alike, stirring a question more than a feeling. Morris Weitz even argued "art" is an open concept that resists any tidy definition. Notice the move: asking "but is this art?" is itself philosophy. It drags your hidden definition into the open and asks you to defend it.',
      emoji: '💭',
    },
    {
      type: 'summary',
      title: 'Art Became a Question',
      keyPoints: [
        'Old theories: art as mimesis, or as expression',
        'Duchamp: choice and context, not craft, can make art',
        'Danto and Dickie: theory, history, and the artworld confer art',
      ],
      closingThought: 'Duchamp\'s urinal mattered most for the question it forced.',
    },
  ],
};

export default lesson;
