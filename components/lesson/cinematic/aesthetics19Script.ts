import type { BaseBeat } from './cinematicKit';

// Cinematic aesthetics-aesthetics-19, "The Beauty You Walk Past".
//
// THE PICTURE: an empty frame that slides along a row of perfectly ordinary things.
// Whatever is inside it acquires a label and gets looked at. Then the frame stops
// on the marsh, does not move again, and a card of ecological knowledge slides in
// underneath — and the verdict changes without the frame or the marsh changing at
// all. Carlson's claim is that knowing is what does the work, and the frame is
// there so the reader can watch it NOT be the frame.
//
// Q1 is A/B/C/D; Q2 is answered on the stage (E34, H65).

export interface Aes19Beat extends BaseBeat {
  /** Figure gesture (emote code). */ p?: number;
  /** Where the figure stands (stage x). */ x?: number;
  /** The row of ordinary things is drawn, 0..1. */ row?: number;
  /** Which item the frame sits on: 0 none · 1 drain · 2 puddle · 3 marsh. */ frame?: number;
  /** The verdict under the frame: 0 none · 1 UGLY · 2 the informed reading. */ verdict?: number;
  /** 1 = the ecology card has slid in. */ know?: number;
  /** 1 = the three answer cards are live (Q2). */ pick?: number;
}

export const BEATS: Aes19Beat[] = [
  {
    p: 25, x: 70,
    text: 'Aesthetics has spent most of its life indoors, looking at things in frames. Take the frame outside and point it at whatever is actually there.',
    dur: 4.6,
  },
  {
    p: 41, x: 168, row: 1, frame: 1,
    text: 'A drainpipe. Nobody hung it and nobody signed it, and still the pipe has a shape, a rhythm and a set of stains. Put a frame round the pipe and you will look at it properly for the first time.',
    cite: 'A drainpipe',
    dur: 5.2,
  },
  {
    p: 13, x: 124, row: 1, frame: 3, verdict: 1,
    text: 'Now a marsh. Flat, buggy, no view. A passerby glances and files it under ugly, and the glance is the whole of their appreciation.',
    cite: 'A marsh',
    dur: 4.6,
  },
  {
    p: 141, x: 124, row: 1, frame: 3, verdict: 1,
    quote: {
      id: 'lq-aesthetics-aesthetics-19-1',
      text: 'We must appreciate nature for what it is and as having the qualities that it has; natural history plays the role art history plays for art.',
      author: 'Allen Carlson',
      work: 'Aesthetics and the Environment',
      era: '2000',
      branchSlugs: ['aesthetics'],
    },
    dur: 4.0,
  },
  {
    p: 36, x: 168, row: 1, frame: 3, verdict: 2, know: 1,
    text: 'So bring the natural history. Nursery, filter, flood defence, one of the densest habitats there is. The frame has not moved and the marsh has not moved. The verdict has.',
    cite: 'Knowing it',
    dur: 5.2,
  },
  {
    p: 4, x: 124, row: 1, frame: 3, verdict: 2, know: 1,
    interact: {
      prompt: 'Carlson says a pretty glance is enough for nature, since it is only scenery. True?',
      cards: [
        { text: 'False, knowledge guides appreciation', correct: true },
        { text: 'True, it is only scenery', correct: false },
      ],
      explain: 'The trap is the scenery picture, where not knowing counts as not needing to know. Carlson says natural history does for a marsh what art history does for a painting: it tells you what you are looking at.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 6, x: 124, row: 1, frame: 3, verdict: 2, know: 1, pick: 1,
    interact: {
      prompt: 'The frame never moved. Tap what actually changed the verdict.',
      explain: 'Knowing what it is. The frame only decides where you point; it cannot tell you what is in front of you, and on Carlson\'s view that is the part appreciation was waiting on.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'What You Now Know',
      points: [
        'Aesthetics reaches past art into nature and daily life',
        'Carlson: knowing nature shapes appreciating it',
        'The pretty-glance view treats nature as scenery',
        'A frame points; it does not inform',
      ],
      closing: 'You have walked past the same marsh a hundred times. Nothing about it was hiding.',
    },
    dur: 3.0,
  },
];
