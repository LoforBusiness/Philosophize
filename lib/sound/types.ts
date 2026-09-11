/**
 * The moments the app can mark. Deliberately a closed set rather than a filename:
 * a call site asks for a MOMENT, not for a file, so what that moment gets can
 * change without touching the places that ask for it.
 *
 * A moment is felt, heard, or both, and lib/feedback.ts decides which. Since
 * 11 Sep 2026 only `reward` and `rankup` are heard, so nothing plays over the
 * lesson narration. The rest keep their haptics, and keep their names so a sound
 * could come back without re-wiring a single call site.
 */
export type Cue =
  // ── the world: physical, unpitched ─────────────────────────────────────────
  | 'step'     // a footfall
  | 'impact'   // something in the scene is struck
  | 'whoosh'   // a hand through air; the caller passes the measured speed
  | 'rethink'  // the answer was not that one
  | 'keep'     // a quote goes into the library
  // ── what the reader earns ──────────────────────────────────────────────────
  | 'right'    // a correct answer; the caller passes the run as `step`
  | 'tick'     // the XP counter; the caller passes the count as `step`
  | 'reward'   // the chime at the end of a lesson (heard)
  | 'badge'    // a badge pressed onto the reward screen
  | 'seal'     // the day struck onto the streak
  | 'rankup';  // the only fanfare in the app (heard)

export interface SoundProvider {
  /**
   * Whether this binary can actually make a noise.
   *
   * False on any build that predates expo-audio — see index.ts. Anything that
   * shows the reader a sound-related control must ask first, for the same reason
   * Settings hides the reminders section on old builds (§22): a switch that
   * cannot possibly do anything is the thing that rule exists to remove.
   */
  isSupported(): boolean;
  /** Load the clips. Safe to call repeatedly; only the first does work. */
  prepare(): Promise<void>;
  /**
   * Fire a cue. Never throws, never awaits — call sites are in animations. A cue
   * the provider has no clip for is silent.
   *
   * `step` selected a variant for the cues that had a ladder (the answer note and
   * the XP tick). Neither is heard now, so a provider may ignore it.
   */
  play(cue: Cue, step?: number): void;
  /** Master gate, driven by the Settings toggle. */
  setEnabled(on: boolean): void;
  /** Release the players (leaving the app / lesson). */
  release(): void;
}
