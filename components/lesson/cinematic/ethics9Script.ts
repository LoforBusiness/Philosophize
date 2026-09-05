import type { BaseBeat } from './cinematicKit';

// Cinematic ethics-ethics-9, "When Both Choices Are Wrong" — genuine moral
// dilemmas and the residue that survives choosing well.
//
// THE PICTURE: two claims pinned side by side, equally weighted. Over the lesson
// one of them fills in — it is the one he acts on — and the other stays exactly
// where it was, unfilled, and never comes down. The argument IS that the second
// note is still on the board at the end.
//
// Q1 is answered on the board (tap the claim still owed an account — the two notes
// are themselves the targets, plus the tempting third card that says nothing is
// owed). Q2 is A/B/C/D, because "what did the untroubled man miss" needs weighing.

export interface Ethics9Beat extends BaseBeat {
  /** Figure gesture (emote code). */ p?: number;
  /** Where the figure stands (stage x). 70 = downstage left, 168 = at the board. */ x?: number;
  /** The two pinned claims are up, 0..1. */ notes?: number;
  /** Which claim he acts on: 0 neither yet · 2 the right-hand one, filled INK. */ taken?: number;
  /** 1 = the three answer targets are live (Q1). */ pick?: number;
  /** 1 = the STILL OWED tag has appeared under the claim he did not meet. */ owed?: number;
}

export const BEATS: Ethics9Beat[] = [
  {
    p: 164, x: 70,
    text: 'Most hard choices have a right answer buried in them somewhere. Some do not.',
    dur: 2.2,
  },
  {
    p: 164, x: 70,
    text: 'Some leave a mark on you whichever way you go.',
    dur: 1.8,
  },
  {
    p: 41, x: 168, notes: 1,
    text: 'In 1940 a student came to Sartre. His brother had been killed by the Germans and he wanted to fight.',
    cite: 'Two claims',
    dur: 3.1,
  },
  {
    p: 41, x: 168, notes: 1,
    text: 'The student\'s mother lived for him alone, and his leaving would break her.',
    dur: 1.9,
  },
  {
    p: 383, x: 124, notes: 1,
    text: 'Neither claim outranks the other. That is what makes this a dilemma rather than a hard sum — there is no scale both of them fit on.',
    cite: 'Not a hard sum',
    dur: 4.4,
  },
  {
    p: 139, x: 124, notes: 1,
    quote: {
      id: 'lq-ethics-ethics-9-1',
      text: 'No rule of general morality can show you what you ought to do: no signs are vouchsafed in this world.',
      author: 'Jean-Paul Sartre',
      work: 'Existentialism Is a Humanism',
      era: '1946',
      philosopherId: 'jean-paul-sartre',
      branchSlugs: ['ethics'],
    },
    dur: 3.6,
  },
  {
    p: 167, x: 168, notes: 1, taken: 2,
    text: 'The student goes. Say he was right to — most people think he was.',
    cite: 'He chooses',
    dur: 2.1,
  },
  {
    p: 167, x: 168, notes: 1, taken: 2,
    text: 'Now look at the board: the other claim has not moved. Nothing about his choice removed it.',
    dur: 2.7,
  },
  {
    p: 6, x: 124, notes: 1, taken: 2, pick: 1,
    interact: {
      prompt: 'He chose, and chose well. Tap the note that is still owed an account.',
      explain: 'A correct choice does not settle the account. The duty he could not meet was never cancelled, only outweighed — and it still has a claim on him.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 4, x: 124, notes: 1, taken: 2, owed: 1,
    interact: {
      prompt: 'He chose the better option. Was anything still lost?',
      sort: {
        chip: 'the tragic choice',
        bins: [
          { id: 'nothing', label: 'nothing', reads: 'nothing, he chose rightly' },
          { id: 'third', label: 'a third way', reads: 'a third way out that he never looked for' },
          { id: 'duty', label: 'a real duty', reads: 'a real duty went unmet', correct: true },
        ],
      },
      explain: 'A real duty. If choosing rightly cancelled the loss, regret would be irrational — and yet we distrust anyone who walks away untroubled. Something real was owed and was not paid. Williams called what is left over moral residue.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Both Roads Cost Something',
      points: [
        'A dilemma offers no cost-free road',
        'Choosing well does not erase the loss',
        'What survives the choice is moral residue',
        'Regret can be the accurate response',
      ],
      closing: 'When a choice still hurts after you got it right, the ache is not weakness. The ache is accuracy.',
    },
    dur: 3.0,
  },
];
