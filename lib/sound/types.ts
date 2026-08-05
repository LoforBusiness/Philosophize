/**
 * The cues the app can make. Deliberately a closed set rather than a filename:
 * a call site asks for a MOMENT, not for a file, so the sound behind "tap" can be
 * re-cut without touching the twenty places that tap.
 */
export type Cue =
  // ── the world: physical, unpitched ─────────────────────────────────────────
  | 'step'     // a footfall — alternates between two samples inside the provider
  | 'settle'   // a walk coming to rest: a weight shift, not another step
  | 'impact'   // something in the scene is struck
  | 'tap'      // a fingertip on card: buttons and list rows
  | 'page'     // a leaf turning — advancing a cinematic beat
  | 'rethink'  // a wooden knock: the answer was not that one
  | 'keep'     // a clasp closing: a quote goes into the library
  // ── what the reader earns: pitched, all of it in D ─────────────────────────
  | 'right'    // a struck note; CLIMBS D→F#→A on a run (pass `step`)
  | 'tick'     // the XP counter, cycling three rising pitches (pass `step`)
  | 'reward'   // the chime at the end of a lesson
  | 'badge'    // a low bell under a shimmer
  | 'rankup';  // the only fanfare in the app

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
   * Fire a cue. Never throws, never awaits — call sites are in animations.
   *
   * `step` selects a variant for the two cues that have one: how far up the triad
   * a correct answer sounds (a run of them climbs), and where the XP counter is
   * in its cycle. Ignored by every other cue. It is a NUMBER, not a pitch or a
   * filename, so the call site never has to know what the sound is made of.
   */
  play(cue: Cue, step?: number): void;
  /** Master gate, driven by the Settings toggle. */
  setEnabled(on: boolean): void;
  /** Release the players (leaving the app / lesson). */
  release(): void;
}
