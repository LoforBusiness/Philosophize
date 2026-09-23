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
  /** 1 = a dashed ghost stands beside the kidney mark: the road not taken. */ stay?: number;
  /** 1 = a dashed span measures the gap from the line to the kidney mark. */ span?: number;
  /** 1 = a small tick marks the kidney act as earning praise. */ earn?: number;
  /** 1 = three bars over the marks read how each is judged. */ weigh?: number;
};

export const BEATS: Ethics29Beat[] = [
  {
    p: 422, x: 24, scale: 1, line: 0.4,
    text: 'In 1958, James Urmson described a soldier who throws himself onto a grenade to save his squad. Everyone calls the act heroic.',
    dur: 5.0,
  },
  {
    p: 179, x: 24, scale: 1, line: 0.4, stay: 1,
    text: 'A second question is harder. Would the soldier have been blameworthy if he had stayed where he was?',
    dur: 5.0,
  },
  {
    p: 448, x: 24, scale: 1, line: 0.4, span: 1,
    text: 'Urmson argued that he wouldn’t be, so the act goes beyond duty. A supererogatory act is good and not required.',
    dur: 5.0,
  },
  {
    p: 269, x: 24, scale: 1, line: 0.4, earn: 1,
    text: 'Such an act is praiseworthy if done, and not blameworthy if left undone. The special praise it earns depends on its not being owed.',
    dur: 5.0,
  },
  {
    p: 161, x: 24, scale: 1, line: 0.4, plates: 1, live: 1,
    interact: {
      prompt: 'If morality always requires the most good you can do, what is the soldier’s act?',
      explain: 'Only his duty. If the most good is always required, sacrificing himself is what he owes, and declining would be wrong. No category remains for praise beyond duty. He may still be admired, but not for going beyond what he owed.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 464, x: 80, scale: 1, line: 0.4,
    text: 'Consider three responses to others’ need. One person gives a fair share, one donates a kidney to a stranger, and one walks past.',
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
    p: 458, x: 80, scale: 1, line: 0.4, weigh: 1,
    text: 'Common sense praises the kidney donor highly and expects the fair share. Whether walking past deserves blame is less clear.',
    dur: 5.0,
  },
  {
    p: 177, x: 80, scale: 1,
    interact: {
      prompt: 'Put these in order, from least owed to most.',
      order: {
        axis: 'LEAST OWED FIRST',
        items: [
          { id: 'none', reads: 'NOTHING IS REQUIRED' },
          { id: 'fair', reads: 'A FAIR SHARE IS OWED' },
          { id: 'all', reads: 'EVERY GOOD YOU COULD DO' },
        ],
      },
      explain: 'Duty ends at the fair share. Past that lies supererogation: good to do, and not required. A theory with no such rung has to call every kindness you skip a wrong.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 311, x: 80, scale: 1, line: 0.4,
    summary: {
      title: 'Acts Beyond Duty',
      points: [
        'A supererogatory act is good but not required',
        'Praiseworthy to do, and not blameworthy to omit',
        'Urmson: heroes and saints go beyond what duty demands',
        'Strict maximising theories leave no room for it',
      ],
      closing: 'Without supererogation, heroism becomes mere duty, and most ordinary lives fall short of what morality requires.',
    },
    dur: 5.0,
  },
];
