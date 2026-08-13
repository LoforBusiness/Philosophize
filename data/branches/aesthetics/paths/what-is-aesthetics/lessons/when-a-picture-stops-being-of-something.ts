import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'aesthetics-aesthetics-34',
  slug: 'when-a-picture-stops-being-of-something',
  title: 'When Does a Picture Stop Being Of Something?',
  description: 'Simplify a face far enough and it is a shape. Where exactly did it stop?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Two dots and a curve, and you see a face.',
      subtext: 'Remove one dot. Do you still?',
      emoji: '🙂',
    },
    {
      type: 'concept',
      title: 'Depiction Is Not Resemblance',
      body: 'A photograph resembles its subject and so does a cousin, but the cousin is not a picture of them. Resemblance is mutual and depiction is not: the portrait is of the sitter, and the sitter is never of the portrait.',
      visual: '↩️',
      highlight: 'It only points one way',
    },
    {
      type: 'example',
      title: "Picasso's Bulls",
      scenario: 'In 1945 Picasso drew the same bull eleven times, each version with less in it than the last. The final plate is a handful of lines. It is still unmistakably a bull, and nobody can say which plate would have been the first one that was not.',
      source: 'Picasso, Le Taureau (1945)',
    },
    {
      type: 'quote',
      id: 'lq-aesthetics-aesthetics-34',
      quote: 'Denotation is the core of representation and is independent of resemblance.',
      author: 'Nelson Goodman',
      era: '1968',
    },
    {
      type: 'question',
      prompt: 'Why is resemblance a poor account of what makes a picture "of" something?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Resemblance runs both ways and depiction runs one way', isCorrect: true },
          { id: 'b', text: 'Because no picture ever really resembles anything', isCorrect: false },
          { id: 'c', text: 'Because abstract art resembles nothing at all', isCorrect: false },
          { id: 'd', text: 'Because photographs resemble their subjects too well', isCorrect: false },
        ],
        explanation: 'Two identical twins resemble each other perfectly and neither is a picture of the other. Whatever makes a mark a picture OF something has a direction, and mere likeness does not have one.',
      },
    },
    {
      type: 'question',
      prompt: 'There is no exact line where the bull stops being a bull. What follows?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'That "depicts" is a vague predicate, like "heap" — not that depiction is unreal', isCorrect: true },
          { id: 'b', text: 'That depiction is entirely a matter of personal opinion', isCorrect: false },
          { id: 'c', text: 'That every picture depicts everything equally', isCorrect: false },
          { id: 'd', text: 'That the last plate does not really depict a bull', isCorrect: false },
        ],
        explanation: 'Borderline cases are what vagueness looks like, and they do not abolish the clear cases. There is no exact grain at which a heap begins either, and heaps are perfectly real. The first plate is a bull and the eleventh is a bull; the trouble is only in saying where the boundary went.',
      },
    },
    {
      type: 'summary',
      title: 'Where The Bull Went',
      keyPoints: [
        'Resemblance is mutual; depiction points one way',
        'Convention and context do much of the work',
        'Simplification has no exact breaking point',
        'Vague does not mean unreal',
      ],
      closingThought: 'You can strip a picture almost to nothing and it still points. What it is that keeps pointing is the open question.',
    },
  ],
};

export default lesson;
