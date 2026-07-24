import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { climb, clamp01, ease01, emoteHold, emoteLive, lerp, mixStance, pose, type Bundle, type Stance } from './rig';
import { BEATS } from './logic5Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';

// The word-machine: premise-boxes drop into the hopper, gears turn, a conclusion
// rides out on the conveyor. A chain of inference links (tap the weak one), a ladder
// the figure climbs, and two chutes (send the shaky proof to be checked). Camera is
// identity-scale so the tappable targets sit exactly under their art.

const FIG_X = 186;
const MACH_X = 84;               // machine centre (left; figure operates it, chutes to the right)
const LADDER_X = 186;

const P_CODE = BEATS.map((b) => b.p ?? 0);
const CLIMB = BEATS.map((b) => b.climb ?? 0);
const MACHINE = BEATS.map((b) => b.machine ?? 0);
const RUN = BEATS.map((b) => b.run ?? 0);
const CHAIN = BEATS.map((b) => b.chain ?? 0);
const LADDER = BEATS.map((b) => b.ladder ?? 0);
const CHUTE = BEATS.map((b) => b.chute ?? 0);

// chain links for Q1 — the middle one is the weak (assumed) link
const LINKS = [
  { id: 'a', x: 250, weak: false },
  { id: 'weak', x: 292, weak: true },
  { id: 'c', x: 334, weak: false },
];
const CHAIN_Y = 300;
// chutes for Q2 — well to the right of the figure so it never covers them
const CHUTES = [
  { id: 'trust', x: 280, label: 'TRUST' },
  { id: 'check', x: 354, label: 'CHECK IT' },
];
const CHUTE_Y = 466;

export default function Logic5Scene({ clock, bt, bi, qv, i, picked, onPick }: SceneApi) {
  const cur = BEATS[i];
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.85);
    const L = (a: number, b: number) => { 'worklet'; return lerp(a, b, tr); };
    const t = clock.value;

    const climbNow = CLIMB[n] > 0.5, climbPrev = CLIMB[p] > 0.5;
    const stanceOf = (idx: number, isClimb: boolean, useLive: boolean): Stance => {
      'worklet';
      if (isClimb) return climb(t * 4.2);
      return useLive ? emoteLive(P_CODE[idx], t, bt.value) : emoteHold(P_CODE[idx], t);
    };
    const s = mixStance(stanceOf(p, climbPrev, false), stanceOf(n, climbNow, true), tr);
    const fx = L(climbPrev ? LADDER_X : FIG_X, climbNow ? LADDER_X : FIG_X);
    const rise = climbNow ? ease01(bt.value / 1.4) * 46 : 0;

    return {
      cam: { s: 1, cx: 200, cy: 336 },
      fig: pose(s, fx, GROUND - rise, K_FIG, -1, 1),
      machine: L(MACHINE[p], MACHINE[n]),
      run: L(RUN[p], RUN[n]),
      chain: L(CHAIN[p], CHAIN[n]),
      ladder: L(LADDER[p], LADDER[n]),
      chute: L(CHUTE[p], CHUTE[n]),
      gear: t * 90,
      feed: (t * 0.6) % 1,       // premise-box drop phase
      belt: (t * 0.5) % 1,       // conveyor travel phase
      qv: qv.value,
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const camStyle = useAnimatedStyle(() => {
    const c = SCENE.value.cam;
    return { transform: [{ translateX: STAGE_W / 2 - c.cx * c.s }, { translateY: STAGE_H / 2 - c.cy * c.s }, { scale: c.s }] };
  });
  const machineStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.machine }));
  const gearA = useAnimatedStyle(() => ({ transform: [{ rotate: `${SCENE.value.gear}deg` }] }));
  const gearB = useAnimatedStyle(() => ({ transform: [{ rotate: `${-SCENE.value.gear}deg` }] }));
  const dropStyle = useAnimatedStyle(() => {
    const f = SCENE.value.feed;
    return { opacity: SCENE.value.run * (f < 0.6 ? 1 : 0), transform: [{ translateY: lerp(-40, 8, clamp01(f / 0.6)) }] };
  });
  const beltBoxStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.run, transform: [{ translateX: SCENE.value.belt * 70 }] }));
  const ladderStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.ladder }));
  const chainStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.chain }));
  const chuteStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.chute }));

  const answered = picked !== null;
  const showChain = (cur.chain ?? 0) > 0 && !!cur.interact;
  const showChutes = (cur.chute ?? 0) > 0 && !!cur.interact;

  return (
    <Animated.View style={styles.scene}>
      <Animated.View style={[StyleSheet.absoluteFill, camStyle]}>
        <View style={styles.ground} />

        {/* ── the ladder of steps ─────────────────────────────────────── */}
        <Animated.View style={[styles.ladderWrap, ladderStyle]}>
          <View style={[styles.rail, { left: LADDER_X - 16 }]} />
          <View style={[styles.rail, { left: LADDER_X + 12 }]} />
          {[0, 1, 2, 3, 4, 5].map((r) => (
            <View key={r} style={[styles.rung, { top: 300 + r * 34 }]} />
          ))}
        </Animated.View>

        {/* ── the word machine + conveyor ─────────────────────────────── */}
        <Animated.View style={machineStyle}>
          {/* hopper */}
          <View style={styles.hopper} />
          <Animated.View style={[styles.wordBox, { left: MACH_X - 16, top: 300 }, dropStyle]}><Text style={styles.wbT}>P</Text></Animated.View>
          {/* body */}
          <View style={styles.machineBody} />
          <Animated.View style={[styles.gear, { left: MACH_X - 30 }, gearA]}><Gear /></Animated.View>
          <Animated.View style={[styles.gear, { left: MACH_X + 2 }, gearB]}><Gear /></Animated.View>
          {/* conveyor belt out the right side */}
          <View style={styles.belt} />
          <View style={[styles.roller, { left: MACH_X + 48 }]} />
          <View style={[styles.roller, { left: MACH_X + 116 }]} />
          <Animated.View style={[styles.outBox, { left: MACH_X + 44, top: 424 }, beltBoxStyle]}><Text style={styles.wbT}>∴C</Text></Animated.View>
        </Animated.View>

        {/* the figure */}
        <Stickman D={DF} k={K_FIG} />

        {/* ── Q1: the chain — tap the weak link ───────────────────────── */}
        <Animated.View style={[styles.chainLine, chainStyle]} pointerEvents="none" />
        {showChain && LINKS.map((lk) => (
          <ChainLink key={lk.id} lk={lk} S={SCENE} answered={answered} picked={picked} onPick={onPick} />
        ))}

        {/* ── Q2: the two chutes ──────────────────────────────────────── */}
        {showChutes && CHUTES.map((ch) => (
          <Chute key={ch.id} ch={ch} S={SCENE} answered={answered} picked={picked} onPick={onPick} />
        ))}
        {/* the box that slides into the chosen chute after answering */}
        {showChutes && answered && <ChuteBox S={SCENE} picked={picked} />}
      </Animated.View>
    </Animated.View>
  );
}

function Gear() {
  return (
    <View style={styles.gearInner}>
      <View style={[styles.tooth, { transform: [{ rotate: '0deg' }] }]} />
      <View style={[styles.tooth, { transform: [{ rotate: '45deg' }] }]} />
      <View style={[styles.tooth, { transform: [{ rotate: '90deg' }] }]} />
      <View style={[styles.tooth, { transform: [{ rotate: '135deg' }] }]} />
    </View>
  );
}

function ChainLink({ lk, S, answered, picked, onPick }: {
  lk: { id: string; x: number; weak: boolean };
  S: SharedValue<any>; answered: boolean; picked: string | null;
  onPick: (id: string, correct: boolean) => void;
}) {
  const st = useAnimatedStyle(() => {
    const chosen = picked === lk.id;
    // once answered, the weak link snaps (rotates + drops); a wrong pick just dims
    const q = answered ? S.value.qv : 0;
    const snap = lk.weak ? q : 0;
    return {
      opacity: S.value.chain,
      transform: [{ translateY: snap * 10 }, { rotate: `${snap * 20}deg` }, { scale: chosen ? 1.12 : 1 }],
    };
  });
  return (
    <Pressable
      style={[styles.linkHit, { left: lk.x - 22, top: CHAIN_Y - 22 }]}
      disabled={answered}
      onPress={() => onPick(lk.id, lk.weak)}
    >
      <Animated.View style={[styles.link, lk.weak && styles.linkWeak, st]} />
    </Pressable>
  );
}

function Chute({ ch, S, answered, picked, onPick }: {
  ch: { id: string; x: number; label: string };
  S: SharedValue<any>; answered: boolean; picked: string | null;
  onPick: (id: string, correct: boolean) => void;
}) {
  const chosen = picked === ch.id;
  const correct = ch.id === 'check';
  return (
    <Pressable
      style={[styles.chuteHit, { left: ch.x - 40, top: CHUTE_Y - 6 }]}
      disabled={answered}
      onPress={() => onPick(ch.id, correct)}
    >
      <View style={[styles.chuteBin, answered && chosen && (correct ? styles.binRight : styles.binWrong), answered && correct && styles.binRight]}>
        <Text style={[styles.chuteT, answered && (correct || chosen) && styles.chuteTOn]}>{ch.label}</Text>
      </View>
    </Pressable>
  );
}

function ChuteBox({ S, picked }: { S: SharedValue<any>; picked: string | null }) {
  const target = CHUTES.find((c) => c.id === picked) ?? CHUTES[0];
  const st = useAnimatedStyle(() => {
    const q = S.value.qv;
    return { transform: [{ translateX: lerp(MACH_X + 60, target.x, q) - (MACH_X + 60) }, { translateY: q * 34 }], opacity: 1 - q * 0.15 };
  });
  return (
    <Animated.View style={[styles.outBox, { left: MACH_X + 44, top: 424 }, st]} pointerEvents="none"><Text style={styles.wbT}>∴</Text></Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 40, right: 40, top: GROUND, height: 1.5, backgroundColor: RULE },

  // machine
  hopper: {
    position: 'absolute', left: MACH_X - 22, top: 330, width: 44, height: 22, backgroundColor: PAPER,
    borderWidth: 2, borderColor: INK, borderBottomWidth: 0,
  },
  machineBody: { position: 'absolute', left: MACH_X - 40, top: 352, width: 80, height: 78, borderWidth: 2.5, borderColor: INK, borderRadius: 6, backgroundColor: PAPER },
  gear: { position: 'absolute', top: 372, width: 28, height: 28, alignItems: 'center', justifyContent: 'center', transformOrigin: '50% 50%' },
  gearInner: { width: 24, height: 24, borderRadius: 12, borderWidth: 2.5, borderColor: INK, alignItems: 'center', justifyContent: 'center' },
  tooth: { position: 'absolute', width: 30, height: 4, backgroundColor: INK, borderRadius: 1 },
  belt: { position: 'absolute', left: MACH_X + 40, top: 438, width: 84, height: 4, backgroundColor: INK, borderRadius: 2 },
  roller: { position: 'absolute', top: 434, width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: INK, backgroundColor: PAPER },
  wordBox: { position: 'absolute', width: 32, height: 22, borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: PAPER, alignItems: 'center', justifyContent: 'center' },
  outBox: { position: 'absolute', width: 34, height: 24, borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: INK, alignItems: 'center', justifyContent: 'center' },
  wbT: { fontFamily: 'Inter_700Bold', fontSize: 12, color: INK },

  // ladder
  ladderWrap: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 },
  rail: { position: 'absolute', top: 296, width: 4, height: 206, backgroundColor: INK, borderRadius: 2 },
  rung: { position: 'absolute', left: LADDER_X - 16, width: 32, height: 4, backgroundColor: INK, borderRadius: 2 },

  // chain (Q1)
  chainLine: { position: 'absolute', left: 236, top: CHAIN_Y - 2, width: 112, height: 3, backgroundColor: SOFT },
  linkHit: { position: 'absolute', width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  link: { width: 30, height: 30, borderRadius: 15, borderWidth: 3.5, borderColor: INK, backgroundColor: 'transparent' },
  linkWeak: { borderStyle: 'dashed', borderColor: SOFT, borderWidth: 2.5 },

  // chutes (Q2)
  chuteHit: { position: 'absolute', width: 80, height: 44, alignItems: 'center' },
  chuteBin: { width: 76, height: 34, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER, alignItems: 'center', justifyContent: 'center' },
  binRight: { backgroundColor: INK, borderColor: INK },
  binWrong: { borderColor: SOFT, opacity: 0.5 },
  chuteT: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 0.5, color: INK },
  chuteTOn: { color: PAPER },
});

export function Logic5Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Logic5Scene} />;
}
