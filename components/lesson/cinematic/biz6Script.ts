import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic business-foundations-6, "When Do You Break Even?" — the sixth lesson on the
// Business road, and a DIALOGUE lesson (LESSON_RULES group AP).
// Theme: A HAUNTED CASTLE ATTRACTION ON OPENING NIGHT, A TICKET BOOTH, AND A TURNSTILE COUNTER.
//
// Three people talk, and nobody narrates. The owner of Castle Fright (the plain mascot)
// is sure he's rich after the first ticket; the ticket seller (the newsboy cap) clicks
// the turnstile counter; the accountant (the top hat) explains fixed costs, variable
// costs, and how many guests it takes before the night makes a penny.
//
// A ROAD THAT RAMPS UP (group AU): this road has taught profit, and that profit isn't
// cash. This lesson splits the costs in two and finds the point where a business stops
// losing money, which is harder: three ideas — fixed costs stay the same however many
// you sell · variable costs grow with every sale · break-even is where sales just cover
// both. Its second question is arithmetic the reader does in their head.
//
// Every line is written for the ear (groups AC/AD), from its speaker’s character
// (cast.ts, AP14; group AS), and read at the pace its words ask for (AP17, AP21).
// ─────────────────────────────────────────────────────────────────────────────

export interface Biz6Beat extends BaseBeat {
  /**
   * What happens across this beat’s line (the scene choreographs it):
   * welcome — the owner throws open the castle’s iron gate, cobwebs and lanterns all around ·
   * booth — the seller hands a ticket out of the booth, then a popcorn tub and a glow stick ·
   * fixed — the accountant points up at the castle, the lanterns, then the bill pinned to the gate ·
   * split — he holds out one hand still, then raises the other higher and higher ·
   * rich — the owner taps the first coin into the cash box and spreads his arms ·
   * tens — the accountant drops coins one by one onto a stack beside the bill ·
   * later — the seller clicks the turnstile counter and looks up at the accountant ·
   * point — the accountant draws a line across the chalk board where two lines cross ·
   * scream — the counter clicks over; the owner leaps in the air ·
   * rest — everyone at ease under the quotation, a bat crossing the moon.
   */
  act?: 'welcome' | 'booth' | 'fixed' | 'split' | 'rich' | 'tens' | 'later' | 'point' | 'scream' | 'rest';
  /** The turnstile counter, in guests. */
  guests?: number;
  /**
   * First question on the stage — TAG THE COST: three things with price tags, the castle’s
   * rent bill pinned to the gate, a popcorn tub and a glow stick, are the things to tap.
   */
  costs?: boolean;
  /**
   * Second question on the stage — STOP THE COUNTER: the turnstile counter’s three marked
   * stops, 50, 100 and 1,000 guests, are the things to tap.
   */
  counter?: boolean;
}

export const BEATS: Biz6Beat[] = [
  {
    bed: 'night',
    sfx: [{ id: 'creak', at: 0.19, gain: 0.7 }],
    act: 'welcome', guests: 0,
    speaker: 'plain',
    text: 'Welcome to Castle Fright! It’s opening night, and I’ve spent a fortune on cobwebs.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'turnstile', at: 2.03, gain: 0.8 }, { id: 'cup', at: 2.92, gain: 0.6 }],
    act: 'booth', guests: 1,
    speaker: 'cap',
    text: 'Fifteen pounds a ticket, and every guest gets popcorn and a glow stick. Those cost us five pounds each.',
    pace: 'even',
    dur: 1.8,
  },
  {
    act: 'fixed', guests: 1,
    speaker: 'tophat',
    text: 'The castle, the actors and the lights cost a thousand pounds a night, however many people come.',
    pace: 'even',
    dur: 2.1,
  },
  {
    act: 'split', guests: 1,
    speaker: 'tophat',
    text: 'Costs that stay the same are fixed costs. Costs that grow with every guest are variable costs.',
    pace: ['weighty', 'even'],
    dur: 2.1,
  },
  {
    guests: 1, costs: true,
    interact: {
      prompt: 'Which of these is a fixed cost?',
      explain: 'The castle’s rent. It’s the same whether ten people come or a thousand. Popcorn and glow sticks go to each guest, so they cost more the busier it gets.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    sfx: [{ id: 'turnstile', at: 0.14, gain: 0.8 }, { id: 'coinslot', at: 1.52, gain: 0.8 }],
    act: 'rich', guests: 2,
    speaker: 'plain',
    text: 'So every ticket makes me ten pounds. I’m rich already!',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'coin', at: 2.19, gain: 0.7 }, { id: 'coin', at: 3.01, gain: 0.7 }],
    act: 'tens', guests: 2,
    speaker: 'tophat',
    text: 'No. Each ticket leaves ten pounds after its own costs, and those tens pay off the thousand first.',
    pace: 'brisk',
    dur: 2.1,
  },
  {
    sfx: [{ id: 'turnstile', at: 1.4, gain: 0.8 }],
    act: 'later', guests: 40,
    speaker: 'cap',
    text: 'So the first guests pay for the castle, and only the later ones make any money?',
    pace: 'even',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'chalk', at: 3.18, gain: 0.8 }],
    act: 'point', guests: 40,
    speaker: 'tophat',
    text: 'Right. The point where sales just cover every cost is the break-even point.',
    pace: 'even',
    dur: 2.1,
  },
  {
    guests: 40, counter: true,
    interact: {
      prompt: 'Each guest puts ten pounds towards the thousand. At which count does he break even?',
      explain: 'A hundred guests. A hundred lots of ten pounds covers the thousand in fixed costs, and every guest after the hundredth is profit.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    sfx: [{ id: 'turnstile', at: 0.13, gain: 0.8 }, { id: 'stamp', at: 0.44, gain: 0.8 }],
    act: 'scream', guests: 101,
    speaker: 'plain',
    text: 'Guest one hundred and one! Finally, a scream that pays.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'rest', guests: 101,
    quote: {
      id: 'lq-business-foundations-6-1',
      text: 'Money is in some respects like fire; it is a very excellent servant but a terrible master.',
      author: 'P. T. Barnum',
      work: 'The Art of Money Getting',
      era: '1880',
      branchSlugs: ['business'],
    },
    dur: 3.0,
  },
  {
    guests: 101,
    summary: {
      title: 'When Do You Break Even?',
      points: [
        'Fixed costs stay the same however many you sell',
        'Variable costs grow with every sale',
        'Break-even is where sales just cover both',
      ],
      closing: 'Next time you see a new shop open, ask how many sales it needs a day.',
    },
    dur: 2.8,
  },
];
