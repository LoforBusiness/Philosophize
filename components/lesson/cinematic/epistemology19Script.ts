import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic epistemology-knowledge-19, "Whom Should You Believe?"
// Theme: FIVE SUBJECTS ON FIVE DOORS, AND A QUESTION THAT ONLY FITS ONE.
//
// Expertise is not a property of a person, it is a relation between a person and
// a SUBJECT — and that sentence is exactly the kind nobody remembers. So the
// stage makes it a matter of shape: every expert is a door with one subject on
// it, and a question is a key cut for one of them.
//
// A physician answering on nutrition is the case worth building the lesson
// around, because it is where the mistake actually happens. The door is real,
// the standing is real, and the key still does not turn.
//
// GAMIFIED SHAPE:
//   · beat 5  SCENE TARGETS — a question arrives and the reader taps the door it
//     belongs at. The decoy is a doctor, who is nearly right and is the person
//     most readers would actually ask (H66).
//   · beat 7  two CARDS — what you should do when the experts disagree, which is
//     the situation that makes people give up on expertise altogether.
// ─────────────────────────────────────────────────────────────────────────────

export interface Epi19Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** How many of the five doors are drawn, 0…1. */ doors?: number;
  /** The question chip, above the row, 0…1. */ chip?: number;
  /** The chip has been tried at the wrong door and not turned, 0…1. */ stray?: number;
  /** Two doors disagreeing with each other, 0…1. */ split?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Epi19Beat[] = [
  {
    p: 25, x: 200, doors: 1,
    text: 'Five people, and every one of them really does know something you do not.',
    dur: 3.8,
  },
  {
    p: 2, x: 200, doors: 1, chip: 1,
    text: 'A question turns up, cut to fit exactly one of these doors. Standing at the wrong door will open nothing.',
    cite: 'Expertise is a relation',
    dur: 4.8,
  },
  {
    p: 45, x: 132, doors: 1, chip: 1, stray: 1,
    text: 'Here is the everyday failure. A famous heart doctor is asked about diet on television, and answers.',
    dur: 4.2,
  },
  {
    p: 13, x: 132, doors: 1, chip: 1, stray: 1,
    text: 'Nobody lied. The credentials are real. They are simply for a different door.',
    dur: 3.6,
  },
  {
    p: 137, x: 132, doors: 1, chip: 1, stray: 1,
    quote: {
      id: 'lq-epistemology-knowledge-19-3',
      text: 'It is a part of our constitution, that what we are told by others should be believed, until we have positive evidence to the contrary.',
      author: 'Thomas Reid',
      work: 'An Inquiry into the Human Mind',
      era: '1764',
      philosopherId: 'thomas-reid',
      branchSlugs: ['epistemology'],
    },
    dur: 3.8,
  },
  {
    p: 4, x: 132, doors: 1, chip: 1, live: 1,
    interact: {
      prompt: 'Tap the door this question actually belongs at.',
      explain: 'Nutrition. A cardiologist knows more medicine than you and has read almost none of the diet trials. Standing is earned subject by subject, and the label on the door is what you are checking, not the person\'s eminence.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 21, x: 268, doors: 1, split: 1,
    text: 'Then the hard case. Two people behind the right door, both qualified, saying opposite things.',
    cite: 'When they disagree',
    dur: 4.2,
  },
  {
    p: 41, x: 268, doors: 1, split: 1,
    interact: {
      prompt: 'Two real experts on the same subject disagree. What follows?',
      cards: [
        { text: 'Go with the wider agreement', correct: true },
        { text: 'Nobody knows, so guess', correct: false },
      ],
      explain: 'Look at how many are on each side, and why. Disagreement at the edge of a field is normal and does not touch its settled middle. Treating one dissenter as proof that nothing is known is how a real debate gets used to sell doubt.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Right Door',
      points: [
        'Expertise holds between a person and a subject, not on its own',
        'Real credentials do not transfer to the next field along',
        'Trusting testimony is rational, and it is still a check',
        'Disagreement at the edge is not ignorance at the centre',
      ],
      closing: 'The question was never whether the expert is clever. The question is what the expert is clever about.',
    },
    dur: 3.4,
  },
];
