// ─────────────────────────────────────────────────────────────────────────────
// THE SOUNDS ARE GENERATED, NOT DOWNLOADED.
//
// This script IS the licence. Every clip in assets/sound/ is synthesised here
// from noise and sine partials, so there is no provenance to track, no
// attribution to carry, nobody's terms to re-read when the app ships somewhere
// new, and no free-tier that can be withdrawn. Re-run it and the set rebuilds
// byte-for-byte; change a number and the sound changes.
//
// It also fits what the app IS. The artwork is hand-drawn ink on paper and none
// of it was bought in; a library thump or a bright arcade coin would be the first
// thing in the product that came from somewhere else. These are small, dry, close
// sounds — paper, cloth, a pen tip, one soft chime.
//
// FORMAT: mono, 22.05 kHz, 16-bit PCM WAV. Uncompressed on purpose — it needs no
// decoder, no dependency, and at these lengths the saving from m4a is a few tens
// of kilobytes against a licensing and tooling story. A 60ms clip is 2.6 KB.
//
//   node scripts/make-sounds.mjs
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'assets', 'sound');
const RATE = 22050;

// A fixed generator, so re-running produces identical files. Math.random() would
// make every rebuild a different sound and every diff a mystery.
let seed = 0x9e3779b9;
const rnd = () => {
  seed ^= seed << 13; seed >>>= 0;
  seed ^= seed >> 17;
  seed ^= seed << 5; seed >>>= 0;
  return (seed / 0xffffffff) * 2 - 1;
};
const reseed = (s) => { seed = s >>> 0; };

/** One-pole low pass. `c` is 0..1 — smaller is duller. */
function lowpass(buf, c) {
  let y = 0;
  return buf.map((x) => (y += c * (x - y)));
}
/** Subtracting a low pass from the signal leaves the top end. */
function highpass(buf, c) {
  const lo = lowpass(buf, c);
  return buf.map((x, i) => x - lo[i]);
}

const noise = (n) => Array.from({ length: n }, () => rnd());

/** Exponential decay from 1 to ~0 over the clip, with a short fade-in. */
function env(n, attack, decay) {
  const a = Math.max(1, Math.round(attack * RATE));
  return Array.from({ length: n }, (_, i) => {
    const rise = i < a ? i / a : 1;
    return rise * Math.exp((-i / RATE) / decay);
  });
}

const sine = (n, f, phase = 0) =>
  Array.from({ length: n }, (_, i) => Math.sin(2 * Math.PI * f * (i / RATE) + phase));

const mix = (...layers) => {
  const n = Math.max(...layers.map((l) => l.length));
  const out = new Array(n).fill(0);
  for (const l of layers) for (let i = 0; i < l.length; i++) out[i] += l[i];
  return out;
};
const gain = (buf, g) => buf.map((x) => x * g);

/** Normalise to a peak, then fade the last 4ms so nothing ends on a click. */
function finish(buf, peak = 0.72) {
  const max = Math.max(...buf.map(Math.abs)) || 1;
  const k = peak / max;
  const tail = Math.round(0.004 * RATE);
  return buf.map((x, i) => {
    const fade = i > buf.length - tail ? (buf.length - i) / tail : 1;
    return x * k * fade;
  });
}

function wav(samples) {
  const n = samples.length;
  const b = Buffer.alloc(44 + n * 2);
  b.write('RIFF', 0);
  b.writeUInt32LE(36 + n * 2, 4);
  b.write('WAVE', 8);
  b.write('fmt ', 12);
  b.writeUInt32LE(16, 16);          // PCM chunk size
  b.writeUInt16LE(1, 20);           // format: PCM
  b.writeUInt16LE(1, 22);           // channels: mono
  b.writeUInt32LE(RATE, 24);
  b.writeUInt32LE(RATE * 2, 28);    // byte rate
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

const secs = (s) => Math.round(s * RATE);

// ── the set ──────────────────────────────────────────────────────────────────

/**
 * A FOOTFALL — a shoe on boards, close and dry.
 *
 * Low-passed noise with a very fast decay, plus a thud an octave below to give it
 * a body. Two variants, alternated at the call site: one sample repeated at
 * walking cadence turns into a typewriter within three steps, and the ear catches
 * the repetition long before it notices the sound.
 */
function step(variant) {
  reseed(1013 + variant * 7717);
  const n = secs(0.075);
  const body = gain(lowpass(noise(n), 0.16), 1);
  const thud = gain(sine(n, variant ? 96 : 84), 0.55);
  return finish(mix(
    body.map((x, i) => x * env(n, 0.0008, 0.020)[i]),
    thud.map((x, i) => x * env(n, 0.0005, 0.014)[i]),
  ), 0.55);
}

/**
 * AN ARM THROUGH AIR — cloth, not a whip.
 *
 * Band-passed noise on a slow swell: the energy rises into the middle of the
 * gesture and falls away, which is what a sleeve does. High-passed hard, because
 * anything low in it reads as a footstep and the two happen together.
 */
function swish() {
  reseed(4242);
  const n = secs(0.22);
  const air = highpass(lowpass(noise(n), 0.30), 0.03);
  const swell = Array.from({ length: n }, (_, i) => {
    const u = i / n;
    return Math.sin(Math.PI * u) ** 1.6;
  });
  return finish(air.map((x, i) => x * swell[i]), 0.34);
}

/**
 * A TAP — a fingertip on card.
 *
 * Almost all attack: 40ms, high-passed so it sits above the narration rather than
 * under it, with a barely-there pitched click so it reads as an object being
 * touched rather than as static.
 */
function tap() {
  reseed(90210);
  const n = secs(0.045);
  const click = highpass(noise(n), 0.22);
  const tick = gain(sine(n, 1900), 0.22);
  return finish(mix(click, tick).map((x, i) => x * env(n, 0.0004, 0.010)[i]), 0.42);
}

/**
 * THE REWARD — one warm chime, not a fanfare.
 *
 * Two notes a fifth apart (D5, A5) with the second entering a beat later, on soft
 * exponential decays with a little of the octave above for shine. It is the
 * loudest thing in the set and still under 0.8 peak: this plays at the end of
 * every lesson, so a triumphant sound would wear out in a week.
 */
function reward() {
  const n = secs(1.15);
  const note = (f, delay, g) => {
    const d = secs(delay);
    const e = env(n - d, 0.004, 0.34);
    const body = mix(
      sine(n - d, f),
      gain(sine(n - d, f * 2), 0.28),
      gain(sine(n - d, f * 3.01), 0.08),
    );
    return [...new Array(d).fill(0), ...body.map((x, i) => x * e[i] * g)];
  };
  return finish(mix(note(587.33, 0, 1), note(880.0, 0.13, 0.8)), 0.78);
}

const SET = {
  'step-a': step(0),
  'step-b': step(1),
  swish: swish(),
  tap: tap(),
  reward: reward(),
};

fs.mkdirSync(OUT, { recursive: true });
let total = 0;
console.log('generated — no licence, no attribution, no provenance to track\n');
for (const [name, samples] of Object.entries(SET)) {
  const buf = wav(samples);
  fs.writeFileSync(path.join(OUT, `${name}.wav`), buf);
  total += buf.length;
  const peak = Math.max(...samples.map(Math.abs));
  console.log(
    `  ${name.padEnd(8)} ${String((samples.length / RATE * 1000).toFixed(0)).padStart(5)}ms  ` +
    `${String((buf.length / 1024).toFixed(1)).padStart(6)} KB  peak ${peak.toFixed(2)}`,
  );
}
console.log(`\n  ${Object.keys(SET).length} files · ${(total / 1024).toFixed(1)} KB total`);
