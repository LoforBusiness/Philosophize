import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, lerp, moveTr, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './epistemology35Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// TWO PENS DRAWN THE SAME, AND A CHAIN THAT WILL NOT REACH.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the CHAIN of three plates runs across the top: each 96×34 at y 244…278, at
//   x 88, 192, 296, with a 2-thick link between them along y 261 (x 184…192 and
//   x 288…296), ending at 392 — level with the fence. It is the argument, drawn as
//   an argument.
// · the two PENS sit at y 330…434: rails at x 116…236 and x 260…380, each a
//   3-thick frame. Inside each, an animal 76 wide × 46 tall at y 356 — SAME
//   shape, SAME stripes in both, because the reader's evidence does not tell
//   them apart. Only the plaques at y 440…452 differ.
// · the RELEVANCE FENCE is a 3-thick upright the drag slides across x 96…392 at
//   y 320…440, so the reader can see how much of the zoo it is being asked to
//   exclude.
// · the figure stands at x 58 and walks to 130. His crown reaches ~397, below
//   the pens' floor line at 434, so he never sits on top of the art.
//
// Ink runs y 244 (the first plate) … y 500 (ground). BAND 238…512 = 274 (H59).
//
// STRIPES ARE FIVE VIEWS EACH, not an image and not an <Svg>: ten Views for both
// animals together, which is nothing, and they can be drawn identically by
// construction rather than by two artists agreeing (§17 rule 7).
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const PLATE_W = 96;
const PLATE_H = 34;
const PLATE_Y = 244;
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
const ANIMAL_Y = 356;
const STRIPES = [0, 16, 32, 48, 64];

const FENCE_LO = 96;
const FENCE_HI = 392;

const CAP_T = 238;
const FIG_X = 58;

const X = BEATS.map((b) => b.x ?? FIG_X);
const P = BEATS.map((b) => b.p ?? 0);
const PENS = BEATS.map((b) => (b.pens ? 1 : 0));
const PLAQUES = BEATS.map((b) => (b.plaques ? 1 : 0));
const CHAIN = BEATS.map((b) => (b.chain ? 1 : 0));
const GAP = BEATS.map((b) => (b.gap ? 1 : 0));
const SCAN = BEATS.map((b) => (b.scan ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('epistemology35'));

export default function Epistemology35Scene({ clock, bt, bi, qv, i, picked, onPick, dragPos }: SceneApi) {
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
      fig: pose(figS, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, 1, 1),
      t,
      pensOn: carry(cv, 1, n, PENS[p], PENS[n], tr),
      plaqOn: carry(cv, 2, n, PLAQUES[p], PLAQUES[n], tr),
      chainOn: carry(cv, 3, n, CHAIN[p], CHAIN[n], tr),
      fenceOn: carry(cv, 4, n, SCAN[p], SCAN[n], tr),
      fenceX: FENCE_LO + (FENCE_HI - FENCE_LO) * scan,
      // The second link parts on the beat that shows the gap, and stays parted.
      gap: GAP[n] === 1 ? ease01((bt.value - 0.3) / 0.75) : 0,
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

  return (
    <View style={styles.scene}>
      <Text style={styles.cap}>THE SAME LOOK, TWICE</Text>

      <Chain S={SCENE} picked={picked} onPick={onPick} answered={answered} live={live} />

      <Animated.View style={[StyleSheet.absoluteFill, pensStyle]} pointerEvents="none">
        {PEN_X.map((px) => (
          <View key={px} style={[styles.pen, { left: px }]}>
            <View style={styles.animalBody} />
            {STRIPES.map((sx) => (
              <View key={sx} style={[styles.stripe, { left: 26 + sx }]} />
            ))}
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
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },

  cap: {
    position: 'absolute', left: 116, top: CAP_T, width: 260,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.5, color: SOFT, includeFontPadding: false,
  },

  plate: { position: 'absolute', top: PLATE_Y, width: PLATE_W, height: PLATE_H },
  plateBox: {
    position: 'absolute', left: 0, top: 0, width: PLATE_W, height: PLATE_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
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
    borderWidth: 3, borderColor: INK, borderRadius: 3, backgroundColor: PAPER,
  },
  animalBody: {
    position: 'absolute', left: 22, top: ANIMAL_Y - PEN_Y, width: 76, height: 46,
    borderRadius: 10, borderWidth: 2.5, borderColor: INK, backgroundColor: PAPER,
  },
  stripe: { position: 'absolute', top: ANIMAL_Y - PEN_Y + 6, width: 5, height: 34, backgroundColor: INK, borderRadius: 2 },

  plaque: {
    position: 'absolute', top: 440, width: PEN_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.6, color: SOFT, includeFontPadding: false,
  },

  fence: { position: 'absolute', left: 0, top: 320, width: 3, height: 120 },
  fencePost: { position: 'absolute', left: 0, top: 0, width: 3, height: 120, backgroundColor: INK },
  fenceLabel: {
    position: 'absolute', left: -26, top: 122, width: 56, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1, color: SOFT, includeFontPadding: false,
  },
});

export function Epistemology35Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Epistemology35Scene} band={[238, 512]} camera={CAM} />;
}
