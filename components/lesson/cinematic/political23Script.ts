import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic political-political-23, "The Self In Society"
// Theme: THREE THINGS YOU ARE, AND WHAT IS IN THE BOX WHEN THEY COME OFF.
//
// The liberal and communitarian pictures of a person are usually argued at each
// other in the abstract, and both sound obviously right in turn. Drawn as a box
// labelled WHAT IS LEFT, the disagreement becomes one visible thing: whether
// anything is in it.
//
// The scene does not settle that, because nothing settles it. What it can settle
// is the distinction underneath — that some of what you are was signed up for
// and some was true before you could speak — and that is what the first question
// tests, on objects the reader can point at.
//
// GAMIFIED SHAPE:
//   · beat 3  SCENE TARGETS — tap the tie you did not choose. Two of the three
//     are things people join, so the reader has to notice what the third one has
//     in common with being born somewhere (H66).
//   · beat 7  a SPLIT — one person divided between what was handed over and what
//     was picked up. Both numbers run the whole time, which a rail cannot do, and
//     giving one side more visibly takes it off the other.
// ─────────────────────────────────────────────────────────────────────────────

export interface Pol23Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** The three tags and their caption, 0…1. */ tags?: number;
  /** How far the tags have been taken off, 0…1. */ strip?: number;
  /** The empty box and its caption, 0…1. */ box?: number;
  /** The chooser said to remain inside it, 0…1. */ left?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Pol23Beat[] = [
  {
    p: 164, x: 200, tags: 1,
    text: 'Three things you are. Two of them you signed up for.',
    dur: 2.7,
  },
  {
    p: 164, x: 200, tags: 1,
    text: 'One was true before you could speak.',
    dur: 1.8,
  },
  {
    p: 2, x: 200, tags: 1, box: 1,
    text: 'Now set them aside. To pick fair rules, Rawls asks you to forget your class, your faith and your history.',
    cite: 'Choosing from nowhere',
    dur: 4.8,
  },
  {
    p: 45, x: 132, tags: 1, box: 1, left: 1,
    text: 'The liberal picture says a chooser is still in there. You exist first, then pick what to care about.',
    cite: 'The unencumbered self',
    dur: 4.6,
  },
  {
    p: 4, x: 132, tags: 1, box: 1, left: 1, live: 1,
    interact: {
      prompt: 'Tap the tie you did not choose.',
      explain: 'Being a daughter. You can leave a club and change careers, and no act of yours began the first tie. The point is not that the tie binds harder. The point is that you found yourself already inside it, before any choosing began.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 399, x: 132, tags: 1, strip: 1, box: 1,
    text: 'Take the ties away, says the other side, and nothing neutral is left underneath to do the choosing.',
    cite: 'The situated self',
    dur: 4.6,
  },
  {
    p: 137, x: 268, tags: 1, strip: 1, box: 1,
    quote: {
      id: 'lq-political-political-23-2',
      text: 'We cannot regard ourselves as independent in this way without great cost to those loyalties and convictions whose moral force consists partly in the fact that living by them is inseparable from understanding ourselves as the particular persons we are.',
      author: 'Michael Sandel',
      work: 'Liberalism and the Limits of Justice',
      era: '1982',
      branchSlugs: ['political-philosophy'],
    },
    dur: 5.0,
  },
  {
    p: 13, x: 268, tags: 1, strip: 1, box: 1,
    text: 'Morality only makes sense inside a tradition. Asked to choose values from nowhere, a person has no compass at all.',
    dur: 4.8,
  },
  {
    p: 41, x: 268, tags: 1, strip: 1, box: 1,
    interact: {
      prompt: 'How does the situated view split what you are?',
      split: {
        left: 'HANDED TO YOU', right: 'CHOSEN BY YOU',
        start: 0.18,
        zones: [
          { id: 'made', upto: 0.34, reads: 'mostly your own doing' },
          { id: 'half', upto: 0.66, reads: 'half found, half made' },
          { id: 'found', upto: 1, reads: 'nearly all of it was there first', correct: true },
        ],
      },
      explain: 'Nearly all handed over. The claim is not that you never choose. It is that the chooser was built out of a language, a family and a place, so no earlier self picked those. The liberal reply is that you can still walk away.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Found, Or Picked Up',
      points: [
        'The liberal self exists first and chooses its ends',
        'The situated self is partly made of ties it never chose',
        'Some attachments are discovered rather than joined',
        'Values may need a tradition to mean anything at all',
      ],
      closing: 'Strip away everything you did not choose, and the argument is over what is left.',
    },
    dur: 3.6,
  },
];
