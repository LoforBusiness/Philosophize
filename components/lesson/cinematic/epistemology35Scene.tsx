import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, clamp01, ease01, lerp, moveTr, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './epistemology35Script';
import { facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { floorStyle, lipOf, PLATE_FACE } from './stageSkin';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';
import { Shapes, Outlined, ell, bar, type Part } from './Silhouette';

// THE STAGE IS STRUCK IN THIS LESSON'S OWN BRANCH HUE (./stageTones).
// Same three tones, same luminance to the third decimal — so every contrast
// measured against the old greys still holds and nothing on the stage moved.
const TONE = stageTone('epistemology');
const { RULE, STONE, SHADE } = TONE;
const LIP = lipOf(TONE);   // the ledge a toned plate stands on (scripts/skin-stage.mjs)

// ─────────────────────────────────────────────────────────────────────────────
// TWO PENS DRAWN THE SAME, AND A CHAIN THAT WILL NOT REACH.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the CHAIN of three plates runs across the top: each 96×34 at y 252…286, at
//   x 88, 192, 296, with a 2-thick link between them along y 269 (x 184…192 and
//   x 288…296), ending at 392 — level with the fence. It is the argument, drawn as
//   an argument.
// · the two PENS sit at y 330…434: rails at x 116…236 and x 260…380, each a
//   3-thick frame. Inside each, a ZEBRA about 80 wide × 60 tall — SAME drawing,
//   SAME stripes in both, because the reader's evidence does not tell them apart.
//   Only the plaques at y 440…452 differ.
// · the RELEVANCE FENCE is a 3-thick upright the drag slides across x 96…392 at
//   y 320…440, so the reader can see how much of the zoo it is being asked to
//   exclude.
// · the figure stands at x 58 and walks to 130. His crown reaches ~397, below
//   the pens' floor line at 434, so he never sits on top of the art.
//
// Ink runs y 244 (the first plate) … y 500 (ground). BAND 238…512 = 274 (H59).
//
// THE ZEBRA IS ONE PART LIST, drawn in both pens, so the two are identical by
// construction rather than by two artists agreeing — and Views rather than an <Svg>,
// so the camera and the thought bubble can see it (§17 rule 7, ./Silhouette).
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const FOLLOWS = BEATS.map((b) => b.follows ?? 0);
const NAMED = BEATS.map((b) => b.named ?? 0);
const STILL_SAY = BEATS.map((b) => b.stillSay ?? 0);
const BASE_TR = 0.85;

const PLATE_W = 96;
const PLATE_H = 34;
// EIGHT BELOW THE CAPTION, not level with it. At 244 the chain's top edge cut
// the bottom of THE SAME LOOK, TWICE, which sits at 238…248 — and the band
// starts at 238, so the caption has nowhere to go. The pens are at 330, so the
// chain has all the room it needs.
const PLATE_Y = 252;
// 88 · 192 · 296, NOT 116 · 220 · 324. The chain is 3 x 96 plus two 8-unit links
// = 304 wide, and from x 116 its last plate ended at 420 — twenty units past the
// 400 the stage HAS, so NOT A PAINTED MULE was drawn with its right-hand third
// off the edge and the plate itself missing a side. It now ends at 392, level
// with the relevance fence, which is where it always read as belonging.
const PLATE_X = [88, 192, 296];
const PLATE_TEXT = ['IT IS A ZEBRA', 'ZEBRAS ARE NOT MULES', 'NOT A PAINTED MULE'];

const PEN_Y = 330;
const PEN_H = 104;
const PEN_X = [116, 260];
const PEN_W = 120;

// ── A PLAINS ZEBRA, facing left, in pen coordinates ─────────────────────────
//
// It was a rounded box with five bars through it and the word ZEBRA underneath: a
// barcode (Z1). The reference builds a zebra "closer to a donkey than a horse — more
// heavily built, with a visibly rounded belly, shorter legs and a bigger head", and
// gives the marks that separate it from a striped horse: a MANE that stands up like
// a brush, UPRIGHT rounded ears, a dark MUZZLE, a tail that is a bare stalk with its
// tuft beginning halfway down, and stripes that run VERTICAL on the forequarters,
// swing toward HORIZONTAL over the hindquarters and band the legs across.
const ZEBRA_LEGS: Part[] = [
  bar(47, 50, 46, 72, 5, PAPER), bar(53, 50, 54, 71, 4.2, PAPER),
  bar(78, 50, 79, 72, 5, PAPER), bar(84, 50, 83, 71, 4.2, PAPER),
];
const ZEBRA_LEG_BANDS: Part[] = [
  [44, 59, 49, 59], [44, 65, 49, 65], [51, 60, 56, 60], [51, 66, 56, 66],
  [76, 60, 81, 60], [76, 66, 81, 66], [81, 61, 86, 61], [81, 67, 86, 67],
].map(([x1, y1, x2, y2]) => bar(x1, y1, x2, y2, 1.9, INK));
const ZEBRA_TAIL: Part[] = [bar(88, 40, 93, 53, 2, INK), ell(93.6, 57, 4, 8, INK, -10)];
/** Barrel, rump, chest, neck, head and muzzle — one outline round the lot. */
const ZEBRA: Part[] = [
  ell(64, 43, 48, 22, PAPER), ell(80, 41, 18, 19, PAPER), ell(47, 44, 18, 19, PAPER),
  bar(46, 38, 34, 22, 12, PAPER), bar(33, 21, 20, 35, 10, PAPER), ell(19, 35, 9, 8, PAPER),
];
const ZEBRA_MARKS: Part[] = [
  ell(18.5, 35.5, 7.5, 6.8, INK),                                          // the dark muzzle
  bar(35.5, 15, 34, 8, 3.6, INK), bar(31.5, 16, 28.5, 9.5, 3.4, INK),      // upright ears
  bar(36, 17, 46, 31, 3.4, INK),                                           // the standing mane
  ell(29, 23.5, 2.4, 2.4, INK),
  bar(52, 35.5, 52, 50.5, 3, INK), bar(58, 34.4, 58, 51.6, 3, INK), bar(64, 34, 64, 52, 3, INK),
  bar(69, 35, 75, 50, 2.8, INK), bar(74, 33, 82, 47, 2.8, INK),
  bar(78, 36, 87.5, 40, 2.6, INK), bar(76, 43.5, 87, 47, 2.6, INK),
  bar(43, 36, 43, 52, 2.6, INK),
  bar(38.4, 36.2, 46.4, 30.2, 2.4, INK), bar(34.8, 31.4, 42.8, 25.4, 2.4, INK),
];

const FENCE_LO = 96;
const FENCE_HI = 392;

const CAP_T = 238;
const FIG_X = 58;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along:
// +1 where it rises, -1 where it falls, and HOLD while he stands still, so a
// figure who walks left to something keeps facing it while he talks about it.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const PENS = BEATS.map((b) => (b.pens ? 1 : 0));
const PLAQUES = BEATS.map((b) => (b.plaques ? 1 : 0));
const CHAIN = BEATS.map((b) => (b.chain ? 1 : 0));
const GAP = BEATS.map((b) => (b.gap ? 1 : 0));
const SCAN = BEATS.map((b) => (b.scan ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('epistemology35'));

export default function Epistemology35Scene({ clock, bt, bi, qv, i, picked, onPick, dragPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const heldFig = useHeld();
  const cv = useCarry(8);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    // A WALKING BEAT TAKES AS LONG AS THE WALK NEEDS (rig.moveTr). A fixed length
    // here sprinted every long journey and left the footfalls — which the player
    // computes from moveTr — arriving after the figure had stopped.
    const tr = ease01(bt.value / moveTr(X[p], X[n], BASE_TR));
    const t = clock.value;
    const q = clamp01(qv.value);

    const figS = keepHeld(heldFig, travelStance(
      X[p], X[n],
      carryFrom(heldFig, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));

    // THE FENCE READS THE READER'S THUMB, and only on its own beat. Everywhere
    // else it reads the script's own track, so one value never has two sources
    // disagreeing about where the fence is (§17, the drag rule).
    const scan = SCAN[n] === 1 ? clamp01(dragPos.value) : 0;

    return {
      fig: lookPose(figS, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1, gazeX.value, gazeY.value, gazeOn.value),
      t,
      pensOn: carry(cv, 1, n, PENS[p], PENS[n], tr),
      plaqOn: carry(cv, 2, n, PLAQUES[p], PLAQUES[n], tr),
      chainOn: carry(cv, 3, n, CHAIN[p], CHAIN[n], tr),
      fenceOn: carry(cv, 4, n, SCAN[p], SCAN[n], tr),
      // The three tap events, carried, so each fades out as well as in (group L).
      follows: carry(cv, 5, n, FOLLOWS[p], FOLLOWS[n], tr),
      named: carry(cv, 6, n, NAMED[p], NAMED[n], tr),
      stillSay: carry(cv, 7, n, STILL_SAY[p], STILL_SAY[n], tr),
      fenceX: FENCE_LO + (FENCE_HI - FENCE_LO) * scan,
      // The second link parts on the beat that shows the gap, and stays parted — held
      // parted on the beats after, where it used to close and part again (C20c).
      gap: GAP[n] === 1 ? (n > 0 && GAP[p] === 1 ? 1 : ease01((bt.value - 0.3) / 0.75)) : 0,
      // The reached plates fill in as the answer lands on the graded beat.
      lit: LIVE[n] === 1 && GAP[n] === 1 ? ease01(q) : 0,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.drag && LIVE[i] === 1;

  const pensStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.pensOn }));
  const plaqStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.plaqOn }));
  const fenceStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.fenceOn,
    transform: [{ translateX: SCENE.value.fenceX }],
  }));

  // ── the three tap events ───────────────────────────────────────────────────
  //
  // The tick goes on the THIRD plate, because the sentence is about what follows
  // from the first two — the conclusion is the thing being claimed, not the chain.
  const followsStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.follows,
    transform: [{ scale: 1.1 - 0.1 * SCENE.value.follows }],
  }));
  const namedStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.named,
    transform: [{ translateY: (1 - SCENE.value.named) * -6 }],
  }));
  const stillSayStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.stillSay,
    transform: [{ translateY: (1 - SCENE.value.stillSay) * 8 }],
  }));

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={styles.cap}>THE SAME LOOK, TWICE</Text>

      <Chain S={SCENE} picked={picked} onPick={onPick} answered={answered} live={live} />

      <Animated.View style={[StyleSheet.absoluteFill, pensStyle]} pointerEvents="none">
        {PEN_X.map((px) => (
          <View key={px} style={[styles.pen, { left: px }]}>
            <Outlined parts={ZEBRA_LEGS} width={1.4} line={INK} />
            <Shapes parts={ZEBRA_LEG_BANDS} />
            <Shapes parts={ZEBRA_TAIL} />
            <Outlined parts={ZEBRA} width={2} line={INK} />
            <Shapes parts={ZEBRA_MARKS} />
          </View>
        ))}
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, plaqStyle]} pointerEvents="none">
        <Text style={[styles.plaque, { left: PEN_X[0] }]}>ZEBRA</Text>
        <Text style={[styles.plaque, { left: PEN_X[1] }]}>ZEBRA?</Text>
      </Animated.View>

      <Animated.View style={[styles.fence, fenceStyle]} pointerEvents="none">
        <View style={styles.fencePost} />
        <Text style={styles.fenceLabel}>RELEVANT</Text>
      </Animated.View>

      {/* The third plate is what the first two give you. */}
      <Animated.View style={[styles.followsTick, followsStyle]} pointerEvents="none">
        <Text style={styles.followsText}>✓</Text>
      </Animated.View>

      {/* What the principle is called. */}
      <Animated.View style={[styles.namedPlate, namedStyle]} pointerEvents="none">
        <Text style={styles.namedText} numberOfLines={1}>EPISTEMIC CLOSURE</Text>
      </Animated.View>

      {/* And what you would say anyway. */}
      <Animated.View style={[styles.stillPlate, stillSayStyle]} pointerEvents="none">
        <Text style={styles.stillText} numberOfLines={1}>STILL A ZEBRA</Text>
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

// ── the chain: three plates, and one link that gives way ─────────────────────

function Chain({
  S, picked, onPick, answered, live,
}: {
  S: SharedValue<any>; picked: string | null; onPick: (id: string, ok: boolean) => void;
  answered: boolean; live: boolean;
}) {
  const wrap = useAnimatedStyle(() => ({ opacity: S.value.chainOn }));
  const linkB = useAnimatedStyle(() => ({ transform: [{ scaleX: 1 - S.value.gap }] }));
  const litStyle = useAnimatedStyle(() => ({ opacity: S.value.lit }));
  const wrong = (id: string) => answered && picked === id;
  const ids = ['zebra', 'implies', 'mule'];

  return (
    <Animated.View style={[StyleSheet.absoluteFill, wrap]}>
      <View style={[styles.link, { left: PLATE_X[0] + PLATE_W }]} pointerEvents="none" />
      <Animated.View style={[styles.link, { left: PLATE_X[1] + PLATE_W }, linkB]} pointerEvents="none" />

      {PLATE_X.map((px, k) => (
        <Target
          key={px}
          id={ids[k]}
          correct={k === 2}
          picked={picked}
          onPick={onPick}
          disabled={!live || answered}
          style={[styles.plate, { left: px }]}
        >
          <View style={[styles.plateBox, wrong(ids[k]) && styles.plateWrong]} pointerEvents="none" />
          {k === 2 ? <Animated.View style={[styles.plateLit, litStyle]} pointerEvents="none" /> : null}
          <Text style={styles.plateText}>{PLATE_TEXT[k]}</Text>
        </Target>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // ── the three tap events (group AH) ────────────────────────────────────────
  // On the third plate's own top-right corner.
  followsTick: {
    position: 'absolute', left: PLATE_X[2] + PLATE_W - 12, top: PLATE_Y - 10,
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 1.5, borderColor: INK, backgroundColor: PLATE_FACE,
    alignItems: 'center', justifyContent: 'center',
  },
  followsText: {
    fontFamily: 'Inter_700Bold', fontSize: 11, lineHeight: 13, color: INK,
    includeFontPadding: false,
  },
  // Under the chain of plates, above the pens at PEN_Y.
  namedPlate: {
    position: 'absolute', left: PLATE_X[0], top: PLATE_Y + PLATE_H + 8, width: 180, height: 22,
    borderWidth: 1.5, borderColor: INK, borderRadius: 6, backgroundColor: PLATE_FACE,
    boxShadow: LIP, alignItems: 'center', justifyContent: 'center',
  },
  namedText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.9, color: INK,
    includeFontPadding: false,
  },
  // Under the first pen, which is the zebra's own.
  stillPlate: {
    position: 'absolute', left: PEN_X[0], top: PEN_Y + PEN_H + 8, width: PEN_W, height: 24,
    borderWidth: 2, borderColor: INK, borderRadius: 8, backgroundColor: INK,
    alignItems: 'center', justifyContent: 'center',
  },
  stillText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.8, color: PAPER,
    includeFontPadding: false,
  },

  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON. A rule on its own leaves the
  // figure and everything it is looking at standing on bare page;
  // political7 and political8 both stand their subject on a filled mass.
  floor: floorStyle(TONE, GROUND),

  cap: {
    position: 'absolute', left: 116, top: CAP_T, width: 260,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.5, color: SOFT, includeFontPadding: false,
  },

  plate: { position: 'absolute', top: PLATE_Y, width: PLATE_W, height: PLATE_H },
  plateBox: {
    position: 'absolute', left: 0, top: 0, width: PLATE_W, height: PLATE_H,
    borderWidth: 2, borderColor: INK, borderRadius: 8, backgroundColor: PLATE_FACE, boxShadow: LIP,
  },
  plateLit: {
    position: 'absolute', left: 3, top: 3, width: PLATE_W - 6, height: PLATE_H - 6,
    borderRadius: 3, borderWidth: 1.5, borderColor: INK, borderStyle: 'dashed',
  },
  plateWrong: { borderColor: SOFT, borderStyle: 'dashed' },
  plateText: {
    // top 7, not 11: the longest of the three plate texts wraps to two lines, and
    // from 11 the second line's descender ran past the plate's own 34-unit floor.
    // The other two are one line and sit slightly higher, which nothing notices.
    position: 'absolute', left: 4, top: 7, width: PLATE_W - 8, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.5, color: INK, includeFontPadding: false,
  },
  // Scaled about its LEFT end, so the gap opens at the plate the chain fails to reach.
  link: { position: 'absolute', top: PLATE_Y + PLATE_H / 2 - 1, width: 8, height: 2, backgroundColor: INK, transformOrigin: '0% 50%' },

  pen: {
    position: 'absolute', top: PEN_Y, width: PEN_W, height: PEN_H,
    borderWidth: 3, borderColor: INK, borderRadius: 8, backgroundColor: STONE, boxShadow: LIP,
  },

  plaque: {
    position: 'absolute', top: 440, width: PEN_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.6, color: SOFT, includeFontPadding: false,
  },

  fence: { position: 'absolute', left: 0, top: 320, width: 3, height: 120 },
  fencePost: { position: 'absolute', left: 0, top: 0, width: 3, height: 120, backgroundColor: INK },
  fenceLabel: {
    position: 'absolute', left: -26, top: 140, width: 56, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1, color: SOFT, includeFontPadding: false,
  },
});

export function Epistemology35Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Epistemology35Scene} band={[238, 512]} camera={CAM} />;
}
