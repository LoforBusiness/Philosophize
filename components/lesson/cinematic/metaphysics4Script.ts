import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic metaphysics-being-4, "Can Nothing Truly Exist?" — Parmenides.
// Theme: A STUDY AT NIGHT, AN EMPTY BOX, AND A PAINTED CROSSROADS HE WALKS INTO.
//
// In a study he lifts the lid of an empty box marked NOTHING, and the thought of it
// rises out of the box and becomes a thing in his hand. Then the camera pushes into
// the painting on the wall and comes out in it: a crossroads at dusk, a road climbing
// to a lit gate (IT IS) and a road going down into fog (IT IS NOT). He takes the lit
// road. When change is ruled out the waterfall and a falling leaf stop dead in the
// air; for Aristotle an acorn grows into a sapling and the water runs again.
//
// Redrawn 2026-09-27, the fourth lesson of the branch in reading order, with the
// branch's first scene change (portal.ts). Every line, citation, quotation and summary
// point is copied from the previous script by a generator, word for word and beat for
// beat.
// ─────────────────────────────────────────────────────────────────────────────

export interface Meta4Beat extends BaseBeat {
  /** His pose under the act. Bands per N2: <100 rig, 100+ held, 300+ played. */ p?: number;
  /** Where he stands: 150 at the desk in the study · 196 at the fork, 110 up the lit road, 146 by the acorn, on the road. */ x?: number;
  /** The act across this beat's line (the scene choreographs it). */
  act?: 'box' | 'think' | 'take' | 'enter' | 'reject' | 'freeze' | 'grow';
  /** The box is open: empty, and marked NOTHING. */ open?: boolean;
  /** The thought of nothing has risen out of the box and is a thing: SOMETHING. */ orb?: boolean;
  /** He is on the painted road, not in the study (the scene change is the beat that sets it). */ road?: boolean;
  /** He has taken the lit road; the road into fog is gone into it. */ chosen?: boolean;
  /** Change is ruled out: the waterfall and the leaf are stopped. */ frozen?: boolean;
  /** The acorn has grown into a sapling, and the water runs again. */ grown?: boolean;
  /** This beat's camera tour, over the generated one (K10); [] holds the whole set, which the scene change needs. */ tour?: readonly (readonly number[])[];
}

export const BEATS: Meta4Beat[] = [
  {
    p: 158, x: 150, act: 'box', open: true,
    text: 'To say “nothing exists” is already to speak about something. Parmenides identified this problem in the fifth century BCE.',
    dur: 3.4,
  },
  {
    p: 158, x: 150, act: 'think', open: true,
    text: 'Suppose you try to think of nothing. It becomes the object of your thought, and a thought must be about something.',
    cite: 'A self-defeating paradox',
    dur: 3.8,
  },
  {
    p: 158, x: 150, act: 'take', open: true, orb: true,
    text: 'Each attempt to refer to nothing turns it into something, such as the object of a thought.',
    dur: 1.8,
  },
  {
    p: 158, x: 150, act: 'enter', open: true, orb: true, road: true, tour: [],
    text: 'Parmenides of Elea described two ways of inquiry. One holds that it is, and the other that it is not.',
    cite: 'Parmenides, On Nature',
    dur: 1.8,
  },
  {
    p: 158, x: 110, act: 'reject', open: true, orb: true, road: true, chosen: true,
    text: 'Parmenides rejects the second way, because what is not can be neither known nor said. So only what is can be real.',
    dur: 3.5,
  },
  {
    p: 263, x: 110, open: true, orb: true, road: true, chosen: true,
    quote: {
      id: 'lq-metaphysics-being-4-1',
      text: 'You cannot know what is not — that is impossible — nor utter it.',
      author: 'Parmenides',
      philosopherId: 'parmenides',
      work: 'On Nature, fragment 2',
      era: 'c. 475 BCE',
      branchSlugs: ['metaphysics'],
    },
    dur: 3.2,
  },
  {
    p: 158, x: 110, act: 'freeze', open: true, orb: true, road: true, chosen: true, frozen: true,
    text: 'This conclusion rules out change. To change, a thing would have to pass into or out of not-being, which Parmenides has excluded.',
    cite: 'Change becomes impossible',
    dur: 3.4,
  },
  {
    p: 158, x: 146, act: 'grow', open: true, orb: true, road: true, chosen: true, frozen: true, grown: true,
    text: 'So motion itself is false, a mere show put on by the senses. Aristotle later replied that “being” is said in more than one way, including potential and actual being.',
    dur: 1.8,
  },
  {
    p: 260, x: 146, open: true, orb: true, road: true, chosen: true, frozen: true, grown: true,
    interact: {
      prompt: 'What makes the thought of pure non-being self-defeating?',
      cards: [
        { text: 'Naming it turns it into something', correct: true },
        { text: 'Physics shows space is never empty', correct: false },
      ],
      explain: 'Naming it turns it into something. Every thought needs an object, so thinking of what is not treats it as something. Whether space is ever empty is a separate question for physics.',
      xp: 5,
    },
    dur: 1,
  },
  {
    p: 260, x: 146, open: true, orb: true, road: true, chosen: true, frozen: true, grown: true,
    interact: {
      prompt: 'Put these in order, from most in it to least.',
      order: {
        axis: 'MOST IN IT FIRST',
        items: [
          { id: 'air', reads: 'AIR, DUST AND LIGHT' },
          { id: 'vacuum', reads: 'SPACE AND FIELDS' },
          { id: 'nothing', reads: 'NO SPACE, NO FIELDS' },
        ],
      },
      explain: 'A vacuum still has space and fields in it. Pump out the air and the region is empty of matter, not of everything. So it falls short of the sheer nothing the question is asking after.',
      xp: 5,
    },
    dur: 1,
  },
  {
    open: true, orb: true, road: true, chosen: true, frozen: true, grown: true,
    summary: {
      title: 'The Problem of Non-Being',
      points: [
        'Naming nothing seems to make it something',
        'Parmenides: what-is-not cannot be thought',
        'Parmenides’ argument implies that change is an illusion',
        'Aristotle: “being” has many meanings, not one',
      ],
      closing: 'Nothingness seems a simple idea, yet it has proved very hard to think without treating it as something.',
    },
    dur: 2.8,
  },
];
