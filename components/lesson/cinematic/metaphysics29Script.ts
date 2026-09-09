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
    text: 'Nobody is in the forest. The tree falls, and the old question arrives with it.',
    dur: 4.8,
  },
  {
    p: 174, x: 24, land: 1, rock: 1,
    text: 'Realism says the world has its nature without any mind. Mountains would stand there unwatched.',
    dur: 5.0,
  },
  {
    p: 445, x: 24, land: 1, rock: 1,
    text: 'Anti-realism says what counts as real leans on minds. In the boldest form, to exist is to be perceived.',
    dur: 5.0,
  },
  {
    p: 267, x: 24, land: 1, rock: 1,
    text: 'Berkeley set a trap. Try to picture an unseen tree, and the tree you picture is being seen.',
    dur: 5.0,
  },
  {
    p: 162, x: 24, land: 1, rock: 1, plates: 1, live: 1,
    interact: {
      prompt: 'Tap why kicking a rock does not refute Berkeley.',
      explain: 'A kick is a perception. The hardness and the pain are sensations, and Berkeley never denied the rock or the jolt. What he denied was unperceived matter standing behind them, which no vivid feeling can produce.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 459, x: 80, land: 1, rock: 1,
    text: 'Doctor Johnson kicked a stone and said he had refuted Berkeley that way.',
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
    text: 'Now suppose every conscious being blinks out at once. No mind is left anywhere.',
    dur: 5.0,
  },
  {
    p: 176, x: 80, land: 1, lid: 1,
    interact: {
      prompt: 'Every mind blinks out. Whose view says the mountain is gone?',
      sort: {
        chip: 'the unwatched mountain',
        bins: [
          { id: 'realist', label: 'the realist', reads: 'the rock never needed a witness' },
          { id: 'berkeley', label: 'Berkeley', reads: 'to be is to be perceived', correct: true },
          { id: 'kant', label: 'the Kantian', reads: 'something remains without an ordered world' },
        ],
      },
      explain: 'Berkeley. To be is to be perceived, so an unsensed mountain is a contradiction. His rescue is that God perceives everything always. A realist keeps the rock, and a Kantian keeps a thing in itself without the ordered world.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 314, x: 80, land: 1, rock: 1,
    summary: {
      title: 'Whose World Is It',
      points: [
        'Realism: the world stands without any mind',
        'Anti-realism ties what is real to a knower',
        'Berkeley: to be is to be perceived',
        'Kant: a knower meets appearances, not things in themselves',
      ],
      closing: 'The forest puzzle was never about sound. It was about whether reality needs a witness.',
    },
    dur: 5.0,
  },
];
