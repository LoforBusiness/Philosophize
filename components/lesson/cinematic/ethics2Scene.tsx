import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { BEATS } from './ethics2Script';
import {
  BLANK, WALK, clamp01, ease01, emoteHold, emoteLive, lerp, mixStance, pose, strideStance,
  type Bundle,
} from './rig';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';

// ─────────────────────────────────────────────────────────────────────────────
// A VERDICT BOARD over a found wallet.
//
// The old stage was a figure, a guide and a 30×17 wallet — nothing to look at and
// nothing that taught. The lesson's real content is a comparison: three lenses,
// three different questions, and (here) the same verdict. So the top of the stage
// is now a three-row comparison table that builds as the guide works through Mill,
// Kant and Aristotle: the numbered step fills in, the row inks solid, and the
// verdict STAMPS on at a tilt. Below it, a properly drawn wallet with notes and a
// card poking out of it.
//
// Composition rule: the board lives entirely above y = 340 and the figures stand
// on GROUND = 500 with their crowns at ~353 at the highest (the beat-7 shrug), so
// the table never touches a head. The camera transform is gone — it was static on
// every rendered beat, and dropping it lets the band do the zooming instead.
// ─────────────────────────────────────────────────────────────────────────────

const P_CODE = BEATS.map((b) => b.p ?? 0);
const PX = BEATS.map((b) => b.px ?? 262);
const G_CODE = BEATS.map((b) => (b.g ?? -1));
const GX = BEATS.map((b) => b.gx ?? 108);
const G_ON = BEATS.map((b) => ((b.g ?? -1) >= 0 ? 1 : 0));
const NAMED = BEATS.map((b) => b.named ?? 0);
const LENS = BEATS.map((b) => b.lens ?? 0);

const WALLET_X = 176;

const BOARD_L = 14;
const BOARD_W = 372;
const TITLE_T = 182;
const ROW_H = 44;
const ROW_T = [200, 248, 296];

const LENSES = [
  { n: '1', name: 'OUTCOMES', who: 'MILL · 1863', q: 'Does it make life go better?' },
  { n: '2', name: 'DUTY', who: 'KANT · 1785', q: 'Could everyone follow this rule?' },
  { n: '3', name: 'CHARACTER', who: 'ARISTOTLE', q: 'Who does this act make me?' },
];

export default function Ethics2Scene({ clock, bt, bi }: SceneApi) {
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.85);
    const t = clock.value;

    // Finder — gesture blend, small steps.
    const finderS = mixStance(emoteHold(P_CODE[p], t), emoteLive(P_CODE[n], t, bt.value), tr);
    const fx = lerp(PX[p], PX[n], tr);

    // Guide — walks in when its position jumps; otherwise blends gestures in place.
    const gOn = lerp(G_ON[p], G_ON[n], tr);
    const moving = Math.abs(GX[n] - GX[p]) > 10;
    const guideS = moving
      ? strideStance(GX[p], GX[n], emoteLive(G_CODE[n] < 0 ? 0 : G_CODE[n], t, bt.value), tr, WALK)
      : mixStance(emoteHold(G_CODE[p] < 0 ? 0 : G_CODE[p], t), emoteLive(G_CODE[n] < 0 ? 0 : G_CODE[n], t, bt.value), tr);
    const gx = lerp(GX[p], GX[n], tr);

    return {
      finder: pose(finderS, fx, GROUND, K_FIG, -1, 1),
      guide: gOn > 0.02 ? pose(guideS, gx, GROUND, K_FIG, 1, gOn) : BLANK,
      named: lerp(NAMED[p], NAMED[n], tr),
      // One continuous 0→3 value drives all three rows: row k lights as it crosses k.
      lens: lerp(LENS[p], LENS[n], tr),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.finder);
  const DG = useDerivedValue<Bundle>(() => SCENE.value.guide);

  return (
    <Animated.View style={styles.scene} pointerEvents="none">
      {/* ── the verdict board ─────────────────────────────────────────────── */}
      <Text style={styles.boardTitle}>ONE CHOICE  ·  THREE VERDICTS</Text>
      {LENSES.map((L, k) => <LensRow key={L.name} S={SCENE} k={k} />)}

      {/* ── the pavement, and the wallet lying on it ──────────────────────── */}
      <View style={styles.ground} />
      <View style={styles.walletShadow} />
      <View style={styles.noteBack} />
      <View style={styles.noteFront} />
      <View style={styles.wallet}>
        <View style={styles.walletFold} />
        <View style={styles.walletClasp} />
      </View>
      <View style={styles.walletCard} />

      <Stickman D={DG} k={K_FIG} />
      <Stickman D={DF} k={K_FIG} />
    </Animated.View>
  );
}

/** One row of the comparison table: step badge · lens · question · verdict stamp. */
function LensRow({ S, k }: { S: SharedValue<any>; k: number }) {
  const L = LENSES[k];

  const lit = useAnimatedStyle(() => ({ opacity: clamp01(S.value.lens - k) }));
  const pending = useAnimatedStyle(() => ({ opacity: 1 - clamp01(S.value.lens - k) }));
  const named = useAnimatedStyle(() => ({ opacity: S.value.named }));
  // The verdict lands like a rubber stamp: oversized and tilted, settling square.
  const stamp = useAnimatedStyle(() => {
    const e = ease01(clamp01(S.value.lens - k));
    return { opacity: e, transform: [{ scale: 1.45 - 0.45 * e }, { rotate: `${(1 - e) * -9}deg` }] };
  });

  return (
    <View style={[styles.row, { top: ROW_T[k] }]}>
      <Animated.View style={[styles.rowLit, lit]} />
      <Animated.View style={[styles.rowAccent, lit]} />

      {/* step badge — outlined while pending, solid once this lens has ruled */}
      <View style={styles.badge}><Text style={styles.badgeText}>{L.n}</Text></View>
      <Animated.View style={[styles.badgeOn, lit]}><Text style={styles.badgeTextOn}>{L.n}</Text></Animated.View>

      <Animated.View style={[styles.nameCol, named]}>
        <Text style={styles.lensName}>{L.name}</Text>
        <Text style={styles.lensWho}>{L.who}</Text>
      </Animated.View>
      <Animated.Text style={[styles.lensQ, named]}>{L.q}</Animated.Text>

      <Animated.View style={[styles.slot, pending]}><Text style={styles.slotText}>?</Text></Animated.View>
      <Animated.View style={[styles.stamp, stamp]}><Text style={styles.stampText}>RETURN IT</Text></Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 30, right: 22, top: GROUND, height: 1.5, backgroundColor: RULE },

  boardTitle: {
    position: 'absolute', left: BOARD_L, top: TITLE_T, width: BOARD_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 10, lineHeight: 13, letterSpacing: 1.6, color: SOFT,
  },

  row: {
    position: 'absolute', left: BOARD_L, width: BOARD_W, height: ROW_H,
    borderWidth: 1.5, borderColor: RULE, borderRadius: 4, backgroundColor: PAPER,
  },
  rowLit: {
    position: 'absolute', left: -1.5, top: -1.5, right: -1.5, bottom: -1.5,
    borderWidth: 1.5, borderColor: INK, borderRadius: 4,
  },
  rowAccent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: INK },

  badge: {
    position: 'absolute', left: 12, top: (ROW_H - 26) / 2, width: 26, height: 26, borderRadius: 13,
    borderWidth: 1.5, borderColor: SOFT, alignItems: 'center', justifyContent: 'center',
  },
  badgeText: { fontFamily: 'Inter_700Bold', fontSize: 12, lineHeight: 15, color: SOFT },
  badgeOn: {
    position: 'absolute', left: 12, top: (ROW_H - 26) / 2, width: 26, height: 26, borderRadius: 13,
    backgroundColor: INK, alignItems: 'center', justifyContent: 'center',
  },
  badgeTextOn: { fontFamily: 'Inter_700Bold', fontSize: 12, lineHeight: 15, color: PAPER },

  nameCol: { position: 'absolute', left: 48, top: 8, width: 104 },
  lensName: { fontFamily: 'Inter_700Bold', fontSize: 12.5, lineHeight: 16, letterSpacing: 0.3, color: INK },
  lensWho: { fontFamily: 'Inter_700Bold', fontSize: 8.5, lineHeight: 11, letterSpacing: 1, color: SOFT },
  lensQ: {
    position: 'absolute', left: 158, top: 9, width: 112,
    fontFamily: 'Inter_500Medium', fontSize: 10.5, lineHeight: 13, color: SOFT, includeFontPadding: false,
  },

  slot: {
    position: 'absolute', left: 278, top: 8, width: 84, height: 28,
    borderWidth: 1.5, borderColor: RULE, borderStyle: 'dashed', borderRadius: 4,
    alignItems: 'center', justifyContent: 'center',
  },
  slotText: { fontFamily: 'Inter_700Bold', fontSize: 14, lineHeight: 18, color: SOFT },
  stamp: {
    position: 'absolute', left: 278, top: 8, width: 84, height: 28,
    backgroundColor: INK, borderRadius: 4, alignItems: 'center', justifyContent: 'center',
  },
  stampText: { fontFamily: 'Inter_700Bold', fontSize: 11, lineHeight: 14, letterSpacing: 0.6, color: PAPER },

  // ── the wallet: a body with a fold and clasp, two notes and a card ────────
  walletShadow: {
    position: 'absolute', left: WALLET_X - 35, top: GROUND - 2, width: 70, height: 5,
    borderRadius: 3, backgroundColor: RULE,
  },
  wallet: {
    position: 'absolute', left: WALLET_X - 31, top: GROUND - 38, width: 62, height: 36, borderRadius: 4,
    borderWidth: 2, borderColor: INK, backgroundColor: PAPER,
  },
  walletFold: { position: 'absolute', left: 0, right: 0, top: 14, height: 1.5, backgroundColor: SOFT },
  walletClasp: {
    position: 'absolute', left: 22, top: 18, width: 14, height: 9, borderRadius: 2,
    borderWidth: 1.5, borderColor: SOFT,
  },
  noteBack: {
    position: 'absolute', left: WALLET_X - 16, top: GROUND - 51, width: 26, height: 9,
    borderWidth: 1.2, borderColor: RULE, borderRadius: 1.5, backgroundColor: PAPER,
  },
  noteFront: {
    position: 'absolute', left: WALLET_X - 22, top: GROUND - 46, width: 28, height: 10,
    borderWidth: 1.5, borderColor: SOFT, borderRadius: 1.5, backgroundColor: PAPER,
  },
  walletCard: {
    position: 'absolute', left: WALLET_X + 10, top: GROUND - 44, width: 20, height: 13,
    borderWidth: 1.2, borderColor: SOFT, borderRadius: 1.5, backgroundColor: PAPER,
  },
});

// BAND. Topmost ink is the board title at y 182; the lowest is the wallet shadow,
// which ends at GROUND + 3 = 503. The figures' crowns sit at ~353 at their highest
// (the beat-7 shrug lifts the pelvis ~3 rig units), well clear of the table's last
// row at 340. [176, 512] leaves 6 above and 9 below.
export function Ethics2Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Ethics2Scene} band={[176, 512]} />;
}
