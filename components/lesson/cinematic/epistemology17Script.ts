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
  /** 1 = a small dashed loop patches each anomaly — the theory adjusted to
   *  absorb it. */ patch?: number;
  /** 1 = the old frame's own interior is tinted — the work that never tests
   *  its boundary. */ insideFill?: number;
  /** 1 = a "PARADIGM" tag names the old frame. */ paradigmTag?: number;
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
    g: 159, facts: 1, frame: 1, odd: 3, patch: 1,
    dur: 2.1,
    text: 'Instead, they adjust the theory to absorb each anomaly. Ptolemaic astronomers, for example, kept adjusting their system of circles.',
  },
  {
    g: 13, facts: 1, frame: 1, odd: 3, insideFill: 1,
    dur: 2.6,
    text: 'Thomas Kuhn based his account on the history of science. Most of science is not testing the frame.',
    cite: 'Normal science',
  },
  {
    g: 266, facts: 1, frame: 1, odd: 3, paradigmTag: 1,
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
      prompt: 'Put Kuhn\'s stages in order.',
      order: {
        axis: 'EARLIEST STAGE FIRST',
        items: [
          { id: 'few', reads: 'ODD RESULTS, EXPLAINED AWAY' },
          { id: 'pile', reads: 'THEY PILE UP INTO A CRISIS' },
          { id: 'new', reads: 'A NEW PARADIGM TAKES OVER' },
        ],
      },
      explain: 'Anomalies, crisis, replacement. Kuhn says one odd result never topples a paradigm. The field takes it on the chin and works on. What topples one is a pile of odd results big enough to shake trust, plus a rival already waiting.',
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
