import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic ethics-ethics-4, "Is Morality Universal or Relative?"
// Theme: A PINNED WORLD MAP, A GLOBE HE SPINS, AND A VILLAGE OF FIVE HOMES ON ONE FOUNDATION.
//
// In an anthropologist's study the map on the wall is pinned in every colour: cultures
// disagree. The two relativisms go up on its legend, and the arrow from the first to
// the second is struck out. He takes Ruth Benedict's book from the desk; objectivism
// answers her. He spins the globe for the Earth's shape, and the camera goes into it
// and comes out over a village where five homes from five parts of the world stand in
// one row. A gift appears at every door, and under the grass the one stone foundation
// all five stand on comes into view.
//
// A grave lesson (N11): nothing in it is a gag, and nothing draws a harm the narration
// names. Redrawn 2026-09-27, the fourth lesson of the branch in reading order, with a
// scene change (portal.ts). Every line, citation, quotation and summary point is copied
// from the previous script by a generator, word for word and beat for beat.
// ─────────────────────────────────────────────────────────────────────────────

export interface Ethics4Beat extends BaseBeat {
  /** His pose under the act. Bands per N2: <100 rig, 100+ held, 300+ played. */ p?: number;
  /** Where he stands: 114 by the globe, 170 under the map, 312 at the desk in the study · 236 in the village. */ x?: number;
  /** The act across this beat's line (the scene choreographs it). */
  act?: 'pins' | 'stronger' | 'descr' | 'moral' | 'error' | 'benedict' | 'object' | 'globe' | 'enter' | 'gifts' | 'found';
  /** The map's pins are lit, every culture its own colour. */ pins?: boolean;
  /** DESCRIPTIVE is on the map's legend. */ descr?: boolean;
  /** MORAL is on the map's legend. */ moral?: boolean;
  /** The arrow from DESCRIPTIVE to MORAL is struck out. */ error?: boolean;
  /** He has taken up Benedict's book: BENEDICT. */ bene?: boolean;
  /** OBJECTIVISM is up beside BENEDICT. */ obj?: boolean;
  /** He is in the village, not the study (the scene change is the beat that sets it). */ village?: boolean;
  /** A gift is at every door. */ gifts?: boolean;
  /** The shared foundation under the homes is showing. */ found?: boolean;
  /** Q2 on the stage: the two signs. */ q2?: boolean;
  /** This beat's camera tour, over the generated one (K10); [] holds the whole set, which the scene change needs. */ tour?: readonly (readonly number[])[];
}

export const BEATS: Ethics4Beat[] = [
  {
    p: 158, x: 114, act: 'pins', pins: true,
    text: 'Cultures disagree about right and wrong. That disagreement is an observable fact.',
    dur: 1.8,
  },
  {
    p: 158, x: 170, act: 'stronger', pins: true,
    text: 'The claim that no correct answer lies behind the disagreement is much stronger, and logically separate.',
    dur: 2.3,
  },
  {
    p: 158, x: 170, act: 'descr', pins: true, descr: true,
    text: 'The first claim is descriptive relativism: societies in fact hold different moral codes.',
    cite: 'Two kinds of relativism',
    dur: 1.8,
  },
  {
    p: 158, x: 170, act: 'moral', pins: true, descr: true, moral: true,
    text: 'The second claim is moral relativism. It holds that rightness depends on a group’s code, with no higher standard.',
    dur: 2.9,
  },
  {
    p: 158, x: 170, act: 'error', pins: true, descr: true, moral: true, error: true,
    text: 'Inferring the second from the first is a common error. Disagreement doesn’t show there’s no answer.',
    dur: 1.8,
  },
  {
    p: 158, x: 312, act: 'benedict', pins: true, descr: true, moral: true, error: true, bene: true,
    text: 'The anthropologist Ruth Benedict defended relativism. For Benedict, a society calls good whatever it has come to approve.',
    cite: 'Ruth Benedict, 1934',
    dur: 4.6,
  },
  {
    p: 263, x: 312, pins: true, descr: true, moral: true, error: true, bene: true,
    quote: {
      id: 'lq-ethics-ethics-4-1',
      text: 'Morality differs in every society, and is a convenient term for socially approved habits.',
      author: 'Ruth Benedict',
      work: 'Patterns of Culture',
      era: '1934',
      branchSlugs: ['ethics'],
    },
    dur: 3.2,
  },
  {
    p: 158, x: 312, act: 'object', pins: true, descr: true, moral: true, error: true, bene: true, obj: true,
    text: 'Moral objectivists reply that some moral truths hold regardless of culture. Torturing a child for fun is wrong everywhere.',
    cite: 'Moral objectivism',
    dur: 3.4,
  },
  {
    p: 158, x: 114, act: 'globe', pins: true, descr: true, moral: true, error: true, bene: true, obj: true,
    text: 'Cultures differing does not make every code equally true. Disagreement about the Earth’s shape didn’t make every answer true.',
    dur: 1.8,
  },
  {
    p: 158, x: 236, act: 'enter', pins: true, descr: true, moral: true, error: true, bene: true, obj: true, village: true, tour: [],
    text: 'Donald Brown looked at cultures all over the world. He found things that every one of them shared, which he called human universals.',
    cite: 'Donald Brown, Human Universals, 1991',
    dur: 2.8,
  },
  {
    p: 158, x: 236, act: 'gifts', pins: true, descr: true, moral: true, error: true, bene: true, obj: true, village: true, gifts: true,
    text: 'Human universals include returning a favour, and forbidding murder and incest.',
    dur: 1.8,
  },
  {
    p: 158, x: 236, act: 'found', pins: true, descr: true, moral: true, error: true, bene: true, obj: true, village: true, gifts: true, found: true, tour: [],
    text: 'These universals suggest a shared moral foundation beneath the differences between cultures.',
    dur: 1.8,
  },
  {
    p: 260, x: 236, pins: true, descr: true, moral: true, error: true, bene: true, obj: true, village: true, gifts: true, found: true,
    interact: {
      prompt: 'Put these in order, from the weakest claim to the strongest.',
      order: {
        axis: 'WEAKEST CLAIM FIRST',
        items: [
          { id: 'differ', reads: 'CULTURES DISAGREE' },
          { id: 'relative', reads: 'RIGHT DEPENDS ON THE GROUP' },
          { id: 'nothing', reads: 'NOTHING IS EVER WRONG' },
        ],
      },
      explain: 'Relativism is the middle one. That cultures disagree is an observation anyone can accept, and that nothing is ever wrong is a further claim relativism doesn\'t make: inside a group there are still right answers. Sliding between the three is how the position gets refuted cheaply.',
      xp: 5,
    },
    dur: 1,
  },
  {
    p: 260, x: 236, pins: true, descr: true, moral: true, error: true, bene: true, obj: true, village: true, gifts: true, found: true, q2: true,
    interact: {
      prompt: 'Does it follow from moral relativism that every culture must tolerate the others?',
      explain: 'It does not. If values hold only inside a culture, “we value tolerance” can’t become “all must tolerate”. Bernard Williams called that step inconsistent. Relativism can’t give every group the same duty.',
      xp: 5,
    },
    dur: 1,
  },
  {
    pins: true, descr: true, moral: true, error: true, bene: true, obj: true, village: true, gifts: true, found: true,
    summary: {
      title: 'One Morality or Many?',
      points: [
        'That cultures differ doesn’t show there’s no moral truth',
        'Objectivism: some moral truths hold regardless of culture',
        'Brown found moral universals in every documented society',
        'Tolerance does not follow from relativism',
      ],
      closing: 'Understanding another culture doesn’t require giving up moral judgement. It requires judging with full knowledge of that culture.',
    },
    dur: 2.8,
  },
];
