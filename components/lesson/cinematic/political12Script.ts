import type { BaseBeat } from './cinematicKit';

// Cinematic political-political-12, "Two Kinds Of Freedom".
//
// THE PICTURE: one doorway with two lamps under it. Negative liberty lights the
// first lamp — nobody is blocking the door. Positive liberty asks the second — are
// you actually the one steering. Over the lesson the door opens all the way, the
// first lamp comes on, and the second stays dark. Berlin's warning is the last
// beat, where a regime lights the SECOND lamp by closing the door.
//
// Q1 is A/B/C/D; Q2 is answered under the doorway (E34, H65).

export interface Pol12Beat extends BaseBeat {
  /** Figure gesture (emote code). */ p?: number;
  /** Where the figure stands (stage x). */ x?: number;
  /** The doorway is drawn, 0..1. */ door?: number;
  /** 0 = barred · 1 = standing open. */ open?: number;
  /** The NO ONE BLOCKING lamp, 0..1. */ neg?: number;
  /** The MASTER OF MYSELF lamp, 0..1. */ posi?: number;
  /** 1 = the three answer cards are live (Q2). */ pick?: number;
}

export const BEATS: Pol12Beat[] = [
  {
    p: 164, x: 70,
    text: 'Rousseau wrote that a citizen who refuses to obey the general will must be forced to be free. The phrase seems contradictory.',
    dur: 2.5,
  },
  {
    p: 164, x: 70,
    text: 'In his 1958 lecture on liberty, Isaiah Berlin explains how the phrase can make sense, and why that’s dangerous.',
    dur: 2.5,
  },
  {
    p: 412, x: 168, door: 1, open: 0,
    text: 'One question asks how many doors are open to you, with no one blocking them. That is negative liberty, and it is entirely about what other people are doing.',
    cite: 'Negative liberty',
    dur: 5.0,
  },
  {
    p: 13, x: 124, door: 1, open: 1, neg: 1,
    text: 'With the door open and no one blocking it, you enjoy negative liberty.',
    cite: 'No one blocking',
    dur: 2.2,
  },
  {
    p: 266, x: 124, door: 1, open: 1, neg: 1,
    text: 'The definition says nothing about whether you can walk through the door.',
    dur: 2.6,
  },
  {
    p: 147, x: 124, door: 1, open: 1, neg: 1,
    quote: {
      id: 'lq-political-political-12-1',
      text: 'The positive sense of the word liberty derives from the wish on the part of the individual to be his own master.',
      author: 'Isaiah Berlin',
      philosopherId: 'isaiah-berlin',
      work: 'Two Concepts of Liberty',
      era: '1958',
      branchSlugs: ['political-philosophy'],
    },
    dur: 4.0,
  },
  {
    p: 29, x: 168, door: 1, open: 1, neg: 1, posi: 1,
    text: 'Positive liberty is self-mastery. Berlin warns that a regime may claim your real self wants what the regime plans.',
    cite: 'Positive liberty',
    dur: 2.4,
  },
  {
    p: 258, x: 168, door: 1, open: 1, neg: 1, posi: 1,
    text: 'The regime then removes your choices and calls the result freedom, because it serves your supposed real self.',
    dur: 2.8,
  },
  {
    p: 4, x: 124, door: 1, open: 1, neg: 1, posi: 1,
    interact: {
      prompt: 'An addict faces no interference but cannot stop. Which liberty does he lack?',
      sort: {
        chip: 'the addict',
        bins: [
          { id: 'neg', label: 'negative liberty', reads: 'negative liberty: no one interfering with you' },
          { id: 'none', label: 'no freedom', reads: 'no freedom at all, only compulsion' },
          { id: 'pos', label: 'positive liberty', reads: 'positive liberty: being your own master', correct: true },
        ],
      },
      explain: 'Positive liberty. No one blocks the addict, so his negative liberty is intact. He lacks self-mastery, because his craving, not his own judgement, rules what he does.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 6, x: 124, door: 1, open: 1, neg: 1, posi: 1, pick: 1,
    interact: {
      prompt: 'If the door is open but you can’t direct your own choices, which lamp gives a false reading?',
      explain: 'Master of myself. No one blocks the doorway, so the claim of negative liberty is true. But self-mastery can’t be supplied by someone else, which is the force of Berlin’s warning.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Berlin’s Two Concepts of Liberty',
      points: [
        'Negative liberty: the absence of obstacles from others',
        'Positive liberty: being your own master',
        'Berlin warned the two can openly conflict',
        '“Forced to be free” can justify coercion',
      ],
      closing: 'Freedom from interference differs from self-mastery, and a regime can invoke self-mastery to remove freedom from interference.',
    },
    dur: 3.0,
  },
];
