import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic business-foundations-5, "Profit Isn’t Cash" — the fifth lesson on the
// Business road, and a DIALOGUE lesson (LESSON_RULES group AP).
// Theme: A BALLOON FIELD AT DAWN, A HOT-AIR BALLOON, AND AN EMPTY CASH TIN.
//
// Three people talk, and nobody narrates. The owner of a hot-air balloon company (the
// plain mascot) has his best month ever on paper; the gas man (the newsboy cap) arrives
// with the week’s cylinders, cash on delivery; the accountant (the top hat) explains why a
// business that makes a profit can still be unable to pay for its gas.
//
// A ROAD THAT RAMPS UP (group AU): the last lesson on this road was what profit is. This
// one is the trap waiting behind it, and it is harder: three ideas — profit is earned on
// paper, cash is money you hold · money often comes in later than the bills go out · take
// payment early and keep a cash cushion. Its second question turns the idea round: the
// smallest booking is the best one, because it pays today.
//
// Every line is written for the ear (groups AC/AD), from its speaker’s character
// (cast.ts, AP14; group AS), and read at the pace its words ask for (AP17, AP21).
// ─────────────────────────────────────────────────────────────────────────────

export interface Biz5Beat extends BaseBeat {
  /**
   * What happens across this beat’s line (the scene choreographs it):
   * board — the owner, his cash tin in his hand, chalks a big tick on the booking board, the balloon lying half-filled behind him, and throws a hand up at the sky ·
   * deliver — the gas man wheels two gas cylinders in on a sack truck, stands it upright and holds out his hand ·
   * tin — the owner opens the cash tin, takes out two notes and a button, and stares at them ·
   * explain — the accountant walks in under an umbrella against the dew, furls it, leans on it, and taps the PAY AFTER YOUR FLIGHT line with its tip ·
   * trust — the gas man lifts the two cylinders off his truck, stands them on the grass by the basket and pats one ·
   * deposit — the gas man goes back behind his truck; the accountant taps the board again with his umbrella ·
   * rewrite — the owner rubs out the line and chalks PAY HALF WHEN YOU BOOK ·
   * cushion — the owner holds out the tin and the accountant drops a coin from his waistcoat into it ·
   * liftoff — the owner climbs into the basket and pulls the burner's lever; it roars, the balloon swings up and fills, and the basket lifts off the grass with him in it ·
   * rest — everyone at ease under the quotation, the balloon rising into the sky, the owner waving.
   */
  act?: 'board' | 'deliver' | 'tin' | 'explain' | 'trust' | 'deposit' | 'rewrite' | 'cushion' | 'liftoff' | 'rest';
  /** The accountant is on the stage. He walks in on `explain`. */
  books?: boolean;
  /** The board has been rewritten: 0 PAY AFTER YOUR FLIGHT · 1 PAY HALF WHEN YOU BOOK. */
  terms?: number;
  /**
   * First question on the stage — FOLLOW THE MONEY: the booking board, the balloon and the
   * gas cylinders are the things to tap.
   */
  money?: boolean;
  /**
   * Second question on the stage — PICK THE BOOKING: three booking cards clipped to the
   * basket rim, £600 IN 2 MONTHS, £200 TODAY and £900 NEXT YEAR, are the things to tap.
   */
  booking?: boolean;
}

export const BEATS: Biz5Beat[] = [
  {
    bed: 'park',
    sfx: [{ id: 'chalk', at: 0.94, gain: 0.8 }],
    act: 'board', terms: 0,
    speaker: 'plain',
    text: 'Twelve flights booked this month. That’s three thousand pounds of profit, and I’m a genius of the skies.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'can', at: 1.49, gain: 0.7 }],
    act: 'deliver', terms: 0,
    speaker: 'cap',
    text: 'Morning! Here’s your gas for the week. That’s four hundred pounds, cash on delivery.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'cashbox', at: 0.6, gain: 0.8 }],
    act: 'tin', terms: 0,
    speaker: 'plain',
    text: 'Of course, one moment. Ah, there’s forty pounds and a button.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'umbrella', at: 1.6, gain: 0.7 }],
    act: 'explain', books: true, terms: 0,
    speaker: 'tophat',
    text: 'Your customers pay after they fly, and the gas is due before anybody does. You can’t pay a bill with profit on paper.',
    pace: ['even', 'weighty'],
    dur: 2.1,
  },
  {
    books: true, terms: 0, money: true,
    interact: {
      prompt: 'He’s made a profit. So where is his money?',
      explain: 'On the booking board. Twelve customers owe him, but they won’t pay until they’ve flown. The balloon and the gas cost him money, and they don’t hold any.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    sfx: [{ id: 'can', at: 1.26, gain: 0.7 }, { id: 'can', at: 2.61, gain: 0.7 }],
    act: 'trust', books: true, terms: 0,
    speaker: 'cap',
    text: 'Tell you what, keep two cylinders on trust till Friday. You can pay me then.',
    pace: 'even',
    dur: 1.8,
  },
  {
    act: 'deposit', books: true, terms: 0,
    speaker: 'tophat',
    text: 'Kind of him, and more than you deserve. From now on, take half the fare when people book, not after they land.',
    pace: ['brisk', 'even'],
    dur: 2.1,
  },
  {
    sfx: [{ id: 'chalk', at: 1.96, gain: 0.8 }],
    act: 'rewrite', books: true, terms: 1,
    speaker: 'plain',
    text: 'Half up front. A brilliant idea, and I’ll tell everyone it was mine.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'coin', at: 1.79, gain: 0.8 }],
    act: 'cushion', books: true, terms: 1,
    speaker: 'tophat',
    text: 'And keep some cash in this tin, for the weeks when people pay late.',
    pace: 'even',
    dur: 2.1,
  },
  {
    books: true, terms: 1, booking: true,
    interact: {
      prompt: 'The gas has to be paid for on Friday. Which booking helps him pay it?',
      explain: 'The £200 booking, paid today. It’s the smallest, but it’s the only one that puts cash in the tin before Friday. The bigger ones pay too late to help.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    sfx: [{ id: 'burner', at: 1.45, gain: 0.8 }],
    act: 'liftoff', books: true, terms: 1,
    speaker: 'plain',
    text: 'Up we go, and the gas is paid for. Mostly.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'rest', books: true, terms: 1,
    quote: {
      id: 'lq-business-foundations-5-1',
      text: 'Annual income twenty pounds, annual expenditure nineteen nineteen and six, result happiness. Annual income twenty pounds, annual expenditure twenty pounds ought and six, result misery.',
      author: 'Charles Dickens',
      work: 'David Copperfield',
      era: '1850',
      branchSlugs: ['business'],
    },
    dur: 3.0,
  },
  {
    books: true, terms: 1,
    summary: {
      title: 'Profit Isn’t Cash',
      points: [
        'Profit is earned on paper; cash is money you hold',
        'Money often comes in later than bills go out',
        'Take payment early, and keep a cash cushion',
      ],
      closing: 'Next time a busy shop closes down, ask whether it ran out of cash.',
    },
    dur: 2.8,
  },
];
