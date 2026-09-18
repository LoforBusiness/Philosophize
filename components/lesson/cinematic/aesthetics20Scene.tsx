import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, clamp01, ease01, moveTr, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './aesthetics20Script';
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
// FOUR ROWS, THREE OF THEM CROSSED OUT BY WHAT ARRIVED BESIDE THEM.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · FOUR ROWS, 26 tall, at y 246 · 278 · 310 · 342. Each is two boxes: the CLAIM
//   at x 34…186 (152) and the SUBSTITUTE at x 210…362 (152), with a 24-unit
//   gutter between them at x 186…210 holding a small right-arrow.
// · the SUBSTITUTES arrive in reading order on `swaps`, sliding 14 in from the
//   right so the reader sees them come rather than appear.
// · the STRIKE is a 2-thick rule across BOTH boxes of a row, x 34…362, drawn on
//   `struck` and never removed. Only rows 0, 1 and 2 ever get one.
// · ROW 3 HAS NO SUBSTITUTE BOX AT ALL — not an empty outline, not a dimmed one.
//   The right half of that row is paper. An outlined empty box would say
//   "something is missing here"; blank paper says nothing came, which is the
//   claim being made.
// · the CAPTIONS WHAT IT IS FOR and WHAT ELSE DOES IT sit at y 232, over their
//   columns.
// · the FIGURE walks x 200 → 132 → 268 on GROUND 500; crown ≈ 397, the last row
//   ends at y 368, so 29 units stay clear.
//
// Ink runs y 232 (the captions) … y 500. BAND 226…512 = 286, with the 103-unit
// figure at 36%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const ROW_TOP = [246, 278, 310, 342];
const ROW_H = 26;
const CLAIM_X = 34;
const CLAIM_W = 152;
const SUB_X = 210;
const SUB_W = 152;

const ROWS = [
  { id: 'teach', claim: 'IT TEACHES YOU THINGS', sub: 'A TEXTBOOK' },
  { id: 'record', claim: 'IT RECORDS HOW THINGS LOOKED', sub: 'A CAMERA' },
  { id: 'decor', claim: 'IT MAKES A ROOM NICER', sub: 'WALLPAPER' },
  { id: 'seeing', claim: 'IT SHOWS YOU SOMEONE\'S EYES', sub: null },
] as const;

const FIG_X = 200;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along:
// +1 where it rises, -1 where it falls, and HOLD while he stands still, so a
// figure who walks left to something keeps facing it while he talks about it.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const USES = BEATS.map((b) => b.uses ?? 0);
const SWAPS = BEATS.map((b) => b.swaps ?? 0);
const STRUCK = BEATS.map((b) => b.struck ?? 0);
const LIVE = BEATS.map((b) => b.live ?? 0);
// GROUP AH — three still taps, each moving a new mass rather than a caption.
const SPOT_DECOR = BEATS.map((b) => ((b.spotDecor ?? 0) > 0 ? 1 : 0));
const SPOT_SEEING = BEATS.map((b) => ((b.spotSeeing ?? 0) > 0 ? 1 : 0));
const WORTH = BEATS.map((b) => ((b.worth ?? 0) > 0 ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('aesthetics20'));

// R7c — LEFT STILL ON PURPOSE: the bins name what an elimination ESTABLISHES (proves the last
// · changes nothing · narrows the field), and the three struck reasons are facts of the case
// under all three. The only per-bin picture would be a PROVED stamp for a wrong bin, or
// undoing strikes that did happen, and both would draw a falsehood.
export default function Aesthetics20Scene({ clock, bt, bi, i, picked, onPick, gazeX, gazeY, gazeOn }: SceneApi) {
  const heldFig = useHeld();
  const cv = useCarry(7);
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;
  const spotDecorFade = (cur.spotDecor ?? 0) !== (prev?.spotDecor ?? 0);
  const spotSeeingFade = (cur.spotSeeing ?? 0) !== (prev?.spotSeeing ?? 0);
  const worthFade = (cur.worth ?? 0) !== (prev?.worth ?? 0);
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
      uses: carry(cv, 1, n, USES[p], USES[n], tr),
      swaps: carry(cv, 2, n, SWAPS[p], SWAPS[n], tr),
      struck: carry(cv, 3, n, STRUCK[p], STRUCK[n], tr),
      // Rings that follow the narration onto the row it's currently naming —
      // the strikes themselves already happened; this is what's being SAID now.
      spotDecor: carry(cv, 4, n, SPOT_DECOR[p], SPOT_DECOR[n], spotDecorFade ? grow : 1),
      spotSeeing: carry(cv, 5, n, SPOT_SEEING[p], SPOT_SEEING[n], spotSeeingFade ? grow : 1),
      // A tick on each replaced claim — replaceable, and still worth having.
      worth: carry(cv, 6, n, WORTH[p], WORTH[n], worthFade ? grow : 1),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={[styles.cap, { left: CLAIM_X, width: CLAIM_W }]} pointerEvents="none">WHAT IT IS FOR</Text>
      <Text style={[styles.cap, { left: SUB_X, width: SUB_W }]} pointerEvents="none">WHAT ELSE DOES IT</Text>

      {/* Each answer rides with its own target (E39). */}
      {ROWS.map((r, k) => (
        <AnswerLift key={r.id} id={r.id} picked={picked} correct={r.sub === null}>
          <Row S={SCENE} index={k} />
        </AnswerLift>
      ))}

      {/* the ring that follows the narration onto whichever row it's naming */}
      <Spot S={SCENE} field="spotDecor" index={2} />
      <Spot S={SCENE} field="spotSeeing" index={3} />
      {/* a tick on each replaced claim — still worth having */}
      {[0, 1, 2].map((k) => (
        <WorthMark key={k} k={k} S={SCENE} />
      ))}

      {ROWS.map((r, k) => (
        <Target
          key={`t${r.id}`}
          id={r.id}
          correct={r.sub === null}
          picked={picked}
          onPick={onPick}
          disabled={!live || answered}
          style={[styles.hit, { top: ROW_TOP[k] }]}
        >
          <View
            style={[
              styles.hitBox,
              answered && r.sub === null && styles.right,
              answered && picked === r.id && r.sub !== null && styles.wrong,
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

/** A ring on whichever row the narration is currently naming — the strike
 *  already happened; this is what's being said right now. */
function Spot({
  S, field, index,
}: {
  S: { value: { spotDecor: number; spotSeeing: number } };
  field: 'spotDecor' | 'spotSeeing';
  index: number;
}) {
  const style = useAnimatedStyle(() => ({ opacity: field === 'spotDecor' ? S.value.spotDecor : S.value.spotSeeing }));
  return <Animated.View style={[styles.spot, { top: ROW_TOP[index] - 3 }, style]} pointerEvents="none" />;
}

/** A tick on one replaced claim — struck, and still worth having. */
function WorthMark({ k, S }: { k: number; S: { value: { worth: number } } }) {
  const style = useAnimatedStyle(() => ({ opacity: S.value.worth }));
  return (
    <Animated.Text style={[styles.worthMark, { top: ROW_TOP[k] + 5, left: CLAIM_X + CLAIM_W - 15 }, style]} pointerEvents="none">
      ✓
    </Animated.Text>
  );
}

/** One reason, its replacement, and the line through both when it lands. */
function Row({ S, index }: { S: { value: { uses: number; swaps: number; struck: number } }; index: number }) {
  const r = ROWS[index];
  const top = ROW_TOP[index];
  const claimStyle = useAnimatedStyle(() => ({ opacity: clamp01(S.value.uses * 4 - index) }));
  const subStyle = useAnimatedStyle(() => {
    const u = clamp01(S.value.swaps * 3 - index);
    return { opacity: u, transform: [{ translateX: 14 * (1 - u) }] };
  });
  const strikeStyle = useAnimatedStyle(() => {
    const u = clamp01(S.value.struck * 3 - index);
    return { opacity: u, width: (SUB_X + SUB_W - CLAIM_X) * u };
  });
  return (
    <View pointerEvents="none">
      <Animated.View style={[styles.claim, { top }, claimStyle]}>
        <Text style={styles.claimText} numberOfLines={2}>{r.claim}</Text>
      </Animated.View>

      {r.sub ? (
        <>
          <Animated.Text style={[styles.arrow, { top: top + 7 }, subStyle]}>›</Animated.Text>
          <Animated.View style={[styles.sub, { top }, subStyle]}>
            <Text style={styles.subText} numberOfLines={1}>{r.sub}</Text>
          </Animated.View>
          <Animated.View style={[styles.strike, { top: top + ROW_H / 2 }, strikeStyle]} />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON. A rule alone leaves the figure
  // standing on bare page; a filled band under it is what the two lessons
  // the reader holds up both do, and it costs one View.
  floor: floorStyle(TONE, GROUND),

  cap: {
    position: 'absolute', top: 232,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.2, color: SOFT, includeFontPadding: false,
  },

  // A RING, NOT A FILL — it names which row the voice is on without re-claiming
  // anything the strike already settled.
  spot: {
    position: 'absolute', left: CLAIM_X - 3, width: (SUB_X + SUB_W) - (CLAIM_X - 3) + 3, height: ROW_H + 6,
    borderWidth: 2, borderColor: INK, borderRadius: 10, borderStyle: 'dashed',
  },
  worthMark: {
    position: 'absolute', width: 12, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 10, color: INK, includeFontPadding: false,
  },

  claim: {
    position: 'absolute', left: CLAIM_X, width: CLAIM_W, height: ROW_H,
    borderWidth: 2, borderColor: INK, borderRadius: 8, backgroundColor: PLATE_FACE, boxShadow: LIP,
    justifyContent: 'center', paddingHorizontal: 7,
  },
  claimText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.7, color: INK, includeFontPadding: false,
  },
  sub: {
    position: 'absolute', left: SUB_X, width: SUB_W, height: ROW_H,
    borderWidth: 1.5, borderColor: SOFT, borderRadius: 3, backgroundColor: STONE, boxShadow: LIP,
    justifyContent: 'center', paddingHorizontal: 7,
  },
  subText: {
    fontFamily: 'Inter_400Regular', fontSize: 9, color: INK, includeFontPadding: false,
  },
  arrow: {
    position: 'absolute', left: 191, width: 18, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 13, color: SOFT, includeFontPadding: false,
  },
  strike: { position: 'absolute', left: CLAIM_X, height: 2, backgroundColor: INK },

  hit: { position: 'absolute', left: CLAIM_X, width: CLAIM_W, height: ROW_H },
  hitBox: { width: CLAIM_W, height: ROW_H, borderRadius: 3 },
  right: { borderWidth: 3, borderColor: INK },
  wrong: { borderWidth: 1.5, borderColor: SOFT, borderStyle: 'dashed' },
});

export function Aesthetics20Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Aesthetics20Scene} band={[226, 512]} camera={CAM} />;
}
