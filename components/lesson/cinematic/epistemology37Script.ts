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
    p: 462, x: 54, hull: 1,
    text: 'Clifford described a shipowner sending an old emigrant ship to sea. The owner had five reasons to doubt she was seaworthy.',
    dur: 3.8,
  },
  {
    p: 4, x: 54, hull: 1, live_d: 1,
    interact: {
      prompt: 'How much evidence would the owner need before he may believe her seaworthy?',
      drag: {
        lo: 'A FEELING OF CONFIDENCE',
        hi: 'SURVEY EVERY PLANK',
        start: 0.1,
        zones: [
          { id: 'lax', upto: 0.3, reads: 'whatever settles his mind' },
          { id: 'fair', upto: 0.72, reads: 'an independent survey of the hull', correct: true },
          { id: 'mad', upto: 1, reads: 'so much that no ship ever sails', correct: false },
        ],
      },
      explain: 'An independent survey of the hull. The owner only wanted a feeling of certainty, and silenced his doubts instead of checking them. Clifford condemns this: a sincere belief that was never earned.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 13, x: 54, hull: 1, quiet: 1,
    text: 'The owner never had the ship inspected.',
    dur: 1.9,
  },
  {
    p: 13, x: 54, hull: 1, quiet: 1,
    text: 'Instead he suppressed his doubts, one at a time, until they no longer troubled him.',
    dur: 2.7,
  },
  {
    p: 380, x: 54, hull: 1, quiet: 1, sailed: 1, verdict: 1,
    text: 'The owner watched her leave with a light heart and collected the insurance when she sank. He sincerely believed she was safe.',
    dur: 4.6,
  },
  {
    p: 433, x: 54, hull: 1, quiet: 1, sailed: 1, verdict: 1,
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
    text: 'Clifford then altered the case: suppose the ship arrived safely, with the same hull and the same owner.',
    dur: 2.8,
  },
  {
    p: 2, x: 54, hull: 1, quiet: 1, sailed: 1, verdict: 1, safe: 1,
    text: 'Clifford’s verdict is unchanged, because the owner had no right to believe on that evidence.',
    dur: 1.8,
  },
  {
    p: 35, x: 126, hull: 1, quiet: 1, verdict: 1, safe: 1,
    interact: {
      prompt: 'What is William James’s strongest objection to Clifford’s rule?',
      cards: [
        { text: 'Some beliefs come before proof', correct: true },
        { text: 'Belief isn’t under voluntary control', correct: false },
      ],
      explain: 'Some beliefs come before proof. James argued that in cases like friendship, believing first can help bring about the evidence. Waiting for proof would then keep the evidence from ever arriving.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 419, x: 126, hull: 1, quiet: 1, verdict: 1, safe: 1,
    text: 'Both are right about different cases. Clifford’s verdict still holds where other people bear the risk of a false belief.',
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
      closing: 'The shipowner is easy to condemn. Clifford’s point is that his fault, stifling doubt when checking is costly, is a common one.',
    },
    dur: 3.2,
  },
];
