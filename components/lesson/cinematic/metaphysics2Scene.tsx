import {
  View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import Target from './Target';
import { BEATS } from './metaphysics2Script';
import {
  clamp01, dirsFrom, WALK, ease01, lerp, mixStance, moveTr, pose, strideStance, type Bundle, } from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, PAPER, useCarry, carry, lookPose, pickAt,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { floorStyle, lipOf, PLATE_FACE } from './stageSkin';
import { followMoves, kindOf, seedOf } from './camera';
import type { SceneApi } from './CinematicPlayer';

// THE STAGE IS STRUCK IN THIS LESSON'S OWN BRANCH HUE (./stageTones).
// Same three tones, same luminance to the third decimal — so every contrast
// measured against the old greys still holds and nothing on the stage moved.
const TONE = stageTone('metaphysics');
const { RULE, STONE, SHADE } = TONE;
const LIP = lipOf(TONE);   // the ledge a toned plate stands on (scripts/skin-stage.mjs)

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
// · Leibniz's principle strip y 270…290, x  40…360 (slides in on beat 2)
// · its two consequences      y 294…314 and 318…338, x 40…360 — beats 3–9 only
// · the three posted claims   y 302…340, x  20…380 — Q1 only, three Targets
//   (CLAIM_L is derived: (400 - (112*3 + 12*2)) / 2 = 20, so the row is centred)
// · BOTH sign plates          y 356…382 — above the crown, by 13 units
// · both posts                y 382…500, at x 292 (IT IS) and x 360 (IT IS NOT)
// · the traveller             crown y 395, feet 500, on every beat and phase
// · he WALKS x 92 → 150 → 214 → 350 → 236; widest body span x 69…370. The
//   recoil beats were at 292, which is BEFORE the fork (306) and directly under
//   the IT IS plate — his hat, 9 above the crown, rose into it. At 350 he is out on
//   the dashes the sentence puts him on, under the plate that has dissolved.
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
// ── EVERY TAP OF THE OPENING CHANGES THE PICTURE ────────────────────────────
// Five taps used to hold one frame, and the fork carried its two signs and the
// riddle its headline before a word about either was said. Each now arrives as it
// is named: the headline on "the question why there is something rather than
// nothing" (`ask`); under Leibniz's principle, its application SO EXISTENCE
// ITSELF NEEDS A REASON (`applied`, y 294…314) and then his premise NOTHING IS
// SIMPLER THAN SOMETHING (`simpler`, y 318…338); the two signs are planted, IT IS
// and then IT IS NOT, on "a goddess sets out two ways" (`ways`); and on "not a
// genuine alternative to what is" IT IS is struck solid (`only`). The two argument
// lines leave, fast, on Q1, because the posted claims take that row.
//
// R7c — on the sort, the reader's chip decides whether IT IS stands as the ONLY
// way: lit for "never possible" and for "always necessary" (either way nothing was
// ever a rival), plain for "possible, and lost" (there was one, and it lost). The
// dissolved second way is NOT driven: `gone` may never come back (the script's
// header), so the table moves only the sign.
//
// ─────────────────────────────────────────────────────────────────────────────

const E = BEATS.map((b) => b.e ?? 0);
const X = BEATS.map((b) => b.x ?? 214);
// WHICH WAY HE IS POINTING, read off the same x track he walks along:
// +1 where it rises, -1 where it falls, and HOLD while he stands still, so a
// figure who walks left to something keeps facing it while he talks about it.
const DIR = dirsFrom(X, 1);
// The camera, from the staging: it follows the figure this track describes,
// pulls back on every graded beat so a tap lands where it is aimed, and leans in
// on the quote. See followMoves in ./camera.ts.
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('metaphysics2'));
const GONE = BEATS.map((b) => b.gone ?? 0);
const PR = BEATS.map((b) => b.pr ?? 0);
const ASK = BEATS.map((b) => b.ask ?? 0);
const APPLIED = BEATS.map((b) => b.applied ?? 0);
const SIMPLER = BEATS.map((b) => b.simpler ?? 0);
const WAYS = BEATS.map((b) => b.ways ?? 0);
const ONLY = BEATS.map((b) => b.only ?? 0);

// R7c — the stage follows the sort on its own graded beat, and only there (R7).
const REACT = BEATS.map((b) => (b.interact?.sort ? 1 : 0));
/**
 * Is IT IS the only way, at each bin, in the block's authored order:
 *   never possible     → 1  nothing was never a way, so IT IS stands alone
 *   possible, and lost → 0  nothing was a real rival, and lost to it
 *   always necessary   → 1  something had to exist: there was no other way
 */
const ONLY_AT = [1, 0, 1];

const SIGN_IS_X = 292;
// 360 and not 364, with a plate 62 wide and not 68. The plate is its own element now
// (S12), so the camera's measurement sees it, and at 364 it reached x 398, past the frame
// the camera tables were built on. Here it ends at 391 and stays 7 clear of the IS sign.
const SIGN_NOT_X = 360;

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

export default function Metaphysics2Scene({ clock, bt, bi, i, picked, onPick, pickPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const reacting = REACT[i] === 1;
  const cv = useCarry(8);
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

    // A line that is leaving goes in a quarter of a second, not over the walk: the
    // row it sits in is where Q1's claims are posted, on the same frame.
    const writeIn = ease01((bt.value - 0.3) / 0.6);

    return {
      trav: lookPose(travS, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1, gazeX.value, gazeY.value, gazeOn.value),
      gone: carry(cv, 1, n, GONE[p], GONE[n], tr),
      pr: carry(cv, 2, n, PR[p], PR[n], tr),
      ask: carry(cv, 3, n, ASK[p], ASK[n], ease01((bt.value - 0.15) / 0.5)),
      applied: APPLIED[n] > 0
        ? carry(cv, 4, n, APPLIED[p], APPLIED[n], writeIn)
        : APPLIED[p] > 0 ? clamp01(1 - bt.value / 0.25) : 0,
      simpler: SIMPLER[n] > 0
        ? carry(cv, 5, n, SIMPLER[p], SIMPLER[n], writeIn)
        : SIMPLER[p] > 0 ? clamp01(1 - bt.value / 0.25) : 0,
      // Planted over a second: IT IS in its first half, IT IS NOT in its second.
      ways: carry(cv, 6, n, WAYS[p], WAYS[n], ease01((bt.value - 0.3) / 1.0)),
      only: carry(cv, 7, n, ONLY[p], reacting ? pickAt(ONLY_AT, pickPos.value) : ONLY[n], tr),
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
  // The second way's POST is planted in the second half of `ways`, growing up out of
  // the road from its foot.
  const notPost = useAnimatedStyle(() => ({ transform: [{ scaleY: clamp01(SCENE.value.ways * 2 - 1) }] }));
  // The sign's PLATE flickers with the road: the same numbers, one style per view.
  const notPlate = useAnimatedStyle(() => {
    const flick = 0.75 + 0.25 * Math.sin(SCENE.value.t * 5.0);
    return { opacity: (1 - SCENE.value.gone) * flick };
  });
  // The whole second sign drops onto its post as that post finishes growing.
  const notBoard = useAnimatedStyle(() => {
    const w = clamp01(SCENE.value.ways * 2 - 1);
    return { opacity: w, transform: [{ translateY: (1 - w) * -8 }] };
  });
  // AND ITS NAME IS THERE OR IT IS NOT (D35, S13). It rode the flicker too, so on the
  // eight beats the second way still stands IT IS NOT swam between 0.33 and 0.65, a
  // word the reader could catch only every other second. The dashes and the plate
  // carry the failing; the name stays readable while the way still stands (`gone`
  // 0.35) and is absent once it has gone (0.95).
  const notWord = useAnimatedStyle(() => ({ opacity: clamp01((0.6 - SCENE.value.gone) / 0.2) }));
  // The first way is planted first: its post, then its board.
  const isPost = useAnimatedStyle(() => ({ transform: [{ scaleY: clamp01(SCENE.value.ways * 2) }] }));
  const isBoard = useAnimatedStyle(() => {
    const w = clamp01(SCENE.value.ways * 2);
    return { opacity: w, transform: [{ translateY: (1 - w) * -8 }] };
  });
  // IT IS, struck solid: the ink face and the reversed name ride `only`, the inked
  // name its complement, so the word is never half-contrast on either ground.
  const isLit = useAnimatedStyle(() => ({ opacity: SCENE.value.only }));
  const isInk = useAnimatedStyle(() => ({ opacity: 1 - SCENE.value.only }));
  const riddle = useAnimatedStyle(() => ({
    opacity: SCENE.value.ask,
    transform: [{ scale: 1.08 - 0.08 * SCENE.value.ask }],
  }));
  const principle = useAnimatedStyle(() => ({
    opacity: SCENE.value.pr,
    transform: [{ translateX: (1 - SCENE.value.pr) * -14 }],
  }));
  const applied = useAnimatedStyle(() => ({
    opacity: SCENE.value.applied,
    transform: [{ translateX: (1 - SCENE.value.applied) * -14 }],
  }));
  const simpler = useAnimatedStyle(() => ({
    opacity: SCENE.value.simpler,
    transform: [{ translateX: (1 - SCENE.value.simpler) * -14 }],
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
      <Animated.View style={[styles.qBox, riddle]} pointerEvents="none">
        <Text style={styles.qText}>WHY SOMETHING RATHER THAN NOTHING?</Text>
      </Animated.View>
      <Animated.View style={[styles.prStrip, principle]} pointerEvents="none">
        <Text style={styles.prText}>NOTHING IS WITHOUT A REASON  ·  LEIBNIZ</Text>
      </Animated.View>
      <Animated.View style={[styles.prStrip, { top: 294 }, applied]} pointerEvents="none">
        <Text style={styles.argText} numberOfLines={1}>SO EXISTENCE ITSELF NEEDS A REASON</Text>
      </Animated.View>
      <Animated.View style={[styles.prStrip, { top: 318 }, simpler]} pointerEvents="none">
        <Text style={styles.argText} numberOfLines={1}>NOTHING IS SIMPLER THAN SOMETHING</Text>
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

      <Animated.View style={[styles.postIs, isPost]} pointerEvents="none" />
      <Animated.View style={[styles.signIs, isBoard]} pointerEvents="none">
        <Animated.View style={[styles.signIsLit, isLit]} />
        <Animated.Text style={[styles.signIsText, isInk]}>IT IS</Animated.Text>
        <Animated.View style={[styles.signIsLitWrap, isLit]}>
          <Text style={[styles.signIsText, styles.signIsTextLit]}>IT IS</Text>
        </Animated.View>
      </Animated.View>

      {/* everything past the fork — the road as well as the post — is only ever
          dashes, and thins to nothing as the second way dissolves */}
      <Animated.View style={[StyleSheet.absoluteFill, notSign]} pointerEvents="none">
        {DASHES.map((x) => <View key={x} style={[styles.roadDash, { left: x }]} />)}
        {GHOST_TICKS.map((x) => <View key={x} style={[styles.ghostTick, { left: x }]} />)}
        <Animated.View style={[styles.postNot, notPost]} />
      </Animated.View>
      <Animated.View style={[styles.signNot, notBoard]} pointerEvents="none">
        <Animated.View style={[styles.signNotPlate, notPlate]} />
        <Animated.Text style={[styles.signNotText, notWord]}>IT IS NOT</Animated.Text>
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
    borderWidth: 2, borderColor: INK, borderRadius: 8, backgroundColor: STONE, boxShadow: LIP,
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
  // The two lines the principle leads to, on the same rule and in ink: 227 units of
  // type in the strip's 308. They stand above the claims row, which they leave for.
  argText: {
    fontFamily: 'Inter_700Bold', fontSize: 10, lineHeight: 13, letterSpacing: 0.8, color: INK,
    includeFontPadding: false,
  },

  // H61: a scene-owned answer target looks exactly like the deck's option —
  // 2px INK border, radius 4; the right one fills INK with PAPER text and the
  // wrong pick drops to a SOFT border at 0.45. The reader never learns a new
  // answer UI, however different the thing being tapped is.
  claim: { position: 'absolute', top: CLAIM_T, width: CLAIM_W },
  claimInner: {
    height: CLAIM_H, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PLATE_FACE, boxShadow: LIP,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
  },
  claimRight: { backgroundColor: INK, borderColor: INK },
  claimWrong: { borderColor: SOFT },
  claimText: {
    fontFamily: 'Inter_700Bold', fontSize: 12, lineHeight: 15, letterSpacing: 0.3, color: INK,
    includeFontPadding: false, textAlign: 'center',
  },
  claimTextOn: { color: PAPER },

  postIs: {
    position: 'absolute', left: SIGN_IS_X - 1.5, top: 382, width: 3, height: GROUND - 382, backgroundColor: INK,
    transformOrigin: '50% 100%',
  },
  signIs: {
    position: 'absolute', left: SIGN_IS_X - 30, top: 356, width: 60, height: 26,
    borderWidth: 2, borderColor: INK, borderRadius: 8, backgroundColor: PLATE_FACE, boxShadow: LIP,
    alignItems: 'center', justifyContent: 'center',
  },
  signIsText: {
    fontFamily: 'Inter_700Bold', fontSize: 13, lineHeight: 17, letterSpacing: 1, color: INK,
    includeFontPadding: false,
  },
  signIsLit: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, borderRadius: 1.5, backgroundColor: INK },
  signIsLitWrap: {
    position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center',
  },
  signIsTextLit: { color: PAPER },

  postNot: {
    position: 'absolute', left: SIGN_NOT_X - 1, top: 382, width: 2, height: GROUND - 382, backgroundColor: SOFT,
    transformOrigin: '50% 100%',
  },
  // ONE BOX, the plate its child (S12), so the plate can flicker while the name does not.
  signNot: {
    position: 'absolute', left: SIGN_NOT_X - 31, top: 356, width: 62, height: 26,
    alignItems: 'center', justifyContent: 'center',
  },
  signNotPlate: {
    position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
    borderWidth: 1.5, borderColor: SOFT, borderStyle: 'dashed', borderRadius: 3,
  },
  // 11 / 0.4, not 11.5 / 0.6: "IT IS NOT" measures ~62 units at the larger setting,
  // which is the whole 62-unit sign, and a wrap would put a second line outside the
  // 26-tall plate. At this setting it measures 53, one line with room to spare.
  signNotText: {
    // INK on the page: the plate around this name thins and flickers with its road,
    // and the name itself no longer does (D35).
    fontFamily: 'Inter_700Bold', fontSize: 11, lineHeight: 14.5, letterSpacing: 0.4, color: INK,
    includeFontPadding: false,
  },
});

// BAND. Topmost ink is the riddle headline at y 236; the lowest is the road's
// distance ticks at GROUND + 7 = 507. 282 units, which is inside the
// width-limited ceiling — see the composition note above.
export function Metaphysics2Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Metaphysics2Scene} band={[230, 512]} camera={CAM} />;
}
