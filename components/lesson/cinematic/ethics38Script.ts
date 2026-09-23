import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic ethics-ethics-38, "Why Your Own Child Comes First"
// Theme: A BALANCE WITH ONE LIFE IN EACH PAN, AND A RACK OF REASONS ABOVE IT.
//
// The impartial rule is drawn as a balance that starts level: one disc in each
// pan, MY CHILD on the left and A STRANGER on the right, and nothing about the
// picture says which of them anybody knows. That is the whole of impartiality in
// one object, and it is why the object has to come first.
//
// Above it hangs a rack of three weights, each a reason somebody might give for
// leaning. Two of them an outsider could weigh as easily as you can. One of them
// only you can weigh, and that is the one the rule refuses.
//
// GAMIFIED SHAPE:
//   · beat 3  SCENE TARGETS — the three weights, and the reader picks the one an
//     impartial rule may not take. The weights are on the stage rather than in
//     the deck because the point is that they all LOOK like reasons.
//   · beat 7  a DRAG — how much a tie may weigh. The beam is the rail's readout:
//     the block on the left pan grows and the whole balance leans as the reader
//     moves, so the question is answered by tilting the picture rather than by
//     agreeing with a sentence.
// ─────────────────────────────────────────────────────────────────────────────

export interface Ethics38Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the balance stands, level, with a disc in each pan. */ beam?: number;
  /** 1 = the rack of three reasons hangs above it. */ weights?: number;
  /** How far the beam leans toward the near pan, 0 (level) … 1 (hard over). */ tilt?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
  /** 1 = both discs flash together, marking that each life counts the same regardless of whose it is. */ equal?: number;
}

export const BEATS: Ethics38Beat[] = [
  {
    p: 164, x: 46, beam: 1,
    text: 'Suppose two children are drowning and you can save only one. One of them is your own child.',
    dur: 3.8,
  },
  {
    p: 2, x: 46, beam: 1, equal: 1,
    text: 'Impartial moral theories set aside whose child is whose. Each life counts equally, whoever it belongs to.',
    dur: 4.4,
  },
  {
    p: 36, x: 46, beam: 1, weights: 1,
    text: 'The question is which reasons for favouring one child an impartial rule can accept.',
    dur: 3.2,
  },
  {
    p: 159, x: 46, beam: 1, weights: 1, live: 1,
    interact: {
      prompt: 'Which of the three reasons can an impartial rule not accept?',
      explain: 'She is mine. Nearness and the good that follows are facts anyone could weigh equally. A relation to you gives a reason only to you, and an impartial rule excludes such reasons.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 176, x: 46, beam: 1, weights: 1,
    text: 'William Godwin accepted the strictest version. Faced with a fire, he said, save Archbishop Fénelon rather than his maid, even if she is your mother.',
    dur: 4.6,
  },
  {
    p: 35, x: 90, beam: 1, weights: 1, tilt: 0.35,
    text: 'Bernard Williams replies that the tie itself is a reason. A parent who saves their own child needs no impartial permission.',
    dur: 4.0,
  },
  {
    p: 433, x: 90, beam: 1, tilt: 0.35,
    quote: {
      id: 'lq-ethics-ethics-38-1',
      text: 'This construction provides the agent with one thought too many.',
      author: 'Bernard Williams',
      philosopherId: 'bernard-williams',
      work: 'Moral Luck',
      era: '1981',
      branchSlugs: ['ethics'],
    },
    dur: 4.0,
  },
  {
    p: 21, x: 90, beam: 1, tilt: 0.35,
    interact: {
      prompt: 'Put these in order, from least weight to most.',
      order: {
        axis: 'LEAST WEIGHT FIRST',
        items: [
          { id: 'none', reads: 'NO WEIGHT AT ALL' },
          { id: 'little', reads: 'A LITTLE, IF JUSTIFIED' },
          { id: 'lots', reads: 'ENOUGH, WITH NO FURTHER REASON' },
          { id: 'all', reads: 'ALL OF IT, STRANGERS COUNT FOR NOTHING' },
        ],
      },
      explain: 'The third. A parent who stops to justify saving their own child has, as Williams put it, one thought too many; but partiality that wipes strangers out altogether isn\'t a relationship, it\'s a licence. What\'s asked for is weight, not permission.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Weight of Being Yours',
      points: [
        'Impartial rules weigh a life without asking whose it is',
        'A personal tie is the reason impartial rules exclude',
        'Godwin applied the impartial verdict even to your own mother',
        'Williams: needing permission to favour your own is one thought too many',
      ],
      closing: 'The question is not whether you would save your own child, but what reason you would be acting on.',
    },
    dur: 3.2,
  },
];
