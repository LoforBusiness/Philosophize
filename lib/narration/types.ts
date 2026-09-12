/**
 * One narrated line: where it sits in its lesson's audio, how long it runs, and when each
 * of its words starts.
 */
export interface NarratedLine {
  /**
   * The lesson's audio, as `require()` returns it. Every line of a lesson names the same
   * file: a lesson ships one MP3 with its spoken lines laid end to end, because EAS Update
   * takes at most 1,000 assets in an update (scripts/encode-narration.mjs).
   */
  clip: number;
  /** Where this line starts in that file, in seconds. */
  at: number;
  /** How long the line runs, in seconds. */
  dur: number;
  /**
   * When each word of `text` starts, in seconds from the start of the line. One entry
   * per run of non-space characters, which is exactly how the paragraph splits it.
   */
  words: number[];
  /**
   * The line the take was rendered from. A beat whose text has changed since is not
   * narrated at all, because the voice would be reading a sentence that is no longer
   * on the screen.
   */
  text: string;
}

export interface NarrationProvider {
  /** Whether this build can play the narration. False on web, where it is silent. */
  isSupported(): boolean;
  /** Load a lesson's audio, so a line does not wait on a decode when it starts. */
  prepare(lessonId: string): void;
  /** Play one beat's line from its first word. Stops whatever was playing. */
  play(lessonId: string, beat: number): void;
  /** Stop the line that is playing, if any. */
  stop(): void;
  /** Free the player, when the lesson closes. */
  release(): void;
}
