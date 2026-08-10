import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import {
  clamp01, ease01, lerp, mixStance, pose, type Bundle,
} from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './aesthetics13Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// TWO CANVASES THE READER CANNOT TELL APART, and a provenance line that draws
// BACKWARDS in time underneath them — six links under one, a single link under the
// other. The difference is real, and it is nowhere on either canvas (H64).
//
// · the canvases are 124 × 100 at x 108 and x 252, y 304…404. Their contents are the
//   SAME four shapes at the same coordinates: identical is the claim the text makes,
//   so identical is what the picture has to be (A1).
// · the history strip is x 100…384, y 430…496. Its spine runs at y 452; the left
//   chain is six links from x 112 westward-drawn back to x 232, the right chain is
//   one link at x 350. The two date captions sit at y 462…476.
// · the strip's label sits at its top, y 432…446, and carries the answer state (H61)
//   — the strip is too big to fill without swallowing its own links.
// · the figure is at x 46 facing right; measured across its poses it reaches x 85,
//   twenty-three clear of the first canvas.
//
// The links appear RIGHT TO LEFT because that is the direction provenance is read:
// back from now. The short chain stopping after one is the whole point, so it is
// drawn on the same clock rather than simply omitted (C20c).

const ART_W = 124;
const ART_T = 304;
const ART_H = 100;
const ART_X = [108, 252];

const STRIP = { left: 100, top: 430, width: 284, height: 66 };
const SPINE_Y = 22;                       // relative to the strip
const LINK_N = 6;
const LINK_X = [112, 136, 160, 184, 208, 232];   // stage x, oldest last
const FAKE_X = 350;

const FIG_X = 46;

const G = BEATS.map((b) => b.g ?? 0);
const ART = BEATS.map((b) => b.art ?? 0);
const CHAIN = BEATS.map((b) => b.chain ?? 0);

// THE CAMERA (H60b). `followMoves` reads the x track and gives each beat its own
// shot: it FOLLOWS him when a beat moves him far enough to be worth following,
// pushes close on a quote, and PULLS BACK to the whole band on a question or a
// summary — the beats the reader has to read and act on. Beats that do not set
// `x` stand at FIG_X, so a still lesson gets the one-in-three push rather than a
// camera that never rests.
const X = BEATS.map((b) => b.x ?? FIG_X);
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('aesthetics13'));

export default function Aesthetics13Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const cur = BEATS[i];

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.7);      // nobody walks; this is a pose blend
    const t = clock.value;
    // Six links over 1.5s — slow enough that the reader watches it travel back,
    // which is the only way the short chain stopping reads as an event (C17).
    const draw = ease01(bt.value / 1.5);
    const s = mixStance(emoteHold(G[p], t), emoteLive(G[n], t, bt.value), tr);
    return {
      fig: pose(s, FIG_X, GROUND, K_FIG, 1, 1),
      art: lerp(ART[p], ART[n], ease01(bt.value / 0.9)),
      chain: lerp(CHAIN[p], CHAIN[n], draw),
    };
  });

  const D = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const artStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.art }));
  const spineStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.chain,
    transform: [{ scaleX: SCENE.value.chain }],
  }));
  const dateStyle = useAnimatedStyle(() => ({ opacity: clamp01(SCENE.value.chain * 2 - 1) }));

  const answered = picked !== null;
  const live = (cur.pick ?? 0) > 0 && !!cur.interact;
  const wrong = (id: string) => answered && picked === id;

  return (
    <Animated.View style={styles.scene}>
      {ART_X.map((x, k) => (
        <Animated.View key={x} style={[styles.art, { left: x }, artStyle]}>
          <Target id={k === 0 ? 'left' : 'right'} correct={false} picked={picked} onPick={onPick}
              style={styles.fill} disabled={!live || answered}>
            <View
              style={[
                styles.artInner,
                wrong(k === 0 ? 'left' : 'right') && styles.pickWrong,
              ]}
            >
              <View style={styles.jug} pointerEvents="none" />
              <View style={styles.window} pointerEvents="none" />
              <View style={styles.sill} pointerEvents="none" />
              <View style={styles.figureBlob} pointerEvents="none" />
            </View>
          </Target>
        </Animated.View>
      ))}

      {/* where each canvas has been */}
      <View style={styles.strip}>
        <Target id={'history'} correct={true} picked={picked} onPick={onPick}
              style={styles.fill} disabled={!live || answered}>
          <Animated.View style={[styles.spine, spineStyle]} pointerEvents="none" />
          {LINK_X.map((x, k) => (
            <Link key={x} k={k} left={x - STRIP.left} SCENE={SCENE} />
          ))}
          <Link k={0} left={FAKE_X - STRIP.left} SCENE={SCENE} />
          <Animated.Text style={[styles.date, { left: 8 }, dateStyle]} numberOfLines={1}>
            1660
          </Animated.Text>
          <Animated.Text style={[styles.date, { left: 218 }, dateStyle]} numberOfLines={1}>
            LAST YEAR
          </Animated.Text>
          <View style={[styles.tab, answered && styles.pickRight]}>
            <Text style={[styles.tabText, answered && styles.onInk]} numberOfLines={1}>
              WHERE IT HAS BEEN
            </Text>
          </View>
        </Target>
      </View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={D} k={K_FIG} />
    </Animated.View>
  );
}

/** One owner in the chain. They arrive newest first, reading back into the past. */
function Link({ k, left, SCENE }: { k: number; left: number; SCENE: { value: { chain: number } } }) {
  const st = useAnimatedStyle(() => {
    const a = clamp01(SCENE.value.chain * LINK_N - (LINK_N - 1 - k));
    return { opacity: a, transform: [{ scale: 0.4 + 0.6 * a }] };
  });
  return <Animated.View style={[styles.link, { left }, st]} pointerEvents="none" />;
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 16, right: 16, top: GROUND, height: 1.5, backgroundColor: RULE },
  fill: { flex: 1 },

  art: { position: 'absolute', top: ART_T, width: ART_W, height: ART_H },
  artInner: {
    flex: 1, borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: PAPER,
  },
  // The same four shapes in both canvases, at the same coordinates.
  window: { position: 'absolute', left: 12, top: 12, width: 34, height: 40, borderWidth: 2, borderColor: INK },
  sill: { position: 'absolute', left: 8, top: 54, width: 42, height: 2, backgroundColor: INK },
  jug: { position: 'absolute', left: 62, top: 30, width: 22, height: 28, borderRadius: 8, borderWidth: 2, borderColor: INK },
  figureBlob: { position: 'absolute', left: 88, top: 44, width: 20, height: 40, borderTopLeftRadius: 10, borderTopRightRadius: 10, backgroundColor: SOFT },

  strip: { position: 'absolute', ...STRIP },
  spine: {
    position: 'absolute', left: 8, right: 8, top: SPINE_Y, height: 1.5,
    backgroundColor: RULE, transformOrigin: '100% 50%',
  },
  link: { position: 'absolute', top: SPINE_Y - 4, width: 9, height: 9, borderRadius: 5, backgroundColor: INK },
  date: {
    position: 'absolute', top: 38,
    fontFamily: 'Inter_500Medium', fontSize: 7, letterSpacing: 0.6, color: SOFT,
    includeFontPadding: false,
  },
  // The strip is too big to fill without swallowing its own links, so the tab at the
  // top carries the answer state instead (H61).
  tab: {
    position: 'absolute', left: 82, top: 52, width: 120, height: 22,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  tabText: {
    fontFamily: 'Inter_700Bold', fontSize: 8, letterSpacing: 0.4, color: INK,
    includeFontPadding: false,
  },

  onInk: { color: PAPER },
  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT, opacity: 0.45 },
});

// Ink runs from the canvases (304) to the strip's tab (496). Band 298…512 = 214 (H59).
export function Aesthetics13Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Aesthetics13Scene} band={[298, 512]} camera={CAM} />;
}
