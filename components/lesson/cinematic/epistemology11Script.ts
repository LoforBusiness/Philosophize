import type { BaseBeat } from './cinematicKit';

// Cinematic epistemology-knowledge-11, "When True Belief Is Not Enough" — the
// Gettier problem, staged as TWO CLOCK DIALS side by side.
//
// THE ONE PICTURE (H64): the left dial is the hallway clock, its hands frozen at
// 3:00 forever. The right dial is the real time, and its hands sweep. On the very
// first beat the two agree — a tie-line is drawn between them and the figure is
// looking up at exactly that instant — and from beat 1 onward the right dial moves
// on and they never agree again. Two hands that coincide once, by accident: that
// coincidence IS epistemic luck, and the reader watches it happen and then watches
// it never happen again.
//
// Q1 (`mc`, in the deck) is the nuanced one the data file added today: WHICH of
// belief / truth / justification does the case fail? None — it passes all three,
// which is the whole shock and needs the options read carefully (E34).
// Q2 (`interact`, on the stage) is the one the picture can put directly: three
// moments are marked on the sweep, and only one of them made the frozen reading
// true (H65).

export interface Epistemology11Beat extends BaseBeat {
  /** Figure gesture code (emoteHold / emoteLive). */ p?: number;
  /** Where the figure stands (stage x). 80 = downstage left under the hallway
   *  clock · 154 = between the dials · 226 = under the real one. Monotonic, so the
   *  figure never turns (C18). */ x?: number;
  /** The REAL time on the right dial, in minutes past twelve. 180 = 3:00. Rises
   *  every beat and never returns to 180, so the dials agree exactly once. */ real?: number;
  /** 1 = the two dials read the same, so the tie-line and its label are drawn
   *  between them. Only the hook beat sets it; it fades out and never returns. */ link?: number;
  /** 1 = the three moment cards are live (Q2), with their marks on the right
   *  dial's rim. */ pick?: number;
}

export const BEATS: Epistemology11Beat[] = [
  {
    p: 25, x: 80, real: 180, link: 1,
    text: 'You glance up at the hallway clock. Three o’clock — and it really is three o’clock.',
    dur: 2.4,
  },
  {
    p: 25, x: 80, real: 180, link: 1,
    text: 'You have never been more right, or for a worse reason.',
    dur: 1.8,
  },
  {
    p: 45, x: 154, real: 195,
    text: 'You step across for a second look. The other dial has moved on; the hallway clock has not.',
    cite: 'The stopped clock',
    dur: 3.2,
  },
  {
    p: 45, x: 154, real: 195,
    text: 'It stopped twelve hours ago, at exactly three.',
    dur: 1.8,
  },
  {
    p: 3, x: 154, real: 220,
    text: 'Still, count what you had. You believed it.',
    cite: 'Justified true belief',
    dur: 1.8,
  },
  {
    p: 3, x: 154, real: 220,
    text: 'It was true. And a clock on a wall is an ordinary reason to trust one.',
    dur: 2.7,
  },
  {
    p: 3, x: 154, real: 220,
    text: 'Belief, truth, justification — all three.',
    dur: 1.8,
  },
  {
    p: 129, x: 154, real: 255,
    quote: {
      id: 'lq-epistemology-knowledge-11-1',
      text: 'It is possible for a person to be justified in believing a proposition that is in fact false.',
      author: 'Edmund Gettier',
      work: 'Is Justified True Belief Knowledge?',
      era: '1963',
      branchSlugs: ['epistemology'],
    },
    dur: 3.6,
  },
  {
    p: 5, x: 226, real: 300,
    text: 'Walk on, and watch the pair. They agreed for one instant and never will again.',
    cite: 'Epistemic luck',
    dur: 2.6,
  },
  {
    p: 5, x: 226, real: 300,
    text: 'Nothing ever joined your reason to the fact — the match was an accident.',
    dur: 2.4,
  },
  {
    p: 4, x: 226, real: 350,
    interact: {
      prompt: 'Set the lever to the condition the stopped clock breaks.',
      lever: {
        start: 0,
        stops: [
          { id: 'belief', reads: 'belief: you did not really believe it' },
          { id: 'truth', reads: 'truth: the time on the wall was wrong' },
          { id: 'reason', reads: 'justification: a broken clock is no reason' },
          { id: 'none', reads: 'none of them, all three are met', correct: true },
        ],
      },
      explain: 'None of them, and that is the whole of Gettier. A broken clock feels like a broken condition and it is not. You believed it, it was true, and a clock on a wall is an ordinary reason to trust. All three met, and still not knowledge.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 21, x: 226, real: 410, pick: 1,
    interact: {
      prompt: 'The hallway clock read three o’clock all day. Tap the one moment when that reading was actually true.',
      explain: 'The trap: a stopped clock is not always wrong — it is right for an instant, twice a day. At three it matched the world by accident. Your reason never touched the fact, so being right was luck rather than knowledge.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 44, x: 226, real: 410,
    summary: {
      title: 'What You Now Know',
      points: [
        'Knowledge was defined as justified true belief',
        'Gettier cases meet all three and still fail',
        'Luck can stitch a true belief to a bad reason',
        'Knowing needs a non-accidental link to the fact',
      ],
      closing: 'Being right is not enough. You have to be right for the right reason.',
    },
    dur: 3.0,
  },
];
