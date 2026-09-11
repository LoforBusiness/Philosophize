// ─────────────────────────────────────────────────────────────────────────────
// WHEN A WORD APPEARS. Zero imports, so it can be checked in plain Node.
//
// Decided 11 Sep 2026: the narration is on by default, and each word of the line
// appears as the voice reaches it. Chirp 3 HD returns no word timings, so the start
// of every word is ESTIMATED by scripts/make-narration.mjs from the clip itself —
// the pauses it can hear, and each word's length between them — and the reveal
// leads the estimate slightly, because a word that appears a moment before it is
// heard reads as in step and one that appears after reads as late.
// ─────────────────────────────────────────────────────────────────────────────

/** How long one word takes to fade in. */
export const REVEAL_FADE_S = 0.16;
/** How far ahead of its estimated start a word begins to appear. */
export const REVEAL_LEAD_S = 0.05;
/**
 * How long a narrated paragraph stays hidden waiting for its voice. Past this it is
 * shown whole: a line that never starts must never cost the reader the words.
 */
export const PENDING_MS = 1500;

/** The words of a line, split exactly as the paragraph splits them. */
export const wordsIn = (text: string): number => (text.match(/\S+/g) ?? []).length;

/**
 * How visible word `k` is at `t` seconds into its line, in fifths.
 *
 * Quantised so the paragraph re-renders a few times per word rather than on every
 * frame: five steps over 160ms reads as a fade, and it costs a handful of renders.
 */
export function wordAlpha(starts: readonly number[], k: number, t: number): number {
  if (t < 0) return 0;
  const a = (t - ((starts[k] ?? 0) - REVEAL_LEAD_S)) / REVEAL_FADE_S;
  return Math.round(Math.min(1, Math.max(0, a)) * 5) / 5;
}

/** A hex colour at an opacity. Anything that is not hex is left as it is once visible. */
export function withAlpha(color: string, alpha: number): string {
  if (alpha >= 1) return color;
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(color);
  if (!m) return alpha <= 0 ? 'transparent' : color;
  let h = m[1];
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}
