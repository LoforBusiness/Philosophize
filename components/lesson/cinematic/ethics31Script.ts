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
    p: 3, rungs: 0, ladder: 0, duty: 1,
    dur: 4.2,
    text: 'Something is on a shelf and you have been told to fetch it. The duty is lit, and at this point nobody has asked whether you can.',
  },
  {
    p: 0, rungs: 4, ladder: 1, duty: 1,
    dur: 4.6,
    text: 'A ladder appears, so you climb. Four rungs, and the shelf is closer. Nothing about the duty has changed because nothing needed to.',
    cite: 'Climbing',
  },
  {
    p: 1, rungs: 7, ladder: 1, duty: 0,
    dur: 4.8,
    text: 'The ladder ends. You stretch, and the shelf is still above your hand — genuinely, not lazily. Watch the lamp.',
    cite: 'The ladder ends',
  },
  {
    p: 2, rungs: 7, ladder: 1, duty: 0,
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
    p: 0, rungs: 11, ladder: 2, duty: 1,
    dur: 4.6,
    text: 'Now extend the ladder. The lamp comes straight back on, and you did not become a better person in between. The duty was tracking the reach the whole time.',
    cite: 'Give it the reach',
  },
  {
    p: 1, rungs: 11, ladder: 1, duty: 0, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'Take the reach away again. Tap the thing that has to give.',
      explain: 'The obligation. It cannot be the shelf, which is where it is, and it cannot be your reach, which is what it is. Kant\'s point is that a duty nobody could meet was never a duty.',
      xp: 5,
    },
  },
  {
    p: 3, rungs: 11, ladder: 1, duty: 0,
    dur: 1.0,
    interact: {
      prompt: 'What does "ought implies can" NOT excuse?',
      cards: [
        { text: 'Inability you caused yourself', correct: true },
        { text: 'Nothing, inability always excuses', correct: false },
      ],
      explain: 'The trap is the other card, which turns the principle into a blanket excuse. A driver who cannot brake because they chose to drink is still answerable: the inability is real, and they authored it.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'Nobody Owes the Impossible',
      points: [
        'An obligation cannot exceed what you can do',
        'Unmeetable duties guide nobody',
        'Give the ability and the duty reappears',
        'Inability you caused excuses nothing',
      ],
      closing: 'Before asking whether someone should have, ask whether they could have. That question comes first.',
    },
    dur: 3.0,
  },
];
