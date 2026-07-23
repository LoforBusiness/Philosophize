import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { ease01, emoteHold, emoteLive, lerp, mixStance, pose, type Bundle } from './rig';
import { BEATS } from './aesthetics4Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';

// A readymade on a gallery plinth, flanked by the artist (who signs it) and a
// viewer (who recoils, then thinks). The plinth sits centre and low; the figures
// stand to either side, so nobody covers the object.

const A_X = 108;
const V_X = 292;
const PED_X = 200;

const A_CODE = BEATS.map((b) => b.a ?? 0);
const V_CODE = BEATS.map((b) => b.v ?? 0);
const SIGNED = BEATS.map((b) => b.signed ?? 0);
const ART = BEATS.map((b) => b.art ?? 0);

export default function Aesthetics4Scene({ clock, bt, bi }: SceneApi) {
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.85);
    const L = (a: number, b: number) => { 'worklet'; return lerp(a, b, tr); };
    const t = clock.value;
    const isSummary = !!BEATS[n].summary;

    const a = mixStance(emoteHold(A_CODE[p], t), emoteLive(A_CODE[n], t, bt.value), tr);
    const v = mixStance(emoteHold(V_CODE[p], t), emoteLive(V_CODE[n], t, bt.value), tr);
    return {
      cam: { s: isSummary ? 1 : 0.98, cx: 200, cy: 418 },
      a: pose(a, A_X, GROUND, K_FIG, 1, 1),
      v: pose(v, V_X, GROUND, K_FIG, -1, 1),
      signed: L(SIGNED[p], SIGNED[n]),
      art: L(ART[p], ART[n]),
    };
  });

  const DA = useDerivedValue<Bundle>(() => SCENE.value.a);
  const DV = useDerivedValue<Bundle>(() => SCENE.value.v);
  const camStyle = useAnimatedStyle(() => {
    const c = SCENE.value.cam;
    return { transform: [{ translateX: STAGE_W / 2 - c.cx * c.s }, { translateY: STAGE_H / 2 - c.cy * c.s }, { scale: c.s }] };
  });
  const sigStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.signed }));
  const artStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.art, transform: [{ translateY: (1 - SCENE.value.art) * 6 }] }));

  return (
    <Animated.View style={styles.scene}>
      <Animated.View style={[StyleSheet.absoluteFill, camStyle]}>
        <View style={styles.ground} />

        {/* the plinth */}
        <View style={styles.plinth} />
        <View style={styles.plinthTop} />

        {/* the readymade + its signature */}
        <View style={styles.readymade} />
        <Animated.Text style={[styles.sig, sigStyle]}>R. Mutt 1917</Animated.Text>

        {/* the artworld's placard */}
        <Animated.View style={[styles.placard, artStyle]}><Text style={styles.placardT}>ART</Text></Animated.View>

        <Stickman D={DA} k={K_FIG} />
        <Stickman D={DV} k={K_FIG} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 40, right: 40, top: GROUND, height: 1.5, backgroundColor: RULE },
  plinth: { position: 'absolute', left: PED_X - 26, top: GROUND - 84, width: 52, height: 84, borderWidth: 2, borderColor: INK, backgroundColor: PAPER },
  plinthTop: { position: 'absolute', left: PED_X - 32, top: GROUND - 90, width: 64, height: 8, borderWidth: 2, borderColor: INK, backgroundColor: PAPER },
  readymade: {
    position: 'absolute', left: PED_X - 18, top: GROUND - 126, width: 36, height: 34,
    borderWidth: 2, borderColor: INK, backgroundColor: PAPER, borderTopLeftRadius: 18, borderTopRightRadius: 18, borderBottomLeftRadius: 6, borderBottomRightRadius: 6,
  },
  sig: { position: 'absolute', left: PED_X - 26, top: GROUND - 96, width: 52, textAlign: 'center', fontFamily: 'Inter_500Medium', fontStyle: 'italic', fontSize: 8, color: INK },
  placard: { position: 'absolute', left: PED_X - 18, top: GROUND - 20, width: 36, borderWidth: 1.5, borderColor: INK, backgroundColor: INK, paddingVertical: 1, alignItems: 'center', borderRadius: 2 },
  placardT: { fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 2, color: PAPER },
});

export function Aesthetics4Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Aesthetics4Scene} />;
}
