import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic epistemology-knowledge-10, "Can You Know Without Being Certain?" —
// fallibilism. The stage is a single gauge running from a guess to absolute
// certainty. The old demand lights only the last sliver of it; fallibilism opens
// a wide band well short of the end, and the needle keeps moving inside that band
// without ever leaving it, which is what "open to revision" looks like.
//
// Both graded questions come from
// data/branches/epistemology/.../living-without-certainty.ts. Q1 — where knowledge
// begins relative to certainty — is answered ON the gauge by planting a flag; Q2
// is the deck question about whether admitting error cancels belief.
// ─────────────────────────────────────────────────────────────────────────────

export interface E10Beat extends BaseBeat {
  /** Narrator gesture (emote code). */ p?: number;
  /** Narrator mark on the ground. */ x?: number;
  /** 0 gauge dark · 1 gauge drawn. */ gauge?: number;
  /** 0 no band · 1 the certainty demand (a sliver) · 2 the fallibilist band. */ band?: number;
  /** Where the needle sits along the gauge, 0→1. */ needle?: number;
  /** The needle is being revised — it slides and the gauge ticks. */ revise?: boolean;
  /** The three flags for the tap question. */ flags?: boolean;
  /** 1 = a "?" hangs where the gauge will be drawn — the open question, before it exists. */ openQ?: number;
  /** 1 = a ring marks the needle — sitting inside the band, error and all. */ compatRing?: number;
  /** 1 = small up/down arrows flank the needle — confidence rising or falling. */ riseFall?: number;
}

export const BEATS: E10Beat[] = [
  {
    p: 462, x: 92, gauge: 0, needle: 0.62,
    text: 'You aren’t absolutely certain that the sun will rise tomorrow. Even so, you’d bet heavily that it will.',
    dur: 2.7,
  },
  {
    p: 462, x: 92, gauge: 0, needle: 0.62, openQ: 1,
    text: 'Can you know that the sun will rise without being certain of it?',
    dur: 1.8,
  },
  {
    p: 383, x: 92, gauge: 1, band: 1, needle: 0.62,
    text: 'One old answer, called infallibilism, says you know something only if you couldn’t be wrong. Held strictly, that rules out almost everything, even the sunrise and your own name.',
    cite: 'The demand for certainty',
    dur: 5.0,
  },
  {
    p: 33, x: 92, gauge: 1, band: 2, needle: 0.62,
    text: 'Fallibilism, a term introduced by Charles Sanders Peirce, rejects that standard. You can know something even though you might be wrong.',
    cite: 'Fallibilism',
    dur: 3.1,
  },
  {
    p: 260, x: 92, gauge: 1, band: 2, needle: 0.62, compatRing: 1,
    text: 'On this view, knowledge is compatible with the possibility of error.',
    dur: 1.8,
  },
  {
    p: 128, x: 160, gauge: 1, band: 2, needle: 0.62,
    quote: {
      id: 'lq-epistemology-knowledge-10-1',
      text: 'To teach how to live without certainty, and yet without being paralyzed by hesitation, is perhaps the chief thing philosophy can do.',
      author: 'Bertrand Russell',
      work: 'A History of Western Philosophy',
      era: '1945',
      philosopherId: 'russell',
      branchSlugs: ['epistemology'],
    },
    dur: 3.4,
  },
  {
    p: 5, x: 160, gauge: 1, band: 2, needle: 0.78, revise: true,
    text: 'Science shows that knowledge and fallibility can coexist. Its theories stay open to revision, yet science has produced a great deal of knowledge.',
    cite: 'Revision as a strength',
    dur: 2.5,
  },
  {
    p: 259, x: 160, gauge: 1, band: 2, needle: 0.78, revise: true, riseFall: 1,
    text: 'As new evidence arrives, confidence in a theory rises or falls. Such revision is part of scientific method, not a sign of its failure.',
    dur: 2.7,
  },
  {
    p: 380, x: 228, gauge: 1, band: 2, needle: 0.78, flags: true,
    interact: {
      prompt: 'On the fallibilist view, where on the gauge does knowledge begin?',
      explain:
        'Good evidence, still open. Knowledge begins well past a guess and well short of certainty. The flag marked “only when you cannot be wrong” is the infallibilist standard, which fallibilism rejects. Held strictly, that standard would leave almost nothing known.',
    },
    dur: 4.6,
  },
  {
    p: 177, x: 228, gauge: 1, band: 2, needle: 0.78,
    interact: {
      prompt: 'How firmly can a fallibilist hold a belief they admit might be wrong?',
      drag: {
        lo: 'BARELY AT ALL',
        hi: 'BEYOND ANY QUESTION',
        start: 0,
        zones: [
          { id: 'hedge', upto: 0.28, reads: 'barely: a hedge rather than a belief' },
          { id: 'firm', upto: 0.74, reads: 'fully, yet open to being shown wrong', correct: true },
          { id: 'closed', upto: 1, reads: 'so firmly that no evidence could shake it' },
        ],
      },
      explain: 'Fully, while remaining open to being shown wrong. Admitting that you might be wrong isn’t hedging. A fallibilist can believe firmly and act on the belief. What a fallibilist rejects is a belief that no evidence could change.',
    },
    dur: 4.4,
  },
  {
    summary: {
      title: 'Knowing With Humility',
      points: [
        'Fallibilism: knowledge without absolute certainty',
        'Beliefs stay open to revision by evidence',
        'Science advances by correcting its theories',
        'Firm belief and openness to error can coexist',
      ],
      closing:
        'A fallibilist claims knowledge and remains ready to revise it when new evidence arrives.',
    },
    dur: 4.0,
  },
];
