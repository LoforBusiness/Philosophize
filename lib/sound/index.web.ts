import { stubSound } from './stub';

// Web gets silence. The browser build exists for verification (§21), and a probe
// that has to click through autoplay-policy prompts is a worse probe.
export const sound = stubSound;
export * from './types';
