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
  /** 1 = a dashed ring highlights the STOOD BACK panel, for the second man. */ focus2?: number;
  /** 1 = a check marks the SAME OUTCOME tag, for the outcome specifically. */ stress?: number;
}

export const BEATS: Ethics35Beat[] = [
  {
    p: 462, x: 54, pair: 1,
    text: 'Consider James Rachels’ case of two men and a child in the water. The first man holds the child under until he drowns.',
    dur: 2.4,
  },
  {
    p: 462, x: 54, pair: 1, focus2: 1,
    text: 'The second man sees the child slip under the water and does nothing to save him.',
    dur: 2.2,
  },
  {
    p: 168, x: 54, pair: 1, live: 1,
    tap: {
      prompt: 'Which of the two men would you call a killer?',
      options: [
        { id: 'pusher', text: 'The one who reached in', correct: true },
        { id: 'watcher', text: 'The one who watched', correct: false },
      ],
      explain: 'Most people choose the man who reached in, and without hesitation. The rest of the lesson tests whether that verdict survives once the two cases are matched.',
    },
    dur: 1.0,
  },
  {
    p: 160, x: 54, pair: 1, tags: 2,
    text: 'Now match the two cases. Both men have the same motive, since each stands to inherit if the child dies.',
    dur: 2.4,
  },
  {
    p: 160, x: 54, pair: 1, tags: 2, stress: 1,
    text: 'The outcome is the same as well, since the child dies in both cases.',
    dur: 1.8,
  },
  {
    p: 380, x: 54, pair: 1, tags: 4, beam: 1, tip: 1, live: 1,
    interact: {
      prompt: 'With motive, outcome, relation and certainty matched, how much worse is the killing?',
      drag: {
        lo: 'THE SAME',
        hi: 'FAR WORSE',
        start: 0.5,
        zones: [
          { id: 'same', upto: 0.28, reads: 'no difference at all' },
          { id: 'some', upto: 0.66, reads: 'a little worse', correct: true },
          { id: 'far', upto: 1, reads: 'as different as a killer and a bystander' },
        ],
      },
      explain: 'A little worse. Matched, the cases no longer look like a killer and a bystander, and most of the gap disappears. Rachels argues that the remainder is not a moral difference at all.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 433, x: 54, pair: 1, tags: 4, beam: 1,
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
    p: 383, x: 132, pair: 1, tags: 4, beam: 1,
    text: 'Defenders of the distinction reply that real cases are rarely matched like this. Killing and letting die usually differ in other ways too.',
    dur: 4.0,
  },
  {
    p: 4, x: 132, pair: 1, tags: 4, beam: 1, live: 1,
    interact: {
      prompt: 'Which matched feature is rarely equal outside a thought experiment?',
      explain: 'Certainty. Someone who kills knows the outcome. Someone who stands back is usually unsure what will happen, or whether they could prevent it. The everyday rule reflects that contrast, so it can guide ordinary cases well even though matched cases undermine it.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Same Result, Two Verdicts',
      points: [
        'Killing usually seems worse than letting die',
        'A matched pair removes every other difference',
        'In matched cases, the apparent gap shrinks or disappears',
        'The distinction may hold for ordinary cases without being fundamental',
      ],
      closing: 'Rachels holds that the bare difference carries no moral weight. His critics reply that real cases are rarely bare, so the everyday rule is still a good guide.',
    },
    dur: 3.2,
  },
];
