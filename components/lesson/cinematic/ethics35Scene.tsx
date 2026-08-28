import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, lerp, moveTr, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './ethics35Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target, { AnswerLift } from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// TWO PANELS, FOUR TAGS, AND A BEAM THE READER TIPS.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the BEAM pivots on a post at x 262, y 268. The bar is 168 long, 3 thick,
//   drawn centred on the pivot so it rotates about its middle; at its steepest
//   (±13°) its ends reach y 249 and y 287 — clear of the caption at 236 and of
//   the panels below at 306.
// · the two PANELS are 84×108 at x 190 and x 292, y 306…414. Inside each, a
//   simplified arm: a 40-long bar from the shoulder, reaching DOWN and out in the
//   left panel, folded back against the body in the right.
// · the four TAGS run under the panels as one shared row: 78×18 boxes at x 178,
//   y 424, 446, 468 and 490 — MOTIVE, OUTCOME, RELATION, CERTAINTY. They light
//   for both men at once, because the whole point is that they are matched.
// · the figure stands at x 54 and walks to 132; crown ~397, and the panels begin
//   at x 190, so he never overlaps them.
//
// Ink runs y 236 (caption) … y 508 (the last tag). BAND 230…514 = 284 (H59), and
// the ground line at 500 sits inside it.
//
// THE ARMS ARE TWO VIEWS EACH. A person in a scene is normally drawn by the rig
// (H57) and these are not people — they are the same diagram twice, which is the
// argument. Drawing two stickmen here would say "two men", and the lesson's whole
// claim is that there is only one difference between them.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const PIVOT_X = 262;
const PIVOT_Y = 268;
const BEAM_W = 168;
const BEAM_MAX = 13;                       // degrees at the far end of the rail

const PANEL_Y = 306;
const PANEL_H = 108;
const PANEL_W = 84;
const PANEL_X = [190, 292];
const PANEL_CAP = ['REACHED IN', 'STOOD BACK'];

const TAG_X = 178;
const TAG_Y = [424, 446, 468, 490];
const TAG_TEXT = ['SAME MOTIVE', 'SAME OUTCOME', 'SAME RELATION', 'SAME CERTAINTY'];
const TAG_ID = ['motive', 'outcome', 'relation', 'certainty'];

const CAP_T = 236;
const FIG_X = 54;

const X = BEATS.map((b) => b.x ?? FIG_X);
const P = BEATS.map((b) => b.p ?? 0);
const PAIR = BEATS.map((b) => (b.pair ? 1 : 0));
const TAGS = BEATS.map((b) => b.tags ?? 0);
const BEAM = BEATS.map((b) => (b.beam ? 1 : 0));
const TIP = BEATS.map((b) => (b.tip ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('ethics35'));

export default function Ethics35Scene({ clock, bt, bi, qv, i, picked, onPick, dragPos }: SceneApi) {
  const heldFig = useHeld();
  const cv = useCarry(4);
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

    // THE BEAM IS THE READER'S THUMB on its own beat, and a settled verdict
    // everywhere else. One value, two sources, and never both at once.
    const drag = TIP[n] === 1 ? clamp01(dragPos.value) : 0.5;

    return {
      fig: pose(figS, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, 1, 1),
      t,
      pairOn: carry(cv, 1, n, PAIR[p], PAIR[n], tr),
      beamOn: carry(cv, 2, n, BEAM[p], BEAM[n], tr),
      // 0.5 is level; 0 tips toward "the same" and 1 toward "far worse".
      tilt: (drag - 0.5) * 2 * BEAM_MAX,
      tags: carry(cv, 3, n, TAGS[p], TAGS[n], tr),
      lit: LIVE[n] === 1 ? ease01(q) : 0,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.drag && LIVE[i] === 1;

  const pairStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.pairOn }));
  const beamWrap = useAnimatedStyle(() => ({ opacity: SCENE.value.beamOn }));
  const beamBar = useAnimatedStyle(() => ({ transform: [{ rotate: `${SCENE.value.tilt}deg` }] }));

  return (
    <View style={styles.scene}>
      <Text style={styles.cap}>ONE AFTERNOON, TWO MEN</Text>

      <Animated.View style={[StyleSheet.absoluteFill, beamWrap]} pointerEvents="none">
        <View style={styles.post} />
        <Animated.View style={[styles.beam, beamBar]} />
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, pairStyle]} pointerEvents="none">
        {PANEL_X.map((px, k) => (
          <View key={px} style={[styles.panel, { left: px }]}>
            <View style={styles.torso} />
            <View style={[styles.arm, k === 0 ? styles.armOut : styles.armIn]} />
            <Text style={styles.panelCap}>{PANEL_CAP[k]}</Text>
          </View>
        ))}
      </Animated.View>

      <Tags S={SCENE} picked={picked} onPick={onPick} answered={answered} live={live} />

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

function Tags({
  S, picked, onPick, answered, live,
}: {
  S: SharedValue<any>; picked: string | null; onPick: (id: string, ok: boolean) => void;
  answered: boolean; live: boolean;
}) {
  const wrong = (id: string) => answered && picked === id;
  return (
    <>
      {/* Each tag rides with its own target (E39). */}
      {TAG_Y.map((ty, k) => (
        <AnswerLift key={ty} id={TAG_ID[k]} picked={picked} correct={k === 3}>
          <Tag S={S} k={k} top={ty} />
        </AnswerLift>
      ))}
      {TAG_Y.map((ty, k) => (
        <Target
          key={`t${ty}`}
          id={TAG_ID[k]}
          correct={k === 3}
          picked={picked}
          onPick={onPick}
          disabled={!live || answered}
          style={[styles.tagHit, { top: ty }]}
        >
          <View style={[styles.tagHitBox, wrong(TAG_ID[k]) && styles.tagWrong]} pointerEvents="none" />
        </Target>
      ))}
    </>
  );
}

/** One matching tag, which appears when the beat has matched that many. */
function Tag({ S, k, top }: { S: SharedValue<any>; k: number; top: number }) {
  const st = useAnimatedStyle(() => ({ opacity: clamp01(S.value.tags - k) }));
  return (
    <Animated.View style={[styles.tag, { top }, st]} pointerEvents="none">
      <View style={styles.tagBox} />
      <Text style={styles.tagText}>{TAG_TEXT[k]}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON. A rule on its own leaves the
  // figure and everything it is looking at standing on bare page;
  // political7 and political8 both stand their subject on a filled mass.
  floor: { position: 'absolute', left: 0, right: 0, top: GROUND, bottom: 0, backgroundColor: RULE },

  cap: {
    position: 'absolute', left: 178, top: CAP_T, width: 210,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.5, color: SOFT, includeFontPadding: false,
  },

  post: { position: 'absolute', left: PIVOT_X - 2, top: PIVOT_Y, width: 4, height: 34, backgroundColor: SOFT },
  // Laid out CENTRED on the pivot, so the rotation is about its middle.
  beam: {
    position: 'absolute', left: PIVOT_X - BEAM_W / 2, top: PIVOT_Y - 2, width: BEAM_W, height: 3,
    borderRadius: 2, backgroundColor: INK,
  },

  panel: {
    position: 'absolute', top: PANEL_Y, width: PANEL_W, height: PANEL_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: STONE,
  },
  torso: { position: 'absolute', left: PANEL_W / 2 - 3, top: 22, width: 6, height: 52, backgroundColor: INK, borderRadius: 3 },
  arm: { position: 'absolute', top: 34, width: 40, height: 5, backgroundColor: INK, borderRadius: 3, transformOrigin: '0% 50%' },
  armOut: { left: PANEL_W / 2, transform: [{ rotate: '34deg' }] },
  armIn: { left: PANEL_W / 2, transform: [{ rotate: '150deg' }] },
  panelCap: {
    position: 'absolute', left: 0, top: PANEL_H - 20, width: PANEL_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1, color: INK, includeFontPadding: false,
  },

  tag: { position: 'absolute', left: TAG_X, width: 190, height: 18 },
  tagBox: {
    position: 'absolute', left: 0, top: 0, width: 190, height: 18,
    borderWidth: 1.5, borderColor: INK, borderRadius: 3, backgroundColor: STONE,
  },
  tagText: {
    position: 'absolute', left: 0, top: 5, width: 190, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1, color: INK, includeFontPadding: false,
  },
  tagHit: { position: 'absolute', left: TAG_X, width: 190, height: 18 },
  tagHitBox: { position: 'absolute', left: 0, top: 0, width: 190, height: 18, borderRadius: 3 },
  tagWrong: { borderWidth: 1.5, borderColor: SOFT, borderStyle: 'dashed' },
});

export function Ethics35Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Ethics35Scene} band={[230, 514]} camera={CAM} />;
}
