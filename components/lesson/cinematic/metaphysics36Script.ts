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
    p: 25, x: 54, hotel: 1,
    text: 'A hotel with endless rooms, and tonight every single one is taken. Then somebody walks in wanting a bed.',
    dur: 3.8,
  },
  {
    p: 4, x: 54, hotel: 1, live_d: 1, live: 1,
    interact: {
      prompt: 'Slide to how many the clerk can still take in.',
      drag: {
        lo: 'NOT ONE',
        hi: 'ENDLESSLY MANY',
        start: 0,
        zones: [
          { id: 'none', upto: 0.26, reads: 'full is full' },
          { id: 'one', upto: 0.6, reads: 'one, if everybody moves' },
          { id: 'all', upto: 1, reads: 'as many as turn up', correct: true },
        ],
      },
      explain: 'Watch what happened as you slid. Every guest walked one door to the right and room 1 opened, with nobody left outside. Slide further and they double their room numbers instead, and every odd door opens at once. Full stopped meaning no room.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 13, x: 54, hotel: 1, shift: 1,
    text: 'That is the whole proof. Room 1 goes to room 2, room 2 to room 3, on forever.',
    dur: 3,
  },
  {
    p: 13, x: 54, hotel: 1, shift: 1,
    text: 'Nobody is homeless and room 1 is empty.',
    dur: 1.8,
  },
  {
    p: 21, x: 54, hotel: 1, shift: 1,
    text: 'It works because there is no last room to fall off the end of. Try it in a hotel with a hundred rooms and guest one hundred is out on the street.',
    dur: 4.8,
  },
  {
    p: 47, x: 54, hotel: 1, shift: 1,
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
    p: 2, x: 54, hotel: 1, dbl: 1, live: 1,
    interact: {
      prompt: 'Now an endless coach arrives. Everyone doubles their room number. Tap a free door.',
      explain: 'Any odd one. They all opened, in one instruction, and there are as many of them as there were rooms to begin with. A part of the hotel has been matched exactly against the whole of it, which is what being infinite means.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 405, x: 128, hotel: 1, dbl: 1,
    text: 'Nothing here is an error. A part can be paired off one to one with the whole, and only an endless collection can do that.',
    dur: 4.4,
  },
  {
    p: 159, x: 128, hotel: 1, dbl: 1,
    text: 'Which is why some argue no real thing could work like this. The maths is fine.',
    cite: 'Craig, on the impossibility of an actual infinite',
    dur: 3,
  },
  {
    p: 159, x: 128, hotel: 1, dbl: 1,
    text: 'Whether anything buildable behaves this way is a different question.',
    dur: 1.8,
  },
  {
    summary: {
      title: 'When Counting Stops Working',
      points: [
        'A full endless hotel still takes a guest',
        'Doubling every number frees endlessly many',
        'A part matches the whole, one to one',
        'Consistent is not the same as buildable',
      ],
      closing: 'The discomfort is real. It is arithmetic built for finite things, complaining about a place with no last room.',
    },
    dur: 3.2,
  },
];
