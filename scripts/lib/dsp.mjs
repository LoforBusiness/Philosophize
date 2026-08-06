// ─────────────────────────────────────────────────────────────────────────────
// THE SYNTHESIS KIT, shared by the two things that make sound in this repo.
//
//   scripts/make-sounds.mjs      renders the 17 clips the app actually ships
//   scripts/make-sound-lab.mjs   renders a page of CANDIDATES to choose between
//
// Extracted rather than copied, so a candidate heard in the lab and the clip that
// later ships are made by the same arithmetic. A second copy of a bandpass would
// drift from the first within two edits, and then the thing approved would not be
// the thing installed.
//
// Everything here is deterministic. `reseed` fixes the noise, so a rebuild is
// byte-identical and a diff means somebody changed a number.
// ─────────────────────────────────────────────────────────────────────────────

export const HI = 44100;   // anything with a transient — a heel, a fingertip, a tick
export const LO = 22050;   // struck tones, whose partials are all well under 11 kHz

// Mutable so the helpers below (which read it at call time) follow whichever clip
// is being rendered. `atRate` is the only thing that may change it.
let RATE = LO;
export const atRate = (rate, make) => {
  const prev = RATE;
  RATE = rate;
  try { return { rate, data: make() }; } finally { RATE = prev; }
};
export const rate = () => RATE;

// A fixed generator, so re-running produces identical files. Math.random() would
// make every rebuild a different sound and every diff a mystery.
let seed = 0x9e3779b9;
const rnd = () => {
  seed ^= seed << 13; seed >>>= 0;
  seed ^= seed >> 17;
  seed ^= seed << 5; seed >>>= 0;
  return (seed / 0xffffffff) * 2 - 1;
};
export const reseed = (s) => { seed = s >>> 0; };

/** One-pole low pass. `c` is 0..1 — smaller is duller. */
export function lowpass(buf, c) {
  let y = 0;
  return buf.map((x) => (y += c * (x - y)));
}
/** Subtracting a low pass from the signal leaves the top end. */
export function highpass(buf, c) {
  const lo = lowpass(buf, c);
  return buf.map((x, i) => x - lo[i]);
}

export const noise = (n) => Array.from({ length: n }, () => rnd());

/**
 * A RESONANT BANDPASS — the thing that makes noise sound like a MATERIAL.
 *
 * A one-pole low pass can only make noise duller. What tells an ear "leather on a
 * hard floor" rather than "a filtered hiss" is a resonance: a frequency the object
 * rings at, sharply. Standard RBJ biquad; `q` is the whole difference between a
 * shoe and a shush.
 */
export function bandpass(buf, f, q) {
  const w = (2 * Math.PI * f) / RATE;
  const alpha = Math.sin(w) / (2 * q);
  const cosw = Math.cos(w);
  const b0 = alpha, b1 = 0, b2 = -alpha;
  const a0 = 1 + alpha, a1 = -2 * cosw, a2 = 1 - alpha;
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  return buf.map((x) => {
    const y = (b0 / a0) * x + (b1 / a0) * x1 + (b2 / a0) * x2 - (a1 / a0) * y1 - (a2 / a0) * y2;
    x2 = x1; x1 = x; y2 = y1; y1 = y;
    return y;
  });
}

/** A struck resonance: a decaying sine, the cheapest honest model of a ringing body. */
export const ring = (n, f, decay, g = 1) => {
  const e = env(n, 0.0004, decay);
  return sine(n, f).map((x, i) => x * e[i] * g);
};

/** Exponential decay from 1 to ~0 over the clip, with a short fade-in. */
export function env(n, attack, decay) {
  const a = Math.max(1, Math.round(attack * RATE));
  return Array.from({ length: n }, (_, i) => {
    const rise = i < a ? i / a : 1;
    return rise * Math.exp((-i / RATE) / decay);
  });
}

export const sine = (n, f, phase = 0) =>
  Array.from({ length: n }, (_, i) => Math.sin(2 * Math.PI * f * (i / RATE) + phase));

/** A sine whose frequency slides f0 → f1. Phase is integrated, so no click. */
export const sweep = (n, f0, f1) => {
  let ph = 0;
  return Array.from({ length: n }, (_, i) => {
    ph += (2 * Math.PI * (f0 + (f1 - f0) * (i / n))) / RATE;
    return Math.sin(ph);
  });
};

export const mix = (...layers) => {
  const n = Math.max(...layers.map((l) => l.length));
  const out = new Array(n).fill(0);
  for (const l of layers) for (let i = 0; i < l.length; i++) out[i] += l[i];
  return out;
};
export const gain = (buf, g) => buf.map((x) => x * g);

/** Silence, then a layer. Used to place notes in a phrase. */
export const at = (delay, layer) => [...new Array(secs(delay)).fill(0), ...layer];

/**
 * Centre, normalise to a peak, then fade both ends so nothing clicks.
 *
 * THE CENTRING IS NOT COSMETIC. A short burst of low-passed noise does not average
 * to zero — filtering a finite random sequence leaves a residual offset, and one
 * clip shipped with 0.0137 of it. DC yanks the speaker cone off centre on the way
 * in and lets it go on the way out: a click at both ends that no tail fade can
 * remove, because the fade is applied to an already-offset signal.
 *
 * The fade-IN is what centring made necessary. Every layer starts at zero, but
 * subtracting the mean moves the whole clip down by that mean, so the first sample
 * lands at −dc and the click reappears at the head.
 */
export function finish(buf, peak = 0.72) {
  const dc = buf.reduce((a, x) => a + x, 0) / (buf.length || 1);
  const centred = buf.map((x) => x - dc);
  const max = Math.max(...centred.map(Math.abs)) || 1;
  const k = peak / max;
  const tail = Math.round(0.004 * RATE);
  const nose = Math.round(0.001 * RATE);
  return centred.map((x, i) => {
    const up = i < nose ? i / nose : 1;
    const down = i > buf.length - tail ? (buf.length - i) / tail : 1;
    return x * k * up * down;
  });
}

export function wav(samples, sampleRate) {
  const n = samples.length;
  const b = Buffer.alloc(44 + n * 2);
  b.write('RIFF', 0);
  b.writeUInt32LE(36 + n * 2, 4);
  b.write('WAVE', 8);
  b.write('fmt ', 12);
  b.writeUInt32LE(16, 16);          // PCM chunk size
  b.writeUInt16LE(1, 20);           // format: PCM
  b.writeUInt16LE(1, 22);           // channels: mono
  b.writeUInt32LE(sampleRate, 24);
  b.writeUInt32LE(sampleRate * 2, 28);
  b.writeUInt16LE(2, 32);           // block align
  b.writeUInt16LE(16, 34);          // bits
  b.write('data', 36);
  b.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    const v = Math.max(-1, Math.min(1, samples[i]));
    b.writeInt16LE(Math.round(v * 32767), 44 + i * 2);
  }
  return b;
}

export const secs = (s) => Math.round(s * RATE);

/** A struck tone: fundamental, a soft octave, a trace of the twelfth. */
export function bell(n, f, decay, g = 1) {
  const e = env(n, 0.004, decay);
  const body = mix(
    sine(n, f),
    gain(sine(n, f * 2), 0.26),
    gain(sine(n, f * 3.01), 0.07),
  );
  return body.map((x, i) => x * e[i] * g);
}

// ── measurement, so a claim about a clip can be checked rather than asserted ──

function power(x, f, sampleRate, from = 0, to = x.length) {
  const k = 2 * Math.cos((2 * Math.PI * f) / sampleRate);
  let s1 = 0, s2 = 0;
  for (let i = from; i < to; i++) { const s0 = x[i] + k * s1 - s2; s2 = s1; s1 = s0; }
  return Math.max(1e-20, s1 * s1 + s2 * s2 - k * s1 * s2);
}

/**
 * HOW MUCH THIS CLIP HISSES, on the measure that finally caught the "bush sound".
 *
 * Spectral flatness of whatever survives past the first 40ms: the geometric mean
 * of the band powers over their arithmetic mean, ~1 for white noise and near 0 for
 * anything pitched. A transient made of noise is an IMPACT and reads as one — the
 * dress-shoe heel is nearly all noise and scores 0.004. Noise that HANGS ON after
 * the attack is hiss, and scored 0.382.
 */
const HISS_BANDS = 256;
const HISS_LO = 80;      // low enough to actually contain a 96 Hz thud
const HISS_HI = 10000;

export function hiss(x, sampleRate) {
  const n = x.length;
  const cut = Math.min(n, Math.round(0.040 * sampleRate));
  if (cut >= n - 8) return 0;
  // SOMETHING HAS TO STILL BE SOUNDING, or the flatness is meaningless. A clip
  // whose noise is gone in 9ms leaves twenty milliseconds of near-silence after
  // the cut, and near-silence is perfectly flat — a dry unpitched tick scored
  // 0.213 for having nothing in it. Below 2% of the clip's energy surviving the
  // attack there is no tail to hear, whatever shape its spectrum has.
  let total = 0, late = 0;
  for (let i = 0; i < n; i++) { const e = x[i] * x[i]; total += e; if (i >= cut) late += e; }
  if (!(total > 0) || late / total < 0.02) return 0;
  const bands = [];
  for (let k = 0; k < HISS_BANDS; k++) {
    const f = HISS_LO * Math.pow(HISS_HI / HISS_LO, k / (HISS_BANDS - 1));
    if (f < sampleRate / 2) bands.push(power(x, f, sampleRate, cut, n));
  }
  const geo = Math.exp(bands.reduce((a, v) => a + Math.log(v), 0) / bands.length);
  const arith = bands.reduce((a, v) => a + v, 0) / bands.length;
  return geo / arith;
}
// RESOLUTION IS THE WHOLE MEASUREMENT, and the first version did not have enough.
//
// It swept 28 log-spaced bands from 200 Hz. That is fine for telling white noise
// from a two-partial bell, which is all the shipped set contained, and it fell
// apart the moment richer candidates existed: a music box has partials at f, 2f,
// 3.1f, 8.1f and 12.4f, and 28 bands cannot resolve the VALLEYS between them, so
// the spectrum looks continuous and it scored 0.230 — a purely tonal sound flagged
// as hiss. At 256 bands the valleys appear and it scores 0.001. Gravel, which is
// genuinely noise, barely moves: 0.255 → 0.317.
//
// The floor came down from 200 Hz to 80 for the same reason in the other
// direction. A 96 Hz thud has its fundamental BELOW a 200 Hz floor, so the sweep
// measured only its faint upper air, which sits on the numerical noise floor and
// looks perfectly flat. It scored 0.112 for having almost no content in the band
// being examined.

/** Log-spaced band levels in dB, for drawing a spectrum. */
export function spectrum(x, sampleRate, bins = 48) {
  const out = [];
  for (let k = 0; k < bins; k++) {
    const f = 80 * Math.pow(11000 / 80, k / (bins - 1));
    out.push(f < sampleRate / 2 ? power(x, f, sampleRate) : 1e-20);
  }
  const max = Math.max(...out);
  return out.map((v) => Math.max(0, 1 + Math.log10(v / max) / 4));   // 0..1 over 80dB
}

/** Peak envelope, downsampled for drawing a waveform. */
export function envelope(x, cols = 160) {
  const step = Math.max(1, Math.floor(x.length / cols));
  const out = [];
  for (let i = 0; i < x.length; i += step) {
    let m = 0;
    for (let j = i; j < Math.min(x.length, i + step); j++) m = Math.max(m, Math.abs(x[j]));
    out.push(m);
  }
  const max = Math.max(...out) || 1;
  return out.map((v) => v / max);
}
