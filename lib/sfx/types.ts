import type { SfxId } from './clips';

/**
 * A lesson's sound effects and its background bed (LESSON_RULES AT6). Never a voice:
 * the player plays a cue only where no line is being said, and holds the bed down
 * (`duck`) while one is.
 */
export interface SfxProvider {
  isSupported(): boolean;
  /** Load these clips ahead of the beats that use them. */
  prepare(ids: readonly SfxId[]): void;
  /** One effect, once, at `gain` (0..1). */
  play(id: SfxId, gain?: number): void;
  /** The background loop: faded in, swapped with a crossfade, or faded out (`null`). */
  bed(id: SfxId | null, gain?: number): void;
  /**
   * The MUSIC loop (AT10): a second layer beside the bed, faded in, crossfaded or faded
   * out (`null`) the same way, and held much further down while a line is said.
   */
  music(id: SfxId | null, gain?: number): void;
  /** Hold the bed and the music down while a line is being said, and let them back up after. */
  duck(on: boolean): void;
  /**
   * Fade out every effect still sounding (never the bed). A reader who taps on while
   * the crowd is still laughing starts the next line, and that line must not be talked
   * over (AT6).
   */
  hush(): void;
  /** Stop everything and let the players go. */
  release(): void;
}

export type { SfxId };
