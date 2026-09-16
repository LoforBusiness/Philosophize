import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic political-political-33, "Must a Free Society Tolerate Everything?" —
// the DRAG mechanic (../DragScale) as a gate the reader opens and closes.
//
// A row of doors stands for what a society lets in. Dragging the rail swings them
// open, and the readout says what has just been admitted. Both ends are bad and
// the reader can feel both: at one end a movement walks in that will shut the
// doors behind it, at the other the doors are already shut and the society has
// conceded the argument it was trying to win.
//
// The graded zone is the middle, and the explanation is careful that this is
// POPPER'S narrow test rather than the licence-to-ban he is usually quoted as.
// ─────────────────────────────────────────────────────────────────────────────

export interface Political33Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** How far the doors stand open, 0 (shut) … 1 (everything admitted). */ open?: number;
  /** 1 = the figure that will shut the doors is standing in the gateway. */ threat?: number;
  /** 1 = the reader is driving the doors from the rail (Q1). */ live?: number;
}

export const BEATS: Political33Beat[] = [
  {
    p: 25, x: 52, open: 0.55,
    text: 'Every free society must decide how far to tolerate ideas and movements that oppose it.',
    dur: 3.8,
  },
  {
    p: 440, x: 52, open: 1,
    text: 'Unlimited tolerance lets every view in the door. Even a view that hates tolerance itself still gets heard and gets a fair say.',
    cite: 'Unlimited tolerance',
    dur: 4.6,
  },
  {
    p: 19, x: 52, open: 1, threat: 1,
    text: 'Suppose a movement uses that freedom to abolish it. Karl Popper named this the paradox of tolerance in 1945.',
    cite: 'Popper, 1945',
    dur: 3.5,
  },
  {
    p: 169, x: 52, open: 1, threat: 1,
    text: 'Unlimited tolerance can be used to end tolerance. Popper argues that the intolerant, left unchecked, destroy the tolerant.',
    dur: 1.8,
  },
  {
    p: 160, x: 52, open: 0.1, threat: 1,
    text: 'The opposite approach fails too. A society that shuts out every view it finds threatening has given up on tolerance.',
    cite: 'The other horn',
    dur: 1.8,
  },
  {
    p: 160, x: 52, open: 0.1, threat: 1,
    text: 'Deciding in advance which arguments may be heard is the very intolerance the policy set out to prevent.',
    dur: 3.3,
  },
  {
    p: 465, x: 52, open: 0.1,
    quote: {
      id: 'lq-political-political-33-1',
      text: 'We should claim the right to suppress them if necessary even by force; for it may easily turn out that they are not prepared to meet us on the level of rational argument.',
      author: 'Karl Popper',
      philosopherId: 'karl-popper',
      work: 'The Open Society and Its Enemies',
      era: '1945',
      branchSlugs: ['political-philosophy'],
    },
    dur: 4.4,
  },
  {
    p: 380, x: 52, open: 0, live: 1,
    interact: {
      prompt: 'How far should a free society extend tolerance, on Popper’s view?',
      drag: {
        lo: 'SHUT',
        hi: 'OPEN TO EVERYTHING',
        start: 0,
        zones: [
          { id: 'closed', upto: 0.3, reads: 'no tolerance for opposing views' },
          { id: 'popper', upto: 0.66, reads: 'tolerance until a movement refuses to argue', correct: true },
          { id: 'all', upto: 1, reads: 'tolerance even for people who would end tolerance', correct: false },
        ],
      },
      explain: 'Tolerance until a movement refuses to argue. Popper doesn’t say the intolerant should be silenced. While argument and public opinion can check them, suppression would be unwise. He claims a right to use force only against those who reject argument.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 396, x: 52, open: 0.5,
    text: 'However, Popper’s test concerns conduct, not belief: whether a movement will meet its opponents in argument at all.',
    cite: 'Conduct, not belief',
    dur: 4.8,
  },
  {
    p: 379, x: 52, open: 0.5,
    interact: {
      prompt: 'Why is a rule to suppress only the intolerant dangerous in practice?',
      cards: [
        { text: 'Someone must decide who counts', correct: true },
        { text: 'The rule limits itself', correct: false },
      ],
      explain: 'Someone must decide who counts as intolerant, and a government may brand its critics that way.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Paradox of Tolerance',
      points: [
        'Unlimited tolerance can be used to end tolerance',
        'Suppressing every opposing view abandons tolerance',
        'Popper: argue first, force only against refusal',
        'Whoever applies the limit gains power over opponents',
      ],
      closing: 'Accepting a limit on tolerance is the easier step. The harder question is who decides when a movement has crossed it.',
    },
    dur: 3.0,
  },
];
