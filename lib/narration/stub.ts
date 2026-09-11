import type { NarrationProvider } from './types';

/**
 * Silence, for web and for any build without expo-audio. `isSupported` is false,
 * so the lesson shows no mute button and every paragraph appears whole, exactly as
 * it did before narration existed.
 */
export const stubNarration: NarrationProvider = {
  isSupported: () => false,
  prepare: () => {},
  play: () => {},
  stop: () => {},
  release: () => {},
};
