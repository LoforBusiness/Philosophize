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
    text: 'You can wrong somebody without telling a single lie. Simply refusing to believe a speaker will do.',
    dur: 4.6,
  },
  {
    p: 160, x: 28, said: 1, gauge: 1, credit: 1,
    text: 'A patient describes her symptoms accurately. The report is true and well put.',
    dur: 4.6,
  },
  {
    p: 436, x: 28, said: 1, gauge: 1, credit: 0.35,
    text: 'The doctor hears anxiety, because she is young. Her word is worth less on arrival.',
    dur: 4.8,
  },
  {
    p: 264, x: 28, said: 1, gauge: 1, credit: 0.35,
    text: 'Miranda Fricker gave the wrong a name: testimonial injustice. A bias marks down what a speaker says.',
    dur: 5.0,
  },
  {
    p: 163, x: 28, said: 1, gauge: 1, credit: 0.35, plates: 1, live: 1,
    interact: {
      prompt: 'A juror believes a witness less for his accent. Tap the wrong.',
      explain: 'Testimonial. The witness can speak and be understood perfectly well; what happens is that prejudice lowers how far the juror credits him. That deflation is the signature, and it is the whole of the harm.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 451, x: 88, said: 1, gauge: 1, credit: 0.35,
    text: 'There is a second kind, and it lands earlier. Sometimes a group has no words for what happened.',
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
    text: 'Before anybody said sexual harassment, victims could feel the wrong and not name it.',
    dur: 5.0,
  },
  {
    p: 168, x: 88, said: 1, gauge: 1, credit: 0.35,
    interact: {
      prompt: 'A harm nobody has a word for. Which kind is it?',
      sort: {
        chip: 'no word for it yet',
        bins: [
          { id: 'test', label: 'testimonial', reads: 'the words arrive and are marked down' },
          { id: 'herm', label: 'hermeneutical', reads: 'there were never any words to send', correct: true },
          { id: 'none', label: 'no injustice', reads: 'a gap in the language wrongs nobody' },
        ],
      },
      explain: 'Hermeneutical. Nothing has been deflated, because nothing got as far as being said — the plate is empty rather than the gauge. Calling a gap in the shared language harmless is the answer Fricker set out to refuse: somebody carries the cost of it, and it is never the majority.',
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
        'Testimonial injustice deflates what a speaker is owed',
        'Hermeneutical injustice removes the words to say it',
        'Fricker put ethics inside the theory of knowledge',
      ],
      closing: 'Whom you believe, and how far, is not only a question about truth. It is also a question about justice.',
    },
    dur: 5.0,
  },
];
