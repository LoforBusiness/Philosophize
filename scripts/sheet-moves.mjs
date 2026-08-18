// Twenty frames of a motion drawn side by side, so a pose that is numerically
// valid and visually meaningless gets caught. Numbers find geometry; only the
// sheet finds "that does not look like the thing it is called" (LESSON_RULES
// Part 3 — `arms-crossed` once drew a figure with no arms and passed every
// numeric check, because nothing was out of range).
//
// Runs in plain Node: rig.ts has zero imports, sucrase strips the types, and
// jimp-compact draws bones as thick lines and joints as discs. No Metro, no
// device, about two seconds a sheet.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import os from 'node:os';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import JimpPkg from 'jimp-compact';

const Jimp = JimpPkg.default || JimpPkg;
const REPO = process.cwd();
const { transform } = await import(
  pathToFileURL(path.join(REPO, 'node_modules/sucrase/dist/index.js')).href,
);

// Same loader as check-moves: a data: URL has no base path, so moves.ts's
// `./rig` import needs both files transpiled into one temp directory.
const TMP = path.join(os.tmpdir(), 'philosophize-moves-sheet');
mkdirSync(TMP, { recursive: true });
function emit(rel, name) {
  const js = transform(readFileSync(path.join(REPO, rel), 'utf8'), { transforms: ['typescript'] }).code
    .replace(/(from\s+['"])\.\/(rig|moves)(['"])/g, '$1./$2.mjs$3');
  writeFileSync(path.join(TMP, name), js);
  return pathToFileURL(path.join(TMP, name)).href;
}
emit('components/lesson/cinematic/rig.ts', 'rig.mjs');
emit('components/lesson/cinematic/moves.ts', 'moves.mjs');
const R = await import(pathToFileURL(path.join(TMP, 'rig.mjs')).href);
const M = await import(pathToFileURL(path.join(TMP, 'moves.mjs')).href);
const I = await import(emit('components/lesson/cinematic/interact.ts', 'interact.mjs'));

const N = 20, CELL = 150, H = 260, GROUND = 210;
const INK = 0x1a1a1aff, PAPER = 0xfafaf7ff, RULE = 0xd8d5ccff;
const K = 1.0;

// TRUE STROKE WEIGHTS, taken from how Stickman.tsx actually draws.
// `boneBase(thick)` sets the bone's full HEIGHT, so its half-width is thick/2;
// `dotBase(r)` takes a RADIUS, and the head is `dotBase(STR.headR * k)` — so the
// head radius is 20 rig units, not 10.
//
// This matters more than it looks. The first version drew 2px limbs and a 9px
// head, which reads as a wire figure and would happily show an arm the real
// renderer buries inside the torso — and "the forearm vanished against the body"
// is exactly the class of defect these sheets exist to catch (LESSON_RULES B16b).
const LIMB_W = (R.STR.limb / 2) * K;
const TORSO_W = (R.STR.torso / 2) * K;
const HEAD_R = R.STR.headR * K;

function line(img, a, b, w) {
  const n = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) * 2) + 1;
  for (let i = 0; i <= n; i++) {
    const x = a.x + ((b.x - a.x) * i) / n, y = a.y + ((b.y - a.y) * i) / n;
    for (let dx = -w; dx <= w; dx++) {
      for (let dy = -w; dy <= w; dy++) {
        if (dx * dx + dy * dy <= w * w) img.setPixelColor(INK, Math.round(x + dx), Math.round(y + dy));
      }
    }
  }
}
function disc(img, c, r) {
  for (let dx = -r; dx <= r; dx++) {
    for (let dy = -r; dy <= r; dy++) {
      if (dx * dx + dy * dy <= r * r) img.setPixelColor(INK, Math.round(c.x + dx), Math.round(c.y + dy));
    }
  }
}

function draw(img, j) {
    // Far side first, so the near limbs read in front — the same order Stickman
    // draws in, which is what makes a far arm behind the torso look correct here
    // rather than accidentally on top of it.
    line(img, j.shL, j.elL, LIMB_W); line(img, j.elL, j.wrL, LIMB_W);
    line(img, j.hipL, j.kneeL, LIMB_W); line(img, j.kneeL, j.ankL, LIMB_W);
    line(img, j.pel, j.chest, TORSO_W);
    line(img, j.hipR, j.kneeR, LIMB_W); line(img, j.kneeR, j.ankR, LIMB_W);
  line(img, j.shR, j.elR, LIMB_W); line(img, j.elR, j.wrR, LIMB_W);
  disc(img, j.head, HEAD_R);
}

export async function sheet(name, frames) {
  const img = new Jimp(CELL * N, H, PAPER);
  for (let i = 0; i < N; i++) {
    const ox = i * CELL;
    for (let x = 0; x < CELL; x++) img.setPixelColor(RULE, ox + x, GROUND);
    // Cfg is FLAT — the stance spreads in beside the placement fields.
    draw(img, R.solve({ x: ox + CELL / 2, groundY: GROUND, k: K, dir: 1, ...frames[i] }));
  }
  mkdirSync(path.join(REPO, '.moves-sheets'), { recursive: true });
  await img.writeAsync(path.join(REPO, '.moves-sheets', `${name}.png`));
  console.log(`.moves-sheets/${name}.png`);
}

/**
 * Two figures in one cell. The only way to see the thing that matters about a
 * pair motion — whether the hands actually arrive at the same place — since each
 * figure on its own always looks like it is reaching correctly.
 */
export async function pairSheet(name, frames) {
  const W = 190;
  const img = new Jimp(W * N, H, PAPER);
  for (let i = 0; i < N; i++) {
    const ox = i * W;
    for (let x = 0; x < W; x++) img.setPixelColor(RULE, ox + x, GROUND);
    const { a, b, pa, pb } = frames[i];
    draw(img, R.solve({ ...pa, x: ox + pa.x, groundY: GROUND, ...a }));
    draw(img, R.solve({ ...pb, x: ox + pb.x, groundY: GROUND, ...b }));
  }
  mkdirSync(path.join(REPO, '.moves-sheets'), { recursive: true });
  await img.writeAsync(path.join(REPO, '.moves-sheets', `${name}.png`));
  console.log(`.moves-sheets/${name}.png`);
}

const T = 3.0;
const WALK_CYCLE = R.WALK.S / R.WALK.stance;

// `node scripts/sheet-moves.mjs posture:8 act:3 hold:68 move:7` draws just those;
// with no
// arguments it draws the baselines, which is also how the renderer itself gets
// verified — against a figure already known to look right.
const want = process.argv.slice(2);
if (!want.length) {
  await sheet('walk', Array.from({ length: N }, (_, i) => R.walk((i / N) * WALK_CYCLE, R.WALK)));
  await sheet('seated', Array.from({ length: N }, () => R.seated(21, T)));
} else {
  for (const arg of want) {
    const [kind, nStr] = arg.split(':');
    const n = Number(nStr);
    if (kind === 'posture') {
      // A settled posture does not change over u, so vary the CLOCK instead —
      // that shows the breath and weight drift, and proves it never freezes.
      await sheet(`posture-${n}`, Array.from({ length: N }, (_, i) => M.postureHold(n, T + i * 0.22)));
    } else if (kind === 'act') {
      await sheet(`act-${n}`, Array.from({ length: N }, (_, i) => M.actStance(n, T, i / (N - 1))));
    } else if (kind === 'hold') {
      // A LIVING HOLD (59–78) IGNORES u ENTIRELY, so `act:63` draws the same frame
      // twenty times and tells you nothing — the sheet comes out looking like a
      // pose that has been checked when nothing has looked at it. Sweep the CLOCK
      // instead, over twelve seconds, which is also the only way the slow events
      // are seen at all: the re-settle in 62 fires about every ten seconds and the
      // scratch in 66 about every eight.
      await sheet(`hold-${n}`, Array.from({ length: N }, (_, i) => M.actStance(n, T + (i / N) * 12, 1)));
    } else if (kind === 'move') {
      const g = M.gaitFor(n), cyc = g.S / g.stance;
      await sheet(`move-${n}`, Array.from({ length: N }, (_, i) => M.moveStance(n, (i / N) * cyc)));
    } else if (kind === 'prop') {
      await sheet(`prop-${n}`, Array.from({ length: N }, (_, i) => I.propAct(n, T, i / (N - 1))));
    } else if (kind === 'carry') {
      // `carry:3` means hold 3 on a plain walk; `carry:3.2` means hold 3 in mode 2.
      const hold = Math.trunc(n), mode = Math.round((n - Math.trunc(n)) * 10);
      const g = M.gaitFor(mode), cyc = g.S / g.stance;
      await sheet(`carry-${hold}-mode${mode}`,
        Array.from({ length: N }, (_, i) => I.carryMode(mode, (i / N) * cyc, hold)));
    } else if (kind === 'pair') {
      const pa = { x: 66, groundY: GROUND, k: K, dir: 1 };
      const pb = { x: 122, groundY: GROUND, k: K, dir: -1 };
      const fn = nStr === 'pass'
        ? (u) => I.passObject(T, u, pa, pb)
        : (u) => I.handshake(T, u, pa, pb);
      await pairSheet(`pair-${nStr}`, Array.from({ length: N }, (_, i) => {
        const r = fn(i / (N - 1));
        return { a: r.a, b: r.b, pa, pb };
      }));
    }
  }
}
