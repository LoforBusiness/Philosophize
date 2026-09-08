import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic political-political-38, "Who Speaks for You?"
// Theme: A CORD BETWEEN HOME AND THE CHAMBER, AND HOW MUCH SLACK IT HAS.
//
// Two theories of representation are one picture: a block called HOME, a block
// called MEMBER, and a cord between them. Pull it taut and the member's vote is
// the vote at home, because there is no room for anything else. Let it hang and
// he votes as he sees it, and the cord is still attached, which is the half
// everybody forgets.
//
// The slack is the whole argument, and it is a quantity, so the reader can move
// it. What they cannot do is have both: a cord with no slack cannot carry
// judgement, and a cord with slack cannot be checked against instructions.
//
// GAMIFIED SHAPE:
//   · beat 3  SCENE TARGETS — three things a representative might owe you, and the
//     reader taps the one a messenger could not supply. Named before Burke is, so
//     the answer is reasoned rather than recalled.
//   · beat 7  a POLL — which one you would send, with the people who argued each.
//     The cord is the readout: the delegate pulls it taut and the member's vote
//     changes to match home, the trustee lets it hang.
// ─────────────────────────────────────────────────────────────────────────────

export interface Political38Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the HOME and MEMBER blocks stand. */ chamber?: number;
  /** 1 = the cord runs between them. */ cord?: number;
  /** 1 = the three things he might owe you are on the rail. */ cards?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Political38Beat[] = [
  {
    p: 164, x: 52, chamber: 1,
    text: 'You elect somebody. Months later a vote comes up that nobody mentioned in the campaign.',
    dur: 4.0,
  },
  {
    p: 384, x: 52, chamber: 1, cord: 1,
    text: 'There is a cord between the two of you, and the only question is how much slack it has.',
    dur: 4.0,
  },
  {
    p: 47, x: 52, chamber: 1, cord: 1, cards: 1,
    text: 'Here are three things he might owe you.',
    dur: 2.6,
  },
  {
    p: 4, x: 52, chamber: 1, cord: 1, cards: 1, live: 1,
    interact: {
      prompt: 'Tap the one a messenger could not supply.',
      explain: 'His own judgement. Carrying what you instruct is exactly what a messenger does, so it cannot be the difference. A party line is a third master, owed to neither you nor the argument in the room.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 176, x: 52, chamber: 1, cord: 1, cards: 1,
    text: 'In 1774 Edmund Burke faced the voters of Bristol on election day. Instructions, he told them, were not part of the bargain.',
    dur: 5.0,
  },
  {
    p: 35, x: 98, chamber: 1, cord: 1, cards: 1,
    text: 'The voters returned Burke once, then threw him out. That is the other half of the argument.',
    dur: 4.0,
  },
  {
    p: 433, x: 98, chamber: 1, cord: 1, cards: 1,
    quote: {
      id: 'lq-political-political-38-1',
      text: 'Your representative owes you, not his industry only, but his judgment; and he betrays you if he sacrifices it to your opinion.',
      author: 'Edmund Burke',
      philosopherId: 'edmund-burke',
      work: 'Speech to the Electors of Bristol',
      era: '1774',
      branchSlugs: ['political-philosophy'],
    },
    dur: 4.8,
  },
  {
    p: 177, x: 98, chamber: 1, cord: 1, cards: 1,
    interact: {
      prompt: 'Which one would you send to the chamber?',
      poll: {
        options: [
          { id: 'delegate', reads: 'a delegate, carrying what you instruct', holders: ['Jean-Jacques Rousseau'] },
          { id: 'trustee', reads: 'a trustee, owing you his judgement', holders: ['Edmund Burke'], correct: true },
          { id: 'party', reads: 'a partisan, holding the line he was selected on' },
        ],
      },
      explain: 'A trustee, on the argument, and the cost is real. Instructions can be checked against a record; judgement cannot, because any vote at all can be described as the judgement he was sent to use. Watch the cord: taut, he is accountable and useless in a debate.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Slack in the Cord',
      points: [
        'A delegate carries instructions, a trustee carries judgement',
        'Elections do not say which you handed over',
        'Judgement is what a messenger cannot supply',
        'Instructions are what you can hold somebody to',
      ],
      closing: 'Every argument about a broken promise is this argument in different clothes. Decide which one you meant before you decide who betrayed you.',
    },
    dur: 3.6,
  },
];
