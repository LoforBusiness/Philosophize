import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import {
  ease01, lerp, mixStance, pose, type Bundle,
} from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './epistemology14Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// A SCREEN, A GAP, AND A WORLD — and the world is swapped for a vat while the screen
// holds absolutely still. The argument is carried by the thing that does NOT animate,
// which is the only lesson here built that way (H64, C20c).
//
// · the screen is x 108…218, y 320…460, and its picture is a horizon, a sun and a
//   tree. Those are drawn once and NEVER animated — the text says nothing on the
//   screen would move, so nothing on it may (A1).
// · the world is x 272…384, same height. Its two contents cross-fade in place: a
//   horizon and hills, or a tank with a brain and two leads.
// · the gap is x 218…272. The bridge sits at y 388 across it, and THE LEAP chip is
//   above both boxes at x 190…300, y 292…320, with a leader down into the gap.
// · the three labels sit under their boxes at y 466…496.
// · the figure is at x 48 facing right; measured across its poses it reaches x 81,
//   twenty-seven clear of the screen.
// · the chip at y 292 is the highest ink in the scene.

const SCR_L = 108;
const SCR_W = 110;
const BOX_T = 320;
const BOX_H = 140;

const WOR_L = 272;
const WOR_W = 112;

const CHIP_L = 190;
const CHIP_W = 110;
const CHIP_T = 292;
const CHIP_H = 28;

const LAB_T = 466;
const FIG_X = 48;

const G = BEATS.map((b) => b.g ?? 0);
const VAT = BEATS.map((b) => b.vat ?? 0);
const LEAP = BEATS.map((b) => b.leap ?? 0);

// THE CAMERA (H60b). `followMoves` reads the x track and gives each beat its own
// shot: it FOLLOWS him when a beat moves him far enough to be worth following,
// pushes close on a quote, and PULLS BACK to the whole band on a question or a
// summary — the beats the reader has to read and act on. Beats that do not set
// `x` stand at FIG_X, so a still lesson gets the one-in-three push rather than a
// camera that never rests.
const X = BEATS.map((b) => b.x ?? FIG_X);
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('epistemology14'));

export default function Epistemology14Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const cur = BEATS[i];

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.7);      // nobody walks; this is a pose blend
    const t = clock.value;
    // The swap is slow on purpose — the reader has to have time to watch the screen
    // while the world changes, or the point of it not moving is lost.
    const swap = ease01(bt.value / 1.4);
    const grow = ease01(bt.value / 0.9);
    const s = mixStance(emoteHold(G[p], t), emoteLive(G[n], t, bt.value), tr);
    return {
      fig: pose(s, FIG_X, GROUND, K_FIG, 1, 1),
      vat: lerp(VAT[p], VAT[n], swap),
      leap: lerp(LEAP[p], LEAP[n], grow),
    };
  });

  const D = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const realStyle = useAnimatedStyle(() => ({ opacity: 1 - SCENE.value.vat }));
  const vatStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.vat }));
  const leapStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.leap,
    transform: [{ translateY: (1 - SCENE.value.leap) * -6 }],
  }));

  const answered = picked !== null;
  const live = (cur.pick ?? 0) > 0 && !!cur.interact;
  const wrong = (id: string) => answered && picked === id;

  return (
    <Animated.View style={styles.scene}>
      {/* what reaches you — and it never moves */}
      <Target id={'screen'} correct={true} picked={picked} onPick={onPick}
              style={styles.screen} disabled={!live || answered}>
        <View style={styles.box}>
          <View style={styles.horizon} pointerEvents="none" />
          <View style={styles.sun} pointerEvents="none" />
          <View style={styles.trunk} pointerEvents="none" />
          <View style={styles.canopy} pointerEvents="none" />
        </View>
      </Target>
      <Target id={'screen'} correct={true} picked={picked} onPick={onPick}
              style={[styles.label, { left: SCR_L, width: SCR_W }]} disabled={!live || answered}>
        <View style={[styles.labelInner, answered && styles.pickRight]}>
          <Text style={[styles.labelText, answered && styles.onInk]} numberOfLines={1}>
            WHAT YOU SEE
          </Text>
        </View>
      </Target>

      {/* the world, whatever it turns out to be */}
      <Target id={'world'} correct={false} picked={picked} onPick={onPick}
              style={styles.world} disabled={!live || answered}>
        <View style={[styles.box, wrong('world') && styles.pickWrong]}>
          <Animated.View style={[styles.layer, realStyle]} pointerEvents="none">
            <View style={styles.horizon} />
            <View style={[styles.hill, { left: 14, width: 44, height: 26 }]} />
            <View style={[styles.hill, { left: 54, width: 52, height: 34 }]} />
          </Animated.View>
          <Animated.View style={[styles.layer, vatStyle]} pointerEvents="none">
            <View style={styles.tank} />
            <View style={styles.brain} />
            <View style={[styles.lead, { left: 30 }]} />
            <View style={[styles.lead, { left: 74 }]} />
          </Animated.View>
        </View>
      </Target>
      <Target id={'world'} correct={false} picked={picked} onPick={onPick}
              style={[styles.label, { left: WOR_L, width: WOR_W }]} disabled={!live || answered}>
        <View style={[styles.labelInner, wrong('world') && styles.pickWrong]}>
          <Text style={styles.labelText} numberOfLines={1}>THE WORLD</Text>
        </View>
      </Target>

      {/* the step from one to the other */}
      <Animated.View style={[styles.bridge, leapStyle]} pointerEvents="none" />
      <Animated.View style={[styles.leader, leapStyle]} pointerEvents="none" />
      <Animated.View style={[styles.chip, leapStyle]}>
        <Target id={'leap'} correct={false} picked={picked} onPick={onPick}
              style={styles.fill} disabled={!live || answered}>
          <View style={[styles.chipInner, wrong('leap') && styles.pickWrong]}>
            <Text style={styles.chipText} numberOfLines={1}>THE LEAP BETWEEN</Text>
          </View>
        </Target>
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={D} k={K_FIG} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 16, right: 16, top: GROUND, height: 1.5, backgroundColor: RULE },
  fill: { flex: 1 },

  screen: { position: 'absolute', left: SCR_L, top: BOX_T, width: SCR_W, height: BOX_H },
  world: { position: 'absolute', left: WOR_L, top: BOX_T, width: WOR_W, height: BOX_H },
  box: { flex: 1, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER, overflow: 'hidden' },
  layer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },

  horizon: { position: 'absolute', left: 0, right: 0, top: 96, height: 1.5, backgroundColor: SOFT },
  sun: { position: 'absolute', left: 68, top: 22, width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: INK },
  trunk: { position: 'absolute', left: 26, top: 62, width: 4, height: 34, backgroundColor: INK },
  canopy: { position: 'absolute', left: 12, top: 40, width: 32, height: 28, borderRadius: 14, borderWidth: 2, borderColor: INK },
  hill: { position: 'absolute', bottom: 40, borderTopLeftRadius: 26, borderTopRightRadius: 26, borderWidth: 2, borderColor: INK },

  tank: { position: 'absolute', left: 24, top: 34, width: 60, height: 66, borderWidth: 2, borderColor: INK, borderRadius: 8 },
  brain: { position: 'absolute', left: 40, top: 54, width: 28, height: 22, borderRadius: 11, backgroundColor: INK },
  lead: { position: 'absolute', top: 100, width: 2, height: 24, backgroundColor: INK },

  // The label chip carries the answer state, NOT the box above it: filling a box
  // whose contents are drawn in INK puts ink on ink and erases the picture (H61).
  label: { position: 'absolute', top: LAB_T, height: 30 },
  labelInner: {
    flex: 1, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  labelText: {
    fontFamily: 'Inter_700Bold', fontSize: 8, letterSpacing: 0.4, color: INK,
    includeFontPadding: false,
  },
  onInk: { color: PAPER },

  bridge: { position: 'absolute', left: 218, top: 388, width: 54, height: 2, backgroundColor: SOFT },
  leader: { position: 'absolute', left: 244, top: 320, width: 2, height: 68, backgroundColor: SOFT },
  chip: { position: 'absolute', left: CHIP_L, top: CHIP_T, width: CHIP_W, height: CHIP_H },
  chipInner: {
    flex: 1, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  chipText: {
    fontFamily: 'Inter_700Bold', fontSize: 8, letterSpacing: 0.4, color: INK,
    includeFontPadding: false,
  },

  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT, opacity: 0.45 },
});

// Ink runs from the chip (292) to the ground line (500). Band 286…512 = 226 (H59).
export function Epistemology14Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Epistemology14Scene} band={[286, 512]} camera={CAM} />;
}
