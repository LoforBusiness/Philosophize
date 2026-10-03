import type { SfxProvider } from './types';

/** Silence, for the web and for any build without expo-audio. */
export const stubSfx: SfxProvider = {
  isSupported: () => false,
  prepare: () => {},
  play: () => {},
  bed: () => {},
  duck: () => {},
  hush: () => {},
  release: () => {},
};
