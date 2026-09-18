import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, ease01, moveTr, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './epistemology27Script';
import { facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, pickAt, lookPose,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { floorStyle, lipOf, PLATE_FACE } from './stageSkin';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// THE STAGE IS STRUCK IN THIS LESSON'S OWN BRANCH HUE (./stageTones).
// Same three tones, same luminance to the third decimal — so every contrast
// measured against the old greys still holds and nothing on the stage moved.
const TONE = stageTone('epistemology');
const { RULE, STONE, SHADE } = TONE;
const LIP = lipOf(TONE);   // the ledge a toned plate stands on (scripts/skin-stage.mjs)

// ─────────────────────────────────────────────────────────────────────────────
// WHAT SHE SAID, THE PASSAGE, AND THE GAUGE AT THE FAR END OF IT.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the PLATE is 104×36 at x 136 (136…240), y 300…336, in paper, carrying its own
//   words. The words are a separate element, because one of the two injustices
//   takes them away and leaves the plate standing.
// · the PASSAGE is a 30×3 bar at x 246, y 316, with a head at 276 — the journey
//   from a speaker to a hearer, which is where both harms happen.
// · the GAUGE is a 96×26 filled STONE track at x 284 (284…380), y 306…332, with a
//   FILL inside it running 0…92 wide, and a FULL MARK of 3 wide standing at its
//   far end. The mark is drawn at every setting: a half-full bar is only a wrong
//   if you can see what it was owed.
// · CREDIT GIVEN sits under the gauge at x 274 (274…390), y 340.
// · THREE PLATES of 84×26 at x 128 · 220 · 312 (128…396), top y 462 — below the
//   gauge and above the ground, each carrying its own words (S11).
// · the figure stands at x 28 and walks to 88; his widest span at the walked mark
//   is x ≈ 63…113, twenty-three units clear of the plate at 136.
//
// Ink runs y 244 (the caption) … y 500 (ground). BAND 240…512 = 272 — a 103-unit
// figure at 37.9%, inside H58's 38%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const SAID_X = 136;
const SAID_Y = 300;
const SAID_W = 104;
const SAID_H = 36;

const PASS_X = 246;
const PASS_Y = 316;

const SHORTFALL_TAG_W = 70;
const NO_WORD_X = 246;
const NO_WORD_Y = 384;
const NO_WORD_W = 96;
const NO_WORD_H = 26;

const GAUGE_X = 284;
const GAUGE_Y = 306;
const GAUGE_W = 96;
const GAUGE_H = 26;
const FILL_MAX = 92;

const PLATE_X = [128, 220, 312];
const PLATE_Y = 462;
const PLATE_W = 84;
const PLATE_H = 26;
const PLATE_CAP = ['TESTIMONIAL', 'HERMENEUTICAL', 'NEITHER'];
const PLATE_ID = ['test', 'herm', 'none'];
/** The juror's wrong: the words arrived and were marked down. */
const TEST = 0;

const CAP_T = 244;
const FIG_X = 28;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const SAID = BEATS.map((b) => (b.said ? 1 : 0));
const GAUGE = BEATS.map((b) => (b.gauge ? 1 : 0));
const CREDIT = BEATS.map((b) => b.credit ?? 0);
const PLATES = BEATS.map((b) => (b.plates ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));
const SHORTFALL = BEATS.map((b) => (b.shortfall ? 1 : 0));
const NO_WORD_YET = BEATS.map((b) => (b.noWordYet ? 1 : 0));

// R7c — the stage follows the control on its own graded beat, and only there.
// Derived from the beat so it cannot fall out of step with the control.
const REACT = BEATS.map((b) => (b.interact?.sort ? 1 : 0));

// THE SORT'S OWN BIN ORDER, never the shuffled row (X3): 0 testimonial ·
// 1 hermeneutical · 2 no injustice. Each row is that bin's own damage, and the
// two harms land in two different places, which is the whole distinction.
//   testimonial   — the words arrive and the gauge is turned down.
//   hermeneutical — the gauge is untouched and the plate has nothing on it.
//   none          — both are whole.
const CREDIT_AT = [0.35, 1, 1];
const WORDS_AT = [1, 0, 1];

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('epistemology27'));

export default function Epistemology27Scene({ clock, bt, bi, i, picked, onPick, pickPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldFig = useHeld();
  const cv = useCarry(8);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    // A WALKING BEAT TAKES AS LONG AS THE WALK NEEDS (rig.moveTr).
    const tr = ease01(bt.value / moveTr(X[p], X[n], BASE_TR));
    const t = clock.value;

    const figS = keepHeld(heldFig, travelStance(
      X[p], X[n],
      carryFrom(heldFig, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));

    return {
      fig: lookPose(figS, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1, gazeX.value, gazeY.value, gazeOn.value),
      t,
      saidOn: carry(cv, 1, n, SAID[p], SAID[n], tr),
      gaugeOn: carry(cv, 2, n, GAUGE[p], GAUGE[n], tr),
      credit: carry(cv, 3, n, CREDIT[p], reacting ? pickAt(CREDIT_AT, pickPos.value) : CREDIT[n], tr),
      words: carry(cv, 4, n, 1, reacting ? pickAt(WORDS_AT, pickPos.value) : 1, tr),
      platesOn: carry(cv, 5, n, PLATES[p], PLATES[n], tr),
      shortfall: carry(cv, 6, n, SHORTFALL[p], SHORTFALL[n], tr),
      noWordYet: carry(cv, 7, n, NO_WORD_YET[p], NO_WORD_YET[n], tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const saidStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.saidOn }));
  const wordsStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.saidOn * SCENE.value.words }));
  const gaugeStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.gaugeOn }));
  const fillStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.gaugeOn,
    width: FILL_MAX * SCENE.value.credit,
  }));
  const platesStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.platesOn }));
  // SHORTFALL — a bracket measuring the gap between the fill and the full mark:
  // what prejudice took. Read live off the credit value, so it never mismatches it.
  const shortfallLineStyle = useAnimatedStyle(() => {
    const left = GAUGE_X + 2 + FILL_MAX * SCENE.value.credit;
    const right = GAUGE_X + FILL_MAX + 3;
    return { opacity: SCENE.value.shortfall, left, width: Math.max(0, right - left) };
  });
  const shortfallTagStyle = useAnimatedStyle(() => {
    const left = GAUGE_X + 2 + FILL_MAX * SCENE.value.credit;
    const right = GAUGE_X + FILL_MAX + 3;
    const mid = (left + right) / 2;
    return { opacity: SCENE.value.shortfall, left: mid - SHORTFALL_TAG_W / 2 };
  });
  const noWordYetStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.noWordYet }));

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={styles.cap} pointerEvents="none">WHAT HER WORD WAS WORTH</Text>

      <Animated.View style={[StyleSheet.absoluteFill, saidStyle]} pointerEvents="none">
        <View style={styles.said} />
        <View style={styles.pass} />
        <View style={styles.passHead} />
      </Animated.View>
      <Animated.Text style={[styles.saidText, wordsStyle]} pointerEvents="none">WHAT SHE SAID</Animated.Text>

      <Animated.View style={[StyleSheet.absoluteFill, gaugeStyle]} pointerEvents="none">
        <View style={styles.gauge} />
        <View style={styles.fullMark} />
        <Text style={styles.gaugeText}>CREDIT GIVEN</Text>
      </Animated.View>
      <Animated.View style={[styles.fill, fillStyle]} pointerEvents="none" />

      <Animated.View style={[styles.shortfallLine, shortfallLineStyle]} pointerEvents="none" />
      <Animated.Text style={[styles.shortfallTag, shortfallTagStyle]} pointerEvents="none">SHORTFALL</Animated.Text>

      <Animated.View style={[styles.noWordYet, noWordYetStyle]} pointerEvents="none">
        <Text style={styles.noWordYetTag} pointerEvents="none">1970s</Text>
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, platesStyle]}>
        {PLATE_ID.map((id, k) => (
          <Target
            key={id}
            id={id}
            correct={k === TEST}
            picked={picked}
            onPick={onPick}
            disabled={!live || answered}
            style={[styles.hit, { left: PLATE_X[k] }]}
            radius={4}
          >
            <View style={styles.plate} pointerEvents="none" />
            <Text style={styles.plateText} pointerEvents="none">{PLATE_CAP[k]}</Text>
          </Target>
        ))}
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON — a subject standing on a filled mass
  // rather than on bare page.
  floor: floorStyle(TONE, GROUND),

  cap: {
    position: 'absolute', left: SAID_X, top: CAP_T, width: 250,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },

  said: {
    position: 'absolute', left: SAID_X, top: SAID_Y, width: SAID_W, height: SAID_H,
    borderWidth: 2, borderColor: INK, backgroundColor: PAPER,
  },
  // THE WORDS ARE THEIR OWN ELEMENT, because one of the two injustices takes them
  // away and leaves the plate exactly where it was.
  saidText: {
    position: 'absolute', left: SAID_X, top: SAID_Y + 13, width: SAID_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.5, color: INK, includeFontPadding: false,
  },
  pass: { position: 'absolute', left: PASS_X, top: PASS_Y, width: 24, height: 3, backgroundColor: INK },
  passHead: {
    position: 'absolute', left: PASS_X + 24, top: PASS_Y - 4, width: 0, height: 0,
    borderTopWidth: 5.5, borderBottomWidth: 5.5, borderLeftWidth: 10,
    borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: INK,
  },

  gauge: {
    position: 'absolute', left: GAUGE_X, top: GAUGE_Y, width: GAUGE_W, height: GAUGE_H,
    borderWidth: 2, borderColor: INK, backgroundColor: STONE, boxShadow: LIP,
  },
  fill: { position: 'absolute', left: GAUGE_X + 2, top: GAUGE_Y + 2, height: GAUGE_H - 4, backgroundColor: INK },
  // WHAT IT WAS OWED, drawn at every setting so the shortfall can be seen at all.
  fullMark: { position: 'absolute', left: GAUGE_X + FILL_MAX, top: GAUGE_Y - 6, width: 3, height: GAUGE_H + 12, backgroundColor: INK },
  gaugeText: {
    position: 'absolute', left: 274, top: 340, width: 116, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.5, color: INK, includeFontPadding: false,
  },

  // SHORTFALL_LINE / TAG — a dashed bracket over the gap between the fill and the
  // full mark, labelled what prejudice took. Positioned live off the fill's own edge.
  shortfallLine: {
    position: 'absolute', top: GAUGE_Y - 8, height: 0,
    borderTopWidth: 1.5, borderColor: INK, borderStyle: 'dashed',
  },
  shortfallTag: {
    position: 'absolute', top: GAUGE_Y - 20, width: SHORTFALL_TAG_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.6, color: SOFT, includeFontPadding: false,
  },
  // NO_WORD_YET — an empty dashed box: a harm nobody yet had the words for, until
  // the term arrived in the 1970s.
  noWordYet: {
    position: 'absolute', left: NO_WORD_X, top: NO_WORD_Y, width: NO_WORD_W, height: NO_WORD_H,
    borderWidth: 1.5, borderColor: INK, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'flex-end',
  },
  noWordYetTag: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.6, color: SOFT, includeFontPadding: false, marginBottom: 3,
  },
  hit: { position: 'absolute', top: PLATE_Y, width: PLATE_W, height: PLATE_H },
  plate: {
    position: 'absolute', left: 0, top: 0, width: PLATE_W, height: PLATE_H,
    borderWidth: 2, borderColor: INK, borderRadius: 8, backgroundColor: PAPER,
  },
  plateText: {
    position: 'absolute', left: 0, top: 8, width: PLATE_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.5, color: INK, includeFontPadding: false,
  },
});

export function Epistemology27Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Epistemology27Scene} band={[240, 512]} camera={CAM} />;
}
