import type { BaseBeat } from './cinematicKit';

// Cinematic epistemology-knowledge-21, "Try To Believe It Is Raining".
//
// THE PICTURE: a belief needle with two trays feeding it. He loads the WILL tray
// until it is full and the needle does not move a unit; one item goes into the
// EVIDENCE tray and the needle swings the whole way. The argument is which tray the
// needle is attached to, and the reader watches it be attached to the other one.
//
// Q1 is answered on the gauge (which tray moved it — the picture just showed you);
// Q2 is A/B/C/D, because "so is belief out of your hands" is the one that needs
// reading (E34).

export interface Epi21Beat extends BaseBeat {
  /** Figure gesture (emote code). */ p?: number;
  /** Where the figure stands (stage x). 70 = downstage left, 168 = at the gauge. */ x?: number;
  /** The gauge is up, 0..1. */ dial?: number;
  /** How loaded the WILL tray is, 0..1 — effort, which the needle ignores. */ will?: number;
  /** How loaded the EVIDENCE tray is, 0..1 — the only thing the needle answers to. */ ev?: number;
  /** 1 = the three answer cards are live (Q1). */ pick?: number;
  /** 1 = a dashed outline of the coming test rig, before the gauge itself appears. */ testFrame?: number;
  /** 1 = a dashed brace around both trays, naming the two candidate inputs. */ traysRing?: number;
  /** How many acts of will have been named so far, 0…3 — ticks on the will tray. */ willTicks?: number;
}

export const BEATS: Epi21Beat[] = [
  {
    p: 164, x: 70,
    text: 'Try, right now, to believe that it’s raining outside. Imagining rain, or saying that it’s raining, doesn’t count.',
    dur: 2.9,
  },
  {
    p: 164, x: 70, testFrame: 1,
    text: 'Doxastic voluntarism is the view that you can believe something just by deciding to. This attempt puts the view to the test.',
    dur: 1.8,
  },
  {
    p: 270, x: 168, dial: 1,
    text: 'The needle shows how strongly you believe that it’s raining. At present it rests against doubt.',
    cite: 'Degree of belief',
    dur: 3.9,
  },
  {
    p: 270, x: 168, dial: 1, traysRing: 1,
    text: 'Two kinds of input might move the needle: acts of will and evidence.',
    dur: 1.8,
  },
  {
    p: 29, x: 124, dial: 1, will: 1, willTicks: 1,
    text: 'The first tray holds acts of will, beginning with a strong desire that it be raining.',
    cite: 'Acts of will',
    dur: 1.8,
  },
  {
    p: 258, x: 124, dial: 1, will: 1, willTicks: 2,
    text: 'Add a firm decision to believe it, and the words “it’s raining” repeated to yourself.',
    dur: 1.8,
  },
  {
    p: 258, x: 124, dial: 1, will: 1, willTicks: 3,
    text: 'Add a large reward for believing it. The tray fills and the needle does not move.',
    dur: 2.3,
  },
  {
    p: 141, x: 124, dial: 1, will: 1, willTicks: 3,
    quote: {
      id: 'lq-epistemology-knowledge-21-1',
      text: 'It is wrong always, everywhere, and for anyone, to believe anything upon insufficient evidence.',
      author: 'William Kingdon Clifford',
      work: 'The Ethics of Belief',
      era: '1877',
      branchSlugs: ['epistemology'],
    },
    dur: 3.6,
  },
  {
    p: 384, x: 168, dial: 1, will: 1, ev: 1, willTicks: 3,
    text: 'Now put one item in the evidence tray: rain on the window. With no act of will at all, the needle swings to belief.',
    cite: 'Evidence',
    dur: 4.8,
  },
  {
    p: 383, x: 124, dial: 1, will: 1, ev: 1, pick: 1, willTicks: 3,
    interact: {
      prompt: 'Which input moved the needle from doubt to belief?',
      explain: 'Evidence. Belief responds to how the world appears, not to how much you want it to be a certain way. Wanting and trying left the needle where it was.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 165, x: 124, dial: 1, will: 1, ev: 1, willTicks: 3,
    interact: {
      prompt: 'How much control do you have over what you believe?',
      sort: {
        chip: 'YOUR BELIEFS',
        bins: [
          { id: 'none', label: 'NONE', reads: 'none at all, direct or otherwise' },
          { id: 'indirect', label: 'INDIRECT', reads: 'indirect through habits and reading', correct: true },
          { id: 'direct', label: 'DIRECT', reads: 'direct: you can simply decide to believe' },
        ],
      },
      explain: 'Indirect. You can\'t believe it\'s raining at will, but you can choose whom to read, what to check and which habits of attention to keep, and belief follows from those. That\'s enough to make what you believe something you answer for.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Belief and the Will',
      points: [
        'You cannot believe something at will',
        'Belief answers to evidence, not to wanting',
        'You can choose what evidence you meet',
        'Responsibility for belief works through that choice',
      ],
      closing: 'You can’t adopt a belief by choosing it. You can choose what to read, and that influences what you come to believe.',
    },
    dur: 3.0,
  },
];
