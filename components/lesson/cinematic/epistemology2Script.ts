import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic epistemology-knowledge-3, "Can You Be Wrong About Something You're
// Certain Of?" — Descartes' evil demon.
// Theme: A STOVE-HEATED ROOM AT NIGHT, A CANDLE, AND THE SHADOW THE FIRE THROWS.
//
// Descartes writes by candlelight in his stove-heated room. He carries the candle
// to the three things on the wall — the window (the senses), a portrait (memory)
// and a slate with 2 + 3 = 5 on it (sums) — and a question hangs over each. The
// stove's fire throws a horned shadow up the wall, the demon, and it reaches out
// and corrupts each in turn. He treats each as false with his own hands: wipes
// the slate, turns the portrait to the wall, closes the shutters. The shadow thins
// when he says he doesn't believe in it; every belief fails the test; he walks back
// to his desk and writes I EXIST. Then he puts the room back, on that foundation.
//
// Redrawn 2026-09-26, the second lesson of the branch in reading order. Every line,
// citation, quotation and summary point is copied from the previous script by a
// generator, word for word and beat for beat; both questions are asked on the stage.
// ─────────────────────────────────────────────────────────────────────────────

export interface Epi2Beat extends BaseBeat {
  /** His pose under the act. Bands per N2: <100 rig, 100+ held, 300+ played. */ p?: number;
  /** Where he stands: 290 at his desk · 312 by the candle · 180 between the portrait and the slate · 140 at the window. */ x?: number;
  /** The act across this beat's line (the scene choreographs it). */
  act?: 'write' | 'candle' | 'world' | 'demon' | 'treat' | 'test' | 'exist' | 'rebuild';
  /** He carries the lit candle. */ lit?: boolean;
  /** A question hangs over each of the three: the senses, memory, sums. */ tested?: boolean;
  /** The demon's shadow is on the wall. */ shadow?: boolean;
  /** The shadow has corrupted all three. */ faked?: boolean;
  /** He has treated each as false: slate wiped, portrait turned, shutters closed. */ treated?: boolean;
  /** The shadow has thinned: he doesn't believe in it. */ ghost?: boolean;
  /** Each question has become a cross: every belief failed the test. */ failed?: boolean;
  /** I EXIST is written in the notebook. */ written?: boolean;
  /** The room is put back, on that foundation. */ rebuilt?: boolean;
  /** Q1 on the stage: three notes pinned to the wall. */ notes?: boolean;
  /** Q2 on the stage: three tags. */ tags?: boolean;
  /** This beat's camera tour, over the generated one (K10); [] holds the whole room. */ tour?: readonly (readonly number[])[];
}

export const BEATS: Epi2Beat[] = [
  {
    // The whole room stays in frame: the labels, questions and crosses over the three
    // things on the wall ARE the argument, and a push onto him would crop them away.
    // The following beats hold the shot this one has, so this one decides them all.
    p: 268, x: 290, act: 'write', tour: [],
    text: 'Can you be wrong about something you feel certain of? René Descartes set out to doubt his beliefs, to find a firm foundation for knowledge.',
    dur: 3.8,
  },
  {
    p: 158, x: 312, act: 'candle', lit: true,
    text: 'The question rests on a distinction between certainty and truth. Feeling certain is something happening in you.',
    cite: 'Certainty versus truth',
    dur: 1.9,
  },
  {
    p: 158, x: 180, act: 'world', lit: true, tested: true,
    text: 'Truth is a matter of how the world is. Since certainty can accompany a false belief, Descartes seeks beliefs that withstand every possible doubt.',
    dur: 2.9,
  },
  {
    p: 158, x: 180, act: 'demon', lit: true, tested: true, shadow: true, faked: true,
    text: 'Descartes supposes an evil demon who uses all its power to deceive him. His senses, his memories and even simple sums could then be false.',
    cite: 'Descartes, First Meditation, 1641',
    dur: 4.4,
  },
  {
    p: 158, x: 140, act: 'treat', lit: true, tested: true, shadow: true, faked: true, treated: true,
    text: 'Descartes resolves to treat every belief that could possibly be false as if it were false.',
    dur: 1.8,
  },
  {
    p: 263, x: 140, lit: true, tested: true, shadow: true, faked: true, treated: true,
    quote: {
      id: 'lq-epistemology-knowledge-3-1',
      text: 'I am, I exist, is necessarily true whenever it is put forward by me or conceived in my mind.',
      author: 'René Descartes',
      work: 'Meditations on First Philosophy, II',
      era: '1641',
      philosopherId: 'descartes',
      branchSlugs: ['epistemology'],
    },
    dur: 3.4,
  },
  {
    p: 167, x: 140, act: 'test', lit: true, tested: true, shadow: true, faked: true, treated: true, ghost: true, failed: true,
    text: 'Descartes does not believe the demon exists. The supposition is a test: of each belief, he asks whether a deceiver could mislead him about it.',
    cite: 'Methodological doubt',
    dur: 2.7,
  },
  {
    p: 268, x: 290, act: 'exist', tested: true, shadow: true, faked: true, treated: true, ghost: true, failed: true, written: true,
    text: 'Nearly every belief fails this test. One survives, the belief “I exist”, because a deceiver needs someone to deceive.',
    dur: 1.8,
  },
  {
    p: 158, x: 140, act: 'rebuild', tested: true, shadow: true, ghost: true, failed: true, written: true, rebuilt: true,
    text: 'Used as a method, doubt is constructive. It removes uncertain beliefs to reach a foundation on which knowledge can be rebuilt.',
    dur: 1.8,
  },
  {
    p: 260, x: 140, tested: true, shadow: true, ghost: true, failed: true, written: true, rebuilt: true, notes: true,
    interact: {
      prompt: 'Why would Descartes suppose a demon he didn’t believe existed?',
      explain: 'To find what can’t be doubted. He didn’t believe in the demon: it makes doubt as extreme as possible, so any belief that survives the demon is certain. And Descartes never concludes that the world is unreal. In the Sixth Meditation he argues that the material world exists.',
      xp: 5,
    },
    dur: 1,
  },
  {
    p: 260, x: 140, tested: true, shadow: true, ghost: true, failed: true, written: true, rebuilt: true, tags: true,
    interact: {
      prompt: 'If a demon deceived you about everything, what would remain certain?',
      explain: 'The doubter. To be deceived, you must exist, so being deceived proves that you exist. Arithmetic isn’t certain, because a powerful deceiver could make a false sum seem true.',
      xp: 5,
    },
    dur: 1,
  },
  {
    written: true, rebuilt: true,
    summary: {
      title: 'What Survives the Demon',
      points: [
        'Feeling certain is not the same as being true',
        'The evil demon tests which beliefs can be doubted',
        'Doubt can be a method for finding certainty',
        '“I am, I exist” survives every possible doubt',
      ],
      closing: 'For Descartes, systematic doubt is the first step towards knowledge with a secure foundation.',
    },
    dur: 2.8,
  },
];
