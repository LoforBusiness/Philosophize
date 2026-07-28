import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import {
  WALK, dirsFrom, ease01, emoteHold, emoteLive, lerp, moveTr, pose, travelStance, type Bundle,
} from './rig';
import { BEATS } from './logic7Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';

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
const PICK_T = 332;
const ROW_H = 35;
const PICK_GAP = 41;

const FACTS = ['', 'IT IS RAINING', 'STREETS ARE DRY'];
const CONCLS = ['', 'SO: STREETS ARE WET', 'SO: NO RAIN'];

const CARDS = [
  { id: 'wet', label: 'STREETS ARE WET', correct: true },
  { id: 'norain', label: 'IT IS NOT RAINING', correct: false },
  { id: 'none', label: 'NOTHING FOLLOWS', correct: false },
];

const P = BEATS.map((b) => b.p ?? 0);
const X = BEATS.map((b) => b.x ?? 124);
const DIR = dirsFrom(X, 1);
const RULEV = BEATS.map((b) => b.rule ?? 0);

export default function Logic7Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;

  // A row only fades in on the beat that CHANGES it; otherwise it stays solid, so
  // the board doesn't re-animate every time the reader taps forward.
  const ruleFade = (cur.rule ?? 0) !== (prev?.rule ?? 0);
  const factFade = (cur.fact ?? 0) !== (prev?.fact ?? 0);
  const conclFade = (cur.concl ?? 0) !== (prev?.concl ?? 0);
  const factOn = (cur.fact ?? 0) > 0;
  const conclOn = (cur.concl ?? 0) > 0;

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / moveTr(X[p], X[n], 0.85));
    const t = clock.value;
    const grow = ease01(bt.value / 0.55);

    const s = travelStance(
      X[p], X[n],
      emoteHold(P[p], t), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    );
    return {
      fig: pose(s, lerp(X[p], X[n], tr), GROUND, K_FIG, DIR[n], 1),
      rule: lerp(RULEV[p], RULEV[n], tr) * (ruleFade ? grow : 1),
      fact: factOn ? (factFade ? grow : 1) : 0,
      concl: conclOn ? (conclFade ? grow : 1) : 0,
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
      <Animated.View style={[styles.factCard, factStyle]} pointerEvents="none">
        <Text style={styles.factText}>{FACTS[cur.fact ?? 0]}</Text>
      </Animated.View>

      {/* the conclusion it forces */}
      {conclOn && (
        <Animated.View style={[styles.conclCard, conclStyle]} pointerEvents="none">
          <Text style={styles.conclText}>{CONCLS[cur.concl ?? 0]}</Text>
        </Animated.View>
      )}

      {/* ── Q1: tap the card that must follow, right on the board ───────────── */}
      {showPick &&
        CARDS.map((c, k) => {
          const chosen = picked === c.id;
          return (
            <Pressable
              key={c.id}
              style={[styles.pickCard, { top: PICK_T + k * PICK_GAP }]}
              disabled={answered}
              onPress={() => onPick(c.id, c.correct)}
            >
              <View
                style={[
                  styles.pickInner,
                  answered && c.correct && styles.pickRight,
                  answered && chosen && !c.correct && styles.pickWrong,
                ]}
              >
                <Text style={[styles.pickText, answered && c.correct && styles.pickTextOn]}>{c.label}</Text>
              </View>
            </Pressable>
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
    borderWidth: 2.5, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
  },
  tray: { position: 'absolute', left: BOARD_L + 8, top: BOARD_B - 3, width: BOARD_W - 16, height: 5, backgroundColor: INK, borderRadius: 2 },
  legL: { position: 'absolute', left: BOARD_L + 26, top: BOARD_B - 6, width: 3, height: GROUND - BOARD_B + 6, backgroundColor: SOFT, transform: [{ rotate: '7deg' }] },
  legR: { position: 'absolute', left: BOARD_L + BOARD_W - 29, top: BOARD_B - 6, width: 3, height: GROUND - BOARD_B + 6, backgroundColor: SOFT, transform: [{ rotate: '-7deg' }] },
  boardLabel: {
    position: 'absolute', left: BOARD_L, top: BOARD_T + 8, width: BOARD_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.6, color: SOFT,
  },

  ruleBox: {
    position: 'absolute', left: BOARD_L + PADX, top: RULE_T, width: CARD_W,
    borderWidth: 2, borderColor: INK, borderRadius: 4, paddingVertical: 6, alignItems: 'center',
  },
  ruleLine: { fontFamily: 'Inter_700Bold', fontSize: 12.5, color: INK },
  ruleArrow: { fontFamily: 'Inter_700Bold', fontSize: 13, color: INK, lineHeight: 15 },

  factCard: {
    position: 'absolute', left: BOARD_L + PADX, top: FACT_T, width: CARD_W, height: ROW_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: INK,
    alignItems: 'center', justifyContent: 'center',
  },
  factText: { fontFamily: 'Inter_700Bold', fontSize: 13, letterSpacing: 0.3, color: PAPER },

  conclCard: {
    position: 'absolute', left: BOARD_L + PADX, top: CONCL_T, width: CARD_W, height: ROW_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  conclText: { fontFamily: 'Inter_700Bold', fontSize: 13, letterSpacing: 0.3, color: INK },

  pickCard: { position: 'absolute', left: BOARD_L + PADX, width: CARD_W },
  pickInner: {
    height: ROW_H, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT, opacity: 0.45 },
  pickText: { fontFamily: 'Inter_700Bold', fontSize: 13, letterSpacing: 0.3, color: INK },
  pickTextOn: { color: PAPER },
});

// Art lives from the board's top edge (196) down to the ground line (500); nothing
// is drawn above or below, so the player crops to that and the whole scene renders
// about 70% larger than the letterboxed full-height fit.
export function Logic7Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Logic7Scene} band={[184, 512]} />;
}
