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
    a: 384, d: 0, dx: 420, claim: true,
    text: 'Suppose someone presents the claim that a budget adds up. A fallacy of distraction seems to rebut a claim while leaving the claim untouched.',
    dur: 3.8,
  },
  {
    a: 14, d: 13, dx: 264, claim: true, smear: true,
    text: 'The first is the ad hominem, which attacks the arguer instead of the argument. One such reply says “he failed maths, so ignore his budget”.',
    cite: 'Ad hominem',
    dur: 2,
  },
  {
    a: 14, d: 13, dx: 264, claim: true, smear: true,
    text: 'However, a claim’s truth doesn’t depend on who asserts it. The insult says nothing about whether the figures add up.',
    dur: 3,
  },
  {
    a: 15, d: 29, dx: 264, claim: true, straw: 2,
    text: 'The second is the straw man. It replaces the real position with a weaker one nobody holds, and refutes that instead.',
    cite: 'The straw man',
    dur: 3.8,
  },
  {
    a: 403, d: 29, dx: 264, claim: true, straw: 2,
    text: 'In effect, you defeat a position you built yourself, not your opponent’s.',
    dur: 1.8,
  },
  {
    a: 378, d: 8, dx: 264, claim: true, straw: 2, untouched: true,
    text: 'Neither reply has engaged with the claim itself. The question of whether the budget adds up is still open.',
    dur: 4.2,
  },
  {
    a: 162, d: 0, dx: 264, claim: true,
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
    a: 462, d: 1, dx: 264, replies: true,
    interact: {
      prompt: 'Which of these replies to the budget attacks the arguer instead of the argument?',
      explain:
        '“He failed maths at school” is the ad hominem. A school record can’t show whether a column of figures adds up. “So you want everyone to be poor?” is a straw man, which distorts the position.',
    },
    dur: 4.8,
  },
  {
    a: 165, d: 12, dx: 264,
    interact: {
      prompt: 'A fallacious argument concludes that the sun will rise. Which principle shows its conclusion may still be true?',
      poll: {
        options: [
          { id: 'luck', reads: 'refuting a proof isn’t refuting the claim', holders: ['Arthur Schopenhauer'], correct: true },
          { id: 'best', reads: 'character is almost the strongest proof', holders: ['Aristotle'] },
          { id: 'odd', reads: 'what seems true to you is true for you', holders: ['Protagoras'] },
          { id: 'worst', reads: 'never believe on insufficient evidence', holders: ['W.K. Clifford'] },
        ],
      },
      explain: 'Refuting a proof isn’t refuting the claim. A fallacy shows only that the reasoning fails, so the conclusion may still be true. Assuming otherwise is the fallacy fallacy.',
    },
    dur: 4.6,
  },
  {
    summary: {
      title: 'Fallacies of Distraction',
      points: [
        'Ad hominem attacks the person, not the claim',
        'A straw man refutes a weaker position nobody holds',
        'Both leave the real argument untouched',
        'A fallacy does not make the conclusion false',
      ],
      closing: 'Once a fallacy of distraction is named, the discussion can return to the claim itself.',
    },
    dur: 4.0,
  },
];
