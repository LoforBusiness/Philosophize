// ─────────────────────────────────────────────────────────────────────────────
// WHAT THE PROFESSOR SAYS, AND WHAT HE CHALKS WHILE HE SAYS IT.
//
// The intro lecture a reader opens once, from Home's Quick Start or the Learn tab,
// before any lesson (2026-09-25). Six lines, about forty seconds, read by the
// lessons' own voice (Chirp 3 HD, Algieba, en-GB).
//
// THE WORDS LIVE HERE AND ONLY HERE. `scripts/make-professor-voice.mjs` reads them
// to check each take says them, and the film reads them for the caption. A line
// that changes is a line that has to be rendered again.
//
// TWO FACTS ARE FIXED IN THE RECORDING, and both are recorded here so they are
// looked at before either changes:
//   · No lesson COUNT is spoken. A recording cannot be re-derived when the library
//     grows (CLAUDE.md §14), so the chalk may show a count and the voice never.
//   · "Three days" IS spoken, while the trial's real length is read from Google
//     Play. If the Play Console trial ever changes length, line 6 must be
//     re-recorded. The paywall under it always states the store's own figure.
//
// ZERO IMPORTS, so the timeline and the checker can read it in plain Node.
// ─────────────────────────────────────────────────────────────────────────────

/** Which drawing the chalk makes on the board while a line is spoken. */
export type ChalkId = 'title' | 'branches' | 'logic_ethics' | 'epistemology' | 'format' | 'pass';

export interface ScriptLine {
  /** The take's file name in assets/professor/voice/. */
  key: string;
  /** What he says, exactly as the take says it. */
  text: string;
  /** The drawing that goes up on the board during this line. */
  chalk: ChalkId;
}

export const LINES: readonly ScriptLine[] = [
  {
    key: 'p1',
    text: "Welcome. Before your first lesson, let me show you what you're about to learn.",
    chalk: 'title',
  },
  {
    key: 'p2',
    text: 'Philosophy has six branches, and each one trains a skill you use every day.',
    chalk: 'branches',
  },
  {
    key: 'p3',
    text: 'Logic teaches you to spot a bad argument before it fools you. Ethics helps you decide what’s right when it’s hard.',
    chalk: 'logic_ethics',
  },
  {
    key: 'p4',
    text: 'Epistemology asks how you know what you know, which matters every time you read the news.',
    chalk: 'epistemology',
  },
  {
    key: 'p5',
    text: 'Every lesson is short, narrated and animated, and it ends with a question you have to think through.',
    chalk: 'format',
  },
  {
    key: 'p6',
    text: 'Every lesson comes with the Scholar’s Pass, and your first three days are free.',
    chalk: 'pass',
  },
];
