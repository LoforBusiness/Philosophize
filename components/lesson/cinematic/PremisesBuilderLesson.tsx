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
import BrickStructure, {
  BASE_LX, BASE_RX, BASE_Y, CENTER_X, KEY_X, KEY_Y, type StructState,
} from './BrickStructure';
import { BEATS, gates, type Beat } from './builderScript';
import { Bubble } from './cinematicKit';
import {
  BLANK, clamp01, ease01, easeOutBack, easeOutCubic, lerp, masterHold, masterLive,
  mixStance, narratorHold, narratorLive, pose, seg, stand, type Bundle, type Stance,
} from './rig';

// ─────────────────────────────────────────────────────────────────────────────
// The cinematic runner for logic-arguments-2, "Premises and Conclusions" —
// theme THE MASTER BUILDER. A different scene from lesson 1, the same engine.
//
// A master builder lays a two-premise base and a conclusion keystone; a watching
// apprentice gets tested. The hero visual is a LIVE BRICK STRUCTURE (native Views,
// see BrickStructure.tsx), and the two graded questions are dramatised into it —
// the true/false collapses the structure, the multiple-choice flies a brick into
// place. Everything below reuses lesson 1's proven bones: two clocks (a monotonic
// `clock` for idle life, a beat-local `bt` for transitions), the fixed-proportion
// layout that stops the stage resizing on every tap, and the SEQUENTIAL deck fade.
// ─────────────────────────────────────────────────────────────────────────────

const INK = '#1A1A1A';
const PAPER = '#FAFAF7';
const SOFT = '#6B6B6B';
const RULE = '#E4E1D8';

const STAGE_W = 400;
const STAGE_H = 560;
const GROUND = 500;
// Stage units per rig unit — the SAME 1.0 every other lesson uses (cinematicKit's
// K_FIG). This file used to carry its own 1.35, shadowing the shared constant, so
// it never got the size correction and drew figures 35% larger than the other 46.
// 103 units tall, crown at y 397.
//
// MASTER_X and APP_X deliberately do NOT move. Both figures are placed against the
// brick structure, which is a prop at a fixed size — the master stands beside the
// work, the apprentice clear of the base row. A figure-to-PROP distance stays put
// when the figure shrinks; that is exactly what puts them back in proportion with
// the stones. (Contrast lesson 1, where the two boxers are placed against EACH
// OTHER, so their separation had to scale with them.) Nothing here is carried by
// hand — bricks drop into place on their own — so there is no contact to re-tune.
const K_FIG = 1.0;

// ── THE BAND ────────────────────────────────────────────────────────────────
// The stage REGION on a phone is wide and short while this design space is tall
// and narrow, so fitting all 560 letterboxes the scene to ~1.15× and throws away
// half the width — which is exactly why the animation read small. This lesson's
// art only ever occupies a slice of the height, so the stage crops to that slice
// and scales THAT up (~2.0× — nearly double everything on screen).
//
// The band is measured AFTER the camera. Every shot below shares cx = 200 and
// scales 1.08…1.22 about cy 432…442, so a design y maps to  y' = 280 + s·(y − cy).
// Extremes across every beat:
//   legend card       (outside the camera, literal)   118 … 180
//   speech bubble     (outside the camera, literal)   120 … 180
//   master's crown            y 397, s 1.16           → 232   (was 359 → 188)
//   keystone mid drop-in      y 361, s 1.16           → 191
//   CONCLUSION tag            y 372, s 1.16           → 204
//   ground rule               y 501, s 1.16           → 353
//   ankle joints              y 507, s 1.22           → 372
//   the COLLAPSED keystone    y 549, s 1.22           → 423   ← the low-water mark
// so [110, 434] holds every pixel the scene can draw, with ~10 units of margin at
// each end. Anything new must be re-measured against it.
const BAND_T = 110;
const BAND_B = 434;
const BAND_H = BAND_B - BAND_T;

// How far the keystone falls when its premise is pulled. Tuned to the band: the
// brick still tumbles two of its own heights and lands well clear of the ground
// line, but the rotated corner stays inside the crop.
const FALL = 88;

const MASTER_X = 330;               // right, faces left — stands beside the work, not behind it
const APP_X = 62;                   // left, watches — clear of the base bricks
const APP_K = K_FIG * 0.88;         // the apprentice reads a touch shorter than the master
const LAY = 0.7;                    // seconds for a brick to drop into place

// Sits in the same strip as the legend (which fades out on any beat with a bubble)
// and clears the master's crown, which lands at ~232 on screen. It was 120, pinned
// to the old 1.35 figure's crown at ~188; left there it would hang 50 units above
// the head it belongs to.
const BUBBLE_TOP = 150;

const COMPLETION_XP = 5;            // matches LessonRunner
const XFADE = 420;                  // beat-to-beat deck fade

// ── per-beat data, precomputed at module scope so the worklet can index it ─────
const lbl = (i: number, key: 'p1' | 'p2' | 'key'): string | null =>
  (BEATS[i].build?.[key] ?? null) as string | null;

const P1_ON = BEATS.map((_, i) => (lbl(i, 'p1') !== null ? 1 : 0));
const P2_ON = BEATS.map((_, i) => (lbl(i, 'p2') !== null ? 1 : 0));
const KEY_ON = BEATS.map((_, i) => (lbl(i, 'key') !== null ? 1 : 0));
const SLOT_ON = BEATS.map((b) => (b.build?.slot ? 1 : 0));
const TAGS_ON = BEATS.map((b) => (b.build?.tags ? 1 : 0));
// 0 none · 1 collapse · 2 fly-up
const QCODE = BEATS.map((b) => (b.build?.q === 'collapse' ? 1 : b.build?.q === 'flyup' ? 2 : 0));

// A brick re-lays (drop-in) when it first appears, when its lettering changes, or
// after a collapse — so a label swap is always a fresh placement, never a pop.
const wasCollapse = (i: number) => i > 0 && QCODE[i - 1] === 1;
const wasFlyup = (i: number) => i > 0 && QCODE[i - 1] === 2;
const fresh = (i: number, key: 'p1' | 'p2' | 'key', on: number[]) =>
  on[i] && (i === 0 || lbl(i, key) !== lbl(i - 1, key) || wasCollapse(i)) ? 1 : 0;
const P1_FRESH = BEATS.map((_, i) => fresh(i, 'p1', P1_ON));
const P2_FRESH = BEATS.map((_, i) => fresh(i, 'p2', P2_ON));
// The keystone appears the beat after the fly-up (the payoff). Don't re-lay it there
// — a brick just flew into that exact spot, so let the keystone take over in place
// (appear at full opacity, no drop-in) instead of flickering out and dropping again.
const KEY_FRESH = BEATS.map((_, i) => (wasFlyup(i) ? 0 : fresh(i, 'key', KEY_ON)));

const M_GEST = BEATS.map((b) => b.gest ?? 0);
const APP_TALK = BEATS.map((b) => !!b.say?.some((s) => s.who === 'app'));

// ── the signpost legend ──────────────────────────────────────────────────────
// The single most portable thing this lesson teaches is which little words flag a
// premise and which flag a conclusion — and it is exactly what the tap question
// tests. So it gets a real reference card at the top of the stage: the words on
// the left, an arrow, the role they mark on the right. Row 1 lands with the
// premise line, row 2 with the conclusion line, and both stay up while the reader
// is tested. It steps aside (fades out) on any beat that raises a speech bubble,
// because both live in the same strip of stage.
const LEG_ROWS = [
  { words: 'BECAUSE · SINCE · AS', tag: 'PREMISE' },
  { words: 'THEREFORE · SO · THUS', tag: 'CONCLUSION' },
] as const;

const FIRST_A2 = BEATS.findIndex((b) => b.act === 2);
const LEGEND = BEATS.map((b, i) => {
  if (FIRST_A2 < 0 || i < FIRST_A2 || b.say || b.summary) return 0;
  return i === FIRST_A2 ? 1 : 2;
});

// ── the builder's plan ────────────────────────────────────────────────────────
// Act 1 was the thinnest picture in the lesson: two figures and up to three BLANK
// bricks on bare paper. The master now works to a plan pinned up above the site —
// a dashed schematic of the finished shape whose outlines INK IN as each real stone
// is laid, so the opening beats carry a small progress diagram (where this is going,
// and how far along it is) instead of empty space.
//
// It lives in the strip the legend will later occupy (the legend does not exist yet
// in act 1) and, exactly like the legend, steps aside on any beat that raises a
// speech bubble, because a bubble is drawn in the same strip.
const PLAN = BEATS.map((b) => (b.act === 1 && !b.say ? 1 : 0));

// ── camera ─────────────────────────────────────────────────────────────────
interface Shot { s: number; cx: number; cy: number; tr: number }
function shotFor(b: Beat): Shot {
  const base: Shot = { s: 1.16, cx: 200, cy: 438, tr: 0.8 };
  if (b.act === 1) return { ...base, s: 1.08, cy: 442 };          // wider — see the whole build
  if (b.build?.q) return { ...base, s: 1.22, cy: 432 };           // push in for the collapse / fly-up
  return base;
}
const SHOTS: Shot[] = BEATS.map(shotFor);

export default function PremisesBuilderLesson({ lesson }: { lesson: Lesson }) {
  const toggleQuote = useUserDataStore((s) => s.toggleQuote);
  const savedQuotes = useUserDataStore((s) => s.savedQuotes);
  const showReward = useUIStore((s) => s.showReward);

  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [asked, setAsked] = useState(0);
  const [done, setDone] = useState(false);
  const [boxSize, setBoxSize] = useState({ w: 0, h: 0 });
  const [shown, setShown] = useState(0);          // the beat the DECK is showing

  const beat = BEATS[i];
  const clock = useSharedValue(0);
  const bt = useSharedValue(0);
  const bi = useSharedValue(0);
  const qv = useSharedValue(0);          // 0→1 answer progress (collapse / fly-up)
  const progress = useSharedValue((i + 1) / BEATS.length);
  const fillStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: progress.value }] }));

  // Rewind the beat clock DURING RENDER (not in an effect): an effect paints one
  // frame of the previous beat's finished state first, which reads as a pop.
  const prevBeat = useRef(-1);
  if (prevBeat.current !== i) {
    prevBeat.current = i;
    bt.value = 0;
    bi.value = i;
    qv.value = 0;
  }

  useFrameCallback((f) => {
    'worklet';
    let dt = (f.timeSincePreviousFrame ?? 16) / 1000;
    if (dt > 0.05) dt = 0.05;
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

  // Drive the collapse / fly-up once the graded answer lands. Collapse falls under
  // gravity (ease-in); the fly-up settles into place (ease-out).
  useEffect(() => {
    const q = BEATS[i].build?.q;
    if (q && picked !== null) {
      const collapse = q === 'collapse';
      qv.value = withTiming(1, {
        duration: collapse ? 820 : 720,
        easing: collapse ? Easing.in(Easing.quad) : Easing.out(Easing.cubic),
      });
    }
  }, [picked, i]);

  // ── figures ────────────────────────────────────────────────────────────────
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const cur = SHOTS[n], prv = SHOTS[n > 0 ? n - 1 : 0];
    const tr = ease01(bt.value / cur.tr);
    const L = (a: number, b: number) => { 'worklet'; return lerp(a, b, tr); };
    const t = clock.value;
    const p = n > 0 ? n - 1 : 0;

    // Master: blend the previous beat's settled gesture into this beat's live one
    // over the same `tr` the camera rides, so the hand never snaps home on a tap.
    const masterS = mixStance(masterHold(M_GEST[p], t), masterLive(M_GEST[n], t, bt.value), tr);
    // Apprentice: watches; gestures only while speaking.
    const aFrom = APP_TALK[p] ? narratorHold(0, t) : stand(t);
    const aTo = APP_TALK[n] ? narratorLive(0, t, bt.value) : stand(t);
    const appS = mixStance(aFrom, aTo, tr);

    return {
      cam: { s: L(prv.s, cur.s), cx: L(prv.cx, cur.cx), cy: L(prv.cy, cur.cy) },
      master: pose(masterS, MASTER_X, GROUND, K_FIG, -1, 1),
      app: pose(appS, APP_X, GROUND, APP_K, 1, 1),
    };
  });
  const DM = useDerivedValue<Bundle>(() => SCENE.value.master);
  const DA = useDerivedValue<Bundle>(() => SCENE.value.app);

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

  // ── the brick structure ──────────────────────────────────────────────────────
  const STRUCT = useDerivedValue<StructState>(() => {
    const n = bi.value;
    const bp = bt.value;
    const q = clamp01(qv.value);
    const code = QCODE[n];

    const ent = (fr: number) => (fr ? clamp01(bp / LAY) : 1);
    const drop = (e: number) => ({
      dy: (1 - easeOutCubic(e)) * -26,           // placed from above
      op: clamp01(e / 0.5),
      sc: lerp(0.9, 1, easeOutBack(e)),
    });
    const d1 = drop(ent(P1_FRESH[n]));
    const d2 = drop(ent(P2_FRESH[n]));
    const dk = drop(ent(KEY_FRESH[n]));

    const p1HX = P2_ON[n] ? BASE_LX : CENTER_X;   // one base brick sits centred

    const p1 = { tx: p1HX, ty: BASE_Y + d1.dy, rot: 0, scale: d1.sc, opacity: P1_ON[n] ? d1.op : 0 };
    const p2 = { tx: BASE_RX, ty: BASE_Y + d2.dy, rot: 0, scale: d2.sc, opacity: P2_ON[n] ? d2.op : 0 };
    const key = { tx: KEY_X, ty: KEY_Y + dk.dy, rot: 0, scale: dk.sc, opacity: KEY_ON[n] ? dk.op : 0 };
    let slotOp = SLOT_ON[n] ? clamp01(bp / LAY) : 0;

    if (code === 1) {
      // Collapse: the premise is pulled out, then the keystone loses support and falls.
      const qp = seg(q, 0, 0.45);
      p1.tx += -82 * easeOutCubic(qp);
      p1.ty += 6 * qp;
      p1.rot += -10 * qp;
      const gk = seg(q, 0.3, 1);
      const g = gk * gk;                            // gravity
      key.tx += -26 * g;
      key.ty += FALL * g;
      key.rot += -42 * g;
    } else if (code === 2) {
      // Fly-up: the conclusion rises into the keystone slot; the premise slides
      // under it; the dashed slot fades as the brick arrives.
      const qe = easeOutCubic(q);
      p2.tx += lerp(BASE_RX, KEY_X, qe) - BASE_RX;
      p2.ty += (lerp(BASE_Y, KEY_Y, qe) - BASE_Y) - Math.sin(Math.PI * qe) * 20;
      p1.tx += lerp(BASE_LX, CENTER_X, qe) - BASE_LX;
      slotOp *= 1 - qe;
    }

    const tagOp = TAGS_ON[n] ? clamp01(bp / 0.6) : 0;
    return { p1, p2, key, slotOp, tagOp };
  });

  // ── the signpost legend ────────────────────────────────────────────────────
  // Cross-beat fade for the card, plus a per-row write-on so a row that this beat
  // ADDS slides in while rows already written stay solid.
  const LEG = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    // Asymmetric, like a card being taken off the table: it LEAVES in 0.25s (well
    // before the speech bubble that displaced it lands) and ARRIVES in 0.7s.
    const away = 1 - ease01(bt.value / 0.25);
    const here = ease01(bt.value / 0.7);
    const grow = ease01(bt.value / 0.7);
    const cnt = LEGEND[n], was = LEGEND[p];
    const row = (k: number) => { 'worklet'; return k < was ? 1 : k < cnt ? grow : 0; };
    // The plan's three outlines ink in one at a time: a stone already laid on the
    // PREVIOUS beat is solid from frame one, the one laid on THIS beat draws on.
    const inked = (on: number[]) => {
      'worklet';
      return n > 0 && on[n - 1] ? 1 : on[n] ? grow : 0;
    };
    return {
      on: cnt > 0 ? (was > 0 ? 1 : here) : was > 0 ? away : 0,
      r0: row(0), r1: row(1),
      planOn: PLAN[n] ? (PLAN[p] ? 1 : here) : PLAN[p] ? away : 0,
      ink0: inked(P1_ON), ink1: inked(P2_ON), ink2: inked(KEY_ON),
    };
  });

  // ── advance / answer ─────────────────────────────────────────────────────────
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
    setBoxSize((b) => (Math.abs(b.w - width) < 1 && Math.abs(b.h - height) < 1 ? b : { w: width, h: height }));
  }, []);

  // See CinematicPlayer for the full note: the layout follows `shown`, which only
  // advances when the deck swaps content at zero opacity, so the summary's re-layout
  // is never seen happening under the outgoing beat's text. The stage fades out on
  // the incoming beat instead of blinking away.
  const stageGone = !!(BEATS[shown] ?? beat).summary;
  const hiding = !!beat.summary;
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

  // Fit the BAND, not the whole design space — see the BAND block up top.
  const fit = boxSize.w > 0 ? Math.min(boxSize.w / STAGE_W, boxSize.h / BAND_H) : 0;
  const quoteSaved = beat.quote ? savedQuotes.some((q) => q.id === beat.quote!.id) : false;
  const bd = beat.build ?? {};
  const p1Label = bd.p1 ?? '';
  const p2Label = bd.p2 ?? '';
  const keyLabel = bd.key ?? '';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.close}>
          <SketchIcon name="close" size={20} color={INK} />
        </Pressable>
        <View style={styles.track}>
          <Animated.View style={[styles.fill, fillStyle]} />
        </View>
      </View>

      {/* Tap anywhere to advance (an ancestor of the content, so scene taps bubble
          up while the choice buttons and bookmark handle their own). */}
      <Pressable style={styles.body} onPress={advance} disabled={locked}>
        <Animated.View style={[styles.stageWrap, stageGone && styles.stageGone, stageStyle]} onLayout={onStage}>
          {fit > 0 && !stageGone ? (
            <View style={{ width: STAGE_W * fit, height: BAND_H * fit, overflow: 'hidden' }}>
              <View style={{ position: 'absolute', left: 0, top: -BAND_T * fit, width: STAGE_W * fit, height: STAGE_H * fit }}>
                <View style={{ width: STAGE_W, height: STAGE_H, transform: [{ scale: fit }], transformOrigin: '0% 0%' }}>
                  <Animated.View style={[styles.scene, camStyle]}>
                    <View style={styles.ground} />
                    {/* Structure IN FRONT of the figures: the builders stand behind
                        their work (waist-high), which keeps the brick labels — the
                        teaching content — always readable instead of hidden behind a
                        gesturing arm. */}
                    <Stickman D={DA} k={APP_K} />
                    <Stickman D={DM} k={K_FIG} />
                    <BrickStructure S={STRUCT} p1Label={p1Label} p2Label={p2Label} keyLabel={keyLabel} />
                  </Animated.View>

                  {/* the signpost reference card, outside the camera so it stays crisp */}
                  <Legend S={LEG} />

                  {/* act 1's pinned-up plan, in the same strip and the same style */}
                  <Plan S={LEG} />

                  {/* Speech bubbles at fixed stage spots, above the figures. They
                      sit in the same strip as the legend (which fades out on any
                      beat with a bubble) and clear the master's crown. The previous
                      beat's are held for a moment so they fade rather than cut. */}
                  {i > 0 ? BEATS[i - 1].say?.map((s) => (
                    <Bubble
                      key={`out-${s.who}-${s.text}`}
                      bt={bt} text={s.text} top={BUBBLE_TOP} leaving
                      side={s.who === 'app' ? 'left' : 'right'}
                    />
                  )) : null}
                  {beat.say?.map((s) => (
                    <Bubble
                      key={`${s.who}-${s.text}`}
                      bt={bt} text={s.text} top={BUBBLE_TOP}
                      side={s.who === 'app' ? 'left' : 'right'}
                    />
                  ))}
                </View>
              </View>
            </View>
          ) : null}
        </Animated.View>

        {/* Narration + interaction. Fade sequences the whole deck between beats. */}
        <View style={[styles.deck, stageGone && styles.deckTall]}>
          <Fade
            trigger={i}
            onSwap={() => setShown(i)}
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

        <View style={styles.tapLayer}>
          <Text style={styles.hint}>
            {locked ? 'Choose an answer' : last ? 'Finish' : 'Tap to continue'}
          </Text>
        </View>
      </Pressable>
    </SafeAreaView>
  );
}

// ── beat-to-beat transition (SEQUENTIAL, from lesson 1) ───────────────────────
// Fade the deck fully out, swap content while invisible, fade back in. `render`
// (not children) produces content only when it changes: a beat change fades; an
// in-beat change (answering, saving a quote) swaps live via `revision`, no fade.
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

  // Build the new content ON THE JS THREAD — the withTiming completion callback is
  // a worklet, and building React elements there crashes the screen. Always runOnJS.
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
        if (fin) runOnJS(swap)();
      });
    } else if (revision !== lastRev.current) {
      lastRev.current = revision;
      swap();
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

// ── the signpost legend ───────────────────────────────────────────────────────
// A flat reference card — words on the left, the role they flag on the right —
// drawn OUTSIDE the camera so it never zooms or softens, and pointerEvents="none"
// so it can't swallow the tap that advances the beat.
function Legend({ S }: { S: SharedValue<any> }) {
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

// ── the builder's plan ────────────────────────────────────────────────────────
// A dashed schematic of the finished shape — two base stones and the one they hold
// up — with a solid outline fading in over each ghost as the real stone is laid. It
// occupies exactly the legend's footprint (left 116 … 284, top 118 … 180), which is
// literal, un-zoomed stage space well inside the [110, 434] band, and it carries
// pointerEvents="none" so it can never swallow the tap that advances the beat.
function Plan({ S }: { S: SharedValue<any> }) {
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

// ── choices (teaching taps + graded questions) ────────────────────────────────
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
    <Animated.View style={styles.qWrap} layout={LinearTransition.duration(300)}>
      <Text style={styles.prompt}>{prompt}</Text>
      {options.map((o) => {
        const chosen = picked === o.id;
        const reveal = answered && o.correct;
        // Once answered, drop the options that are neither the pick nor the correct
        // answer. Four two-line options plus the explanation don't fit the deck, and
        // collapsing to just the result + the right answer keeps the takeaway in view.
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

// ── act 5 cards ───────────────────────────────────────────────────────────────
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

  // Fixed proportions, not flex:1 — a content-independent split so the stage never
  // resizes on a tap (the "glitch at the top" from lesson 1).
  // 42/50/8: a slightly shorter stage than lesson 1 so the deck can hold a
  // 3-line prompt plus four two-line options without clipping the last one. Fixed
  // proportions (content-independent) so the stage never resizes on a tap.
  stageWrap: { flex: 42, alignItems: 'center', justifyContent: 'flex-end' },
  stageGone: { flex: 0, height: 0 },
  deckTall: { flex: 92, justifyContent: 'center' },
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 40, right: 40, top: GROUND, height: 1.5, backgroundColor: RULE },


  // ── signpost legend ────────────────────────────────────────────────────────
  legend: {
    position: 'absolute', left: 36, top: 118, width: 328, height: 62,
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: PAPER,
  },
  legRow: { position: 'absolute', left: 12, right: 8, height: 25, flexDirection: 'row', alignItems: 'center' },
  legWords: {
    flex: 1, fontFamily: 'Inter_700Bold', fontSize: 12.5, letterSpacing: 0.4,
    color: INK, includeFontPadding: false,
  },
  legArrow: { fontFamily: 'Inter_700Bold', fontSize: 13, color: SOFT, marginHorizontal: 8, includeFontPadding: false },
  legTag: { width: 86, height: 20, borderRadius: 3, backgroundColor: INK, alignItems: 'center', justifyContent: 'center' },
  legTagText: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.1, color: PAPER, includeFontPadding: false },

  // ── the builder's plan (act 1 only) ────────────────────────────────────────
  // Same top edge and height as the legend, so the two cards hand over in place.
  // Inner box is 164 wide; the base pair (46 + 4 + 46 = 96) is centred at 84 and
  // the keystone sits centred above it.
  plan: {
    position: 'absolute', left: 116, top: 118, width: 168, height: 62,
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: PAPER,
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

  deck: { flex: 50, paddingHorizontal: 24, justifyContent: 'flex-start', overflow: 'hidden' },
  fadeWrap: { position: 'relative' },
  narr: { fontFamily: 'PlayfairDisplay_400Regular', fontSize: 18, lineHeight: 27, color: INK },
  cite: { fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.6, color: SOFT, marginBottom: 7 },

  qWrap: { marginTop: 2 },
  prompt: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 16, color: INK, marginBottom: 8, lineHeight: 21 },
  opt: {
    borderWidth: 1.5, borderColor: RULE, borderRadius: 5,
    paddingVertical: 8, paddingHorizontal: 14, marginBottom: 6, backgroundColor: PAPER,
  },
  optRight: { borderColor: INK, backgroundColor: INK },
  optRightText: { color: PAPER, fontFamily: 'Inter_700Bold' },
  optWrong: { borderColor: SOFT, opacity: 0.55 },
  optFade: { opacity: 0.4 },
  optText: { fontFamily: 'Inter_400Regular', fontSize: 13.5, color: INK, lineHeight: 18 },
  explain: { marginTop: 4, borderLeftWidth: 2, borderLeftColor: INK, paddingLeft: 12, paddingVertical: 2 },
  explainHead: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1.2, color: INK, marginBottom: 4 },
  explainText: { fontFamily: 'Inter_400Regular', fontSize: 13.5, color: SOFT, lineHeight: 20 },

  quoteCard: { borderWidth: 1.5, borderColor: INK, borderRadius: 3, padding: 18, marginTop: 2 },
  quoteMark: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 40, color: INK, height: 26, lineHeight: 36 },
  quoteText: {
    fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic',
    fontSize: 20, lineHeight: 30, color: INK, marginTop: 8,
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
