import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, emoteHold, emoteLive, lerp, mixStance, pose, type Bundle } from './rig';
import { BEATS } from './aesthetics4Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';

// A gallery that is also a scorecard.
//
// TOP — THREE TESTS FOR ART, pinned up as cards: MIMESIS, EXPRESSION, ARTWORLD.
// Two of them are the old answers; the third arrives with Danto and Dickie. When
// the verdict lands, an ink cross is struck through the two the urinal defeats
// and a tick is drawn on the one that explains it. That row of marks IS the
// lesson, drawn rather than told.
//
// BOTTOM — the readymade on its plinth, signed R. Mutt, with the artworld's ART
// placard conferred on the plinth face.
//
// COMPOSITION / OCCLUSION CONTRACT
//   · Artist at x = 104 (spans ~56–152), viewer at x = 334 (spans ~286–382), both
//     on GROUND = 500 with crowns near y 353. The artist's signing hand reaches
//     the plinth's left edge without ever crossing in front of it.
//   · The plinth column owns x 148–252 — the clear gap between the two figures.
//   · The three cards sit at y 240–310, entirely ABOVE both crowns, so a figure
//     can never cover a verdict.
//   · Nothing is drawn above y 222 or below the ground line: band [214, 508].

const A_X = 104;
const V_X = 334;
const PED_X = 200;

const CARD_W = 118;
const CARD_H = 70;
const CARD_T = 240;
const CARD_L = [14, 141, 268];

const TESTS = [
  { id: 'mimesis', name: 'MIMESIS', sub: 'skilled imitation', pass: false },
  { id: 'express', name: 'EXPRESSION', sub: 'feeling conveyed', pass: false },
  { id: 'world', name: 'ARTWORLD', sub: 'institutions confer', pass: true },
];

const A_CODE = BEATS.map((b) => b.a ?? 0);
const V_CODE = BEATS.map((b) => b.v ?? 0);
const TEST = BEATS.map((b) => b.test ?? 0);
const VERD = BEATS.map((b) => b.verdict ?? 0);
const SIGNED = BEATS.map((b) => b.signed ?? 0);
const ART = BEATS.map((b) => b.art ?? 0);

export default function Aesthetics4Scene({ clock, bt, bi }: SceneApi) {
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.85);
    const t = clock.value;

    const a = mixStance(emoteHold(A_CODE[p], t), emoteLive(A_CODE[n], t, bt.value), tr);
    const v = mixStance(emoteHold(V_CODE[p], t), emoteLive(V_CODE[n], t, bt.value), tr);
    return {
      a: pose(a, A_X, GROUND, K_FIG, 1, 1),
      v: pose(v, V_X, GROUND, K_FIG, -1, 1),
      test: lerp(TEST[p], TEST[n], tr),
      verdict: lerp(VERD[p], VERD[n], tr),
      signed: lerp(SIGNED[p], SIGNED[n], tr),
      art: lerp(ART[p], ART[n], tr),
    };
  });

  const DA = useDerivedValue<Bundle>(() => SCENE.value.a);
  const DV = useDerivedValue<Bundle>(() => SCENE.value.v);

  const titleStyle = useAnimatedStyle(() => ({ opacity: clamp01(SCENE.value.test * 2) }));
  const sigStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.signed }));
  const artStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.art,
    transform: [{ scale: 0.8 + 0.2 * ease01(SCENE.value.art) }],
  }));

  return (
    <Animated.View style={styles.scene}>
      {/* ── the three tests, pinned above the gallery floor ──────────────────── */}
      <Animated.Text style={[styles.title, titleStyle]}>THREE TESTS FOR ART</Animated.Text>
      {TESTS.map((tst, k) => (
        <Card key={tst.id} S={SCENE} k={k} name={tst.name} sub={tst.sub} pass={tst.pass} />
      ))}

      {/* ── the readymade, its plinth and the status conferred on it ─────────── */}
      <View style={styles.readymade} pointerEvents="none">
        <View style={styles.basin} />
      </View>
      <Animated.Text style={[styles.sig, sigStyle]}>R. Mutt 1917</Animated.Text>
      <View style={styles.plinthTop} pointerEvents="none" />
      <View style={styles.plinth} pointerEvents="none" />
      <Animated.View style={[styles.placard, artStyle]} pointerEvents="none">
        <Text style={styles.placardT}>ART</Text>
        <Text style={styles.placardS}>CONFERRED</Text>
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DA} k={K_FIG} />
      <Stickman D={DV} k={K_FIG} />
    </Animated.View>
  );
}

/**
 * One theory card. It fades up when its beat pins it to the wall, then takes its
 * mark: a struck cross if Fountain defeats it, a drawn tick if it survives.
 */
function Card({
  S, k, name, sub, pass,
}: { S: SharedValue<any>; k: number; name: string; sub: string; pass: boolean }) {
  const wrap = useAnimatedStyle(() => {
    const on = ease01(clamp01(S.value.test - k));
    // Once the verdict is in, the failing tests recede and the surviving one stays
    // full strength — the row reads as an answer, not three equal options.
    const fade = pass ? 1 : 1 - 0.42 * ease01(S.value.verdict);
    return { opacity: on * fade, transform: [{ translateY: (1 - on) * -8 }] };
  });
  const box = useAnimatedStyle(() => ({
    borderColor: pass && S.value.verdict > 0.5 ? INK : SOFT,
  }));
  const mark = useAnimatedStyle(() => {
    const on = ease01(clamp01(S.value.verdict * 1.6 - k * 0.28));
    return { opacity: on, transform: [{ scale: 0.55 + 0.45 * on }] };
  });
  return (
    <Animated.View style={[styles.cardWrap, { left: CARD_L[k] }, wrap]} pointerEvents="none">
      <Animated.View style={[styles.card, box]}>
        <Text style={styles.cardName}>{name}</Text>
        <Text style={styles.cardSub}>{sub}</Text>
        <Animated.View style={[styles.mark, mark]}>
          {pass ? (
            <>
              <View style={styles.tickShort} />
              <View style={styles.tickLong} />
            </>
          ) : (
            <>
              <View style={[styles.crossBar, { transform: [{ rotate: '45deg' }] }]} />
              <View style={[styles.crossBar, { transform: [{ rotate: '-45deg' }] }]} />
            </>
          )}
        </Animated.View>
      </Animated.View>
    </Animated.View>
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
  cardWrap: { position: 'absolute', top: CARD_T, width: CARD_W, height: CARD_H },
  card: {
    width: CARD_W, height: CARD_H,
    borderWidth: 2, borderColor: SOFT, borderRadius: 5, backgroundColor: PAPER,
  },
  cardName: {
    position: 'absolute', left: 0, top: 8, width: CARD_W - 4, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 12.5, letterSpacing: 0.8, color: INK,
    includeFontPadding: false,
  },
  cardSub: {
    position: 'absolute', left: 0, top: 25, width: CARD_W - 4, textAlign: 'center',
    fontFamily: 'Inter_400Regular', fontSize: 8.5, letterSpacing: 0.3, color: SOFT,
    includeFontPadding: false,
  },
  mark: {
    position: 'absolute', left: (CARD_W - 4) / 2 - 13, top: 38, width: 26, height: 26,
    alignItems: 'center', justifyContent: 'center',
  },
  crossBar: { position: 'absolute', width: 26, height: 3.5, backgroundColor: INK, borderRadius: 2 },
  // Two strokes anchored end-to-end: a short down-right, then a long up-right.
  tickShort: {
    position: 'absolute', left: 3, top: 12, width: 12, height: 3.5,
    backgroundColor: INK, borderRadius: 2, transformOrigin: '0% 50%',
    transform: [{ rotate: '45deg' }],
  },
  tickLong: {
    position: 'absolute', left: 11.5, top: 20.5, width: 20, height: 3.5,
    backgroundColor: INK, borderRadius: 2, transformOrigin: '0% 50%',
    transform: [{ rotate: '-50deg' }],
  },

  readymade: {
    position: 'absolute', left: PED_X - 42, top: 316, width: 84, height: 64,
    borderWidth: 2.5, borderColor: INK, backgroundColor: PAPER,
    borderTopLeftRadius: 42, borderTopRightRadius: 42,
    borderBottomLeftRadius: 10, borderBottomRightRadius: 10,
    alignItems: 'center',
  },
  basin: {
    marginTop: 12, width: 46, height: 26, borderRadius: 13,
    borderWidth: 1.5, borderColor: SOFT, backgroundColor: PAPER,
  },
  sig: {
    position: 'absolute', left: PED_X - 42, top: 360, width: 84, textAlign: 'center',
    fontFamily: 'Inter_500Medium', fontStyle: 'italic', fontSize: 10, color: INK,
    includeFontPadding: false,
  },
  plinthTop: {
    position: 'absolute', left: PED_X - 52, top: 380, width: 104, height: 12,
    borderWidth: 2.5, borderColor: INK, backgroundColor: PAPER,
  },
  plinth: {
    position: 'absolute', left: PED_X - 40, top: 392, width: 80, height: GROUND - 392,
    borderWidth: 2.5, borderColor: INK, backgroundColor: PAPER,
  },
  placard: {
    position: 'absolute', left: PED_X - 34, top: 424, width: 68, height: 34,
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: INK,
    alignItems: 'center', justifyContent: 'center',
  },
  placardT: { fontFamily: 'Inter_700Bold', fontSize: 13, letterSpacing: 2.4, color: PAPER, includeFontPadding: false },
  placardS: { fontFamily: 'Inter_500Medium', fontSize: 7, letterSpacing: 1.2, color: RULE, marginTop: 2, includeFontPadding: false },
});

// Art runs from the pinned title at y 222 to the ground line at y 501.5 — every
// card, the plinth and both figures live inside that slice, so the player crops
// to it and renders the scene ~2.2× instead of the letterboxed 1.15×.
export function Aesthetics4Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Aesthetics4Scene} band={[214, 508]} />;
}
