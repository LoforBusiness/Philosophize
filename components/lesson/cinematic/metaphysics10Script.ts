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
    text: 'A rose, a ruby, a flag. Nothing else about them matches — yet all three are red.',
    dur: 2.9,
  },
  {
    p: 13, x: 64,
    text: 'So where is that redness?',
    dur: 1.8,
  },
  {
    p: 47, x: 124, card: 1,
    text: 'Whatever the three things share, give the shared part a card of its own: REDNESS. Now the awkward question.',
    cite: 'The one in the many',
    dur: 3.5,
  },
  {
    p: 47, x: 124, card: 1,
    text: 'Where does the card go?',
    dur: 1.8,
  },
  {
    p: 406, x: 124, frame: 1, card: 2,
    text: 'Plato hung it up here, in a slot of its own. The perfect Red sits above every red thing and needs none of them to exist.',
    cite: 'Plato · a realm of Forms',
    dur: 4.8,
  },
  {
    p: 5, x: 124, tags: 1,
    text: 'Aristotle took it straight back down. Redness is real, he agreed — but it lives pinned in the things themselves.',
    cite: 'Aristotle · in the things',
    dur: 4,
  },
  {
    p: 5, x: 124, tags: 1,
    text: 'No red object, no redness.',
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
    text: 'A third camp shrugs. Nothing is shared at all — “red” is a word we hang beside things that happen to look alike.',
    cite: 'The nominalist',
    dur: 3.9,
  },
  {
    p: 8, x: 124, str: 1, card: 3,
    text: 'It touches none of them.',
    dur: 1.8,
  },
  {
    p: 4, x: 124, frame: 1, str: 1,
    interact: {
      prompt: 'Drag to where Aristotle puts redness.',
      drag: {
        lo: 'ONLY A WORD WE USE',
        hi: 'IN ITS OWN REALM',
        start: 1,
        zones: [
          { id: 'word', upto: 0.28, reads: 'nothing shared, just a label' },
          { id: 'things', upto: 0.72, reads: 'fully real, and only ever inside a red thing', correct: true },
          { id: 'realm', upto: 1, reads: 'in its own realm, above red things' },
        ],
      },
      explain: 'The middle, and the two ends are the views he is between. Aristotle keeps universals real, so the first zone is not his. But he takes redness off the wall and pins it to the things: fully real, never free of some red object.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 30, x: 124, str: 1, slots: 1,
    interact: {
      prompt: 'Tap the home a nominalist would give the card.',
      explain: 'The trap: hearing “nowhere” as “the rose is not really red”. It is not that. A nominalist grants every red thing its colour and denies only the extra item, redness itself — the card is a word we hang beside them.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Many and the One',
      points: [
        'A universal is one feature found in many',
        'Plato: real, and in a realm of its own',
        'Aristotle: real, but only inside the things',
        'Nominalists: only particulars, plus a handy name',
      ],
      closing: 'Next time two things strike you as alike, ask what exactly you have found.',
    },
    dur: 3.0,
  },
];
