import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, mixStance, pose, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './aesthetics15Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, STONE, PAPER,
  useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// A ROSE WITH FIVE THINGS TIED TO IT, four of which get cut off (H64). The tags are
// the Q1 targets, so the sorting the lesson is about is the thing the reader does.
//
// · the figure stands at x = 44 facing right. Widest ink is a fist at x ≈ 77, so
//   there are 15 clear units before the plinth (B9).
// · the PLINTH is x 92…180, y 444…500 — 88 × 56, standing on the ground line.
// · the STEM runs x 134…138 from y 444 up to y 364; the BLOOM is three rings
//   centred (136, 344), outer radius 28, so it spans x 108…164 and y 316…372.
//   Nothing of the plant leaves the plinth's column by more than 4 units either
//   side, which is what keeps it clear of the tags at x 214.
// · the TAGS are x 214…386, five cards 172 × 34 at tops y 232 / 288 / 344 / 400 /
//   456. The lowest ends at 490, ten clear of the ground line.
// · highest ink is the first tag at y 232; lowest is the ground at 500. The
//   figure's crown is y 397, level with the fourth tag and 137 units left of it.
//
// The band is 286 rather than the 274 the ink needs, for the same reason as
// aesthetics14: below ~271 one figure owns more than check:scale's 38% of the
// frame and becomes the composition.

const FIG_X = 44;

const PLINTH_L = 92;
const PLINTH_W = 88;
const PLINTH_T = 444;

const STEM_X = 134;
const STEM_T = 364;
const BLOOM_CX = 136;
const BLOOM_CY = 344;
const BLOOM_R = 28;

const TAG_L = 214;
const TAG_W = 172;
const TAG_H = 34;
const TAG_T = [232, 288, 344, 400, 456];

const TAGS = [
  { id: 'pick', text: 'I WOULD PICK IT', stake: true },
  { id: 'sell', text: 'I COULD SELL IT', stake: true },
  { id: 'look', text: 'YOU SHOULD SEE THIS', stake: false },
  { id: 'room', text: 'IT WOULD SUIT MY ROOM', stake: true },
  { id: 'seen', text: 'IT WOULD IMPRESS HER', stake: true },
];

const G = BEATS.map((b) => b.g ?? 0);
const ROSE = BEATS.map((b) => b.rose ?? 0);
const TAGN = BEATS.map((b) => b.tags ?? 0);
const CUT = BEATS.map((b) => b.cut ?? 0);

// The camera, from the staging (H60b): the figure never moves, so `followMoves`
// gives the still-lesson rhythm — a push on the quote, a pull back to the whole
// band on both graded beats and the summary.
const X = BEATS.map((b) => b.x ?? FIG_X);

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.split ? 1 : 0));
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('aesthetics15'));

export default function Aesthetics15Scene({ clock, bt, bi, i, picked, onPick, dragPos }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldS = useHeld();
  const cv = useCarry(3);
  const cur = BEATS[i];

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.7);          // nobody walks; this is a pose blend
    const t = clock.value;
    const grow = ease01(bt.value / 0.9);
    // Cutting four tags takes longer than anything else here on purpose — they are
    // meant to be watched going, not found gone.
    const fall = ease01(bt.value / 1.5);

    const s = keepHeld(heldS, mixStance(
      carryFrom(heldS, n, emoteHold(G[p], t)), emoteLive(G[n], t, bt.value), tr,
    ));
    return {
      fig: pose(s, FIG_X, GROUND, K_FIG, 1, 1),
      rose: carry(cv, 0, n, ROSE[p], ROSE[n], grow),
      tags: carry(cv, 1, n, TAGN[p], TAGN[n], grow),
      // R7b — the seam cuts the tags. Give the bar to THE DELIGHT and the four
      // interested tags — I could sell it, it would suit my room — fall away, leaving
      // the pleasure with nothing of yours tied to it.
      cut: carry(cv, 2, n, CUT[p], reacting ? dragPos.value : CUT[n], fall),
    };
  });

  const D = useDerivedValue<Bundle>(() => SCENE.value.fig);

  const answered = picked !== null;
  const live = (cur.pick ?? 0) > 0 && !!cur.interact;

  const rose = useAnimatedStyle(() => ({ opacity: SCENE.value.rose }));

  return (
    <Animated.View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      {/* ── THE ROSE ─────────────────────────────────────────────────────── */}
      <Animated.View style={[styles.plant, rose]} pointerEvents="none">
        <View style={styles.plinth} />
        <View style={styles.stem} />
        <View style={styles.leafL} />
        <View style={styles.leafR} />
        <View style={styles.bloomOuter} />
        <View style={styles.bloomMid} />
        <View style={styles.bloomCore} />
      </Animated.View>

      {/* ── THE FIVE THINGS SAID ABOUT IT ────────────────────────────────── */}
      {TAGS.map((tg, k) => (
        <Tag
          key={tg.id}
          k={k}
          SCENE={SCENE}
          live={live}
          answered={answered}
          picked={picked}
          onPick={onPick}
        />
      ))}

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={D} k={K_FIG} />
    </Animated.View>
  );
}

/** One remark, tied on — and one of the Q1 targets. A stake gets cut. */
function Tag({
  k, SCENE, live, answered, picked, onPick,
}: {
  k: number;
  SCENE: { value: { tags: number; cut: number } };
  live: boolean;
  answered: boolean;
  picked: string | null;
  onPick: (id: string, correct: boolean) => void;
}) {
  const tg = TAGS[k];
  const correct = !tg.stake;
  const on = answered && correct;

  const wrap = useAnimatedStyle(() => {
    const a = clamp01(SCENE.value.tags - k);
    // A cut tag shrinks and fades where it hangs; the one that never had a stake
    // in the rose does not move at all.
    //
    // IT USED TO FALL, and it fell out of the picture. The lowest tag's bottom
    // edge is y 490 and the band ends at 512, so there are 22 units of headroom —
    // a 70-unit drop cleared it easily, and even 20 plus the tilt did, because a
    // 172-wide card rotated six degrees swings its corner down another nine.
    // check:frame counted both as art being sliced, and it was right: a tag
    // leaving should still leave inside the frame. Nothing here translates now.
    const c = tg.stake ? SCENE.value.cut : 0;
    return {
      opacity: a * (1 - c),
      transform: [{ translateX: (1 - a) * 14 }, { scale: 1 - 0.34 * c }],
    };
  });

  return (
    <Animated.View style={[styles.tag, { top: TAG_T[k] }, wrap]}>
      <Target
        id={tg.id}
        correct={correct}
        picked={picked}
        onPick={onPick}
        style={styles.fill}
        disabled={!live || answered}
      >
        <View
          style={[
            styles.tagInner,
            on && styles.pickRight,
            answered && picked === tg.id && !correct && styles.pickWrong,
          ]}
        >
          <Text style={[styles.tagText, on && styles.onInk]} numberOfLines={1}>{tg.text}</Text>
        </View>
      </Target>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 16, right: 16, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON. A rule alone leaves the figure
  // standing on bare page; a filled band under it is what the two lessons
  // the reader holds up both do, and it costs one View.
  floor: { position: 'absolute', left: 0, right: 0, top: GROUND, bottom: 0, backgroundColor: RULE },
  fill: { flex: 1 },

  plant: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H },
  plinth: {
    position: 'absolute', left: PLINTH_L, top: PLINTH_T, width: PLINTH_W, height: 500 - PLINTH_T,
    borderWidth: 2, borderColor: INK, borderTopLeftRadius: 3, borderTopRightRadius: 3,
    backgroundColor: STONE,
  },
  stem: { position: 'absolute', left: STEM_X, top: STEM_T, width: 4, height: PLINTH_T - STEM_T, backgroundColor: INK },
  leafL: {
    position: 'absolute', left: STEM_X - 22, top: 398, width: 24, height: 9,
    borderRadius: 5, backgroundColor: INK, transform: [{ rotate: '-18deg' }],
  },
  leafR: {
    position: 'absolute', left: STEM_X + 2, top: 414, width: 24, height: 9,
    borderRadius: 5, backgroundColor: INK, transform: [{ rotate: '16deg' }],
  },
  // The bloom: three rings, so it reads as petals folded in rather than a dot.
  bloomOuter: {
    position: 'absolute', left: BLOOM_CX - BLOOM_R, top: BLOOM_CY - BLOOM_R,
    width: BLOOM_R * 2, height: BLOOM_R * 2, borderRadius: BLOOM_R,
    borderWidth: 3, borderColor: INK, backgroundColor: PAPER,
  },
  bloomMid: {
    position: 'absolute', left: BLOOM_CX - 17, top: BLOOM_CY - 17,
    width: 34, height: 34, borderRadius: 17, borderWidth: 2.5, borderColor: INK,
  },
  bloomCore: {
    position: 'absolute', left: BLOOM_CX - 7, top: BLOOM_CY - 7,
    width: 14, height: 14, borderRadius: 7, backgroundColor: INK,
  },

  tag: { position: 'absolute', left: TAG_L, width: TAG_W, height: TAG_H },
  tagInner: {
    flex: 1, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: STONE,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8,
  },
  tagText: {
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1, color: INK,
    textAlign: 'center', includeFontPadding: false,
  },

  onInk: { color: PAPER },
  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT, opacity: 0.45 },
});

// Ink runs from the top tag (232) to the ground line (500). Band 226…512 = 286.
export function Aesthetics15Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Aesthetics15Scene} band={[226, 512]} camera={CAM} />;
}
