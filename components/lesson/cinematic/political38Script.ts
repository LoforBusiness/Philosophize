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
    text: 'Suppose you elect a representative. Months later, a vote arises on an issue nobody raised during the campaign.',
    dur: 4.0,
  },
  {
    p: 384, x: 52, chamber: 1, cord: 1,
    text: 'Theories of representation disagree about how closely a representative must follow the voters’ wishes.',
    dur: 4.0,
  },
  {
    p: 47, x: 52, chamber: 1, cord: 1, cards: 1,
    text: 'A representative might owe voters obedience to their instructions, independent judgement, or loyalty to a party.',
    dur: 2.6,
  },
  {
    p: 4, x: 52, chamber: 1, cord: 1, cards: 1, live: 1,
    interact: {
      prompt: 'Which of these could a mere messenger not provide?',
      explain: 'His own judgement. A messenger can carry instructions. The party line serves the party, not the voters or the question.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 176, x: 52, chamber: 1, cord: 1, cards: 1,
    text: 'In 1774, newly elected for Bristol, Edmund Burke told voters he would not be bound by their instructions.',
    dur: 5.0,
  },
  {
    p: 35, x: 98, chamber: 1, cord: 1, cards: 1,
    text: 'In 1780 Burke, having lost support in Bristol, withdrew from the election there. Voters can still dismiss a trustee.',
    dur: 4.0,
  },
  {
    p: 433, x: 98, chamber: 1, cord: 1, cards: 1,
    quote: {
      id: 'lq-political-political-38-1',
      text: 'Your representative owes you, not his industry only, but his judgment; and he betrays, instead of serving you, if he sacrifices it to your opinion.',
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
      prompt: 'Which type of representative best serves the voters who elect them?',
      poll: {
        options: [
          { id: 'delegate', reads: 'a delegate, bound by voters’ instructions', holders: ['Jean-Jacques Rousseau'] },
          { id: 'trustee', reads: 'a trustee, using independent judgement', holders: ['Edmund Burke'], correct: true },
          { id: 'party', reads: 'a party member, bound by its programme', holders: ['E. E. Schattschneider'] },
        ],
      },
      explain: 'A trustee, using independent judgement. Voters can’t foresee every question, and judgement is what a representative adds.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Delegates and Trustees',
      points: [
        'A delegate carries instructions, a trustee carries judgement',
        'An election doesn’t say which role voters intended',
        'Judgement is what a messenger cannot supply',
        'Instructions are easier to hold a representative to',
      ],
      closing: 'Disputes over broken campaign promises often turn on whether a representative was elected as a delegate or a trustee.',
    },
    dur: 3.6,
  },
];
