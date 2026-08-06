import {
  HI, LO, atRate, reseed, lowpass, highpass, noise, bandpass, ring, env, sine,
  sweep, mix, gain, at, finish, secs, bell,
} from './lib/dsp.mjs';

// ─────────────────────────────────────────────────────────────────────────────
// CANDIDATES — several possible sounds for every role in the app.
//
// The point of this file is to stop guessing. Every sound so far has been chosen
// by me describing one, shipping it, and hearing back a round-trip later that it
// was wrong; the whoosh took three rounds and the tap took four. Here every role
// has four to six real options rendered side by side, so the choice is made by
// listening once instead of by iterating.
//
// `shipped: true` marks whatever is in assets/sound today, so a candidate is
// always judged against the thing it would replace rather than in the abstract.
//
// Built with the SAME kit the shipping generator uses (./lib/dsp.mjs), so a
// candidate that is picked is byte-for-byte the clip that gets installed.
// ─────────────────────────────────────────────────────────────────────────────

const R = (rate, make) => atRate(rate, make);

// ── the walk ─────────────────────────────────────────────────────────────────

/** The shipped shoe, parameterised so its relatives can be built from one recipe. */
function shoe({ heelHi = 0.30, heelDec = 0.0055, heelG = 1.40, soleF = 1900, soleQ = 2.4,
  soleDec = 0.014, soleG = 0.85, floorHz = 205, floorDec = 0.032, floorG = 0.24,
  roomG = 0.07, len = 0.11, seed = 1013, peak = 0.50 } = {}) {
  reseed(seed);
  const n = secs(len);
  const heelN = secs(0.020);
  const heel = highpass(noise(heelN), heelHi);
  const heelE = env(heelN, 0.0002, heelDec);
  const sole = bandpass(noise(n), soleF, soleQ);
  const soleE = env(n, 0.0003, soleDec);
  const room = lowpass(noise(n), 0.08);
  const roomE = env(n, 0.002, 0.030);
  return finish(mix(
    heel.map((x, i) => x * heelE[i] * heelG),
    sole.map((x, i) => x * soleE[i] * soleG),
    ring(n, floorHz, floorDec, floorG),
    room.map((x, i) => x * roomE[i] * roomG),
  ), peak);
}

const FOOTSTEP = [
  { id: 'dress', name: 'Dress shoe', shipped: true,
    note: 'Leather heel on a hard floor. What is in the app now.',
    make: () => R(HI, () => shoe()) },
  { id: 'dress-marble', name: 'Dress shoe, marble',
    note: 'Same shoe, harder floor. More crack, less body, rings a touch higher.',
    make: () => R(HI, () => shoe({ heelG: 1.9, soleF: 2600, soleQ: 3.2, floorHz: 300, floorDec: 0.020, floorG: 0.16, roomG: 0.12 })) },
  { id: 'dress-quiet', name: 'Dress shoe, quieter',
    note: 'The same sound with the heel pulled back. For if the current one clacks.',
    make: () => R(HI, () => shoe({ heelG: 0.75, soleG: 0.6, floorG: 0.30, peak: 0.42 })) },
  { id: 'oxford-wood', name: 'Leather on floorboards',
    note: 'Warmer and woodier. The floor answers more than the shoe does.',
    make: () => R(HI, () => shoe({ heelHi: 0.22, heelG: 0.85, soleF: 1400, soleQ: 1.8, floorHz: 168, floorDec: 0.055, floorG: 0.55, roomG: 0.14 })) },
  { id: 'boot', name: 'Boot',
    note: 'Heavier and lower. A deliberate, weighty tread.',
    make: () => R(HI, () => shoe({ heelHi: 0.20, heelDec: 0.008, heelG: 0.9, soleF: 900, soleQ: 1.4, soleDec: 0.022, floorHz: 120, floorDec: 0.070, floorG: 0.75, roomG: 0.18, len: 0.15, peak: 0.55 })) },
  { id: 'soft', name: 'Soft sole',
    note: 'Almost no crack. A quiet, padded step — closest to the original thud.',
    make: () => R(HI, () => shoe({ heelHi: 0.14, heelG: 0.30, soleF: 700, soleQ: 1.1, soleDec: 0.020, floorHz: 150, floorDec: 0.045, floorG: 0.60, roomG: 0.10, peak: 0.40 })) },
];

const ARRIVAL = [
  { id: 'placed', name: 'Set down', shipped: true,
    note: 'The floor tone of the footstep without the heel. What is in the app now.',
    make: () => R(HI, () => finish(mix(ring(secs(0.13), 196, 0.045, 1.0), ring(secs(0.13), 294, 0.028, 0.28)), 0.26)) },
  { id: 'placed-soft', name: 'Set down, softer',
    note: 'Half the level and lower. Barely marks the end of the walk.',
    make: () => R(HI, () => finish(mix(ring(secs(0.12), 150, 0.050, 1.0), ring(secs(0.12), 225, 0.024, 0.20)), 0.16)) },
  { id: 'together', name: 'Feet together',
    note: 'Two soft placements 70ms apart — the second foot joining the first.',
    make: () => R(HI, () => finish(mix(
      ring(secs(0.22), 196, 0.038, 0.85),
      at(0.070, ring(secs(0.15), 210, 0.032, 0.70)),
    ).slice(0, secs(0.22)), 0.26)) },
  { id: 'last-step', name: 'A final step',
    note: 'A real footfall, just quieter. The walk ends on the same instrument.',
    make: () => R(HI, () => shoe({ heelG: 0.55, soleG: 0.45, floorG: 0.35, peak: 0.30, seed: 4477 })) },
];

// ── advancing a beat ─────────────────────────────────────────────────────────

const PAGE = [
  { id: 'leaf', name: 'Paper landing', shipped: true,
    note: 'A struck 300 Hz with a fifth, gone in 22ms. What is in the app now.',
    make: () => R(HI, () => { reseed(70118); const n = secs(0.085);
      const f = lowpass(noise(n), 0.10); const fe = env(n, 0.0008, 0.012);
      return finish(mix(ring(n, 300, 0.022, 1.0), ring(n, 450, 0.016, 0.42),
        f.map((x, i) => x * fe[i] * 0.30)), 0.20); }) },
  { id: 'card', name: 'Card placed',
    note: 'Crisper and drier, with a hint of edge. A stiff card meeting a table.',
    make: () => R(HI, () => { reseed(3311); const n = secs(0.07);
      const e = bandpass(noise(n), 2800, 2.0); const ee = env(n, 0.0002, 0.005);
      return finish(mix(ring(n, 380, 0.016, 1.0), e.map((x, i) => x * ee[i] * 0.55)), 0.20); }) },
  { id: 'tick', name: 'Wooden tick',
    note: 'No paper at all. A tiny dry knock, the most neutral option here.',
    make: () => R(HI, () => finish(mix(ring(secs(0.05), 900, 0.008, 1.0), ring(secs(0.05), 1350, 0.005, 0.30)), 0.18)) },
  { id: 'breath', name: 'Almost nothing',
    note: 'A very low, very short pulse. Felt more than heard.',
    make: () => R(HI, () => finish(ring(secs(0.06), 190, 0.018, 1.0), 0.13)) },
];

// ── touching a control ───────────────────────────────────────────────────────

function uiTap({ f = 780, second = 2, secondG = 0.20, dec = 0.018, attack = 0.0016,
  puffG = 0.22, puffLp = 0.13, len = 0.055, peak = 0.26, seed = 90210 } = {}) {
  reseed(seed);
  const n = secs(len);
  const puff = lowpass(noise(n), puffLp);
  const puffE = env(n, 0.0008, 0.003);
  const e = env(n, attack, dec);
  const body = mix(sine(n, f), gain(sine(n, f * second), secondG));
  return finish(mix(body.map((x, i) => x * e[i]), puff.map((x, i) => x * puffE[i] * puffG)), peak);
}

const TAP = [
  { id: 'tok-780', name: 'Tok', shipped: true,
    note: '780 Hz with a soft octave, damped in 18ms. What is in the app now.',
    make: () => R(HI, () => uiTap()) },
  { id: 'warm-520', name: 'Warm',
    note: 'Lower and rounder at 520 Hz. Reads as heavier, more deliberate.',
    make: () => R(HI, () => uiTap({ f: 520, dec: 0.024, peak: 0.28 })) },
  { id: 'glass', name: 'Glass',
    note: 'Bright and clean at 1150 Hz with a short tail. Light and modern.',
    make: () => R(HI, () => uiTap({ f: 1150, second: 2.01, secondG: 0.14, dec: 0.014, puffG: 0.10, peak: 0.24 })) },
  { id: 'felt', name: 'Felt',
    note: 'Heavily damped, slow attack, almost no pitch. The softest option.',
    make: () => R(HI, () => uiTap({ f: 430, second: 1.5, secondG: 0.28, dec: 0.030, attack: 0.004, puffG: 0.30, puffLp: 0.08, peak: 0.22 })) },
  { id: 'woodblock', name: 'Wood block',
    note: 'Dry and pitched, with the fifth rather than the octave. A small percussion.',
    make: () => R(HI, () => uiTap({ f: 900, second: 1.5, secondG: 0.34, dec: 0.012, attack: 0.0006, puffG: 0.16, peak: 0.26 })) },
  { id: 'pebble', name: 'Pebble',
    note: 'Two close partials, very short. Reads as a small solid thing.',
    make: () => R(HI, () => { reseed(5150); const n = secs(0.04);
      return finish(mix(ring(n, 1240, 0.007, 1.0), ring(n, 1860, 0.005, 0.5), ring(n, 620, 0.010, 0.4)), 0.24); }) },
];

// ── answering ────────────────────────────────────────────────────────────────

// A right answer is rendered at ALL THREE pitches, because the climb is the
// feature. A run of correct answers walks D → F# → A, and hearing one note three
// times says nothing about whether that works.
const TRIAD = [587.33, 739.99, 880.00];

const RIGHT = [
  { id: 'two-note', name: 'Note and fifth', shipped: true, pitches: TRIAD,
    note: 'The root with its fifth 55ms behind. A small chord opening.',
    make: (f) => R(LO, () => { const n = secs(0.66);
      return finish(mix(bell(n, f, 0.19, 1.0),
        at(0.055, bell(secs(0.60), f * 1.5, 0.17, 0.62)),
        at(0.055, bell(secs(0.60), f * 3, 0.10, 0.10))).slice(0, n), 0.62); }) },
  { id: 'single', name: 'One note', pitches: TRIAD,
    note: 'A single struck bell. Restrained — the most understated option.',
    make: (f) => R(LO, () => finish(bell(secs(0.55), f, 0.20, 1.0), 0.62)) },
  { id: 'arpeggio', name: 'Three notes up', pitches: TRIAD,
    note: 'A little run inside each answer, on top of the climb between them.',
    make: (f) => R(LO, () => { const n = secs(0.80);
      return finish(mix(bell(n, f, 0.16, 0.85),
        at(0.075, bell(secs(0.72), f * 1.26, 0.16, 0.85)),
        at(0.150, bell(secs(0.65), f * 1.5, 0.26, 1.0))).slice(0, n), 0.64); }) },
  { id: 'marimba', name: 'Marimba', pitches: TRIAD,
    note: 'Wooden rather than glassy — a strong fourth partial and a fast decay.',
    make: (f) => R(LO, () => { const n = secs(0.45);
      const e = env(n, 0.002, 0.11);
      const body = mix(sine(n, f), gain(sine(n, f * 4), 0.30), gain(sine(n, f * 2), 0.10));
      return finish(mix(body.map((x, i) => x * e[i]),
        at(0.050, bell(secs(0.40), f * 1.5, 0.09, 0.40))).slice(0, n), 0.60); }) },
  { id: 'glass-ding', name: 'Glass', pitches: TRIAD,
    note: 'Bright, long, and clean, an octave up. Sits well above the narration.',
    make: (f) => R(LO, () => { const n = secs(0.85);
      return finish(mix(bell(n, f * 2, 0.30, 1.0),
        at(0.040, bell(secs(0.80), f * 3, 0.24, 0.45))).slice(0, n), 0.58); }) },
  { id: 'harp', name: 'Plucked', pitches: TRIAD,
    note: 'A softer attack and a long fall. Warm rather than bright.',
    make: (f) => R(LO, () => { const n = secs(0.95);
      const e = env(n, 0.012, 0.34);
      const body = mix(sine(n, f), gain(sine(n, f * 2), 0.42),
        gain(sine(n, f * 3), 0.18), gain(sine(n, f * 4), 0.07));
      return finish(mix(body.map((x, i) => x * e[i]),
        at(0.060, gain(bell(secs(0.88), f * 1.5, 0.30), 0.50))).slice(0, n), 0.60); }) },
];

const WRONG = [
  { id: 'damped-wood', name: 'Damped wood', shipped: true,
    note: '168 Hz with a fifth, struck and stopped. What is in the app now.',
    make: () => R(HI, () => { reseed(31337); const n = secs(0.30);
      const k = bandpass(noise(n), 420, 1.6); const ke = env(n, 0.0010, 0.020);
      const d = lowpass(noise(n), 0.05); const de = env(n, 0.004, 0.070);
      return finish(mix(ring(n, 168, 0.055, 1.0), ring(n, 251, 0.040, 0.34),
        k.map((x, i) => x * ke[i] * 0.55), d.map((x, i) => x * de[i] * 0.12)), 0.38); }) },
  { id: 'soft-low', name: 'A low tone',
    note: 'No knock at all. One soft low note, quickly gone. The gentlest option.',
    make: () => R(HI, () => finish(mix(ring(secs(0.32), 146.83, 0.085, 1.0), ring(secs(0.32), 220, 0.050, 0.22)), 0.32)) },
  { id: 'muted-pluck', name: 'Muted string',
    note: 'Plucked and immediately stopped by a hand. Definite, not harsh.',
    make: () => R(HI, () => { reseed(8801); const n = secs(0.22);
      const e = env(n, 0.0008, 0.030);
      const b = mix(sine(n, 196), gain(sine(n, 392), 0.35), gain(sine(n, 588), 0.14));
      const t = bandpass(noise(n), 1200, 1.4); const te = env(n, 0.0004, 0.006);
      return finish(mix(b.map((x, i) => x * e[i]), t.map((x, i) => x * te[i] * 0.40)), 0.36); }) },
  { id: 'two-taps', name: 'Two soft taps',
    note: 'A gentle double pulse. Reads as "not that" without any pitch at all.',
    make: () => R(HI, () => { const n = secs(0.30);
      return finish(mix(ring(n, 190, 0.028, 1.0), at(0.105, ring(secs(0.19), 175, 0.030, 0.8))).slice(0, n), 0.34); }) },
  { id: 'gentle-fall', name: 'Two notes down',
    note: 'A quiet falling third. Musical, still in D, and not a cartoon slide.',
    make: () => R(HI, () => { const n = secs(0.60);
      return finish(mix(bell(n, 440.0, 0.13, 0.9), at(0.110, bell(secs(0.49), 369.99, 0.18, 0.85))).slice(0, n), 0.38); }) },
];

// ── finishing a lesson ───────────────────────────────────────────────────────

const FINISH = [
  { id: 'resolve', name: 'Lift and resolve', shipped: true,
    note: 'A4 to D5, then the D major chord landing. What is in the app now.',
    make: () => R(LO, () => { const n = secs(1.10);
      const note = (f, d, g, dec = 0.34) => at(d, bell(secs(1.10 - d), f, dec, g));
      return finish(mix(note(440.0, 0, 0.55, 0.13), note(587.33, 0.085, 0.75, 0.16),
        note(587.33, 0.180, 0.95, 0.40), note(739.99, 0.180, 0.70, 0.36),
        note(880.0, 0.180, 0.62, 0.36), note(1174.66, 0.195, 0.16, 0.24)).slice(0, n), 0.78); }) },
  { id: 'bright-triad', name: 'Bright and quick',
    note: 'The chord arrives almost at once, an octave up. Faster, more upbeat.',
    make: () => R(LO, () => { const n = secs(0.95);
      const note = (f, d, g, dec = 0.30) => at(d, bell(secs(0.95 - d), f, dec, g));
      return finish(mix(note(880.0, 0, 0.70, 0.12), note(1174.66, 0.070, 1.0, 0.34),
        note(1479.98, 0.070, 0.62, 0.30), note(1760.0, 0.075, 0.45, 0.28),
        note(587.33, 0.070, 0.40, 0.42)).slice(0, n), 0.78); }) },
  { id: 'four-note', name: 'Four notes',
    note: 'A longer phrase that climbs and holds. Closest to a proper jingle.',
    make: () => R(LO, () => { const n = secs(1.45);
      return finish(mix(bell(n, 587.33, 0.16, 0.75),
        at(0.105, bell(secs(1.35), 739.99, 0.16, 0.78)),
        at(0.210, bell(secs(1.24), 880.0, 0.18, 0.82)),
        at(0.315, bell(secs(1.14), 1174.66, 0.40, 1.0)),
        at(0.315, bell(secs(1.14), 587.33, 0.50, 0.42))).slice(0, n), 0.80); }) },
  { id: 'warm-swell', name: 'Warm swell',
    note: 'A soft attack into a full chord. Calm rather than triumphant.',
    make: () => R(LO, () => { const n = secs(1.35);
      const soft = (f, g) => { const e = env(n, 0.055, 0.42);
        return mix(sine(n, f), gain(sine(n, f * 2), 0.22)).map((x, i) => x * e[i] * g); };
      return finish(mix(soft(293.66, 0.55), soft(587.33, 1.0), soft(739.99, 0.62), soft(880.0, 0.52)), 0.74); }) },
  { id: 'two-note-close', name: 'Two notes',
    note: 'The most restrained: a fifth, and done. For if the others wear out.',
    make: () => R(LO, () => { const n = secs(0.95);
      return finish(mix(bell(n, 587.33, 0.34, 1.0), at(0.120, bell(secs(0.83), 880.0, 0.30, 0.72))).slice(0, n), 0.76); }) },
];

// ── the XP counter ───────────────────────────────────────────────────────────

// Also all three, for the same reason: the counter CYCLES up the triad an octave
// higher, so a run of fifteen rises continuously instead of chattering on one note.
const TRIAD_HI = [1174.66, 1479.98, 1760.00];

const TICK = [
  { id: 'sine', name: 'Pure tone', shipped: true, pitches: TRIAD_HI,
    note: 'A 28ms sine. What is in the app now.',
    make: (f) => R(HI, () => { const n = secs(0.028); const e = env(n, 0.0003, 0.006);
      return finish(sine(n, f).map((x, i) => x * e[i]), 0.15); }) },
  { id: 'wood', name: 'Tiny wood', pitches: TRIAD_HI,
    note: 'A minute woodblock. Drier, less musical, more like a counter.',
    make: (f) => R(HI, () => finish(mix(ring(secs(0.026), f * 1.36, 0.0035, 1.0), ring(secs(0.026), f * 2.04, 0.0022, 0.4)), 0.15)) },
  { id: 'glass-tick', name: 'Glass', pitches: TRIAD_HI,
    note: 'Brighter and slightly longer. Reads as more valuable per tick.',
    make: (f) => R(HI, () => finish(mix(ring(secs(0.045), f * 1.78, 0.010, 1.0), ring(secs(0.045), f * 2.67, 0.006, 0.3)), 0.14)) },
  { id: 'whisper', name: 'Barely there', pitches: TRIAD_HI,
    note: 'Half the level, softest attack. For if fifteen in a row is too much.',
    make: (f) => R(HI, () => { const n = secs(0.030); const e = env(n, 0.0020, 0.007);
      return finish(sine(n, f).map((x, i) => x * e[i]), 0.09); }) },
];

// ── the rarer flourishes ─────────────────────────────────────────────────────

const BADGE = [
  { id: 'low-bell', name: 'Low bell', shipped: true,
    note: 'A struck D4 with a fifth over it. What is in the app now.',
    make: () => R(LO, () => { reseed(24601); const n = secs(1.30);
      const sh = highpass(lowpass(noise(n), 0.42), 0.10);
      const se = Array.from({ length: n }, (_, i) => Math.sin(Math.PI * Math.min(1, (i / n) * 1.35)) ** 2 * 0.16);
      return finish(mix(bell(n, 293.66, 0.42), at(0.055, bell(secs(1.24), 440.0, 0.30, 0.34)),
        sh.map((x, i) => x * se[i])), 0.72); }) },
  { id: 'stamp', name: 'Pressed into paper',
    note: 'A heavier, shorter strike with no shimmer at all. A seal, not a bell.',
    make: () => R(LO, () => { reseed(1861); const n = secs(0.75);
      const k = bandpass(noise(n), 520, 1.5); const ke = env(n, 0.0006, 0.012);
      return finish(mix(bell(n, 220.0, 0.22, 1.0), bell(n, 329.63, 0.16, 0.35),
        k.map((x, i) => x * ke[i] * 0.7)), 0.72); }) },
  { id: 'two-bells', name: 'Two bells',
    note: 'A low strike answered by one an octave up. Grander than the current one.',
    make: () => R(LO, () => { const n = secs(1.40);
      return finish(mix(bell(n, 293.66, 0.40, 1.0),
        at(0.150, bell(secs(1.25), 587.33, 0.34, 0.55))).slice(0, n), 0.74); }) },
];

const RANKUP = [
  { id: 'four-climb', name: 'Four notes climbing', shipped: true,
    note: 'D, F#, A, high D, held over a low D. What is in the app now.',
    make: () => R(LO, () => { const N = secs(1.85);
      return finish(mix(bell(secs(1.85), 587.33, 0.26, 0.85),
        at(0.11, bell(secs(1.74), 739.99, 0.26, 0.85)),
        at(0.22, bell(secs(1.63), 880.0, 0.28, 0.90)),
        at(0.34, bell(secs(1.51), 1174.66, 0.40, 1.0)),
        at(0.34, bell(secs(1.51), 293.66, 0.55, 0.55))).slice(0, N), 0.82); }) },
  { id: 'six-climb', name: 'Six notes',
    note: 'A longer run up the scale. Grander, and rarer than once a lesson.',
    make: () => R(LO, () => { const N = secs(2.20);
      const notes = [[293.66, 0], [440.0, 0.09], [587.33, 0.18], [739.99, 0.27], [880.0, 0.36], [1174.66, 0.46]];
      return finish(mix(...notes.map(([f, d], k) =>
        at(d, bell(secs(2.20 - d), f, k === 5 ? 0.46 : 0.22, 0.7 + k * 0.06))),
        at(0.46, bell(secs(1.74), 587.33, 0.55, 0.45))).slice(0, N), 0.84); }) },
  { id: 'three-and-hold', name: 'Three and hold',
    note: 'Shorter — up to the fifth and sustained. Less of an interruption.',
    make: () => R(LO, () => { const N = secs(1.45);
      return finish(mix(bell(secs(1.45), 587.33, 0.20, 0.80),
        at(0.12, bell(secs(1.33), 880.0, 0.22, 0.85)),
        at(0.25, bell(secs(1.20), 1174.66, 0.48, 1.0)),
        at(0.25, bell(secs(1.20), 293.66, 0.55, 0.45))).slice(0, N), 0.82); }) },
];

const IMPACT = [
  { id: 'thud', name: 'Low thud', shipped: true,
    note: 'One struck low tone with a room tail. What is in the app now.',
    make: () => R(HI, () => { reseed(19760); const n = secs(0.70);
      const thud = mix(gain(sine(n, 104), 1), gain(sine(n, 156), 0.35));
      const te = env(n, 0.0015, 0.090);
      const st = lowpass(noise(secs(0.05)), 0.24); const ke = env(secs(0.05), 0.0006, 0.014);
      const room = lowpass(noise(n), 0.05); const re = env(n, 0.010, 0.150);
      return finish(mix(thud.map((x, i) => x * te[i]), st.map((x, i) => x * ke[i] * 0.8),
        room.map((x, i) => x * re[i] * 0.22)), 0.66); }) },
  { id: 'toll', name: 'A single toll',
    note: 'A low struck bell rather than a thud. Grave, and clearly a moment.',
    make: () => R(LO, () => finish(mix(bell(secs(1.60), 110.0, 0.55, 1.0), bell(secs(1.60), 164.81, 0.36, 0.30)), 0.68)) },
  { id: 'drop', name: 'A falling weight',
    note: 'A short downward sweep into a thud. Reads as something arriving fast.',
    make: () => R(HI, () => { reseed(4062); const n = secs(0.55);
      const s = sweep(secs(0.16), 320, 96); const se = env(secs(0.16), 0.002, 0.055);
      return finish(mix(s.map((x, i) => x * se[i] * 0.7),
        at(0.140, mix(ring(secs(0.41), 98, 0.075, 1.0), ring(secs(0.41), 147, 0.045, 0.30)))).slice(0, n), 0.66); }) },
];

export const ROLES = [
  { id: 'footstep', title: 'Footstep', fires: 'Twelve times in Moral Luck, under the walking figure.', options: FOOTSTEP },
  { id: 'arrival', title: 'End of a walk', fires: 'Once at the close of each of the five walks.', options: ARRIVAL },
  { id: 'page', title: 'Advancing a beat', fires: 'Every tap in a lesson — about ten times.', options: PAGE },
  { id: 'tap', title: 'Touching a control', fires: 'Every button in the app. The most-heard sound by far.', options: TAP },
  { id: 'right', title: 'Answer correct', fires: 'Twice per lesson. Climbs the triad on a run.', options: RIGHT },
  { id: 'wrong', title: 'Answer wrong', fires: 'Only when the reader misses.', options: WRONG },
  { id: 'finish', title: 'Lesson finished', fires: 'Once, as the reward screen appears.', options: FINISH },
  { id: 'tick', title: 'XP counting up', fires: 'About fifteen in a row, right after the finish.', options: TICK },
  { id: 'badge', title: 'Badge earned', fires: 'Occasionally, on the reward screen.', options: BADGE },
  { id: 'rankup', title: 'Rank up', fires: 'Twenty-five times in the whole curriculum.', options: RANKUP },
  { id: 'impact', title: 'Something struck', fires: 'Once in Moral Luck, when the mark lands on road B.', options: IMPACT },
];
