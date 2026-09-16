import type { BaseBeat } from './cinematicKit';

// Cinematic aesthetics-aesthetics-16, "Does the Artist's Life Change the Work?"
//
// THE PICTURE: one canvas on a wall and a rail of biographical cards beneath it
// that fills up over the lesson. The canvas never changes a stroke — the rail does
// all the moving, and by the end it is taller than the painting. The argument is
// the reader watching themselves start to look at the rail.
//
// Q1 is A/B/C/D (what changed needs weighing — both extremes are tempting); Q2 is
// answered on the wall, because "what changed on the canvas" is exactly the sort of
// question the picture can put directly (H65).

export interface Aes16Beat extends BaseBeat {
  /** Figure gesture (emote code). */ p?: number;
  /** Where the figure stands (stage x). 70 = downstage left, 168 = at the wall. */ x?: number;
  /** The canvas is hung, 0..1. */ canvas?: number;
  /** How many biography cards are on the rail: 0…3. */ facts?: number;
  /** 1 = the three answer cards are live (Q2). */ pick?: number;
}

export const BEATS: Aes16Beat[] = [
  {
    p: 25, x: 70,
    text: 'Suppose you’ve admired a painting on three visits, liking it more each time. Today you read the label beside it.',
    dur: 4.0,
  },
  {
    p: 270, x: 168, canvas: 1,
    text: 'The painting was finished in 1911, and no mark on it has changed since.',
    cite: 'The work',
    dur: 2.8,
  },
  {
    p: 270, x: 168, canvas: 1,
    text: 'Whatever happens next happens to you, not to the canvas.',
    dur: 1.8,
  },
  {
    p: 425, x: 124, canvas: 1, facts: 1,
    text: 'The label’s first line reports that the painter accepted the commission from a patron he despised. His own letter says so.',
    cite: 'A biographical fact',
    dur: 4.2,
  },
  {
    p: 129, x: 124, canvas: 1, facts: 1,
    quote: {
      id: 'lq-aesthetics-aesthetics-16-1',
      text: 'The design or intention of the author is neither available nor desirable as a standard for judging the success of a work of literary art.',
      author: 'Wimsatt and Beardsley',
      work: 'The Intentional Fallacy',
      era: '1946',
      branchSlugs: ['aesthetics'],
    },
    dur: 3.8,
  },
  {
    p: 383, x: 168, canvas: 1, facts: 3,
    text: 'The gallery adds more facts, until the label is longer than the painting is wide. Your attention shifts from the work to the biography.',
    cite: 'The biography grows',
    dur: 4.8,
  },
  {
    p: 165, x: 124, canvas: 1, facts: 3,
    interact: {
      prompt: 'What does learning the painter’s biography change?',
      drag: {
        lo: 'THE PAINTING IS RUINED',
        hi: 'IT CHANGES NOTHING AT ALL',
        start: 0,
        zones: [
          { id: 'ruin', upto: 0.3, reads: 'the painting is spoiled as art' },
          { id: 'you', upto: 0.74, reads: 'the painting stays, your response changes', correct: true },
          { id: 'none', upto: 1, reads: 'nothing, neither the painting nor your response' },
        ],
      },
      explain: 'The painting is unchanged, but your response changes. No mark has moved since yesterday. What differs is the viewer, who now knows something about the painter. Calling the work ruined treats facts about the painter as facts about the painting.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 6, x: 124, canvas: 1, facts: 3, pick: 1,
    interact: {
      prompt: 'After the biography was added, what changed on the canvas itself?',
      explain: 'Nothing. Every mark and every hue is as it was in 1911. The label grew and the viewer’s knowledge grew, but the painting itself didn’t change.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Artist’s Life and the Work',
      points: [
        'Learning about the artist can’t alter the marks',
        'It can still change the experience of looking',
        'Intention isn’t the standard for judging the work',
        'Neither “ruined” nor “irrelevant” describes the change',
      ],
      closing: 'The painting was complete in 1911, but a viewer’s response can change with each new fact.',
    },
    dur: 3.0,
  },
];
