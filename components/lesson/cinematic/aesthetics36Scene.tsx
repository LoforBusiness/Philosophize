import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, clamp01, ease01, lerp, moveTr, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './aesthetics36Script';
import { facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { floorStyle, lipOf, PLATE_FACE } from './stageSkin';
import type { SceneApi } from './CinematicPlayer';
import { followMoves, kindOf, seedOf } from './camera';

// THE STAGE IS STRUCK IN THIS LESSON'S OWN BRANCH HUE (./stageTones).
// Same three tones, same luminance to the third decimal — so every contrast
// measured against the old greys still holds and nothing on the stage moved.
const TONE = stageTone('aesthetics');
const { RULE, STONE, SHADE } = TONE;
const LIP = lipOf(TONE);   // the ledge a toned plate stands on (scripts/skin-stage.mjs)

// ─────────────────────────────────────────────────────────────────────────────
// ONE SQUARE, DRAWN ONCE, AND A FRAME THAT MOVES OVER IT.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the SQUARE runs x 104…392 on a paving line at y 352. Twenty-six people stand
//   on it as 9-wide marks with 13-tall bodies, at fixed x positions: eighteen
//   packed between x 108 and x 208, six thinning between x 214 and x 292, and two
//   alone at x 340 and x 372. Those positions are constants and NOTHING in this
//   file moves them — the lesson's claim is that the scene never changes.
// · the VIEWFINDER is a 118×86 frame with 3-thick corners only (no full border,
//   so it reads as a finder rather than a box). It slides x 104…274 at y 296.
// · the two PRINTS hang below at y 410…470: 108×60 each at x 172 and x 284, each
//   showing the marks its own crop contains, with its caption beneath at y 472.
// · the figure stands at x 54 and walks to 128; crown ~397. The square begins at
//   x 104, so on his second position he stands under its left end and beside the
//   prints, never over a mark.
//
// Ink runs y 240 (caption) … y 500 (ground). BAND 234…512 = 278 (H59).
//
// THE PEOPLE ARE MARKS, NOT FIGURES (H57). Twenty-six rigged stickmen would be
// twenty-six people; what this scene needs is a crowd, which is a texture. The
// one person drawn by the rig is the one the reader is standing with.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const PAVE_Y = 352;
const PEOPLE = [
  108, 118, 128, 138, 148, 158, 168, 178, 188, 198, 208,
  214, 226, 240, 256, 274, 292,
  340, 372,
];

const FIND_W = 118;
const FIND_H = 86;
const FIND_Y = 296;
const FIND_LO = 104;
const FIND_HI = 274;

const PRINT_Y = 410;
const PRINT_W = 108;
const PRINT_H = 60;
// 172 and 284, not 150 and 268: on his second position (x 128) the figure's near
// leg reaches about x 146 and the CANE he may be dressed with stands at x 157, and
// the first caption started at 144 — so the leg, then the cane, ran through the TH
// of THOUSANDS TURN OUT (check:readable STRIKE, 2026-09-24, twice). The caption
// now starts at 166. The second print ends at 392, its caption box at 398.
const PRINT_X = [172, 284];
const PRINT_CAP = ['THOUSANDS TURN OUT', 'NOBODY CAME'];
/** Which slice of the square each print shows — the two extremes of the rail. */
const PRINT_FROM = [104, 274];

const CAP_T = 240;
const FIG_X = 54;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along:
// +1 where it rises, -1 where it falls, and HOLD while he stands still, so a
// figure who walks left to something keeps facing it while he talks about it.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const SQUARE = BEATS.map((b) => (b.square ? 1 : 0));
const CROP = BEATS.map((b) => b.crop ?? 0.5);
const LIVE_D = BEATS.map((b) => (b.live_d ? 1 : 0));
const PRINTS = BEATS.map((b) => (b.prints ? 1 : 0));
const REAL = BEATS.map((b) => (b.real ? 1 : 0));
const OPPOSE = BEATS.map((b) => (b.oppose ? 1 : 0));
const LIGHT = BEATS.map((b) => (b.light ? 1 : 0));
const THROUGH_ON = BEATS.map((b) => (b.through ? 1 : 0));
const FORGET = BEATS.map((b) => (b.forget ? 1 : 0));

// The through-line: one person in the square (x 108), straight to their own
// mark inside the first print — Walton's "you see the square itself."
const THROUGH_X0 = 110;
const THROUGH_Y0 = 341;
const THROUGH_X1 = 150 + 6 + (108 - 104) * 0.82 + 1.5;
const THROUGH_Y1 = 410 + 26 + 8;
const THROUGH_LEN = Math.hypot(THROUGH_X1 - THROUGH_X0, THROUGH_Y1 - THROUGH_Y0);
const THROUGH_DEG = (Math.atan2(THROUGH_Y1 - THROUGH_Y0, THROUGH_X1 - THROUGH_X0) * 180) / Math.PI;

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('aesthetics36'));

export default function Aesthetics36Scene({ clock, bt, bi, dragPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const heldFig = useHeld();
  const cv = useCarry(9);
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
      t,
      squareOn: carry(cv, 1, n, SQUARE[p], SQUARE[n], tr),
      // The reader's thumb on the drag beat, the script's track everywhere else.
      crop: LIVE_D[n] === 1 ? clamp01(dragPos.value) : carry(cv, 2, n, CROP[p], CROP[n], tr),
      printsOn: carry(cv, 3, n, PRINTS[p], PRINTS[n], tr),
      // Plain carries: each value is 0/1, so its own interpolation is the fade,
      // both in and out (C20c).
      real: carry(cv, 4, n, REAL[p], REAL[n], tr),
      oppose: carry(cv, 5, n, OPPOSE[p], OPPOSE[n], tr),
      light: carry(cv, 6, n, LIGHT[p], LIGHT[n], tr),
      through: carry(cv, 7, n, THROUGH_ON[p], THROUGH_ON[n], tr),
      forget: carry(cv, 8, n, FORGET[p], FORGET[n], tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const squareStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.squareOn }));
  const findStyle = useAnimatedStyle(() => ({
    // Dims once the reader is told viewers forget it was ever there — the
    // finder itself is the thing the sentence names (H58).
    opacity: SCENE.value.squareOn * (1 - 0.55 * SCENE.value.forget),
    transform: [{ translateX: FIND_LO + (FIND_HI - FIND_LO) * SCENE.value.crop }],
  }));
  const printsStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.printsOn }));
  // A tick confirms the square is unaltered.
  const realStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.real,
    transform: [{ scale: 0.6 + 0.4 * SCENE.value.real }],
  }));
  // Two arrows above the prints, pointing away from each other.
  const opposeStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.oppose,
    transform: [{ scale: 0.7 + 0.3 * SCENE.value.oppose }],
  }));
  const lightStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.light }));
  const throughStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.through,
    transform: [{ rotate: `${THROUGH_DEG}deg` }, { scaleX: SCENE.value.through }],
  }));

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={styles.cap}>ONE SQUARE, ONE AFTERNOON</Text>

      <Animated.View style={[StyleSheet.absoluteFill, squareStyle]} pointerEvents="none">
        <View style={styles.pave} />
        {PEOPLE.map((px) => (
          <View key={px} style={{ position: 'absolute', left: px, top: PAVE_Y - 22 }}>
            <View style={styles.mark} />
          </View>
        ))}
      </Animated.View>

      {/* the tick: everything in the square, confirmed unaltered */}
      <Animated.View style={[styles.realBadge, realStyle]} pointerEvents="none">
        <View style={styles.realTickShort} />
        <View style={styles.realTickLong} />
      </Animated.View>

      {/* the rays: where the photograph's light comes from */}
      <Animated.View style={[styles.lightWrap, lightStyle]} pointerEvents="none">
        {[0, 1, 2].map((k) => (
          <View key={k} style={[styles.ray, { left: k * 7 }]} />
        ))}
      </Animated.View>

      {/* the through-line: one person, straight through to their own print */}
      <Animated.View style={[styles.through, throughStyle]} pointerEvents="none" />

      <Animated.View style={[styles.finder, findStyle]} pointerEvents="none">
        <View style={[styles.corner, styles.cTL]} />
        <View style={[styles.corner, styles.cTR]} />
        <View style={[styles.corner, styles.cBL]} />
        <View style={[styles.corner, styles.cBR]} />
      </Animated.View>

      {/* the arrows: opposite accounts, pointing away from each other */}
      <Animated.View style={[styles.opposeL, opposeStyle]} pointerEvents="none" />
      <Animated.View style={[styles.opposeR, opposeStyle]} pointerEvents="none" />

      <Animated.View style={[StyleSheet.absoluteFill, printsStyle]} pointerEvents="none">
        {PRINT_X.map((qx, k) => (
          <View key={qx}>
            <View style={[styles.print, { left: qx }]} />
            {PEOPLE.filter((px) => px >= PRINT_FROM[k] && px < PRINT_FROM[k] + FIND_W).map((px) => (
              <View
                key={`${k}-${px}`}
                style={{ position: 'absolute', left: qx + 6 + (px - PRINT_FROM[k]) * 0.82, top: PRINT_Y + 26 }}
              >
                <View style={styles.markSmall} />
              </View>
            ))}
            <View style={[styles.printPave, { left: qx + 5 }]} />
            <Text style={[styles.printCap, { left: qx - 6 }]}>{PRINT_CAP[k]}</Text>
          </View>
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
  // THE FLOOR THE GROUND LINE SITS ON. A rule on its own leaves the
  // figure and everything it is looking at standing on bare page;
  // political7 and political8 both stand their subject on a filled mass.
  floor: floorStyle(TONE, GROUND),

  cap: {
    position: 'absolute', left: 104, top: CAP_T, width: 288,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.5, color: SOFT, includeFontPadding: false,
  },

  pave: { position: 'absolute', left: 104, top: PAVE_Y, width: 288, height: 2, backgroundColor: INK },
  // ONE STROKE PER PERSON. A head-and-body pair is a figure built out of Views,
  // which H57 reserves for the rig; nineteen of them would also be nineteen people
  // when what this scene needs is a crowd, and a crowd is a texture.
  mark: { width: 4, height: 22, borderRadius: 2, backgroundColor: INK },

  finder: { position: 'absolute', left: 0, top: FIND_Y, width: FIND_W, height: FIND_H },
  corner: { position: 'absolute', width: 16, height: 16, borderColor: INK },
  cTL: { left: 0, top: 0, borderLeftWidth: 3, borderTopWidth: 3 },
  cTR: { right: 0, top: 0, borderRightWidth: 3, borderTopWidth: 3 },
  cBL: { left: 0, bottom: 0, borderLeftWidth: 3, borderBottomWidth: 3 },
  cBR: { right: 0, bottom: 0, borderRightWidth: 3, borderBottomWidth: 3 },

  print: {
    position: 'absolute', top: PRINT_Y, width: PRINT_W, height: PRINT_H,
    borderWidth: 2, borderColor: INK, borderRadius: 8, backgroundColor: PLATE_FACE, boxShadow: LIP,
  },
  printPave: { position: 'absolute', top: PRINT_Y + 44, width: PRINT_W - 10, height: 1.5, backgroundColor: SOFT },
  markSmall: { width: 3, height: 16, borderRadius: 1.5, backgroundColor: INK },
  printCap: {
    position: 'absolute', top: PRINT_Y + PRINT_H + 4, width: PRINT_W + 12, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.9, color: SOFT, includeFontPadding: false,
  },

  // The tick: the square, confirmed unaltered.
  realBadge: {
    position: 'absolute', left: 372, top: 238, width: 16, height: 16, borderRadius: 8,
    borderWidth: 1.5, borderColor: INK, backgroundColor: PLATE_FACE,
    alignItems: 'center', justifyContent: 'center',
  },
  realTickShort: {
    position: 'absolute', left: 3.5, top: 7, width: 4.5, height: 2, borderRadius: 1,
    backgroundColor: INK, transformOrigin: '0% 50%', transform: [{ rotate: '45deg' }],
  },
  realTickLong: {
    position: 'absolute', left: 6.5, top: 9.5, width: 8, height: 2, borderRadius: 1,
    backgroundColor: INK, transformOrigin: '0% 50%', transform: [{ rotate: '-50deg' }],
  },

  // Three short rays, top-left of the crowd — the light the photograph is made of.
  lightWrap: { position: 'absolute', left: 88, top: 300, width: 30, height: 16 },
  ray: {
    position: 'absolute', top: 0, width: 12, height: 2, borderRadius: 1,
    backgroundColor: SOFT, transform: [{ rotate: '40deg' }],
  },

  // The through-line: one person, tied straight to their own mark in the print.
  through: {
    position: 'absolute', left: THROUGH_X0, top: THROUGH_Y0, width: THROUGH_LEN, height: 0,
    borderTopWidth: 1.5, borderColor: SOFT, borderStyle: 'dashed', transformOrigin: '0% 0%',
  },

  // Two arrows above the prints, pointing away from each other — opposite accounts.
  opposeL: {
    position: 'absolute', left: 188, top: 396, width: 0, height: 0,
    borderTopWidth: 6, borderBottomWidth: 6, borderRightWidth: 10,
    borderTopColor: 'transparent', borderBottomColor: 'transparent', borderRightColor: INK,
  },
  opposeR: {
    position: 'absolute', left: 322, top: 396, width: 0, height: 0,
    borderTopWidth: 6, borderBottomWidth: 6, borderLeftWidth: 10,
    borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: INK,
  },
});

export function Aesthetics36Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Aesthetics36Scene} band={[234, 512]} camera={CAM} />;
}
