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
    text: 'A bull, drawn properly. Eleven strokes, and nobody has to be told what it is.',
    dur: 3.4,
  },
  {
    p: 47, x: 50, strip: 0, arrows: 1,
    text: 'First notice what makes it a picture OF a bull. Not resemblance — two twins resemble each other and neither is a picture of the other.',
    cite: 'Resemblance runs both ways',
    dur: 4.8,
  },
  {
    p: 19, x: 50, strip: 0.5,
    text: 'Now take strokes away. Picasso did this in 1945, eleven plates of the same animal, each one with less in it than the last.',
    cite: 'Picasso, 1945',
    dur: 4.6,
  },
  {
    p: 4, x: 50, strip: 1,
    text: 'And the final plate is a handful of lines that is still unmistakably a bull. Nobody can say which plate would have been the first one that was not.',
    cite: 'The eleventh plate',
    dur: 4.8,
  },
  {
    p: 137, x: 50, strip: 1,
    quote: {
      id: 'lq-aesthetics-aesthetics-34-1',
      text: 'Denotation is the core of representation and is independent of resemblance.',
      author: 'Nelson Goodman',
      work: 'Languages of Art',
      era: '1968',
      branchSlugs: ['aesthetics'],
    },
    dur: 3.6,
  },
  {
    p: 4, x: 50, strip: 0, live: 1,
    interact: {
      prompt: 'Take strokes away. Stop at the first picture that is no longer of a bull.',
      drag: {
        lo: 'ELEVEN STROKES',
        hi: 'THREE STROKES',
        start: 0,
        zones: [
          { id: 'full', upto: 0.34, reads: 'plainly a bull' },
          { id: 'thin', upto: 0.68, reads: 'still a bull' },
          { id: 'end', upto: 1, reads: 'somehow still a bull', correct: true },
        ],
      },
      explain: 'You can go to the end of the rail and it never stops pointing. That is not a trick. It is what a vague boundary looks like from the inside. Hunting for the exact stroke is like hunting for the grain that ends a heap.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 35, x: 50, strip: 0.75,
    text: 'So convention and context do most of the work. You have been taught how a bull is drawn, and three lines are enough to hand you the rest.',
    cite: 'What you bring to it',
    dur: 4.8,
  },
  {
    p: 45, x: 50, strip: 0.75,
    interact: {
      prompt: 'No exact line where it stops. So is depicting just personal opinion?',
      cards: [
        { text: 'No, vague is not unreal', correct: true },
        { text: 'Yes, there is no fact', correct: false },
      ],
      explain: 'The trap is reading a fuzzy border as no border at all. There is no exact grain where a heap begins either, and heaps are perfectly real. The first plate is a bull and so is the eleventh. The trouble is only in saying where the edge went.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Where The Bull Went',
      points: [
        'Resemblance is mutual; depiction points one way',
        'Convention and context do much of the work',
        'Simplification has no exact breaking point',
        'Vague does not mean unreal',
      ],
      closing: 'You can strip a picture almost to nothing and it still points. What keeps pointing is the open question.',
    },
    dur: 3.0,
  },
];
