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
    p: 379, x: 200, blocks: 1, rate: 0,
    text: 'Consider seven identical harms. They differ only in when they occur, from now to five hundred years ahead.',
    dur: 4.0,
  },
  {
    p: 447, x: 200, blocks: 1, rate: 0.72,
    text: 'Governments apply a discount rate, which makes a future cost count for less the later it falls. At typical rates, a harm two centuries away counts for almost nothing.',
    cite: 'Discounting',
    dur: 4.8,
  },
  {
    p: 383, x: 132, blocks: 1, rate: 0.72,
    text: 'Some discounting has good reasons. A distant benefit is less certain, and future people may be richer than you.',
    dur: 4.4,
  },
  {
    p: 384, x: 132, blocks: 1, rate: 0.72,
    text: 'Set those reasons aside, and one further discount may remain. Pure time preference counts a harm for less only because it comes later.',
    cite: 'Pure time preference',
    dur: 4.0,
  },
  {
    p: 165, x: 132, blocks: 1, rate: 0.72, live_d: 1,
    interact: {
      prompt: 'How much less should a harm count only because it happens later?',
      drag: {
        lo: 'A LIFE IS A LIFE',
        hi: 'NOBODY LATER COUNTS',
        start: 0.72,
        zones: [
          { id: 'none', upto: 0.22, reads: 'no less: a later harm counts the same', correct: true },
          { id: 'some', upto: 0.6, reads: 'distant harms count for somewhat less' },
          { id: 'hard', upto: 1, reads: 'distant harms count for almost nothing' },
        ],
      },
      explain: 'No less: a later harm counts the same. Pure time preference makes a harm matter less only because of when it happens. Frank Ramsey called that practice “ethically indefensible”.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 165, x: 132, blocks: 1, rate: 0, truth: 1,
    text: 'Without any discount, the seven harms are equal again. Each falls on a person who didn’t choose which century to be born in.',
    dur: 4.6,
  },
  {
    p: 128, x: 268, blocks: 1, rate: 0, truth: 1,
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
    p: 442, x: 268, blocks: 1, rate: 0, truth: 1,
    interact: {
      prompt: 'Should a government discount future costs at all?',
      cards: [
        { text: 'Yes, for risk and growth', correct: true },
        { text: 'No, never discount anything', correct: false },
      ],
      explain: 'Discounting for risk and growth is justified, but not for time itself. A future benefit is less certain, and later people may be richer, so a pound does less good. Nothing similar justifies discounting a harm merely for coming later.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Discounting the Future',
      points: [
        'Discounting reduces the weight of future costs',
        'Risk and rising wealth are real grounds for some of it',
        'Pure time preference discounts for lateness alone',
        'Ramsey called pure time preference ethically indefensible',
      ],
      closing: 'People two centuries from now can’t vote or argue their case. Yet, as Parfit notes, the costs they bear will be no less real.',
    },
    dur: 3.4,
  },
];
