import { useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing, makeMutable, useAnimatedStyle, useDerivedValue, useSharedValue, withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer, { type SceneApi } from './CinematicPlayer';
import {
  BLANK, MOVE_ADV, WALK, boxMove, clamp01, dirsFrom, ease01, easeOutBack, headAt, life2, lerp,
  mixStance, moveTr, narratorHold, narratorLive, pose, stand, travelStance,
  type Bundle, type Stance,
} from './rig';
import {
  Bubble, GROUND, K_FIG, STAGE_H, INK, SOFT, PAPER, carry, lookPose, useCarry,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { floorStyle, lipOf, PLATE_FACE } from './stageSkin';
import type { Shot } from './camera';
import { BEATS, type BoardKey } from './logic1Script';
import AnatomyDiagram from './illustrations/AnatomyDiagram';
import SyllogismChart from './illustrations/SyllogismChart';
import LoudnessChart from './illustrations/LoudnessChart';
import TwoRoadsChart from './illustrations/TwoRoadsChart';

// ─────────────────────────────────────────────────────────────────────────────
// logic-arguments-1, "Arguments Are Not Fights" — ON THE SHARED PLAYER AT LAST.
//
// This lesson and logic-arguments-2 were the last two in the app carrying their
// own copies of `CinematicPlayer` — 1,474 and 945 lines — and that is the whole
// reason they looked wrong. NINE of the validators discover lessons by globbing
// `*Scene.tsx`, so a bespoke `*Lesson.tsx` was invisible to every one of them,
// and every corpus-wide pass keyed on the same glob: the six-swatch palette, the
// depth kit, the gamified controls, the gaze, the wander, the thoughts, the pen
// and the tappable names all reached 244 lessons and skipped these two. A reader
// found it from the outside, on the FIRST lesson in Logic.
//
// WHAT THE PLAYER TAKES OVER, and every item is something this file used to do
// by hand: the deck and its cross-fade, the narration and the rising letters, the
// back-and-forward tap navigation and its guide, the question controls (struck in
// the branch hue, with the verdict seal and the XP coin), the quote plate, the
// scoring, the reward, the thought bubbles, the pen, the wardrobe and the camera.
// Roughly 800 lines of duplicated player went with it.
//
// WHAT THIS FILE KEEPS is the art, unchanged in composition: the coupled boxing
// round, the narrator's walk-on, the framed easel, the scoreboard and the
// Socratic exchange. Only its COLOURS moved — off four local hex literals and
// onto `stageTone('logic')` and the depth kit, which is the redesign.
//
// TWO CAPABILITIES HAD TO BE ADDED TO THE SHARED PLAYER FIRST, because it could
// not express what this lesson does, and a shared player that is not a superset
// of the bespoke one cannot replace it:
//
//   · `Shot.pin` — the ground line is pinned in every shot here, and the shared
//     camera lerped `cy` linearly against a geometric `s`, which sags the floor
//     mid-transition (this lesson's own author measured it and solved it by
//     deriving cy). `pin` derives it instead: 0.0000000000 units of drift.
//   · `Chrome` — the easel, the scoreboard and the exchange hold ONE size on
//     screen while the camera pushes 1.21× → 1.58× on the figures below them.
//     Inside the camera they would zoom and clip, so they are drawn in a layer
//     that is band-clipped and fit-scaled but not camera-transformed.
//
// THE CAMERA IS UNCHANGED, deliberately and to the number: the authored shot
// table below is the one this lesson always had, handed to the player as `shots`
// rather than resolved from verbs, with its ground pin intact.
//
// NOT ONE WORD OF THE SCRIPT MOVED (AH8), and here the rule is stricter than
// usual — 20 of the 25 beats are voiced and keyed by beat index, with the words
// each WAV was rendered from recorded in `assets/narration/renders.json`.
// ─────────────────────────────────────────────────────────────────────────────

// THE STAGE IS STRUCK IN THIS LESSON'S OWN BRANCH HUE (./stageTones), the same
// three tones at the same luminance the old local greys had to the third decimal
// — so every contrast measured against the old local paper grey still holds.
const TONE = stageTone('logic');
const { RULE, STONE, SHADE } = TONE;
const LIP = lipOf(TONE);

//
// ── AND IT DOES NOT CLAIM A WALK (validate-sound §5) ──────────────────────
//
// `walk={X}` is an ASSERTION: "I drive exactly one figure through
// `travelStance(X[p], X[n], …, WALK)` with the default seed", which is the only
// case `./footfalls` solves for. This scene drives its narrator from its own
// staging table (`STAGE[i].nx`, with a per-act transition), which is not that
// shape, and it walks two boxers as well. So the prop is not
// passed, and `validate-sound` re-derives that both ways rather than trusting it.
//
// The price is the one CLAUDE.md already records for three other scenes: the
// player derives the live figure x from `walk`, so a thought bubble on a beat
// where he moves cannot follow him and sits at its measured spot instead. Nothing
// is lost in sound, because the app plays exactly two sounds and neither is a
// footstep (`HEARD` in lib/feedback.ts).

// ── THE BAND ───────────────────────────────────────────────────────
// Unchanged from the bespoke player, and it can be: the pin means the ground line
// lands at one screen place in every shot and through every move, so the extremes
// are bounded by the endpoint scales alone. The un-zoomed chrome literals (frame
// 144…320, scoreboard 144…198, exchange 148…300) set the top; the closest shot's
// ankle joint sets the bottom. So it is 136…516, written as literals below
// because that is what `validate-cinematic` reads (H59).

/** Where the ground line lands on screen — the same for every shot, by design. */
const GROUND_Y = 496;
/**
 * The pin: `s · (GROUND − cy)`, which is what holds the ground line still.
 * Derived from the screen place rather than typed, so the two cannot disagree.
 */
const PIN = GROUND_Y - STAGE_H / 2;          // 216

// Two figures 146 apart at the old 1.35 figure scale → 108 at K_FIG 1.0. Derived
// from K_FIG rather than declared, because rule 3: a file that declares its own
// K_FIG shadows the shared one and silently misses every future correction.
const FIG_SPACING = K_FIG / 1.35;

const FRAME = { x: 56, y: 144, w: 288, h: 176 };
const BOARD = { x: 70, y: 148, w: 259, h: 148 };
const TRAY_Y = 152;
const PLATE_Y = 156;

const RING_L = 80;
const RING_R = 320;
/** Post top. Chest-high on the boxers, so it frames without crowding. */
const POST_T = 420;

/**
 * Where a shout sits, in STAGE space now rather than screen space.
 *
 * The bespoke player drew bubbles outside the camera and had to convert each
 * speaker's head into screen x to keep the tail attached. Inside the camera that
 * conversion is the camera's job, so the bubble takes the head's stage x directly
 * and scales with the man it belongs to — which is what every other lesson does.
 * 340 is the old screen 250 read back through the fight shot (s 1.54, cy 359.7),
 * so it lands where it always did and still clears both crowns.
 */
// WHERE A SHOUT SITS, in SCENE y, converted per beat (see `topOf`). 82 above the
// crown is the gap the bespoke player used.
const BUBBLE_TOP = 340;

// BAND-SPACE x OF EACH BOXER'S HEAD, published by the scene for the chrome.
//
// THE SHOUTS USED TO BE DRAWN INSIDE THE CAMERA, AND THEY WERE CUT. `Bubble`
// clamps a long line so it cannot walk off the stage — against STAGE_W, in the
// coordinates it is drawn in. Inside a camera that is pushed and panned, scene
// 0…400 is NOT what the reader can see: measured on beat 3, #stage-clip runs
// x 16…374 and "NO — YOU'RE WRONG!" ran 120…383, so the last letters of a shout
// were outside the stage while the component's own clamp reported it safely
// inside. `check:frame` calls the camera clean and is right about what it
// measures — it compares the art against the crop, and this is a box the crop
// never contained in the first place.
//
// So the chrome draws them, where the clamp is against the width the reader
// actually has, and the scene — the only place the stances exist — hands over
// where each head is. The conversion is `200 + s·(x − cx)`, from the authored
// shot: `containShot` may pull a scale in a little, which moves a tail by a few
// units and can no longer put a word off the stage.
const SAY_R = makeMutable(200);
const SAY_B = makeMutable(200);

const XFADE = 420;                            // ms — the board-to-board cross-fade

// ── the fight choreography ───────────────────────────────────────────────────
// A real spar is call-and-response, not two people shadow-boxing side by side, so
// the boxers are coupled: each row is one exchange [redMove, blueMove, seconds,
// range], timed so a block or a duck lands right as the punch it answers arrives.
// Every move returns to the guard at its ends, so exchanges chain cleanly.
//
// The fourth number is the exchange's INTENT and the separation is DERIVED from
// it, because every move carries its own lunge and two of them stack — hand-typed
// distances have to remember all of it, which is how an earlier clinch ended up as
// one black blob. `FIGHT_BASE` does the sum.
//
//   0 OUT     112 — circling or falling short. Nothing can reach.
//   1 TRADING  80 — the punch is stopped BY the guard, which is what a blocked
//                   shot looks like: 35 (jab) + 26 (his raised block) + 18.
//   2 LANDING  62 — tighter than the static geometry suggests, deliberately: by
//                   the instant the fist arrives the defender has already begun to
//                   go, which is 20-odd units a static sum does not see.
//   3 CLINCH   76 — close enough to read as leaning together, far enough that two
//                   20-radius heads still show as two.
const RANGE_E = [112, 80, 62, 76];
const FIGHT: [number, number, number, number][] = [
  [15, 15, 0.95, 0],  // circling, sizing each other up — nothing can reach
  [14, 12, 0.50, 1],  // red feints — blue parries at nothing
  [24, 5, 0.70, 1],   // red doubles the jab — blue blocks both
  [1, 7, 0.45, 1],    // red jabs — slipped, and it goes past the ear
  [2, 5, 0.95, 1],    // red cross — blue blocks and gives ground
  [22, 22, 0.55, 0],  // both bounce out, breathing
  [11, 5, 0.80, 1],   // red digs to the body — blue covers
  [5, 10, 0.70, 1],   // blue's lead hook — red blocks
  [6, 3, 0.90, 1],    // blue hooks over the top — red ducks under it
  [2, 21, 0.95, 2],   // RED LANDS THE CROSS — blue's balance goes
  [0, 8, 0.75, 0],    // blue backs off to clear his head
  [15, 25, 0.70, 0],  // red circles; blue wipes his nose
  [4, 13, 1.00, 1],   // red uppercut — blue rolls away from it
  [12, 1, 0.50, 1],   // blue jabs — red parries
  [1, 1, 0.50, 0],    // both jab at once, both fall short
  [18, 19, 0.85, 1],  // red loops one over the top — blue rolls the shoulder
  [21, 2, 0.95, 2],   // BLUE LANDS THE CROSS — red is hurt and gives ground
  [8, 17, 0.85, 0],   // red resets the distance; blue drops his hands
  [10, 23, 0.65, 1],  // red's lead hook — blue pulls straight back off it
  [16, 16, 0.90, 3],  // they fall into a clinch and nothing happens at all
  [20, 8, 0.55, 1],   // red shoves off to make room
  [3, 12, 0.70, 1],   // red hook — parried
  [14, 6, 0.60, 0],   // red feints; blue ducks at air
  [11, 5, 0.75, 1],   // the body again
  [22, 22, 0.70, 0],  // bouncing, breathing, back out of range
];
const FIGHT_DUR = FIGHT.reduce((a, e) => a + e[2], 0);
const FIGHT_START: number[] = (() => {
  let a = 0;
  return FIGHT.map((e) => { const s = a; a += e[2]; return s; });
})();
// Stand far enough back that the LUNGES bring them to the intended distance. Only
// the advancing move counts: a defender's `adv` is negative and on a landing
// exchange his reaction is delayed, so he has not moved yet at the instant the
// punch arrives — which is exactly the instant this has to be right.
const FIGHT_BASE: number[] = FIGHT.map(
  (e) => RANGE_E[e[3]] + Math.max(0, MOVE_ADV[e[0]]) + Math.max(0, MOVE_ADV[e[1]]),
);

/** Resolve the coupled fight pose AND the pair's separation at time t. */
function fightAt(t: number): { red: Stance; blue: Stance; gap: number } {
  'worklet';
  const lap = Math.floor(t / FIGHT_DUR);
  const swap = lap - Math.floor(lap / 2) * 2 === 1;   // odd laps flip who presses
  const tc = t - lap * FIGHT_DUR;
  let idx = 0;
  for (let i = 0; i < FIGHT.length; i++) {
    if (tc < FIGHT_START[i] + FIGHT[i][2]) { idx = i; break; }
  }
  const ex = FIGHT[idx];
  const u = clamp01((tc - FIGHT_START[idx]) / ex[2]);
  const rc = swap ? ex[1] : ex[0];
  const bc = swap ? ex[0] : ex[1];
  // SEEDS 1 AND 2, and they matter more than any single move in the table. Both
  // fighters used to call guard(t) on the same clock with the same frequencies, so
  // they bounced and breathed on identical frames — two bodies moving as one
  // mirrored object, which is most of why the fight read as cheap.
  const R = boxMove(rc, t, u, 1);
  const B = boxMove(bc, t, u, 2);
  // The separation they STAND at, eased from the last exchange's into this one's
  // over the first third — the closing (or the breaking) itself, finished before
  // the punch peaks at ~0.42. Every move's `adv` is zero at both ends, so matching
  // the bases at the boundary makes the whole track continuous.
  const pi = idx > 0 ? idx - 1 : FIGHT.length - 1;
  const gap = lerp(FIGHT_BASE[pi], FIGHT_BASE[idx], ease01(u / 0.34))
    + life2(t, 0.29, 0.17, 0.6) * 2.5;          // a slow non-periodic breath on top
  return { red: R, blue: B, gap };
}

// ── THE NARRATOR'S TRACK ─────────────────────────────────────────────────────
// One x per beat, written down rather than derived, and it only ever moves RIGHT.
// SKATING is why it exists: a rule ("132 under the board, 200 alone") slid him 131
// units the instant he arrived and then 68 units back and forth four times, feet
// planted. TURNING is why it is monotonic — `dir` is ±1 and flips in one frame, so
// a figure that walks left then right snaps between mirrored copies of itself.
const NARR_X: number[] = [
  -50, -50, -50, -50,                          // act 1 — off-stage left, waiting
  46, 128, 146, 146, 168,                      // act 2 — walks on, then to the easel
  168, 168, 186, 186, 196, 196, 196, 206, 206, // act 3 — a few steps, never back
  206, 206, 206, 206, 206,                     // act 4 — gone, but parked where he left
  206, 206,                                    // act 5
];
/** All +1 while the track is monotonic — kept honest in case it ever isn't. */
const NARR_DIR = dirsFrom(NARR_X, 1);

// Every scale is measured against what else is on stage that beat. The ground is
// pinned, so a crown lands at 496 − 141·s and the only question is what sits above
// it: a BOARD beat must clear the easel (ends at screen 320) → 1.21; a RING beat
// must clear the shouts (~254) → ≤1.65; a STACK beat must clear the stamp (300) →
// ≤1.83; a SOLO beat has only the 54-tall scoreboard → ≤2.0.
const S_FIGHT = 1.54;
const S_WALK = 1.22;
const S_BOARD = 1.21;
const S_SOLO = 1.58;
const S_STACK = 1.46;
const S_REMATCH = 1.55;

/**
 * THE STAGING TABLE — one row per beat, and it used to BE the shot table.
 *
 * The bespoke player's `Shot` carried the camera and the placement of all three
 * figures in one record, which is why it could not be handed to the shared player:
 * a shared `Shot` is camera only. Split here, the same numbers drive both — the
 * camera table below is derived from this one rather than typed twice.
 */
interface Stage {
  s: number; cx: number; tr: number;
  rx: number; rOn: number; rMode: number;
  bx: number; bOn: number; bMode: number;
  nx: number; nOn: number; nMode: number;
  ring: number;
}

const STAGE: Stage[] = BEATS.map((b, i) => {
  const base: Stage = {
    s: 1, cx: 200, tr: 0.75,
    rx: 200 - 73 * FIG_SPACING, rOn: 0, rMode: 0,
    bx: 200 + 73 * FIG_SPACING, bOn: 0, bMode: 0,
    nx: NARR_X[i], nOn: 0, nMode: 2,
    ring: 0,
  };
  if (b.act === 1) {
    // Close on the ring. 108 apart, set by the LUNGES rather than the resting
    // stance: a real exchange closes them to about 67, which is where a
    // full-reach punch arrives AT the head rather than through it.
    return { ...base, s: S_FIGHT, rOn: 1, bOn: 1, ring: 1 };
  }
  if (b.act === 2) {
    const first = BEATS.findIndex((x) => x.act === 2) === i;
    return {
      ...base,
      s: first ? S_WALK : b.board ? S_BOARD : S_SOLO,
      // Tied to the SCREEN distance, not the stage one: he covers 96 stage units
      // while the camera pulls back 1.54 → 1.22, which is 226 units of screen
      // travel, and 2.2s puts that at a walk's own pace.
      tr: first ? 2.2 : 0.75,
      // The camera sits LEFT of centre for the entrance purely to buy paper
      // between him and the fight — 80 units of clear air instead of 52.
      cx: first ? 176 : 200,
      rOn: first ? 1 : 0, bOn: first ? 1 : 0, ring: first ? 1 : 0,
      nOn: 1, nMode: first ? 3 : b.board ? 2 : 1,
    };
  }
  if (b.act === 3) {
    // He holds a mark and the CAMERA reframes — closest where the only thing above
    // him is the exchange. The board never constrains him: its frame ends at 320
    // and his crown lands at 346 or lower.
    return { ...base, s: b.board ? S_BOARD : b.stack ? S_STACK : S_SOLO, nOn: 1, nMode: b.board ? 2 : 1 };
  }
  if (b.act === 4) {
    // The rematch: same two figures, standing, calm — the closest shot in the
    // lesson, because nothing else is on stage to make room for.
    return {
      ...base, s: S_REMATCH,
      rx: 200 - 52 * FIG_SPACING, bx: 200 + 52 * FIG_SPACING,
      rOn: 1, bOn: 1, rMode: 1, bMode: 1,
    };
  }
  return base;                                 // act 5 — nobody on stage
});

// A beat that MOVES the narrator needs a transition as long as the walk actually
// takes. Left flat, the same strides get crammed into whatever the cross-fade
// happens to be — the documented reason a walk reads as a sprint (rig `moveTr`).
for (let i = 1; i < STAGE.length; i++) {
  if (STAGE[i].nMode === 3) continue;          // the entrance sets its own
  STAGE[i].tr = moveTr(STAGE[i - 1].nx, STAGE[i].nx, STAGE[i].tr);
}

/**
 * The camera, handed to the player as an authored table.
 *
 * `cy` is DERIVED from the scale through the pin rather than stored, exactly as
 * the bespoke player derived it, and `pin` tells the shared camera to keep
 * deriving it through every move instead of lerping it. That one field is the
 * difference between this lesson's floor holding still and sagging on every tap.
 */
const SHOTS: Shot[] = STAGE.map((st) => ({
  cx: st.cx, cy: GROUND - PIN / st.s, s: st.s, tr: st.tr, pin: PIN,
}));

// ── channels ─────────────────────────────────────────────────────────────────
const VOL: number[] = BEATS.map((b) => b.vol ?? -1);
const REA: number[] = BEATS.map((b) => b.reasons ?? -1);
const STACK: number[] = BEATS.map((b) => b.stack ?? 0);
const NARR_G: number[] = BEATS.map((b) => b.narr ?? 0);
const RED_TALK: boolean[] = BEATS.map((b) => !!b.say?.some((s) => s.who === 'red'));
const BLUE_TALK: boolean[] = BEATS.map((b) => !!b.say?.some((s) => s.who === 'blue'));
const BOARD_OF: (BoardKey | null)[] = BEATS.map((b) => b.board ?? null);

const BOARDS: Record<BoardKey, React.ComponentType<{ p: SharedValue<number>; w?: number; h?: number }>> = {
  anatomy: AnatomyDiagram,
  syllogism: SyllogismChart,
  loudness: LoudnessChart,
  tworoads: TwoRoadsChart,
};

const BOARD_TITLE: Record<BoardKey, string> = {
  anatomy: 'ANATOMY OF AN ARGUMENT',
  syllogism: 'ARISTOTLE’S SYLLOGISM',
  loudness: 'VOLUME IS NOT A REASON',
  tworoads: 'TWO REASONS TO ARGUE',
};

const STACK_ROWS = [
  { text: 'WHO IMPROVES THE YOUNG?', ask: true },
  { text: 'EVERYONE BUT YOU.', ask: false },
  { text: 'AND WITH HORSES — EVERYONE?', ask: true },
];
/** What the chrome driver hands its three graphics — one shape, so no prop narrows it. */
interface Graph {
  scoreOn: number; stackOn: number; s0: number; s1: number; s2: number; stampU: number;
}

const STACK_TOP = 148;
const STACK_ROW_H = 34;
const STACK_GAP = 8;

// ── THE SCENE: the ring, the three figures, the shouts ───────────────────────
export default function Logic1Scene({
  clock, bt, bi, i, gazeX, gazeY, gazeOn,
}: SceneApi) {
  // Every interpolated track is CARRIED (AH4/L5): a plain lerp from the previous
  // beat's TARGET starts from where that beat was heading rather than from what is
  // on screen, so a tap mid-transition covers the whole remaining distance in one
  // frame. `carry` is lerp with a memory and takes the same numbers.
  const cv = useCarry(9);

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const cur = STAGE[n];
    const prv = STAGE[p];
    const tr = ease01(bt.value / cur.tr);
    const t = clock.value;

    // Red and blue. In fight mode they are coupled through `fightAt` (one attacks,
    // the other answers); otherwise they stand — the speaker gesturing — and blend
    // from the previous beat's pose so tapping between beats never snaps a hand.
    let redS: Stance;
    let blueS: Stance;
    let fightGap = -1;
    if (cur.rMode === 0 && cur.bMode === 0) {
      const F = fightAt(t);
      redS = F.red; blueS = F.blue; fightGap = F.gap;
    } else {
      const rFrom = RED_TALK[p] ? narratorHold(0, t) : stand(t);
      const bFrom = BLUE_TALK[p] ? narratorHold(0, t) : stand(t);
      const rTo = RED_TALK[n] ? narratorLive(0, t, bt.value) : stand(t);
      const bTo = BLUE_TALK[n] ? narratorLive(0, t, bt.value) : stand(t);
      redS = mixStance(rFrom, rTo, tr);
      blueS = mixStance(bFrom, bTo, tr);
    }

    // The narrator, through the ONE canonical body motion every other lesson uses.
    // `travelStance` picks: if the beat moves him he WALKS there, feet driven by
    // distance so they never skate; if it doesn't, the previous beat's settled pose
    // blends into this beat's living one. If the previous beat was the entrance (or
    // he was off stage) the blend starts from a plain stand, so there is no phantom
    // gesture to come out of.
    const fromHold = STAGE[p].nMode === 3 || STAGE[p].nOn < 0.5
      ? stand(t)
      : narratorHold(NARR_G[p], t);
    const narrS = travelStance(
      prv.nx, cur.nx,
      fromHold,
      narratorHold(NARR_G[n], t),
      narratorLive(NARR_G[n], t, bt.value),
      tr, WALK, 0,
    );

    // Root motion: a lunge carries the whole body, so a punch reads as aimed at
    // someone rather than as shadow-boxing. In the fight the pair are placed from
    // the choreography's own range track — they close to trade and open to circle —
    // rather than from two fixed marks; in the rematch the table owns them.
    const rx = fightGap > 0
      ? 200 - fightGap / 2 + redS.adv
      : carry(cv, 0, n, prv.rx, cur.rx, tr) + redS.adv;
    const bx = fightGap > 0
      ? 200 + fightGap / 2 - blueS.adv
      : carry(cv, 1, n, prv.bx, cur.bx, tr) - blueS.adv;
    const nx = carry(cv, 2, n, prv.nx, cur.nx, tr);
    const rOn = carry(cv, 3, n, prv.rOn, cur.rOn, tr);
    const bOn = carry(cv, 4, n, prv.bOn, cur.bOn, tr);
    // He is SOLID before he is visible. Fading him up across the whole entrance
    // made him materialise out of the paper two-thirds of the way in — a ghost
    // condensing beside the fight rather than someone walking on from the wing. He
    // starts at stage −50, so ramping over the first fifth finishes it while he is
    // still off-stage and the reader only ever sees a solid figure walk in.
    const nOn = cur.nMode === 3
      ? ease01(clamp01(tr / 0.2))
      : carry(cv, 5, n, prv.nOn, cur.nOn, tr);

    return {
      // CARRIED like the rest (L5): the ring fades at an act boundary, and a plain
      // lerp from the previous beat's target jumps if the reader taps mid-fade.
      ring: carry(cv, 8, n, prv.ring, cur.ring, tr),
      // The camera's live framing, so the chrome can put a shout over the head of
      // whoever is speaking (see SAY_R). Carried for the same reason.
      cs: carry(cv, 6, n, SHOTS[p].s, SHOTS[n].s, tr),
      ccx: carry(cv, 7, n, SHOTS[p].cx, SHOTS[n].cx, tr),
      // Where each speaker's HEAD is, so a shout can sit over it. Pointing at the
      // spot between the feet put every tail a head's width wide, because a boxer
      // leans in and his head is six units ahead of his stance.
      rxs: rx + headAt(redS.tilt, redS.neck).x,
      bxs: bx - headAt(blueS.tilt, blueS.neck).x,
      red: rOn > 0.002 ? pose(redS, rx, GROUND, K_FIG, 1, rOn) : BLANK,
      blue: bOn > 0.002 ? pose(blueS, bx, GROUND, K_FIG, -1, bOn) : BLANK,
      // THE NARRATOR IS THE MASCOT HERE — the two boxers are the argument — so he
      // is the one the shared figure layers belong on: `lookPose` turns him toward
      // what the beat draws, nods him on a right answer and draws him back on a
      // wrong one, and runs the wander that moves his whole body between taps. The
      // boxers keep plain `pose`: a fighter agreeing with your answer would be the
      // picture disagreeing with the lesson.
      narr: nOn > 0.002
        ? lookPose(narrS, nx, GROUND, K_FIG, NARR_DIR[n], nOn, gazeX.value, gazeY.value, gazeOn.value)
        : BLANK,
    };
  });

  // The two shouts' band-space x, written where the stances are known. Carried,
  // like every other track here (L5): a plain lerp of the camera between two beats
  // starts from where the last beat was heading rather than from what is on screen.
  useDerivedValue(() => {
    const v = SCENE.value;
    SAY_R.value = 200 + v.cs * (v.rxs - v.ccx);
    SAY_B.value = 200 + v.cs * (v.bxs - v.ccx);
    return 0;
  });

  const DR = useDerivedValue<Bundle>(() => SCENE.value.red);
  const DB = useDerivedValue<Bundle>(() => SCENE.value.blue);
  const DN = useDerivedValue<Bundle>(() => SCENE.value.narr);
  const ringStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.ring }));

  const st = STAGE[i];
  const beat = BEATS[i];
  const prevBeat = i > 0 ? BEATS[i - 1] : undefined;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* THE RING. Act 1 used to be two figures on a bare rule, which read as
          "nowhere". It is a raised canvas: a front edge with an end cap each side
          so the mat has thickness, and a corner post standing on each end. All of
          it RULE weight and behind the boxers, so it builds the place without
          competing — and no rope, because a rope at head height rules a line
          straight through both faces. */}
      <Animated.View style={[StyleSheet.absoluteFill, ringStyle]} pointerEvents="none">
        <View style={styles.matEdge} />
        <View style={[styles.matCap, { left: RING_L }]} />
        <View style={[styles.matCap, { left: RING_R }]} />
        <View style={[styles.post, { left: RING_L - 1.5 }]} />
        <View style={[styles.post, { left: RING_R - 1.5 }]} />
        <View style={[styles.turnbuckle, { left: RING_L - 6.5 }]} />
        <View style={[styles.turnbuckle, { left: RING_R - 6.5 }]} />
      </Animated.View>

      {/* THE FLOOR, from the depth kit — a band with a lit near edge and a shaded
          foot, where this lesson used to draw 1.5pt of rule and nothing else. It is
          drawn first so it sits behind everything and is clipped by the band. */}
      <View style={floorStyle(TONE, GROUND)} pointerEvents="none" />

      {/* THE BOXERS ARE A CROWD, in the wardrobe's own sense: the narrator is the
          mascot (he is the one `lookPose` poses, which is how `scenefig` identifies
          him), and wardrobeContext's rule is that two figures are an argument and
          get two looks while more than two get none. Without a role all three wore
          the lead's costume — and two boxers in matching top hats is a worse
          picture than two bare ones. */}
      {st.rOn > 0 ? <Stickman D={DR} k={K_FIG} gloves={beat.act === 1} role="crowd" /> : null}
      {st.bOn > 0 ? <Stickman D={DB} k={K_FIG} gloves={beat.act === 1} role="crowd" /> : null}
      {st.nOn > 0 ? <Stickman D={DN} k={K_FIG} /> : null}
    </View>
  );
}

// ── THE CHROME: what the camera does not move ────────────────────────────────
// The easel, the scoreboard and the exchange are diagrams a reader keeps reading
// while the shot pushes from 1.21× to 1.58× on the figures below them, so they are
// drawn outside the camera at one size. See `Chrome` on CinematicPlayer.
export function Logic1Chrome({ bt, bi, i }: SceneApi) {
  const GRAPH = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    // Asymmetric: a card LEAVES quickly and ARRIVES unhurried, so a graphic on its
    // way out is gone before the board replacing it has drawn anything — the two
    // never sit on top of each other at half opacity.
    const away = 1 - ease01(bt.value / 0.25);
    const here = ease01(bt.value / 0.7);
    const swap = (was: boolean, now: boolean) => {
      'worklet';
      return now ? (was ? 1 : here) : was ? away : 0;
    };
    const rise = ease01(bt.value / 0.55);
    // On the way OUT the rows hold their last state while the card fades, rather
    // than emptying a frame before it disappears.
    const cnt = STACK[n] > 0 ? STACK[n] : STACK[p];
    const stackRow = (k: number) => {
      'worklet';
      return k < STACK[p] ? 1 : k < cnt ? rise : 0;
    };
    return {
      scoreOn: swap(VOL[p] >= 0, VOL[n] >= 0),
      stackOn: swap(STACK[p] > 0, STACK[n] > 0),
      s0: stackRow(0), s1: stackRow(1), s2: stackRow(2),
      stampU: cnt >= 3 ? (STACK[p] >= 3 ? 1 : clamp01((bt.value - 0.45) / 0.4)) : 0,
    };
  });

  const p = i > 0 ? i - 1 : 0;
  const beat = BEATS[i];
  const prevBeat = i > 0 ? BEATS[i - 1] : undefined;
  // A SHOUT KEEPS ITS DISTANCE FROM THE HEAD, and the head's screen place depends
  // on the beat's own scale (1.21…1.58 here), so one band constant would hang it
  // 57 units off the crown at one end of that range. The scene-space gap is
  // converted per beat instead, and the leaving bubble is converted with the beat
  // it belongs to rather than the one arriving.
  const topOf = (k: number) => Math.round(GROUND_Y + SHOTS[k].s * (BUBBLE_TOP - GROUND));
  const volLevel = VOL[i] >= 0 ? VOL[i] : VOL[p] >= 0 ? VOL[p] : 0;
  const reaLevel = REA[i] >= 0 ? REA[i] : REA[p] >= 0 ? REA[p] : 0;
  const volFrom = VOL[p] >= 0 ? VOL[p] : volLevel;
  const reaFrom = REA[p] >= 0 ? REA[p] : reaLevel;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <BoardStage boardKey={BOARD_OF[i]} />
      <Scoreboard
        bt={bt} G={GRAPH}
        vol={volLevel} reasons={reaLevel} volFrom={volFrom} reasonsFrom={reaFrom}
      />
      <SocraticStack G={GRAPH} />

      {/* The PREVIOUS beat's shouts stay mounted for a moment so they fade out with
          everything else, rather than being the one graphic cut dead on the tap. */}
      {prevBeat?.say?.map((s) => (
        <Bubble
          key={`out-${s.who}-${s.text}`}
          bt={bt} text={s.text} top={topOf(p)} leaving
          x={s.who === 'red' ? SAY_R : SAY_B}
          shout={prevBeat.act === 1}
        />
      ))}
      {beat.say?.map((s) => (
        <Bubble
          key={`${s.who}-${s.text}`}
          bt={bt} text={s.text} top={topOf(i)}
          x={s.who === 'red' ? SAY_R : SAY_B}
          shout={beat.act === 1}
        />
      ))}
    </View>
  );
}

// ── the illustration board, cross-faded ──────────────────────────────────────
// Each board has its OWN draw-on progress, so the incoming one draws itself while
// the outgoing holds its finished state and fades — two values, which is why this
// cannot reuse the generic Fade. The FRAME travels with its illustration: mounted
// separately it snapped out of existence while the drawing inside went on fading,
// and the picture hung frameless in mid-air.
function BoardStage({ boardKey }: { boardKey: BoardKey | null }) {
  const fade = useSharedValue(1);
  const curP = useSharedValue(1);
  const prevP = useSharedValue(1);
  const lastKey = useRef<BoardKey | null>(boardKey);
  const prevKey = useRef<BoardKey | null>(null);

  if (boardKey !== lastKey.current) {
    prevKey.current = lastKey.current;
    lastKey.current = boardKey;
    prevP.value = 1;
    fade.value = 0;
    fade.value = withTiming(1, { duration: XFADE, easing: Easing.inOut(Easing.cubic) });
    curP.value = 0;
    curP.value = withTiming(1, { duration: 2600, easing: Easing.out(Easing.cubic) });
  }

  const curStyle = useAnimatedStyle(() => ({ opacity: fade.value }));
  const prevStyle = useAnimatedStyle(() => ({ opacity: 1 - fade.value }));

  const curK = boardKey;
  const prevK = prevKey.current;
  const Cur = curK ? BOARDS[curK] : null;
  const Prev = prevK ? BOARDS[prevK] : null;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Prev && prevK ? (
        <Animated.View style={[StyleSheet.absoluteFill, prevStyle]} pointerEvents="none">
          <BoardFrame title={BOARD_TITLE[prevK]} />
          <View style={{ position: 'absolute', left: BOARD.x, top: BOARD.y }}>
            <Prev p={prevP} w={BOARD.w} h={BOARD.h} />
          </View>
        </Animated.View>
      ) : null}
      {Cur && curK ? (
        <Animated.View style={[StyleSheet.absoluteFill, curStyle]} pointerEvents="none">
          <BoardFrame title={BOARD_TITLE[curK]} />
          <View style={{ position: 'absolute', left: BOARD.x, top: BOARD.y }}>
            <Cur p={curP} w={BOARD.w} h={BOARD.h} />
          </View>
        </Animated.View>
      ) : null}
    </View>
  );
}

/** The framed easel, drawn BEFORE the illustration so the paper sits behind the strokes. */
function BoardFrame({ title }: { title: string }) {
  return (
    <View pointerEvents="none" style={styles.frame}>
      <View style={styles.tray} />
      <Text style={styles.frameTitle} numberOfLines={1}>{title}</Text>
    </View>
  );
}

// ── the scoreboard ───────────────────────────────────────────────────────────
// Two ten-cell meters keeping the count the whole lesson turns on: how loud it has
// got, and how many reasons have actually been given. Act 1 drives VOLUME to full
// with REASONS flat on zero; act 4 replays the same disagreement with the numbers
// the other way round.
const CELLS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

// ONLY THE CELLS THAT CHANGED MAY ANIMATE. This was "the box above the stage
// glitches on every tap", and it is a `bt` bug: cell opacity was `(bt − k·0.045)/
// 0.2`, and `bt` resets on every beat change, so all ten cells of an already-full
// meter dropped to nothing and swept back in. A cell now knows whether it was lit
// LAST beat as well as this one.
function Cell({
  bt, k, from, was, now,
}: { bt: SharedValue<number>; k: number; from: number; was: boolean; now: boolean }) {
  const st = useAnimatedStyle(() => {
    if (was && now) return { opacity: 1 };
    if (now) return { opacity: clamp01((bt.value - 0.22 - (k - from) * 0.05) / 0.22) };
    if (was) return { opacity: 1 - clamp01(bt.value / 0.22) };
    return { opacity: 0 };
  });
  return (
    <View style={styles.cell}>
      <Animated.View style={[styles.cellFill, st]} />
    </View>
  );
}

function MeterRow({
  bt, label, from, to, top,
}: { bt: SharedValue<number>; label: string; from: number; to: number; top: number }) {
  return (
    <View style={[styles.meterRow, { top }]}>
      <Text style={styles.meterLabel} numberOfLines={1}>{label}</Text>
      <View style={styles.cells}>
        {CELLS.map((k) => (
          <Cell key={k} bt={bt} k={k} from={from} was={k < from} now={k < to} />
        ))}
      </View>
    </View>
  );
}

function Scoreboard({
  bt, G, vol, reasons, volFrom, reasonsFrom,
}: {
  bt: SharedValue<number>;
  G: SharedValue<Graph>;
  vol: number; reasons: number; volFrom: number; reasonsFrom: number;
}) {
  const card = useAnimatedStyle(() => ({ opacity: G.value.scoreOn }));
  return (
    <Animated.View style={[styles.score, card]} pointerEvents="none">
      <MeterRow bt={bt} label="VOLUME" from={volFrom} to={vol} top={8} />
      <MeterRow bt={bt} label="REASONS" from={reasonsFrom} to={reasons} top={28} />
    </Animated.View>
  );
}

// ── the Socratic exchange ────────────────────────────────────────────────────
// Three lines of the Apology's cross-examination as a stack: question, answer, the
// question that broke it — then CONTRADICTION comes down across the whole exchange
// like a stamp. Questions are inked boxes; the answer is dashed, because it is the
// thing that turns out not to hold.
function SocraticStack({ G }: { G: SharedValue<Graph> }) {
  const wrap = useAnimatedStyle(() => ({ opacity: G.value.stackOn }));
  const r0 = useAnimatedStyle(() => ({ opacity: G.value.s0, transform: [{ translateX: (1 - G.value.s0) * -14 }] }));
  const r1 = useAnimatedStyle(() => ({ opacity: G.value.s1, transform: [{ translateX: (1 - G.value.s1) * 14 }] }));
  const r2 = useAnimatedStyle(() => ({ opacity: G.value.s2, transform: [{ translateX: (1 - G.value.s2) * -14 }] }));
  const rows = [r0, r1, r2];
  const stamp = useAnimatedStyle(() => {
    const u = G.value.stampU;
    return {
      opacity: clamp01(u / 0.35),
      transform: [{ rotate: '-7deg' }, { scale: lerp(1.3, 1, easeOutBack(u)) }],
    };
  });

  return (
    <Animated.View style={[StyleSheet.absoluteFill, wrap]} pointerEvents="none">
      {STACK_ROWS.map((r, k) => (
        <Animated.View
          key={r.text}
          style={[
            styles.stackRow,
            r.ask ? styles.stackAsk : styles.stackAns,
            { top: STACK_TOP + k * (STACK_ROW_H + STACK_GAP) },
            rows[k],
          ]}
        >
          <Text style={[styles.stackText, !r.ask && styles.stackTextSoft]} numberOfLines={1}>
            {r.text}
          </Text>
        </Animated.View>
      ))}
      <Animated.View style={[styles.stamp, stamp]}>
        <Text style={styles.stampText} numberOfLines={1}>CONTRADICTION</Text>
      </Animated.View>
    </Animated.View>
  );
}

// Every plate that STANDS now stands on a hard ledge of its own shaded tone, and
// every face is the kit's white rather than bare paper — the depth kit (group AG),
// which is the half of the redesign that is not the palette. A border WIDTH is
// never touched by the kit: it shrinks the content area and can re-wrap a word.
const styles = StyleSheet.create({
  matEdge: {
    position: 'absolute', left: RING_L, width: RING_R - RING_L, top: GROUND + 6, height: 1.5,
    backgroundColor: RULE,
  },
  matCap: { position: 'absolute', width: 1.5, top: GROUND, height: 7.5, backgroundColor: RULE },
  post: { position: 'absolute', width: 3, top: POST_T, height: GROUND + 7.5 - POST_T, backgroundColor: RULE },
  turnbuckle: {
    position: 'absolute', width: 13, top: POST_T - 2, height: 6, borderRadius: 2,
    backgroundColor: RULE,
  },

  frame: {
    position: 'absolute', left: FRAME.x, top: FRAME.y, width: FRAME.w, height: FRAME.h,
    borderWidth: 2, borderColor: INK, borderRadius: 8, backgroundColor: PLATE_FACE,
    boxShadow: LIP,
  },
  tray: { position: 'absolute', left: 10, right: 10, top: TRAY_Y, height: 1, backgroundColor: RULE },
  frameTitle: {
    position: 'absolute', left: 8, right: 8, top: PLATE_Y, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1.5, color: SOFT,
    includeFontPadding: false,
  },

  score: {
    position: 'absolute', left: 42, top: 144, width: 320, height: 54,
    borderWidth: 2, borderColor: INK, borderRadius: 8, backgroundColor: PLATE_FACE,
    boxShadow: LIP,
  },
  meterRow: { position: 'absolute', left: 10, right: 10, height: 14, flexDirection: 'row', alignItems: 'center' },
  meterLabel: {
    width: 84, fontFamily: 'Inter_700Bold', fontSize: 12, letterSpacing: 0.8,
    color: INK, includeFontPadding: false,
  },
  cells: { flexDirection: 'row', gap: 2.2 },
  cell: { width: 18, height: 14, borderWidth: 1.5, borderColor: SHADE, borderRadius: 2, backgroundColor: STONE },
  cellFill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: INK },

  stackRow: {
    position: 'absolute', left: 62, right: 62, height: STACK_ROW_H,
    borderWidth: 2, borderRadius: 8, backgroundColor: PLATE_FACE, boxShadow: LIP,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12,
  },
  stackAsk: { borderColor: INK },
  stackAns: { borderColor: SHADE, borderStyle: 'dashed' },
  stackText: {
    fontFamily: 'Inter_700Bold', fontSize: 12.5, letterSpacing: 0.3, color: INK,
    textAlign: 'center', includeFontPadding: false,
  },
  stackTextSoft: { color: SOFT },
  stamp: {
    position: 'absolute', left: 116, top: 274, width: 168, height: 26,
    backgroundColor: INK, borderRadius: 3, alignItems: 'center', justifyContent: 'center',
  },
  stampText: {
    fontFamily: 'Inter_700Bold', fontSize: 12, letterSpacing: 1.6, color: PAPER,
    includeFontPadding: false,
  },
});

// The band is unchanged from the bespoke player and the pin is why it can be: the
// ground lands at one screen place in every shot and all the way through every
// move, so the extremes are bounded by the endpoint scales alone. The un-zoomed
// chrome sets the top (frame 144…320) and the closest shot's ankle sets the
// bottom, so the art spans 364 of the 380 and nothing can clip.
export function Logic1Lesson({ lesson }: { lesson: Lesson }) {
  return (
    <CinematicPlayer
      lesson={lesson}
      beats={BEATS}
      gesture={NARR_G}
      Scene={Logic1Scene}
      Chrome={Logic1Chrome}
      band={[136, 516]}
      shots={SHOTS}
    />
  );
}
