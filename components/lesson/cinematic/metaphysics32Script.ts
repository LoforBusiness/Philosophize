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
    dur: 4.0,
    text: 'A universe containing two iron spheres and absolutely nothing else. No stars, no observer, no floor. Just these.',
  },
  {
    g: 2, orbs: 1, tether: 0, tag: 0,
    dur: 4.4,
    text: 'They are exactly alike. Same size, same metal, same age, same temperature — and there was never a moment when one existed and the other did not.',
    cite: 'Alike in every way',
  },
  {
    g: 3, orbs: 1, tether: 1, tag: 0,
    dur: 4.8,
    text: 'Even the relations match. Each is two miles from a sphere just like itself. Every description you write of one is a true description of the other.',
    cite: 'Even the relations',
  },
  {
    g: 137, orbs: 1, tether: 1, tag: 0,
    dur: 3.6,
    quote: {
      id: 'lq-metaphysics-being-32-1',
      text: 'There are never two beings in nature that are perfectly alike.',
      author: 'Gottfried Wilhelm Leibniz',
      work: 'Monadology',
      era: '1714',
      branchSlugs: ['metaphysics'],
    },
  },
  {
    g: 1, orbs: 1, tether: 1, tag: 1,
    dur: 4.6,
    text: 'We can point at one sphere and call it A. But the label came from outside, carried in by us. Take the label away again and the universe is exactly as before.',
    cite: 'The label is ours',
  },
  {
    g: 4, orbs: 1, tether: 1, tag: 0, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'Tap the number of things in this universe.',
      explain: 'Two. Everything true of one is true of the other, so Leibniz\'s principle says they are one thing — and they are plainly not. Max Black published this in 1952 and it has been argued over ever since.',
      xp: 5,
    },
  },
  {
    g: 11, orbs: 1, tether: 1, tag: 0,
    dur: 1.0,
    interact: {
      prompt: 'Place the token where the two spheres actually sit.',
      field: {
        xLo: 'THEY DIFFER SOMEHOW', xHi: 'EVERY PROPERTY THE SAME',
        yLo: 'THE SAME PLACE', yHi: 'DIFFERENT PLACES',
        start: [0.24, 0.24],
        quads: [
          { id: 'one', x: 1, y: 0, reads: 'same properties, same place: one sphere counted twice' },
          { id: 'two', x: 1, y: 1, reads: 'same properties, different places: two spheres', correct: true },
          { id: 'easy', x: 0, y: 1, reads: 'they differ, and they are apart: an ordinary pair' },
          { id: 'odd', x: 0, y: 0, reads: 'they differ but share a place: not a case at all' },
        ],
      },
      explain: 'Top right, and the pad is the argument. They are plainly two, so the bottom row is ruled out by the setup. The only thing holding them apart is the axis going up: where each one is. If space is real, being here is a second fact about a sphere.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'Two, and No Way to Say Which',
      points: [
        'Leibniz: no two things share every property',
        'Black\'s two spheres seem to do exactly that',
        'Counting them as one costs more than the principle is worth',
        'Which way you go depends on whether space is real',
      ],
      closing: 'A thought experiment proves nothing. It shows you what a principle costs, and lets you decide whether to pay.',
    },
    dur: 3.0,
  },
];
