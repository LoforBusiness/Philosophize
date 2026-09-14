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
    text: 'One person puts a question to another. Whichever way the second person answers, the answer admits a charge.',
  },
  {
    a: 383, b: 45, q: 1,
    dur: 4.2,
    text: 'The question is “have you stopped cheating at cards?” It appears to be an ordinary yes-or-no question, but it isn’t one.',
    cite: 'The question',
  },
  {
    a: 163, b: 4, q: 1, tried: 1,
    dur: 2,
    text: 'If you answer yes, you say you’ve stopped, and so admit that you cheated before.',
    cite: 'Answer: yes',
  },
  {
    a: 163, b: 4, q: 1, tried: 1,
    dur: 2.4,
    text: 'The accusation is now on the record, although no one ever stated it.',
  },
  {
    a: 163, b: 46, q: 1, tried: 2,
    dur: 3.8,
    text: 'Answering no seems safer, but it’s worse. It means you haven’t stopped, which admits that the offence continues.',
    cite: 'Answer: no',
  },
  {
    a: 163, b: 46, q: 1, tried: 2,
    dur: 1.8,
    text: 'A question like this is called a loaded question: it presupposes a claim that any direct answer concedes.',
  },
  {
    a: 162, b: 46, q: 1, tried: 2,
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
      prompt: 'Which word in the question presupposes the accusation?',
      explain: 'The word “stopped”. You can only stop doing something you once did, so “stopped” presupposes the charge without stating it. The word “cheating” states its content openly, so it can be seen and disputed.',
      xp: 5,
    },
  },
  {
    a: 35, b: 21, q: 1, hidden: 1,
    dur: 1.0,
    interact: {
      prompt: 'How should you respond to a question that presupposes a disputed claim?',
      sort: {
        chip: 'a loaded question',
        bins: [
          { id: 'yes', label: 'answer yes', reads: 'answer yes, and concede the presupposed claim' },
          { id: 'no', label: 'answer no', reads: 'answer no, and concede the claim anyway' },
          { id: 'split', label: 'split it apart', reads: 'reject the presupposition, then address the question', correct: true },
        ],
      },
      explain: 'Split the loaded question: reject its presupposition, then answer what remains. Answering no seems safe, but saying you haven’t stopped concedes the charge too.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'Loaded Questions',
      points: [
        'A loaded question presupposes a claim it never states',
        'Both direct answers concede the presupposed claim',
        'The key word presupposes the claim rather than asserting it',
        'Reject the presupposition, then answer what remains',
      ],
      closing: 'A loaded question is in effect an argument, since any direct answer concedes its presupposition.',
    },
    dur: 3.0,
  },
];
