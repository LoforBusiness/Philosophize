import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic epistemology-knowledge-27, "Wronged As A Knower"
// Theme: A TRUE REPORT ARRIVING AT A GAUGE THAT WAS TURNED DOWN FIRST.
//
// Fricker's two injustices damage different parts of one journey, so the scene
// draws the journey: what she said, the passage, and how much credit it was
// given. Testimonial injustice empties the gauge. Hermeneutical injustice empties
// the plate — there were never words to send.
//
// The FULL MARK stays drawn at the gauge's end at every setting. Without it the
// deflation is invisible: a half-full bar is only a wrong if you can see what it
// was owed.
//
// GAMIFIED SHAPE:
//   · beat 4  SCENE TARGETS — three plates, and the reader names the juror's
//     wrong. On the stage because the gauge is already short of its own mark.
//   · beat 8  a SORT — a harm with no name yet, dropped into its kind. One choice
//     drains the gauge and the other empties the plate, so the two injustices are
//     two different places in the picture rather than two words.
// ─────────────────────────────────────────────────────────────────────────────

export interface Epistemology27Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the speaker's plate and the passage from it are drawn. */ said?: number;
  /** 1 = the credit gauge and its full mark stand at the far end. */ gauge?: number;
  /** How much credit her word was given, 0…1. */ credit?: number;
  /** 1 = the three plates the reader chooses between are up. */ plates?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Epistemology27Beat[] = [
  {
    p: 423, x: 28, said: 1,
    text: 'You can wrong somebody without telling a single lie. Doubting a speaker because of prejudice can be enough.',
    dur: 4.6,
  },
  {
    p: 160, x: 28, said: 1, gauge: 1, credit: 1,
    text: 'Suppose a patient gives a doctor an accurate account of her symptoms.',
    dur: 4.6,
  },
  {
    p: 436, x: 28, said: 1, gauge: 1, credit: 0.35,
    text: 'The doctor treats the report as anxiety, because the patient is young. Her word receives less credit than it’s owed.',
    dur: 4.8,
  },
  {
    p: 264, x: 28, said: 1, gauge: 1, credit: 0.35,
    text: 'Miranda Fricker calls this testimonial injustice. Prejudice makes a hearer give a speaker too little credibility.',
    dur: 5.0,
  },
  {
    p: 163, x: 28, said: 1, gauge: 1, credit: 0.35, plates: 1, live: 1,
    interact: {
      prompt: 'A juror gives a witness less credit because of his accent. Which injustice is this?',
      explain: 'Testimonial. The witness can say what he means and be understood. Prejudice about his accent makes the juror give his word less credit than it deserves.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 451, x: 88, said: 1, gauge: 1, credit: 0.35,
    text: 'Fricker names a second wrong, hermeneutical injustice. Here a group lacks the shared concepts to make sense of its experience.',
    dur: 5.0,
  },
  {
    p: 430, x: 88, said: 1, gauge: 1, credit: 0.35,
    quote: {
      id: 'lq-epistemology-knowledge-27-1',
      text: 'A speaker suffers a testimonial injustice when prejudice causes a hearer to give a deflated level of credibility to their word.',
      author: 'Miranda Fricker',
      work: 'Epistemic Injustice',
      era: '2007',
      branchSlugs: ['epistemology'],
    },
    dur: 5.0,
  },
  {
    p: 448, x: 88, said: 1, gauge: 1, credit: 0.35,
    text: 'Victims of sexual harassment had no shared concept for the wrong until the term was coined in the 1970s.',
    dur: 5.0,
  },
  {
    p: 168, x: 88, said: 1, gauge: 1, credit: 0.35,
    interact: {
      prompt: 'Which injustice leaves a harm with no shared concept to name it?',
      sort: {
        chip: 'a harm with no name',
        bins: [
          { id: 'test', label: 'testimonial', reads: 'a speaker’s word gets too little credit' },
          { id: 'herm', label: 'missing concepts', reads: 'the concepts to express it are missing', correct: true },
          { id: 'none', label: 'no injustice', reads: 'a gap in shared concepts wrongs nobody' },
        ],
      },
      explain: 'Missing concepts: Fricker calls it hermeneutical injustice. Nobody’s word was doubted. There were no words yet for what happened. The gap hurts groups kept out of shaping shared words.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 437, x: 88, said: 1, gauge: 1, credit: 0.35,
    summary: {
      title: 'Wronged as a Knower',
      points: [
        'You can wrong somebody in their capacity as a knower',
        'Testimonial injustice deflates a speaker’s credibility through prejudice',
        'Hermeneutical injustice leaves an experience without shared concepts',
        'Fricker brought ethics into the theory of knowledge',
      ],
      closing: 'Whom you believe, and how far, is not only a question about truth. It’s also a question about justice.',
    },
    dur: 5.0,
  },
];
