import { Platform } from 'react-native';

// A low, slow ambient drone for the metaphysics "why does anything exist?"
// opening — a dark cosmic pad that breathes, dims during the "imagine nothing"
// blackout, and swells when an image is revealed. Web-only (Web Audio API);
// a silent no-op everywhere else.

export interface DroneAudio {
  resume(): void;                 // unlock/resume the AudioContext on a user gesture
  setLevel(level: number): void;  // 0..1 overall loudness target
  swell(): void;                  // a brief rise on an image reveal
  setMuted(muted: boolean): void;
  dispose(): void;
}

const NOOP: DroneAudio = {
  resume() {}, setLevel() {}, swell() {}, setMuted() {}, dispose() {},
};

export function createDroneAudio(): DroneAudio {
  const isWeb =
    Platform.OS === 'web' &&
    typeof window !== 'undefined' &&
    !!((window as unknown as { AudioContext?: unknown }).AudioContext ||
      (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext);
  if (!isWeb) return NOOP;

  const Ctor =
    (window as unknown as { AudioContext?: typeof AudioContext }).AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  let ctx: AudioContext;
  try { ctx = new (Ctor as typeof AudioContext)(); } catch { return NOOP; }

  const master = ctx.createGain();
  master.gain.value = 1;
  master.connect(ctx.destination);

  // pad gain (what setLevel / swell move)
  const padGain = ctx.createGain();
  padGain.gain.value = 0.0001;
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass'; lp.frequency.value = 480; lp.Q.value = 0.6;
  padGain.connect(lp); lp.connect(master);

  // a low chord: A1, E2, A2 — slightly detuned for a slow beating shimmer
  const freqs = [55, 82.41, 110, 110.4];
  const oscs: OscillatorNode[] = [];
  for (let i = 0; i < freqs.length; i++) {
    const o = ctx.createOscillator();
    o.type = i === 0 ? 'sine' : 'triangle';
    o.frequency.value = freqs[i];
    const g = ctx.createGain();
    g.gain.value = i === 0 ? 0.5 : 0.22;
    o.connect(g); g.connect(padGain);
    try { o.start(0); } catch {}
    oscs.push(o);
  }

  // slow breathing LFO on the lowpass cutoff
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.06;
  const lfoDepth = ctx.createGain();
  lfoDepth.gain.value = 140;
  lfo.connect(lfoDepth); lfoDepth.connect(lp.frequency);
  try { lfo.start(0); } catch {}

  let muted = false;
  let level = 0.18;
  const target = () => 0.04 + level * 0.5;

  return {
    resume() { try { if (ctx.state === 'suspended') ctx.resume(); } catch {} },
    setLevel(l: number) {
      level = Math.max(0, Math.min(1, l));
      if (muted) return;
      try { padGain.gain.setTargetAtTime(target(), ctx.currentTime, 1.6); } catch {}
    },
    swell() {
      if (muted) return;
      try {
        const t = ctx.currentTime;
        padGain.gain.setTargetAtTime(target() + 0.12, t, 0.5);
        padGain.gain.setTargetAtTime(target(), t + 1.4, 2.2);
      } catch {}
    },
    setMuted(m: boolean) {
      muted = m;
      try { padGain.gain.setTargetAtTime(m ? 0.0001 : target(), ctx.currentTime, 0.5); } catch {}
    },
    dispose() {
      muted = true;
      oscs.forEach((o) => { try { o.stop(); } catch {} });
      try { lfo.stop(); } catch {}
      try { ctx.close(); } catch {}
    },
  };
}
