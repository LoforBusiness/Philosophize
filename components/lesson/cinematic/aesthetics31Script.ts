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
  /** 1 = the three parts of the picture are live targets (Q1). */ pick?: number;
}

export const BEATS: Aes31Beat[] = [
  {
    g: 40, strings: 4, playing: 1, clapA: 0, clapB: 0,
    dur: 4.0,
    text: 'Nine notes on four strings. A good phrase, played well, and the room is pleased with it.',
  },
  {
    g: 40, strings: 4, playing: 1, clapA: 1, clapB: 0,
    dur: 3.8,
    text: 'The applause is polite. Nobody stands up.',
    cite: 'The first time',
  },
  {
    g: 41, strings: 1, playing: 1, clapA: 1, clapB: 0,
    dur: 4.6,
    text: 'Now three of the strings are gone. Same nine notes, same tempo, same phrasing — every sound leaving the instrument is the sound that left it before.',
    cite: 'One string',
  },
  {
    g: 137, strings: 1, playing: 0, clapA: 1, clapB: 0,
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
    g: 40, strings: 1, playing: 1, clapA: 1, clapB: 1,
    dur: 4.6,
    text: 'And the room is on its feet. Not one sound reaching anybody\'s ears had changed. The meter is the only thing on stage that moved.',
    cite: 'The second time',
  },
  {
    g: 2, strings: 1, playing: 0, clapA: 1, clapB: 1, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'Tap what the extra applause is actually for.',
      explain: 'The player. Nobody applauds a hard piece played badly, so difficulty is not the good itself — it is evidence of an achievement, and an achievement belongs to a person rather than to a sound.',
      xp: 5,
    },
  },
  {
    g: 11, strings: 1, playing: 0, clapA: 1, clapB: 1,
    dur: 1.0,
    interact: {
      prompt: 'Place the token on a performance that is difficult and says nothing.',
      field: {
        xLo: 'EASY TO PLAY', xHi: 'VERY HARD TO PLAY',
        yLo: 'NOTHING TO SAY', yHi: 'SOMETHING TO SAY',
        start: [0.24, 0.76],
        quads: [
          { id: 'stunt', x: 1, y: 0, reads: 'hard, and it says nothing: a stunt', correct: true },
          { id: 'great', x: 1, y: 1, reads: 'hard, and it says something: both values at once' },
          { id: 'gift', x: 0, y: 1, reads: 'easy, and it says something: it can still be great' },
          { id: 'dull', x: 0, y: 0, reads: 'easy, and it says nothing at all' },
        ],
      },
      explain: 'Bottom right, and it is a real place: difficulty with nothing to show for it. Strict formalism says the making never mattered, and the spliced recording embarrasses it — if that were true, finding out would change nothing. The two axes are separate, and neither alone is the work.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'Two Things at Once',
      points: [
        'A performance is admired as sound and as achievement',
        'Difficulty is evidence of skill, not a beauty of its own',
        'The spliced recording shows how much the making matters',
        'Two values can point in different directions',
      ],
      closing: 'When you applaud, notice what you are applauding. Half the time it is not the thing you heard.',
    },
    dur: 3.0,
  },
];
