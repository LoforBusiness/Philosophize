import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic political-political-37, "One Vote, Many Wallets"
// Theme: TWO IDENTICAL BALLOTS, AND TWO MEGAPHONES THAT ARE NOT.
//
// The gap between having a right and being able to use it is a size difference,
// so the picture is a size difference. Two citizens, two ballots drawn exactly
// the same — because the vote really is equal — and above them two megaphones
// whose mouths are not, because the reach is not.
//
// The last beat is the one that makes it hard rather than obvious: a cap is drawn
// across the larger megaphone, and the SPEECH label lights on the thing being
// capped. Nobody is silenced in this scene without the scene admitting it.
//
// GAMIFIED SHAPE, and it closes the eighteen with the mechanic that started them:
//   · beat 2  a DRAG — set the cap. Both megaphones resize as the reader slides,
//     the readout names what has been bought and what has been lost, and there is
//     no zone that costs nothing.
//   · beat 6  a SCENE TARGET — tap what a spending cap actually restricts. The
//     right answer is the uncomfortable one, which is the whole lesson.
// ─────────────────────────────────────────────────────────────────────────────

export interface Political37Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the two citizens and their ballots are drawn. */ pair?: number;
  /** 1 = the megaphones are drawn above the ballots. */ horns?: number;
  /** How hard the cap bites, 0 (none) … 1 (equal reach). */ cap?: number;
  /** 1 = the reader's thumb is on the cap rail. */ live_d?: number;
  /** 1 = the two labels stand below: EQUAL VOTE and UNEQUAL REACH. */ labels?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
  /** 1 = two small marks appear at the quiet mouth's opening — the few it actually reaches. */ near?: number;
  /** 1 = an equals mark appears between the two ballots — the vote itself is unchanged. */ eq?: number;
  /** 1 = a small divider appears between the two labels — the two positions in dispute. */ vs?: number;
  /** 1 = a row of small marks appears between the two labels — one of the many rules a democracy could set. */ range?: number;
}

export const BEATS: Political37Beat[] = [
  {
    p: 25, x: 54, pair: 1,
    text: 'Consider two citizens on election day. Each casts one ballot, and the two ballots count equally.',
    dur: 3.8,
  },
  {
    p: 2, x: 54, pair: 1, horns: 1, labels: 1,
    text: 'Their political voices aren’t equal. One citizen can afford to be heard across the whole country.',
    dur: 2.8,
  },
  {
    p: 266, x: 54, pair: 1, horns: 1, labels: 1, near: 1,
    text: 'The other, without money for advertising, reaches only the people nearby.',
    dur: 1.8,
  },
  {
    p: 457, x: 54, pair: 1, horns: 1, labels: 1, live_d: 1, live: 1,
    interact: {
      prompt: 'Put these in order, from no limit to the tightest.',
      order: {
        axis: 'LOOSEST FIRST',
        items: [
          { id: 'open', reads: 'SPEND WHAT YOU LIKE' },
          { id: 'cap', reads: 'A CEILING THAT STILL ALLOWS A CAMPAIGN' },
          { id: 'ban', reads: 'NOBODY MAY SPEND AT ALL' },
        ],
      },
      explain: 'The middle one is what the argument supports. With no limit, how loudly a view is heard tracks who funds it rather than who holds it; with no spending at all there\'s no way to reach anyone. A cap tries to keep the reaching without the buying.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 168, x: 54, pair: 1, horns: 1, cap: 0.5, labels: 1,
    text: 'John Rawls distinguishes a liberty from its worth, which is a person’s ability to use it.',
    dur: 2.1,
  },
  {
    p: 414, x: 54, pair: 1, horns: 1, cap: 0.5, labels: 1, eq: 1,
    text: 'Both citizens have equal political liberties but unequal power to use them. Rawls argues these liberties need fair value.',
    dur: 2.7,
  },
  {
    p: 433, x: 54, pair: 1, horns: 1, cap: 0.5, labels: 1,
    quote: {
      id: 'lq-political-political-37-1',
      text: '…those who have greater private means are permitted to use their advantages to control the course of public debate.',
      author: 'John Rawls',
      philosopherId: 'john-rawls',
      work: 'A Theory of Justice',
      era: '1971',
      branchSlugs: ['political-philosophy'],
    },
    dur: 4.0,
  },
  {
    p: 467, x: 54, pair: 1, horns: 1, cap: 1, labels: 1, live: 1,
    interact: {
      prompt: 'What does a cap on campaign spending restrict?',
      explain: 'Speech. Spending to spread a message is a means of expressing it, so a cap limits political speech. The dispute sets one liberty against another, not liberty against equality.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 459, x: 126, pair: 1, horns: 1, cap: 0.5, labels: 1,
    text: 'The dispute persists because both sides appeal to liberty. One side defends the freedom to spend on speech.',
    dur: 2.3,
  },
  {
    p: 459, x: 126, pair: 1, horns: 1, cap: 0.5, labels: 1, vs: 1,
    text: 'The other defends the fair value of every citizen’s political voice. They disagree about which liberty comes first.',
    dur: 2.3,
  },
  {
    p: 379, x: 126, pair: 1, horns: 1, cap: 0.5, labels: 1, range: 1,
    text: 'Democracies differ in how they regulate campaign money. Each rule reflects a view of what political equality requires.',
    dur: 4.8,
  },
  {
    summary: {
      title: 'The Fair Value of Political Liberty',
      points: [
        'Having a liberty differs from being able to use it',
        'Rawls: political liberties need fair value',
        'A spending cap restricts political speech',
        'The dispute sets liberty against liberty',
      ],
      closing: 'Equal votes can coexist with unequal political influence. Campaign finance law is where democracies confront that gap.',
    },
    dur: 3.2,
  },
];
