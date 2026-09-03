import type { BaseBeat } from './cinematicKit';

// Cinematic metaphysics-being-15, "Does Cause Really Connect?"
//
// THE PICTURE: two balls with a gap between them, and a search running over that
// gap for the connection. The search comes back empty — and then the same search,
// run over the observer instead, finds it immediately. Where the connection turns
// up is the lesson.
//
// Q1 is A/B/C/D (Hume's diagnosis has to be told apart from "causes are not real",
// which is the overshoot); Q2 is answered on the stage (E34, H65).

export interface Meta15Beat extends BaseBeat {
  /** Figure gesture (emote code). */ p?: number;
  /** Where the figure stands (stage x). */ x?: number;
  /** The two balls are drawn, 0..1. */ balls?: number;
  /** 1 = the gap between them is marked and being searched. */ gap?: number;
  /** Search verdict: 0 none · 1 NOT FOUND out there · 2 FOUND, in the observer. */ found?: number;
  /** 1 = the three answer cards are live (Q2). */ pick?: number;
}

export const BEATS: Meta15Beat[] = [
  {
    p: 164, x: 70,
    text: 'One ball rolls up and strikes another, and the second rolls away. You have watched that ten thousand times.',
    dur: 3.5,
  },
  {
    p: 164, x: 70,
    text: 'Hume asks what exactly you saw.',
    dur: 1.8,
  },
  {
    p: 41, x: 168, balls: 1,
    text: 'You saw the first ball move. You saw it touch.',
    cite: 'What you saw',
    dur: 1.8,
  },
  {
    p: 41, x: 168, balls: 1,
    text: 'You saw the second move. Three things, all of them plain, none of them the thing we actually care about.',
    dur: 3.2,
  },
  {
    p: 383, x: 124, balls: 1, gap: 1,
    text: 'Between the touch and the movement is where the causing is supposed to live. Slow the film to a single frame and look straight at it.',
    cite: 'The gap',
    dur: 4.4,
  },
  {
    p: 147, x: 124, balls: 1, gap: 1,
    quote: {
      id: 'lq-metaphysics-being-15-1',
      text: 'All inferences from experience suppose, as their foundation, that the future will resemble the past.',
      author: 'David Hume',
      work: 'An Enquiry Concerning Human Understanding',
      era: '1748',
      philosopherId: 'david-hume',
      branchSlugs: ['metaphysics'],
    },
    dur: 3.8,
  },
  {
    p: 34, x: 168, balls: 1, gap: 1, found: 1,
    text: 'Nothing. One thing after another, over and over, and no glue anywhere. Hume answers that the glue is real, and that the glue is in you.',
    cite: 'Not found',
    dur: 4.6,
  },
  {
    p: 4, x: 124, balls: 1, gap: 1, found: 2,
    interact: {
      prompt: 'Drag to how much of the cause you actually see.',
      drag: {
        lo: 'ONE THING THEN ANOTHER',
        hi: 'THE PUSH ITSELF',
        start: 1,
        zones: [
          { id: 'events', upto: 0.3, reads: 'one thing, then the other' },
          { id: 'habit', upto: 0.74, reads: 'both things, plus your habit of expecting', correct: true },
          { id: 'force', upto: 1, reads: 'the push itself, plainly visible' },
        ],
      },
      explain: 'The middle, and the extra part is inside you. Hume keeps the events and the pattern. What he denies is the far end: nobody has ever seen the push. Pair two things often enough, build a habit of expecting the second, and call that tug necessity.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 6, x: 124, balls: 1, gap: 1, found: 2, pick: 1,
    interact: {
      prompt: 'The search found it on the second pass. Tap where.',
      explain: 'In the observer. Constant conjunction trains an expectation. And the felt push of that expectation is what we then report as seeing one thing make another happen.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'What You Now Know',
      points: [
        'We observe succession, never the connection itself',
        'Constant conjunction trains the mind to expect',
        'Causal power is projected habit, not perception',
        'Causal necessity is not logical necessity',
      ],
      closing: 'The glue is real enough. It is just on your side of the glass.',
    },
    dur: 3.0,
  },
];
