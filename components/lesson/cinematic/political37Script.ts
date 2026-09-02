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
}

export const BEATS: Political37Beat[] = [
  {
    p: 25, x: 54, pair: 1,
    text: 'Two citizens on election day. Two ballots, drawn the same size, because they are the same size.',
    dur: 3.8,
  },
  {
    p: 2, x: 54, pair: 1, horns: 1, labels: 1,
    text: 'Now look above the ballots. One of them can be heard across the country.',
    dur: 2.8,
  },
  {
    p: 2, x: 54, pair: 1, horns: 1, labels: 1,
    text: 'The other can be heard across a room.',
    dur: 1.8,
  },
  {
    p: 4, x: 54, pair: 1, horns: 1, labels: 1, live_d: 1, live: 1,
    interact: {
      prompt: 'Cap what may be spent. Slide, and watch both voices change.',
      drag: {
        lo: 'NO LIMIT',
        hi: 'STRICT EQUALITY',
        start: 0,
        zones: [
          { id: 'none', upto: 0.28, reads: 'money decides who is heard' },
          { id: 'some', upto: 0.68, reads: 'a floor, and a ceiling', correct: true },
          { id: 'hard', upto: 1, reads: 'nobody may amplify anything' },
        ],
      },
      explain: 'Notice how the smaller horn never grew. A cap does not give the quieter citizen more voice. A cap takes reach away from the louder one. That may still be the right move, and it is worth being clear about the move you just made.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 13, x: 54, pair: 1, horns: 1, cap: 0.5, labels: 1,
    text: 'Rawls put it as a distinction. Having a liberty is one thing.',
    dur: 2.1,
  },
  {
    p: 13, x: 54, pair: 1, horns: 1, cap: 0.5, labels: 1,
    text: 'Being able to use it is another, and only one of those is equal here.',
    dur: 2.7,
  },
  {
    p: 47, x: 54, pair: 1, horns: 1, cap: 0.5, labels: 1,
    quote: {
      id: 'lq-political-political-37-1',
      text: 'The liberties protected by the principle of participation lose much of their value whenever those with greater means control the course of public debate.',
      author: 'John Rawls',
      philosopherId: 'john-rawls',
      work: 'A Theory of Justice',
      era: '1971',
      branchSlugs: ['political-philosophy'],
    },
    dur: 4.0,
  },
  {
    p: 4, x: 54, pair: 1, horns: 1, cap: 1, labels: 1, live: 1,
    interact: {
      prompt: 'Tap what the cap you set is actually restricting.',
      explain: 'Speech. Spending to spread a message is a way of saying it, so a cap is a limit on political speech — the thing a free society guards most fiercely. That is why this argument does not resolve: it is liberty against liberty, not liberty against equality.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 35, x: 126, pair: 1, horns: 1, cap: 0.5, labels: 1,
    text: 'So the argument never settles. One side defends the right to be heard.',
    dur: 2.3,
  },
  {
    p: 35, x: 126, pair: 1, horns: 1, cap: 0.5, labels: 1,
    text: 'So does the other. The two sides disagree about whose right it is.',
    dur: 2.3,
  },
  {
    p: 45, x: 126, pair: 1, horns: 1, cap: 0.5, labels: 1,
    text: 'Every democracy draws the line somewhere, usually without announcing it. Where the line lands tells you what a country thinks a vote is for.',
    dur: 4.8,
  },
  {
    summary: {
      title: 'The Worth of a Right',
      points: [
        'Having a liberty differs from being able to use it',
        'Rawls: political liberties need fair value',
        'A spending cap limits a kind of speech',
        'So it is liberty against liberty',
      ],
      closing: 'The ballots really are the same size. Almost nothing else about the two of them is, and the ballot is the part we photograph.',
    },
    dur: 3.2,
  },
];
