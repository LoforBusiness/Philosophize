import type { SfxProvider } from './types';
import { stubSfx } from './stub';

// The same resolver as lib/narration: `./real` imports expo-audio at module scope and
// throws on a binary without it, and a missing sound must never be a crash on launch.
let provider: SfxProvider = stubSfx;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  provider = require('./real').realSfx as SfxProvider;
} catch {
  provider = stubSfx;
}

export const sfx = provider;
export * from './types';
