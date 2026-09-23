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
      prompt: 'As strokes come away, which shape does the bull take?',
      plot: {
        cols: ['ALL OF THEM', 'HALF', 'THREE STROKES'],
        axis: 'STILL A BULL',
        start: [0.9, 0.9, 0.9],
        shapes: [
          { id: 'hold', profile: [1, 0.98, 0.95, 0.9, 0.85], reads: 'it holds almost to the end', correct: true },
          { id: 'drop', profile: [1, 0.72, 0.42, 0.18, 0.05], reads: 'it fades as the strokes go' },
          { id: 'cliff', profile: [1, 1, 1, 0.5, 0], reads: 'it holds, then vanishes at once' },
        ],
      },
      explain: 'It holds almost to the end. Picasso\'s series keeps the back, the horn and the head while everything else goes, and the last plates are still unmistakably a bull. What depicting needs turns out to be far less than what was there to begin with.',
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
