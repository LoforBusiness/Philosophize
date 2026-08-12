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
    p: 25, x: 34, arg: 1,
    text: 'A friend says: “He is rich, so he must be happy.” You nod along. Two sentences went past you, and a third one never did.',
    dur: 3.8,
  },
  {
    p: 13, x: 96, arg: 1, slot: 1,
    text: 'Nothing actually joins them. Being rich and being happy are different things, and the sentence that would tie one to the other was never said.',
    cite: 'The gap',
    dur: 4.6,
  },
  {
    p: 38, x: 96, arg: 1, slot: 1, hid: 1,
    text: 'Logic has a name for an argument like this. An enthymeme: one that runs on a premise nobody says out loud. There it is, sitting under the line.',
    cite: 'Enthymeme',
    dur: 4.8,
  },
  {
    p: 141, x: 96, arg: 1, slot: 1, hid: 1,
    quote: {
      id: 'lq-logic-arguments-10',
      text: 'The enthymeme is a kind of syllogism, and the body of all proof.',
      author: 'Aristotle',
      work: 'Rhetoric',
      era: 'c. 350 BCE',
      branchSlugs: ['logic'],
    },
    dur: 3.4,
  },
  {
    p: 30, x: 158, arg: 1, slot: 1, hid: 2,
    text: 'So say it yourself — all rich people are happy — and up it comes through the line. Now that you can read it, you can see it is rubbish.',
    cite: 'Into the light',
    dur: 4.8,
  },
  {
    p: 21, x: 158, arg: 1, slot: 1, hid: 2,
    interact: {
      prompt: 'An argument leaves one premise unstated. Does that alone make it a fallacy?',
      cards: [
        { text: 'No, if it\'s obviously true', correct: true },
        { text: 'Yes, hiding is deceptive', correct: false },
      ],
      explain: 'The trap: “hidden” sounds like “dishonest”. Almost every real argument leaves something out — nobody says “all men are mortal” out loud. An enthymeme only fails when the unsaid premise is FALSE, which is why you drag it up and look at it.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 4, x: 158, arg: 2, slot: 1, pick: 1,
    interact: {
      prompt: '“You should sleep more — you look exhausted.” Tap the premise this argument needs but never says.',
      explain: 'The trap: the other two are true, and true is not the same as load-bearing. This argument only walks if looking tired is evidence of needing sleep. Deny that one bridge and it collapses — the general facts about sleep were never holding it up.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 4, x: 158, arg: 2, slot: 1,
    summary: {
      title: 'The Premise Nobody Said',
      points: [
        'An enthymeme leaves one premise unstated',
        'Say the missing sentence out loud before judging it',
        'The hidden premise is where a weak argument hides',
        'Unstated is not the same as false — check it',
      ],
      closing: 'You can now hear the sentence nobody said. That is usually where the argument breaks.',
    },
    dur: 3.0,
  },
];
