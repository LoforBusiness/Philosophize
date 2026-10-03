import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic personal-growth-foundations-2, "How Habits Work" — the second lesson on
// the Personal Growth road, and a DIALOGUE lesson (LESSON_RULES group AP).
// Theme: A KITCHEN AT THREE O’CLOCK, A WALL CLOCK, AND A BISCUIT JAR.
//
// Three people talk, and nobody narrates. The man in the newsboy cap, who is kind to
// everyone including himself, reaches for "just one biscuit" every afternoon at three;
// his housemate (the plain mascot) has been counting; the coach (the top hat) shows him
// the loop the habit runs on, and how to change it without a fight.
//
// A FOUNDATION LESSON (AP3), three ideas and no more: a habit is a loop of cue, routine
// and reward · keep the cue and the reward, and change only the routine · a swap is
// easier than fighting the cue every day.
//
// Every line is written for the ear (groups AC/AD), from its speaker's character
// (cast.ts, AP14), and read in that speaker's voice at the pace its words ask for
// (AP17): its pauses come from its punctuation.
// ─────────────────────────────────────────────────────────────────────────────

export interface Growth2Beat extends BaseBeat {
  /**
   * What happens across this beat's line (the scene choreographs it):
   * chime — the clock reaches three; the cap lifts his mug of tea off the worktop, then
   *   flips open the biscuit jar's lid and takes a biscuit out ·
   * count — his housemate lifts his notepad off the table, adds a fifth stroke to the
   *   tally on it and lays it down again; the cap nibbles his biscuit ·
   * arrive — the coach walks in carrying a bowl of fruit, tips his hat, gestures at the
   *   cap and then at the clock ·
   * loop — he points at the clock, then the jar, then the cup of tea, in turn ·
   * reward — the cap sits down with his tea and leans back in his chair ·
   * rule — the coach points at the clock and the tea, sets the bowl down beside the jar
   *   and closes the jar's lid under his hand ·
   * jab — the housemate sits back and folds his arms; the coach steps back ·
   * will — the coach mimes pushing against something heavy, then lets it go ·
   * swap — the cap gets up, takes an apple from the bowl and sits back down with his tea ·
   * rest — everyone at ease under the quotation.
   */
  act?: 'chime' | 'count' | 'arrive' | 'loop' | 'reward' | 'rule' | 'jab' | 'will' | 'swap' | 'rest';
  /** The coach is on the stage. He walks in on `arrive`. */
  th?: boolean;
  /** The wall clock’s hands: 0 a quarter to three · 1 three o’clock. */
  hour?: number;
  /** The jar: 0 lid on · 1 lid off and a biscuit out. */
  lid?: number;
  /** The fruit bowl: 0 not yet on the worktop (the coach carries it in) · 1 set down beside the jar. */
  bowl?: number;
  /** First question on the stage: the clock, the jar and his chair are the things to tap. */
  cue?: boolean;
  /** Second question on the stage: the apple, the chocolate bar and the jar are the things to tap. */
  reach?: boolean;
}

export const BEATS: Growth2Beat[] = [
  {
    bed: 'kitchen',
    sfx: [{ id: 'clockchime', at: 0.85, gain: 0.8 }, { id: 'jarlid', at: 2.56, gain: 0.8 }],
    act: 'chime', hour: 1, lid: 1, bowl: 0,
    speaker: 'cap',
    text: 'Three o’clock already! Time for a cup of tea, and just the one biscuit.',
    pace: ['brisk', 'even'],
    dur: 1.8,
  },
  {
    sfx: [{ id: 'pencil', at: 1.51, gain: 0.8 }],
    act: 'count', hour: 1, lid: 1, bowl: 0,
    speaker: 'plain',
    text: 'Just the one, at three, every day this week. Not that I’ve been counting.',
    pace: ['even', 'brisk'],
    dur: 1.8,
  },
  {
    act: 'arrive', th: true, hour: 1, lid: 1, bowl: 0,
    speaker: 'tophat',
    text: 'The man with the biscuit isn’t even hungry. He’s caught in a habit, and every habit runs on a loop.',
    pace: ['even', 'even'],
    dur: 2.1,
  },
  {
    act: 'loop', th: true, hour: 1, lid: 1, bowl: 0,
    speaker: 'tophat',
    text: 'A cue starts it, and the routine is what you do. The reward at the end makes you want to do it again.',
    pace: ['even', 'even'],
    dur: 2.1,
  },
  {
    th: true, hour: 1, lid: 1, bowl: 0, cue: true,
    interact: {
      prompt: 'He isn’t hungry. What sets off his biscuit habit every afternoon?',
      explain: 'The clock striking three. That’s the cue. The jar is part of the routine, and the chair is only where he sits. Find the cue, and you’ve found where a habit starts.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    sfx: [{ id: 'chair', at: 3.7, gain: 0.8 }, { id: 'mug', at: 4.42, gain: 0.8 }],
    act: 'reward', th: true, hour: 1, lid: 1, bowl: 0,
    speaker: 'cap',
    text: 'I suppose it’s the break I’m after. Ten quiet minutes, and a sit down.',
    pace: 'even',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'jarlid', at: 4.74, gain: 0.8 }, { id: 'mug', at: 5.95, gain: 0.8 }],
    act: 'rule', th: true, hour: 1, lid: 0, bowl: 1,
    speaker: 'tophat',
    text: 'Then keep the cue, and keep the reward. Change only the routine in the middle.',
    pace: ['even', 'even'],
    dur: 2.1,
  },
  {
    act: 'jab', th: true, hour: 1, lid: 0, bowl: 1,
    speaker: 'plain',
    text: 'Or he could stop. Willpower, I believe it’s called.',
    pace: ['even', 'brisk'],
    dur: 1.8,
  },
  {
    act: 'will', th: true, hour: 1, lid: 0, bowl: 1,
    speaker: 'tophat',
    text: 'Fighting a cue every single day is hard work. A swap is easier, because the habit still gets what it came for.',
    pace: ['even', 'even'],
    dur: 2.1,
  },
  {
    th: true, hour: 1, lid: 0, bowl: 1, reach: true,
    interact: {
      prompt: 'Three o’clock will still come tomorrow. What could he reach for instead?',
      explain: 'The apple. It keeps the cue and the break, and changes only what he does in between. The chocolate bar is the same routine in a different wrapper.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    sfx: [{ id: 'chair', at: 4.61, gain: 0.8 }],
    act: 'swap', th: true, hour: 1, lid: 0, bowl: 1,
    speaker: 'cap',
    text: 'An apple and a cup of tea, then. Do you know, it’s the sitting down I like best.',
    pace: ['brisk', 'even'],
    dur: 1.8,
  },
  {
    act: 'rest', th: true, hour: 1, lid: 0, bowl: 1,
    quote: {
      id: 'lq-personal-growth-foundations-2-1',
      text: 'All our life, so far as it has definite form, is but a mass of habits.',
      author: 'William James',
      work: 'Talks to Teachers on Psychology',
      era: '1899',
      branchSlugs: ['personal-growth'],
    },
    dur: 3.0,
  },
  {
    th: true, hour: 1, lid: 0, bowl: 1,
    summary: {
      title: 'How Habits Work',
      points: [
        'A habit is a loop: cue, routine and reward',
        'Keep the cue and the reward, and swap the routine',
        'A swap is easier than fighting the cue',
      ],
      closing: 'Next time you catch yourself in a habit, look for the cue that started it.',
    },
    dur: 2.8,
  },
];
