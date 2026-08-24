import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'metaphysics-being-19',
  slug: 'substance-and-properties',
  title: 'What Is a Thing, Really?',
  description: "Strip away an apple's color, shape, and taste. Is anything left underneath?",
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Peel away every quality. What remains?',
      subtext: 'Take the redness, roundness, and sweetness from an apple. Is there an apple left?',
      emoji: '🍎',
    },
    {
      type: 'concept',
      title: 'Substance vs. Properties',
      body: 'Aristotle saw each thing as a substance that bears properties. The apple is the substance; red, round, and sweet are the properties it carries. The properties can change while the substance endures — the apple ripens, yet stays the same apple.',
      visual: '🏛️',
      highlight: 'substance',
    },
    {
      type: 'example',
      title: 'The Something-I-Know-Not-What',
      scenario: 'John Locke pressed the question harder. List an apple\'s qualities: color, shape, taste, weight. But qualities must belong to something. So Locke posited a hidden support beneath them — a bare substratum we can never observe, only assume. He admitted we have no real idea of it; we only suppose it must be there.',
      source: 'Locke, Essay Concerning Human Understanding, 1690',
      emoji: '🔍',
    },
    {
      type: 'quote',
      id: 'lq-metaphysics-being-19',
      quote: 'The idea then we have, to which we give the general name substance, being nothing but the supposed but unknown support of those qualities.',
      author: 'John Locke',
      era: '1690',
      work: 'An Essay Concerning Human Understanding, II.xxiii',
      philosopherId: 'john-locke',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you saw the bundle theory of the self.',
      body: 'Earlier you met the bundle theory of the self: no hidden core, just a bundle of experiences. Bundle theory now generalizes that move to all objects — there is no bare substratum, only a co-located bundle of properties. The apple just is its qualities, gathered together.',
      emoji: '🪢',
    },
    {
      type: 'concept',
      title: 'The Substratum Puzzle',
      body: 'Here is the worry that drives bundle theory. A thing has many properties. Properties seem to need something to belong to. So we posit a bare substratum to bear them. But that substratum, stripped of every property, becomes unknowable — and perhaps nothing at all.',
      visual: '🧩',
      highlight: 'substratum',
    },
    {
      type: 'question',
      prompt: 'Put the substratum puzzle in the order that builds the argument for bundle theory.',
      interaction: {
        type: 'sort',
        items: [
          { id: 's1', text: 'A thing has many properties: red, round, sweet.' },
          { id: 's2', text: 'Properties seem to need something to belong to.' },
          { id: 's3', text: 'So we posit a bare substratum bearing them.' },
          { id: 's4', text: 'But stripped of all properties, it is unknowable — maybe nothing.' },
        ],
        correctOrder: ['s1', 's2', 's3', 's4'],
        explanation:
          'The argument moves from observation to posit to collapse. We start with properties we actually notice, infer they need a bearer, posit a substratum to be that bearer, then discover the bearer — having no properties of its own — is unknowable. That collapse is exactly what motivates bundle theory: drop the empty substratum and keep only the bundle.',
      },
      xpValue: 5,
    },
    {
      // (E37c) The scene asks two graded questions; the data file has to ask the
      // same two. This mirrors the deck question in components/lesson/cinematic.
      type: 'question',
      prompt: 'Two objects share every single property. Are they one thing or two?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Plainly two — and bundle theory struggles to say so', isCorrect: true },
          { id: 'b', text: 'One, since there is nothing left to tell them apart', isCorrect: false },
          { id: 'c', text: 'Two, and bundle theory explains it easily', isCorrect: false },
          { id: 'd', text: 'The question is meaningless', isCorrect: false },
        ],
        explanation: 'Most people say two, and that is the bill bundle theory has to pay. If a thing just IS its properties, then two things with all the same properties are the same thing. Saying they are two means something beyond the properties is doing the distinguishing — which is exactly the bare substratum Locke could describe only as a something, he knew not what.',
      },
    },
    {
      type: 'summary',
      title: 'What You Now Know',
      keyPoints: [
        'Aristotle: a thing is a substance bearing properties.',
        "Locke: a hidden support, a something-I-know-not-what.",
        'Bundle theory: no substratum, just co-located properties.',
      ],
      closingThought:
        'The bundle move you met for the self now reaches every object. Maybe a thing is nothing but its qualities, all the way down.',
    },
  ],
};

export default lesson;
