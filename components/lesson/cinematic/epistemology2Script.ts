import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic epistemology-knowledge-3, "Can You Be Wrong About Something You're
// Certain Of?" — Descartes' evil demon. A horned demon fakes reality; the floating
// beliefs it can counterfeit fade away one by one, while the doubter reacts
// (unease → recoil → resolve). One belief refuses to fade: "I exist."
//
// Both graded questions come from data/.../can-you-be-wrong-and-think-you-know.ts.
// ─────────────────────────────────────────────────────────────────────────────

export interface Epi2Beat extends BaseBeat {
  /** Doubter gesture (emote code). */ d?: number;
  /** Demon gesture (emote code), -1 = off stage. */ m?: number;
  /** How much of reality the demon has faked away, 0→1. */ doubt?: number;
  /** The surviving self glows ("I exist"). */ glow?: boolean;
  /** Every belief is put to the test: a question mark stands at the end of each row (0/1). */ test?: number;
  /** The beliefs that could be false are treated as false: struck through and dimmed (0/1). */ treat?: number;
  /** The audit's verdict on I EXIST: stamped SURVIVES (0/1). */ kept?: number;
  /** Knowledge rebuilt: new stones are laid on the plinth that never fell (0/1). */ rebuilt?: number;
}

export const BEATS: Epi2Beat[] = [
  {
    d: 12, m: 5, doubt: 0.1,
    text: 'Can you be wrong about something you feel certain of? René Descartes set out to doubt his beliefs, to find a firm foundation for knowledge.',
    dur: 3.8,
  },
  {
    d: 457, m: 7, doubt: 0.2,
    text: 'The question rests on a distinction between certainty and truth. Feeling certain is something happening in you.',
    cite: 'Certainty versus truth',
    dur: 1.9,
  },
  {
    d: 457, m: 7, doubt: 0.2, test: 1,
    text: 'Truth is a matter of how the world is. Since certainty can accompany a false belief, Descartes seeks beliefs that withstand every possible doubt.',
    dur: 2.9,
  },
  {
    // "could then be false": the demon's reach stamps three rows FAKED …
    d: 15, m: 13, doubt: 0.62, test: 1,
    text: 'Descartes supposes an evil demon who uses all its power to deceive him. His senses, his memories and even simple sums could then be false.',
    cite: 'Descartes, First Meditation, 1641',
    dur: 4.4,
  },
  {
    // … and "treat … as if it were false" strikes them through.
    d: 258, m: 13, doubt: 0.62, test: 1, treat: 1,
    text: 'Descartes resolves to treat every belief that could possibly be false as if it were false.',
    dur: 1.8,
  },
  {
    d: 22, m: 1, doubt: 0.9, glow: true, test: 1, treat: 1,
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
    d: 13, m: 6, doubt: 0.85, glow: true, test: 1, treat: 1,
    text: 'Descartes does not believe the demon exists. The supposition is a test: of each belief, he asks whether a deceiver could mislead him about it.',
    cite: 'Methodological doubt',
    dur: 2.7,
  },
  {
    // The audit's verdict on the last row lands when the narration gives it.
    d: 266, m: 6, doubt: 0.85, glow: true, test: 1, treat: 1, kept: 1,
    text: 'Nearly every belief fails this test. One survives, the belief “I exist”, because a deceiver needs someone to deceive.',
    dur: 1.8,
  },
  {
    // "a foundation on which knowledge can be rebuilt": stones go back on the plinth.
    d: 266, m: 6, doubt: 0.85, glow: true, test: 1, treat: 1, kept: 1, rebuilt: 1,
    text: 'Used as a method, doubt is constructive. It removes uncertain beliefs to reach a foundation on which knowledge can be rebuilt.',
    dur: 1.8,
  },
  {
    d: 9, m: 3, doubt: 0.85, glow: true, test: 1, treat: 1, kept: 1, rebuilt: 1,
    interact: {
      prompt: 'Why would Descartes suppose a demon he didn’t believe existed?',
      cards: [
        { text: 'To find beliefs beyond all doubt', correct: true },
        { text: 'To prove the world unreal', correct: false },
      ],
      explain: 'To find beliefs beyond all doubt. The demon makes doubt as extreme as possible, so a belief that survives the demon is certain. Descartes never concludes that the world is unreal. In the Sixth Meditation he argues that the material world exists.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    d: 16, m: 15, doubt: 1.0, glow: true, test: 1, treat: 1, kept: 1, rebuilt: 1,
    interact: {
      prompt: 'If a demon deceived you about everything, what would remain certain?',
      sort: {
        chip: 'the demon',
        bins: [
          { id: 'all', label: 'nothing at all', reads: 'nothing at all would remain certain' },
          { id: 'sums', label: 'arithmetic', reads: 'simple arithmetic would remain certain' },
          { id: 'doubter', label: 'the doubter', reads: 'the existence of the one deceived', correct: true },
        ],
      },
      explain: 'The doubter. To be deceived, you must exist, so being deceived proves that you exist. Arithmetic isn’t certain, because a powerful deceiver could make a false sum seem true.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
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
