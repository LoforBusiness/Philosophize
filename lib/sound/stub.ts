import type { SoundProvider } from './types';

/**
 * Silence, for anywhere expo-audio is not present.
 *
 * That is not a hypothetical: every binary already on Play was built before the
 * dependency existed, so this is what those readers get until they update. It
 * reports `isSupported: false` so the Settings toggle can hide itself rather than
 * offer a switch that does nothing (§22).
 */
export const stubSound: SoundProvider = {
  isSupported: () => false,
  prepare: async () => {},
  play: () => {},
  setEnabled: () => {},
  release: () => {},
};
