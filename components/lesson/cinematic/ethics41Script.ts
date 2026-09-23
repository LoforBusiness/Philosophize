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
  /** 1 = a check stamps onto the DECLINE door, marking that opting out costs the same instant under either default. */ tick?: number;
}

export const BEATS: Ethics41Beat[] = [
  {
    p: 427, x: 28,
    text: 'Suppose you join a scheme because joining is the default. No one forced you, and no one gave you a reason.',
    dur: 4.2,
  },
  {
    p: 159, x: 28, doors: 1,
    text: 'There are three broad ways to influence a choice. Two are familiar: persuasion and force.',
    dur: 4.4,
  },
  {
    p: 448, x: 28, doors: 1, floorOn: 1,
    text: 'Persuasion offers reasons for the chooser to weigh. Force removes an option altogether.',
    dur: 4.4,
  },
  {
    p: 165, x: 28, doors: 1, floorOn: 1, tilt: 0.45,
    text: 'The third leaves every option open but sets the default, the outcome you get by doing nothing. Richard Thaler and Cass Sunstein call this a nudge.',
    dur: 4.6,
  },
  {
    p: 163, x: 28, doors: 1, floorOn: 1, tilt: 0.45, plates: 1, live: 1,
    interact: {
      prompt: 'Which does a nudge work on: your reasons, your habits or your money?',
      explain: 'Your habits. A default works through inertia, before you think it over. Giving reasons would be persuasion. Changing what things cost would alter your incentives, which a nudge leaves unchanged.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 451, x: 88, doors: 1, floorOn: 1, tilt: 0.45,
    text: 'Where organ donation is the default, far more people consent to be donors than where they must opt in.',
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
    p: 389, x: 88, doors: 1, floorOn: 1, tilt: 0.45, tick: 1,
    text: 'Declining takes the same few seconds in either system. Only the default has changed, yet the outcomes differ widely.',
    dur: 4.6,
  },
  {
    p: 168, x: 88, doors: 1, floorOn: 1,
    interact: {
      prompt: 'Put these in order, by how far each goes round your reason.',
      order: {
        axis: 'LEAST ROUND IT FIRST',
        items: [
          { id: 'argue', reads: 'PERSUASION YOU CAN REFUSE' },
          { id: 'nudge', reads: 'A NUDGE YOU NEED NOT NOTICE' },
          { id: 'force', reads: 'FORCE THAT CLOSES THE OPTION' },
        ],
      },
      explain: 'The nudge is where it starts. Persuasion works through reasons you can weigh and reject; force leaves nothing to weigh. What makes a nudge awkward is that it changes what you do without ever going through your judgement at all.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 322, x: 88, doors: 1, floorOn: 1, tilt: 0.45,
    summary: {
      title: 'Persuasion, Nudge and Force',
      points: [
        'Persuasion works through your reasons',
        'Force works by taking an option away',
        'A nudge sets a default and relies on habit',
        'A nudged chooser still believes the choice was their own',
      ],
      closing: 'The question is not only whether you could have chosen otherwise, but whether you were given reasons to choose with.',
    },
    dur: 4.4,
  },
];
