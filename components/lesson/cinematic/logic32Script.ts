import type { BaseBeat } from './cinematicKit';

// Cinematic logic-arguments-32, "The Question With a Trap Inside".
//
// THE PICTURE: the question itself, laid out word by word, with two figures either
// side of it — the one asking and the one cornered. Over the lesson both answers
// are tried and both light up the same hidden claim underneath. The word that did
// it is still sitting in the sentence, and tapping it is the question.
//
// STAGING, deliberately unlike its siblings: TWO figures, neither of whom walks,
// standing 210 units apart with the sentence between them; and the answer targets
// are the WORDS of the sentence rather than a row of cards.

export interface Logic32Beat extends BaseBeat {
  /** Asker's gesture (emote code). */ a?: number;
  /** Cornered figure's gesture (emote code). */ b?: number;
  /** 1 = the question is on the board. */ q?: number;
  /** Which answer is being tried: 0 none · 1 YES · 2 NO. */ tried?: number;
  /** 1 = the hidden claim is showing under the sentence. */ hidden?: number;
  /** 1 = the words are live targets (Q1). */ pick?: number;
}

export const BEATS: Logic32Beat[] = [
  {
    a: 23, b: 0,
    dur: 4.0,
    text: 'Two people, one question, and no way out of it. Watch what happens to the second person whichever way they answer.',
  },
  {
    a: 383, b: 45, q: 1,
    dur: 4.2,
    text: '"Have you stopped cheating at cards?" The question sounds like an ordinary yes-or-no, and is not one.',
    cite: 'The question',
  },
  {
    a: 163, b: 4, q: 1, tried: 1,
    dur: 2,
    text: 'Try yes. Yes, you stopped, which means you were cheating before.',
    cite: 'Answer: yes',
  },
  {
    a: 163, b: 4, q: 1, tried: 1,
    dur: 2.4,
    text: 'The accusation now stands on the record, and nobody ever made the accusation.',
  },
  {
    a: 163, b: 46, q: 1, tried: 2,
    dur: 3.8,
    text: 'Try no, which feels like the safe one. No, you have not stopped — so you are cheating right now.',
    cite: 'Answer: no',
  },
  {
    a: 163, b: 46, q: 1, tried: 2,
    dur: 1.8,
    text: 'It is worse.',
  },
  {
    a: 44, b: 46, q: 1, tried: 2,
    dur: 3.4,
    quote: {
      id: 'lq-logic-arguments-32-1',
      text: 'Judge a man by his questions rather than by his answers.',
      author: 'Voltaire',
      philosopherId: 'voltaire',
      work: 'Attributed',
      era: 'c. 1770',
      branchSlugs: ['logic'],
    },
  },
  {
    a: 6, b: 12, q: 1, hidden: 1, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'One word smuggled the accusation in. Tap it.',
      explain: '"Stopped" can only be true if you started, so the word carries the charge without ever stating the charge. "Cheating" is out in the open — that is exactly why it is not the problem. You can see it and dispute it.',
      xp: 5,
    },
  },
  {
    a: 35, b: 21, q: 1, hidden: 1,
    dur: 1.0,
    interact: {
      prompt: 'How do you answer a question with a claim buried in it?',
      sort: {
        chip: 'a loaded question',
        bins: [
          { id: 'yes', label: 'answer yes', reads: 'answer yes, and admit the whole thing' },
          { id: 'no', label: 'answer no', reads: 'say no, and you still admit the act' },
          { id: 'split', label: 'split it apart', reads: 'refuse the package and take the hidden claim first', correct: true },
        ],
      },
      explain: 'Split it apart. Answering no feels like the safe reply and it is the worse one: no to have you stopped means you have not stopped. Both plain answers hand over the smuggled claim. Splitting the question is the only move that gives away nothing.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'Split the Question',
      points: [
        'A loaded question hides a claim inside itself',
        'Both answers concede what was smuggled in',
        'The giveaway word presupposes, it does not assert',
        'Refuse the frame, then answer the real question',
      ],
      closing: 'Some questions are not requests for information. They are arguments wearing a question mark.',
    },
    dur: 3.0,
  },
];
