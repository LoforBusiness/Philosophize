// Shared worklet easing for the welcome screen. Every one of these runs inside a
// useAnimatedProps/useDerivedValue worklet on the UI thread, so they must stay
// pure, self-contained and marked 'worklet'.
//
// ── The one rule this whole screen obeys ────────────────────────────────────
// On this stack (react-native-svg 15 + Fabric) only SOME animated props repaint:
//
//   REPAINTS:      transform, opacity, strokeOpacity, fillOpacity, strokeDashoffset
//   DOES NOT:      d, points, cx, cy, x, y, width, height, r   (geometry)
//
// Both halves are proven in this app: LaunchScreen.tsx animates strokeDashoffset
// on the boot path, and commit 501e08c rebuilt the old welcome's arms because
// animating Polyline `points` left them frozen on-device.
//
// So: every path's geometry is computed ONCE (module scope / useMemo) and never
// changes. Motion comes only from transform, opacity and strokeDashoffset.
// ────────────────────────────────────────────────────────────────────────────

export function clamp01(x: number) {
  'worklet';
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

/** Normalised progress of `p` across the window [a, b], clamped to 0–1. */
export function seg(p: number, a: number, b: number) {
  'worklet';
  const d = b - a;
  return clamp01(d === 0 ? 0 : (p - a) / d);
}

export function lerp(a: number, b: number, t: number) {
  'worklet';
  return a + (b - a) * t;
}

export function easeOutCubic(u: number) {
  'worklet';
  const c = clamp01(u);
  return 1 - Math.pow(1 - c, 3);
}

export function easeInOutQuad(u: number) {
  'worklet';
  const c = clamp01(u);
  return c < 0.5 ? 2 * c * c : 1 - Math.pow(-2 * c + 2, 2) / 2;
}

/** Overshoots past 1 before settling — used for the chart dots popping in. */
export function easeOutBack(u: number) {
  'worklet';
  const c = clamp01(u);
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(c - 1, 3) + c1 * Math.pow(c - 1, 2);
}

// ── PALETTE: THE APP'S, NOT THIS SCREEN'S ───────────────────────────────────
//
// These three used to be literals — `#1a1714`, `#f7f4ee`, `#8a8177` — under the
// comment "matches the approved preview exactly". They did, and that is exactly
// how the first screen a reader ever sees came to be drawn in a palette the app
// had thrown out twice.
//
// On 2026-09-15 the owner replaced every gold in the app with six swatches and
// `C.HUE` moved from `#1B3B3C` to `#2A4343`; on 2026-09-16 every warm tan surface
// went flat because "the background for some shading has a gold look … very
// common in the background of a lot of the information in the app". Every other
// surface moved with both, because every other surface reads `constants/design.ts`.
// This one could not: a literal cannot be repainted. `#f7f4ee` is a warm cream and
// `#1a1714` a brown-black, so the intro kept the exact beige the owner had named
// as the thing that makes an app look AI-made, for five days after it was removed
// everywhere else.
//
// So they are re-exports now, and `check-intro` fails on any hex literal anywhere
// in `components/welcome/`. That rule is the point of this change: the palette
// drift was never a wrong colour, it was a screen that did not ask.
import { C } from '@/constants/design';

export const INK = C.ink;
export const PAPER = C.paper;
export const SOFT = C.dim;
