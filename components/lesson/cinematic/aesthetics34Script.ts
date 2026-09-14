import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic aesthetics-aesthetics-34, "When Does a Picture Stop Being Of
// Something?" — the DRAG mechanic (../DragScale) running Picasso's bull in
// reverse under the reader's thumb.
//
// The stage holds one animal drawn in eleven strokes. Dragging right takes strokes
// away, and the readout keeps saying "still a bull" long after the reader expects
// it to stop. That is the whole lesson: they are hunting for a boundary that is not
// there, and they can feel it not being there.
//
// This is also the one drag in the set with NO correct middle. The right answer is
// that the picture never stops pointing, so the graded zone is the far end — and
// the explanation names the trap, which is treating a vague boundary as evidence
// that there is nothing to be vague about.
// ─────────────────────────────────────────────────────────────────────────────

export interface Aesthetics34Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** How much has been stripped away, 0 (all eleven strokes) … 1 (three left). */ strip?: number;
  /** 1 = the two-way / one-way arrows are drawn beside the picture. */ arrows?: number;
  /** 1 = the reader is driving the stripping from the rail (Q1). */ live?: number;
}

export const BEATS: Aesthetics34Beat[] = [
  {
    p: 25, x: 50, strip: 0,
    text: 'Consider a bull drawn in eleven strokes. Anyone can recognise the animal without being told what it is.',
    dur: 3.4,
  },
  {
    p: 433, x: 50, strip: 0, arrows: 1,
    text: 'What makes this a picture of a bull? Nelson Goodman argues that resemblance is not enough, since twins look alike and neither pictures the other.',
    cite: 'Resemblance is symmetrical',
    dur: 4.8,
  },
  {
    p: 19, x: 50, strip: 0.5,
    text: 'Now suppose the strokes are removed one by one. Between 1945 and 1946, Pablo Picasso reworked one lithograph of a bull through eleven stages, each simpler than the last.',
    cite: 'Picasso, 1945 to 1946',
    dur: 4.6,
  },
  {
    p: 380, x: 50, strip: 1,
    text: 'The final stage is a few lines, yet still unmistakably a bull. If more strokes were removed, no one could say which stage would first fail to depict a bull.',
    cite: 'The eleventh stage',
    dur: 4.8,
  },
  {
    p: 139, x: 50, strip: 1,
    quote: {
      id: 'lq-aesthetics-aesthetics-34-1',
      text: 'Denotation is the core of representation and is independent of resemblance.',
      author: 'Nelson Goodman',
      philosopherId: 'nelson-goodman',
      work: 'Languages of Art',
      era: '1968',
      branchSlugs: ['aesthetics'],
    },
    dur: 3.6,
  },
  {
    p: 467, x: 50, strip: 0, live: 1,
    interact: {
      prompt: 'As strokes are removed, where does the picture stop depicting a bull?',
      drag: {
        lo: 'ELEVEN STROKES',
        hi: 'THREE STROKES',
        start: 0,
        zones: [
          { id: 'full', upto: 0.34, reads: 'clearly a picture of a bull' },
          { id: 'thin', upto: 0.68, reads: 'still a picture of a bull' },
          { id: 'end', upto: 1, reads: 'a bull, even with three strokes', correct: true },
        ],
      },
      explain: 'A bull, even with three strokes. Removing one more stroke never marks a clear point where depiction ends. The boundary is vague, like the boundary of a heap in the sorites paradox.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 35, x: 50, strip: 0.75,
    text: 'So convention and context do most of the work. You’ve learned the usual way to draw a bull, and three lines are enough to recognise the animal.',
    cite: 'What the viewer supplies',
    dur: 4.8,
  },
  {
    p: 447, x: 50, strip: 0.75,
    interact: {
      prompt: 'If depiction has no exact boundary, is whether a picture depicts a bull a matter of opinion?',
      cards: [
        { text: 'No, vague boundaries are still real', correct: true },
        { text: 'Yes, no fact settles it', correct: false },
      ],
      explain: 'Vague boundaries are still real. No exact grain makes a heap, yet heaps exist. Lacking a sharp line isn’t lacking a fact. The first stage depicts a bull, and so does the eleventh.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Depiction and Vague Boundaries',
      points: [
        'Resemblance is symmetrical, but depiction is not',
        'Convention and context do much of the work',
        'No stage of simplification marks where depiction ends',
        'A vague boundary is still a real boundary',
      ],
      closing: 'A few strokes can still depict a bull. For Goodman, what makes them depict it is convention, not resemblance.',
    },
    dur: 3.0,
  },
];
