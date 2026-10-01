import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic history-foundations-2, "How Historians Know" — the second lesson on the
// History & Politics road, and a DIALOGUE lesson (LESSON_RULES group AP).
// Theme: AN ATTIC UNDER THE ROOF, A HATBOX OF OLD LETTERS, AND A BOOK WITH A HERO IN IT.
//
// Three people talk, and nobody narrates. The woman with the bun has found a book that
// makes her great-grandad a war hero, and could not be prouder; the plain mascot has
// found his own letter in a hatbox, which tells a smaller story; the historian (the top
// hat) shows how the two are weighed, and what settles it.
//
// A FOUNDATION LESSON (AP3), three ideas and no more: a primary source is made at the
// time by someone who was there, a secondary source later from other sources · ask when,
// by whom and why a source was made · when sources disagree, look for another from the
// time.
//
// Every line is written for the ear (groups AC/AD), from its speaker's character
// (cast.ts, AP14), and read in that speaker's voice at the pace its words ask for
// (AP17): its pauses come from its punctuation.
// ─────────────────────────────────────────────────────────────────────────────

export interface Hist2Beat extends BaseBeat {
  /**
   * What happens across this beat's line (the scene choreographs it):
   * boast — she holds the book open at a picture of a castle, beaming ·
   * letter — he lifts a yellowed letter out of the hatbox and reads it out ·
   * arrive — the historian comes up the stairs and in at the attic door, tips his hat and looks from one to the other ·
   * kinds — he opens a hand to the letter as the primary source, then to the book as the secondary, and each is held up as it is named ·
   * printed — she taps the book’s glossy cover, very sure of it ·
   * check — the historian takes the book and the letter across the trunk and sets them on it, either side of the museum leaflet, and looks to the shelf ·
   * paper — the plain mascot draws an old newspaper from the bottom of the hatbox and holds it open ·
   * hero — she peers at the newspaper and claps, delighted all over again ·
   * rest — everyone at ease under the quotation.
   */
  act?: 'boast' | 'letter' | 'arrive' | 'kinds' | 'printed' | 'check' | 'paper' | 'hero' | 'rest';
  /** The historian is on the stage. He climbs in on `arrive`. */
  th?: boolean;
  /** The letter: 0 in the hatbox · 1 out and open. */
  note?: number;
  /** The newspaper: 0 at the bottom of the hatbox · 1 unfolded in his hands. */
  news?: number;
  /** First question on the stage: the letter, the book and the museum leaflet, each with its year, are the things to tap. */
  first?: boolean;
  /** Second question on the stage: the newspaper’s corner, a second copy of the book and the portrait are the things to tap. */
  settle?: boolean;
}

export const BEATS: Hist2Beat[] = [
  {
    act: 'boast', note: 0, news: 0,
    speaker: 'bun',
    text: 'My great-grandad captured a whole castle by himself! It says so, right here in this book.',
    pace: ['brisk', 'even'],
    dur: 1.8,
  },
  {
    act: 'letter', note: 1, news: 0,
    speaker: 'plain',
    text: 'How thrilling. Then why does his own letter say he spent that week peeling potatoes?',
    pace: ['brisk', 'even'],
    dur: 1.8,
  },
  {
    act: 'arrive', th: true, note: 1, news: 0,
    speaker: 'tophat',
    text: 'Two sources, and they disagree. A historian’s first question is when each one was made, and by whom.',
    pace: ['even', 'even'],
    dur: 2.1,
  },
  {
    act: 'kinds', th: true, note: 1, news: 0,
    speaker: 'tophat',
    text: 'A source made at the time, by someone who was there, is a primary source. One written later, from other sources, is a secondary source.',
    pace: ['even', 'even'],
    dur: 2.1,
  },
  {
    th: true, note: 1, news: 0, first: true,
    interact: {
      prompt: 'Which of these three is a primary source for that week?',
      explain: 'The letter. He wrote it himself, that same week. The book and the museum leaflet came decades later, from other sources, so they’re secondary sources.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    act: 'printed', th: true, note: 1, news: 0,
    speaker: 'bun',
    text: 'But the book is printed, with pictures and everything. Printed things are true, aren’t they?',
    pace: ['even', 'brisk'],
    dur: 1.8,
  },
  {
    act: 'check', th: true, note: 1, news: 0,
    speaker: 'tophat',
    text: 'Printed isn’t the same as checked. When two sources disagree, a historian looks for a third from the time, to see which story it backs.',
    pace: ['even', 'even'],
    dur: 2.1,
  },
  {
    th: true, note: 1, news: 0, settle: true,
    interact: {
      prompt: 'His letter and the book disagree. What in the attic would help most to settle it?',
      explain: 'The newspaper from that week. It’s a third source from the time, so it can back one story or the other. A second copy of the book only repeats the book.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    act: 'paper', th: true, note: 1, news: 1,
    speaker: 'plain',
    text: 'The local paper from that very week is in the box too. No castles, I’m afraid, but a great many potatoes.',
    pace: ['even', 'brisk'],
    dur: 1.8,
  },
  {
    act: 'hero', th: true, note: 1, news: 1,
    speaker: 'bun',
    text: 'So he fed the whole regiment! That makes me even prouder.',
    pace: ['brisk', 'even'],
    dur: 1.8,
  },
  {
    act: 'rest', th: true, note: 1, news: 1,
    quote: {
      id: 'lq-history-foundations-2-1',
      text: 'To such high offices this work does not aspire: it wants only to show what actually happened.',
      author: 'Leopold von Ranke',
      work: 'Histories of the Latin and Germanic Peoples',
      era: '1824',
      branchSlugs: ['history'],
    },
    dur: 3.0,
  },
  {
    th: true, note: 1, news: 1,
    summary: {
      title: 'How Historians Know',
      points: [
        'A primary source was made at the time',
        'A secondary source was written later, from others',
        'When sources disagree, find another from the time',
      ],
      closing: 'Next time you hear a family story, ask what was written down when it happened.',
    },
    dur: 2.8,
  },
];
