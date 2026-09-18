import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, mixStance, pose, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './ethics15Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { floorStyle, lipOf, PLATE_FACE } from './stageSkin';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// THE STAGE IS STRUCK IN THIS LESSON'S OWN BRANCH HUE (./stageTones).
// Same three tones, same luminance to the third decimal — so every contrast
// measured against the old greys still holds and nothing on the stage moved.
const TONE = stageTone('ethics');
const { RULE, STONE, SHADE } = TONE;
const LIP = lipOf(TONE);   // the ledge a toned plate stands on (scripts/skin-stage.mjs)

// A BALANCE THAT WEIGHS FACTS, with a sentence in each pan (H64). The right-hand
// sentence is four words longer and the beam never moves — which is the argument.
//
// · the figure stands at x = 38 facing right. Widest ink is a fist at x ≈ 71, and
//   the left pan begins at x 92, so there are 21 clear units (B9).
// · the LABEL is x 20…380 at y 234…250, and the three BOARDS are a row of three
//   116 × 44 at x 20 / 142 / 264, y 258…302. Boards are only on stage for the
//   graded beat.
// · the BEAM is x 104…368 at y 350…356; the hangers drop from x 142 and x 322 to
//   the pans at y 392.
// · the PANS are the sentence cards: x 92…200 and x 272…380, both 108 × 56, y
//   392…448 — the same size, deliberately, since equal weight is the claim.
// · the FULCRUM post is x 232…240, y 356…480, on a base x 206…266, y 480…500. The
//   doubt mark sits on the base at y 484.
// · highest ink is the label at y 234; lowest is the ground at 500. The figure's
//   crown is y 397, level with the pans and well left of them.
//
// Band 228…512 = 284, which keeps one figure at 36% of the frame (check:scale).

const FIG_X = 38;

const LABEL_T = 234;
const BOARD_T = 258;
const BOARD_H = 44;
const BOARD_W = 116;
const BOARD_X = [20, 142, 264];

const BEAM_L = 104;
const BEAM_W = 264;
const BEAM_T = 350;

const PAN_T = 392;
const PAN_H = 56;
const PAN_W = 108;
const PAN_L = [92, 272];
const HANG_X = [142, 322];

const FULCRUM_X = 232;

const BOARDS = [
  { id: 'feeling', text: 'A FEELING, NOT A CLAIM', correct: true },
  { id: 'act', text: 'A FACT ABOUT THE ACT', correct: false },
  { id: 'speaker', text: 'A FACT ABOUT THE SPEAKER', correct: false },
];

const G = BEATS.map((b) => b.g ?? 0);
const PLAIN = BEATS.map((b) => b.plain ?? 0);
const MORAL = BEATS.map((b) => b.moral ?? 0);
const TILT = BEATS.map((b) => b.tilt ?? 0);
const DOUBT = BEATS.map((b) => b.doubt ?? 0);
const PICKV = BEATS.map((b) => b.pick ?? 0);
// Group AH — five still taps, each an event drawn from that beat's own words.
const CHECKABLE = BEATS.map((b) => ((b.checkable ?? 0) > 0 ? 1 : 0));
const EQUAL = BEATS.map((b) => ((b.equal ?? 0) > 0 ? 1 : 0));
const ZERO = BEATS.map((b) => ((b.zero ?? 0) > 0 ? 1 : 0));
const TONEV = BEATS.map((b) => ((b.tone ?? 0) > 0 ? 1 : 0));
const MISS = BEATS.map((b) => ((b.miss ?? 0) > 0 ? 1 : 0));

// The gap between the beam (350…356) and the pans (392) — 36 units, where the
// checkmark and the +0 tag sit, each over its own pan.
const CHECK_X = PAN_L[0] + PAN_W / 2 - 6;
const ZERO_CX = PAN_L[1] + PAN_W / 2;
const TAG_GAP_T = 366;

// The open air above the beam (234…350), clear of the figure — his crown sits
// at 397, level with the pans, so nothing of him reaches this high.
const EQUAL_CX = FULCRUM_X;
const TONE_T = 308;
const MISS_T = 272;
const MISS_D = 24;

const X = BEATS.map((b) => b.x ?? FIG_X);

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.sort ? 1 : 0));
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('ethics15'));

export default function Ethics15Scene({ clock, bt, bi, i, picked, onPick, pickPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldS = useHeld();
  const cv = useCarry(10);
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;

  const live = (cur.pick ?? 0) > 0 && !!cur.interact;
  const answered = picked !== null;

  // Group AH — each fires only on the beat that asks for it (C20c).
  const checkFade = (cur.checkable ?? 0) !== (prev?.checkable ?? 0);
  const equalFade = (cur.equal ?? 0) !== (prev?.equal ?? 0);
  const zeroFade = (cur.zero ?? 0) !== (prev?.zero ?? 0);
  const toneFade = (cur.tone ?? 0) !== (prev?.tone ?? 0);
  const missFade = (cur.miss ?? 0) !== (prev?.miss ?? 0);

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.7);          // nobody walks; this is a pose blend
    const t = clock.value;
    const grow = ease01(bt.value / 0.9);

    const s = keepHeld(heldS, mixStance(
      carryFrom(heldS, n, emoteHold(G[p], t)), emoteLive(G[n], t, bt.value), tr,
    ));
    return {
      fig: lookPose(s, FIG_X, GROUND, K_FIG, 1, 1, gazeX.value, gazeY.value, gazeOn.value),
      plain: carry(cv, 0, n, PLAIN[p], PLAIN[n], grow),
      moral: carry(cv, 1, n, MORAL[p], MORAL[n], grow),
      // Tracked like everything else even though every beat sets it to zero: a
      // reader is meant to be able to see that the beam COULD move (A1), and the
      // next author is meant to see that nothing here ever moves it.
      tilt: carry(cv, 2, n, TILT[p], TILT[n], grow),
      // R7b — the arm raises the doubt under the fulcrum. Move it toward the boo
      // and the question mark under the balance grows: a boo cannot be weighed, so
      // the instrument itself comes into question. The beam's tilt stays at 0 —
      // that is the scene's own point and the control does not touch it.
      doubt: carry(cv, 3, n, DOUBT[p], reacting ? pickPos.value : DOUBT[n], grow),
      boards: carry(cv, 4, n, PICKV[p], PICKV[n], grow),
      checkable: carry(cv, 5, n, CHECKABLE[p], CHECKABLE[n], checkFade ? grow : 1),
      equal: carry(cv, 6, n, EQUAL[p], EQUAL[n], equalFade ? grow : 1),
      zero: carry(cv, 7, n, ZERO[p], ZERO[n], zeroFade ? grow : 1),
      tone: carry(cv, 8, n, TONEV[p], TONEV[n], toneFade ? grow : 1),
      miss: carry(cv, 9, n, MISS[p], MISS[n], missFade ? grow : 1),
    };
  });

  const D = useDerivedValue<Bundle>(() => SCENE.value.fig);

  const beam = useAnimatedStyle(() => ({ transform: [{ rotate: `${SCENE.value.tilt}deg` }] }));
  const plain = useAnimatedStyle(() => ({ opacity: SCENE.value.plain }));
  const moral = useAnimatedStyle(() => ({ opacity: SCENE.value.moral }));
  const doubt = useAnimatedStyle(() => ({ opacity: SCENE.value.doubt }));
  const checkStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.checkable }));
  const equalStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.equal }));
  const zeroStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.zero,
    transform: [{ translateY: (1 - SCENE.value.zero) * -6 }],
  }));
  const toneStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.tone,
    transform: [{ translateY: (1 - SCENE.value.tone) * -6 }],
  }));
  const missStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.miss,
    transform: [{ scale: 0.5 + 0.5 * SCENE.value.miss }],
  }));

  return (
    <Animated.View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={styles.label} numberOfLines={1}>THIS BALANCE WEIGHS FACTS</Text>

      {/* ── THE THREE ANSWERS, ON THE GRADED BEAT ONLY ───────────────────── */}
      {BOARDS.map((b, k) => (
        <Board key={b.id} k={k} SCENE={SCENE} live={live} answered={answered} picked={picked} onPick={onPick} />
      ))}

      {/* ── THE BALANCE ──────────────────────────────────────────────────── */}
      <View style={styles.post} pointerEvents="none" />
      <View style={styles.base} pointerEvents="none" />
      <Animated.View style={[styles.beam, beam]} pointerEvents="none" />
      <View style={[styles.hanger, { left: HANG_X[0] }]} pointerEvents="none" />
      <View style={[styles.hanger, { left: HANG_X[1] }]} pointerEvents="none" />

      <Animated.View style={[styles.pan, { left: PAN_L[0] }, plain]} pointerEvents="none">
        <Text style={styles.panText} numberOfLines={4}>YOU STOLE THAT MONEY</Text>
      </Animated.View>
      <Animated.View style={[styles.pan, { left: PAN_L[1] }, moral]} pointerEvents="none">
        <Text style={styles.panText} numberOfLines={4}>YOU ACTED WRONGLY IN STEALING THAT MONEY</Text>
      </Animated.View>

      {/* CHECKABLE — "anyone can check it against the world": a checkmark over
          the plain pan alone. */}
      <Animated.Text style={[styles.check, checkStyle]} pointerEvents="none">✓</Animated.Text>

      {/* EQUAL — "the second sentence weighs no more than the first": an
          equals mark over the fulcrum itself. */}
      <Animated.Text style={[styles.equal, equalStyle]} pointerEvents="none">=</Animated.Text>

      {/* ZERO — "a moral word adds no further fact": a tag over the pan that
          carries the extra word. */}
      <Animated.View style={[styles.zeroWrap, zeroStyle]} pointerEvents="none">
        <View style={styles.tag}>
          <Text style={styles.tagText}>+0 FACTS</Text>
        </View>
      </Animated.View>

      {/* TONE — "Ayer compares it to saying the sentence in a tone of
          horror": a tag naming the expression, not a further claim. */}
      <Animated.View style={[styles.toneWrap, toneStyle]} pointerEvents="none">
        <View style={styles.tag}>
          <Text style={styles.tagText}>TONE OF HORROR</Text>
        </View>
      </Animated.View>

      {/* MISS — "a test for observable facts would miss moral facts": an
          empty, dashed shape floating above the beam, in neither pan. */}
      <Animated.View style={[styles.miss, missStyle]} pointerEvents="none" />

      <Animated.Text style={[styles.doubt, doubt]} pointerEvents="none" numberOfLines={1}>
        IS THIS THE RIGHT INSTRUMENT?
      </Animated.Text>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={D} k={K_FIG} />
    </Animated.View>
  );
}

/** One answer board — a Q1 target. */
function Board({
  k, SCENE, live, answered, picked, onPick,
}: {
  k: number;
  SCENE: { value: { boards: number } };
  live: boolean;
  answered: boolean;
  picked: string | null;
  onPick: (id: string, correct: boolean) => void;
}) {
  const b = BOARDS[k];
  const on = answered && b.correct;
  const st = useAnimatedStyle(() => {
    const a = SCENE.value.boards;
    return { opacity: a, transform: [{ translateY: (1 - a) * -10 }] };
  });
  return (
    <Animated.View style={[styles.board, { left: BOARD_X[k] }, st]}>
      <Target id={b.id} correct={b.correct} picked={picked} onPick={onPick}
              style={styles.fill} disabled={!live || answered}>
        <View style={[
          styles.boardInner,
          on && styles.pickRight,
          answered && picked === b.id && !b.correct && styles.pickWrong,
        ]}>
          <Text style={[styles.boardText, on && styles.onInk]} numberOfLines={2}>{b.text}</Text>
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
  floor: floorStyle(TONE, GROUND),
  fill: { flex: 1 },

  label: {
    position: 'absolute', left: 20, top: LABEL_T, width: 360,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.2, color: SOFT,
    textAlign: 'center', includeFontPadding: false,
  },

  board: { position: 'absolute', top: BOARD_T, width: BOARD_W, height: BOARD_H },
  boardInner: {
    flex: 1, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PLATE_FACE, boxShadow: LIP,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6,
  },
  boardText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.8, color: INK,
    textAlign: 'center', includeFontPadding: false,
  },

  beam: {
    position: 'absolute', left: BEAM_L, top: BEAM_T, width: BEAM_W, height: 6,
    backgroundColor: INK, borderRadius: 3,
  },
  hanger: { position: 'absolute', top: BEAM_T + 6, width: 2, height: PAN_T - BEAM_T - 6, backgroundColor: SOFT },
  post: { position: 'absolute', left: FULCRUM_X, top: BEAM_T + 6, width: 8, height: 480 - BEAM_T - 6, backgroundColor: INK },
  base: {
    position: 'absolute', left: 206, top: 480, width: 60, height: 20,
    backgroundColor: INK, borderRadius: 3,
  },

  pan: {
    position: 'absolute', top: PAN_T, width: PAN_W, height: PAN_H,
    borderWidth: 2, borderColor: INK, borderRadius: 8, backgroundColor: PLATE_FACE, boxShadow: LIP,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 7,
  },
  panText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 11, letterSpacing: 0.6, color: INK,
    textAlign: 'center', includeFontPadding: false,
  },

  // ── the five still-tap events (group AH) ─────────────────────────────────
  check: {
    position: 'absolute', left: CHECK_X, top: TAG_GAP_T, fontFamily: 'Inter_700Bold', fontSize: 16, color: INK,
    includeFontPadding: false,
  },
  equal: {
    position: 'absolute', left: EQUAL_CX - 7, top: 326, fontFamily: 'Inter_700Bold', fontSize: 18, color: INK,
    includeFontPadding: false,
  },
  zeroWrap: { position: 'absolute', left: ZERO_CX - 55, top: TAG_GAP_T, width: 110, alignItems: 'center' },
  toneWrap: { position: 'absolute', left: 0, top: TONE_T, width: 140, alignItems: 'center' },
  tag: {
    paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1.5, borderColor: INK,
    borderRadius: 6, backgroundColor: PLATE_FACE, boxShadow: LIP,
  },
  tagText: { fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.5, color: INK,
    includeFontPadding: false,
  },
  // A fact the scale can't catch — a boundary, never a fill (D31).
  miss: {
    position: 'absolute', left: FULCRUM_X - MISS_D / 2, top: MISS_T, width: MISS_D, height: MISS_D,
    borderRadius: MISS_D / 2, borderWidth: 1.5, borderColor: SHADE, borderStyle: 'dashed',
  },

  doubt: {
    position: 'absolute', left: 140, top: 484, width: 240,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.2, color: SOFT,
    includeFontPadding: false,
  },

  onInk: { color: PAPER },
  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT },
});

// Ink runs from the label (234) to the ground line (500). Band 228…512 = 284.
export function Ethics15Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Ethics15Scene} band={[228, 512]} camera={CAM} />;
}
