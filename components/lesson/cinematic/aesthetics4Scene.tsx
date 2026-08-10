import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, lerp, mixStance, pose, type Bundle } from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './aesthetics4Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import { followMoves, kindOf, seedOf } from './camera';

// A gallery that is also a scorecard.
//
// TOP — one pinned slot that changes its mind. On the hook it holds a single wide
// wall card asking IS THIS ART?; from the second beat that card is taken down and
// THREE TESTS FOR ART are pinned in its place: MIMESIS, EXPRESSION, ARTWORLD. Two
// of them are the old answers; the third arrives with Danto and Dickie. When the
// verdict lands, an ink cross is struck through the two the urinal defeats and a
// tick is drawn on the one that explains it. That row of marks IS the lesson,
// drawn rather than told — and the slot is never empty, so the hook beat no longer
// opens on a blank upper third.
//
// BOTTOM — the readymade on its plinth, signed R. Mutt, with the artworld's ART
// placard conferred on the plinth face. The fixture is drawn 96 units across so
// the object the whole lesson argues about reads at a glance.
//
// COMPOSITION / OCCLUSION CONTRACT
//   · Artist at x = 104 (spans ~56–152), viewer at x = 334 (spans ~286–382), both
//     on GROUND = 500 with crowns near y 361. The artist's signing hand reaches
//     the plinth's left edge without ever crossing in front of it.
//   · The plinth column owns x 142–258 — the clear gap between the two figures.
//   · The pinned slot sits at y 232–310 (tack included), entirely ABOVE both
//     crowns, so a figure can never cover a verdict, and 6 units clear of the
//     readymade's top edge at 316.
//   · Nothing is drawn above y 224 or below the ankle joints at y ≈ 507.4, hence
//     band [214, 512].

const A_X = 104;
const V_X = 334;
const PED_X = 200;

const CARD_W = 122;
const CARD_H = 70;
const CARD_T = 240;
const CARD_L = [14, 141, 268];
/** Headroom above each card for its tack, so nothing is drawn outside the wrapper. */
const TACK_H = 8;

/** The hook's wall card fills the same slot the three test cards will take. */
const ASK_L = 62;
const ASK_W = 276;

const TESTS = [
  { id: 'mimesis', name: 'MIMESIS', sub: 'skilled imitation', pass: false },
  { id: 'express', name: 'EXPRESSION', sub: 'feeling conveyed', pass: false },
  { id: 'world', name: 'ARTWORLD', sub: 'institutions confer', pass: true },
];

const A_CODE = BEATS.map((b) => b.a ?? 0);
const V_CODE = BEATS.map((b) => b.v ?? 0);
const ASK = BEATS.map((b) => b.ask ?? 0);
const TEST = BEATS.map((b) => b.test ?? 0);
const VERD = BEATS.map((b) => b.verdict ?? 0);
const SIGNED = BEATS.map((b) => b.signed ?? 0);
const ART = BEATS.map((b) => b.art ?? 0);

// THE CAMERA (H60b). `followMoves` reads the x track and gives each beat its own
// shot: it FOLLOWS the subject when a beat moves far enough to be worth following,
// pushes close on a quote, and PULLS BACK to the whole band on a question or a
// summary — the beats the reader has to read and act on.
// Two figures at 104 and 334, so the track is the point BETWEEN them (219) — following
// either one alone would frame the other out, and here the pair is the subject.
const X = BEATS.map((b) => b.x ?? 219);
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('aesthetics4'));

export default function Aesthetics4Scene({ clock, bt, bi }: SceneApi) {
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.85);
    const t = clock.value;

    const a = mixStance(emoteHold(A_CODE[p], t), emoteLive(A_CODE[n], t, bt.value), tr);
    const v = mixStance(emoteHold(V_CODE[p], t), emoteLive(V_CODE[n], t, bt.value), tr);
    // ONE SLOT, TWO OCCUPANTS. The question card and the row of tests share the
    // pinned strip, so they hand over in stages rather than cross-fading: the card
    // is off the wall by 45% of the transition and the tests go up from 55%. A
    // straight cross-fade left both sitting at half opacity on top of each other,
    // which on a phone reads as a smudge.
    const ask = lerp(ASK[p], ASK[n], tr);
    return {
      a: pose(a, A_X, GROUND, K_FIG, 1, 1),
      v: pose(v, V_X, GROUND, K_FIG, -1, 1),
      test: lerp(TEST[p], TEST[n], tr),
      verdict: lerp(VERD[p], VERD[n], tr),
      signed: lerp(SIGNED[p], SIGNED[n], tr),
      art: lerp(ART[p], ART[n], tr),
      askOn: ease01(clamp01((ask - 0.55) / 0.45)),
      testsOn: ease01(clamp01((1 - ask - 0.55) / 0.45)),
    };
  });

  const DA = useDerivedValue<Bundle>(() => SCENE.value.a);
  const DV = useDerivedValue<Bundle>(() => SCENE.value.v);

  const titleStyle = useAnimatedStyle(() => ({
    opacity: clamp01(SCENE.value.test * 2) * SCENE.value.testsOn,
  }));
  const askStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.askOn,
    transform: [{ translateY: (1 - SCENE.value.askOn) * -8 }],
  }));
  const sigStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.signed }));
  const artStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.art,
    transform: [{ scale: 0.8 + 0.2 * ease01(SCENE.value.art) }],
  }));

  return (
    <Animated.View style={styles.scene}>
      {/* ── the hook's question, pinned in the slot the tests will take ──────── */}
      <Animated.View style={[styles.askWrap, askStyle]} pointerEvents="none">
        <View style={[styles.tack, { left: 44 }]} />
        <View style={[styles.tack, { left: ASK_W - 55 }]} />
        <View style={styles.askCard}>
          <Text style={styles.askText} numberOfLines={1}>IS THIS ART?</Text>
          <Text style={styles.askSub} numberOfLines={1}>NOT CARVED · NOT PAINTED · CHOSEN</Text>
        </View>
      </Animated.View>

      {/* ── the three tests, pinned above the gallery floor ──────────────────── */}
      <Animated.Text style={[styles.title, titleStyle]}>THREE TESTS FOR ART</Animated.Text>
      {TESTS.map((tst, k) => (
        <Card key={tst.id} S={SCENE} k={k} name={tst.name} sub={tst.sub} pass={tst.pass} />
      ))}

      {/* ── the readymade, its plinth and the status conferred on it ─────────── */}
      <View style={styles.readymade} pointerEvents="none">
        <View style={styles.rim} />
        <View style={styles.drain} />
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
    return { opacity: on * fade * S.value.testsOn, transform: [{ translateY: (1 - on) * -8 }] };
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
      <View style={styles.tack} />
      <Animated.View style={[styles.card, box]}>
        <Text style={styles.cardName}>{name}</Text>
        <Text style={styles.cardSub} numberOfLines={1}>{sub}</Text>
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
    position: 'absolute', left: 0, top: 224, width: STAGE_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 10.5, lineHeight: 13, letterSpacing: 1.6, color: SOFT,
    includeFontPadding: false,
  },
  // The wrapper carries TACK_H of headroom so the pin is drawn INSIDE its bounds —
  // a child at a negative top can be clipped on Android.
  cardWrap: { position: 'absolute', top: CARD_T - TACK_H, width: CARD_W, height: CARD_H + TACK_H },

  // ── the hook's wall card: the exact slot the three tests take over ──────────
  askWrap: { position: 'absolute', left: ASK_L, top: CARD_T - TACK_H, width: ASK_W, height: CARD_H + TACK_H },
  askCard: {
    position: 'absolute', left: 0, top: TACK_H, width: ASK_W, height: CARD_H,
    borderWidth: 2.5, borderColor: INK, borderRadius: 5, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  askText: {
    fontFamily: 'Inter_700Bold', fontSize: 26, lineHeight: 31, letterSpacing: 2, color: INK,
    includeFontPadding: false,
  },
  askSub: {
    marginTop: 6,
    fontFamily: 'Inter_700Bold', fontSize: 10, lineHeight: 12.5, letterSpacing: 0.8, color: SOFT,
    includeFontPadding: false,
  },
  tack: {
    position: 'absolute', left: CARD_W / 2 - 5.5, top: 2, width: 11, height: 11,
    borderRadius: 5.5, borderWidth: 2.5, borderColor: INK, backgroundColor: PAPER,
  },
  card: {
    position: 'absolute', left: 0, top: TACK_H, width: CARD_W, height: CARD_H,
    borderWidth: 2, borderColor: SOFT, borderRadius: 5, backgroundColor: PAPER,
  },
  cardName: {
    position: 'absolute', left: 0, top: 7, width: CARD_W - 4, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 13.5, lineHeight: 17, letterSpacing: 0.8, color: INK,
    includeFontPadding: false,
  },
  cardSub: {
    position: 'absolute', left: 0, top: 26, width: CARD_W - 4, textAlign: 'center',
    fontFamily: 'Inter_400Regular', fontSize: 9.5, lineHeight: 12, letterSpacing: 0.2, color: SOFT,
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

  // The readymade itself: outer silhouette, the bowl's inner lip drawn as a second
  // outline, and the drain — three strokes, so it reads as a fixture rather than a
  // rounded blob.
  readymade: {
    position: 'absolute', left: PED_X - 48, top: 316, width: 96, height: 72,
    borderWidth: 2.5, borderColor: INK, backgroundColor: PAPER,
    borderTopLeftRadius: 48, borderTopRightRadius: 48,
    borderBottomLeftRadius: 11, borderBottomRightRadius: 11,
  },
  rim: {
    position: 'absolute', left: 9, top: 6, width: 78, height: 48,
    borderWidth: 1.5, borderColor: SOFT,
    borderTopLeftRadius: 39, borderTopRightRadius: 39,
    borderBottomLeftRadius: 9, borderBottomRightRadius: 9,
  },
  drain: {
    position: 'absolute', left: 37, top: 26, width: 22, height: 12, borderRadius: 6,
    borderWidth: 1.5, borderColor: SOFT,
  },
  // Sits clear BELOW the bowl's inner lip (which ends at y 370), so the scrawl and
  // the rim stroke never cross each other.
  sig: {
    position: 'absolute', left: PED_X - 48, top: 370, width: 96, textAlign: 'center',
    fontFamily: 'Inter_500Medium', fontStyle: 'italic', fontSize: 11, lineHeight: 14, color: INK,
    includeFontPadding: false,
  },
  plinthTop: {
    position: 'absolute', left: PED_X - 58, top: 388, width: 116, height: 13,
    borderWidth: 2.5, borderColor: INK, backgroundColor: PAPER,
  },
  plinth: {
    position: 'absolute', left: PED_X - 44, top: 401, width: 88, height: GROUND - 401,
    borderWidth: 2.5, borderColor: INK, backgroundColor: PAPER,
  },
  placard: {
    position: 'absolute', left: PED_X - 38, top: 428, width: 76, height: 44,
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: INK,
    alignItems: 'center', justifyContent: 'center',
  },
  placardT: {
    fontFamily: 'Inter_700Bold', fontSize: 16, lineHeight: 19, letterSpacing: 2.4, color: PAPER,
    includeFontPadding: false,
  },
  placardS: {
    fontFamily: 'Inter_500Medium', fontSize: 9, lineHeight: 11, letterSpacing: 0.8, color: RULE,
    marginTop: 2, includeFontPadding: false,
  },
});

// MEASURED BAND, top and bottom.
//   TOP    the pinned title at y 224 (the tacks on the cards and on the hook's wall
//          card both start at 234). Nothing on any beat is drawn higher.
//   BOTTOM the plinth reaches the ground line at 501.5, but the true extreme is the
//          ankle JOINTS: circles of radius STR.limb·K_FIG/2 = 7.43 centred exactly
//          on GROUND, so ink reaches y = 507.4. The ART placard bottoms out at 472.
// [214, 512] therefore holds every card, the plinth and both figures on every beat
// with 10 units of margin at the top and 4.6 at the foot, and renders the scene
// ~2.17× instead of the letterboxed 1.15×.
export function Aesthetics4Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Aesthetics4Scene} band={[214, 512]} camera={CAM} />;
}
