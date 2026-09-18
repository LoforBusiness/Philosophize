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
  /** 1 = a small stain mark appears inside the framed item — the quality attention finds. */ detail?: number;
  /** 1 = a strike lands across the verdict plate — the landscape model's reading, rejected. */ reject?: number;
  /** 1 = a small "unchanged" mark pins itself to the frame — it has not moved. */ same?: number;
}

export const BEATS: Aes19Beat[] = [
  {
    p: 379, x: 70,
    text: 'Aesthetics has long studied art. In 1966, Ronald Hepburn argued that it had neglected the beauty of nature.',
    dur: 4.6,
  },
  {
    p: 270, x: 168, row: 1, frame: 1,
    text: 'Consider a drainpipe. No one made it as art, yet it has a shape, a rhythm and a pattern of stains.',
    cite: 'A drainpipe',
    dur: 3,
  },
  {
    p: 270, x: 168, row: 1, frame: 1, detail: 1,
    text: 'Framing an object directs aesthetic attention to qualities that everyday use passes over.',
    dur: 2.2,
  },
  {
    p: 13, x: 124, row: 1, frame: 3, verdict: 1,
    text: 'Now consider a marsh. It’s flat, full of insects, and offers no scenic view.',
    cite: 'A marsh',
    dur: 1.8,
  },
  {
    p: 266, x: 124, row: 1, frame: 3, verdict: 1, reject: 1,
    text: 'Seen only as scenery, the marsh looks ugly. Allen Carlson calls this way of looking the landscape model, and rejects it.',
    dur: 3.3,
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
    p: 269, x: 168, row: 1, frame: 3, verdict: 2, know: 1,
    text: 'Carlson brings in natural history instead. A marsh is a nursery, a water filter and a flood defence.',
    cite: 'Natural history',
    dur: 2.8,
  },
  {
    p: 269, x: 168, row: 1, frame: 3, verdict: 2, know: 1, same: 1,
    text: 'Neither the frame nor the marsh has changed, yet the verdict on the marsh has.',
    dur: 2.4,
  },
  {
    p: 4, x: 124, row: 1, frame: 3, verdict: 2, know: 1,
    interact: {
      prompt: 'What must a viewer bring to appreciate a marsh appropriately?',
      drag: {
        lo: 'A PRETTY GLANCE',
        hi: 'KNOWING WHAT IT IS',
        start: 0,
        zones: [
          { id: 'glance', upto: 0.3, reads: 'a pleasing glance and nothing more' },
          { id: 'some', upto: 0.62, reads: 'a glance, aided by a few names' },
          { id: 'know', upto: 1, reads: 'knowing what you’re looking at', correct: true },
        ],
      },
      explain: 'Knowing what you’re looking at. Carlson rejects the landscape model, which lets a glance be enough. A marsh looks like a wasteland until you learn what it does. Natural history does for nature what art history does for art.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 6, x: 124, row: 1, frame: 3, verdict: 2, know: 1, pick: 1,
    interact: {
      prompt: 'If the frame never moved, what changed the verdict on the marsh?',
      explain: 'Knowing. A frame only directs attention to an object. It can’t supply knowledge of what the object is, and on Carlson’s view that knowledge shapes appropriate appreciation.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Aesthetics of Nature',
      points: [
        'Aesthetics reaches past art into nature and daily life',
        'Carlson: scientific knowledge shapes appropriate appreciation of nature',
        'The landscape model judges nature like a painting',
        'A frame directs attention but supplies no knowledge',
      ],
      closing: 'On Carlson’s view, an unremarkable place can reward appreciation once its natural history is understood.',
    },
    dur: 3.0,
  },
];
