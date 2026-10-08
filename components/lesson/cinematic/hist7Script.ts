import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic history-foundations-7, "History Recap: The Archive and the Dig" — the RECAP
// of the History road's first six lessons (LESSON_RULES group AV), and a DIALOGUE lesson
// (group AP).
// AV: recap
// Theme: A MUSEUM RECORD ROOM, ARCHIVE BOXES, A FIREMAN'S NOTEBOOK, A MAGNIFYING GLASS AND
// A CORKBOARD; THEN A DIG AMONG GREEK RUINS, TRENCHES, STRINGS, A WELL AND A CARVED STONE.
//
// Two people talk, and nobody narrates. The historian (the top hat) is alone in a
// museum's record room, working through forty boxes of papers about a town that burned
// down in one night in 1890: tall grey shelves of boxes behind him, a green-shaded desk
// lamp, a magnifying glass, letters tied with string, an old town map pinned to a
// corkboard, a rubber stamp and its ink pad. The woman with the bun arrives as the new
// volunteer, cheerful and keen to help, and gets each idea a little wrong. He sets each
// one straight, curtly. Then they go out to the museum's dig next door, among the
// ruins of an old Greek town: roped trenches on a string grid, brushes and trowels, a
// sieve, a fallen column, an old stone well the village still uses, a carved victory
// stone, a small wooden ticket hut, and olive hills under a hot sky.
//
// WHAT IT RECAPS, LESSON BY LESSON (each line is taken from what that lesson said):
//   1 What Is History? — the past is gone, it leaves evidence, and history works the past
//     out from it (beats 1–2).
//   2 How Historians Know — a source made at the time, by someone who was there, is a
//     primary source; one written later, from other sources, is secondary; printed isn't
//     the same as checked (beats 3–7).
//   3 Why Did It Happen? — an event has more than one cause: a long-term cause builds up
//     over years, and a trigger sets it off on the day (beats 8–10).
//   4 What Changed, and What Stayed? — what alters is change, what stays the same is
//     continuity, and historians look for both (beats 13–15).
//   5 On Trial in Athens — jurors were picked by lottery so nobody could bribe them, and
//     they voted in secret with bronze discs (beats 11–12).
//   6 Who Really Won? — every source was made by someone, for a reason; check one side's
//     story against the other's, and trust more where both agree (beats 7, 16–17).
//
// Every line is written for the ear (groups AC/AD), from its speaker's character (cast.ts,
// AP14; group AS), and spoken in the natural style (AP22).
// ─────────────────────────────────────────────────────────────────────────────

export interface Hist7Beat extends BaseBeat {
  /**
   * What happens across this beat (the scene choreographs it):
   * work — the historian alone at his desk in the record room: lifts a lid off an archive
   *   box, peers at a letter through the magnifying glass, writes a label, stamps it, and
   *   slides the box back onto a shelf ·
   * arrive — the woman with the bun comes in through the record room door, waving, with a
   *   VOLUNTEER badge, and leans on the desk ·
   * evidence — the historian taps the stack of papers in the open box ·
   * notebook — she picks up a smudged, smoke-stained notebook from the box and holds it
   *   over the waste-paper basket ·
   * primary — the historian takes the notebook back and opens it under the lamp ·
   * booklet — she holds up a glossy souvenir booklet with a picture of flames on its cover ·
   * council — the historian taps the date on the booklet's back cover ·
   * sulk — she puts the booklet down and folds her arms, sorry for the baker ·
   * causes — the historian points along the old town map on the corkboard, from the rows of
   *   wooden houses to the bakery ·
   * dig — both are out at the dig among the ruins; she kneels at a trench with a brush and
   *   lifts up a small bronze disc with a short rod through its middle ·
   * ballot — the historian takes the disc and holds it up to the light ·
   * well — she points at a villager lowering a bucket into the old stone well ·
   * stays — the historian looks from the well to the fallen column and back ·
   * carving — she brushes dust off a tall carved stone showing a giant general ·
   * check — the historian taps the carving, then points off toward the far hills ·
   * rest — both at ease on the edge of a trench under the quotation, the ruins behind.
   */
  act?: 'work' | 'arrive' | 'evidence' | 'notebook' | 'primary' | 'booklet' | 'council' | 'sulk' | 'causes' | 'dig' | 'ballot' | 'well' | 'stays' | 'carving' | 'check' | 'rest';
  /** Where they are: 0 the museum's record room · 1 the dig among the ruins. */
  place?: number;
  /** What she holds: 0 nothing · 1 the fireman's notebook · 2 the souvenir booklet · 3 the bronze ballot. */
  holds?: number;
  /**
   * First question on the stage — STAMP IT PRIMARY: three things on the archive desk, the
   * fireman's smoke-stained notebook, the glossy souvenir booklet and a framed painting of
   * the fire; the one tapped gets the archive's rubber stamp, PRIMARY, struck on it.
   */
  stamp?: boolean;
  /**
   * Second question on the stage — PIN THE SLOW CAUSE: three index cards on the corkboard
   * beside the old town map, WOODEN HOUSES PACKED CLOSE, THE BAKER'S OVEN LEFT BURNING and
   * A STRONG WIND THAT NIGHT; the one tapped gets a red pin and a thread run to the map.
   */
  cause?: boolean;
  /**
   * Third question on the stage — TAG WHAT STAYED: three things at the dig, the old stone
   * well, the fallen column and the wooden ticket hut; the one tapped gets the dig's brown
   * paper label, SAME, tied on with string.
   */
  tag?: boolean;
}

export const BEATS: Hist7Beat[] = [
  {
    bed: 'museum',
    sfx: [{ id: 'paper', at: 1.1, gain: 0.6 }, { id: 'pencil', at: 2.5, gain: 0.7 }, { id: 'stamp', at: 3.9, gain: 0.7 }, { id: 'book', at: 5.2, gain: 0.6 }],
    voiceAfter: 6.2,
    act: 'work', place: 0, holds: 0,
    speaker: 'tophat',
    text: 'Right. I need a witness who saw the fire.',
    pace: 'even',
    dur: 2.0,
  },
  {
    act: 'arrive', place: 0, holds: 0,
    speaker: 'bun',
    text: 'Hi, I’m the new volunteer! History’s just lovely old stories, isn’t it?',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'evidence', place: 0, holds: 0,
    speaker: 'tophat',
    text: 'Not stories. The past is gone, and history works the past out from the evidence left behind.',
    pace: 'even',
    dur: 2.1,
  },
  {
    sfx: [{ id: 'paper', at: 0.9, gain: 0.6 }],
    act: 'notebook', place: 0, holds: 1,
    speaker: 'bun',
    text: 'This notebook’s all smudged and smells of smoke. Shall I throw it out for you?',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'primary', place: 0, holds: 0,
    speaker: 'tophat',
    text: 'Put that down. A fireman wrote it that night, so it’s a primary source, made at the time by someone who was there.',
    pace: 'even',
    dur: 2.1,
  },
  {
    place: 0, holds: 0, stamp: true,
    interact: {
      prompt: 'Which of these is a primary source for the night of the fire?',
      explain: 'The fireman’s notebook. He wrote it that night, and he was there. The souvenir booklet and the painting came decades later, from other sources, so they’re secondary.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    sfx: [{ id: 'book', at: 0.4, gain: 0.6 }],
    act: 'booklet', place: 0, holds: 2,
    speaker: 'bun',
    text: 'Look, a lovely glossy booklet! The baker started the fire, it says, and printed things are always true.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'council', place: 0, holds: 2,
    speaker: 'tophat',
    text: 'Printed isn’t the same as checked. The town council made that booklet fifty years later, and every source is made by someone, for a reason.',
    pace: 'even',
    dur: 2.1,
  },
  {
    act: 'sulk', place: 0, holds: 0,
    speaker: 'bun',
    text: 'So the baker’s innocent? Oh no, I’d already decided I didn’t like him.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'causes', place: 0, holds: 0,
    speaker: 'tophat',
    text: 'The baker’s oven was only the trigger, on the night. The long-term cause was fifty years of wooden houses, packed close together.',
    pace: 'even',
    dur: 2.1,
  },
  {
    place: 0, holds: 0, cause: true,
    interact: {
      prompt: 'Which cause had been building up for years before the fire?',
      explain: 'The wooden houses. They’d been packed closer and closer for fifty years. The baker’s oven and the strong wind both came on the night, so they only set it off.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    bed: 'garden',
    sfx: [{ id: 'clay', at: 0.6, gain: 0.6 }],
    act: 'dig', place: 1, holds: 3,
    speaker: 'bun',
    text: 'Look, I dug up a little bronze wheel with a stick through it! Is it a toy?',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'ballot', place: 1, holds: 0,
    speaker: 'tophat',
    text: 'It’s a juror’s ballot, like the ones in ancient Athens. Jurors were picked by lottery, so nobody could bribe them, and they voted in secret.',
    pace: 'even',
    dur: 2.1,
  },
  {
    act: 'well', place: 1, holds: 0,
    speaker: 'bun',
    text: 'I never win lotteries, so I’d never get picked. Oh, and the village is still filling buckets at that old well!',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'stays', place: 1, holds: 0,
    speaker: 'tophat',
    text: 'That well is two thousand years old. Historians look for change, and for continuity, which is what stays the same.',
    pace: 'even',
    dur: 2.1,
  },
  {
    place: 1, holds: 0, tag: true,
    interact: {
      prompt: 'Which thing at the dig shows continuity?',
      explain: 'The old well. People drew water from it two thousand years ago, and they still do. The fallen column is a ruin now, and the ticket hut is brand new.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    act: 'carving', place: 1, holds: 0,
    speaker: 'bun',
    text: 'And this stone says their general beat the whole enemy army by himself. What a lovely man.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'check', place: 1, holds: 0,
    speaker: 'tophat',
    text: 'The general paid for that stone himself, so check his story against the enemy’s. Where both sides agree, you can trust it more.',
    pace: 'even',
    dur: 2.1,
  },
  {
    act: 'rest', place: 1, holds: 0,
    quote: {
      id: 'lq-history-foundations-7-1',
      text: 'Misunderstanding of the present is the inevitable consequence of ignorance of the past.',
      author: 'Marc Bloch',
      work: 'The Historian’s Craft',
      era: '1949',
      branchSlugs: ['history'],
    },
    dur: 3.0,
  },
  {
    place: 1, holds: 0,
    summary: {
      title: 'History Recap: The Archive and the Dig',
      points: [
        'History works the past out from evidence',
        'Ask who made each source, when, and why',
        'Look for every cause, and for what stayed the same',
      ],
      closing: 'Next time you find an old letter or photo, ask who made it, and when.',
    },
    dur: 2.8,
  },
];
