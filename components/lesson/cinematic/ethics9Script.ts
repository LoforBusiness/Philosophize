import type { BaseBeat } from './cinematicKit';

// Cinematic ethics-ethics-9, "When Both Choices Are Wrong" — genuine moral
// dilemmas and the residue that survives choosing well.
//
// THE PICTURE: two claims pinned side by side, equally weighted. Over the lesson
// one of them fills in — it is the one he acts on — and the other stays exactly
// where it was, unfilled, and never comes down. The argument IS that the second
// note is still on the board at the end.
//
// Q1 is answered on the board (tap the claim still owed an account — the two notes
// are themselves the targets, plus the tempting third card that says nothing is
// owed). Q2 is A/B/C/D, because "what did the untroubled man miss" needs weighing.

export interface Ethics9Beat extends BaseBeat {
  /** Figure gesture (emote code). */ p?: number;
  /** Where the figure stands (stage x). 70 = downstage left, 168 = at the board. */ x?: number;
  /** The two pinned claims are up, 0..1. */ notes?: number;
  /** Which claim he acts on: 0 neither yet · 2 the right-hand one, filled INK. */ taken?: number;
  /** 1 = the three answer targets are live (Q1). */ pick?: number;
  /** 1 = the STILL OWED tag has appeared under the claim he did not meet. */ owed?: number;
  /**
   * 1 = a forked crack opens in the ground where he stands, marking the
   * two-way choice before either claim is named. A one-beat preview: it
   * closes again once the real claims are pinned up.
   */
  fork?: number;
  /**
   * 1 = the pin over the claim to stay with her grows, marking that the
   * claim now carries real weight.
   */
  weight?: number;
  /**
   * 1 = a small mark appears beside the claim to stay with her, showing it
   * still stands untouched.
   */
  remains?: number;
}

export const BEATS: Ethics9Beat[] = [
  {
    p: 164, x: 70,
    text: 'Most hard choices have a right answer, even when it’s difficult to find. A genuine moral dilemma is different.',
    dur: 2.2,
  },
  {
    p: 164, x: 70, fork: 1,
    text: 'In a genuine dilemma, you ought to do each of two things. You can’t do both.',
    dur: 1.8,
  },
  {
    p: 270, x: 168, notes: 1,
    text: 'During the German occupation, a student asked Sartre for advice. His elder brother had been killed in 1940, and he wanted to join the Free French.',
    cite: 'Two claims',
    dur: 3.1,
  },
  {
    p: 270, x: 168, notes: 1, weight: 1,
    text: 'The student’s mother, however, lived only for him, and his departure would plunge her into despair.',
    dur: 1.9,
  },
  {
    p: 383, x: 124, notes: 1, weight: 1,
    text: 'Neither claim overrides the other, so this is a genuine dilemma. No common scale can weigh one claim against the other.',
    cite: 'No common scale',
    dur: 4.4,
  },
  {
    p: 139, x: 124, notes: 1, weight: 1,
    quote: {
      id: 'lq-ethics-ethics-9-1',
      text: 'No rule of general morality can show you what you ought to do: no signs are vouchsafed in this world.',
      author: 'Jean-Paul Sartre',
      work: 'Existentialism Is a Humanism',
      era: '1946',
      philosopherId: 'jean-paul-sartre',
      branchSlugs: ['ethics'],
    },
    dur: 3.6,
  },
  {
    p: 167, x: 168, notes: 1, taken: 2, weight: 1,
    text: 'Suppose the student joins the Free French. Suppose, too, that his choice is justified.',
    cite: 'A justified choice',
    dur: 2.1,
  },
  {
    p: 167, x: 168, notes: 1, taken: 2, weight: 1, remains: 1,
    text: 'The claim to stay with his mother remains. Acting on the other claim did not cancel it.',
    dur: 2.7,
  },
  {
    p: 6, x: 124, notes: 1, taken: 2, weight: 1, remains: 1, pick: 1,
    interact: {
      prompt: 'If his choice was justified, which claim is still owed something?',
      explain: 'Stay with her. Joining the Free French didn’t cancel his duty to his mother, because that duty was never overridden. It still has a claim on him.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 457, x: 124, notes: 1, taken: 2, weight: 1, remains: 1, owed: 1,
    interact: {
      prompt: 'Does a justified choice in a genuine dilemma leave anything morally lost?',
      sort: {
        chip: 'what was lost',
        bins: [
          { id: 'nothing', label: 'nothing', reads: 'nothing, since the choice was justified' },
          { id: 'third', label: 'a third way', reads: 'a third option he failed to see' },
          { id: 'duty', label: 'a real duty', reads: 'a real duty that went unmet', correct: true },
        ],
      },
      explain: 'A real duty. If a justified choice cancelled the loss, regret would be irrational. Bernard Williams argued that the unmet duty leaves a remainder, so regret is the appropriate response.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Dilemmas and Moral Residue',
      points: [
        'In a genuine dilemma, every option fails a real duty',
        'A justified choice doesn’t cancel the unmet duty',
        'The unmet duty that survives is called moral residue',
        'Regret can be the appropriate response',
      ],
      closing: 'On this view, regret after a justified choice isn’t irrational. It registers a real moral loss.',
    },
    dur: 3.0,
  },
];
