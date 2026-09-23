import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic political-political-25, "The Personal Is Political"
// Theme: A FRONT DOOR, AND HOW FAR THE REACH OF JUSTICE STOPS SHORT OF IT.
//
// The slogan is about a BOUNDARY, so the scene draws the boundary and then lets
// the reader move a bar across it. Two rooms of equal size, a door between them,
// and a reach that runs from the left. Where the reach stops is the argument, and
// it is one number the reader can put anywhere.
//
// Drawing the two rooms the same size is deliberate. The old picture treated one
// of them as a place where power did not apply, and the fastest way to say that
// is wrong is to give it exactly as much of the stage as the other.
//
// GAMIFIED SHAPE:
//   · beat 4  SCENE TARGETS — three plates, and the reader taps where classical
//     political philosophy stopped looking. On the stage because the door it
//     stopped at is drawn above them.
//   · beat 9  a DRAG — how far justice reaches. The bar across the rooms IS the
//     reader's thumb, so the answer is the picture rather than a slider beside it.
// ─────────────────────────────────────────────────────────────────────────────

export interface Political25Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the two rooms and the door between them stand. */ rooms?: number;
  /** How far the old reach ran, 0…1 across both rooms. */ reach?: number;
  /** 1 = the three plates the reader chooses between are up. */ plates?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
  /** 1 = an emphasis ring marks the PRIVATE room (group AH). */ focus?: number;
  /** 1 = a "?" tag hangs over the door — the veil of ignorance (group AH). */ veil?: number;
}

export const BEATS: Political25Beat[] = [
  {
    p: 2, x: 44,
    text: 'The feminist slogan “the personal is political” dates from about 1970. It says that who does the housework is a matter of justice.',
    dur: 3.8,
  },
  {
    p: 30, x: 44, rooms: 1,
    text: 'Liberal political philosophy long drew a boundary between public life and the private home.',
    dur: 3.6,
  },
  {
    p: 36, x: 44, rooms: 1, reach: 0.46,
    text: 'Law, work and voting belonged to the public sphere, where questions of justice applied.',
    dur: 4.0,
  },
  {
    p: 160, x: 44, rooms: 1, reach: 0.46, focus: 1,
    text: 'Home life belonged to the private sphere. Its roles were treated as natural rather than as a matter of power.',
    dur: 4.6,
  },
  {
    p: 161, x: 44, rooms: 1, reach: 0.46, plates: 1, live: 1,
    interact: {
      prompt: 'Where did traditional political philosophy stop applying questions of justice?',
      explain: 'At the front door. Law and work were public, so their justice was debated for centuries. The household was treated as private and left outside the theory of justice.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 159, x: 44, rooms: 1, reach: 0.46,
    text: 'Feminist philosophers reply that public rules shape private life. Marriage law, work rules and benefits all structure the family.',
    dur: 5.0,
  },
  {
    p: 62, x: 100, rooms: 1, reach: 0.46,
    text: 'Suppose parental leave favours mothers and childcare costs more than a mother earns. Her decision to leave work looks private, but public policy shaped it.',
    dur: 5.0,
  },
  {
    p: 433, x: 100, rooms: 1, reach: 0.46,
    quote: {
      id: 'lq-political-political-25-1',
      text: 'One is not born, but rather becomes, a woman.',
      author: 'Simone de Beauvoir',
      philosopherId: 'simone-de-beauvoir',
      work: 'The Second Sex',
      era: '1949',
      branchSlugs: ['political-philosophy'],
    },
    dur: 4.0,
  },
  {
    p: 383, x: 100, rooms: 1, reach: 0.46, veil: 1,
    text: 'Susan Moller Okin turned John Rawls’s veil of ignorance on the family. If you didn’t know your sex, you’d want the household to be just.',
    dur: 5.0,
  },
  {
    p: 21, x: 100, rooms: 1,
    interact: {
      prompt: 'Which of these did the older theories leave alone?',
      odd: {
        axis: 'JUSTICE REACHED THREE',
        tiles: [
          { id: 'court', reads: 'THE COURTS' },
          { id: 'work', reads: 'THE WORKPLACE' },
          { id: 'vote', reads: 'THE VOTE' },
          { id: 'home', reads: 'THE HOME', correct: true },
        ],
      },
      explain: 'The home. Treat the family as outside politics and the split of care goes unexamined. That split shapes who can take up anything outside the home. The feminist claim is that a theory of justice which stops at the front door hasn\'t finished.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Justice and the Family',
      points: [
        'Traditional theory put law in public and family in private',
        'Private arrangements are held in place by public rules',
        'Okin turned the veil of ignorance on the household',
        'Equal rights leave unequal care untouched',
      ],
      closing: 'Calling an arrangement private can shield it from scrutiny, so feminists ask whose interests the label protects.',
    },
    dur: 4.2,
  },
];
