// REST POSES — where the figure is left standing when a beat stops moving.
//
// A beat holds until the reader taps, which can be ten seconds, so the settled
// pose is what they actually stare at. Rule C20 has said since the emoteHold fix
// that every movement must END in a pose a person would still be in — but it was
// only ever enforced by reading the source, and the rule itself warns that
// "checking one gesture library is not checking them all". This is that check,
// done in numbers.
//
// rig.ts is pure maths with zero imports, so sucrase can transpile it and plain
// Node can evaluate the EXACT poses the screen draws. Fists and the head are both
// pelvis-relative, so the comparison is direct.
//
// Three ways a settled hand goes wrong, all of them things a viewer named:
//
//   1. IN THE SKULL    — a fist centred inside the 20-radius head disc has no
//                        visible hand and its forearm ends in the face.
//   2. ABOVE THE CROWN — an arm left aloft. Nobody stands like that for ten
//                        seconds; it is the "frozen mid-gesture" look.
//   3. BEHIND THE HEAD — a hand up behind the skull, where the forearm crosses
//                        the torso and reads as a broken limb.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const REPO = process.cwd();
const { transform } = await import(
  pathToFileURL(path.join(REPO, 'node_modules/sucrase/dist/index.js')).href,
);

const TMP = path.join(os.tmpdir(), 'philosophize-rest-check');
mkdirSync(TMP, { recursive: true });
const src = readFileSync(path.join(REPO, 'components/lesson/cinematic/rig.ts'), 'utf8');
writeFileSync(path.join(TMP, 'rig.mjs'), transform(src, { transforms: ['typescript'] }).code);
const R = await import(pathToFileURL(path.join(TMP, 'rig.mjs')).href);

const HEAD_R = R.STR.headR;          // 20 — the drawn head disc
// From rig's HEAD_CLEAR, so this file and check-moves cannot drift apart: both
// derive from STR.headR rather than carrying their own literal.
const RIM = R.HEAD_CLEAR.elbow;      // an elbow stays off the disc entirely
const REST = R.HEAD_CLEAR.rest;      // a settled hand may touch its rim
// Above this and the hand is over the crown: an arm nobody holds up at rest.
const CROWN_SLACK = 2;
// Behind the spine AND up near head height — the forearm crosses the torso.
const BEHIND_X = -12;

/** Distance from a point to the segment ab — how a limb is tested against the head. */
function segDist(p, a, b) {
  const vx = b.x - a.x, vy = b.y - a.y;
  const len2 = vx * vx + vy * vy;
  const t = len2 < 1e-9 ? 0 : Math.max(0, Math.min(1, ((p.x - a.x) * vx + (p.y - a.y) * vy) / len2));
  return Math.hypot(p.x - (a.x + vx * t), p.y - (a.y + vy * t));
}

const rows = [];
function judge(family, code, s, note) {
  // Solve the WHOLE figure, not just the hand target. The drawn arm is
  // shoulder → elbow → wrist, and an elbow can swing up behind the skull while
  // the fist itself sits somewhere perfectly reasonable — which is exactly the
  // "arm behind his head" the viewer is describing. Testing the target only
  // would pass every one of those.
  const j = R.solve({
    x: 0, groundY: 0, k: 1, dir: 1,
    tilt: s.tilt, neck: s.neck, bob: s.bob,
    footL: s.footL, footR: s.footR, fistL: s.fistL, fistR: s.fistR,
  });
  const h = j.head;
  const crown = h.y - HEAD_R + CROWN_SLACK;   // negative y is up
  // A HAND may touch the head — that is what "at the chin", "at the temple" and
  // "shielding the eyes" are, and the rule book is explicit that a fist centred on
  // the rim half overlaps and half shows. Only a hand driven WELL inside the disc
  // has disappeared. An ELBOW is different: no gesture ever wants one in the face,
  // so it has to stay off the disc entirely.
  const parts = [
    ["L hand", j.wrL, REST], ["R hand", j.wrR, REST],
    ['L elbow', j.elL, RIM], ['R elbow', j.elR, RIM],
  ];
  for (const [name, p, floor] of parts) {
    const bad = [];
    const d = Math.hypot(p.x - h.x, p.y - h.y);
    if (d < floor) bad.push(`in-skull d=${d.toFixed(1)}<${floor}`);
    if (p.y < crown) bad.push(`above-crown y=${p.y.toFixed(1)}<${crown.toFixed(1)}`);
    if (p.x < BEHIND_X && p.y < h.y + HEAD_R) bad.push(`behind-head x=${p.x.toFixed(1)}`);
    if (bad.length) rows.push({ key: `${family}[${code}] ${name}`, detail: bad.join(' · '), note });
  }
  // A forearm laid across the face hides it even when both ends are clear.
  for (const [name, a, b] of [['L forearm', j.elL, j.wrL], ['R forearm', j.elR, j.wrR]]) {
    const d = segDist(h, a, b);
    if (d < RIM * 0.6) rows.push({ key: `${family}[${code}] ${name}`, detail: `crosses-face d=${d.toFixed(1)}`, note });
  }
}

// Sample several clocks: every hold rides life2() drift, so a pose can be clean at
// t=0 and foul a second later.
const TS = [0, 0.7, 1.6, 2.9, 4.3, 6.1, 8.8, 12.5];
// And several BEAT clocks past the 1.5s lift, to prove the raise really came down.
const BTS = [1.5, 2.0, 3.5, 7.0, 12.0];

function sweepHold(name, fn, codes) {
  for (const code of codes) for (const t of TS) judge(name, code, fn(code, t));
}
function sweepLive(name, fn, codes) {
  for (const code of codes) for (const t of TS) for (const bt of BTS) {
    judge(name + 'Live', code, fn(code, t, bt), `bt=${bt}`);
  }
}

const emoteCodes = Array.from({ length: 50 }, (_, i) => i);
const narratorCodes = Array.from({ length: 7 }, (_, i) => i);
const masterCodes = Array.from({ length: 8 }, (_, i) => i);

sweepHold('emoteHold', R.emoteHold, emoteCodes);
sweepHold('narratorHold', R.narratorHold, narratorCodes);
sweepHold('masterHold', R.masterHold, masterCodes);
// The live poses are what a beat actually settles into once the lift is spent.
sweepLive('emote', R.emoteLive, emoteCodes);
sweepLive('narrator', R.narratorLive, narratorCodes);
sweepLive('master', R.masterLive, masterCodes);

// THE FOUR SCENES THAT POSE THEIR OWN HANDS.
//
// 98 of the 100 scenes settle through the shared libraries above, so fixing those
// covers them. These four set fist targets literally, which puts them outside the
// libraries and therefore outside every check — so they are pinned here by value.
// If one of these lines changes in its scene, change it here too.
const SCENE_POSES = [
  ['aestheticsScene', { tilt: -0.06, neck: 0.10, fistR: { x: 25, y: -2 }, fistL: { x: -4, y: -4 } }],
  ['epistemologyScene', { tilt: -0.06, neck: 0.04, fistR: { x: 33, y: -8 }, fistL: { x: -4, y: -4 } }],
  ['ethicsScene', { tilt: -0.11, neck: 0.10, fistR: { x: 30, y: 9 }, fistL: { x: -4, y: -3 } }],
  ['politicalScene', { tilt: -0.02, neck: 0, fistR: { x: 16, y: -42 }, fistL: { x: -9, y: -4 } }],
];
for (const [name, p] of SCENE_POSES) {
  for (const t of TS) {
    const base = R.stand(t);
    judge(name, 'custom', { ...base, ...p, tilt: base.tilt + p.tilt });
  }
}

// The standing / prop rest stances a beat can also be left in.
for (const t of TS) {
  judge('stand', 0, R.stand(t));
  judge('leanHold', 0, R.leanHold(t));
  judge('readStance', 0, R.readStance(t, 0));
  judge('readStance', 1, R.readStance(t, 1));
  judge('seated', 21, R.seated(21, t));
}

console.log('REST POSES — settled hands vs the head');
console.log(`  head disc r=${HEAD_R} centred on headAt(tilt,neck); fists pelvis-relative`);

// One line per offending pose, not per sampled clock.
const first = new Map();
for (const r of rows) if (!first.has(r.key)) first.set(r.key, r);
for (const r of first.values()) {
  console.log(`  FAIL  ${r.key}  ${r.detail}${r.note ? '  (' + r.note + ')' : ''}`);
}
if (!first.size) {
  console.log('  ok    every settled hand is clear of the head, below the crown, and in front');
}

console.log(
  first.size
    ? `\n${first.size} settled pose(s) leave a hand somewhere a person would not hold it.`
    : '\nAll rest poses clean.',
);
process.exit(first.size ? 1 : 0);
