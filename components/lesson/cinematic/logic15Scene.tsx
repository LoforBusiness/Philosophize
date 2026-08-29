import {
  View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, mixStance, pose, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './logic15Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// A CROWD, TWO OF THEM RINGED, AND A CLAIM AS WIDE AS THE CROWD (H64). The sample
// and the conclusion are drawn at their real relative sizes, so the leap between
// them has a measurable width instead of being described as large.
//
// · the CLAIM bar is x 60…382 at y 252…296 — 322 wide, the width of the crowd.
// · the LEAP card is x 150…290 at y 308…348 — 140 wide, and it is the only thing
//   joining the two, which is what it is for.
// · the CROWD is 33 dots: 11 columns on a 26 pitch from x 96, three rows at
//   y 366 / 392 / 418, each dot 12 across. Its right edge is x 382.
// · the SAMPLE ring is x 90…150, y 360…384 — round the first two dots of the top
//   row, the two you actually met.
// · the figure stands at x = 44 facing right; his widest ink is a fist at x ≈ 77,
//   thirteen units clear of the sample ring at 90. His crown is y 397, which is
//   level with the crowd's rows — but he stands entirely left of x 90, so he is
//   beside the crowd and never in it (D23).
// · the label sits at y 228…244; highest ink in the scene. Lowest is the ground.
//
// Band 222…512 = 290, which holds one figure at 36% of the frame (check:scale).

const FIG_X = 44;

const LABEL_T = 228;

const CLAIM_L = 60;
const CLAIM_W = 322;
const CLAIM_T = 252;
const CLAIM_H = 44;

const LEAP_L = 150;
// 180, NOT 140. THEREFORE ALL OF THEM is 134dp at 9pt with 0.9 of tracking, and
// the card's content box was 120 after its border and padding — so the claim the
// whole lesson turns on lost its last word and a half. At 180 the column is 160
// and it sits on one line, and the card still ends at x 330, well inside the stage.
const LEAP_W = 180;
const LEAP_T = 308;
const LEAP_H = 40;

const CROWD_L = 96;
const CROWD_COLS = 11;
const CROWD_PITCH = 26;
const DOT = 12;
const ROW_T = [366, 392, 418];

const RING_L = 90;
const RING_W = 60;
const RING_T = 360;
const RING_H = 24;

const G = BEATS.map((b) => b.g ?? 0);
const CROWD = BEATS.map((b) => b.crowd ?? 0);
const SAMPLE = BEATS.map((b) => b.sample ?? 0);
const LEAP = BEATS.map((b) => b.leap ?? 0);
const CLAIM = BEATS.map((b) => b.claim ?? 0);
const PICKV = BEATS.map((b) => b.pick ?? 0);

const X = BEATS.map((b) => b.x ?? FIG_X);

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.drag ? 1 : 0));
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('logic15'));

export default function Logic15Scene({ clock, bt, bi, i, picked, onPick, dragPos }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldS = useHeld();
  const cv = useCarry(5);
  const cur = BEATS[i];

  const live = (cur.pick ?? 0) > 0 && !!cur.interact;
  const answered = picked !== null;

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.7);          // nobody walks; this is a pose blend
    const t = clock.value;
    const grow = ease01(bt.value / 0.9);
    const wide = ease01(bt.value / 1.2);

    const s = keepHeld(heldS, mixStance(
      carryFrom(heldS, n, emoteHold(G[p], t)), emoteLive(G[n], t, bt.value), tr,
    ));
    return {
      fig: pose(s, FIG_X, GROUND, K_FIG, 1, 1),
      crowd: carry(cv, 0, n, CROWD[p], CROWD[n], grow),
      sample: carry(cv, 1, n, SAMPLE[p], SAMPLE[n], grow),
      // R7b — the knob closes the leap. At the near end the reader is only being
      // surer about two people and the step to the whole crowd is enormous; drag
      // toward asking many more and it shortens until it is a step you could take.
      leap: carry(cv, 2, n, LEAP[p], reacting ? 1 - dragPos.value : LEAP[n], grow),
      // The claim opens sideways from the sample's own width, so the reader watches
      // two dots' worth of evidence stretch to cover the whole crowd.
      claim: carry(cv, 3, n, CLAIM[p], CLAIM[n], wide),
      parts: carry(cv, 4, n, PICKV[p], PICKV[n], grow),
    };
  });

  const D = useDerivedValue<Bundle>(() => SCENE.value.fig);

  const crowd = useAnimatedStyle(() => ({ opacity: SCENE.value.crowd }));

  return (
    <Animated.View style={styles.scene}>
      <Text style={styles.label} numberOfLines={1}>ONE COUNTRY, EVERY PERSON IN IT</Text>

      {/* ── THE CLAIM ────────────────────────────────────────────────────── */}
      <Part
        id="claim" correct={false}
        style={styles.claim} SCENE={SCENE} field="claim" widen
        live={live} answered={answered} picked={picked} onPick={onPick}
        label="PEOPLE FROM THERE ARE RUDE" size={11}
      />

      {/* ── THE STEP ─────────────────────────────────────────────────────── */}
      <Part
        id="leap" correct
        style={styles.leap} SCENE={SCENE} field="leap"
        live={live} answered={answered} picked={picked} onPick={onPick}
        label="THEREFORE ALL OF THEM" size={9}
      />

      {/* ── THE CROWD, AND THE TWO YOU MET ───────────────────────────────── */}
      <Animated.View style={[styles.crowd, crowd]} pointerEvents="none">
        {ROW_T.map((y, r) => (
          Array.from({ length: CROWD_COLS }, (_, c) => (
            <View
              key={`${r}-${c}`}
              style={[styles.dot, { left: CROWD_L + c * CROWD_PITCH, top: y }]}
            />
          ))
        ))}
      </Animated.View>

      <Part
        id="sample" correct={false}
        style={styles.ring} SCENE={SCENE} field="sample" bare
        live={live} answered={answered} picked={picked} onPick={onPick}
        label="" size={9}
      />

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={D} k={K_FIG} />
    </Animated.View>
  );
}

/** One part of the diagram — and one of the Q1 targets. */
function Part({
  id, correct, style, SCENE, field, widen, bare, live, answered, picked, onPick, label, size,
}: {
  id: string;
  correct: boolean;
  bare?: boolean;
  style: object;
  SCENE: { value: { crowd: number; sample: number; leap: number; claim: number; parts: number } };
  field: 'crowd' | 'sample' | 'leap' | 'claim' | 'parts';
  widen?: boolean;
  live: boolean;
  answered: boolean;
  picked: string | null;
  onPick: (id: string, correct: boolean) => void;
  label: string;
  size: number;
}) {
  const on = answered && correct;
  const st = useAnimatedStyle(() => {
    const a = SCENE.value[field];
    return widen
      ? { opacity: a, transform: [{ scaleX: 0.42 + 0.58 * a }] }
      : { opacity: a, transform: [{ translateY: (1 - a) * -8 }] };
  });
  return (
    <Animated.View style={[style, st]}>
      <Target id={id} correct={correct} picked={picked} onPick={onPick}
              style={styles.fill} disabled={!live || answered}>
        <View style={[
          styles.partInner,
          bare && styles.partBare,
          on && styles.pickRight,
          answered && picked === id && !correct && styles.pickWrong,
        ]}>
          {label ? (
            <Text style={[styles.partText, { fontSize: size }, on && styles.onInk]} numberOfLines={1}>
              {label}
            </Text>
          ) : null}
        </View>
      </Target>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 16, right: 16, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON. A rule on its own leaves the
  // figure and everything it is looking at standing on bare page;
  // political7 and political8 both stand their subject on a filled mass.
  floor: { position: 'absolute', left: 0, right: 0, top: GROUND, bottom: 0, backgroundColor: RULE },
  fill: { flex: 1 },

  label: {
    position: 'absolute', left: 20, top: LABEL_T, width: 360,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.2, color: SOFT,
    textAlign: 'center', includeFontPadding: false,
  },

  claim: { position: 'absolute', left: CLAIM_L, top: CLAIM_T, width: CLAIM_W, height: CLAIM_H },
  leap: { position: 'absolute', left: LEAP_L, top: LEAP_T, width: LEAP_W, height: LEAP_H },
  ring: { position: 'absolute', left: RING_L, top: RING_T, width: RING_W, height: RING_H },

  partInner: {
    flex: 1, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: STONE,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8,
  },
  // The sample ring is drawn round two dots that must stay visible through it, so
  // it is the one part with no fill of its own.
  partBare: { backgroundColor: undefined },
  partText: {
    fontFamily: 'Inter_700Bold', letterSpacing: 0.9, color: INK,
    textAlign: 'center', includeFontPadding: false,
  },

  crowd: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H },
  dot: { position: 'absolute', width: DOT, height: DOT, borderRadius: DOT / 2, backgroundColor: SOFT },

  onInk: { color: PAPER },
  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT },
});

// Ink runs from the label (228) to the ground line (500). Band 222…512 = 290.
export function Logic15Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Logic15Scene} band={[222, 512]} camera={CAM} />;
}
