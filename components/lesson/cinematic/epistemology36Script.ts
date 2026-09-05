import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic epistemology-knowledge-36, "Are You the Expert on You?"
// Theme: FOUR IDENTICAL THINGS ON A COUNTER, AND A REASON THAT ARRIVES LATE.
//
// The four pairs are drawn IDENTICALLY, from one set of numbers, so the reader
// cannot find a difference because there is none in the file either. That is the
// experiment's whole design and it should be true of the picture too (A1).
//
// The confabulation is staged as two labels that do not match: the REAL CAUSE
// rises from under the counter (position) while the GIVEN REASON appears beside
// the shopper's head (knit, sheerness). Both are drawn; neither is called a lie.
//
// GAMIFIED SHAPE:
//   · beat 2  a SCENE TARGET — tap the pair you would take. Four options, all
//     identical, and the tap is scored on the rightmost because that is what
//     four in five shoppers did. The reader usually gets it right and cannot
//     say why, which is the lesson happening to them before it is explained.
//   · beat 7  two CARDS — how much of self-knowledge this actually threatens.
// ─────────────────────────────────────────────────────────────────────────────

export interface Epistemology36Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the counter and its four pairs are drawn. */ shelf?: number;
  /** 1 = the given reason is shown beside the head. */ given?: number;
  /** 1 = the real cause is shown under the counter. */ real?: number;
  /** 1 = the two labels are shown side by side, refusing to match. */ clash?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Epistemology36Beat[] = [
  {
    p: 164, x: 56, shelf: 1,
    text: 'A counter with four pairs of stockings laid out. All four pairs are identical.',
    dur: 2.8,
  },
  {
    p: 164, x: 56, shelf: 1,
    text: 'Nobody buying is told so.',
    dur: 1.8,
  },
  {
    p: 4, x: 56, shelf: 1, live: 1,
    interact: {
      prompt: 'Pick one. There is no wrong pair — take whichever you want.',
      explain: 'You took the one on the right, and so did four shoppers in five. Nothing about it is better. It was last in line, and last is what a hand reaches for after looking at all four.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 13, x: 56, shelf: 1, given: 1,
    text: 'Now the interesting part. Every shopper had a reason ready.',
    dur: 2.5,
  },
  {
    p: 13, x: 56, shelf: 1, given: 1,
    text: 'Better knit. Finer weave.',
    dur: 1.8,
  },
  {
    p: 13, x: 56, shelf: 1, given: 1,
    text: 'Nicer feel.',
    dur: 1.8,
  },
  {
    p: 176, x: 56, shelf: 1, given: 1, real: 1,
    text: 'The cause was position on the counter. Told as much, the shoppers said no.',
    dur: 2.4,
  },
  {
    p: 176, x: 56, shelf: 1, given: 1, real: 1,
    text: 'Not defensively, not caught out. The reason was simply invisible from the inside.',
    dur: 2.2,
  },
  {
    p: 47, x: 56, shelf: 1, given: 1, real: 1, clash: 1,
    quote: {
      id: 'lq-epistemology-knowledge-36-1',
      text: 'People may have little ability to report accurately on their own cognitive processes.',
      author: 'Richard Nisbett',
      work: 'Telling More Than We Can Know',
      era: '1977',
      branchSlugs: ['epistemology'],
    },
    dur: 3.6,
  },
  {
    p: 167, x: 56, shelf: 1, given: 1, real: 1, clash: 1,
    text: 'The shoppers were not lying and were not confused. Each one knew which pair she preferred.',
    dur: 2.6,
  },
  {
    p: 400, x: 56, shelf: 1, given: 1, real: 1, clash: 1,
    text: 'The reason for the preference was the part nobody could see.',
    dur: 1.8,
  },
  {
    p: 12, x: 128, shelf: 1, clash: 1,
    text: 'So the gap fills itself, with the only material lying about: the stockings. A reason is built, and it arrives feeling like a memory.',
    dur: 4.6,
  },
  {
    p: 45, x: 128, shelf: 1, clash: 1,
    interact: {
      prompt: 'What does the experiment actually take?',
      split: {
        left: 'WHY YOU DID IT', right: 'WHAT YOU FEEL',
        start: 0.04,
        zones: [
          { id: 'feel', upto: 0.3, reads: 'it takes the feelings and leaves the reasons standing' },
          { id: 'both', upto: 0.66, reads: 'it takes about half of each' },
          { id: 'why', upto: 1, reads: 'it takes the reasons and leaves the feelings alone', correct: true },
        ],
      },
      explain: 'Nearly all of it lands on the why. Being in pain and knowing it is untouched by any of this. What goes is the confident account of why you did something — a report about hidden machinery, delivered in the voice of a report about a feeling.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Story You Tell',
      points: [
        'Good access to what you feel',
        'Poor access to what caused it',
        'The gap fills with a plausible story',
        'The story arrives feeling like a memory',
      ],
      closing: 'The unsettling part is not the mistake. Being wrong felt exactly like being right, and that leaves a reader nothing to watch out for.',
    },
    dur: 3.2,
  },
];
