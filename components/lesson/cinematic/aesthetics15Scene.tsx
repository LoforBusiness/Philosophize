import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, mixStance, pose, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './aesthetics15Script';
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
const TONE = stageTone('aesthetics');
const { RULE, STONE, SHADE } = TONE;
const LIP = lipOf(TONE);   // the ledge a toned plate stands on (scripts/skin-stage.mjs)

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

// The tags' own box, four clear of the top tag and the bottom one (228…494), and
// the rose's own box, six clear of the bloom's ring (102…378) — both inside the
// 226…512 band.
const ZONE_TAGS_BOX = { left: TAG_L - 4, top: TAG_T[0] - 4, width: TAG_W + 8, height: (TAG_T[4] + TAG_H) - TAG_T[0] + 8 };
const ZONE_ROSE_BOX = { left: BLOOM_CX - BLOOM_R - 6, top: BLOOM_CY - BLOOM_R - 6, width: (BLOOM_R + 6) * 2, height: (BLOOM_R + 6) * 2 };
// Clear of both the rose (right edge 164) and the tags (left edge 214), above the
// bloom's own top (316).
const TERM_L = 148;
const TERM_T = 294;
const TERM_W = 60;
const TERM_H = 18;
// The line the surviving remark's own height shares with the bloom's centre.
const CONNECT_Y = (BLOOM_CY + (TAG_T[2] + 17)) / 2;

const G = BEATS.map((b) => b.g ?? 0);
const ROSE = BEATS.map((b) => b.rose ?? 0);
const TAGN = BEATS.map((b) => b.tags ?? 0);
const CUT = BEATS.map((b) => b.cut ?? 0);
// GROUP AH — seven still taps, each moving a new mass rather than a caption.
const ZONE_TAGS = BEATS.map((b) => ((b.zoneTags ?? 0) > 0 ? 1 : 0));
const TERM = BEATS.map((b) => ((b.term ?? 0) > 0 ? 1 : 0));
const ZONE_ROSE = BEATS.map((b) => ((b.zoneRose ?? 0) > 0 ? 1 : 0));
const FLAGN = BEATS.map((b) => b.flag ?? 0);
const CONNECT = BEATS.map((b) => ((b.connect ?? 0) > 0 ? 1 : 0));
// The order the four "interested" tags are named in: owning, selling, room, impress.
const FLAG_ORDER = [0, 1, 3, 4];

// The camera, from the staging (H60b): the figure never moves, so `followMoves`
// gives the still-lesson rhythm — a push on the quote, a pull back to the whole
// band on both graded beats and the summary.
const X = BEATS.map((b) => b.x ?? FIG_X);

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.odd ? 1 : 0));
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('aesthetics15'));

export default function Aesthetics15Scene({ clock, bt, bi, i, picked, onPick, dragPos, pickPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldS = useHeld();
  const cv = useCarry(8);
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;
  const zoneTagsFade = (cur.zoneTags ?? 0) !== (prev?.zoneTags ?? 0);
  const termFade = (cur.term ?? 0) !== (prev?.term ?? 0);
  const zoneRoseFade = (cur.zoneRose ?? 0) !== (prev?.zoneRose ?? 0);
  const flagFade = (cur.flag ?? 0) !== (prev?.flag ?? 0);
  const connectFade = (cur.connect ?? 0) !== (prev?.connect ?? 0);

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
      fig: lookPose(s, FIG_X, GROUND, K_FIG, 1, 1, gazeX.value, gazeY.value, gazeOn.value),
      rose: carry(cv, 0, n, ROSE[p], ROSE[n], grow),
      tags: carry(cv, 1, n, TAGN[p], TAGN[n], grow),
      // R7b — the seam cuts the tags. Give the bar to THE DELIGHT and the four
      // interested tags — I could sell it, it would suit my room — fall away, leaving
      // the pleasure with nothing of yours tied to it.
      cut: carry(cv, 2, n, CUT[p], reacting ? pickPos.value : CUT[n], fall),
      // A boundary round the five, naming which group the test currently applies
      // to — the tags together, then (once the term is named) the rose alone.
      zoneTags: carry(cv, 3, n, ZONE_TAGS[p], ZONE_TAGS[n], zoneTagsFade ? grow : 1),
      term: carry(cv, 4, n, TERM[p], TERM[n], termFade ? grow : 1),
      zoneRose: carry(cv, 5, n, ZONE_ROSE[p], ZONE_ROSE[n], zoneRoseFade ? grow : 1),
      flag: carry(cv, 6, n, FLAGN[p], FLAGN[n], flagFade ? grow : 1),
      connect: carry(cv, 7, n, CONNECT[p], CONNECT[n], connectFade ? grow : 1),
      t,
    };
  });

  const D = useDerivedValue<Bundle>(() => SCENE.value.fig);

  const answered = picked !== null;
  const live = (cur.pick ?? 0) > 0 && !!cur.interact;

  const rose = useAnimatedStyle(() => ({ opacity: SCENE.value.rose }));
  // A living rose: the two leaves stir on their own phases, hinged at the stem.
  const leafStirL = useAnimatedStyle(() => ({
    transform: [{ rotate: `${-18 + Math.sin(SCENE.value.t * 1.1) * 4}deg` }],
  }));
  const leafStirR = useAnimatedStyle(() => ({
    transform: [{ rotate: `${16 + Math.sin(SCENE.value.t * 0.9 + 1.4) * 4}deg` }],
  }));
  const zoneTagsStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.zoneTags }));
  const termStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.term,
    transform: [{ translateY: (1 - SCENE.value.term) * -5 }],
  }));
  const zoneRoseStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.zoneRose }));
  const connectStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.connect }));

  return (
    <Animated.View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      {/* the connecting line, drawn first so the tag and rose sit on top of it */}
      <Animated.View style={[styles.connectLine, connectStyle]} pointerEvents="none" />
      {/* ── THE ROSE ─────────────────────────────────────────────────────── */}
      <Animated.View style={[styles.plant, rose]} pointerEvents="none">
        <View style={styles.plinth} />
        <View style={styles.stem} />
        <Animated.View style={[styles.leafL, leafStirL]} />
        <Animated.View style={[styles.leafR, leafStirR]} />
        <View style={styles.bloomOuter} />
        <View style={styles.bloomMid} />
        <View style={styles.bloomCore} />
      </Animated.View>

      {/* the test's own boundary — first round the five, then round what remains */}
      <Animated.View style={[styles.zoneBox, styles.zoneTagsBox, zoneTagsStyle]} pointerEvents="none" />
      <Animated.View style={[styles.zoneBox, styles.zoneRoseBox, zoneRoseStyle]} pointerEvents="none" />
      {/* the term itself, named once */}
      <Animated.View style={[styles.termPlate, termStyle]} pointerEvents="none">
        <Text style={styles.termText} numberOfLines={1}>INTEREST</Text>
      </Animated.View>
      {/* a flag lands on each tag as its own interest gets named */}
      {FLAG_ORDER.map((k, rank) => (
        <FlagMark key={k} k={k} rank={rank} SCENE={SCENE} />
      ))}

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

/** A small tick beside a tag once its own interest has been named, gone again
 *  the moment its tag is cut (E39 — the mark moves only with what it marks). */
function FlagMark({
  k, rank, SCENE,
}: {
  k: number;
  rank: number;
  SCENE: { value: { flag: number; cut: number } };
}) {
  const style = useAnimatedStyle(() => ({
    opacity: clamp01(SCENE.value.flag - rank) * (1 - SCENE.value.cut),
  }));
  return (
    <Animated.View style={[styles.flag, { top: TAG_T[k] + 13 }, style]} pointerEvents="none">
      <View style={styles.flagH} />
      <View style={styles.flagV} />
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
    // THE CUT MAY NOT MULTIPLY TARGET'S OWN DIM (D35, and Target.tsx's rule).
    //
    // This used to fade on `1 - c`, and these tags are Targets: once the question
    // is answered Target dims the losers to 0.7, so the two stacked — measured
    // through a real answer, 0.70 x 0.33 = 0.233 at 7.3px, which is under both the
    // contrast floor and D34's 8px. Four options the reader had just been asked to
    // weigh, left as grey smears. It is the same 0.5 x 0.45 = 0.225 defect
    // Target.tsx records being swept out of 113 places, arriving through a wrapper
    // OUTSIDE the Target where check:blank cannot see it.
    //
    // So the cut takes them AWAY rather than leaving them half-there: legible while
    // they are on the stage, gone once they are not. The shrink still carries the
    // motion, so it does not read as a pop.
    const gone = c > 0.5 ? 1 : 0;
    // AND THE SHRINK FOLLOWS THE SAME RULE (D34). With the opacity fixed the
    // re-check still found all four at 7.3px: `cut` rests at 0.5 on the answered
    // beat, and `1 - 0.34 * c` held them at 0.83 scale while they were fully on
    // screen — 9px landing under the 8px floor. So they are full size whenever they
    // are visible, and only shrink on the side where they are already gone.
    return {
      opacity: a * (1 - gone),
      transform: [{ translateX: (1 - a) * 14 }, { scale: gone ? 1 - 0.34 * c : 1 }],
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
  floor: floorStyle(TONE, GROUND),
  fill: { flex: 1 },

  // THE TEST'S OWN BOUNDARY. A dashed border, never a fill — a boundary names a
  // group without claiming to be a member of it.
  zoneBox: {
    position: 'absolute', borderWidth: 1.5, borderColor: INK, borderStyle: 'dashed', borderRadius: 6,
  },
  zoneTagsBox: ZONE_TAGS_BOX,
  zoneRoseBox: ZONE_ROSE_BOX,

  termPlate: {
    position: 'absolute', left: TERM_L, top: TERM_T, width: TERM_W, height: TERM_H,
    borderWidth: 1.5, borderColor: INK, borderRadius: 3, backgroundColor: INK,
    alignItems: 'center', justifyContent: 'center',
  },
  termText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1, color: PAPER,
    includeFontPadding: false,
  },

  // A tick beside a tag, once its own interest is named — a small "+" the same
  // shape aesthetics-11's registration mark uses, at the tag's own left edge.
  flag: { position: 'absolute', left: TAG_L - 14, width: 10, height: 10 },
  flagH: { position: 'absolute', left: 0, top: 4, width: 10, height: 2, backgroundColor: INK },
  flagV: { position: 'absolute', left: 4, top: 0, width: 2, height: 10, backgroundColor: INK },

  connectLine: {
    position: 'absolute', left: BLOOM_CX + BLOOM_R, top: CONNECT_Y, width: TAG_L - (BLOOM_CX + BLOOM_R),
    height: 2, borderTopWidth: 2, borderColor: SOFT, borderStyle: 'dashed',
  },

  plant: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H },
  plinth: {
    position: 'absolute', left: PLINTH_L, top: PLINTH_T, width: PLINTH_W, height: 500 - PLINTH_T,
    borderWidth: 2, borderColor: INK, borderTopLeftRadius: 3, borderTopRightRadius: 3,
    backgroundColor: STONE, boxShadow: LIP,
  },
  stem: { position: 'absolute', left: STEM_X, top: STEM_T, width: 4, height: PLINTH_T - STEM_T, backgroundColor: INK },
  leafL: {
    position: 'absolute', left: STEM_X - 22, top: 398, width: 24, height: 9,
    borderRadius: 5, backgroundColor: INK, transform: [{ rotate: '-18deg' }], transformOrigin: '100% 50%',
  },
  leafR: {
    position: 'absolute', left: STEM_X + 2, top: 414, width: 24, height: 9,
    borderRadius: 5, backgroundColor: INK, transform: [{ rotate: '16deg' }], transformOrigin: '0% 50%',
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
    flex: 1, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PLATE_FACE, boxShadow: LIP,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8,
  },
  tagText: {
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1, color: INK,
    textAlign: 'center', includeFontPadding: false,
  },

  onInk: { color: PAPER },
  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT },
});

// Ink runs from the top tag (232) to the ground line (500). Band 226…512 = 286.
export function Aesthetics15Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Aesthetics15Scene} band={[226, 512]} camera={CAM} />;
}
