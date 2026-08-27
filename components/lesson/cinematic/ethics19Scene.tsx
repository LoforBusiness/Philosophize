import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, moveTr, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './ethics19Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER,
  useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// A FORM WITH FOUR LINES ON IT, AND THE WRONG NAME IN THREE OF THE SLOTS.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the FORM is 288 wide at x 56…344, y 228…356, a 2-thick ink rule under its
//   header only — the rows themselves are separated by hairlines so the header
//   is the heaviest line and the eye starts there.
// · THREE COLUMNS, and they are the argument: DECISION at x 66 (150 wide),
//   AFFECTS at x 226 (48, centred), SIGNED BY at x 280 (58).
// · FOUR ROWS, 26 tall, at y 260 · 286 · 312 · 338. The third — driving after
//   drinking — is the only one whose AFFECTS cell holds a filled disc; the other
//   three hold a hollow ring. That one mark is the whole test, drawn beside
//   every row from the beat it appears, so the reader can run it themselves.
// · the SIGNED-BY chips are 58×16. Three fill with THE STATE and one with MINE,
//   and which is which is deliberately NOT the answer to the question — two of
//   the state's three signatures are on lines it had no business signing.
// · the FIGURE walks x 200 → 132 → 268 on GROUND 500; crown ≈ 397, and the form
//   ends at y 356, so 41 clear units sit between them at every stop.
//
// Ink runs y 228 (the form's top rule) … y 500. BAND 222…512 = 290, putting the
// 103-unit figure at 36%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const FORM_X = 56;
const FORM_Y = 228;
const FORM_W = 288;

const COL_DEC = 66;
const COL_AFF = 226;
const COL_SIG = 280;

const ROW_Y = [260, 286, 312, 338];
const ROW_H = 26;

const ROWS = [
  { id: 'eat', label: 'What you eat', others: false, sig: 'THE STATE' },
  { id: 'helmet', label: 'Riding with no helmet', others: false, sig: 'THE STATE' },
  { id: 'drive', label: 'Driving after drinking', others: true, sig: 'THE STATE' },
  { id: 'refuse', label: 'Refusing your treatment', others: false, sig: 'MINE' },
] as const;

const FIG_X = 200;

const X = BEATS.map((b) => b.x ?? FIG_X);
const P = BEATS.map((b) => b.p ?? 0);
const DOC = BEATS.map((b) => b.doc ?? 0);
const ROWSV = BEATS.map((b) => b.rows ?? 0);
const AFFECTS = BEATS.map((b) => b.affects ?? 0);
const TAKEN = BEATS.map((b) => b.taken ?? 0);
const LIVE = BEATS.map((b) => b.live ?? 0);

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.drag ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('ethics19'));

export default function Ethics19Scene({ clock, bt, bi, i, picked, onPick, dragPos }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldFig = useHeld();
  const cv = useCarry(5);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    // A WALKING BEAT TAKES AS LONG AS THE WALK NEEDS (rig.moveTr). A fixed length
    // here sprinted every long journey and left the footfalls — which the player
    // computes from moveTr — arriving after the figure had stopped.
    const tr = ease01(bt.value / moveTr(X[p], X[n], BASE_TR));
    const t = clock.value;

    const figS = keepHeld(heldFig, travelStance(
      X[p], X[n],
      carryFrom(heldFig, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));

    return {
      fig: pose(figS, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, 1, 1),
      doc: carry(cv, 1, n, DOC[p], DOC[n], tr),
      rows: carry(cv, 2, n, ROWSV[p], ROWSV[n], tr),
      affects: carry(cv, 3, n, AFFECTS[p], AFFECTS[n], tr),
      // R7b — the knob signs somebody else's name. Drag toward SAVE THEM ANYWAY and
      // another hand fills the slots on a form about one person, which is what
      // overriding a competent refusal actually looks like.
      taken: carry(cv, 4, n, TAKEN[p], reacting ? dragPos.value : TAKEN[n], tr),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const docStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.doc }));

  return (
    <View style={styles.scene}>
      <Animated.View style={[StyleSheet.absoluteFill, docStyle]}>
        <View style={styles.headRule} pointerEvents="none" />
        <Text style={[styles.head, { left: COL_DEC, width: 150 }]}>DECISION</Text>
        <Text style={[styles.head, { left: COL_AFF, width: 48, textAlign: 'center' }]}>AFFECTS</Text>
        <Text style={[styles.head, { left: COL_SIG, width: 58, textAlign: 'center' }]}>SIGNED BY</Text>

        {ROWS.map((r, k) => (
          <Row key={r.id} S={SCENE} index={k} />
        ))}

        {ROWS.map((r, k) => (
          <Target
            key={`t-${r.id}`}
            id={r.id}
            correct={r.others}
            picked={picked}
            onPick={onPick}
            disabled={!live || answered}
            style={[styles.hit, { top: ROW_Y[k] }]}
          >
            <View
              style={[
                styles.hitBox,
                answered && r.others && styles.hitRight,
                answered && picked === r.id && !r.others && styles.hitWrong,
              ]}
              pointerEvents="none"
            />
          </Target>
        ))}
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

/**
 * One line of the form. The AFFECTS mark and the signature come up on their own
 * tracks, so the reader meets the decisions first, then who signed them, then
 * the column that decides whether that was allowed.
 */
function Row({ S, index }: { S: { value: { rows: number; affects: number; taken: number } }; index: number }) {
  const r = ROWS[index];
  const top = ROW_Y[index];
  const rowStyle = useAnimatedStyle(() => ({ opacity: clamp01(S.value.rows * 4 - index) }));
  const affStyle = useAnimatedStyle(() => ({ opacity: S.value.affects }));
  // MINE is written by the person and is there as soon as the row is; only the
  // three the state took arrive on `taken`.
  const sigStyle = useAnimatedStyle(() => ({
    opacity: r.sig === 'MINE' ? clamp01(S.value.rows * 4 - index) : S.value.taken,
  }));
  return (
    <Animated.View pointerEvents="none" style={rowStyle}>
      <View style={[styles.rowRule, { top: top + ROW_H }]} />
      <Text style={[styles.dec, { top: top + 7 }]} numberOfLines={1} pointerEvents="none">{r.label}</Text>
      <Animated.View style={[styles.affWrap, { top: top + 8 }, affStyle]}>
        <View style={r.others ? styles.affOthers : styles.affSelf} />
      </Animated.View>
      <Animated.View style={[styles.sig, { top: top + 5 }, sigStyle]}>
        <Text style={[styles.sigText, r.sig === 'MINE' && styles.sigMine]}>{r.sig}</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON. A rule on its own leaves the
  // figure and everything it is looking at standing on bare page;
  // political7 and political8 both stand their subject on a filled mass.
  floor: { position: 'absolute', left: 0, right: 0, top: GROUND, bottom: 0, backgroundColor: RULE },

  headRule: { position: 'absolute', left: FORM_X, top: FORM_Y + 20, width: FORM_W, height: 2, backgroundColor: INK },
  head: {
    position: 'absolute', top: FORM_Y + 6,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.2, color: SOFT, includeFontPadding: false,
  },

  rowRule: { position: 'absolute', left: FORM_X, width: FORM_W, height: 1, backgroundColor: RULE },
  dec: {
    position: 'absolute', left: COL_DEC, width: 150,
    fontFamily: 'Inter_400Regular', fontSize: 10.5, color: INK, includeFontPadding: false,
  },
  affWrap: { position: 'absolute', left: COL_AFF, width: 48, alignItems: 'center' },
  affSelf: { width: 10, height: 10, borderRadius: 5, borderWidth: 1.5, borderColor: SOFT },
  affOthers: { width: 10, height: 10, borderRadius: 5, backgroundColor: INK },

  sig: {
    position: 'absolute', left: COL_SIG, width: 58, height: 16,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: SOFT, borderRadius: 2, backgroundColor: PAPER,
  },
  sigText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.7, color: SOFT, includeFontPadding: false,
  },
  sigMine: { color: INK },

  hit: { position: 'absolute', left: FORM_X, width: FORM_W, height: ROW_H },
  hitBox: { width: FORM_W, height: ROW_H, borderRadius: 3 },
  hitRight: { borderWidth: 2.5, borderColor: INK },
  hitWrong: { borderWidth: 1.5, borderColor: SOFT, borderStyle: 'dashed', opacity: 0.5 },
});

export function Ethics19Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Ethics19Scene} band={[222, 512]} camera={CAM} />;
}
