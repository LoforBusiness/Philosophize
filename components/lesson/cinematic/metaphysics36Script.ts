import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic metaphysics-being-36, "The Hotel That Is Always Full"
// Theme: SIXTEEN DOORS, ALL TAKEN, AND EVERYBODY MOVES ONE TO THE RIGHT.
//
// The proof is a movement, so the scene plays it rather than stating it. Every
// guest shifts a room and the first door opens — the reader watches a vacancy
// appear in a building that was full a second ago, which is the entire argument
// and takes about a second to be convinced by.
//
// The second move is the coach: guests go to DOUBLE their room number, and every
// odd door opens at once. Same trick, harder, and it lands because the reader has
// already accepted the easy one.
//
// GAMIFIED SHAPE, and it inverts round one's order:
//   · beat 2  a DRAG — how many new guests can a full hotel take? The readout
//     runs one → a coachload → endlessly many, and the doors open as it slides,
//     so the reader is running the proof with their thumb.
//   · beat 6  a SCENE TARGET — after the doubling, tap a door that is now free.
//     Every odd door is a right answer, which is the point: there is not ONE
//     vacancy, there are infinitely many, and the reader can pick any of them.
// ─────────────────────────────────────────────────────────────────────────────

export interface Metaphysics36Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the hotel front is drawn. */ hotel?: number;
  /** How far every guest has shifted right, in rooms: 0 none, 1 one room. */ shift?: number;
  /** 1 = guests have gone to DOUBLE their room number instead. */ dbl?: number;
  /** 1 = the reader's thumb is driving the shift. */ live_d?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Metaphysics36Beat[] = [
  {
    p: 379, x: 54, hotel: 1,
    text: 'Consider a hotel with infinitely many rooms, all occupied. A new guest arrives and asks for a room.',
    dur: 3.8,
  },
  {
    p: 461, x: 54, hotel: 1, live_d: 1, live: 1,
    interact: {
      prompt: 'How many new guests can the full hotel still accommodate?',
      drag: {
        lo: 'NOT ONE',
        hi: 'INFINITELY MANY',
        start: 0,
        zones: [
          { id: 'none', upto: 0.26, reads: 'none, since every room is taken' },
          { id: 'one', upto: 0.6, reads: 'one, if every guest moves along' },
          { id: 'all', upto: 1, reads: 'infinitely many new guests', correct: true },
        ],
      },
      explain: 'Infinitely many new guests. Each guest moves to the next room, which frees room one. If every guest doubles their room number instead, every odd-numbered room is freed. So a full infinite hotel can take in infinitely many more.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 13, x: 54, hotel: 1, shift: 1,
    text: 'The proof for one guest is simple. The guest in room one moves to room two, the guest in room two to room three, and so on.',
    dur: 3,
  },
  {
    p: 266, x: 54, hotel: 1, shift: 1,
    text: 'Every guest still has a room, and room one is now empty.',
    dur: 1.8,
  },
  {
    p: 380, x: 54, hotel: 1, shift: 1,
    text: 'The move works only because there’s no last room. In a hotel of a hundred rooms, the guest in room one hundred would have nowhere to go.',
    dur: 4.8,
  },
  {
    p: 385, x: 54, hotel: 1, shift: 1,
    quote: {
      id: 'lq-metaphysics-being-36-1',
      text: 'The infinite is nowhere to be found in reality. It is an idea of reason.',
      author: 'David Hilbert',
      work: 'Über das Unendliche',
      era: '1925',
      branchSlugs: ['metaphysics'],
    },
    dur: 3.6,
  },
  {
    p: 384, x: 54, hotel: 1, dbl: 1, live: 1,
    interact: {
      prompt: 'An infinite coach arrives, and each current guest moves to double their room number. Which rooms are free?',
      explain: 'Any odd-numbered room. One instruction frees all of them, and there are as many odd rooms as there were rooms at the start. A part can be matched one to one with the whole, which marks an infinite set.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 405, x: 128, hotel: 1, dbl: 1,
    text: 'The mathematics is consistent. Only an endless collection can be paired one to one with a proper part of itself.',
    dur: 4.4,
  },
  {
    p: 463, x: 128, hotel: 1, dbl: 1,
    text: 'William Lane Craig argues that such a hotel shows an actual infinite can’t exist in reality.',
    cite: 'Craig on actual infinites',
    dur: 3,
  },
  {
    p: 463, x: 128, hotel: 1, dbl: 1,
    text: 'Whether any real collection behaves this way is a separate question from whether the mathematics is consistent.',
    dur: 1.8,
  },
  {
    summary: {
      title: 'Hilbert’s Hotel',
      points: [
        'A full infinite hotel can still take a new guest',
        'Doubling every room number frees infinitely many rooms',
        'An infinite set matches a part of itself one to one',
        'Mathematical consistency doesn’t show physical possibility',
      ],
      closing: 'The paradox feels troubling because a sense of size comes from finite sets. Infinite sets follow different rules.',
    },
    dur: 3.2,
  },
];
