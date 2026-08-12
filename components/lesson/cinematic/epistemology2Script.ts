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
    d: 4, m: 7, doubt: 0.2,
    text: 'First he pries certainty from truth. Feeling certain is a state of mind; truth is how the world stands. The two can split — so he wants beliefs that survive every possible reason to doubt.',
    cite: 'Certainty vs truth',
    dur: 4.8,
  },
  {
    d: 15, m: 13, doubt: 0.62,
    text: 'So he imagines a demon of utmost power rigging his whole reality. Every sight, every memory, even that two plus three make five — all could be a planted lie. Doubt at maximum.',
    cite: 'Descartes, Meditations I, 1641',
    dur: 4.8,
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
    text: 'The demon is a tool, not a real fear. Of each idea Descartes asks: could the demon fake this? Most beliefs crack. One refuses. Used this way, doubt rebuilds rather than ruins.',
    cite: 'Methodological doubt',
    dur: 4.6,
  },
  {
    d: 9, m: 3, doubt: 0.85, glow: true,
    interact: {
      prompt: 'What was Descartes really trying to do with his evil-demon thought experiment?',
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
      prompt: 'If the demon fakes everything, why can’t it fake "I exist" away?',
      cards: [
        { text: 'Being deceived needs a doubter', correct: true },
        { text: 'It could fake that too', correct: false },
      ],
      explain: 'To be fooled, you must exist to be fooled. The very act of doubting proves a doubter is there.',
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
      closing: 'Doubting boldly is no weakness. It is the first honest stride toward knowledge that holds.',
    },
    dur: 2.8,
  },
];
