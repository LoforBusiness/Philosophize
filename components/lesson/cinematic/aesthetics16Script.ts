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
    text: 'You have stood in front of this painting three times and liked it more each time. Today you read the label on the wall.',
    dur: 4.0,
  },
  {
    p: 41, x: 168, canvas: 1,
    text: 'There it is. Finished in 1911, and not one mark on it has moved since. Whatever happens next happens to you, not to the canvas.',
    cite: 'The work',
    dur: 4.6,
  },
  {
    p: 36, x: 124, canvas: 1, facts: 1,
    text: 'The first line on the card: the painter took the commission from a man he despised, and said so in a letter.',
    cite: 'One fact',
    dur: 4.2,
  },
  {
    p: 129, x: 124, canvas: 1, facts: 1,
    quote: {
      id: 'lq-aesthetics-aesthetics-16-1',
      text: 'The design or intention of the author is neither available nor desirable as a standard for judging the success of a work of art.',
      author: 'Wimsatt and Beardsley',
      work: 'The Intentional Fallacy',
      era: '1946',
      branchSlugs: ['aesthetics'],
    },
    dur: 3.8,
  },
  {
    p: 40, x: 168, canvas: 1, facts: 3,
    text: 'The gallery keeps adding. Now the card is longer than the painting is wide, and you notice you have been reading it instead of looking.',
    cite: 'The rail fills',
    dur: 4.8,
  },
  {
    p: 4, x: 124, canvas: 1, facts: 3,
    interact: {
      prompt: 'You learn the painter was cruel. What changed about the painting?',
      cards: [
        { text: 'Nothing, but your experience did', correct: true },
        { text: 'It ruins the work', correct: false },
      ],
      explain: 'The trap is that both extremes feel principled. "The label ruins the work" and "the label is irrelevant" both dodge the honest answer. The painting is untouched. Your experience of the painting is not.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 6, x: 124, canvas: 1, facts: 3, pick: 1,
    interact: {
      prompt: 'Three things about this wall. Tap what actually changed on the canvas.',
      explain: 'Nothing. Every mark is where it was in 1911. The rail underneath grew, the room grew quieter, and you changed — but the work has been finished the whole time.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Canvas Does Not Hear You',
      points: [
        'What you learn cannot edit the marks',
        'It can still change what looking is like',
        'Intention is not the court of appeal',
        'Both "ruined" and "irrelevant" are dodges',
      ],
      closing: 'The work stopped changing the day it was finished. You did not.',
    },
    dur: 3.0,
  },
];
