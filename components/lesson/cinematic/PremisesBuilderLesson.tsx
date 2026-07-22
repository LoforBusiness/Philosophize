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
import BrickStructure, {
  BASE_LX, BASE_RX, BASE_Y, CENTER_X, KEY_X, KEY_Y, type StructState,
} from './BrickStructure';
import { BEATS, gates, type Beat } from './builderScript';
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
const K_FIG = 1.35;                 // stage units per rig unit

const MASTER_X = 330;               // right, faces left — stands beside the work, not behind it
const APP_X = 62;                   // left, watches — clear of the base bricks
const APP_K = K_FIG * 0.88;         // the apprentice reads a touch shorter than the master
const LAY = 0.7;                    // seconds for a brick to drop into place

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

  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [asked, setAsked] = useState(0);
  const [done, setDone] = useState(false);
  const [boxSize, setBoxSize] = useState({ w: 0, h: 0 });

  const beat = BEATS[i];
  const clock = useSharedValue(0);
  const bt = useSharedValue(0);
  const bi = useSharedValue(0);
  const qv = useSharedValue(0);          // 0→1 answer progress (collapse / fly-up)

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
      key.ty += 96 * g;
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

  const fit = boxSize.w > 0 ? Math.min(boxSize.w / STAGE_W, boxSize.h / STAGE_H) : 0;
  const stageGone = !!beat.summary;
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
          <View style={[styles.fill, { width: `${((i + 1) / BEATS.length) * 100}%` }]} />
        </View>
        <Text style={styles.count}>{i + 1}/{BEATS.length}</Text>
      </View>

      {/* Tap anywhere to advance (an ancestor of the content, so scene taps bubble
          up while the choice buttons and bookmark handle their own). */}
      <Pressable style={styles.body} onPress={advance} disabled={locked}>
        <View style={[styles.stageWrap, stageGone && styles.stageGone]} onLayout={onStage}>
          {fit > 0 && !stageGone ? (
            <View style={{ width: STAGE_W * fit, height: STAGE_H * fit, overflow: 'hidden' }}>
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

                {/* speech bubbles at fixed stage spots, above the figures */}
                {beat.say?.map((s) => (
                  <Bubble key={s.who + s.text} bt={bt} text={s.text} who={s.who} />
                ))}
              </View>
            </View>
          ) : null}
        </View>

        {/* Narration + interaction. Fade sequences the whole deck between beats. */}
        <View style={[styles.deck, stageGone && styles.deckTall]}>
          <Fade
            trigger={i}
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

  // Build the new content ON THE JS THREAD — the withTiming completion callback is
  // a worklet, and building React elements there crashes the screen. Always runOnJS.
  const swap = useCallback(() => setContent(renderRef.current()), []);

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

// ── speech bubbles ────────────────────────────────────────────────────────────
function Bubble({ bt, text, who }: { bt: SharedValue<number>; text: string; who: 'master' | 'app' }) {
  const left = who === 'app';
  const st = useAnimatedStyle(() => {
    const u = seg(bt.value, 0.1, 0.5);
    const s = 0.6 + 0.4 * ease01(u) + Math.sin(Math.PI * ease01(u)) * 0.08;
    return { opacity: ease01(u), transform: [{ scale: s }] };
  });
  return (
    <Animated.View
      style={[
        styles.bubble,
        left ? { left: 14, alignItems: 'flex-start' } : { right: 14, alignItems: 'flex-end' },
        { top: 108 },
        st,
      ]}
    >
      <View style={styles.bubbleBox}>
        <Text style={styles.bubbleText}>{text}</Text>
      </View>
      <View style={[styles.tail, left ? { marginLeft: 24 } : { marginRight: 24 }]} />
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
  track: { flex: 1, height: 2, backgroundColor: RULE },
  fill: { height: 2, backgroundColor: INK },
  count: { fontFamily: 'Inter_500Medium', fontSize: 11, color: SOFT, letterSpacing: 1 },

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

  bubble: { position: 'absolute', maxWidth: 210 },
  bubbleBox: {
    borderWidth: 1.5, borderColor: INK, borderRadius: 4,
    backgroundColor: PAPER, paddingHorizontal: 12, paddingVertical: 8,
  },
  bubbleText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: INK, lineHeight: 18 },
  tail: { width: 10, height: 10, backgroundColor: INK, transform: [{ rotate: '45deg' }], marginTop: -5 },

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
