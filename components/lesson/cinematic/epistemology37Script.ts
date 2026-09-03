import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic epistemology-knowledge-37, "The Shipowner's Belief"
// Theme: A HULL WITH CRACKS IN IT, AND A MAN PAINTING OVER THEM ONE AT A TIME.
//
// Clifford's case is about a PROCESS, so the picture is a process: five doubts
// drawn as cracks in a hull, and they go out one by one as he talks himself
// round. The ship never changes. Only the marks on the drawing do, which is
// exactly the difference between checking a thing and settling your mind about it.
//
// The lesson's sharpest move is the counterfactual, and it is staged: on beat 6
// the SAME hull sails and arrives safely, cracks still in it, and the verdict
// card does not change. Clifford's claim is that luck is irrelevant, and the
// reader is shown the luck happening.
//
// GAMIFIED SHAPE:
//   · beat 2  a DRAG — how much evidence is enough before he may believe her
//     sound? The readout names the standard at each point, and the cracks fade as
//     the reader raises the bar, so the two are visibly the same question.
//   · beat 7  two CARDS — the strongest objection, which is James's.
// ─────────────────────────────────────────────────────────────────────────────

export interface Epistemology37Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the hull is drawn. */ hull?: number;
  /** How many of the five doubts have been talked away, 0…1. */ quiet?: number;
  /** 1 = the reader's thumb is on the evidence rail. */ live_d?: number;
  /** 1 = she has sailed, and the wake is drawn. */ sailed?: number;
  /** 1 = the verdict card stands beside the hull. */ verdict?: number;
  /** 1 = the ship arrived safely — same hull, same cracks. */ safe?: number;
}

export const BEATS: Epistemology37Beat[] = [
  {
    p: 25, x: 54, hull: 1,
    text: 'An old ship, due to carry emigrants. Her owner has five separate reasons to doubt she is sound.',
    dur: 3.8,
  },
  {
    p: 4, x: 54, hull: 1, live_d: 1,
    interact: {
      prompt: 'Set the bar. How much would he need before he may believe her seaworthy?',
      drag: {
        lo: 'A FEELING WILL DO',
        hi: 'SURVEY EVERY PLANK',
        start: 0.1,
        zones: [
          { id: 'lax', upto: 0.3, reads: 'whatever settles his mind' },
          { id: 'fair', upto: 0.72, reads: 'a survey he did not pay for', correct: true },
          { id: 'mad', upto: 1, reads: 'and nobody ever sails', correct: false },
        ],
      },
      explain: 'Wherever you set it, notice you set it above a feeling. He did not. He worked on himself until the doubts were quiet and then sent her out sincerely convinced, which is the part Clifford will not forgive.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 13, x: 54, hull: 1, quiet: 1,
    text: 'Watch what he actually did. He did not inspect her.',
    dur: 1.9,
  },
  {
    p: 13, x: 54, hull: 1, quiet: 1,
    text: 'The owner put the doubts down, one at a time, until they stopped bothering him.',
    dur: 2.7,
  },
  {
    p: 21, x: 54, hull: 1, quiet: 1, sailed: 1, verdict: 1,
    text: 'Then he took his fee, waved her off, and grieved sincerely when she went down. He never lied to anybody, including himself.',
    dur: 4.6,
  },
  {
    p: 47, x: 54, hull: 1, quiet: 1, sailed: 1, verdict: 1,
    quote: {
      id: 'lq-epistemology-knowledge-37-1',
      text: 'It is wrong always, everywhere, and for anyone, to believe anything upon insufficient evidence.',
      author: 'W.K. Clifford',
      work: 'The Ethics of Belief',
      era: '1877',
      branchSlugs: ['epistemology'],
    },
    dur: 3.8,
  },
  {
    p: 2, x: 54, hull: 1, quiet: 1, sailed: 1, verdict: 1, safe: 1,
    text: 'Now run it again and let her arrive. Same hull, same cracks, same owner.',
    dur: 2.8,
  },
  {
    p: 2, x: 54, hull: 1, quiet: 1, sailed: 1, verdict: 1, safe: 1,
    text: 'Look at the verdict card. It has not moved.',
    dur: 1.8,
  },
  {
    p: 35, x: 126, hull: 1, quiet: 1, verdict: 1, safe: 1,
    interact: {
      prompt: 'James thought the rule too strong. What is his best case against it?',
      cards: [
        { text: 'Some beliefs come before proof', correct: true },
        { text: 'Belief is not under our control', correct: false },
      ],
      explain: 'Control is arguable and would excuse the shipowner too. The real problem is trust: commit to a person, a project or a friendship and the evidence only arrives afterwards. Wait for enough of it and you guarantee you never get any.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 419, x: 126, hull: 1, quiet: 1, verdict: 1, safe: 1,
    text: 'Both are right about different cases. What survives is the shipowner: when other people carry the risk, the checking is not optional.',
    dur: 4.8,
  },
  {
    summary: {
      title: 'What You Owe Before You Believe',
      points: [
        'Belief can be a wrong, not only a mistake',
        'The blame is in the process, not the result',
        'A lucky outcome does not clear you',
        'Some beliefs must be held before they can be tested',
      ],
      closing: 'He is easy to condemn from here. He did what anyone does when checking is expensive and the answer is one they cannot afford.',
    },
    dur: 3.2,
  },
];
