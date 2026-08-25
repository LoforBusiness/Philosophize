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
    p: 25, x: 54, posts: 1,
    text: 'Two people stand apart on an ordinary Tuesday. Neither owes the other a thing.',
    dur: 3.4,
  },
  {
    p: 2, x: 54, posts: 1, cord: 1,
    text: 'Now one speaker says four words. I promise I will. Watch the cord appear between the two.',
    dur: 4.0,
  },
  {
    p: 13, x: 54, posts: 1, cord: 1,
    text: 'Nothing else changed. No money moved, no law was passed. A sound was made and a duty exists that did not exist a second earlier.',
    cite: 'Hume, 1740',
    dur: 4.8,
  },
  {
    p: 4, x: 54, posts: 1, cord: 1, lean: 1,
    interact: {
      prompt: 'So where does the wrong of breaking it actually land?',
      cards: [
        { text: 'On whoever relied on you', correct: true },
        { text: 'On the practice of promising', correct: false },
      ],
      explain: 'The practice matters, and the practice is the other main answer. But that answer makes your own friend an afterthought. Scanlon puts the friend first. She arranged her week around your word, and a broken promise leaves her standing there.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 21, x: 54, posts: 1, cord: 1, lean: 1,
    text: 'Look what is leaning on the cord now. The other person cancelled a plan. Told a friend. Stopped hunting for another way.',
    dur: 4.6,
  },
  {
    p: 47, x: 54, posts: 1, cord: 1, lean: 1,
    quote: {
      id: 'lq-ethics-ethics-37-1',
      text: 'A promise would not be intelligible before human conventions had established it.',
      author: 'David Hume',
      work: 'A Treatise of Human Nature',
      era: '1740',
      branchSlugs: ['ethics'],
    },
    dur: 3.8,
  },
  {
    p: 12, x: 54, posts: 1, lean: 1, cut: 1, unseen: 1, live: 1,
    interact: {
      prompt: 'You break it, and they never find out. Tap what was damaged anyway.',
      explain: 'Their plans. They are already down, and they went down at the moment you decided rather than at the moment anyone noticed. Secrecy protects you from the consequences and does nothing about the wrong.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 35, x: 126, posts: 1, lean: 1, cut: 1,
    text: 'Which is the test that separates the two accounts. If the wrong were only to the practice, a breach nobody hears of costs almost nothing.',
    dur: 4.8,
  },
  {
    summary: {
      title: 'Four Words and a Duty',
      points: [
        'A promise makes an obligation out of a sentence',
        'Hume: only a convention explains that',
        'Scanlon: the wrong is to whoever relied on you',
        'Secrecy does not repair it',
      ],
      closing: 'The strangest part is how ordinary a promise feels. You make one most weeks and never once stop to find that remarkable.',
    },
    dur: 3.2,
  },
];
