import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic metaphysics-being-29, "Does Reality Need a Mind?"
// Theme: A MOUNTAIN, AN EYE OVER IT, AND WHAT IS LEFT WHEN THE LID COMES DOWN.
//
// Every version of this argument is about one moment — the moment nobody is
// looking — so the stage draws exactly that moment and lets the reader say what
// is in the frame. Three views, three landscapes, and none of them needs a word.
//
// The eye is drawn OUTSIDE the mountain rather than over it, because a mind that
// covered the world would be arguing for the idealist before the reader had
// answered anything.
//
// GAMIFIED SHAPE:
//   · beat 4  SCENE TARGETS — three plates, and the reader taps why kicking a
//     stone does not touch Berkeley. On the stage because the trap is a claim
//     about what a sensation can prove, and a sensation is what the eye is for.
//   · beat 8  a SORT — the unwatched mountain, dropped under whoever owns it.
//     Each view draws its own landscape, so the answer arrives as a picture of a
//     world with nothing in it.
// ─────────────────────────────────────────────────────────────────────────────

export interface Metaphysics29Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the land the peaks stand on is drawn. */ land?: number;
  /** How solidly the peaks are there, 0…1. */ rock?: number;
  /** How much haze stands where the ordered world was, 0…1. */ haze?: number;
  /** How far the eye above has closed, 0…1. */ lid?: number;
  /** 1 = the three plates the reader chooses between are up. */ plates?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
};

export const BEATS: Metaphysics29Beat[] = [
  {
    p: 420, x: 24, land: 1, rock: 1,
    text: 'Consider a tree falling where no one perceives it. Does the tree still exist when no mind perceives it?',
    dur: 4.8,
  },
  {
    p: 174, x: 24, land: 1, rock: 1,
    text: 'Realism holds that the world exists and has its nature independently of minds. Unobserved mountains would still exist.',
    dur: 5.0,
  },
  {
    p: 445, x: 24, land: 1, rock: 1,
    text: 'Anti-realism holds that what’s real depends on minds. For the idealist, to exist is to be perceived.',
    dur: 5.0,
  },
  {
    p: 267, x: 24, land: 1, rock: 1,
    text: 'George Berkeley argued that an unperceived tree can’t even be conceived. Anyone imagining one is perceiving it in thought.',
    dur: 5.0,
  },
  {
    p: 162, x: 24, land: 1, rock: 1, plates: 1, live: 1,
    interact: {
      prompt: 'Why doesn’t kicking a stone refute Berkeley?',
      explain: 'A kick is a perception. The hardness and the pain are sensations, and Berkeley never denied that stones exist as perceived. He denied only matter existing unperceived, and no sensation can prove that such matter exists.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 459, x: 80, land: 1, rock: 1,
    text: 'James Boswell records that in 1763 Samuel Johnson kicked a large stone and declared, “I refute it thus.”',
    dur: 4.6,
  },
  {
    p: 438, x: 80, land: 1, rock: 1,
    quote: {
      id: 'lq-metaphysics-being-29-1',
      text: 'Their esse is percipi, nor is it possible they should have any existence out of the minds or thinking things which perceive them.',
      author: 'George Berkeley',
      work: 'A Treatise Concerning the Principles of Human Knowledge',
      era: '1710',
      philosopherId: 'george-berkeley',
      branchSlugs: ['metaphysics'],
    },
    dur: 5.0,
  },
  {
    p: 455, x: 80, land: 1, rock: 1, lid: 1,
    text: 'Now suppose every conscious being ceased to exist at once, leaving no mind anywhere.',
    dur: 5.0,
  },
  {
    p: 176, x: 80, land: 1, lid: 1,
    interact: {
      prompt: 'If every mind ceased to exist, which view says the mountain would be gone?',
      sort: {
        chip: 'the unperceived mountain',
        bins: [
          { id: 'realist', label: 'the realist', reads: 'the mountain exists without any perceiver' },
          { id: 'berkeley', label: 'Berkeley', reads: 'to be is to be perceived', correct: true },
          { id: 'kant', label: 'the Kantian', reads: 'a thing in itself, without space or time' },
        ],
      },
      explain: 'Berkeley. If to be is to be perceived, an unperceived mountain can’t exist. Berkeley himself held that God perceives everything continuously, so nothing disappears. A Kantian keeps a thing in itself, but not the mountain in space and time.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 314, x: 80, land: 1, rock: 1,
    summary: {
      title: 'Realism and Idealism',
      points: [
        'Realism: the world exists independently of minds',
        'Anti-realism: what is real depends on minds',
        'Berkeley: to be is to be perceived',
        'Kant: knowledge reaches appearances, not things in themselves',
      ],
      closing: 'The falling tree puzzle concerns existence, not sound. It asks whether reality depends on being perceived.',
    },
    dur: 5.0,
  },
];
