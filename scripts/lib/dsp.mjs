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

// ─────────────────────────────────────────────────────────────────────────────
// WHY THE FIRST SET SOUNDED SYNTHETIC, AND THE FOUR THINGS THAT FIX IT.
//
// The clips above are built from one or two decaying sines plus a filtered noise
// burst. That is a reasonable cartoon of an impact and it is not what any real
// object does. Reported as "I can tell these aren't actually real", and correct.
//
// Real recordings were not obtainable — Freesound needs OAuth credentials I do
// not have, and Wikimedia Commons has no footstep or whoosh audio at all — so
// this is the acoustics done properly instead of a sample library. Four gaps, in
// the order they matter:
//
//   1. MODE COUNT AND MODE-DEPENDENT DAMPING. A struck object rings at eight to
//      twenty frequencies at once, they are INHARMONIC, and the high ones die
//      first. One sine is a beep; the ratios and the differential damping are
//      most of what says "a thing was hit".
//   2. NO ROOM. Every real recording has early reflections — the same sound
//      arriving again off a floor and two walls, 10–50ms later, quieter and
//      duller each time. Their absence is why synthetic audio sounds like it is
//      inside your head rather than in front of you.
//   3. WHITE NOISE. Real impact noise falls off with frequency. Flat noise reads
//      as hiss, which is exactly the complaint the whole "bush sound" was.
//   4. PERFECT REPETITION. Two identical footsteps are instantly a loop. Real
//      ones differ in level, timing and timbre on every stride.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Mode ratios for real materials. These are what make a struck thing sound like
 * WHAT IT IS: a bar is stiff and wildly inharmonic, a bell has its famous minor
 * tierce, glass is nearly harmonic and a floor panel is a dense low cluster.
 */
export const MATERIAL = {
  bar:    [1, 2.756, 5.404, 8.933, 13.34],            // free-free bar: marimba, wood block
  wood:   [1, 2.42, 4.19, 6.10, 8.4],                 // a struck board — stiff but damped
  plate:  [1, 1.35, 1.72, 2.10, 2.61, 3.22, 3.9],     // a floor panel: dense and low
  stone:  [1, 1.91, 3.12, 4.53, 6.18, 7.9],           // concrete or tile, very fast
  glass:  [1, 2.02, 3.35, 4.81, 6.42],                // nearly harmonic, long
  bell:   [0.5, 1, 1.19, 1.51, 2.0, 2.51, 3.01, 4.1], // hum, prime, minor tierce, quint…
  metal:  [1, 1.73, 2.41, 3.14, 4.02, 5.11, 6.4],     // struck plate, dense
};

/**
 * MODAL SYNTHESIS — the single biggest step from "beep" to "object".
 *
 * Every mode gets its own decay, and higher modes decay FASTER, which is what
 * real damping does: `decay_k = decay / (1 + damp · (ratio − 1))`. That is why a
 * struck object is bright for ten milliseconds and warm afterwards — the timbre
 * changes as it rings, and a single sine cannot do that at all.
 *
 * `spread` detunes each mode slightly and randomises its level. Perfectly exact
 * ratios sound manufactured; a real object is never quite the ideal shape.
 */
export function modal(n, f0, ratios, { decay = 0.20, damp = 0.55, g = 1, tilt = 1.0,
  spread = 0.02, attack = 0.0004 } = {}) {
  const out = new Array(n).fill(0);
  for (let k = 0; k < ratios.length; k++) {
    const detune = 1 + (rnd() * spread);
    const f = f0 * ratios[k] * detune;
    if (f > RATE * 0.47) continue;                       // above Nyquist, skip
    const dk = decay / (1 + damp * (ratios[k] - 1));
    const ak = (g / Math.pow(ratios[k], tilt)) * (0.85 + 0.3 * Math.abs(rnd()));
    // EVERY MODE STARTS IN PHASE, because that is what being hit means.
    //
    // These used to start at a random phase, which is how a sustained resonator
    // behaves and NOT how a struck one does: an impulse excites the whole mode set
    // at once, at t = 0, together. The unphysical version also had an audible
    // cost — seven modes at random phases interfere, and on a quiet sound where
    // the modes ARE the sound the interference shapes the envelope, dipping and
    // then swelling back. Measured at 0.66 on the soft-soled step: a second
    // footfall made of nothing but arithmetic.
    const e = env(n, attack, dk);
    const s = sine(n, f);
    for (let i = 0; i < n; i++) out[i] += s[i] * e[i] * ak;
  }
  return out;
}

/**
 * EARLY REFLECTIONS — the sound arriving again off the floor and the walls.
 *
 * Four taps at prime-ish delays so they never comb into a ringing pitch, each
 * quieter and duller than the last. This is the cheapest large gain in realism
 * available: an anechoic impact sounds synthetic no matter how good its modes
 * are, because nothing in the physical world reaches an ear only once.
 */
export function reflect(buf, { time = 0.16, wet = 0.35, damp = 0.5, taps = 140, seed = 7717 } = {}) {
  // FOUR LOUD TAPS IS A FLUTTER ECHO, NOT A ROOM — and it was the "unnatural
  // double sound".
  //
  // The first version placed four discrete reflections at 11, 20, 31 and 49ms at
  // 0.34 / 0.25 / 0.17 / 0.11. On a sustained sound that is a plausible room. On a
  // 5ms impact it is four separate audible repeats of the impact: measuring the
  // amplitude envelope of one footstep found NINE peaks spread over 107ms, and a
  // walk made of those does not sound like walking, it sounds like a stutter.
  //
  // A real early-reflection cluster is DENSE and QUIET — dozens of arrivals in the
  // first 50ms, none of them individually audible, blurring into a single sense of
  // space. So this is a sparse-random impulse response: ~140 taps at irregular
  // times with random signs and exponentially falling amplitude. Random signs
  // matter as much as density; same-sign taps sum into a comb filter and colour
  // the sound. Irregular times matter because evenly spaced ones ring at their own
  // spacing, which is the definition of a flutter.
  const prev = seed;
  reseed(seed);
  const n = Math.round(time * RATE);
  const ir = new Float64Array(n);
  for (let k = 0; k < taps; k++) {
    // Times skewed early — a room's reflections arrive densest right after the
    // direct sound — and never in the first 4ms, which would just thicken the hit.
    const u = Math.pow(Math.abs(rnd()), 1.7);
    const i = Math.min(n - 1, Math.round(0.004 * RATE + u * (n - 0.004 * RATE)));
    ir[i] += Math.sign(rnd() || 1) * Math.exp(-(i / RATE) / (time * 0.32)) * (0.4 + 0.6 * Math.abs(rnd()));
  }
  const dull = lowpass(buf, damp);                       // the bounces lose top end
  const out = buf.slice();
  for (let i = 0; i < n; i++) out.push(0);
  // Normalised by the tap count so `wet` means the same thing at any density.
  const k = (wet * 2.2) / Math.sqrt(taps);
  for (let i = 0; i < n; i++) {
    const a = ir[i];
    if (!a) continue;
    const g = a * k;
    for (let j = 0; j < dull.length; j++) out[j + i] += dull[j] * g;
  }
  reseed(prev);
  return out;
}

/**
 * A BANDPASS WHOSE CENTRE FREQUENCY MOVES — and the reason the old whoosh failed.
 *
 * `swish` was noise through a FIXED band on a slow rise-and-fall. That is a
 * volume envelope on a static timbre, and a static timbre made of noise is hiss
 * however you shape its level. It scored 0.474 and was correctly hated.
 *
 * A real limb moving through air does something else entirely: it accelerates and
 * decelerates, so the turbulence it makes SWEEPS UP IN PITCH and back down, and
 * the resonance sharpens at speed. The frequency moving is the whole sound. Get
 * that and you have a whoosh; leave it out and you have a bush, and no amount of
 * filtering or enveloping will convert one into the other.
 *
 * Coefficients are recomputed every 64 samples, which is 1.5ms at 44.1k — far
 * finer than any audible zipper and 64× cheaper than doing it per sample.
 */
export function sweepBand(buf, f0, fPeak, f1, q0 = 1.2, qPeak = 3.0) {
  const n = buf.length;
  const out = new Array(n);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  let b0 = 0, b2 = 0, a0 = 1, a1 = 0, a2 = 0;
  for (let i = 0; i < n; i++) {
    if (i % 64 === 0) {
      const u = i / n;
      // Up to the peak in the first 40% of the gesture, down after — the shape of
      // an arm swing, not a symmetrical bump.
      const f = u < 0.4 ? f0 + (fPeak - f0) * (u / 0.4) : fPeak + (f1 - fPeak) * ((u - 0.4) / 0.6);
      const q = q0 + (qPeak - q0) * Math.sin(Math.PI * u);
      const w = (2 * Math.PI * Math.min(f, RATE * 0.45)) / RATE;
      const alpha = Math.sin(w) / (2 * q);
      const cosw = Math.cos(w);
      b0 = alpha; b2 = -alpha;
      a0 = 1 + alpha; a1 = -2 * cosw; a2 = 1 - alpha;
    }
    const x = buf[i];
    const y = (b0 / a0) * x + (b2 / a0) * x2 - (a1 / a0) * y1 - (a2 / a0) * y2;
    x2 = x1; x1 = x; y2 = y1; y1 = y;
    out[i] = y;
  }
  return out;
}

/** Noise with a spectral tilt. `-1` is roughly pink; real impact noise is −0.5…−1. */
export function tilted(n, slope = -0.7) {
  // Three one-pole lowpasses in parallel at spread cutoffs approximate a tilt far
  // more cheaply than an FFT, and the ear cannot tell the difference on a 20ms burst.
  const w = noise(n);
  const a = lowpass(w, 0.9), b = lowpass(w, 0.35), c = lowpass(w, 0.08);
  const k = Math.min(1, Math.max(0, -slope));
  return w.map((x, i) => x * (1 - k) + (a[i] * 0.5 + b[i] * 0.9 + c[i] * 1.4) * k * 0.55);
}

/**
 * CRUMPLING — how an aggregate surface actually sounds.
 *
 * Gravel, snow and dry leaves are not "noise". They are a burst of MANY tiny
 * independent impacts whose rate and energy both fall away, which is why they
 * have grain rather than hiss. Modelling it as a filtered noise swell is exactly
 * the mistake that produced the bush sound.
 */
export function crumple(n, { grains = 60, decay = 0.055, f = 2600, q = 1.6, spread = 1.0 } = {}) {
  const out = new Array(n).fill(0);
  for (let k = 0; k < grains; k++) {
    // Times drawn so density falls with the energy — a real crunch front-loads.
    const u = Math.pow(Math.abs(rnd()), spread);
    const at0 = Math.floor(u * n);
    const amp = Math.exp(-(at0 / RATE) / decay) * (0.35 + 0.65 * Math.abs(rnd()));
    const gl = Math.min(n - at0, Math.round(0.004 * RATE));
    if (gl < 4) continue;
    const gf = f * (0.6 + 0.9 * Math.abs(rnd()));
    const grain = bandpass(noise(gl), Math.min(gf, RATE * 0.45), q);
    const ge = env(gl, 0.0001, 0.0016);
    for (let i = 0; i < gl; i++) out[at0 + i] += grain[i] * ge[i] * amp;
  }
  return out;
}

/**
 * A two-stage decay: a fast initial drop into a slower tail.
 *
 * Real decays are not single exponentials. An object loses its high-frequency
 * energy to the air almost at once and then rings on quietly for much longer, and
 * a pure exponential is one of the quieter tells that a sound was computed.
 */
export function env2(n, attack, fast, slow, mixSlow = 0.30) {
  const a = Math.max(1, Math.round(attack * RATE));
  return Array.from({ length: n }, (_, i) => {
    const rise = i < a ? i / a : 1;
    const t = i / RATE;
    return rise * ((1 - mixSlow) * Math.exp(-t / fast) + mixSlow * Math.exp(-t / slow));
  });
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

/**
 * DOES THIS READ AS TWO HITS? 0 is one clean impact, 1 is a flam.
 *
 * Reported as "an unnatural double sound, it doesn't sound like walking", and
 * measurable: a natural decay only ever falls, so a SUSTAINED RISE after a real
 * fall is a second contact. Smoothed first, because the ripple in a noisy decay
 * is not a re-attack.
 *
 * Calibrated against two references rather than a guessed threshold — the dress
 * shoe the reader likes scores 0.00, and that same shoe deliberately played twice
 * 42ms apart scores 0.94. Anything past ~0.45 is audibly two events.
 *
 * It has already caught three separate causes, none of which were the one I
 * assumed: four discrete reverb taps reading as a flutter echo, a forefoot
 * modelled as a strike instead of a roll, and two modes 54 Hz apart beating into
 * an 18ms warble.
 */
export function doubling(x) {
  const raw = envelope(x, 240);
  const w = 4;
  const e = raw.map((_, i) => {
    let s = 0, c = 0;
    for (let j = Math.max(0, i - w); j <= Math.min(raw.length - 1, i + w); j++) { s += raw[j]; c++; }
    return s / c;
  });
  let pk = 0, pi = 0;
  for (let i = 0; i < e.length; i++) if (e[i] > pk) { pk = e[i]; pi = i; }
  let min = Infinity, worst = 0;
  for (let i = pi + 1; i < e.length; i++) {
    if (e[i] < min) min = e[i];
    if (min < pk * 0.55 && e[i] > pk * 0.30 && e[i] > min * 1.8) worst = Math.max(worst, e[i] / pk);
  }
  return worst;
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
