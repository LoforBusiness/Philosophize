import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic history-foundations-4, "What Changed, and What Stayed?" — the fourth lesson
// on the History road, and a DIALOGUE lesson (LESSON_RULES group AP).
// Theme: A TOWN SQUARE, A CLOCK TOWER, AND A HUNDRED-YEAR-OLD PHOTOGRAPH.
//
// Three people talk, and nobody narrates. A visitor (the woman with the bun) holds up an
// old photograph of the square and decides that everything has changed; a local (the
// plain mascot) has opinions about the improvements; the historian (the top hat) shows
// what changed, what stayed, and how fast.
//
// A FOUNDATION LESSON (AP3), three ideas and no more: historians compare how things
// were with how they are · change is what alters, continuity is what stays · some
// changes are quick, and some take a lifetime.
//
// Every line is written for the ear (groups AC/AD), from its speaker’s character
// (cast.ts, AP14; group AS), and read at the pace its words ask for (AP17).
// ─────────────────────────────────────────────────────────────────────────────

export interface Hist4Beat extends BaseBeat {
  /**
   * What happens across this beat’s line (the scene choreographs it):
   * photo — the visitor holds the old photograph by its bottom edge at her chest, looks down at it, and lifts it a little as she looks up at the square ·
   * improve — the local looks from the photograph to the square, chin up, and folds his arms ·
   * arrive — the historian walks in past the clock tower, tips his hat, turns and points up at its clock ·
   * names — he points to the phone shop at “change”, then up at the clock tower at “continuity” ·
   * trough — the visitor steps to the old horse trough, now planted with flowers, bends over it and touches a flower ·
   * slow — the historian sweeps a hand slowly along the street from the trough to the bike rack ·
   * shop — the local thumbs at the phone shop’s window ·
   * pace — the visitor hands the historian the photograph; he walks back to the tower and holds it up beside it so both clocks show ·
   * rest — everyone at ease under the quotation, the bell in the tower swinging as the clock strikes.
   */
  act?: 'photo' | 'improve' | 'arrive' | 'names' | 'trough' | 'slow' | 'shop' | 'pace' | 'rest';
  /** The historian is on the stage. He walks in on `arrive`. */
  hist?: boolean;
  /** First question on the stage: the clock tower, the phone shop and the bike rack are the things to tap. */
  stayed?: boolean;
  /** Second question on the stage: the flower trough, the phone shop and the clock tower are the things to tap. */
  slowly?: boolean;
}

export const BEATS: Hist4Beat[] = [
  {
    bed: 'square',
    sfx: [{ id: 'paper', at: 2.93, gain: 0.8 }],
    act: 'photo',
    speaker: 'bun',
    text: 'I found a photo of this square from a hundred years ago. Everything’s different!',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'improve',
    speaker: 'plain',
    text: 'Naturally. I’d have improved it too, if they’d asked me.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'arrive', hist: true,
    speaker: 'tophat',
    text: 'Not everything. The clock tower is in the photo, and it’s still standing.',
    pace: 'even',
    dur: 2.1,
  },
  {
    act: 'names', hist: true,
    speaker: 'tophat',
    text: 'What alters over time is called change, and what stays the same is called continuity. Historians look for both.',
    pace: 'even',
    dur: 2.1,
  },
  {
    hist: true, stayed: true,
    interact: {
      prompt: 'Which thing in the square shows continuity?',
      explain: 'The clock tower. It stood here a hundred years ago, and it still does. The phone shop and the bike rack have both appeared since the photo.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    act: 'trough', hist: true,
    speaker: 'bun',
    text: 'The horse trough is full of flowers now. Did the horses just leave?',
    pace: 'even',
    dur: 1.8,
  },
  {
    act: 'slow', hist: true,
    speaker: 'tophat',
    text: 'Cars replaced the horses, bit by bit, over about thirty years. Some changes take a lifetime.',
    pace: 'even',
    dur: 2.1,
  },
  {
    act: 'shop', hist: true,
    speaker: 'plain',
    text: 'And the bakery became a phone shop in one afternoon. That one, I fully approve of.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'paper', at: 1.34, gain: 0.8 }],
    act: 'pace', hist: true,
    speaker: 'tophat',
    text: 'Of course you do. Some change is quick, some is slow, and some things barely change at all.',
    pace: 'even',
    dur: 2.1,
  },
  {
    hist: true, slowly: true,
    interact: {
      prompt: 'Which change in the square happened slowly?',
      explain: 'The horse trough. It stopped being needed as cars slowly took over from horses. The shop changed in a day, and the clock tower hasn’t changed at all.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    sfx: [{ id: 'bell', at: 0.28 }],
    act: 'rest', hist: true,
    quote: {
      id: 'lq-history-foundations-4-1',
      text: 'The past is a foreign country: they do things differently there.',
      author: 'L. P. Hartley',
      work: 'The Go-Between',
      era: '1953',
      branchSlugs: ['history'],
    },
    dur: 3.0,
  },
  {
    hist: true,
    summary: {
      title: 'What Changed, and What Stayed?',
      points: [
        'Historians compare how things were with how they are',
        'Change is what alters, continuity is what stays',
        'Some changes are quick, and some take a lifetime',
      ],
      closing: 'Next time you walk down an old street, ask what’s still the same.',
    },
    dur: 2.8,
  },
];
