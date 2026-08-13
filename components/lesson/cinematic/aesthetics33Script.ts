import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic aesthetics-aesthetics-33, "How Much Should You Clean a Painting?" —
// the DRAG mechanic (../DragScale) as a restorer's swab.
//
// One canvas on the wall. Dragging right lifts its layers off one at a time and
// the readout names what has just gone: grime, then varnish, then the glaze the
// painter may or may not have meant to leave. The reader stops it somewhere, and
// wherever they stop is a claim about which object the artwork is.
//
// The graded answer is the middle, and the explanation says why the far end is
// wrong for a reason that has nothing to do with taste: it is irreversible, so a
// guess made there is permanent for everybody who comes after.
// ─────────────────────────────────────────────────────────────────────────────

export interface Aesthetics33Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** How far the cleaning has gone, 0 (untouched) … 1 (down to bare canvas). */ clean?: number;
  /** 1 = the layer stack is labelled beside the canvas. */ layers?: number;
  /** 1 = the reader is driving the swab from the rail (Q1). */ live?: number;
}

export const BEATS: Aesthetics33Beat[] = [
  {
    p: 25, x: 52, clean: 0,
    text: 'A painting four hundred years old, hanging exactly as it came down to us. Dark, and a little hard to read.',
    dur: 3.8,
  },
  {
    p: 47, x: 52, clean: 0, layers: 1,
    text: 'What is actually on it is a stack. Paint at the bottom, then the painter’s glaze, then varnish, then centuries of smoke and dust.',
    cite: 'What is on the canvas',
    dur: 4.6,
  },
  {
    p: 19, x: 52, clean: 0.4, layers: 1,
    text: 'Take the dirt off and nobody objects. It is not part of the work and everyone agrees the painter did not put it there.',
    cite: 'The easy layer',
    dur: 4.4,
  },
  {
    p: 4, x: 52, clean: 0.85, layers: 1,
    text: 'Keep going and the argument starts. When the Sistine ceiling was cleaned, startling pinks came out. Some scholars said a deliberate final glaze had just been scrubbed off for ever.',
    cite: 'The Sistine ceiling',
    dur: 5.2,
  },
  {
    p: 137, x: 52, clean: 0.85,
    quote: {
      id: 'lq-aesthetics-aesthetics-33-1',
      text: 'Restoration should stop at the point where conjecture begins.',
      author: 'Cesare Brandi',
      work: 'Theory of Restoration',
      era: '1963',
      branchSlugs: ['aesthetics'],
    },
    dur: 3.6,
  },
  {
    p: 4, x: 52, clean: 0, live: 1,
    interact: {
      prompt: 'Drag the swab across. Stop where you would put it down.',
      drag: {
        lo: 'AS IT HANGS',
        hi: 'BARE CANVAS',
        start: 0,
        zones: [
          { id: 'dirt', upto: 0.34, reads: 'taking off the dirt' },
          { id: 'edge', upto: 0.68, reads: 'at the edge of guessing', correct: true },
          { id: 'gone', upto: 1, reads: 'taking off the painting' },
        ],
      },
      explain: 'Where the certainty stops. Nobody defends leaving the soot, and nobody defends going through the paint. The whole argument is about the layer in between. The reason to stop there is not taste. It is that you cannot put it back.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 35, x: 52, clean: 0.55, layers: 1,
    text: 'Notice the instruction "just return it to the original" does not help. No layer arrives labelled as the one the painter stopped at.',
    cite: 'No original to return to',
    dur: 4.8,
  },
  {
    p: 45, x: 52, clean: 0.55, layers: 1,
    interact: {
      prompt: 'A restorer removes a layer they cannot prove was later. The real problem?',
      cards: [
        { text: 'A guess made permanent', correct: true },
        { text: 'The painting loses value', correct: false },
      ],
      explain: 'A wrong opinion in a catalogue is corrected next year. A layer taken off a ceiling is a decision every future viewer is stuck with. Including the ones who would have disagreed.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Where To Stop',
      points: [
        'There is no single original state to return to',
        'Grime, varnish and glaze are hard to tell apart',
        'Cleaning cannot be undone, so error is permanent',
        'Brandi: stop where conjecture begins',
      ],
      closing: 'Every old painting you have seen is partly a set of decisions somebody made about what it was.',
    },
    dur: 3.0,
  },
];
