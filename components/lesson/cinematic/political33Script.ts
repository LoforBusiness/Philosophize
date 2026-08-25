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
    text: 'A society decides which ideas to let in. The doors are that decision, and right now the doors stand open to most things.',
    dur: 3.8,
  },
  {
    p: 47, x: 52, open: 1,
    text: 'Open them all the way and everything is admitted. Every argument gets a hearing, which is exactly what a free society is supposed to be for.',
    cite: 'Everything admitted',
    dur: 4.6,
  },
  {
    p: 19, x: 52, open: 1, threat: 1,
    text: 'Then something walks through that intends to shut the doors behind it. Karl Popper noticed the trap in 1945. Unlimited tolerance can be used to end tolerance.',
    cite: 'Popper, 1945',
    dur: 5.0,
  },
  {
    p: 4, x: 52, open: 0.1, threat: 1,
    text: 'So shut the doors. Now look at what you have built. A society that decides in advance which arguments may be heard. That is the very thing you were trying not to become.',
    cite: 'The other horn',
    dur: 5.0,
  },
  {
    p: 137, x: 52, open: 0.1,
    quote: {
      id: 'lq-political-political-33-1',
      text: 'We should claim the right to suppress them if necessary even by force; for it may easily turn out that they are not prepared to meet us on the level of rational argument.',
      author: 'Karl Popper',
      work: 'The Open Society and Its Enemies',
      era: '1945',
      branchSlugs: ['political-philosophy'],
    },
    dur: 4.4,
  },
  {
    p: 4, x: 52, open: 0, live: 1,
    interact: {
      prompt: 'Drag the doors. Stop where Popper would actually stop.',
      drag: {
        lo: 'SHUT',
        hi: 'OPEN TO EVERYTHING',
        start: 0,
        zones: [
          { id: 'closed', upto: 0.3, reads: 'you have banned argument' },
          { id: 'popper', upto: 0.66, reads: 'open, until they refuse to argue', correct: true },
          { id: 'all', upto: 1, reads: 'open to those who will shut it', correct: false },
        ],
      },
      explain: 'Read the line closely. Popper\'s claim is narrower than its reputation. He does not say silence the intolerant. He says argue with them for as long as they will argue, and claim the right to force only once they refuse.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 35, x: 52, open: 0.5,
    text: 'Notice what the test turns on. Not what a movement believes, which anyone can label, but whether it will meet you in an argument at all.',
    cite: 'The test is refusal',
    dur: 4.8,
  },
  {
    p: 45, x: 52, open: 0.5,
    interact: {
      prompt: '"We only suppress the intolerant." Why is the rule on the doors dangerous in practice?',
      cards: [
        { text: 'Someone decides who counts', correct: true },
        { text: 'Nothing, it limits itself', correct: false },
      ],
      explain: 'The rule sounds self-limiting and is not. Somebody has to decide who counts as intolerant, and whoever decides now holds real power. Every government that has silenced its critics called them a danger to public order.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Where To Draw It',
      points: [
        'Unlimited tolerance can be used to end tolerance',
        'Shutting the doors concedes the argument',
        'Popper: argue first, force only against refusal',
        'Whoever draws the line decides who is on each side',
      ],
      closing: 'The hard part was never agreeing there is a line. It is that somebody has to hold the pen.',
    },
    dur: 3.0,
  },
];
