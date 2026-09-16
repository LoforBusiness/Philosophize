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
    p: 164, x: 80, real: 180, link: 1,
    text: 'Suppose you glance at the hallway clock and it reads three o’clock. The time is in fact three o’clock.',
    dur: 2.4,
  },
  {
    p: 164, x: 80, real: 180, link: 1,
    text: 'Your belief that it’s three o’clock is true. But do you know the time?',
    dur: 1.8,
  },
  {
    p: 465, x: 154, real: 195,
    text: 'A little later, the real time has moved on. The hallway clock still reads three.',
    cite: 'The stopped clock',
    dur: 3.2,
  },
  {
    p: 465, x: 154, real: 195,
    text: 'The hallway clock stopped at three o’clock, twelve hours before you looked. Bertrand Russell gave this example in 1948.',
    dur: 1.8,
  },
  {
    p: 459, x: 154, real: 220,
    text: 'The traditional account defines knowledge as justified true belief. First, you believed that it was three o’clock.',
    cite: 'Justified true belief',
    dur: 1.8,
  },
  {
    p: 459, x: 154, real: 220,
    text: 'Second, the belief was true. Third, it was justified, since reading a clock is an ordinary way to learn the time.',
    dur: 2.7,
  },
  {
    p: 459, x: 154, real: 220,
    text: 'Your belief therefore meets all three conditions: belief, truth and justification.',
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
    text: 'The stopped clock matched the real time only at the moment you happened to look. So your belief was true by luck.',
    cite: 'Epistemic luck',
    dur: 2.6,
  },
  {
    p: 259, x: 226, real: 300,
    text: 'Nothing connected your reason to the fact that made the belief true. A match of this kind is called epistemic luck.',
    dur: 2.4,
  },
  {
    p: 457, x: 226, real: 350,
    interact: {
      prompt: 'Which condition of justified true belief does the stopped-clock case fail?',
      sort: {
        chip: 'the stopped-clock case',
        bins: [
          { id: 'belief', label: 'belief', reads: 'belief: you didn’t believe it was three' },
          { id: 'truth', label: 'truth', reads: 'truth: it wasn’t three o’clock when you looked' },
          { id: 'reason', label: 'good reason', reads: 'justification: a stopped clock gives no reason' },
          { id: 'none', label: 'none of them', reads: 'none of them: all three conditions are met', correct: true },
        ],
      },
      explain: 'None of them: all three conditions are met. Nothing suggested that the clock had stopped, so reading it was justified. Yet the belief was true only by luck. As Edmund Gettier argued in 1963, justified true belief isn’t sufficient for knowledge.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 177, x: 226, real: 410, pick: 1,
    interact: {
      prompt: 'At which marked moment was the hallway clock’s reading of three o’clock true?',
      explain: 'When you looked, at three o’clock. A stopped clock is right twice a day, for an instant each time. Its reading matched the time by accident, so your true belief fell short of knowledge.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 441, x: 226, real: 410,
    summary: {
      title: 'Justified True Belief and Luck',
      points: [
        'Knowledge was defined as justified true belief',
        'Gettier cases meet all three conditions yet aren’t knowledge',
        'In such cases, the belief is true only by luck',
        'Knowing needs a non-accidental link to the fact',
      ],
      closing: 'A true belief with good reasons can still fall short of knowledge if its truth is a matter of luck.',
    },
    dur: 3.0,
  },
];
