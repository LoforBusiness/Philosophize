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
  /** 1 = the case no written rule covers is set beside the stand. */ unforeseen?: number;
  /** 1 = the limit Locke puts on the power, and who judges it afterwards. */ judged?: number;
}

export const BEATS: Political41Beat[] = [
  {
    p: 349, x: 28, book: 1,
    text: 'A constitution is a body of rules written in advance of the events it must govern.',
    dur: 4.2,
  },
  {
    p: 162, x: 28, book: 1,
    unforeseen: 1,
    text: 'Some emergencies, such as a plague or an invasion, fall outside every rule written in advance.',
    dur: 4.2,
  },
  {
    p: 422, x: 28, book: 1, lift: 0.34,
    text: 'John Locke gave the executive a power to act where the law is silent. He called it prerogative.',
    dur: 4.6,
  },
  {
    p: 265, x: 28, book: 1, slots: 1, lift: 0.34,
    text: 'The power has an owner and a purpose. Its holder is the executive, and its purpose the public good.',
    dur: 4.6,
  },
  {
    p: 261, x: 28, book: 1, slots: 1, lift: 0.34, plates: 1, live: 1,
    interact: {
      prompt: 'Which of these does Locke’s prerogative power lack?',
      explain: 'A rule. Prerogative has a holder and a purpose, but no written limit that could foresee every emergency.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 447, x: 88, book: 1, slots: 1, lift: 0.34,
    text: 'Locke’s reason is practical. Legislatures are large and slow, and often not in session when an emergency arrives.',
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
    judged: 1,
    text: 'Locke limits the power to the public good, so the people can judge afterwards whether it was used well.',
    dur: 4.8,
  },
  {
    p: 176, x: 88, book: 1, slots: 1,
    interact: {
      prompt: 'Which curve shows how much discretion the executive should have as a crisis deepens?',
      plot: {
        cols: ['CALM', 'STRAIN', 'CRISIS', 'DISASTER'],
        axis: 'EXECUTIVE DISCRETION',
        start: [0.5, 0.5, 0.5, 0.5],
        shapes: [
          { id: 'ramp', profile: [0.1, 0.34, 0.62, 0.9], reads: 'discretion rising in step with the danger', correct: true },
          { id: 'flat', profile: [0.15, 0.15, 0.15, 0.15], reads: 'the law binds the same, whatever happens' },
          { id: 'cliff', profile: [0.08, 0.08, 0.1, 0.95], reads: 'none, then unlimited power all at once' },
          { id: 'open', profile: [0.82, 0.86, 0.9, 0.94], reads: 'wide discretion even in calm times' },
        ],
      },
      explain: 'Discretion rising in step with the danger. Others can judge the need, so power tied to need stays answerable. A sudden leap hands all power to whoever declares the emergency.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 322, x: 88, book: 1, slots: 1, lift: 0.34,
    summary: {
      title: 'Locke on Prerogative',
      points: [
        'No law can describe every emergency in advance',
        'Locke let the executive act where law is silent',
        'The power has a holder and a purpose, and no limit',
        'Tying it to the public good keeps it answerable',
      ],
      closing: 'Granting emergency power is the easier step. The harder questions are who may declare an emergency and who decides when it ends.',
    },
    dur: 4.8,
  },
];
