import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic ethics-ethics-37, "Why a Promise Binds"
// Theme: A CORD THAT WAS NOT THERE, AND WHAT IS TIED TO THE OTHER END.
//
// The obligation is drawn as a cord between two posts. It does not exist on beat
// one; four words are said and it is there. Nothing else on the stage changed,
// which is Hume's whole complaint made visible.
//
// The reliance account is then staged underneath: the other person's plans are
// four small props that have been LEANED against the cord. Cut the cord and they
// fall — and they fall whether or not anyone is watching, which is the answer to
// the secret-breach question and is played rather than asserted.
//
// GAMIFIED SHAPE, inverted once more:
//   · beat 4  two CARDS first — what the wrong actually consists in.
//   · beat 7  a SCENE TARGET last — cut the cord in secret and tap what is
//     damaged. The right answer is the thing that fell while nobody looked.
// ─────────────────────────────────────────────────────────────────────────────

export interface Ethics37Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the two posts stand on stage. */ posts?: number;
  /** 1 = the cord runs between them. */ cord?: number;
  /** How many of the four plans are leaning on it, 0…1. */ lean?: number;
  /** 1 = the cord is cut and the plans have fallen. */ cut?: number;
  /** 1 = it was done unseen — the curtain is drawn across. */ unseen?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Ethics37Beat[] = [
  {
    p: 172, x: 54, posts: 1,
    text: 'Consider two people on an ordinary Tuesday. At this point, neither owes the other anything.',
    dur: 3.4,
  },
  {
    p: 2, x: 54, posts: 1, cord: 1,
    text: 'Now one speaker says four words: “I promise I will.”',
    dur: 2.4,
  },
  {
    p: 266, x: 54, posts: 1, cord: 1,
    text: 'Those words create an obligation that binds the speaker to the other person.',
    dur: 1.8,
  },
  {
    p: 13, x: 54, posts: 1, cord: 1,
    text: 'David Hume found this puzzling. Nothing else changes: no money moves and no law is passed.',
    cite: 'Hume, 1740',
    dur: 1.9,
  },
  {
    p: 266, x: 54, posts: 1, cord: 1,
    text: 'Yet a duty now exists where none existed a moment before. Hume concluded that only a human convention could explain the change.',
    dur: 2.9,
  },
  {
    p: 461, x: 54, posts: 1, cord: 1, lean: 1,
    interact: {
      prompt: 'How is the wrong of a broken promise divided between the person and the practice?',
      split: {
        left: 'ON THE PERSON PROMISED', right: 'ON THE PRACTICE',
        start: 0.04,
        zones: [
          { id: 'practice', upto: 0.3, reads: 'on the practice of promising' },
          { id: 'both', upto: 0.66, reads: 'equally on the person and the practice' },
          { id: 'friend', upto: 1, reads: 'on the person you gave your word to', correct: true },
        ],
      },
      explain: 'On the person you gave your word to. Hume grounds the duty in the practice of promising. Scanlon argues that breaking a promise wrongs the person you assured.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 467, x: 54, posts: 1, cord: 1, lean: 1,
    text: 'Meanwhile, the other person has come to rely on the promise, and has cancelled a plan.',
    dur: 2.9,
  },
  {
    p: 467, x: 54, posts: 1, cord: 1, lean: 1,
    text: 'They’ve told a friend and stopped looking for any other arrangement.',
    dur: 1.8,
  },
  {
    p: 440, x: 54, posts: 1, cord: 1, lean: 1,
    quote: {
      id: 'lq-ethics-ethics-37-1',
      text: 'A promise would not be intelligible before human conventions had established it.',
      author: 'David Hume',
      philosopherId: 'david-hume',
      work: 'A Treatise of Human Nature',
      era: '1740',
      branchSlugs: ['ethics'],
    },
    dur: 3.8,
  },
  {
    p: 12, x: 54, posts: 1, lean: 1, cut: 1, unseen: 1, live: 1,
    interact: {
      prompt: 'If you break the promise in secret, what has still been damaged?',
      explain: 'Their plans. The plans failed when you broke the promise, not when anyone found out. Secrecy protects you from blame, but it doesn’t undo the wrong to the person you promised.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 400, x: 126, posts: 1, lean: 1, cut: 1,
    text: 'A secret breach separates the two accounts. If the wrong were only to the practice, a breach that no one discovers would leave the practice almost untouched.',
    dur: 4.8,
  },
  {
    summary: {
      title: 'Four Words and a Duty',
      points: [
        'A promise makes an obligation out of a sentence',
        'Hume holds that promising depends on human convention',
        'Scanlon holds that the wrong is done to the promisee',
        'A secret breach still wrongs the person promised',
      ],
      closing: 'Promising is so common that its power to create an obligation from words alone is easy to overlook.',
    },
    dur: 3.2,
  },
];
