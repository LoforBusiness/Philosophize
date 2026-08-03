import type { BaseBeat } from './cinematicKit';

// Cinematic political-political-14, "Rawls vs Nozick, Round Two" — a CONVERSION of an
// existing card deck, at the Political Philosophy frontier (§5).
//
// THE PICTURE: the Wilt Chamberlain case as three rows — the just start, the trades,
// and the result. Nozick's argument is that you cannot object to the first or the
// third, so the only thing left to object to is the middle row, and the middle row is
// people choosing. Laying it out as three stages is what makes that visible (H64).
//
// STAGING: the answer targets are the three STAGES OF A PROCESS, so the reader
// answers by pointing at a moment rather than at a claim (E33).

export interface Pol14Beat extends BaseBeat {
  /** Figure gesture (emote code). */ g?: number;
  /** How many stages of the story are on stage, 0…3. */ rows?: number;
  /** 1 = the three stages are live targets (Q1). */ pick?: number;
}

export const BEATS: Pol14Beat[] = [
  {
    g: 5, rows: 1,
    dur: 4.0,
    text: 'Start from any distribution you are willing to call just. Make it dead equal if you like — Nozick does not mind, and that is the point of letting you choose.',
  },
  {
    g: 2, rows: 2,
    dur: 4.4,
    text: 'Now a basketball star offers to play, and asks a dollar from anyone who wants to watch. A million people happily pay. Every single transfer is free.',
    cite: 'A dollar each',
  },
  {
    g: 45, rows: 3,
    dur: 4.4,
    text: 'And the pattern is gone. He is vastly rich, everyone else is a dollar poorer, and nobody was wronged at any step of it.',
    cite: 'The pattern is gone',
  },
  {
    g: 44, rows: 3,
    dur: 3.6,
    quote: {
      id: 'lq-political-political-14-2',
      text: 'Whatever arises from a just situation by just steps is itself just.',
      author: 'Robert Nozick',
      work: 'Anarchy, State, and Utopia',
      era: '1974',
      branchSlugs: ['political-philosophy'],
    },
  },
  {
    g: 1, rows: 3,
    dur: 4.8,
    text: 'So if you want the top row back, you have to reach into this picture and stop something. Nozick\'s question is only which row you were planning to reach into.',
    cite: 'Reach in and stop something',
  },
  {
    g: 4, rows: 3, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'Tap what holding the pattern in place would mean interrupting.',
      explain: 'The trades. Nothing else here is available to stop — you cannot object to a start you chose, and the result is only where the trades led. Holding any pattern means preventing the middle row, over and over.',
      xp: 5,
    },
  },
  {
    g: 11, rows: 3,
    dur: 1.0,
    mc: {
      prompt: 'So what is the Wilt Chamberlain case meant to show?',
      options: [
        { id: 'a', text: 'Any fixed pattern survives only by repeatedly interrupting voluntary transfers', correct: true },
        { id: 'b', text: 'That equality is undesirable', correct: false },
        { id: 'c', text: 'That the worst-off do not matter', correct: false },
        { id: 'd', text: 'That a star deserves whatever his fans will pay', correct: false },
      ],
      explain: 'Not B or D: the argument bites on ANY pattern, equal or not, and says nothing about desert. Rawls\'s reply is that the target was never one distribution — it is the basic structure, the rules of property and tax running over time.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'Pattern Against History',
      points: [
        'Rawls judges the pattern; Nozick judges the history',
        'Free transfers from a just start break any pattern',
        'Holding a pattern means interfering, and then again',
        'Rawls answers at the level of the rules, not the snapshot',
      ],
      closing: 'Ask not only whether a distribution is fair, but what you would have to keep doing to keep it that way.',
    },
    dur: 3.0,
  },
];
