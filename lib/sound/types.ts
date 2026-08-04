/**
 * The cues the app can make. Deliberately a closed set rather than a filename:
 * a call site asks for a MOMENT, not for a file, so the sound behind "tap" can be
 * re-cut without touching the twenty places that tap.
 */
export type Cue =
  | 'step'    // a footfall — alternates between two samples at the call site
  | 'swish'   // an arm through air
  | 'tap'     // a fingertip on card: buttons, cards, advancing a beat
  | 'reward'; // the chime at the end of a lesson

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
  /** Fire a cue. Never throws, never awaits — call sites are in animations. */
  play(cue: Cue): void;
  /** Master gate, driven by the Settings toggle. */
  setEnabled(on: boolean): void;
  /** Release the players (leaving the app / lesson). */
  release(): void;
}
