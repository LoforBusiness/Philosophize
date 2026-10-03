import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic science-foundations-4, "Why Measure More Than Once?" — the fourth lesson on
// the Science road, and a DIALOGUE lesson (LESSON_RULES group AP).
// Theme: A PLAYGROUND SWING, A STOPWATCH, AND A CLIPBOARD OF TIMINGS.
//
// Two people talk, and nobody narrates (AP13: two is a complete lesson). A student (the
// woman with the bun) times one swing of a playground swing and declares the experiment
// finished; the scientist (the top hat) makes her time it again, and again.
//
// A FOUNDATION LESSON (AP3), three ideas and no more: every measurement has a small
// error · measure several times and take the average · check a result that is far from
// the others instead of hiding it.
//
// Every line is written for the ear (groups AC/AD), from its speaker’s character
// (cast.ts, AP14; group AS), and read at the pace its words ask for (AP17).
// ─────────────────────────────────────────────────────────────────────────────

export interface Sci4Beat extends BaseBeat {
  /**
   * What happens across this beat’s line (the scene choreographs it):
   * time — the student stops her stopwatch as the empty swing comes back, reads it and writes 3.0 on her clipboard ·
   * sigh — the scientist, at the swing’s frame, catches its chain, holds it still and lets it go again; she starts the stopwatch ·
   * again — the student times it twice more and writes each time on her clipboard ·
   * error — the scientist walks over and points at the stopwatch in her hand ·
   * average — he points along her three times on the clipboard, one by one ·
   * odd — the student lifts the clipboard, writes 2.0 as the fourth time and holds her pencil’s point on it ·
   * check — the scientist nods at the swing, walks back and lets it go again; she times it once more ·
   * done — the student writes the average at the foot of the clipboard and holds it up ·
   * rest — both at ease under the quotation: her pencil back in the clip, the clipboard lowered, the swing slowing.
   */
  act?: 'time' | 'sigh' | 'again' | 'error' | 'average' | 'odd' | 'check' | 'done' | 'rest';
  /** How many times are written on the clipboard: 0 none · 1 three seconds · 3 three, two point eight and three point one · 4 with the odd two seconds. */
  rows?: number;
  /** First question on the stage: the swing, her stopwatch and the clipboard are the things to tap. */
  spread?: boolean;
  /** Second question on the stage: three of the times on her clipboard, three seconds, two point eight and two seconds, are the things to tap. */
  outlier?: boolean;
}

export const BEATS: Sci4Beat[] = [
  {
    act: 'time', rows: 1,
    speaker: 'bun',
    text: 'One swing took three seconds. That’s the experiment done, then!',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'sigh', rows: 1,
    speaker: 'tophat',
    text: 'One measurement is a start, not an answer. Time it again, and again.',
    pace: 'even',
    dur: 2.1,
  },
  {
    act: 'again', rows: 3,
    speaker: 'bun',
    text: 'Two point eight, and now three point one. The swing keeps changing its mind!',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'error', rows: 3,
    speaker: 'tophat',
    text: 'The swing is steady. Every measurement has a small error, and yours comes from your thumb on the button.',
    pace: 'even',
    dur: 2.1,
  },
  {
    rows: 3, spread: true,
    interact: {
      prompt: 'Why did her three timings come out different?',
      explain: 'Her stopwatch. Starting and stopping it by hand is never exact. The swing takes the same time on every swing, and the clipboard only records what she measured.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    act: 'average', rows: 3,
    speaker: 'tophat',
    text: 'So you measure several times and take the average. The small errors cancel each other out.',
    pace: 'even',
    dur: 2.1,
  },
  {
    act: 'odd', rows: 4,
    speaker: 'bun',
    text: 'I got two seconds once, while a dog ran past. Shall I just rub that one out?',
    pace: 'even',
    dur: 1.8,
  },
  {
    act: 'check', rows: 4,
    speaker: 'tophat',
    text: 'Don’t hide it. A result far from the others means something went wrong, so find out what and measure again.',
    pace: 'even',
    dur: 2.1,
  },
  {
    rows: 4, outlier: true,
    interact: {
      prompt: 'Which timing on her clipboard should she check again?',
      explain: 'Two seconds. It’s far from the others, so something went wrong that time. Three and two point eight sit close together, as steady timings should.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    act: 'done', rows: 4,
    speaker: 'bun',
    text: 'The average of my three good ones is about three seconds. So I was right all along!',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'rest', rows: 4,
    quote: {
      id: 'lq-science-foundations-4-1',
      text: 'When you can measure what you are speaking about, and express it in numbers, you know something about it.',
      author: 'Lord Kelvin',
      work: 'Electrical Units of Measurement, a lecture',
      era: '1883',
      branchSlugs: ['science'],
    },
    dur: 3.0,
  },
  {
    rows: 4,
    summary: {
      title: 'Why Measure More Than Once?',
      points: [
        'Every measurement has a small error',
        'Measure several times and take the average',
        'Check a result that’s far from the others',
      ],
      closing: 'Next time you see a single result, ask how many times it was measured.',
    },
    dur: 2.8,
  },
];
