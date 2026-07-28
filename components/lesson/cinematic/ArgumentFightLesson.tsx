import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, Pressable, StyleSheet, type LayoutChangeEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, {
  useSharedValue, useDerivedValue, useAnimatedStyle, useFrameCallback,
  withTiming, Easing, FadeInDown, LinearTransition, runOnJS, type SharedValue,
} from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import { getLessonById } from '@/data';
import SketchIcon from '@/components/shared/SketchIcon';
import { useUserDataStore } from '@/stores/userDataStore';
import { useUIStore } from '@/stores/uiStore';
import Stickman from './Stickman';
import AnatomyDiagram from './illustrations/AnatomyDiagram';
import SyllogismChart from './illustrations/SyllogismChart';
import LoudnessChart from './illustrations/LoudnessChart';
import TwoRoadsChart from './illustrations/TwoRoadsChart';
import { BEATS, gates, type Beat, type BoardKey } from './argumentScript';
import {
  BLANK, WALK, boxMove, clamp01, ease01, easeOutBack, lerp, mixStance, narratorHold,
  narratorLive, pose, seg, stand, walk, type Bundle, type Stance,
} from './rig';

// ─────────────────────────────────────────────────────────────────────────────
// The cinematic runner for logic-arguments-1.
//
// One continuous scene, advanced by TAP. Two clocks drive everything:
//   clock — never resets. Idle life: breathing, bobbing, the boxing exchange.
//   bt    — beat-local, resets on every advance. Transitions and text reveals.
// Keeping them separate is what stops the fight restarting every time the reader
// taps, while still letting each beat stage its own entrance.
//
// LAYOUT. The animated stage is a fixed 400×560 design space scaled to whatever
// room is left between the header and the narration block. Narration and the
// interaction panels deliberately live OUTSIDE that scaled stage, in normal RN
// layout — scaled text goes soft and scaled tap targets shrink.
//
// PERFORMANCE. Figures are native Views (see Stickman.tsx); the only SVG is the
// 280×160 illustration board, which is bounded and mounted only while its beat
// is on screen. A full-screen animated <Svg> measured ~10fps on an S24 Ultra.
// ─────────────────────────────────────────────────────────────────────────────

const INK = '#1A1A1A';
const PAPER = '#FAFAF7';
const SOFT = '#6B6B6B';
const RULE = '#E4E1D8';

const STAGE_W = 400;
const STAGE_H = 560;
const GROUND = 500;
// Stage units per rig unit — the SAME 1.0 every other lesson uses (cinematicKit's
// K_FIG). This file used to carry its own 1.35, which is why the first two lessons
// drew figures 35% larger than the other 46: a local constant shadowing the shared
// one never got the size correction. 103 units tall, crown at y 397.
//
// Two things had to move with it. The boxers' 130-unit separation was DERIVED from
// their own head size ("anything tighter and the pair reads as a single dark
// shape"), so it is a figure-to-figure distance and scales with them — otherwise
// smaller boxers just drift apart and the squaring-off reads limp. The speech
// bubbles sit at literal stage positions OUTSIDE the camera and were pinned just
// above the old crowns, so they had to come down to the new ones or they float.
// The ring, the board and the scoreboard are props at fixed sizes and do NOT move:
// the figure shrinking against them is the whole point of the change.
const K_FIG = 1.0;
/** Figure-to-figure distances were tuned at 1.35; scale them with the body. */
const FIG_SPACING = K_FIG / 1.35;

// ── THE BAND ────────────────────────────────────────────────────────────────
// The stage REGION on a phone is wide and short (roughly 923×647 device px) while
// this design space is tall and narrow (400×560). Fitting all 560 letterboxes the
// scene to about 1.15× and throws away half the width — which is why everything
// read small on a real device. So the stage CROPS to the slice that actually holds
// art and scales that up instead, roughly 1.9× — nearly double.
//
// Making that pay off needs one discipline in the camera: the GROUND LINE is
// pinned to the same place on screen in every shot AND all the way through every
// transition. `cy` is therefore NOT interpolated between shots — it is DERIVED
// from the interpolated scale as  cy = GROUND − 216/s,  which collapses the camera
// map to
//     y' = 496 + s · (y − 500)
// exactly, at every instant. (Lerping cy independently let the product s·(500−cy)
// bulge ~5 units mid-transition, so the floor sagged on every tap and the band had
// to carry slack for it.) With the pin exact, the extremes are bounded by the
// endpoint scales alone — nothing to measure but the six shots:
//   board frame    (outside the camera, literal)   144 … 320
//   scoreboard     (outside the camera, literal)   144 … 198
//   Socratic stack (outside the camera, literal)   148 … 275  (incl. the stamp)
//   speech bubbles (outside the camera, literal)   208 … 272
//   solo crown           y 397, s 1.58             → 333
//   ring crown           y 397, s 1.54             → 337
//   stack crown          y 397, s 1.46             → 346
//   board-beat crown     y 397, s 1.21             → 371
// (crowns are at 397, not the old 359: see K_FIG. They sit LOWER now, so the band
// top is still set by the un-zoomed literals above and nothing new can clip.)
//   ring turnbuckles     y 418, s 1.54             → 370
//   ground rule          y 501                     → 497.5
//   mat edge + caps      y 507.5, s 1.54           → 507.6
//   ring post feet       y 507.5, s 1.54           → 507.6
//   ankle joints         y 507, s 1.58             → 508
// so [136, 516] holds every pixel any beat can draw, with ~8 units at each end.
// The band cannot usefully be tighter: 144 is a literal, un-zoomed graphic edge
// (frame / scoreboard) and 508 is the ankle joint under the closest shot, so the
// art genuinely spans 364 of the 380.
const BAND_T = 136;
const BAND_B = 516;
const BAND_H = BAND_B - BAND_T;

// The illustration board, and the framed easel it now hangs in. Every board keeps
// the 280×160 aspect its viewBox is drawn at — a different aspect just letterboxes
// inside the <Svg> and wastes the room. Frame outer 144…320, inner 146…318; the
// illustration fills 148…296 and the tray + title plate take the last 22.
const FRAME = { x: 56, y: 144, w: 288, h: 176 };
const BOARD = { x: 70, y: 148, w: 259, h: 148 };
const TRAY_Y = 152;                       // both relative to the frame's inner box
const PLATE_Y = 156;

/** Where the ground line lands on screen — the same for every shot, by design. */
const GROUND_Y = 496;

// The ring: the mat runs RING_L…RING_R and a corner post stands on each end. Both
// ends are pulled in from the old 74/326 so that at the ring's 1.54× the posts and
// their turnbuckles land at screen x 15 and 385 — framing the fight instead of
// being sliced in half by the edge of the stage.
const RING_L = 80;
const RING_R = 320;
/** Post top. Chest-high on the boxers (their crowns land at 337), so it frames without crowding. */
const POST_T = 420;

const COMPLETION_XP = 5;                  // matches LessonRunner
const XFADE = 420;                        // ms — the beat-to-beat cross-fade (deliberately unhurried)

// ── the fight choreography ───────────────────────────────────────────────────
// A real spar is call-and-response, not two people shadow-boxing side by side, so
// the boxers are coupled: each row is one exchange [redMove, blueMove, seconds],
// timed so a block or a duck lands right as the punch it answers arrives. Move
// codes: 0 guard·1 jab·2 cross·3 hook·4 uppercut·5 block·6 duck·7 slip·8 backstep·
// 9 hit. Every move returns to the guard at its ends, so exchanges chain cleanly.
//
// Roughly 14s of distinct action. When it loops, the aggressor is swapped (see
// fightAt), which flips who is pressing and doubles the apparent length to ~28s —
// and the non-periodic idle underneath means even a lap-2 repeat isn't frame
// identical. A viewer reading a single beat never sees an obvious cycle.
const FIGHT: [number, number, number][] = [
  [0, 0, 0.7],  // circle, feel each other out
  [1, 5, 0.55], // red jab — blue blocks
  [1, 7, 0.55], // red jab — blue slips it
  [2, 5, 1.0],  // red cross — blue blocks, rocked
  [0, 0, 0.6],  // reset
  [5, 1, 0.85], // blue takes over: jab — red blocks
  [6, 3, 1.0],  // blue hooks — red ducks under
  [2, 9, 0.9],  // red counters clean — blue eats it
  [0, 8, 0.8],  // blue backs off to recover
  [0, 0, 0.6],
  [4, 7, 1.05], // red uppercut — blue slips out
  [1, 1, 0.55], // both jab at once
  [9, 2, 1.0],  // blue lands a cross — red's head goes back
  [8, 0, 0.8],  // red resets the distance
  [3, 5, 0.85], // red hook — blue blocks
  [0, 0, 0.75], // breathe, circle
];
const FIGHT_DUR = FIGHT.reduce((a, e) => a + e[2], 0);
const FIGHT_START: number[] = (() => {
  let a = 0;
  return FIGHT.map((e) => { const s = a; a += e[2]; return s; });
})();

/** Resolve the coupled fight pose at time t, swapping the aggressor each lap. */
function fightAt(t: number): { red: Stance; blue: Stance } {
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
  return { red: boxMove(rc, t, u), blue: boxMove(bc, t, u) };
}

// ── shots ────────────────────────────────────────────────────────────────────
// One per beat, precomputed at module scope so the worklet can index it.
// Camera: scale `s` about stage point (cx, cy), where cy is derived from s by the
// ground pin (see THE BAND) rather than stored per shot.
// Modes: 0 fight · 1 stand · 2 present · 3 walk-in.
interface Shot {
  s: number; cx: number; tr: number;
  rx: number; rOn: number; rMode: number;
  bx: number; bOn: number; bMode: number;
  nx: number; nOn: number; nMode: number;
  ring: number;
}

// Every scale here is measured against what else is on stage that beat, not
// chosen by eye. The ground is pinned, so a crown lands at 496 − 141·s and the
// only question is what sits above it:
//   · a BOARD beat must clear the framed easel, which ends at screen 320  → 1.21
//   · a RING beat must clear the shout bubbles, which end at ~254        → ≤1.65
//   · a STACK beat must clear the CONTRADICTION stamp, which ends at 275 → ≤1.49
//   · a SOLO beat has only the 54-tall scoreboard above it, ending at 198→ ≤2.0
// Every non-board shot used to sit around 1.36–1.42, which threw that headroom
// away and is why the figures read small on a phone. They now run right up to
// their real limits, leaving ~15 units of air.
const S_FIGHT = 1.54;      // the ring
const S_WALK = 1.22;       // pulling back while the narrator walks in (x-clipping bound)
const S_BOARD = 1.21;      // narrator under the easel
const S_SOLO = 1.58;       // narrator alone
const S_STACK = 1.46;      // narrator under the Socratic exchange
const S_REMATCH = 1.55;    // two figures, standing, close

function shotFor(b: Beat, i: number): Shot {
  const base: Shot = {
    s: 1, cx: 200, tr: 0.75,
    rx: 200 - 65 * FIG_SPACING, rOn: 0, rMode: 0,   // 135 at 1.35 → 152 at 1.0
    bx: 200 + 65 * FIG_SPACING, bOn: 0, bMode: 0,   // 265 at 1.35 → 248 at 1.0
    nx: -50, nOn: 0, nMode: 2,                // parked off-stage left until needed
    ring: 0,
  };
  if (b.act === 1) {
    // Close on the ring. 96 units apart (130 × FIG_SPACING): the heads are 40% of
    // figure height, so anything tighter and the pair reads as a single dark shape
    // — which is why this distance scales with the body rather than staying put.
    // The crowns land at 337, comfortably below the shout bubbles (which sit at a
    // fixed stage position OUTSIDE the camera and so don't move when it zooms).
    return { ...base, s: S_FIGHT, rOn: 1, bOn: 1, ring: 1 };
  }
  if (b.act === 2) {
    // First beat: camera pulls back while the fight carries on, and the narrator
    // walks in from off-stage. After that the boxers fade and he takes the floor.
    const first = BEATS.findIndex((x) => x.act === 2) === i;
    const s = first ? S_WALK : b.board ? S_BOARD : S_SOLO;
    return {
      ...base,
      s,
      tr: first ? 2.4 : 0.75,                 // long enough for a believable walk
      rOn: first ? 1 : 0, bOn: first ? 1 : 0, ring: first ? 1 : 0,
      // He arrives at screen x 40 — head fully on stage and a clear gap to red's,
      // whose head at this scale runs 88…154. (screen x = 200 + s·(nx − 200).)
      // S_WALK cannot go past 1.22: his head's left edge leaves the frame.
      nx: first ? 69 : b.board ? 132 : 200, nOn: 1, nMode: first ? 3 : b.board ? 2 : 1,
    };
  }
  if (b.act === 3) {
    // Under the board he stands left of centre so his working hand reaches the
    // frame without his head ever covering the illustration; alone, he takes the
    // middle and the camera pushes in on him — hardest of all on the two beats
    // where the only thing above him is the Socratic exchange.
    const s = b.board ? S_BOARD : b.stack ? S_STACK : S_SOLO;
    return {
      ...base, s,
      nOn: 1, nMode: b.board ? 2 : 1, nx: b.board ? 132 : 200,
    };
  }
  if (b.act === 4) {
    // The rematch: same two figures, standing, calm — and the closest shot in the
    // lesson, because nothing else is on stage to make room for.
    return {
      ...base, s: S_REMATCH,
      rx: 200 - 52 * FIG_SPACING, bx: 200 + 52 * FIG_SPACING,   // 148/252 → 162/238
      rOn: 1, bOn: 1, rMode: 1, bMode: 1,
    };
  }
  return base;                                 // act 5 — nobody on stage
}

const SHOTS: Shot[] = BEATS.map(shotFor);

const BOARDS: Record<BoardKey, React.ComponentType<{ p: SharedValue<number>; w?: number; h?: number }>> = {
  anatomy: AnatomyDiagram,
  syllogism: SyllogismChart,
  loudness: LoudnessChart,
  tworoads: TwoRoadsChart,
};

// Every diagram now hangs in a framed easel with its own plate, so it reads as an
// object the narrator is teaching from rather than as strokes floating on paper.
const BOARD_TITLE: Record<BoardKey, string> = {
  anatomy: 'ANATOMY OF AN ARGUMENT',
  syllogism: 'ARISTOTLE’S SYLLOGISM',
  loudness: 'VOLUME IS NOT A REASON',
  tworoads: 'TWO REASONS TO ARGUE',
};

// ── the scoreboard + the Socratic stack (see argumentScript's `vol` / `stack`) ──
const VOL: number[] = BEATS.map((b) => b.vol ?? -1);
const REA: number[] = BEATS.map((b) => b.reasons ?? -1);
const STACK: number[] = BEATS.map((b) => b.stack ?? 0);

const STACK_ROWS = [
  { text: 'WHO IMPROVES THE YOUNG?', ask: true },
  { text: 'EVERYONE BUT YOU.', ask: false },
  { text: 'AND WITH HORSES — EVERYONE?', ask: true },
] as const;

// Which narrator gesture each beat uses (indexed by beat), and who is speaking in
// the act-4 rematch so the speaker gestures while the other just stands. These are
// plain arrays so the worklet can index them by beat number.
const NARR_G: number[] = BEATS.map((b) => b.narr ?? 0);
const RED_TALK: boolean[] = BEATS.map((b) => !!b.say?.some((s) => s.who === 'red'));
const BLUE_TALK: boolean[] = BEATS.map((b) => !!b.say?.some((s) => s.who === 'blue'));

export default function ArgumentFightLesson({ lesson }: { lesson: Lesson }) {
  const toggleQuote = useUserDataStore((s) => s.toggleQuote);
  const savedQuotes = useUserDataStore((s) => s.savedQuotes);
  const showReward = useUIStore((s) => s.showReward);

  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [asked, setAsked] = useState(0);
  const [done, setDone] = useState(false);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [shown, setShown] = useState(0);          // the beat the DECK is showing

  const beat = BEATS[i];
  const clock = useSharedValue(0);
  const bt = useSharedValue(0);
  const bi = useSharedValue(0);
  const progress = useSharedValue((i + 1) / BEATS.length);
  const fillStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: progress.value }] }));

  // Both clocks are rewound DURING RENDER, not in an effect. An effect runs after
  // the frame has already been composed, so the first frame of a new beat would
  // paint with the previous beat's values — a completed transition and a finished
  // illustration — and only then snap back to zero and animate. That reads as a
  // one-frame pop on every single tap.
  const prevBeat = useRef(-1);
  if (prevBeat.current !== i) {
    prevBeat.current = i;
    bt.value = 0;
    bi.value = i;
  }
  const boardKey = beat.board ?? null;

  useFrameCallback((f) => {
    'worklet';
    let dt = (f.timeSincePreviousFrame ?? 16) / 1000;
    if (dt > 0.05) dt = 0.05;                 // a stall must not fast-forward the scene
    clock.value += dt;
    bt.value += dt;
  }, true);

  // Progress bar eases toward the next mark instead of jumping on each tap.
  useEffect(() => {
    progress.value = withTiming((i + 1) / BEATS.length, { duration: 500, easing: Easing.out(Easing.cubic) });
  }, [i]);

  // On completion, hand the result to the global reward overlay and pop this screen.
  useEffect(() => {
    if (!done) return;
    const found = getLessonById(lesson.id);
    showReward({
      xp: COMPLETION_XP + correct * 5,
      correct,
      total: asked,
      branchSlug: found?.branch.slug ?? null,
      lessonId: lesson.id,
    });
    router.back();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  // ── scene solve ────────────────────────────────────────────────────────────
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const cur = SHOTS[n];
    const prv = SHOTS[n > 0 ? n - 1 : 0];
    const tr = ease01(bt.value / cur.tr);
    const L = (a: number, b: number) => { 'worklet'; return lerp(a, b, tr); };

    const t = clock.value;

    const pIdx = n > 0 ? n - 1 : 0;

    // Red and blue. In fight mode they're coupled through fightAt (one attacks,
    // the other answers). Otherwise they stand (the rematch), the speaker
    // gesturing — and, like the narrator, they BLEND from their previous-beat
    // pose over `tr` so tapping between beats never snaps a hand.
    let redS: Stance, blueS: Stance;
    if (cur.rMode === 0 && cur.bMode === 0) {
      const F = fightAt(t);
      redS = F.red; blueS = F.blue;
    } else {
      const rFrom = RED_TALK[pIdx] ? narratorHold(0, t) : stand(t);
      const bFrom = BLUE_TALK[pIdx] ? narratorHold(0, t) : stand(t);
      const rTo = RED_TALK[n] ? narratorLive(0, t, bt.value) : stand(t);
      const bTo = BLUE_TALK[n] ? narratorLive(0, t, bt.value) : stand(t);
      redS = mixStance(rFrom, rTo, tr);
      blueS = mixStance(bFrom, bTo, tr);
    }

    // The narrator. On his first beat he walks in; after that he holds a gesture
    // matched to the line. The gesture is NOT re-raised from neutral each tap —
    // that was the glitch. Instead the scene blends the previous beat's settled
    // pose straight into this beat's live pose over the same `tr` the camera
    // rides, so the hand travels smoothly from wherever it was into the next
    // gesture. The live pose adds speech beats and per-gesture accents on top.
    let narrS: Stance;
    if (cur.nMode === 3) {
      const nx0 = L(prv.nx, cur.nx);
      const w = walk(nx0 - prv.nx, WALK);        // phase from distance → feet stay locked
      narrS = tr > 0.985 ? stand(t) : mixStance(w, stand(t), clamp01((tr - 0.86) / 0.14));
    } else {
      // If the previous beat was the walk-in (or the narrator was off), start
      // from a plain stand so there's no phantom gesture to blend out of.
      const from = SHOTS[pIdx].nMode === 3 || SHOTS[pIdx].nOn < 0.5
        ? stand(t)
        : narratorHold(NARR_G[pIdx], t);
      const to = narratorLive(NARR_G[n], t, bt.value);
      narrS = mixStance(from, to, tr);
    }

    // Root motion: a lunge or step carries the whole body, so a punch reads as
    // aimed at someone rather than as shadow-boxing. `adv` is toward the opponent.
    const rx = L(prv.rx, cur.rx) + redS.adv;
    const bx = L(prv.bx, cur.bx) - blueS.adv;
    const nx = L(prv.nx, cur.nx);
    const rOn = L(prv.rOn, cur.rOn), bOn = L(prv.bOn, cur.bOn), nOn = L(prv.nOn, cur.nOn);

    // Interpolate the SCALE and derive the centre from it, so the ground pin
    // holds exactly at every instant of the move (see THE BAND). Lerping cy
    // independently made the floor sag a few units in the middle of every tap.
    const cs = L(prv.s, cur.s);
    return {
      cam: { s: cs, cx: L(prv.cx, cur.cx), cy: GROUND - (GROUND_Y - STAGE_H / 2) / cs },
      ring: L(prv.ring, cur.ring),
      red: rOn > 0.002 ? pose(redS, rx, GROUND, K_FIG, 1, rOn) : BLANK,
      blue: bOn > 0.002 ? pose(blueS, bx, GROUND, K_FIG, -1, bOn) : BLANK,
      narr: nOn > 0.002 ? pose(narrS, nx, GROUND, K_FIG, 1, nOn) : BLANK,
    };
  });

  const DR = useDerivedValue<Bundle>(() => SCENE.value.red);
  const DB = useDerivedValue<Bundle>(() => SCENE.value.blue);
  const DN = useDerivedValue<Bundle>(() => SCENE.value.narr);

  const camStyle = useAnimatedStyle(() => {
    const c = SCENE.value.cam;
    return {
      transform: [
        { translateX: STAGE_W / 2 - c.cx * c.s },
        { translateY: STAGE_H / 2 - c.cy * c.s },
        { scale: c.s },
      ],
    };
  });
  const ringStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.ring }));

  // ── the two stage graphics that live outside the camera ────────────────────
  // Both fade BETWEEN beats and fill in WITHIN a beat (a stagger driven by `bt`),
  // so a meter climbing or a row of the exchange landing is animation the reader
  // watches, not a jump.
  const GRAPH = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    // Asymmetric: a card LEAVES quickly (0.25s) and ARRIVES unhurried (0.7s), so a
    // graphic on its way out is gone before the illustration board that replaces it
    // has drawn anything — the two never sit on top of each other at half opacity.
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
      // 0 → 1 progress of the CONTRADICTION stamp coming down on the exchange.
      stampU: cnt >= 3 ? (STACK[p] >= 3 ? 1 : clamp01((bt.value - 0.45) / 0.4)) : 0,
    };
  });

  // ── advance ────────────────────────────────────────────────────────────────
  const locked = gates(beat) && picked === null;
  const last = i === BEATS.length - 1;

  const advance = useCallback(() => {
    if (locked) return;
    if (last) { setDone(true); return; }
    setPicked(null);
    setI((n) => n + 1);
  }, [locked, last]);

  const choose = useCallback((id: string, isCorrect: boolean, graded: boolean) => {
    if (picked !== null) return;
    setPicked(id);
    if (graded) {
      setAsked((n) => n + 1);
      if (isCorrect) setCorrect((n) => n + 1);
    }
  }, [picked]);

  const onStage = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setBox((b) => (Math.abs(b.w - width) < 1 && Math.abs(b.h - height) < 1 ? b : { w: width, h: height }));
  }, []);

  // See CinematicPlayer for the full note: act 5 hands the stage's height to the
  // deck, and keying that off `beat` re-laid the deck out while it was still showing
  // the PREVIOUS beat's text — the old screen visibly jumped into the new screen's
  // slot and sat there for the length of the fade-out. The layout follows `shown`,
  // which advances only when the deck swaps at zero opacity; the stage meanwhile
  // fades out on the incoming beat rather than blinking away under the text.
  const stageGone = (BEATS[shown] ?? beat).act === 5;
  const hiding = beat.act === 5;
  const stageVis = useSharedValue(1);
  useEffect(() => {
    stageVis.value = withTiming(hiding ? 0 : 1, {
      duration: Math.round(XFADE * (hiding ? 0.4 : 0.6)),
      easing: hiding ? Easing.in(Easing.quad) : Easing.out(Easing.cubic),
    });
  }, [hiding]);
  const stageStyle = useAnimatedStyle(() => ({ opacity: stageVis.value }));

  // EVERY HOOK MUST BE ABOVE THIS LINE — see the same note in CinematicPlayer.
  // `done` flips on the last tap; hooks below here get skipped on that render,
  // React counts fewer than before and throws, taking down the reward Modal with
  // the rest of the tree. The lesson then ends on a blank screen.
  if (done) return null;   // the effect above shows the reward and pops this screen

  // Fit the BAND, not the whole design space — see THE BAND block up top.
  const fit = box.w > 0 ? Math.min(box.w / STAGE_W, box.h / BAND_H) : 0;
  const shot = SHOTS[i];
  const quoteSaved = beat.quote ? savedQuotes.some((q) => q.id === beat.quote!.id) : false;
  // The meters keep the previous beat's reading while the card is fading out, so
  // the bars never blink empty on the frame before they leave.
  const priorBeat = i > 0 ? BEATS[i - 1] : undefined;
  const volLevel = beat.vol ?? priorBeat?.vol ?? 0;
  const reaLevel = beat.reasons ?? priorBeat?.reasons ?? 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.close}>
          <SketchIcon name="close" size={20} color={INK} />
        </Pressable>
        <View style={styles.track}>
          <Animated.View style={[styles.fill, fillStyle]} />
        </View>
      </View>

      {/* Tap ANYWHERE to advance. This has to be an ancestor of the content, not
          a sibling layer: a plain View never becomes a touch responder, so taps
          on the scene and the narration bubble up to here, while the choice
          buttons and the bookmark below handle their own. An earlier version put
          the Pressable around the hint text alone, which made most of the screen
          dead — tapping the scene simply did nothing. */}
      <Pressable style={styles.body} onPress={advance} disabled={locked}>
      {/* The animated stage. Act 5 has nobody on it and no board, so it collapses
          and lets the quote and summary take the whole screen rather than sitting
          under 560 units of empty paper. */}
      <Animated.View style={[styles.stageWrap, stageGone && styles.stageGone, stageStyle]} onLayout={onStage}>
        {fit > 0 && beat.act !== 5 ? (
          <View style={{ width: STAGE_W * fit, height: BAND_H * fit, overflow: 'hidden' }}>
            <View style={{ position: 'absolute', left: 0, top: -BAND_T * fit, width: STAGE_W * fit, height: STAGE_H * fit }}>
              <View style={{ width: STAGE_W, height: STAGE_H, transform: [{ scale: fit }], transformOrigin: '0% 0%' }}>
                {/* everything inside here moves with the camera */}
                <Animated.View style={[styles.scene, camStyle]}>
                  {/* THE RING. Act 1 used to be two figures on a bare rule, which read
                      as "nowhere". It is now a raised canvas: a front edge with an end
                      cap at each side (so the mat has thickness) and a corner post
                      standing on each end. Everything is RULE weight and sits behind
                      the boxers, so it builds the place without competing with them —
                      and no rope, because a rope at head height rules a line straight
                      through both faces (that was the earlier version's mistake). */}
                  <Animated.View style={[StyleSheet.absoluteFill, ringStyle]} pointerEvents="none">
                    <View style={styles.matEdge} />
                    <View style={[styles.matCap, { left: RING_L }]} />
                    <View style={[styles.matCap, { left: RING_R }]} />
                    <View style={[styles.post, { left: RING_L - 1.5 }]} />
                    <View style={[styles.post, { left: RING_R - 1.5 }]} />
                    <View style={[styles.turnbuckle, { left: RING_L - 6.5 }]} />
                    <View style={[styles.turnbuckle, { left: RING_R - 6.5 }]} />
                  </Animated.View>
                  <View style={styles.ground} />
                  {shot.rOn > 0 ? <Stickman D={DR} k={K_FIG} gloves={beat.act === 1} /> : null}
                  {shot.bOn > 0 ? <Stickman D={DB} k={K_FIG} gloves={beat.act === 1} /> : null}
                  {shot.nOn > 0 ? <Stickman D={DN} k={K_FIG} /> : null}
                </Animated.View>

                {/* The board sits OUTSIDE the camera so illustrations stay crisp;
                    BoardStage cross-fades one framed easel — plate and all — into
                    the next. */}
                <BoardStage boardKey={boardKey} />

                {/* the running count of volume vs reasons — the lesson's own thesis */}
                <Scoreboard bt={bt} G={GRAPH} vol={volLevel} reasons={reaLevel} />

                {/* Socrates' three lines, and the stamp that lands on them */}
                <SocraticStack G={GRAPH} />

                {/* speech bubbles ride the camera with their speaker */}
                {beat.say?.map((s) => (
                  <Bubble key={s.who + s.text} bt={bt} text={s.text} who={s.who} act={beat.act} />
                ))}
              </View>
            </View>
          </View>
        ) : null}
      </Animated.View>

      {/* Narration + interaction. Fade sequences the whole deck between beats:
          it fades fully out, swaps content while invisible, then fades back in —
          so two paragraphs never overlap. `revision` (the current pick) lets an
          answer update in place, without a fade, so its explanation still lands. */}
      <View style={[styles.deck, stageGone && styles.deckTall]}>
        <Fade
          trigger={i}
          onSwap={() => setShown(i)}
          // Any in-beat state that changes the deck must be in `revision` so the
          // content re-renders live (no fade): the answer AND whether the quote is
          // bookmarked — otherwise the saved snapshot froze the bookmark icon.
          revision={`${picked ?? ''}|${quoteSaved ? 1 : 0}`}
          duration={XFADE}
          render={() => (
            <>
              {beat.cite ? <Text style={styles.cite}>{beat.cite.toUpperCase()}</Text> : null}
              {beat.text ? <Text style={styles.narr}>{beat.text}</Text> : null}

              {beat.quote ? (
                <QuoteCard
                  q={beat.quote}
                  saved={quoteSaved}
                  onToggle={() =>
                    toggleQuote({
                      id: beat.quote!.id,
                      text: beat.quote!.text,
                      author: beat.quote!.author,
                      philosopherId: 'aristotle',
                      branchSlugs: ['logic'],
                      savedAt: Date.now(),
                    })
                  }
                />
              ) : null}

              {beat.summary ? <SummaryCard s={beat.summary} /> : null}

              {beat.tap ? (
                <Choices
                  prompt={beat.tap.prompt}
                  options={beat.tap.options}
                  explain={beat.tap.explain}
                  picked={picked}
                  onPick={(id, ok) => choose(id, ok, false)}
                />
              ) : null}

              {beat.mc ? (
                <Choices
                  prompt={beat.mc.prompt}
                  options={beat.mc.options}
                  explain={beat.mc.explain}
                  picked={picked}
                  graded
                  onPick={(id, ok) => choose(id, ok, true)}
                />
              ) : null}
            </>
          )}
        />
      </View>

      {/* tap anywhere to continue — never over a pending question */}
      <View style={styles.tapLayer}>
        <Text style={styles.hint}>
          {locked ? 'Choose an answer' : last ? 'Finish' : 'Tap to continue'}
        </Text>
      </View>
      </Pressable>
    </SafeAreaView>
  );
}

// ── beat-to-beat transition ──────────────────────────────────────────────────
// SEQUENTIAL, not a cross-fade. An earlier version overlapped the outgoing and
// incoming content at partial opacity — which for two different paragraphs is a
// muddy double-exposure, barely visible on the short opening lines but obvious on
// the long later ones (which is exactly where it read as "glitchy"). Now the deck
// fades fully OUT, swaps its content while invisible, then fades back IN. Only one
// thing is ever on screen, so there is never any ghosting.
//
// `render` is called (not `children`) so the content is produced only when it
// actually changes: on a beat change (`trigger`) it fades; on a same-beat change
// like answering a question (`revision`) it swaps live with no fade, so the
// explanation still appears instantly with its own entrance.

function Fade({
  trigger, revision, duration, render, onSwap,
}: {
  trigger: number; revision: string; duration: number; render: () => React.ReactNode;
  /** Fired when the content is exchanged — the one instant the deck is invisible,
   *  and so the only safe moment to change the layout around it. */
  onSwap?: () => void;
}) {
  const OUT = Math.round(duration * 0.4);
  const IN = Math.round(duration * 0.6);
  const vis = useSharedValue(1);
  const renderRef = useRef(render);
  renderRef.current = render;
  const [content, setContent] = useState<React.ReactNode>(() => render());
  const lastTrigger = useRef(trigger);
  const lastRev = useRef(revision);
  const mounted = useRef(false);

  // Builds the new content ON THE JS THREAD. The withTiming completion callback is
  // a worklet (UI thread), and you cannot build React elements there — doing so
  // crashes the whole screen — so the callback only ever runOnJS()es back to here.
  const onSwapRef = useRef(onSwap);
  onSwapRef.current = onSwap;
  const swap = useCallback(() => {
    setContent(renderRef.current());
    onSwapRef.current?.();
  }, []);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      lastTrigger.current = trigger;
      lastRev.current = revision;
      return;
    }
    if (trigger !== lastTrigger.current) {
      lastTrigger.current = trigger;
      lastRev.current = revision;
      vis.value = withTiming(0, { duration: OUT, easing: Easing.in(Easing.quad) }, (fin) => {
        if (fin) runOnJS(swap)();                              // swap while invisible
      });
    } else if (revision !== lastRev.current) {
      lastRev.current = revision;
      swap();                                                 // same beat — live, no fade
    }
  }, [trigger, revision]);

  useEffect(() => {
    if (!mounted.current) return;
    vis.value = withTiming(1, { duration: IN, easing: Easing.out(Easing.cubic) });
  }, [content]);

  const style = useAnimatedStyle(() => ({
    opacity: vis.value,
    transform: [{ translateY: (1 - vis.value) * 6 }],
  }));

  return <Animated.View style={[styles.fadeWrap, style]}>{content}</Animated.View>;
}

// ── illustration board, cross-faded like the deck ────────────────────────────
// Boards change constantly in act 3 (anatomy → syllogism → loudness → tworoads).
// Each has its OWN draw-on progress so the incoming board draws itself on while
// the outgoing holds its finished state and fades out — two separate progress
// values, which is why this can't reuse the generic Fade (that would share one).
//
// The FRAME travels with its illustration. It used to be mounted separately, on a
// bare `boardKey ? … : null`, so leaving a board beat snapped the easel out of
// existence while the drawing inside it went on fading for another 420ms — the
// picture hung frameless in mid-air. Frame, tray, title plate and illustration now
// live in one faded layer each, so the whole object arrives and leaves together.

function BoardStage({ boardKey }: { boardKey: BoardKey | null }) {
  const fade = useSharedValue(1);                 // 1 = cur fully in / prev fully out
  const curP = useSharedValue(1);                 // incoming draw-on progress
  const prevP = useSharedValue(1);                // outgoing holds its finished draw
  const lastKey = useRef<BoardKey | null>(boardKey);
  const prevKey = useRef<BoardKey | null>(null);

  if (boardKey !== lastKey.current) {
    prevKey.current = lastKey.current;            // outgoing board
    lastKey.current = boardKey;
    prevP.value = 1;
    fade.value = 0;
    fade.value = withTiming(1, { duration: XFADE, easing: Easing.inOut(Easing.cubic) });
    curP.value = 0;                               // incoming draws itself on
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

// ── the framed easel the diagrams hang in ────────────────────────────────────
// Rendered BEFORE the illustration so the board's paper sits behind the strokes,
// with a tray rule and a title plate along the bottom — the difference between
// "some lines on the page" and "a thing the narrator is teaching from".
function BoardFrame({ title }: { title: string }) {
  return (
    <View pointerEvents="none" style={styles.frame}>
      <View style={styles.tray} />
      <Text style={styles.frameTitle} numberOfLines={1}>{title}</Text>
    </View>
  );
}

// ── the scoreboard ───────────────────────────────────────────────────────────
// Two ten-cell meters keeping the count the whole lesson turns on: how loud it
// has got, and how many reasons have actually been given. Act 1 drives VOLUME to
// full with REASONS flat on zero; act 4 replays the same disagreement with the
// numbers the other way round. Identical cells on both rows, so the comparison is
// quantitative at a glance rather than a figure of speech.
const CELLS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

function Cell({ bt, k, on }: { bt: SharedValue<number>; k: number; on: boolean }) {
  // Staggered by index, so the bar sweeps in rather than snapping on.
  const st = useAnimatedStyle(() => ({ opacity: on ? clamp01((bt.value - k * 0.045) / 0.2) : 0 }));
  return (
    <View style={styles.cell}>
      <Animated.View style={[styles.cellFill, st]} />
    </View>
  );
}

function MeterRow({
  bt, label, level, top,
}: { bt: SharedValue<number>; label: string; level: number; top: number }) {
  return (
    <View style={[styles.meterRow, { top }]}>
      <Text style={styles.meterLabel} numberOfLines={1}>{label}</Text>
      <View style={styles.cells}>
        {CELLS.map((k) => <Cell key={k} bt={bt} k={k} on={k < level} />)}
      </View>
    </View>
  );
}

function Scoreboard({
  bt, G, vol, reasons,
}: {
  bt: SharedValue<number>;
  G: SharedValue<any>;
  vol: number;
  reasons: number;
}) {
  const card = useAnimatedStyle(() => ({ opacity: G.value.scoreOn }));
  return (
    <Animated.View style={[styles.score, card]} pointerEvents="none">
      <MeterRow bt={bt} label="VOLUME" level={vol} top={8} />
      <MeterRow bt={bt} label="REASONS" level={reasons} top={28} />
    </Animated.View>
  );
}

// ── the Socratic exchange ────────────────────────────────────────────────────
// Three lines of the Apology's cross-examination, laid out as a stack: question,
// answer, the question that broke it — then CONTRADICTION comes down across the
// whole exchange like a stamp. Questions are inked boxes; the answer is dashed,
// because it is the thing that turns out not to hold.
const STACK_TOP = 148;
const STACK_ROW_H = 34;
const STACK_GAP = 8;

function SocraticStack({ G }: { G: SharedValue<any> }) {
  const wrap = useAnimatedStyle(() => ({ opacity: G.value.stackOn }));
  const rows = [
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAnimatedStyle(() => ({ opacity: G.value.s0, transform: [{ translateX: (1 - G.value.s0) * -14 }] })),
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAnimatedStyle(() => ({ opacity: G.value.s1, transform: [{ translateX: (1 - G.value.s1) * 14 }] })),
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAnimatedStyle(() => ({ opacity: G.value.s2, transform: [{ translateX: (1 - G.value.s2) * -14 }] })),
  ];
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

// ── speech bubbles ───────────────────────────────────────────────────────────

function Bubble({
  bt, text, who, act,
}: { bt: SharedValue<number>; text: string; who: 'red' | 'blue'; act: number }) {
  const left = who === 'red';
  const st = useAnimatedStyle(() => {
    const u = seg(bt.value, left ? 0.15 : 0.45, left ? 0.55 : 0.85);
    // A little overshoot so it lands like speech, not a fade.
    const s = 0.6 + 0.4 * ease01(u) + Math.sin(Math.PI * ease01(u)) * 0.08;
    return { opacity: ease01(u), transform: [{ scale: s }] };
  });
  return (
    <Animated.View
      style={[
        styles.bubble,
        left ? { left: 18, alignItems: 'flex-start' } : { right: 18, alignItems: 'flex-end' },
        // Above the heads, not over them, and below the scoreboard — which is why
        // this is now ONE number for every act: the shots all pin the ground line
        // to the same place, so the crowns land at 336 (rematch) or 337 (ring) and
        // a bubble starting at 250 clears both. It was 208, pinned to the crowns of
        // the old 1.35 figure at 278/296; left there it would hang in clear air.
        { top: 250 },
        st,
      ]}
    >
      <View style={[styles.bubbleBox, act === 1 && styles.bubbleShout]}>
        <Text style={[styles.bubbleText, act === 1 && styles.bubbleShoutText]}>{text}</Text>
      </View>
      <View style={[styles.tail, left ? { marginLeft: 26 } : { marginRight: 26 }]} />
    </Animated.View>
  );
}

// ── choices (both the teaching taps and the graded questions) ────────────────

function Choices({
  prompt, options, explain, picked, graded, onPick,
}: {
  prompt: string;
  options: { id: string; text: string; correct: boolean }[];
  explain: string;
  picked: string | null;
  graded?: boolean;
  onPick: (id: string, correct: boolean) => void;
}) {
  const answered = picked !== null;
  const gotIt = answered && options.find((o) => o.id === picked)?.correct;
  return (
    // `layout` animates the container's height when the explanation appears, so
    // the block grows smoothly and the "Tap to continue" below slides down rather
    // than jumping.
    <Animated.View style={styles.qWrap} layout={LinearTransition.duration(300)}>
      <Text style={styles.prompt}>{prompt}</Text>
      {options.map((o) => {
        const chosen = picked === o.id;
        const reveal = answered && o.correct;
        // Once answered, drop the options that are neither the pick nor the answer.
        // The deck is a FIXED 46% of the body (so the stage can never resize on a
        // tap), and a three-line prompt + four options + a four-line explanation
        // overruns it — the explanation was being clipped off the bottom on the
        // longer questions. Collapsing to "what you chose" + "the right answer"
        // always fits, and keeps the takeaway on screen. Same rule as lesson 2.
        if (answered && !chosen && !o.correct) return null;
        return (
          <Pressable
            key={o.id}
            disabled={answered}
            onPress={() => onPick(o.id, o.correct)}
            style={({ pressed }) => [
              styles.opt,
              reveal && styles.optRight,
              chosen && !o.correct && styles.optWrong,
              pressed && !answered && { opacity: 0.75 },
            ]}
          >
            <Text style={[styles.optText, reveal && styles.optRightText]}>{o.text}</Text>
          </Pressable>
        );
      })}
      {answered ? (
        <Animated.View style={styles.explain} entering={FadeInDown.duration(300)}>
          <Text style={styles.explainHead}>
            {gotIt ? (graded ? 'Correct  ·  +5 XP' : 'That’s the one') : 'Not quite'}
          </Text>
          <Text style={styles.explainText}>{explain}</Text>
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

// ── act 5 cards ──────────────────────────────────────────────────────────────

function QuoteCard({
  q, saved, onToggle,
}: {
  q: { text: string; author: string; work: string; era: string };
  saved: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={styles.quoteCard}>
      <Text style={styles.quoteMark}>“</Text>
      <Text style={styles.quoteText}>{q.text}</Text>
      <View style={styles.quoteFoot}>
        <Pressable onPress={onToggle} hitSlop={12}>
          <SketchIcon name={saved ? 'bookmark-filled' : 'bookmark'} size={18} color={saved ? INK : SOFT} />
        </Pressable>
        <Text style={styles.quoteBy}>
          {q.author.toUpperCase()}  ·  {q.work}, {q.era}
        </Text>
      </View>
    </View>
  );
}

function SummaryCard({ s }: { s: { title: string; points: string[]; closing: string } }) {
  return (
    <View style={styles.sumWrap}>
      <Text style={styles.sumTitle}>{s.title}</Text>
      {s.points.map((p) => (
        <View key={p} style={styles.sumRow}>
          <Text style={styles.sumDot}>•</Text>
          <Text style={styles.sumPoint}>{p}</Text>
        </View>
      ))}
      <Text style={styles.sumClose}>{s.closing}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PAPER },
  body: { flex: 1 },

  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingTop: 4, gap: 12 },
  close: { padding: 4 },
  track: { flex: 1, height: 2, backgroundColor: RULE, overflow: 'hidden' },
  fill: { position: 'absolute', left: 0, top: 0, height: 2, width: '100%', backgroundColor: INK, transformOrigin: '0% 50%' },

  // FIXED proportions, not flex:1. When the stage was flex:1 it grew on short
  // beats and shrank when the deck grew (a question, an explanation), so the
  // figures resized on every tap — the "glitch at the top". A fixed 46/46/8 split
  // is content-independent, so the stage never resizes and the figures hold still.
  stageWrap: { flex: 46, alignItems: 'center', justifyContent: 'flex-end' },
  stageGone: { flex: 0, height: 0 },
  deckTall: { flex: 92, justifyContent: 'center' },
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 40, right: 40, top: GROUND, height: 1.5, backgroundColor: RULE },
  // The mat's FRONT edge, 6 units below the ground line (not 11: at the ring's
  // 1.54× that is the last thing the band has to hold, and 11 pushed it past the
  // crop). The two caps close it into a slab; the posts stand on the ends.
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

  // Wide enough that the longest counter in the rematch wraps to two lines rather
  // than three — a three-line bubble ran into the figures' heads.
  bubble: { position: 'absolute', maxWidth: 210 },
  bubbleBox: {
    borderWidth: 1.5, borderColor: INK, borderRadius: 4,
    backgroundColor: PAPER, paddingHorizontal: 12, paddingVertical: 8,
  },
  bubbleShout: { backgroundColor: INK },
  bubbleText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: INK, lineHeight: 18 },
  bubbleShoutText: { fontFamily: 'Inter_700Bold', color: PAPER, letterSpacing: 0.4 },
  tail: { width: 10, height: 10, backgroundColor: INK, transform: [{ rotate: '45deg' }], marginTop: -5 },

  // ── the framed easel ───────────────────────────────────────────────────────
  frame: {
    position: 'absolute', left: FRAME.x, top: FRAME.y, width: FRAME.w, height: FRAME.h,
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: PAPER,
  },
  tray: {
    position: 'absolute', left: 10, right: 10, top: TRAY_Y, height: 1,
    backgroundColor: RULE,
  },
  frameTitle: {
    position: 'absolute', left: 8, right: 8, top: PLATE_Y, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1.5, color: SOFT,
    includeFontPadding: false,
  },

  // ── the scoreboard ─────────────────────────────────────────────────────────
  score: {
    position: 'absolute', left: 42, top: 144, width: 320, height: 54,
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: PAPER,
  },
  meterRow: { position: 'absolute', left: 10, right: 10, height: 14, flexDirection: 'row', alignItems: 'center' },
  meterLabel: {
    width: 84, fontFamily: 'Inter_700Bold', fontSize: 12, letterSpacing: 0.8,
    color: INK, includeFontPadding: false,
  },
  cells: { flexDirection: 'row', gap: 2.2 },
  cell: { width: 18, height: 14, borderWidth: 1.5, borderColor: SOFT, borderRadius: 1.5 },
  cellFill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: INK },

  // ── the Socratic exchange ──────────────────────────────────────────────────
  stackRow: {
    position: 'absolute', left: 62, right: 62, height: STACK_ROW_H,
    borderWidth: 2, borderRadius: 3, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12,
  },
  stackAsk: { borderColor: INK },
  stackAns: { borderColor: SOFT, borderStyle: 'dashed' },
  stackText: {
    fontFamily: 'Inter_700Bold', fontSize: 12.5, letterSpacing: 0.3, color: INK,
    textAlign: 'center', includeFontPadding: false,
  },
  stackTextSoft: { color: SOFT },
  stamp: {
    position: 'absolute', left: 116, top: 232, width: 168, height: 26,
    backgroundColor: INK, borderRadius: 2, alignItems: 'center', justifyContent: 'center',
  },
  stampText: {
    fontFamily: 'Inter_700Bold', fontSize: 12, letterSpacing: 1.6, color: PAPER,
    includeFontPadding: false,
  },

  deck: { flex: 46, paddingHorizontal: 24, justifyContent: 'flex-start', overflow: 'hidden' },
  fadeWrap: { position: 'relative' },
  narr: {
    fontFamily: 'PlayfairDisplay_400Regular', fontSize: 18, lineHeight: 27, color: INK,
  },
  cite: {
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.6, color: SOFT, marginBottom: 7,
  },

  qWrap: { marginTop: 2 },
  prompt: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 17, color: INK, marginBottom: 10, lineHeight: 23 },
  opt: {
    borderWidth: 1.5, borderColor: RULE, borderRadius: 5,
    paddingVertical: 10, paddingHorizontal: 14, marginBottom: 7, backgroundColor: PAPER,
  },
  optRight: { borderColor: INK, backgroundColor: INK },
  optRightText: { color: PAPER, fontFamily: 'Inter_700Bold' },
  optWrong: { borderColor: SOFT, opacity: 0.55 },
  optText: { fontFamily: 'Inter_400Regular', fontSize: 14.5, color: INK, lineHeight: 20 },
  explain: { marginTop: 4, borderLeftWidth: 2, borderLeftColor: INK, paddingLeft: 12, paddingVertical: 2 },
  explainHead: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1.2, color: INK, marginBottom: 4 },
  explainText: { fontFamily: 'Inter_400Regular', fontSize: 13.5, color: SOFT, lineHeight: 20 },

  quoteCard: { borderWidth: 1.5, borderColor: INK, borderRadius: 3, padding: 18, marginTop: 2 },
  quoteMark: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 40, color: INK, height: 26, lineHeight: 36 },
  quoteText: {
    fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic',
    fontSize: 21, lineHeight: 31, color: INK, marginTop: 8,
  },
  quoteFoot: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16 },
  quoteBy: { fontFamily: 'Inter_500Medium', fontSize: 11, letterSpacing: 1.4, color: SOFT, flex: 1 },

  sumWrap: { marginTop: 2 },
  sumTitle: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 22, color: INK, marginBottom: 12 },
  sumRow: { flexDirection: 'row', gap: 10, marginBottom: 7 },
  sumDot: { fontSize: 16, lineHeight: 21, color: INK },
  sumPoint: { fontFamily: 'Inter_400Regular', fontSize: 14.5, color: INK, lineHeight: 21, flex: 1 },
  sumClose: {
    fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic',
    fontSize: 16, color: SOFT, lineHeight: 24, marginTop: 12,
  },

  tapLayer: { flex: 8, alignItems: 'center', justifyContent: 'center' },
  hint: { fontFamily: 'Inter_500Medium', fontSize: 11, letterSpacing: 2, color: SOFT },
});
