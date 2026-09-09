import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic ethics-ethics-29, "Above And Beyond The Call"
// Theme: THREE PEOPLE ON ONE SCALE, AND A LINE THAT DECIDES WHAT THEY OWED.
//
// Supererogation is not a claim about any act. It is a claim about where a LINE
// falls, so the stage draws three acts standing still and one line that moves.
// Nothing anybody does changes; what changes is whether they were required to.
//
// The three marks keep their places for the whole lesson. A reader who drags the
// line to the far end can watch the hero stop being a hero and become somebody
// merely doing their job, which is exactly the objection the lesson is about.
//
// GAMIFIED SHAPE:
//   · beat 4  SCENE TARGETS — three plates, and the reader taps what a strict
//     maximise-the-good rule does to heroism. On the stage because the line and
//     the three marks are already there to be looked at.
//   · beat 8  a DRAG — where duty ends. Every mark relabels as the line passes
//     it, so the reader can see a whole moral vocabulary move at once.
// ─────────────────────────────────────────────────────────────────────────────

export interface Ethics29Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the scale and its three marks are drawn. */ scale?: number;
  /** Where the line of duty falls along the scale, 0…1. */ line?: number;
  /** 1 = the three plates the reader chooses between are up. */ plates?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
};

export const BEATS: Ethics29Beat[] = [
  {
    p: 422, x: 24, scale: 1, line: 0.4,
    text: 'A soldier throws himself onto a grenade and saves his squad. Everybody calls it heroic.',
    dur: 5.0,
  },
  {
    p: 179, x: 24, scale: 1, line: 0.4,
    text: 'Now ask the harder question. Would anybody have blamed him for staying where he was?',
    dur: 5.0,
  },
  {
    p: 448, x: 24, scale: 1, line: 0.4,
    text: 'The gap between those two answers has a name. A supererogatory act is good and not required.',
    dur: 5.0,
  },
  {
    p: 269, x: 24, scale: 1, line: 0.4,
    text: 'Praiseworthy if done, and not blameworthy if left undone. The honour depends on the gift being a gift.',
    dur: 5.0,
  },
  {
    p: 161, x: 24, scale: 1, line: 0.4, plates: 1, live: 1,
    interact: {
      prompt: 'Tap what the grenade becomes if the most good is always owed.',
      explain: 'Only his duty. If the most good is always owed, the grenade is bare duty and anybody who declines does wrong. The special admiration has nowhere left to attach.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 464, x: 80, scale: 1, line: 0.4,
    text: 'Three people pass a charity drive. One gives a fair share, one gives a kidney, one walks past.',
    dur: 5.0,
  },
  {
    p: 441, x: 80, scale: 1, line: 0.4,
    quote: {
      id: 'lq-ethics-ethics-29-1',
      text: 'It seems that we should not so quickly assume that morality always requires us to do as much good as we possibly can.',
      author: 'Susan Wolf',
      work: 'Moral Saints',
      era: '1982',
      branchSlugs: ['ethics'],
    },
    dur: 5.0,
  },
  {
    p: 458, x: 80, scale: 1, line: 0.4,
    text: 'Lavish praise for the second, quiet expectation of the first, and perhaps no blame at all for the third.',
    dur: 5.0,
  },
  {
    p: 177, x: 80, scale: 1,
    interact: {
      prompt: 'Where does duty end and a gift begin?',
      drag: {
        lo: 'NOTHING OWED',
        hi: 'EVERYTHING OWED',
        start: 0.95,
        zones: [
          { id: 'none', upto: 0.2, reads: 'nobody owes anybody anything at all' },
          { id: 'fair', upto: 0.65, reads: 'a fair share is owed and the rest given', correct: true },
          { id: 'all', upto: 1, reads: 'give until it hurts, or stand condemned' },
        ],
      },
      explain: 'Somewhere in the middle. A fair share is a duty and the kidney is a gift, which is the only arrangement that leaves room to admire the second. Push the line to the far end and every ordinary life becomes a moral failure.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 311, x: 80, scale: 1, line: 0.4,
    summary: {
      title: 'Above and Beyond',
      points: [
        'A supererogatory act is good but not required',
        'Praiseworthy to do, and not blameworthy to omit',
        'Heroes and saints act past what duty demands',
        'Strict maximising theories leave no room for it',
      ],
      closing: 'A morality with no room for the heroic gift may demand too much, or admire too little.',
    },
    dur: 5.0,
  },
];
