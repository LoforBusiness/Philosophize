import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic aesthetics-aesthetics-3, "Why Humans Love Music and Stories".
//
// The stage carries two pieces of real information design. Aristotle's half is a
// LINE GRAPH of a tragedy: pity and fear climbing to the recognition, then the
// long fall that is katharsis — it draws itself as the beats advance. Music's
// half is a live BAR METER of the Greek modes; on the Plato beat the three soft
// modes drop out and are stamped away while Dorian and Phrygian keep playing —
// regulated, not banned.
//
// Prop channels the scene reads: `arc` (how much of the tragic curve is drawn),
// `mask` (the tragic mask), `modes` (the meter's intensity) and `cut` (Plato's
// regulation of the soft modes).
//
// Graded questions are the two from data/.../why-humans-love-music-and-stories.ts.
// ─────────────────────────────────────────────────────────────────────────────

export interface Aes3Beat extends BaseBeat {
  /** Figure gesture. */ p?: number;
  /** How much of the tragic arc is drawn, 0..1. */ arc?: number;
  /** Theatre mask present (0/1). */ mask?: number;
  /** Mode-meter intensity 0..1. */ modes?: number;
  /** Plato's regulation: the soft modes fall away (0/1). */ cut?: number;
}

export const BEATS: Aes3Beat[] = [
  {
    p: 32, modes: 0.9,
    text: 'No culture has ever lived without song or story. Not coincidence — a puzzle philosophers have chased for millennia.',
    dur: 3.6,
  },
  {
    p: 22, arc: 0.5, mask: 1,
    text: 'Tragedy hurts, yet we crave it. In the Poetics, Aristotle says it raises pity and fear, then works a katharsis of them — a release he never quite defines.',
    cite: 'Catharsis',
    dur: 4.8,
  },
  {
    p: 15, arc: 1, mask: 1,
    text: 'Athens watches Oedipus learn he killed his father — a reversal snapped tight by recognition. We even enjoy lifelike images of painful things, Aristotle says, because seeing them, we learn.',
    cite: 'Aristotle at the theatre',
    dur: 5.0,
  },
  {
    p: 4, arc: 1, mask: 1,
    mc: {
      prompt: 'What did Aristotle call the emotional release felt after a tragic story?',
      options: [
        { id: 'a', text: 'Catharsis', correct: true },
        { id: 'b', text: 'Mimesis', correct: false },
        { id: 'c', text: 'Logos', correct: false },
        { id: 'd', text: 'Eudaimonia', correct: false },
      ],
      explain:
        'Catharsis names the contested release of pity and fear. Mimesis is imitation, logos is reason, eudaimonia is flourishing.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 33, modes: 1,
    text: 'A minor key floods you with sadness, no argument offered. Schopenhauer said music alone copies the will itself — our restless inner drive. Plato thought that same direct power a danger.',
    cite: 'Music slips past reason',
    dur: 5.0,
  },
  {
    p: 0, modes: 1,
    quote: {
      id: 'lq-aesthetics-aesthetics-3-1',
      text: 'Music is not, like the other arts, a copy of the Ideas, but a copy of the will itself.',
      author: 'Arthur Schopenhauer',
      work: 'The World as Will and Representation',
      era: '1818',
      branchSlugs: ['aesthetics'],
    },
    dur: 3.4,
  },
  {
    p: 3, modes: 1, cut: 1,
    mc: {
      prompt: 'In the Republic, why did Plato want to control music — and what did he actually do?',
      options: [
        { id: 'a', text: 'It shapes character before reason judges, so he banned all music', correct: false },
        { id: 'b', text: 'It shapes the soul, so he regulated the modes — not a total ban', correct: true },
        { id: 'c', text: 'It distracted workers, so he taxed it', correct: false },
        { id: 'd', text: 'It was too costly, so only elites could hear it', correct: false },
      ],
      explain:
        'The trap is "banned all music." Plato kept the steadfast modes and removed the soft ones — he regulated, not abolished. His worry was the soul, not cost.',
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
