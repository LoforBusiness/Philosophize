import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic history-foundations-3, "Why Did It Happen?" — the third lesson on the
// History road, and a DIALOGUE lesson (LESSON_RULES group AP).
// Theme: A VILLAGE FOOTBRIDGE OVER A STREAM, A BROKEN PLANK, AND A HAY CART.
//
// Three people talk, and nobody narrates. A carter (the newsboy cap), kind and upset,
// has just driven his hay cart through the old footbridge; a villager (the plain
// mascot) has opinions about the timing; the historian (the top hat) shows that an
// event nearly always has more than one cause.
//
// A FOUNDATION LESSON (AP3), three ideas and no more: an event usually has more than
// one cause · a long-term cause builds up over years · a trigger sets it off on the day,
// and historians weigh which mattered most.
//
// Every line is written for the ear (groups AC/AD), from its speaker’s character
// (cast.ts, AP14), and read at the pace its words ask for (AP17).
// ─────────────────────────────────────────────────────────────────────────────

export interface Hist3Beat extends BaseBeat {
  /**
   * What happens across this beat’s line (the scene choreographs it):
   * stuck — the carter, beside his cart with one wheel through the bridge, spreads his hands ·
   * timing — the villager leans on the railing with his arms folded ·
   * arrive — the historian walks along the bank and crouches by the bridge ·
   * rot — he lifts the broken plank out of the hole, shows its crumbling, dark end, and lays it on the bank ·
   * relief — the carter hauls his cart out of the hole by its shafts, drops them, and wipes his brow ·
   * trigger — the historian points at the cart’s wheel, then back at the rotten plank ·
   * year — the villager taps the rotten plank with his boot ·
   * weigh — the historian holds out his hands like a pair of scales ·
   * mend — the carter carries a new plank from against the barn to the bridge and lays it in the gap ·
   * rest — everyone at ease under the quotation.
   */
  act?: 'stuck' | 'timing' | 'arrive' | 'rot' | 'relief' | 'trigger' | 'year' | 'weigh' | 'mend' | 'rest';
  /** The historian is on the stage. He walks in on `arrive`. */
  th?: boolean;
  /** The broken plank: 0 in the hole · 1 lifted to show its rot · 2 replaced by a new one. */
  plank?: number;
  /** The cart: 0 its wheel through the bridge · 1 pulled back onto the bank. */
  cart?: number;
  /** First question on the stage: the rotten plank, the hay cart and the stream are the things to tap. */
  slow?: boolean;
  /** Second question on the stage: the hay cart, the rotten plank and the weather vane are the things to tap. */
  spark?: boolean;
}

export const BEATS: Hist3Beat[] = [
  {
    act: 'stuck', plank: 0, cart: 0,
    speaker: 'cap',
    text: 'I only drove over it, honest. Same as every market day for twenty years!',
    pace: 'even',
    dur: 1.8,
  },
  {
    act: 'timing', plank: 0, cart: 0,
    speaker: 'plain',
    text: 'And the bridge picked today to give up. How thoughtful of it.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'arrive', th: true, plank: 0, cart: 0,
    speaker: 'tophat',
    text: 'Historians ask why things happened, and the answer is nearly always more than one cause.',
    pace: 'even',
    dur: 2.1,
  },
  {
    act: 'rot', th: true, plank: 1, cart: 0,
    speaker: 'tophat',
    text: 'This plank has been rotting for years. That’s a long-term cause, building up before anyone noticed.',
    pace: 'even',
    dur: 2.1,
  },
  {
    th: true, plank: 1, cart: 0, slow: true,
    interact: {
      prompt: 'Which cause was building up for years before the bridge broke?',
      explain: 'The rotten plank. The rot grew slowly, year after year, until the wood was weak. The cart only arrived today, and the stream has always run under the bridge.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    act: 'relief', th: true, plank: 1, cart: 1,
    speaker: 'cap',
    text: 'So it wasn’t my cart at all, then? Oh, that’s a relief.',
    pace: 'even',
    dur: 1.8,
  },
  {
    act: 'trigger', th: true, plank: 1, cart: 1,
    speaker: 'tophat',
    text: 'Your cart was the trigger: the event on the day that set it off. Without the rot, the bridge would have held.',
    pace: 'even',
    dur: 2.1,
  },
  {
    act: 'year', th: true, plank: 1, cart: 1,
    speaker: 'plain',
    text: 'And without the cart, it would have rotted for another year. Lovely.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'weigh', th: true, plank: 1, cart: 1,
    speaker: 'tophat',
    text: 'That’s why historians weigh their causes. They ask which one mattered most, and which one only set things off.',
    pace: 'even',
    dur: 2.1,
  },
  {
    th: true, plank: 1, cart: 1, spark: true,
    interact: {
      prompt: 'Which one was the trigger on the day the bridge broke?',
      explain: 'The hay cart. It came on the day and set the collapse off. The rotten plank was the long-term cause, and the weather vane had nothing to do with it.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    act: 'mend', th: true, plank: 2, cart: 1,
    speaker: 'cap',
    text: 'Then I’ll mend the plank myself, and go round by the ford until it’s done.',
    pace: 'even',
    dur: 1.8,
  },
  {
    act: 'rest', th: true, plank: 2, cart: 1,
    quote: {
      id: 'lq-history-foundations-3-1',
      text: 'The study of history is a study of causes.',
      author: 'E. H. Carr',
      work: 'What Is History?',
      era: '1961',
      branchSlugs: ['history'],
    },
    dur: 3.0,
  },
  {
    th: true, plank: 2, cart: 1,
    summary: {
      title: 'Why Did It Happen?',
      points: [
        'An event usually has more than one cause',
        'A long-term cause builds up over years',
        'A trigger sets it off on the day',
      ],
      closing: 'Next time you hear why something happened, ask what had been building up beforehand.',
    },
    dur: 2.8,
  },
];
