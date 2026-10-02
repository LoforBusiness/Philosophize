// THE WIDGET'S STICKMAN, POSED BY THE REAL RIG.
//
//   npm run make:widget-poses      → components/widget/widgetPoses.ts
//
// The home-screen widget renders in a headless task to Android RemoteViews, where
// there is no Reanimated and no View tree to pose a figure with. It can draw an
// SVG, so the figure goes in as path data. This script poses him with the same
// `rig.ts` and `moves.ts` every lesson uses (both zero-import, so plain Node runs
// them) and writes the outlines out once. That way the widget's man is the app's
// man, and a new mood is one line here plus a re-run.
//
// Coordinates are the rig's own at k = 1: feet on y = 0, up is negative, facing +x.
// The widget scales and places each pose itself (widgetScenes.ts).
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { transform } = await import(pathToFileURL(path.join(REPO, 'node_modules/sucrase/dist/index.js')).href);
const TMP = path.join(os.tmpdir(), 'ph-widget-poses');
mkdirSync(TMP, { recursive: true });
const emit = (rel, name) => {
  const src = transform(readFileSync(path.join(REPO, rel), 'utf8'), { transforms: ['typescript'] }).code
    .replace(/(from\s+['"])\.\/([A-Za-z0-9_-]+)(['"])/g, '$1./$2.mjs$3');
  writeFileSync(path.join(TMP, name), src);
  return pathToFileURL(path.join(TMP, name)).href;
};
const RIG = await import(emit('components/lesson/cinematic/rig.ts', 'rig.mjs'));
const M = await import(emit('components/lesson/cinematic/moves.ts', 'moves.mjs'));

// Each mood: what produces the stance, and what it is FOR (the widget picks by
// state; see lib/widget/mood.ts). Every one of these was drawn on a contact sheet
// at widget size and kept only if it reads as its mood as a solid silhouette.
const POSES = {
  yawn:       () => M.actStance(51, 3, 0.45),   // morning: the yawn
  gazeUp:     () => M.actStance(65, 3, 1),      // morning: looking at the sky
  hipsWait:   () => M.actStance(64, 3, 1),      // afternoon: hands on hips, waiting
  impatient:  () => M.actStance(67, 4, 1),      // afternoon: arms folded, foot going
  checkTime:  () => M.actStance(95, 3, 0.5),    // evening: looks at his wrist
  cringe:     () => M.actStance(89, 3, 0.5),    // evening: shoulders up
  handsHead:  () => M.actStance(112, 3, 0.55),  // night: both hands to the head
  cower:      () => M.actStance(180, 3, 1),     // night: crouched, shaking
  noddingOff: () => M.actStance(106, 3, 0.8),   // after midnight: asleep on his feet
  recline:    () => M.postureHold(5, 3),        // done: leaning back on the grass
  sip:        () => RIG.sipStance(3, 0.55, 21), // done: on a crate with his mug
  crossLeg:   () => M.postureHold(15, 3),       // done: sat cross-legged
  celebrate:  () => M.actStance(91, 3, 0.35),   // done: a fist in the air
  folded:     () => M.actStance(62, 3, 1),      // rest day: arms folded
  deflate:    () => M.actStance(116, 3, 1),     // missed yesterday: let the air out
  facepalm:   () => M.actStance(17, 3, 0.5),    // missed yesterday
  hugKnees:   () => M.postureHold(17, 3),       // gone a few days: sat alone
  sprawl:     () => M.postureHold(10, 3),       // gone a week: flat out
  whoMe:      () => M.actStance(104, 3, 0.5),   // new: "who, me?"
  idea:       () => M.actStance(80, 3, 0.6),    // new: the idea
};

const f1 = (n) => (Math.round(n * 10) / 10).toString();
function disc(cx, cy, r) {
  const n = 28, p = [];
  for (let i = 0; i < n; i++) { const a = (2 * Math.PI * i) / n; p.push(`${f1(cx + r * Math.cos(a))},${f1(cy + r * Math.sin(a))}`); }
  return `M${p.join('L')}Z`;
}
function bone(xf, th) {
  const tx = xf[0].translateX, ty = xf[1].translateY;
  const r = (parseFloat(String(xf[2].rotate)) * Math.PI) / 180;
  const len = xf[3].scaleX * RIG.BONE_SRC, c = Math.cos(r), s = Math.sin(r);
  return `M${[[0, -th / 2], [len, -th / 2], [len, th / 2], [0, th / 2]].map(([x, y]) => `${f1(tx + x * c - y * s)},${f1(ty + x * s + y * c)}`).join('L')}Z`;
}
const at = (xf) => ({ x: xf[0].translateX, y: xf[1].translateY });

const out = {};
for (const [name, make] of Object.entries(POSES)) {
  const B = RIG.pose(make(), 0, 0, 1, 1, 1);
  const l = RIG.STR.limb, t = RIG.STR.torso, h = RIG.STR.headR;
  let d = '';
  for (const n of ['thighL', 'shinL', 'thighR', 'shinR', 'uarmL', 'farmL', 'uarmR', 'farmR']) d += bone(B[n], l);
  d += bone(B.torso, t);
  for (const n of ['kneeL', 'kneeR', 'ankL', 'ankR', 'elL', 'elR', 'wrL', 'wrR', 'shLd', 'shRd']) { const p = at(B[n]); d += disc(p.x, p.y, l / 2); }
  for (const [n, r] of [['pel', t / 2], ['shB', t / 2], ['head', h]]) { const p = at(B[n]); d += disc(p.x, p.y, r); }
  const nums = d.match(/-?\d+\.?\d*/g).map(Number);
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity;
  for (let i = 0; i < nums.length; i += 2) { x0 = Math.min(x0, nums[i]); x1 = Math.max(x1, nums[i]); y0 = Math.min(y0, nums[i + 1]); }
  const wl = at(B.wrL), wr = at(B.wrR);
  // The hand that is higher is the one doing something (holding the mug, the wrist).
  const hand = wl.y < wr.y ? wl : wr;
  out[name] = { d, top: Math.round(y0), x0: Math.round(x0), x1: Math.round(x1), hand: { x: Math.round(hand.x), y: Math.round(hand.y) } };
}

const body = `// GENERATED by scripts/make-widget-poses.mjs — do not edit by hand.
// The widget's stickman, posed by the real rig (rig.ts + moves.ts) at k = 1:
// feet on y = 0, up is negative, facing +x. Zero imports, so the widget's
// contact sheet and check run it in plain Node.

export interface WidgetPose {
  /** The whole figure as one filled path. */
  d: string;
  /** Highest point (the head's top), negative. */
  top: number;
  x0: number;
  x1: number;
  /** The raised hand, for a held prop. */
  hand: { x: number; y: number };
}

export type WidgetPoseName = ${Object.keys(out).map((k) => `'${k}'`).join(' | ')};

export const WIDGET_POSES: Record<WidgetPoseName, WidgetPose> = ${JSON.stringify(out, null, 2)};
`;
writeFileSync(path.join(REPO, 'components/widget/widgetPoses.ts'), body);
console.log(`wrote components/widget/widgetPoses.ts (${Object.keys(out).length} poses, ${(body.length / 1024).toFixed(0)} KB)`);
