import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic ethics-ethics-35, "Pushing and Letting Go"
// Theme: A BEAM THAT WILL NOT SIT LEVEL, HOWEVER MATCHED THE TWO PANS ARE.
//
// Two panels stand side by side — one hand reaching out, one hand held back —
// and a balance beam above them tips as the reader decides. That tip is the
// question: it is not a diagram of the answer, it is the answer being given.
//
// The staging does the arguing. Every time a beat matches one more variable
// between the two men, a tag lights under BOTH panels at once, so the reader
// watches the differences being removed one at a time and can see that when the
// last one goes, their own beam is still not level.
//
// GAMIFIED SHAPE:
//   · beat 4  a DRAG — tip the beam yourself. The readout names the verdict at
//     each angle, so the reader finds out what they think by feeling for it.
//   · beat 7  a SCENE TARGET — tap the tag that is doing the real work in
//     ordinary cases, which is the defender's whole reply.
//   · beat 2  an UNGRADED tap, for play: which of the two men is Smith?
// ─────────────────────────────────────────────────────────────────────────────

export interface Ethics35Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the two panels stand on stage. */ pair?: number;
  /** How many of the four matching tags are lit, 0…4. */ tags?: number;
  /** 1 = the balance beam is drawn above. */ beam?: number;
  /** 1 = the reader's thumb is driving the beam (the drag beat). */ tip?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Ethics35Beat[] = [
  {
    p: 25, x: 54, pair: 1,
    text: 'Two men, one afternoon, one drowning child. The first reaches in and holds him under. The second sees the boy slip under and puts his hands in his pockets.',
    dur: 4.6,
  },
  {
    p: 13, x: 54, pair: 1, live: 1,
    tap: {
      prompt: 'Tap the one you would call a killer.',
      options: [
        { id: 'pusher', text: 'The one who reached in', correct: true },
        { id: 'watcher', text: 'The one who watched', correct: false },
      ],
      explain: 'Almost everyone taps the first, quickly, and without needing to think. Hold on to how fast that was — the rest of the lesson is about whether it survives being slowed down.',
    },
    dur: 1.0,
  },
  {
    p: 4, x: 54, pair: 1, tags: 2,
    text: 'Now match them. Same motive: both want the inheritance. Same result: the boy dies either way.',
    dur: 4.2,
  },
  {
    p: 21, x: 54, pair: 1, tags: 4, beam: 1, tip: 1, live: 1,
    interact: {
      prompt: 'Every difference is gone but one. Tip the beam to where you actually stand.',
      drag: {
        lo: 'THE SAME',
        hi: 'FAR WORSE',
        start: 0.5,
        zones: [
          { id: 'same', upto: 0.28, reads: 'no difference at all' },
          { id: 'some', upto: 0.66, reads: 'worse, but not by much', correct: true },
          { id: 'far', upto: 1, reads: 'a killer and a bystander' },
        ],
      },
      explain: 'Wherever you stopped, notice you did not stop at the far end — and you were at the far end thirty seconds ago, before anything was matched. The gap shrank as the differences were removed. That is Rachels’ point, felt rather than argued.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 47, x: 54, pair: 1, tags: 4, beam: 1,
    quote: {
      id: 'lq-ethics-ethics-35-1',
      text: 'The bare difference between killing and letting die does not, in itself, make a moral difference.',
      author: 'James Rachels',
      work: 'Active and Passive Euthanasia',
      era: '1975',
      branchSlugs: ['ethics'],
    },
    dur: 3.6,
  },
  {
    p: 35, x: 132, pair: 1, tags: 4, beam: 1,
    text: 'The defenders have a good reply, and it is not stubbornness. Real cases are never matched like this.',
    dur: 4.0,
  },
  {
    p: 4, x: 132, pair: 1, tags: 4, beam: 1, live: 1,
    interact: {
      prompt: 'Tap the tag that is almost never really equal outside a thought experiment.',
      explain: 'Certainty. A person who acts knows what will happen; a person who stands back usually does not, and often could not have stopped it anyway. Our rule is tuned to that ordinary case, which is why it can be right without surviving a case built to strip it bare.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Same Result, Two Verdicts',
      points: [
        'Doing usually strikes us as worse than allowing',
        'A matched pair removes every other difference',
        'Matched, the gap shrinks and may vanish',
        'It may be a rule for ordinary cases, not a truth',
      ],
      closing: 'The distinction holds up everywhere except the one place anyone tested it. People who agree on every fact still land in different places, and you just felt why.',
    },
    dur: 3.2,
  },
];
