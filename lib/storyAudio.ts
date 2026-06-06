import { Platform } from 'react-native';

// Ambient sound for the snowy story lesson: a soft wind bed whose level rises
// with the snowfall, plus footstep crunches scheduled to the walkers' stride.
// Web-only (Web Audio API); a no-op stub everywhere else so native runs silent.

export interface StoryAudio {
  resume(): void;                 // unlock/resume the AudioContext on a user gesture
  setIntensity(level: number): void; // 0..1 snowfall → wind loudness
  startFootsteps(period1?: number, period2?: number, phase2?: number): void;
  gust(): void;                   // one-shot wind swell
  setMuted(muted: boolean): void; // sound toggle
  dispose(): void;                // teardown on unmount
}

const NOOP: StoryAudio = {
  resume() {}, setIntensity() {}, startFootsteps() {}, gust() {}, setMuted() {}, dispose() {},
};

export function createStoryAudio(): StoryAudio {
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
  try {
    ctx = new (Ctor as typeof AudioContext)();
  } catch {
    return NOOP;
  }

  const master = ctx.createGain();
  master.gain.value = 1;
  master.connect(ctx.destination);

  // --- wind bed: looping filtered noise with slow gust + swell LFOs ---
  const noise = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 2), ctx.sampleRate);
  const nd = noise.getChannelData(0);
  for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
  const windSrc = ctx.createBufferSource();
  windSrc.buffer = noise;
  windSrc.loop = true;
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass'; lp.frequency.value = 600; lp.Q.value = 0.7;
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass'; bp.frequency.value = 500; bp.Q.value = 0.4;
  const windGain = ctx.createGain();
  windGain.gain.value = 0;
  windSrc.connect(lp); lp.connect(bp); bp.connect(windGain); windGain.connect(master);
  try { windSrc.start(0); } catch {}

  const gustOsc = ctx.createOscillator();
  gustOsc.frequency.value = 0.08;
  const gustDepth = ctx.createGain();
  gustDepth.gain.value = 180;
  gustOsc.connect(gustDepth); gustDepth.connect(lp.frequency);
  const swellOsc = ctx.createOscillator();
  swellOsc.frequency.value = 0.05;
  const swellDepth = ctx.createGain();
  swellDepth.gain.value = 0.02;
  swellOsc.connect(swellDepth); swellDepth.connect(windGain.gain);
  try { gustOsc.start(0); swellOsc.start(0); } catch {}

  // --- footstep crunch source buffer (short decaying noise) ---
  const crunch = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.2), ctx.sampleRate);
  const cd = crunch.getChannelData(0);
  for (let i = 0; i < cd.length; i++) cd[i] = (Math.random() * 2 - 1) * (1 - i / cd.length);

  let scheduler: ReturnType<typeof setInterval> | null = null;
  let muted = false;
  let intensity = 0.35;
  let nt1 = 0, nt2 = 0, hp1 = 0.5, hp2 = 0.53;

  const baseWind = () => 0.015 + intensity * 0.1;

  function playCrunch(t: number) {
    try {
      const src = ctx.createBufferSource();
      src.buffer = crunch;
      src.playbackRate.value = 0.9 + Math.random() * 0.25;
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass'; hp.frequency.value = 800 + Math.random() * 200;
      const bpf = ctx.createBiquadFilter();
      bpf.type = 'bandpass'; bpf.frequency.value = 1800; bpf.Q.value = 0.8;
      const g = ctx.createGain();
      const peak = (0.04 + Math.random() * 0.03) * (0.7 + intensity * 0.5);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(peak, t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0008, t + 0.16);
      src.connect(hp); hp.connect(bpf); bpf.connect(g); g.connect(master);
      src.start(t); src.stop(t + 0.18);
    } catch {}
  }

  return {
    resume() {
      try { if (ctx.state === 'suspended') ctx.resume(); } catch {}
    },
    setIntensity(level: number) {
      intensity = Math.max(0, Math.min(1, level));
      if (muted) return;
      try {
        windGain.gain.setTargetAtTime(baseWind(), ctx.currentTime, 1.2);
        bp.frequency.setTargetAtTime(450 + intensity * 350, ctx.currentTime, 1.5);
      } catch {}
    },
    gust() {
      if (muted) return;
      try {
        const t = ctx.currentTime;
        windGain.gain.setTargetAtTime(baseWind() + 0.05, t, 0.3);
        windGain.gain.setTargetAtTime(baseWind(), t + 0.7, 1.0);
      } catch {}
    },
    startFootsteps(period1 = 1000, period2 = 1060, phase2 = 330) {
      if (scheduler) return;
      hp1 = period1 / 2000; // half stride in seconds (a footfall each half-cycle)
      hp2 = period2 / 2000;
      nt1 = ctx.currentTime + 0.2;
      nt2 = ctx.currentTime + 0.2 + phase2 / 1000;
      scheduler = setInterval(() => {
        if (muted) return;
        const ahead = ctx.currentTime + 0.12;
        let guard = 0;
        while (nt1 < ahead && guard++ < 8) { playCrunch(nt1); nt1 += hp1; }
        guard = 0;
        while (nt2 < ahead && guard++ < 8) { playCrunch(nt2); nt2 += hp2; }
        if (nt1 < ctx.currentTime) nt1 = ctx.currentTime + hp1;
        if (nt2 < ctx.currentTime) nt2 = ctx.currentTime + hp2;
      }, 60);
    },
    setMuted(m: boolean) {
      muted = m;
      try {
        windGain.gain.setTargetAtTime(m ? 0 : baseWind(), ctx.currentTime, 0.4);
      } catch {}
    },
    dispose() {
      muted = true;
      if (scheduler) { clearInterval(scheduler); scheduler = null; }
      try { windSrc.stop(); } catch {}
      try { gustOsc.stop(); } catch {}
      try { swellOsc.stop(); } catch {}
      try { ctx.close(); } catch {}
    },
  };
}
