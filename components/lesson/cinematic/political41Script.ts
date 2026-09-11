import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic political-political-41, "When the Rules Are Suspended"
// Theme: A BOOK OF RULES ON A STAND, AND HOW MANY PAGES LIFT AS THE STORM RISES.
//
// Prerogative is a HOLE in a body of law, so the scene draws the body of law as a
// stack of rules and lets the hole open in it. Nothing is added to the picture
// when the power is used; something is taken out of it, which is the honest shape
// of what happens.
//
// The stand and the rules stay drawn at every beat, including the ones where most
// of them have lifted. A rulebook that vanished would be a different claim —
// Locke's power runs alongside the law rather than replacing it, and has to be
// seen against it.
//
// GAMIFIED SHAPE:
//   · beat 4  SCENE TARGETS — three plates, and the reader taps the one thing
//     prerogative lacks. On the stage because the holder and the purpose are
//     already labelled above it and the third slot is visibly empty.
//   · beat 8  a PLOT — the room to act, drawn across four grades of crisis. The
//     curve the reader draws lifts that many rules off the book, so the shape of
//     their answer is the shape of the hole.
// ─────────────────────────────────────────────────────────────────────────────

export interface Political41Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** How many of the six rules are laid on the stand, 0…1. */ book?: number;
  /** 1 = the three slots naming what the power has are drawn. */ slots?: number;
  /** How much of the book has lifted away, 0…1. */ lift?: number;
  /** 1 = the three plates the reader chooses between are up. */ plates?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Political41Beat[] = [
  {
    p: 349, x: 28, book: 1,
    text: 'A constitution is a stack of rules written before anything happened.',
    dur: 4.2,
  },
  {
    p: 162, x: 28, book: 1,
    text: 'Then a fire, a plague or an invasion arrives, and no page covers it.',
    dur: 4.2,
  },
  {
    p: 422, x: 28, book: 1, lift: 0.34,
    text: 'John Locke gave the executive room to act anyway. He called it prerogative.',
    dur: 4.6,
  },
  {
    p: 265, x: 28, book: 1, slots: 1, lift: 0.34,
    text: 'The power has an owner and a purpose. One slot is left conspicuously empty.',
    dur: 4.6,
  },
  {
    p: 261, x: 28, book: 1, slots: 1, lift: 0.34, plates: 1, live: 1,
    interact: {
      prompt: 'Tap the one thing prerogative has none of.',
      explain: 'A rule. It has a holder, the executive, and a purpose, the public good. What it can’t have is a written limit. A limit precise enough to bind would have to describe the emergency in advance. And then ordinary law would already cover it.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 447, x: 88, book: 1, slots: 1, lift: 0.34,
    text: 'Legislatures are slow, and an emergency doesn’t wait for a session.',
    dur: 4.2,
  },
  {
    p: 430, x: 88, book: 1, slots: 1, lift: 0.34,
    quote: {
      id: 'lq-political-political-41-1',
      text: 'This power to act according to discretion for the public good, without the prescription of the law and sometimes even against it, is that which is called prerogative.',
      author: 'John Locke',
      philosopherId: 'john-locke',
      work: 'Second Treatise of Government',
      era: '1689',
      branchSlugs: ['political-philosophy'],
    },
    dur: 5.0,
  },
  {
    p: 389, x: 88, book: 1, slots: 1, lift: 0.34,
    text: 'Locke tied the power to the need, so that the need could be argued about afterwards.',
    dur: 4.8,
  },
  {
    p: 176, x: 88, book: 1, slots: 1,
    interact: {
      prompt: 'Draw the room to act as the crisis deepens.',
      plot: {
        cols: ['CALM', 'STRAIN', 'CRISIS', 'DISASTER'],
        axis: 'ROOM TO ACT',
        start: [0.5, 0.5, 0.5, 0.5],
        shapes: [
          { id: 'ramp', profile: [0.1, 0.34, 0.62, 0.9], reads: 'room grows step by step with the danger', correct: true },
          { id: 'flat', profile: [0.15, 0.15, 0.15, 0.15], reads: 'the law binds the same, whatever happens' },
          { id: 'cliff', profile: [0.08, 0.08, 0.1, 0.95], reads: 'nothing, then everything, all at once' },
          { id: 'open', profile: [0.82, 0.86, 0.9, 0.94], reads: 'a free hand from a calm Tuesday onward' },
        ],
      },
      explain: 'A ramp. Tie the power to the need and it stays answerable, because the need is something other people can weigh. The jump from nothing to everything is the dangerous shape. Whoever calls the emergency would be handing themselves everything at once.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 322, x: 88, book: 1, slots: 1, lift: 0.34,
    summary: {
      title: 'The Hole in the Book',
      points: [
        'No law can describe every emergency in advance',
        'Locke gave the executive room to act without one',
        'The power has a holder and a purpose, and no limit',
        'Tying it to the need is what keeps it answerable',
      ],
      closing: 'The question is never whether a state has this power. The question is who decides the emergency has begun, and who gets to say when it ended.',
    },
    dur: 4.8,
  },
];
