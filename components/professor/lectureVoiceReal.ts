import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { VOICE_LINES } from './professorVoice';

// ─────────────────────────────────────────────────────────────────────────────
// THE PROFESSOR'S VOICE, PLAYED.
//
// components/welcome/hostVoiceReal.ts, pointed at the professor's MP3, and every
// rule it states holds here for the same reason:
//
//   · IMPORTS expo-audio AT MODULE SCOPE, so nothing may import this file directly —
//     go through ./lectureVoice, which wraps the require in a try;
//   · one MP3 holds all six lines (scripts/make-professor-voice.mjs); a line plays by
//     seeking to its `at` and pausing a little past its end, in the silence the
//     encoder laid after the take's release;
//   · the film starts each line on its own clock, so the chalk, the caption and the
//     voice re-anchor on every line and cannot drift apart by more than one.
// ─────────────────────────────────────────────────────────────────────────────

const CLIP = require('@/assets/professor/voice/professor.mp3');
/** How far past a take's last sample the line is paused. See END_PAD_S in lib/narration/real.ts. */
const END_PAD_S = 0.2;

let player: AudioPlayer | null = null;
let stopTimer: ReturnType<typeof setTimeout> | null = null;
let token = 0;

function prepare() {
  if (player) return;
  setAudioModeAsync({
    playsInSilentMode: true,
    interruptionMode: 'mixWithOthers',
    shouldPlayInBackground: false,
  }).catch(() => {});
  try {
    player = createAudioPlayer(CLIP, { updateInterval: 50 });
  } catch {
    player = null;
  }
}

function stop() {
  token += 1;
  if (stopTimer) clearTimeout(stopTimer);
  stopTimer = null;
  try { player?.pause(); } catch {}
}

function playLine(i: number) {
  prepare();
  const line = VOICE_LINES[i];
  const p = player;
  if (!line || !p) return;
  stop();
  const me = token;
  const go = () => {
    if (me !== token) return;
    p.seekTo(line.at).then(() => {
      if (me !== token) return;
      p.play();
      stopTimer = setTimeout(() => {
        if (me !== token) return;
        try { p.pause(); } catch {}
      }, (line.dur + END_PAD_S) * 1000);
    }).catch(() => {});
  };
  if (p.isLoaded) { go(); return; }
  // Still loading: wait, but never longer than a line is worth — a voice arriving
  // late would talk over the NEXT line's chalk.
  const started = Date.now();
  const poll = () => {
    if (me !== token) return;
    if (p.isLoaded) { go(); return; }
    if (Date.now() - started < 1200) setTimeout(poll, 50);
  };
  poll();
}

function release() {
  stop();
  try { player?.remove(); } catch {}
  player = null;
}

export const lectureVoiceReal = { supported: true, prepare, playLine, stop, release };
