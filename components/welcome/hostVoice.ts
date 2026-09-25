// The seated host's voice, on a phone. Metro picks ./hostVoice.web.ts on the web.
//
// The `try` is load-bearing: ./hostVoiceReal imports expo-audio at module scope and
// throws on a binary without it, and a missing voice must never be a crash on the
// first screen anybody sees. Without it he simply talks in the bubble.
export interface HostVoice {
  supported: boolean;
  prepare(): void;
  playLine(i: number): void;
  stop(): void;
  release(): void;
}

const silent: HostVoice = { supported: false, prepare() {}, playLine() {}, stop() {}, release() {} };

let voice: HostVoice = silent;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  voice = require('./hostVoiceReal').hostVoiceReal as HostVoice;
} catch {
  voice = silent;
}

export const hostVoice = voice;
