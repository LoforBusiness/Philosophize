import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic business-foundations-1, "What Is a Business?" — the first lesson on the
// Business & Leadership road, and a DIALOGUE lesson (LESSON_RULES group AP).
// Theme: A PAVEMENT LEMONADE STAND, A JUG, A CASH TIN AND A QUEUE.
//
// Three people talk, and nobody narrates. The maker (the newsboy cap, kind to a fault)
// squeezes the lemons; his partner (the woman with the bun) has been giving the
// lemonade away and is delighted with the queue; the adviser (the top hat) explains why
// a busy stand is not yet a business.
//
// A FOUNDATION LESSON (AP3): what the subject is and why it is worth the reader's
// time, in three ideas and no more — a business sells what people want for more than it costs, profit is what is left, and a leader gives every job one owner.
//
// Every line is written for the ear (groups AC/AD), from its speaker's character
// (cast.ts, AP14), and read in that speaker's voice. `markup` adds only pauses; the
// screen always shows `text`.
// ─────────────────────────────────────────────────────────────────────────────

export interface Biz1Beat extends BaseBeat {
  /**
   * What happens across this beat's line (the scene choreographs it):
   * cry — the maker squeezes a lemon into the jug and calls his price ·
   * free — the partner hands a full cup across the stand to nobody in particular, beaming ·
   * lemons — the maker tips the empty lemon crate to show it, and turns out his pocket ·
   * arrive — the adviser walks in, tips his hat and lifts the lid of the empty cash tin ·
   * sale — the partner takes a pound coin for a cup; half goes to the lemon crate, half into the tin ·
   * proof — the adviser holds up the coin left in the tin ·
   * muddle — both of them reach for the squeezer at once, and the cups stand unserved ·
   * lead — the adviser points one to the squeezer and one to the front of the stand ·
   * split — the maker squeezes, the partner serves, and a coin drops in the tin ·
   * rest — everyone at ease under the quotation.
   */
  act?: 'cry' | 'free' | 'lemons' | 'arrive' | 'sale' | 'proof' | 'muddle' | 'lead' | 'split' | 'rest';
  /** The adviser is on the stage. He walks in on `arrive`. */
  th?: boolean;
  /** Coins in the cash tin: 0 empty · 1 after the first real sale · 2 once the work is split. */
  tin?: number;
  /** Q1 on the stage: three coin piles on the counter — PAID IN, LEMONS AND SUGAR, LEFT OVER — tap one. */
  q1?: boolean;
  /** Q2 on the stage: the stand’s chalk sign shows three rows to tap. */
  q2?: boolean;
}

export const BEATS: Biz1Beat[] = [
  {
    act: 'cry', tin: 0,
    speaker: 'cap',
    text: 'Fresh lemonade, made with lemons, sugar and a bit of love! One pound a cup.',
    pace: ['brisk', 'even'],
    dur: 1.8,
  },
  {
    act: 'free', tin: 0,
    speaker: 'bun',
    text: 'Everyone looked so thirsty, so I’ve been giving it away. Look at our queue!',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'lemons', tin: 0,
    speaker: 'cap',
    text: 'Good on you. I’ll buy more lemons out of my own pocket, I suppose.',
    pace: 'even',
    dur: 1.8,
  },
  {
    act: 'arrive', th: true, tin: 0,
    speaker: 'tophat',
    text: 'A long queue, and an empty tin. A business makes something people want and sells it for more than it cost to make.',
    pace: ['even', 'slow'],
    dur: 2.1,
  },
  {
    act: 'sale', th: true, tin: 1,
    speaker: 'bun',
    text: 'Oh! So I take the pound, and the lemons get paid for out of it?',
    pace: ['brisk', 'even'],
    dur: 1.8,
  },
  {
    th: true, tin: 1, q1: true,
    interact: {
      prompt: 'One cup sold for a pound. Which pile is the profit?',
      explain: 'The pile left over. Profit is the money that comes in, minus what it cost to make. It’s what lets the stand open again tomorrow.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    act: 'proof', th: true, tin: 1,
    speaker: 'tophat',
    text: 'Profit isn’t greed. It’s proof that people valued the lemonade more than it cost to make.',
    pace: ['slow', 'even'],
    dur: 2.1,
  },
  {
    act: 'muddle', th: true, tin: 1,
    speaker: 'bun',
    text: 'Now we’re both squeezing lemons, and nobody’s serving. Was that my job, or yours?',
    pace: ['even', 'brisk'],
    dur: 1.8,
  },
  {
    act: 'lead', th: true, tin: 1,
    speaker: 'tophat',
    text: 'And that’s the other half of it, called leadership. Someone has to make sure every job has one owner.',
    pace: ['slow', 'even'],
    dur: 2.1,
  },
  {
    th: true, tin: 1, q2: true,
    interact: {
      prompt: 'How should the two of them split the work?',
      explain: 'One squeezes, and one serves. A leader’s first job is to share out the work, so nothing is done twice and nothing is left undone.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    act: 'split', th: true, tin: 2,
    speaker: 'cap',
    text: 'Right, I’ll squeeze, you serve, and the pound goes in the tin. Beauty.',
    pace: ['brisk', 'even'],
    dur: 1.8,
  },
  {
    act: 'rest', th: true, tin: 2,
    quote: {
      id: 'lq-business-foundations-1-1',
      text: 'There is only one valid definition of business purpose: to create a customer.',
      author: 'Peter Drucker',
      work: 'The Practice of Management',
      era: '1954',
      branchSlugs: ['business'],
    },
    dur: 3.0,
  },
  {
    th: true, tin: 2,
    summary: {
      title: 'What Is a Business?',
      points: [
        'A business sells something people want',
        'Profit is the money in, minus the cost',
        'A leader gives every job one owner',
      ],
      closing: 'Next time you buy anything, guess what it cost to make. That gap is the business.',
    },
    dur: 2.8,
  },
];
