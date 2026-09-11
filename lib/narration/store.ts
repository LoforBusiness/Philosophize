import { create } from 'zustand';

/**
 * WHAT THE VOICE IS DOING, FOR THE PARAGRAPH THAT REVEALS ITSELF IN STEP WITH IT.
 *
 * The deck is held by the player's `Fade`, which freezes the props it was built
 * with, so the paragraph cannot be told about the voice through props. It reads
 * this instead, and only the paragraph re-renders when it changes.
 */
export type NarrationPhase = 'idle' | 'playing' | 'stopped' | 'failed';

export interface NarrationState {
  lessonId: string | null;
  beat: number;
  phase: NarrationPhase;
  /**
   * Epoch ms. For `playing`, when the line's first sample is due; for `stopped` and
   * `failed`, when that happened.
   */
  at: number;
}

export const useNarrationStore = create<NarrationState>()(() => ({
  lessonId: null,
  beat: -1,
  phase: 'idle',
  at: 0,
}));
