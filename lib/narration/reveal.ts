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

// ─────────────────────────────────────────────────────────────────────────────
// AND IN TWO LESSONS, EACH LETTER RISES INTO PLACE.
//
// Asked for on 11 Sep 2026, once the first narrated lessons had been heard: the
// letters should appear and move up a little, smoothly, at the pace of the voice.
// It is on for RISING_LESSONS only, so it can be tuned before it goes further.
//
// A letter fades in while it rises a third of the type's size and settles. A word's
// letters start one after another across half of the time the voice spends on that
// word, and each takes about half that time again to land, so a word said quickly
// is a quick ripple and one said slowly is a gentler one.
// ─────────────────────────────────────────────────────────────────────────────

/** The lessons trying the rising reveal. Every other narrated lesson keeps the fade. */
export const RISING_LESSONS: readonly string[] = ['logic-arguments-1', 'ethics-ethics-1'];

/** How far below its place a letter starts, as a share of the font size. */
export const RISE_EM = 0.33;
/** A word's letters all start within this share of the time spent saying it. */
export const LETTER_SPREAD = 0.5;
/** And no two letters start further apart than this, so a slow word does not crawl. */
export const LETTER_GAP_MAX_S = 0.03;
/** One letter's fade and rise: this share of its word's time, within the bounds below. */
export const LETTER_SHARE = 0.5;
export const LETTER_MIN_S = 0.14;
export const LETTER_MAX_S = 0.26;
/** The most time a line's last word is taken to last. */
export const LAST_WORD_S = 0.45;

export interface LetterTime {
  /** Seconds into the line when the letter starts to rise. */
  start: number;
  /** Seconds it takes to land. */
  len: number;
}

/**
 * When each character of `text` starts to rise, and for how long, from the estimated
 * word starts. Whitespace takes the timing of the letter before it, so a struck
 * maxim's band reaches across a space together with the word in front of it.
 */
export function letterTimes(starts: readonly number[], text: string, dur: number): LetterTime[] {
  const words: [number, number][] = [];
  const re = /\S+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) words.push([m.index, m.index + m[0].length]);

  const out: (LetterTime | undefined)[] = new Array(text.length).fill(undefined);
  words.forEach(([from, to], k) => {
    const at = Math.max(0, (starts[k] ?? 0) - REVEAL_LEAD_S);
    const next = k + 1 < words.length
      ? Math.max(0, (starts[k + 1] ?? dur) - REVEAL_LEAD_S)
      : Math.min(dur, at + LAST_WORD_S);
    const span = Math.max(0.08, next - at);
    const n = to - from;
    const len = Math.min(LETTER_MAX_S, Math.max(LETTER_MIN_S, span * LETTER_SHARE));
    const gap = n > 1 ? Math.min(LETTER_GAP_MAX_S, (span * LETTER_SPREAD) / (n - 1)) : 0;
    for (let c = 0; c < n; c += 1) out[from + c] = { start: at + c * gap, len };
  });

  let prev: LetterTime = { start: 0, len: LETTER_MIN_S };
  return out.map((x) => {
    if (x) prev = x;
    return x ?? prev;
  });
}

/**
 * How a letter looks `t` seconds into its line: its opacity, and how far below its
 * place it still is. A worklet, because every letter's style runs it on the UI thread
 * each frame, and a contact sheet runs the same arithmetic, so the two cannot drift.
 */
export function letterFrame(t: number, start: number, len: number, rise: number): [number, number] {
  'worklet';
  const p = t <= start ? 0 : t >= start + len ? 1 : (t - start) / len;
  // Eased out: quick off the line and soft into place.
  const q = 1 - p;
  const settled = 1 - q * q * q;
  // Opaque a little before it lands, so the end of the movement is a letter, not a ghost.
  const o = p * 1.4 >= 1 ? 1 : p * 1.4;
  return [1 - (1 - o) * (1 - o), (1 - settled) * rise];
}
