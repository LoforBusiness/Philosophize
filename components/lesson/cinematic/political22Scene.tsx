import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, dirsFrom, ease01, moveTr, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './political22Script';
import { facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { floorStyle, lipOf, PLATE_FACE } from './stageSkin';
import type { SceneApi } from './CinematicPlayer';
import Target, { useAnswerRise } from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// THE STAGE IS STRUCK IN THIS LESSON'S OWN BRANCH HUE (./stageTones).
// Same three tones, same luminance to the third decimal — so every contrast
// measured against the old greys still holds and nothing on the stage moved.
const TONE = stageTone('political-philosophy');
const { RULE, STONE, SHADE } = TONE;
const LIP = lipOf(TONE);   // the ledge a toned plate stands on (scripts/skin-stage.mjs)

// ─────────────────────────────────────────────────────────────────────────────
// A SWITCH ON HIS WALL, AND A DAY THAT NOBODY INTERRUPTS.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the HOUSING is 136×110 at x 236…372, y 252…362, 2.5 thick, and it never
//   moves or fades. It is the only object in the picture that is not hers.
// · the SLOT is 24×86 at x 306…330, y 264…350, with the 40×16 LEVER riding it
//   from y 268 (up, leaving her be) to y 330 (down, interfering). The lever is
//   UP on seven of the nine beats, which is the whole argument: what she lives
//   under is the slot, not the lever.
// · TWO STATE LABELS sit left of the slot at x 230…296, tops 268 and 328, so
//   each end of the travel says what it means without narration (A1). The width
//   is what the header always said and the style did not: LEAVES YOU BE is 74
//   units and wraps to LEAVES YOU at 59.5, so a box starting at 244 needed 66 and
//   ran to 310 — under the lever, which spans 298…338. Shifted left instead.
// · HER DAY is three 60×40 tiles at x 24 · 88 · 152, y 272…312, reading WORK ·
//   SPEAK · GO, with a 2-thick strike drawn through all three at y 291 when the
//   lever goes down.
// · a DOTTED BRIDGE of three 6×2 dashes at x 214 · 222 · 230, y 291, joins her
//   day to his housing across the 24-unit gap. Dotted rather than solid because
//   the power is standing, not being used.
// · the CAPTION HIS REACH sits at y 240, centred over the whole housing, because
//   the housing is what the first question is about and a caption that named only
//   the slot would be pointing at the wrong box.
// · the THREE TARGETS do not nest ambiguously: her tiles, the housing, and the
//   lever drawn OVER the housing so it wins its own 44×34. Two targets that both
//   contained the lever would hand the right answer to anyone reaching for it.
// · the FIGURE walks x 200 → 132 → 268 on GROUND 500; crown ≈ 397, and the
//   lowest ink is the housing at y 362, so 35 units stay clear.
//
// Ink runs y 240 (the caption) … y 500. BAND 234…512 = 278, with the 103-unit
// figure at 37.1%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const H_X = 236;
const H_Y = 252;
const H_W = 136;
const H_H = 110;

const SL_X = 306;
const SL_W = 24;
/** How far the housing's target reaches up to take in its own HIS REACH (AN3). */
const CAP_RISE = 14;
/** The lever's target, raised to hold its own name above the slot (AN1). */
const LEV_HIT_Y = 255;
const SL_Y = 264;
const SL_H = 86;

const LV_W = 40;
const LV_H = 16;
const LV_UP = 268;
const LV_DN = 330;

const CAP_Y = 240;

const T_Y = 272;
const T_H = 40;
const T_W = 60;
const T_X = [24, 88, 152];
const T_TEXT = ['WORK', 'SPEAK', 'GO'];

const DASH_X = [214, 222, 230];

const FIG_X = 200;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along:
// +1 where it rises, -1 where it falls, and HOLD while he stands still, so a
// figure who walks left to something keeps facing it while he talks about it.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const SW = BEATS.map((b) => b.switchOn ?? 0);
const TILES = BEATS.map((b) => b.tiles ?? 0);
const BERLIN = BEATS.map((b) => b.berlin ?? 0);
const CHECKED = BEATS.map((b) => b.checked ?? 0);
const REACH = BEATS.map((b) => b.reach ?? 0);
const FLIP = BEATS.map((b) => b.flip ?? 0);
const LIVE = BEATS.map((b) => b.live ?? 0);

// On its own field beat the pad IS the switch (R7): sideways moves the lever,
// and upwards takes the housing off the wall — which is what the top row of
// the pad says in words. A reader who parks in the top left is looking at a
// picture of being interfered with by a law nobody can wield arbitrarily.
const PULL = BEATS.map((b) => (b.interact?.field ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('political22'));

export default function Political22Scene({
  clock, bt, bi, i, picked, onPick, dragPos, dragPos2, gazeX, gazeY, gazeOn }: SceneApi) {
  const heldFig = useHeld();
  const cv = useCarry(7);
  const pulling = PULL[i] === 1;
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    // A WALKING BEAT TAKES AS LONG AS THE WALK NEEDS (rig.moveTr). A fixed length
    // here sprinted every long journey and left the footfalls — which the player
    // computes from moveTr — arriving after the figure had stopped.
    const tr = ease01(bt.value / moveTr(X[p], X[n], BASE_TR));
    const t = clock.value;

    const figS = keepHeld(heldFig, travelStance(
      X[p], X[n],
      carryFrom(heldFig, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));

    return {
      fig: lookPose(figS, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1, gazeX.value, gazeY.value, gazeOn.value),
      // Through `carry` so the pad takes over across the transition rather than
      // on one frame — see metaphysics21Scene for why that matters.
      sw: carry(cv, 1, n, SW[p], pulling ? 1 - 0.82 * dragPos2.value : SW[n], tr),
      tiles: carry(cv, 2, n, TILES[p], TILES[n], tr),
      reach: carry(cv, 3, n, REACH[p], pulling ? 1 - 0.82 * dragPos2.value : REACH[n], tr),
      flip: carry(cv, 4, n, FLIP[p], pulling ? 1 - dragPos.value : FLIP[n], tr),
      // The two tap events, carried, so each fades out as well as in (group L).
      berlin: carry(cv, 5, n, BERLIN[p], BERLIN[n], tr),
      checked: carry(cv, 6, n, CHECKED[p], CHECKED[n], tr),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const swStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.sw }));
  const tileStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.tiles }));
  const capStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.reach }));
  // The lever travels the slot; it never cuts from one end to the other (L1).
  const levStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.sw,
    top: LV_UP + (LV_DN - LV_UP) * SCENE.value.flip,
  }));
  const strikeStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.tiles * SCENE.value.flip,
    width: (T_X[2] + T_W - T_X[0]) * SCENE.value.flip,
  }));

  // HIS REACH IS THE SWITCH ITSELF — housing, states and slot, which is exactly
  // what this wrapper holds (E39). The lever is a different answer and stays put.
  const swRise = useAnswerRise(picked, 'reach', true);

  // ── the two tap events ─────────────────────────────────────────────────────
  //
  // Berlin's verdict goes under HER DAY, because it is a verdict on her day and
  // not on the switch: on this test nobody is interfering, so she counts as free
  // while the lever is still up.
  const berlinStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.berlin,
    transform: [{ translateY: (1 - SCENE.value.berlin) * 8 }],
  }));
  // A LATCH ACROSS THE SLOT: what Pettit asks for is not kindness but something
  // that stops the lever being pulled at all, so it is drawn on the slot itself.
  const checkedStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.checked,
    transform: [{ scaleX: SCENE.value.checked }],
  }));
  const checkedCapStyle = useAnimatedStyle(() => ({ opacity: clamp01((SCENE.value.checked - 0.5) / 0.5) }));

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Animated.View style={[StyleSheet.absoluteFill, tileStyle]} pointerEvents="none">
        {T_X.map((tx, k) => (
          <View key={tx}>
            <View style={[styles.tile, { left: tx }]} />
            <Text style={[styles.tileText, { left: tx }]}>{T_TEXT[k]}</Text>
          </View>
        ))}
        {DASH_X.map((dx) => <View key={dx} style={[styles.dash, { left: dx }]} />)}
      </Animated.View>
      <Animated.View style={[styles.strike, strikeStyle]} pointerEvents="none" />

      <Animated.View style={[StyleSheet.absoluteFill, swStyle, swRise]} pointerEvents="none">
        <View style={styles.housing} />
        <Text style={[styles.state, { top: LV_UP }]} numberOfLines={2}>LEAVES YOU BE</Text>
        <Text style={[styles.state, { top: LV_DN }]} numberOfLines={2}>INTERFERES</Text>
        <View style={styles.slot} />
        {/* THE LEVER IS IN THE SWITCH, so it rises with it (E39). Drawn outside this
            wrapper it stayed behind while the housing lifted off it. */}
        <Animated.View style={[styles.lever, levStyle]} pointerEvents="none" />
        {/* THE LATCH IS ON THE SLOT, so it is part of the switch and rises with it
            too (E39) — drawn outside this wrapper it would stay behind. */}
        <Animated.View style={[styles.checkBar, checkedStyle]} pointerEvents="none" />
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, capStyle]} pointerEvents="none">
        <Text style={styles.caption}>HIS REACH</Text>
      </Animated.View>

      <Target
        id="choices" correct={false} picked={picked} onPick={onPick}
        disabled={!live || answered}
        style={[styles.hit, { left: T_X[0], top: T_Y, width: T_X[2] + T_W - T_X[0], height: T_H }]}
      >
        <View style={[styles.hitBox, { width: T_X[2] + T_W - T_X[0], height: T_H }, answered && picked === 'choices' && styles.wrong]} pointerEvents="none" />
      </Target>
      {/* THE HOUSING FIRST, THE LEVER OVER IT. The lever sits inside the switch,
          so two targets that both contain it would make the question unanswerable:
          a reader reaching for the lever would land on the right answer by accident.
          Drawn in this order, the small one wins its own pixels and the big one
          keeps the rest. */}
      <Target
        id="reach" correct picked={picked} onPick={onPick}
        disabled={!live || answered}
        style={[styles.hit, { left: H_X, top: H_Y - CAP_RISE, width: H_W, height: H_H + CAP_RISE }]}
      >
        {/* AN3 — THE HIT BOX HOLDS THE NAME. HIS REACH is set at y 240, over the
            housing rather than in it, and this box began at the housing's own top
            edge — so the CORRECT answer was the one choice with its name outside it.
            The box reaches up to the caption; nothing is written twice. */}
        <View style={[styles.hitBox, { width: H_W, height: H_H + CAP_RISE }, answered && styles.right]} pointerEvents="none" />
      </Target>
      <Target
        id="lever" correct={false} picked={picked} onPick={onPick}
        disabled={!live || answered}
        style={[styles.hit, { left: 296, top: LEV_HIT_Y, width: 44, height: 294 - LEV_HIT_Y }]}
      >
        {/* AN1 — THE LEVER IS NAMED. Its two rivals are captioned and this was the
            bare mechanism, so the third choice had nothing to choose it by. The word
            goes ABOVE the slot, in the nine clear units between the housing's own
            2.5-thick border (252…254.5) and the slot's top at 264 — entirely on
            STONE, so it is never half on the slot's paper, and never crossed by the
            slot's side rules, which is the fault epistemology23 shipped. It sets at
            29.5 units in a box of 44. */}
        <View style={[styles.hitBox, { width: 44, height: 294 - LEV_HIT_Y }, answered && picked === 'lever' && styles.wrong]} pointerEvents="none" />
        <Text style={styles.levName} pointerEvents="none">LEVER</Text>
      </Target>

      {/* By Berlin's test, nobody is interfering, so she is free. */}
      <Animated.View style={[styles.berlinTag, berlinStyle]} pointerEvents="none">
        <Text style={styles.berlinText} numberOfLines={1}>FREE, BY THAT TEST</Text>
      </Animated.View>

      {/* What checks the reach: not kindness, a latch (the bar is drawn in the switch). */}
      <Animated.Text style={[styles.checkCap, checkedCapStyle]} pointerEvents="none">
        LAWS · RIGHTS · COURTS
      </Animated.Text>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

const styles = StyleSheet.create({
  // ── the two tap events (group AH) ──────────────────────────────────────────
  // Under her three tiles, which run x 24…212 at y 272…312 (the header states it).
  berlinTag: {
    position: 'absolute', left: 24, top: 324, width: 188, height: 26,
    borderWidth: 1.5, borderColor: INK, borderRadius: 8, backgroundColor: PLATE_FACE,
    boxShadow: LIP, alignItems: 'center', justifyContent: 'center',
  },
  berlinText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.8, color: INK,
    includeFontPadding: false,
  },
  // Across the slot the lever travels in, at its own middle, drawn from the left.
  checkBar: {
    position: 'absolute', left: SL_X - 18, top: SL_Y + SL_H / 2 - 3, width: SL_W + 36, height: 6,
    backgroundColor: INK, borderRadius: 3, transformOrigin: '0% 50%',
  },
  // Below the housing, which ends at H_Y + H_H.
  checkCap: {
    position: 'absolute', left: H_X, top: H_Y + H_H + 6, width: H_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.9, color: INK,
    includeFontPadding: false,
  },

  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON. A rule on its own leaves the
  // figure and everything it is looking at standing on bare page;
  // political7 and political8 both stand their subject on a filled mass.
  floor: floorStyle(TONE, GROUND),

  housing: {
    position: 'absolute', left: H_X, top: H_Y, width: H_W, height: H_H,
    borderWidth: 2.5, borderColor: INK, borderRadius: 8, backgroundColor: STONE, boxShadow: LIP,
  },
  slot: {
    position: 'absolute', left: SL_X, top: SL_Y, width: SL_W, height: SL_H,
    borderWidth: 1.2, borderColor: SOFT, borderRadius: 12, backgroundColor: PAPER,
  },
  lever: {
    position: 'absolute', left: SL_X + SL_W / 2 - LV_W / 2, width: LV_W, height: LV_H,
    backgroundColor: INK, borderRadius: 4,
  },
  levName: {
    position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center',
    // 8.6, not 8: this lesson's stage fit is 0.94, so 8 reaches the reader at 7.5 (D34).
    // LEVER sets at 31.4 in a box of 44, so nothing else has to move.
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 9.6, letterSpacing: 1,
    color: INK, includeFontPadding: false,
  },
  state: {
    position: 'absolute', left: 230, width: 66, lineHeight: 9,
    // INK, NOT SOFT. The whole switch rides an opacity track that rests at 0.8 on
    // the closing beats, and SOFT composited at 0.8 reaches the eye at 2.7:1 —
    // D35's smear in the shape of a word. Ink survives the fade; the fade is the
    // switch settling, not the label going away.
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.5, color: INK, includeFontPadding: false,
  },
  caption: {
    position: 'absolute', left: H_X, top: CAP_Y, width: H_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.9, color: INK, includeFontPadding: false,
  },

  tile: {
    position: 'absolute', top: T_Y, width: T_W, height: T_H,
    borderWidth: 1.5, borderColor: INK, borderRadius: 8, backgroundColor: PLATE_FACE, boxShadow: LIP,
  },
  tileText: {
    position: 'absolute', top: T_Y + 15, width: T_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 0.8, color: INK, includeFontPadding: false,
  },
  strike: { position: 'absolute', left: T_X[0], top: 291, height: 2, backgroundColor: INK },
  dash: { position: 'absolute', top: 291, width: 6, height: 2, backgroundColor: SOFT },

  hit: { position: 'absolute' },
  hitBox: { borderRadius: 4 },
  right: { borderWidth: 3, borderColor: INK },
  wrong: { borderWidth: 1.5, borderColor: SOFT, borderStyle: 'dashed' },
});

export function Political22Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Political22Scene} band={[234, 512]} camera={CAM} />;
}
