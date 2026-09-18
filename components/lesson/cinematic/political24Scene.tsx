import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, ease01, moveTr, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './political24Script';
import { facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { floorStyle, lipOf, PLATE_FACE } from './stageSkin';
import type { SceneApi } from './CinematicPlayer';
import Target, { AnswerLift } from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// THE STAGE IS STRUCK IN THIS LESSON'S OWN BRANCH HUE (./stageTones).
// Same three tones, same luminance to the third decimal — so every contrast
// measured against the old greys still holds and nothing on the stage moved.
const TONE = stageTone('political-philosophy');
const { RULE, STONE, SHADE } = TONE;
const LIP = lipOf(TONE);   // the ledge a toned plate stands on (scripts/skin-stage.mjs)

// ─────────────────────────────────────────────────────────────────────────────
// WHERE A LANGUAGE IS ALLOWED TO APPEAR, AND HOW MANY STILL SPEAK IT.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · THREE PLACE PLATES, 104×54, at x 24 · 148 · 272, y 244…298. Each carries an
//   8pt kicker at y 252 and two ink WORD BARS at y 272 and y 282 — 62×5 and
//   40×5. The bars are the language itself: a plate whose words have gone pale
//   is a place it is no longer printed, and no caption has to say so (A1).
// · the FIRST TWO plates are the public ones and dim together. the THIRD is
//   private and is lit on every beat of the lesson, which is the entire point
//   of the first question.
// · FIVE SPEAKER BARS, 60 wide, at x 28 · 98 · 168 · 238 · 308, standing on
//   y 366. Held they run 52 · 51 · 50 · 49 · 48; abandoned they run
//   52 · 37 · 24 · 13 · 5. Both profiles start at the same height, because the
//   generation alive now is the same either way and only what follows differs.
// · the CAPTION SPEAKERS, BY GENERATION sits at y 302, in the 12 units between
//   the plates and the tallest bar.
// · the FIGURE walks x 200 → 132 → 268 on GROUND 500; crown ≈ 397, and the
//   lowest ink is the bar floor at y 366, so 31 units stay clear.
//
// Ink runs y 244 (the plates) … y 500. BAND 238…512 = 274, with the 103-unit
// figure at 37.6%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const PL_Y = 244;
const PL_W = 104;
const PL_H = 54;
const PL_X = [24, 148, 272];
const PL_KICK = ['IN COURT', 'IN SCHOOL', 'IN PRIVATE'];

const CAP_Y = 302;

const BAR_X = [28, 98, 168, 238, 308];
const BAR_W = 60;
const BAR_BASE = 366;
const BAR_HELD = [52, 51, 50, 49, 48];
const BAR_GONE = [52, 37, 24, 13, 5];

const FIG_X = 200;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along:
// +1 where it rises, -1 where it falls, and HOLD while he stands still, so a
// figure who walks left to something keeps facing it while he talks about it.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const SIGNS = BEATS.map((b) => b.signs ?? 0);
const PUB = BEATS.map((b) => b.pub ?? 0);
const LIVE = BEATS.map((b) => b.live ?? 0);
// group AH — one-shot marks for the two still taps: a bridge linking the public
// plates, and a dashed split between the public pair and the private plate.
const LINK = BEATS.map((b) => ((b.link ?? 0) > 0 ? 1 : 0));
const CLASH = BEATS.map((b) => ((b.clash ?? 0) > 0 ? 1 : 0));

// On its own lever beat the arm drives the whole stage (R7): the two public
// plates light as it travels and the generations stand back up behind them.
// The prompt asks what would keep those bars standing, and the reader can
// simply watch it happen instead of being told.
const PULL = BEATS.map((b) => (b.interact?.lever ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('political24'));

export default function Political24Scene({
  clock, bt, bi, i, picked, onPick, dragPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const heldFig = useHeld();
  const cv = useCarry(5);
  const pulling = PULL[i] === 1;
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;
  // A mark fades IN on the beat that asks for it and back OUT on the next, rather
  // than cutting (see "AND FADE AN EVENT OUT, NOT OFF").
  const linkFade = (cur.link ?? 0) !== (prev?.link ?? 0);
  const clashFade = (cur.clash ?? 0) !== (prev?.clash ?? 0);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    // A WALKING BEAT TAKES AS LONG AS THE WALK NEEDS (rig.moveTr). A fixed length
    // here sprinted every long journey and left the footfalls — which the player
    // computes from moveTr — arriving after the figure had stopped.
    const tr = ease01(bt.value / moveTr(X[p], X[n], BASE_TR));
    const t = clock.value;
    const grow = ease01(bt.value / 0.55);

    const figS = keepHeld(heldFig, travelStance(
      X[p], X[n],
      carryFrom(heldFig, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));

    return {
      fig: lookPose(figS, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1, gazeX.value, gazeY.value, gazeOn.value),
      signs: carry(cv, 1, n, SIGNS[p], SIGNS[n], tr),
      // Through `carry` so the arm takes over across the transition rather than
      // on one frame — see metaphysics21Scene for why that matters.
      pub: carry(cv, 2, n, PUB[p], pulling ? dragPos.value : PUB[n], tr),
      // group AH — one-shot, fades in on its own beat and back out on the next.
      link: carry(cv, 3, n, LINK[p], LINK[n], linkFade ? grow : 1),
      clash: carry(cv, 4, n, CLASH[p], CLASH[n], clashFade ? grow : 1),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const signStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.signs }));
  // A bridge in the gap between the two PUBLIC plates (Charles Taylor: identity
  // formed in dialogue with others — the two public plates are where that
  // dialogue plays out, and they will dim together).
  const linkStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.link }));
  // A dashed split in the gap between the public pair and the private plate
  // (Taylor: two demands in conflict — treat everyone alike, or recognise
  // difference. The line marks the two plate-groups pulling apart.)
  const clashStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.clash }));

  const plates = [0, 1, 2];
  const bars = [0, 1, 2, 3, 4];

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Animated.View style={[StyleSheet.absoluteFill, signStyle]} pointerEvents="none">
        {PL_X.map((px, k) => (
          <View key={px}>
            <View style={[styles.plate, { left: px }]} />
            <Text style={[styles.kicker, { left: px }]}>{PL_KICK[k]}</Text>
          </View>
        ))}
        <Text style={styles.caption}>SPEAKERS, BY GENERATION</Text>
      </Animated.View>

      {/* group AH — the bridge linking the two public plates. */}
      <Animated.View style={[styles.linkWrap, linkStyle]} pointerEvents="none">
        <View style={styles.linkBar} />
        <View style={styles.linkCapL} />
        <View style={styles.linkCapR} />
      </Animated.View>

      {/* group AH — the dashed split between the public pair and the private plate. */}
      <Animated.View style={[styles.clashWrap, clashStyle]} pointerEvents="none">
        <View style={styles.clashLine} />
      </Animated.View>

      {/* Each place rides with its own target (E39). */}
      {plates.map((k) => (
        <AnswerLift key={`w${k}`} id={`place${k}`} picked={picked} correct={k === 2}>
          <Words S={SCENE} k={k} />
        </AnswerLift>
      ))}
      {bars.map((k) => <Bar key={`b${k}`} S={SCENE} k={k} />)}

      {plates.map((k) => (
        <Target
          key={`p${k}`}
          id={`place${k}`}
          correct={k === 2}
          picked={picked}
          onPick={onPick}
          disabled={!live || answered}
          style={[styles.hit, { left: PL_X[k] }]}
        >
          <View
            style={[
              styles.hitBox,
              k === 2 ? (answered && styles.right) : (answered && picked === `place${k}` && styles.wrong),
            ]}
            pointerEvents="none"
          />
        </Target>
      ))}

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

/** The language on plate k. Plate 2 is private and never goes out. */
function Words({ S, k }: { S: { value: { signs: number; pub: number } }; k: number }) {
  const st = useAnimatedStyle(() => {
    const lit = k === 2 ? 1 : 0.14 + 0.86 * S.value.pub;
    return { opacity: S.value.signs * lit };
  });
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, st]}>
      <View style={[styles.word, { left: PL_X[k] + 12, top: 272, width: 62 }]} />
      <View style={[styles.word, { left: PL_X[k] + 12, top: 282, width: 40 }]} />
    </Animated.View>
  );
}

/** Generation k, counted. It follows the public plates and nothing else. */
function Bar({ S, k }: { S: { value: { signs: number; pub: number } }; k: number }) {
  const st = useAnimatedStyle(() => {
    const h = BAR_GONE[k] + (BAR_HELD[k] - BAR_GONE[k]) * S.value.pub;
    return { opacity: S.value.signs, height: h, top: BAR_BASE - h };
  });
  return <Animated.View pointerEvents="none" style={[styles.bar, { left: BAR_X[k] }, st]} />;
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON. A rule on its own leaves the
  // figure and everything it is looking at standing on bare page;
  // political7 and political8 both stand their subject on a filled mass.
  floor: floorStyle(TONE, GROUND),

  plate: {
    position: 'absolute', top: PL_Y, width: PL_W, height: PL_H,
    borderWidth: 2, borderColor: INK, borderRadius: 8, backgroundColor: STONE, boxShadow: LIP,
  },
  kicker: {
    position: 'absolute', top: PL_Y + 8, width: PL_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1, color: SOFT, includeFontPadding: false,
  },
  word: { position: 'absolute', height: 5, backgroundColor: INK, borderRadius: 2 },

  caption: {
    position: 'absolute', left: BAR_X[0], top: CAP_Y,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.1, color: SOFT, includeFontPadding: false,
  },
  bar: { position: 'absolute', width: BAR_W, backgroundColor: INK, borderTopLeftRadius: 3, borderTopRightRadius: 3 },

  hit: { position: 'absolute', top: PL_Y, width: PL_W, height: PL_H },
  hitBox: { width: PL_W, height: PL_H, borderRadius: 4 },
  right: { borderWidth: 3, borderColor: INK },
  wrong: { borderWidth: 1.5, borderColor: SOFT, borderStyle: 'dashed' },

  // ── the two tap events (group AH) ──────────────────────────────────────────
  // A bridge: a short bar with two end-caps, sitting in the 20-unit gap between
  // the IN COURT and IN SCHOOL plates — the two plates that dim together.
  linkWrap: { position: 'absolute', left: 0, top: 0, width: PL_X[2] + PL_W, height: PL_Y + PL_H },
  linkBar: { position: 'absolute', left: PL_X[0] + PL_W + 2, top: PL_Y + PL_H / 2 - 1, width: PL_X[1] - (PL_X[0] + PL_W) - 4, height: 2, backgroundColor: INK, borderRadius: 1 },
  linkCapL: { position: 'absolute', left: PL_X[0] + PL_W + 1, top: PL_Y + PL_H / 2 - 8, width: 2, height: 16, backgroundColor: INK },
  linkCapR: { position: 'absolute', left: PL_X[1] - 3, top: PL_Y + PL_H / 2 - 8, width: 2, height: 16, backgroundColor: INK },
  // A dashed divider — never a fill (D31) — in the 20-unit gap between IN SCHOOL
  // and IN PRIVATE, the boundary the two conflicting demands sit either side of.
  clashWrap: { position: 'absolute', left: 0, top: 0, width: PL_X[2] + PL_W, height: PL_Y + PL_H },
  clashLine: { position: 'absolute', left: PL_X[1] + PL_W + (PL_X[2] - (PL_X[1] + PL_W)) / 2, top: PL_Y, width: 0, height: PL_H, borderLeftWidth: 1.5, borderColor: SHADE, borderStyle: 'dashed' },
});

export function Political24Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Political24Scene} band={[238, 512]} camera={CAM} />;
}
