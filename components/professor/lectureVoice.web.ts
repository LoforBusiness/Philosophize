// Web is silent, for the reason lib/narration/index.web.ts gives: the browser build
// exists for verification (§21), and a harness that has to get past an autoplay policy
// is a worse harness. The professor still lectures — in the caption.
import type { LectureVoice } from './lectureVoice';

export const lectureVoice: LectureVoice = { supported: false, prepare() {}, playLine() {}, stop() {}, release() {} };
