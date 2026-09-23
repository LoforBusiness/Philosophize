import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, clamp01, ease01, moveTr, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './ethics29Script';
import { facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { floorStyle, lipOf, PLATE_FACE } from './stageSkin';
import type { SceneApi } from './CinematicPlayer';
import Target, { AnswerLift } from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// THE STAGE IS STRUCK IN THIS LESSON'S OWN BRANCH HUE (./stageTones).
// Same three tones, same luminance to the third decimal — so every contrast
// measured against the old greys still holds and nothing on the stage moved.
const TONE = stageTone('ethics');
const { RULE, STONE, SHADE } = TONE;
const LIP = lipOf(TONE);   // the ledge a toned plate stands on (scripts/skin-stage.mjs)

// ─────────────────────────────────────────────────────────────────────────────
// THREE ACTS STANDING STILL, AND ONE LINE THAT SAYS WHICH WERE OWED.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the RAIL is a STONE band 260×10 at x 110 (110…370), y 350…360. The part of it
//   LEFT of the line is filled ink: that stretch is duty, and everything past the
//   line is a gift. Nothing carries a word, so nothing has to be re-read.
// · THREE MARKS of 34×88 stand on the rail at x 142 · 226 · 322, y 262…350, each
//   a STONE block with a rounded top. They never move for the whole lesson — the
//   acts are fixed and only what they were WORTH is in question (A1).
// · THREE NAMES of 76 under the rail at y 366, centred on each mark.
// · TWO CAPTIONS at y 244 mark the ends: DUTY at x 110 and A GIFT at x 310.
// · the LINE is 3 wide at x 110 + line × 260, running y 250…364, drawn BEHIND the
//   marks so it never crosses a word.
// · THREE PLATES of 90×34 at x 124 · 216 · 308 (124…398), top y 452, two lines.
// · the figure stands at x 24 and walks to 80; his widest span at the walked mark
//   is x ≈ 55…105, five units clear of the rail at 110.
//
// Ink runs y 244 (the captions) … y 500 (ground). BAND 240…512 = 272 — a 103-unit
// figure at 37.9%, inside H58's 38%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const RAIL_X = 110;
const RAIL_Y = 350;
const RAIL_W = 260;
const RAIL_H = 10;

const MARK_X = [142, 226, 322];
const MARK_W = 34;
const MARK_TOP = 262;
const NAME = ['WALKS PAST', 'FAIR SHARE', 'A KIDNEY'];
const NAME_W = 76;
const NAME_T = 366;

const END_T = 244;
const LINE_T = 250;
const LINE_B = 364;

const PLATE_X = [124, 216, 308];
const PLATE_Y = 452;
const PLATE_W = 90;
const PLATE_H = 34;
const PLATE_CAP = ['STILL A HERO', 'ONLY HIS DUTY', 'A WASTED LIFE'];
const PLATE_ID = ['hero', 'duty', 'wasted'];
/** If the most good is always owed, the gift stops being a gift. */
const DUTY = 1;

const FIG_X = 24;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const SCALE = BEATS.map((b) => (b.scale ? 1 : 0));
const LINE = BEATS.map((b) => b.line ?? 0.4);
const PLATES = BEATS.map((b) => (b.plates ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));
const STAY = BEATS.map((b) => (b.stay ? 1 : 0));
const SPAN = BEATS.map((b) => (b.span ? 1 : 0));
const EARN = BEATS.map((b) => (b.earn ? 1 : 0));
const WEIGH = BEATS.map((b) => (b.weigh ? 1 : 0));

// R7c — the stage follows the control on its own graded beat, and only there.
// Derived from the beat so it cannot fall out of step with the control.
const REACT = BEATS.map((b) => (b.interact?.order ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('ethics29'));

export default function Ethics29Scene({ clock, bt, bi, i, picked, onPick, dragPos, pickPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldFig = useHeld();
  const cv = useCarry(8);
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;
  // Four one-shot marks: each struck on the beat that names it, gone by the next.
  const stayFade = (cur.stay ?? 0) !== (prev?.stay ?? 0);
  const spanFade = (cur.span ?? 0) !== (prev?.span ?? 0);
  const earnFade = (cur.earn ?? 0) !== (prev?.earn ?? 0);
  const weighFade = (cur.weigh ?? 0) !== (prev?.weigh ?? 0);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    // A WALKING BEAT TAKES AS LONG AS THE WALK NEEDS (rig.moveTr).
    const tr = ease01(bt.value / moveTr(X[p], X[n], BASE_TR));
    const t = clock.value;
    const grow = ease01(bt.value / 0.55);

    const figS = keepHeld(heldFig, travelStance(
      X[p], X[n],
      carryFrom(heldFig, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));

    return {
      fig: lookPose(figS, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1, gazeX.value, gazeY.value, gazeOn.value),
      t,
      scale: carry(cv, 1, n, SCALE[p], SCALE[n], tr),
      // WHERE DUTY ENDS, which is the only thing this lesson lets anybody move.
      line: carry(cv, 2, n, LINE[p], reacting ? pickPos.value : LINE[n], tr),
      plates: carry(cv, 3, n, PLATES[p], PLATES[n], tr),
      // Four one-shot marks, fading in AND out on a carried track (never an
      // on/off ternary), so a tap mid-fade never cuts one between two frames
      // (C20c).
      stay: carry(cv, 4, n, STAY[p], STAY[n], stayFade ? grow : 1),
      span: carry(cv, 5, n, SPAN[p], SPAN[n], spanFade ? grow : 1),
      earn: carry(cv, 6, n, EARN[p], EARN[n], earnFade ? grow : 1),
      weigh: carry(cv, 7, n, WEIGH[p], WEIGH[n], weighFade ? grow : 1),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const scaleStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.scale }));
  const platesStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.plates }));
  const owedStyle = useAnimatedStyle(() => ({ width: RAIL_W * clamp01(SCENE.value.line) }));
  const lineStyle = useAnimatedStyle(() => ({ left: RAIL_X + RAIL_W * clamp01(SCENE.value.line) - 1.5 }));
  const stayStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.stay }));
  // The span's left edge and width track the same formula the line itself
  // uses, so the measure never drifts from whatever the line is actually doing.
  const spanWrapStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.span }));
  const spanLineStyle = useAnimatedStyle(() => {
    const lx = RAIL_X + RAIL_W * clamp01(SCENE.value.line);
    return { left: lx, width: MARK_X[2] - lx };
  });
  const spanTickLStyle = useAnimatedStyle(() => ({
    left: RAIL_X + RAIL_W * clamp01(SCENE.value.line) - 0.75,
  }));
  const earnStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.earn }));
  const weighStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.weigh }));

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />

      <Animated.View style={[StyleSheet.absoluteFill, scaleStyle]} pointerEvents="none">
        <Text style={[styles.end, { left: RAIL_X }]}>DUTY</Text>
        <Text style={[styles.end, { left: 310 }]}>A GIFT</Text>

        <Animated.View style={[styles.line, lineStyle]} />

        <View style={styles.rail} />
        <Animated.View style={[styles.owed, owedStyle]} />

        {MARK_X.map((mx, k) => (
          <View key={mx}>
            <View style={[styles.mark, { left: mx }]} />
            <Text style={[styles.name, { left: mx + MARK_W / 2 - NAME_W / 2 }]}>{NAME[k]}</Text>
          </View>
        ))}

        {/* The road not taken: a dashed, shorter echo beside the kidney mark,
            for "would he have been blameworthy if he had stayed?" */}
        <Animated.View style={[styles.stay, stayStyle]} pointerEvents="none" />

        {/* The measured gap from the line to the kidney mark: how far beyond
            duty the act sits. */}
        <Animated.View style={[StyleSheet.absoluteFill, spanWrapStyle]} pointerEvents="none">
          <Animated.View style={[styles.span, spanLineStyle]} />
          <Animated.View style={[styles.spanTick, spanTickLStyle]} />
          <View style={[styles.spanTick, { left: MARK_X[2] - 0.75 }]} />
        </Animated.View>

        {/* A small tick over the kidney mark: praiseworthy if done. */}
        <Animated.View style={[styles.earnWrap, earnStyle, { left: MARK_X[2] + MARK_W / 2 - 4 }]} pointerEvents="none">
          <View style={styles.earnA} />
          <View style={styles.earnB} />
        </Animated.View>

        {/* How each act reads, common sense's own verdict: tall for the kidney,
            middling for the fair share, an uncertain dash for walking past. */}
        <Animated.View style={[StyleSheet.absoluteFill, weighStyle]} pointerEvents="none">
          <View style={[styles.weighBarSoft, { left: MARK_X[0] + MARK_W / 2 - 1, top: 256, height: 6 }]} />
          <View style={[styles.weighBar, { left: MARK_X[1] + MARK_W / 2 - 1, top: 252, height: 10 }]} />
          <View style={[styles.weighBar, { left: MARK_X[2] + MARK_W / 2 - 1, top: 248, height: 14 }]} />
        </Animated.View>
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, platesStyle]}>
        {PLATE_ID.map((id, k) => (
          <AnswerLift key={id} id={id} picked={picked} correct={k === DUTY}>
            <View style={[styles.plate, { left: PLATE_X[k] }]} />
          </AnswerLift>
        ))}
        {PLATE_ID.map((id, k) => (
          <Target
            key={id}
            id={id}
            correct={k === DUTY}
            picked={picked}
            onPick={onPick}
            disabled={!live || answered}
            style={[styles.hit, { left: PLATE_X[k] }]}
            radius={4}
          >
            <Text style={styles.plateText} numberOfLines={2} pointerEvents="none">{PLATE_CAP[k]}</Text>
          </Target>
        ))}
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON — a subject standing on a filled mass
  // rather than on bare page.
  floor: floorStyle(TONE, GROUND),

  end: {
    position: 'absolute', top: END_T, width: 60,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.2, color: SOFT, includeFontPadding: false,
  },

  rail: {
    position: 'absolute', left: RAIL_X, top: RAIL_Y, width: RAIL_W, height: RAIL_H,
    backgroundColor: STONE, boxShadow: LIP, borderWidth: 1.5, borderColor: RULE,
  },
  // EVERYTHING LEFT OF THE LINE IS OWED. Filling the rail rather than labelling
  // the marks means nothing on the stage has to be re-read as the line moves.
  owed: { position: 'absolute', left: RAIL_X, top: RAIL_Y, height: RAIL_H, backgroundColor: INK },
  line: { position: 'absolute', top: LINE_T, width: 3, height: LINE_B - LINE_T, backgroundColor: INK },

  mark: {
    position: 'absolute', top: MARK_TOP, width: MARK_W, height: RAIL_Y - MARK_TOP,
    backgroundColor: STONE, boxShadow: LIP, borderWidth: 2, borderColor: INK,
    borderTopLeftRadius: 16, borderTopRightRadius: 16,
  },
  name: {
    position: 'absolute', top: NAME_T, width: NAME_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.4, color: SOFT, includeFontPadding: false,
  },

  // THE ROAD NOT TAKEN: a dashed, shorter echo of a mark, standing in the gap
  // beside the kidney act — an outline, never a fill, so it reads as the act
  // that was NOT done rather than a fourth real mark (D31).
  stay: {
    position: 'absolute', left: 279, top: 300, width: 24, height: RAIL_Y - 300,
    borderWidth: 1.5, borderColor: SHADE, borderStyle: 'dashed',
    borderTopLeftRadius: 12, borderTopRightRadius: 12,
  },

  // THE MEASURE: a dashed span from wherever the line stands to the kidney
  // mark, with a tick at each end — how far beyond duty the act sits.
  span: { position: 'absolute', top: 256, height: 0, borderTopWidth: 1.5, borderColor: SHADE, borderStyle: 'dashed' },
  spanTick: { position: 'absolute', top: 253, width: 1.5, height: 6, backgroundColor: SHADE },

  // A small tick over the kidney mark: praiseworthy if done.
  earnWrap: { position: 'absolute', top: 248, width: 8, height: 8 },
  earnA: { position: 'absolute', left: 0, top: 4, width: 4, height: 1.5, backgroundColor: INK, transform: [{ rotate: '45deg' }] },
  earnB: { position: 'absolute', left: 2, top: 1, width: 7, height: 1.5, backgroundColor: INK, transform: [{ rotate: '-45deg' }] },

  // THE VERDICT ROW: a solid bar reads a settled judgement, a dashed one an
  // unsettled one — height alone carries how strong the verdict is.
  weighBar: { position: 'absolute', width: 1.5, backgroundColor: INK },
  weighBarSoft: { position: 'absolute', width: 0, borderLeftWidth: 1.5, borderColor: SHADE, borderStyle: 'dashed' },

  hit: { position: 'absolute', top: PLATE_Y, width: PLATE_W, height: PLATE_H },
  plate: {
    position: 'absolute', top: PLATE_Y, width: PLATE_W, height: PLATE_H,
    borderWidth: 2, borderColor: INK, borderRadius: 8, backgroundColor: PAPER,
  },
  plateText: {
    position: 'absolute', left: 0, top: 7, width: PLATE_W, textAlign: 'center', lineHeight: 10,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.4, color: INK, includeFontPadding: false,
  },
});

export function Ethics29Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Ethics29Scene} band={[240, 512]} camera={CAM} />;
}
