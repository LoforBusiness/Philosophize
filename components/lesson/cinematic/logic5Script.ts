import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic logic-arguments-5, "Thinking Step by Step" — the SHOWCASE lesson for
// the richer visual language: a word-machine that swallows premise-boxes, turns its
// gears, and rides a conclusion out on a conveyor belt; a chain of inference links;
// and a ladder of steps the figure climbs ("divide it into parts and climb from the
// simplest step up" — Descartes).
//
// New scene-driven answers (no A/B/C/D):
//   Q1  TAP-THE-SCENE  — tap the weak (dashed) link in the chain.
//   Q2  FEED-A-MACHINE — send the machine's output down the right chute.
// Both are the graded questions from data/.../thinking-step-by-step.ts, reframed.
// ─────────────────────────────────────────────────────────────────────────────

export interface Logic5Beat extends BaseBeat {
  /** Figure gesture (emote code). Ignored while climbing. */ p?: number;
  /** Figure is climbing the ladder (0/1). */ climb?: number;
  /** Machine + conveyor on stage (0/1). */ machine?: number;
  /** Machine running — gears turn, boxes flow (0/1). */ run?: number;
  /** The inference chain on stage, tappable (0/1). */ chain?: number;
  /** The ladder of steps on stage (0/1). */ ladder?: number;
  /** The two output chutes on stage, tappable (0/1). */ chute?: number;
}

export const BEATS: Logic5Beat[] = [
  {
    p: 2, machine: 1,
    text: 'A proof is a chain: premises that march, step by step, to a conclusion. One weak link, and it falls.',
    dur: 3.4,
  },
  {
    p: 27, machine: 1, run: 1,
    text: 'An argument moves from premises — claims you grant — to a conclusion they force. Each move is an inference. Feed the premises in; the conclusion comes out the other end.',
    cite: 'Premises → conclusion',
    dur: 5.0,
  },
  {
    p: 1, machine: 1, run: 1,
    text: 'Euclid drew a circle around A through B, another around B through A; they cross at C. AB equals AC, AB equals BC — so AC equals BC. A triangle, proved link by link.',
    cite: 'Euclid, Elements I.1',
    dur: 5.0,
  },
  {
    p: 0, machine: 1,
    quote: {
      id: 'lq-logic-arguments-5',
      text: 'Divide each of the difficulties under examination into as many parts as possible, as might be necessary for its solution.',
      author: 'René Descartes',
      work: 'Discourse on the Method',
      era: '1637',
      branchSlugs: ['logic'],
    },
    dur: 3.4,
  },
  {
    p: 4, chain: 1,
    interact: {
      prompt: 'This chain of reasoning skips a step. Tap the missing link — the gap where a hidden flaw could hide.',
      explain: 'Every missing step is a gap where a faulty inference hides. A good deduction spells out each link so anyone can check it — so leaving steps out never makes it stronger.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    climb: 1, ladder: 1,
    text: 'Validity lives in the form, not the vibe. Spell out every inference and you can see exactly where the chain might break — then climb it, from the simplest step up.',
    cite: 'One rung at a time',
    dur: 4.4,
  },
  {
    p: 13, machine: 1, run: 1, chute: 1,
    interact: {
      prompt: 'A proof "feels obviously right" but skips three steps. Which chute do you send it down?',
      explain: 'Feeling obvious isn’t a check. Unstated steps are exactly where a hidden flaw can slip past you — so send it to be checked, not waved through.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Step-by-Step Thinking Mastered',
      points: [
        'Arguments run premises to conclusion by inference',
        'In a valid deduction, the conclusion must follow',
        'Euclid proved theorems one explicit link at a time',
        'Skipping steps hides where the chain breaks',
      ],
      closing: 'Face a huge problem? Divide it into parts and climb from the simplest step up.',
    },
    dur: 2.8,
  },
];
