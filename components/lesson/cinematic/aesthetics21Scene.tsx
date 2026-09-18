import { View, Text, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import Animated, {
  useDerivedValue, useAnimatedStyle, useSharedValue, withTiming, Easing,
} from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, clamp01, ease01, moveTr, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './aesthetics21Script';
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
const TONE = stageTone('aesthetics');
const { RULE, STONE, SHADE } = TONE;
const LIP = lipOf(TONE);   // the ledge a toned plate stands on (scripts/skin-stage.mjs)

// ─────────────────────────────────────────────────────────────────────────────
// THREE COLUMNS OF STOCK, EMPTIED, AND ONE VERDICT THAT DIFFERS.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · THREE COLUMNS, 104 wide, at x 30 · 148 · 266 — the row ends at x 370. Each is
//   headed at y 234 (A NOVEL · A SYMPHONY · A PAINTING) and holds its stock as
//   slabs between y 252 and y 344.
// · the STOCK is drawn to scale and never abstracted: SIX 104×12 slabs stepping
//   14 for the novel, FOUR for the symphony, and ONE 104×92 slab for the
//   painting. The painting's single object filling the whole column height is
//   the picture's first argument, made before a word about it.
// · DESTRUCTION runs left to right across all three columns on one track, so no
//   column is treated more gently than another. A destroyed slab collapses to
//   0 height rather than fading: a faint slab would read as a damaged copy.
// · the VERDICT PLATES are 104×22 at y 352…374, one under each column: STILL
//   EXISTS, STILL EXISTS, GONE. They are the only ink below the stock.
// · the FIGURE walks x 200 → 132 → 268 on GROUND 500; crown ≈ 397, plates end at
//   374, so 23 units stay clear — tight, and the reason the plates are two words.
//
// THE BAND HAS TO HOLD THE ANSWER LIFT, NOT JUST THE RESTING POSE. A column and
// its heading rise ten units together when the reader picks it (E39), so the
// topmost ink a beat can draw is the heading at 234 MINUS 10 = 224, not 234. The
// band was measured against the resting picture and was four units short of its
// own reaction: the word A PAINTING lost its top to the crop at the exact moment
// the reader got it right. 216 leaves eight units of headroom and takes the
// figure's share from 36% to 35%, which is further inside H58's line rather than
// nearer it.
//
// Ink runs y 224 (the headings, lifted) … y 500. BAND 216…512 = 296, with the 103-unit
// figure at 35%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const COL_X = [30, 148, 266];
const COL_W = 104;
const COL_ID = ['novel', 'symphony', 'painting'];
const COL_CAP = ['A NOVEL', 'A SYMPHONY', 'A PAINTING'];
const COL_VERDICT = ['STILL EXISTS', 'STILL EXISTS', 'GONE'];
/** How many objects each work has, and how tall each one is drawn. */
const STOCK = [6, 4, 1];
const SLAB_H = [12, 12, 92];
const SLAB_STEP = [14, 14, 0];

const STOCK_TOP = 252;
const PLATE_Y = 352;

// The empty-set mark sits above the ash (331…344) and below the caption (234…244).
const NO_SCORE_Y = 274;
// The term row sits at the same height as the (still-hidden) verdict plates —
// gone again well before either verdict has a reason to show.
const TERM_Y = 352;
// The new case's own mark sits inside the symphony column's emptied body — clear
// of the verdict row, which is already visible by the beat this one arrives on.
const PHOTO_Y = 288;

const FIG_X = 200;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along:
// +1 where it rises, -1 where it falls, and HOLD while he stands still, so a
// figure who walks left to something keeps facing it while he talks about it.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const WORKS = BEATS.map((b) => b.works ?? 0);
const BURN = BEATS.map((b) => b.burn ?? 0);
const GONE = BEATS.map((b) => b.gone ?? 0);
const LIVE = BEATS.map((b) => b.live ?? 0);
/** The beat that asks on the stage — the one the verdict plates must wait for. */
const ASK_BEAT = LIVE.findIndex((v) => v === 1);
// GROUP AH — three still taps, each moving a new mass rather than a caption.
const NO_SCORE = BEATS.map((b) => ((b.noScore ?? 0) > 0 ? 1 : 0));
const LABEL = BEATS.map((b) => ((b.label ?? 0) > 0 ? 1 : 0));
const PHOTO_TAG = BEATS.map((b) => ((b.photoTag ?? 0) > 0 ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('aesthetics21'));

// R7c — LEFT STILL ON PURPOSE: the seam asks how far a photograph is like a novel and how far
// like a painting, and the stage's answer to "is the work gone?" is the verdict plate under
// the photograph, which waits for the pick (O5). Driving it off the seam would print one
// wrong answer's verdict at each end, and a blur of both in the middle.
export default function Aesthetics21Scene({ clock, bt, bi, i, picked, onPick, gazeX, gazeY, gazeOn }: SceneApi) {
  const heldFig = useHeld();
  const cv = useCarry(7);
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;
  const noScoreFade = (cur.noScore ?? 0) !== (prev?.noScore ?? 0);
  const labelFade = (cur.label ?? 0) !== (prev?.label ?? 0);
  const photoTagFade = (cur.photoTag ?? 0) !== (prev?.photoTag ?? 0);
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
      works: carry(cv, 1, n, WORKS[p], WORKS[n], tr),
      burn: carry(cv, 2, n, BURN[p], BURN[n], tr),
      gone: carry(cv, 3, n, GONE[p], GONE[n], tr),
      // An empty-set mark over the ash — nothing survives to notate it from.
      noScore: carry(cv, 4, n, NO_SCORE[p], NO_SCORE[n], noScoreFade ? grow : 1),
      // The two categories, bracketed onto the columns that hold them.
      label: carry(cv, 5, n, LABEL[p], LABEL[n], labelFade ? grow : 1),
      // The new case, not yet sorted into either column.
      photoTag: carry(cv, 6, n, PHOTO_TAG[p], PHOTO_TAG[n], photoTagFade ? grow : 1),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  // THE VERDICTS ARE THE REVEAL, NOT THE LABEL (group O).
  //
  // They used to be up from the beat after the burn, so the question — "tap the
  // work that is actually gone" — was asked with GONE already printed under the
  // right answer and STILL EXISTS under the other two. Nothing failed: the plates
  // are the scene's own content, not the deck's explanation, so check:spoiler had
  // no reason to look at them.
  //
  // They are held back to the moment the reader commits now, which also makes them
  // a better beat: the picture agrees with you instead of telling you.
  const revealed = useSharedValue(0);
  useEffect(() => {
    const on = i > ASK_BEAT || (i === ASK_BEAT && picked !== null);
    revealed.value = withTiming(on ? 1 : 0, { duration: 320, easing: Easing.out(Easing.cubic) });
  }, [i, picked, revealed]);
  const goneStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.gone * revealed.value }));
  const noScoreStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.noScore }));
  const labelStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.label }));
  const photoTagStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.photoTag }));

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      {/* EACH COLUMN RIDES WITH ITS OWN TARGET (E39) — AND SO DOES ITS NAME.
          The caption used to be drawn outside the lift, so the ten units the
          answer rises took the painting's frame up into the words A PAINTING and
          printed its own top edge through them. Inside the lift, the gap between
          a column and the word for it cannot change, whatever the reaction does. */}
      {COL_X.map((cx, k) => (
        <AnswerLift key={COL_ID[k]} id={COL_ID[k]} picked={picked} correct={COL_ID[k] === 'painting'}>
          <Text style={[styles.cap, { left: cx }]} numberOfLines={1}>{COL_CAP[k]}</Text>
          <Column S={SCENE} col={k} />
          {k === 2 ? <Ash S={SCENE} col={k} /> : null}
        </AnswerLift>
      ))}

      {/* nothing survives to remake the painting from */}
      <Animated.Text style={[styles.noScore, noScoreStyle]} pointerEvents="none">∅</Animated.Text>

      {/* the two categories, bracketed onto the columns that hold them */}
      <Animated.View style={[styles.termPlate, styles.alloPlate, labelStyle]} pointerEvents="none">
        <Text style={styles.termText} numberOfLines={1}>ALLOGRAPHIC</Text>
      </Animated.View>
      <Animated.View style={[styles.termPlate, styles.autoPlate, labelStyle]} pointerEvents="none">
        <Text style={styles.termText} numberOfLines={1}>AUTOGRAPHIC</Text>
      </Animated.View>

      {/* the new case, introduced unsorted — in the symphony column's own emptied
          body, clear of the verdict row already showing by this beat (ASK_BEAT
          has passed) */}
      <Animated.View style={[styles.photoPlate, photoTagStyle]} pointerEvents="none">
        <Text style={styles.termText} numberOfLines={1}>A PRINT?</Text>
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, goneStyle]} pointerEvents="none">
        {COL_X.map((cx, k) => (
          <AnswerLift key={`v${k}`} id={COL_ID[k]} picked={picked} correct={COL_ID[k] === 'painting'}>
            <View style={[styles.plate, { left: cx }, k === 2 && styles.plateGone]} />
            <Text style={[styles.plateText, { left: cx }, k === 2 && styles.plateTextGone]}>
              {COL_VERDICT[k]}
            </Text>
          </AnswerLift>
        ))}
      </Animated.View>

      {COL_X.map((cx, k) => (
        <Target
          key={`t${COL_ID[k]}`}
          id={COL_ID[k]}
          correct={COL_ID[k] === 'painting'}
          picked={picked}
          onPick={onPick}
          disabled={!live || answered}
          style={[styles.hit, { left: cx }]}
        >
          <View
            style={[
              styles.hitBox,
              answered && COL_ID[k] === 'painting' && styles.right,
              answered && picked === COL_ID[k] && COL_ID[k] !== 'painting' && styles.wrong,
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

/** One work's stock, emptied left to right on the shared destruction track. */
function Column({ S, col }: { S: { value: { works: number; burn: number } }; col: number }) {
  const left = COL_X[col];
  const slabs: number[] = [];
  for (let s = 0; s < STOCK[col]; s++) slabs.push(s);
  return (
    <View pointerEvents="none">
      {slabs.map((s) => <Slab key={s} S={S} col={col} index={s} left={left} />)}
    </View>
  );
}

function Slab({
  S, col, index, left,
}: { S: { value: { works: number; burn: number } }; col: number; index: number; left: number }) {
  const top = STOCK_TOP + index * SLAB_STEP[col];
  const full = SLAB_H[col];
  const st = useAnimatedStyle(() => {
    // Each column empties over the same 0…1, so a six-deep stock and a one-deep
    // one finish together and the comparison is about what is LEFT, not speed.
    const u = clamp01(S.value.burn * STOCK[col] - index);
    return {
      opacity: clamp01(S.value.works * 3 - col),
      height: full * (1 - u),
    };
  });
  return <Animated.View style={[styles.slab, { left, top }, st]} />;
}

// WHAT THE FIRE LEFT (S11).
//
// The novel and the symphony end the burn as a stack of six and four hairlines —
// their editions, emptied but still countable. The painting is ONE canvas, so at
// burn 1 its column held nothing whatever, and the reader was asked to tap the
// work that is gone while looking at three outlines of which one was bare paper.
//
// A burned painting is not an absent painting. It is ash, and drawing the ash is
// the same rule the cheese was rebuilt for (§13): the picture has to BE the thing
// it names. It also says out loud what the column means — the novel's stock can
// be reprinted from what survives; this heap cannot.
const ASH = [
  { dx: 8, w: 30, h: 9 },
  { dx: 36, w: 22, h: 13 },
  { dx: 56, w: 34, h: 8 },
];
function Ash({ S, col }: { S: { value: { works: number; burn: number } }; col: number }) {
  const left = COL_X[col];
  const base = STOCK_TOP + 92;
  const st = useAnimatedStyle(() => ({
    opacity: clamp01(S.value.works * 3 - col) * clamp01(S.value.burn * 1.4 - 0.4),
  }));
  return (
    <Animated.View pointerEvents="none" style={st}>
      {ASH.map((a, k) => (
        <View key={k} style={[styles.ash, { left: left + a.dx, width: a.w, height: a.h, top: base - a.h }]} />
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON. A rule alone leaves the figure
  // standing on bare page; a filled band under it is what the two lessons
  // the reader holds up both do, and it costs one View.
  floor: floorStyle(TONE, GROUND),

  noScore: {
    position: 'absolute', top: NO_SCORE_Y, left: COL_X[2], width: COL_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 16, color: INK, includeFontPadding: false,
  },

  // A TERM NAMED ON THE THING IT APPLIES TO. Dashed for the unsorted case, solid
  // once a column actually holds the category.
  termPlate: {
    position: 'absolute', top: TERM_Y, height: 20,
    borderWidth: 1.5, borderColor: INK, borderRadius: 3, backgroundColor: PLATE_FACE, boxShadow: LIP,
    alignItems: 'center', justifyContent: 'center',
  },
  alloPlate: { left: COL_X[0], width: (COL_X[1] + COL_W) - COL_X[0] },
  autoPlate: { left: COL_X[2], width: COL_W },
  // In the symphony column's own emptied body — clear of the verdict row, which
  // is already showing by the beat this arrives on.
  photoPlate: {
    position: 'absolute', left: COL_X[1], top: PHOTO_Y, width: COL_W, height: 20,
    borderWidth: 1.5, borderColor: INK, borderRadius: 3, backgroundColor: PLATE_FACE, boxShadow: LIP,
    borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center',
  },
  termText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.8, color: INK, includeFontPadding: false,
  },

  cap: {
    position: 'absolute', top: 234, width: COL_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.1, color: SOFT, includeFontPadding: false,
  },
  ash: {
    position: 'absolute',
    borderWidth: 1.5, borderColor: INK, borderRadius: 1.5, backgroundColor: STONE, boxShadow: LIP,
  },
  slab: {
    position: 'absolute', width: COL_W,
    borderWidth: 1.5, borderColor: INK, borderRadius: 2, backgroundColor: STONE, boxShadow: LIP,
  },

  plate: {
    position: 'absolute', top: PLATE_Y, width: COL_W, height: 22,
    borderWidth: 1.5, borderColor: SOFT, borderRadius: 3, backgroundColor: STONE, boxShadow: LIP,
  },
  plateGone: { borderColor: INK, borderWidth: 2, backgroundColor: INK },
  plateText: {
    position: 'absolute', top: PLATE_Y + 7, width: COL_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1, color: INK, includeFontPadding: false,
  },
  plateTextGone: { color: PAPER },

  hit: { position: 'absolute', top: STOCK_TOP, width: COL_W, height: 92 },
  hitBox: { width: COL_W, height: 92, borderRadius: 3 },
  right: { borderWidth: 3, borderColor: INK },
  wrong: { borderWidth: 1.5, borderColor: SOFT, borderStyle: 'dashed', opacity: 0.5 },
});

export function Aesthetics21Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Aesthetics21Scene} band={[216, 512]} camera={CAM} />;
}
