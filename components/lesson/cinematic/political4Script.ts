import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic political-political-4, "Freedom vs. Control" — negative and positive liberty.
// Theme: A FENCED GARDEN, A SOAPBOX, THE WELL OUTSIDE, AND A SCHOOLROOM THROUGH A PRIMER.
//
// He walks into his own garden: the fence is the area no one may interfere in. Mill's
// harm principle is its line. In it he eats a slice of cake and gets up on a soapbox
// to speak, both his own business; the village well stands outside the fence, where
// harm to others begins. On the quote he picks up a reading primer from the garden
// table; the camera goes into the big A on its page and comes out of the big A on a
// schoolroom's wall chart, because freedom from interference is not yet the means to
// act, and positive liberty is the state helping people get them.
//
// Redrawn 2026-09-27, the fourth lesson of the branch in reading order, with a scene
// change (portal.ts). Every line, citation, quotation and summary point is copied from
// the previous script by a generator, word for word and beat for beat.
// ─────────────────────────────────────────────────────────────────────────────

export interface Pol4Beat extends BaseBeat {
  /** His pose under the act. Bands per N2: <100 rig, 100+ held, 300+ played. */ p?: number;
  /** Where he stands: 250 in the garden, 120 on the soapbox, 262 by the gate, 236 at the table · 250 in the schoolroom. */ x?: number;
  /** The act across this beat's line (the scene choreographs it). */
  act?: 'enter' | 'negative' | 'harm' | 'own' | 'others' | 'primer' | 'school' | 'state';
  /** NEGATIVE LIBERTY: the fenced garden is his. */ neg?: boolean;
  /** HARM PRINCIPLE: the fence is its line. */ harm?: boolean;
  /** He has eaten the cake and spoken from the soapbox. */ cake?: boolean;
  /** HARM TO OTHERS: at the well outside the fence. */ others?: boolean;
  /** He has the primer open in his hands. */ primer?: boolean;
  /** He is in the schoolroom, not the garden (the scene change is the beat that sets it). */ school?: boolean;
  /** PUBLIC SCHOOL is lit over the door. */ state?: boolean;
  /** This beat's camera tour, over the generated one (K10); [] holds the whole set, which the scene change needs. */ tour?: readonly (readonly number[])[];
}

export const BEATS: Pol4Beat[] = [
  {
    p: 158, x: 250, act: 'enter',
    text: 'Are you free when no one stops you, or only when you’re able to act? These are two ideas of freedom that support very different politics.',
    dur: 3.6,
  },
  {
    p: 158, x: 250, act: 'negative', neg: true,
    text: 'Isaiah Berlin called the first idea negative liberty. It’s the area within which others don’t interfere with what you do.',
    cite: 'Freedom from interference',
    dur: 2.4,
  },
  {
    p: 158, x: 250, act: 'harm', neg: true, harm: true,
    text: 'John Stuart Mill’s harm principle marks the boundary of that area. Power may be used against you only to prevent harm to others.',
    dur: 2.6,
  },
  {
    p: 158, x: 120, act: 'own', neg: true, harm: true, cake: true,
    text: 'Mill holds that eating badly, taking risks and voicing unpopular opinions are your own decisions. Others may reason with you, but not compel you.',
    cite: 'Mill’s harm principle',
    dur: 2,
  },
  {
    p: 158, x: 262, act: 'others', neg: true, harm: true, cake: true, others: true,
    text: 'Poisoning a well, defrauding a buyer or throwing a punch harms other people. Mill allows coercion only against conduct of this kind.',
    dur: 3.2,
  },
  {
    p: 263, x: 236, act: 'primer', neg: true, harm: true, cake: true, others: true, primer: true,
    quote: {
      id: 'lq-political-political-4-1',
      text: 'Over himself, over his own body and mind, the individual is sovereign.',
      author: 'John Stuart Mill',
      philosopherId: 'john-stuart-mill',
      work: 'On Liberty',
      era: '1859',
      branchSlugs: ['political-philosophy'],
    },
    dur: 3.4,
  },
  {
    p: 158, x: 250, act: 'school', neg: true, harm: true, cake: true, others: true, primer: true, school: true, tour: [],
    text: 'Berlin called the second idea positive liberty: being your own master. On this view, someone free of interference may still be too poor, ill or uneducated to act.',
    cite: 'Freedom as self-mastery',
    dur: 3.8,
  },
  {
    p: 158, x: 250, act: 'state', neg: true, harm: true, cake: true, others: true, primer: true, school: true, state: true,
    text: 'So positive liberty can back a bigger role for the state. It helps people act, not just leave them alone.',
    dur: 1.8,
  },
  {
    p: 260, x: 250, neg: true, harm: true, cake: true, others: true, primer: true, school: true, state: true,
    interact: {
      prompt: 'Which liberty consists only in the absence of interference by others?',
      cards: [
        { text: 'Negative liberty', correct: true },
        { text: 'Positive liberty', correct: false },
      ],
      explain: 'Negative liberty. For Berlin, it’s the area in which no one interferes with your choices. Positive liberty concerns something else: whether you’re your own master, able to direct your life.',
      xp: 5,
    },
    dur: 1,
  },
  {
    p: 260, x: 250, neg: true, harm: true, cake: true, others: true, primer: true, school: true, state: true,
    interact: {
      prompt: 'Which of these is not a freedom from interference?',
      odd: {
        axis: 'THREE ARE FREEDOM FROM',
        tiles: [
          { id: 'jail', reads: 'NOT BEING IMPRISONED' },
          { id: 'censor', reads: 'NOT BEING CENSORED' },
          { id: 'search', reads: 'NOT BEING SEARCHED' },
          { id: 'read', reads: 'BEING TAUGHT TO READ', correct: true },
        ],
      },
      explain: 'Being taught to read, which is a freedom to rather than a freedom from. Berlin\'s worry is that once liberty means becoming your true self, somebody else can decide what that\'s and coerce you toward it, which is why he keeps a core of the first kind protected.',
      xp: 5,
    },
    dur: 1,
  },
  {
    neg: true, harm: true, cake: true, others: true, primer: true, school: true, state: true,
    summary: {
      title: 'Negative and Positive Liberty',
      points: [
        'Negative liberty: freedom from interference',
        'Mill: coerce only to prevent harm to others',
        'Positive liberty: being your own master',
        'Berlin warned positive liberty can justify coercion',
      ],
      closing: 'Negative liberty limits what the state may do to you, while positive liberty can enlarge what it does for you.',
    },
    dur: 2.8,
  },
];
