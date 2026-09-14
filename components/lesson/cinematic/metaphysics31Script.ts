import type { BaseBeat } from './cinematicKit';

// Cinematic metaphysics-being-31, "Do Holes Exist?"
//
// THE PICTURE: a slab with three holes in it, and a tally counting them. Answer the
// question and the CHEESE FADES AWAY, leaving three rings hanging in the air — which
// is the whole argument in one move: what you counted is still there when the gaps
// are gone, because what you counted was never the gaps (H64).
//
// STAGING: the three answers are NESTED INSIDE EACH OTHER — the slab, the ring drawn
// around the big hole, and the empty middle of it. You answer by tapping the rim or
// the gap, which is a distinction no row of cards could put as directly (E33, H65).

export interface Meta31Beat extends BaseBeat {
  /** Figure gesture (emote code). */ g?: number;
  /** 1 = the holes have opened in the slab. */ holes?: number;
  /** How many tally marks have been counted, 0…3. */ ticks?: number;
  /** 1 = the three candidates are labelled. */ chips?: number;
  /** 1 = the slab and the rings are live targets (Q1). */ pick?: number;
}

export const BEATS: Meta31Beat[] = [
  {
    g: 440, holes: 0, ticks: 0, chips: 0,
    dur: 3.8,
    text: 'Consider a solid slab of cheese. Everything in it is a material thing, cheese all the way through.',
  },
  {
    g: 159, holes: 1, ticks: 0, chips: 0,
    dur: 1.8,
    text: 'Suppose three holes are made in it. Nothing was added to the cheese, and some was removed.',
    cite: 'Three more things',
  },
  {
    g: 159, holes: 1, ticks: 0, chips: 0,
    dur: 2.6,
    text: 'Yet a count now finds three more things than before, the three holes.',
  },
  {
    g: 456, holes: 1, ticks: 3, chips: 0,
    dur: 3,
    text: 'Holes can be counted and measured, and one hole can be deeper than another.',
    cite: 'Counting holes',
  },
  {
    g: 456, holes: 1, ticks: 3, chips: 0,
    dur: 1.8,
    text: 'Talk about holes therefore seems to commit you to the existence of holes.',
  },
  {
    g: 129, holes: 1, ticks: 3, chips: 0,
    dur: 3.6,
    quote: {
      id: 'lq-metaphysics-being-31-1',
      text: 'Shape clay into a vessel; it is the space within that makes it useful.',
      author: 'Laozi',
      philosopherId: 'laozi',
      work: 'Tao Te Ching',
      era: 'c. 400 BC',
      branchSlugs: ['metaphysics'],
    },
  },
  {
    g: 457, holes: 1, ticks: 3, chips: 1,
    dur: 2.3,
    text: 'What, then, was counted? There are three candidates.',
    cite: 'Three candidates',
  },
  {
    g: 415, holes: 1, ticks: 3, chips: 1,
    dur: 2.5,
    text: 'The cheese, the ring of cheese around each gap, or the empty gap itself.',
  },
  {
    g: 466, holes: 1, ticks: 3, chips: 1, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'If only material things exist, what was counted when three holes were counted?',
      explain: 'The rim. In a 1970 dialogue by David and Stephanie Lewis, the character Argle says a hole is its lining. The lining is the cheese around the gap, so counting linings counts holes. Only cheese need exist.',
      xp: 5,
    },
  },
  {
    g: 173, holes: 1, ticks: 3, chips: 1,
    dur: 1.0,
    interact: {
      prompt: 'How often can a sentence about holes be reworded to mention only the cheese?',
      drag: {
        lo: 'ALWAYS',
        hi: 'NEVER',
        start: 0,
        zones: [
          { id: 'easy', upto: 0.3, reads: 'every such sentence can be reworded' },
          { id: 'mostly', upto: 0.74, reads: 'most can, except sentences that count holes', correct: true },
          { id: 'never', upto: 1, reads: 'no such sentence can be reworded' },
        ],
      },
      explain: 'Most sentences about holes can be reworded, but not sentences that count holes. “The cheese has a hole” becomes “the cheese is perforated”. But “there are as many holes as crackers” resists rewording, which is why Argle turns to linings.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'The Metaphysics of Holes',
      points: [
        'Ordinary speech counts and measures absences such as holes',
        'A hole can be counted, measured and compared',
        'Argle identifies a hole with its lining of cheese',
        'Paraphrase fails for sentences that count holes',
      ],
      closing: 'W.V.O. Quine held that a theory is committed to whatever must exist for its sentences to be true.',
    },
    dur: 3.0,
  },
];
