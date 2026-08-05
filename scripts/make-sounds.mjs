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
// FORMAT: mono 16-bit PCM WAV, uncompressed on purpose — no decoder, no
// dependency, and at these lengths the saving from m4a is a few tens of kilobytes
// against a licensing and tooling story.
//
// SAMPLE RATE IS PER CLIP, AND THAT IS A CORRECTION.
//
// The whole set shipped at 22.05 kHz, which puts the Nyquist limit at 11 kHz. For
// a bell that is irrelevant — its highest partial is under 3.5 kHz. For anything
// with a TRANSIENT it is most of the character: the snap of a leather heel, the
// edge of a fingertip on a surface, the tick of a counter all live between 4 and
// 10 kHz, and everything above 11 was simply gone. That is a large part of why the
// first set sounded cheap — not the shapes, the ceiling.
//
// So the percussive clips are 44.1 kHz and the pitched ones stay at 22.05, which
// buys the crispness exactly where it exists and pays for it nowhere else.
//
//   node scripts/make-sounds.mjs
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'assets', 'sound');

const HI = 44100;   // anything with a transient
const LO = 22050;   // struck tones, whose partials are all well under 11 kHz

// Mutable so the helpers below (which read it at call time) follow whichever clip
// is being rendered. `atRate` is the only thing that may change it.
let RATE = LO;
const atRate = (rate, make) => {
  const prev = RATE;
  RATE = rate;
  try { return { rate, data: make() }; } finally { RATE = prev; }
};

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

/**
 * A RESONANT BANDPASS, which is the thing the first set was missing.
 *
 * A one-pole low pass only makes noise duller; it cannot make it sound like a
 * MATERIAL. What tells an ear "leather on a hard floor" rather than "a filtered
 * hiss" is a resonance — a frequency the object rings at, sharply. This is the
 * standard RBJ biquad, and its `q` is the whole difference between a shoe and a
 * shush.
 */
function bandpass(buf, f, q) {
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
const ring = (n, f, decay, g = 1) => {
  const e = env(n, 0.0004, decay);
  return sine(n, f).map((x, i) => x * e[i] * g);
};

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

/**
 * Centre, normalise to a peak, then fade the last 4ms so nothing ends on a click.
 *
 * THE CENTRING IS NOT COSMETIC. A short burst of low-passed noise does not average
 * to zero — filtering a finite random sequence leaves a residual offset, and
 * `step-a` shipped with one of 0.0137. A clip with DC in it starts by yanking the
 * speaker cone off centre and ends by letting it go, which is a click at both ends
 * that no fade can remove because the fade is applied to an offset signal. It is
 * worst on exactly the cue that can least afford it: the footfall, which fires
 * two and a half times a second under a walking figure.
 */
function finish(buf, peak = 0.72) {
  const dc = buf.reduce((a, x) => a + x, 0) / (buf.length || 1);
  const centred = buf.map((x) => x - dc);
  const max = Math.max(...centred.map(Math.abs)) || 1;
  const k = peak / max;
  const tail = Math.round(0.004 * RATE);
  // AND A FADE-IN, which centring is what made necessary. Every layer already
  // starts at zero — the envelopes and swells all begin at 0 — but subtracting the
  // mean moves the whole clip down by that mean, so the first sample lands at −dc
  // instead of at silence and the click reappears at the head. 1ms is inaudible
  // against a 0.8ms attack and pins the start to zero exactly.
  const nose = Math.round(0.001 * RATE);
  return centred.map((x, i) => {
    const up = i < nose ? i / nose : 1;
    const down = i > buf.length - tail ? (buf.length - i) / tail : 1;
    return x * k * up * down;
  });
}

function wav(samples, RATE) {
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
 * A DRESS SHOE ON A HARD FLOOR — a leather heel, not a soft thud.
 *
 * The old footfall was low-passed noise plus a sine an octave down: correct as a
 * description of a weight landing, and completely wrong as a description of a
 * SHOE. It had nothing above 11 kHz because the whole set was 22.05, and nothing
 * resonant anywhere, so it read as a dull bump. A leather sole is the opposite of
 * dull — it is mostly edge.
 *
 * Four layers, in the order the ear reads them:
 *
 *   1. THE HEEL. A very short burst of high-passed noise, 3ms of decay. This is
 *      the click of a hard heel meeting a hard floor and it is what makes the shoe
 *      a dress shoe rather than a trainer. It needs the 44.1 kHz ceiling to exist
 *      at all — most of it sits between 4 and 9 kHz.
 *   2. THE SOLE. Noise through a resonant bandpass at 1.9/2.2 kHz, Q 2.4, decaying
 *      in 14ms. The resonance is what says "leather" instead of "hiss".
 *   3. THE FLOOR. A struck tone at 205/232 Hz answering underneath, 40ms.
 *   4. THE ROOM. A whisper of low noise out to 90ms, so the step happens somewhere
 *      rather than in a vacuum. Very quiet — at 0.10 it is felt, not heard.
 *
 * Two variants alternated at the call site: one sample repeated at walking cadence
 * becomes a typewriter within three steps, and the ear catches the repetition long
 * before it notices the sound. The right shoe is a shade brighter and higher than
 * the left, which is what a real pair does.
 */
function step(variant) {
  reseed(1013 + variant * 7717);
  const n = secs(0.11);
  // The heel band starts at ~2.4 kHz rather than ~3.8: the crack of a hard heel is
  // spread across 2–8 kHz, and cutting at 3.8 threw away the loudest half of it.
  const heelN = secs(0.020);
  const heel = highpass(noise(heelN), 0.30);
  const heelE = env(heelN, 0.0002, 0.0055);
  const soleF = variant ? 2200 : 1900;
  const sole = bandpass(noise(n), soleF, 2.4);
  const soleE = env(n, 0.0003, 0.014);
  const floorHz = variant ? 232 : 205;
  const room = lowpass(noise(n), 0.08);
  const roomE = env(n, 0.002, 0.030);
  // The BALANCE is the whole thing, and the first attempt had it backwards. With
  // the floor ring at 0.45 over 40ms against a heel of 0.95 over 3, the low body
  // carried almost all the energy and only 0.3% of the clip sat above 4 kHz — a
  // thud with a hint of shoe. A dress shoe is the other way round: the crack leads
  // and the floor answers underneath it.
  return finish(mix(
    heel.map((x, i) => x * heelE[i] * 1.40),
    sole.map((x, i) => x * soleE[i] * 0.85),
    ring(n, floorHz, 0.032, 0.24),
    room.map((x, i) => x * roomE[i] * 0.07),
  ), 0.50);
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
 * A TAP — the one the reader hears most, and the one that was worst.
 *
 * It was 45ms of high-passed noise with a 1900 Hz sine through it: a CLICK, and a
 * thin one. High-passed noise with nothing under it is the sound of static, not of
 * touching something, and it fires on every button in the app.
 *
 * What reads as expensive in a UI sound is not brightness, it is BODY and
 * SHORTNESS: a small warm resonance that decays before you can think about it, no
 * harsh edge, and nothing left ringing. So this is a soft mallet on a solid thing —
 * a warm fundamental at 620 Hz with its fifth above, both damped in 35ms, a low
 * partial underneath for weight, and a whisper of LOW-passed noise on the attack
 * for texture. Nothing high-passed anywhere, so there is no hiss in it.
 *
 * The attack is 1.2ms rather than instantaneous. That single number is most of the
 * difference between "tick" and "tok": an instant onset is a click, a slightly
 * softened one is a thing being touched.
 */
function tap() {
  reseed(90210);
  const n = secs(0.075);
  const puff = lowpass(noise(n), 0.34);
  const puffE = env(n, 0.0006, 0.004);
  const e = env(n, 0.0012, 0.035);
  const warm = mix(
    sine(n, 620),
    gain(sine(n, 930), 0.34),      // the fifth — a chord, not a beep
    gain(sine(n, 310), 0.22),      // an octave below for weight
  );
  return finish(mix(
    warm.map((x, i) => x * e[i]),
    puff.map((x, i) => x * puffE[i] * 0.30),
  ), 0.34);
}

/**
 * THE LESSON IS FINISHED — a three-step lift that RESOLVES onto a chord.
 *
 * This replaces a version that was two notes a fifth apart and described itself as
 * "one warm chime, not a fanfare". The restraint was aimed at the wrong risk. The
 * thing that plays at the end of every lesson does have to survive repetition, but
 * it also has to READ AS AN ENDING, and two notes fading out is an ellipsis rather
 * than a full stop. Nothing about it said "done".
 *
 * What makes an ending is resolution, not volume. A4 lifts to D5 lifts to the
 * chord — F#5 and A5 arriving together over a D5 that is still sounding — so the
 * phrase climbs and then LANDS on the tonic triad instead of trailing off. The
 * whole statement is over inside 600ms, which is deliberate: the XP counter starts
 * ticking after it, and a finishing sound still going while the number counts is
 * two events on top of each other instead of one following the other.
 *
 * Kept distinct from the rank-up, which is the other pitched flourish and must not
 * be confused with it: that one climbs FOUR notes to a high D and holds for 1.85s.
 * This one is a third as long, resolves downward into its chord rather than
 * reaching above it, and never touches D6 except as a trace of shine.
 */
function reward() {
  const n = secs(1.10);
  const note = (f, delay, g, decay = 0.34) => {
    const d = secs(delay);
    const len = n - d;
    const e = env(len, 0.004, decay);
    const body = mix(
      sine(len, f),
      gain(sine(len, f * 2), 0.28),
      gain(sine(len, f * 3.01), 0.08),
    );
    return [...new Array(d).fill(0), ...body.map((x, i) => x * e[i] * g)];
  };
  return finish(mix(
    note(440.00, 0.000, 0.55, 0.13),   // A4 — the step off
    note(587.33, 0.085, 0.75, 0.16),   // D5 — the step up
    note(587.33, 0.180, 0.95, 0.40),   // D5 again, this time to hold under the chord
    note(739.99, 0.180, 0.70, 0.36),   // F#5 ┐ the third and fifth land together:
    note(880.00, 0.180, 0.62, 0.36),   // A5  ┘ this is the moment it reads as an end
    note(1174.66, 0.195, 0.16, 0.24),  // a trace of D6 for shine, not a fourth step
  ), 0.78);
}

// ── the second set: the app gets a voice for the things it rewards ───────────
//
// THE PALETTE IS SPLIT ON PURPOSE, and the split is the whole design.
//
// Everything the WORLD does stays physical and unpitched — a shoe, a sleeve, a
// leaf of paper, a wooden knock, a clasp. Those sounds are the room the lesson
// happens in, and a room does not play notes at you.
//
// Everything the READER EARNS is pitched, and all of it is in D. `reward` was
// written first, from D5 and A5, so D is already the app's key by accident; every
// note added here is drawn from the same triad (D · F# · A) across three octaves.
// That is why a correct answer, an XP tick, a badge and a rank-up can land within
// four seconds of each other on the reward screen without turning into noise —
// they are chords of one thing, not five separate jingles competing.
//
//   D4 293.66  ·  D5 587.33  F#5 739.99  A5 880.00  ·  D6 1174.66  F#6 1479.98  A6 1760

/** A struck tone: fundamental, a soft octave, a trace of the twelfth. */
function bell(n, f, decay, g = 1) {
  const e = env(n, 0.004, decay);
  const body = mix(
    sine(n, f),
    gain(sine(n, f * 2), 0.26),
    gain(sine(n, f * 3.01), 0.07),
  );
  return body.map((x, i) => x * e[i] * g);
}

/** Silence, then a layer. Used to place notes in a phrase. */
const at = (delay, layer) => [...new Array(secs(delay)).fill(0), ...layer];

/**
 * A PAGE TURNING — the beat-advance sound, ~10 times a lesson.
 *
 * Front-loaded, which is what separates it from `swish`. A sleeve is a symmetric
 * swell that peaks in the middle of the gesture; a page is a crisp release at the
 * corner followed by the leaf falling over. So: a short bright edge, then a
 * decaying airy body underneath it.
 *
 * The quietest thing in the set apart from the ticks. It fires on nearly every
 * tap, and anything with presence at that rate becomes the sound of the app
 * rather than a detail in it.
 */
function page() {
  reseed(70118);
  const n = secs(0.20);
  const edge = secs(0.035);
  const crisp = highpass(noise(edge), 0.30);
  const ce = env(edge, 0.0004, 0.010);
  const body = highpass(lowpass(noise(n), 0.26), 0.05);
  const be = Array.from({ length: n }, (_, i) => {
    const u = i / n;
    // Rises fast, falls away — the leaf is loudest as it leaves the thumb.
    return Math.min(1, u / 0.12) * Math.exp(-u * 3.4);
  });
  return finish(mix(
    crisp.map((x, i) => x * ce[i] * 0.9),
    body.map((x, i) => x * be[i]),
  ), 0.30);
}

/**
 * A CORRECT ANSWER — one clean note, and it CLIMBS on a run of them.
 *
 * Three files rather than one, played by `step` at the call site: D5, F#5, A5.
 * Getting two right in a row should sound different from getting one right
 * twice, and the difference has to be audible without being a fanfare — a
 * rising triad does it in three notes and then holds at the top.
 *
 * Rendered as separate files because pitch-shifting at playback means trusting a
 * native playback-rate flag I cannot hear the result of. Three 24 KB files is the
 * cheaper certainty.
 */
function right(f) {
  const n = secs(0.66);
  // TWO notes, not one. A single struck note is a notification; the fifth arriving
  // 55ms behind it is a small chord opening, and that is what reads as a reward.
  // The pair moves up the triad together on a run, so the interval is constant and
  // only the pitch climbs — the answer always sounds like the same kind of good.
  return finish(mix(
    bell(n, f, 0.19, 1.0),
    at(0.055, bell(secs(0.60), f * 1.5, 0.17, 0.62)),
    at(0.055, bell(secs(0.60), f * 3, 0.10, 0.10)),   // a little air on top
  ).slice(0, n), 0.62);
}

/**
 * A WRONG ANSWER — a wooden knock that bends down, and NOTHING ELSE.
 *
 * Deliberately not a buzzer, not a minor chord, not two descending notes. This is
 * a philosophy app: a reader who picks the tempting answer has usually thought
 * about it, and the explanation that follows is the point. A comic failure noise
 * would tell them they lost a game.
 *
 * So it is the same physical material as the world sounds — low, dry, wooden —
 * with a small downward bend that reads as "not that" without reading as
 * "wrong of you". It is also markedly quieter than the correct note.
 */
function rethink() {
  reseed(31337);
  const n = secs(0.30);
  // A MUTED WOODEN BODY, and no pitch bend.
  //
  // The bend was the cheap part of the old one — a sine sliding 190 → 150 Hz is
  // the sound of a cartoon losing, and it undercut the whole point of not
  // punishing a wrong answer. Gone.
  //
  // What replaces it is a thing being struck and immediately damped: a low
  // resonance at 168 Hz with a second at 251 (a fifth, so it has a body rather
  // than a hum), both dying in 55ms, over a soft bandpassed knock at 420 Hz. The
  // ear hears wood with a hand on it — a definite event, clearly not the bell, and
  // carrying no verdict about the person who caused it.
  const knock = bandpass(noise(n), 420, 1.6);
  const ke = env(n, 0.0010, 0.020);
  const dust = lowpass(noise(n), 0.05);
  const de = env(n, 0.004, 0.070);
  return finish(mix(
    ring(n, 168, 0.055, 1.0),
    ring(n, 251, 0.040, 0.34),
    knock.map((x, i) => x * ke[i] * 0.55),
    dust.map((x, i) => x * de[i] * 0.12),
  ), 0.38);
}

/**
 * A QUOTE SAVED — a small clasp closing.
 *
 * The saved-quote library is the one thing in the app the reader BUILDS, so
 * saving needs to sound like an object going into a box, not like another tap.
 * A bright snap over a short woody body: the catch, then the cover.
 */
function keep() {
  reseed(5150);
  const n = secs(0.13);
  const snap = highpass(noise(n), 0.34);
  const se = env(n, 0.0003, 0.008);
  const wood = lowpass(noise(n), 0.14);
  const we = env(n, 0.001, 0.030);
  const tone = sine(n, 330);
  return finish(mix(
    snap.map((x, i) => x * se[i]),
    wood.map((x, i) => x * we[i] * 0.8),
    tone.map((x, i) => x * we[i] * 0.30),
  ), 0.44);
}

/**
 * THE XP COUNTING UP — three ticks, cycled, climbing D6 · F#6 · A6.
 *
 * The reward screen counts the number up over about a second, and a counter that
 * makes no sound is a number changing while a counter that ticks is a number
 * being AWARDED. Cycling three pitches upward means the run rises continuously
 * instead of chattering on one note.
 *
 * The quietest clips in the set by a wide margin — around fifteen of them fire in
 * a row, and anything with weight becomes a machine gun.
 */
const tick = (f) => {
  const n = secs(0.028);
  const e = env(n, 0.0003, 0.006);
  return finish(sine(n, f).map((x, i) => x * e[i]), 0.20);
};

/**
 * A BADGE EARNED — a low bell struck under a shimmer.
 *
 * The badge is drawn onto the reward screen as if pressed into the paper, so the
 * sound is the press: a D an octave below the correct-answer note, with a slow
 * bright wash over it for the light catching the face. Low and broad rather than
 * bright and quick, so it sits UNDER the chime that is already playing rather
 * than fighting it.
 */
function badge() {
  reseed(24601);
  const n = secs(1.30);
  const strike = bell(n, 293.66, 0.42);
  const fifth = at(0.055, bell(secs(1.24), 440.0, 0.30, 0.34));
  const shine = highpass(lowpass(noise(n), 0.42), 0.10);
  const se = Array.from({ length: n }, (_, i) => {
    const u = i / n;
    return Math.sin(Math.PI * Math.min(1, u * 1.35)) ** 2 * 0.16;
  });
  return finish(mix(strike, fifth, shine.map((x, i) => x * se[i])), 0.72);
}

/**
 * A RANK-UP — the only fanfare in the app, and it is four notes.
 *
 * Rank-ups are rare (25 tiers over the whole curriculum) and they take the whole
 * screen before the reward, so this is the one place a phrase is earned. D5 · F#5
 * · A5 · D6 climbing, with the top note held and the D5 struck again beneath it
 * so it resolves onto a chord rather than stopping.
 *
 * Still no percussion and still no brass. It is the same struck tone as
 * everything else, just more of it — the app is a pen and paper, and it does not
 * suddenly own a drum kit because you reached Dialectician.
 */
function rankup() {
  const N = secs(1.85);
  return finish(mix(
    at(0.00, bell(secs(1.85), 587.33, 0.26, 0.85)),
    at(0.11, bell(secs(1.74), 739.99, 0.26, 0.85)),
    at(0.22, bell(secs(1.63), 880.00, 0.28, 0.90)),
    at(0.34, bell(secs(1.51), 1174.66, 0.40, 1.00)),
    at(0.34, bell(secs(1.51), 293.66, 0.55, 0.55)),
  ).slice(0, N), 0.82);
}

/**
 * ARRIVING — the shift of weight as a walk stops, not another footfall.
 *
 * A walk in these scenes does not end on a stride. `strideStance` spends the last
 * 22% of every transition blending the walking pose into the beat's settled
 * gesture, and in that stretch the figure is no longer taking steps: it is coming
 * to rest. A crisp footfall there is a lie about what the picture is doing, and
 * measurably so — a stride thud scheduled inside the blend misses the drawn foot
 * by up to 383ms depending on where the idle clock happens to be, while every
 * thud outside it is accurate to a millisecond in all 200 clocks tested.
 *
 * So the last one becomes this instead: softer, slower to start, more scuff than
 * impact, and quieter than either footfall. Being soft is also what makes it
 * forgiving — a weight shift has no sharp transient for the eye to disagree with,
 * so the few frames of slack in its timing cannot be seen.
 */
function settle() {
  reseed(60622);
  const n = secs(0.14);
  const scuff = lowpass(noise(n), 0.20);
  const se = env(n, 0.006, 0.040);         // a slow attack — no click, no strike
  const body = sine(n, 72);
  const be = env(n, 0.008, 0.028);
  return finish(mix(
    scuff.map((x, i) => x * se[i]),
    body.map((x, i) => x * be[i] * 0.5),
  ), 0.34);
}

/**
 * THE IMPACT, and why it is not a car crash.
 *
 * Moral Luck draws the collision as an abstract struck ring — no wreck, no body,
 * a mark on paper. Rule A1 cuts both ways: what the picture does, the sound must
 * do. Tyres, glass and a metal crunch would describe an event the scene has
 * deliberately declined to draw, and would make a lesson about how we apportion
 * blame into a lesson about a crash.
 *
 * So it is one low struck thud with weight and a short room tail, closer to a
 * heavy stamp than to anything automotive. Grave rather than loud: it is only
 * slightly above the correct-answer note, and well under the reward.
 *
 * The pitch decays fast enough (0.09) not to read as a note, which keeps it on the
 * physical side of the palette where a thing happening in the world belongs.
 */
function impact() {
  reseed(19760);
  const n = secs(0.70);
  const thud = mix(gain(sine(n, 104), 1), gain(sine(n, 156), 0.35));
  const te = env(n, 0.0015, 0.090);
  const strike = lowpass(noise(secs(0.05)), 0.24);
  const ke = env(secs(0.05), 0.0006, 0.014);
  const room = lowpass(noise(n), 0.05);
  const re = env(n, 0.010, 0.150);
  return finish(mix(
    thud.map((x, i) => x * te[i]),
    strike.map((x, i) => x * ke[i] * 0.8),
    room.map((x, i) => x * re[i] * 0.22),
  ), 0.66);
}

// HI for anything with a transient in it — a heel, a fingertip, a page edge, a
// counter tick. LO for the struck tones, whose highest partial is a third of the
// way to that ceiling and which gain nothing from the extra bytes.
const SET = {
  'step-a': atRate(HI, () => step(0)),
  'step-b': atRate(HI, () => step(1)),
  settle: atRate(HI, settle),
  impact: atRate(HI, impact),
  swish: atRate(HI, swish),
  tap: atRate(HI, tap),
  page: atRate(HI, page),
  rethink: atRate(HI, rethink),
  keep: atRate(HI, keep),
  'tick-1': atRate(HI, () => tick(1174.66)),
  'tick-2': atRate(HI, () => tick(1479.98)),
  'tick-3': atRate(HI, () => tick(1760.00)),

  reward: atRate(LO, reward),
  'right-1': atRate(LO, () => right(587.33)),
  'right-2': atRate(LO, () => right(739.99)),
  'right-3': atRate(LO, () => right(880.00)),
  badge: atRate(LO, badge),
  rankup: atRate(LO, rankup),
};

fs.mkdirSync(OUT, { recursive: true });
let total = 0;
console.log('generated — no licence, no attribution, no provenance to track\n');
for (const [name, { rate, data }] of Object.entries(SET)) {
  const buf = wav(data, rate);
  fs.writeFileSync(path.join(OUT, `${name}.wav`), buf);
  total += buf.length;
  const peak = Math.max(...data.map(Math.abs));
  console.log(
    `  ${name.padEnd(8)} ${String((data.length / rate * 1000).toFixed(0)).padStart(5)}ms  ` +
    `${String((rate / 1000).toFixed(1)).padStart(5)}kHz  ` +
    `${String((buf.length / 1024).toFixed(1)).padStart(6)} KB  peak ${peak.toFixed(2)}`,
  );
}
console.log(`\n  ${Object.keys(SET).length} files · ${(total / 1024).toFixed(1)} KB total`);
