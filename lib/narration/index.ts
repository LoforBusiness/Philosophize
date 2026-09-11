import type { NarrationProvider } from './types';
import { stubNarration } from './stub';

// Native resolver, the same shape as lib/sound: Metro picks index.web.ts on web, and
// this file runs on iOS and Android. The `try` is load-bearing for the same reason it
// is there: `./real` imports expo-audio at module scope and throws on a binary
// without it, and a missing voice must never be a crash on launch.
let provider: NarrationProvider = stubNarration;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  provider = require('./real').realNarration as NarrationProvider;
} catch {
  provider = stubNarration;
}

export const narration = provider;
export * from './types';
