import { StyleSheet, Text, View } from 'react-native';
import Animated, { makeMutable, useAnimatedStyle, useDerivedValue, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer, { type SceneApi } from './CinematicPlayer';
import {
  clamp01, ease01, easeOutBack, easeOutCubic, lerp, masterHold, masterLive,
  mixStance, narratorHold, narratorLive, pose, seg, stand, type Bundle,
} from './rig';
import {
  Bubble, GROUND, K_FIG, STAGE_H, INK, SOFT, PAPER, carry, lookPose, useCarry,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { floorStyle, lipOf, PLATE_FACE } from './stageSkin';
import type { Shot } from './camera';
import { BEATS } from './logic2Script';
import BrickStructure, {
  BASE_LX, BASE_RX, BASE_Y, BW, CENTER_X, KEY_X, KEY_Y, PLINTH_H, PLINTH_W, PLINTH_Y,
  type StructState,
} from './BrickStructure';

// ─────────────────────────────────────────────────────────────────────────────
// logic-arguments-2, "Premises and Conclusions" — THE MASTER BUILDER, on the
// shared player.
//
// This lesson and logic-arguments-1 were the last two carrying their own copies of
// `CinematicPlayer` (945 and 1,474 lines), and that is the whole reason they looked
// wrong: nine validators and every corpus-wide pass discover lessons by globbing
// `*Scene.tsx`, so a bespoke `*Lesson.tsx` was invisible to all of them — the
// six-swatch palette, the depth kit, the tappable philosopher names, the gaze, the
// wander, the thoughts and the pen all reached 244 lessons and skipped these two.
//
// AND THE PAIRING IS BY STEM, WHICH IS WHY THE SCRIPT WAS RENAMED. `check:still`,
// `check:idle`, `check:react`, `check:turn`, `check:smooth`, `check:marks`,
// `check:space`, `check:tour` and `check:legible` all look for
// `<stem>Scene.tsx` beside `<stem>Script.ts`, and `muststamp` wants
// `<lower(component)>Script.ts` — so `builderScript.ts` beside `logic2Scene.tsx`
// would have been skipped by the first nine and left the script OUTSIDE the box
// stamp. One stem for the component, the scene and the script, or the checks go
// quiet without failing.
//
// WHAT THE PLAYER TAKES OVER, all of which this file used to do by hand: the deck
// and its cross-fade, the narration and the rising letters, the two question
// shapes, the quote card, the summary, the reward hand-off, the back-and-forward
// tap rule, the lesson guide, the camera, the thought bubbles, the pen marks and
// the figure's wander. What is left here is the PICTURE.
//
//
// ── AND IT DOES NOT CLAIM A WALK (validate-sound §5) ──────────────────────
//
// `walk={X}` is an ASSERTION: "I drive exactly one figure through
// `travelStance(X[p], X[n], …, WALK)` with the default seed", which is the only
// case `./footfalls` solves for. Nobody walks in this lesson at all. So the prop is not
// passed, and `validate-sound` re-derives that both ways rather than trusting it.
//
// The price is the one CLAUDE.md already records for three other scenes: the
// player derives the live figure x from `walk`, so a thought bubble on a beat
// where he moves cannot follow him and sits at its measured spot instead. Nothing
// is lost in sound, because the app plays exactly two sounds and neither is a
// footstep (`HEARD` in lib/feedback.ts).

// ── THE BAND, AND WHY IT MOVED ──────────────────────────────────
//
// The band crops the 400×560 design space AFTER the camera, and the house rule
// (H59, `validate-cinematic`) is that its bottom sits just below the ground line,
// which is only true if the camera keeps the ground line in one place. The bespoke
// camera did not: it shared cx 200 and scaled 1.08…1.22 about cy 432…442, so the
// ground drifted 342.6 → 363 between shots and the band had to be [110, 434] to
// hold it. Every shot below carries `pin` instead (see `shotAt`), which solves cy
// for the scale so that the ground lands at GROUND_Y in every shot and through
// every move — the same pin, and the same GROUND_Y, as logic1Scene.
//
// Extremes in band space, y' = GROUND_Y + s·(y − GROUND):
//   the signpost / plan card (outside the camera, literal)   268 … 330
//   CONCLUSION plaque      y 365.5, s 1.16   → 340.0
//   the FORM boundary      y 383.5, s 1.22   → 353.4
//   the master's crown     y 397,   s 1.22   → 370.3
//   the ground line        y 500,   any s    → 496.0
//   ankle joints           y 505.5, s 1.22   → 502.7
//   the floor, the plinth and the fallen keystone all stop at the ground line
// so [260, 516] holds every pixel the scene can draw, with 8 units of margin at
// the top and 13 at the bottom. 256 units tall, which is inside the free 2.31×
// (`validate-cinematic` prints the band budget). Anything new is re-measured.
//
// ── THE COLLAPSE LANDS ON THE FLOOR NOW ─────────────────────────────────────
//
// It used to tumble to y 549 — 49 units BELOW the ground line — which was
// invisible when the floor was 1.5pt of rule and is plainly wrong now that the
// floor is a filled band (group AG): the brick fell through it. It also cannot be
// held by a band whose bottom is on the ground line. So the fall is solved for the
// floor instead: at TUMBLE the brick's lowest corner is
// `|BW/2·sin| + |BH/2·cos|` = 41.9 below its centre, so a centre at
// GROUND − 41.9 = 458.1 rests it exactly on the ground, which is FALL = 50.1 from
// KEY_Y. The stone still tumbles more than its own height and now lies where a
// dropped stone lies.
//
// ── EVERY PROP TRACK IS CARRIED (AH4, L5) ───────────────────────────────────
//
// The bespoke computed each brick from the current beat alone, so anything that
// switched off — the plaques in act 3, the therefore-mark at the collapse, the
// slot after the fly-up — went out between two frames, and the fallen keystone
// vanished on the tap that followed. `carry` is `lerp` with a memory of what it
// last drew, so the pulled premise SLIDES back into the wall on the beat that
// rebuilds it and nothing cuts.
// ─────────────────────────────────────────────────────────────────────────────

// THE STAGE IS STRUCK IN THIS LESSON'S OWN BRANCH HUE (./stageTones).
// Same three tones at the same luminance the old local greys had to the third
// decimal, so every contrast measured against them still holds.
const TONE = stageTone('logic');
const { RULE, STONE, SHADE } = TONE;
const LIP = lipOf(TONE);   // the ledge a toned plate stands on (scripts/skin-stage.mjs)

/** Where the ground line lands on screen — the same for every shot, by design. */
const GROUND_Y = 496;
/** The pin: `s · (GROUND − cy)`, the quantity that holds the ground line still. */
const PIN = GROUND_Y - STAGE_H / 2;          // 216

const MASTER_X = 330;               // right, faces left — beside the work, not behind it
const APP_X = 62;                   // left, watches — clear of the base bricks
const APP_K = K_FIG * 0.88;         // the apprentice reads a touch shorter than the master
const LAY = 0.7;                    // seconds for a brick to drop into place

// THE COLLAPSE, SOLVED AGAINST THE FLOOR AND AGAINST THE FRAME.
//
// The graded beats push the camera to 1.22× about cx 200, so the reader can see
// design x 36…364 and nothing outside it. The bespoke lesson dragged the premise
// 82 units, which puts a 114-wide stone at x 3…117 — a THIRD OF IT OUTSIDE THE
// FRAME, on the one beat the whole lesson turns on. Nothing measured it, because
// a must-box is clamped to the stage and the camera is checked against the box.
// Rendered, it is the first thing you see.
//
// AND THE PULLED PREMISE IS REMOVED, WHICH IS WHAT THE BEAT SAYS. Rendered with
// it merely slid aside, the keystone landed ON TOP OF ITS WORDS — three stones
// 114 wide need 342 units and the pushed frame is 328, so at this scale there is
// no arrangement of three in which none covers another's text (D31). Pulling it
// further only trades that for a stone half outside the frame, which is what the
// bespoke lesson did. So it FADES as it is dragged: "remove the premises and
// nothing supports the conclusion" is the explanation this beat carries, and a
// premise that is gone is the honest picture of it. The stone slides back in on
// the beat that rebuilds the wall, because `carry` remembers where it left it.
//
// The keystone then falls into an EMPTY gap: FALL and TUMBLE put its lowest
// corner exactly on the ground line (|BW/2·sin24| + |BH/2·cos24| = 41.9, so a
// centre at 458.1 rests on 500) and SHUNT lands it clear of the standing stone's
// own lettering.
const PULL = -70;                   // the premise, dragged out of the argument
const FALL = 50;                    // the keystone, down onto the ground
const TUMBLE = -24;                 // degrees it turns on the way down
const SHUNT = -50;                  // and across, into the gap it fell out of

// Speech bubbles sit above the crown in SCENE space, so they ride the camera with
// the figure they belong to. 82 above the crown is the gap the bespoke used, and
// `Bubble` clamps a long line inside the stage for itself.
const BUBBLE_TOP = 315;

// ── per-beat channels, at module scope so a worklet can index them ───────────
const lbl = (i: number, key: 'p1' | 'p2' | 'key'): string | null =>
  (BEATS[i].build?.[key] ?? null) as string | null;

const P1_ON = BEATS.map((_, i) => (lbl(i, 'p1') !== null ? 1 : 0));
const P2_ON = BEATS.map((_, i) => (lbl(i, 'p2') !== null ? 1 : 0));
const KEY_ON = BEATS.map((_, i) => (lbl(i, 'key') !== null ? 1 : 0));
const SLOT_ON = BEATS.map((b) => (b.build?.slot ? 1 : 0));
const FORM_ON = BEATS.map((b) => (b.build?.form ? 1 : 0));
const MARK_ON = BEATS.map((b) => (b.build?.mark ? 1 : 0));
const TAG_BASE = BEATS.map((b) => (b.build?.tags ? 1 : 0));
const TAG_CONC = BEATS.map((b) => (b.build?.tags === 'both' ? 1 : 0));
// 0 none · 1 collapse · 2 fly-up
const QCODE = BEATS.map((b) => (b.build?.q === 'collapse' ? 1 : b.build?.q === 'flyup' ? 2 : 0));

// A brick DROPS IN when it first appears or when its lettering changes, so a label
// swap is always a fresh placement rather than a pop. It no longer re-lays after a
// collapse: `carry` slides the pulled stone back into the wall, which is the
// builder rebuilding it rather than a second stone falling from the sky.
const wasFlyup = (i: number) => i > 0 && QCODE[i - 1] === 2;
const fresh = (i: number, key: 'p1' | 'p2' | 'key', on: number[]) =>
  on[i] && (i === 0 || lbl(i, key) !== lbl(i - 1, key)) ? 1 : 0;
const P1_FRESH = BEATS.map((_, i) => fresh(i, 'p1', P1_ON));
const P2_FRESH = BEATS.map((_, i) => fresh(i, 'p2', P2_ON));
// The keystone takes over IN PLACE on the beat after the fly-up: a brick has just
// flown into that exact spot, so dropping another one in flickers.
const KEY_FRESH = BEATS.map((_, i) => (wasFlyup(i) ? 0 : fresh(i, 'key', KEY_ON)));

const M_GEST = BEATS.map((b) => b.gest ?? 0);
const APP_TALK = BEATS.map((b) => !!b.say?.some((s) => s.who === 'app'));

// ── the signpost legend ──────────────────────────────────────────────────────
// The most portable thing this lesson teaches is which little words flag a premise
// and which flag a conclusion, and it is exactly what the teaching tap tests. So it
// gets a reference card at the top of the stage: the words on the left, an arrow,
// the role they mark on the right. Each row arrives with the line that lists its
// own words (`leg` in the script), and the card steps aside on any beat that raises
// a speech bubble, because both live in the same strip of stage.
const LEG_ROWS = [
  { words: 'BECAUSE · SINCE · AS', tag: 'PREMISE' },
  { words: 'THEREFORE · SO · THUS', tag: 'CONCLUSION' },
] as const;
const LEGEND = BEATS.map((b) => (b.say || b.summary ? 0 : b.leg ?? 0));

// ── the builder's plan ───────────────────────────────────────────────────────
// Act 1 was the thinnest picture in the lesson: two figures and up to three blank
// stones. The master now works to a plan pinned above the site — a dashed
// schematic whose outlines INK IN as each real stone is laid — so the opening beats
// carry a small progress diagram instead of empty space. It occupies the legend's
// footprint (the legend does not exist yet in act 1) and steps aside for a bubble
// for the same reason.
const PLAN = BEATS.map((b) => (b.act === 1 && !b.say ? 1 : 0));

// ── the camera ───────────────────────────────────────────────────────────────
// Three framings, as the bespoke lesson had them: wide enough to see the whole
// build in act 1, the working shot everywhere else, and a push for the collapse
// and the fly-up. `pin` is what makes them share a ground line (see the header).
const SHOTS: Shot[] = BEATS.map((b) => {
  const s = b.act === 1 ? 1.08 : b.build?.q ? 1.22 : 1.16;
  return { cx: 200, cy: GROUND - PIN / s, s, tr: 0.8, pin: PIN };
});

// Band-space x of each speaker's head, published by the scene for the chrome.
//
// The bubbles are drawn OUTSIDE the camera on purpose: `Bubble` clamps a long line
// to STAGE_W, which is the visible width there and is NOT the visible width inside
// a camera pushed to 1.22× — a bubble over the master, who stands at 330, would
// have been clamped to a frame 36 units wider than the one the reader can see. So
// the chrome draws them and the scene, which is the only place the stances exist,
// hands over where each head is. It has to be the head and not the mark they stand
// on: a box tethered to `headAt(stance)` inherits whatever the pose is doing, and
// logic1Scene records what that cost there — a shout sliding 13px sideways while it
// faded out, because its speaker was mid-punch. These two only gesture, so the
// stray is smaller, but the rule is the same one: a word being read holds still.
const SAY_M = makeMutable(200);
const SAY_A = makeMutable(200);

// ── THE SCENE: the site, the two builders, the structure ─────────────────────
export function Logic2Scene({ clock, bt, bi, qv, gazeX, gazeY, gazeOn, i }: SceneApi) {
  const cv = useCarry(20);

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / (SHOTS[n].tr ?? 0.8));
    const t = clock.value;

    // Master: blend the previous beat's settled gesture into this beat's live one
    // over the same `tr` the camera rides, so the hand never snaps home on a tap.
    const masterS = mixStance(masterHold(M_GEST[p], t), masterLive(M_GEST[n], t, bt.value), tr);
    // Apprentice: watches, and gestures only while speaking.
    const appS = mixStance(
      APP_TALK[p] ? narratorHold(0, t) : stand(t),
      APP_TALK[n] ? narratorLive(0, t, bt.value) : stand(t),
      tr,
    );
    const s = carry(cv, 19, n, SHOTS[p].s, SHOTS[n].s, tr);
    SAY_M.value = 200 + s * (MASTER_X - 200);
    SAY_A.value = 200 + s * (APP_X - 200);

    return {
      master: pose(masterS, MASTER_X, GROUND, K_FIG, -1, 1),
      // THE APPRENTICE IS THE MASCOT HERE — the scene's own brief says "a watching
      // apprentice GETS TESTED", so he is the reader's stand-in: `lookPose` turns
      // him toward what the beat draws, nods him on a right answer, draws him back
      // on a wrong one, and runs the wander that moves him between taps. A master
      // builder nodding at his own work would say nothing about the answer.
      app: lookPose(appS, APP_X, GROUND, APP_K, 1, 1, gazeX.value, gazeY.value, gazeOn.value),
    };
  });

  const DM = useDerivedValue<Bundle>(() => SCENE.value.master);
  const DA = useDerivedValue<Bundle>(() => SCENE.value.app);

  // ── the brick structure ────────────────────────────────────────────────────
  const STRUCT = useDerivedValue<StructState>(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const bp = bt.value;
    const tr = ease01(bp / (SHOTS[n].tr ?? 0.8));
    // The player ramps `qv` 0→1 linearly and each scene shapes it: the collapse is
    // gravity (squared) and the fly-up settles (ease-out cubic), which is the same
    // pair the bespoke asked `withTiming` for.
    const q = clamp01(qv.value);
    const code = QCODE[n];

    // A fresh brick is PLACED — from a little above, growing into its own size.
    const ent = (fr: number) => (fr ? clamp01(bp / LAY) : 1);
    const dy = (e: number) => (1 - easeOutCubic(e)) * -26;
    const e1 = ent(P1_FRESH[n]);
    const e2 = ent(P2_FRESH[n]);
    const ek = ent(KEY_FRESH[n]);

    // One base stone sits centred; two sit either side of the middle.
    const p1x = P2_ON[n] ? BASE_LX : CENTER_X;
    let p1 = { tx: p1x, ty: BASE_Y + dy(e1), rot: 0 };
    let p2 = { tx: BASE_RX, ty: BASE_Y + dy(e2), rot: 0 };
    let key = { tx: KEY_X, ty: KEY_Y + dy(ek), rot: 0 };
    let slot = SLOT_ON[n] ? clamp01(bp / LAY) : 0;
    let formOn = FORM_ON[n];
    let markOn = MARK_ON[n];
    let tagB = TAG_BASE[n] ? 1 : 0;
    let tagC = TAG_CONC[n] ? 1 : 0;
    let op1 = P1_ON[n] ? clamp01(e1 / 0.5) : 0;
    let op2 = P2_ON[n] ? clamp01(e2 / 0.5) : 0;
    let opk = KEY_ON[n] ? clamp01(ek / 0.5) : 0;

    if (code === 1) {
      // THE PREMISE IS PULLED and the keystone loses its support. The stone the
      // reader took out drags its own plaque with it, and the form it was part of
      // stops being a form.
      const qp = seg(q, 0, 0.45);
      p1 = {
        tx: p1x + PULL * easeOutCubic(qp),
        ty: BASE_Y + 6 * qp,
        rot: -10 * qp,
      };
      // Gone before the keystone arrives: the fall starts at 0.3 and this is out at
      // 0.55, so the two never share the ground.
      op1 *= 1 - seg(q, 0.15, 0.55);
      const g = seg(q, 0.3, 1) * seg(q, 0.3, 1);        // gravity
      key = { tx: KEY_X + SHUNT * g, ty: KEY_Y + FALL * g, rot: TUMBLE * g };
      formOn *= 1 - seg(q, 0, 0.5);
      markOn *= 1 - seg(q, 0, 0.35);
      tagB *= 1 - qp;
    } else if (code === 2) {
      // THE CONCLUSION FLIES UP into the empty slot and the premise slides under
      // it; the dashed slot fades as the stone arrives.
      const qe = easeOutCubic(q);
      p2 = {
        tx: lerp(BASE_RX, KEY_X, qe),
        ty: lerp(BASE_Y, KEY_Y, qe) - Math.sin(Math.PI * qe) * 20,
        rot: 0,
      };
      p1 = { tx: lerp(BASE_LX, CENTER_X, qe), ty: BASE_Y, rot: 0 };
      slot *= 1 - qe;
    }

    // THE FORM: a boundary round whatever stack is standing. Two base stones make
    // it the full width of the base row; one centred stone makes it one brick wide.
    const boxOf = (k: number) => (P2_ON[k]
      ? { x: BASE_LX - BW / 2 - 6, w: BASE_RX + BW / 2 - (BASE_LX - BW / 2) + 12 }
      : { x: CENTER_X - BW / 2 - 6, w: BW + 12 });
    const box = boxOf(n);
    const was = boxOf(p);

    // EVERY ONE OF THESE IS CARRIED, in a fixed order, every frame (see the header).
    return {
      p1: {
        tx: carry(cv, 0, n, p1x, p1.tx, tr),
        ty: carry(cv, 1, n, BASE_Y, p1.ty, tr),
        rot: carry(cv, 2, n, 0, p1.rot, tr),
        scale: 0.9 + 0.1 * easeOutBack(e1),
        opacity: carry(cv, 16, n, P1_ON[p], op1, tr),
      },
      p2: {
        tx: carry(cv, 3, n, BASE_RX, p2.tx, tr),
        ty: carry(cv, 4, n, BASE_Y, p2.ty, tr),
        rot: carry(cv, 5, n, 0, p2.rot, tr),
        scale: 0.9 + 0.1 * easeOutBack(e2),
        opacity: carry(cv, 17, n, P2_ON[p], op2, tr),
      },
      key: {
        tx: carry(cv, 6, n, KEY_X, key.tx, tr),
        ty: carry(cv, 7, n, KEY_Y, key.ty, tr),
        rot: carry(cv, 8, n, 0, key.rot, tr),
        scale: 0.9 + 0.1 * easeOutBack(ek),
        opacity: carry(cv, 18, n, KEY_ON[p], opk, tr),
      },
      slotOp: carry(cv, 9, n, SLOT_ON[p], slot, tr),
      tagBase: carry(cv, 10, n, TAG_BASE[p], tagB, tr),
      tagConc: carry(cv, 11, n, TAG_CONC[p], tagC, tr),
      formOp: carry(cv, 12, n, FORM_ON[p], formOn, tr),
      formX: carry(cv, 13, n, was.x, box.x, tr),
      formW: carry(cv, 14, n, was.w, box.w, tr),
      markOp: carry(cv, 15, n, MARK_ON[p], markOn, tr),
    };
  });

  const beat = BEATS[i];
  const p1Label = beat.build?.p1 ?? '';
  const p2Label = beat.build?.p2 ?? '';
  const keyLabel = beat.build?.key ?? '';

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* THE FLOOR, from the depth kit — a band with a lit near edge and a shaded
          foot, where this lesson used to draw 1.5pt of rule and nothing else. Drawn
          first, so it sits behind everything and is clipped by the band. */}
      <View style={styles.floor} pointerEvents="none" />

      {/* THE PLINTH the structure is built on, and the reason it is a block.
          It was a 2-unit rule at y 475.5 with the ground line 24.5 below it, which
          on a hairline floor read as a base and on a filled one reads as a column
          standing in mid-air. It is a stone base rising out of the floor now: a
          STONE face with a lit top edge and a shaded foot, the AG kit's own
          construction for a thing that STANDS. */}
      <View style={styles.plinth} pointerEvents="none">
        <View style={styles.plinthTop} />
        <View style={styles.plinthFoot} />
      </View>

      {/* Structure IN FRONT of the figures: the builders stand behind their work,
          which keeps the brick faces — the teaching content — readable instead of
          hidden behind a gesturing arm. */}
      {/* THE APPRENTICE IS THE LEAD, which is a wardrobe role and not a guess:
          `scenefig` identifies the mascot as the figure a scene poses with
          `lookPose`, and that is him — so the costume table's first entry is his.
          Without a role on the other one they were TWINS in the same top hat,
          which wardrobeContext's own header calls worse than two plain figures
          because it draws the eye to a coincidence. */}
      <Stickman D={DA} k={APP_K} />
      <Stickman D={DM} k={K_FIG} role="second" />
      <BrickStructure S={STRUCT} p1Label={p1Label} p2Label={p2Label} keyLabel={keyLabel} />
    </View>
  );
}

// ── THE CHROME: what the camera does not move ────────────────────────────────
// The signpost card and the plan are reference material a reader keeps reading
// while the shot pushes from 1.08× to 1.22× on the site below them, so they are
// drawn outside the camera at one size. The speech bubbles are here for the
// clamping reason given at SAY_M. See `Chrome` on CinematicPlayer.
export function Logic2Chrome({ bt, bi, i }: SceneApi) {
  const CARD = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    // Asymmetric, like a card taken off the table: it LEAVES in 0.25s — well before
    // the bubble that displaced it lands — and ARRIVES in 0.7s.
    const away = 1 - ease01(bt.value / 0.25);
    const here = ease01(bt.value / 0.7);
    const grow = ease01(bt.value / 0.7);
    const cnt = LEGEND[n];
    const was = LEGEND[p];
    const row = (k: number) => { 'worklet'; return k < was ? 1 : k < cnt ? grow : 0; };
    // The plan's three outlines ink in one at a time: a stone laid on the PREVIOUS
    // beat is solid from frame one, the one laid on THIS beat draws on.
    const inked = (on: number[]) => {
      'worklet';
      return n > 0 && on[n - 1] ? 1 : on[n] ? grow : 0;
    };
    return {
      on: cnt > 0 ? (was > 0 ? 1 : here) : was > 0 ? away : 0,
      r0: row(0),
      r1: row(1),
      planOn: PLAN[n] ? (PLAN[p] ? 1 : here) : PLAN[p] ? away : 0,
      ink0: inked(P1_ON),
      ink1: inked(P2_ON),
      ink2: inked(KEY_ON),
    };
  });

  const beat = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Legend S={CARD} />
      <Plan S={CARD} />

      {/* The previous beat's line stays mounted for a moment so it fades out with
          everything else rather than being the one graphic cut dead on the tap. */}
      {prev?.say?.map((s) => (
        <Bubble
          key={`out-${s.who}-${s.text}`}
          bt={bt} text={s.text} top={BUBBLE_TOP} leaving
          x={s.who === 'app' ? SAY_A : SAY_M}
        />
      ))}
      {beat.say?.map((s) => (
        <Bubble
          key={`${s.who}-${s.text}`}
          bt={bt} text={s.text} top={BUBBLE_TOP}
          x={s.who === 'app' ? SAY_A : SAY_M}
        />
      ))}
    </View>
  );
}

interface Card {
  on: number; r0: number; r1: number;
  planOn: number; ink0: number; ink1: number; ink2: number;
}

// ── the signpost card ────────────────────────────────────────────────────────
function Legend({ S }: { S: SharedValue<Card> }) {
  const card = useAnimatedStyle(() => ({ opacity: S.value.on }));
  const rows = [
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAnimatedStyle(() => ({ opacity: S.value.r0, transform: [{ translateX: (1 - S.value.r0) * -12 }] })),
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAnimatedStyle(() => ({ opacity: S.value.r1, transform: [{ translateX: (1 - S.value.r1) * -12 }] })),
  ];
  return (
    <Animated.View style={[styles.legend, card]} pointerEvents="none">
      {LEG_ROWS.map((r, k) => (
        <Animated.View key={r.tag} style={[styles.legRow, { top: 3 + k * 27 }, rows[k]]}>
          <Text style={styles.legWords} numberOfLines={1}>{r.words}</Text>
          <Text style={styles.legArrow}>→</Text>
          <View style={styles.legTag}>
            <Text style={styles.legTagText} numberOfLines={1}>{r.tag}</Text>
          </View>
        </Animated.View>
      ))}
    </Animated.View>
  );
}

// ── the builder's plan (act 1 only) ──────────────────────────────────────────
// A dashed schematic of the finished shape — two base stones and the one they hold
// up — with a solid outline fading in over each ghost as the real stone is laid. It
// occupies exactly the legend's footprint, so the two cards hand over in place.
function Plan({ S }: { S: SharedValue<Card> }) {
  const card = useAnimatedStyle(() => ({ opacity: S.value.planOn }));
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const k0 = useAnimatedStyle(() => ({ opacity: S.value.ink0 }));
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const k1 = useAnimatedStyle(() => ({ opacity: S.value.ink1 }));
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const k2 = useAnimatedStyle(() => ({ opacity: S.value.ink2 }));
  return (
    <Animated.View style={[styles.plan, card]} pointerEvents="none">
      <Text style={styles.planLabel} numberOfLines={1}>THE PLAN</Text>
      <View style={[styles.planGhost, styles.planKey]} />
      <Animated.View style={[styles.planInk, styles.planKey, k2]} />
      <View style={[styles.planGhost, styles.planBaseL]} />
      <Animated.View style={[styles.planInk, styles.planBaseL, k0]} />
      <View style={[styles.planGhost, styles.planBaseR]} />
      <Animated.View style={[styles.planInk, styles.planBaseR, k1]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  floor: floorStyle(TONE, GROUND),

  // The plinth: a stone base from its own top edge down to the ground line.
  plinth: {
    position: 'absolute',
    left: CENTER_X - PLINTH_W / 2,
    top: PLINTH_Y,
    width: PLINTH_W,
    height: PLINTH_H,
    borderWidth: 2,
    borderColor: INK,
    borderRadius: 4,
    backgroundColor: STONE,
    boxShadow: LIP,
  },
  // A lit near edge and a shaded foot — the depth, in the edges rather than in a
  // gradient across the face (§19: a wide surface barely shades).
  plinthTop: {
    position: 'absolute', left: 3, right: 3, top: 0, height: 3,
    backgroundColor: PLATE_FACE, borderRadius: 2,
  },
  plinthFoot: {
    position: 'absolute', left: 3, right: 3, bottom: 0, height: 5,
    backgroundColor: SHADE, borderRadius: 2,
  },

  // ── the signpost card ──────────────────────────────────────────────────────
  legend: {
    position: 'absolute', left: 36, top: 268, width: 328, height: 62,
    borderWidth: 2, borderColor: INK, borderRadius: 8,
    backgroundColor: PLATE_FACE, boxShadow: LIP,
  },
  legRow: { position: 'absolute', left: 12, right: 8, height: 25, flexDirection: 'row', alignItems: 'center' },
  legWords: {
    flex: 1, fontFamily: 'Inter_700Bold', fontSize: 12.5, letterSpacing: 0.4,
    color: INK, includeFontPadding: false,
  },
  legArrow: { fontFamily: 'Inter_700Bold', fontSize: 13, color: SOFT, marginHorizontal: 8, includeFontPadding: false },
  legTag: { width: 86, height: 20, borderRadius: 4, backgroundColor: INK, alignItems: 'center', justifyContent: 'center' },
  legTagText: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.1, color: PAPER, includeFontPadding: false },

  // ── the builder's plan ─────────────────────────────────────────────────────
  // Same top edge and height as the legend, so the two hand over in place. The
  // inner box is 164 wide; the base pair (46 + 4 + 46) is centred and the keystone
  // sits centred above it.
  plan: {
    position: 'absolute', left: 116, top: 268, width: 168, height: 62,
    borderWidth: 2, borderColor: INK, borderRadius: 8,
    backgroundColor: PLATE_FACE, boxShadow: LIP,
  },
  planLabel: {
    position: 'absolute', left: 0, right: 0, top: 5, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.5, color: SOFT,
    includeFontPadding: false,
  },
  planGhost: { position: 'absolute', borderWidth: 1.5, borderColor: RULE, borderRadius: 2, borderStyle: 'dashed' },
  planInk: { position: 'absolute', borderWidth: 1.5, borderColor: INK, borderRadius: 2 },
  planKey: { left: 61, top: 20, width: 46, height: 13 },
  planBaseL: { left: 36, top: 36, width: 46, height: 13 },
  planBaseR: { left: 86, top: 36, width: 46, height: 13 },
});

export function Logic2Lesson({ lesson }: { lesson: Lesson }) {
  return (
    <CinematicPlayer
      lesson={lesson}
      beats={BEATS}
      gesture={M_GEST}
      Scene={Logic2Scene}
      Chrome={Logic2Chrome}
      band={[260, 516]}
      shots={SHOTS}
    />
  );
}
