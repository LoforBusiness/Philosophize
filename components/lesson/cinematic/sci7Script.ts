import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic science-foundations-7, "Science Recap: Lab Night" — the RECAP of the Science
// road's first six lessons (LESSON_RULES group AV), and a DIALOGUE lesson (group AP).
// AV: recap
// Theme: A VICTORIAN LABORATORY, FLASKS, BUNSEN BURNERS AND A STOPWATCH; THEN AN
// OBSERVATORY DOME AT NIGHT, A BRASS TELESCOPE, STREET LAMPS AND MARS.
//
// Two people talk, and nobody narrates. The scientist (the top hat) is alone in an old
// laboratory after dark: tall windows, wooden benches crowded with flasks and beakers,
// shelves of jars, two Bunsen burners, a sink with a brass tap, a blackboard of sums. He
// pours, heats and watches a flask bubble. The woman with the bun, who was at the centre
// of four of these lessons (the paper planes, the ice cream chart, the swing, the loch),
// arrives cheerful and remembers every one of them slightly wrong. He sets each straight.
// Then they climb to the observatory dome on the roof: a slit open to the stars, a long
// brass telescope on its mount, a star chart on a desk, the town's street lamps below
// and Mars bright and red low in the sky.
//
// WHAT IT RECAPS, LESSON BY LESSON (each line is taken from what that lesson said):
//   1 What Is Science? — science starts with a guess you test against the world; weight
//     doesn't decide how fast a thing falls, and one drop settled it; the test beats the
//     argument (beats 2–4).
//   2 What Makes a Fair Test? — a fair test changes one thing and keeps everything else
//     the same; one result can be luck, so repeat it (beats 5–9).
//   3 Correlation Isn't Causation — two things can rise together without one causing the
//     other; look for a hidden cause behind both; to show a cause, change only that one
//     thing (beats 15–16).
//   4 Why Measure More Than Once? — every measurement has a small error; measure several
//     times and take the average; check a result far from the others instead of hiding it
//     (beats 9–11).
//   5 Could It Be Wrong? — a claim that can't fail a test tells you nothing; a scientific
//     claim must be able to fail; look hardest for the result that would prove you wrong
//     (beats 17–21).
//   6 Did the Cure Work? — feeling better can come from hope alone; compare groups treated
//     differently, and hide who gets what so hope can't change the result (beats 12–14).
//
// Every line is written for the ear (groups AC/AD), from its speaker's character
// (cast.ts, AP14; group AS), and spoken in the natural style (AP22).
// ─────────────────────────────────────────────────────────────────────────────

export interface Sci7Beat extends BaseBeat {
  /**
   * What happens across this beat (the scene choreographs it):
   * work — the scientist alone at his bench in the laboratory: pours a blue liquid from a
   *   jar into a flask, sets it on the burner, lights it, and watches it bubble, then
   *   jots a note on a pad ·
   * arrive — the woman with the bun comes in through the laboratory door, waving, and
   *   peers into the bubbling flask ·
   * guess — the scientist holds up one finger, then points out of the tall window ·
   * balls — she holds up two fists, one heavy and one light, and drops the heavy one
   *   first with a whistle ·
   * drop — the scientist lets both fists fall level, side by side ·
   * sugar — she spoons sugar into two beakers of water and sets one on the big burner,
   *   the other on the small one ·
   * fair — the scientist turns the big burner down to match the small one ·
   * once — she lifts a stopwatch, very pleased with it ·
   * repeat — the scientist taps the stopwatch, then writes three numbers on the
   *   blackboard ·
   * outlier — she points at one number on the blackboard and beams at it ·
   * check — the scientist circles that number on the blackboard with the chalk ·
   * tonic — she sips from a little green bottle marked BRAIN TONIC and strikes a pose ·
   * hope — the scientist takes the bottle and sets it on the shelf by the others ·
   * dome — both climb up into the observatory dome; she points out through the slit at
   *   the street lamps and the stars ·
   * hidden — the scientist points down at the setting sun's last glow, then at the lamps
   *   and up at the stars ·
   * planet — she taps the telescope proudly, then waves at the sky beside Mars ·
   * fail — the scientist folds his arms and shakes his head ·
   * commit — she spreads her hands wide to show how bright her planet is ·
   * wrong — the scientist swings the telescope toward Mars and steps back from it ·
   * rest — both at ease under the dome beneath the quotation, the stars turning overhead.
   */
  act?: 'work' | 'arrive' | 'guess' | 'balls' | 'drop' | 'sugar' | 'fair' | 'once' | 'repeat' | 'outlier' | 'check' | 'tonic' | 'hope' | 'dome' | 'hidden' | 'planet' | 'fail' | 'commit' | 'wrong' | 'rest';
  /** Where they are: 0 the laboratory · 1 the observatory dome. */
  place?: number;
  /** What she holds: 0 nothing · 1 the stopwatch · 2 the tonic bottle. */
  holds?: number;
  /**
   * First question on the stage — LEVEL THE BENCH: three pairs on the laboratory bench,
   * the two Bunsen burners (one roaring, one low), the two beakers of water and the two
   * thermometers, are the things to tap; only one pair isn't the same for both sides.
   */
  bench?: boolean;
  /**
   * Second question on the stage — STOCK THE SHELF: three things on the laboratory shelf,
   * a crate of matching plain bottles, a big gold MIRACLE label and a second bottle of
   * BRAIN TONIC, are the things to tap; one of them would let a test be run.
   */
  shelf?: boolean;
  /**
   * Third question on the stage — CHECK THE SKY: three things in the dome, the telescope's
   * eyepiece trained beside Mars, a poster of the planets on the wall and her diary with a
   * dream written in it, are the things to tap; one could prove her planet wrong.
   */
  sky?: boolean;
}

export const BEATS: Sci7Beat[] = [
  {
    bed: 'room',
    sfx: [{ id: 'pourcup', at: 0.8, gain: 0.6 }, { id: 'glass', at: 2.3, gain: 0.7 }, { id: 'burner', at: 3.1, gain: 0.6 }, { id: 'drip', at: 4.6, gain: 0.7 }, { id: 'pencil', at: 5.4, gain: 0.6 }],
    voiceAfter: 6.2,
    act: 'work', place: 0, holds: 0,
    speaker: 'tophat',
    text: 'Steady now. One drop at a time.',
    pace: 'even',
    dur: 2.0,
  },
  {
    sfx: [{ id: 'glass', at: 1.4, gain: 0.6 }],
    act: 'arrive', place: 0, holds: 0,
    speaker: 'bun',
    text: 'Hello, I’ve come for the science! Is this the part where everybody already knows the answer?',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'guess', place: 0, holds: 0,
    speaker: 'tophat',
    text: 'No, that’s the part before science. Science starts with a guess, and then you test it against the world.',
    pace: 'even',
    dur: 2.1,
  },
  {
    act: 'balls', place: 0, holds: 0,
    speaker: 'bun',
    text: 'Like the two balls off the ladder! The heavy one landed first, didn’t it?',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'drop', place: 0, holds: 0,
    speaker: 'tophat',
    text: 'They landed together, because weight doesn’t decide how fast a thing falls. One drop settled it, and the test beats the argument.',
    pace: 'even',
    dur: 2.1,
  },
  {
    sfx: [{ id: 'stir', at: 0.6, gain: 0.6 }, { id: 'glass', at: 2.2, gain: 0.6 }],
    act: 'sugar', place: 0, holds: 0,
    speaker: 'bun',
    text: 'Then let’s race my sugar against yours. Mine goes on the big burner, and yours on the little one.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'fair', place: 0, holds: 0,
    speaker: 'tophat',
    text: 'Then nobody can tell the sugar from the flame. A fair test changes one thing, and keeps everything else the same.',
    pace: 'even',
    dur: 2.1,
  },
  {
    place: 0, holds: 0, bench: true,
    interact: {
      prompt: 'Only the sugar should differ. Which pair on the bench makes her race unfair?',
      explain: 'The burners. One flame is far bigger, so that’s a second change. The beakers hold the same water, and the thermometers match.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    sfx: [{ id: 'stopwatch', at: 1.2, gain: 0.8 }],
    act: 'once', place: 0, holds: 1,
    speaker: 'bun',
    text: 'Same flame, then. I’ll only time it once, because I always win the first go.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'chalk', at: 1.2, gain: 0.6 }],
    act: 'repeat', place: 0, holds: 1,
    speaker: 'tophat',
    text: 'One result can be luck. Every timing has a small error too, so time it several times and take the average.',
    pace: 'even',
    dur: 2.1,
  },
  {
    act: 'outlier', place: 0, holds: 1,
    speaker: 'bun',
    text: 'Forty seconds, forty-two, and eleven. I like eleven best, because it makes my sugar look fast.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'chalktap', at: 1.0, gain: 0.7 }],
    act: 'check', place: 0, holds: 1,
    speaker: 'tophat',
    text: 'Liking a number isn’t a reason to keep it. A timing far from the others means something went wrong, so check that timing again.',
    pace: 'even',
    dur: 2.1,
  },
  {
    sfx: [{ id: 'jarlid', at: 0.4, gain: 0.6 }],
    act: 'tonic', place: 0, holds: 2,
    speaker: 'bun',
    text: 'Anyway, I drank my brain tonic this morning, and I feel brilliant. So it works!',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'glass', at: 1.6, gain: 0.6 }],
    act: 'hope', place: 0, holds: 0,
    speaker: 'tophat',
    text: 'You can feel better from hope alone. Compare a group who get it with a group who don’t, and hide who gets which.',
    pace: 'even',
    dur: 2.1,
  },
  {
    place: 0, holds: 0, shelf: true,
    interact: {
      prompt: 'Which thing on the shelf would let them test her tonic fairly?',
      explain: 'The crate of matching plain bottles. Fill half with tonic and half with water, and nobody knows who drank which. A miracle label only adds hope, and a second bottle compares nothing.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    bed: 'night',
    act: 'dome', place: 1, holds: 0,
    speaker: 'bun',
    text: 'Ooh, the dome! The street lamps came on, and so did the stars, so the lamps must switch the stars on!',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'hidden', place: 1, holds: 0,
    speaker: 'tophat',
    text: 'Two things can rise together without one causing the other. Sunset is behind both, so light the lamps at noon and watch for stars.',
    pace: 'even',
    dur: 2.1,
  },
  {
    act: 'planet', place: 1, holds: 0,
    speaker: 'bun',
    text: 'Fine, but there’s a secret planet beside Mars. It hides whenever a telescope looks at it.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'fail', place: 1, holds: 0,
    speaker: 'tophat',
    text: 'Then nothing could ever count against it. A claim that can’t fail a test tells you nothing.',
    pace: 'even',
    dur: 2.1,
  },
  {
    act: 'commit', place: 1, holds: 0,
    speaker: 'bun',
    text: 'All right, my planet’s as bright as Mars. It sits right beside Mars tonight.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'creak', at: 0.8, gain: 0.6 }],
    act: 'wrong', place: 1, holds: 0,
    speaker: 'tophat',
    text: 'Good, now your planet could fail a test. So look hardest for the result that would prove you wrong.',
    pace: 'even',
    dur: 2.1,
  },
  {
    place: 1, holds: 0, sky: true,
    interact: {
      prompt: 'Which of these could prove her bright planet beside Mars wrong?',
      explain: 'The telescope’s eyepiece. Something as bright as Mars would show up in it, so an empty patch of sky counts against her. A poster and a dream can’t count against anything.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    act: 'rest', place: 1, holds: 0,
    quote: {
      id: 'lq-science-foundations-7-1',
      text: 'Ignorance more frequently begets confidence than does knowledge.',
      author: 'Charles Darwin',
      work: 'The Descent of Man (1871), Introduction',
      era: '1871',
      branchSlugs: ['science'],
    },
    dur: 3.0,
  },
  {
    place: 1, holds: 0,
    summary: {
      title: 'Science Recap: Lab Night',
      points: [
        'Science tests its guesses against the world',
        'Change one thing, and measure more than once',
        'A good claim could fail a test',
      ],
      closing: 'Next time you’re sure of something, ask how you’d test it, and what result would prove you wrong.',
    },
    dur: 2.8,
  },
];
