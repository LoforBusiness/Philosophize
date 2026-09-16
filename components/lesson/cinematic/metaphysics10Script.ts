import type { BaseBeat } from './cinematicKit';

// Cinematic metaphysics-being-10, "Where Does 'Redness' Live?" — universals and
// particulars, staged as a shelf and one card that will not settle.
//
// THE ONE PICTURE (H64): three particular red things stand on a shelf — a rose, a
// ruby, a flag — and a single card reading REDNESS has to go SOMEWHERE. Over the
// lesson the card tries three homes, and each move is a philosophical position:
// up into a framed slot of its own above everything (Plato), split into three
// small tags pinned onto the objects (Aristotle), or hung on a pair of strings off
// under the shelf where it touches nothing at all (the nominalist). Nothing else
// on stage changes. The card's address IS the argument.
//
// Q1 is the nuanced one and lives in the deck (E34): realism does not entail
// Plato's realm. Q2 is the one the picture can put directly (H65) — the three
// homes are the three tap targets, and the reader puts the card where a
// nominalist would.

export interface Metaphysics10Beat extends BaseBeat {
  /** Figure gesture (emote code). */ p?: number;
  /** Where the figure stands (stage x). 64 = downstage left, 124 = beside the shelf. */ x?: number;
  /** The empty framed slot high above the shelf — Plato's realm — is drawn. */ frame?: number;
  /** Where the REDNESS card is: 0 gone · 1 unplaced in open air · 2 up in the frame · 3 hanging on the strings. */ card?: number;
  /** Three small RED tags pinned onto the rose, the ruby and the flag (Aristotle). */ tags?: number;
  /** The two bare tag-strings hanging under the shelf — the nominalist's peg. */ str?: number;
  /** 1 = the three candidate homes are live as answer targets (Q2). */ slots?: number;
}

export const BEATS: Metaphysics10Beat[] = [
  {
    p: 13, x: 64,
    text: 'A rose, a ruby and a flag differ in almost every respect. Yet all three share one feature: they are red.',
    dur: 2.9,
  },
  {
    p: 266, x: 64,
    text: 'Philosophers call a feature that many things share a universal. What, then, is redness, and where does it exist?',
    dur: 1.8,
  },
  {
    p: 47, x: 124, card: 1,
    text: 'Treat the shared feature as a single item, redness. This is the problem of universals: how one thing can be in many.',
    cite: 'The problem of universals',
    dur: 3.5,
  },
  {
    p: 267, x: 124, card: 1,
    text: 'The competing theories differ over where such an item exists, if it exists at all.',
    dur: 1.8,
  },
  {
    p: 406, x: 124, frame: 1, card: 2,
    text: 'On Plato’s theory, redness would be a Form, existing apart from every red thing. The perfect Red would exist even if nothing were red.',
    cite: 'Plato’s Forms',
    dur: 4.8,
  },
  {
    p: 5, x: 124, tags: 1,
    text: 'Aristotle held that universals are real, but exist only in the particular things that have them.',
    cite: 'Aristotle · in the things',
    dur: 4,
  },
  {
    p: 259, x: 124, tags: 1,
    text: 'On this view, if no red objects existed, redness wouldn’t exist either.',
    dur: 1.8,
  },
  {
    p: 129, x: 124, tags: 1,
    quote: {
      id: 'lq-metaphysics-being-10-1',
      text: 'The universal is common, since that is called universal which is such as to belong to more than one thing.',
      author: 'Aristotle',
      philosopherId: 'aristotle',
      work: 'Metaphysics, Book VII',
      era: 'c. 350 BCE',
      branchSlugs: ['metaphysics'],
    },
    dur: 3.6,
  },
  {
    p: 8, x: 124, str: 1, card: 3,
    text: 'Nominalists deny that there are universals. For them, “red” is a word applied to things that resemble each other.',
    cite: 'The nominalist',
    dur: 3.9,
  },
  {
    p: 258, x: 124, str: 1, card: 3,
    text: 'On this view, there’s no further item called redness, in the red things or above them.',
    dur: 1.8,
  },
  {
    p: 457, x: 124, frame: 1, str: 1,
    interact: {
      prompt: 'If redness can’t exist apart from red things, where does it exist?',
      drag: {
        lo: 'ONLY A WORD',
        hi: 'IN ITS OWN REALM',
        start: 1,
        zones: [
          { id: 'word', upto: 0.28, reads: 'nothing shared, only a name' },
          { id: 'things', upto: 0.72, reads: 'real yet only in red things', correct: true },
          { id: 'realm', upto: 1, reads: 'in its own realm, apart from red things' },
        ],
      },
      explain: 'Real yet only in red things. Denying redness a place of its own doesn’t make redness a mere name. Aristotle holds that universals are real, yet exist only in the particulars that have them.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 30, x: 124, str: 1, slots: 1,
    interact: {
      prompt: 'Where would a nominalist place redness?',
      explain: 'Nowhere, just a name. This doesn’t mean the rose isn’t red. A nominalist grants that every red thing is red, and denies only a further item, redness itself. “Red” is a word applied to all of them.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Problem of Universals',
      points: [
        'A universal is one feature shared by many things',
        'Plato: real, and in a realm of its own',
        'Aristotle: real, but only in particular things',
        'Nominalists: only particulars exist, grouped by a name',
      ],
      closing: 'Whenever two things resemble each other, the question arises whether they share a real universal.',
    },
    dur: 3.0,
  },
];
