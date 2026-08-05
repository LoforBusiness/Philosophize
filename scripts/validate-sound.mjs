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
  if (w.fmt !== 1 || w.ch !== 1 || w.rate !== 22050 || w.bits !== 16) {
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
      : `${String((w.n / 22050 * 1000).toFixed(0)).padStart(4)}ms  peak ${peak.toFixed(2)}`);
}
ok('the set is 16 clips', files.length === 16, `${files.length} files · ${totalKB.toFixed(1)} KB`);

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

function hasNote(clip, f, ratio = 20) {
  const x = clips[clip].x;
  const p = power(x, f);
  const q = power(x, OFF(f));
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
const dominant = (clip, cands) =>
  cands.reduce((best, f) => (power(clips[clip].x, f) > power(clips[clip].x, best) ? f : best), cands[0]);
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
  ['tick-1', 'page'], ['page', 'tap'], ['tap', 'keep'], ['keep', 'right-1'],
  ['rethink', 'right-1'], ['right-1', 'badge'], ['badge', 'rankup'],
];
for (const [quiet, loud] of order) {
  ok(`${quiet} is quieter than ${loud}`, pk(quiet) < pk(loud),
    `${pk(quiet).toFixed(2)} < ${pk(loud).toFixed(2)}`);
}
ok('a wrong answer is quieter than a right one', pk('rethink') < pk('right-1'),
  `${pk('rethink').toFixed(2)} vs ${pk('right-1').toFixed(2)}`);
ok('the three footfall-adjacent world sounds stay under the notes',
  Math.max(pk('step-a'), pk('step-b'), pk('swish')) < pk('right-1'));

// ── 4. THE FOOTSTEPS LAND ON THE FEET ────────────────────────────────────────
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
 */
function measuredTouchdowns(x0, x1, clock0) {
  const span = Math.abs(x1 - x0);
  const dur = rig.moveTr(x0, x1, 0.85);
  const g = rig.gaitVary(rig.WALK, x0 * 0.37 + x1 * 0.11);
  const HZ = 1000;                       // far finer than a frame, so the crossing is exact
  const lift = g.lift;
  const state = { L: { up: false }, R: { up: false } };
  const hits = [];
  for (let i = 0; i <= dur * HZ; i++) {
    const bt = i / HZ;
    const t = clock0 + bt;
    const tr = rig.ease01(bt / dur);     // exactly what the scene computes
    const s = rig.travelStance(
      x0, x1,
      rig.emoteHold(0, t), rig.emoteHold(0, t), rig.emoteLive(0, t, bt),
      tr, rig.WALK,
    );
    for (const [key, f] of [['L', s.footL], ['R', s.footR]]) {
      // Lifted = clearly off the ground for this gait; landed = back on it.
      if (f.y < -0.25 * lift) state[key].up = true;
      else if (state[key].up && f.y >= -0.02 * lift) { state[key].up = false; hits.push(bt); }
    }
  }
  return { hits: hits.sort((a, b) => a - b), dur, span, halfStride: g.S / (2 * g.stance) };
}

/**
 * The tolerance, and why it is 45ms rather than something tighter.
 *
 * Every footfall away from the arrival agrees with the drawn pose to within 1ms —
 * they come from the same three constants, so they had better. The last one or two
 * of a walk are the exception: `strideStance` spends the final 22% of the
 * transition blending the walking pose into the beat's settled gesture, and that
 * blend pulls a swinging foot down early. There the pure-stride formula is a few
 * frames LATE, which is the harmless direction — audio trailing a picture by 36ms
 * is the sound of standing four metres away, while audio LEADING a picture by the
 * same margin is instantly wrong. Anything beyond 45ms is a bug.
 */
const TOL = 0.045;

let worst = 0;
let matched = 0;
let predictedTotal = 0;
let settles = 0;
const rows = [];
let clock = 0;
for (let i = 1; i < X.length; i++) {
  const x0 = X[i - 1], x1 = X[i];
  const predicted = foot.footfallTimes(x0, x1);
  const m = measuredTouchdowns(x0, x1, clock);
  clock += m.dur + 4;                    // the beat is read before the next tap
  predictedTotal += predicted.length;
  if (Math.abs(x1 - x0) <= 1) {
    ok(`beat ${i}  ${x0} → ${x1}`, predicted.length === 0, 'stands still, no footfalls');
    continue;
  }
  // Pair each scheduled footfall with the nearest drawn touchdown.
  const errs = predicted.map((p) => Math.min(...m.hits.map((h) => Math.abs(h - p))));
  const err = errs.length ? Math.max(...errs) * 1000 : 0;
  if (errs.length) worst = Math.max(worst, err);
  matched += errs.filter((e) => e < TOL).length;
  // Drawn arrivals with no sound. These are the SETTLE, not a step: the blend
  // lowering the last swing foot onto the ground as the figure comes to rest. It
  // appears or does not depending on the free-running idle clock — the same walk
  // at a different moment in the app's life produces a different count — which is
  // the proof that it is a pose change and not a stride, and exactly why it is not
  // something to schedule a thud against.
  const unsounded = m.hits.filter((h) => Math.min(...predicted.map((p) => Math.abs(h - p))) >= TOL);
  settles += unsounded.length;
  // Average over the whole transition, not between the first and last step. The
  // double smoothstep makes the middle of a walk much faster than its ends, so a
  // first-to-last figure reports the sprint and hides the glide.
  const cadence = predicted.length / m.dur;
  rows.push({ i, span: Math.abs(x1 - x0), dur: m.dur, pred: predicted.length, err, cadence });
  ok(`beat ${i}  ${String(x0).padStart(3)} → ${String(x1).padStart(3)}`,
    errs.every((e) => e < TOL),
    `${predicted.length} scheduled · ${m.hits.length} drawn · worst ${err.toFixed(0)}ms off`
    + (unsounded.length ? ` · ${unsounded.length} settle` : ''));
}
ok('NO FOOTSTEP SOUNDS WITHOUT A FOOT', matched === predictedTotal,
  `${matched}/${predictedTotal} land on a drawn touchdown · worst ${worst.toFixed(0)}ms`);
console.log(`  note  ${settles} drawn arrivals are the settle, not a stride — left silent on purpose`);

head('and the walk is a human one');
for (const r of rows) {
  ok(`beat ${r.i}  ${r.span} units in ${r.dur.toFixed(2)}s`,
    r.cadence > 1.2 && r.cadence < 3.6,
    `${r.pred} steps · ${r.cadence.toFixed(2)}/sec average`);
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
