import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic epistemology-knowledge-34, "How Sure Are You, Really?" — the DRAG
// mechanic (../DragScale) driving TWO bars instead of one picture.
//
// The left bar is what you claim and the reader owns it. The right bar is how
// often that claim holds, and it rises far more slowly. Nobody has to be told the
// gap opens at the top: they open it themselves, and they can feel the right-hand
// bar refusing to keep up under their thumb. That is the lesson as a gesture.
// ─────────────────────────────────────────────────────────────────────────────

export interface Epistemology34Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** What is being claimed, 0 (a coin flip) … 1 (certain). */ claim?: number;
  /** 1 = the reader is driving the claim from the rail (Q1). */ live?: number;
  /** 1 = the gap between the two bars is called out. */ gap?: number;
  /** 1 = a dashed outline marks the still-empty right-hand column. */ holdSlot?: number;
  /** 1 = a small dot marks the still-small gap between the bar tops. */ note?: number;
  /** 1 = the gap between the bars is named: overconfidence. */ gapLbl?: number;
  /** 1 = a dashed line at the claim bar's own height shows where the right bar would need to reach. */ target?: number;
  /** 1 = two small matching bars illustrate a calibrated case: right half the time, claiming no more. */ example?: number;
}

export const BEATS: Epistemology34Beat[] = [
  {
    p: 462, x: 54, claim: 0,
    text: 'Consider two bars. The left bar shows how confident you say you are.',
    dur: 1.8,
  },
  {
    p: 462, x: 54, claim: 0, holdSlot: 1,
    text: 'The right bar shows how often claims made with that confidence turn out true.',
    dur: 2.2,
  },
  {
    p: 47, x: 54, claim: 0.3,
    text: 'At low confidence the two bars agree. When you call something a coin flip, it happens about half the time.',
    cite: 'At low confidence',
    dur: 3.5,
  },
  {
    p: 267, x: 54, claim: 0.3, note: 1,
    text: 'The mismatch between the two bars is usually small at this level.',
    dur: 1.8,
  },
  {
    p: 19, x: 54, claim: 0.95, gap: 1,
    text: 'Now suppose you say you’re certain. The left bar rises to the top.',
    cite: 'The gap opens',
    dur: 2,
  },
  {
    p: 169, x: 54, claim: 0.95, gap: 1, gapLbl: 1,
    text: 'The right bar doesn’t rise as far. The difference between the bars is overconfidence.',
    dur: 2.6,
  },
  {
    p: 467, x: 54, claim: 0.95, gap: 1, gapLbl: 1, target: 1,
    text: 'Being well calibrated means those two bars match. Calibration is therefore different from being right often.',
    cite: 'Calibration',
    dur: 3,
  },
  {
    p: 467, x: 54, claim: 0.95, gap: 1, gapLbl: 1, target: 1, example: 1,
    text: 'Someone who is right half the time, and claims no more than that, is well calibrated.',
    dur: 1.8,
  },
  {
    p: 465, x: 54, claim: 0.95,
    quote: {
      id: 'lq-epistemology-knowledge-34-1',
      text: 'The whole problem with the world is that fools and fanatics are always so certain of themselves, and wiser people so full of doubts.',
      author: 'Bertrand Russell',
      philosopherId: 'bertrand-russell',
      work: 'Mortals and Others',
      era: '1933',
      branchSlugs: ['epistemology'],
    },
    dur: 3.8,
  },
  {
    p: 461, x: 54, claim: 0, live: 1,
    interact: {
      prompt: 'As claimed confidence rises, which shape does accuracy take?',
      plot: {
        cols: ['50% SURE', '80% SURE', 'CERTAIN'],
        axis: 'HOW OFTEN RIGHT',
        start: [0.5, 0.5, 0.5],
        shapes: [
          { id: 'gap', profile: [0.5, 0.62, 0.7, 0.75, 0.78], reads: 'it trails further behind the higher you go', correct: true },
          { id: 'match', profile: [0.5, 0.65, 0.8, 0.9, 1], reads: 'it keeps pace all the way' },
          { id: 'over', profile: [0.6, 0.75, 0.88, 0.96, 1], reads: 'it runs ahead of what you claim' },
        ],
      },
      explain: 'It trails further behind. People are roughly calibrated at middling confidence and worst at the top, so the widest gap sits where certainty is claimed. That\'s why being sure is poor evidence that you\'re right.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 383, x: 54, claim: 0.72, gap: 1,
    text: 'A gap can be closed from either end. Claimed confidence is the end you can change at once.',
    cite: 'Adjusting the claim',
    dur: 4.4,
  },
  {
    p: 379, x: 54, claim: 0.72, gap: 1,
    interact: {
      prompt: 'What is the quickest way to become better calibrated?',
      cards: [
        { text: 'Claim less confidence', correct: true },
        { text: 'Learn more facts', correct: false },
      ],
      explain: 'Claim less confidence. Learning more facts can raise accuracy, but slowly. Lowering an inflated claim closes the gap at once, because calibration measures a match, not a score.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Calibration and Overconfidence',
      points: [
        'Calibration is confidence matching accuracy',
        'Calibration differs from being right often',
        'The gap opens most at high confidence',
        'You can close it by claiming less',
      ],
      closing: 'Your feeling of certainty has a track record, and that record can be checked.',
    },
    dur: 3.0,
  },
];
