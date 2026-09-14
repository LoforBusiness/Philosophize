// ─────────────────────────────────────────────────────────────────────────────
// THE COLOUR OF A QUESTION: THE LESSON'S OWN BRANCH.
//
// Every control below the stickman was drawn in ink, grey and paper, and a reader
// said what that looked like: "very simple black and white … very boring, not very
// gamified." The controls were the last surfaces in the app that carried no colour
// at all while the rank pins, the badges, the streak and Insights all do.
//
// THE COLOUR IS A LABEL, NOT A MOOD, which is the only licence `constants/design.ts`
// grants a hue. A lesson belongs to a branch, and `BRANCH` already holds six measured
// colours whose job is to say "this is that branch". So a logic question is struck
// in slate blue and an ethics question in pine, and one lesson never shows two
// hues. Six saturated colours at once is what made Insights read cheap (§19); one
// colour per screen, carried in edges, lips and fills, is what makes it read struck.
//
// THE ANSWER STATES KEEP THEIR OWN TWO COLOURS. Green and rust mean right and wrong
// everywhere in the app, so a verdict never borrows the branch hue.
//
// ZERO REACT, so a checker can load it in plain Node and measure the contrast of
// every derived tone against the paper it is printed on.
// ─────────────────────────────────────────────────────────────────────────────
import { BRANCH, C, type BranchKey } from '@/constants/design';
import { mix } from '@/components/shared/tone';

const INK = '#1A1A1A';
const PAPER = '#FAFAF7';

/** The branch a lesson id belongs to, read off its prefix. Null for a preview. */
export function branchOfLesson(lessonId: string | null | undefined): BranchKey | null {
  if (!lessonId) return null;
  const head = lessonId.split('-')[0];
  switch (head) {
    case 'metaphysics': return 'metaphysics';
    case 'epistemology': return 'epistemology';
    case 'logic': return 'logic';
    case 'ethics': return 'ethics';
    case 'aesthetics': return 'aesthetics';
    case 'political': return 'political-philosophy';
    default: return null;
  }
}

export interface QAccent {
  /** The branch hue itself. Marks, fills and rails. */ base: string;
  /** The lit end of a struck face in this colour. */ lit: string;
  /** The shaded end, and the lip a raised control sits on. */ shade: string;
  /** The turned edge, darker than the shade. */ rim: string;
  /** Text in the branch colour. Darker than `base`, so small type clears 4.5:1. */ text: string;
  /** An unfilled track: the hue at a tenth. */ track: string;
  /** A wash behind a live surface: the hue at a whisper. */ wash: string;
  /** A border on paper that says "this belongs to the branch" without shouting. */ edge: string;
}

export function accentOf(hue: string): QAccent {
  return {
    base: hue,
    lit: mix(hue, PAPER, 0.34),
    shade: mix(hue, INK, 0.36),
    rim: mix(hue, INK, 0.58),
    text: mix(hue, INK, 0.3),
    track: mix(hue, PAPER, 0.86),
    wash: mix(hue, PAPER, 0.93),
    edge: mix(hue, PAPER, 0.45),
  };
}

/** The accent for a lesson. A lesson outside the six branches gets the app's own petrol. */
export function accentForLesson(lessonId: string | null | undefined): QAccent {
  const b = branchOfLesson(lessonId);
  return accentOf(b ? BRANCH[b] : C.HUE);
}

/** The accent a control gets with no lesson around it (a preview, a bespoke player). */
export const DEFAULT_ACCENT: QAccent = accentForLesson(null);

/** The verdict colours, and the lip each sits on. Never a branch hue. */
export const VERDICT = {
  right: { ink: C.correct, face: '#EAF1E6', lip: mix(C.correct, INK, 0.35) },
  wrong: { ink: C.wrong, face: C.wrongSoft, lip: mix(C.wrong, INK, 0.35) },
} as const;
