import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic logic-arguments-9, "Fallacies of Distraction" — ad hominem and the
// straw man. Two figures. One puts a CLAIM on the board and stands by it. The
// other walks on and, twice, refuses to touch it: once by throwing something at
// the arguer, once by building a flimsy copy of the claim and knocking that over.
// The real card never moves. That is the lesson, and it is carried by the picture
// rather than said twice.
//
// Both graded questions come from
// data/branches/logic/paths/arguments/lessons/attacking-the-person.ts. Q1 — which
// reply is the ad hominem — is answered on the stage by tapping one of the three
// replies; Q2, the "fallacy fallacy", is the deck question.
// ─────────────────────────────────────────────────────────────────────────────

export interface L9Beat extends BaseBeat {
  /** The arguer's gesture (emote code). */ a?: number;
  /** The dodger's gesture (emote code). */ d?: number;
  /** The dodger's mark. 420 is off-stage right. */ dx?: number;
  /** The claim on the board is up. */ claim?: boolean;
  /** The smear thrown at the arguer instead of at the claim. */ smear?: boolean;
  /** 0 no straw copy · 1 built · 2 knocked over. */ straw?: number;
  /** Dim both dodges and leave the claim lit — nothing has touched it. */ untouched?: boolean;
  /** The three replies for the tap question. */ replies?: boolean;
}

export const BEATS: L9Beat[] = [
  {
    a: 20, d: 0, dx: 420, claim: true,
    text: 'Someone puts a claim up where everyone can read it. The quickest way to look like you have beaten it is never to go near it.',
    dur: 3.8,
  },
  {
    a: 14, d: 13, dx: 264, claim: true, smear: true,
    text: 'The first dodge aims at the arguer. "He failed maths at school, so ignore his budget." But a claim does not get its truth from the mouth it came out of — the insult has answered nothing on the board.',
    cite: 'Ad hominem',
    dur: 5.0,
  },
  {
    a: 15, d: 29, dx: 264, claim: true, straw: 2,
    text: 'The second dodge builds a flimsy copy first. Swap their real position for a weaker one nobody holds, knock that down, and take the bow. You beat a scarecrow you put up yourself.',
    cite: 'The straw man',
    dur: 5.0,
  },
  {
    a: 9, d: 8, dx: 264, claim: true, straw: 2, untouched: true,
    text: 'Now look at what has actually happened. Two replies, a lot of noise, and the claim is standing exactly where it was — unread and unanswered.',
    dur: 4.2,
  },
  {
    a: 44, d: 0, dx: 264, claim: true,
    quote: {
      id: 'lq-logic-arguments-9',
      text: 'Sophistry is an appearance of wisdom without the reality.',
      author: 'Aristotle',
      work: 'Sophistical Refutations',
      era: 'c. 350 BCE',
      philosopherId: 'aristotle',
      branchSlugs: ['logic'],
    },
    dur: 3.2,
  },
  {
    a: 0, d: 1, dx: 264, replies: true,
    interact: {
      prompt: 'Three replies to that budget plan. Tap the one that attacks the arguer instead of the argument.',
      explain:
        'Ad hominem goes at the person: a school report cannot make a column of figures add up. The trap is the third reply — also a dodge, but a straw man. It distorts the position, then argues with the distortion.',
    },
    dur: 4.8,
  },
  {
    a: 4, d: 12, dx: 264,
    interact: {
      prompt: 'Place the token on a terrible argument that the sun will rise.',
      field: {
        xLo: 'THE REASONING IS BAD', xHi: 'THE REASONING IS GOOD',
        yLo: 'THE CONCLUSION IS FALSE', yHi: 'THE CONCLUSION IS TRUE',
        start: [0.76, 0.24],
        quads: [
          { id: 'luck', x: 0, y: 1, reads: 'bad reasoning, true conclusion: this happens constantly', correct: true },
          { id: 'best', x: 1, y: 1, reads: 'good reasoning, true conclusion: the best case there is' },
          { id: 'odd', x: 1, y: 0, reads: 'good reasoning, false conclusion: a premise was false' },
          { id: 'worst', x: 0, y: 0, reads: 'bad reasoning, false conclusion: nothing here at all' },
        ],
      },
      explain: 'Top left, and that corner is crowded. A fallacy tells you the reasoning does not support the conclusion. It says nothing about whether the conclusion is true. Assuming it does has its own name: the fallacy fallacy.',
    },
    dur: 4.6,
  },
  {
    summary: {
      title: 'Fallacies of Distraction Spotted',
      points: [
        'Ad hominem attacks the person, not the claim',
        'Straw man beats a fake, weaker position',
        'Both leave the real argument untouched',
        'A fallacy does not make the conclusion false',
      ],
      closing: 'Name the dodge out loud and it stops working.',
    },
    dur: 4.0,
  },
];
