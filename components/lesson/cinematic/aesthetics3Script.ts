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
    p: 32, arc: 0.3, modes: 1,
    text: 'No culture has ever lived without song or story. Not one, anywhere. That is strange enough to want an explanation.',
    dur: 3.6,
  },
  {
    p: 22, arc: 0.5, mask: 1,
    text: 'Tragedy hurts, and we go anyway. Aristotle says it raises pity and fear in you, then works them back out of you. He called that katharsis, and he never quite says what it is.',
    cite: 'Catharsis',
    dur: 4.8,
  },
  {
    p: 15, arc: 1, mask: 1,
    text: 'Athens watches Oedipus work out that he killed his own father. Nobody looks away. Aristotle thinks we can bear to look at painful things drawn well, because looking at them teaches us something.',
    cite: 'Aristotle at the theatre',
    dur: 5.0,
  },
  {
    p: 4, arc: 1, mask: 1,
    interact: {
      prompt: 'You leave a tragedy wrung out and somehow lighter. Tap Aristotle’s word for that.',
      cards: [
        { text: 'Catharsis', correct: true },
        { text: 'Mimesis', correct: false },
      ],
      // Was a list of FOUR Greek terms, three of them glossing options that stopped
      // existing when the A/B/C/D cards went. Only one is on screen now.
      explain: 'Catharsis. It is the one word Aristotle never pins down, and people have argued about what he meant ever since. Mimesis, the other card, means imitation — a different idea altogether.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 33, modes: 1, will: 1,
    text: 'A minor key floods you with sadness and never argues for it. Schopenhauer thought music reaches something underneath all the arguing — the restless wanting that drives you. Plato thought exactly that made it dangerous.',
    cite: 'Music slips past reason',
    dur: 5.0,
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
    p: 3, modes: 1, cut: 1, will: 1,
    interact: {
      prompt: 'Drag to what Plato actually did about music.',
      drag: {
        lo: 'LEFT IT ALONE',
        hi: 'BANNED EVERY NOTE',
        start: 1,
        zones: [
          { id: 'free', upto: 0.28, reads: 'left it alone; music is only decoration' },
          { id: 'modes', upto: 0.74, reads: 'kept the steadfast modes and removed the soft ones', correct: true },
          { id: 'ban', upto: 1, reads: 'banned every note of it from the city' },
        ],
      },
      explain: 'The middle. He regulated rather than abolished, and the reason is the interesting part: he thought music shapes a character before you get the chance to argue with it. You cannot reason your way out of a tune you grew up inside.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'We Love Songs and Stories',
      points: [
        'Aristotle: tragedy works a katharsis',
        'Schopenhauer: music copies the will',
        'Plato regulated the modes, did not ban them',
      ],
      closing: 'The next song that moves you echoes a question 2,400 years old.',
    },
    dur: 2.8,
  },
];
