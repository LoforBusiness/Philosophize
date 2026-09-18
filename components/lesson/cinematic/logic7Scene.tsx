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
import { BEATS } from './logic7Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, PAPER, useHeld, carryFrom, keepHeld, facing, useCarry, carry, lookPose,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { floorStyle, lipOf, PLATE_FACE } from './stageSkin';
import { followMoves, kindOf, seedOf } from './camera';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';

// THE STAGE IS STRUCK IN THIS LESSON'S OWN BRANCH HUE (./stageTones).
// Same three tones, same luminance to the third decimal — so every contrast
// measured against the old greys still holds and nothing on the stage moved.
const TONE = stageTone('logic');
const { RULE, STONE, SHADE } = TONE;
const LIP = lipOf(TONE);   // the ledge a toned plate stands on (scripts/skin-stage.mjs)

// A classroom whiteboard on an easel, stage right. The figure walks over to it,
// taps the rule up, writes the fact, then steps back downstage so the whole board
// is readable. Q1 is answered ON the board — tap the card that must follow.
//
// Composition rule: the board occupies x ≥ 220 and the figure never stands past
// x = 176, so the working hand just reaches the frame and the figure NEVER covers
// what it is teaching from.

const BOARD_L = 210;
const BOARD_W = 180;
const BOARD_T = 196;
const BOARD_B = 452;
const PADX = 10;
const CARD_W = BOARD_W - PADX * 2;

const RULE_T = 222;
const FACT_T = 292;
const CONCL_T = 334;
// These three sit ON the whiteboard, between the rule above them and the board's
// bottom edge at 452, so unlike the other stacks they cannot simply be spread —
// there is nowhere for them to go without redrawing the board. 35 on a 41 pitch is
// 32dp on a 37dp pitch, short of the ~45dp a fingertip covers; the slop below at
// least makes the 6-unit gutter between them live, so a tap can no longer land in
// dead space. Widening the board is the real fix and is a composition change.
const PICK_T = 332;
const ROW_H = 35;
const PICK_GAP = 41;
/** Half the gap — more would overlap the neighbour, and the topmost would win. */
const PICK_SLOP = (PICK_GAP - ROW_H) / 2;

const FACTS = ['', 'IT IS RAINING', 'STREETS ARE DRY'];
const CONCLS = ['', 'SO: STREETS ARE WET', 'SO: NO RAIN'];

const CARDS = [
  { id: 'wet', label: 'STREETS ARE WET', correct: true },
  { id: 'norain', label: 'IT IS NOT RAINING', correct: false },
  { id: 'none', label: 'NOTHING FOLLOWS', correct: false },
];

const P = BEATS.map((b) => b.p ?? 0);
const X = BEATS.map((b) => b.x ?? 124);
// The camera, from the staging: it follows the figure this track describes,
// pulls back to scale 1 on every graded beat so a tap lands where it is aimed,
// and leans in on the quote. See followMoves in ./camera.ts.
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('logic7'));
const DIR = dirsFrom(X, 1);
const RULEV = BEATS.map((b) => b.rule ?? 0);
const FLOW = BEATS.map((b) => b.flow ?? 0);
const BRACE = BEATS.map((b) => b.brace ?? 0);
const TAG = BEATS.map((b) => b.tag ?? 0);

// WHERE THE TOKEN TRAVELS, per `flow` setting: [from x, from y, to x, to y] in stage
// units, read off the board's own geometry above rather than typed as literals, so
// moving a card moves the path with it.
const RULE_MID = RULE_T + 22;
const FLOW_PATH = [
  [0, 0, 0, 0],
  [BOARD_L + PADX + 20, RULE_T + 8, BOARD_L + PADX + 20, RULE_T + 44],
  [BOARD_L + PADX + 20, FACT_T + 10, BOARD_L + PADX + 20, CONCL_T + 12],
  [BOARD_L + PADX + 20, FACT_T + 10, BOARD_L + PADX + 20, RULE_T + 8],
];

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.sort ? 1 : 0));

export default function Logic7Scene({ clock, bt, bi, i, picked, onPick, pickPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldS = useHeld();
  const cv = useCarry(4);
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;

  // A row only fades in on the beat that CHANGES it; otherwise it stays solid, so
  // the board doesn't re-animate every time the reader taps forward.
  const ruleFade = (cur.rule ?? 0) !== (prev?.rule ?? 0);
  const factFade = (cur.fact ?? 0) !== (prev?.fact ?? 0);
  const conclFade = (cur.concl ?? 0) !== (prev?.concl ?? 0);
  const factOn = (cur.fact ?? 0) > 0;
  const conclOn = (cur.concl ?? 0) > 0;
  // THE TOKEN RUNS ONCE, ON THE BEAT THAT ASKS FOR IT (C20c). `flow` changing is
  // what starts it; a beat that merely holds the same value draws nothing, so the
  // board does not re-animate on every tap.
  const flowNow = (cur.flow ?? 0) > 0 && (cur.flow ?? 0) !== (prev?.flow ?? 0) ? (cur.flow ?? 0) : 0;
  const braceFade = (cur.brace ?? 0) !== (prev?.brace ?? 0);
  const tagFade = (cur.tag ?? 0) !== (prev?.tag ?? 0);

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
      fig: lookPose(s, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1, gazeX.value, gazeY.value, gazeOn.value),
      // R7b — the arm leans on the rule. The far setting says the dry street settles
      // it outright, and it is the rule on the board that licenses that, so the rule
      // firms up as the reader arrives at the verdict it makes possible.
      rule: carry(cv, 1, n, RULEV[p], reacting ? pickPos.value : RULEV[n], tr, ruleFade ? grow : 1),
      fact: factOn ? (factFade ? grow : 1) : 0,
      concl: conclOn ? (conclFade ? grow : 1) : 0,
      // THE TOKEN'S OWN PROGRESS, 0..1 across 1.1s of the beat it belongs to, and
      // flatly 0 on every other beat. It rides `bt` because it IS the tap's event:
      // one journey per tap, not a loop.
      flow: flowNow ? ease01(bt.value / 1.1) : 0,
      brace: carry(cv, 2, n, BRACE[p], BRACE[n], braceFade ? grow : 1),
      tag: carry(cv, 3, n, TAG[p], TAG[n], tagFade ? grow : 1),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const ruleStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.rule }));
  const factStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.fact,
    transform: [{ translateX: (1 - SCENE.value.fact) * -10 }],
  }));
  const conclStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.concl,
    transform: [{ translateX: (1 - SCENE.value.concl) * -10 }],
  }));
  // The token: it fades in over the first fifth of its journey and out over the
  // last, so it arrives rather than stopping dead, and it is invisible at rest.
  const flowStyle = useAnimatedStyle(() => {
    const u = SCENE.value.flow;
    const P0 = FLOW_PATH[flowNow] ?? FLOW_PATH[0];
    const on = u <= 0 || u >= 1 ? 0 : Math.min(1, Math.min(u, 1 - u) / 0.2);
    return {
      opacity: on,
      transform: [
        { translateX: P0[0] + (P0[2] - P0[0]) * u },
        { translateY: P0[1] + (P0[3] - P0[1]) * u },
      ],
    };
  });
  const braceStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.brace }));
  const tagStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.tag,
    transform: [{ translateY: (1 - SCENE.value.tag) * -6 }],
  }));

  const answered = picked !== null;
  const showPick = (cur.pick ?? 0) > 0 && !!cur.interact;

  return (
    <Animated.View style={styles.scene}>
      {/* ── the whiteboard on its easel ─────────────────────────────────────── */}
      <View style={styles.legL} pointerEvents="none" />
      <View style={styles.legR} pointerEvents="none" />
      <View style={styles.board} pointerEvents="none" />
      <View style={styles.tray} pointerEvents="none" />
      <Text style={styles.boardLabel}>THE RULE</Text>

      {/* the IF → THEN rule, written up top */}
      <Animated.View style={[styles.ruleBox, ruleStyle]} pointerEvents="none">
        <Text style={styles.ruleLine}>IF it rains</Text>
        <Text style={styles.ruleArrow}>↓</Text>
        <Text style={styles.ruleLine}>THEN streets wet</Text>
      </Animated.View>

      {/* the fact the figure writes underneath */}
      {/* The brace that gathers the two premises, and the empty slot under them. */}
      <Animated.View style={[styles.braceWrap, braceStyle]} pointerEvents="none">
        <View style={styles.braceSpine} />
        <View style={styles.braceTop} />
        <View style={styles.braceBot} />
        <View style={styles.braceArm} />
        <View style={styles.slot} />
      </Animated.View>

      <Animated.View style={[styles.factCard, factStyle]} pointerEvents="none">
        <Text style={styles.factText}>{FACTS[cur.fact ?? 0]}</Text>
      </Animated.View>

      {/* the conclusion it forces */}
      {conclOn && (
        <Animated.View style={[styles.conclCard, conclStyle]} pointerEvents="none">
          <Text style={styles.conclText}>{CONCLS[cur.concl ?? 0]}</Text>
        </Animated.View>
      )}

      {/* The tag that lands on the second premise when it changes. */}
      <Animated.View style={[styles.tag, tagStyle]} pointerEvents="none">
        <Text style={styles.tagText}>2ND PREMISE</Text>
      </Animated.View>

      {/* The token that runs the inference along the board. */}
      <Animated.View style={[styles.token, flowStyle]} pointerEvents="none" />

      {/* ── Q1: tap the card that must follow, right on the board ───────────── */}
      {showPick &&
        CARDS.map((c, k) => {
          const chosen = picked === c.id;
          return (
            <Target id={c.id} correct={c.correct} picked={picked} onPick={onPick}
              key={c.id} style={[styles.pickCard, { top: PICK_T + k * PICK_GAP }]} hitSlop={{ top: PICK_SLOP, bottom: PICK_SLOP, left: PICK_SLOP, right: PICK_SLOP }} disabled={answered}>
              <View
                style={[
                  styles.pickInner,
                  answered && c.correct && styles.pickRight,
                  answered && chosen && !c.correct && styles.pickWrong,
                ]}
              >
                <Text style={[styles.pickText, answered && c.correct && styles.pickTextOn]}>{c.label}</Text>
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

  board: {
    position: 'absolute', left: BOARD_L, top: BOARD_T, width: BOARD_W, height: BOARD_B - BOARD_T,
    borderWidth: 2.5, borderColor: INK, borderRadius: 8, backgroundColor: PAPER,
  },
  tray: { position: 'absolute', left: BOARD_L + 8, top: BOARD_B - 3, width: BOARD_W - 16, height: 5, backgroundColor: INK, borderRadius: 2 },
  legL: { position: 'absolute', left: BOARD_L + 26, top: BOARD_B - 6, width: 3, height: GROUND - BOARD_B + 6, backgroundColor: SOFT, transform: [{ rotate: '7deg' }] },
  legR: { position: 'absolute', left: BOARD_L + BOARD_W - 29, top: BOARD_B - 6, width: 3, height: GROUND - BOARD_B + 6, backgroundColor: SOFT, transform: [{ rotate: '-7deg' }] },
  boardLabel: {
    position: 'absolute', left: BOARD_L, top: BOARD_T + 8, width: BOARD_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.6, color: SOFT,
    includeFontPadding: false,
  },

  ruleBox: {
    position: 'absolute', left: BOARD_L + PADX, top: RULE_T, width: CARD_W,
    borderWidth: 2, borderColor: INK, borderRadius: 4, paddingVertical: 6, alignItems: 'center',
  },
  ruleLine: { fontFamily: 'Inter_700Bold', fontSize: 12.5, color: INK,
    includeFontPadding: false,
  },
  ruleArrow: { fontFamily: 'Inter_700Bold', fontSize: 13, color: INK, lineHeight: 15,
    includeFontPadding: false,
  },

  // ── the three tap events (group AH) ────────────────────────────────────────
  //
  // The token is the inference itself moving along the board, so it is INK and the
  // size of a full stop: anything larger reads as an object rather than as the
  // claim travelling. The brace and the tag are drawn in the kit (white face on a
  // shaded ledge) because both carry a word.
  token: {
    position: 'absolute', left: 0, top: 0, width: 7, height: 7, borderRadius: 3.5,
    backgroundColor: INK,
  },

  braceWrap: { position: "absolute", left: 0, top: 0, width: STAGE_W, height: STAGE_H },
  // A brace is a spine with two turned ends and an arm reaching out of its middle —
  // four rules rather than a glyph, so it scales with the cards it gathers.
  braceSpine: {
    position: 'absolute', left: BOARD_L + PADX - 8, top: RULE_T + 4, width: 2,
    height: (FACT_T + ROW_H) - (RULE_T + 4), backgroundColor: SHADE,
  },
  braceTop: {
    position: 'absolute', left: BOARD_L + PADX - 8, top: RULE_T + 4, width: 6, height: 2,
    backgroundColor: SHADE,
  },
  braceBot: {
    position: 'absolute', left: BOARD_L + PADX - 8, top: FACT_T + ROW_H - 2, width: 6, height: 2,
    backgroundColor: SHADE,
  },
  braceArm: {
    position: 'absolute', left: BOARD_L + PADX - 14, top: RULE_MID + 26, width: 6, height: 2,
    backgroundColor: SHADE,
  },
  // …and the slot the conclusion has not filled yet: an outline, never a fill, so
  // it reads as a gap rather than as another card (D31 — a dashed edge is a
  // boundary, and check:shade would count a fill here as a mass).
  slot: {
    position: 'absolute', left: BOARD_L + PADX, top: CONCL_T, width: CARD_W, height: ROW_H,
    borderWidth: 1.5, borderColor: SHADE, borderRadius: 8, borderStyle: 'dashed',
  },

  tag: {
    position: 'absolute', left: BOARD_L + PADX + 6, top: FACT_T - 13, paddingHorizontal: 5,
    paddingVertical: 1.5, borderWidth: 1.5, borderColor: INK, borderRadius: 5,
    backgroundColor: PLATE_FACE, boxShadow: LIP,
  },
  tagText: { fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 0.6, color: INK,
    includeFontPadding: false,
  },

  factCard: {
    position: 'absolute', left: BOARD_L + PADX, top: FACT_T, width: CARD_W, height: ROW_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: INK,
    alignItems: 'center', justifyContent: 'center',
  },
  factText: { fontFamily: 'Inter_700Bold', fontSize: 13, letterSpacing: 0.3, color: PAPER,
    includeFontPadding: false,
  },

  conclCard: {
    position: 'absolute', left: BOARD_L + PADX, top: CONCL_T, width: CARD_W, height: ROW_H,
    borderWidth: 2, borderColor: INK, borderRadius: 8, backgroundColor: PLATE_FACE, boxShadow: LIP,
    alignItems: 'center', justifyContent: 'center',
  },
  conclText: { fontFamily: 'Inter_700Bold', fontSize: 13, letterSpacing: 0.3, color: INK,
    includeFontPadding: false,
  },

  pickCard: { position: 'absolute', left: BOARD_L + PADX, width: CARD_W },
  pickInner: {
    height: ROW_H, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PLATE_FACE, boxShadow: LIP,
    alignItems: 'center', justifyContent: 'center',
  },
  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT },
  pickText: { fontFamily: 'Inter_700Bold', fontSize: 13, letterSpacing: 0.3, color: INK,
    includeFontPadding: false,
  },
  pickTextOn: { color: PAPER },
});

// Art lives from the board's top edge (196) down to the ground line (500); nothing
// is drawn above or below, so the player crops to that and the whole scene renders
// about 70% larger than the letterboxed full-height fit.
export function Logic7Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Logic7Scene} band={[184, 512]} camera={CAM} />;
}
