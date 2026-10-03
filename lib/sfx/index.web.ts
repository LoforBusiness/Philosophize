import { stubSfx } from './stub';

// Web gets silence, like the voice (lib/narration/index.web.ts): the browser build is for
// verification (§21), and an autoplay prompt is a worse probe.
export const sfx = stubSfx;
export * from './types';
