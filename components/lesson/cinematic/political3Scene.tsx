import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, emoteHold, emoteLive, lerp, mixStance, pose, type Bundle } from './rig';
import { BEATS } from './political3Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';

// The right to rule, drawn as a CIRCUIT and a COMPARISON.
//
// MIDDLE — the circuit. A scroll of consent travels the top arrow from the ruled
// to the ruler; protected rights flow back along the bottom one. On the Locke
// beat the whole exchange is stamped HELD IN TRUST, struck on at an angle like a
// clerk's seal — the single idea the lesson turns on.
//
// TOP — the comparison, two panels either side of a VS divider. It first holds
// POWER (makes you obey) against LEGITIMACY (makes you owe), then swaps to
// Rousseau's split: the WILL OF ALL drawn as arrows pulling every which way, the
// GENERAL WILL as the same arrows in rank.
//
// COMPOSITION / OCCLUSION CONTRACT
//   · Subject at x = 66 (spans ~18–114), ruler at x = 334 (spans ~286–382), both
//     on GROUND = 500 with crowns near y 353.
//   · Every circuit part lives in the corridor x 122–278 between them, and every
//     panel sits at y 240–322, above both crowns.
//   · The ruler's crown is the one prop that sits over a figure, at y 326–346 —
//     deliberately, and still 7 units clear of the head.
//   · Nothing is drawn above y 222 or below the ground line: band [214, 508].

const SUB_X = 66;
const R_X = 334;

const BOX_W = 172;
const BOX_H = 82;
const BOX_T = 240;
const BOX_L = [14, 214];

const COR_L = 122;                 // the corridor between the two figures
const COR_W = 156;
const UP_Y = 389;                  // the consent arrow
const DOWN_Y = 458;                // the protection arrow
const SCROLL_W = 32;

// Mode 1 sets power against legitimacy; mode 2 is Rousseau's split. The panels
// keep their geometry and swap only their words, so nothing ever reflows.
interface Panel {
  title: string;
  left: { name: string; sub: string };
  right: { name: string; sub: string };
}
const PANELS: (Panel | null)[] = [
  null,
  {
    title: 'TWO DIFFERENT THINGS',
    left: { name: 'POWER', sub: 'makes you obey' },
    right: { name: 'LEGITIMACY', sub: 'makes you owe' },
  },
  {
    title: 'ROUSSEAU SPLITS THEM',
    left: { name: 'WILL OF ALL', sub: 'the sum of private wants' },
    right: { name: 'GENERAL WILL', sub: 'what serves everyone' },
  },
];

// Six arrows per panel: scattered on the left (private wants pulling apart),
// in rank on the right (one direction that serves the whole).
const SCATTER = ['-38deg', '22deg', '-12deg', '44deg', '-55deg', '14deg'];
const ALIGNED = ['0deg', '0deg', '0deg', '0deg', '0deg', '0deg'];

const SUB_CODE = BEATS.map((b) => b.sub ?? 0);
const R_CODE = BEATS.map((b) => b.r ?? 0);
const SCROLL = BEATS.map((b) => b.scroll ?? 0);
const FLOW = BEATS.map((b) => b.flow ?? 0);
const SEAL = BEATS.map((b) => b.seal ?? 0);
const PAIR_ON = BEATS.map((b) => ((b.pair ?? 0) > 0 ? 1 : 0));
// A beat that shows no panel still remembers the last one, so the fade-OUT keeps
// the words it was showing instead of blanking mid-transition.
const PAIR_MODE = (() => {
  let last = 1;
  return BEATS.map((b) => {
    if ((b.pair ?? 0) > 0) last = b.pair as number;
    return last;
  });
})();

export default function Political3Scene({ clock, bt, bi, i }: SceneApi) {
  const mode = PAIR_MODE[i];
  const panel = PANELS[mode] ?? PANELS[1]!;
  const rots = mode === 2 ? SCATTER : null;

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.85);
    const t = clock.value;

    const sub = mixStance(emoteHold(SUB_CODE[p], t), emoteLive(SUB_CODE[n], t, bt.value), tr);
    const r = mixStance(emoteHold(R_CODE[p], t), emoteLive(R_CODE[n], t, bt.value), tr);
    const scroll = lerp(SCROLL[p], SCROLL[n], tr);
    return {
      sub: pose(sub, SUB_X, GROUND, K_FIG, 1, 1),
      ruler: pose(r, R_X, GROUND, K_FIG, -1, 1),
      scroll,
      flow: lerp(FLOW[p], FLOW[n], tr),
      seal: lerp(SEAL[p], SEAL[n], tr),
      pair: lerp(PAIR_ON[p], PAIR_ON[n], tr),
      t,
    };
  });

  const DS = useDerivedValue<Bundle>(() => SCENE.value.sub);
  const DR = useDerivedValue<Bundle>(() => SCENE.value.ruler);

  const flowStyle = useAnimatedStyle(() => ({ opacity: clamp01(SCENE.value.flow * 1.6) }));
  const scrollStyle = useAnimatedStyle(() => ({
    opacity: clamp01(SCENE.value.flow * 1.6),
    transform: [{ translateX: lerp(0, COR_W - SCROLL_W - 18, SCENE.value.scroll) }],
  }));
  // The seal lands like a stamp: oversized, then driven down onto the page.
  const sealStyle = useAnimatedStyle(() => {
    const u = ease01(SCENE.value.seal);
    return { opacity: clamp01(SCENE.value.seal * 2), transform: [{ rotate: '-5deg' }, { scale: 1 + 0.55 * (1 - u) }] };
  });
  const pairStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.pair,
    transform: [{ translateY: (1 - SCENE.value.pair) * -8 }],
  }));

  return (
    <Animated.View style={styles.scene}>
      {/* ── the comparison panels ────────────────────────────────────────────── */}
      <Animated.View style={[StyleSheet.absoluteFill, pairStyle]} pointerEvents="none">
        <Text style={styles.title}>{panel.title}</Text>

        <View style={[styles.box, { left: BOX_L[0] }]}>
          <Text style={styles.boxName}>{panel.left.name}</Text>
          <Text style={styles.boxSub}>{panel.left.sub}</Text>
          {rots ? <ArrowRow rots={SCATTER} /> : null}
        </View>

        <View style={[styles.box, { left: BOX_L[1] }]}>
          <Text style={styles.boxName}>{panel.right.name}</Text>
          <Text style={styles.boxSub}>{panel.right.sub}</Text>
          {rots ? <ArrowRow rots={ALIGNED} /> : null}
        </View>

        <View style={styles.divider} />
        <View style={styles.chip}><Text style={styles.chipText}>VS</Text></View>
      </Animated.View>

      {/* ── the crown, riding above the ruler ────────────────────────────────── */}
      <View style={styles.crown} pointerEvents="none">
        <View style={[styles.crownPt, { left: 1 }]} />
        <View style={[styles.crownPt, { left: 14 }]} />
        <View style={[styles.crownPt, { left: 27 }]} />
        <View style={styles.crownBand} />
      </View>

      {/* ── the circuit: consent up, protected rights back down ──────────────── */}
      <Animated.View style={[StyleSheet.absoluteFill, flowStyle]} pointerEvents="none">
        <Text style={styles.upLabel}>CONSENT</Text>
        <View style={styles.upShaft} />
        <View style={styles.upHead} />
        <View style={styles.downShaft} />
        <View style={styles.downHead} />
        <Text style={styles.downLabel}>RIGHTS PROTECTED</Text>
      </Animated.View>

      {/* the scroll of consent, travelling the top arrow */}
      <Animated.View style={[styles.scroll, scrollStyle]} pointerEvents="none">
        <View style={styles.scrollBody} />
        <View style={[styles.scrollCap, { left: -2 }]} />
        <View style={[styles.scrollCap, { right: -2 }]} />
      </Animated.View>

      {/* the stamp Locke's whole argument hangs on */}
      <Animated.View style={[styles.seal, sealStyle]} pointerEvents="none">
        <Text style={styles.sealText}>HELD IN TRUST</Text>
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DS} k={K_FIG} />
      <Stickman D={DR} k={K_FIG} />
    </Animated.View>
  );
}

/** Six little arrows — scattered for the will of all, in rank for the general will. */
function ArrowRow({ rots }: { rots: string[] }) {
  return (
    <View style={styles.arrowRow} pointerEvents="none">
      {rots.map((rot, k) => (
        <View key={k} style={[styles.arrow, { left: k * 25, transform: [{ rotate: rot }] }]}>
          <View style={styles.arrowShaft} />
          <View style={styles.arrowHead} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 16, right: 16, top: GROUND, height: 1.5, backgroundColor: RULE },

  title: {
    position: 'absolute', left: 0, top: 222, width: STAGE_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 10, lineHeight: 13, letterSpacing: 1.6, color: SOFT,
    includeFontPadding: false,
  },
  box: {
    position: 'absolute', top: BOX_T, width: BOX_W, height: BOX_H,
    borderWidth: 2, borderColor: INK, borderRadius: 5, backgroundColor: PAPER,
  },
  boxName: {
    position: 'absolute', left: 0, top: 9, width: BOX_W - 4, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 13.5, letterSpacing: 0.8, color: INK,
    includeFontPadding: false,
  },
  boxSub: {
    position: 'absolute', left: 8, top: 29, width: BOX_W - 20, textAlign: 'center',
    fontFamily: 'Inter_400Regular', fontSize: 9.5, lineHeight: 12.5, letterSpacing: 0.2, color: SOFT,
    includeFontPadding: false,
  },
  divider: { position: 'absolute', left: 199.25, top: 250, width: 1.5, height: 62, backgroundColor: RULE },
  chip: {
    position: 'absolute', left: 187, top: 272, width: 26, height: 18, borderRadius: 3,
    borderWidth: 1.5, borderColor: SOFT, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  chipText: { fontFamily: 'Inter_700Bold', fontSize: 8.5, letterSpacing: 1, color: SOFT, includeFontPadding: false },

  arrowRow: { position: 'absolute', left: 9, top: 56, width: BOX_W - 22, height: 18 },
  arrow: { position: 'absolute', top: 3, width: 21, height: 12 },
  arrowShaft: { position: 'absolute', left: 0, top: 4.75, width: 13, height: 2.5, backgroundColor: INK },
  arrowHead: {
    position: 'absolute', left: 12, top: 0.5, width: 0, height: 0,
    borderTopWidth: 5.5, borderBottomWidth: 5.5, borderLeftWidth: 9,
    borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: INK,
  },

  crown: { position: 'absolute', left: R_X - 18, top: 326, width: 36, height: 20 },
  crownPt: {
    position: 'absolute', top: 0, width: 0, height: 0,
    borderLeftWidth: 4, borderRightWidth: 4, borderBottomWidth: 10,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: INK,
  },
  crownBand: { position: 'absolute', top: 10, width: 36, height: 8, backgroundColor: INK, borderRadius: 2 },

  upLabel: {
    position: 'absolute', left: COR_L, top: 362, width: COR_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 10, lineHeight: 13, letterSpacing: 1.6, color: INK,
    includeFontPadding: false,
  },
  upShaft: { position: 'absolute', left: COR_L, top: UP_Y, width: COR_W - 10, height: 2.5, backgroundColor: INK },
  upHead: {
    position: 'absolute', left: COR_L + COR_W - 11, top: UP_Y - 4.75, width: 0, height: 0,
    borderTopWidth: 6, borderBottomWidth: 6, borderLeftWidth: 11,
    borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: INK,
  },
  downShaft: { position: 'absolute', left: COR_L + 10, top: DOWN_Y, width: COR_W - 10, height: 2.5, backgroundColor: SOFT },
  downHead: {
    position: 'absolute', left: COR_L, top: DOWN_Y - 4.75, width: 0, height: 0,
    borderTopWidth: 6, borderBottomWidth: 6, borderRightWidth: 11,
    borderTopColor: 'transparent', borderBottomColor: 'transparent', borderRightColor: SOFT,
  },
  downLabel: {
    position: 'absolute', left: COR_L, top: 468, width: COR_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 10, lineHeight: 13, letterSpacing: 1.6, color: SOFT,
    includeFontPadding: false,
  },

  scroll: { position: 'absolute', left: COR_L + 4, top: UP_Y - 5, width: SCROLL_W, height: 13 },
  scrollBody: { position: 'absolute', left: 4, width: SCROLL_W - 8, height: 13, backgroundColor: PAPER, borderWidth: 1.5, borderColor: INK, borderRadius: 2 },
  scrollCap: { position: 'absolute', top: -1.5, width: 6, height: 16, borderRadius: 3, borderWidth: 1.5, borderColor: INK, backgroundColor: PAPER },

  seal: {
    position: 'absolute', left: 148, top: 406, width: 104, height: 38,
    borderWidth: 2.5, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  sealText: { fontFamily: 'Inter_700Bold', fontSize: 11.5, letterSpacing: 1, color: INK, includeFontPadding: false },
});

// Art runs from the panel title at y 222 to the ground line at y 501.5 — the
// stamp, both arrows, the crown and both figures all sit inside that slice, so
// the player crops to it and renders ~2.2× instead of the letterboxed 1.15×.
export function Political3Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Political3Scene} band={[214, 508]} />;
}
