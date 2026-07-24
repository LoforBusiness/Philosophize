import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { climb, ease01, emoteHold, emoteLive, lerp, mixStance, pose, type Bundle, type Stance } from './rig';
import { BEATS } from './logic5Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';

// The figure stays on the LEFT and faces right (dir +1) the whole lesson, so it
// never has to slide or flip; every prop — machine, chain, ladder, chutes — lives
// to its right where there's room to make them BIG. Identity-scale camera so the
// tap targets sit exactly under their art.

const FIG_X = 96;
const MACH_X = 196;                 // machine centre, to the figure's right
const LADDER_X = 122;               // the figure climbs a ladder just to its right
const RUNG_SP = 30;

const P_CODE = BEATS.map((b) => b.p ?? 0);
const CLIMB = BEATS.map((b) => b.climb ?? 0);
const MACHINE = BEATS.map((b) => b.machine ?? 0);
const RUN = BEATS.map((b) => b.run ?? 0);
const CHAIN = BEATS.map((b) => b.chain ?? 0);
const LADDER = BEATS.map((b) => b.ladder ?? 0);
const CHUTE = BEATS.map((b) => b.chute ?? 0);

// Q1 — four big links; one is a dashed GHOST (the skipped step). Tap the gap.
const LINKS = [
  { id: 'a', x: 150, gap: false },
  { id: 'b', x: 212, gap: false },
  { id: 'gap', x: 274, gap: true },
  { id: 'd', x: 336, gap: false },
];
const CHAIN_Y = 312;
// Q2 — two big bins.
const CHUTES = [
  { id: 'trust', x: 198, label: 'TRUST IT' },
  { id: 'check', x: 322, label: 'CHECK IT' },
];
const CHUTE_Y = 402;

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
      if (isClimb) return climb(t * 3.4);
      return useLive ? emoteLive(P_CODE[idx], t, bt.value) : emoteHold(P_CODE[idx], t);
    };
    const s = mixStance(stanceOf(p, climbPrev, false), stanceOf(n, climbNow, true), tr);
    const fx = L(climbPrev ? LADDER_X : FIG_X, climbNow ? LADDER_X : FIG_X);

    return {
      cam: { s: 1, cx: 200, cy: 330 },
      fig: pose(s, fx, GROUND, K_FIG, 1, 1),
      machine: L(MACHINE[p], MACHINE[n]),
      run: L(RUN[p], RUN[n]),
      chain: L(CHAIN[p], CHAIN[n]),
      ladder: L(LADDER[p], LADDER[n]),
      chute: L(CHUTE[p], CHUTE[n]),
      gear: t * 90,
      feed: (t * 0.55) % 1,
      belt: (t * 0.5) % 1,
      scroll: (t * 46) % RUNG_SP,   // rungs scroll DOWN so the climber ascends
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
    return { opacity: SCENE.value.run * (f < 0.55 ? 1 : 0), transform: [{ translateY: lerp(-46, 6, Math.min(1, f / 0.55)) }] };
  });
  const beltBoxStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.run, transform: [{ translateX: SCENE.value.belt * 62 }] }));
  const ladderStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.ladder }));
  const rungsStyle = useAnimatedStyle(() => ({ transform: [{ translateY: SCENE.value.scroll }] }));
  const chainStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.chain }));

  const answered = picked !== null;
  const showChain = (cur.chain ?? 0) > 0 && !!cur.interact;
  const showChutes = (cur.chute ?? 0) > 0 && !!cur.interact;

  return (
    <Animated.View style={styles.scene}>
      <Animated.View style={[StyleSheet.absoluteFill, camStyle]}>
        <View style={styles.ground} />

        {/* ── the ladder (rungs scroll down → the figure climbs upward) ─── */}
        <Animated.View style={[styles.ladderWrap, ladderStyle]} pointerEvents="none">
          <View style={[styles.rail, { left: LADDER_X - 17 }]} />
          <View style={[styles.rail, { left: LADDER_X + 13 }]} />
          <View style={styles.rungClip}>
            <Animated.View style={[styles.rungInner, rungsStyle]}>
              {[-1, 0, 1, 2, 3, 4, 5, 6, 7].map((r) => (
                <View key={r} style={[styles.rung, { top: r * RUNG_SP }]} />
              ))}
            </Animated.View>
          </View>
        </Animated.View>

        {/* ── the word machine + conveyor ─────────────────────────────── */}
        <Animated.View style={machineStyle}>
          <View style={styles.hopper} />
          <Animated.View style={[styles.wordBox, { left: MACH_X - 17, top: 296 }, dropStyle]}><Text style={styles.wbT}>P</Text></Animated.View>
          <View style={styles.machineBody} />
          <Animated.View style={[styles.gear, { left: MACH_X - 34 }, gearA]}><Gear /></Animated.View>
          <Animated.View style={[styles.gear, { left: MACH_X + 2 }, gearB]}><Gear /></Animated.View>
          {/* a bold conveyor belt out the right */}
          <View style={styles.beltFrame} />
          <View style={[styles.roller, { left: MACH_X + 46 }]} />
          <View style={[styles.roller, { left: MACH_X + 120 }]} />
          <Animated.View style={[styles.outBox, { left: MACH_X + 42, top: 420 }, beltBoxStyle]}><Text style={styles.wbTOn}>∴C</Text></Animated.View>
        </Animated.View>

        {/* the figure */}
        <Stickman D={DF} k={K_FIG} />

        {/* ── Q1: the chain — tap the missing (dashed) link ───────────── */}
        <Animated.View style={[styles.chainLine, chainStyle]} pointerEvents="none" />
        {showChain && LINKS.map((lk) => (
          <ChainLink key={lk.id} lk={lk} S={SCENE} answered={answered} picked={picked} onPick={onPick} />
        ))}

        {/* ── Q2: the two big chutes ──────────────────────────────────── */}
        {showChutes && CHUTES.map((ch) => (
          <Chute key={ch.id} ch={ch} S={SCENE} answered={answered} picked={picked} onPick={onPick} />
        ))}
        {showChutes && answered && <ChuteBox S={SCENE} picked={picked} />}
      </Animated.View>
    </Animated.View>
  );
}

function Gear() {
  return (
    <View style={styles.gearInner}>
      {[0, 45, 90, 135].map((a) => <View key={a} style={[styles.tooth, { transform: [{ rotate: `${a}deg` }] }]} />)}
    </View>
  );
}

function ChainLink({ lk, S, answered, picked, onPick }: {
  lk: { id: string; x: number; gap: boolean };
  S: SharedValue<any>; answered: boolean; picked: string | null;
  onPick: (id: string, correct: boolean) => void;
}) {
  const st = useAnimatedStyle(() => {
    const chosen = picked === lk.id;
    const q = answered ? S.value.qv : 0;
    return {
      opacity: S.value.chain,
      transform: [{ scale: chosen ? 1.15 : 1 }, { rotate: lk.gap ? `${q * 16}deg` : '0deg' }, { translateY: lk.gap ? q * 8 : 0 }],
    };
  });
  return (
    <Pressable
      style={[styles.linkHit, { left: lk.x - 34, top: CHAIN_Y - 34 }]}
      disabled={answered}
      onPress={() => onPick(lk.id, lk.gap)}
    >
      <Animated.View style={[styles.link, lk.gap && styles.linkGap, st]}>
        {lk.gap ? <Text style={styles.gapQ}>?</Text> : null}
      </Animated.View>
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
      style={[styles.chuteHit, { left: ch.x - 60 }]}
      disabled={answered}
      onPress={() => onPick(ch.id, correct)}
    >
      <View style={[styles.chuteBin, answered && correct && styles.binRight, answered && chosen && !correct && styles.binWrong]}>
        <Text style={[styles.chuteT, answered && correct && styles.chuteTOn]}>{ch.label}</Text>
      </View>
    </Pressable>
  );
}

function ChuteBox({ S, picked }: { S: SharedValue<any>; picked: string | null }) {
  const target = CHUTES.find((c) => c.id === picked) ?? CHUTES[0];
  const st = useAnimatedStyle(() => {
    const q = S.value.qv;
    return { transform: [{ translateX: lerp(200, target.x, q) - 200 }, { translateY: q * 40 }], opacity: 1 - q * 0.2 };
  });
  return (
    <Animated.View style={[styles.dropBox, { left: 200 - 17, top: CHUTE_Y - 54 }, st]} pointerEvents="none"><Text style={styles.wbTOn}>∴?</Text></Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 40, right: 40, top: GROUND, height: 1.5, backgroundColor: RULE },

  // machine
  hopper: { position: 'absolute', left: MACH_X - 24, top: 328, width: 48, height: 24, backgroundColor: PAPER, borderWidth: 2.5, borderColor: INK, borderBottomWidth: 0 },
  machineBody: { position: 'absolute', left: MACH_X - 44, top: 352, width: 88, height: 82, borderWidth: 3, borderColor: INK, borderRadius: 8, backgroundColor: PAPER },
  gear: { position: 'absolute', top: 374, width: 30, height: 30, alignItems: 'center', justifyContent: 'center', transformOrigin: '50% 50%' },
  gearInner: { width: 26, height: 26, borderRadius: 13, borderWidth: 3, borderColor: INK, alignItems: 'center', justifyContent: 'center' },
  tooth: { position: 'absolute', width: 34, height: 5, backgroundColor: INK, borderRadius: 1 },
  beltFrame: { position: 'absolute', left: MACH_X + 40, top: 434, width: 92, height: 8, backgroundColor: INK, borderRadius: 4 },
  roller: { position: 'absolute', top: 430, width: 16, height: 16, borderRadius: 8, borderWidth: 2.5, borderColor: INK, backgroundColor: PAPER },
  wordBox: { position: 'absolute', width: 34, height: 24, borderWidth: 2.5, borderColor: INK, borderRadius: 4, backgroundColor: PAPER, alignItems: 'center', justifyContent: 'center' },
  outBox: { position: 'absolute', width: 36, height: 26, borderWidth: 2.5, borderColor: INK, borderRadius: 4, backgroundColor: INK, alignItems: 'center', justifyContent: 'center' },
  dropBox: { position: 'absolute', width: 34, height: 26, borderWidth: 2.5, borderColor: INK, borderRadius: 4, backgroundColor: INK, alignItems: 'center', justifyContent: 'center' },
  wbT: { fontFamily: 'Inter_700Bold', fontSize: 13, color: INK },
  wbTOn: { fontFamily: 'Inter_700Bold', fontSize: 12, color: PAPER },

  // ladder
  ladderWrap: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 },
  rail: { position: 'absolute', top: 292, width: 5, height: 210, backgroundColor: INK, borderRadius: 3 },
  rungClip: { position: 'absolute', left: LADDER_X - 17, top: 292, width: 34, height: 210, overflow: 'hidden' },
  rungInner: { position: 'absolute', left: 0, top: 0, width: 34, height: 210 },
  rung: { position: 'absolute', left: 0, width: 34, height: 5, backgroundColor: INK, borderRadius: 3 },

  // chain (Q1) — big links
  chainLine: { position: 'absolute', left: 130, top: CHAIN_Y - 3, width: 226, height: 4, backgroundColor: SOFT },
  linkHit: { position: 'absolute', width: 68, height: 68, alignItems: 'center', justifyContent: 'center' },
  link: { width: 52, height: 52, borderRadius: 26, borderWidth: 6, borderColor: INK, backgroundColor: PAPER, alignItems: 'center', justifyContent: 'center' },
  linkGap: { borderStyle: 'dashed', borderWidth: 4, borderColor: SOFT, backgroundColor: 'transparent' },
  gapQ: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 26, color: SOFT },

  // chutes (Q2) — big bins
  chuteHit: { position: 'absolute', top: CHUTE_Y - 6, width: 120, alignItems: 'center' },
  chuteBin: { width: 116, height: 54, borderWidth: 3, borderColor: INK, borderRadius: 8, backgroundColor: PAPER, alignItems: 'center', justifyContent: 'center' },
  binRight: { backgroundColor: INK, borderColor: INK },
  binWrong: { borderColor: SOFT, opacity: 0.45 },
  chuteT: { fontFamily: 'Inter_700Bold', fontSize: 15, letterSpacing: 0.5, color: INK },
  chuteTOn: { color: PAPER },
});

export function Logic5Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Logic5Scene} />;
}
