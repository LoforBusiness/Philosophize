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

// The synthesis kit lives in ./lib/dsp.mjs so the sound LAB can build its
// candidates with the identical arithmetic — see scripts/make-sound-lab.mjs. A
// second copy of a bandpass would drift from this one within two edits, and then
// the sound approved in the lab would not be the sound installed here.
import {
  HI, LO, atRate, reseed, lowpass, highpass, noise, bandpass, ring, env, sine,
  mix, gain, at, finish, wav, secs, bell,
  MATERIAL, modal, reflect, tilted, sweepBand,
} from './lib/dsp.mjs';

// ─────────────────────────────────────────────────────────────────────────────
// CHOSEN IN THE LAB, INSTALLED HERE.
//
// Everything below marked "physical" was picked by ear from sound-lab.html after
// hearing it against five to eleven alternatives, which is the first time any
// sound in this app has been chosen by listening rather than by me describing one
// and finding out a publish later. They are built from the same lib/dsp.mjs the
// lab used, so each is byte-for-byte the clip that was approved.
//
// What makes them different from the originals: eight to twenty INHARMONIC modes
// with high ones damped faster, a dense quiet early-reflection cluster instead of
// four audible taps, and correctly tilted noise. See lib/dsp.mjs.
// ─────────────────────────────────────────────────────────────────────────────

// THE BUTTON TAP IS GONE. It had exactly three call sites and all three were
// navigation — a branch card, the home actions, Quick Start — and navigating is
// not an event. The three fingertips are still in scripts/sound-candidates.mjs if
// a genuine control ever needs one; nothing in the app does.

/**
 * A GESTURE THROUGH AIR — three of them, by how the hand is moving.
 *
 * The deleted `swish` was noise through a FIXED band on a symmetric swell, which
 * is a volume shape on a static timbre; static noise is hiss whatever its level
 * does, and it measured 0.474 where the footfall measures 0.012. A real limb
 * accelerates and decelerates, so the turbulence SWEEPS UP in pitch and back down
 * while the resonance sharpens. The movement IS the sound. These measure
 * 0.078–0.119 — four to six times cleaner from the same raw material.
 *
 * Which one plays is decided by MEASURING the gesture, not by choosing per lesson
 * — see components/lesson/cinematic/gestures.ts.
 */
function whooshSleeve() {
  reseed(2401);
  const n = secs(0.17);
  const e = Array.from({ length: n }, (_, i) => Math.pow(Math.sin(Math.PI * Math.pow(i / n, 0.72)), 1.9));
  return finish(sweepBand(tilted(n, -0.5), 400, 2200, 700, 1.1, 3.4).map((x, i) => x * e[i]), 0.30);
}
function whooshFast() {
  reseed(9931);
  const n = secs(0.09);
  const e = Array.from({ length: n }, (_, i) => Math.pow(Math.sin(Math.PI * Math.pow(i / n, 0.65)), 2.2));
  return finish(sweepBand(tilted(n, -0.35), 700, 3600, 1200, 1.4, 4.2).map((x, i) => x * e[i]), 0.28);
}
function whooshHeavy() {
  reseed(5520);
  const n = secs(0.26);
  const e = Array.from({ length: n }, (_, i) => Math.pow(Math.sin(Math.PI * Math.pow(i / n, 0.8)), 1.6));
  return finish(sweepBand(tilted(n, -0.8), 220, 1250, 380, 1.0, 2.8).map((x, i) => x * e[i]), 0.30);
}

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

// ── THE WHOOSH IS GONE, AND NOTHING REPLACES IT ─────────────────────────────
//
// `swish` was band-passed noise on a slow symmetric swell — energy rising into
// the middle of the gesture and falling away, which is what a sleeve does and is
// also, to an ear, exactly SHHH. Measured against the rest of the set it was not
// close: 98% of its energy sustained past the attack at a spectral flatness of
// 0.38, where the footfall the reader likes sits at 0.004 and the page turn at
// 0.001. It was the single bushiest thing in the app by a factor of five.
//
// It is not being rebuilt, because there is no honest way to. A hand moving
// through air IS broadband noise; that is what the sound physically is. Every
// version of it would be some shape of hiss, and hiss is the thing that was
// asked to go.
//
// The machinery that found WHERE to put one — components/lesson/cinematic/
// gestures.ts, which measured hand travel out of the rig — is deleted with it. It
// is in the history if a gesture ever wants a sound that is not made of air.



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
  // THIRD ATTEMPT, and each one failed for its own reason.
  //
  //   1. high-passed noise + a 1900 Hz sine — the spectrum of static, and thin
  //   2. 620 Hz with a fifth and an octave over 75ms — warm, but a KNOCK. Three
  //      partials ringing for that long is a small wooden instrument being played,
  //      and it is too much event for opening a screen.
  //
  // What a navigation tap has to be is barely there. It is the most-fired sound in
  // the app by a wide margin, so the design target is not "nice sound" but "a
  // surface answering" — noticed only if it were missing.
  //
  // So: 780 Hz, a single clean fundamental with a soft octave above it at a fifth
  // of the level and nothing else, damped in 18ms — half as long as the last one.
  // A 1.6ms attack, because an instant onset is a click and a softened one is a
  // touch. A trace of very dull noise for surface, ceilinged near 900 Hz so there
  // is no hiss in it at any level.
  const n = secs(0.055);
  const puff = lowpass(noise(n), 0.13);
  const puffE = env(n, 0.0008, 0.003);
  const e = env(n, 0.0016, 0.018);
  const body = mix(
    sine(n, 780),
    gain(sine(n, 1560), 0.20),
  );
  return finish(mix(
    body.map((x, i) => x * e[i]),
    puff.map((x, i) => x * puffE[i] * 0.22),
  ), 0.26);
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
  // SHORTENED, because it was eating the XP counter. The chord used to ring for
  // 1.10s on decays of 0.36–0.40, and its octave partials sit at 1175, 1480 and
  // 1760 Hz — which are EXACTLY the three counter pitches. So the ticks were
  // masked twice over: nine times quieter, and at the same frequencies as the
  // thing on top of them. The phrase still lifts and lands the same way, it just
  // stops afterwards instead of hanging over the tally.
  const n = secs(0.85);
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
    note(587.33, 0.180, 0.95, 0.26),   // D5 again, this time to hold under the chord
    note(739.99, 0.180, 0.70, 0.24),   // F#5 ┐ the third and fifth land together:
    note(880.00, 0.180, 0.62, 0.24),   // A5  ┘ this is the moment it reads as an end
    note(1174.66, 0.195, 0.16, 0.16),  // a trace of D6 for shine, not a fourth step
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
  // THE SWELL OF NOISE IS GONE, AND IT WAS THE PROBLEM.
  //
  // This was band-passed noise on a rising-then-falling envelope, written as "a
  // leaf leaving the thumb". Band-passed noise on a swell is, to an ear, simply
  // SHHH — a bush, a breath, static with a shape. It fired on every tap in a
  // lesson, ten times a reading, and it was the single most disliked sound in the
  // app. Nothing about a swell of noise says "page"; it says "wind".
  //
  // What a page actually does when it lands is THUD, faintly and briefly: a light
  // stiff sheet has a pitch, low and immediately damped. So this is a struck 300 Hz
  // with a fifth above it, gone in 22ms, and only a whisper of very dull noise
  // underneath for the fibre. `lowpass` at 0.10 puts that whisper's ceiling around
  // 700 Hz, so there is no hiss left in it anywhere.
  //
  // It is also the quietest thing in the set apart from the counter, because of how
  // often it fires. If it is ever noticed as a sound rather than as a page landing,
  // it is too loud.
  const n = secs(0.085);
  const fibre = lowpass(noise(n), 0.10);
  const fe = env(n, 0.0008, 0.012);
  return finish(mix(
    ring(n, 300, 0.022, 1.0),
    ring(n, 450, 0.016, 0.42),
    fibre.map((x, i) => x * fe[i] * 0.30),
  ), 0.20);
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
  // 30ms → 16ms. It was the closest survivor to the hiss threshold, and a clasp
  // has nothing to sustain — the catch and the cover are both instant.
  const we = env(n, 0.001, 0.016);
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
  // 0.15 → 0.26. Reported as inaudible under the finishing chord, and it was: at
  // 0.15 against a chord at 0.78 played 40% louder again, it was nearly nine times
  // quieter and sitting on the chord's own octave partials. Still the quietest
  // thing in the set, but now it is a sound rather than a rumour.
  return finish(sine(n, f).map((x, i) => x * e[i]), 0.26);
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
  // NO NOISE IN IT ANYWHERE, and that is the correction.
  //
  // This was a scuff: low-passed noise on a 6ms attack. The slow attack was
  // deliberate — "no click, no strike, a weight shift" — and it is precisely what
  // made it a bush. A noise burst that fades UP has no transient for the ear to
  // read as an impact, so all that is left to hear is the noise itself, and it
  // landed at the end of every walk in the lesson. Flatness 0.338 against the
  // footfall's 0.004.
  //
  // A shoe being set down is not a scuff, it is the same shoe placed gently: the
  // floor tone of the footfall, without the heel crack or the leather on top of
  // it. So it is that tone and its fifth, struck softly and damped, and it shares
  // the footstep's pitch so the walk ends on the instrument it was played on.
  const n = secs(0.13);
  return finish(mix(
    ring(n, 196, 0.045, 1.0),
    ring(n, 294, 0.028, 0.28),
  ), 0.26);
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
  // A STRUCK PANEL, chosen in the lab over five alternatives including the two
  // sine waves this replaces. A dense low mode cluster in a real room: it has
  // weight without being a crash, which is what the abstract ring on road B is
  // drawing. Measures 0.000 for hiss and 0.00 for doubling.
  reseed(7714);
  const n = secs(0.95);
  const cn = secs(0.020);
  const c = lowpass(tilted(cn, -0.9), 0.30);
  const ce = env(cn, 0.0004, 0.0055);
  return finish(reflect(mix(
    c.map((x, i) => x * ce[i] * 0.55),
    modal(n, 96, MATERIAL.plate, { decay: 0.30, damp: 0.85, g: 1, tilt: 1.1 }),
  ), { time: 0.34, wet: 0.45, damp: 0.42 }).slice(0, n), 0.66);
}

// HI for anything with a transient in it — a heel, a fingertip, a page edge, a
// counter tick. LO for the struck tones, whose highest partial is a third of the
// way to that ceiling and which gain nothing from the extra bytes.
const SET = {
  'step-a': atRate(HI, () => step(0)),
  'step-b': atRate(HI, () => step(1)),
  impact: atRate(HI, impact),
  'whoosh-1': atRate(HI, whooshSleeve),
  'whoosh-2': atRate(HI, whooshFast),
  'whoosh-3': atRate(HI, whooshHeavy),
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
