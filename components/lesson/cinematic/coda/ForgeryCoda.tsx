// ─────────────────────────────────────────────────────────────────────────────
// THE CLOSING ENCOUNTER FOR `aesthetics-aesthetics-13`, "Why a Perfect Fake Still
// Bothers Us".
//
// MECHANIC: THE READER HANDS HIM SOMETHING. A dealer has two canvases and swears
// both are the real one. Two things lie on the ground — a magnifying glass and a
// folded provenance. Drag one into his hand and he uses it, and what he finds out is
// the answer.
//
// WHY GIVING RATHER THAN CHOOSING. The lesson's point is that the difference between
// the original and a perfect copy is not IN the paint, so an answer that can be
// reached by looking harder at the picture is the wrong shape. Handing him the glass
// has to FAIL, visibly, and it has to fail for the right reason — he looks as hard as
// anyone could and there is genuinely nothing there. That is a better teacher than
// being told, and it is why the wrong answer is worth playing out in full.
//
// IT IS THE FUNNY ONE OF THE FOUR. The dealer is delighted when the glass comes out
// and deflates when the paperwork does.
// ─────────────────────────────────────────────────────────────────────────────
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing, useAnimatedReaction, useAnimatedStyle, useDerivedValue, useSharedValue, withTiming,
} from 'react-native-reanimated';
import { GROUND, INK, K_FIG, PAPER, SHADE, SOFT, STONE } from '../cinematicKit';
import { clamp01, ease01, lerp, mixStance, pose, strideStance, WALK, type Bundle } from '../rig';
import { emoteAny, emoteAnyLive } from '../moves';
import {
  type CodaWindow,
  CodaFigure, CodaFloor, CodaLand, CodaLine, CodaStage, CodaTouch, codaX, useCodaRun,
} from './codaKit';
import type { CodaProps } from './types';

const ME_X = 108;
const DEALER_X = 330;
/** The two canvases, between them, so neither figure stands in front of one. */
const ART_L = 172;
const ART_R = 238;
/** Where the two objects lie — ON the ground, by his feet, not in the floor band. */
const GLASS = { x: 70, y: GROUND - 6 };
const PAPERS = { x: 166, y: GROUND - 6 };
/** How close the reader is. The pair span 108…320, so the sides can be cropped. */
const WIN: CodaWindow = [30, 322, 380, 540];

const POSE_STAND = 25;
const POSE_PEER = 34;       // shield the eyes — squinting at the canvas
const POSE_SHRUG = 8;
const POSE_POINT = 35;      // proclaim — he has found it and is saying so
const POSE_GRIN = 28;       // power pose — the dealer, delighted
const POSE_DEFLATE = 46;    // slump — the dealer, not delighted

type Given = 'glass' | 'papers' | null;

export default function ForgeryCoda({ onDone }: CodaProps) {
  const { t, phase, tries, resolve, again } = useCodaRun(1800);
  const [given, setGiven] = useState<Given>(null);
  /** Which object the finger has hold of, and where it is. */
  const held = useSharedValue(0);          // 0 none, 1 glass, 2 papers
  const gx = useSharedValue(0);
  const gy = useSharedValue(0);
  const marked = useSharedValue(0);        // the ring that lands on the real one

  const take = useCallback((what: Given) => {
    setGiven(what);
    if (what === 'papers') marked.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.back(1.6)) });
    resolve(what === 'papers', what === 'papers' ? 2800 : 2600);
  }, [resolve, marked]);

  /** The finger, 0…1 of the surface. */
  const u = useSharedValue(-1);
  const v = useSharedValue(-1);
  const picking = useSharedValue(0);
  picking.value = phase === 'ask' ? 1 : 0;

  // WHICHEVER OBJECT THE FINGER WENT DOWN NEAREST IS THE ONE IT IS CARRYING, and it
  // is decided once, on the first frame of the drag, rather than every frame — a
  // nearest-object test re-run mid-drag swaps the thing in your hand as you pass the
  // other one.
  useAnimatedReaction(() => (picking.value ? u.value : -1), (uu) => {
    'worklet';
    if (uu < 0) { held.value = 0; return; }
    const px = codaX(uu, WIN);
    const py = GROUND + 16 + (v.value - 0.5) * 220;
    if (held.value === 0) {
      held.value = Math.abs(px - GLASS.x) < Math.abs(px - PAPERS.x) ? 1 : 2;
    }
    gx.value = px;
    gy.value = py;
  });

  const drop = useCallback(() => {
    // HIS HAND IS A GENEROUS TARGET: the reader is making a decision, not
    // demonstrating dexterity. Anywhere on his half of the stage counts as giving.
    const near = gx.value > ME_X - 70 && gx.value < ME_X + 96 && gy.value < GROUND + 10;
    const which = held.value;
    if (near && which) {
      gx.value = withTiming(ME_X + 22, { duration: 220 });
      gy.value = withTiming(GROUND - 58, { duration: 220 });
      take(which === 1 ? 'glass' : 'papers');
    } else {
      const home = which === 1 ? GLASS : PAPERS;
      gx.value = withTiming(home.x, { duration: 280, easing: Easing.out(Easing.cubic) });
      gy.value = withTiming(home.y, { duration: 280, easing: Easing.out(Easing.cubic) });
      held.value = 0;
      u.value = -1;
    }
  }, [gx, gy, held, u, take]);

  // ── HIM ───────────────────────────────────────────────────────────────────
  const ME = useDerivedValue<Bundle>(() => {
    const now = t.value;
    const code = phase === 'arrive' ? POSE_STAND
      : phase === 'play' && given === 'glass' ? (now > 1.5 ? POSE_SHRUG : POSE_PEER)
        : phase === 'play' && given === 'papers' ? (now > 1.4 ? POSE_POINT : POSE_PEER)
          : phase === 'again' ? POSE_SHRUG
            : phase === 'land' ? POSE_POINT
              : POSE_STAND;
    const hold = emoteAny(code, now + 3);
    const lv = emoteAnyLive(code, now + 3, now);
    const tr = phase === 'arrive' ? ease01(Math.min(now / 1.4, 1)) : 1;
    // On `play` he walks up to the canvases to use whatever he was handed, and comes
    // back if it was no use — the consequence is a JOURNEY rather than a caption.
    const up = phase === 'play' ? clamp01((now - 0.25) / 0.9) : phase === 'land' ? 1 : 0;
    const backOff = phase === 'play' && given === 'glass' ? clamp01((now - 1.7) / 0.8) : 0;
    const walkX = lerp(ME_X, 166, up) - (166 - ME_X) * backOff;
    const s = phase === 'arrive'
      ? strideStance(-36, ME_X, mixStance(hold, lv, 0.5), tr, WALK)
      : phase === 'play'
        ? strideStance(ME_X, 166, mixStance(hold, lv, 0.5), up - backOff, WALK)
        : mixStance(hold, lv, 0.6);
    const px = phase === 'arrive' ? lerp(-36, ME_X, tr) : walkX;
    const dir = backOff > 0.05 ? -1 : 1;
    return pose(s, px, GROUND, K_FIG, dir, 1);
  }, [phase, given]);

  const DEALER = useDerivedValue<Bundle>(() => {
    const now = t.value;
    const code = phase === 'play' && given === 'glass' && now > 1.6 ? POSE_GRIN
      : phase === 'play' && given === 'papers' && now > 1.5 ? POSE_DEFLATE
        : phase === 'land' ? POSE_DEFLATE
          : POSE_GRIN;
    const hold = emoteAny(code, now + 3);
    const lv = emoteAnyLive(code, now + 3, now);
    return pose(mixStance(hold, lv, 0.6), DEALER_X, GROUND, K_FIG, -1, 1);
  }, [phase, given]);

  // TWO STYLES WRITTEN OUT, not one helper called twice: a hook inside a helper is a
  // hook whose order depends on how the helper is called, and this file would be the
  // first place somebody added a third object behind a condition.
  const glassStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: held.value === 1 ? gx.value : GLASS.x },
      { translateY: held.value === 1 ? gy.value : GLASS.y },
      { scale: held.value === 1 ? 1.12 : 1 },
    ],
    opacity: given === 'papers' ? 0.25 : 1,
  }));
  const papersStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: held.value === 2 ? gx.value : PAPERS.x },
      { translateY: held.value === 2 ? gy.value : PAPERS.y },
      { scale: held.value === 2 ? 1.12 : 1 },
    ],
    opacity: given === 'glass' ? 0.25 : 1,
  }));
  const markStyle = useAnimatedStyle(() => ({
    opacity: marked.value, transform: [{ scale: 0.8 + marked.value * 0.2 }],
  }));

  const line = phase === 'arrive' ? 'He has two. He says both are the original.'
    : phase === 'ask' ? (tries ? 'Try the other one.' : 'Pick something up and put it in his hand.')
      : phase === 'play' && given === 'glass' ? 'He looks. And looks. There is nothing to find.'
        : phase === 'play' ? ''
          : phase === 'again' ? 'Same paint, same craquelure, same everything.'
            : '';

  return (
    <>
      {phase === 'land' ? null : <CodaLine text={line} />}
      <CodaStage win={WIN}>
        <CodaFloor />
        {/* The two canvases, identical by construction — drawn from one style, so a
            reader cannot tell them apart by looking, which is the lesson (A1). */}
        <View style={[styles.canvas, { left: ART_L }]} pointerEvents="none">
          <View style={styles.canvasIn} />
        </View>
        <View style={[styles.canvas, { left: ART_R }]} pointerEvents="none">
          <View style={styles.canvasIn} />
        </View>
        <Animated.View style={[styles.mark, { left: ART_L - 7 }, markStyle]} pointerEvents="none" />
        <CodaFigure D={ME} />
        <CodaFigure D={DEALER} role="second" />
        {/* THE TWO THINGS ON THE GROUND, and each says what it is: a bare shape the
            reader has to interpret before they can answer is S11. They take no touch
            of their own — the surface below decides which one the finger went for,
            once, on the first frame, so passing the other does not swap it. */}
        <Animated.View style={[styles.obj, glassStyle]} nativeID="coda-glass" pointerEvents="none">
          <View style={styles.glassRing} />
          <View style={styles.glassStem} />
          <Text style={styles.objLabel}>LOOK CLOSER</Text>
        </Animated.View>
        <Animated.View style={[styles.obj, papersStyle]} nativeID="coda-papers" pointerEvents="none">
          <View style={styles.sheet}>
            <View style={styles.sheetRule} />
            <View style={[styles.sheetRule, { top: 11 }]} />
            <View style={[styles.sheetRule, { top: 17, width: 14 }]} />
          </View>
          <Text style={styles.objLabel}>WHERE IT HAS BEEN</Text>
        </Animated.View>
      </CodaStage>
      {phase === 'ask' ? <CodaTouch enabled u={u} v={v} onDrop={drop} id="coda-give" /> : null}
      {phase === 'land'
        ? (
          <CodaLand
            idea="You bought the history, not the paint."
            note="Nothing in the picture could have told you. Provenance is the only place the difference lives — which is why a perfect fake still bothers us."
            onDone={onDone}
          />
        )
        : null}
    </>
  );
}

const styles = StyleSheet.create({
  canvas: {
    position: 'absolute', top: GROUND - 118, width: 62, height: 78,
    backgroundColor: PAPER, borderWidth: 2, borderColor: INK, borderRadius: 4,
    boxShadow: '0px 3px 0px rgba(26,26,26,0.85)', alignItems: 'center', justifyContent: 'center',
  },
  canvasIn: { width: 36, height: 48, backgroundColor: STONE, borderRadius: 2 },
  mark: {
    position: 'absolute', top: GROUND - 125, width: 76, height: 92,
    borderWidth: 3, borderColor: '#D35E36', borderRadius: 8,
  },
  obj: { position: 'absolute', left: 0, top: 0, width: 0, height: 0, alignItems: 'center' },
  glassRing: {
    position: 'absolute', left: -13, top: -30, width: 26, height: 26, borderRadius: 13,
    borderWidth: 3, borderColor: INK, backgroundColor: PAPER,
  },
  glassStem: {
    position: 'absolute', left: 6, top: -8, width: 4, height: 15, borderRadius: 2,
    backgroundColor: INK, transform: [{ rotate: '-32deg' }],
  },
  sheet: {
    position: 'absolute', left: -14, top: -32, width: 28, height: 34,
    backgroundColor: PAPER, borderWidth: 2, borderColor: INK, borderRadius: 3,
  },
  sheetRule: {
    position: 'absolute', left: 5, top: 5, width: 18, height: 2, backgroundColor: SHADE, borderRadius: 1,
  },
  // ABOVE the object and inside its own width. Printed below at 104 wide from two
  // marks 74 units apart, the two ran into each other — "LOOK CLOSEWHERE IT HAS BEEN".
  // ABOVE the object, in a box wide enough to hold the words and placed by `left`
  // rather than by its parent's `alignItems` — printed below, 104 wide, from two
  // marks 74 apart, the two ran together as "LOOK CLOSEWHERE IT HAS BEEN".
  objLabel: {
    position: 'absolute', left: -42, top: -58, width: 84,
    fontFamily: 'Inter_700Bold', fontSize: 8, lineHeight: 10, letterSpacing: 0.6,
    color: SOFT, textAlign: 'center',
  },
});
