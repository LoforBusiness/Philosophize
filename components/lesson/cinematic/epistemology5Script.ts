import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic epistemology-knowledge-5, "Why Are Humans Driven to Know Things?".
// A lone figure under a night sky, gazing up in wonder at a bright star — the pull
// to understand, "woven into human nature." It reaches for the light (Aristotle's
// wisdom sought for its own sake), then grasps it and the star throws off rays:
// Bacon's knowledge-as-power. An upward, awe-struck scene, unlike any other.
//
// Graded questions are the two from data/.../why-humans-seek-knowledge.ts.
// ─────────────────────────────────────────────────────────────────────────────

export interface Epi5Beat extends BaseBeat {
  /** Figure gesture. */ p?: number;
  /** Star brightness 0..1. */ star?: number;
  /** Bacon's power — the star throws off rays (0/1). */ power?: number;
}

export const BEATS: Epi5Beat[] = [
  {
    p: 25, star: 0.4, power: 0,
    text: '"All men by nature desire to know." The first line of Aristotle’s Metaphysics — 2,400 years old, still humming.',
    dur: 3.6,
  },
  {
    p: 24, star: 0.8,
    text: 'The highest knowledge, he says, is not the useful kind — it is wisdom, sought for its own sake. He calls it the only "free" science, serving nothing but understanding itself.',
    cite: 'Aristotle, Metaphysics I',
    dur: 5.0,
  },
  {
    p: 19, star: 1,
    text: 'His proof? The delight we take in our senses, above all sight. We love seeing "even apart from its usefulness." That bare joy in grasping the world is where wisdom begins.',
    cite: 'The joy of sight',
    dur: 4.8,
  },
  {
    p: 4, star: 1,
    text: 'Both Plato and Aristotle root philosophy in thaumazein — wonder. "It is owing to their wonder that men begin to philosophize." But wonder is also being puzzled, thrown off balance.',
    cite: 'Thaumazein — wonder',
    dur: 4.8,
  },
  {
    p: 37, star: 1, power: 1,
    text: 'Centuries later Francis Bacon shifts the goal: knowledge should give command over nature. Where Aristotle prized it for contemplation, Bacon seized it as an instrument.',
    cite: 'Knowledge as power',
    dur: 4.8,
  },
  {
    p: 0, star: 1, power: 1,
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
    p: 25, star: 1,
    mc: {
      prompt: 'According to Aristotle, why do human beings desire knowledge?',
      options: [
        { id: 'a', text: 'The pull to understand is woven into human nature', correct: true },
        { id: 'b', text: 'Only to seize power and advantage over rivals', correct: false },
        { id: 'c', text: 'Because society pressures us to keep learning', correct: false },
        { id: 'd', text: 'To hold the terror of death at arm’s length', correct: false },
      ],
      explain:
        'Aristotle grounds the desire to know in human nature itself — the highest wisdom is wanted for its own sake.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 13, star: 1, power: 1,
    mc: {
      prompt: 'Who said "knowledge is power," tying knowing to command over nature?',
      options: [
        { id: 'a', text: 'Aristotle, in the opening of the Metaphysics', correct: false },
        { id: 'b', text: 'Plato, in the Theaetetus dialogue on wonder', correct: false },
        { id: 'c', text: 'Francis Bacon, who recast knowledge as an instrument', correct: true },
        { id: 'd', text: 'Socrates, who claimed to know nothing at all', correct: false },
      ],
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
