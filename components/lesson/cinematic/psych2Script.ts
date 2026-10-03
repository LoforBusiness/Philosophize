import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic psychology-foundations-2, "Why Memory Gets Things Wrong" — the second
// lesson on the Psychology road, and a DIALOGUE lesson (LESSON_RULES group AP).
// Theme: A SUPERMARKET AISLE, TWO TROLLEYS, AND A JAR OF JAM ON THE FLOOR.
//
// Three people talk, and nobody narrates. Two shoppers (the woman with the bun, who
// notices very little, and the newsboy cap, who apologises for everything) bump
// trolleys and a jar of jam breaks; a minute later each remembers a different bump.
// The psychologist (the top hat) explains why, and what can settle it.
//
// A FOUNDATION LESSON (AP3), three ideas and no more: a memory is rebuilt each time it
// is recalled, not played back · the words of a question can change the memory itself
// · feeling sure is not the same as being right.
//
// Every line is written for the ear (groups AC/AD), from its speaker's character
// (cast.ts, AP14), and read in that speaker's voice at the pace its words ask for
// (AP17): its pauses come from its punctuation.
// ─────────────────────────────────────────────────────────────────────────────

export interface Psych2Beat extends BaseBeat {
  /**
   * What happens across this beat's line (the scene choreographs it):
   * bump — the two trolleys meet at the end of the aisle with a clunk, and her jar rocks ·
   * jam — the jar slides off her trolley and breaks on the floor; he stoops to it ·
   * retell — she turns away from him and acts out a trolley flying round the corner;
   *   behind her he picks up the jar's lid and holds it out to her ·
   * arrive — the psychologist walks in under the ceiling camera, which turns to watch
   *   him, tips his hat and looks from one to the other; the cap drops the lid in his basket ·
   * rebuild — he points up at the camera, then holds his hands apart and brings them
   *   together, building something; the cap fills the gap on the jam shelf with a jar of
   *   marmalade, which fits the gap and is not what was there ·
   * word — he points along the three word cards on the aisle sign, which turn over to
   *   one plain question ·
   * sure — the cap taps his chest, rolls his trolley back and forward at a crawl, then
   *   nods towards her, unsure ·
   * confident — the psychologist raises one finger, then lowers it; her shopping list
   *   slips off her trolley and drifts to the floor ·
   * replay — the camera's screen plays the bump back, slowly, and she leans in to watch ·
   * rest — everyone at ease under the quotation.
   */
  act?: 'bump' | 'jam' | 'retell' | 'arrive' | 'rebuild' | 'word' | 'sure' | 'confident' | 'replay' | 'rest';
  /** The psychologist is on the stage. He walks in on `arrive`. */
  th?: boolean;
  /** The jar of jam: 0 on her trolley · 1 broken on the floor. */
  spill?: number;
  /** The aisle sign's three slats: 0 what is in the aisle · 1 three words for the bump (the first question) · 2 turned over to one plain question, WHAT HAPPENED? */
  sign?: number;
  /** The camera's little screen by the ceiling: 0 dark · 1 the bump played back. */
  screen?: number;
  /** First question on the stage: the three word cards on the sign are the things to tap. */
  wording?: boolean;
  /** Second question on the stage: the camera, the jam on the floor and her shopping list are the things to tap. */
  witness?: boolean;
}

export const BEATS: Psych2Beat[] = [
  {
    act: 'bump', spill: 0, sign: 0, screen: 0,
    speaker: 'bun',
    text: 'Oh, hello! I think our trolleys just met.',
    pace: ['brisk', 'even'],
    dur: 1.8,
  },
  {
    act: 'jam', spill: 1, sign: 0, screen: 0,
    speaker: 'cap',
    text: 'Sorry, that was my fault. I was barely moving, but there goes your jam.',
    pace: ['brisk', 'even'],
    dur: 1.8,
  },
  {
    act: 'retell', spill: 1, sign: 0, screen: 0,
    speaker: 'bun',
    text: 'This gentleman came flying round the corner, I promise you. I heard the glass break before I even saw him.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'arrive', th: true, spill: 1, sign: 0, screen: 0,
    speaker: 'tophat',
    text: 'You both saw the same bump, and you remember it differently. Neither of you is lying.',
    pace: ['even', 'even'],
    dur: 2.1,
  },
  {
    act: 'rebuild', th: true, spill: 1, sign: 0, screen: 0,
    speaker: 'tophat',
    text: 'A memory isn’t a recording. Each time you remember something, your brain builds it again, and fills the gaps with whatever seems to fit.',
    pace: ['even', 'even'],
    dur: 2.1,
  },
  {
    th: true, spill: 1, sign: 1, screen: 0, wording: true,
    interact: {
      prompt: 'Ask her how fast he was going. Which word would make her remember him going faster?',
      explain: 'Smashed. In a famous study, people asked how fast two cars were going when they smashed remembered a faster crash than people asked about a hit, and some later recalled broken glass that was never there.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    act: 'word', th: true, spill: 1, sign: 2, screen: 0,
    speaker: 'tophat',
    text: 'The words of a question can change the memory itself. So a careful interviewer asks what happened, and lets the person tell it.',
    pace: ['even', 'even'],
    dur: 2.1,
  },
  {
    act: 'sure', th: true, spill: 1, sign: 2, screen: 0,
    speaker: 'cap',
    text: 'Well, I’m certain I was barely moving. Though I suppose she’s just as certain.',
    pace: 'even',
    dur: 1.8,
  },
  {
    act: 'confident', th: true, spill: 1, sign: 2, screen: 0,
    speaker: 'tophat',
    text: 'Feeling sure isn’t the same as being right. A story can feel more certain each time it’s told, even as the details drift.',
    pace: ['even', 'even'],
    dur: 2.1,
  },
  {
    th: true, spill: 1, sign: 2, screen: 0, witness: true,
    interact: {
      prompt: 'They disagree, and both of them are sure. What would you trust about his speed?',
      explain: 'The camera. It recorded the moment once, and it doesn’t rebuild it. The broken jam proves there was a bump, but not how fast, and her shopping list has nothing to say about it.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    act: 'replay', th: true, spill: 1, sign: 2, screen: 1,
    speaker: 'bun',
    text: 'Oh, look, he was barely moving. So who broke my jam?',
    pace: ['brisk', 'even'],
    dur: 1.8,
  },
  {
    act: 'rest', th: true, spill: 1, sign: 2, screen: 1,
    quote: {
      id: 'lq-psychology-foundations-2-1',
      text: 'Memory works a little bit more like a Wikipedia page: You can go in there and change it, but so can other people.',
      author: 'Elizabeth Loftus',
      work: 'How Reliable Is Your Memory? (TED talk)',
      era: '2013',
      branchSlugs: ['psychology'],
    },
    dur: 3.0,
  },
  {
    th: true, spill: 1, sign: 2, screen: 1,
    summary: {
      title: 'Why Memory Gets Things Wrong',
      points: [
        'A memory is rebuilt each time you recall it',
        'A question’s words can change what is remembered',
        'Feeling sure is not the same as being right',
      ],
      closing: 'Next time you’re certain you remember something, ask what you could check it against.',
    },
    dur: 2.8,
  },
];
