import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic aesthetics-aesthetics-3, "Why Humans Love Music and Stories".
//
// The stage carries three pieces of real information design. Aristotle's half is
// a LINE GRAPH of a tragedy: pity and fear climbing to the recognition, then the
// long fall that is katharsis — it draws itself as the beats advance. Music's
// half is a live BAR METER of the Greek modes; on the Plato beat the three soft
// modes drop out and are stamped away while Dorian and Phrygian keep playing —
// regulated, not banned. When the graph steps aside for the music beats, its slot
// is taken by Schopenhauer's LADDER: the other arts copy the Ideas, music copies
// the will itself — the one claim the quote card turns on.
//
// Prop channels the scene reads: `arc` (how much of the tragic curve is drawn),
// `mask` (the tragic mask), `modes` (the meter's intensity), `cut` (Plato's
// regulation of the soft modes) and `will` (Schopenhauer's ladder).
//
// Graded questions are the two from data/.../why-humans-love-music-and-stories.ts.
// ─────────────────────────────────────────────────────────────────────────────

export interface Aes3Beat extends BaseBeat {
  /** Figure gesture. */ p?: number;
  /** How much of the tragic arc is drawn, 0..1. */ arc?: number;
  /** Theatre mask present (0/1). */ mask?: number;
  /** The mode meter is up (0/1) — it shares the lower-left slot with the mask. */ modes?: number;
  /** Plato's regulation: the soft modes fall away (0/1). */ cut?: number;
  /** Schopenhauer's ladder — other arts copy Ideas, music copies the will (0/1). */ will?: number;
}

export const BEATS: Aes3Beat[] = [
  {
    // Both halves alive at once: a story arc beginning to climb while the modes
    // play — "song or story", drawn rather than asserted.
    p: 130, arc: 0.3, modes: 1,
    text: 'Every human culture on record has made music and told stories. No society studied by anthropologists lacks either.',
    dur: 2.2,
  },
  {
    // Both halves alive at once: a story arc beginning to climb while the modes
    // play — "song or story", drawn rather than asserted.
    p: 130, arc: 0.3, modes: 1,
    text: 'A practice found in every culture calls for an explanation. Why would people seek out stories that make them suffer?',
    dur: 1.8,
  },
  {
    p: 22, arc: 0.5, mask: 1,
    text: 'Aristotle held that a tragedy arouses pity and fear in its audience, and then releases them.',
    cite: 'Catharsis',
    dur: 3.1,
  },
  {
    p: 22, arc: 0.5, mask: 1,
    text: 'The effect is called katharsis, a term Aristotle never explained. Readers still disagree about what it means.',
    dur: 1.8,
  },
  {
    p: 15, arc: 1, mask: 1,
    text: 'In Sophocles’ Oedipus the King, Oedipus discovers that he has killed his own father. Aristotle calls this a recognition, a change from ignorance to knowledge.',
    cite: 'Recognition',
    dur: 2.1,
  },
  {
    p: 15, arc: 1, mask: 1,
    text: 'Aristotle also writes that people enjoy accurate images of painful things, because learning from them is a pleasure.',
    dur: 2.9,
  },
  {
    p: 165, arc: 1, mask: 1,
    interact: {
      prompt: 'You leave a tragedy drained and yet relieved. Which of Aristotle’s concepts explains the relief?',
      cards: [
        { text: 'Catharsis', correct: true },
        { text: 'Mimesis', correct: false },
      ],
      // Was a list of FOUR Greek terms, three of them glossing options that stopped
      // existing when the A/B/C/D cards went. Only one is on screen now.
      explain: 'Catharsis. For Aristotle, a tragedy first stirs pity and fear, and then lets them go. That’s the relief you feel at the end. Mimesis means copying, and every tragedy copies an action, so copying can’t explain the relief.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 33, modes: 1, will: 1,
    text: 'Music can make you sad without giving you any reason to be sad. Arthur Schopenhauer held that music expresses the will, the blind striving behind everything in nature.',
    cite: 'Music before reason',
    dur: 4,
  },
  {
    p: 33, modes: 1, will: 1,
    text: 'Plato, over two thousand years earlier, argued that music shapes character before reason develops. So he thought music dangerous.',
    dur: 1.8,
  },
  {
    p: 141, modes: 1, will: 1,
    quote: {
      id: 'lq-aesthetics-aesthetics-3-1',
      text: 'Music is not, like the other arts, a copy of the Ideas, but a copy of the will itself.',
      author: 'Arthur Schopenhauer',
      philosopherId: 'arthur-schopenhauer',
      work: 'The World as Will and Representation',
      era: '1818',
      branchSlugs: ['aesthetics'],
    },
    dur: 3.4,
  },
  {
    p: 168, modes: 1, cut: 1, will: 1,
    interact: {
      prompt: 'If music shapes character before reason develops, how should Plato’s ideal city treat music?',
      drag: {
        lo: 'NO REGULATION',
        hi: 'ALL MUSIC BANNED',
        start: 1,
        zones: [
          { id: 'free', upto: 0.28, reads: 'leave music entirely unregulated' },
          { id: 'modes', upto: 0.74, reads: 'keep the steadfast modes and remove the soft ones', correct: true },
          { id: 'ban', upto: 1, reads: 'banish all music from the city' },
        ],
      },
      explain: 'Keep the steadfast modes and remove the soft ones. In the Republic, Plato regulates music rather than banning it. Rhythm and harmony shape a child’s character before the child can reason. So the city keeps modes that imitate courage and self-control, and bans modes that soften character.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Tragedy, Music and the Emotions',
      points: [
        'Aristotle: tragedy arouses and releases pity and fear',
        'Schopenhauer: music copies the will',
        'Plato regulated the modes rather than banning music',
      ],
      closing: 'Philosophers have debated why art moves its audience for twenty-four centuries.',
    },
    dur: 2.8,
  },
];
