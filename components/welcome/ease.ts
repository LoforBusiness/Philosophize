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

// Palette — matches the approved preview exactly.
export const INK = '#1a1714';
export const PAPER = '#f7f4ee';
export const SOFT = '#8a8177';
