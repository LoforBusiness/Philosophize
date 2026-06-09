import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'aesthetics-aesthetics-4',
  slug: 'can-anything-be-art',
  title: 'Can Anything Be Art?',
  description: 'One urinal in a 1917 show cracked open every theory of art.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'In 1917, a plain urinal was entered as art.',
      subtext: 'No carving. No painting. Just a choice. So what makes something art?',
      emoji: '🚽',
    },
    {
      type: 'concept',
      title: 'Two Old Answers',
      body: 'For ages, two ideas ruled. Plato and Aristotle: art is mimesis, skilled imitation. Later Tolstoy and Collingwood: art is expression of feeling. Both assume a maker\'s craft.',
      visual: '🤔',
      highlight: 'mimesis',
    },
    {
      type: 'example',
      title: 'Duchamp\'s Fountain',
      scenario: 'Duchamp laid a urinal on its back, signed it "R. Mutt 1917," and submitted it. The committee suppressed it. An anonymous defense replied: it doesn\'t matter who made it — "He CHOSE it."',
      source: '"The Richard Mutt Case," The Blind Man No. 2 (1917)',
      emoji: '🎪',
    },
    {
      type: 'quote',
      id: 'lq-aesthetics-aesthetics-4-1',
      quote: 'To see something as art requires something the eye cannot descry — an atmosphere of artistic theory, a knowledge of the history of art: an artworld.',
      author: 'Arthur Danto',
      era: '1964',
      work: 'The Artworld',
    },
    {
      type: 'question',
      prompt: 'On Dickie\'s institutional theory, what makes something count as art?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The artworld\'s institutions conferring the status of art', isCorrect: true },
          { id: 'b', text: 'Being crafted with rare technical skill', isCorrect: false },
          { id: 'c', text: 'Expressing a powerful emotion to viewers', isCorrect: false },
          { id: 'd', text: 'Faithfully imitating something in nature', isCorrect: false },
        ],
        explanation: 'For Dickie, status is conferred by galleries, critics, and traditions — not the object. A chosen urinal becomes art; an identical one in a shop stays plumbing.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Notice what Fountain really did.',
      body: 'It defies mimesis and expression alike, stirring a question more than a feeling. Asking "but is this art?" is itself philosophy — it drags your hidden definition into the open.',
      emoji: '💭',
    },
    {
      type: 'question',
      prompt: 'A urinal becomes art in a gallery. So does that prove "anything is art if you call it art"?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Yes — a personal label is all it takes', isCorrect: false },
          { id: 'b', text: 'No — it took the artworld\'s context, not one person\'s say-so', isCorrect: true },
          { id: 'c', text: 'No — the urinal was secretly beautiful after all', isCorrect: false },
          { id: 'd', text: 'Yes — Duchamp proved craft and skill are meaningless', isCorrect: false },
        ],
        explanation: 'The trap: "anything goes." Danto and Dickie say it took theory, history, and the artworld — not a private label — to make the choice register as art.',
      },
    },
    {
      type: 'summary',
      title: 'Art Became a Question',
      keyPoints: [
        'Old theories: mimesis, or expression',
        'Duchamp: choice and context, not craft',
        'Danto and Dickie: the artworld confers art',
      ],
      closingThought: 'Duchamp\'s urinal mattered most for the question it forced.',
    },
  ],
};

export default lesson;
