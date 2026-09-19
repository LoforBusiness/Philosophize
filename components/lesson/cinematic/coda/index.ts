// ─────────────────────────────────────────────────────────────────────────────
// WHICH LESSONS END WITH AN ENCOUNTER, AND WHICH DO NOT.
//
// The same seam as `CINEMATIC`: a lesson with no entry here ends exactly as every
// lesson always has — the summary, a tap, the reward. Removing an entry is a
// complete rollback for one lesson, which is what makes a coda safe to try.
//
// Four, on purpose, each asking its question a different way, so they can be
// compared against each other rather than against nothing:
//
//   ethics-ethics-23      MOVE HIM        you drag the figure, and where you leave
//                                         him is the answer
//   logic-arguments-16    TIME IT         you stop an argument on the word that
//                                         turns it
//   aesthetics-13         GIVE HIM A THING you put one of two objects in his hand
//   political-political-4 DRAW IT         you draw the line, and they live with it
// ─────────────────────────────────────────────────────────────────────────────
import ForgeryCoda from './ForgeryCoda';
import HarmLineCoda from './HarmLineCoda';
import PondCoda from './PondCoda';
import PostHocCoda from './PostHocCoda';
import type { CodaComponent } from './types';

export const CODAS: Record<string, CodaComponent> = {
  'ethics-ethics-23': PondCoda,
  'logic-arguments-16': PostHocCoda,
  'aesthetics-aesthetics-13': ForgeryCoda,
  'political-political-4': HarmLineCoda,
};

export type { CodaComponent, CodaProps } from './types';
