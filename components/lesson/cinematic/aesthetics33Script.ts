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
    p: 462, x: 52, clean: 0,
    text: 'Consider a painting four hundred years old, never cleaned. The surface has darkened, and the details are hard to make out.',
    dur: 3.8,
  },
  {
    p: 394, x: 52, clean: 0, layers: 1,
    text: 'The surface is a stack of layers. Paint lies at the bottom, then the painter’s thin glaze, then varnish, then centuries of smoke and dust.',
    cite: 'The layers on the canvas',
    dur: 4.6,
  },
  {
    p: 384, x: 52, clean: 0.4, layers: 1,
    text: 'Removing the dirt is uncontroversial. Dirt isn’t part of the work, because the painter didn’t put it there.',
    cite: 'The uncontested layer',
    dur: 4.4,
  },
  {
    p: 467, x: 52, clean: 0.85, layers: 1,
    text: 'Beyond the dirt, restorers disagree. In the 1980s, cleaning the Sistine Chapel ceiling revealed bright pinks and greens.',
    cite: 'The Sistine ceiling',
    dur: 2.8,
  },
  {
    p: 467, x: 52, clean: 0.85, layers: 1,
    text: 'James Beck, an art historian, argued that Michelangelo’s own final glazes had been removed. The restorers answered that the dark layer was soot and wax from candles.',
    dur: 2.4,
  },
  {
    p: 144, x: 52, clean: 0.85,
    quote: {
      id: 'lq-aesthetics-aesthetics-33-1',
      text: 'It must stop at the point where conjecture begins.',
      author: 'Venice Charter',
      work: 'Article 9',
      era: '1964',
      branchSlugs: ['aesthetics'],
    },
    dur: 3.6,
  },
  {
    p: 380, x: 52, clean: 0, live: 1,
    interact: {
      prompt: 'How far down through the layers should a restorer clean?',
      drag: {
        lo: 'AS IT HANGS',
        hi: 'BARE CANVAS',
        start: 0,
        zones: [
          { id: 'dirt', upto: 0.34, reads: 'removing only the dirt' },
          { id: 'edge', upto: 0.68, reads: 'to the point where conjecture begins', correct: true },
          { id: 'gone', upto: 1, reads: 'removing the painter’s own layers' },
        ],
      },
      explain: 'To the point where conjecture begins. No one defends leaving the soot or removing the paint, so the dispute concerns the layers between. The reason to stop is not taste. A removed layer can’t be put back.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 35, x: 52, clean: 0.55, layers: 1,
    text: 'The rule “return it to the original” doesn’t settle the question. Nothing shows which layer the painter put on last.',
    cite: 'Which state is original?',
    dur: 4.8,
  },
  {
    p: 447, x: 52, clean: 0.55, layers: 1,
    interact: {
      prompt: 'Suppose a restorer removes a layer not proved to be later. What is the main objection?',
      cards: [
        { text: 'A conjecture that can’t be undone', correct: true },
        { text: 'The painting loses market value', correct: false },
      ],
      explain: 'A conjecture that can’t be undone. A wrong opinion in a book can be fixed next year. A removed layer can’t be put back, so every later viewer inherits the conjecture. Price is not the issue.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Where Cleaning Should Stop',
      points: [
        'There is no single original state to return to',
        'Grime, varnish and glaze are hard to tell apart',
        'Cleaning cannot be undone, so error is permanent',
        'Restoration should stop where conjecture begins',
      ],
      closing: 'Every old painting on display reflects restorers’ decisions about which layers belong to the work.',
    },
    dur: 3.0,
  },
];
