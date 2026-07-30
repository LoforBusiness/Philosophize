import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic ethics-ethics-10, "Ethics in Practice" — Singer's drowning child.
// A shallow pond stage right with a child in it, and the reader's stand-in walking
// toward it. He goes IN; the shoes are not a consideration. Then a second child
// appears far off to the left, smaller and higher up the picture, standing at the
// end of a dotted line — the same child, the same drowning, nine thousand
// kilometres of nothing in between.
//
// Both graded questions come from
// data/branches/ethics/paths/what-is-ethics/lessons/ethics-in-practice.ts. Q1 —
// what the argument turns on — is answered on the stage by tapping the factor
// Singer says carries no moral weight; Q2 is the deck question about whether the
// argument needs utilitarianism.
// ─────────────────────────────────────────────────────────────────────────────

export interface Et10Beat extends BaseBeat {
  /** Narrator gesture (emote code). */ p?: number;
  /** Narrator mark on the ground. */ x?: number;
  /** He is standing IN the water, not beside it. */ wading?: boolean;
  /** The far child, the dotted line and its label are on. */ far?: boolean;
  /** The three factors for the tap question. */ factors?: boolean;
}

export const BEATS: Et10Beat[] = [
  {
    p: 45, x: 88,
    text: 'You are walking past a shallow pond in good shoes. There is a small child face-down in it, and nobody else anywhere.',
    dur: 3.8,
  },
  {
    p: 14, x: 168,
    text: 'Nobody deliberates. You do not price the shoes against the child, because there is no comparison to make — and Peter Singer’s whole argument starts from the fact that you already know this.',
    cite: 'Singer’s drowning child',
    dur: 4.8,
  },
  {
    p: 30, x: 268, wading: true,
    text: 'So you are in the water, shoes and all. Now Singer asks the awkward question: which part of that reasoning was about the child being NEAR you?',
    dur: 4.4,
  },
  {
    p: 4, x: 268, wading: true,
    quote: {
      id: 'lq-ethics-ethics-10-1',
      text: 'If it is in our power to prevent something bad from happening, without thereby sacrificing anything of comparable moral importance, then we ought, morally, to do it.',
      author: 'Peter Singer',
      work: 'Famine, Affluence, and Morality',
      era: '1972',
      philosopherId: 'singer',
      branchSlugs: ['ethics'],
    },
    dur: 3.8,
  },
  {
    p: 21, x: 268, wading: true, far: true,
    text: 'There is another child. Same danger, same small cost to you, nine thousand kilometres further off. The argument that got you into this pond does not obviously stop at the bank — and that thought is where effective altruism came from.',
    cite: 'Famine, Affluence, and Morality',
    dur: 5.2,
  },
  {
    p: 47, x: 268, wading: true, far: true, factors: true,
    interact: {
      prompt: 'Two children, one at your feet and one far away. Tap the difference Singer says carries no moral weight.',
      explain:
        'Distance. It changes how the case feels and nothing about what is at stake. The other two are not decoys — Singer’s principle depends on them: it only asks for help you can actually give, and only where the cost to you is not itself comparably serious. Strip those out and you have a demand, not an argument.',
    },
    dur: 4.8,
  },
  {
    p: 8, x: 268, wading: true, far: true,
    mc: {
      prompt: 'Singer’s argument only works if you already accept utilitarianism, so everyone else can ignore it. True?',
      options: [
        { id: 'a', text: 'True — it is a utilitarian calculation from start to finish', correct: false },
        { id: 'b', text: 'False — it rests on a modest premise almost anyone already accepts', correct: true },
        { id: 'c', text: 'True — only utilitarians think consequences matter at all', correct: false },
        { id: 'd', text: 'False — because Singer was not himself a utilitarian', correct: false },
      ],
      explain:
        'The trap is knowing that Singer IS a utilitarian and assuming the argument must be too. It is built to need far less: prevent something terrible at small cost to yourself. You do not have to be a utilitarian to agree with that — which is exactly why the argument is so hard to put down. Bernard Williams pushed back elsewhere, arguing a livable ethics has to leave room for your own projects and people.',
    },
    dur: 4.8,
  },
  {
    summary: {
      title: 'Bringing Ethics to Life',
      points: [
        'Distance need not weaken a moral duty',
        'Singer: the far child has the same claim',
        'Effective altruism asks where good goes furthest',
        'Critics: an ethics must stay livable',
      ],
      closing: 'Theory ends where action begins, and the hard part is what you do tomorrow.',
    },
    dur: 4.0,
  },
];
