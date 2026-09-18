import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { ease01, lerp, mixStance, pose, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './metaphysics34Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { floorStyle, lipOf, PLATE_FACE } from './stageSkin';
import type { SceneApi } from './CinematicPlayer';
import { followMoves, kindOf, seedOf } from './camera';

// THE STAGE IS STRUCK IN THIS LESSON'S OWN BRANCH HUE (./stageTones).
// Same three tones, same luminance to the third decimal — so every contrast
// measured against the old greys still holds and nothing on the stage moved.
const TONE = stageTone('metaphysics');
const { RULE, STONE, SHADE } = TONE;
const LIP = lipOf(TONE);   // the ledge a toned plate stands on (scripts/skin-stage.mjs)

// ONE FRAME, FIVE DEPTHS, AND THE READER DESCENDS IT.
//
// The frame never moves. What is inside it cross-fades as `depth` runs 0…1, so the
// gesture reads as looking HARDER at one thing rather than scrolling past five
// different things — which is the difference between grounding and a list.
//
// · the frame is 150 × 234 at x 168…318, y 240…474, standing on a 6-tall plinth
//   that meets the ground line at 500. Its inside is x 176…310, y 248…466.
// · five layers occupy that inside, each drawn from a handful of Views: the table
//   outline, four grain lines, nine molecules, twenty-five particles, and an empty
//   plate carrying a single question mark.
// · the depth ruler is a 4-wide column at x 148, y 244…470, with a marker that
//   tracks the same value — so "how far down am I" is answerable without reading.
// · the ASK arrow sits under the frame at y 478…492, above the plinth.
// · the kicker is at y 336…350, the highest ink in the scene.
// · the figure stands at x 58 facing right and reaches x 91 across his poses,
//   fifty-seven clear of the ruler.
//
// Ink runs from the kicker (222) to the ground line (500). Band 216…512 = 296 (H59).

const FRAME_L = 168;
const FRAME_T = 240;
const FRAME_W = 150;
const FRAME_H = 234;
const PAD = 8;
const RULER_X = 148;
const RULER_T = 244;
const RULER_H = 226;
const KICK_T = 222;
const FIG_X = 58;

/** What the frame is showing at each fifth of the descent. */
const LABELS = ['A TABLE', 'ITS GRAIN', 'MOLECULES', 'PARTICLES', '?'];
const LAYERS = LABELS.length;

const DEPTH = BEATS.map((b) => b.depth ?? 0);
const ASK = BEATS.map((b) => b.ask ?? 0);
const LINKV = BEATS.map((b) => ((b.link ?? 0) > 0 ? 1 : 0));
const LEGSV = BEATS.map((b) => ((b.legsCross ?? 0) > 0 ? 1 : 0));
const UNDERV = BEATS.map((b) => ((b.under ?? 0) > 0 ? 1 : 0));
const TICKSV = BEATS.map((b) => ((b.ticks ?? 0) > 0 ? 1 : 0));
const P = BEATS.map((b) => b.p ?? 0);
const X = BEATS.map((b) => b.x ?? FIG_X);
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('metaphysics34'));

export default function Metaphysics34Scene({ clock, bt, bi, i, dragPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const heldS = useHeld();
  const cv = useCarry(6);
  const live = (BEATS[i].live ?? 0) > 0;

  // Group AH — each still tap gets exactly one new mark; a fade re-plays only
  // on the beat that actually changes that channel's value (C20c).
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;
  const linkFade = (cur.link ?? 0) !== (prev?.link ?? 0);
  const legsFade = (cur.legsCross ?? 0) !== (prev?.legsCross ?? 0);
  const underFade = (cur.under ?? 0) !== (prev?.under ?? 0);
  const ticksFade = (cur.ticks ?? 0) !== (prev?.ticks ?? 0);

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.7);
    const t = clock.value;
    const grow = ease01(bt.value / 0.55);
    const s = keepHeld(heldS, mixStance(carryFrom(heldS, n, emoteHold(P[p], t)), emoteLive(P[n], t, bt.value), tr));
    // Descending a level takes a moment to read, so the scripted move is slower
    // than the pose blend (C17). Under the reader's thumb it is immediate.
    const sink = ease01(bt.value / 1.0);
    return {
      fig: lookPose(s, FIG_X, GROUND, K_FIG, 1, 1, gazeX.value, gazeY.value, gazeOn.value),
      depth: live ? dragPos.value : carry(cv, 0, n, DEPTH[p], DEPTH[n], sink),
      ask: carry(cv, 1, n, ASK[p], ASK[n], tr),
      // Four new marks, one per still tap — never a re-fade of a mark that
      // is already settled (C20c).
      link: carry(cv, 2, n, LINKV[p], LINKV[n], linkFade ? grow : 1),
      legsCross: carry(cv, 3, n, LEGSV[p], LEGSV[n], legsFade ? grow : 1),
      under: carry(cv, 4, n, UNDERV[p], UNDERV[n], underFade ? grow : 1),
      ticks: carry(cv, 5, n, TICKSV[p], TICKSV[n], ticksFade ? grow : 1),
    };
  });

  const D = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const askStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.ask }));
  const markStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: SCENE.value.depth * (RULER_H - 10) }],
  }));
  const linkStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.link }));
  const underStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.under }));
  const ticksStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.ticks }));

  return (
    <Animated.View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={styles.kicker} numberOfLines={1}>WHAT HOLDS THIS UP?</Text>

      <View style={styles.ruler} pointerEvents="none" />
      <Animated.View style={[styles.mark, markStyle]} pointerEvents="none" />
      {/* A dashed bridge from the ruler's mark to the frame — the table is
          being TRACKED, not just looked at (group AH). */}
      <Animated.View style={[styles.link, linkStyle]} pointerEvents="none" />
      {/* Five ticks light up the ruler — the levels already passed through
          (group AH). */}
      <Animated.View style={[styles.ticksGroup, ticksStyle]} pointerEvents="none">
        {LABELS.map((_, k) => (
          <View key={k} style={[styles.tick, { top: RULER_T + (k * (RULER_H - 10)) / (LAYERS - 1) }]} />
        ))}
      </Animated.View>

      <View style={styles.frame} pointerEvents="none">
        {LABELS.map((_, k) => <Layer key={k} k={k} SCENE={SCENE} />)}
      </View>
      <View style={styles.plinth} pointerEvents="none" />
      {/* A small arrow drops beside the frame — grounding runs underneath,
          not before (group AH). */}
      <Animated.View style={[styles.underArrow, underStyle]} pointerEvents="none">
        <View style={styles.underLine} />
        <View style={styles.underHead} />
      </Animated.View>

      <Animated.Text style={[styles.ask, askStyle]} numberOfLines={1}>▼  AND UNDER THAT?</Animated.Text>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={D} k={K_FIG} />
    </Animated.View>
  );
}

/**
 * One depth of the frame. Its own component because `useAnimatedStyle` cannot be
 * called inside a `.map()` — that is the hooks rule broken five times over.
 *
 * Each layer peaks when the knob is at its own share of the descent and fades out
 * either side, so two neighbours are briefly visible together and the change reads
 * as a dissolve rather than a cut.
 */
function Layer({ k, SCENE }: { k: number; SCENE: { value: { depth: number; legsCross: number } } }) {
  const style = useAnimatedStyle(() => {
    const at = k / (LAYERS - 1);
    const d = Math.abs(SCENE.value.depth - at) * (LAYERS - 1);
    return { opacity: d >= 1 ? 0 : 1 - d };
  });
  // A light strike, k===0 only — the layer's own cross-fade opacity above
  // still governs whether the table is showing at all.
  const legStrike = useAnimatedStyle(() => ({ opacity: SCENE.value.legsCross }));
  return (
    <Animated.View style={[styles.layer, style]} pointerEvents="none">
      {k === 0 ? (
        <View style={styles.tableTop}>
          <View style={styles.tableLegL} />
          <View style={styles.tableLegR} />
          {/* The answer isn't the legs — a light strike cuts across both
              (group AH). */}
          <Animated.View style={[styles.legStrikeL, legStrike]} pointerEvents="none" />
          <Animated.View style={[styles.legStrikeR, legStrike]} pointerEvents="none" />
        </View>
      ) : null}
      {k === 1 ? (
        <View style={styles.grainWrap}>
          {[0, 1, 2, 3].map((g) => <View key={g} style={styles.grain} />)}
        </View>
      ) : null}
      {k === 2 ? (
        <View style={styles.dotWrap}>
          {Array.from({ length: 9 }, (_, m) => <View key={m} style={styles.mol} />)}
        </View>
      ) : null}
      {k === 3 ? (
        <View style={styles.dotWrap}>
          {Array.from({ length: 25 }, (_, m) => <View key={m} style={styles.part} />)}
        </View>
      ) : null}
      {k === 4 ? <Text style={styles.unknown}>?</Text> : null}
      <Text style={styles.layerName} numberOfLines={1}>{LABELS[k]}</Text>
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

  kicker: {
    position: 'absolute', left: 118, top: KICK_T, width: 250,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.2, color: SOFT,
    includeFontPadding: false,
  },

  ruler: { position: 'absolute', left: RULER_X, top: RULER_T, width: 3, height: RULER_H, backgroundColor: RULE },
  mark: { position: 'absolute', left: RULER_X - 4, top: RULER_T, width: 11, height: 10, backgroundColor: INK },

  frame: {
    position: 'absolute', left: FRAME_L, top: FRAME_T, width: FRAME_W, height: FRAME_H,
    backgroundColor: STONE, boxShadow: LIP,
    borderWidth: 2, borderColor: INK },
  plinth: {
    position: 'absolute', left: FRAME_L + 30, top: FRAME_T + FRAME_H, width: FRAME_W - 60, height: 6,
    backgroundColor: INK,
  },
  layer: {
    position: 'absolute', left: PAD, top: PAD, right: PAD, bottom: PAD,
    alignItems: 'center', justifyContent: 'center',
  },
  layerName: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1, color: SOFT,
    textAlign: 'center', includeFontPadding: false,
  },

  tableTop: { width: 92, height: 7, backgroundColor: INK, marginBottom: 26 },
  tableLegL: { position: 'absolute', left: 8, top: 7, width: 5, height: 30, backgroundColor: INK },
  tableLegR: { position: 'absolute', right: 8, top: 7, width: 5, height: 30, backgroundColor: INK },

  // GROUP AH — the four still-tap marks.
  link: {
    position: 'absolute', left: RULER_X + 3, top: RULER_T + 4, width: RULER_X + 16 - (RULER_X + 3), height: 0,
    borderTopWidth: 1.5, borderTopColor: INK, borderStyle: 'dashed',
  },
  ticksGroup: { position: 'absolute', left: RULER_X - 1, top: 0, width: 5, height: RULER_T + RULER_H },
  tick: { position: 'absolute', left: 0, width: 5, height: 2, backgroundColor: PAPER },

  underArrow: { position: 'absolute', left: FRAME_L + FRAME_W + 8, top: FRAME_T + FRAME_H / 2 - 14, width: 12, height: 28 },
  underLine: { position: 'absolute', left: 5, top: 0, width: 2, height: 20, backgroundColor: INK },
  underHead: {
    position: 'absolute', left: 0, top: 20, width: 0, height: 0,
    borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 8,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: INK,
  },

  legStrikeL: { position: 'absolute', left: 5.5, top: 21, width: 11, height: 2, backgroundColor: PAPER, transform: [{ rotate: '45deg' }] },
  legStrikeR: { position: 'absolute', left: 76.5, top: 21, width: 11, height: 2, backgroundColor: PAPER, transform: [{ rotate: '45deg' }] },

  grainWrap: { width: 100, gap: 9, marginBottom: 12 },
  grain: { height: 3, borderRadius: 2, backgroundColor: INK },

  dotWrap: {
    width: 104, flexDirection: 'row', flexWrap: 'wrap',
    gap: 7, justifyContent: 'center', marginBottom: 12,
  },
  mol: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: INK },
  part: { width: 6, height: 6, borderRadius: 3, backgroundColor: INK },

  unknown: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 46, color: INK,
    includeFontPadding: false, marginBottom: 12,
  },

  ask: {
    position: 'absolute', left: FRAME_L, top: FRAME_T + FRAME_H + 10, width: FRAME_W,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.2, color: INK,
    textAlign: 'center', includeFontPadding: false,
  },
});

export function Metaphysics34Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Metaphysics34Scene} band={[216, 512]} camera={CAM} />;
}
