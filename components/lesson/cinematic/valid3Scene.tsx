import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { ease01, emoteHold, emoteLive, lerp, mixStance, pose, type Bundle } from './rig';
import { BEATS } from './valid3Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';

// An inspector reads an argument on the board — premises, a conclusion, a validity
// link. A VALID stamp lands on the form; a ✗ strikes the premises when they are
// false. The figure sits well to the right of the board, so nothing overlaps.

const FIG_X = 288;
const BX = 116;                       // board column x

const P_CODE = BEATS.map((b) => b.p ?? 0);
const LINK = BEATS.map((b) => b.link ?? 0);
const STAMP = BEATS.map((b) => b.stamp ?? 0);
const FLAW = BEATS.map((b) => b.flaw ?? 0);

interface Shot { s: number; cx: number; cy: number; tr: number }
const SHOTS: Shot[] = BEATS.map((b) => ({ s: b.summary ? 1 : 1.04, cx: 196, cy: 392, tr: 0.85 }));

export default function Valid3Scene({ clock, bt, bi }: SceneApi) {
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const cur = SHOTS[n], prv = SHOTS[p];
    const tr = ease01(bt.value / cur.tr);
    const L = (a: number, b: number) => { 'worklet'; return lerp(a, b, tr); };
    const t = clock.value;

    const insp = mixStance(emoteHold(P_CODE[p], t), emoteLive(P_CODE[n], t, bt.value), tr);
    return {
      cam: { s: L(prv.s, cur.s), cx: L(prv.cx, cur.cx), cy: L(prv.cy, cur.cy) },
      fig: pose(insp, FIG_X, GROUND, K_FIG, -1, 1),
      link: L(LINK[p], LINK[n]),
      stamp: L(STAMP[p], STAMP[n]),
      flaw: L(FLAW[p], FLAW[n]),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const camStyle = useAnimatedStyle(() => {
    const c = SCENE.value.cam;
    return { transform: [{ translateX: STAGE_W / 2 - c.cx * c.s }, { translateY: STAGE_H / 2 - c.cy * c.s }, { scale: c.s }] };
  });
  const linkStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.link }));
  const stampStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.stamp, transform: [{ rotate: '-13deg' }, { scale: 0.7 + 0.3 * SCENE.value.stamp }] }));
  const flawStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.flaw }));

  return (
    <Animated.View style={styles.scene}>
      <Animated.View style={[StyleSheet.absoluteFill, camStyle]}>
        <View style={styles.ground} />

        {/* the argument on the board */}
        <View style={[styles.chip, { top: 286 }]}><Text style={styles.chipT}>All P are Q</Text></View>
        <View style={[styles.chip, { top: 324 }]}><Text style={styles.chipT}>All Q are R</Text></View>
        <Text style={styles.tf}>∴</Text>
        <View style={[styles.chip, styles.concl, { top: 392 }]}><Text style={styles.chipT}>All P are R</Text></View>

        {/* validity link: premises → conclusion */}
        <Animated.View style={[styles.link, linkStyle]} />
        <Animated.View style={[styles.arrow, linkStyle]} />

        {/* the false-premise strike */}
        <Animated.View style={[styles.strike, flawStyle]} pointerEvents="none" />
        <Animated.View style={[styles.falseTag, flawStyle]}><Text style={styles.falseTagT}>FALSE</Text></Animated.View>

        {/* the VALID stamp on the form */}
        <Animated.View style={[styles.stamp, stampStyle]}><Text style={styles.stampT}>VALID</Text></Animated.View>

        <Stickman D={DF} k={K_FIG} />
      </Animated.View>
    </Animated.View>
  );
}

const CW = 88;
const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 40, right: 40, top: GROUND, height: 1.5, backgroundColor: RULE },
  chip: {
    position: 'absolute', left: BX - CW / 2, width: CW, height: 30, borderWidth: 1.5, borderColor: INK,
    borderRadius: 4, backgroundColor: PAPER, alignItems: 'center', justifyContent: 'center',
  },
  concl: { borderWidth: 2 },
  chipT: { fontFamily: 'Inter_700Bold', fontSize: 12, color: INK, letterSpacing: 0.2 },
  tf: { position: 'absolute', left: BX - 42, top: 356, fontFamily: 'PlayfairDisplay_700Bold', fontSize: 20, color: SOFT },
  link: { position: 'absolute', left: BX - 0.75, top: 356, width: 1.5, height: 34, backgroundColor: INK },
  arrow: {
    position: 'absolute', left: BX - 4, top: 386, width: 0, height: 0,
    borderLeftWidth: 4, borderRightWidth: 4, borderTopWidth: 6,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: INK,
  },
  strike: {
    position: 'absolute', left: BX - 52, top: 322, width: 104, height: 2.5, backgroundColor: INK,
    transform: [{ rotate: '-24deg' }],
  },
  falseTag: {
    position: 'absolute', left: BX + 40, top: 296, borderWidth: 1.5, borderColor: INK, backgroundColor: INK,
    paddingHorizontal: 5, paddingVertical: 1, borderRadius: 3, transform: [{ rotate: '-8deg' }],
  },
  falseTagT: { fontFamily: 'Inter_700Bold', fontSize: 9, color: PAPER, letterSpacing: 1 },
  stamp: {
    position: 'absolute', left: BX + 44, top: 356, borderWidth: 2.5, borderColor: INK, borderRadius: 4,
    paddingHorizontal: 8, paddingVertical: 3, transformOrigin: '50% 50%',
  },
  stampT: { fontFamily: 'Inter_700Bold', fontSize: 15, color: INK, letterSpacing: 2 },
});

export function Valid3Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Valid3Scene} />;
}
