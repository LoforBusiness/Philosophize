import {
  View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import {
  ease01, lerp, mixStance, pose, type Bundle, } from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './logic32Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// TWO figures with the question between them, and the words of the question are
// the answer targets.
//
// · the asker stands at x 66 facing right, the cornered figure at x 316 facing
//   left. 250 units apart, and neither ever moves, so that IS the closest they get
//   (B9 wants ~100 with root motion counted; nothing here carries any).
// · the words sit at x 116…284, y 236…308 — a band well above both crowns, which
//   are at y 397, so the sentence never touches either figure.
// · the hidden claim y 318…344 · the tried answer y 352…380.
// · B14 — `stand()` takes no seed, so the second figure is driven by a SHIFTED
//   clock (t + 3.7). Without it the two breathe and rock on identical frames and
//   read as one body mirrored.
// · A5 — the sentence is a diagram above head height; neither figure touches it,
//   and no beat's text says otherwise.

const A_X = 66;
const B_X = 316;
const B_CLOCK = 3.7;

const ROW1_T = 236;
const ROW2_T = 276;
const WORD_H = 32;
const WORD_GAP = 6;

// Per-word widths rather than a uniform grid, so the sentence reads as a sentence.
// Each is sized off its own length: the longest, CHEATING, measures ~52 units at
// 9px bold inside 58 of inner width, which keeps it a comfortable 10% clear (D30).
const ROW1 = [
  { id: 'have', label: 'HAVE', w: 46, correct: false },
  { id: 'you', label: 'YOU', w: 38, correct: false },
  { id: 'stopped', label: 'STOPPED', w: 66, correct: true },
];
const ROW2 = [
  { id: 'cheating', label: 'CHEATING', w: 70, correct: false },
  { id: 'at', label: 'AT', w: 30, correct: false },
  { id: 'cards', label: 'CARDS', w: 56, correct: false },
];
const rowWidth = (r: typeof ROW1) => r.reduce((a, w) => a + w.w, 0) + (r.length - 1) * WORD_GAP;
const ROW1_L = (STAGE_W - rowWidth(ROW1)) / 2;
const ROW2_L = (STAGE_W - rowWidth(ROW2)) / 2;

const HID_T = 318;
const HID_H = 26;
const HID_W = 190;

const TRY_T = 352;
const TRY_H = 28;
const TRY_W = 220;

const TRIED = ['', 'YES  →  SO YOU WERE CHEATING', 'NO  →  SO YOU STILL ARE'];

const A = BEATS.map((b) => b.a ?? 0);
const B = BEATS.map((b) => b.b ?? 0);
const QV = BEATS.map((b) => b.q ?? 0);

function wordLeft(row: typeof ROW1, left: number, k: number) {
  let x = left;
  for (let j = 0; j < k; j++) x += row[j].w + WORD_GAP;
  return x;
}

// THE CAMERA (H60b). `followMoves` reads the x track and gives each beat its own
// shot: it FOLLOWS the subject when a beat moves far enough to be worth following,
// pushes close on a quote, and PULLS BACK to the whole band on a question or a
// summary — the beats the reader has to read and act on.
// Two figures at 66 and 316, so the track is the point BETWEEN them (191) — following
// either one alone would frame the other out, and here the pair is the subject.
const X = BEATS.map((b) => b.x ?? 191);

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.lever ? 1 : 0));
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('logic32'));

export default function Logic32Scene({ clock, bt, bi, i, picked, onPick, dragPos }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldSb = useHeld();
  const cv = useCarry(1);
  const heldSa = useHeld();
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;

  const qFade = (cur.q ?? 0) !== (prev?.q ?? 0);
  const hidOn = (cur.hidden ?? 0) > 0;
  const hidFade = (cur.hidden ?? 0) !== (prev?.hidden ?? 0);
  const tried = cur.tried ?? 0;
  const triedFade = (cur.tried ?? 0) !== (prev?.tried ?? 0);

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.7);          // nobody walks; this is a pose blend
    const t = clock.value;
    const grow = ease01(bt.value / 0.55);

    const sa = keepHeld(heldSa, mixStance(carryFrom(heldSa, n, emoteHold(A[p], t)), emoteLive(A[n], t, bt.value), tr));
    const sb = keepHeld(heldSb, mixStance(carryFrom(heldSb, n,
      emoteHold(B[p], t + B_CLOCK)),
      emoteLive(B[n], t + B_CLOCK, bt.value),
      tr));
    return {
      askr: pose(sa, A_X, GROUND, K_FIG, 1, 1),
      corn: pose(sb, B_X, GROUND, K_FIG, -1, 1),
      q: carry(cv, 0, n, QV[p], QV[n], tr, qFade ? grow : 1),
      // R7c — refusing the package is what brings the smuggled claim into view, so the
      // line under the sentence surfaces as the lever travels to 'take the hidden claim
      // first' and sinks again at either answer that concedes it.
      hidden: (hidOn ? (hidFade ? grow : 1) : 0) * (reacting ? 1 - (1 - dragPos.value) * tr : 1),
      tried: tried > 0 ? (triedFade ? grow : 1) : 0,
    };
  });

  const DA = useDerivedValue<Bundle>(() => SCENE.value.askr);
  const DB = useDerivedValue<Bundle>(() => SCENE.value.corn);
  const qStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.q }));
  const hidStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.hidden,
    transform: [{ translateY: (1 - SCENE.value.hidden) * -6 }],
  }));
  const tryStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.tried }));

  const answered = picked !== null;
  const live = (cur.pick ?? 0) > 0 && !!cur.interact;

  const renderRow = (row: typeof ROW1, left: number, top: number) =>
    row.map((w, k) => {
      const chosen = picked === w.id;
      return (
        <Target id={w.id} correct={w.correct} picked={picked} onPick={onPick}
              key={w.id} style={[styles.word, { left: wordLeft(row, left, k), top, width: w.w }]} hitSlop={{ top: 4, bottom: 4, left: WORD_GAP / 2, right: WORD_GAP / 2 }} disabled={!live || answered}>
          <View
            style={[
              styles.wordInner,
              answered && w.correct && styles.pickRight,
              answered && chosen && !w.correct && styles.pickWrong,
            ]}
          >
            <Text
              style={[styles.wordText, answered && w.correct && styles.onInk]}
              numberOfLines={1}
            >
              {w.label}
            </Text>
          </View>
        </Target>
      );
    });

  return (
    <Animated.View style={styles.scene}>
      <Animated.View style={[styles.layer, qStyle]}>
        {renderRow(ROW1, ROW1_L, ROW1_T)}
        {renderRow(ROW2, ROW2_L, ROW2_T)}
      </Animated.View>

      {/* what the sentence never said out loud */}
      <Animated.View style={[styles.hidden, hidStyle]} pointerEvents="none">
        <Text style={styles.hiddenText} numberOfLines={1}>SMUGGLED IN: YOU WERE CHEATING</Text>
      </Animated.View>

      {/* whichever answer is being tried */}
      <Animated.View style={[styles.tried, tryStyle]} pointerEvents="none">
        <Text style={styles.triedText} numberOfLines={1}>{TRIED[tried]}</Text>
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DA} k={K_FIG} />
      <Stickman D={DB} k={K_FIG} />
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
  layer: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H },

  word: { position: 'absolute', height: WORD_H },
  wordInner: {
    height: WORD_H, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: STONE,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
  },
  wordText: {
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 0, color: INK,
    includeFontPadding: false,
  },
  onInk: { color: PAPER },
  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT },

  hidden: {
    position: 'absolute', left: (STAGE_W - HID_W) / 2, top: HID_T, width: HID_W, height: HID_H,
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: INK,
    alignItems: 'center', justifyContent: 'center',
  },
  hiddenText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.6, color: PAPER,
    includeFontPadding: false,
  },

  tried: {
    position: 'absolute', left: (STAGE_W - TRY_W) / 2, top: TRY_T, width: TRY_W, height: TRY_H,
    borderLeftWidth: 3, borderLeftColor: INK, backgroundColor: STONE,
    alignItems: 'center', justifyContent: 'center',
  },
  triedText: {
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 0.4, color: INK,
    includeFontPadding: false,
  },
});

// Ink runs from the first word row (236) to the ground line (500).
// Band 230…512 = 282 (H59).
export function Logic32Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Logic32Scene} band={[230, 512]} camera={CAM} />;
}
