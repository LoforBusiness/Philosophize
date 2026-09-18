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
  /** 1 = the tag that was true before any choice is ringed and said to be so. */ given?: number;
  /** 1 = the emptied box is captioned: nothing left to judge by. */ nojudge?: number;
}

export const BEATS: Pol23Beat[] = [
  {
    p: 462, x: 200, tags: 1,
    text: 'Consider three things that define you. You chose two of them, a career and a club.',
    dur: 2.7,
  },
  {
    p: 462, x: 200, tags: 1,
    given: 1,
    text: 'The third, being a daughter, was true of you before you could make any choice.',
    dur: 1.8,
  },
  {
    p: 384, x: 200, tags: 1, box: 1,
    text: 'John Rawls asks you to choose principles of justice behind a veil of ignorance. You set aside knowledge of your class, your talents and your conception of the good.',
    cite: 'The veil of ignorance',
    dur: 4.8,
  },
  {
    p: 379, x: 132, tags: 1, box: 1, left: 1,
    text: 'Michael Sandel calls the liberal picture of the person the unencumbered self. On this picture, the self exists prior to the ends it chooses.',
    cite: 'The unencumbered self',
    dur: 4.6,
  },
  {
    p: 165, x: 132, tags: 1, box: 1, left: 1, live: 1,
    interact: {
      prompt: 'Which of these attachments did no choice of yours create?',
      explain: 'A daughter. You joined the club and chose the career, and you could leave either. No act of yours made you a daughter. Sandel calls such attachments constitutive, because they’re discovered rather than chosen.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 399, x: 132, tags: 1, strip: 1, box: 1,
    text: 'Sandel replies that the self is partly made of its attachments. Behind them stands no separate chooser.',
    cite: 'The situated self',
    dur: 4.6,
  },
  {
    p: 128, x: 268, tags: 1, strip: 1, box: 1,
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
    p: 383, x: 268, tags: 1, strip: 1, box: 1,
    nojudge: 1,
    text: 'Alasdair MacIntyre argues that morality only makes sense inside a tradition. Without one, a person has no way to judge what to value.',
    dur: 4.8,
  },
  {
    p: 442, x: 268, tags: 1, strip: 1, box: 1,
    interact: {
      prompt: 'How does the communitarian view divide your identity between what was given and what was chosen?',
      split: {
        left: 'HANDED TO YOU', right: 'CHOSEN BY YOU',
        start: 0.18,
        zones: [
          { id: 'made', upto: 0.34, reads: 'mostly chosen by you' },
          { id: 'half', upto: 0.66, reads: 'about half given and half chosen' },
          { id: 'found', upto: 1, reads: 'mostly given before any choice', correct: true },
        ],
      },
      explain: 'Mostly given before any choice. Communitarians hold that your language, family and community shape who chooses. Liberals reply that you can revise such ties.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Liberal and the Communitarian Self',
      points: [
        'The liberal self exists prior to the ends it chooses',
        'The situated self is partly made of ties it never chose',
        'Some attachments are discovered rather than joined',
        'MacIntyre: morality makes sense only within a tradition',
      ],
      closing: 'The dispute is whether any self remains once every unchosen attachment is set aside.',
    },
    dur: 3.6,
  },
];
