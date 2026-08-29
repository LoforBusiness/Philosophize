import {
  View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import {
  WALK, dirsFrom, ease01, lerp, moveTr, pose, travelStance, type Bundle, } from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './logic22Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, facing, useCarry, carry,
} from './cinematicKit';
import { followMoves, kindOf, seedOf } from './camera';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';

// A claim card over a field of eighteen cats, stage right; the figure downstage left.
//
// · figure WALKS x = 70 → 168 → 124; body span x ± 36, widest x 132…204 at 168, and
//   the fist at gesture 41 reaches x 204.5. All board ink is at x ≥ 216.
// · claim y 226…262 · field y 276…352 · answer stack y 366…474 on a 38 pitch.
//   A standing crown is y 397; the lower two answer cards share that height band but
//   never the figure's x.
// · A5 — the board is above the figure's reach (its hand tops out at y 411, B11b).
//   It is read, never handled, and no beat's text claims contact.

const BD_L = 216;
const BD_W = 176;

const CLAIM_T = 226;
const CLAIM_H = 36;

const COLS = 6;
const ROWS = 3;
const DOT = 20;
const DOT_GX = 11.2;
const DOT_GY = 8;
const FIELD_T = 276;

const ANS_T = 366;
const ANS_H = 32;
const ANS_PITCH = 38;
const ANS_SLOP = (ANS_PITCH - ANS_H) / 2;

/** The one that goes hollow. Middle of the field, so it is not mistaken for an edge. */
const ODD = 8;

const ANSWERS = [
  { id: 'contra', label: 'ALL BLACK  ·  SOME NOT BLACK', correct: true },
  { id: 'compat', label: 'SOME BLACK  ·  SOME NOT BLACK', correct: false },
  { id: 'contrary', label: 'ALL BLACK  ·  NONE BLACK', correct: false },
];

const P = BEATS.map((b) => b.p ?? 0);
const X = BEATS.map((b) => b.x ?? 124);
// The camera, from the staging: it follows the figure this track describes,
// pulls back to scale 1 on every graded beat so a tap lands where it is aimed,
// and leans in on the quote. See followMoves in ./camera.ts.
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('logic22'));
const DIR = dirsFrom(X, 1);
const CLAIM = BEATS.map((b) => b.claim ?? 0);
const FIELD = BEATS.map((b) => b.field ?? 0);

function dotLeft(k: number) { return BD_L + (k % COLS) * (DOT + DOT_GX); }
function dotTop(k: number) { return FIELD_T + Math.floor(k / COLS) * (DOT + DOT_GY); }

export default function Logic22Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldS = useHeld();
  const cv = useCarry(3);
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;

  const claimFade = (cur.claim ?? 0) !== (prev?.claim ?? 0);
  const fieldFade = (cur.field ?? 0) !== (prev?.field ?? 0);
  const oddOn = (cur.odd ?? 0) > 0;
  const oddFade = (cur.odd ?? 0) !== (prev?.odd ?? 0);
  const deadOn = (cur.dead ?? 0) > 0;
  const deadFade = (cur.dead ?? 0) !== (prev?.dead ?? 0);

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / moveTr(X[p], X[n], 0.85));
    const t = clock.value;
    const grow = ease01(bt.value / 0.55);

    const s = keepHeld(heldS, travelStance(
      X[p], X[n],
      carryFrom(heldS, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));
    return {
      fig: pose(s, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1),
      claim: carry(cv, 1, n, CLAIM[p], CLAIM[n], tr, claimFade ? grow : 1),
      field: carry(cv, 2, n, FIELD[p], FIELD[n], tr, fieldFade ? grow : 1),
      odd: oddOn ? (oddFade ? grow : 1) : 0,
      dead: deadOn ? (deadFade ? grow : 1) : 0,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const claimStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.claim }));
  const fieldStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.field }));
  // The counterexample EMPTIES rather than moving: the field is otherwise untouched,
  // which is the point — seventeen black cats and the claim is still gone.
  const oddStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.odd }));
  const strikeStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: SCENE.value.dead }] }));

  const answered = picked !== null;
  const showPick = (cur.pick ?? 0) > 0 && !!cur.interact;

  return (
    <Animated.View style={styles.scene}>
      <Animated.View style={[styles.claim, claimStyle]} pointerEvents="none">
        <Text style={styles.claimText} numberOfLines={1}>ALL CATS ARE BLACK</Text>
        <Animated.View style={[styles.strike, strikeStyle]} />
      </Animated.View>

      <Animated.View style={[styles.fieldWrap, fieldStyle]} pointerEvents="none">
        {Array.from({ length: COLS * ROWS }, (_, k) => (
          <View key={k} style={[styles.dot, { left: dotLeft(k), top: dotTop(k) }]} />
        ))}
        {/* the exception, drawn OVER its own dot so the field beneath is untouched */}
        <Animated.View
          style={[styles.dotHollow, { left: dotLeft(ODD), top: dotTop(ODD) }, oddStyle]}
        />
      </Animated.View>

      {showPick &&
        ANSWERS.map((a, k) => {
          const chosen = picked === a.id;
          return (
            <Target id={a.id} correct={a.correct} picked={picked} onPick={onPick}
              key={a.id} style={[styles.ans, { top: ANS_T + k * ANS_PITCH }]} hitSlop={{ top: ANS_SLOP, bottom: ANS_SLOP, left: ANS_SLOP, right: ANS_SLOP }} disabled={answered}>
              <View
                style={[
                  styles.ansInner,
                  answered && a.correct && styles.pickRight,
                  answered && chosen && !a.correct && styles.pickWrong,
                ]}
              >
                <Text
                  style={[styles.ansText, answered && a.correct && styles.onInk]}
                  numberOfLines={1}
                >
                  {a.label}
                </Text>
              </View>
            </Target>
          );
        })}

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 24, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON. A rule on its own leaves the
  // figure and everything it is looking at standing on bare page;
  // political7 and political8 both stand their subject on a filled mass.
  floor: { position: 'absolute', left: 0, right: 0, top: GROUND, bottom: 0, backgroundColor: RULE },

  claim: {
    position: 'absolute', left: BD_L, top: CLAIM_T, width: BD_W, height: CLAIM_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: STONE,
    alignItems: 'center', justifyContent: 'center',
  },
  claimText: {
    fontFamily: 'Inter_700Bold', fontSize: 12.5, letterSpacing: 0.4, color: INK,
    includeFontPadding: false,
  },
  strike: {
    position: 'absolute', left: 10, right: 10, height: 2.5, backgroundColor: INK,
    transformOrigin: '0% 50%',
  },

  fieldWrap: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H },
  dot: {
    position: 'absolute', width: DOT, height: DOT, borderRadius: DOT / 2, backgroundColor: INK,
  },
  dotHollow: {
    position: 'absolute', width: DOT, height: DOT, borderRadius: DOT / 2,
    backgroundColor: PAPER, borderWidth: 2.5, borderColor: INK,
  },

  ans: { position: 'absolute', left: BD_L, width: BD_W },
  ansInner: {
    height: ANS_H, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: STONE,
    alignItems: 'center', justifyContent: 'center',
  },
  ansText: {
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 0, color: INK,
    includeFontPadding: false,
  },
  onInk: { color: PAPER },
  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT },
});

// Ink runs from the claim card (226) to the ground line (500). Band 220…512 = 292 (H59).
export function Logic22Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Logic22Scene} band={[220, 512]} camera={CAM} />;
}
