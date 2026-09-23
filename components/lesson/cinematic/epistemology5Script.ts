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
  /** 1 = a "BORN WITH IT" tag lands by the figure, once the innate claim is made. */ born?: number;
  /** 1 = a ring marks the WISDOM rung as the one sought for its own sake. */ freeRing?: number;
  /** 1 = a ring marks the SENSATION rung, the lowest and the one every animal has. */ sightRing?: number;
  /** 1 = a second, smaller spark joins the star — Plato agreeing with Aristotle. */ twin?: number;
  /** 1 = a ring marks the SCIENCE rung, "knowing the why" that resolves perplexity. */ puzzleRing?: number;
  /** 1 = a VS tag lands on Bacon's line, contrasting his purpose with Aristotle's. */ vs?: number;
}

export const BEATS: Epi5Beat[] = [
  {
    p: 164, star: 0.4, power: 0, rungs: 2,
    text: 'Aristotle opens his Metaphysics with a claim about human nature. He writes that “all men by nature desire to know”.',
    dur: 2.6,
  },
  {
    p: 164, star: 0.4, power: 0, rungs: 2, born: 1,
    text: 'On this view, nobody needs to be taught to want knowledge. The desire comes with being human.',
    dur: 1.8,
  },
  {
    p: 275, star: 0.8, rungs: 5, born: 1,
    text: 'Aristotle ranks the kinds of knowledge. The highest, wisdom, isn’t valued for its usefulness but is sought for its own sake.',
    cite: 'Aristotle, Metaphysics, Book One',
    dur: 3.2,
  },
  {
    p: 275, star: 0.8, rungs: 5, born: 1, freeRing: 1,
    text: 'Aristotle calls wisdom the only free science. Just as a free person exists for their own sake, so does wisdom.',
    dur: 1.8,
  },
  {
    p: 19, star: 1, rungs: 5, born: 1, freeRing: 1,
    text: 'Aristotle offers evidence from ordinary life: people delight in their senses, and above all in sight.',
    cite: 'The joy of sight',
    dur: 1.8,
  },
  {
    p: 169, star: 1, rungs: 5, born: 1, freeRing: 1, sightRing: 1,
    text: 'People enjoy seeing even when it serves no purpose. Sensation is the lowest rung of Aristotle’s ladder of knowledge.',
    dur: 3,
  },
  {
    p: 467, star: 1, rungs: 5, born: 1, freeRing: 1, sightRing: 1, twin: 1,
    // The cite plate carries `thaumazein`; the narration says what it means. A term
    // the reader can SEE spelled out does not also need spelling out in the prose (J7).
    text: 'Plato and Aristotle both hold that philosophy begins in wonder. Plato says so in the Theaetetus, Aristotle in the Metaphysics.',
    cite: 'Thaumazein — wonder',
    dur: 2.2,
  },
  {
    p: 467, star: 1, rungs: 5, born: 1, freeRing: 1, sightRing: 1, twin: 1, puzzleRing: 1,
    // The cite plate carries `thaumazein`; the narration says what it means. A term
    // the reader can SEE spelled out does not also need spelling out in the prose (J7).
    text: 'Aristotle links wonder to perplexity. Someone puzzled by what they can’t explain becomes aware of their own ignorance.',
    dur: 2.6,
  },
  {
    p: 272, star: 1, power: 1, rungs: 5, born: 1, freeRing: 1, sightRing: 1, twin: 1, puzzleRing: 1,
    text: 'Nearly two thousand years later, Francis Bacon gave knowledge a new purpose. For Bacon, knowledge is worth having for the power it gives over nature.',
    cite: 'Knowledge as power',
    dur: 3.4,
  },
  {
    p: 272, star: 1, power: 1, rungs: 5, born: 1, freeRing: 1, sightRing: 1, twin: 1, puzzleRing: 1, vs: 1,
    text: 'Aristotle prized understanding nature for its own sake. Bacon prized knowledge that could be used to control nature.',
    dur: 1.8,
  },
  {
    p: 129, star: 1, power: 1, rungs: 5, born: 1, freeRing: 1, sightRing: 1, twin: 1, puzzleRing: 1, vs: 1,
    quote: {
      id: 'lq-epistemology-knowledge-5-1',
      text: 'Knowledge itself is power.',
      author: 'Francis Bacon',
      philosopherId: 'francis-bacon',
      work: 'Meditationes Sacrae',
      era: '1597',
      branchSlugs: ['epistemology'],
    },
    dur: 3.0,
  },
  {
    p: 172, star: 1, rungs: 5,
    interact: {
      prompt: 'As a person grows, which shape does the desire to know take?',
      plot: {
        cols: ['INFANT', 'CHILD', 'ADULT'],
        axis: 'THE DESIRE TO KNOW',
        start: [0.3, 0.3, 0.3],
        shapes: [
          { id: 'born', profile: [0.85, 0.88, 0.86, 0.89, 0.87], reads: 'there from the start', correct: true },
          { id: 'taught', profile: [0.05, 0.25, 0.5, 0.75, 0.95], reads: 'put there by teaching' },
          { id: 'mixed', profile: [0.4, 0.5, 0.6, 0.7, 0.8], reads: 'a little innate, mostly taught' },
        ],
      },
      explain: 'There from the start. Aristotle opens the Metaphysics with the claim that all human beings by nature desire to know, and offers the delight taken in the senses for its own sake as evidence. Teaching shapes it; it doesn\'t install it.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 383, star: 1, power: 1, rungs: 5,
    interact: {
      // Was "Who said ... ? Tap the name" — a memory test of the quote card two beats
      // back. Asking which of them HELD the position is the same tap and a real question (J8).
      prompt: 'Which of these thinkers valued knowledge as a means of controlling nature?',
      explain:
        'Francis Bacon. He valued knowledge for the power it gives over nature. Aristotle held the opposite view: the highest knowledge is sought for its own sake, whatever its use.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Human Drive to Know',
      points: [
        'Aristotle: the desire to know is part of human nature',
        'Wisdom, sought for its own sake, is the free science',
        'Philosophy begins in wonder, or thaumazein',
        'Bacon valued knowledge for its power over nature',
      ],
      closing: 'The question remains whether knowledge is valuable in itself, as Aristotle held, or for its uses, as Bacon held.',
    },
    dur: 2.8,
  },
];
