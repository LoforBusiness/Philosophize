import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic political-political-3, "What Makes a Government Legitimate?"
// Theme: A COUNCIL ROOM, A CROWN ON A PLINTH, A CHARTER, KEYS HELD IN TRUST, A BALLOT BOX.
//
// A gunman's shadow falls through a doorway and he puts his hands up: power. He lifts
// the crown off its cushion, and without a common power the shadows square up: the
// state of nature. He signs the charter on the wall and sets the crown back: the
// covenant. For Locke he hangs the keys on the crown's plinth, held in trust; the
// Declaration of 1776 lights on the wall. For Rousseau he drops a slip into a glass
// ballot box, the will of all, and adds a line to the charter, a law he gives himself.
//
// Redrawn 2026-09-26, the third lesson of the branch in reading order. Every line,
// citation, quotation and summary point is copied from the previous script by a
// generator, word for word and beat for beat. The first question is asked on the
// stage now, the keys against the ballot box, where it was two cards under the figure.
// ─────────────────────────────────────────────────────────────────────────────

export interface Pol3Beat extends BaseBeat {
  /** His pose under the act. Bands per N2: <100 rig, 100+ held, 300+ played. */ p?: number;
  /** Where he stands: 132 at the plinth · 160 at the charter · 232 under the Declaration · 310 at the ballot box. */ x?: number;
  /** The act across this beat's line (the scene choreographs it). */
  act?: 'gunman' | 'power' | 'nature' | 'covenant' | 'trust' | 'decl' | 'rousseau' | 'own';
  /** POWER is on the doorway's plate and LEGITIMACY on the plinth's. */ named?: boolean;
  /** STATE OF WAR is on the doorway's plate. */ war?: boolean;
  /** The charter is signed, the crown is back on its cushion, and the charter's plate reads COVENANT. */ signed?: boolean;
  /** The keys hang on the plinth's hook, and its plate reads IN TRUST. */ keys?: boolean;
  /** The Declaration of 1776 is lit. */ decl?: boolean;
  /** His slip is in the ballot box: GENERAL WILL on the charter, WILL OF ALL on the box. */ ballot?: boolean;
  /** The line he added to the charter. */ line2?: boolean;
  /** Q1 on the stage: the keys and the ballot box are the two answers. */ q1?: boolean;
}

export const BEATS: Pol3Beat[] = [
  {
    p: 158, x: 132, act: 'gunman',
    text: 'A gunman can make you obey. What, if anything, makes you owe obedience to a government?',
    dur: 1.8,
  },
  {
    p: 167, x: 132, act: 'power', named: true,
    text: 'Power is the capacity to compel obedience. Legitimacy is the right to rule, which creates a duty to obey.',
    dur: 2.3,
  },
  {
    p: 158, x: 132, act: 'nature', named: true, war: true,
    text: 'Social contract theory begins with a state of nature, a condition with no government. Hobbes argued that without a common power, it becomes a state of war.',
    cite: 'The social contract',
    dur: 3.5,
  },
  {
    p: 158, x: 132, act: 'covenant', named: true, war: true, signed: true,
    text: 'Hobbes held that people escape the war by covenant, agreeing to set up a sovereign who keeps the peace.',
    dur: 1.8,
  },
  {
    p: 158, x: 132, act: 'trust', named: true, war: true, signed: true, keys: true,
    text: 'John Locke argued that people consent to government to protect their natural rights. Government holds power in trust, and loses the right to rule by breaking the trust.',
    cite: 'Locke, 1689',
    dur: 3.9,
  },
  {
    p: 167, x: 232, act: 'decl', named: true, war: true, signed: true, keys: true, decl: true,
    text: 'The American Declaration of Independence, in 1776, drew on Locke’s ideas of consent and natural rights.',
    dur: 1.8,
  },
  {
    p: 263, x: 232, named: true, war: true, signed: true, keys: true, decl: true,
    quote: {
      id: 'lq-political-political-3-1',
      text: 'Men being by nature all free, equal and independent, no one can be subjected to the political power of another without his own consent.',
      author: 'John Locke',
      philosopherId: 'john-locke',
      work: 'Two Treatises of Government',
      era: '1689',
      branchSlugs: ['political-philosophy'],
    },
    dur: 3.6,
  },
  {
    p: 158, x: 310, act: 'rousseau', named: true, war: true, signed: true, keys: true, decl: true, ballot: true,
    text: 'Jean-Jacques Rousseau based legitimacy on the general will, which aims at what serves everyone. The will of all is a sum of private wants.',
    cite: 'The Social Contract, 1762',
    dur: 3.5,
  },
  {
    p: 158, x: 160, act: 'own', named: true, war: true, signed: true, keys: true, decl: true, ballot: true, line2: true,
    text: 'Citizens who obey the general will obey laws they made themselves. For Rousseau, real freedom is living under rules you give yourself.',
    dur: 1.8,
  },
  {
    p: 260, x: 160, named: true, war: true, signed: true, keys: true, decl: true, ballot: true, line2: true, q1: true,
    interact: {
      prompt: 'On Locke’s account, what makes a government forfeit its right to rule?',
      explain: 'Breaching natural rights costs a government its right to rule, on Locke’s view. Government holds power in trust, to protect life, liberty and property. Breaking that trust costs legitimacy, but losing an election breaks no trust.',
      xp: 5,
    },
    dur: 1,
  },
  {
    p: 260, x: 160, named: true, war: true, signed: true, keys: true, decl: true, ballot: true, line2: true,
    interact: {
      prompt: 'Put these in order, from least to most trust in a vote.',
      order: {
        axis: 'LEAST TRUST FIRST',
        items: [
          { id: 'never', reads: 'A VOTE NEVER SHOWS IT' },
          { id: 'often', reads: 'OFTEN, AND SOMETIMES WRONG' },
          { id: 'is', reads: 'THE VOTE SIMPLY IS IT' },
        ],
      },
      explain: 'Rousseau takes the middle one. The general will is what the people would want for the common good. A majority is the best sign of it, not the thing itself. That\'s why he allows that a majority can be wrong about it.',
      xp: 5,
    },
    dur: 1,
  },
  {
    named: true, war: true, signed: true, keys: true, decl: true, ballot: true, line2: true,
    summary: {
      title: 'The Right to Rule',
      points: [
        'Hobbes: without a common power, life is war',
        'Locke: legitimacy rests on consent and trust',
        'Rousseau: law must serve the general will',
        'Democracy combines rights with popular sovereignty',
      ],
      closing: 'Social contract theories ground the right to rule in the consent or the will of the ruled.',
    },
    dur: 2.8,
  },
];
