import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic epistemology-knowledge-36, "Are You the Expert on You?"
// Theme: FOUR IDENTICAL THINGS ON A COUNTER, AND A REASON THAT ARRIVES LATE.
//
// The four pairs are drawn IDENTICALLY, from one set of numbers, so the reader
// cannot find a difference because there is none in the file either. That is the
// experiment's whole design and it should be true of the picture too (A1).
//
// The confabulation is staged as two labels that do not match: the REAL CAUSE
// rises from under the counter (position) while the GIVEN REASON appears beside
// the shopper's head (knit, sheerness). Both are drawn; neither is called a lie.
//
// GAMIFIED SHAPE:
//   · beat 2  a SCENE TARGET — tap the pair you would take. Four options, all
//     identical, and the tap is scored on the rightmost because that is what
//     four in five shoppers did. The reader usually gets it right and cannot
//     say why, which is the lesson happening to them before it is explained.
//   · beat 7  two CARDS — how much of self-knowledge this actually threatens.
// ─────────────────────────────────────────────────────────────────────────────

export interface Epistemology36Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the counter and its four pairs are drawn. */ shelf?: number;
  /** 1 = the given reason is shown beside the head. */ given?: number;
  /** 1 = the real cause is shown under the counter. */ real?: number;
  /** 1 = the two labels are shown side by side, refusing to match. */ clash?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
  /** 1 = a question mark rises over the row: the shoppers are being asked. */ ask?: number;
  /** 0…2 = how many stated reasons have piled up beside the given-reason card. */ tally?: number;
  /** 1 = a check mark confirms the stated reason was sincerely held. */ sincere?: number;
  /** 1 = a check mark confirms the shopper's own judgement of the pair. */ judgeOk?: number;
  /** 1 = a blocked mark shows the causal process itself cannot be seen. */ blind?: number;
}

export const BEATS: Epistemology36Beat[] = [
  {
    p: 164, x: 56, shelf: 1,
    text: 'Consider four pairs of stockings laid out on a counter. All four pairs are identical.',
    dur: 2.8,
  },
  {
    p: 164, x: 56, shelf: 1, ask: 1,
    text: 'Richard Nisbett and Timothy Wilson asked shoppers which pair was the best quality. Nobody was told the pairs were identical.',
    dur: 1.8,
  },
  {
    p: 461, x: 56, shelf: 1, live: 1,
    interact: {
      prompt: 'Which pair would you judge to be the best quality?',
      explain: 'The pair on the right was chosen most often, although all four were identical. Shoppers preferred it to the pair on the left by almost four to one. Nisbett and Wilson suggest a shopper’s habit of holding off on the first items seen, in favour of later ones.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 13, x: 56, shelf: 1, given: 1,
    text: 'Asked to explain their choice, the shoppers gave reasons about the stockings themselves.',
    dur: 2.5,
  },
  {
    p: 266, x: 56, shelf: 1, given: 1, tally: 1,
    text: 'Some said their pair had a better knit. Others pointed to a finer weave.',
    dur: 1.8,
  },
  {
    p: 266, x: 56, shelf: 1, given: 1, tally: 2,
    text: 'Still others cited sheerness or elasticity, the way a pair felt. However, the four pairs didn’t differ in any of these respects.',
    dur: 1.8,
  },
  {
    p: 176, x: 56, shelf: 1, given: 1, real: 1, tally: 2,
    text: 'In fact, the choices were influenced by position in the row. Asked directly, nearly every shopper denied that position had played a part.',
    dur: 2.4,
  },
  {
    p: 176, x: 56, shelf: 1, given: 1, real: 1, tally: 2, sincere: 1,
    text: 'The denials were sincere. The effect of position was hidden from the shoppers themselves.',
    dur: 2.2,
  },
  {
    p: 385, x: 56, shelf: 1, given: 1, real: 1, clash: 1, tally: 2, sincere: 1,
    quote: {
      id: 'lq-epistemology-knowledge-36-1',
      text: 'Evidence is reviewed which suggests that there may be little or no direct introspective access to higher order cognitive processes.',
      author: 'Richard E. Nisbett and Timothy D. Wilson',
      work: 'Telling More Than We Can Know',
      era: '1977',
      branchSlugs: ['epistemology'],
    },
    dur: 3.6,
  },
  {
    p: 167, x: 56, shelf: 1, given: 1, real: 1, clash: 1, tally: 2, sincere: 1, judgeOk: 1,
    text: 'Each shopper could correctly report which pair seemed best. Nisbett and Wilson grant that people know such judgements.',
    dur: 2.6,
  },
  {
    p: 400, x: 56, shelf: 1, given: 1, real: 1, clash: 1, tally: 2, sincere: 1, judgeOk: 1, blind: 1,
    text: 'The process behind the choice went unobserved. Introspection, the mind’s view of itself, couldn’t detect it.',
    dur: 1.8,
  },
  {
    p: 12, x: 128, shelf: 1, clash: 1,
    text: 'Nisbett and Wilson argue that people infer a likely cause from what’s in front of them. Because the inference goes unnoticed, it feels like memory.',
    dur: 4.6,
  },
  {
    p: 45, x: 128, shelf: 1, clash: 1,
    interact: {
      prompt: 'Where does the study\'s doubt fall?',
      sort: {
        chip: 'THE DOUBT',
        bins: [
          { id: 'feel', label: 'ON FEELINGS', reads: 'on what you feel, not on why you act' },
          { id: 'both', label: 'ON BOTH', reads: 'on both about equally' },
          { id: 'why', label: 'ON REASONS', reads: 'on why you act, not on what you feel', correct: true },
        ],
      },
      explain: 'On why you act. Subjects reported reasons confidently for choices the experimenters had steered, so the account of the cause was invented after the fact. That you feel uneasy isn\'t what the study puts in doubt; it\'s your story about the cause.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Introspection and Its Limits',
      points: [
        'People can report their own feelings and judgements',
        'They have poor access to the processes that produce them',
        'They infer a likely cause and report it as a reason',
        'The inference goes unnoticed, so it feels like memory',
      ],
      closing: 'A wrong report feels the same as a right one. So introspection gives no warning when a stated reason is false.',
    },
    dur: 3.2,
  },
];
