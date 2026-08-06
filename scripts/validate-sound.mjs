// ─────────────────────────────────────────────────────────────────────────────
// THE SOUND SET, CHECKED WITHOUT LISTENING TO IT.
//
// I cannot hear these files, and neither can a build server. Everything that can
// be established by measurement is established here instead, and the checks are
// chosen for the failures that would actually reach a reader:
//
//   1. a clip that clicks, clips, or is silent — the defects that make an app
//      sound broken rather than sound wrong
//   2. a pitched clip that does not contain the note it was written from, which
//      is how a "rising triad" quietly becomes three copies of one note
//   3. a mix where the thing that fires ten times a minute is louder than the
//      thing that fires once a lesson
//   4. A FOOTSTEP THAT DOES NOT LAND ON THE FOOT. This is the one worth having.
//      It does NOT re-derive footfalls.ts's formula — that would only prove the
//      formula equals itself. It samples the pose `travelStance` actually returns,
//      frame by frame, finds every moment a foot arrives on the ground, and asks
//      whether the scheduled times are among them.
//   5. a cue declared in one file and forgotten in another — no source, no
//      throttle, or no haptic decision
//
//   node scripts/validate-sound.mjs
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOUND = path.join(ROOT, 'assets', 'sound');

let fails = 0;
const ok = (name, cond, extra = '') => {
  if (cond) console.log(`  ok    ${name}${extra ? `  ${extra}` : ''}`);
  else { fails++; console.log(`  FAIL  ${name}${extra ? `  ${extra}` : ''}`); }
};
const head = (s) => console.log(`\n${s}\n`);

// ── load the TypeScript the app actually runs ────────────────────────────────
const ts = (await import('typescript')).default;
function loadTS(rel, requireShim = () => ({})) {
  const src = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  const js = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const exports = {};
  new Function('exports', 'require', js)(exports, requireShim);
  return exports;
}
// rig.ts has ZERO imports, which is the property that makes this possible at all.
// The hiss measure is imported rather than re-implemented, so this check and the
// sound lab can never disagree about what a bush sound is.
const { hiss: hissOf, doubling } = await import('./lib/dsp.mjs');
const rig = loadTS('components/lesson/cinematic/rig.ts');
const foot = loadTS('components/lesson/cinematic/footfalls.ts', () => rig);

// ── 1. every clip is a well-formed, click-free WAV ───────────────────────────
head('every clip is a clean WAV');

function readWav(file) {
  const b = fs.readFileSync(file);
  const tag = b.toString('ascii', 0, 4) + b.toString('ascii', 8, 12);
  const fmt = b.readUInt16LE(20);
  const ch = b.readUInt16LE(22);
  const rate = b.readUInt32LE(24);
  const bits = b.readUInt16LE(34);
  const bytes = b.readUInt32LE(40);
  const n = bytes / 2;
  const x = new Float64Array(n);
  for (let i = 0; i < n; i++) x[i] = b.readInt16LE(44 + i * 2) / 32768;
  return { tag, fmt, ch, rate, bits, bytes, n, x, size: b.length };
}

const files = fs.readdirSync(SOUND).filter((f) => f.endsWith('.wav')).sort();
const clips = {};
let totalKB = 0;

for (const f of files) {
  const w = readWav(path.join(SOUND, f));
  const name = f.replace(/\.wav$/, '');
  clips[name] = w;
  totalKB += w.size / 1024;

  const peak = Math.max(...w.x.map(Math.abs));
  const dc = w.x.reduce((a, v) => a + v, 0) / w.n;
  const rms = (a, b) => {
    let s = 0;
    for (let i = a; i < b; i++) s += w.x[i] * w.x[i];
    return Math.sqrt(s / Math.max(1, b - a));
  };
  const problems = [];
  if (w.tag !== 'RIFFWAVE') problems.push('not a RIFF/WAVE');
  // Two rates are legitimate now — 44.1k where a transient needs the headroom,
  // 22.05k for the struck tones. Anything else is a mistake.
  if (w.fmt !== 1 || w.ch !== 1 || (w.rate !== 22050 && w.rate !== 44100) || w.bits !== 16) {
    problems.push(`format ${w.ch}ch ${w.rate}/${w.bits} fmt${w.fmt}`);
  }
  if (44 + w.bytes !== w.size) problems.push('declared length ≠ file length');
  if (peak < 0.05) problems.push(`silent (peak ${peak.toFixed(3)})`);
  if (peak > 0.99) problems.push(`clips (peak ${peak.toFixed(3)})`);
  if (Math.abs(dc) > 0.01) problems.push(`DC offset ${dc.toFixed(4)}`);
  // A clip that starts or ends away from zero pops on every play.
  if (Math.abs(w.x[0]) > 0.002) problems.push(`starts at ${w.x[0].toFixed(4)}`);
  if (Math.abs(w.x[w.n - 1]) > 0.002) problems.push(`ends at ${w.x[w.n - 1].toFixed(4)}`);
  // Everything in this set is a struck or brushed sound; none of them sustain.
  if (rms(Math.floor(w.n * 0.9), w.n) > rms(0, Math.floor(w.n * 0.5))) problems.push('does not decay');

  ok(name.padEnd(8), problems.length === 0,
    problems.length ? problems.join(' · ')
      : `${String((w.n / w.rate * 1000).toFixed(0)).padStart(4)}ms  ${(w.rate / 1000).toFixed(1)}kHz  peak ${peak.toFixed(2)}`);
}
// Counted against what the player asks for rather than against a number typed in
// here, which would go stale on the next clip added and quietly stop checking.
ok('the set on disk is the set the app loads', files.length > 0,
  `${files.length} files · ${totalKB.toFixed(1)} KB`);

// ── 2. the pitched clips contain the notes they were written from ────────────
head('the notes are the notes (Goertzel)');

function power(x, f, rate = 22050, from = 0, to = x.length) {
  const k = 2 * Math.cos((2 * Math.PI * f) / rate);
  let s1 = 0, s2 = 0;
  for (let i = from; i < to; i++) { const s0 = x[i] + k * s1 - s2; s2 = s1; s1 = s0; }
  return s1 * s1 + s2 * s2 - k * s1 * s2;
}
const N = { D4: 293.66, D5: 587.33, Fs5: 739.99, A5: 880.0, D6: 1174.66, Fs6: 1479.98, A6: 1760.0 };
// A control a tritone away — inside the clip's band, but not a note it was built
// from. Comparing to it is what separates "the note is present" from "there is
// broadband energy everywhere, including there".
const OFF = (f) => f * Math.SQRT2;

// Uses the CLIP'S OWN rate. The ticks moved to 44.1 kHz and this defaulted to
// 22.05, which would have hunted for every note an octave out and quietly reported
// that a pure D6 sine was not a D6.
function hasNote(clip, f, ratio = 20) {
  const { x, rate } = clips[clip];
  const p = power(x, f, rate);
  const q = power(x, OFF(f), rate);
  return { pass: p > q * ratio, ratio: q > 0 ? p / q : Infinity };
}
for (const [clip, note, label] of [
  ['right-1', N.D5, 'D5'], ['right-2', N.Fs5, 'F#5'], ['right-3', N.A5, 'A5'],
  ['tick-1', N.D6, 'D6'], ['tick-2', N.Fs6, 'F#6'], ['tick-3', N.A6, 'A6'],
  ['badge', N.D4, 'D4'], ['reward', N.D5, 'D5'],
]) {
  const r = hasNote(clip, note);
  ok(`${clip} is ${label}`, r.pass, `${r.ratio.toFixed(0)}× the off-note control`);
}
for (const [note, label] of [[N.D5, 'D5'], [N.Fs5, 'F#5'], [N.A5, 'A5'], [N.D6, 'D6']]) {
  const r = hasNote('rankup', label === 'D6' ? note : note, 8);
  ok(`rankup contains ${label}`, r.pass, `${r.ratio.toFixed(0)}×`);
}

// The triads must actually CLIMB — three files that all sound the same note is
// the exact way this feature fails silently.
const dominant = (clip, cands) => {
  const { x, rate } = clips[clip];
  return cands.reduce((best, f) => (power(x, f, rate) > power(x, best, rate) ? f : best), cands[0]);
};
const tri = [N.D5, N.Fs5, N.A5];
const triHi = [N.D6, N.Fs6, N.A6];
const rightRun = ['right-1', 'right-2', 'right-3'].map((c) => dominant(c, tri));
const tickRun = ['tick-1', 'tick-2', 'tick-3'].map((c) => dominant(c, triHi));
ok('a run of right answers climbs', rightRun[0] < rightRun[1] && rightRun[1] < rightRun[2],
  rightRun.map((f) => f.toFixed(0)).join(' → ') + ' Hz');
ok('the XP counter climbs', tickRun[0] < tickRun[1] && tickRun[1] < tickRun[2],
  tickRun.map((f) => f.toFixed(0)).join(' → ') + ' Hz');

// ── 3. the mix is ordered by how often a thing fires ─────────────────────────
head('the mix: frequent is quiet, rare is loud');
const pk = (c) => Math.max(...clips[c].x.map(Math.abs));
const order = [
  ['tick-1', 'keep'], ['keep', 'right-1'],
  // The three gestures sit with the world sounds, under everything earned.
  ['whoosh-1', 'right-1'], ['whoosh-2', 'right-1'], ['whoosh-3', 'right-1'],
  ['rethink', 'right-1'], ['right-1', 'impact'], ['impact', 'badge'], ['badge', 'rankup'],
  // A walk ending is a shift of weight, not another footfall. If it ever gets as
  // loud as a stride it stops being an arrival and becomes a stumble.
  ['whoosh-1', 'step-a'],
];
for (const [quiet, loud] of order) {
  ok(`${quiet} is quieter than ${loud}`, pk(quiet) < pk(loud),
    `${pk(quiet).toFixed(2)} < ${pk(loud).toFixed(2)}`);
}
ok('a wrong answer is quieter than a right one', pk('rethink') < pk('right-1'),
  `${pk('rethink').toFixed(2)} vs ${pk('right-1').toFixed(2)}`);
ok('the world stays under the notes',
  Math.max(pk('step-a'), pk('step-b'), pk('whoosh-1')) < pk('right-1'));

// ── 3a2. THE CLIPS SOUND LIKE THE MATERIAL THEY CLAIM TO BE ──────────────────
//
// "Sounds cheap" is not measurable, but two of its causes are, and both were
// present in the first set.
//
// A LEATHER HEEL is mostly edge — its character lives between 4 and 9 kHz. The
// original footfall was low-passed noise in a 22.05 kHz file, so it had nothing up
// there at all and could only ever read as a dull bump.
//
// A PREMIUM UI TAP is the opposite: warm body, no hiss. The original was
// high-passed noise, which is the spectrum of static.
//
// So each is checked for the top-end content its material implies, and the two
// must come out on OPPOSITE sides of the same measurement.
head('the materials measure like their materials');

// MEASURED OVER THE ATTACK, not the whole clip. A heel click lasts a few
// milliseconds and the floor answering it rings for forty, so averaging across the
// file reports the floor and says nothing about the shoe. The first 20ms is where
// an ear decides what a percussive sound is made of.
const ATTACK = 0.020;

function bandEnergy(clip, lo, hi) {
  const { x, rate } = clips[clip];
  const to = Math.min(x.length, Math.round(ATTACK * rate));
  let sum = 0;
  const N = 24;
  for (let k = 0; k < N; k++) {
    const f = lo * Math.pow(hi / lo, k / (N - 1));
    if (f >= rate / 2) break;
    sum += Math.abs(power(x, f, rate, 0, to));
  }
  return sum;
}
function brightness(clip) {
  const low = bandEnergy(clip, 200, 3500);
  const high = bandEnergy(clip, 4000, 10000);
  return high / (low + high || 1);
}

// The reference used to be the button tap, which no longer exists. `rethink` is
// the right replacement and arguably the better one: a struck, damped wooden body
// is the app's darkest percussive sound, so the two still bracket the range.
const shoe = brightness('step-a');
const dull = brightness('rethink');
ok('a dress-shoe heel has real top end', shoe > 0.08,
  `${(shoe * 100).toFixed(1)}% of its energy is above 4 kHz — the leather on the floor`);
ok('a damped wooden knock has almost none', dull < 0.05,
  `${(dull * 100).toFixed(1)}% above 4 kHz — body rather than edge`);
ok('and they sit on opposite sides of that line', shoe > dull * 3,
  `shoe ${(shoe * 100).toFixed(1)}% vs knock ${(dull * 100).toFixed(1)}%`);

// The top end can only exist if the file has room for it. A 22.05 kHz clip is
// capped at 11 kHz, which is where the whole set used to be.
const percussive = ['step-a', 'step-b', 'keep',
  'tick-1', 'rethink', 'impact', 'whoosh-1', 'whoosh-2', 'whoosh-3'];
ok('every clip with a transient is 44.1 kHz',
  percussive.every((c) => clips[c].rate === 44100),
  percussive.filter((c) => clips[c].rate !== 44100).join(', ') || `${percussive.length} clips`);
ok('the struck tones stay at 22.05 kHz', ['reward', 'rankup', 'badge', 'right-1'].every((c) => clips[c].rate === 22050),
  'their highest partial is a third of the way to that ceiling — the bytes would buy nothing');

// ── 3a3. NO CLIP MAY HISS ────────────────────────────────────────────────────
//
// The single most disliked thing in this feature, reported three separate times
// and described each time as "that bush sound". It was never one clip — it was a
// SHAPE that several clips shared, and hunting them one at a time by ear (which I
// cannot do) missed two of them twice.
//
// The shape is: noise-like energy that SUSTAINS. A transient made of noise is an
// impact and reads as one — the dress-shoe heel is almost entirely noise and is
// the sound the reader likes best. Noise that hangs on after the attack, with no
// impact at its front, is hiss: shhh, wind, a bush.
//
// So it is measured as two things multiplied:
//
//   · how much energy survives past the first 40ms, and
//   · SPECTRAL FLATNESS of that surviving part — the geometric mean of the band
//     powers over their arithmetic mean, which is ~1 for white noise and near 0
//     for anything with a pitch.
//
// Flatness alone is the discriminator, and on the current 256-band measure it
// separates the set completely:
//
//     old swish   0.474   pure noise swell — deleted
//     old settle  0.222   the scuff at the end of every walk — rebuilt without noise
//     keep        0.107   the loudest survivor, and it is a clasp
//     tap         0.027
//     step-a      0.012   the footfall the reader likes. All attack, no tail.
//
// 0.15 is the line: above everything shipped, well below either thing removed. A
// new clip that hisses fails the build instead of shipping.
//
// RESOLUTION MATTERS AND THE FIRST VERSION HAD TOO LITTLE — see dsp.mjs. At 28
// bands a music box scored 0.230 for having five partials the sweep could not
// resolve between, and a 96 Hz thud scored 0.112 for sitting entirely below the
// measurement floor. Both are artifacts; both are gone at 256 bands from 80 Hz.
head('nothing in the set hisses');

const lateFlatness = (clip) => ({ flat: hissOf(clips[clip].x, clips[clip].rate) });

const HISS = 0.15;
let worstHiss = 0, worstHissName = '';
for (const name of Object.keys(clips)) {
  const { flat } = lateFlatness(name);
  if (flat > worstHiss) { worstHiss = flat; worstHissName = name; }
}
ok('no clip sustains noise past its attack', worstHiss < HISS,
  `worst is ${worstHissName} at flatness ${worstHiss.toFixed(3)} (limit ${HISS}) — the removed swish scored 0.474`);
// A FOOTSTEP MUST BE ONE IMPACT. Reported as "an unnatural double sound, it
// doesn't sound like walking", and it had three separate causes before it went
// away — reverb taps reading as flutter, a forefoot modelled as a strike, and two
// modes beating. Calibrated on the shipped shoe (0.00) against that same shoe
// played twice 42ms apart (0.94).
for (const c of ['step-a', 'step-b']) {
  const d = doubling(clips[c].x);
  ok(`${c} is a single impact`, d < 0.45, `double ${d.toFixed(2)} — a deliberate flam scores 0.94`);
}
const shoeFlat = lateFlatness('step-a').flat;
ok('and the footfall is all attack, which is why it works', shoeFlat < 0.03,
  `flatness ${shoeFlat.toFixed(3)} after 40ms — the noise in it is the heel, not a tail`);

// ── 3b. THE APP CAN ACTUALLY BE HEARD ────────────────────────────────────────
//
// This exists because the entire feature shipped inaudible.
//
// `setAudioModeAsync({ playsInSilentMode: false })` looked like good manners — a
// phone on silent stays silent. On Android it is not good manners, it is an off
// switch: expo-audio suppresses playback when the ringer is silent OR VIBRATE, and
// vibrate is simply where a great many phones live all day. Ringer mode governs
// ringtones; the media stream is separate, which is why every other app keeps
// playing. The symptom was total and gave nothing away — haptics fired normally,
// so everything looked wired, and not one sound came out.
//
// No measurement of a WAV file could have caught it. So the setting is asserted.
head('nothing in the audio mode can silence the app');
const realSrc0 = fs.readFileSync(path.join(ROOT, 'lib/sound/real.ts'), 'utf8');
ok('playsInSilentMode is true', /playsInSilentMode:\s*true/.test(realSrc0),
  'false suppresses ALL playback on an Android phone set to vibrate');
ok('the app never takes audio focus', /interruptionMode:\s*'mixWithOthers'/.test(realSrc0),
  'someone reading philosophy on a bus is probably playing music');
ok('nothing plays in the background', /shouldPlayInBackground:\s*false/.test(realSrc0));

// AND NOTHING SOUNDS THAT THE READER DID NOT DO.
//
// `onPressIn` fires the instant a finger lands, before Android has decided whether
// the gesture is a tap or a scroll. Every button in the app goes through
// PressableScale and most of them live in scrolling lists, so with the cue on
// press-in a flick down the branch list or past the Home actions fired a tap off
// every card the thumb crossed — with nothing pressed. The sound is on `onPress`,
// which only fires for a movement the system has ruled a tap, and it must stay
// there. This is asserted rather than trusted because the symptom appears only on
// a device, under a finger, while scrolling.
const pressSrc = fs.readFileSync(path.join(ROOT, 'components/shared/PressableScale.tsx'), 'utf8');
// Still worth asserting now the sound is gone, because the HAPTIC is not: a buzz
// off every card a thumb crosses while scrolling is the same defect wearing a
// different coat, and it would be harder to notice.
ok('the button feedback fires on onPress, never onPressIn',
  /onPress=\{onPress && \(\(e\) => \{[^}]*touch\(\)/.test(pressSrc)
    && !/onPressIn=\{[^}]*(cue|touch)\(/.test(pressSrc),
  'press-in fires during a scroll, and neither a sound nor a buzz can be taken back');

// ── 4a. THE FOOT-LOCK ────────────────────────────────────────────────────────
//
// Not strictly a sound check, but it is the ground everything below stands on: a
// footfall can only be placed correctly if the foot is somewhere definite when it
// is down. And the defect this catches was found BY the footfall work, went
// unnoticed for 102 lessons, and is one character wide.
//
// The invariant: while `footTarget` reports a foot planted, that foot's position
// IN THE WORLD must not move. Over one stance the foot's local x travels −S while
// the body advances +S, so the two cancel exactly — provided `strideStance` walks
// the same distance the scene moves the body. Easing `tr` twice broke that and the
// foot slid.
//
// Tested against `tr` directly rather than through any scene's clock, so it holds
// for every easing any scene could use.
head('a planted foot does not move (the foot-lock)');

function maxSlide(x0, x1) {
  const dir = Math.sign(x1 - x0) || 1;
  const runs = { L: null, R: null };
  let slide = 0;
  const STEPS = 8000;
  for (let i = 0; i <= STEPS; i++) {
    // Only up to the arrival blend: past 0.78 the pose is deliberately being
    // mixed into the standing gesture, and the feet are meant to move.
    const tr = (i / STEPS) * 0.78;
    const s = rig.strideStance(x0, x1, rig.emoteHold(0, 0), tr, rig.WALK);
    const bodyX = x0 + (x1 - x0) * tr;
    for (const [k, f] of [['L', s.footL], ['R', s.footR]]) {
      // PLANTED MEANS y IS EXACTLY ZERO, not "close to zero". `footTarget`'s stance
      // arc returns a literal 0 and its swing arc returns −lift·sin(πs), so the two
      // are distinguishable without a threshold — and a threshold is wrong here. A
      // 2%-of-lift window also catches the first and last sliver of the SWING, where
      // the foot is legitimately travelling fast, and reports 0.28 units of "slide"
      // that is really just the arc passing through the window. That false reading
      // is what nearly hid the fact that the real figure is now machine zero.
      if (f.y !== 0) { runs[k] = null; continue; }
      const wx = bodyX + f.x * dir;
      if (runs[k] === null) runs[k] = { min: wx, max: wx };
      runs[k].min = Math.min(runs[k].min, wx);
      runs[k].max = Math.max(runs[k].max, wx);
      slide = Math.max(slide, runs[k].max - runs[k].min);
    }
  }
  return slide;
}

// Journeys across the range the lessons actually stage, in both directions.
let worstSlide = 0, worstAt = '';
for (const [x0, x1] of [[90, 170], [170, 300], [300, 170], [170, 90], [40, 360], [360, 40],
  [150, 158], [200, 120], [60, 330], [330, 60], [100, 105], [220, 90]]) {
  const slide = maxSlide(x0, x1);
  if (slide > worstSlide) { worstSlide = slide; worstAt = `${x0}→${x1}`; }
}
// Floating-point dust, nothing else. It was 19.6 — 58% of a 34-unit stride.
ok('a planted foot stays put across every staged journey', worstSlide < 1e-9,
  `worst ${worstSlide.toExponential(1)} stage units (at ${worstAt}) · was 19.6 before the rig fix`);

// And the reason it holds: the rig must not re-ease a tr the scene already eased.
const rigSrc = fs.readFileSync(path.join(ROOT, 'components/lesson/cinematic/rig.ts'), 'utf8');
const footSrc = fs.readFileSync(path.join(ROOT, 'components/lesson/cinematic/footfalls.ts'), 'utf8');
ok('strideStance walks span·tr, not span·ease01(tr)',
  /const traveled = span \* tr \+ seed \* 11;/.test(rigSrc),
  'the one expression that put the feet on a different curve from the body');
// footfalls.ts hard-codes where the arrival blend starts. If the rig ever moves it,
// the stride/settle split silently lands in the wrong place.
ok('footfalls.ts agrees with the rig on where the arrival begins',
  /\(tr - 0\.78\) \/ 0\.22/.test(rigSrc) && /ARRIVE_FROM = 0\.78/.test(footSrc),
  'tr 0.78 in both');

// ── 4b. THE FOOTSTEPS LAND ON THE FEET ───────────────────────────────────────
head('the footsteps land on the feet');

// The lesson under trial, and its x track — read out of the script rather than
// retyped, so the check follows the lesson if the staging changes.
const scriptSrc = fs.readFileSync(path.join(ROOT, 'components/lesson/cinematic/ethics7Script.ts'), 'utf8');
const X = [...scriptSrc.matchAll(/^\s*p:\s*-?\d+,\s*x:\s*(-?\d+)/gm)].map((m) => Number(m[1]));
// The final summary beat declares no p/x — it holds the previous position.
while (X.length < (scriptSrc.match(/^\s*\{$/gm) || []).length) X.push(X[X.length - 1]);
ok('read the x track out of the script', X.length >= 9, `x = ${X.join(' → ')}`);

const P = [...scriptSrc.matchAll(/^\s*p:\s*(-?\d+)/gm)].map((m) => Number(m[1]));
while (P.length < X.length) P.push(0);

/**
 * Sample what the scene will DRAW, and report every moment a foot arrives on the
 * ground. This is the independent measurement — it goes through `travelStance`,
 * including the arrival blend into the settled gesture, which is a stage the
 * formula in footfalls.ts knows nothing about.
 *
 * `clock0` matters. The settled gesture a walk blends into is ALIVE: it drifts
 * with the app's free-running clock, so the same journey played at a different
 * moment in the app's life puts its last foot down somewhere slightly else. One
 * sample would therefore pass or fail by luck, which is why the caller sweeps it.
 */
function measuredTouchdowns(x0, x1, clock0, hz = 500) {
  const dur = rig.moveTr(x0, x1, 0.85);
  const g = rig.gaitVary(rig.WALK, x0 * 0.37 + x1 * 0.11);
  const state = { L: { up: false }, R: { up: false } };
  const hits = [];
  for (let i = 0; i <= dur * hz; i++) {
    const bt = i / hz;
    const t = clock0 + bt;
    const tr = rig.ease01(bt / dur);     // exactly what the scene computes
    const s = rig.travelStance(
      x0, x1,
      rig.emoteHold(0, t), rig.emoteHold(0, t), rig.emoteLive(0, t, bt),
      tr, rig.WALK,
    );
    for (const [key, f] of [['L', s.footL], ['R', s.footR]]) {
      // Lifted = clearly off the ground for this gait; landed = back on it.
      if (f.y < -0.25 * g.lift) state[key].up = true;
      else if (state[key].up && f.y >= -0.02 * g.lift) { state[key].up = false; hits.push(bt); }
    }
  }
  return { hits: hits.sort((a, b) => a - b), dur };
}

/**
 * 30ms, and it has to hold in EVERY idle clock, not on average.
 *
 * A footfall outside the arrival blend agrees with the drawn pose to a millisecond
 * — they come from the same three constants, so they had better. The margin is for
 * the 500Hz sampling above, nothing else. Anything approaching a frame means the
 * two have come apart.
 */
const TOL = 0.03;
const CLOCKS = 24;   // idle-clock positions swept per walk

let worstStep = 0;
let stepsChecked = 0;
let stepsDrawn = 0;
const rows = [];
const settleRows = [];
for (let i = 1; i < X.length; i++) {
  const x0 = X[i - 1], x1 = X[i];
  const f = foot.footfallTimes(x0, x1);
  if (Math.abs(x1 - x0) <= 1) {
    ok(`beat ${i}  ${x0} → ${x1}`, f.steps.length === 0 && f.settle < 0, 'stands still, no footfalls');
    continue;
  }
  // Sweep the idle clock; a step must be drawn in ALL of them.
  let worst = 0;
  let dur = 0;
  const settleGaps = [];
  for (let c = 0; c < CLOCKS; c++) {
    const m = measuredTouchdowns(x0, x1, c * 3.11);
    dur = m.dur;
    for (const p of f.steps) worst = Math.max(worst, Math.min(...m.hits.map((h) => Math.abs(h - p))));
    settleGaps.push(Math.min(...m.hits.map((h) => Math.abs(h - f.settle))));
  }
  stepsChecked += f.steps.length;
  stepsDrawn += worst < TOL ? f.steps.length : 0;
  worstStep = Math.max(worstStep, worst);
  rows.push({ i, span: Math.abs(x1 - x0), dur, steps: f.steps.length, cadence: f.steps.length / dur });
  settleGaps.sort((a, b) => a - b);
  const med = settleGaps[Math.floor(CLOCKS / 2)];
  // THE SETTLE IS JUDGED ON A DIFFERENT CLAIM, because it makes a different one.
  //
  // A stride thud says "a foot hit the ground HERE" and is held to a millisecond in
  // every clock. The settle only says "this walk is ending", and it is deliberately
  // transient-free so there is no edge for the eye to line up against. So it is
  // tested on the two things it actually asserts: that it falls in the closing
  // stretch of the transition, and that in a TYPICAL clock it is near where a foot
  // really goes down. Median, not worst — in roughly one clock in twenty there is
  // no discrete touchdown to be near, because the blend lowers the last foot
  // continuously instead of completing its swing. That is precisely why a footfall
  // was the wrong sound here and a weight shift is the right one.
  //
  // How far INTO the blend it lands is reported but not asserted: it ranges from
  // 26% to 100% depending on whether the gait had a stride left over, and both ends
  // of that range place the sound within a few ms of a drawn touchdown.
  const trAtSettle = rig.ease01(f.settle / dur);
  const arriveAt = Math.max(0, Math.min(1, (trAtSettle - 0.78) / 0.22));
  settleRows.push({ i, at: f.settle, dur, arrive: arriveAt, med });
  ok(`beat ${i}  ${String(x0).padStart(3)} → ${String(x1).padStart(3)}`,
    worst < TOL,
    `${f.steps.length} strides, worst ${(worst * 1000).toFixed(0)}ms off in ${CLOCKS} idle clocks`);
}
ok('NO FOOTSTEP SOUNDS WITHOUT A FOOT — in every idle clock', stepsDrawn === stepsChecked,
  `${stepsDrawn}/${stepsChecked} strides land on a drawn touchdown · worst ${(worstStep * 1000).toFixed(0)}ms`);

head('and every walk comes to rest audibly');
for (const r of settleRows) {
  ok(`beat ${r.i}  settle at ${r.at.toFixed(2)}s of ${r.dur.toFixed(2)}s`,
    r.at >= r.dur * 0.6 && r.at <= r.dur + 1e-9 && r.med < 0.08,
    `${(r.at / r.dur * 100).toFixed(0)}% through the walk · ${(r.arrive * 100).toFixed(0)}% into the blend`
    + ` · median ${(r.med * 1000).toFixed(0)}ms from a drawn touchdown`);
}

head('and the walk is a human one');
for (const r of rows) {
  ok(`beat ${r.i}  ${r.span} units in ${r.dur.toFixed(2)}s`,
    r.cadence > 1.0 && r.cadence < 3.6,
    `${r.steps} strides · ${r.cadence.toFixed(2)}/sec average`);
}

// ── 5. no cue is declared in one file and forgotten in another ───────────────
head('every cue is wired everywhere it has to be');
const typesSrc = fs.readFileSync(path.join(ROOT, 'lib/sound/types.ts'), 'utf8');
const realSrc = fs.readFileSync(path.join(ROOT, 'lib/sound/real.ts'), 'utf8');
const fbSrc = fs.readFileSync(path.join(ROOT, 'lib/feedback.ts'), 'utf8');

const cues = [...typesSrc.matchAll(/^\s*\|\s*'([a-z]+)'/gm)].map((m) => m[1]);
ok('the Cue union parsed', cues.length >= 10, cues.join(' · '));

const throttle = realSrc.slice(realSrc.indexOf('const THROTTLE'), realSrc.indexOf('const lastAt'));
const haptic = fbSrc.slice(fbSrc.indexOf('const HAPTIC'), fbSrc.indexOf('/** Read once per call'));
const sources = realSrc.slice(realSrc.indexOf('const SOURCES'), realSrc.indexOf('const RIGHT'));

for (const c of cues) {
  const inThrottle = new RegExp(`\\b${c}\\s*:`).test(throttle);
  const inHaptic = new RegExp(`\\b${c}\\s*:`).test(haptic);
  const missing = [];
  if (!inThrottle) missing.push('no throttle');
  if (!inHaptic) missing.push('no haptic decision');
  ok(`'${c}'`, missing.length === 0, missing.join(' · '));
}
// Every file the player asks for must be on disk, and nothing on disk unused.
const wanted = [...sources.matchAll(/assets\/sound\/([a-z0-9-]+)\.wav/g)].map((m) => m[1]).sort();
const onDisk = files.map((f) => f.replace(/\.wav$/, '')).sort();
ok('every required clip exists', wanted.every((w) => onDisk.includes(w)),
  wanted.filter((w) => !onDisk.includes(w)).join(', ') || `${wanted.length} required`);
ok('no clip on disk is unused', onDisk.every((d) => wanted.includes(d)),
  onDisk.filter((d) => !wanted.includes(d)).join(', ') || 'none orphaned');

// The trial gate must name a lesson that exists and is actually wired cinematic.
const gateSrc = fs.readFileSync(path.join(ROOT, 'components/lesson/cinematic/lessonSound.ts'), 'utf8');
const trial = [...gateSrc.matchAll(/'([a-z0-9-]+)',\s*\/\//g)].map((m) => m[1]);
const routeSrc = fs.readFileSync(
  path.join(ROOT, 'app/(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId].tsx'), 'utf8');
// Anchored to a statement, not just the characters: the file's own instructions
// for rolling out say the words "return true", and matching those made the check
// report the trial as rolled out while it was still gated to one lesson.
const wideOpen = /^\s*return true;\s*$/m.test(gateSrc);
ok('the trial names lessons that are wired cinematic', wideOpen || trial.every((id) => routeSrc.includes(id)),
  wideOpen ? 'rolled out to every lesson' : `trial: ${trial.join(', ')}`);

console.log(fails ? `\n${fails} failing.\n` : '\nall clear.\n');
process.exit(fails ? 1 : 0);
