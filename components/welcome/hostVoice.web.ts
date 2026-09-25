// Web is silent, for the reason lib/narration/index.web.ts gives: the browser build
// exists for verification (§21), and a harness that has to get past an autoplay policy
// is a worse harness. He still talks — in the bubble.
import type { HostVoice } from './hostVoice';

export const hostVoice: HostVoice = { supported: false, prepare() {}, playLine() {}, stop() {}, release() {} };
