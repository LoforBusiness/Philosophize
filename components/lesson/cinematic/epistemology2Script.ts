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
}

export const BEATS: Epi2Beat[] = [
  {
    d: 12, m: 5, doubt: 0.1,
    text: 'What if everything you’re sure of is a lie? Descartes doubted it all on purpose — then rebuilt knowledge from the rubble.',
    dur: 3.8,
  },
  {
    d: 160, m: 7, doubt: 0.2,
    text: 'First he separates two things we run together. Feeling certain is something happening in you.',
    cite: 'Certainty vs truth',
    dur: 1.9,
  },
  {
    d: 160, m: 7, doubt: 0.2,
    text: 'Truth is how the world is. Those two can come apart, so he goes hunting for beliefs that survive every possible doubt.',
    dur: 2.9,
  },
  {
    d: 15, m: 13, doubt: 0.62,
    text: 'So he imagines a demon of utmost power rigging his whole reality. Every sight, every memory, even that two plus three make five — all could be a planted lie.',
    cite: 'Descartes, Meditations I, 1641',
    dur: 4.4,
  },
  {
    d: 15, m: 13, doubt: 0.62,
    text: 'Doubt at maximum.',
    dur: 1.8,
  },
  {
    d: 22, m: 1, doubt: 0.9, glow: true,
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
    d: 13, m: 6, doubt: 0.85, glow: true,
    text: 'The demon is a tool, not a real fear. Of each idea Descartes asks: could the demon fake this?',
    cite: 'Methodological doubt',
    dur: 2.7,
  },
  {
    d: 13, m: 6, doubt: 0.85, glow: true,
    text: 'Most beliefs crack. One refuses.',
    dur: 1.8,
  },
  {
    d: 13, m: 6, doubt: 0.85, glow: true,
    text: 'Used this way, doubt rebuilds rather than ruins.',
    dur: 1.8,
  },
  {
    d: 9, m: 3, doubt: 0.85, glow: true,
    interact: {
      prompt: 'Descartes never believed in the demon. Tap what he was using it for.',
      cards: [
        { text: 'Find what survives fiercest doubt', correct: true },
        { text: 'Prove the world unreal', correct: false },
      ],
      explain: 'The demon is a deliberate stress test. Cranking deception to the extreme reveals what still holds: the thinking self.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    d: 16, m: 15, doubt: 1.0, glow: true,
    interact: {
      prompt: 'Set the lever to what the demon cannot reach.',
      lever: {
        start: 0,
        stops: [
          { id: 'all', reads: 'nothing at all is safe' },
          { id: 'sums', reads: 'arithmetic is safe' },
          { id: 'doubter', reads: 'the one being fooled is safe', correct: true },
        ],
      },
      explain: 'The far setting. To be fooled you have to exist to be fooled, so the harder the demon works the more certain the doubter becomes. Arithmetic is not safe — Descartes lets the demon have the sums. Only the doubter survives.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'What Survives the Demon',
      points: [
        'Feeling certain is not the same as being true',
        'The evil demon stress-tests beliefs with doubt',
        'Doubt can be a method, not despair',
        '"I am, I exist" outlasts every doubt',
      ],
      closing: 'Bold doubt is not weakness. Doubt is the first honest step towards knowledge that holds.',
    },
    dur: 2.8,
  },
];
