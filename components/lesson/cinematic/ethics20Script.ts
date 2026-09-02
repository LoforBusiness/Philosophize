import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic ethics-ethics-20, "Ethics Beyond the Horizon"
// Theme: THE SAME HARM, DRAWN SMALLER THE FURTHER OFF IT IS.
//
// A lesson about future people has one enemy, which is that nobody can feel a
// date. So the stage does not argue about whether the future matters; it shows
// the reader doing the discounting with their own thumb and then lifts the
// drawing off to reveal that nothing under it ever changed size.
//
// The knob STARTS at a hard discount, which is the whole design. A reader who
// begins at zero and is asked to add one learns nothing — the default already
// agreed with them. Beginning where policy actually begins, and asking them to
// take it back off, is the only way round to feel what is being assumed.
//
// GAMIFIED SHAPE:
//   · beat 4  a DRAG — the discount rate, from "a life is a life, whenever" to
//     "in two centuries, nobody counts". The readout names what the setting
//     means rather than printing a number, which is what makes it lesson copy
//     rather than scoring furniture.
//   · beat 7  two CARDS — and then the honest correction, because SOME
//     discounting is defensible and a lesson that banned all of it would be
//     teaching something false (H66).
// ─────────────────────────────────────────────────────────────────────────────

export interface Eth20Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** The row of harms standing on the horizon, 0…1. */ blocks?: number;
  /** How hard the future is discounted, 0…1. */ rate?: number;
  /** The true size drawn back over the shrunken blocks, 0…1. */ truth?: number;
  /** 1 = the rate is the reader's to set this beat. */ live_d?: number;
}

export const BEATS: Eth20Beat[] = [
  {
    p: 25, x: 200, blocks: 1, rate: 0,
    text: 'Seven harms, all the same size. The only difference is when each one happens.',
    dur: 4.0,
  },
  {
    p: 45, x: 200, blocks: 1, rate: 0.72,
    text: 'Every government discounts the far harms first. A cost two hundred years out is written down until almost nothing is left.',
    cite: 'Discounting',
    dur: 4.8,
  },
  {
    p: 13, x: 132, blocks: 1, rate: 0.72,
    text: 'Some of that is fair. A distant benefit is less certain, and the people there may be richer than us.',
    dur: 4.4,
  },
  {
    p: 2, x: 132, blocks: 1, rate: 0.72,
    text: 'But strip those reasons out and something is left. A rate applied to the date itself.',
    cite: 'Pure time preference',
    dur: 4.0,
  },
  {
    p: 4, x: 132, blocks: 1, rate: 0.72, live_d: 1,
    interact: {
      prompt: 'Set the rate. How much less does a harm count for being late?',
      drag: {
        lo: 'A LIFE IS A LIFE',
        hi: 'NOBODY LATER COUNTS',
        start: 0.72,
        zones: [
          { id: 'none', upto: 0.22, reads: 'nothing shrinks', correct: true },
          { id: 'some', upto: 0.6, reads: 'the far ones are fading' },
          { id: 'hard', upto: 1, reads: 'the end of the row is gone' },
        ],
      },
      explain: 'Nothing about the blocks changed. Only the drawing did. A pure discount says a harm matters less because of when it happens, and nobody has managed to say why that would be so. Distance in time is not a moral difference.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 21, x: 132, blocks: 1, rate: 0, truth: 1,
    text: 'Here is what was under it the whole time. Seven people, none of whom chose which century to be born in.',
    dur: 4.6,
  },
  {
    p: 137, x: 268, blocks: 1, rate: 0, truth: 1,
    quote: {
      id: 'lq-ethics-ethics-20-2',
      text: 'Why should costs and benefits receive less weight, simply because they are further in the future? When the future comes, these benefits and costs will be no less real.',
      author: 'Derek Parfit',
      work: 'Reasons and Persons',
      era: '1984',
      philosopherId: 'derek-parfit',
      branchSlugs: ['ethics'],
    },
    dur: 3.8,
  },
  {
    p: 41, x: 268, blocks: 1, rate: 0, truth: 1,
    interact: {
      prompt: 'So should a government discount future costs at all?',
      cards: [
        { text: 'Yes, for risk and growth', correct: true },
        { text: 'No, never discount anything', correct: false },
      ],
      explain: 'Yes, but not for time itself. A future benefit is less certain, and people later may be richer, so a pound buys less good. Those are real reasons with numbers behind them. What cannot be defended is discounting a harm for being late.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Far End of the Row',
      points: [
        'Discounting shrinks a future cost before anyone weighs it',
        'Risk and rising wealth are real grounds for some of it',
        'Pure time preference is a rate on the date alone',
        'Nobody has defended treating a later person as worth less',
      ],
      closing: 'The people two centuries out cannot vote and cannot argue. They will be as real as you are.',
    },
    dur: 3.4,
  },
];
