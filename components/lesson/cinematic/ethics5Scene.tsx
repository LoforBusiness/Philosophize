import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { WALK, clamp01, ease01, emoteHold, emoteLive, lerp, mixStance, pose, strideStance, type Bundle } from './rig';
import { BEATS } from './ethics5Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';

// Socrates + a student walk and talk through snowy Athens: fluted columns behind,
// snow drifting down, the pair striding across. A fork of two paths (choose where
// virtue grows) and a balance scale (proven fact vs interpretive thesis) are the
// two scene-driven answers. Identity-scale camera so the tap targets sit under the art.

const GAP = 100;                   // spacing between the two walkers
const COLUMNS = [64, 150, 250, 336];

const SX = BEATS.map((b) => b.sx ?? 200);
const SOC = BEATS.map((b) => b.soc ?? 0);
const STU = BEATS.map((b) => b.stu ?? 0);
const FORK = BEATS.map((b) => b.fork ?? 0);
const BAL = BEATS.map((b) => b.balance ?? 0);

// The two choices sit as boards in a clear band ABOVE the walkers' heads, so they
// never overlap the figures regardless of where the pair stands.
const CHOICE_Y = 292;
const FORKS = [
  { id: 'solitude', label: 'IN SOLITUDE', x: 138, correct: false },
  { id: 'among', label: 'AMONG OTHERS', x: 286, correct: true },
];
const PANS = [
  { id: 'fact', label: 'PROVEN FACT', side: -1, correct: false },
  { id: 'thesis', label: 'A THESIS', side: 1, correct: true },
];

export default function Ethics5Scene({ clock, bt, bi, qv, i, picked, onPick }: SceneApi) {
  const cur = BEATS[i];
  // Answer-direction constants resolved on the JS thread — the worklet stays free of
  // array methods, and strideStance is called DIRECTLY (calling it from a nested
  // worklet, which itself calls walk/mixStance, hard-crashes the runtime).
  const forkAnswered = (cur.fork ?? 0) > 0 && picked !== null;
  const balAnswered = (cur.balance ?? 0) > 0 && picked !== null;
  const driftDir = picked === 'solitude' ? 1 : 0;            // the solitude path drifts the pair down
  const tiltDir = picked === 'thesis' ? 1 : picked === 'fact' ? -1 : 0;

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.85);
    const L = (a: number, b: number) => { 'worklet'; return lerp(a, b, tr); };
    const t = clock.value;
    const moving = Math.abs(SX[n] - SX[p]) > 1;

    const socS = moving
      ? strideStance(SX[p], SX[n], emoteHold(SOC[n], t), tr, WALK)
      : mixStance(emoteHold(SOC[p], t), emoteLive(SOC[n], t, bt.value), tr);
    const stuS = moving
      ? strideStance(SX[p], SX[n], emoteHold(STU[n], t), tr, WALK)
      : mixStance(emoteHold(STU[p], t), emoteLive(STU[n], t, bt.value), tr);

    const bx = L(SX[p], SX[n]);
    const drift = forkAnswered ? qv.value : 0;
    const dx = drift * 30;
    const dy = drift * driftDir * 22;

    return {
      cam: { s: 1, cx: 200, cy: 340 },
      soc: pose(socS, bx + dx, GROUND + dy, K_FIG, 1, 1),
      stu: pose(stuS, bx + GAP + dx, GROUND + dy, K_FIG, 1, 1),
      fork: L(FORK[p], FORK[n]),
      balance: L(BAL[p], BAL[n]),
      tilt: balAnswered ? qv.value * tiltDir : 0,
      qv: qv.value,
      t,
    };
  });

  const DSoc = useDerivedValue<Bundle>(() => SCENE.value.soc);
  const DStu = useDerivedValue<Bundle>(() => SCENE.value.stu);
  const camStyle = useAnimatedStyle(() => {
    const c = SCENE.value.cam;
    return { transform: [{ translateX: STAGE_W / 2 - c.cx * c.s }, { translateY: STAGE_H / 2 - c.cy * c.s }, { scale: c.s }] };
  });
  const forkStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.fork }));
  const balStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.balance }));
  const beamStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${SCENE.value.tilt * 16}deg` }] }));

  const answered = picked !== null;
  const showFork = (cur.fork ?? 0) > 0 && !!cur.interact;
  const showBal = (cur.balance ?? 0) > 0 && !!cur.interact;

  return (
    <Animated.View style={styles.scene}>
      <Animated.View style={[StyleSheet.absoluteFill, camStyle]}>
        {/* columns behind */}
        {COLUMNS.map((x) => <Column key={x} x={x} />)}
        <View style={styles.ground} />

        {/* snow */}
        {SNOW.map((s, k) => <Flake key={k} S={SCENE} s={s} k={k} />)}

        {/* the two walkers */}
        <Stickman D={DSoc} k={K_FIG} />
        <Stickman D={DStu} k={K_FIG} />

        {/* ── Q1: two choices in a band above the walkers' heads ──────── */}
        {showFork && (
          <Animated.View style={[StyleSheet.absoluteFill, forkStyle]}>
            <Text style={styles.choiceHdr}>WHERE DOES VIRTUE GROW?</Text>
            {FORKS.map((f) => (
              <Signpost key={f.id} f={f} answered={answered} picked={picked} onPick={onPick} />
            ))}
          </Animated.View>
        )}

        {/* ── Q2: the balance (decorative frame — must NOT eat the fork's taps) */}
        <Animated.View style={[styles.balanceWrap, balStyle]} pointerEvents="none">
          <View style={styles.balPost} />
          <Animated.View style={[styles.balBeam, beamStyle]}>
            <View style={[styles.balHang, { left: 2 }]} />
            <View style={[styles.balHang, { right: 2 }]} />
          </Animated.View>
        </Animated.View>
        {showBal && PANS.map((pn) => (
          <Pan key={pn.id} pn={pn} S={SCENE} answered={answered} picked={picked} onPick={onPick} />
        ))}
      </Animated.View>
    </Animated.View>
  );
}

const SNOW = Array.from({ length: 16 }, (_, k) => ({ x: 40 + (k * 337) % 320, ph: (k * 0.137) % 1, sp: 0.18 + (k % 5) * 0.03 }));

function Flake({ S, s, k }: { S: SharedValue<any>; s: { x: number; ph: number; sp: number }; k: number }) {
  const st = useAnimatedStyle(() => {
    const f = ((S.value.t * s.sp + s.ph) % 1 + 1) % 1;
    const y = lerp(290, GROUND - 4, f);
    const sway = Math.sin(S.value.t * 1.3 + k) * 10;
    return { opacity: 0.5 + 0.4 * Math.sin(f * Math.PI), transform: [{ translateX: sway }, { translateY: y - 290 }] };
  });
  return <Animated.View style={[styles.flake, { left: s.x, top: 290 }, st]} />;
}

function Column({ x }: { x: number }) {
  return (
    <View style={[styles.colWrap, { left: x - 15 }]} pointerEvents="none">
      <View style={styles.colCap} />
      <View style={styles.colShaft} />
      <View style={styles.colBase} />
    </View>
  );
}

function Signpost({ f, answered, picked, onPick }: {
  f: { id: string; label: string; x: number; correct: boolean };
  answered: boolean; picked: string | null; onPick: (id: string, correct: boolean) => void;
}) {
  const chosen = picked === f.id;
  return (
    <Pressable
      style={[styles.signHit, { left: f.x - 66, top: CHOICE_Y }]}
      disabled={answered}
      onPress={() => onPick(f.id, f.correct)}
    >
      <View style={[styles.sign, answered && f.correct && styles.signRight, answered && chosen && !f.correct && styles.signWrong]}>
        <Text style={[styles.signT, answered && f.correct && styles.signTOn]}>{f.label}</Text>
      </View>
    </Pressable>
  );
}

function Pan({ pn, S, answered, picked, onPick }: {
  pn: { id: string; label: string; side: number; correct: boolean };
  S: SharedValue<any>; answered: boolean; picked: string | null; onPick: (id: string, correct: boolean) => void;
}) {
  const chosen = picked === pn.id;
  const st = useAnimatedStyle(() => ({ transform: [{ translateY: S.value.tilt * pn.side * 14 }] }));
  return (
    <Animated.View style={[styles.panHit, { left: 200 + pn.side * 56 - 34 }, st]}>
      <Pressable disabled={answered} onPress={() => onPick(pn.id, pn.correct)} style={styles.panPress}>
        <View style={[styles.pan, answered && pn.correct && styles.panRight, answered && chosen && !pn.correct && styles.panWrong]}>
          <Text style={[styles.panT, answered && pn.correct && styles.panTOn]}>{pn.label}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 24, right: 24, top: GROUND, height: 1.5, backgroundColor: RULE },
  flake: { position: 'absolute', width: 5, height: 5, borderRadius: 3, backgroundColor: SOFT },

  colWrap: { position: 'absolute', top: 300, width: 30, height: 200 },
  colCap: { width: 30, height: 8, backgroundColor: PAPER, borderWidth: 2, borderColor: RULE },
  colShaft: { width: 24, height: 184, marginLeft: 3, borderLeftWidth: 2, borderRightWidth: 2, borderColor: RULE, backgroundColor: 'transparent' },
  colBase: { width: 30, height: 8, marginTop: -8, backgroundColor: PAPER, borderWidth: 2, borderColor: RULE },

  choiceHdr: { position: 'absolute', top: CHOICE_Y - 24, left: 0, right: 0, textAlign: 'center', fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.5, color: SOFT },
  signHit: { position: 'absolute', width: 132, alignItems: 'center' },
  sign: { borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER, paddingHorizontal: 10, paddingVertical: 9 },
  signRight: { backgroundColor: INK, borderColor: INK },
  signWrong: { borderColor: SOFT, opacity: 0.5 },
  signT: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 0.5, color: INK },
  signTOn: { color: PAPER },

  balanceWrap: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 },
  balPost: { position: 'absolute', left: 199, top: 272, width: 3, height: 92, backgroundColor: INK },
  balBeam: { position: 'absolute', left: 200 - 60, top: 270, width: 120, height: 3, backgroundColor: INK, transformOrigin: '50% 50%' },
  balHang: { position: 'absolute', top: 0, width: 2, height: 24, backgroundColor: SOFT },
  panHit: { position: 'absolute', top: 292, width: 68, alignItems: 'center' },
  panPress: { alignItems: 'center' },
  pan: { width: 68, height: 26, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER, alignItems: 'center', justifyContent: 'center' },
  panRight: { backgroundColor: INK, borderColor: INK },
  panWrong: { borderColor: SOFT, opacity: 0.5 },
  panT: { fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 0.5, color: INK },
  panTOn: { color: PAPER },
});

export function Ethics5Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Ethics5Scene} />;
}
