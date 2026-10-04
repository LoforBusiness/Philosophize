import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic science-foundations-5, "Could It Be Wrong?" — the fifth lesson on the Science
// road, and a DIALOGUE lesson (LESSON_RULES group AP).
// Theme: A MISTY LOCH AT NIGHT, A ROWING BOAT, AND A SONAR SCREEN.
//
// Three people talk, and nobody narrates. A monster hunter (the woman with the bun) is
// out on a Scottish loch at night with a camera; her friend (the newsboy cap) rows the
// boat and minds the sonar; a scientist (the top hat) stands on the jetty with a lamp and
// points out that her monster has been made impossible to test.
//
// A ROAD THAT RAMPS UP (group AU): the first lesson on this road was a guess and a test.
// This one asks what makes a guess worth testing at all, which is harder: three ideas — a
// scientific claim must be able to fail a test · a claim that fits every result tells you
// nothing · look hardest for the result that would prove you wrong.
//
// Every line is written for the ear (groups AC/AD), from its speaker’s character
// (cast.ts, AP14; group AS), and read at the pace its words ask for (AP17, AP21).
// ─────────────────────────────────────────────────────────────────────────────

export interface Sci5Beat extends BaseBeat {
  /**
   * What happens across this beat’s line (the scene choreographs it):
   * row — the friend rows the boat out from the jetty while the hunter points the camera at the water ·
   * sonar — the friend ships the oars and turns the sonar screen toward her: a flat green line ·
   * shy — the hunter waves a hand at the water, quite sure of herself ·
   * jetty — the scientist, on the end of the jetty, lifts his lamp toward them ·
   * risk — he holds up one finger, then turns his hand palm down ·
   * commit — the hunter stands up in the boat and spreads her arms to show ten metres ·
   * look — the scientist points the lamp across the whole loch ·
   * flask — the friend pours tea from a flask into its cup lid ·
   * month — dawn: the hunter stares at the sonar screen, still flat, and scratches her head ·
   * rest — everyone at ease under the quotation, the mist lifting.
   */
  act?: 'row' | 'sonar' | 'shy' | 'jetty' | 'risk' | 'commit' | 'look' | 'flask' | 'month' | 'rest';
  /** The light: 0 night · 1 dawn, a month later. */
  dawn?: number;
  /**
   * First question on the stage — CATCH A BOTTLE: three bottles bobbing on the water, each
   * with a claim rolled up inside (SHE’S INVISIBLE, SHE HIDES WHEN WATCHED, SHE’S TEN METRES
   * LONG), are the things to tap.
   */
  bottle?: boolean;
  /**
   * Second question on the stage — READ THE RESULTS: three results pegged on a line strung
   * across the boat, A MONTH OF EMPTY SONAR, A BLURRY PHOTO and A FISHERMAN’S STORY, are the
   * things to tap.
   */
  result?: boolean;
}

export const BEATS: Sci5Beat[] = [
  {
    bed: 'loch',
    sfx: [{ id: 'oar', at: 0.71, gain: 0.8 }, { id: 'oar', at: 2.08, gain: 0.8 }],
    act: 'row', dawn: 0,
    speaker: 'bun',
    text: 'Tonight we finally get proof of the monster. Row us out to the middle!',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'sonar', at: 3.19, gain: 0.7 }],
    act: 'sonar', dawn: 0,
    speaker: 'cap',
    text: 'The sonar’s clear, and the camera’s caught nothing. Sorry, I’ve looked everywhere.',
    pace: ['even', 'weighty'],
    dur: 1.8,
  },
  {
    act: 'shy', dawn: 0,
    speaker: 'bun',
    text: 'That’s because she hides whenever she’s watched. And she doesn’t show up on sonar.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'jetty', dawn: 0,
    speaker: 'tophat',
    text: 'So if she’s seen, she’s real, and if she isn’t seen, she’s still real. Nothing could ever count against her.',
    pace: ['even', 'weighty'],
    dur: 2.1,
  },
  {
    act: 'risk', dawn: 0,
    speaker: 'tophat',
    text: 'A claim that can’t be wrong tells you nothing. Science needs claims that could fail a test, and that’s called falsifiability.',
    pace: ['even', 'weighty'],
    dur: 2.1,
  },
  {
    dawn: 0, bottle: true,
    interact: {
      prompt: 'Which of her claims could a test prove wrong?',
      explain: 'That she’s ten metres long. Something that big would show up on sonar, so a test could catch the claim out. Invisible, and hiding when watched, can never be tested.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    sfx: [{ id: 'creak', at: 0.2, gain: 0.7 }],
    act: 'commit', dawn: 0,
    speaker: 'bun',
    text: 'Fine. She’s ten metres long, and she lives right here in this loch.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'look', dawn: 0,
    speaker: 'tophat',
    text: 'Good. Now look hardest for the result that would prove you wrong, not the one that saves you.',
    pace: 'even',
    dur: 2.1,
  },
  {
    sfx: [{ id: 'pourcup', at: 3.1, gain: 0.8 }],
    act: 'flask', dawn: 0,
    speaker: 'cap',
    text: 'I’ll sweep the loch end to end, every night for a month. I’ve brought a flask.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    bed: 'garden',
    dawn: 1, result: true,
    interact: {
      prompt: 'Which result would count against the monster?',
      explain: 'A month of empty sonar. If she were ten metres long and in this loch, the sweeps would have found her. A blurry photo and a story can’t count against anything.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    act: 'month', dawn: 1,
    speaker: 'bun',
    text: 'A whole month of nothing. Maybe she’s moved to the next loch over.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'rest', dawn: 1,
    quote: {
      id: 'lq-science-foundations-5-1',
      text: 'The criterion of the scientific status of a theory is its falsifiability, or refutability, or testability.',
      author: 'Karl Popper',
      work: 'Conjectures and Refutations',
      era: '1963',
      branchSlugs: ['science'],
    },
    dur: 3.0,
  },
  {
    dawn: 1,
    summary: {
      title: 'Could It Be Wrong?',
      points: [
        'A scientific claim must be able to fail a test',
        'A claim that fits every result tells you nothing',
        'Look hardest for the result that proves you wrong',
      ],
      closing: 'Next time someone says they can’t be proved wrong, ask what would change their mind.',
    },
    dur: 2.8,
  },
];
