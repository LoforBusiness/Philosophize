import type { BaseBeat } from './cinematicKit';

// Cinematic political-political-31, "The Tragedy of the Commons".
//
// THE PICTURE: a field of grass that dies while you watch, with more animals arriving
// on it. Then the arithmetic behind it is laid over the top — a whole gain against a
// quartered cost — and the reader can see that nothing in the picture is anybody
// misbehaving (H64).
//
// STAGING: a FIELD OF TWENTY-ONE BLADES that shrink together, which is the first mass
// animation in the app; the answer targets are the two halves of the sum plus a plate
// under the herder, so the reader chooses between an explanation and a culprit (E33).

export interface Pol31Beat extends BaseBeat {
  /** Figure gesture (emote code). */ g?: number;
  /** How much grass is left, 1 down to 0.18. */ grass?: number;
  /** Animals on the field, 0…4. */ herd?: number;
  /** 1 = the arithmetic is laid over the field. */ sums?: number;
  /** 1 = the sum and the plate are live targets (Q1). */ pick?: number;
}

export const BEATS: Pol31Beat[] = [
  {
    g: 5, grass: 1, herd: 1, sums: 0,
    dur: 4.0,
    text: 'A field nobody owns and everybody may use. Deep grass, one animal on it, and four herders who all have the same right to be here.',
  },
  {
    g: 2, grass: 0.66, herd: 2, sums: 0,
    dur: 2.8,
    text: 'You put on one more. The whole of what it eats is yours; the wear on the grass falls on all four of you.',
    cite: 'One more',
  },
  {
    g: 2, grass: 0.66, herd: 2, sums: 0,
    dur: 1.8,
    text: 'It is a good trade, and you would be daft not to make it.',
  },
  {
    g: 387, grass: 0.22, herd: 4, sums: 0,
    dur: 4.6,
    text: 'So does everyone else, for exactly the same reason. Now the field is bare, every herder is worse off than they started, and nobody has done a single unreasonable thing.',
    cite: 'And everyone else',
  },
  {
    g: 137, grass: 0.22, herd: 4, sums: 0,
    dur: 3.6,
    quote: {
      id: 'lq-political-political-31-1',
      text: 'That which is common to the greatest number has the least care bestowed upon it.',
      author: 'Aristotle',
      philosopherId: 'aristotle',
      work: 'Politics',
      era: 'c. 350 BC',
      branchSlugs: ['political-philosophy'],
    },
  },
  {
    g: 167, grass: 0.22, herd: 4, sums: 1,
    dur: 2.7,
    text: 'Here is the sum each of them did. One whole unit of gain, kept entirely.',
    cite: 'The sum they did',
  },
  {
    g: 167, grass: 0.22, herd: 4, sums: 1,
    dur: 2.1,
    text: 'One whole unit of damage, cut into four. Nothing else was required.',
  },
  {
    g: 4, grass: 0.22, herd: 4, sums: 1, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'Tap what makes ruining the field the sensible move for each of them.',
      explain: 'The shared cost. One gain against one cost is a bad trade that nobody makes. One gain against a quarter of a cost is a good one — and every herder does that sum and gets the same answer.',
      xp: 5,
    },
  },
  {
    g: 11, grass: 0.22, herd: 4, sums: 1,
    dur: 1.0,
    interact: {
      prompt: 'So what actually fixes it?',
      lever: {
        start: 0,
        stops: [
          { id: 'ask', reads: 'ask each herder to take less' },
          { id: 'shame', reads: 'shame the ones who take too much' },
          { id: 'rules', reads: 'change what taking too much costs', correct: true },
        ],
      },
      explain: 'The other card fails on its own terms. Whoever complies simply loses, and the field dies anyway. Despair was Hardin\'s own guess. Elinor Ostrom won a Nobel for commons that never collapsed, each binding its users to a limit they helped set.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'The Arithmetic Is Doing It',
      points: [
        'Private gain against shared cost ruins shared things',
        'Everyone can act rationally and still lose together',
        'Restraint alone does not save a commons',
        'Ostrom: real communities fix it by binding themselves',
      ],
      closing: 'When everyone acts sensibly and the result is a disaster, stop looking at the people and look at the payoffs.',
    },
    dur: 3.0,
  },
];
