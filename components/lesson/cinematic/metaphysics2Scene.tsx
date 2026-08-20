import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import Target from './Target';
import { BEATS } from './metaphysics2Script';
import {
  WALK, ease01, lerp, mixStance, moveTr, pose, strideStance, type Bundle,
} from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import { followMoves, kindOf, seedOf } from './camera';
import type { SceneApi } from './CinematicPlayer';

// ─────────────────────────────────────────────────────────────────────────────
// THE ROAD THAT FORKS, AND THE WAY THAT ISN'T THERE.
//
// ONE PICTURE (H64): the road is drawn SOLID out to the fork at x 306 — the IT IS
// way, with a solid post standing on it — and past the fork it is only a row of
// dashes, flickering and thinning as `gone` rises. The way that "is not" is
// literally a way that is not there: you can see there is nothing to walk on.
// That is Parmenides' second way in one image, and the traveller walking onto it
// and recoiling (beat 4) is the argument HAPPENING rather than being narrated.
//
// A 3x2 comparison matrix used to run across the top third saying the same thing
// in words. It is gone; the script's header carries the three reasons.
//
// ── THE COMPOSITION, IN NUMBERS (H56) ───────────────────────────────────────
//
// Every y below is MEASURED, not estimated. The first draft of this block put the
// traveller's crown at 352 and the sign plates at 386; the rig says the crown is
// at 395 on every beat, which meant the plate and his head shared y 396…412 while
// he stood at x 253…312 on beat 4 — his head drawn inside the IT IS sign. The
// comment was wrong before the scene was, which is exactly the failure H56 exists
// to catch, so these come from scripts run against `solve()` rather than from
// reading the styles.
//
// · the riddle headline box   y 236…264, x  40…360
// · Leibniz's principle strip y 270…290, x  40…360 (slides in on beat 1)
// · the three posted claims   y 302…340, x  20…380 — Q1 only, three Targets
//   (CLAIM_L is derived: (400 - (112*3 + 12*2)) / 2 = 20, so the row is centred)
// · BOTH sign plates          y 356…382 — above the crown, by 13 units
// · both posts                y 382…500, at x 292 (IT IS) and x 364 (IT IS NOT)
// · the traveller             crown y 395, feet 500, on every beat and phase
// · he WALKS x 92 → 150 → 214 → 292 → 236; widest body span x 69…312
// · the road, ticks and fork  y 493…507
//
// THE TWO CLEARANCES: claims stop at 340 and the plates start at 356, so 16 units
// of paper. The plates stop at 382 and the crown is 395, so 13. Nothing the reader
// has to read is ever behind him.
//
// The POSTS do cross his y range, and that is correct rather than tolerated: a man
// walking past a signpost passes in front of it, and `Stickman` is drawn last so he
// does. What may never happen is a WORD behind him, which is what the plates being
// above 382 buys.
//
// ─────────────────────────────────────────────────────────────────────────────

const E = BEATS.map((b) => b.e ?? 0);
const X = BEATS.map((b) => b.x ?? 214);
// The camera, from the staging: it follows the figure this track describes,
// pulls back on every graded beat so a tap lands where it is aimed, and leans in
// on the quote. See followMoves in ./camera.ts.
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('metaphysics2'));
const GONE = BEATS.map((b) => b.gone ?? 0);
const PR = BEATS.map((b) => b.pr ?? 0);

const SIGN_IS_X = 292;
const SIGN_NOT_X = 364;

// The road forks at x 306. Everything left of it is solid ground the traveller can
// actually walk; everything right of it is drawn only as dashes, and dissolves.
const FORK_X = 306;
const TICKS = [40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300];
const DASHES = [312, 326, 340, 354, 368];
const GHOST_TICKS = [318, 344, 370];

// ── Q1: three posted claims ─────────────────────────────────────────────────
//
// H66 — the wrong answers are the real rival positions. A UNICORN is the whole
// question: it does not exist, so it FEELS like the answer, and the reader
// pictured one while reading the prompt. That is exactly the distinction
// Parmenides is drawing, and it is the trap the explanation then gets to name.
// A HORSE is the control that makes the pair readable.
const CLAIMS = [
  { id: 'horse', label: 'A HORSE', correct: false },
  { id: 'unicorn', label: 'A UNICORN', correct: false },
  { id: 'nothing', label: 'NOTHING AT ALL', correct: true },
];
const CLAIM_T = 302;
const CLAIM_H = 38;
const CLAIM_W = 112;
const CLAIM_GAP = 12;
const CLAIM_L = (STAGE_W - (CLAIM_W * 3 + CLAIM_GAP * 2)) / 2;

export default function Metaphysics2Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const cur = BEATS[i];

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / moveTr(X[p], X[n], 0.9));
    const t = clock.value;

    const moving = Math.abs(X[n] - X[p]) > 10;
    const travS = moving
      ? strideStance(X[p], X[n], emoteLive(E[n], t, bt.value), tr, WALK)
      : mixStance(emoteHold(E[p], t), emoteLive(E[n], t, bt.value), tr);

    return {
      trav: pose(travS, lerp(X[p], X[n], tr), GROUND, K_FIG, 1, 1),
      gone: lerp(GONE[p], GONE[n], tr),
      pr: lerp(PR[p], PR[n], tr),
      t,
    };
  });

  const DT = useDerivedValue<Bundle>(() => SCENE.value.trav);
  const notSign = useAnimatedStyle(() => {
    // The flicker is what says "this is failing", not merely "this is faint" — a
    // static grey road reads as a road drawn badly. It multiplies `gone`, so a
    // way that is mostly still there only shimmers.
    const flick = 0.75 + 0.25 * Math.sin(SCENE.value.t * 5.0);
    return { opacity: (1 - SCENE.value.gone) * flick };
  });
  const principle = useAnimatedStyle(() => ({
    opacity: SCENE.value.pr,
    transform: [{ translateX: (1 - SCENE.value.pr) * -14 }],
  }));

  const answered = picked !== null;
  const showClaims = (cur.pick ?? 0) > 0 && !!cur.interact;

  // NO pointerEvents="none" ON THIS ROOT. It blocks the View *and every
  // descendant*, so the three claim Targets below were rendered, ringed, and
  // completely dead — the reader could not answer Q1 at all and had no way past
  // the beat. It was copied from the sibling "lesson 2" scenes, which are
  // deck-question lessons with nothing tappable on stage. The Scene renders
  // INSIDE the player's advance Pressable, so `auto` is what every other
  // Target-using scene does: taps bubble up to advance, and a Target stops that
  // bubble for itself. check:cinematic now fails any scene that imports Target
  // and carries this prop on its root.
  return (
    <Animated.View style={styles.scene}>
      {/* ── the riddle, and Leibniz's answer to it ────────────────────────── */}
      <View style={styles.qBox} pointerEvents="none">
        <Text style={styles.qText}>WHY SOMETHING RATHER THAN NOTHING?</Text>
      </View>
      <Animated.View style={[styles.prStrip, principle]} pointerEvents="none">
        <Text style={styles.prText}>NOTHING IS WITHOUT A REASON  ·  LEIBNIZ</Text>
      </Animated.View>

      {/* ── Q1, answered on the stage (H65): tap the one there is nothing to
             picture. Target draws the breathing ring OUTSIDE each plate and
             counts itself, so the panel below can say how many there are (I70). */}
      {showClaims &&
        CLAIMS.map((c, k) => {
          const chosen = picked === c.id;
          return (
            <Target
              id={c.id}
              correct={c.correct}
              picked={picked}
              onPick={onPick}
              key={c.id}
              style={[styles.claim, { left: CLAIM_L + k * (CLAIM_W + CLAIM_GAP) }]}
              disabled={answered}
            >
              <View
                style={[
                  styles.claimInner,
                  answered && c.correct && styles.claimRight,
                  answered && chosen && !c.correct && styles.claimWrong,
                ]}
              >
                <Text style={[styles.claimText, answered && c.correct && styles.claimTextOn]}>
                  {c.label}
                </Text>
              </View>
            </Target>
          );
        })}

      {/* ── the road, the fork and the two posts ──────────────────────────── */}
      <View style={styles.ground} pointerEvents="none" />
      {TICKS.map((x) => <View key={x} style={[styles.roadTick, { left: x }]} pointerEvents="none" />)}
      <View style={styles.forkMark} pointerEvents="none" />

      <View style={styles.postIs} pointerEvents="none" />
      <View style={styles.signIs} pointerEvents="none"><Text style={styles.signIsText}>IT IS</Text></View>

      {/* everything past the fork — the road as well as the post — is only ever
          dashes, and thins to nothing as the second way dissolves */}
      <Animated.View style={[StyleSheet.absoluteFill, notSign]} pointerEvents="none">
        {DASHES.map((x) => <View key={x} style={[styles.roadDash, { left: x }]} />)}
        {GHOST_TICKS.map((x) => <View key={x} style={[styles.ghostTick, { left: x }]} />)}
        <View style={styles.postNot} />
        <View style={styles.signNot}><Text style={styles.signNotText}>IT IS NOT</Text></View>
      </Animated.View>

      <Stickman D={DT} k={K_FIG} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 24, width: FORK_X - 24, top: GROUND, height: 1.5, backgroundColor: RULE },
  roadTick: { position: 'absolute', top: GROUND + 2, width: 1.5, height: 5, backgroundColor: RULE },
  // the fork: a short kerb mark where solid ground stops
  forkMark: { position: 'absolute', left: FORK_X, top: GROUND - 7, width: 1.5, height: 9, backgroundColor: RULE },
  // the second way, drawn only as dashes — a road you can see there is none of
  roadDash: { position: 'absolute', top: GROUND, width: 10, height: 1.5, backgroundColor: SOFT },
  ghostTick: { position: 'absolute', top: GROUND + 2, width: 1.5, height: 5, backgroundColor: RULE },

  qBox: {
    position: 'absolute', left: 40, top: 236, width: 320, height: 28,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  qText: {
    fontFamily: 'Inter_700Bold', fontSize: 12.5, lineHeight: 16, letterSpacing: 0.4, color: INK,
    includeFontPadding: false,
  },
  prStrip: {
    position: 'absolute', left: 40, top: 270, width: 320, height: 20,
    borderLeftWidth: 3, borderLeftColor: INK, paddingLeft: 9, justifyContent: 'center',
  },
  prText: {
    fontFamily: 'Inter_700Bold', fontSize: 10, lineHeight: 13, letterSpacing: 0.8, color: SOFT,
    includeFontPadding: false,
  },

  // H61: a scene-owned answer target looks exactly like the deck's option —
  // 2px INK border, radius 4; the right one fills INK with PAPER text and the
  // wrong pick drops to a SOFT border at 0.45. The reader never learns a new
  // answer UI, however different the thing being tapped is.
  claim: { position: 'absolute', top: CLAIM_T, width: CLAIM_W },
  claimInner: {
    height: CLAIM_H, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
  },
  claimRight: { backgroundColor: INK, borderColor: INK },
  claimWrong: { borderColor: SOFT, opacity: 0.45 },
  claimText: {
    fontFamily: 'Inter_700Bold', fontSize: 12, lineHeight: 15, letterSpacing: 0.3, color: INK,
    includeFontPadding: false, textAlign: 'center',
  },
  claimTextOn: { color: PAPER },

  postIs: { position: 'absolute', left: SIGN_IS_X - 1.5, top: 382, width: 3, height: GROUND - 382, backgroundColor: INK },
  signIs: {
    position: 'absolute', left: SIGN_IS_X - 30, top: 356, width: 60, height: 26,
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  signIsText: {
    fontFamily: 'Inter_700Bold', fontSize: 13, lineHeight: 17, letterSpacing: 1, color: INK,
    includeFontPadding: false,
  },

  postNot: { position: 'absolute', left: SIGN_NOT_X - 1, top: 382, width: 2, height: GROUND - 382, backgroundColor: SOFT },
  signNot: {
    position: 'absolute', left: SIGN_NOT_X - 34, top: 356, width: 68, height: 26,
    borderWidth: 1.5, borderColor: SOFT, borderStyle: 'dashed', borderRadius: 3,
    alignItems: 'center', justifyContent: 'center',
  },
  // 11 / 0.4, not 11.5 / 0.6: "IT IS NOT" measures ~62 units at the larger setting
  // inside a 65-unit interior, and a wrap would put a second line outside the
  // 26-tall plate. This keeps one comfortable line with room to spare.
  signNotText: {
    fontFamily: 'Inter_700Bold', fontSize: 11, lineHeight: 14.5, letterSpacing: 0.4, color: SOFT,
    includeFontPadding: false,
  },
});

// BAND. Topmost ink is the riddle headline at y 236; the lowest is the road's
// distance ticks at GROUND + 7 = 507. 282 units, which is inside the
// width-limited ceiling — see the composition note above.
export function Metaphysics2Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Metaphysics2Scene} band={[230, 512]} camera={CAM} />;
}
