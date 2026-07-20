import { useCallback, useMemo, useRef, useState } from 'react';
import {
  View, Text, Pressable, StyleSheet, type LayoutChangeEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, {
  useSharedValue, useDerivedValue, useAnimatedStyle, useFrameCallback,
  type SharedValue,
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
  BLANK, WALK, clamp01, ease01, guard, lerp, mixStance, phaseFor, pose,
  present, punch, recoil, seg, stand, walk, type Bundle,
} from './rig';

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// The cinematic runner for logic-arguments-1.
//
// One continuous scene, advanced by TAP. Two clocks drive everything:
//   clock â€” never resets. Idle life: breathing, bobbing, the boxing exchange.
//   bt    â€” beat-local, resets on every advance. Transitions and text reveals.
// Keeping them separate is what stops the fight restarting every time the reader
// taps, while still letting each beat stage its own entrance.
//
// LAYOUT. The animated stage is a fixed 400Ã—560 design space scaled to whatever
// room is left between the header and the narration block. Narration and the
// interaction panels deliberately live OUTSIDE that scaled stage, in normal RN
// layout â€” scaled text goes soft and scaled tap targets shrink.
//
// PERFORMANCE. Figures are native Views (see Stickman.tsx); the only SVG is the
// 280Ã—160 illustration board, which is bounded and mounted only while its beat
// is on screen. A full-screen animated <Svg> measured ~10fps on an S24 Ultra.
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const INK = '#1A1A1A';
const PAPER = '#FAFAF7';
const SOFT = '#6B6B6B';
const RULE = '#E4E1D8';

const STAGE_W = 400;
const STAGE_H = 560;
const GROUND = 500;
const BOARD = { x: 60, y: 26, w: 280, h: 160 };
const K_FIG = 1.35;                       // stage units per rig unit

const COMPLETION_XP = 5;                  // matches LessonRunner
const FIGHT_CYCLE = 2.6;                  // seconds for one full punch exchange
const LUNGE = 16;                         // stage units the body drives forward on a punch

// â”€â”€ shots â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// One per beat, precomputed at module scope so the worklet can index it.
// Camera: scale `s` about stage point (cx, cy), which is mapped to the stage
// centre. Modes: 0 fight Â· 1 stand Â· 2 present Â· 3 walk-in.
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
    // fixed stage position OUTSIDE the camera and so don't move when it zooms.
    return { ...base, s: 1.34, cx: 200, cy: 385, rOn: 1, bOn: 1, ring: 1 };
  }
  if (b.act === 2) {
    // First beat: camera pulls back while the fight carries on, and the narrator
    // walks in from off-stage. After that the boxers fade and he takes the floor.
    const first = BEATS.findIndex((x) => x.act === 2) === i;
    return {
      ...base,
      s: first ? 1 : 1.15, cx: 200, cy: first ? STAGE_H / 2 : 430,
      tr: first ? 2.4 : 0.75,                 // long enough for a believable walk
      rOn: first ? 1 : 0, bOn: first ? 1 : 0, ring: first ? 1 : 0,
      nx: first ? 38 : b.board ? 132 : 200, nOn: 1, nMode: first ? 3 : b.board ? 2 : 1,
    };
  }
  if (b.act === 3) {
    // Pushed in so the narrator sits close under the board rather than leaving a
    // dead band between his head and the illustration.
    return {
      ...base, s: 1.15, cx: 200, cy: 430,
      nOn: 1, nMode: b.board ? 2 : 1, nx: b.board ? 132 : 200,
    };
  }
  if (b.act === 4) {
    // The rematch: same two figures, standing, calm.
    return { ...base, s: 1.12, cx: 200, cy: 450, rx: 148, bx: 252, rOn: 1, bOn: 1, rMode: 1, bMode: 1 };
  }
  return base;                                 // act 5 â€” nobody on stage
}

const SHOTS: Shot[] = BEATS.map(shotFor);

const BOARDS: Record<BoardKey, React.ComponentType<{ p: SharedValue<number>; w?: number; h?: number }>> = {
  anatomy: AnatomyDiagram,
  syllogism: SyllogismChart,
  loudness: LoudnessChart,
  tworoads: TwoRoadsChart,
};

// â”€â”€ the fight exchange â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
/** Rises across [a,b], falls across [c,d]. A punch, or the recoil from one. */
function swell(t: number, a: number, b: number, c: number, d: number) {
  'worklet';
  return clamp01(seg(t, a, b) - seg(t, c, d));
}

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
  const bp = useSharedValue(0);
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
  // The board keeps drawing across consecutive beats that share it, and only
  // restarts when the illustration actually changes.
  const boardKey = beat.board ?? null;
  const prevBoard = useRef<BoardKey | null | undefined>(undefined);
  if (prevBoard.current !== boardKey) {
    prevBoard.current = boardKey;
    bp.value = 0;
  }

  useFrameCallback((f) => {
    'worklet';
    let dt = (f.timeSincePreviousFrame ?? 16) / 1000;
    if (dt > 0.05) dt = 0.05;                 // a stall must not fast-forward the scene
    clock.value += dt;
    bt.value += dt;
    if (bp.value < 1) bp.value = Math.min(1, bp.value + dt / 3.2);
  }, true);

  // â”€â”€ scene solve â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const cur = SHOTS[n];
    const prv = SHOTS[n > 0 ? n - 1 : 0];
    const tr = ease01(bt.value / cur.tr);
    const L = (a: number, b: number) => { 'worklet'; return lerp(a, b, tr); };

    const t = clock.value;
    const ct = t % FIGHT_CYCLE;
    // Red leads, blue answers â€” offset by half a cycle so they alternate.
    const rReach = swell(ct, 0.50, 0.78, 0.82, 1.15);
    const bHit = swell(ct, 0.62, 0.86, 0.90, 1.24);
    const bReach = swell(ct, 1.80, 2.08, 2.12, 2.45);
    const rHit = swell(ct, 1.92, 2.16, 2.20, 2.54);

    const fight = (reach: number, hit: number) => {
      'worklet';
      // Both reduce to a guard at 0, so switching between them at the crossover
      // (where both are ~0) is seamless.
      return hit > reach ? recoil(t, hit) : punch(t, reach);
    };
    const modeStance = (m: number, reach: number, hit: number, x: number, x0: number) => {
      'worklet';
      if (m === 0) return fight(reach, hit);
      if (m === 2) return present(t, tr);
      if (m === 3) {
        // Walk-in: phase from DISTANCE travelled, so the feet stay locked no
        // matter how the transition eases, then settle into a stand on arrival.
        const w = walk(x - x0, WALK);
        return tr > 0.985 ? stand(t) : mixStance(w, stand(t), clamp01((tr - 0.86) / 0.14));
      }
      return stand(t);
    };

    // A punch carries the whole body forward. Without the lunge the arm alone
    // can only cross ~49 units, which at a readable separation looks like
    // shadow-boxing rather than two people going at each other.
    const rx = L(prv.rx, cur.rx) + rReach * LUNGE;
    const bx = L(prv.bx, cur.bx) - bReach * LUNGE;
    const nx = L(prv.nx, cur.nx);
    const rOn = L(prv.rOn, cur.rOn), bOn = L(prv.bOn, cur.bOn), nOn = L(prv.nOn, cur.nOn);

    return {
      cam: { s: L(prv.s, cur.s), cx: L(prv.cx, cur.cx), cy: L(prv.cy, cur.cy) },
      ring: L(prv.ring, cur.ring),
      red: rOn > 0.002
        ? pose(modeStance(cur.rMode, rReach, rHit, rx, prv.rx), rx, GROUND, K_FIG, 1, rOn)
        : BLANK,
      blue: bOn > 0.002
        ? pose(modeStance(cur.bMode, bReach, bHit, bx, prv.bx), bx, GROUND, K_FIG, -1, bOn)
        : BLANK,
      narr: nOn > 0.002
        ? pose(modeStance(cur.nMode, 0, 0, nx, prv.nx), nx, GROUND, K_FIG, 1, nOn)
        : BLANK,
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

  // â”€â”€ advance â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
  const Board = boardKey ? BOARDS[boardKey] : null;
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

      {/* the animated stage */}
      <View style={styles.stageWrap} onLayout={onStage}>
        {fit > 0 ? (
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

              {/* the board sits OUTSIDE the camera so illustrations stay crisp */}
              {Board ? (
                <View style={{ position: 'absolute', left: BOARD.x, top: BOARD.y }}>
                  <Board p={bp} w={BOARD.w} h={BOARD.h} />
                </View>
              ) : null}

              {/* speech bubbles ride the camera with their speaker */}
              {beat.say?.map((s) => (
                <Bubble key={s.who + s.text} bt={bt} text={s.text} who={s.who} act={beat.act} />
              ))}
            </View>
          </View>
        ) : null}
      </View>

      {/* narration + interaction */}
      <View style={styles.deck}>
        {beat.cite ? <Cite bt={bt} text={beat.cite} /> : null}
        {beat.text ? <Narration key={i} bt={bt} text={beat.text} /> : null}

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
      </View>

      {/* tap anywhere to continue â€” never over a pending question */}
      <Pressable
        style={styles.tapLayer}
        pointerEvents={locked ? 'none' : 'auto'}
        onPress={advance}
      >
        <Text style={styles.hint}>{last ? 'Finish' : 'Tap to continue'}</Text>
      </Pressable>
    </SafeAreaView>
  );
}

// â”€â”€ narration, revealed word by word â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function Word({ bt, w, idx, n }: { bt: SharedValue<number>; w: string; idx: number; n: number }) {
  const st = useAnimatedStyle(() => {
    // Whole line lands in ~0.9s regardless of length, so long lines don't crawl.
    const t0 = 0.12 + (idx / Math.max(1, n)) * 0.9;
    const u = ease01(seg(bt.value, t0, t0 + 0.34));
    return { opacity: u, transform: [{ translateY: (1 - u) * 7 }] };
  });
  return <Animated.Text style={[styles.word, st]}>{w} </Animated.Text>;
}

function Narration({ bt, text }: { bt: SharedValue<number>; text: string }) {
  const words = useMemo(() => text.split(' '), [text]);
  return (
    <View style={styles.line}>
      {words.map((w, k) => (
        <Word key={`${k}-${w}`} bt={bt} w={w} idx={k} n={words.length} />
      ))}
    </View>
  );
}

function Cite({ bt, text }: { bt: SharedValue<number>; text: string }) {
  const st = useAnimatedStyle(() => ({ opacity: ease01(seg(bt.value, 0.5, 1.3)) }));
  return <Animated.Text style={[styles.cite, st]}>{text.toUpperCase()}</Animated.Text>;
}

// â”€â”€ speech bubbles â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
        { top: act === 1 ? 176 : 208 },
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

// â”€â”€ choices (both the teaching taps and the graded questions) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
    <View style={styles.qWrap}>
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
              pressed && !answered && { opacity: 0.75 },
            ]}
          >
            <Text style={[styles.optText, reveal && styles.optRightText]}>{o.text}</Text>
          </Pressable>
        );
      })}
      {answered ? (
        <View style={styles.explain}>
          <Text style={styles.explainHead}>
            {gotIt ? (graded ? 'Correct  Â·  +5 XP' : 'Thatâ€™s the one') : 'Not quite'}
          </Text>
          <Text style={styles.explainText}>{explain}</Text>
        </View>
      ) : null}
    </View>
  );
}

// â”€â”€ act 5 cards â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function QuoteCard({
  q, saved, onToggle,
}: {
  q: { text: string; author: string; work: string; era: string };
  saved: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={styles.quoteCard}>
      <Text style={styles.quoteMark}>â€œ</Text>
      <Text style={styles.quoteText}>{q.text}</Text>
      <View style={styles.quoteFoot}>
        <Pressable onPress={onToggle} hitSlop={12}>
          <SketchIcon name={saved ? 'bookmark-filled' : 'bookmark'} size={18} color={saved ? INK : SOFT} />
        </Pressable>
        <Text style={styles.quoteBy}>
          {q.author.toUpperCase()}  Â·  {q.work}, {q.era}
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
          <Text style={styles.sumDot}>â—†</Text>
          <Text style={styles.sumPoint}>{p}</Text>
        </View>
      ))}
      <Text style={styles.sumClose}>{s.closing}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PAPER },

  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingTop: 4, gap: 12 },
  close: { padding: 4 },
  track: { flex: 1, height: 2, backgroundColor: RULE },
  fill: { height: 2, backgroundColor: INK },
  count: { fontFamily: 'Inter_500Medium', fontSize: 11, color: SOFT, letterSpacing: 1 },

  stageWrap: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 40, right: 40, top: GROUND, height: 1.5, backgroundColor: RULE },
  ring: {
    position: 'absolute', left: 46, right: 46, top: GROUND - 96, height: 96,
    borderTopWidth: 1.5, borderBottomWidth: 0, borderColor: RULE,
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
  line: { flexDirection: 'row', flexWrap: 'wrap' },
  word: {
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
  sumDot: { fontSize: 9, color: INK, marginTop: 5 },
  sumPoint: { fontFamily: 'Inter_400Regular', fontSize: 14.5, color: INK, lineHeight: 21, flex: 1 },
  sumClose: {
    fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic',
    fontSize: 16, color: SOFT, lineHeight: 24, marginTop: 12,
  },

  tapLayer: { paddingVertical: 12, alignItems: 'center' },
  hint: { fontFamily: 'Inter_500Medium', fontSize: 11, letterSpacing: 2, color: SOFT },
});
