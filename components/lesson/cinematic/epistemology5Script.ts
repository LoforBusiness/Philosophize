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
    text: '"All men by nature desire to know." The first line of Aristotle’s Metaphysics — 2,400 years old, still humming.',
    dur: 3.6,
  },
  {
    p: 24, star: 0.8, rungs: 5,
    text: 'The highest knowledge, he says, is not the useful kind — it is wisdom, sought for its own sake. He calls it the only "free" science, serving nothing but understanding itself.',
    cite: 'Aristotle, Metaphysics I',
    dur: 5.0,
  },
  {
    p: 19, star: 1, rungs: 5,
    text: 'His proof? The delight we take in our senses, above all sight. We love seeing "even apart from its usefulness." That bare joy in grasping the world is where wisdom begins.',
    cite: 'The joy of sight',
    dur: 4.8,
  },
  {
    p: 4, star: 1, rungs: 5,
    text: 'Both Plato and Aristotle root philosophy in thaumazein — wonder. "It is owing to their wonder that men begin to philosophize." But wonder is also being puzzled, thrown off balance.',
    cite: 'Thaumazein — wonder',
    dur: 4.8,
  },
  {
    p: 37, star: 1, power: 1, rungs: 5,
    text: 'Centuries later Francis Bacon shifts the goal: knowledge should give command over nature. Where Aristotle prized it for contemplation, Bacon seized it as an instrument.',
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
      prompt: 'According to Aristotle, why do human beings desire knowledge?',
      cards: [
        { text: 'It is woven into us', correct: true },
        { text: 'It is taught to us', correct: false },
      ],
      explain: 'Aristotle grounds the desire to know in human nature itself — the highest wisdom is wanted for its own sake.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 13, star: 1, power: 1, rungs: 5,
    interact: {
      prompt: 'Who said "knowledge itself is power," tying knowing to command over nature? Tap the name.',
      explain:
        'Bacon wrote "knowledge itself is power" (1597). Aristotle prized knowledge for its own sake, not for command over nature.',
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
