// ─────────────────────────────────────────────────────────────────────────────
// Script for the cinematic version of logic-arguments-2, "Premises and
// Conclusions". Theme: THE MASTER BUILDER.
//
// A different scene from lesson 1's fight — on purpose. Here an argument is a
// STRUCTURE: two premise-bricks form the base, and the conclusion is the keystone
// they hold up. A master builder lays it and a watching apprentice gets tested.
//
// The whole lesson rides one live brick structure (native Views — see
// BrickStructure.tsx). The two graded questions are dramatised INTO that
// structure rather than shown as flashcards:
//   · the true/false ("can a conclusion stand on its own?") pulls a premise and
//     the keystone actually CRASHES — the collapse is the answer;
//   · the multiple-choice ("which sentence is the conclusion?") floats two bricks
//     and the right one FLIES UP into the keystone slot.
//
// Both graded questions are lifted verbatim from data/branches/logic/.../
// premises-and-conclusions.ts so scoring stays identical to every other lesson.
//
// ON THE SHARED PLAYER SINCE THE PORT (see logic2Scene.tsx). This file is now an
// ordinary script: `Beat extends BaseBeat`, so the deck, the quote card, the two
// question shapes, the summary and the narration are the player's, and what is
// declared below is only what makes THIS lesson different from the other 245.
//
// EVERY TAP MOVES THE BUILD (group AH). Four taps used to change nothing but the
// words — the build state, the tags and the gesture were identical to the beat
// before — and each now carries an event read out of its own sentence: the two
// SUPPORTS ink in on "claims below that support a claim above", the two role
// plaques arrive one at a time with the line that names each, the legend's second
// row waits for the line that lists its words, and the therefore-mark is struck on
// the keystone when the conclusion is said to follow of necessity.
//
// Structure — five acts:
//   1  THE BUILD    the master lays two bricks and sets a keystone; it stands.
//   2  NAME PARTS   he points out the premises (base) and the conclusion (top).
//   3  THE PROOF    the famous Socrates syllogism, as bricks and as formal proof.
//   4  THE TEST     pull a premise (it collapses); place the conclusion (it flies).
//   5  PAYOFF       the saveable Aristotle quote and what you now know.
// ─────────────────────────────────────────────────────────────────────────────

import type { BaseBeat } from './cinematicKit';

export type Who = 'master' | 'app';

/**
 * How the brick structure looks this beat. A brick is PRESENT when its label is a
 * string (use '' for a blank, un-lettered brick); `null`/absent means it is not
 * there. `q` marks a beat whose graded answer drives an animation on the bricks.
 */
export interface BuildState {
  /** Base-left premise brick face. */
  p1?: string | null;
  /** Base-right premise brick face. */
  p2?: string | null;
  /** Keystone (conclusion) brick face. */
  key?: string | null;
  /** Draw an empty dashed keystone SLOT (used by the fly-up question). */
  slot?: boolean;
  /**
   * Which role plaques are up: the PREMISES one on the plinth, then the
   * CONCLUSION one over the keystone. They arrive on the two different lines that
   * name them rather than together, which is what makes the second of those taps
   * an event (AH1) as well as the better teaching order.
   */
  tags?: 'base' | 'both';
  /**
   * THE FORM: a dashed boundary traced around the whole three-stone silhouette.
   *
   * "This shape is the basic form of an argument" is the sentence, and the shape is
   * what it names — so the tap draws it. A strut from each base stone up to the
   * keystone was the first idea and the geometry refuses it: the keystone RESTS on
   * the base (beat 2 says so out loud), which leaves 3 units between the courses,
   * and a 3-unit strut is not a support, it is a joint line. Dashed, because a
   * dashed outline in this app is a BOUNDARY rather than a mass.
   */
  form?: boolean;
  /**
   * The therefore-mark (\u2234) struck at the keystone's shoulder — logic's own sign
   * for the claim that follows. It lands on the line about following of necessity.
   */
  mark?: boolean;
  /** This beat's graded answer drives the collapse or the fly-up. */
  q?: 'collapse' | 'flyup';
}

export interface Beat extends BaseBeat {
  act: 1 | 2 | 3 | 4 | 5;
  /** Speech bubbles over a figure. Narrower than the base `Say['who']`. */
  say?: { who: Who; text: string }[];
  /** The brick structure this beat. */
  build?: BuildState;
  /** Master gesture code (rig): 0 open · 1 emphatic · 2 present · 3 count · 4 chin
   *  · 5 sweep · 6 point-up · 7 LAY A BRICK. Matched to the line. */
  gest?: number;
  /**
   * Which rows of the signpost card are up (0 none · 1 the premise words · 2 both).
   *
   * Authored per beat rather than derived from `act`, because the rows belong to
   * the two lines that actually list their words — and a channel the script
   * declares is one `check:still` can see.
   */
  leg?: 0 | 1 | 2;
}

// Socrates' syllogism, on the bricks.
const S_P1 = 'All men are mortal';
const S_P2 = 'Socrates is a man';
const S_K = 'Socrates is mortal';

export const BEATS: Beat[] = [
  // ── ACT 1 — THE BUILD ────────────────────────────────────────────────────────
  {
    act: 1,
    build: { p1: '' },
    gest: 7,                                        // lay the first brick
    text: 'In logic, an argument is a set of claims, some of which are offered as reasons for another.',
    dur: 2.6,
  },
  {
    act: 1,
    build: { p1: '', p2: '' },
    gest: 7,                                        // lay the second brick
    text: 'Every argument, however long, is built from the same basic parts. Once you can identify them, you can analyse any argument.',
    dur: 3.2,
  },
  {
    act: 1,
    build: { p1: '', p2: '', key: '' },
    gest: 5,                                        // sweep the keystone into place
    say: [{ who: 'master', text: 'There. It stands.' }],
    text: 'Two stones form a base, and a third rests on top. The top stone stands only because the two below support it.',
    dur: 1.8,
  },

  // ── ACT 2 — NAME THE PARTS ───────────────────────────────────────────────────
  {
    act: 1,
    // AH1 — the sentence says the stones below SUPPORT the one above, so that is
    // what the tap draws: a strut from each base stone up to the keystone.
    build: { p1: '', p2: '', key: '', form: true },
    gest: 5,                                        // sweep the keystone into place
    say: [{ who: 'master', text: 'There. It stands.' }],
    text: 'This shape is the basic form of an argument: claims below that support a claim above.',
    dur: 1.8,
  },

  // ── ACT 2 — NAME THE PARTS ───────────────────────────────────────────────────
  {
    act: 2,
    build: { p1: '', p2: '', key: '', form: true, tags: 'base' },
    leg: 1,                                         // BECAUSE · SINCE · AS
    gest: 3,                                        // count off the base
    text: 'The stones at the base are the premises, the reasons offered for a claim. The words “because” and “since” often introduce a premise.',
    dur: 4.2,
  },
  {
    act: 2,
    build: { p1: '', p2: '', key: '', form: true, tags: 'both' },
    leg: 1,
    gest: 6,                                        // point up at the keystone
    text: 'The stone on top is the conclusion, the claim the premises support. In a deduction, Aristotle held, the conclusion follows of necessity.',
    cite: 'Aristotle, Prior Analytics',
    dur: 2.8,
  },
  {
    act: 2,
    build: { p1: '', p2: '', key: '', form: true, tags: 'both' },
    leg: 2,                                         // … and THEREFORE · SO · THUS
    gest: 3,                                        // count them off: therefore, so, thus
    text: 'The words “therefore”, “so” and “thus” often introduce a conclusion.',
    dur: 1.8,
  },
  {
    act: 2,
    build: { p1: '', p2: '', key: '', form: true, tags: 'both' },
    leg: 2,
    tap: {
      prompt: 'Which of these words usually introduces a conclusion?',
      options: [
        { id: 'a', text: '“because”', correct: false },
        { id: 'b', text: '“therefore”', correct: true },
      ],
      explain:
        '“Therefore” marks the conclusion, the claim the reasons support. “Because” marks a premise, one of the reasons given for it.',
    },
    dur: 0.8,
  },

  // ── ACT 3 — THE FAMOUS STRUCTURE ─────────────────────────────────────────────
  {
    act: 3,
    build: { p1: S_P1, p2: S_P2, key: S_K, form: true },
    gest: 2,                                        // present the finished structure
    text: 'This is the standard example of a syllogism, the form of argument Aristotle first analysed.',
    dur: 4.0,
  },
  {
    act: 3,
    // AH1 — "the conclusion can't be false": logic's own sign for the claim that
    // follows is struck at the keystone's shoulder.
    build: { p1: S_P1, p2: S_P2, key: S_K, form: true, mark: true },
    gest: 1,                                        // emphatic — "forced into place"
    text: 'If both premises are true, the conclusion can’t be false. That’s what Aristotle meant by a conclusion that follows of necessity.',
    cite: 'Aristotle, Prior Analytics',
    dur: 4.4,
  },

  // ── ACT 4 — THE TEST ─────────────────────────────────────────────────────────
  {
    act: 4,
    build: { p1: S_P1, p2: S_P2, key: S_K, form: true, q: 'collapse' },
    gest: 4,                                        // hand near the base, about to pull
    say: [{ who: 'master', text: 'Pull a premise. Does it still stand?' }],
    mc: {
      prompt: 'Can a claim count as a conclusion if no premises support it?',
      options: [
        { id: 'true', text: 'Yes', correct: false },
        { id: 'false', text: 'No', correct: true },
      ],
      explain:
        'No. A conclusion is, by definition, a claim that premises support. Without premises there’s no inference, only a bare assertion with no reason to believe it.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    act: 4,
    build: { p1: S_P1, p2: S_P2, key: S_K, form: true },
    gest: 0,                                        // open hand — the plain point
    text: 'Remove the premises and nothing supports the conclusion. The premises are what give anyone a reason to accept it.',
    dur: 3.8,
  },
  {
    act: 4,
    build: { p1: 'The deficit is growing', p2: 'Taxes should rise', key: null, slot: true, q: 'flyup' },
    gest: 6,                                        // gesture up at the empty slot
    say: [{ who: 'master', text: 'Which of these belongs on top?' }],
    mc: {
      prompt: '“Therefore, taxes should rise. After all, the deficit is growing.” Which sentence is the conclusion?',
      options: [
        { id: 'a', text: '“Taxes should rise”, marked by “therefore”', correct: true },
        { id: 'b', text: '“The deficit is growing”, after “after all”', correct: false },
        { id: 'c', text: 'Whichever sentence appears first', correct: false },
        { id: 'd', text: 'Both, since each concludes something', correct: false },
      ],
      explain:
        '“Taxes should rise”, marked by “therefore”. The word “therefore” marks the claim being supported, and “after all” introduces the premise. A conclusion can come first, so a conclusion is identified by its role, not by its position in the passage.',
      xp: 5,
    },
    dur: 1.0,
  },

  // ── ACT 5 — PAYOFF ───────────────────────────────────────────────────────────
  {
    act: 5,
    // The finished structure: the premise (deficit) alone at the base, centred, with
    // the conclusion (taxes) as the keystone — the exact shape the fly-up just built,
    // so it carries over seamlessly. No second base brick (that duplicated the
    // conclusion onto the base).
    build: { p1: 'The deficit is growing', key: 'Taxes should rise', form: true, tags: 'both' },
    quote: {
      id: 'lq-logic-arguments-2',
      text: 'A deduction is a discourse in which, certain things being stated, something other than what is stated follows of necessity.',
      author: 'Aristotle',
      philosopherId: 'aristotle',
      work: 'Prior Analytics',
      era: 'c. 350 BCE',
    },
    dur: 2.6,
  },
  {
    act: 5,
    summary: {
      title: 'The Parts of an Argument',
      points: [
        'Premises are the reasons offered for a conclusion',
        '“Because” and “since” often introduce a premise',
        '“Therefore” and “thus” often introduce a conclusion',
        'Identify a conclusion by its role, not its position',
      ],
      closing: 'Identifying the premises and the conclusion is the first step in assessing any argument.',
    },
    dur: 2.8,
  },
];
