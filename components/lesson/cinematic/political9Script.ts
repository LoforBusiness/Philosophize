import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic political-political-9, "Democracy and Its Critics" — the tyranny of
// the majority. Four figures on the left and one on the right. The four vote, the
// tally comes up seven to one, and then they simply walk toward the one. What
// stops them is not a better argument and not a bigger vote: it is a line drawn
// across the floor that the count does not reach past.
//
// Plato's pilot-and-ship stays in the NARRATION and is not staged — it is his
// analogy for why voting can crown a flatterer, not a claim about anybody on this
// stage (A4).
//
// Both graded questions come from
// data/branches/political-philosophy/.../democracy-and-its-critics.ts. Q1 — what
// the phrase means — is the deck question; Q2, about Mill and the limits of a
// majority vote, is answered on the stage by tapping what actually stops them.
// ─────────────────────────────────────────────────────────────────────────────

export interface P9Beat extends BaseBeat {
  /** The four in the majority, 0 at ease · 1 hands up, voting. */ vote?: number;
  /** They have advanced on the one. */ advance?: boolean;
  /** The tally board is up. */ tally?: boolean;
  /** The rights line is drawn. */ rights?: boolean;
  /** The lone figure's gesture (emote code). */ one?: number;
  /** The three cards for the tap question. */ cards?: boolean;
}

export const BEATS: P9Beat[] = [
  {
    vote: 0, one: 0,
    text: 'Rule by the people. Four of them here, and one over there who wants something the four do not.',
    dur: 3.6,
  },
  {
    vote: 1, tally: true, one: 22,
    text: 'So they vote, and the count is honest, and the count is seven to one. Plato distrusted exactly this: steering a ship takes a pilot, not a show of hands, and govern by popularity and flattery beats wisdom.',
    cite: 'Plato’s doubt',
    dur: 5.2,
  },
  {
    vote: 0, tally: true, advance: true, one: 18,
    text: 'Nothing has gone wrong with the procedure. Everyone got a vote, the larger number won, and now the larger number is walking toward the smaller one. This is democracy working, not democracy failing.',
    cite: 'Tyranny of the majority',
    dur: 5.2,
  },
  {
    vote: 0, tally: true, advance: true, rights: true, one: 137,
    quote: {
      id: 'lq-political-political-9-1',
      text: 'Society can and does execute its own mandates: and if it issues wrong mandates, it practises a social tyranny more formidable than many kinds of political oppression.',
      author: 'John Stuart Mill',
      work: 'On Liberty',
      era: '1859',
      philosopherId: 'mill',
      branchSlugs: ['political-philosophy'],
    },
    dur: 4.0,
  },
  {
    vote: 0, tally: true, advance: true, rights: true, one: 9,
    text: 'Mill and Tocqueville both named the danger and both put the same thing in the way of it. A line the vote does not reach across — which is why a court can strike down a law the majority genuinely wanted.',
    cite: 'Mill, Tocqueville',
    dur: 5.0,
  },
  {
    vote: 0, tally: true, advance: true, rights: true, one: 9,
    interact: {
      prompt: 'What do Mill and Tocqueville mean by "the tyranny of the majority"?',
      cards: [
        { text: 'The majority oppressing a minority', correct: true },
        { text: 'One ruler oppressing everyone', correct: false },
      ],
      explain: 'The danger is internal, which is what makes it hard to see. The trap is the other card: a tyrant is the picture the word brings up, and this tyrant is the electorate. No coup — just a majority closing in on the few.',
    },
    dur: 4.6,
  },
  {
    vote: 0, tally: true, advance: true, rights: true, one: 9, cards: true,
    interact: {
      prompt: 'The four voted fairly and they still cannot pass this line. Tap what is actually holding them.',
      explain:
        'A right is a limit on what any vote may do. The trap is the first card: Mill loved liberty, so it sounds right that he would let the crowd decide. He argued the reverse — a sphere no majority may enter, however large.',
    },
    dur: 4.8,
  },
  {
    summary: {
      title: 'Democracy, Caged Wisely',
      points: [
        'Plato: rule by vote can crown a flatterer',
        'Mill and Tocqueville: majorities can oppress',
        'Rights limit what a vote is allowed to do',
        'Liberal democracy fuses the two',
      ],
      closing: 'A vote decides who rules. Rights decide what no ruler, and no majority, may do.',
    },
    dur: 4.0,
  },
];
