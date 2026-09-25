// ─────────────────────────────────────────────────────────────────────────────
// THE REWARD INSTRUMENTS — the kit the three heard sounds are played on.
//
// Zero imports, like rig.ts and tone.ts, so every clip renders in plain Node.
// 44.1 kHz mono, float arrays, one seeded generator: re-running rebuilds every
// clip byte for byte.
//
// WHY A SECOND KIT BESIDE ./dsp.mjs. The first reward chime was three sine
// partials a note with no room around them, and a reader said exactly what that
// sounds like: "pretty cheap". What was missing was not a better envelope but an
// INSTRUMENT and a SPACE — real modal partials for a bell or a glockenspiel,
// band-limited detuned saws through a moving filter for a synth chord, a brass
// voice whose brightness follows its own swell, a felt thud with enough body to
// come through a phone speaker, and a Freeverb tail. dsp.mjs is built for small
// dry physical sounds and is left exactly as it is.
//
// The three sounds were chosen by ear on 2026-09-25 from twenty-one candidates
// in two rounds. The first round was all bells and mallets and was rejected as
// "too much of the same instrument"; the rest of the voices here (kalimba,
// choir, steel pan, piano, tongue drum and others) are what the second round
// offered, kept so the next choice can be made the same way.
// ─────────────────────────────────────────────────────────────────────────────
export const SR = 44100;
export const N = (s) => Math.max(0, Math.round(s * SR));
export const buf = (s) => new Float32Array(N(s));

let seed = 1;
export const reseed = (s) => { seed = s >>> 0 || 1; };
export const rnd = () => { // mulberry32, -1..1
  seed = (seed + 0x6D2B79F5) >>> 0;
  let t = seed;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return (((t ^ (t >>> 14)) >>> 0) / 4294967296) * 2 - 1;
};

export function add(dst, src, at = 0, g = 1) {
  const o = N(at);
  for (let i = 0; i < src.length && o + i < dst.length; i++) dst[o + i] += src[i] * g;
  return dst;
}

// ── filters ─────────────────────────────────────────────────────────────────
export function onepoleLP(x, fc) {
  const a = Math.exp(-2 * Math.PI * fc / SR); let y = 0; const o = new Float32Array(x.length);
  for (let i = 0; i < x.length; i++) { y = (1 - a) * x[i] + a * y; o[i] = y; }
  return o;
}
export function onepoleHP(x, fc) {
  const lp = onepoleLP(x, fc); const o = new Float32Array(x.length);
  for (let i = 0; i < x.length; i++) o[i] = x[i] - lp[i];
  return o;
}
// RBJ biquad
export function biquad(x, type, f, q = 0.707) {
  const w = 2 * Math.PI * f / SR, c = Math.cos(w), s = Math.sin(w), al = s / (2 * q);
  let b0, b1, b2, a0, a1, a2;
  if (type === 'lp') { b0 = (1 - c) / 2; b1 = 1 - c; b2 = (1 - c) / 2; }
  else if (type === 'hp') { b0 = (1 + c) / 2; b1 = -(1 + c); b2 = (1 + c) / 2; }
  else { b0 = al; b1 = 0; b2 = -al; } // bandpass
  a0 = 1 + al; a1 = -2 * c; a2 = 1 - al;
  const o = new Float32Array(x.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < x.length; i++) {
    const y = (b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0;
    x2 = x1; x1 = x[i]; y2 = y1; y1 = y; o[i] = y;
  }
  return o;
}

// ── voices ──────────────────────────────────────────────────────────────────
/** A struck modal voice: inharmonic partials, each with its own decay. */
export function modal(f, { ratios, amps, decays, dur = 1.5, attack = 0.0015, trem = 0, tremRate = 5.5, detune = 0 }) {
  const o = buf(dur); const na = Math.max(1, N(attack));
  for (let k = 0; k < ratios.length; k++) {
    const fk = f * ratios[k] * (1 + detune * rnd());
    if (fk > SR * 0.45) continue;
    const w = 2 * Math.PI * fk / SR, d = decays[k], a = amps[k];
    for (let i = 0; i < o.length; i++) {
      const t = i / SR;
      o[i] += a * Math.sin(w * i) * Math.exp(-t / d) * (i < na ? i / na : 1);
    }
  }
  if (trem) for (let i = 0; i < o.length; i++) o[i] *= 1 - trem * 0.5 * (1 - Math.cos(2 * Math.PI * tremRate * i / SR));
  return o;
}

/** The felt of a mallet: a few ms of filtered noise. */
export function click(f, { dur = 0.012, g = 0.25, q = 0.9 } = {}) {
  const n = N(dur); const x = new Float32Array(n);
  for (let i = 0; i < n; i++) x[i] = rnd() * Math.exp(-i / (n * 0.22));
  const b = biquad(x, 'bp', Math.min(f, SR * 0.4), q);
  for (let i = 0; i < n; i++) b[i] *= g;
  return b;
}

const pf = (f, ref, p) => Math.pow(ref / f, p); // lower notes ring longer

export const marimba = (f, g = 1, dur = 1.4) => {
  const s = pf(f, 523, 0.55);
  const m = modal(f, { ratios: [1, 3.99, 10.65], amps: [1, 0.28, 0.07], decays: [0.42 * s, 0.10 * s, 0.035], dur });
  add(m, click(f * 3, { g: 0.35 }));
  return scale(m, g);
};
export const vibes = (f, g = 1, dur = 2.2, trem = 0.14) => {
  const s = pf(f, 523, 0.4);
  const m = modal(f, { ratios: [1, 4.0, 10.0], amps: [1, 0.22, 0.05], decays: [1.1 * s, 0.30 * s, 0.07], dur, trem, tremRate: 4.8 });
  add(m, click(f * 2.5, { g: 0.12 }));
  return scale(m, g);
};
export const glock = (f, g = 1, dur = 1.8) => {
  const m = modal(f, { ratios: [1, 2.76, 5.40, 8.93], amps: [1, 0.30, 0.16, 0.06], decays: [0.95, 0.30, 0.14, 0.07], dur, attack: 0.0008 });
  add(m, click(Math.min(f * 4, 15000), { g: 0.18, dur: 0.006 }));
  return scale(m, g);
};
export const celesta = (f, g = 1, dur = 1.6) => {
  const s = pf(f, 880, 0.35);
  const m = modal(f, { ratios: [1, 2, 3.01, 4.03, 6.1], amps: [1, 0.42, 0.14, 0.07, 0.03], decays: [0.75 * s, 0.32 * s, 0.16, 0.09, 0.05], dur, attack: 0.001 });
  add(m, click(Math.min(f * 5, 14000), { g: 0.14, dur: 0.008 }));
  return scale(m, g);
};

/** FM tubular bell (DX7 recipe): carrier f, modulator 3.5f, index decaying. */
export function fmBell(f, g = 1, dur = 2.2, { ratio = 3.5, index = 3.2, decay = 1.1 } = {}) {
  const o = buf(dur); const wc = 2 * Math.PI * f / SR, wm = 2 * Math.PI * f * ratio / SR;
  for (let i = 0; i < o.length; i++) {
    const t = i / SR, I = index * Math.exp(-t / 0.35) + 0.4;
    o[i] = Math.sin(wc * i + I * Math.sin(wm * i)) * Math.exp(-t / decay) * (i < 44 ? i / 44 : 1);
  }
  return scale(o, g);
}

/** FM electric piano (Rhodes-ish): warm body + a tine glint on the attack. */
export function epiano(f, g = 1, dur = 1.8, decay = 0.9) {
  const o = buf(dur); const wc = 2 * Math.PI * f / SR;
  for (let i = 0; i < o.length; i++) {
    const t = i / SR;
    const I = 1.6 * Math.exp(-t / 0.18) + 0.25;
    const body = Math.sin(wc * i + I * Math.sin(wc * i));
    const tine = 0.18 * Math.sin(wc * 7.02 * i) * Math.exp(-t / 0.03);
    o[i] = (body * Math.exp(-t / decay) + tine) * (i < 66 ? i / 66 : 1);
  }
  return scale(o, g);
}

/** A plucked harp string: Karplus–Strong with a fractional delay. */
export function harp(f, g = 1, dur = 1.6, bright = 0.5) {
  const o = buf(dur); const L = SR / f; const size = Math.ceil(L) + 2; const line = new Float32Array(size);
  let w = 0;
  // pre-fill with lowpassed noise so the pluck is warm, not wiry
  let lp = 0;
  for (let i = 0; i < size; i++) { lp = lp * (1 - bright) + rnd() * bright; line[i] = lp; }
  let prev = 0; const loss = Math.pow(0.001, 1 / (f * 1.3)); // ~1.3 s to -60 dB
  for (let i = 0; i < o.length; i++) {
    const rp = w - L; const r0 = Math.floor(rp); const fr = rp - r0;
    const a = line[((r0 % size) + size) % size], b = line[(((r0 + 1) % size) + size) % size];
    const y = a + (b - a) * fr;
    const avg = 0.5 * (y + prev); prev = y;
    line[w % size] = avg * loss; w++;
    o[i] = y;
  }
  const hp = onepoleHP(o, 60);
  for (let i = 0; i < hp.length; i++) hp[i] *= (i < 30 ? i / 30 : 1);
  return scale(hp, g);
}

/** A soft ensemble swell: detuned saws, filter opening. */
export function pad(freqs, { dur = 2, attack = 0.4, release = 0.8, g = 1, cutoff = 2200, detune = 0.006 } = {}) {
  const n = N(dur); const o = new Float32Array(n);
  for (const f of freqs) for (const d of [-1, 0, 1]) {
    const s = saw(f * (1 + d * detune), n, Math.abs(rnd()));
    for (let i = 0; i < n; i++) o[i] += s[i] / (3 * freqs.length);
  }
  let y = onepoleLP(onepoleLP(o, cutoff), cutoff);
  const na = N(attack), nr = N(release);
  for (let i = 0; i < n; i++) {
    const up = i < na ? Math.pow(i / na, 1.6) : 1, dn = i > n - nr ? (n - i) / nr : 1;
    y[i] *= up * Math.max(0, dn) * g;
  }
  return y;
}

/** Brass-ish stab (FM, index follows the envelope so it brightens as it swells). */
export function brass(f, g = 1, dur = 1.2, { attack = 0.05, decay = 0.7 } = {}) {
  const o = buf(dur); const wc = 2 * Math.PI * f / SR;
  for (let i = 0; i < o.length; i++) {
    const t = i / SR;
    const e = t < attack ? t / attack : Math.exp(-(t - attack) / decay);
    const I = 0.6 + 2.2 * e;
    const vib = 1 + 0.0012 * Math.sin(2 * Math.PI * 5.2 * t) * Math.min(1, t / 0.3);
    o[i] = Math.sin(wc * vib * i + I * Math.sin(wc * vib * i)) * e;
  }
  return scale(onepoleLP(o, 4200), g);
}

/** A soft felt thump with body a phone speaker can actually reproduce. */
export function thud(g = 1, { f0 = 150, f1 = 72, dur = 0.45, body = 1, click: ck = 0.5 } = {}) {
  const o = buf(dur); let ph = 0;
  for (let i = 0; i < o.length; i++) {
    const t = i / SR; const f = f1 + (f0 - f1) * Math.exp(-t / 0.05);
    ph += 2 * Math.PI * f / SR;
    o[i] = body * (Math.sin(ph) + 0.35 * Math.sin(2 * ph)) * Math.exp(-t / 0.11) * (i < 40 ? i / 40 : 1);
  }
  const n = N(0.03); const nz = new Float32Array(n);
  for (let i = 0; i < n; i++) nz[i] = rnd() * Math.exp(-i / (n * 0.15));
  add(o, onepoleLP(nz, 1800), 0, ck);
  return scale(o, g);
}

/** Air: noise through a band that sweeps. */
export function sweepNoise(dur, f0, f1, { q = 1.4, g = 1, shape = 'up' } = {}) {
  const n = N(dur); const o = new Float32Array(n);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < n; i++) {
    const u = i / n; const f = f0 * Math.pow(f1 / f0, u);
    const w = 2 * Math.PI * f / SR, c = Math.cos(w), s = Math.sin(w), al = s / (2 * q);
    const x = rnd();
    const y = (al * x - al * x2 - (-2 * c) * y1 - (1 - al) * y2) / (1 + al);
    x2 = x1; x1 = x; y2 = y1; y1 = y;
    const e = shape === 'up' ? Math.pow(u, 2.2) : Math.sin(Math.PI * u);
    o[i] = y * e * g;
  }
  return o;
}

/** A scatter of tiny high glints. */
export function sparkle(dur, notes, { count = 10, g = 0.12, seedv = 99, from = 0 } = {}) {
  reseed(seedv);
  const o = buf(dur + 1.2);
  for (let k = 0; k < count; k++) {
    const at = from + (dur - from) * Math.pow((k + 0.5 * (1 + rnd())) / count, 1.3);
    const f = notes[Math.floor(((rnd() + 1) / 2) * notes.length) % notes.length];
    add(o, glock(f, g * (1 - 0.6 * k / count), 0.9), at);
  }
  return o;
}

export function scale(x, g) { for (let i = 0; i < x.length; i++) x[i] *= g; return x; }

// ── space ───────────────────────────────────────────────────────────────────
/** Freeverb, mono. */
export function reverb(x, { size = 0.78, damp = 0.35, wet = 0.25, pre = 0.015, tail = 1.0 } = {}) {
  const combs = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617];
  const aps = [556, 441, 341, 225];
  const n = x.length + N(tail);
  const inp = new Float32Array(n); for (let i = 0; i < x.length; i++) inp[i] = x[i] * 0.03;
  const out = new Float32Array(n);
  const fb = size * 0.28 + 0.7;
  const pd = N(pre);
  for (const L of combs) {
    const line = new Float32Array(L); let idx = 0, store = 0;
    for (let i = 0; i < n; i++) {
      const src = i - pd >= 0 ? inp[i - pd] : 0;
      const y = line[idx];
      store = y * (1 - damp) + store * damp;
      line[idx] = src + store * fb;
      idx = (idx + 1) % L;
      out[i] += y;
    }
  }
  for (const L of aps) {
    const line = new Float32Array(L); let idx = 0;
    for (let i = 0; i < n; i++) {
      const bo = line[idx]; const v = out[i];
      line[idx] = v + bo * 0.5; out[i] = bo - v; idx = (idx + 1) % L;
    }
  }
  const o = new Float32Array(n);
  for (let i = 0; i < n; i++) o[i] = (i < x.length ? x[i] : 0) * (1 - wet * 0.5) + out[i] * wet;
  return o;
}

/** Master: high-pass, gentle tape-style saturation, normalise, fade the tail. */
export function master(x, { peak = 0.89, hp = 70, drive = 1.4, fadeOut = 0.25, trimDb = -44, max = 99 } = {}) {
  let y = onepoleHP(onepoleHP(x, hp), hp);
  let m = 0; for (const v of y) m = Math.max(m, Math.abs(v));
  const k = drive / (m || 1);
  for (let i = 0; i < y.length; i++) y[i] = Math.tanh(y[i] * k);
  // trim trailing silence below threshold
  const thr = Math.pow(10, trimDb / 20);
  let end = y.length; while (end > 1 && Math.abs(y[end - 1]) < thr) end--;
  y = y.slice(0, Math.min(y.length, end + N(0.02), N(max)));
  m = 0; for (const v of y) m = Math.max(m, Math.abs(v));
  const nf = N(fadeOut);
  for (let i = 0; i < y.length; i++) {
    let v = y[i] * peak / (m || 1);
    if (i < 22) v *= i / 22;
    if (i > y.length - nf) v *= Math.pow((y.length - i) / nf, 1.5);
    y[i] = v;
  }
  y[0] = 0; y[y.length - 1] = 0;
  return y;
}

export function wav(samples, rate = SR) {
  const n = samples.length; const b = Buffer.alloc(44 + n * 2);
  b.write('RIFF', 0); b.writeUInt32LE(36 + n * 2, 4); b.write('WAVE', 8); b.write('fmt ', 12);
  b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(rate, 24);
  b.writeUInt32LE(rate * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write('data', 36);
  b.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, samples[i])) * 32767), 44 + i * 2);
  return b;
}

// Notes, D major.
export const NOTE = {
  D3: 146.83, A3: 220.0, D4: 293.66, E4: 329.63, Fs4: 369.99, G4: 392.0, A4: 440.0, B4: 493.88, Cs5: 554.37,
  D5: 587.33, E5: 659.26, Fs5: 739.99, G5: 783.99, A5: 880.0, B5: 987.77, Cs6: 1108.73,
  D6: 1174.66, E6: 1318.51, Fs6: 1479.98, A6: 1760.0, B6: 1975.53, D7: 2349.32, Fs7: 2959.96, A7: 3520.0,
};

// ── the second-round voices ─────────────────────────────────────────────────

/** State-variable lowpass with a cutoff that moves every sample. */
export function svfLP(x, cutoff, q = 0.8) {
  const o = new Float32Array(x.length); let lp = 0, bp = 0;
  for (let i = 0; i < x.length; i++) {
    const fc = Math.min(cutoff(i / SR), SR * 0.2);
    const f = 2 * Math.sin(Math.PI * fc / SR);
    const hp = x[i] - lp - bp / q; bp += f * hp; lp += f * bp; o[i] = lp;
  }
  return o;
}
function saw(f, n, ph = 0, vib = null) {
  const o = new Float32Array(n); let p = ph;
  for (let i = 0; i < n; i++) {
    const dt = f * (vib ? vib(i / SR) : 1) / SR;
    let v = 2 * p - 1;
    if (p < dt) { const t = p / dt; v -= t + t - t * t - 1; }
    else if (p > 1 - dt) { const t = (p - 1) / dt; v -= t * t + t + t + 1; }
    o[i] = v; p += dt; if (p >= 1) p -= 1;
  }
  return o;
}
const envAD = (n, a, d) => { const e = new Float32Array(n); const na = Math.max(1, N(a)); for (let i = 0; i < n; i++) e[i] = i < na ? i / na : Math.exp(-(i - na) / SR / d); return e; };
const mul = (x, e) => { for (let i = 0; i < x.length; i++) x[i] *= e[i]; return x; };

export const kalimba = (f, g = 1, dur = 1.2) => {
  const o = modal(f, { ratios: [1, 5.9, 9.1], amps: [1, 0.22, 0.08], decays: [0.55, 0.07, 0.03], dur, attack: 0.001 });
  add(o, click(f * 7, { g: 0.22, dur: 0.01, q: 2 }));      // the tine buzz
  add(o, click(900, { g: 0.12, dur: 0.02 }));               // thumb on the box
  return scale(o, g);
};

export function synthPluck(f, g = 1, dur = 0.8, { bright = 5000, decay = 0.28 } = {}) {
  const n = N(dur); const x = new Float32Array(n);
  for (const d of [-0.004, 0.004]) { const s = saw(f * (1 + d), n, Math.abs(rnd())); for (let i = 0; i < n; i++) x[i] += s[i] * 0.5; }
  const y = svfLP(x, (t) => 300 + bright * Math.exp(-t / 0.08), 1.2);
  return scale(mul(y, envAD(n, 0.003, decay)), g);
}

export function superStab(freqs, g = 1, dur = 1.2, { attack = 0.01, decay = 0.45, cutoff = 6000, close = 0.25 } = {}) {
  const n = N(dur); const x = new Float32Array(n);
  for (const f of freqs) for (const d of [-0.012, -0.006, 0, 0.006, 0.012]) {
    const s = saw(f * (1 + d), n, Math.abs(rnd())); for (let i = 0; i < n; i++) x[i] += s[i] / (5 * freqs.length);
  }
  const y = svfLP(x, (t) => 700 + cutoff * Math.exp(-t / close), 0.9);
  return scale(mul(y, envAD(n, attack, decay)), g);
}

/** A choir "aah": three detuned voices with vibrato through the /a/ formants. */
export function choir(freqs, g = 1, dur = 1.6, { attack = 0.25, release = 0.5 } = {}) {
  const n = N(dur); const src = new Float32Array(n);
  for (const f of freqs) for (let v = 0; v < 3; v++) {
    const det = 1 + (v - 1) * 0.0025, rate = 5 + v * 0.7, ph = rnd() * 3;
    const s = saw(f * det, n, Math.abs(rnd()), (t) => 1 + 0.006 * Math.sin(2 * Math.PI * rate * t + ph) * Math.min(1, t / 0.3));
    for (let i = 0; i < n; i++) src[i] += s[i] / (3 * freqs.length);
  }
  const y = new Float32Array(n);
  for (const [F, Q, A] of [[800, 6, 1], [1150, 8, 0.6], [2900, 10, 0.25], [3900, 12, 0.12]]) {
    const b = biquad(src, 'bp', F, Q); for (let i = 0; i < n; i++) y[i] += b[i] * A;
  }
  const na = N(attack), nr = N(release);
  for (let i = 0; i < n; i++) y[i] *= (i < na ? Math.pow(i / na, 1.5) : 1) * (i > n - nr ? (n - i) / nr : 1) * 3.2;
  return scale(y, g);
}

export const steelpan = (f, g = 1, dur = 1.1) => {
  const o = modal(f, { ratios: [1, 2.0, 3.01, 4.02, 5.1], amps: [1, 0.75, 0.35, 0.12, 0.05], decays: [0.5, 0.35, 0.18, 0.1, 0.05], dur, attack: 0.004 });
  add(o, click(2500, { g: 0.1, dur: 0.008 }));
  return scale(o, g);
};

/** Additive piano: stretched partials, three slightly detuned strings, a hammer. */
export function piano(f, g = 1, dur = 1.8, vel = 0.8) {
  const o = buf(dur); const B = 0.0004;
  for (const d of [-0.0009, 0, 0.0011]) for (let k = 1; k <= 12; k++) {
    const fk = k * f * Math.sqrt(1 + B * k * k) * (1 + d); if (fk > 14000) break;
    const amp = Math.pow(k, -1.1) * (k === 1 ? 1 : vel) / 3;
    const d1 = 0.9 / Math.pow(k, 0.55) * Math.pow(261 / f, 0.35), w = 2 * Math.PI * fk / SR;
    for (let i = 0; i < o.length; i++) { const t = i / SR; o[i] += amp * Math.sin(w * i) * (0.7 * Math.exp(-t / (d1 * 0.25)) + 0.3 * Math.exp(-t / (d1 * 2.2))); }
  }
  for (let i = 0; i < 60; i++) o[i] *= i / 60;
  add(o, onepoleLP(click(f * 2, { g: 0.25, dur: 0.02, q: 0.5 }), 3000));
  return scale(o, g);
}

export function clap(g = 1, seedv = 5) {
  reseed(seedv); const n = N(0.22); const x = new Float32Array(n);
  const hits = [0, 0.009, 0.019, 0.027];
  for (let i = 0; i < n; i++) {
    const t = i / SR; let e = 0;
    for (const h of hits) if (t >= h) e = Math.max(e, Math.exp(-(t - h) / 0.006));
    e = Math.max(e, t > 0.027 ? 0.35 * Math.exp(-(t - 0.027) / 0.06) : 0);
    x[i] = rnd() * e;
  }
  return scale(biquad(onepoleHP(x, 500), 'bp', 1400, 0.7), g * 2.2);
}

export function strings(freqs, g = 1, dur = 1.6, { attack = 0.18, release = 0.6, cutoff = 2600 } = {}) {
  const n = N(dur); const x = new Float32Array(n);
  for (const f of freqs) for (const d of [-0.004, 0, 0.005]) {
    const ph = rnd() * 6;
    const s = saw(f * (1 + d), n, Math.abs(rnd()), (t) => 1 + 0.004 * Math.sin(2 * Math.PI * 5.5 * t + ph) * Math.min(1, t / 0.25));
    for (let i = 0; i < n; i++) x[i] += s[i] / (3 * freqs.length);
  }
  const y = svfLP(x, (t) => cutoff * (0.5 + 0.5 * Math.min(1, t / attack)), 0.7);
  const na = N(attack), nr = N(release);
  for (let i = 0; i < n; i++) y[i] *= (i < na ? Math.pow(i / na, 1.3) : 1) * (i > n - nr ? Math.pow((n - i) / nr, 1.5) : 1);
  return scale(y, g);
}

export const tongueDrum = (f, g = 1, dur = 1.8) => {
  const o = modal(f, { ratios: [1, 2.01, 3.94], amps: [1, 0.3, 0.07], decays: [1.0, 0.4, 0.12], dur, attack: 0.003 });
  add(o, onepoleLP(click(400, { g: 0.3, dur: 0.02, q: 0.6 }), 900));
  return scale(o, g);
};

export function whooshUp(dur, g = 1, f0 = 400, f1 = 5000) {
  const n = N(dur); const x = new Float32Array(n);
  for (let i = 0; i < n; i++) x[i] = rnd();
  const y = svfLP(x, (t) => f0 * Math.pow(f1 / f0, t / dur), 2.5);
  for (let i = 0; i < n; i++) y[i] *= Math.pow(i / n, 2) * g;
  return y;
}
