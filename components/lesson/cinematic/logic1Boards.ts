import {
  text, line, arc, loop, tick, arrow, stroke, BOARD_W, type ChalkRaw,
} from '@/components/professor/chalk';
import type { BoardKey } from './logic1Script';

// ─────────────────────────────────────────────────────────────────────────────
// WHAT THE NARRATOR CHALKS ON THE BOARD, in logic-arguments-1.
//
// The board is the professor's (components/professor/chalk.ts): single-stroke
// letters that write themselves, timed by length. Each board is a list of PHASES —
// one per beat it is up for — so a board that stays up for two beats ADDS to itself
// on the second rather than being redrawn: the premises get their bracket, the
// syllogism gets its conclusion, the signpost gets its trophy.
//
// BOARD UNITS, BOARD_W × BOARD_H (262 × 166). No text under a 10-unit cap: the board
// is drawn at about 0.99 of the stage, so that is the D34 floor with room.
// ─────────────────────────────────────────────────────────────────────────────

const W = BOARD_W;

export const BOARD_PHASES: Record<BoardKey, ChalkRaw[][]> = {
  // "An argument is a set of claims with a definite structure." / "Some of the
  // claims, called premises, are offered as reasons. The claim these reasons
  // support is the conclusion."
  anatomy: [
    [
      text('An argument', W / 2, 10, 14, { align: 'center' }),
      arc(80, W - 80, 32, 2),
      text('Premise', 34, 50, 12),
      text('Premise', 34, 76, 12),
      line(28, 100, 150, 100),
      text('Conclusion', 34, 110, 13),
    ],
    [
      // the bracket round the premises, and what they are FOR
      stroke(128, 48, 138, 48, 138, 92, 128, 92),
      text('Reasons', 148, 62, 11),
      arrow(176, 80, 166, 108),
      loop(92, 117, 70, 13),
    ],
  ],
  // "Aristotle gave the first account of deductive argument." / "In a syllogism, two
  // premises fix the conclusion, so accepting them means accepting it too."
  syllogism: [
    [
      text('Aristotle', W / 2, 10, 14, { align: 'center' }),
      arc(76, W - 76, 32, 2),
      text('All humans are mortal', 22, 50, 12, { maxW: 220 }),
      text('Socrates is human', 22, 78, 12, { maxW: 220 }),
    ],
    [
      line(18, 102, 200, 102),
      text('So Socrates is mortal', 22, 112, 12, { maxW: 200 }),
      tick(232, 108, 16),
    ],
  ],
  // "The loudness of a claim has no bearing on whether it's true."
  // A counter balance — the kind with two plates ON TOP, so what sits on a plate is
  // clear of any string. The megaphone's plate rides high; the evidence's sinks.
  loudness: [
    [
      text('Louder is not truer', W / 2, 8, 13, { align: 'center', maxW: W - 30 }),
      // the base, and the pivot on it
      stroke(58, 152, 204, 152, 204, 136, 58, 136, 58, 152),
      stroke(125, 136, 131, 124, 137, 136),
      // the beam, down on the evidence side
      line(78, 118, 184, 130),
      // two posts up to two plates
      line(80, 118, 80, 96), line(56, 96, 104, 96),
      line(182, 130, 182, 112), line(158, 112, 206, 112),
      // the megaphone on the high plate: the horn, its mouth, the handle
      stroke(62, 90, 62, 84, 92, 76, 92, 96, 62, 90),
      line(72, 90, 72, 96),
      // and the noise coming out of its mouth
      stroke(97, 79, 101, 86, 97, 93),
      stroke(103, 75, 108, 86, 103, 97),
      text('Volume', 80, 60, 10, { align: 'center' }),
      // the evidence on the low plate: a stack of papers
      line(164, 108, 200, 108), line(165, 103, 199, 103), line(166, 98, 198, 98), line(167, 93, 197, 93),
      text('Evidence', 182, 74, 10, { align: 'center' }),
    ],
  ],
  // "Two aims a person can have in arguing." / "…to establish the truth, and the
  // other is to win. Thirty-eight stratagems for winning."
  tworoads: [
    [
      text('Two aims', W / 2, 8, 14, { align: 'center' }),
      // the post and its ground
      line(128, 152, 128, 44),
      line(92, 152, 164, 152),
      // the arm pointing LEFT: truth
      stroke(123, 52, 58, 52, 46, 61, 58, 70, 123, 70, 123, 52),
      text('Truth', 62, 56, 10),
      // the arm pointing RIGHT: winning
      stroke(133, 80, 206, 80, 218, 89, 206, 98, 133, 98, 133, 80),
      text('Winning', 140, 84, 10),
    ],
    [
      // the trophy, down the winning road, and how many tricks it takes
      stroke(226, 104, 226, 114, 231, 120, 241, 120, 246, 114, 246, 104, 226, 104),
      line(236, 120, 236, 130),
      line(228, 132, 244, 132),
      stroke(226, 107, 220, 107, 220, 112, 226, 114),
      stroke(246, 107, 252, 107, 252, 112, 246, 114),
      text('38 tricks', 136, 132, 10),
      text('No tricks', 40, 128, 10),
    ],
  ],
};
