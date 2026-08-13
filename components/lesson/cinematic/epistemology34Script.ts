import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic epistemology-knowledge-34, "How Sure Are You, Really?" — the DRAG
// mechanic (../DragScale) driving TWO bars instead of one picture.
//
// The left bar is what you claim and the reader owns it. The right bar is how
// often that claim holds, and it rises far more slowly. Nobody has to be told the
// gap opens at the top: they open it themselves, and they can feel the right-hand
// bar refusing to keep up under their thumb. That is the lesson as a gesture.
// ─────────────────────────────────────────────────────────────────────────────

export interface Epistemology34Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** What is being claimed, 0 (a coin flip) … 1 (certain). */ claim?: number;
  /** 1 = the reader is driving the claim from the rail (Q1). */ live?: number;
  /** 1 = the gap between the two bars is called out. */ gap?: number;
}

export const BEATS: Epistemology34Beat[] = [
  {
    p: 25, x: 54, claim: 0,
    text: 'Two bars. The left one is what you say. The right one is how often what you say turns out to hold.',
    dur: 3.8,
  },
  {
    p: 47, x: 54, claim: 0.3,
    text: 'Down here they agree. Call something a coin flip and it lands about half the time. Nobody has ever been badly wrong that way.',
    cite: 'Low down, they agree',
    dur: 4.4,
  },
  {
    p: 19, x: 54, claim: 0.95, gap: 1,
    text: 'Now say you are certain. The left bar goes to the top. The right one does not follow, and the space between them is the whole subject.',
    cite: 'The gap opens',
    dur: 4.6,
  },
  {
    p: 4, x: 54, claim: 0.95, gap: 1,
    text: 'Being well calibrated means those two bars match. Notice that is not the same as being right often. Someone right half the time who says so has them level.',
    cite: 'Calibration',
    dur: 4.8,
  },
  {
    p: 137, x: 54, claim: 0.95,
    quote: {
      id: 'lq-epistemology-knowledge-34-1',
      text: 'The whole problem with the world is that fools and fanatics are always so certain of themselves, and wiser people so full of doubts.',
      author: 'Bertrand Russell',
      work: 'Mortals and Others',
      era: '1933',
      branchSlugs: ['epistemology'],
    },
    dur: 3.8,
  },
  {
    p: 4, x: 54, claim: 0, live: 1,
    interact: {
      prompt: 'Drag what you claim. Stop where the right-hand bar has stopped keeping up.',
      drag: {
        lo: 'A COIN FLIP',
        hi: 'CERTAIN',
        start: 0,
        zones: [
          { id: 'level', upto: 0.38, reads: 'the bars agree' },
          { id: 'lean', upto: 0.7, reads: 'the right one lags' },
          { id: 'gap', upto: 1, reads: 'a gap you cannot close', correct: true },
        ],
      },
      explain: 'Right at the top. Confidence keeps climbing after the evidence has stopped, so the last stretch of the left bar is bought with nothing. That space is the overconfidence effect, and almost everybody has some.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 35, x: 54, claim: 0.72, gap: 1,
    text: 'Here is the useful part. A match can be fixed from either end, and the end you control today is the left one.',
    cite: 'Fix it from the left',
    dur: 4.4,
  },
  {
    p: 45, x: 54, claim: 0.72, gap: 1,
    interact: {
      prompt: 'So how could you get better calibrated by tomorrow?',
      cards: [
        { text: 'Claim less confidence', correct: true },
        { text: 'Learn more facts', correct: false },
      ],
      explain: 'Learning more is a fine thing and it is slow. Lowering an inflated claim closes the same gap tonight, without a single new fact. That is only strange until you remember calibration was a match, never a score.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Gap At The Top',
      points: [
        'Calibration is confidence matching hit rate',
        'It is not the same as being right often',
        'The gap opens most at high confidence',
        'You can close it by claiming less',
      ],
      closing: 'Certainty is a feeling with a track record. It is worth knowing what yours is.',
    },
    dur: 3.0,
  },
];
