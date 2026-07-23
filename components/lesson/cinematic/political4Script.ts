import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic political-political-4, "Freedom vs. Control" — Berlin's two liberties.
// A figure pressed between two walls (interference). NEGATIVE liberty pulls the walls
// back — freedom from. Mill's harm principle draws the one line power may cross: harm
// to another (a second figure at the boundary). POSITIVE liberty stands the figure
// tall, its own master. Walls flank the figure and slide outward, so nothing covers it.
//
// Graded questions are the two from data/.../freedom-vs-control.ts.
// ─────────────────────────────────────────────────────────────────────────────

export interface Pol4Beat extends BaseBeat {
  /** Figure gesture. */ p?: number;
  /** How close/present the walls are 0..1 (1 = pressing in). */ walls?: number;
  /** Harm-principle boundary + the other person (0/1). */ harm?: number;
}

export const BEATS: Pol4Beat[] = [
  {
    p: 29, walls: 1, harm: 0,
    text: 'Free because no one stops you, or free because you can? Two ideas of freedom — and two very different politics.',
    dur: 3.6,
  },
  {
    p: 7, walls: 0.25, harm: 0,
    text: 'Berlin called this negative liberty: the area where others leave you alone. The walls pull back. Mill drew the line — power may be used against you only to prevent harm to others.',
    cite: 'Negative liberty — freedom from',
    dur: 5.0,
  },
  {
    p: 13, walls: 0.25, harm: 1,
    text: 'Eat badly, take wild risks, preach unpopular views? Mill says that is your business. But poison a well, defraud a buyer, throw a punch? Now you harm others — and only then may power step in.',
    cite: 'Mill’s harm principle',
    dur: 5.2,
  },
  {
    p: 0, walls: 0.25, harm: 1,
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
    p: 28, walls: 0, harm: 0,
    text: 'Berlin named a rival ideal: positive liberty — being your own master. You might face no interference yet still be too poor, sick, or untaught to act. Should the state empower people, not merely leave them alone?',
    cite: 'Positive liberty — freedom to',
    dur: 5.2,
  },
  {
    p: 21, walls: 0, harm: 0,
    mc: {
      prompt: 'Which idea of liberty is about removing obstacles and interference?',
      options: [
        { id: 'a', text: 'Positive liberty, being your own master and directing your life', correct: false },
        { id: 'b', text: 'Negative liberty, freedom from interference by others', correct: true },
        { id: 'c', text: 'Natural liberty, the freedom we are born with', correct: false },
        { id: 'd', text: 'Civil liberty, the freedom a constitution guarantees', correct: false },
      ],
      explain:
        'For Berlin, negative liberty is the space where no one blocks your way. Positive liberty asks instead whether you truly have the power to be your own master.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 4, walls: 0, harm: 0,
    mc: {
      prompt: 'Berlin championed positive liberty, so he surely wanted the state to force people toward their "real" freedom. Right?',
      options: [
        { id: 'a', text: 'Yes — Berlin urged rulers to coerce people into self-mastery', correct: false },
        { id: 'b', text: 'No — Berlin feared positive liberty could be twisted to justify coercion', correct: true },
        { id: 'c', text: 'Yes — Berlin said a "higher self" should always overrule your choices', correct: false },
        { id: 'd', text: 'No — because Berlin rejected positive liberty as meaningless', correct: false },
      ],
      explain:
        'The trap: Berlin valued positive liberty but warned it can be twisted, letting rulers coerce you in the name of your "real self." He guarded a core of negative liberty.',
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
