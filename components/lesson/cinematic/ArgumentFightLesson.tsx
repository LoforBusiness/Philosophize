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
import LessonReward from '@/components/lesson/LessonReward';
import SketchIcon from '@/components/shared/SketchIcon';
import { useUserDataStore } from '@/stores/userDataStore';
import Stickman from './Stickman';
import AnatomyDiagram from './illustrations/AnatomyDiagram';
import SyllogismChart from './illustrations/SyllogismChart';
import LoudnessChart from './illustrations/LoudnessChart';
import TwoRoadsChart from './illustrations/TwoRoadsChart';
import { BEATS, gates, type Beat, type BoardKey } from './argumentScript';
import {
  BLANK, WALK, boxMove, clamp01, ease01, lerp, mixStance, narratorHold,
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
const BOARD = { x: 60, y: 40, w: 280, h: 160 };
const K_FIG = 1.35;                       // stage units per rig unit

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
// Camera: scale `s` about stage point (cx, cy), which is mapped to the stage
// centre. Modes: 0 fight · 1 stand · 2 present · 3 walk-in.
interface Shot {
  s: number; cx: number; cy: number; tr: number;
  rx: number; rOn: number; rMode: number;
  bx: number; bOn: number; bMode: number;
  nx: number; nOn: number; nMode: number;
  ring: number;
}

function shotFor(b: Beat, i: number): Shot {
  const base: Shot = {
    s: 1, cx: STAGE_W / 2, cy: STAGE_H / 2, tr: 0.75,
    rx: 135, rOn: 0, rMode: 0,
    bx: 265, bOn: 0, bMode: 0,
    nx: -50, nOn: 0, nMode: 2,                // parked off-stage left until needed
    ring: 0,
  };
  if (b.act === 1) {
    // Close on the ring. 130 units apart: the heads are 40% of figure height, so
    // anything tighter and the pair reads as a single dark shape.
    // cy is chosen so their crowns land below the speech bubbles, which sit at a
    // fixed stage position OUTSIDE the camera and so don't move when it zooms,
    // while still filling the lower stage rather than floating in its middle.
    return { ...base, s: 1.34, cx: 200, cy: 345, rOn: 1, bOn: 1, ring: 1 };
  }
  if (b.act === 2) {
    // First beat: camera pulls back while the fight carries on, and the narrator
    // walks in from off-stage. After that the boxers fade and he takes the floor.
    const first = BEATS.findIndex((x) => x.act === 2) === i;
    return {
      ...base,
      s: first ? 1 : 1.35, cx: 200, cy: first ? STAGE_H / 2 : 395,
      tr: first ? 2.4 : 0.75,                 // long enough for a believable walk
      rOn: first ? 1 : 0, bOn: first ? 1 : 0, ring: first ? 1 : 0,
      nx: first ? 38 : b.board ? 132 : 200, nOn: 1, nMode: first ? 3 : b.board ? 2 : 1,
    };
  }
  if (b.act === 3) {
    // Pushed in so the narrator sits close under the board rather than leaving a
    // dead band between his head and the illustration — and so the pair together
    // fill the stage instead of floating in its upper half.
    return {
      ...base, s: 1.35, cx: 200, cy: 395,
      nOn: 1, nMode: b.board ? 2 : 1, nx: b.board ? 132 : 200,
    };
  }
  if (b.act === 4) {
    // The rematch: same two figures, standing, calm.
    return { ...base, s: 1.12, cx: 200, cy: 450, rx: 148, bx: 252, rOn: 1, bOn: 1, rMode: 1, bMode: 1 };
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

// Which narrator gesture each beat uses (indexed by beat), and who is speaking in
// the act-4 rematch so the speaker gestures while the other just stands. These are
// plain arrays so the worklet can index them by beat number.
const NARR_G: number[] = BEATS.map((b) => b.narr ?? 0);
const RED_TALK: boolean[] = BEATS.map((b) => !!b.say?.some((s) => s.who === 'red'));
const BLUE_TALK: boolean[] = BEATS.map((b) => !!b.say?.some((s) => s.who === 'blue'));

export default function ArgumentFightLesson({ lesson }: { lesson: Lesson }) {
  const toggleQuote = useUserDataStore((s) => s.toggleQuote);
  const savedQuotes = useUserDataStore((s) => s.savedQuotes);

  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [asked, setAsked] = useState(0);
  const [done, setDone] = useState(false);
  const [box, setBox] = useState({ w: 0, h: 0 });

  const beat = BEATS[i];
  const clock = useSharedValue(0);
  const bt = useSharedValue(0);
  const bi = useSharedValue(0);

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

    return {
      cam: { s: L(prv.s, cur.s), cx: L(prv.cx, cur.cx), cy: L(prv.cy, cur.cy) },
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

  if (done) {
    const found = getLessonById(lesson.id);
    return (
      <LessonReward
        xp={COMPLETION_XP + correct * 5}
        correct={correct}
        total={asked}
        branchSlug={found?.branch.slug ?? null}
        lessonId={lesson.id}
        onDone={() => router.back()}
      />
    );
  }

  const fit = box.w > 0 ? Math.min(box.w / STAGE_W, box.h / STAGE_H) : 0;
  const shot = SHOTS[i];
  const quoteSaved = beat.quote ? savedQuotes.some((q) => q.id === beat.quote!.id) : false;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.close}>
          <SketchIcon name="close" size={20} color={INK} />
        </Pressable>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${((i + 1) / BEATS.length) * 100}%` }]} />
        </View>
        <Text style={styles.count}>{i + 1}/{BEATS.length}</Text>
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
      <View style={[styles.stageWrap, beat.act === 5 && styles.stageGone]} onLayout={onStage}>
        {fit > 0 && beat.act !== 5 ? (
          <View style={{ width: STAGE_W * fit, height: STAGE_H * fit, overflow: 'hidden' }}>
            <View style={{ width: STAGE_W, height: STAGE_H, transform: [{ scale: fit }], transformOrigin: '0% 0%' }}>
              {/* everything inside here moves with the camera */}
              <Animated.View style={[styles.scene, camStyle]}>
                <Animated.View style={[styles.ring, ringStyle]} />
                <View style={styles.ground} />
                {shot.rOn > 0 ? <Stickman D={DR} k={K_FIG} gloves={beat.act === 1} /> : null}
                {shot.bOn > 0 ? <Stickman D={DB} k={K_FIG} gloves={beat.act === 1} /> : null}
                {shot.nOn > 0 ? <Stickman D={DN} k={K_FIG} /> : null}
              </Animated.View>

              {/* the board sits OUTSIDE the camera so illustrations stay crisp;
                  BoardStage cross-fades one illustration into the next */}
              <View style={{ position: 'absolute', left: BOARD.x, top: BOARD.y }}>
                <BoardStage boardKey={boardKey} />
              </View>

              {/* speech bubbles ride the camera with their speaker */}
              {beat.say?.map((s) => (
                <Bubble key={s.who + s.text} bt={bt} text={s.text} who={s.who} act={beat.act} />
              ))}
            </View>
          </View>
        ) : null}
      </View>

      {/* Narration + interaction. Fade sequences the whole deck between beats:
          it fades fully out, swaps content while invisible, then fades back in —
          so two paragraphs never overlap. `revision` (the current pick) lets an
          answer update in place, without a fade, so its explanation still lands. */}
      <View style={[styles.deck, beat.act === 5 && styles.deckTall]}>
        <Fade
          trigger={i}
          revision={picked ?? '—'}
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
  trigger, revision, duration, render,
}: { trigger: number; revision: string; duration: number; render: () => React.ReactNode }) {
  const OUT = Math.round(duration * 0.4);
  const IN = Math.round(duration * 0.6);
  const vis = useSharedValue(1);
  const renderRef = useRef(render);
  renderRef.current = render;
  const [content, setContent] = useState<React.ReactNode>(() => render());
  const lastTrigger = useRef(trigger);
  const lastRev = useRef(revision);
  const mounted = useRef(false);

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
        if (fin) runOnJS(setContent)(renderRef.current());   // swap while invisible
      });
    } else if (revision !== lastRev.current) {
      lastRev.current = revision;
      setContent(renderRef.current());                        // same beat — live, no fade
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

  const Cur = boardKey ? BOARDS[boardKey] : null;
  const Prev = prevKey.current ? BOARDS[prevKey.current] : null;
  return (
    <View>
      {Prev ? (
        <Animated.View style={[StyleSheet.absoluteFill, prevStyle]} pointerEvents="none">
          <Prev p={prevP} w={BOARD.w} h={BOARD.h} />
        </Animated.View>
      ) : null}
      {Cur ? (
        <Animated.View style={curStyle} pointerEvents="none">
          <Cur p={curP} w={BOARD.w} h={BOARD.h} />
        </Animated.View>
      ) : null}
    </View>
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
        // Above the heads, not over them. Act 4's camera sits lower (cy 450), so
        // the figures ride higher on screen and the bubble has to clear them.
        { top: act === 1 ? 176 : 96 },
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
        return (
          <Pressable
            key={o.id}
            disabled={answered}
            onPress={() => onPick(o.id, o.correct)}
            style={({ pressed }) => [
              styles.opt,
              reveal && styles.optRight,
              chosen && !o.correct && styles.optWrong,
              answered && !reveal && !chosen && styles.optFade,
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
  track: { flex: 1, height: 2, backgroundColor: RULE },
  fill: { height: 2, backgroundColor: INK },
  count: { fontFamily: 'Inter_500Medium', fontSize: 11, color: SOFT, letterSpacing: 1 },

  stageWrap: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  stageGone: { flex: 0, height: 0 },
  deckTall: { flex: 1, justifyContent: 'center' },
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 40, right: 40, top: GROUND, height: 1.5, backgroundColor: RULE },
  // The mat edge, BELOW the ground line. An earlier version drew a rope across
  // the ring at head height, which on a real screen read as a line ruled straight
  // through both boxers' heads rather than as a rope behind them.
  ring: {
    position: 'absolute', left: 74, right: 74, top: GROUND + 11, height: 1.5,
    backgroundColor: RULE,
  },

  bubble: { position: 'absolute', maxWidth: 190 },
  bubbleBox: {
    borderWidth: 1.5, borderColor: INK, borderRadius: 4,
    backgroundColor: PAPER, paddingHorizontal: 12, paddingVertical: 8,
  },
  bubbleShout: { backgroundColor: INK },
  bubbleText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: INK, lineHeight: 18 },
  bubbleShoutText: { fontFamily: 'Inter_700Bold', color: PAPER, letterSpacing: 0.4 },
  tail: { width: 10, height: 10, backgroundColor: INK, transform: [{ rotate: '45deg' }], marginTop: -5 },

  deck: { paddingHorizontal: 24, paddingBottom: 4, minHeight: 108, justifyContent: 'flex-start' },
  fadeWrap: { position: 'relative' },
  narr: {
    fontFamily: 'PlayfairDisplay_400Regular', fontSize: 18, lineHeight: 27, color: INK,
  },
  cite: {
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.6, color: SOFT, marginBottom: 7,
  },

  qWrap: { marginTop: 2 },
  prompt: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 17, color: INK, marginBottom: 12, lineHeight: 24 },
  opt: {
    borderWidth: 1.5, borderColor: RULE, borderRadius: 5,
    paddingVertical: 12, paddingHorizontal: 14, marginBottom: 8, backgroundColor: PAPER,
  },
  optRight: { borderColor: INK, backgroundColor: INK },
  optRightText: { color: PAPER, fontFamily: 'Inter_700Bold' },
  optWrong: { borderColor: SOFT, opacity: 0.55 },
  optFade: { opacity: 0.4 },                    // the un-picked, un-correct options recede
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

  tapLayer: { paddingVertical: 12, alignItems: 'center' },
  hint: { fontFamily: 'Inter_500Medium', fontSize: 11, letterSpacing: 2, color: SOFT },
});
