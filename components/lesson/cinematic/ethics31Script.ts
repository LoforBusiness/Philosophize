import type { BaseBeat } from './cinematicKit';

// Cinematic ethics-ethics-31, "Nobody Owes the Impossible".
//
// THE PICTURE: a shelf, a ladder, and a lamp reading DUTY. The figure climbs and
// the ladder runs out; the lamp goes dark on the same beat, and comes back the
// instant the ladder is extended. The lamp is wired to the reach, not to anybody's
// opinion of the climber.
//
// STAGING, unlike every sibling: the figure CLIMBS on the spot while the world
// scrolls past it (C22d), and the three answer targets are scattered objects
// already in the scene — the shelf, the top rung, the lamp — rather than a row of
// cards. What "correct" looks like is unchanged (H61).

export interface Ethics31Beat extends BaseBeat {
  /** Climb gesture when NOT climbing: 0 hold · 1 reach up · 2 give up · 3 look at it. */ p?: number;
  /** How far the ladder has scrolled, in rungs. The climb cycle is driven by this
   *  same number, so the legs and the world can never run at different rates. */ rungs?: number;
  /** How high the ladder reaches: 0 none · 1 short · 2 tall enough. */ ladder?: number;
  /** The DUTY lamp: 0 off · 1 lit. */ duty?: number;
  /** 1 = the shelf, the top rung and the lamp are live targets (Q1). */ pick?: number;
}

export const BEATS: Ethics31Beat[] = [
  {
    p: 383, rungs: 0, ladder: 0, duty: 1,
    dur: 4.2,
    text: 'Suppose you have a duty to fetch something from a high shelf. The question is whether that duty depends on your ability to reach it.',
  },
  {
    p: 462, rungs: 4, ladder: 1, duty: 1,
    dur: 2.6,
    text: 'Given a ladder, you climb four rungs. Your reach grows, but the shelf is still some way above you.',
    cite: 'Climbing',
  },
  {
    p: 462, rungs: 4, ladder: 1, duty: 1,
    dur: 2,
    text: 'The duty is unchanged, because the task is still possible for you. Being closer to the shelf doesn’t make the duty any stronger.',
  },
  {
    p: 167, rungs: 7, ladder: 1, duty: 0,
    dur: 4.1,
    text: 'Then the ladder ends. Even at full stretch you can’t reach the shelf, so the task is now impossible.',
    cite: 'The ladder ends',
  },
  {
    p: 167, rungs: 7, ladder: 1, duty: 0,
    dur: 1.8,
    text: 'When a task becomes impossible, the duty to perform it lapses. This principle is called “ought implies can”.',
  },
  {
    p: 384, rungs: 7, ladder: 1, duty: 0,
    dur: 3.8,
    quote: {
      id: 'lq-ethics-ethics-31-1',
      text: 'He judges that he can do something because he is aware that he ought to do it.',
      author: 'Immanuel Kant',
      work: 'Critique of Practical Reason',
      era: '1788',
      philosopherId: 'immanuel-kant',
      branchSlugs: ['ethics'],
    },
  },
  {
    p: 460, rungs: 11, ladder: 2, duty: 1,
    dur: 3.2,
    text: 'Once the ladder is extended, the duty returns at once. Nothing about your character has changed, only your ability.',
    cite: 'Ability restored',
  },
  {
    p: 460, rungs: 11, ladder: 2, duty: 1,
    dur: 1.8,
    text: 'So the duty depends on ability, not on merit. It holds while the task is within your power and lapses when it isn’t.',
  },
  {
    p: 459, rungs: 11, ladder: 1, duty: 0, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'If your reach falls short again, which must give way: the shelf, your reach or the duty?',
      explain: 'The duty gives way. The height of the shelf and the limit of your reach are fixed facts. A duty can’t require what those facts make impossible, so the duty lapses.',
      xp: 5,
    },
  },
  {
    p: 168, rungs: 11, ladder: 1, duty: 0,
    dur: 1.0,
    interact: {
      prompt: 'Which verdict shows where “ought implies can” stops excusing a failure?',
      poll: {
        options: [
          { id: 'own', reads: 'unable through your own doing: still answerable', holders: ['Aristotle'], correct: true },
          { id: 'excused', reads: 'unable through no fault of yours: excused', holders: ['Immanuel Kant'] },
          { id: 'plain', reads: 'able to act, and you didn’t: answerable', holders: ['Thomas Aquinas'] },
          { id: 'odd', reads: 'able, yet only at mortal risk: answerable', holders: ['Socrates'] },
        ],
      },
      explain: 'Unable through your own doing: still answerable. You caused the inability, so it can’t excuse you. A driver too drunk to brake remains answerable for the crash.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'Nobody Owes the Impossible',
      points: [
        'An obligation cannot exceed what you can do',
        'A duty lapses when its task becomes impossible',
        'Restore the ability, and the duty returns',
        'An inability you caused yourself doesn’t excuse you',
      ],
      closing: 'Before judging whether someone should have acted, ask whether they could have. If not, ask whether they made themselves unable.',
    },
    dur: 3.0,
  },
];
