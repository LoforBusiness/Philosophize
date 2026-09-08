import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, ease01, moveTr, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './logic39Script';
import {
  facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, pickAt, lookPose,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// THREE PLANKS ACROSS TWO POSTS, AND THE MIDDLE ONE IS SAWN BY ITS OWN DEMAND.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · two POSTS 10 wide at x 138 and x 366, running y 258…446, filled STONE. The
//   three PLANKS span the 218 between them at y 268, 336 and 404, 30 tall.
// · the three claims are set 8.6 INK on the plank's own STONE face, and the
//   three planks are drawn from ONE style, so nothing but the words differs
//   before the reader chooses (group O).
// · the BLADE is 76×18 at y 368 — two units under the middle plank's underside,
//   clear of every word on the stage — and it runs x 148…290 as `saw` turns. It
//   carries PROVE IT in PAPER on INK, because the thing cutting the plank is the
//   standard the sentence itself set, not an objection from outside.
// · THE MIDDLE PLANK IS TWO HALVES OF 109, hinged at their outer ends (origin
//   0%/100%), and the claim is split across them — NOTHING CAN · BE PROVED. So
//   the sentence comes apart with the plank rather than fading out of it, and
//   the reader can still read what broke.
// · the POLL's three answers are three states of that plank, and the reader
//   travels between them: broken on the posts (it is false), whole and lifted 38
//   clear of them (it was a rule), or mended under a 104-wide PATCH reading
//   EXCEPT THIS ONE (it holds, exempting itself).
// · the figure stands at x 58 and walks to 106; his right edge is 132, which
//   clears the first post's 138.
//
// Ink runs y 236 (the caption) … y 500 (ground). BAND 230…512 = 282 — a 103-unit
// figure at 36.5%, inside H58's 38%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const POST_X = [138, 366];
const POST_W = 10;
const POST_Y = 258;
const POST_H = 188;

const PL_X = 148;
const PL_W = 218;
const PL_H = 30;
const PL_Y = [268, 336, 404];
const PL_CAP = ['SOME CLAIMS ARE FALSE', 'NOTHING CAN BE PROVED', 'EVERY EVENT HAS A CAUSE'];
const PL_ID = ['some', 'nothing', 'cause'];
/** The sawn plank's own words, one to a half — see the header. */
const HALF_W = PL_W / 2;
const HALF_CAP = ['NOTHING CAN', 'BE PROVED'];

const BLADE_W = 76;
const BLADE_Y = 368;
const BLADE_RUN = PL_W - BLADE_W;

const PATCH_W = 104;

const CAP_T = 236;
const FIG_X = 58;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along:
// +1 where it rises, -1 where it falls, and HOLD while he stands still.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const PLANKS = BEATS.map((b) => (b.planks ? 1 : 0));
const SAW = BEATS.map((b) => b.saw ?? 0);
const SNAP = BEATS.map((b) => b.snap ?? 0);
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));

// R7b — the stage follows the control on its own graded beat, and only there.
const REACT = BEATS.map((b) => (b.interact?.poll ? 1 : 0));

// THE THREE ANSWERS AS THREE STATES OF ONE PLANK, in the BALLOT'S OWN ORDER.
// `pickPos` is 0..1 across the options as the AUTHOR wrote them, which is the
// only order a picture may follow — `dragPos` on a poll is the shuffled row, and
// a scene animated off that moves its art in an order the shuffle decided.
//                     false · rule · exempt
const MEND = [0, 1, 1];   // whole again in the last two — only the first leaves it broken
const LIFT = [0, 1, 0];   // "it was a rule": the plank comes off the posts entirely
const PATCH = [0, 0, 1];  // "it exempts itself": mended, with the exception written on it

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('logic39'));

export default function Logic39Scene({ clock, bt, bi, i, picked, onPick, pickPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldFig = useHeld();
  const cv = useCarry(7);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    // A WALKING BEAT TAKES AS LONG AS THE WALK NEEDS (rig.moveTr).
    const tr = ease01(bt.value / moveTr(X[p], X[n], BASE_TR));
    const t = clock.value;
    const u = pickPos.value;

    const figS = keepHeld(heldFig, travelStance(
      X[p], X[n],
      carryFrom(heldFig, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));

    return {
      fig: lookPose(figS, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1, gazeX.value, gazeY.value, gazeOn.value),
      t,
      planksOn: carry(cv, 1, n, PLANKS[p], PLANKS[n], tr),
      saw: carry(cv, 2, n, SAW[p], SAW[n], tr),
      snap: carry(cv, 3, n, SNAP[p], SNAP[n], tr),
      mend: carry(cv, 4, n, 0, reacting ? pickAt(MEND, u) : 0, tr),
      lift: carry(cv, 5, n, 0, reacting ? pickAt(LIFT, u) : 0, tr),
      patch: carry(cv, 6, n, 0, reacting ? pickAt(PATCH, u) : 0, tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const planksStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.planksOn }));
  const bladeStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.saw,
    transform: [{ translateX: BLADE_RUN * SCENE.value.saw }],
  }));
  const cutStyle = useAnimatedStyle(() => ({ transform: [{ translateY: -38 * SCENE.value.lift }] }));
  const patchStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.patch }));

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={styles.cap} pointerEvents="none">HOLD EACH CLAIM TO ITS OWN STANDARD</Text>

      <Animated.View style={[StyleSheet.absoluteFill, planksStyle]}>
        {POST_X.map((px) => <View key={px} style={[styles.post, { left: px }]} pointerEvents="none" />)}

        <Animated.View style={[styles.blade, bladeStyle]} pointerEvents="none">
          <Text style={styles.bladeText}>PROVE IT</Text>
        </Animated.View>

        {/* E39 — THE PLANK IS INSIDE ITS OWN TARGET, so the thing that lifts on an
            answer is the thing that was chosen, and the ring hugs the claim rather
            than a transparent box laid over it. */}
        {PL_Y.map((py, k) => (
          <Target
            key={py}
            id={PL_ID[k]}
            correct={k === 1}
            picked={picked}
            onPick={onPick}
            disabled={!live || answered}
            style={[styles.hit, { top: py }]}
          >
            {k === 1 ? (
              <Animated.View style={[styles.cut, cutStyle]} pointerEvents="none">
                <Half S={SCENE} side={0} shown={answered} />
                <Half S={SCENE} side={1} shown={answered} />
                <Animated.View style={[styles.patch, patchStyle]}>
                  <Text style={styles.patchText}>EXCEPT THIS ONE</Text>
                </Animated.View>
              </Animated.View>
            ) : (
              <View
                style={[styles.plank, answered && picked === PL_ID[k] && styles.plankWrong]}
                pointerEvents="none"
              >
                <Text style={styles.plankText}>{PL_CAP[k]}</Text>
              </View>
            )}
          </Target>
        ))}
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

/** One half of the sawn plank, hinged at its outer end and carrying its own words. */
function Half({ S, side, shown }: { S: SharedValue<any>; side: number; shown: boolean }) {
  const st = useAnimatedStyle(() => {
    const d = S.value.snap * (1 - S.value.mend);
    return { transform: [{ rotate: `${(side === 0 ? 13 : -13) * d}deg` }, { translateY: 7 * d }] };
  });
  return (
    <Animated.View
      style={[
        styles.half,
        { left: side * HALF_W, transformOrigin: side === 0 ? '0% 50%' : '100% 50%' },
        shown && styles.halfMarked,
        st,
      ]}
    >
      <Text style={[styles.halfText, side === 0 ? styles.halfLeft : styles.halfRight]}>{HALF_CAP[side]}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON — political7 and political8 both stand
  // their subject on a filled mass rather than on bare page.
  floor: { position: 'absolute', left: 0, right: 0, top: GROUND, bottom: 0, backgroundColor: RULE },

  cap: {
    position: 'absolute', left: 138, top: CAP_T, width: 250,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },

  post: {
    position: 'absolute', top: POST_Y, width: POST_W, height: POST_H,
    borderWidth: 1.5, borderColor: INK, borderRadius: 2, backgroundColor: STONE,
  },

  plank: {
    position: 'absolute', left: 0, top: 0, width: PL_W, height: PL_H,
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: STONE,
  },
  plankWrong: { borderColor: SOFT, borderStyle: 'dashed' },
  cut: { position: 'absolute', left: 0, top: 0, width: PL_W, height: PL_H },
  plankText: {
    position: 'absolute', left: 0, top: 9, width: PL_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.8, color: INK, includeFontPadding: false,
  },

  half: {
    position: 'absolute', top: 0, width: HALF_W, height: PL_H,
    borderWidth: 2, borderColor: INK, backgroundColor: STONE,
  },
  halfMarked: { borderWidth: 3 },
  halfText: {
    position: 'absolute', left: 0, top: 9, width: HALF_W,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.8, color: INK, includeFontPadding: false,
  },
  halfLeft: { textAlign: 'right', paddingRight: 5 },
  halfRight: { textAlign: 'left', paddingLeft: 5 },

  patch: {
    position: 'absolute', left: (PL_W - PATCH_W) / 2, top: 5, width: PATCH_W, height: 20,
    borderWidth: 1.5, borderColor: INK, borderRadius: 3, backgroundColor: PAPER,
  },
  patchText: {
    position: 'absolute', left: 0, top: 5, width: PATCH_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.5, color: INK, includeFontPadding: false,
  },

  blade: {
    position: 'absolute', left: PL_X, top: BLADE_Y, width: BLADE_W, height: 18,
    borderRadius: 3, backgroundColor: INK,
  },
  bladeText: {
    position: 'absolute', left: 0, top: 4, width: BLADE_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.8, color: PAPER, includeFontPadding: false,
  },

  hit: { position: 'absolute', left: PL_X, width: PL_W, height: PL_H },
});

export function Logic39Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Logic39Scene} band={[230, 512]} camera={CAM} />;
}
