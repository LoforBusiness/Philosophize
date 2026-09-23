import {
  View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import {
  WALK, dirsFrom, ease01, lerp, moveTr, pose, travelStance, type Bundle, } from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './knowHowScript';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, PAPER, useHeld, carryFrom, keepHeld, facing, useCarry, carry, lookPose,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { floorStyle, lipOf, PLATE_FACE } from './stageSkin';
import { followMoves, kindOf, seedOf } from './camera';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';

// THE STAGE IS STRUCK IN THIS LESSON'S OWN BRANCH HUE (./stageTones).
// Same three tones, same luminance to the third decimal — so every contrast
// measured against the old greys still holds and nothing on the stage moved.
const TONE = stageTone('epistemology');
const { RULE, STONE, SHADE } = TONE;
const LIP = lipOf(TONE);   // the ledge a toned plate stands on (scripts/skin-stage.mjs)

// A column of instructions stage right, with the outcome box beneath it.
//
// COMPOSITION, in coordinates:
// · the figure WALKS x = 70 → 168 → 124. Body span x ± 36, widest x 132…204 at 168;
//   the working fist at gesture 41 reaches x 204.5.
// · all wall ink is at x ≥ 214, so the tightest clearance to the figure is 9.5 units.
// · instruction cards y 226…316 on a 32 pitch · the outcome box y 330…390 · the
//   answer row y 404…436. A standing crown is y 397; the answer row is lower than
//   that but sits at x 214…392, which the figure never enters.
//
// A5 — DELIBERATE: the wall is out of the figure's reach (its hand tops out at
// y 411, B11b) and no beat's text claims it touches anything. The box fills on the
// beat the narration says the hands move; the figure works at chest height beside
// it rather than pretending to reach a surface it cannot (D32, C22d2).

const WALL_L = 214;
const WALL_R = 392;
const WALL_W = WALL_R - WALL_L;

const STEP_T = 226;
const STEP_H = 26;
const STEP_PITCH = 32;

const BOX_W = 118;
const BOX_L = WALL_L + (WALL_W - BOX_W) / 2;
const BOX_T = 330;
const BOX_H = 60;

const ANS_T = 404;
const ANS_H = 32;
const ANS_GAP = 5;
const ANS_W = (WALL_W - 2 * ANS_GAP) / 3;

const STEPS = [
  'KEEP THE HEAD LOW',
  'EXHALE UNDERWATER',
  'PULL, DO NOT PUSH',
];

// One word each, and that is not a style choice. These sit in a 56-unit card whose
// inner width is 52, on a single line, so the WHOLE string has to fit — "THE DOING"
// measured 55.4 and would have been ellipsised to "THE DOIN…". The longest word is
// the wrong thing to measure when the label cannot wrap (D30).
const ANSWERS = [
  { id: 'doing', label: 'DOING', correct: true },
  { id: 'rules', label: 'RULES', correct: false },
  { id: 'why', label: 'REASONS', correct: false },
];

const P = BEATS.map((b) => b.p ?? 0);
const X = BEATS.map((b) => b.x ?? 124);
// The camera, from the staging: it follows the figure this track describes,
// pulls back to scale 1 on every graded beat so a tap lands where it is aimed,
// and leans in on the quote. See followMoves in ./camera.ts.
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('knowHow'));
const DIR = dirsFrom(X, 1);
const NSTEPS = BEATS.map((b) => b.steps ?? 0);
const DONE = BEATS.map((b) => b.done ?? 0);

// R7c — the stage follows the split on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
//
// The split divides what memorising gives you between THE FACTS (left) and THE
// SKILL (right), and `dragPos` is the LEFT side's share (R7b). The stage already
// draws both halves of that: the column of instructions is the facts, and the
// outcome box — EMPTY or DONE, with the column receding as it fills — is the
// skill. So the skill's share is `1 − dragPos`, read straight into `done`: toward
// "the skill of swimming itself" the box fills and the column dims, toward "the
// facts, yet none of the skill" the box empties and the column comes back up.
const REACT = BEATS.map((b) => (b.interact?.odd ? 1 : 0));

// ── the three still-tap events (group AH) ───────────────────────────────────
const SLOTS = BEATS.map((b) => (b.slots ? 1 : 0));
const LEAD = BEATS.map((b) => (b.lead ? 1 : 0));
const GATHER = BEATS.map((b) => (b.gather ? 1 : 0));
// The gap between the visible instructions and the box, where those three
// events draw what serves what. Read off the column's own geometry so a
// change to the card pitch moves these with it.
const CARD1_B = STEP_T + STEP_H;                    // bottom of the first card
const CARD3_B = STEP_T + 2 * STEP_PITCH + STEP_H;    // bottom of the third card
const LEAD_T = CARD1_B + (BOX_T - CARD1_B) / 2 - 7;  // centred in the wider gap after one card
const GATHER_Y = CARD3_B + 4;                        // just under the third card

export default function KnowHowScene({ clock, bt, bi, i, picked, onPick, dragPos, pickPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldS = useHeld();
  const cv = useCarry(6);
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;

  const shown = cur.steps ?? 0;
  const prevShown = prev?.steps ?? 0;
  const doneFade = (cur.done ?? 0) !== (prev?.done ?? 0);
  const slotsFade = (cur.slots ?? false) !== (prev?.slots ?? false);
  const leadFade = (cur.lead ?? false) !== (prev?.lead ?? false);
  const gatherFade = (cur.gather ?? false) !== (prev?.gather ?? false);

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / moveTr(X[p], X[n], 0.85));
    const t = clock.value;
    const grow = ease01(bt.value / 0.55);

    const s = keepHeld(heldS, travelStance(
      X[p], X[n],
      carryFrom(heldS, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));
    const done = carry(cv, 0, n, DONE[p], reacting ? 1 - pickPos.value : DONE[n], doneFade ? grow : tr);
    return {
      fig: lookPose(s, carry(cv, 1, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1, gazeX.value, gazeY.value, gazeOn.value),
      fill: carry(cv, 2, n, NSTEPS[p], NSTEPS[n], grow),
      done,
      // The column recedes as the box fills — the two are one movement, so the
      // reader reads it as a handover rather than as two things happening.
      dim: 1 - 0.45 * done,
      slots: carry(cv, 3, n, SLOTS[p], SLOTS[n], slotsFade ? grow : 1),
      lead: carry(cv, 4, n, LEAD[p], LEAD[n], leadFade ? grow : 1),
      gather: carry(cv, 5, n, GATHER[p], GATHER[n], gatherFade ? grow : 1),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const columnStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.dim }));
  const boxFillStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.done }));
  const emptyStyle = useAnimatedStyle(() => ({ opacity: 1 - SCENE.value.done }));
  // The three still-tap events (group AH): the empty slots before any instruction
  // is written in, the arrow from the first instruction down to the box, and the
  // bar that later gathers all three down to the same still-empty box.
  const slotsStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.slots }));
  const leadStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.lead }));
  const gatherStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.gather }));

  const answered = picked !== null;
  const showPick = (cur.pick ?? 0) > 0 && !!cur.interact;

  return (
    <Animated.View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      {/* The three instruction slots outline in empty, before any of them is
          written — "all that reading" as a shape with nothing filled yet. */}
      {[0, 1, 2].map((k) => (
        <Animated.View key={`slot-${k}`} pointerEvents="none"
          style={[styles.slotGhost, { top: STEP_T + k * STEP_PITCH }, slotsStyle]} />
      ))}
      {/* ── the instructions ────────────────────────────────────────────────── */}
      <Animated.View style={[styles.column, columnStyle]} pointerEvents="none">
        {STEPS.map((s, k) => (
          <StepCard key={s} index={k} label={s} shown={shown} prevShown={prevShown} SCENE={SCENE} />
        ))}
      </Animated.View>

      {/* An arrow drops from the one instruction so far: it serves an end
          beyond itself. */}
      <Animated.Text style={[styles.lead, leadStyle]} numberOfLines={1} pointerEvents="none">↓</Animated.Text>
      {/* A bar gathers all three instructions and drops toward the box, which
          still sits empty underneath them. */}
      <Animated.View style={[styles.gatherBar, gatherStyle]} pointerEvents="none" />
      <Animated.View style={[styles.gatherDrop, gatherStyle]} pointerEvents="none" />

      {/* ── the thing the instructions are for ──────────────────────────────── */}
      <View style={styles.box} pointerEvents="none">
        <Animated.Text style={[styles.boxEmpty, emptyStyle]} numberOfLines={1}>EMPTY</Animated.Text>
        <Animated.View style={[styles.boxFill, boxFillStyle]}>
          <Text style={styles.boxFillText} numberOfLines={1}>DONE</Text>
        </Animated.View>
      </View>
      <Text style={styles.boxLabel} numberOfLines={1} pointerEvents="none">THE DOING</Text>

      {/* ── Q2: what the column cannot hand you ─────────────────────────────── */}
      {showPick &&
        ANSWERS.map((a, k) => {
          const chosen = picked === a.id;
          return (
            <Target id={a.id} correct={a.correct} picked={picked} onPick={onPick}
              key={a.id} style={[styles.ans, { left: WALL_L + k * (ANS_W + ANS_GAP) }]} hitSlop={{ top: 6, bottom: 6, left: ANS_GAP / 2, right: ANS_GAP / 2 }} disabled={answered}>
              <View
                style={[
                  styles.ansInner,
                  answered && a.correct && styles.pickRight,
                  answered && chosen && !a.correct && styles.pickWrong,
                ]}
              >
                <Text
                  style={[styles.ansText, answered && a.correct && styles.onInk]}
                  numberOfLines={1}
                >
                  {a.label}
                </Text>
              </View>
            </Target>
          );
        })}

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </Animated.View>
  );
}

/** One instruction. Draws on when its beat adds it, then holds (C20c). */
function StepCard({
  index, label, shown, prevShown, SCENE,
}: {
  index: number; label: string; shown: number; prevShown: number;
  SCENE: { value: { fill: number } };   // a read-only view of the scene frame — DerivedValue<T> is invariant, so a narrowed DerivedValue does not accept the wider one
}) {
  const held = index < prevShown;
  const arriving = index >= prevShown && index < shown;
  const st = useAnimatedStyle(() => {
    if (held) return { opacity: 1, transform: [{ translateX: 0 }] };
    if (!arriving) return { opacity: 0, transform: [{ translateX: -8 }] };
    const a = Math.max(0, Math.min(1, SCENE.value.fill - index));
    return { opacity: a, transform: [{ translateX: (1 - a) * -8 }] };
  });
  return (
    <Animated.View style={[styles.step, { top: STEP_T + index * STEP_PITCH }, st]} pointerEvents="none">
      <Text style={styles.stepNum} numberOfLines={1}>{index + 1}</Text>
      <Text style={styles.stepText} numberOfLines={1}>{label}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 24, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON. A rule on its own leaves the
  // figure and everything it is looking at standing on bare page;
  // political7 and political8 both stand their subject on a filled mass.
  floor: floorStyle(TONE, GROUND),

  column: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H },
  step: {
    position: 'absolute', left: WALL_L, width: WALL_W, height: STEP_H,
    borderWidth: 1.5, borderColor: INK, borderRadius: 8, backgroundColor: STONE, boxShadow: LIP,
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, gap: 8,
  },
  stepNum: {
    fontFamily: 'Inter_700Bold', fontSize: 9, color: INK, width: 8,
    includeFontPadding: false,
  },
  stepText: {
    fontFamily: 'Inter_700Bold', fontSize: 9.5, letterSpacing: 0.5, color: INK,
    includeFontPadding: false,
  },

  // ── the three tap events (group AH) ──────────────────────────────────────
  // An outline of the slot an instruction will fill — never a fill itself,
  // so it reads as an empty space rather than another card (D31).
  slotGhost: {
    position: 'absolute', left: WALL_L, width: WALL_W, height: STEP_H,
    borderWidth: 1.5, borderColor: SHADE, borderRadius: 8, borderStyle: 'dashed',
  },
  lead: {
    position: 'absolute', left: WALL_L, top: LEAD_T, width: WALL_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 15, color: SHADE, includeFontPadding: false,
  },
  gatherBar: {
    position: 'absolute', left: WALL_L + 20, top: GATHER_Y, width: WALL_W - 40, height: 2,
    backgroundColor: SHADE,
  },
  gatherDrop: {
    position: 'absolute', left: WALL_L + WALL_W / 2 - 1, top: GATHER_Y, width: 2, height: BOX_T - GATHER_Y,
    backgroundColor: SHADE,
  },

  box: {
    position: 'absolute', left: BOX_L, top: BOX_T, width: BOX_W, height: BOX_H,
    borderWidth: 3, borderColor: INK, borderRadius: 8, backgroundColor: PLATE_FACE, boxShadow: LIP,
    alignItems: 'center', justifyContent: 'center',
  },
  boxEmpty: {
    fontFamily: 'Inter_500Medium', fontSize: 9, letterSpacing: 1.4, color: INK,
    includeFontPadding: false,
  },
  boxFill: {
    position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, backgroundColor: INK,
    alignItems: 'center', justifyContent: 'center',
  },
  boxFillText: {
    fontFamily: 'Inter_700Bold', fontSize: 14, letterSpacing: 2, color: PAPER,
    includeFontPadding: false,
  },
  boxLabel: {
    position: 'absolute', left: BOX_L, top: BOX_T - 14, width: BOX_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT,
    includeFontPadding: false,
  },

  ans: { position: 'absolute', top: ANS_T, width: ANS_W },
  ansInner: {
    height: ANS_H, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PLATE_FACE, boxShadow: LIP,
    alignItems: 'center', justifyContent: 'center',
  },
  // 9/0 rather than 9.5/0.3: these chips are ~52 units of inner width on ONE line,
  // so the whole string must fit, not its longest word. The house size for a
  // three-across answer row (D30).
  ansText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0, color: INK,
    includeFontPadding: false,
  },
  onInk: { color: PAPER },
  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT },
});

// Ink runs from the first instruction (226) to the ground line (500), with the box
// label sitting at 316. Band 220…512 is 292 units (H59).
export function KnowHowLesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={KnowHowScene} band={[220, 512]} camera={CAM} />;
}
