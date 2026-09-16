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
    p: 462, x: 70,
    text: 'Consider one ball striking another, which then rolls away. The first ball seems to make the second one move.',
    dur: 3.5,
  },
  {
    p: 462, x: 70,
    text: 'David Hume asks what observation reveals when one event causes another.',
    dur: 1.8,
  },
  {
    p: 270, x: 168, balls: 1,
    text: 'You observe the first ball moving, and then its contact with the second ball.',
    cite: 'What is observed',
    dur: 1.8,
  },
  {
    p: 270, x: 168, balls: 1,
    text: 'Then the second ball moves. You see contact and one event after another, but you never see the necessary connection.',
    dur: 3.2,
  },
  {
    p: 383, x: 124, balls: 1, gap: 1,
    text: 'A necessary connection is a link that makes the effect follow. If such a link can be observed, it must lie between contact and motion.',
    cite: 'Where the connection should be',
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
    text: 'Hume finds the two events conjoined but never observed to be connected. So the idea of connection can’t come from the objects.',
    cite: 'Conjoined, never connected',
    dur: 4.6,
  },
  {
    p: 165, x: 124, balls: 1, gap: 1, found: 2,
    interact: {
      prompt: 'If no link between events is ever observed, what does a claim about cause contain?',
      drag: {
        lo: 'SUCCESSION ALONE',
        hi: 'AN OBSERVED FORCE',
        start: 1,
        zones: [
          { id: 'events', upto: 0.3, reads: 'one event followed by another, and nothing more' },
          { id: 'habit', upto: 0.74, reads: 'both events, plus a learned habit of expectation', correct: true },
          { id: 'force', upto: 1, reads: 'an observed force passing from one to the other' },
        ],
      },
      explain: 'Both events, plus a learned habit of expectation. After seeing the pair many times, the mind comes to expect the second event. Hume traces the idea of necessary connection to that habit. No force between the balls is ever seen.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 6, x: 124, balls: 1, gap: 1, found: 2, pick: 1,
    interact: {
      prompt: 'If necessary connection isn’t observed in the objects, where must it come from?',
      explain: 'The mind. Repeated conjunction produces a habit of expecting the second event. Hume holds that the idea of necessity is copied from this felt expectation, not from the gap.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Hume’s Account of Necessary Connection',
      points: [
        'Observation shows succession, never the connection itself',
        'Constant conjunction produces a habit of expectation',
        'Hume traces necessary connection to that felt expectation',
        'Causal necessity is not logical necessity',
      ],
      closing: 'Hume concludes that necessity is something that exists in the mind, not in objects.',
    },
    dur: 3.0,
  },
];
