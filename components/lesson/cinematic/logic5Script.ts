import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic logic-arguments-5, "Thinking Step by Step" — the SHOWCASE lesson for
// the richer visual language. The stage is an INFERENCE PIPELINE drawn as a proper
// flow diagram: two premise cards feed a geared inference box, a token travels the
// arrows, and the conclusion drops out below. Then a ladder + a four-step staircase
// chart for "divide it into parts and climb from the simplest step up" (Descartes).
//
// Scene-driven answers (no A/B/C/D):
//   Q1  TAP-THE-SCENE  — a four-card proof of Euclid I.1 with one step left blank;
//                        tap the gap, and the missing common notion writes itself in.
//   Q2  FEED-A-MACHINE — send a proof that "feels obviously right" down the right chute.
// Both are the graded questions from data/.../thinking-step-by-step.ts, reframed.
// ─────────────────────────────────────────────────────────────────────────────

export interface Logic5Beat extends BaseBeat {
  /** Figure gesture (emote code). Ignored while climbing. */ p?: number;
  /** Figure is climbing the ladder (0/1). */ climb?: number;
  /** The premise → inference → conclusion pipeline on stage (0/1). */ machine?: number;
  /** Pipeline running — gears turn, a token rides the arrows (0/1). */ run?: number;
  /** The four-card proof chain on stage, tappable (0/1). */ chain?: number;
  /** The ladder of steps on stage (0/1). */ ladder?: number;
  /** The staircase chart beside the ladder (0/1). */ steps?: number;
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
    text: 'An argument moves from premises — claims you grant — to a conclusion they force. Each move is an inference.',
    cite: 'Premises → conclusion',
    dur: 3.2,
  },
  {
    p: 27, machine: 1, run: 1,
    text: 'Feed the premises in; the conclusion comes out the other end.',
    dur: 1.8,
  },
  {
    p: 167, machine: 1, run: 1,
    text: 'Euclid drew a circle around A through B, another around B through A; they cross at C. AB equals AC, AB equals BC — so AC equals BC.',
    cite: 'Euclid, Elements I.1',
    dur: 4.1,
  },
  {
    p: 167, machine: 1, run: 1,
    text: 'A triangle, proved link by link.',
    dur: 1.8,
  },
  {
    p: 147, machine: 1,
    quote: {
      id: 'lq-logic-arguments-5',
      text: 'Divide each of the difficulties under examination into as many parts as possible, as might be necessary for its solution.',
      author: 'René Descartes',
      philosopherId: 'rene-descartes',
      work: 'Discourse on the Method',
      era: '1637',
      branchSlugs: ['logic'],
    },
    dur: 3.4,
  },
  {
    p: 4, chain: 1,
    interact: {
      prompt: 'Euclid’s proof has one step missing. Tap the gap where a hidden flaw could sit.',
      explain:
        'The gap sits between the two equalities and the conclusion. Euclid never leaves it out: things equal to the same thing are equal to each other. Every unwritten step is a place a faulty inference can hide, so skipping steps never makes a proof stronger.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    climb: 1, ladder: 1, steps: 1,
    text: 'Validity lives in the form, not the vibe. Spell out every inference and you can see exactly where the chain might break — then climb it, from the simplest step up.',
    cite: 'One rung at a time',
    dur: 4.4,
  },
  {
    p: 13, chute: 1,
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
