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
  /** 1 = a checkmark on the heart door, confirming the credential is real. */ credCheck?: number;
  /** 1 = the credential line to the heart door snaps before it reaches nutrition. */ noBridge?: number;
}

export const BEATS: Epi19Beat[] = [
  {
    p: 172, x: 200, doors: 1,
    text: 'Each of five experts knows a subject that you don’t: engines, the heart, nutrition, tax law and the climate.',
    dur: 3.8,
  },
  {
    p: 466, x: 200, doors: 1, chip: 1,
    text: 'Expertise is a relation between a person and a subject. The question “is this diet safe?” fits only one of these doors.',
    cite: 'Expertise is a relation',
    dur: 4.8,
  },
  {
    p: 379, x: 132, doors: 1, chip: 1, stray: 1,
    text: 'Consider a common failure. A famous heart doctor is asked about diet on television, and gives an answer.',
    dur: 4.2,
  },
  {
    p: 13, x: 132, doors: 1, chip: 1, stray: 1, credCheck: 1,
    text: 'The doctor’s credentials are genuine, and nobody has lied.',
    dur: 1.8,
  },
  {
    p: 266, x: 132, doors: 1, chip: 1, stray: 1, noBridge: 1,
    text: 'But the credentials concern the heart, not nutrition. That doesn’t make the answer authoritative on its own.',
    dur: 1.9,
  },
  {
    p: 465, x: 132, doors: 1, chip: 1, stray: 1,
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
    p: 165, x: 132, doors: 1, chip: 1, live: 1,
    interact: {
      prompt: 'At which door does the question “is this diet safe?” belong?',
      explain: 'Nutrition. A heart doctor may know more medicine than most people. Yet whether a diet is safe is a question for nutrition science. What counts is expertise in the subject the question is about.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 412, x: 268, doors: 1, split: 1,
    text: 'A harder case arises when two people behind the right door, both qualified, give opposite answers.',
    cite: 'When experts disagree',
    dur: 4.2,
  },
  {
    p: 383, x: 268, doors: 1, split: 1,
    interact: {
      prompt: 'When two qualified experts disagree, what should a non-expert do?',
      sort: {
        chip: 'qualified experts disagree',
        bins: [
          { id: 'guess', label: 'choose either', reads: 'no one knows, so choose either' },
          { id: 'loud', label: 'the confident one', reads: 'trust whichever expert sounds most certain' },
          { id: 'weight', label: 'weigh the sides', reads: 'weigh how many experts hold each view, and why', correct: true },
        ],
      },
      explain: 'Weigh the sides. Alvin Goldman counts agreement among other experts as evidence, along with each side’s arguments and track record. Sounding certain isn’t evidence, and one dissenter doesn’t make a settled question open.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Trusting the Right Expert',
      points: [
        'Expertise is a relation between a person and a subject',
        'Credentials in one field don’t transfer to another',
        'Trusting testimony is rational until contrary evidence appears',
        'Disagreement at a field’s frontier leaves its settled core intact',
      ],
      closing: 'The question isn’t whether an expert is clever, but which subject the expert’s knowledge covers.',
    },
    dur: 3.4,
  },
];
