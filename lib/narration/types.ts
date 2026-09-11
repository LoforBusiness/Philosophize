/** One narrated line: the clip, how long it runs, and when each of its words starts. */
export interface NarratedLine {
  /** The clip, as `require()` returns it. */
  clip: number;
  /** How long the clip runs, in seconds. */
  dur: number;
  /**
   * When each word of `text` starts, in seconds from the start of the clip. One entry
   * per run of non-space characters, which is exactly how the paragraph splits it.
   */
  words: number[];
  /**
   * The line the clip was rendered from. A beat whose text has changed since is not
   * narrated at all, because the voice would be reading a sentence that is no longer
   * on the screen.
   */
  text: string;
}

export interface NarrationProvider {
  /** Whether this build can play a narration clip. False on web, where it is silent. */
  isSupported(): boolean;
  /** Load every clip of a lesson, so a line does not wait on a decode when it starts. */
  prepare(lessonId: string): void;
  /** Play one beat's line from its first word. Stops whatever was playing. */
  play(lessonId: string, beat: number): void;
  /** Stop the line that is playing, if any. */
  stop(): void;
  /** Free the players, when the lesson closes. */
  release(): void;
}
