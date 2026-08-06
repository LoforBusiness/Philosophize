import {
  HI, LO, atRate, reseed, lowpass, highpass, noise, bandpass, ring, env, sine,
  sweep, mix, gain, at, finish, secs, bell,
  MATERIAL, modal, reflect, tilted, crumple, env2, sweepBand,
} from './lib/dsp.mjs';

// ─────────────────────────────────────────────────────────────────────────────
// CANDIDATES — every possible sound for every role in the app.
//
// The point of this file is to stop guessing. Every sound so far has been chosen
// by me describing one, shipping it, and hearing back a round-trip later that it
// was wrong; the whoosh took three rounds and the tap took four. Here every role
// has six to twelve real options rendered side by side, so the choice is made by
// listening once instead of by iterating.
//
// `shipped: true` marks whatever is in assets/sound today, so a candidate is
// always judged against the thing it would replace rather than in the abstract.
//
// EACH ROLE DECLARES HOW IT SHOULD BE PREVIEWED, and that matters more than the
// number of options. A footfall lasts 110ms; hearing one is nothing like hearing
// a walk, and judging a footstep from a single tap is how the last two got
// chosen badly. So `preview` says how the app actually delivers this sound — a
// run of steps at real cadence, fourteen counter ticks, three answers climbing —
// and the page plays that instead of the bare clip.
//
// Built with the SAME kit the shipping generator uses (./lib/dsp.mjs), so a
// candidate that is picked is byte-for-byte the clip that gets installed.
// ─────────────────────────────────────────────────────────────────────────────

const R = (rate, make) => atRate(rate, make);

/** A room: quiet low noise under a sound, so it happens somewhere. */
const room = (n, decay, g, lp = 0.06) => {
  const r = lowpass(noise(n), lp);
  const e = env(n, 0.003, decay);
  return r.map((x, i) => x * e[i] * g);
};

// ── the walk ─────────────────────────────────────────────────────────────────

function shoe({ heelHi = 0.30, heelDec = 0.0055, heelG = 1.40, soleF = 1900, soleQ = 2.4,
  soleDec = 0.014, soleG = 0.85, floorHz = 205, floorDec = 0.032, floorG = 0.24,
  roomG = 0.07, roomDec = 0.030, roomLp = 0.08, len = 0.11, seed = 1013, peak = 0.50 } = {}) {
  reseed(seed);
  const n = secs(len);
  const heelN = secs(0.020);
  const heel = highpass(noise(heelN), heelHi);
  const heelE = env(heelN, 0.0002, heelDec);
  const sole = bandpass(noise(n), soleF, soleQ);
  const soleE = env(n, 0.0003, soleDec);
  return finish(mix(
    heel.map((x, i) => x * heelE[i] * heelG),
    sole.map((x, i) => x * soleE[i] * soleG),
    ring(n, floorHz, floorDec, floorG),
    room(n, roomDec, roomG, roomLp),
  ), peak);
}

// ── the physical models ──────────────────────────────────────────────────────
//
// These are the answer to "I can tell these aren't actually real". Everything
// below the divider is the old approach — a couple of sines and a noise burst.
// These use the four things that were missing: many inharmonic modes with
// mode-dependent damping, early reflections off a real floor, correctly tilted
// noise, and a different rendering on every stride.

/**
 * A REAL FOOTSTEP: two contacts, a floor with modes, and a room.
 *
 * A shoe does not hit the ground once. The heel lands, the foot rolls, and the
 * sole slaps down 30–60ms later — and the ear uses that gap to decide what kind
 * of shoe and how fast someone is moving. One impulse is always going to sound
 * like a drum machine.
 *
 * The floor is `modal` rather than a sine: a wooden panel rings in a dense low
 * cluster whose top dies in 15ms and whose bottom hangs for 200, so the timbre
 * changes AS IT DECAYS. Then the whole thing goes through `reflect`, because the
 * sound reaches an ear twice more off the floor and a wall.
 *
 * `v` renders a different one each call — level, timing, brightness and mode
 * detuning all shift — so a walk is eleven different footsteps rather than one
 * played eleven times.
 */
function realStep({ mat = 'plate', f0 = 190, decay = 0.10, damp = 0.7, heelHi = 0.34,
  heelG = 1.0, rollGap = 0.030, rollG = 0.16, wet = 0.30, room = 0.16,
  spread = 0.02, modes = 0, tilt = 1.15, len = 0.34, v = 0, peak = 0.50 } = {}) {
  reseed(3300 + v * 971);
  const n = secs(len);
  const jitter = 1 + (v % 3 - 1) * 0.045;          // a real pair is never identical

  // THE HEEL — the one impact in a footstep. Contact noise into the floor's modes.
  const cn = secs(0.030);
  const c = highpass(tilted(cn, -0.5), heelHi);
  const ce = env(cn, 0.00015, 0.0042);
  const heel = mix(
    c.map((x, i) => x * ce[i] * heelG),
    modal(n, f0 * jitter, modes ? MATERIAL[mat].slice(0, modes) : MATERIAL[mat],
      { decay, damp, g: 0.55, tilt, spread, attack: 0.0003 }),
  );

  // THE ROLL, and this is the part that was wrong.
  //
  // It used to be a SECOND CONTACT at 42ms with 55% of the heel's energy and MORE
  // brightness — which is not what a foot does, it is a flam. In a real walk the
  // forefoot does not strike the ground, it LOADS onto it: the weight transfers
  // over about 80ms as a soft low swell with no contact noise and no high modes at
  // all. So: a fifth of the level, a 6ms attack instead of a fifth of a
  // millisecond, only the bottom of the mode set, and nothing above it.
  //
  // The gap and the gain were then SWEPT rather than guessed, against a measure
  // calibrated on two references: the dress shoe the reader likes (which must read
  // clean) and that same shoe deliberately played twice 42ms apart (which must read
  // as a double). They score 0.00 and 0.94. Every physical step now scores 0.00 —
  // the roll arrives while the heel is still sounding and swells into its decay
  // instead of re-attacking after it.
  const rn = secs(len - rollGap);
  const roll = at(rollGap * jitter,
    modal(rn, f0 * jitter * 0.82, MATERIAL[mat].slice(0, 3),
      { decay: decay * 1.5, damp: damp * 1.6, g: rollG, tilt: 1.8, attack: 0.006 }));

  const dry = mix(heel, roll).slice(0, n);
  return finish(reflect(dry, { time: room, wet, damp: 0.5 }).slice(0, n),
    peak * (0.94 + 0.06 * (v % 2)));
}

const FOOTSTEP = [
  { id: 'real-wood', name: 'Real: leather on a wooden floor', physical: true, vary: 4,
    note: 'One heel strike into a seven-mode floor, the weight rolling on after it, and a real room. Renders differently every stride.',
    make: (_, v = 0) => R(HI, () => realStep({ v })) },
  { id: 'real-stone', name: 'Real: leather on stone', physical: true, vary: 4,
    note: 'The same shoe in a hall. Faster modes, brighter contact, a longer room.',
    make: (_, v = 0) => R(HI, () => realStep({ mat: 'stone', f0: 260, decay: 0.055, damp: 1.0,
      heelHi: 0.40, rollGap: 0.068, rollG: 0.13, wet: 0.55, room: 0.30, len: 0.46, v })) },
  { id: 'real-boot', name: 'Real: a boot on boards', physical: true, vary: 4,
    note: 'Heavier, slower roll, and the floor answers much more than the shoe.',
    make: (_, v = 0) => R(HI, () => realStep({ mat: 'wood', f0: 120, decay: 0.16, damp: 0.5,
      heelHi: 0.22, heelG: 0.7, rollGap: 0.062, rollG: 0.13, wet: 0.28, room: 0.18,
      len: 0.40, peak: 0.55, v })) },
  { id: 'real-soft', name: 'Real: a soft sole indoors', physical: true, vary: 4,
    note: 'Barely any contact noise, and no separable roll — a soft sole has one continuous contact, which is what makes it soft.',
    make: (_, v = 0) => R(HI, () => realStep({ mat: 'plate', f0: 155, decay: 0.13, damp: 0.6,
      heelHi: 0.14, heelG: 0.30, rollG: 0, wet: 0.22, room: 0.14,
      // TWO MODES, STEEPLY TILTED, because a muffled step barely has modes at all.
      // With the full seven-mode plate set this candidate's fundamental at 155 Hz
      // and its second at 209 BEAT against each other at 54 Hz — an 18ms warble
      // plainly visible in the envelope and measuring 0.94 as a double. It is not
      // a second footfall, it is two partials interfering, and the fix is not
      // detune or damping (both were swept and neither helped) but simply not
      // having a second partial loud enough to beat with the first.
      modes: 2, tilt: 2.6, damp: 1.1, len: 0.26, peak: 0.40, v })) },
  { id: 'real-gravel', name: 'Real: gravel', physical: true, vary: 4,
    note: 'Sixty individual stones, not a noise swell. This is what grain sounds like.',
    make: (_, v = 0) => R(HI, () => { reseed(880 + v * 331); const n = secs(0.26);
      return finish(reflect(mix(
        crumple(n, { grains: 70, decay: 0.045, f: 3000, q: 1.5 }),
        crumple(n, { grains: 30, decay: 0.070, f: 900, q: 1.1, spread: 1.4 }),
        modal(n, 130, MATERIAL.plate, { decay: 0.055, damp: 0.9, g: 0.35 }),
      ), { time: 0.14, wet: 0.22, damp: 0.45 }).slice(0, n), 0.48); }) },

  // ── the earlier, simpler approach ──────────────────────────────────────────
  { id: 'dress', name: 'Dress shoe', shipped: true,
    note: 'Leather heel on a hard floor. What is in the app now.',
    make: () => R(HI, () => shoe()) },
  { id: 'heel-toe', name: 'Heel then toe',
    note: 'Two contacts 32ms apart — how a leather shoe really lands. The most realistic.',
    make: () => R(HI, () => { reseed(2211); const n = secs(0.17);
      const h = highpass(noise(secs(0.018)), 0.30); const he = env(secs(0.018), 0.0002, 0.0045);
      const t = bandpass(noise(secs(0.06)), 1500, 2.0); const te = env(secs(0.06), 0.0004, 0.010);
      return finish(mix(
        h.map((x, i) => x * he[i] * 1.3), ring(n, 205, 0.030, 0.26),
        at(0.032, t.map((x, i) => x * te[i] * 0.55)),
        at(0.032, ring(secs(0.10), 260, 0.018, 0.16)),
        room(n, 0.035, 0.08)).slice(0, n), 0.50); }) },
  { id: 'dress-marble', name: 'Dress shoe, marble',
    note: 'Same shoe, harder floor. More crack, less body, rings higher.',
    make: () => R(HI, () => shoe({ heelG: 1.9, soleF: 2600, soleQ: 3.2, floorHz: 300, floorDec: 0.020, floorG: 0.16, roomG: 0.12 })) },
  { id: 'stone-hall', name: 'Stone hall',
    note: 'The same heel in a big room. A long quiet tail behind each step.',
    make: () => R(HI, () => shoe({ heelG: 1.6, soleF: 2400, floorHz: 260, floorDec: 0.026, floorG: 0.18, roomG: 0.30, roomDec: 0.16, roomLp: 0.05, len: 0.42 })) },
  { id: 'tile', name: 'Tile',
    note: 'Bright and ringing, almost pitched. A hard shiny floor.',
    make: () => R(HI, () => shoe({ heelG: 1.5, soleF: 3200, soleQ: 4.0, floorHz: 520, floorDec: 0.038, floorG: 0.30, roomG: 0.10 })) },
  { id: 'dress-quiet', name: 'Dress shoe, quieter',
    note: 'The same sound with the heel pulled back. For if the current one clacks.',
    make: () => R(HI, () => shoe({ heelG: 0.75, soleG: 0.6, floorG: 0.30, peak: 0.42 })) },
  { id: 'oxford-wood', name: 'Leather on floorboards',
    note: 'Warmer and woodier. The floor answers more than the shoe does.',
    make: () => R(HI, () => shoe({ heelHi: 0.22, heelG: 0.85, soleF: 1400, soleQ: 1.8, floorHz: 168, floorDec: 0.055, floorG: 0.55, roomG: 0.14 })) },
  { id: 'clog', name: 'Wooden sole',
    note: 'Hard and clearly pitched. A clog or a wooden heel — the most cartoon-ish.',
    make: () => R(HI, () => { reseed(9090); const n = secs(0.16);
      const k = bandpass(noise(n), 1100, 3.0); const ke = env(n, 0.0003, 0.009);
      return finish(mix(ring(n, 340, 0.045, 1.0), ring(n, 510, 0.030, 0.35),
        k.map((x, i) => x * ke[i] * 0.6), room(n, 0.030, 0.08)), 0.50); }) },
  { id: 'boot', name: 'Boot',
    note: 'Heavier and lower. A deliberate, weighty tread.',
    make: () => R(HI, () => shoe({ heelHi: 0.20, heelDec: 0.008, heelG: 0.9, soleF: 900, soleQ: 1.4, soleDec: 0.022, floorHz: 120, floorDec: 0.070, floorG: 0.75, roomG: 0.18, len: 0.15, peak: 0.55 })) },
  { id: 'gravel', name: 'Gravel',
    note: 'Granular and outdoors. Scores high on hiss by design — see if you mind.',
    make: () => R(HI, () => { reseed(717); const n = secs(0.18);
      const g1 = bandpass(noise(n), 3200, 1.1); const e1 = env(n, 0.0004, 0.028);
      const g2 = bandpass(noise(n), 1300, 1.6); const e2 = env(n, 0.0006, 0.016);
      return finish(mix(g1.map((x, i) => x * e1[i] * 0.9), g2.map((x, i) => x * e2[i] * 0.7),
        ring(n, 150, 0.030, 0.35)), 0.48); }) },
  { id: 'carpet', name: 'Carpet',
    note: 'Almost only body. A muffled indoor step with no edge at all.',
    make: () => R(HI, () => shoe({ heelHi: 0.10, heelG: 0.18, soleF: 550, soleQ: 1.0, soleDec: 0.018, soleG: 0.5, floorHz: 130, floorDec: 0.040, floorG: 0.70, roomG: 0.06, peak: 0.36 })) },
  { id: 'soft', name: 'Soft sole',
    note: 'A quiet padded step — closest to the original thud before the shoes.',
    make: () => R(HI, () => shoe({ heelHi: 0.14, heelG: 0.30, soleF: 700, soleQ: 1.1, soleDec: 0.020, floorHz: 150, floorDec: 0.045, floorG: 0.60, roomG: 0.10, peak: 0.40 })) },
];

const ARRIVAL = [
  { id: 'placed', name: 'Set down', shipped: true,
    note: 'The floor tone of the footstep without the heel. What is in the app now.',
    make: () => R(HI, () => finish(mix(ring(secs(0.13), 196, 0.045, 1.0), ring(secs(0.13), 294, 0.028, 0.28)), 0.26)) },
  { id: 'last-step', name: 'A final step',
    note: 'A real footfall, just quieter. The walk ends on the same instrument.',
    make: () => R(HI, () => shoe({ heelG: 0.55, soleG: 0.45, floorG: 0.35, peak: 0.30, seed: 4477 })) },
  { id: 'together', name: 'Feet together',
    note: 'Two soft placements 70ms apart — the second foot joining the first.',
    make: () => R(HI, () => finish(mix(ring(secs(0.22), 196, 0.038, 0.85),
      at(0.070, ring(secs(0.15), 210, 0.032, 0.70))).slice(0, secs(0.22)), 0.26)) },
  { id: 'shuffle', name: 'A small shuffle',
    note: 'Three tiny contacts as the weight settles. Fussier, more human.',
    make: () => R(HI, () => { const n = secs(0.30);
      return finish(mix(ring(n, 200, 0.024, 0.9), at(0.055, ring(secs(0.24), 186, 0.020, 0.55)),
        at(0.115, ring(secs(0.18), 208, 0.026, 0.40))).slice(0, n), 0.24); }) },
  { id: 'placed-soft', name: 'Set down, softer',
    note: 'Half the level and lower. Barely marks the end of the walk.',
    make: () => R(HI, () => finish(mix(ring(secs(0.12), 150, 0.050, 1.0), ring(secs(0.12), 225, 0.024, 0.20)), 0.16)) },
  { id: 'toe', name: 'Toe tap',
    note: 'Higher and lighter than a step. Reads as the foot arriving, not landing.',
    make: () => R(HI, () => { reseed(6161); const n = secs(0.09);
      const t = bandpass(noise(n), 1800, 2.2); const te = env(n, 0.0004, 0.008);
      return finish(mix(ring(n, 320, 0.018, 0.8), t.map((x, i) => x * te[i] * 0.5)), 0.22); }) },
  { id: 'breath-stop', name: 'Barely anything',
    note: 'One very low pulse. The walk stops without announcing it.',
    make: () => R(HI, () => finish(ring(secs(0.10), 140, 0.032, 1.0), 0.13)) },
];

// ── advancing a beat ─────────────────────────────────────────────────────────

const PAGE = [
  { id: 'real-page', name: 'Real: a leaf landing', physical: true,
    note: 'A brief fibre contact into a damped panel, with the room behind it.',
    make: () => R(HI, () => { reseed(6012); const n = secs(0.18);
      const cn = secs(0.014);
      const c = bandpass(tilted(cn, -0.8), 1900, 1.1); const ce = env(cn, 0.0004, 0.0035);
      return finish(reflect(mix(c.map((x, i) => x * ce[i] * 0.7),
        modal(n, 300, MATERIAL.plate, { decay: 0.020, damp: 1.2, g: 0.9, tilt: 1.4 })),
        { time: 0.09, wet: 0.22, damp: 0.62 }).slice(0, n), 0.20); }) },
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
  { id: 'book', name: 'Heavy page',
    note: 'Lower and slower. A thick page in a bound book.',
    make: () => R(HI, () => { reseed(8123); const n = secs(0.14);
      const f = lowpass(noise(n), 0.09); const fe = env(n, 0.0015, 0.022);
      return finish(mix(ring(n, 190, 0.038, 1.0), ring(n, 285, 0.024, 0.30),
        f.map((x, i) => x * fe[i] * 0.35)), 0.21); }) },
  { id: 'tick', name: 'Wooden tick',
    note: 'No paper at all. A tiny dry knock — the most neutral option here.',
    make: () => R(HI, () => finish(mix(ring(secs(0.05), 900, 0.008, 1.0), ring(secs(0.05), 1350, 0.005, 0.30)), 0.18)) },
  { id: 'flick', name: 'Flick',
    note: 'Short, high and light. A corner released rather than a page landing.',
    make: () => R(HI, () => { reseed(4545); const n = secs(0.045);
      const e = bandpass(noise(n), 4200, 1.8); const ee = env(n, 0.0002, 0.004);
      return finish(mix(e.map((x, i) => x * ee[i]), ring(n, 700, 0.008, 0.35)), 0.19); }) },
  { id: 'soft-thump', name: 'Soft thump',
    note: 'Low and rounded with no top end. Felt more than heard.',
    make: () => R(HI, () => finish(mix(ring(secs(0.10), 165, 0.028, 1.0), ring(secs(0.10), 248, 0.014, 0.22)), 0.17)) },
  { id: 'breath', name: 'Almost nothing',
    note: 'A very low, very short pulse. The quietest option on the page.',
    make: () => R(HI, () => finish(ring(secs(0.06), 190, 0.018, 1.0), 0.13)) },
  { id: 'chime-page', name: 'A tiny chime',
    note: 'Pitched and pretty rather than physical. Turns the page into an event.',
    make: () => R(HI, () => finish(mix(ring(secs(0.22), 1046.5, 0.055, 1.0), ring(secs(0.22), 1568, 0.035, 0.28)), 0.17)) },
];

// ── touching a control ───────────────────────────────────────────────────────

function uiTap({ f = 780, second = 2, secondG = 0.20, third = 0, thirdG = 0, dec = 0.018,
  attack = 0.0016, puffG = 0.22, puffLp = 0.13, len = 0.055, peak = 0.26, seed = 90210 } = {}) {
  reseed(seed);
  const n = secs(len);
  const puff = lowpass(noise(n), puffLp);
  const puffE = env(n, 0.0008, 0.003);
  const e = env(n, attack, dec);
  const body = mix(sine(n, f), gain(sine(n, f * second), secondG),
    third ? gain(sine(n, f * third), thirdG) : new Array(n).fill(0));
  return finish(mix(body.map((x, i) => x * e[i]), puff.map((x, i) => x * puffE[i] * puffG)), peak);
}

/** A fingertip on a solid thing: a short contact, real modes, and a small room. */
function realTap({ mat = 'wood', f0 = 700, decay = 0.030, damp = 0.8, nailG = 0.35,
  hi = 0.30, len = 0.20, wet = 0.55, peak = 0.26, seed = 411 } = {}) {
  reseed(seed);
  const n = secs(len);
  const cn = secs(0.010);
  const nail = highpass(tilted(cn, -0.6), hi);
  const ne = env(cn, 0.0002, 0.0022);
  const dry = mix(nail.map((x, i) => x * ne[i] * nailG),
    modal(n, f0, MATERIAL[mat], { decay, damp, g: 1, tilt: 1.3, attack: 0.0006 }));
  return finish(reflect(dry, { time: 0.10, wet: wet * 0.45, damp: 0.6 }).slice(0, n), peak);
}

const TAP = [
  { id: 'real-wood-tap', name: 'Real: fingertip on wood', physical: true,
    note: 'Five inharmonic modes with the high ones dying first, plus a small room.',
    make: () => R(HI, () => realTap()) },
  { id: 'real-glass-tap', name: 'Real: fingertip on glass', physical: true,
    note: 'Nearly harmonic modes and much less damping — it rings a little.',
    make: () => R(HI, () => realTap({ mat: 'glass', f0: 1180, decay: 0.055, damp: 0.35, nailG: 0.5, len: 0.26, peak: 0.24 })) },
  { id: 'real-card-tap', name: 'Real: fingertip on card', physical: true,
    note: 'Heavily damped and low. Almost all contact, almost no ring.',
    make: () => R(HI, () => realTap({ mat: 'plate', f0: 380, decay: 0.014, damp: 1.4, nailG: 0.22, hi: 0.20, len: 0.10, wet: 0.35, peak: 0.24 })) },

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
    note: 'Dry and pitched, with the fifth rather than the octave. Small percussion.',
    make: () => R(HI, () => uiTap({ f: 900, second: 1.5, secondG: 0.34, dec: 0.012, attack: 0.0006, puffG: 0.16, peak: 0.26 })) },
  { id: 'pebble', name: 'Pebble',
    note: 'Two close partials, very short. Reads as a small solid thing.',
    make: () => R(HI, () => { reseed(5150); const n = secs(0.04);
      return finish(mix(ring(n, 1240, 0.007, 1.0), ring(n, 1860, 0.005, 0.5), ring(n, 620, 0.010, 0.4)), 0.24); }) },
  { id: 'key', name: 'Key',
    note: 'A mechanical click with a tiny body. Precise, slightly technical.',
    make: () => R(HI, () => { reseed(1717); const n = secs(0.038);
      const k = bandpass(noise(n), 3400, 2.6); const ke = env(n, 0.0002, 0.0035);
      return finish(mix(k.map((x, i) => x * ke[i]), ring(n, 820, 0.007, 0.45)), 0.24); }) },
  { id: 'paper-tick', name: 'Paper',
    note: 'Dry, unpitched, no ring. The most neutral tap here — barely a sound.',
    make: () => R(HI, () => { reseed(3030); const n = secs(0.035);
      const p = bandpass(noise(n), 1500, 1.2); const pe = env(n, 0.0006, 0.0055);
      return finish(mix(p.map((x, i) => x * pe[i]), ring(n, 420, 0.006, 0.30)), 0.22); }) },
  { id: 'chime-tap', name: 'Tiny chime',
    note: 'A small bell rather than a knock. Prettier, and 3× longer than the rest.',
    make: () => R(HI, () => finish(mix(ring(secs(0.20), 1318.5, 0.050, 1.0), ring(secs(0.20), 1976, 0.030, 0.25)), 0.24)) },
  { id: 'blip', name: 'Blip',
    note: 'A quick upward sweep. Unashamedly an app sound — the least paper-like.',
    make: () => R(HI, () => { const n = secs(0.05);
      const s = sweep(n, 620, 1180); const e = env(n, 0.0012, 0.014);
      return finish(s.map((x, i) => x * e[i]), 0.24); }) },
  { id: 'thumb', name: 'Thumb',
    note: 'Very low and soft, almost no pitch. A fingertip on something solid.',
    make: () => R(HI, () => uiTap({ f: 260, second: 1.5, secondG: 0.30, dec: 0.028, attack: 0.0030, puffG: 0.34, puffLp: 0.07, peak: 0.24 })) },
  { id: 'hairline', name: 'Hairline',
    note: 'The quietest and shortest possible. Registers without being noticed.',
    make: () => R(HI, () => uiTap({ f: 980, secondG: 0.10, dec: 0.008, attack: 0.0010, puffG: 0.08, len: 0.03, peak: 0.16 })) },
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
      return finish(mix(bell(n, f, 0.19, 1.0), at(0.055, bell(secs(0.60), f * 1.5, 0.17, 0.62)),
        at(0.055, bell(secs(0.60), f * 3, 0.10, 0.10))).slice(0, n), 0.62); }) },
  { id: 'single', name: 'One note', pitches: TRIAD,
    note: 'A single struck bell. Restrained — the most understated option.',
    make: (f) => R(LO, () => finish(bell(secs(0.55), f, 0.20, 1.0), 0.62)) },
  { id: 'arpeggio', name: 'Three notes up', pitches: TRIAD,
    note: 'A little run inside each answer, on top of the climb between them.',
    make: (f) => R(LO, () => { const n = secs(0.80);
      return finish(mix(bell(n, f, 0.16, 0.85), at(0.075, bell(secs(0.72), f * 1.26, 0.16, 0.85)),
        at(0.150, bell(secs(0.65), f * 1.5, 0.26, 1.0))).slice(0, n), 0.64); }) },
  { id: 'chord', name: 'Full chord', pitches: TRIAD,
    note: 'Root, third and fifth struck together. Solid rather than sparkling.',
    make: (f) => R(LO, () => { const n = secs(0.70);
      return finish(mix(bell(n, f, 0.22, 1.0), bell(n, f * 1.26, 0.20, 0.52), bell(n, f * 1.5, 0.20, 0.60)), 0.62); }) },
  { id: 'marimba', name: 'Marimba', pitches: TRIAD,
    note: 'Wooden rather than glassy — a strong fourth partial and a fast decay.',
    make: (f) => R(LO, () => { const n = secs(0.45);
      const e = env(n, 0.002, 0.11);
      const body = mix(sine(n, f), gain(sine(n, f * 4), 0.30), gain(sine(n, f * 2), 0.10));
      return finish(mix(body.map((x, i) => x * e[i]),
        at(0.050, bell(secs(0.40), f * 1.5, 0.09, 0.40))).slice(0, n), 0.60); }) },
  { id: 'music-box', name: 'Music box', pitches: TRIAD,
    note: 'Bright, delicate, with a metallic plink. Two octaves up.',
    make: (f) => R(LO, () => { const n = secs(0.70);
      const e = env(n, 0.0012, 0.18);
      const body = mix(sine(n, f * 4), gain(sine(n, f * 8.1), 0.22),
        gain(sine(n, f * 12.4), 0.10), gain(sine(n, f * 2), 0.14));
      return finish(body.map((x, i) => x * e[i]), 0.56); }) },
  { id: 'tine', name: 'Electric tine', pitches: TRIAD,
    note: 'A Rhodes-ish bell tone. Warm attack, long soft fall, slightly retro.',
    make: (f) => R(LO, () => { const n = secs(0.90);
      const e = env(n, 0.004, 0.28);
      const ping = env(n, 0.001, 0.035);
      return finish(mix(sine(n, f).map((x, i) => x * e[i]),
        sine(n, f * 4).map((x, i) => x * ping[i] * 0.30),
        sine(n, f * 2).map((x, i) => x * e[i] * 0.18)), 0.58); }) },
  { id: 'glass-ding', name: 'Glass', pitches: TRIAD,
    note: 'Bright, long, and clean, an octave up. Sits well above the narration.',
    make: (f) => R(LO, () => { const n = secs(0.85);
      return finish(mix(bell(n, f * 2, 0.30, 1.0),
        at(0.040, bell(secs(0.80), f * 3, 0.24, 0.45))).slice(0, n), 0.58); }) },
  { id: 'harp', name: 'Plucked', pitches: TRIAD,
    note: 'A softer attack and a long fall. Warm rather than bright.',
    make: (f) => R(LO, () => { const n = secs(0.95);
      const e = env(n, 0.012, 0.34);
      const body = mix(sine(n, f), gain(sine(n, f * 2), 0.42), gain(sine(n, f * 3), 0.18),
        gain(sine(n, f * 4), 0.07));
      return finish(mix(body.map((x, i) => x * e[i]),
        at(0.060, gain(bell(secs(0.88), f * 1.5, 0.30), 0.50))).slice(0, n), 0.60); }) },
  { id: 'pad', name: 'Soft swell', pitches: TRIAD,
    note: 'No attack at all — it fades in and out. The gentlest possible yes.',
    make: (f) => R(LO, () => { const n = secs(0.85);
      const e = Array.from({ length: n }, (_, i) => Math.sin(Math.PI * (i / n)) ** 1.4);
      return finish(mix(sine(n, f), gain(sine(n, f * 1.5), 0.45), gain(sine(n, f * 2), 0.22))
        .map((x, i) => x * e[i]), 0.56); }) },
];

const WRONG = [
  { id: 'damped-wood', name: 'Damped wood', shipped: true,
    note: '168 Hz with a fifth, struck and stopped. What is in the app now.',
    make: () => R(HI, () => { reseed(31337); const n = secs(0.30);
      const k = bandpass(noise(n), 420, 1.6); const ke = env(n, 0.0010, 0.020);
      return finish(mix(ring(n, 168, 0.055, 1.0), ring(n, 251, 0.040, 0.34),
        k.map((x, i) => x * ke[i] * 0.55), room(n, 0.070, 0.12, 0.05)), 0.38); }) },
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
    note: 'A gentle double pulse. Reads as "not that" with no pitch at all.',
    make: () => R(HI, () => { const n = secs(0.30);
      return finish(mix(ring(n, 190, 0.028, 1.0), at(0.105, ring(secs(0.19), 175, 0.030, 0.8))).slice(0, n), 0.34); }) },
  { id: 'gentle-fall', name: 'Two notes down',
    note: 'A quiet falling third. Musical, still in D, and not a cartoon slide.',
    make: () => R(HI, () => { const n = secs(0.60);
      return finish(mix(bell(n, 440.0, 0.13, 0.9), at(0.110, bell(secs(0.49), 369.99, 0.18, 0.85))).slice(0, n), 0.38); }) },
  { id: 'thud', name: 'Just a thud',
    note: 'One low soft impact and nothing else. Completely neutral.',
    make: () => R(HI, () => finish(mix(ring(secs(0.24), 110, 0.060, 1.0), room(secs(0.24), 0.040, 0.14)), 0.34)) },
  { id: 'dry-click', name: 'Dry click',
    note: 'A bare unpitched tick. Registers the answer without commenting on it.',
    make: () => R(HI, () => { reseed(2020); const n = secs(0.06);
      const k = bandpass(noise(n), 900, 1.3); const ke = env(n, 0.0008, 0.009);
      return finish(k.map((x, i) => x * ke[i]), 0.30); }) },
  { id: 'sigh', name: 'A soft fall',
    note: 'A slow gentle descent with no attack. Sympathetic rather than corrective.',
    make: () => R(HI, () => { const n = secs(0.55);
      const s = sweep(n, 330, 262);
      const e = Array.from({ length: n }, (_, i) => Math.sin(Math.PI * (i / n)) ** 1.2);
      return finish(mix(s.map((x, i) => x * e[i]), sine(n, 165).map((x, i) => x * e[i] * 0.3)), 0.32); }) },
  { id: 'low-block', name: 'Low wood block',
    note: 'Dry, pitched, and short. A definite full stop with no colour.',
    make: () => R(HI, () => finish(mix(ring(secs(0.14), 240, 0.022, 1.0), ring(secs(0.14), 360, 0.014, 0.30)), 0.34)) },
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
      return finish(mix(bell(n, 587.33, 0.16, 0.75), at(0.105, bell(secs(1.35), 739.99, 0.16, 0.78)),
        at(0.210, bell(secs(1.24), 880.0, 0.18, 0.82)),
        at(0.315, bell(secs(1.14), 1174.66, 0.40, 1.0)),
        at(0.315, bell(secs(1.14), 587.33, 0.50, 0.42))).slice(0, n), 0.80); }) },
  { id: 'skip-up', name: 'Skipping up',
    note: 'Five quick notes with a lift at the end. The most game-like here.',
    make: () => R(LO, () => { const n = secs(1.30);
      const seq = [[587.33, 0, 0.7], [880.0, 0.075, 0.75], [1174.66, 0.150, 0.8],
        [880.0, 0.225, 0.6], [1479.98, 0.300, 1.0]];
      return finish(mix(...seq.map(([f, d, g]) => at(d, bell(secs(1.30 - d), f, d === 0.300 ? 0.42 : 0.13, g))),
        at(0.300, bell(secs(1.0), 587.33, 0.50, 0.38))).slice(0, n), 0.80); }) },
  { id: 'music-box-end', name: 'Music box',
    note: 'Delicate and high, like a lid closing on a small mechanism.',
    make: () => R(LO, () => { const n = secs(1.50);
      const mb = (f, d, g) => { const len = secs(1.50 - d);
        const e = env(len, 0.0012, 0.30);
        return at(d, mix(sine(len, f), gain(sine(len, f * 2.02), 0.24), gain(sine(len, f * 3.1), 0.10))
          .map((x, i) => x * e[i] * g)); };
      return finish(mix(mb(1174.66, 0, 0.75), mb(1479.98, 0.090, 0.75), mb(1760.0, 0.180, 0.9),
        mb(2349.3, 0.270, 0.55), mb(587.33, 0.180, 0.30)).slice(0, n), 0.76); }) },
  { id: 'warm-swell', name: 'Warm swell',
    note: 'A soft attack into a full chord. Calm rather than triumphant.',
    make: () => R(LO, () => { const n = secs(1.35);
      const soft = (f, g) => { const e = env(n, 0.055, 0.42);
        return mix(sine(n, f), gain(sine(n, f * 2), 0.22)).map((x, i) => x * e[i] * g); };
      return finish(mix(soft(293.66, 0.55), soft(587.33, 1.0), soft(739.99, 0.62), soft(880.0, 0.52)), 0.74); }) },
  { id: 'choir', name: 'Held chord',
    note: 'No attack and a long fade. The most serious, least gamified option.',
    make: () => R(LO, () => { const n = secs(1.90);
      const v = (f, g) => { const e = Array.from({ length: n }, (_, i) =>
        Math.min(1, (i / n) * 5) * Math.exp(-((i / n) ** 2) * 3.2));
        return mix(sine(n, f), gain(sine(n, f * 2), 0.16), gain(sine(n, f * 3), 0.06))
          .map((x, i) => x * e[i] * g); };
      return finish(mix(v(293.66, 0.7), v(440.0, 0.5), v(587.33, 0.85), v(880.0, 0.4)), 0.72); }) },
  { id: 'bells-up', name: 'Three bells',
    note: 'Slow, spacious, and sustained. A church rather than a scoreboard.',
    make: () => R(LO, () => { const n = secs(1.90);
      return finish(mix(bell(n, 440.0, 0.42, 0.8), at(0.230, bell(secs(1.67), 587.33, 0.44, 0.9)),
        at(0.460, bell(secs(1.44), 880.0, 0.55, 1.0))).slice(0, n), 0.76); }) },
  { id: 'two-note-close', name: 'Two notes',
    note: 'The most restrained: a fifth, and done. For if the others wear out.',
    make: () => R(LO, () => { const n = secs(0.95);
      return finish(mix(bell(n, 587.33, 0.34, 1.0), at(0.120, bell(secs(0.83), 880.0, 0.30, 0.72))).slice(0, n), 0.76); }) },
];

// ── the XP counter ───────────────────────────────────────────────────────────

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
  { id: 'coin', name: 'Coin', pitches: TRIAD_HI,
    note: 'Two metallic partials close together. The most "points" of the set.',
    make: (f) => R(HI, () => finish(mix(ring(secs(0.07), f * 1.5, 0.016, 1.0),
      ring(secs(0.07), f * 2.24, 0.011, 0.55), ring(secs(0.07), f * 3.37, 0.007, 0.22)), 0.15)) },
  { id: 'blip-tick', name: 'Blip', pitches: TRIAD_HI,
    note: 'A tiny upward chirp per tick, so the run rises twice over.',
    make: (f) => R(HI, () => { const n = secs(0.030);
      const s = sweep(n, f * 0.8, f * 1.25); const e = env(n, 0.0004, 0.007);
      return finish(s.map((x, i) => x * e[i]), 0.15); }) },
  { id: 'dot', name: 'Dot', pitches: TRIAD_HI,
    note: 'Unpitched and utterly plain. A counter, not a melody.',
    make: (f) => R(HI, () => { reseed(1200); const n = secs(0.022);
      const k = bandpass(noise(n), f, 3.0); const e = env(n, 0.0002, 0.004);
      return finish(k.map((x, i) => x * e[i]), 0.15); }) },
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
      return finish(mix(bell(n, 293.66, 0.40, 1.0), at(0.150, bell(secs(1.25), 587.33, 0.34, 0.55))).slice(0, n), 0.74); }) },
  { id: 'shimmer', name: 'Struck and shining',
    note: 'The strike with a bright rising tail over it. The most ornamental.',
    make: () => R(LO, () => { const n = secs(1.55);
      const sp = [1174.66, 1479.98, 1760.0, 2349.3];
      return finish(mix(bell(n, 293.66, 0.44, 1.0),
        ...sp.map((f, k) => at(0.10 + k * 0.075, bell(secs(1.4 - k * 0.075), f, 0.30, 0.16)))).slice(0, n), 0.74); }) },
  { id: 'medal', name: 'Metal on metal',
    note: 'Two hard partials and a short ring. A medal set down on a table.',
    make: () => R(LO, () => { reseed(3812); const n = secs(0.90);
      const k = bandpass(noise(n), 2400, 2.4); const ke = env(n, 0.0004, 0.010);
      return finish(mix(ring(n, 392, 0.20, 1.0), ring(n, 588, 0.15, 0.45), ring(n, 1046, 0.09, 0.20),
        k.map((x, i) => x * ke[i] * 0.5)), 0.72); }) },
  { id: 'soft-badge', name: 'Quiet mark',
    note: 'Low and understated. For if the badge should not interrupt the chime.',
    make: () => R(LO, () => finish(mix(bell(secs(0.85), 220.0, 0.28, 1.0), bell(secs(0.85), 330.0, 0.20, 0.30)), 0.62)) },
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
    note: 'A longer run up the scale. Grander, and this fires 25 times ever.',
    make: () => R(LO, () => { const N = secs(2.20);
      const notes = [[293.66, 0], [440.0, 0.09], [587.33, 0.18], [739.99, 0.27], [880.0, 0.36], [1174.66, 0.46]];
      return finish(mix(...notes.map(([f, d], k) =>
        at(d, bell(secs(2.20 - d), f, k === 5 ? 0.46 : 0.22, 0.7 + k * 0.06))),
        at(0.46, bell(secs(1.74), 587.33, 0.55, 0.45))).slice(0, N), 0.84); }) },
  { id: 'fanfare', name: 'Fanfare',
    note: 'A dotted rhythm — short, short, long. The most ceremonial option.',
    make: () => R(LO, () => { const N = secs(2.10);
      return finish(mix(bell(secs(2.10), 587.33, 0.13, 0.8),
        at(0.14, bell(secs(1.96), 587.33, 0.13, 0.8)),
        at(0.28, bell(secs(1.82), 880.0, 0.16, 0.9)),
        at(0.50, bell(secs(1.60), 1174.66, 0.50, 1.0)),
        at(0.50, bell(secs(1.60), 739.99, 0.44, 0.5)),
        at(0.50, bell(secs(1.60), 293.66, 0.60, 0.5))).slice(0, N), 0.84); }) },
  { id: 'three-and-hold', name: 'Three and hold',
    note: 'Shorter — up to the fifth and sustained. Less of an interruption.',
    make: () => R(LO, () => { const N = secs(1.45);
      return finish(mix(bell(secs(1.45), 587.33, 0.20, 0.80),
        at(0.12, bell(secs(1.33), 880.0, 0.22, 0.85)),
        at(0.25, bell(secs(1.20), 1174.66, 0.48, 1.0)),
        at(0.25, bell(secs(1.20), 293.66, 0.55, 0.45))).slice(0, N), 0.82); }) },
  { id: 'peal', name: 'Bells pealing',
    note: 'Overlapping strikes that ring into each other. Big and slow.',
    make: () => R(LO, () => { const N = secs(2.60);
      const seq = [[293.66, 0], [440.0, 0.20], [587.33, 0.40], [880.0, 0.62], [587.33, 0.84], [1174.66, 1.05]];
      return finish(mix(...seq.map(([f, d], k) =>
        at(d, bell(secs(2.60 - d), f, 0.60, 0.55 + k * 0.08)))).slice(0, N), 0.84); }) },
  { id: 'quiet-rank', name: 'A quiet climb',
    note: 'The same four notes with no chord underneath. Dignified, not loud.',
    make: () => R(LO, () => { const N = secs(1.60);
      return finish(mix(bell(secs(1.60), 587.33, 0.20, 0.7),
        at(0.13, bell(secs(1.47), 739.99, 0.20, 0.7)),
        at(0.26, bell(secs(1.34), 880.0, 0.22, 0.75)),
        at(0.39, bell(secs(1.21), 1174.66, 0.44, 0.85))).slice(0, N), 0.70); }) },
];

const IMPACT = [
  { id: 'real-impact', name: 'Real: a struck panel', physical: true,
    note: 'A dense low mode cluster in a real room. Weight without a crash.',
    make: () => R(HI, () => { reseed(7714); const n = secs(0.95);
      const cn = secs(0.020);
      const c = lowpass(tilted(cn, -0.9), 0.30); const ce = env(cn, 0.0004, 0.0055);
      return finish(reflect(mix(c.map((x, i) => x * ce[i] * 0.55),
        modal(n, 96, MATERIAL.plate, { decay: 0.30, damp: 0.85, g: 1, tilt: 1.1 })),
        { time: 0.34, wet: 0.45, damp: 0.42 }).slice(0, n), 0.66); }) },
  { id: 'thud', name: 'Low thud', shipped: true,
    note: 'One struck low tone with a room tail. What is in the app now.',
    make: () => R(HI, () => { reseed(19760); const n = secs(0.70);
      const th = mix(gain(sine(n, 104), 1), gain(sine(n, 156), 0.35));
      const te = env(n, 0.0015, 0.090);
      const st = lowpass(noise(secs(0.05)), 0.24); const ke = env(secs(0.05), 0.0006, 0.014);
      return finish(mix(th.map((x, i) => x * te[i]), st.map((x, i) => x * ke[i] * 0.8),
        room(n, 0.150, 0.22, 0.05)), 0.66); }) },
  { id: 'toll', name: 'A single toll',
    note: 'A low struck bell rather than a thud. Grave, and clearly a moment.',
    make: () => R(LO, () => finish(mix(bell(secs(1.60), 110.0, 0.55, 1.0), bell(secs(1.60), 164.81, 0.36, 0.30)), 0.68)) },
  { id: 'drop', name: 'A falling weight',
    note: 'A short downward sweep into a thud. Something arriving fast.',
    make: () => R(HI, () => { reseed(4062); const n = secs(0.55);
      const s = sweep(secs(0.16), 320, 96); const se = env(secs(0.16), 0.002, 0.055);
      return finish(mix(s.map((x, i) => x * se[i] * 0.7),
        at(0.140, mix(ring(secs(0.41), 98, 0.075, 1.0), ring(secs(0.41), 147, 0.045, 0.30)))).slice(0, n), 0.66); }) },
  { id: 'hollow', name: 'Hollow knock',
    note: 'Woody and resonant rather than heavy. Less violent than a thud.',
    make: () => R(HI, () => { reseed(5544); const n = secs(0.60);
      const k = bandpass(noise(n), 700, 1.8); const ke = env(n, 0.0006, 0.014);
      return finish(mix(ring(n, 138, 0.130, 1.0), ring(n, 207, 0.080, 0.35),
        k.map((x, i) => x * ke[i] * 0.45)), 0.64); }) },
  { id: 'stop', name: 'A full stop',
    note: 'Very short and very low. The scene simply halts — no drama at all.',
    make: () => R(HI, () => finish(mix(ring(secs(0.26), 96, 0.055, 1.0), ring(secs(0.26), 144, 0.030, 0.25)), 0.60)) },
  { id: 'deep-toll', name: 'Deep toll',
    note: 'The lowest and longest here. Reads as gravity rather than collision.',
    make: () => R(LO, () => finish(mix(bell(secs(2.20), 73.42, 0.80, 1.0), bell(secs(2.20), 110.0, 0.55, 0.35),
      bell(secs(2.20), 220.0, 0.30, 0.12)), 0.68)) },
];

// ─────────────────────────────────────────────────────────────────────────────
// HOW EACH ROLE IS PREVIEWED.
//
// The single most useful thing on the page, and the reason the first version was
// hard to judge: a 110ms footfall played once tells you nothing about a walk. The
// app delivers most of these as a RUN — twelve footfalls, fourteen counter ticks,
// three answers climbing — and a run is a completely different sound from its
// parts. So the play button plays the run.
//
//   walk    the real plant times, taken from footfalls.ts at build time
//   repeat  n copies at a fixed gap
//   climb   the three pitches in order, for the cues that rise
//   once    one-shots that genuinely fire alone
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A GESTURE THROUGH AIR — rebuilt from the physics, after the first one was
 * deleted for hissing.
 *
 * The old `swish` was noise through a FIXED band on a slow symmetric swell, which
 * is a volume shape on a static timbre, and static noise is hiss whatever its
 * level does. It scored 0.474 where the footfall scores 0.012.
 *
 * A real limb accelerates and decelerates, so the turbulence SWEEPS UP in pitch
 * and back down while the resonance sharpens at speed. The movement is the sound.
 * These use `sweepBand`, which is that and nothing else — worth judging on
 * whether any of them escape the bush, because if none do, the honest answer is
 * still that a gesture stays silent.
 */
const WHOOSH = [
  { id: 'arm-sleeve', name: 'Real: a sleeve', physical: true,
    note: 'Sweeps 400 → 2200 → 700 Hz over 170ms. Cloth on a moving arm.',
    make: () => R(HI, () => { reseed(2401); const n = secs(0.17);
      const e = Array.from({ length: n }, (_, i) => { const u = i / n;
        return Math.pow(Math.sin(Math.PI * Math.pow(u, 0.72)), 1.9); });
      return finish(sweepBand(tilted(n, -0.5), 400, 2200, 700, 1.1, 3.4).map((x, i) => x * e[i]), 0.30); }) },
  { id: 'fast-hand', name: 'Real: a fast hand',  physical: true,
    note: 'Shorter and higher — 90ms, sweeping to 3.6 kHz. A quick sharp gesture.',
    make: () => R(HI, () => { reseed(9931); const n = secs(0.09);
      const e = Array.from({ length: n }, (_, i) => { const u = i / n;
        return Math.pow(Math.sin(Math.PI * Math.pow(u, 0.65)), 2.2); });
      return finish(sweepBand(tilted(n, -0.35), 700, 3600, 1200, 1.4, 4.2).map((x, i) => x * e[i]), 0.28); }) },
  { id: 'heavy-swing', name: 'Real: a heavy swing', physical: true,
    note: 'Slower and lower, 260ms. An arm with weight behind it.',
    make: () => R(HI, () => { reseed(5520); const n = secs(0.26);
      const e = Array.from({ length: n }, (_, i) => { const u = i / n;
        return Math.pow(Math.sin(Math.PI * Math.pow(u, 0.8)), 1.6); });
      return finish(sweepBand(tilted(n, -0.8), 220, 1250, 380, 1.0, 2.8).map((x, i) => x * e[i]), 0.30); }) },
  { id: 'paper-wave', name: 'Real: paper waved',  physical: true,
    note: 'A sheet moved through air — brighter, with a flutter in the middle.',
    make: () => R(HI, () => { reseed(3388); const n = secs(0.20);
      const e = Array.from({ length: n }, (_, i) => { const u = i / n;
        const flutter = 1 + 0.28 * Math.sin(2 * Math.PI * 34 * u);
        return Math.pow(Math.sin(Math.PI * Math.pow(u, 0.7)), 1.8) * flutter; });
      return finish(sweepBand(tilted(n, -0.25), 900, 4200, 1500, 1.3, 3.0).map((x, i) => x * e[i]), 0.28); }) },
  { id: 'old-swish', name: 'The one that was deleted',
    note: 'Static band on a symmetric swell — kept so the difference is audible.',
    make: () => R(HI, () => { reseed(4242); const n = secs(0.22);
      const air = highpass(lowpass(noise(n), 0.30), 0.03);
      const sw = Array.from({ length: n }, (_, i) => Math.sin(Math.PI * (i / n)) ** 1.6);
      return finish(air.map((x, i) => x * sw[i]), 0.34); }) },
];

export const ROLES = [
  { id: 'footstep', title: 'Footstep', preview: { kind: 'walk' },
    fires: 'Twelve times in Moral Luck, under the walking figure.', options: FOOTSTEP },
  { id: 'arrival', title: 'End of a walk', preview: { kind: 'arrival' },
    fires: 'Once at the close of each of the five walks.', options: ARRIVAL },
  { id: 'page', title: 'Advancing a beat', preview: { kind: 'repeat', n: 4, gap: 1.15 },
    fires: 'Every tap in a lesson — about ten times.', options: PAGE },
  { id: 'tap', title: 'Touching a control', preview: { kind: 'repeat', n: 3, gap: 0.5 },
    fires: 'Every button in the app. The most-heard sound by far.', options: TAP },
  { id: 'right', title: 'Answer correct', preview: { kind: 'climb', gap: 0.95 },
    fires: 'Twice per lesson. Climbs the triad on a run.', options: RIGHT },
  { id: 'wrong', title: 'Answer wrong', preview: { kind: 'repeat', n: 2, gap: 1.3 },
    fires: 'Only when the reader misses.', options: WRONG },
  { id: 'finish', title: 'Lesson finished', preview: { kind: 'once' },
    fires: 'Once, as the reward screen appears.', options: FINISH },
  { id: 'tick', title: 'XP counting up', preview: { kind: 'count', n: 14, gap: 0.070 },
    fires: 'About fifteen in a row, right after the finish.', options: TICK },
  { id: 'badge', title: 'Badge earned', preview: { kind: 'once' },
    fires: 'Occasionally, on the reward screen.', options: BADGE },
  { id: 'rankup', title: 'Rank up', preview: { kind: 'once' },
    fires: 'Twenty-five times in the whole curriculum.', options: RANKUP },
  { id: 'impact', title: 'Something struck', preview: { kind: 'once' },
    fires: 'Once in Moral Luck, when the mark lands on road B.', options: IMPACT },
  { id: 'whoosh', title: 'A gesture through air', preview: { kind: 'repeat', n: 3, gap: 0.75 },
    fires: 'NOT IN THE APP — deleted for hissing. Rebuilt here to see if it can be saved.',
    options: WHOOSH },
];
