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
  /** 1 = a corner ornament sits on the frame — beauty read as mere decoration. */ deco?: number;
  /** 1 = a tag names the change beneath the window — Murdoch's word for it. */ named?: number;
  /** 1 = the attention leaves the window from the bird: the practice extends to a person. */ person?: number;
};

export const BEATS: Aesthetics30Beat[] = [
  {
    p: 345, x: 24, window: 1, self: 0.8,
    text: 'Beauty seems inessential to survival. Food keeps a person alive, and shelter keeps them safe.',
    dur: 4.8,
  },
  {
    p: 168, x: 24, window: 1, self: 0.8, deco: 1,
    text: 'What, then, is beauty for? One answer treats it as decoration, the first thing given up when life gets hard.',
    dur: 5.0,
  },
  {
    p: 450, x: 24, window: 1, self: 0.15,
    text: 'Iris Murdoch gave a different answer. A hovering kestrel, she wrote, can end a person’s anxious brooding.',
    dur: 5.0,
  },
  {
    p: 261, x: 24, window: 1, self: 0.15, named: 1,
    text: 'Murdoch called the change unselfing. The brooding self disappears, and attention rests on something real.',
    dur: 5.0,
  },
  {
    p: 158, x: 24, window: 1, self: 0.15, plates: 1, live: 1,
    interact: {
      prompt: 'In unselfing, what happens to a person’s attention?',
      explain: 'Attending to something real. The anxious self fades because attention is fixed on the kestrel. Unselfing doesn’t mean losing your identity or thinking you don’t matter. For Murdoch, such attention trains a person to see others justly.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 469, x: 80, window: 1, self: 0.15,
    text: 'Visitors to Florence have reported dizziness and a racing heart in front of its art. Beauty can affect a person with physical force.',
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
    p: 463, x: 80, window: 1, self: 0.15, person: 1,
    text: 'For Murdoch, learning to attend properly to a bird is practice for attending properly to a person.',
    dur: 5.0,
  },
  {
    p: 160, x: 80, window: 1,
    interact: {
      prompt: 'When beauty unselfs a person, how is attention divided between self and world?',
      split: {
        left: 'THE SELF',
        right: 'THE WORLD',
        start: 0.92,
        zones: [
          { id: 'out', upto: 0.35, reads: 'attention rests on the kestrel, not the self', correct: true },
          { id: 'half', upto: 0.7, reads: 'divided between the kestrel and oneself' },
          { id: 'in', upto: 1, reads: 'on the self, using the kestrel as a mirror' },
        ],
      },
      explain: 'Attention rests on the kestrel, not the self. Murdoch calls the appreciation of beauty a checking of selfishness. So a person still watching their own reactions hasn’t been unselfed. The kestrel checks selfishness only while it holds attention.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 302, x: 80, window: 1, self: 0.15,
    summary: {
      title: 'What Beauty Is For',
      points: [
        'Beauty may be a need rather than a luxury',
        'Beauty can affect a person with physical force',
        'Murdoch: beauty unselfs, which trains moral attention',
        'A flourishing life may need room for the beautiful',
      ],
      closing: 'For Murdoch, attending to beauty is a moral exercise. It trains the attention that seeing other people justly requires.',
    },
    dur: 5.0,
  },
];
