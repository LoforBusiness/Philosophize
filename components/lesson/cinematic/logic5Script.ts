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
  /**
   * 0..3 — how many of the triangle's three equal sides the proof has confirmed
   * so far, filling a row of three ticks under the conclusion box left to right
   * (AB = AC, AB = BC, and the AC = BC the machine outputs).
   */ equalCount?: number;
}

export const BEATS: Logic5Beat[] = [
  {
    p: 384, machine: 1,
    text: 'A proof is a sequence of steps that leads from premises to a conclusion. If any single step fails, the proof fails.',
    dur: 3.4,
  },
  {
    p: 27, machine: 1, run: 1,
    text: 'The premises are the claims granted at the start. Each step from claims already granted to a new claim is called an inference.',
    cite: 'From premises to conclusion',
    dur: 3.2,
  },
  {
    p: 281, machine: 1, run: 1, equalCount: 1,
    text: 'An inference is valid when the premises, if true, guarantee that the conclusion is true.',
    dur: 1.8,
  },
  {
    p: 459, machine: 1, run: 1, equalCount: 2,
    text: 'In Euclid’s first proposition, circles centred on point A and point B meet at point C. Line AC and line BC each equal line AB, so they equal each other.',
    cite: 'Euclid, Elements, Proposition 1',
    dur: 4.1,
  },
  {
    p: 459, machine: 1, run: 1, equalCount: 3,
    text: 'The triangle on line AB therefore has three equal sides. Euclid builds this result from a short sequence of stated steps.',
    dur: 1.8,
  },
  {
    p: 147, machine: 1, equalCount: 3,
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
    p: 165, chain: 1,
    interact: {
      prompt: 'In this version of Euclid’s proof, which step has been left unstated?',
      explain:
        'The step between the two equalities and the conclusion. Euclid states it as a common notion: things equal to the same thing are equal to each other. An unstated step can hide a faulty inference, so omitting steps never strengthens a proof.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    climb: 1, ladder: 1, steps: 1,
    text: 'Stating every inference shows where a proof could fail. Descartes’s third rule is to begin with the simplest objects and rise, step by step, to the more complex.',
    cite: 'Descartes, Discourse on the Method',
    dur: 4.4,
  },
  {
    p: 383, chute: 1,
    interact: {
      prompt: 'A proof seems correct at a glance but leaves three steps unstated. Should it be trusted or checked?',
      explain: 'Check it. A proof’s seeming obvious is no evidence of its validity. Each unstated step could hide a faulty inference, so the missing steps must be supplied and examined.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Reasoning Step by Step',
      points: [
        'An argument moves from premises to conclusion by inference',
        'In a valid deduction, the conclusion must follow',
        'Euclid proved theorems one explicit step at a time',
        'An unstated step can hide a faulty inference',
      ],
      closing: 'Descartes’s method applies beyond geometry: divide a problem into parts and begin with the simplest.',
    },
    dur: 2.8,
  },
];
