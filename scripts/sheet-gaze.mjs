// HOW FAR THE LOOK ACTUALLY MOVES THE FIGURE.
//
//   node --import ./scripts/lib/register.mjs scripts/sheet-gaze.mjs
//
// N12 is the reason this exists: "a head move is not a move". `U.head` is 16, so
// a neck angle pivots the head centre about five units against a head forty
// across, and the rule book records three of moves.ts's four "looking" actions
// drawing a figure standing perfectly still. This figure has no face, so a turned
// head on a plain disc is invisible from the side — the only way a look reads is
// if the SPINE carries it.
//
// `lookPose` therefore adds a lean taken from how far the neck turned. This
// prints what that is worth, in stage units, on the real rig — no browser, the
// same zero-import property that lets check:smooth replay 130 lessons offline.
import { stand, solve } from '../components/lesson/cinematic/rig.ts';
import { gazeAt } from '../components/lesson/cinematic/moves.ts';

const GROUND = 500;
const K = 1;
const DIR = 1;
/** The same factor lookPose uses. */
const LEAN = 0.5;

const place = (s, x) => solve({
  x, groundY: GROUND, k: K, dir: DIR, tilt: s.tilt, neck: s.neck, bob: s.bob,
  footL: s.footL, footR: s.footR, fistL: s.fistL, fistR: s.fistR,
});

const cases = [
  ['standing under it, looking up  (x 200 → 180, 288)', 200, 180, 288],
  ['stage left, looking up and right (x 132 → 181, 294)', 132, 181, 294],
  ['stage right, looking up and back (x 268 → 180, 288)', 268, 180, 288],
  ['something at his own height     (x 200 → 300, 450)', 200, 300, 450],
];

const j0 = place(stand(0), 200);
console.log('\nsolve() returns:', Object.keys(j0).join(' '), '\n');

for (const [label, x, tx, ty] of cases) {
  const s = stand(0);
  const g = gazeAt(s, x, GROUND, K, DIR, tx, ty, 1);
  const lean = (g.neck - s.neck) * LEAN;
  const a = place(s, x);
  const b = place(g, x);
  const c = place({ ...g, tilt: g.tilt + lean }, x);
  const pick = (j) => j.head ?? j.headC ?? j.neck ?? j.chest ?? null;
  const d = (p, q) => (p && q ? Math.hypot(p.x - q.x, p.y - q.y).toFixed(1) : '?');
  console.log(label);
  console.log(`    neck ${s.neck.toFixed(3)} → ${g.neck.toFixed(3)}   spine lean ${lean.toFixed(3)} rad`);
  console.log(`    head moves:  neck alone ${d(pick(a), pick(b))}   with the spine ${d(pick(a), pick(c))}`);
}
console.log('');
