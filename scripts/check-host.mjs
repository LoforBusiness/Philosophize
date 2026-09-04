// ─────────────────────────────────────────────────────────────────────────────
// THE WELCOME HOST, REPLAYED AT 60fps — is the first thing anybody sees smooth?
//
//   npm run check:host
//
// A reader on the finished intro: *"it kinda seems a little clunky and not very
// smooth … especially at the very end when the stick man kinda runs off. hit
// bronze off in a kinda weird way."* Every word of that turned out to be
// measurable, and none of it was visible in the source.
//
// ── WHY THIS CAN RUN OFFLINE ────────────────────────────────────────────────
//
// `hostAtRig` is a pure function of t — deliberately, so the intro can jump its
// own clock after a slow boot — and it is built out of the lesson rig, which is
// pure maths with zero imports. So the whole performance can be stepped frame by
// frame in plain Node, exactly as `check:smooth` steps 130 lessons. No Metro, no
// browser, milliseconds.
//
// ── WHAT IT MEASURES, AND WHAT EACH ONE CAUGHT ──────────────────────────────
//
// 1. PER-FRAME JOINT MOVEMENT, only while he is ON STAGE. The bolt moved an
//    ankle 23.4 units between two frames at 60fps — a smear with a run cycle
//    playing over it — against 9.3 for the march.
//
// 2. THE BODY'S SPEED AND ACCELERATION through each journey. He left six times
//    faster than he arrived (530 stage units a second against 89) and reached it
//    from a standstill in ONE FRAME: 19,096 u/s², which is a teleport.
//
// 3. PLANTED-FOOT SLIDE. `strideStance`'s docstring states the contract — *"the
//    stride follows the body"* — and the exit broke it, handing the stride one
//    fraction of the journey while putting the body at another. A foot the pose
//    called planted slid 10.9 units in a frame.
//
// 4. THAT NOTHING IS COMPLETELY STILL. The settle measured 0.00 units a frame
//    for twenty-two frames: `tr` is clamped, so `strideStance` returned one fixed
//    arrival pose and he simply stopped existing as a living thing between the
//    walk and the turn. Nothing else in the suite could have seen that, because
//    perfect stillness is not a discontinuity — it is the absence of one.
//
// Every figure below is a HIGH-WATER MARK from the state that shipped after the
// rebuild. They may improve; they may not regress.
// ─────────────────────────────────────────────────────────────────────────────
import * as host from '@/components/welcome/hostFigure';
import * as wrig from '@/components/welcome/rig';
import * as lrig from '@/components/lesson/cinematic/rig';

let fails = 0;
const ok = (what, detail = '') => console.log(`  ok    ${what}${detail ? `  ${detail}` : ''}`);
const bad = (what, detail = '') => { fails++; console.log(`  FAIL  ${what}${detail ? `  ${detail}` : ''}`); };

const FPS = 60, DT = 1 / FPS;
const { hostAtRig, K_HOST, FIG_GROUND, X_OFF, X_MARK, X_AWAY } = host;
const {
  T_MARCH, T_STOP, T_TURN, SPEAK_T0, T_EXIT, T_BEAT, T_WINDUP, T_BOLT, T_GONE, T_HOLD, STAGE_W,
} = wrig;

const JOINTS = ['pel', 'chest', 'head', 'shB', 'shL', 'shR', 'hipL', 'hipR',
  'kneeL', 'kneeR', 'ankL', 'ankR', 'elL', 'elR', 'wrL', 'wrR'];

/** He is drawn either side of his pelvis, so this is the band he can be seen in. */
const ON_L = -40, ON_R = STAGE_W + 40;

const frameAt = (t) => {
  const F = hostAtRig(t);
  const s = F.stance;
  return {
    F,
    s,
    j: lrig.solve({
      x: F.x, groundY: FIG_GROUND, k: K_HOST, dir: F.dir,
      tilt: s.tilt, neck: s.neck, bob: s.bob,
      footL: s.footL, footR: s.footR, fistL: s.fistL, fistR: s.fistR,
    }),
  };
};

const PHASES = [
  ['the march on', 0, T_MARCH, 11.0],
  ['the settle', T_MARCH, T_MARCH + T_STOP, 3.0],
  ['the turn', T_MARCH + T_STOP, SPEAK_T0, 8.0],
  ['the talking', SPEAK_T0, T_EXIT, 9.5],
  ['he turns to go', T_EXIT, T_EXIT + T_BEAT, 4.0],
  ['the wind-up', T_EXIT + T_BEAT, T_EXIT + T_BEAT + T_WINDUP, 11.0],
  ['the bolt', T_EXIT + T_BEAT + T_WINDUP, T_GONE, 14.5],
];

const rows = [];
const quiet = [];
let prev = null;
let slide = { v: 0, t: 0 };
for (let t = 0; t <= T_HOLD; t += DT) {
  const cur = frameAt(t);
  if (prev) {
    let worst = 0, which = '';
    for (const n of JOINTS) {
      const d = Math.hypot(cur.j[n].x - prev.j[n].x, cur.j[n].y - prev.j[n].y);
      if (d > worst) { worst = d; which = n; }
    }
    const seen = cur.F.x > ON_L && cur.F.x < ON_R && cur.F.vis > 0;
    rows.push({ t, d: worst, which, seen, v: (cur.F.x - prev.F.x) / DT });
    for (const [ank, foot] of [['ankL', 'footL'], ['ankR', 'footR']]) {
      if (Math.abs(cur.s[foot].y) < 1e-9 && Math.abs(prev.s[foot].y) < 1e-9) {
        const d = Math.abs(cur.j[ank].x - prev.j[ank].x);
        if (seen && d > slide.v) slide = { v: d, t, ank };
      }
    }
  }
  prev = cur;
}

console.log('\nthe host, frame by frame\n');
for (const [name, a, b, cap] of PHASES) {
  const seg = rows.filter((r) => r.t >= a && r.t < b && r.seen);
  if (!seg.length) { bad(`${name}: no visible frames`); continue; }
  const w = seg.reduce((x, y) => (y.d > x.d ? y : x));
  if (w.d <= cap) ok(`${name} never jumps`, `worst ${w.d.toFixed(1)}u (${w.which}) at ${w.t.toFixed(2)}s, cap ${cap}`);
  else bad(`${name} jumps ${w.d.toFixed(1)}u in one frame`, `${w.which} at ${w.t.toFixed(2)}s, cap ${cap}`);
  quiet.push([name, w.d]);
}

// AND NO PHASE MAY BE A STILL IMAGE. See note 4 — perfect stillness is not a
// discontinuity, so every other instrument in the suite is blind to it, and the
// settle sat at exactly 0.00 units a frame for twenty-two frames.
{
  const [name, d] = quiet.reduce((a, b) => (b[1] < a[1] ? b : a));
  if (d > 0.05) ok('and no phase is a still image', `quietest is ${name} at ${d.toFixed(2)}u a frame`);
  else bad(`${name} stops dead`, `${d.toFixed(2)}u a frame — every joint identical, he is a photograph here`);
}

console.log('');
const speedIn = (a, b) => {
  const seg = rows.filter((r) => r.t >= a && r.t <= b);
  const vs = seg.map((r) => Math.abs(r.v));
  let acc = 0;
  for (let i = 1; i < seg.length; i++) acc = Math.max(acc, Math.abs(seg[i].v - seg[i - 1].v) / DT);
  return { peak: Math.max(...vs), acc };
};
const march = speedIn(0, T_MARCH);
const bolt = speedIn(T_EXIT + T_BEAT + T_WINDUP, T_GONE);

// HE MAY LEAVE FASTER THAN HE ARRIVES — that is the gag — but not so much faster
// that the legs stop reading. Four times the march is a sprint; six was a smear.
const ratio = bolt.peak / march.peak;
if (ratio <= 2.6) ok('he leaves faster than he arrives, but not by a blur',
  `bolt peaks ${bolt.peak.toFixed(0)}u/s against the march's ${march.peak.toFixed(0)}u/s — ${ratio.toFixed(1)}x, cap 2.6`);
else bad('the exit is a smear', `${ratio.toFixed(1)}x the march, cap 2.6`);

// AND HE MUST ACCELERATE INTO IT. The launch used to be a single-frame step from
// a dead stop to full speed.
if (bolt.acc <= 4200) ok('and he accelerates into the run rather than teleporting',
  `${bolt.acc.toFixed(0)}u/s² at the launch, cap 4200 — it was 19096`);
else bad('the launch is instantaneous', `${bolt.acc.toFixed(0)}u/s², cap 4200`);

// THE CONTRACT strideStance STATES ABOUT ITSELF.
if (slide.v <= 3.2) ok('a planted foot stays planted',
  `worst ${slide.v.toFixed(2)}u at ${slide.t.toFixed(2)}s (${slide.ank}), cap 3.2 — it was 10.90`);
else bad('a planted foot skates', `${slide.v.toFixed(2)}u at ${slide.t.toFixed(2)}s, cap 3.2`);

// MOST OF THE EXIT MUST HAPPEN WHERE IT CAN BE SEEN. The old one spent 130 of
// its 244 units past the edge of the stage, which is what forced the speed up.
const boltFrames = rows.filter((r) => r.t >= T_EXIT + T_BEAT + T_WINDUP && r.t < T_GONE);
const seenShare = boltFrames.filter((r) => r.seen).length / Math.max(1, boltFrames.length);
if (seenShare >= 0.62) ok('and most of the run happens on screen',
  `${(seenShare * 100).toFixed(0)}% of the bolt's frames are visible, floor 62%`);
else bad('most of the exit happens off screen', `${(seenShare * 100).toFixed(0)}% visible, floor 62%`);

console.log(fails ? `\n${fails} problem(s).\n` : '\nthe host is smooth.\n');
process.exit(fails ? 1 : 0);
