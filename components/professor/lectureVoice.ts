// The professor's voice, on a phone. Metro picks ./lectureVoice.web.ts on the web.
//
// The `try` is load-bearing, for the reason components/welcome/hostVoice.ts gives:
// ./lectureVoiceReal imports expo-audio at module scope and throws on a binary
// without it, and a missing voice must never be a crash. Without it he lectures in
// the caption.
export interface LectureVoice {
  supported: boolean;
  prepare(): void;
  playLine(i: number): void;
  stop(): void;
  release(): void;
}

const silent: LectureVoice = { supported: false, prepare() {}, playLine() {}, stop() {}, release() {} };

let voice: LectureVoice = silent;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  voice = require('./lectureVoiceReal').lectureVoiceReal as LectureVoice;
} catch {
  voice = silent;
}

export const lectureVoice = voice;
