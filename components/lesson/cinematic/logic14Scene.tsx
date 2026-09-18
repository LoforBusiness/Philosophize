import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, mixStance, pose, seg, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './logic14Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { floorStyle, lipOf, PLATE_FACE } from './stageSkin';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// THE STAGE IS STRUCK IN THIS LESSON'S OWN BRANCH HUE (./stageTones).
// Same three tones, same luminance to the third decimal — so every contrast
// measured against the old greys still holds and nothing on the stage moved.
const TONE = stageTone('logic');
const { RULE, STONE, SHADE } = TONE;
const LIP = lipOf(TONE);   // the ledge a toned plate stands on (scripts/skin-stage.mjs)

// THE SANDWICH SYLLOGISM, SET OUT LIKE A SUM (H64). Two premises, a rule, an
// answer — and when the reader has found the shared word, each premise grows a
// second line saying what that word meant in it.
//
// · the three LINES are 288 wide at x 96…384: premises at y 240…296 and
//   y 304…360, the rule at y 368, the conclusion at y 376…424.
// · the shared word is ringed INSIDE each premise, at the right-hand end of its
//   first row — a 78 × 18 box, so it is marked in place rather than pointed at.
// · the GLOSS is the premises' second row, y +34 inside each card, and is empty
//   until the answer is in (group O).
// · the three word CHIPS are 92 × 40 at x 96 / 194 / 292, y 436…476. They are the
//   Q1 targets and stand below the conclusion, twenty-four clear of the ground.
// · the figure stands at x = 44 facing right; his widest ink is a fist at x ≈ 77,
//   nineteen units clear of the lines' column at 96, and his crown is y 397 —
//   beside the conclusion, never over it (D23).
// · highest ink is the first premise at y 240; lowest is the ground at 500.
//
// Band 230…512 = 282, which holds one figure at 36% of the frame (check:scale).

const FIG_X = 44;

const LINE_L = 96;
const LINE_W = 288;
const CARD_H = 56;
const P_T = [240, 304];
const RULE_T = 368;
const CONC_T = 376;
const CONC_H = 48;

const CHIP_W = 92;
const CHIP_H = 40;
const CHIP_T = 436;
const CHIP_X = [96, 194, 292];

const PREMISES = [
  { head: 'NOTHING IS BETTER THAN ETERNAL HAPPINESS', gloss: 'NOTHING = NO THING IS BETTER' },
  { head: 'A HAM SANDWICH IS BETTER THAN NOTHING', gloss: 'NOTHING = HAVING NOTHING AT ALL' },
];

const CHIPS = [
  { id: 'nothing', text: 'NOTHING', correct: true },
  { id: 'better', text: 'BETTER', correct: false },
  { id: 'happiness', text: 'HAPPINESS', correct: false },
];

const G = BEATS.map((b) => b.g ?? 0);
const LINES = BEATS.map((b) => b.lines ?? 0);
const MARK = BEATS.map((b) => b.mark ?? 0);
const GLOSS = BEATS.map((b) => b.gloss ?? 0);
const PICKV = BEATS.map((b) => b.pick ?? 0);
const ALONEV = BEATS.map((b) => b.alone ?? 0);
const DIVERGEV = BEATS.map((b) => b.diverge ?? 0);

const X = BEATS.map((b) => b.x ?? FIG_X);

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.split ? 1 : 0));
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('logic14'));

export default function Logic14Scene({ clock, bt, bi, i, picked, onPick, dragPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldS = useHeld();
  const cv = useCarry(4);
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;

  const live = (cur.pick ?? 0) > 0 && !!cur.interact;
  const answered = picked !== null;
  // Two one-shot events (group AH): each runs once, entirely inside the beat
  // that asks for it, off `bt` alone — nothing to carry, since both are back at
  // rest well before a patient reader taps again.
  const aloneNow = (cur.alone ?? 0) > 0 && (cur.alone ?? 0) !== (prev?.alone ?? 0);
  const divergeNow = (cur.diverge ?? 0) > 0 && (cur.diverge ?? 0) !== (prev?.diverge ?? 0);

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.7);          // nobody walks; this is a pose blend
    const t = clock.value;
    const grow = ease01(bt.value / 0.9);
    const write = ease01(bt.value / 1.2);

    const s = keepHeld(heldS, mixStance(
      carryFrom(heldS, n, emoteHold(G[p], t)), emoteLive(G[n], t, bt.value), tr,
    ));

    // ALONE — "each premise, read on its own, seems true": a brief scale pulse
    // nods each premise card in turn, first one then the other.
    const aloneU = aloneNow ? ease01(bt.value / 1.6) : 0;
    const alone0 = ease01(seg(aloneU, 0.0, 0.18)) * (1 - ease01(seg(aloneU, 0.38, 0.55)));
    const alone1 = ease01(seg(aloneU, 0.5, 0.68)) * (1 - ease01(seg(aloneU, 0.88, 1.0)));

    // DIVERGE — "the premises share no common term": the two rings marking
    // "nothing" pull apart and strain, together, in opposite directions.
    const divergeU = divergeNow ? ease01(bt.value / 1.6) : 0;
    const divergePulse = divergeU <= 0 || divergeU >= 1 ? 0 : Math.min(1, Math.min(divergeU, 1 - divergeU) / 0.3);

    return {
      fig: lookPose(s, FIG_X, GROUND, K_FIG, 1, 1, gazeX.value, gazeY.value, gazeOn.value),
      lines: carry(cv, 0, n, LINES[p], LINES[n], grow),
      mark: carry(cv, 1, n, MARK[p], MARK[n], grow),
      // R7b — the seam writes the two meanings. Give the bar to THE WORDS and the
      // glosses appear under the ringed term; give it to THE FORM and they vanish,
      // leaving a shape that looks perfectly valid.
      gloss: carry(cv, 2, n, GLOSS[p], reacting ? 1 - dragPos.value : GLOSS[n], write),
      chips: carry(cv, 3, n, PICKV[p], PICKV[n], grow),
      alone0, alone1, divergePulse,
    };
  });

  const D = useDerivedValue<Bundle>(() => SCENE.value.fig);

  const ruleLine = useAnimatedStyle(() => ({
    opacity: clamp01(SCENE.value.lines - 2),
    // The join breaks once the two meanings are down: the rule stops being a solid
    // bar and pulls apart from the middle.
    transform: [{ scaleX: 1 - 0.34 * SCENE.value.gloss }],
  }));
  const conc = useAnimatedStyle(() => {
    const a = clamp01(SCENE.value.lines - 2);
    return { opacity: a, transform: [{ translateY: (1 - a) * -8 }] };
  });

  return (
    <Animated.View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      {PREMISES.map((pr, k) => <Premise key={k} k={k} SCENE={SCENE} />)}

      <Animated.View style={[styles.rule, ruleLine]} pointerEvents="none" />

      <Animated.View style={[styles.conc, conc]} pointerEvents="none">
        <Text style={styles.concText} numberOfLines={2}>
          SO A HAM SANDWICH BEATS ETERNAL HAPPINESS
        </Text>
      </Animated.View>

      {CHIPS.map((c, k) => (
        <Chip key={c.id} k={k} SCENE={SCENE} live={live} answered={answered} picked={picked} onPick={onPick} />
      ))}

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={D} k={K_FIG} />
    </Animated.View>
  );
}

/** One premise, with its shared word ringed and its meaning written underneath. */
function Premise({ k, SCENE }: {
  k: number;
  SCENE: { value: { lines: number; mark: number; gloss: number; alone0: number; alone1: number; divergePulse: number } };
}) {
  const pr = PREMISES[k];
  const wrap = useAnimatedStyle(() => {
    const a = clamp01(SCENE.value.lines - k);
    // AH — "each premise, read on its own, seems true": this card's own turn to
    // nod, a brief scale pulse (rule 1: move what is already on stage).
    const nod = k === 0 ? SCENE.value.alone0 : SCENE.value.alone1;
    return { opacity: a, transform: [{ translateX: (1 - a) * 12 }, { scale: 1 + 0.06 * nod }] };
  });
  const ring = useAnimatedStyle(() => {
    // AH — "the premises share no common term": the ring pulls away from the
    // other premise's ring and strains, in opposite directions per card.
    const away = (k === 0 ? -1 : 1) * 5 * SCENE.value.divergePulse;
    return {
      opacity: SCENE.value.mark,
      transform: [{ translateY: away }, { scale: 1 + 0.14 * SCENE.value.divergePulse }],
    };
  });
  const gloss = useAnimatedStyle(() => ({ opacity: SCENE.value.gloss }));
  return (
    <Animated.View style={[styles.card, { top: P_T[k] }, wrap]} pointerEvents="none">
      <Text style={styles.cardText} numberOfLines={2}>{pr.head}</Text>
      <Animated.View style={[styles.ring, ring]} pointerEvents="none" />
      <Animated.Text style={[styles.gloss, gloss]} numberOfLines={1}>{pr.gloss}</Animated.Text>
    </Animated.View>
  );
}

/** One candidate word — a Q1 target. */
function Chip({
  k, SCENE, live, answered, picked, onPick,
}: {
  k: number;
  SCENE: { value: { chips: number } };
  live: boolean;
  answered: boolean;
  picked: string | null;
  onPick: (id: string, correct: boolean) => void;
}) {
  const c = CHIPS[k];
  const on = answered && c.correct;
  const st = useAnimatedStyle(() => {
    const a = SCENE.value.chips;
    return { opacity: a, transform: [{ translateY: (1 - a) * 10 }] };
  });
  return (
    <Animated.View style={[styles.chip, { left: CHIP_X[k] }, st]}>
      <Target id={c.id} correct={c.correct} picked={picked} onPick={onPick}
              style={styles.fill} disabled={!live || answered}>
        <View style={[
          styles.chipInner,
          on && styles.pickRight,
          answered && picked === c.id && !c.correct && styles.pickWrong,
        ]}>
          <Text style={[styles.chipText, on && styles.onInk]} numberOfLines={1}>{c.text}</Text>
        </View>
      </Target>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 16, right: 16, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON. A rule on its own leaves the
  // figure and everything it is looking at standing on bare page;
  // political7 and political8 both stand their subject on a filled mass.
  floor: floorStyle(TONE, GROUND),
  fill: { flex: 1 },

  card: {
    position: 'absolute', left: LINE_L, width: LINE_W, height: CARD_H,
    borderWidth: 2, borderColor: INK, borderRadius: 8, backgroundColor: STONE, boxShadow: LIP,
    paddingHorizontal: 10, paddingTop: 7,
  },
  cardText: {
    fontFamily: 'Inter_700Bold', fontSize: 9, lineHeight: 12, letterSpacing: 0.7, color: INK,
    includeFontPadding: false,
  },
  // The shared word, ringed where it stands. Its box is the width of the word at
  // the end of the first row, which is where "NOTHING" falls in both premises.
  ring: {
    position: 'absolute', right: 8, top: 4, width: 74, height: 17,
    borderWidth: 2, borderColor: SOFT, borderRadius: 9,
  },
  gloss: {
    position: 'absolute', left: 10, right: 10, top: 34,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.9, color: INK,
    includeFontPadding: false,
  },

  rule: {
    position: 'absolute', left: LINE_L, top: RULE_T, width: LINE_W, height: 2.5,
    backgroundColor: INK,
  },
  conc: {
    position: 'absolute', left: LINE_L, top: CONC_T, width: LINE_W, height: CONC_H,
    borderWidth: 2, borderColor: INK, borderRadius: 8, backgroundColor: STONE, boxShadow: LIP,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10,
  },
  concText: {
    fontFamily: 'Inter_700Bold', fontSize: 9, lineHeight: 12, letterSpacing: 0.7, color: INK,
    textAlign: 'center', includeFontPadding: false,
  },

  chip: { position: 'absolute', top: CHIP_T, width: CHIP_W, height: CHIP_H },
  chipInner: {
    flex: 1, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PLATE_FACE, boxShadow: LIP,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5,
  },
  chipText: {
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 0.9, color: INK,
    includeFontPadding: false,
  },

  onInk: { color: PAPER },
  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT },
});

// Ink runs from the first premise (240) to the ground line (500). Band 230…512.
export function Logic14Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Logic14Scene} band={[230, 512]} camera={CAM} />;
}
