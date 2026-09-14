import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic political-political-9, "Democracy and Its Critics" — the tyranny of
// the majority. Four figures on the left and one on the right. The four vote, the
// tally comes up four to one, and then they simply walk toward the one. What
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
    vote: 0, one: 461,
    text: 'Democracy is rule by the people. Consider five citizens: four want one thing, and the fifth wants something else.',
    dur: 3.6,
  },
  {
    vote: 1, tally: true, one: 22,
    text: 'They hold an honest vote, and the result is four to one. Plato distrusted such votes: a ship needs a trained navigator, not a show of hands.',
    cite: 'Plato’s ship of state',
    dur: 3.8,
  },
  {
    vote: 1, tally: true, one: 22,
    text: 'In Plato’s analogy, a crew that chooses its captain by vote follows whoever flatters it best.',
    dur: 1.8,
  },
  {
    vote: 0, tally: true, advance: true, one: 18,
    text: 'The procedure worked. Everyone voted, the larger side won, and that side now forces its will on the smaller one.',
    cite: 'Tyranny of the majority',
    dur: 4.1,
  },
  {
    vote: 0, tally: true, advance: true, one: 18,
    text: 'This is democracy working, not democracy failing. Alexis de Tocqueville called the danger the tyranny of the majority.',
    dur: 1.8,
  },
  {
    vote: 0, tally: true, advance: true, rights: true, one: 465,
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
    vote: 0, tally: true, advance: true, rights: true, one: 378,
    text: 'Mill and Tocqueville both held that a majority’s power has limits no vote may cross. Constitutional rights enforced by courts express the same principle.',
    cite: 'Limits on the majority',
    dur: 5.0,
  },
  {
    vote: 0, tally: true, advance: true, rights: true, one: 163,
    interact: {
      prompt: 'Where does the oppression come from when a fair vote goes against a minority?',
      sort: {
        chip: 'oppression after a fair vote',
        bins: [
          { id: 'one', label: 'one ruler', reads: 'a single ruler imposing his will on all' },
          { id: 'outside', label: 'an outside power', reads: 'a foreign power imposing its will' },
          { id: 'many', label: 'the many', reads: 'the majority pressing on the minority', correct: true },
        ],
      },
      explain: 'The many. A fair vote can still oppress, since the larger side, not one tyrant, forces its will on the smaller. Mill warned that this social tyranny is harder to escape than many kinds of political oppression.',
    },
    dur: 4.6,
  },
  {
    vote: 0, tally: true, advance: true, rights: true, one: 173, cards: true,
    interact: {
      prompt: 'If a vote was fair, what can still stop the majority from acting on it?',
      explain:
        'A right the vote cannot touch. A right limits what any vote may decide, so neither a more careful count nor a bigger majority removes it. Mill defended a sphere of individual liberty that no majority may enter.',
    },
    dur: 4.8,
  },
  {
    summary: {
      title: 'Democracy and Its Limits',
      points: [
        'Plato: voting can put a flatterer in power',
        'Mill and Tocqueville: majorities can oppress',
        'Rights limit what a vote is allowed to do',
        'Liberal democracy combines majority rule with protected rights',
      ],
      closing: 'A vote decides who rules. Rights decide what no ruler, and no majority, may do.',
    },
    dur: 4.0,
  },
];
