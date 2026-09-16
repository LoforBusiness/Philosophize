import type { BaseBeat } from './cinematicKit';

// Cinematic logic-arguments-10, "The Premise Nobody Said" — the enthymeme.
//
// THE PICTURE: a rule across the stage labelled SAID. Above it are the two sentences
// somebody actually spoke; below it, in dashed outline, is the one they did not. Over
// the lesson that dashed card is hauled up THROUGH the line, where it goes solid and
// legible — and only once you can read it can you see that it is false. That single
// move is the whole argument of the lesson, so the stage is built around it and
// nothing else is drawn.
//
// The concrete case comes first and the word "enthymeme" arrives only after the reader
// has already seen the hole (F40). Q1 is the nuanced one and lives in the deck where
// four options can be read (E34); Q2 is answered on the stage, where the picture can
// simply put three unsaid candidates under the line and ask which one the argument is
// standing on (H65).

export interface Logic10Beat extends BaseBeat {
  /** Figure gesture (emote code). */ p?: number;
  /** Where the figure stands (stage x). 34 downstage-left · 96 beside the gap · 158 under the stack. */ x?: number;
  /** Which argument is on the board: 1 the rich/happy one · 2 the sleep one. */ arg?: number;
  /** 1 = the empty dashed socket above the SAID line is drawn. */ slot?: number;
  /** The premise nobody said: 0 absent · 1 dashed, below the line · 2 hauled up into the socket, solid. */ hid?: number;
  /** 1 = the three candidate premises are live below the line (Q2). */ pick?: number;
}

export const BEATS: Logic10Beat[] = [
  {
    p: 172, x: 34, arg: 1,
    text: 'Suppose a friend says “he’s rich, so he must be happy”. The argument states a premise and a conclusion, but it relies on a third claim.',
    dur: 3.8,
  },
  {
    p: 416, x: 96, arg: 1, slot: 1,
    text: 'Being rich and being happy are different conditions. So the argument needs a premise linking them, and that premise is never stated.',
    cite: 'The unstated link',
    dur: 4.6,
  },
  {
    p: 38, x: 96, arg: 1, slot: 1, hid: 1,
    text: 'An argument that depends on an unstated premise is called an enthymeme.',
    cite: 'Enthymeme',
    dur: 3.6,
  },
  {
    p: 266, x: 96, arg: 1, slot: 1, hid: 1,
    text: 'To assess such an argument, its unstated premise has to be made explicit.',
    dur: 1.8,
  },
  {
    p: 141, x: 96, arg: 1, slot: 1, hid: 1,
    quote: {
      id: 'lq-logic-arguments-10',
      text: 'The enthymeme is a kind of syllogism, and the body of all proof.',
      author: 'Aristotle',
      philosopherId: 'aristotle',
      work: 'Rhetoric',
      era: 'c. 350 BCE',
      branchSlugs: ['logic'],
    },
    dur: 3.4,
  },
  {
    p: 30, x: 158, arg: 1, slot: 1, hid: 2,
    text: 'Stated explicitly, the missing premise reads: all rich people are happy.',
    cite: 'The premise stated',
    dur: 1.8,
  },
  {
    p: 266, x: 158, arg: 1, slot: 1, hid: 2,
    text: 'Once stated, the premise can be assessed, and it’s false: many rich people are unhappy.',
    dur: 3,
  },
  {
    p: 380, x: 158, arg: 1, slot: 1, hid: 2,
    interact: {
      prompt: 'When does an unstated premise make an argument fail?',
      sort: {
        chip: 'an unstated premise',
        bins: [
          { id: 'always', label: 'always', reads: 'always, since every premise should be stated' },
          { id: 'false', label: 'only when false', reads: 'only when the unstated premise is false', correct: true },
          { id: 'never', label: 'never', reads: 'never, since everyday arguments omit premises' },
        ],
      },
      explain: 'An unstated premise makes an argument fail only when the premise is false. Most everyday arguments omit a premise too obvious to state, such as “all men are mortal”. Omission alone is no fault.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 165, x: 158, arg: 2, slot: 1, pick: 1,
    interact: {
      prompt: '“You should sleep more, since you look exhausted.” Which unstated premise does this argument need?',
      explain: 'Looking tired means you need sleep. The argument depends on that premise, because without it looking exhausted gives no reason to sleep more. The other two premises may be true, but the argument doesn’t rest on them.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 455, x: 158, arg: 2, slot: 1,
    summary: {
      title: 'The Unstated Premise',
      points: [
        'An enthymeme leaves one premise unstated',
        'State the missing premise explicitly before assessing it',
        'A weak argument often rests on a false unstated premise',
        'An unstated premise is not thereby false',
      ],
      closing: 'Making an unstated premise explicit is often the quickest way to find where an argument fails.',
    },
    dur: 3.0,
  },
];
