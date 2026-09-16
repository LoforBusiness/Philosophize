import type { BaseBeat } from './cinematicKit';

// Cinematic epistemology-knowledge-17, "When Science Changes Its Mind"
//
// THE PICTURE: a field of facts that never move, and a frame drawn round some of
// them. Anomalies collect outside the frame until it will not hold, and then a
// SECOND frame is drawn in a different place — over the same facts, not one of
// which has changed (H64).
//
// Kuhn is routinely read as saying science is arbitrary, and the picture is the
// cheapest defence against that: every dot stays exactly where it was. What moved
// was the boundary around them, which is a real thing to move and not a licence to
// believe anything.
//
// STAGING: the Q1 decoys are the two answers a reader gives before Kuhn — that the
// facts changed, or that better instruments found new ones. Both are what actually
// happens in ordinary science, which is why they are tempting here (H66).

export interface Epi17Beat extends BaseBeat {
  /** Figure gesture (emote code). */ g?: number;
  /** The field of facts, 0…1. */ facts?: number;
  /** The old frame around them, 0…1. */ frame?: number;
  /** How many anomalies have collected outside it, 0…3. */ odd?: number;
  /** The new frame, drawn over the same facts, 0…1. */ shift?: number;
  /** 1 = the three boards are live targets (Q1). */ pick?: number;
}

export const BEATS: Epi17Beat[] = [
  {
    g: 462, facts: 1, frame: 1,
    dur: 4.6,
    text: 'A scientific theory places a frame around the facts it explains. Inside the frame, those facts fit what the theory expects.',
  },
  {
    g: 159, facts: 1, frame: 1, odd: 3,
    dur: 2.7,
    text: 'Some results don’t fit the theory. These are anomalies, and scientists rarely abandon a theory because of them.',
    cite: 'Anomalies',
  },
  {
    g: 159, facts: 1, frame: 1, odd: 3,
    dur: 2.1,
    text: 'Instead, they adjust the theory to absorb each anomaly. Ptolemaic astronomers, for example, kept adjusting their system of circles.',
  },
  {
    g: 13, facts: 1, frame: 1, odd: 3,
    dur: 2.6,
    text: 'Thomas Kuhn based his account on the history of science. Most of science is not testing the frame.',
    cite: 'Normal science',
  },
  {
    g: 266, facts: 1, frame: 1, odd: 3,
    dur: 2,
    text: 'Kuhn calls this work within the frame normal science. He calls the frame itself a paradigm.',
  },
  {
    g: 465, facts: 1, frame: 1, odd: 3,
    dur: 3.8,
    quote: {
      id: 'lq-epistemology-knowledge-17-1',
      text: 'The successive transition from one paradigm to another via revolution is the usual developmental pattern of mature science.',
      author: 'Thomas Kuhn',
      work: 'The Structure of Scientific Revolutions',
      era: '1962',
      philosopherId: 'thomas-kuhn',
      branchSlugs: ['epistemology'],
    },
  },
  {
    g: 412, facts: 1, frame: 1, odd: 3, shift: 1,
    dur: 5.0,
    text: 'Then a revolution replaces the whole paradigm. Copernicus put the sun at the centre, and the facts took a new order without one of them moving.',
    cite: 'The revolution',
  },
  {
    g: 165, facts: 1, frame: 1, odd: 3, shift: 1, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'What changed when the paradigm changed?',
      explain: 'The frame. Every fact is where it was before the new frame was drawn. For Kuhn, the world doesn’t change in a revolution, but the framework through which scientists see it does.',
      xp: 5,
    },
  },
  {
    g: 41, facts: 1, frame: 1, odd: 3, shift: 1,
    dur: 1.0,
    interact: {
      prompt: 'On Kuhn’s account, what does it take to overturn a paradigm?',
      drag: {
        lo: 'ONE DECISIVE RESULT',
        hi: 'MANY ANOMALIES OVER YEARS',
        start: 0,
        zones: [
          { id: 'one', upto: 0.3, reads: 'a single anomaly refutes the theory' },
          { id: 'few', upto: 0.6, reads: 'a few anomalies, each explained away' },
          { id: 'crisis', upto: 1, reads: 'enough anomalies to produce a crisis', correct: true },
        ],
      },
      explain: 'Enough anomalies to produce a crisis. Kuhn denied that one result is enough to overturn a theory. In normal science, odd results get set aside. A paradigm falls only when unsolved problems build into a crisis and a rival is ready.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'Paradigms and Revolutions',
      points: [
        'Normal science solves puzzles inside a shared paradigm',
        'Anomalies accumulate until the framework is in crisis',
        'A revolution replaces the paradigm, not the facts',
        'Science doesn’t grow only by accumulating facts',
      ],
      closing: 'Kuhn wrote that after a revolution, scientists work in a different world. The world itself hasn’t changed.',
    },
    dur: 3.0,
  },
];
