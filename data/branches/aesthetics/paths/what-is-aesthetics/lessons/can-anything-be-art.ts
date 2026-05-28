import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'aesthetics-aesthetics-4',
  slug: 'can-anything-be-art',
  title: 'Can Anything Be Art?',
  description: 'A urinal walked into a museum and broke philosophy. Here is the story.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'In 1917, a urinal was submitted as a masterpiece.',
      subtext: 'The art world has never fully recovered — and that was the point.',
      emoji: '🚽',
    },
    {
      type: 'concept',
      title: 'The Definition Problem',
      body: 'Before Duchamp, defining art seemed obvious: art is skilled craft that creates beauty. But what if someone takes an unmodified factory object, signs it, and places it in a gallery? If context transforms a urinal into art, then art is not about skill or beauty — it is about something else entirely.',
      visual: '🤔',
      highlight: 'readymade',
    },
    {
      type: 'example',
      title: 'Duchamp\'s Fountain',
      scenario: 'Marcel Duchamp bought a porcelain urinal, turned it on its side, signed it "R. Mutt," and submitted it to the 1917 Society of Independent Artists exhibition. The selection committee rejected it. Duchamp argued that the act of choosing the object and presenting it as art was itself the artistic gesture. The concept was the art.',
      source: 'Marcel Duchamp, Fountain (1917)',
      emoji: '🎪',
    },
    {
      type: 'question',
      prompt: 'What was Duchamp\'s main claim about his "Fountain"?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The act of selecting and presenting an object makes it art', isCorrect: true },
          { id: 'b', text: 'The urinal\'s smooth curves had hidden beauty', isCorrect: false },
          { id: 'c', text: 'Craft and skill are the only true measures of art', isCorrect: false },
          { id: 'd', text: 'Art should only depict nature accurately', isCorrect: false },
        ],
        explanation: 'Duchamp\'s radical move was to claim that artistic intention and context — not craft or beauty — are what make something art. The selection of an everyday object and its presentation in an art context was the creative act.',
      },
    },
    {
      type: 'concept',
      title: 'The Institutional Theory of Art',
      body: 'Philosopher George Dickie responded to Duchamp with a theory: something is art when the "artworld" — critics, curators, galleries, history — confers that status on it. Art is not a fixed property of objects. It is a social role granted by institutions. This is powerful and unsettling in equal measure.',
      visual: '🏛️',
      highlight: 'institutional theory',
    },
    {
      type: 'question',
      prompt: 'According to the institutional theory, what makes something count as art?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Being granted art status by the artworld\'s institutions', isCorrect: true },
          { id: 'b', text: 'Being made with exceptional technical skill', isCorrect: false },
          { id: 'c', text: 'Producing a strong emotional response in viewers', isCorrect: false },
          { id: 'd', text: 'Being displayed in a public space', isCorrect: false },
        ],
        explanation: 'Dickie\'s institutional theory holds that art status is conferred socially, not inherent in objects. The artworld — its galleries, critics, and traditions — decides what counts. This explains how a urinal becomes art but your kitchen sink does not.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you learned art transmits emotion.',
      body: 'Duchamp challenges this directly. Fountain transmits confusion, provocation, and a question — is that emotion enough? Asking "is this art?" turns out to be a philosophical act. The question itself reveals your assumptions about what art is supposed to do.',
      emoji: '💭',
    },
    {
      type: 'summary',
      title: 'Art Is a Question, Not Just an Object',
      keyPoints: [
        'Duchamp: intention and context can make anything art',
        'Institutional theory: artworld institutions confer art status',
        'Asking "is this art?" is itself a philosophical move',
      ],
      closingThought: 'The most important thing Duchamp\'s urinal created was the question.',
    },
  ],
};

export default lesson;
