import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'aesthetics-aesthetics-11',
  slug: 'defining-art-institutional-theory',
  title: 'What Even Counts As Art?',
  description: 'If a urinal can be art, who or what actually confers that status?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'A urinal is art. Identical plumbing is not. Why?',
      subtext: 'Same object, two fates. The difference cannot live in the porcelain itself.',
      emoji: '🚽',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you saw Duchamp\'s Fountain crack open every theory.',
      body: 'It defied mimesis and expression alike: no craft, no feeling, just a choice. That puzzle left a sharp question unanswered — if not the object, then what makes something count as art at all?',
      emoji: '💭',
    },
    {
      type: 'concept',
      title: 'Art as a Conferred Status',
      body: 'George Dickie\'s institutional theory answers: art is a status, not a feature. The "artworld" — galleries, critics, traditions — confers it on an object. Craft, beauty, and imitation are beside the point. What matters is who, on the artworld\'s behalf, presents it for appreciation.',
      visual: '🏛️',
      highlight: 'institutional theory',
    },
    {
      type: 'quote',
      id: 'lq-aesthetics-aesthetics-11-1',
      quote: 'A work of art is an artifact of a kind created to be presented to an artworld public.',
      author: 'George Dickie',
      era: '1984',
      work: 'The Art Circle',
    },
    {
      type: 'example',
      title: 'Two Brillo Boxes',
      scenario: 'Earlier you met Warhol\'s Brillo Boxes — plywood painted to look exactly like supermarket cartons. Set one beside a real carton from a stockroom. They are visually identical. Yet one hangs in a museum as art and one holds soap pads. No property of the object decides it.',
      source: 'After Arthur Danto, "The Artworld" (1964)',
      emoji: '📦',
    },
    {
      type: 'question',
      prompt: 'These theories of art arose in this historical order. Sort them earliest to latest.',
      xpValue: 5,
      interaction: {
        type: 'sort',
        items: [
          { id: 'mimesis', text: 'Mimesis: art is skilled imitation (Plato & Aristotle)' },
          { id: 'expression', text: 'Expression: art transmits emotion (Tolstoy, Collingwood)' },
          { id: 'institutional', text: 'Institutional: the artworld confers art (Danto, Dickie)' },
        ],
        correctOrder: ['mimesis', 'expression', 'institutional'],
        explanation: 'Mimesis came first in antiquity. Expression theory rose around 1900. The institutional theory arrived last (Danto 1964, Dickie 1974) — built precisely to explain cases like Fountain that the older definitions could not.',
      },
    },
    {
      type: 'question',
      prompt: 'A friend says the institutional theory means "if I declare my coffee mug art, it is art." Best reply?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Right — one person\'s say-so is all the theory requires', isCorrect: false },
          { id: 'b', text: 'No — status is conferred on behalf of the artworld, not by a private label', isCorrect: true },
          { id: 'c', text: 'No — the mug must first be genuinely beautiful to qualify', isCorrect: false },
          { id: 'd', text: 'Right — Dickie proved craft and skill never mattered to anyone', isCorrect: false },
        ],
        explanation: 'The trap is the "anything goes" strawman. Dickie requires status conferred by someone acting on behalf of the artworld — a shared institution of practices and history — not one person\'s private decree.',
      },
    },
    {
      type: 'summary',
      title: 'Who Confers the Status of Art',
      keyPoints: [
        'Definitions of art evolved: mimesis, then expression, then institutional',
        'Dickie: art is a status, not an object\'s property',
        'The artworld, not a private label, confers it',
      ],
      closingThought: 'Fountain stopped being a prank and became a question about definition.',
    },
  ],
};

export default lesson;
