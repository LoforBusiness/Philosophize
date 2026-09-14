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
    g: 384, rows: 1,
    dur: 4.0,
    text: 'Robert Nozick asks you to start from any distribution you consider just, even an equal one. Letting you choose makes the argument apply to every pattern.',
  },
  {
    g: 2, rows: 2,
    dur: 3.6,
    text: 'Suppose a basketball star agrees to play if twenty-five cents of each ticket goes to him. In a season, a million people pay to watch.',
    cite: 'Twenty-five cents a ticket',
  },
  {
    g: 2, rows: 2,
    dur: 1.8,
    text: 'Every single transfer is free. Each spectator chooses to pay, and the star chooses to play.',
  },
  {
    g: 447, rows: 3,
    dur: 4.4,
    text: 'The original pattern is now gone. The star has a quarter of a million dollars more, yet no one was wronged at any step.',
    cite: 'The pattern is gone',
  },
  {
    g: 147, rows: 3,
    dur: 3.6,
    quote: {
      id: 'lq-political-political-14-2',
      text: 'Whatever arises from a just situation by just steps is itself just.',
      author: 'Robert Nozick',
      philosopherId: 'robert-nozick',
      work: 'Anarchy, State, and Utopia',
      era: '1974',
      branchSlugs: ['political-philosophy'],
    },
  },
  {
    g: 383, rows: 3,
    dur: 4.8,
    text: 'To restore the original pattern, something in this sequence must be stopped. Nozick asks which stage you’d stop.',
    cite: 'Something must be stopped',
  },
  {
    g: 461, rows: 3, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'To keep the original pattern in place, which stage would have to be interrupted?',
      explain: 'The trades. The start was a distribution you accepted as just, and the result only follows from the trades. So keeping any pattern means repeatedly preventing or reversing free exchanges.',
      xp: 5,
    },
  },
  {
    g: 165, rows: 3,
    dur: 1.0,
    interact: {
      prompt: 'Which conclusion does the basketball case support?',
      sort: {
        chip: 'the basketball case',
        bins: [
          { id: 'pay', label: 'stars are overpaid', reads: 'star athletes are paid far too much' },
          { id: 'equal', label: 'equality is required', reads: 'only equal shares are fair' },
          { id: 'pattern', label: 'patterns stop exchange', reads: 'keeping any pattern requires stopping free exchanges', correct: true },
        ],
      },
      explain: 'Patterns stop exchange. The case applies to any pattern, equal or not, and makes no claim about what athletes deserve. Rawls replies that justice concerns the basic structure, the rules within which exchanges take place.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'Pattern Against History',
      points: [
        'Rawls judges the pattern, Nozick the history',
        'Free transfers from a just start break any pattern',
        'Keeping a pattern requires repeated interference',
        'Rawls answers at the level of rules, not single distributions',
      ],
      closing: 'Judging a distribution involves asking what would be required to maintain it, as well as whether it’s fair.',
    },
    dur: 3.0,
  },
];
