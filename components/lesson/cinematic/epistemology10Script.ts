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
}

export const BEATS: E10Beat[] = [
  {
    p: 25, x: 92, gauge: 0, needle: 0.62,
    text: 'You are not certain the sun will rise tomorrow. You would still bet everything you own on it. So do you know, or don’t you?',
    dur: 3.8,
  },
  {
    p: 1, x: 92, gauge: 1, band: 1, needle: 0.62,
    text: 'One old answer draws the line at the very end of the scale: know it only if you could not possibly be wrong. Held strictly, that leaves almost nothing on the shelf — not the sunrise, not your own name.',
    cite: 'The demand for certainty',
    dur: 5.0,
  },
  {
    p: 33, x: 92, gauge: 1, band: 2, needle: 0.62,
    text: 'Fallibilism moves the line. You can genuinely know something and still admit you could, in principle, be mistaken. Knowing and doubting are allowed in the room together.',
    cite: 'Fallibilism',
    dur: 4.6,
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
    text: 'Watch what science does with that. It never claims the last sliver, and it plainly knows a great deal. Evidence arrives, the needle moves, and nothing has gone wrong — being correctable is the method working, not a confession.',
    cite: 'Why it is a strength',
    dur: 5.2,
  },
  {
    p: 4, x: 228, gauge: 1, band: 2, needle: 0.78, flags: true,
    interact: {
      prompt: 'Fallibilism draws the line somewhere on this gauge. Tap where knowledge begins.',
      explain:
        'Well short of certainty, well past a guess. The trap is the right-hand flag: "know it only when you cannot be wrong" sounds like the rigorous answer, and it is the demand fallibilism rejects. Hold to it and you know nothing at all.',
    },
    dur: 4.6,
  },
  {
    p: 21, x: 228, gauge: 1, band: 2, needle: 0.78,
    mc: {
      prompt: 'A fallibilist says, "I might be wrong about this." Does that mean they do not really believe it?',
      options: [
        { id: 'a', text: 'Yes — admitting you could be wrong cancels the belief', correct: false },
        { id: 'b', text: 'Yes — real belief demands total, doubt-free certainty', correct: false },
        { id: 'c', text: 'No — you can hold and act on a claim while staying open to revising it', correct: true },
        { id: 'd', text: 'No — because fallibilists never actually believe anything', correct: false },
      ],
      explain:
        'The trap is reading "I might be wrong" as hedging. It is not doubt about the claim, it is a standing invitation to evidence. You can commit fully, act on it, and still leave the door open.',
    },
    dur: 4.4,
  },
  {
    summary: {
      title: 'Knowing With Humility',
      points: [
        'Fallibilism: knowledge without absolute certainty',
        'Beliefs stay open to revision by evidence',
        'Science thrives on being correctable',
        'Socratic humility, grown wise and usable',
      ],
      closing:
        'You have now circled the whole question of knowledge. Know boldly, doubt honestly, and never stop asking how you know.',
    },
    dur: 4.0,
  },
];
