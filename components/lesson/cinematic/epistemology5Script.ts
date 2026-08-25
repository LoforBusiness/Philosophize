import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic epistemology-knowledge-5, "Why Are Humans Driven to Know Things?".
// A figure under a night sky watches Aristotle's own ladder build itself rung by
// rung — sensation, memory, experience, science, and at the top wisdom, with the
// star of understanding burning over it (Metaphysics I). Then Bacon runs a line
// down off the top rung to a box marked KNOWLEDGE → POWER: same ladder, new purpose.
//
// Q1 is the deck's four-option question. Q2 is answered IN THE SCENE — the ladder
// gives way to four name plates and the reader taps who said it.
//
// Graded questions are the two from data/.../why-humans-seek-knowledge.ts.
// ─────────────────────────────────────────────────────────────────────────────

export interface Epi5Beat extends BaseBeat {
  /** Figure gesture. */ p?: number;
  /** Star brightness 0..1. */ star?: number;
  /** Bacon's power — the line down to COMMAND OVER NATURE (0/1). */ power?: number;
  /** How many rungs of Aristotle's ladder are drawn (0..5, bottom up). */ rungs?: number;
}

export const BEATS: Epi5Beat[] = [
  {
    p: 25, star: 0.4, power: 0, rungs: 2,
    text: '"All men by nature desire to know." Aristotle opens his largest book with that line, and it is a claim about you. Nobody taught you to want to know things.',
    dur: 3.6,
  },
  {
    p: 24, star: 0.8, rungs: 5,
    text: 'The best kind of knowing, he says, is not the useful kind. It is the kind you want for no reason beyond wanting it. He calls that the only free knowledge, because it is in service of nothing.',
    cite: 'Aristotle, Metaphysics I',
    dur: 5.0,
  },
  {
    p: 19, star: 1, rungs: 5,
    text: 'His evidence is small and hard to argue with. You like looking at things. Not in order to get anything out of it — you just do, and that plain pleasure is where the whole ladder starts.',
    cite: 'The joy of sight',
    dur: 4.8,
  },
  {
    p: 4, star: 1, rungs: 5,
    // The cite plate carries `thaumazein`; the narration says what it means. A term
    // the reader can SEE spelled out does not also need spelling out in the prose (J7).
    text: 'Both Plato and Aristotle say philosophy begins in wonder. Not the pleasant kind. Their word is closer to being knocked off balance by something you cannot account for.',
    cite: 'Thaumazein — wonder',
    dur: 4.8,
  },
  {
    p: 37, star: 1, power: 1, rungs: 5,
    text: 'Centuries later Francis Bacon points the whole ladder somewhere else. Knowledge is for getting things done, and for making nature do what you want. Aristotle wanted to understand it. Bacon wanted to use it.',
    cite: 'Knowledge as power',
    dur: 4.8,
  },
  {
    p: 129, star: 1, power: 1, rungs: 5,
    quote: {
      id: 'lq-epistemology-knowledge-5-1',
      text: 'Knowledge itself is power.',
      author: 'Francis Bacon',
      work: 'Meditationes Sacrae',
      era: '1597',
      branchSlugs: ['epistemology'],
    },
    dur: 3.0,
  },
  {
    p: 25, star: 1, rungs: 5,
    interact: {
      prompt: 'Slide the seam to where Aristotle puts the wanting to know.',
      split: {
        left: 'BORN WITH IT', right: 'TAUGHT IT',
        start: 0.04,
        zones: [
          { id: 'taught', upto: 0.32, reads: 'trained into you by school and habit' },
          { id: 'both', upto: 0.66, reads: 'a spark you are born with, then fanned' },
          { id: 'born', upto: 1, reads: 'there from the start, in the nature', correct: true },
        ],
      },
      explain: 'Nearly all of it is in the nature. Aristotle opens with all men by nature desire to know, and the middle is the tempting compromise. Nobody has to be trained to want to know what is behind a closed door.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 13, star: 1, power: 1, rungs: 5,
    interact: {
      // Was "Who said ... ? Tap the name" — a memory test of the quote card two beats
      // back. Asking which of them HELD the position is the same tap and a real question (J8).
      prompt: 'One of these four wanted knowledge in order to make nature obey. Tap them.',
      explain:
        'Bacon. He is the one who turned knowing into a tool. Aristotle is the trap, and he wanted the opposite — knowledge worth having even if it never did a thing for you.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Human Drive to Know',
      points: [
        'Aristotle: the desire to know is in our nature',
        'Wisdom, sought for itself, is the "free" science',
        'Wonder (thaumazein) is where philosophy begins',
        'Bacon redirects knowledge toward power',
      ],
      closing: 'Every "why?" you ask proves Aristotle right: curiosity isn’t just what you do — it’s who you are.',
    },
    dur: 2.8,
  },
];
