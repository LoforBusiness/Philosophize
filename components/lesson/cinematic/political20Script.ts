import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic political-political-20, "Living Together While Disagreeing"
// Theme: TWO STACKS THAT SHARE NOTHING, AND ONE NARROW SHELF BOTH CAN REACH.
//
// Public reason is easy to state and easy to misread as "keep your beliefs to
// yourself", so the scene is built to refuse that reading. Both stacks stay on
// the stage, at full strength, for the whole lesson. Nobody is asked to give
// anything up. The only question is what can be put on the shelf in the middle,
// because that is the part that is going to be enforced on both of them.
//
// The shelf is deliberately drawn SMALL. A reader who ends up thinking public
// reason is generous has not understood the cost of it.
//
// GAMIFIED SHAPE:
//   · beat 5  SCENE TARGETS — three candidate reasons for the same law, tap the
//     one that can go on the shelf. Both decoys are sincere and one of them is
//     probably true; they fail on availability, not on merit (H66).
//   · beat 7  two CARDS — what toleration actually requires, against the version
//     that sounds nicer and says nothing.
// ─────────────────────────────────────────────────────────────────────────────

export interface Pol20Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** The two private stacks, left and right, 0…1. */ stacks?: number;
  /** The three candidate reasons in the middle, 0…1. */ cands?: number;
  /** The shelf beneath them, 0…1. */ shelf?: number;
  /** The winning reason resting on the shelf, 0…1. */ landed?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Pol20Beat[] = [
  {
    p: 25, x: 200, stacks: 1,
    text: 'Consider two neighbours, each with a complete view of how to live. John Rawls calls such a view a comprehensive doctrine.',
    dur: 4.2,
  },
  {
    p: 177, x: 200, stacks: 1,
    text: 'The two doctrines share almost nothing, and neither neighbour can persuade the other. Yet neither need have reasoned badly.',
    cite: 'Reasonable pluralism',
    dur: 3.2,
  },
  {
    p: 416, x: 200, stacks: 1,
    text: 'Rawls held that free societies will always contain such disagreement, because reasonable people weigh hard questions differently.',
    dur: 1.8,
  },
  {
    p: 443, x: 132, stacks: 1, shelf: 1, cands: 1,
    text: 'However, the neighbours share a street, and any law governing it will be enforced on both of them.',
    dur: 4.2,
  },
  {
    p: 383, x: 132, stacks: 1, shelf: 1, cands: 1,
    text: 'The idea of public reason holds that such a law must be justifiable to everyone it binds. So its reasons can’t presuppose either neighbour’s doctrine.',
    cite: 'Public reason',
    dur: 4.6,
  },
  {
    p: 165, x: 132, stacks: 1, shelf: 1, cands: 1, live: 1,
    interact: {
      prompt: 'Which of the three reasons meets the standard of public reason?',
      explain: 'The appeal to safety. Anyone can judge whether a rule makes a street safer, whatever doctrine they hold. The other two may be sincere, and one may be true, but each presupposes a doctrine the other neighbour rejects.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 456, x: 268, stacks: 1, shelf: 1, cands: 1, landed: 1,
    quote: {
      id: 'lq-political-political-20-2',
      text: 'A plurality of reasonable yet incompatible comprehensive doctrines is the normal result of the exercise of human reason within free institutions.',
      author: 'John Rawls',
      work: 'Political Liberalism',
      era: '1993',
      philosopherId: 'john-rawls',
      branchSlugs: ['political-philosophy'],
    },
    dur: 4.0,
  },
  {
    p: 453, x: 268, stacks: 1, shelf: 1, cands: 1, landed: 1,
    text: 'The reasons both can weigh are few. Almost everything each neighbour values stays within their own doctrine, and neither is asked to abandon it.',
    dur: 4.2,
  },
  {
    p: 41, x: 268, stacks: 1, shelf: 1, cands: 1, landed: 1,
    interact: {
      prompt: 'What does tolerating a view require of you?',
      sort: {
        chip: 'a view you detest',
        bins: [
          { id: 'power', label: 'legal restraint', reads: 'refrain from using the law against it', correct: true },
          { id: 'quiet', label: 'silence', reads: 'keep your objections to yourself' },
          { id: 'agree', label: 'an open mind', reads: 'allow that the view might be right' },
        ],
      },
      explain: 'Legal restraint. Toleration means refraining from using the law against a view you judge wrong. It still leaves you free to criticise that view. Allowing that the view might be right shows an open mind, a different virtue.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Public Reason and Toleration',
      points: [
        'Reasonable pluralism is the normal result of free reasoning',
        'Coercive law needs reasons the coerced can weigh',
        'A sincere reason may still presuppose a doctrine others reject',
        'Toleration restrains the use of force and requires no agreement',
      ],
      closing: 'Public reason leaves both doctrines intact, which is why the reasons it allows are so few.',
    },
    dur: 3.4,
  },
];
