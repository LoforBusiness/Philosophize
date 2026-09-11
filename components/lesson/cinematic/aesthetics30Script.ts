import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic aesthetics-aesthetics-30, "What Is Beauty For?"
// Theme: A WINDOW WITH A KESTREL IN IT, AND A MIRROR THAT SLIDES ACROSS.
//
// Murdoch's claim is about where attention GOES, so the stage draws the two
// places it can go and lets one slide over the other. The bird never changes and
// never leaves. What changes is how much of the window is a mirror.
//
// This is the last lesson in the branch and the picture is deliberately the one
// she uses herself: a hovering kestrel, and a self that either steps back or
// does not.
//
// GAMIFIED SHAPE:
//   · beat 4  SCENE TARGETS — three plates, and the reader taps what unselfing
//     means. On the stage because both halves of the answer are in the window.
//   · beat 8  a SPLIT — attention divided between the self and the world. The
//     mirror travels with the seam, so a reader who keeps most of it on the self
//     watches the kestrel disappear behind their own reflection.
// ─────────────────────────────────────────────────────────────────────────────

export interface Aesthetics30Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the window and the bird in it are drawn. */ window?: number;
  /** The self's share of the attention, 0…1 — how far the mirror has slid. */ self?: number;
  /** 1 = the three plates the reader chooses between are up. */ plates?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
};

export const BEATS: Aesthetics30Beat[] = [
  {
    p: 345, x: 24, window: 1, self: 0.8,
    text: 'You could live without beauty. Food keeps you alive and shelter keeps you safe.',
    dur: 4.8,
  },
  {
    p: 168, x: 24, window: 1, self: 0.8,
    text: 'So what does beauty keep? One answer calls it decoration, and the first thing cut when life gets hard.',
    dur: 5.0,
  },
  {
    p: 450, x: 24, window: 1, self: 0.15,
    text: 'Iris Murdoch answered differently. A kestrel hovering pulls a person straight out of their own head.',
    dur: 5.0,
  },
  {
    p: 261, x: 24, window: 1, self: 0.15,
    text: 'Murdoch called it unselfing. The anxious ego steps back and something real outside it takes the room.',
    dur: 5.0,
  },
  {
    p: 158, x: 24, window: 1, self: 0.15, plates: 1, live: 1,
    interact: {
      prompt: 'Tap what unselfing means.',
      explain: 'Attending to something real. The ego steps back because the bird has taken the room. That’s not the same as forgetting who you are or deciding you do not matter. Murdoch calls the shift moral training for attending to other people.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 469, x: 80, window: 1, self: 0.15,
    text: 'Travellers in Florence have reported dizziness and racing hearts. Beauty can land like an event.',
    dur: 5.0,
  },
  {
    p: 448, x: 80, window: 1, self: 0.15,
    quote: {
      id: 'lq-aesthetics-aesthetics-30-1',
      text: 'The appreciation of beauty in art or nature is... a completely adequate entry into the good life. It is the checking of selfishness.',
      author: 'Iris Murdoch',
      work: 'The Sovereignty of Good',
      era: '1970',
      branchSlugs: ['aesthetics'],
    },
    dur: 5.0,
  },
  {
    p: 463, x: 80, window: 1, self: 0.15,
    text: 'Learning to attend properly to a bird is practice for attending properly to a person.',
    dur: 5.0,
  },
  {
    p: 160, x: 80, window: 1,
    interact: {
      prompt: 'Where does the attention sit while beauty works?',
      split: {
        left: 'THE SELF',
        right: 'THE WORLD',
        start: 0.92,
        zones: [
          { id: 'out', upto: 0.35, reads: 'the ego steps back and the bird appears', correct: true },
          { id: 'half', upto: 0.7, reads: 'half looking, half checking on yourself' },
          { id: 'in', upto: 1, reads: 'the kestrel is only a mirror after all' },
        ],
      },
      explain: 'Almost all of it on the world. Murdoch calls beauty the checking of selfishness, so a reader still monitoring themselves has not been unselfed at all. The bird is doing the work. It can only do the work while it’s what you’re looking at.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 302, x: 80, window: 1, self: 0.15,
    summary: {
      title: 'What Beauty Is For',
      points: [
        'Is beauty a luxury, or a basic human need',
        'Beauty can land with the force of an event',
        'Murdoch: it unselfs you, and that is moral training',
        'A flourishing life may need room for the beautiful',
      ],
      closing: 'You’ve seen what beauty can do to a life. The harder part is letting it stop you in your tracks.',
    },
    dur: 5.0,
  },
];
