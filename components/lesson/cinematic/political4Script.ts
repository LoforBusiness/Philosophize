import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic political-political-4, "Freedom vs. Control" — Berlin's two liberties.
// A figure pressed between two walls (interference). NEGATIVE liberty pulls the walls
// back — freedom from — and a measured gap ("ROOM TO MOVE") opens between them, which
// is the lesson's whole idea drawn as a dimension line. Mill's harm principle draws
// the one line power may cross: harm to another (a second person past the boundary).
// POSITIVE liberty stands the figure tall, its own master. Above it all, a two-card
// comparison diagram stamps whichever liberty is being discussed.
//
// Graded questions are the two from data/.../freedom-vs-control.ts (deck A/B/C/D —
// this lesson has no scene-answered question).
// ─────────────────────────────────────────────────────────────────────────────

export interface Pol4Beat extends BaseBeat {
  /** Figure gesture. */ p?: number;
  /** How close/present the walls are 0..1 (1 = pressing in). */ walls?: number;
  /** Harm-principle boundary + the other person (0/1). */ harm?: number;
  /** Which comparison card is stamped: 0 none · 1 negative · 2 positive. */ panel?: number;
  /** Mill's-test tally — four acts, three yours and one that harms (0/1). */ test?: number;
}

export const BEATS: Pol4Beat[] = [
  {
    p: 29, walls: 1, harm: 0, panel: 0,
    text: 'Free because no one stops you, or free because you can? Two ideas of freedom — and two very different politics.',
    dur: 3.6,
  },
  {
    p: 7, walls: 0.25, harm: 0, panel: 1,
    text: 'Berlin called this negative liberty: the area where others leave you alone. The walls pull back. Mill drew the line — power may be used against you only to prevent harm to others.',
    cite: 'Negative liberty — freedom from',
    dur: 5.0,
  },
  {
    p: 13, walls: 0.25, harm: 1, panel: 1, test: 1,
    text: 'Eat badly, take wild risks, preach unpopular views? Mill says that is your business. But poison a well, defraud a buyer, throw a punch? Now you harm others — and only then may power step in.',
    cite: 'Mill’s harm principle',
    dur: 5.2,
  },
  {
    p: 141, walls: 0.25, harm: 1, panel: 1, test: 1,
    quote: {
      id: 'lq-political-political-4-1',
      text: 'Over himself, over his own body and mind, the individual is sovereign.',
      author: 'John Stuart Mill',
      work: 'On Liberty',
      era: '1859',
      branchSlugs: ['political-philosophy'],
    },
    dur: 3.4,
  },
  {
    p: 28, walls: 0, harm: 0, panel: 2,
    text: 'Berlin named a rival ideal: positive liberty — being your own master. You might face no interference yet still be too poor, sick, or untaught to act. Should the state empower people, not merely leave them alone?',
    cite: 'Positive liberty — freedom to',
    dur: 5.2,
  },
  {
    // Both cards sit neutral here — lighting one would hand the reader the answer.
    p: 21, walls: 0, harm: 0, panel: 0,
    interact: {
      prompt: 'Which idea of liberty is about removing obstacles and interference?',
      cards: [
        { text: 'Negative liberty', correct: true },
        { text: 'Positive liberty', correct: false },
      ],
      explain: 'For Berlin, negative liberty is the space where no one blocks your way. Positive liberty asks instead whether you truly have the power to be your own master.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 4, walls: 0, harm: 0, panel: 2,
    interact: {
      prompt: 'Berlin championed positive liberty, so he surely wanted the state to force people toward their "real" freedom. Right?',
      cards: [
        { text: 'No, he feared its abuse', correct: true },
        { text: 'Yes, he championed it', correct: false },
      ],
      explain: 'The trap: Berlin valued positive liberty but warned it can be twisted, letting rulers coerce you in the name of your "real self." He guarded a core of negative liberty.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Two Ways to Think About Freedom',
      points: [
        'Negative liberty: freedom from interference',
        'Mill: coerce only to prevent harm to others',
        'Positive liberty: being your own master',
        'Berlin warned positive liberty can mask coercion',
      ],
      closing: 'How you define freedom decides the kind of society you build.',
    },
    dur: 2.8,
  },
];
