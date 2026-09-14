import type { BaseBeat } from './cinematicKit';

// Cinematic metaphysics-being-32, "Could Two Things Be Exactly Alike?"
//
// THE PICTURE: a universe with two spheres in it and nothing else, turning slowly
// about its own centre. Nothing in the frame ever breaks the symmetry — that is the
// whole argument, and it is made by the picture refusing to give the reader a handle
// rather than by any sentence (H64).
//
// STAGING: the app's first ORBIT, and the answer targets are three NUMBERS. The
// reader answers by counting what is in front of them (E33).

export interface Meta32Beat extends BaseBeat {
  /** Figure gesture (emote code). */ g?: number;
  /** 1 = the two spheres are in the universe. */ orbs?: number;
  /** 1 = the tether between them is drawn. */ tether?: number;
  /** 1 = one sphere is wearing the label we gave it. */ tag?: number;
  /** 1 = the three counts are live targets (Q1). */ pick?: number;
}

export const BEATS: Meta32Beat[] = [
  {
    g: 5, orbs: 1, tether: 0, tag: 0,
    dur: 3.6,
    text: 'Consider a universe containing two iron spheres and nothing else: no stars, no observers, no ground.',
  },
  {
    g: 5, orbs: 1, tether: 0, tag: 0,
    dur: 1.8,
    text: 'Max Black’s case, from 1952, tests Leibniz’s identity of indiscernibles: things sharing every property are identical.',
  },
  {
    g: 384, orbs: 1, tether: 0, tag: 0,
    dur: 4.4,
    text: 'The two spheres are alike in every way: same size, same material, same age, and same warmth. They have always existed together.',
    cite: 'Alike in every way',
  },
  {
    g: 168, orbs: 1, tether: 1, tag: 0,
    dur: 2.5,
    text: 'Their relational properties match too. Each is two miles from a sphere qualitatively identical to it.',
    cite: 'Even the relations',
  },
  {
    g: 168, orbs: 1, tether: 1, tag: 0,
    dur: 2.3,
    text: 'Every description you write of one is a true description of the other.',
  },
  {
    g: 137, orbs: 1, tether: 1, tag: 0,
    dur: 3.6,
    quote: {
      id: 'lq-metaphysics-being-32-1',
      text: 'There are never two beings in nature that are perfectly alike.',
      author: 'Gottfried Wilhelm Leibniz',
      philosopherId: 'gottfried-leibniz',
      work: 'Monadology',
      era: '1714',
      branchSlugs: ['metaphysics'],
    },
  },
  {
    g: 167, orbs: 1, tether: 1, tag: 1,
    dur: 2.9,
    text: 'You could call one of them sphere A. But naming requires an observer, and this universe contains none.',
    cite: 'A label from outside',
  },
  {
    g: 167, orbs: 1, tether: 1, tag: 1,
    dur: 1.8,
    text: 'Remove the label and nothing in the universe changes, because the label was never part of it.',
  },
  {
    g: 457, orbs: 1, tether: 1, tag: 0, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'How many things does this universe contain?',
      explain: 'Two things. Everything true of one is true of the other, so Leibniz’s principle implies they’re one thing. Yet the case describes two, which is why Black offered it as a counterexample.',
      xp: 5,
    },
  },
  {
    g: 11, orbs: 1, tether: 1, tag: 0,
    dur: 1.0,
    interact: {
      prompt: 'Which of these views needs space itself to be real?',
      poll: {
        options: [
          { id: 'one', reads: 'exact duplicates would be one thing', holders: ['Gottfried Leibniz'] },
          { id: 'two', reads: 'duplicates, told apart by their places in space', holders: ['Samuel Clarke'], correct: true },
          { id: 'easy', reads: 'duplicates, each with its own primitive thisness', holders: ['Robert Merrihew Adams'] },
          { id: 'odd', reads: 'two distinct things can share one place', holders: ['David Wiggins'] },
        ],
      },
      explain: 'Duplicates, told apart by their places in space. Every other property matches, so only real places could differ. That requires space to exist in its own right.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'The Identity of Indiscernibles',
      points: [
        'Leibniz: no two things share every property',
        'Black’s two spheres seem to share every property',
        'If space is real, place alone can tell duplicates apart',
        'A primitive thisness would separate them without space',
      ],
      closing: 'A thought experiment doesn’t prove a conclusion. It shows what accepting a principle commits you to.',
    },
    dur: 3.0,
  },
];
