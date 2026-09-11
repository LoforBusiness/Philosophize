import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic ethics-ethics-41, "Nudged, Not Forced"
// Theme: TWO DOORS, A FLOOR THAT TILTS, AND A BALL THAT NEVER GETS PUSHED.
//
// The distinction the lesson is after is invisible in the outcome and obvious in
// the mechanism, so the picture draws the mechanism. Both doors stay open the
// whole way along; what changes is the slope under them and, at the far end, a
// shutter coming down over one.
//
// Nothing ever touches the ball. That is the point of drawing a ball at all — a
// hand pushing it would be force, and the whole difficulty with a nudge is that
// there is no push anywhere in the picture and it still ends up on one side.
//
// GAMIFIED SHAPE:
//   · beat 4  SCENE TARGETS — three plates, and the reader taps what a nudge
//     works on. On the stage because the tilt is already under the ball and
//     nothing has been said to it.
//   · beat 8  a DRAG — the slope itself, run from level to shut. The reader finds
//     the boundary by watching the readings change, which is where the boundary
//     actually is.
// ─────────────────────────────────────────────────────────────────────────────

export interface Ethics41Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the two doors are standing. */ doors?: number;
  /** 1 = the floor and the ball resting on it are drawn. */ floorOn?: number;
  /** How far the floor is tilted toward the default door, 0…1. */ tilt?: number;
  /** 1 = the three plates the reader chooses between are up. */ plates?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Ethics41Beat[] = [
  {
    p: 427, x: 28,
    text: 'Nobody made you sign the form. Nobody gave you a reason to, either.',
    dur: 4.2,
  },
  {
    p: 159, x: 28, doors: 1,
    text: 'There are three ways to move somebody, and only two of them have names.',
    dur: 4.4,
  },
  {
    p: 448, x: 28, doors: 1, floorOn: 1,
    text: 'Give somebody reasons, and let the reasons be weighed. Or take the option away.',
    dur: 4.4,
  },
  {
    p: 165, x: 28, doors: 1, floorOn: 1, tilt: 0.45,
    text: 'Or leave both doors open, and arrange the answer somebody gets by doing nothing.',
    dur: 4.6,
  },
  {
    p: 163, x: 28, doors: 1, floorOn: 1, tilt: 0.45, plates: 1, live: 1,
    interact: {
      prompt: 'Tap what a nudge actually works on.',
      explain: 'Your habits. Defaults, framing and plain inertia settle the matter before any reasoning starts. Nudges are cheap to build, and work even on people who know all about nudges. Working on reasons would be an argument; removing a door would be a rule.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 451, x: 88, doors: 1, floorOn: 1, tilt: 0.45,
    text: 'Countries with opt-out organ donation get far more donors than countries with opt-in.',
    dur: 4.8,
  },
  {
    p: 424, x: 88, doors: 1, floorOn: 1, tilt: 0.45,
    quote: {
      id: 'lq-ethics-ethics-41-1',
      text: 'The human faculties of perception, judgment, discriminative feeling, mental activity, and even moral preference, are exercised only in making a choice.',
      author: 'John Stuart Mill',
      philosopherId: 'john-stuart-mill',
      work: 'On Liberty',
      era: '1859',
      branchSlugs: ['ethics'],
    },
    dur: 5.0,
  },
  {
    p: 389, x: 88, doors: 1, floorOn: 1, tilt: 0.45,
    text: 'The form takes the same ten seconds either way. Only the resting answer changed.',
    dur: 4.6,
  },
  {
    p: 168, x: 88, doors: 1, floorOn: 1,
    interact: {
      prompt: 'Where does influence stop treating you as a chooser?',
      drag: {
        lo: 'GIVING REASONS',
        hi: 'LEAVING NO CHOICE',
        start: 0.03,
        zones: [
          { id: 'reasons', upto: 0.3, reads: 'persuasion — you can say no, and know why' },
          { id: 'nudge', upto: 0.68, reads: 'a nudge — it works whether you notice or not', correct: true },
          { id: 'force', upto: 1, reads: 'force — the other door is simply shut' },
        ],
      },
      explain: 'At the nudge. Force is the obvious wrong and the duller one. It overrules your judgement and leaves it intact, and you know what happened. A nudge goes around your judgement and leaves you sure you decided. That’s far harder to consent to.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 322, x: 88, doors: 1, floorOn: 1, tilt: 0.45,
    summary: {
      title: 'The Tilted Floor',
      points: [
        'Persuasion works through your reasons',
        'Force works by taking an option away',
        'A nudge works around both, on your habits',
        'Its trace is that you still feel you chose',
      ],
      closing: 'The test is not whether you could have done otherwise. The test is whether you were given anything to think with.',
    },
    dur: 4.4,
  },
];
