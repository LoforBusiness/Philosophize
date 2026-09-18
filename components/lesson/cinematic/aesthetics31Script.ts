import type { BaseBeat } from './cinematicKit';

// Cinematic aesthetics-aesthetics-31, "Why Do We Applaud Difficulty?"
//
// THE PICTURE: one player, nine notes, and an applause meter. Three of the four
// strings go, the SAME nine notes play again, and only the meter moves — so the
// picture holds the sound fixed and shows the response changing, which is the whole
// question (H64).
//
// STAGING: a PLAYHEAD sweeps the melody and lights each note as it passes — the app's
// first thing that plays in time — and the answer targets are three parts of the
// picture: the notes, the strings, and the player standing on a plate (E33).

export interface Aes31Beat extends BaseBeat {
  /** Figure gesture (emote code). */ g?: number;
  /** Strings on the instrument, 4 or 1. */ strings?: number;
  /** 1 = the playhead is running. */ playing?: number;
  /** Height of the first ovation, 0…1. */ clapA?: number;
  /** Height of the second ovation, 0…1. */ clapB?: number;
  /** 1 = a tick confirms the notes are unchanged, drawn on THE MUSIC plate. */ same?: number;
  /** 1 = the three parts of the picture are live targets (Q1). */ pick?: number;
}

export const BEATS: Aes31Beat[] = [
  {
    g: 383, strings: 4, playing: 1, clapA: 0, clapB: 0,
    dur: 4.0,
    text: 'Suppose a musician plays a phrase of nine notes on four strings. The audience is pleased by a good phrase, well played.',
  },
  {
    g: 400, strings: 4, playing: 1, clapA: 1, clapB: 0,
    dur: 3.8,
    text: 'The audience applauds politely, but no one stands.',
    cite: 'The first performance',
  },
  {
    g: 442, strings: 1, playing: 1, clapA: 1, clapB: 0,
    dur: 4.6,
    text: 'Now suppose three strings are removed, and the same nine notes are played on one. The tempo, phrasing and sound are identical to the first performance.',
    cite: 'One string',
  },
  {
    g: 456, strings: 1, playing: 0, clapA: 1, clapB: 0,
    dur: 3.6,
    quote: {
      id: 'lq-aesthetics-aesthetics-31-1',
      text: 'If people knew how hard I had to work to gain my mastery, it would not seem so wonderful at all.',
      author: 'Michelangelo',
      work: 'Attributed',
      era: 'c. 1540',
      branchSlugs: ['aesthetics'],
    },
  },
  {
    g: 268, strings: 1, playing: 1, clapA: 1, clapB: 1,
    dur: 2.8,
    text: 'This time the audience gives a standing ovation. Yet the sound reaching their ears is unchanged.',
    cite: 'The second performance',
  },
  {
    g: 268, strings: 1, playing: 1, clapA: 1, clapB: 1, same: 1,
    dur: 1.8,
    text: 'Only the audience’s response has changed, so the extra applause must be for something other than the sound.',
  },
  {
    g: 443, strings: 1, playing: 0, clapA: 1, clapB: 1, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'What does the second, louder ovation reward?',
      explain: 'The player. No one applauds a hard piece played badly, so difficulty isn’t valued for itself. It’s evidence of an achievement, and an achievement belongs to a person rather than to a sound.',
      xp: 5,
    },
  },
  {
    g: 165, strings: 1, playing: 0, clapA: 1, clapB: 1,
    dur: 1.0,
    interact: {
      prompt: 'What does difficulty, on its own, add to a performance?',
      poll: {
        options: [
          { id: 'stunt', reads: 'a sign of achievement, not beauty itself', holders: ['Denis Dutton'], correct: true },
          { id: 'great', reads: 'nothing, as only what is perceived counts', holders: ['Monroe Beardsley'] },
          { id: 'gift', reads: 'grandeur: great labour makes a work sublime', holders: ['Edmund Burke'] },
          { id: 'dull', reads: 'a fault if shown: art should hide effort', holders: ['Baldassare Castiglione'] },
        ],
      },
      explain: 'A sign of achievement, not beauty itself. The notes were unchanged, so the second ovation rewarded the player. Yet a hard piece played badly earns nothing.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'Difficulty and Achievement',
      points: [
        'A performance is admired as sound and as achievement',
        'Difficulty is evidence of skill, not a beauty of its own',
        'The second ovation shows how much the making matters',
        'Aesthetic value and achievement can come apart',
      ],
      closing: 'Applause can reward the performer’s achievement as well as the sound, and the two are distinct.',
    },
    dur: 3.0,
  },
];
