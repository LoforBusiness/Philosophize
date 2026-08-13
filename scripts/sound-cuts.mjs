// ─────────────────────────────────────────────────────────────────────────────
// THE CUT LIST — how a source recording becomes a shipped cue.
//
// The pitched cues (right, tick, reward, badge, rankup) are SYNTHESISED and stay
// that way: they are struck notes, all in D, and modal synthesis is genuinely
// better at those than a recording is. See scripts/make-sounds.mjs.
//
// The physical cues are the ones synthesis is bad at. A leather heel, a clasp, a
// fingertip on paper are complex noise transients living between 4 and 10 kHz, and
// make-sounds.mjs's own header records that the first set sounded cheap because it
// shipped at 22.05 kHz and cut that band off entirely. Those get real recordings,
// and this file says what to do with each one.
//
// ONE ENTRY PER SHIPPED FILE, and the entry is numbers rather than prose, for the
// same reason the camera moves and the rig poses are numbers: it can be diffed in
// review, it can be re-run, and changing the sound is changing a value rather than
// re-describing an intention.
//
//   node scripts/cut-sounds.mjs          renders every entry whose source exists
//   node scripts/cut-sounds.mjs keep     renders one
//
// ── ADDING A SOUND ───────────────────────────────────────────────────────────
//
//   1. put a trimmed CC0 excerpt in assets/sound-src/
//   2. add its origin + licence to assets/sound-src/SOURCES.md
//   3. add an entry below
//   4. node scripts/cut-sounds.mjs && npm run check:sound
//
// The licence line in step 2 is not paperwork — validate-sound.mjs fails the build
// if a source has no entry or the entry is not CC0. That is what keeps "all of this
// is free forever" true without anybody having to remember it.
// ─────────────────────────────────────────────────────────────────────────────

import { HI, LO } from './lib/dsp.mjs';

/**
 * @typedef {object} Cut
 * @property {string}  src    filename in assets/sound-src/
 * @property {number}  in     start, seconds into the source
 * @property {number}  out    end, seconds into the source
 * @property {number} [hp]    high-pass corner in Hz. Removes rumble and the room.
 * @property {number} [lp]    low-pass corner in Hz. Takes the hiss off the top.
 * @property {number} [rate]  output sample rate. HI for anything with a transient.
 * @property {number} [gain]  peak to normalise to, 0..1. The mix balance lives here.
 * @property {{in?: number, out?: number}} [fade]
 *   Short fades in seconds, applied at the cut edges. THE DEFAULT IS NOT ZERO: a
 *   cut through a non-zero sample is a step discontinuity, which is a click, which
 *   is the first thing validate-sound.mjs looks for. Two milliseconds is inaudible
 *   as a fade and removes the click completely.
 * @property {{attack?: number, decay?: number}} [env]
 *   OPTIONAL re-shaping, and usually wrong for a sample. A recording arrives with
 *   its own envelope and that envelope is most of why it sounds real; replacing it
 *   with a synthetic one throws away the thing the recording was for. Reach for it
 *   only to shorten a decay that is too long for the app's dry, close character.
 */

/** Two milliseconds, enough to kill an edge click and short enough to not be heard. */
export const DEFAULT_FADE = 0.002;

/**
 * @type {Record<string, Cut>}
 *
 * Keys are the SHIPPED FILENAME without extension, because that is what
 * lib/sound/real.ts requires and the point of this table is that nothing in the app
 * has to change when a sound is re-cut. `step` has two variants that alternate,
 * `whoosh` has three chosen by measured hand speed — see lib/sound/types.ts.
 *
 * EMPTY UNTIL THERE ARE SOURCES, deliberately. cut-sounds.mjs renders only entries
 * whose source file is present and lists the rest, so this pipeline lands complete
 * and inert: dropping in a recording and adding four lines is the whole job, and
 * until then every cue keeps the synthesised clip it ships with today.
 */
export const CUTS = {
  // ── worked example, kept as documentation ──────────────────────────────────
  //
  // This is the shape, with the numbers that suit this app: a short excerpt, the
  // room taken off the bottom, the hiss off the top, 44.1 kHz because a clasp is
  // all transient, and a peak below 1 so it sits under the pitched cues rather
  // than over them.
  //
  // keep: {
  //   src: 'clasp-01.wav',
  //   in: 0.042, out: 0.310,
  //   hp: 180, lp: 9000,
  //   rate: HI,
  //   gain: 0.62,
  //   fade: { in: 0.001, out: 0.030 },
  // },
};

/** Which cues are sampled vs synthesised, so the validator can say so out loud. */
export const SAMPLED = Object.keys(CUTS);
export const PITCHED = ['right-1', 'right-2', 'right-3', 'tick-1', 'tick-2', 'tick-3',
  'reward', 'badge', 'rankup'];

export { HI, LO };
