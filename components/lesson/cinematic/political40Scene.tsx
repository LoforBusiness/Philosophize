import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, clamp01, ease01, moveTr, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './political40Script';
import {
  facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, pickAt, lookPose,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// THREE REGISTERS STACKED, AND ONE GOOD LOOKING FOR THE SHELF IT BELONGS ON.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · THREE REGISTERS of 236×36 at x 150 (150…386), tops y 286 · 340 · 394. One
//   style and one tone draws all three: a shelf that looked disreputable would
//   answer the question in the furniture, and the middle one — sellable, and
//   spoiled by selling — is exactly the one that has to arrive unmarked.
// · each register carries its NAME at x 158 (158…278), top +13, in ink on the
//   stone (T3).
// · the TOKEN is a 62×22 card at x 300 (300…362), riding to the chosen shelf's
//   own top + 7, so it travels y 293 · 347 · 401. It sits twenty-two units right
//   of the longest register name, so nothing is ever laid over a word (S9).
// · THREE PLATES of 80×26 at x 132 · 222 · 312 (132…392), top y 462 — below the
//   lowest register at 430 and above the ground, each carrying its own words (S11).
// · the figure stands at x 32 and walks to 92; his widest span at the walked mark
//   is x ≈ 67…117, fifteen units clear of the nearest plate at 132 and thirty-three
//   clear of the registers at 150.
//
// Ink runs y 244 (the caption) … y 500 (ground). BAND 240…512 = 272 — a 103-unit
// figure at 37.9%, inside H58's 38%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const SHELF_X = 150;
const SHELF_W = 236;
const SHELF_H = 36;
const SHELF_Y = [286, 340, 394];
const SHELF_N = 3;
const SHELF_CAP = ['SOLD FREELY', 'CHANGED BY SALE', 'NOT FOR SALE'];

const TOKEN_X = 300;
const TOKEN_W = 62;
const TOKEN_H = 22;
/** Where the good sits on each register — the shelf's own top, plus a little. */
const TOKEN_AT = [SHELF_Y[0] + 7, SHELF_Y[1] + 7, SHELF_Y[2] + 7];

const PLATE_X = [132, 222, 312];
const PLATE_Y = 462;
const PLATE_W = 80;
const PLATE_H = 26;
const PLATE_CAP = ['UNFAIR', 'IT SPOILS IT', 'INEFFICIENT'];
const PLATE_ID = ['unfair', 'spoils', 'wasteful'];
/** The objection this argument adds. The other two were already on the table. */
const SPOILS = 1;

const CAP_T = 244;
const FIG_X = 32;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const SHELVES = BEATS.map((b) => b.shelves ?? 0);
const TOKEN = BEATS.map((b) => (b.token ? 1 : 0));
const PLATES = BEATS.map((b) => (b.plates ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));

// R7c — the stage follows the control on its own graded beat, and only there.
// Derived from the beat so it cannot fall out of step with the control.
const REACT = BEATS.map((b) => (b.interact?.sort ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('political40'));

export default function Political40Scene({ clock, bt, bi, i, picked, onPick, pickPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldFig = useHeld();
  const cv = useCarry(5);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    // A WALKING BEAT TAKES AS LONG AS THE WALK NEEDS (rig.moveTr).
    const tr = ease01(bt.value / moveTr(X[p], X[n], BASE_TR));
    const t = clock.value;

    const figS = keepHeld(heldFig, travelStance(
      X[p], X[n],
      carryFrom(heldFig, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));

    return {
      fig: lookPose(figS, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1, gazeX.value, gazeY.value, gazeOn.value),
      t,
      shelves: carry(cv, 1, n, SHELVES[p], SHELVES[n], tr),
      tokenOn: carry(cv, 2, n, TOKEN[p], TOKEN[n], tr),
      // THE SORT'S OWN BIN ORDER, never the shuffled row (X3): 0 sold freely ·
      // 1 changed by sale · 2 not for sale, which is the registers' own order top
      // to bottom, so the good travels between shelves rather than jumping.
      shelf: carry(cv, 3, n, TOKEN_AT[0], reacting ? pickAt(TOKEN_AT, pickPos.value) : TOKEN_AT[0], tr),
      platesOn: carry(cv, 4, n, PLATES[p], PLATES[n], tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const platesStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.platesOn }));
  const tokenStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.tokenOn,
    top: SCENE.value.shelf,
  }));

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={styles.cap} pointerEvents="none">THREE REGISTERS</Text>

      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {SHELF_Y.map((sy, k) => <Register key={sy} S={SCENE} top={sy} index={k} />)}
      </View>

      <Animated.View style={[styles.token, tokenStyle]} pointerEvents="none">
        <Text style={styles.tokenText}>A PLACE</Text>
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, platesStyle]}>
        {PLATE_ID.map((id, k) => (
          <Target
            key={id}
            id={id}
            correct={k === SPOILS}
            picked={picked}
            onPick={onPick}
            disabled={!live || answered}
            style={[styles.hit, { left: PLATE_X[k] }]}
            radius={4}
          >
            <View style={styles.plate} pointerEvents="none" />
            <Text style={styles.plateText} pointerEvents="none">{PLATE_CAP[k]}</Text>
          </Target>
        ))}
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

/** One sphere a good can live in, drawn exactly like the other two. */
function Register({ S, top, index }: { S: SharedValue<any>; top: number; index: number }) {
  const st = useAnimatedStyle(() => ({ opacity: clamp01(S.value.shelves * SHELF_N - index) }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, st]} pointerEvents="none">
      <View style={[styles.shelf, { top }]} />
      <Text style={[styles.shelfText, { top: top + 13 }]}>{SHELF_CAP[index]}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON — a subject standing on a filled mass
  // rather than on bare page.
  floor: { position: 'absolute', left: 0, right: 0, top: GROUND, bottom: 0, backgroundColor: RULE },

  cap: {
    position: 'absolute', left: SHELF_X, top: CAP_T, width: SHELF_W,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },

  shelf: {
    position: 'absolute', left: SHELF_X, width: SHELF_W, height: SHELF_H,
    borderWidth: 2, borderColor: INK, backgroundColor: STONE,
  },
  shelfText: {
    position: 'absolute', left: 158, width: 120,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.6, color: INK, includeFontPadding: false,
  },

  // THE GOOD ITSELF, riding between registers. Its `top` is animated, so moving
  // it is a journey rather than three copies switching on and off.
  token: {
    position: 'absolute', left: TOKEN_X, width: TOKEN_W, height: TOKEN_H,
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: PAPER,
  },
  tokenText: {
    position: 'absolute', left: 0, top: 6, width: TOKEN_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.5, color: INK, includeFontPadding: false,
  },

  hit: { position: 'absolute', top: PLATE_Y, width: PLATE_W, height: PLATE_H },
  plate: {
    position: 'absolute', left: 0, top: 0, width: PLATE_W, height: PLATE_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
  },
  plateText: {
    position: 'absolute', left: 0, top: 8, width: PLATE_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.5, color: INK, includeFontPadding: false,
  },
});

export function Political40Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Political40Scene} band={[240, 512]} camera={CAM} />;
}
