import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { ease01, lerp, mixStance, pose, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './aesthetics34Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import { followMoves, kindOf, seedOf } from './camera';

// A BULL MADE OF ELEVEN STROKES, LOSING THEM ONE AT A TIME.
//
// Each stroke is one rotated View, so the animal is eleven Views and the whole
// animation is eleven opacities — comfortably inside §17 rule 7, and no <Svg>
// anywhere near it.
//
// THE ORDER MATTERS AND IS NOT ARBITRARY. `KEEP` ranks the strokes by how much
// each one carries: the horns, the back line and the head go last, because those
// are what still say "bull" when everything else has gone. Dragging therefore
// strips detail first and structure never — which is the reason the readout can
// honestly keep saying "still a bull" all the way to the end of the rail.
//
// · the animal occupies x 156…332, y 366…458, and is drawn from strokes given as
//   [left, top, length, degrees] in stage units.
// · the arrows sit at x 150…340, y 248…272 — ABOVE the animal, where they explain
//   it before it is stripped rather than sitting under it as a footnote.
// · the caption is at y 230…244, the highest ink in the scene.
// · the figure stands at x 50 and reaches x 83, seventy-three clear of the animal.
//
// Ink runs from the caption (230) to the ground line (500). Band 224…512 = 288 (H59).

/**
 * One stroke of the animal: a run of points, drawn as connected segments.
 *
 * NOT A SINGLE ROTATED BAR, which is what this was. A bull is curves — the back
 * dips and rises over the shoulder, the horns sweep, the head is a wedge — and
 * eleven straight bars cannot make any of that. At full strength it read as a
 * stick diagram, and at the far end, where the lesson wants "still unmistakably
 * a bull", it read as three unrelated lines.
 */
type Stroke = readonly (readonly [x: number, y: number])[];

/**
 * THE ANIMAL, facing right, inside x 168…336, y 356…462.
 *
 * Index order is DRAW order. The strip order is `KEEP` below, and it is the
 * whole mechanic: the strokes that go first are the ones a bull can lose and
 * still be a bull — the tail, the second pair of legs, the belly — and the ones
 * that survive to the end are the horns, the head and the back line.
 */
const STROKES: readonly Stroke[] = [
  // 0 · THE BACK. Rump, a dip at the loin, then UP over the shoulder hump and
  //     down into the neck. The hump is what makes it a bull rather than a
  //     table: the first pass ran the back nearly straight and parallel to the
  //     belly, and a rectangle with legs is what came out.
  [[178, 400], [204, 390], [230, 388], [252, 374], [270, 378], [284, 386]],
  // 1 · THE HEAD, a heavy wedge dropping to the muzzle.
  [[284, 386], [302, 392], [318, 402], [322, 410]],
  // 2 · THE JAW, back under it.
  [[322, 410], [306, 412], [292, 405]],
  // 3 · THE NEAR HORN, sweeping up and forward off the brow.
  [[296, 388], [302, 372], [316, 364]],
  // 4 · THE FAR HORN, shorter and turned away.
  [[290, 387], [290, 371], [300, 362]],
  // 5 · THE CHEST AND NEAR FORELEG.
  [[280, 392], [277, 414], [280, 438], [277, 454]],
  // 6 · THE NEAR HIND LEG, off the rump.
  [[182, 404], [186, 428], [184, 448], [188, 454]],
  // 7 · THE BELLY, and it SAGS. A straight one reads as the underside of a box.
  [[190, 428], [216, 440], [248, 438], [274, 426]],
  // 8 · THE FAR FORELEG, set back so the animal has depth.
  [[264, 398], [261, 420], [263, 442], [261, 454]],
  // 9 · THE FAR HIND LEG.
  [[199, 408], [202, 430], [200, 446], [203, 454]],
  // 10 · THE TAIL, with the flick Picasso keeps to the last plate but one.
  [[176, 402], [167, 418], [172, 434], [165, 442]],
];

/**
 * How well each stroke survives the stripping — higher stays longer.
 *
 * The order is the argument. A bull that has lost its tail, its belly and its
 * second pair of legs is still obviously a bull; one that has lost its horns is
 * not, so the horns and the back line are what remain at the far end.
 */
const KEEP = [1.00, 0.94, 0.62, 0.98, 0.90, 0.86, 0.82, 0.30, 0.24, 0.20, 0.12];

/** How thick a stroke is drawn. */
const NIB = 4;

const CAP_T = 230;
const FIG_X = 50;

const STRIP = BEATS.map((b) => b.strip ?? 0);
const ARROWS = BEATS.map((b) => b.arrows ?? 0);
const P = BEATS.map((b) => b.p ?? 0);
const X = BEATS.map((b) => b.x ?? FIG_X);
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('aesthetics34'));

export default function Aesthetics34Scene({ clock, bt, bi, i, dragPos }: SceneApi) {
  const heldS = useHeld();
  const cv = useCarry(2);
  const live = (BEATS[i].live ?? 0) > 0;

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.7);
    const t = clock.value;
    const s = keepHeld(heldS, mixStance(carryFrom(heldS, n, emoteHold(P[p], t)), emoteLive(P[n], t, bt.value), tr));
    const wipe = ease01(bt.value / 1.1);
    return {
      fig: pose(s, FIG_X, GROUND, K_FIG, 1, 1),
      strip: live ? dragPos.value : carry(cv, 0, n, STRIP[p], STRIP[n], wipe),
      arrows: carry(cv, 1, n, ARROWS[p], ARROWS[n], tr),
    };
  });

  const D = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const arrowStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.arrows }));

  return (
    <Animated.View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <View style={styles.plate} pointerEvents="none" />
      <Text style={styles.kicker} numberOfLines={1}>ELEVEN STROKES</Text>

      {STROKES.map((s, k) => <Stroke key={k} k={k} s={s} SCENE={SCENE} />)}

      <Animated.View style={[styles.arrows, arrowStyle]} pointerEvents="none">
        <Text style={styles.arrowLine} numberOfLines={1}>PICTURE  ──▶  BULL</Text>
        <Text style={styles.arrowLine} numberOfLines={1}>BULL  ──✕──▶  PICTURE</Text>
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={D} k={K_FIG} />
    </Animated.View>
  );
}

/**
 * One stroke, as its segments. Own component — a hook cannot run inside `.map()`.
 *
 * Each segment is a bar rotated about its LEFT END, so a point list becomes a
 * polyline with no trigonometry at the call site. The caps are round and each
 * segment is drawn a nib longer than the gap it spans, so the joins do not show
 * as notches on the outside of a curve.
 */
function Stroke({ k, s, SCENE }: { k: number; s: Stroke; SCENE: { value: { strip: number } } }) {
  const style = useAnimatedStyle(() => {
    // A stroke fades once the stripping passes its keep value. The 0.14 window is
    // what makes them go one at a time rather than all dissolving together.
    const d = (SCENE.value.strip - (1 - KEEP[k])) / 0.14;
    const gone = d <= 0 ? 0 : d >= 1 ? 1 : d;
    return { opacity: 1 - gone };
  });
  const segs = [];
  for (let i = 0; i < s.length - 1; i++) {
    const [x1, y1] = s[i];
    const [x2, y2] = s[i + 1];
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    const deg = (Math.atan2(dy, dx) * 180) / Math.PI;
    segs.push(
      <View
        key={i}
        style={[styles.seg, { left: x1, top: y1 - NIB / 2, width: len, transform: [{ rotate: `${deg}deg` }] }]}
      />,
    );
  }
  return <Animated.View style={style} pointerEvents="none">{segs}</Animated.View>;
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 16, right: 16, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON. A rule on its own leaves the figure
  // and everything it is looking at standing on bare page.
  floor: { position: 'absolute', left: 0, right: 0, top: GROUND, bottom: 0, backgroundColor: RULE },

  // THE PLATE THE ANIMAL IS PRINTED ON. Picasso's bull is a lithograph — the
  // lesson is literally eleven PLATES of it — so a toned rectangle behind the
  // strokes is the one mass this picture can carry without inventing scenery.
  plate: {
    position: 'absolute', left: 152, top: 344, width: 200, height: 132,
    backgroundColor: STONE, borderWidth: 1.5, borderColor: SOFT, borderRadius: 2,
  },

  kicker: {
    position: 'absolute', left: 156, top: CAP_T, width: 200,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.2, color: SOFT,
    includeFontPadding: false,
  },

  // Rotated about the left end, so a stroke's declared x,y is where it starts.
  // Rotated about the LEFT END, so a point list becomes a polyline with no
  // trigonometry at the call site. Round caps, so the joins inside a curve read
  // as one continuous stroke rather than as a chain of separate bars.
  seg: {
    position: 'absolute', height: NIB, borderRadius: NIB / 2,
    backgroundColor: INK, transformOrigin: '0% 50%',
  },

  arrows: { position: 'absolute', left: 150, top: 248, width: 190, gap: 4 },
  arrowLine: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.8, color: SOFT,
    includeFontPadding: false,
  },
});

export function Aesthetics34Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Aesthetics34Scene} band={[216, 512]} camera={CAM} />;
}
