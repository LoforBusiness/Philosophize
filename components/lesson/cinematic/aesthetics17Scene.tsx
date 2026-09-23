import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, dirsFrom, ease01, moveTr, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './aesthetics17Script';
import { facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { floorStyle, lipOf, PLATE_FACE } from './stageSkin';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';
import { Shapes, ell, bar, tri, type Part } from './Silhouette';

// THE STAGE IS STRUCK IN THIS LESSON'S OWN BRANCH HUE (./stageTones).
// Same three tones, same luminance to the third decimal — so every contrast
// measured against the old greys still holds and nothing on the stage moved.
const TONE = stageTone('aesthetics');
const { RULE, STONE, SHADE } = TONE;
const LIP = lipOf(TONE);   // the ledge a toned plate stands on (scripts/skin-stage.mjs)

// A TERROR, A METER, AND WHAT HAPPENS NEXT — and a frame that changes exactly one
// of the three (H64). All three are the Q1 targets, so the question is whether the
// reader watched the right thing.
//
// · the figure walks x = 74 → 160, facing right throughout. At 160 his widest ink
//   is a fist at x ≈ 193, sixty-one units clear of the frame at 254 (B9).
// · the CONSEQUENCE strip is x 30…240, y 240…276 — 210 × 36.
// · the FEAR meter is x 30…240, y 296…332 — the same 210 × 36, deliberately, so
//   the two readings read as a pair rather than as a caption and a gauge.
// · the FRAME is x 254…396, y 292…500 and the SHAPE stands inside it in a
//   102 × 184 box at x 274…376, y 316…500 — a creature, horns topping out at
//   y 344. The frame is fourteen units clear of the strips' column and the shape
//   twenty inside the frame, so nothing touches anything (D23).
// · highest ink is the consequence strip at y 240; lowest is the ground at 500.
//   The figure's crown is y 397 — below every strip and left of the frame.
//
// Band 230…512 = 282: the smallest that keeps one figure under check:scale's 38%
// share of the frame (103 / 282 = 37%).

const CONSEQ_T = 240;
const FEAR_T = 296;
const PANEL_L = 30;
const PANEL_W = 210;
const PANEL_H = 36;

const FRAME_L = 254;
const FRAME_W = 142;
const FRAME_T = 292;

const SHAPE_L = 274;
const SHAPE_W = 102;
const SHAPE_T = 316;
/** The row inside the frame, above the creature, that carries its name (AN1). */
const SHAPE_CAP = 20;

// The gap between the fear panel (right edge 240) and the frame (left edge 254),
// and the gap above the frame (consequence panel ends 276, frame starts 292).
const BRIDGE_Y = FEAR_T + PANEL_H / 2;
const ANSWER_T = 280;

/**
 * THE SHAPE IN THE DARK, in its own 102 × 184 box.
 *
 * It was a rounded box with three spikes and two eyes: furniture with a face. The
 * horror silhouette the references agree on is a TALL, NARROW mass with HIGH, HUNCHED
 * shoulders and a small head sitting low and forward between them; arms LONGER than
 * the torso, ending in long claws that break the outline; and clear paper between
 * the arms and the body and between the legs — the gaps and the broken edge are what
 * stop it reading as a block. Nothing inside it but two pale slits for eyes.
 */
const CREATURE: Part[] = [
  bar(40, 120, 34, 181, 12, INK), bar(62, 120, 70, 181, 12, INK),
  bar(34, 181, 23, 183, 5, INK), bar(70, 181, 81, 183, 5, INK),
  bar(27, 58, 18, 92, 9, INK), bar(18, 92, 12, 128, 7.5, INK),
  bar(12, 128, 5, 142, 2.4, INK), bar(12, 128, 10.5, 145, 2.4, INK), bar(12, 128, 17, 143, 2.4, INK),
  bar(75, 58, 84, 92, 9, INK), bar(84, 92, 90, 128, 7.5, INK),
  bar(90, 128, 97, 142, 2.4, INK), bar(90, 128, 91.5, 145, 2.4, INK), bar(90, 128, 85, 143, 2.4, INK),
  ell(51, 90, 42, 74, INK), ell(38, 56, 28, 20, INK, -22), ell(64, 54, 28, 20, INK, 22),
  ell(51, 44, 18, 20, INK),
  tri(45, 33, 5, 9, 'up', INK, -16), tri(57, 33, 5, 9, 'up', INK, 16),
  ell(47, 45, 4.4, 2.2, PAPER, 14), ell(55.5, 45, 4.4, 2.2, PAPER, -14),
];

const G = BEATS.map((b) => b.g ?? 0);
const X = BEATS.map((b) => b.x ?? 160);
// WHICH WAY HE IS POINTING, read off the same x track he walks along:
// +1 where it rises, -1 where it falls, and HOLD while he stands still, so a
// figure who walks left to something keeps facing it while he talks about it.
const DIR = dirsFrom(X, 1);
const SHAPE = BEATS.map((b) => b.shape ?? 0);
const FEAR = BEATS.map((b) => b.fear ?? 0);
const FRAME = BEATS.map((b) => b.frame ?? 0);
// GROUP AH — three still taps, each moving a new mass rather than a caption.
const BRIDGE = BEATS.map((b) => ((b.bridge ?? 0) > 0 ? 1 : 0));
const ANSWERN = BEATS.map((b) => b.answerN ?? 0);

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.sort ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('aesthetics17'));

export default function Aesthetics17Scene({ clock, bt, bi, i, picked, onPick, pickPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldS = useHeld();
  const cv = useCarry(6);
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;
  const bridgeFade = (cur.bridge ?? 0) !== (prev?.bridge ?? 0);
  const answerFade = (cur.answerN ?? 0) !== (prev?.answerN ?? 0);

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    // The transition is as long as the walk is far (C17) — he comes back toward the
    // frame on beat 1 and stays there.
    const tr = ease01(bt.value / moveTr(X[p], X[n], 0.85));
    const t = clock.value;
    const grow = ease01(bt.value / 0.9);

    const s = keepHeld(heldS, travelStance(
      X[p], X[n],
      carryFrom(heldS, n, emoteHold(G[p], t)), emoteHold(G[n], t), emoteLive(G[n], t, bt.value),
      tr, WALK,
    ));
    return {
      fig: lookPose(s, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1, gazeX.value, gazeY.value, gazeOn.value),
      shape: carry(cv, 1, n, SHAPE[p], SHAPE[n], grow),
      // R7b — the arm sets the fear meter. The far setting says the fear is real with
      // the consequences taken out, and the meter stands up as the reader reaches it:
      // the frame stays, and the reading climbs anyway.
      fear: carry(cv, 2, n, FEAR[p], reacting ? pickPos.value : FEAR[n], grow),
      frame: carry(cv, 3, n, FRAME[p], FRAME[n], grow),
      // A dashed line, crossing unbroken from the meter into the frame's own edge —
      // "as strong inside the frame as outside it" drawn rather than repeated.
      bridge: carry(cv, 4, n, BRIDGE[p], BRIDGE[n], bridgeFade ? grow : 1),
      // A mark for each philosopher's answer, in the order they're named.
      answerN: carry(cv, 5, n, ANSWERN[p], ANSWERN[n], answerFade ? grow : 1),
    };
  });

  const D = useDerivedValue<Bundle>(() => SCENE.value.fig);

  const answered = picked !== null;
  const live = (cur.pick ?? 0) > 0 && !!cur.interact;
  // The consequence rewrites itself once the answer is in — the reveal IS the
  // explanation, and it cannot be read before the pick (group O).
  const framed = answered;

  const shapeStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.shape }));
  const frameStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.frame,
    transform: [{ scale: 0.9 + 0.1 * SCENE.value.frame }],
  }));
  const fearFill = useAnimatedStyle(() => ({ transform: [{ scaleX: SCENE.value.fear }] }));
  const bridgeStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.bridge }));

  return (
    <Animated.View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      {/* ── WHAT HAPPENS NEXT ────────────────────────────────────────────── */}
      <Panel
        id="follows" correct top={CONSEQ_T}
        label={framed ? 'AND THEN THE LIGHTS COME UP' : 'AND THEN IT REACHES YOU'}
        live={live} answered={answered} picked={picked} onPick={onPick}
      />

      {/* ── THE FEAR, WHICH DOES NOT MOVE ────────────────────────────────── */}
      <Panel
        id="fear" correct={false} top={FEAR_T} label="FEAR"
        live={live} answered={answered} picked={picked} onPick={onPick}
      >
        <View style={styles.fearTrack} pointerEvents="none">
          <Animated.View style={[styles.fearFill, fearFill]} pointerEvents="none" />
        </View>
      </Panel>

      {/* the fear crossing the frame's edge unbroken — the same response, inside */}
      <Animated.View style={[styles.bridge, bridgeStyle]} pointerEvents="none" />
      {/* a mark for each of the three answers, named in order */}
      {[0, 1, 2].map((k) => (
        <AnswerTick key={k} k={k} SCENE={SCENE} />
      ))}

      {/* ── THE FRAME AND THE SHAPE ──────────────────────────────────────── */}
      <Animated.View style={[styles.frame, frameStyle]} pointerEvents="none" />
      <Animated.View style={[styles.shapeWrap, shapeStyle]}>
        <Target
          id="shape" correct={false} picked={picked} onPick={onPick}
          style={styles.fill} disabled={!live || answered}
        >
          {/* A wrong pick marks the creature by form: it greys, rather than a box
              round it changing its border. */}
          <Text style={styles.shapeName} pointerEvents="none">THE SHAPE</Text>
          <View style={styles.shapeBody} pointerEvents="none">
            <Shapes parts={CREATURE} color={answered && picked === 'shape' ? SOFT : undefined} />
          </View>
        </Target>
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={D} k={K_FIG} />
    </Animated.View>
  );
}

/** One of the two readings, and one of the Q1 targets. */
function Panel({
  id, correct, top, label, live, answered, picked, onPick, children,
}: {
  id: string; correct: boolean; top: number; label: string;
  live: boolean; answered: boolean; picked: string | null;
  onPick: (id: string, correct: boolean) => void;
  children?: React.ReactNode;
}) {
  const on = answered && correct;
  return (
    <View style={[styles.panel, { top }]}>
      <Target
        id={id} correct={correct} picked={picked} onPick={onPick}
        style={styles.fill} disabled={!live || answered}
      >
        <View
          style={[
            styles.panelInner,
            on && styles.pickRight,
            answered && picked === id && !correct && styles.pickWrong,
          ]}
        >
          <Text style={[styles.panelText, on && styles.onInk]} numberOfLines={1}>{label}</Text>
          {children}
        </View>
      </Target>
    </View>
  );
}

/** One of the three answers' own mark, lit as its philosopher is named. */
function AnswerTick({ k, SCENE }: { k: number; SCENE: { value: { answerN: number } } }) {
  const style = useAnimatedStyle(() => ({ opacity: 0.3 + 0.7 * clamp01(SCENE.value.answerN - k) }));
  return <Animated.View style={[styles.answerTick, { left: FRAME_L + k * (10 + 4) }, style]} pointerEvents="none" />;
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 16, right: 16, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON. A rule on its own leaves the
  // figure and everything it is looking at standing on bare page;
  // political7 and political8 both stand their subject on a filled mass.
  floor: floorStyle(TONE, GROUND),
  fill: { flex: 1 },

  panel: { position: 'absolute', left: PANEL_L, width: PANEL_W, height: PANEL_H },
  panelInner: {
    flex: 1, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PLATE_FACE, boxShadow: LIP,
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 9, gap: 8,
  },
  panelText: {
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1, color: INK,
    includeFontPadding: false,
  },
  fearTrack: {
    flex: 1, height: 12, borderRadius: 6, backgroundColor: RULE, overflow: 'hidden',
  },
  fearFill: {
    position: 'absolute', left: 0, top: 0, bottom: 0, right: 0,
    backgroundColor: INK, borderRadius: 6, transformOrigin: '0% 50%',
  },

  // THE BRIDGE. A dashed line, not a fill — it crosses the boundary rather than
  // decorating either side of it.
  bridge: {
    position: 'absolute', left: PANEL_L + PANEL_W, top: BRIDGE_Y, width: FRAME_L - (PANEL_L + PANEL_W),
    height: 2, borderTopWidth: 2, borderColor: SOFT, borderStyle: 'dashed',
  },
  answerTick: {
    position: 'absolute', top: ANSWER_T, width: 10, height: 8,
    borderWidth: 1.5, borderColor: INK, borderRadius: 2, backgroundColor: INK,
  },

  frame: {
    position: 'absolute', left: FRAME_L, top: FRAME_T, width: FRAME_W, height: 500 - FRAME_T,
    borderWidth: 3, borderColor: SOFT, borderRadius: 3, backgroundColor: STONE, boxShadow: LIP },
  // AN1 — THE CREATURE IS NAMED. The other two choices are captioned panels and
  // this one was the drawing alone, so a reader picking it was picking an outline
  // round an animal. The name sits INSIDE the frame and ABOVE the creature, on the
  // gap the frame already leaves between its own top edge and the shape (D31).
  shapeWrap: {
    position: 'absolute', left: SHAPE_L, top: SHAPE_T - SHAPE_CAP, width: SHAPE_W,
    height: 500 - (SHAPE_T - SHAPE_CAP),
  },
  shapeName: {
    position: 'absolute', left: 0, right: 0, top: 2, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1, color: INK, includeFontPadding: false,
  },
  shapeBody: { position: 'absolute', left: 0, right: 0, top: SHAPE_CAP, bottom: 0 },

  onInk: { color: PAPER },
  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT },
});

// Ink runs from the consequence strip (240) to the ground line (500). The spikes
// sit at y 298, above the shape's own box and below the frame. Band 230…512 = 282.
export function Aesthetics17Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Aesthetics17Scene} band={[230, 512]} camera={CAM} />;
}
