import { stubNarration } from './stub';

// Web is silent, for the reason lib/sound/index.web.ts gives: the browser build exists
// for verification (§21), and a harness that has to get past an autoplay policy is a
// worse harness. With no voice, every paragraph appears whole, as it always has.
export const narration = stubNarration;
export * from './types';
