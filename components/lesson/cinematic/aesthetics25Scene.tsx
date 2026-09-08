import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, clamp01, ease01, moveTr, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './aesthetics25Script';
import {
  facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, pickAt, lookPose,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// ONE CANVAS DRAWN TWICE, AND WHAT EACH VIEWER BROUGHT TO IT.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · two FRAMES of 84×58 at x 150 and x 268, top y 254, so the pair runs 150…352.
//   Both are drawn from the SAME three styles — a STONE ground, two bars and a
//   disc — because the entire claim is that the object is identical. If a reader
//   can tell the canvases apart the scene has argued the opposite of the lesson.
// · a NAME under each at y 320: VISITOR ONE and VISITOR TWO, deliberately blank
//   labels. Naming them "trained" and "untrained" would answer beat 4 in the art.
// · a SHELF under each, growing UP from a base rail at y 420: slabs 62×8 at a
//   pitch of 11, six on the left and one on the right, so the left stack tops out
//   at y 354 and clears the names at 330.
// · THREE PLATES of 94×34 at x 92, 196, 300, top y 438 — the answers, each one
//   carrying its own words (S11), and 34 tall rather than 26 because two of the
//   three captions wrap to a second line at this width. They sit between the
//   shelf rail at 420 and the ground at 500.
// · the figure stands at x 40 and walks to 96; his right edge at the walked mark
//   is 121, which is clear of the frames at 150 and below the plates' band.
// · ON THE LAST QUESTION the two columns give way to ONE VIEWER at x 200 with two
//   FEEDS into him — a bar down from the shelf at y 300…352 and a bar up from the
//   heart at y 404…456 — whose opacities are the reader's own chip (R7c).
//
// Ink runs y 236 (the caption) … y 500 (ground). BAND 232…512 = 280 — a 103-unit
// figure at 36.8%, inside H58's 38%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const FRAME_X = [150, 268];
const FRAME_Y = 254;
const FRAME_W = 84;
const FRAME_H = 58;
const NAME_Y = 320;
const NAME = ['VISITOR ONE', 'VISITOR TWO'];

const RAIL_Y = 420;
const SLAB_W = 62;
const SLAB_H = 8;
const SLAB_PITCH = 11;
/** How much each visitor was handed. The whole argument is that these differ. */
const SLABS = [6, 1];
const SLAB_MAX = 6;

const PLATE_X = [92, 196, 300];
const PLATE_Y = 438;
const PLATE_W = 94;
const PLATE_H = 34;
const PLATE_CAP = ['THE CANVAS', 'WHAT THEY BROUGHT', 'HOW LONG THEY LOOKED'];
const PLATE_ID = ['canvas', 'brought', 'looked'];
/** The one that differs. The other two the picture has already shown to be equal. */
const DIFFERS = 1;

const VIEW_X = 200;
const VIEW_Y = 356;
const VIEW_W = 84;
const VIEW_H = 48;
const FEED_W = 6;

const CAP_T = 236;
const FIG_X = 40;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along: +1 where it
// rises, -1 where it falls, and HOLD while he stands still.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const FRAMES = BEATS.map((b) => (b.frames ? 1 : 0));
const SHELVES = BEATS.map((b) => b.shelves ?? 0);
const PLATES = BEATS.map((b) => (b.plates ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));
const FEEDS = BEATS.map((b) => (b.feeds ? 1 : 0));

// R7c — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.sort ? 1 : 0));

// THE TWO FEEDS, IN THE SORT'S OWN ORDER — `pickPos` runs across the bins as the
// author wrote them, which is the only order a picture may follow, because the
// rows the reader sees are shuffled (X3).
//                     sincere · positioning · both
const FROM_HEART = [1, 0, 1];
const FROM_SHELF = [0, 1, 1];

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('aesthetics25'));

export default function Aesthetics25Scene({ clock, bt, bi, i, picked, onPick, pickPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldFig = useHeld();
  const cv = useCarry(7);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    // A WALKING BEAT TAKES AS LONG AS THE WALK NEEDS (rig.moveTr). A fixed length
    // sprints every long journey and leaves the footfalls arriving after him.
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
      framesOn: carry(cv, 1, n, FRAMES[p], FRAMES[n], tr),
      shelves: carry(cv, 2, n, SHELVES[p], SHELVES[n], tr),
      platesOn: carry(cv, 3, n, PLATES[p], PLATES[n], tr),
      feedsOn: carry(cv, 4, n, FEEDS[p], FEEDS[n], tr),
      // R7c — the chip decides which way the viewer is being fed, under the thumb.
      heart: carry(cv, 5, n, 0, reacting ? pickAt(FROM_HEART, pickPos.value) : 0, tr),
      shelf: carry(cv, 6, n, 0, reacting ? pickAt(FROM_SHELF, pickPos.value) : 0, tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const framesStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.framesOn }));
  const platesStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.platesOn }));
  const feedsStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.feedsOn }));
  const heartStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.heart }));
  const shelfStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.shelf }));
  // E39 — the MEASURE between the two stacks is what the right answer reveals, so
  // it belongs to the thing that was chosen and appears only once it has been.
  const gapStyle = useAnimatedStyle(() => ({
    opacity: answered && picked === PLATE_ID[DIFFERS] ? SCENE.value.shelves : 0,
  }));

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={styles.cap} pointerEvents="none">THE SAME CANVAS, TWICE</Text>

      <Animated.View style={[StyleSheet.absoluteFill, framesStyle]} pointerEvents="none">
        {FRAME_X.map((fx, k) => (
          <View key={fx}>
            <View style={[styles.frame, { left: fx }]} />
            <View style={[styles.markBar, { left: fx + 12, top: FRAME_Y + 16 }]} />
            <View style={[styles.markBar, { left: fx + 12, top: FRAME_Y + 30, width: 38 }]} />
            <View style={[styles.markDisc, { left: fx + 58 }]} />
            <Text style={[styles.name, { left: fx }]}>{NAME[k]}</Text>
          </View>
        ))}
        <View style={styles.rail} />
        {FRAME_X.map((fx, k) => (
          <Shelf key={fx} S={SCENE} left={fx + (FRAME_W - SLAB_W) / 2} count={SLABS[k]} />
        ))}
        <Animated.View style={[styles.gap, gapStyle]} />
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, platesStyle]}>
        {PLATE_ID.map((id, k) => (
          <Target
            key={id}
            id={id}
            correct={k === DIFFERS}
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

      <Animated.View style={[StyleSheet.absoluteFill, feedsStyle]} pointerEvents="none">
        <View style={styles.viewer} />
        <Text style={styles.viewerText}>ONE VIEWER</Text>
        <Animated.View style={[styles.feedShelf, shelfStyle]} />
        <Animated.View style={[styles.feedHeart, heartStyle]} />
        <Animated.Text style={[styles.feedCapTop, shelfStyle]}>THE SHELF</Animated.Text>
        <Animated.Text style={[styles.feedCapLow, heartStyle]}>THE HEART</Animated.Text>
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

/** One visitor's inheritance, laid slab by slab from the rail upward. */
function Shelf({ S, left, count }: { S: SharedValue<any>; left: number; count: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, j) => (
        <Slab key={j} S={S} left={left} index={j} />
      ))}
    </>
  );
}

function Slab({ S, left, index }: { S: SharedValue<any>; left: number; index: number }) {
  const st = useAnimatedStyle(() => ({ opacity: clamp01(S.value.shelves * SLAB_MAX - index) }));
  return (
    <Animated.View
      style={[styles.slab, { left, top: RAIL_Y - (index + 1) * SLAB_PITCH }, st]}
      pointerEvents="none"
    />
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON — political7 and political8 both stand their
  // subject on a filled mass rather than on bare page.
  floor: { position: 'absolute', left: 0, right: 0, top: GROUND, bottom: 0, backgroundColor: RULE },

  cap: {
    position: 'absolute', left: 150, top: CAP_T, width: 232,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },

  // BOTH FRAMES OUT OF ONE SET OF STYLES. The lesson's whole claim is that the
  // object is identical, so the drawing must not be able to differ by accident.
  frame: {
    position: 'absolute', top: FRAME_Y, width: FRAME_W, height: FRAME_H,
    borderWidth: 2.5, borderColor: INK, backgroundColor: STONE,
  },
  markBar: { position: 'absolute', width: 58, height: 5, borderRadius: 2, backgroundColor: INK },
  markDisc: {
    position: 'absolute', top: FRAME_Y + 12, width: 14, height: 14, borderRadius: 7,
    borderWidth: 2, borderColor: INK, backgroundColor: PAPER,
  },
  name: {
    position: 'absolute', top: NAME_Y, width: FRAME_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.6, color: INK, includeFontPadding: false,
  },

  rail: { position: 'absolute', left: 146, top: RAIL_Y, width: 210, height: 1.5, backgroundColor: RULE },
  slab: { position: 'absolute', width: SLAB_W, height: SLAB_H, borderRadius: 2, backgroundColor: INK },
  // The measure the right answer draws: the height one visitor has that the other
  // has not, stated as a bar rather than as a word.
  gap: {
    position: 'absolute', left: 246, top: RAIL_Y - SLAB_MAX * SLAB_PITCH, width: 3,
    height: (SLAB_MAX - 1) * SLAB_PITCH, backgroundColor: INK,
  },

  hit: { position: 'absolute', top: PLATE_Y, width: PLATE_W, height: PLATE_H },
  plate: {
    position: 'absolute', left: 0, top: 0, width: PLATE_W, height: PLATE_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
  },
  // TWO LINES OF ROOM, because three of these captions need it: measured against
  // the real .ttf, WHAT THEY BROUGHT is 101.6px into a 94-wide plate. A caption
  // that wraps inside a box built for one line is S8's exact defect, and the fix
  // is the box rather than a shorter word that says less.
  plateText: {
    position: 'absolute', left: 0, top: 6, width: PLATE_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.5, color: INK, includeFontPadding: false,
  },

  viewer: {
    position: 'absolute', left: VIEW_X - VIEW_W / 2, top: VIEW_Y, width: VIEW_W, height: VIEW_H,
    borderWidth: 2.5, borderColor: INK, backgroundColor: STONE,
  },
  viewerText: {
    position: 'absolute', left: VIEW_X - VIEW_W / 2, top: VIEW_Y + 18, width: VIEW_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.6, color: INK, includeFontPadding: false,
  },
  feedShelf: {
    position: 'absolute', left: VIEW_X - FEED_W / 2, top: 300, width: FEED_W, height: 52,
    backgroundColor: INK,
  },
  feedHeart: {
    position: 'absolute', left: VIEW_X - FEED_W / 2, top: VIEW_Y + VIEW_H + 4, width: FEED_W, height: 48,
    backgroundColor: INK,
  },
  feedCapTop: {
    position: 'absolute', left: VIEW_X + 14, top: 314, width: 96,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.6, color: INK, includeFontPadding: false,
  },
  feedCapLow: {
    position: 'absolute', left: VIEW_X + 14, top: 424, width: 96,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.6, color: INK, includeFontPadding: false,
  },
});

export function Aesthetics25Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Aesthetics25Scene} band={[232, 512]} camera={CAM} />;
}
