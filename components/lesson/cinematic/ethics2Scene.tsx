import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { BEATS } from './ethics2Script';
import {
  BLANK, WALK, clamp01, ease01, emoteHold, emoteLive, lerp, mixStance, moveTr, pose, strideStance, type Bundle,
} from './rig';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import { followMoves, kindOf, seedOf } from './camera';
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
// The title is a WORD ANIMATION: it opens as "ONE CHOICE · THREE VERDICTS" and,
// once the third stamp lands, cross-fades to "THREE LENSES · ONE VERDICT" — the
// punchline of the lesson, delivered by the board rather than by the narration.
//
// Composition rule: the board lives entirely above y = 340 and the figures stand
// on GROUND = 500 with their crowns at ~353 at the highest (the beat-7 shrug), so
// the table never touches a head.
//
// The camera went, and has come back. It was dropped because it sat static on every
// rendered beat — but that is a case for a better camera, not for none (H60b), and
// the lesson then read at one distance throughout. It is a `followMoves` camera now,
// which was only safe once the board could defend itself: a 1.40x push at the
// finder's chest shows y 321..561 and the board lives above y=340, so before H60c
// this camera would have hidden the three lenses it is comparing. The measured
// must-see box holds the shot open instead.
// ─────────────────────────────────────────────────────────────────────────────

const P_CODE = BEATS.map((b) => b.p ?? 0);
// The finder's track, under the name validate-cinematic reads (it looks for
// `b.x ?? N` exactly). It used to be `b.px`, declared on this lesson's own beat
// type — which compiled and ran, and left the camera unreadable to the checker.
const X = BEATS.map((b) => b.x ?? 262);
// H60b: moving is the default. This lesson had no camera at all, on the reasoning
// (in the header below) that the old one was static on every beat — but "it was
// not doing anything" is an argument for a better camera, not for none. Safe to
// add only now that the verdict board reports a must-see box (H60c): a push at the
// finder's chest crops everything above y=321, and the board lives above y=340.
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('ethics2'));
const G_CODE = BEATS.map((b) => (b.g ?? -1));
const GX = BEATS.map((b) => b.gx ?? 108);
const G_ON = BEATS.map((b) => ((b.g ?? -1) >= 0 ? 1 : 0));
const NAMED = BEATS.map((b) => b.named ?? 0);
const LENS = BEATS.map((b) => b.lens ?? 0);

// The wallet sits in the corridor BETWEEN the two figures. The guide stands at
// x 108 and the finder at x 262, and an arm reaches 34 rig units ≈ 46 stage units,
// so x 154…216 is the only strip neither of them can ever sweep. Centring the
// wallet at 190 keeps a 74-wide prop clear of both hands at every gesture.
const WALLET_X = 190;
const STITCH = [8, 21, 34, 47, 60];
const PAVE = [58, 122, 186, 250, 314];

const BOARD_L = 14;
const BOARD_W = 372;
const TITLE_T = 182;
const ROW_H = 44;
const ROW_T = [200, 248, 296];

const LENSES = [
  { n: '1', name: 'OUTCOMES', who: 'MILL · 1863', q: 'Did it make life better?' },
  { n: '2', name: 'DUTY', who: 'KANT · 1785', q: 'Could all follow this rule?' },
  { n: '3', name: 'CHARACTER', who: 'ARISTOTLE', q: 'Who does it make me?' },
];

export default function Ethics2Scene({ clock, bt, bi }: SceneApi) {
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / moveTr(GX[p], GX[n], 0.85));
    const t = clock.value;

    // Finder — gesture blend, small steps.
    const finderS = mixStance(emoteHold(P_CODE[p], t), emoteLive(P_CODE[n], t, bt.value), tr);
    const fx = lerp(X[p], X[n], tr);

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

  // The headline swaps once the third verdict stamps: the board states the setup
  // first, then states the finding. Both sit at the same spot, so it costs no room.
  const titleAsk = useAnimatedStyle(() => ({ opacity: 1 - clamp01(SCENE.value.lens - 2) }));
  const titleAns = useAnimatedStyle(() => ({ opacity: clamp01(SCENE.value.lens - 2) }));

  return (
    <Animated.View style={styles.scene} pointerEvents="none">
      {/* ── the verdict board ─────────────────────────────────────────────── */}
      <Animated.Text style={[styles.boardTitle, titleAsk]}>ONE CHOICE  ·  THREE VERDICTS</Animated.Text>
      <Animated.Text style={[styles.boardTitle, titleAns]}>THREE LENSES  ·  ONE VERDICT</Animated.Text>
      {LENSES.map((L, k) => <LensRow key={L.name} S={SCENE} k={k} />)}

      {/* ── the pavement, and the wallet lying on it ──────────────────────── */}
      <View style={styles.ground} />
      {PAVE.map((x) => <View key={x} style={[styles.pave, { left: x }]} />)}

      <View style={styles.walletShadow} />
      <View style={styles.noteBack} />
      <View style={styles.noteFront} />
      <View style={styles.wallet}>
        {STITCH.map((sx) => <View key={sx} style={[styles.stitch, { left: sx }]} />)}
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
    fontFamily: 'Inter_700Bold', fontSize: 11, lineHeight: 14, letterSpacing: 1.6, color: SOFT,
    includeFontPadding: false,
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
  badgeText: { fontFamily: 'Inter_700Bold', fontSize: 13, lineHeight: 16, color: SOFT, includeFontPadding: false },
  badgeOn: {
    position: 'absolute', left: 12, top: (ROW_H - 26) / 2, width: 26, height: 26, borderRadius: 13,
    backgroundColor: INK, alignItems: 'center', justifyContent: 'center',
  },
  badgeTextOn: { fontFamily: 'Inter_700Bold', fontSize: 13, lineHeight: 16, color: PAPER, includeFontPadding: false },

  nameCol: { position: 'absolute', left: 46, top: 7, width: 102 },
  lensName: {
    fontFamily: 'Inter_700Bold', fontSize: 13.5, lineHeight: 17, letterSpacing: 0.3, color: INK,
    includeFontPadding: false,
  },
  lensWho: {
    fontFamily: 'Inter_700Bold', fontSize: 10.5, lineHeight: 13, letterSpacing: 1, color: SOFT,
    includeFontPadding: false,
  },
  lensQ: {
    position: 'absolute', left: 152, top: 8, width: 116,
    fontFamily: 'Inter_500Medium', fontSize: 11.5, lineHeight: 14.5, color: SOFT, includeFontPadding: false,
  },

  slot: {
    position: 'absolute', left: 274, top: 7, width: 92, height: 30,
    borderWidth: 1.5, borderColor: RULE, borderStyle: 'dashed', borderRadius: 4,
    alignItems: 'center', justifyContent: 'center',
  },
  slotText: { fontFamily: 'Inter_700Bold', fontSize: 16, lineHeight: 20, color: SOFT, includeFontPadding: false },
  stamp: {
    position: 'absolute', left: 274, top: 7, width: 92, height: 30,
    backgroundColor: INK, borderRadius: 4, alignItems: 'center', justifyContent: 'center',
  },
  stampText: {
    fontFamily: 'Inter_700Bold', fontSize: 12.5, lineHeight: 16, letterSpacing: 0.6, color: PAPER,
    includeFontPadding: false,
  },

  // ── the pavement, drawn as slabs rather than one bare rule ────────────────
  pave: { position: 'absolute', top: GROUND + 2, width: 1.5, height: 5, backgroundColor: RULE },

  // ── the wallet: a stitched body with a fold and clasp, two notes and a card ─
  walletShadow: {
    position: 'absolute', left: WALLET_X - 42, top: GROUND - 2, width: 84, height: 5,
    borderRadius: 3, backgroundColor: RULE,
  },
  wallet: {
    position: 'absolute', left: WALLET_X - 37, top: GROUND - 40, width: 74, height: 40, borderRadius: 4,
    borderWidth: 2, borderColor: INK, backgroundColor: PAPER,
  },
  stitch: { position: 'absolute', top: 5, width: 6, height: 1.5, backgroundColor: RULE },
  walletFold: { position: 'absolute', left: 0, right: 0, top: 16, height: 1.5, backgroundColor: SOFT },
  walletClasp: {
    position: 'absolute', left: 28, top: 21, width: 16, height: 10, borderRadius: 2,
    borderWidth: 1.5, borderColor: SOFT,
  },
  noteBack: {
    position: 'absolute', left: WALLET_X - 14, top: GROUND - 54, width: 30, height: 10,
    borderWidth: 1.2, borderColor: RULE, borderRadius: 1.5, backgroundColor: PAPER,
  },
  noteFront: {
    position: 'absolute', left: WALLET_X - 22, top: GROUND - 49, width: 32, height: 11,
    borderWidth: 1.5, borderColor: SOFT, borderRadius: 1.5, backgroundColor: PAPER,
  },
  walletCard: {
    position: 'absolute', left: WALLET_X + 8, top: GROUND - 44, width: 24, height: 15,
    borderWidth: 1.2, borderColor: SOFT, borderRadius: 1.5, backgroundColor: PAPER,
  },
});

// BAND. Measured against every beat, not just the first.
//   top    · the board title at 182 (the row borders start at 198.5, the stamps
//            never scale above 202), so 176 leaves 6 units of air.
//   bottom · the ankle JOINT is a circle of radius STR.limb/2 × K_FIG = 7.4 drawn
//            centred on GROUND, so a planted foot actually inks to 507.4 — lower
//            than the pavement slabs (507), the wallet shadow (503) or the ground
//            rule (501.5). 512 clears the true lowest pixel by 4.6.
// Figures: crown = GROUND − FIG_H × K_FIG ≈ 361, and the highest lift in this
// lesson is the beat-7 shrug (bob +3, live accent +2.5 → crown ~353.6), still
// 13 units below the table's last row at 340. Nothing is clipped, nothing collides.
export function Ethics2Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Ethics2Scene} band={[176, 512]} camera={CAM} />;
}
