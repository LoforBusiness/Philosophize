import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { NARRATION } from './manifest';
import { useNarrationStore, type NarrationPhase } from './store';
import type { NarrationProvider } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// THE VOICE, PLAYED.
//
// IMPORTS expo-audio AT MODULE SCOPE, so nothing may import this file directly — go
// through ./index, which wraps the require in a try (lib/sound/real.ts, same rule).
//
// It is not a `cue`. A cue is a moment the app marks, and since 11 Sep 2026 only two
// of them are heard (lib/feedback.ts); the narration is the lesson itself being read,
// and nothing else plays under it.
//
// ONE FILE A LESSON. EAS Update takes at most 1,000 assets in an update, and a clip a
// line would have been 1,718 of them, so a lesson ships one MP3 with its lines laid end
// to end (scripts/encode-narration.mjs) and one player holds it. A line plays by seeking
// to its `at` and pausing END_PAD_S after `at + dur`. The file holds, after every line,
// a short synthesised release and then silence to GAP_S (scripts/lib/narration.mjs), and
// the pause lands in that silence — after the release, before the next line's first word.
//
// The audio mode is the one the cues already set, stated again here because the
// narration may start before the cues have prepared: never take audio focus, play on
// a phone set to vibrate, and stop when the app leaves the screen.
// ─────────────────────────────────────────────────────────────────────────────

/** From `play()` to the first sample on a player that is already loaded. */
const LATENCY_MS = 60;
/** How long a line may wait for its lesson's audio to load before it is given up on. */
const LOAD_WAIT_MS = 1500;
/**
 * WHERE A LINE IS PAUSED: this far PAST its last sample, never before it.
 *
 * It used to be `end − 0.05`, and that one number clipped every line in the app. Chirp
 * trims each take to the voice — the median silence after the last sound is zero — so
 * the 50ms it cut was the end of the last word, not silence; and on Android the
 * reported position runs ahead of what the speaker has played, so the cut landed
 * earlier still. A reader heard it as a sentence that "will stop abruptly or not sound
 * right at the very end".
 *
 * The file holds, after every line, a RELEASE_S decay (scripts/lib/narration.mjs,
 * 0.08s) and then silence to GAP_S (0.4s). So the pause lands after the release and a
 * clear 0.2s before the next line's first word; check:narration holds these three
 * numbers against each other.
 */
const END_PAD_S = 0.2;
/**
 * The timer that pauses a line when no status update has: this long after END_PAD_S.
 * In audio time it lands between the release's end and the next line.
 */
const END_SLACK_MS = 40;

let loaded: { lessonId: string; player: AudioPlayer } | null = null;
let current: { lessonId: string; beat: number; player: AudioPlayer; cancel?: () => void } | null = null;
let modeSet = false;

const mark = (lessonId: string, beat: number, phase: NarrationPhase, at = Date.now()) =>
  useNarrationStore.setState({ lessonId, beat, phase, at });

function ensureMode() {
  if (modeSet) return;
  modeSet = true;
  setAudioModeAsync({
    playsInSilentMode: true,
    interruptionMode: 'mixWithOthers',
    shouldPlayInBackground: false,
  }).catch(() => {});
}

function stop() {
  const c = current;
  if (!c) return;
  current = null;
  c.cancel?.();
  try { c.player.pause(); } catch {}
  const s = useNarrationStore.getState();
  if (s.lessonId === c.lessonId && s.beat === c.beat && s.phase === 'playing') mark(c.lessonId, c.beat, 'stopped');
}

function release() {
  stop();
  if (loaded) {
    try { loaded.player.remove(); } catch {}
  }
  loaded = null;
}

function prepare(lessonId: string) {
  if (loaded?.lessonId === lessonId) return;
  release();
  const first = Object.values(NARRATION[lessonId] ?? {})[0];
  if (!first) return;
  ensureMode();
  try {
    loaded = { lessonId, player: createAudioPlayer(first.clip, { updateInterval: 50 }) };
  } catch {
    // A lesson whose audio will not load stays silent, and its paragraphs show whole.
    loaded = null;
  }
}

function play(lessonId: string, beat: number) {
  stop();
  prepare(lessonId);
  const line = NARRATION[lessonId]?.[beat];
  const player = loaded && loaded.lessonId === lessonId ? loaded.player : null;
  if (!line || !player) { mark(lessonId, beat, 'failed'); return; }
  const me: NonNullable<typeof current> = { lessonId, beat, player };
  current = me;
  const end = line.at + line.dur;

  const begin = () => {
    if (current !== me) return;
    // Sought first and started once the seek lands, so the line starts at its own first
    // sample wherever the file was left, including a line replayed after an unmute.
    player.seekTo(line.at).then(() => {
      if (current !== me) return;
      player.play();
      mark(lessonId, beat, 'playing', Date.now() + LATENCY_MS);
      // Pause where the line ends, or the file runs on into the next one. A status
      // update can still carry the position from before the seek, so the end only
      // counts once this line has been seen playing. `current` is kept: a tap after the
      // line has finished still reports it stopped, as it did when each line was its
      // own clip and simply ran out.
      let heard = false;
      let over = false;
      const finish = () => {
        if (over) return;
        over = true;
        watch.remove();
        clearTimeout(fallback);
        if (current === me) {
          try { player.pause(); } catch {}
        }
      };
      const watch = player.addListener('playbackStatusUpdate', (status) => {
        const t = status.currentTime;
        if (t < end - 0.05) heard = true;
        else if (heard && t >= end + END_PAD_S) finish();
      });
      const fallback = setTimeout(finish, (line.dur + END_PAD_S) * 1000 + LATENCY_MS + END_SLACK_MS);
      me.cancel = finish;
    }).catch(() => {
      if (current === me) current = null;
      mark(lessonId, beat, 'failed');
    });
  };

  if (player.isLoaded) { begin(); return; }
  let timer: ReturnType<typeof setTimeout> | null = null;
  const sub = player.addListener('playbackStatusUpdate', (status) => {
    if (!status.isLoaded) return;
    cleanup();
    begin();
  });
  timer = setTimeout(() => {
    cleanup();
    if (current === me) { current = null; mark(lessonId, beat, 'failed'); }
  }, LOAD_WAIT_MS);
  function cleanup() {
    sub.remove();
    if (timer) { clearTimeout(timer); timer = null; }
  }
  me.cancel = cleanup;
}

export const realNarration: NarrationProvider = {
  isSupported: () => true,
  prepare,
  play,
  stop,
  release,
};
