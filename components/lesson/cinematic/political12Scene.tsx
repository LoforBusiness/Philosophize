import {
  View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import {
  WALK, dirsFrom, ease01, lerp, moveTr, pose, travelStance, type Bundle, } from './rig';
// The whole movement library, not just rig's 49 emotes: codes under 100 are
// exactly rig's and mean what they always did, 100+ reach moves.ts (see emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './political12Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, PAPER, useHeld, carryFrom, keepHeld, facing, useCarry, carry, lookPose,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { floorStyle, lipOf, PLATE_FACE } from './stageSkin';
import { followMoves, kindOf, seedOf } from './camera';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';

// THE STAGE IS STRUCK IN THIS LESSON'S OWN BRANCH HUE (./stageTones).
// Same three tones, same luminance to the third decimal — so every contrast
// measured against the old greys still holds and nothing on the stage moved.
const TONE = stageTone('political-philosophy');
const { RULE, STONE, SHADE } = TONE;
const LIP = lipOf(TONE);   // the ledge a toned plate stands on (scripts/skin-stage.mjs)

// A doorway with two lamps beneath it. Stage right.
//
// · figure WALKS x = 70 → 168 → 124; widest span x 132…204 at 168, fist to 204.5.
//   All doorway ink is at x ≥ 216.
// · header y 226…238 · doorway y 246…320 · lamps y 330…366 · answer stack
//   y 380…488 on a 36 pitch. A standing crown is y 397.
// · A5 — the doorway is a diagram out of reach (hand tops out at y 411, B11b); no
//   beat's text says the figure opens or walks through it. It is the argument's
//   picture, not a door in the room.
//
// THE TWO LAMPS ARE ONE STYLE USED TWICE and are driven by separate channels, so
// the scene can light either without the other — which is precisely Berlin's claim
// that the two freedoms come apart.

const DW_L = 216;
const DW_W = 176;

const HEAD_T = 226;

const DOOR_W = 80;
const DOOR_L = DW_L + (DW_W - DOOR_W) / 2;
const DOOR_T = 246;
const DOOR_H = 74;

const LAMP_T = 330;
const LAMP_H = 36;
const LAMP_GAP = 6;
const LAMP_W = (DW_W - LAMP_GAP) / 2;

const ANS_T = 380;
const ANS_H = 32;
const ANS_PITCH = 36;
const ANS_SLOP = (ANS_PITCH - ANS_H) / 2;

// ── the three tap events (group AH) ─────────────────────────────────────────
//
// PHRASE — the paradox itself, written up before the doorway that untangles it
// exists (beat 1). Sits inside the same area the door will occupy.
const PHRASE_L = DW_L + 8;
const PHRASE_W = DW_W - 16;
const PHRASE_T = 262;

// PATH — a dashed walkway from where the figure stands toward the threshold,
// stopping short of it (beat 4). The door's own inner edge is DOOR_L.
const PATH_L = 168;
const PATH_R = DOOR_L - 34;
const PATH_T = GROUND - 14;
const PATH_H = 10;

// LOCK — hangs beneath the lit self-mastery lamp (beat 7).
const LOCK_2ND_L = DW_L + LAMP_W + LAMP_GAP;
const LOCK_CX = LOCK_2ND_L + LAMP_W / 2;
const LOCK_TOP = LAMP_T + LAMP_H + 6;

const ANSWERS = [
  { id: 'pos', label: 'MASTER OF MYSELF', correct: true },
  { id: 'neg', label: 'NO ONE BLOCKING', correct: false },
  { id: 'both', label: 'NEITHER IS LYING', correct: false },
];

const P = BEATS.map((b) => b.p ?? 0);
const X = BEATS.map((b) => b.x ?? 124);
// The camera, from the staging: it follows the figure this track describes,
// pulls back to scale 1 on every graded beat so a tap lands where it is aimed,
// and leans in on the quote. See followMoves in ./camera.ts.
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('political12'));
const DIR = dirsFrom(X, 1);
const DOORV = BEATS.map((b) => b.door ?? 0);
const OPEN = BEATS.map((b) => b.open ?? 0);
const NEG = BEATS.map((b) => b.neg ?? 0);
const POS = BEATS.map((b) => b.posi ?? 0);
// The three tap events (group AH). All three turn on AND off within the
// lesson's run, so each is carried rather than switched (C20c).
const PHRASEV = BEATS.map((b) => ((b.phrase ?? 0) > 0 ? 1 : 0));
const PATHV = BEATS.map((b) => ((b.path ?? 0) > 0 ? 1 : 0));
const LOCKV = BEATS.map((b) => ((b.lock ?? 0) > 0 ? 1 : 0));

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.sort ? 1 : 0));

export default function Political12Scene({ clock, bt, bi, i, picked, onPick, pickPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldS = useHeld();
  const cv = useCarry(8);
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;

  const dFade = (cur.door ?? 0) !== (prev?.door ?? 0);
  const oFade = (cur.open ?? 0) !== (prev?.open ?? 0);
  const nFade = (cur.neg ?? 0) !== (prev?.neg ?? 0);
  const pFade = (cur.posi ?? 0) !== (prev?.posi ?? 0);

  // ── the three tap events (group AH) ────────────────────────────────────────
  const phraseFade = ((cur.phrase ?? 0) > 0) !== ((prev?.phrase ?? 0) > 0);
  const pathFade = ((cur.path ?? 0) > 0) !== ((prev?.path ?? 0) > 0);
  const lockFade = ((cur.lock ?? 0) > 0) !== ((prev?.lock ?? 0) > 0);

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / moveTr(X[p], X[n], 0.85));
    const t = clock.value;
    const grow = ease01(bt.value / 0.55);

    const s = keepHeld(heldS, travelStance(
      X[p], X[n],
      carryFrom(heldS, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));
    return {
      fig: lookPose(s, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1, gazeX.value, gazeY.value, gazeOn.value),
      door: carry(cv, 1, n, DOORV[p], DOORV[n], tr, dFade ? grow : 1),
      open: carry(cv, 2, n, OPEN[p], OPEN[n], oFade ? grow : tr),
      neg: carry(cv, 3, n, NEG[p], NEG[n], nFade ? grow : tr),
      // R7b — the arm lights the lamp the regime is claiming. The far setting is
      // positive liberty, and its lamp comes up as the reader arrives there — over a
      // door that is still barred, which is Berlin's whole warning.
      pos: carry(cv, 4, n, POS[p], reacting ? pickPos.value : POS[n], pFade ? grow : tr),
      // The three tap events (group AH) — each turns on and off within the run,
      // so each is carried rather than switched (C20c).
      phrase: carry(cv, 5, n, PHRASEV[p], PHRASEV[n], phraseFade ? grow : 1),
      path: carry(cv, 6, n, PATHV[p], PATHV[n], pathFade ? grow : 1),
      lock: carry(cv, 7, n, LOCKV[p], LOCKV[n], lockFade ? grow : 1),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const doorStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.door }));
  // The bar across the doorway retracts rather than fading — a door swinging clear.
  const barStyle = useAnimatedStyle(() => ({
    opacity: 1 - SCENE.value.open,
    transform: [{ scaleX: 1 - SCENE.value.open }],
  }));
  const negStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.neg }));
  const posStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.pos }));
  const phraseStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.phrase }));
  const pathStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.path }));
  const lockStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.lock }));

  const answered = picked !== null;
  const showPick = (cur.pick ?? 0) > 0 && !!cur.interact;

  return (
    <Animated.View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />

      {/* PHRASE — the paradox itself, before the doorway exists to untangle it (beat 1). */}
      <Animated.View style={[styles.phraseWrap, phraseStyle]} pointerEvents="none">
        <Text style={styles.phraseText} numberOfLines={1}>FORCED TO BE FREE?</Text>
      </Animated.View>

      <Animated.View style={[styles.layer, doorStyle]} pointerEvents="none">
        <Text style={styles.head} numberOfLines={1}>ARE YOU FREE?</Text>
        <View style={styles.door} />
        <Animated.View style={[styles.bar, barStyle]} />

        {/* lamp one: nobody in the doorway */}
        <View style={[styles.lamp, { left: DW_L }]}>
          <Text style={styles.lampText} numberOfLines={1}>NO ONE BLOCKING</Text>
        </View>
        <Animated.View style={[styles.lampLit, { left: DW_L }, negStyle]}>
          <Text style={styles.lampTextLit} numberOfLines={1}>NO ONE BLOCKING</Text>
        </Animated.View>

        {/* lamp two: switched on by somebody else */}
        <View style={[styles.lamp, { left: DW_L + LAMP_W + LAMP_GAP }]}>
          <Text style={styles.lampText} numberOfLines={2}>MASTER OF MYSELF</Text>
        </View>
        <Animated.View style={[styles.lampLit, { left: DW_L + LAMP_W + LAMP_GAP }, posStyle]}>
          <Text style={styles.lampTextLit} numberOfLines={2}>MASTER OF MYSELF</Text>
        </Animated.View>
      </Animated.View>

      {/* PATH — a walkway that stops short of the threshold: the definition says
          nothing about whether that walk is ever finished (beat 4). */}
      <Animated.View style={[styles.path, { left: PATH_L, top: PATH_T, width: PATH_R - PATH_L, height: PATH_H }, pathStyle]} pointerEvents="none" />

      {/* LOCK — the choices quietly removed, beneath the lamp that still claims
          them as freedom (beat 7). */}
      <Animated.View style={[styles.lockShackle, { left: LOCK_CX - 3, top: LOCK_TOP }, lockStyle]} pointerEvents="none" />
      <Animated.View style={[styles.lockBody, { left: LOCK_CX - 5, top: LOCK_TOP + 5 }, lockStyle]} pointerEvents="none" />

      {showPick &&
        ANSWERS.map((a, k) => {
          const chosen = picked === a.id;
          return (
            <Target id={a.id} correct={a.correct} picked={picked} onPick={onPick}
              key={a.id} style={[styles.ans, { top: ANS_T + k * ANS_PITCH }]} hitSlop={{ top: ANS_SLOP, bottom: ANS_SLOP, left: ANS_SLOP, right: ANS_SLOP }} disabled={answered}>
              <View
                style={[
                  styles.ansInner,
                  answered && a.correct && styles.pickRight,
                  answered && chosen && !a.correct && styles.pickWrong,
                ]}
              >
                <Text
                  style={[styles.ansText, answered && a.correct && styles.onInk]}
                  numberOfLines={1}
                >
                  {a.label}
                </Text>
              </View>
            </Target>
          );
        })}

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 24, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON. A rule on its own leaves the
  // figure and everything it is looking at standing on bare page;
  // political7 and political8 both stand their subject on a filled mass.
  floor: floorStyle(TONE, GROUND),
  layer: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H },

  head: {
    position: 'absolute', left: DW_L, top: HEAD_T, width: DW_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT,
    includeFontPadding: false,
  },
  door: {
    position: 'absolute', left: DOOR_L, top: DOOR_T, width: DOOR_W, height: DOOR_H,
    borderWidth: 3, borderColor: INK, borderTopLeftRadius: 26, borderTopRightRadius: 26,
    borderBottomWidth: 0, backgroundColor: STONE, boxShadow: LIP,
  },
  bar: {
    position: 'absolute', left: DOOR_L + 4, top: DOOR_T + DOOR_H / 2 - 3,
    width: DOOR_W - 8, height: 6, backgroundColor: INK, transformOrigin: '100% 50%',
  },

  lamp: {
    position: 'absolute', top: LAMP_T, width: LAMP_W, height: LAMP_H,
    borderWidth: 2, borderColor: SOFT, borderRadius: 4, backgroundColor: STONE, boxShadow: LIP,
    alignItems: 'center', justifyContent: 'center',
  },
  lampLit: {
    position: 'absolute', top: LAMP_T, width: LAMP_W, height: LAMP_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: INK,
    alignItems: 'center', justifyContent: 'center',
  },
  lampText: {
    // AND TWO LINES, because losing the tracking was not enough. At 8.6 the label
    // is 87.3dp and the lamp's content box is 81 — six units short, so its last
    // letters were cut on every beat. The lamp is 36 tall and two 11-unit lines fit
    // inside it with room over; widening the lamp instead would have meant widening
    // the doorway, which is the composition.
    // NO TRACKING. MASTER OF MYSELF is sixteen characters, and at 0.4 they add 6.4
    // units to a label that was already wider than its 85-unit lamp — enough to put
    // its right end 2.7 units past the stage. Tracking is the cheapest thing in the
    // line to give up; the size is not (D34).
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0, color: INK,
    includeFontPadding: false,
  },
  lampTextLit: {
    // Same tracking as `lampText` — the two are the same word in two states and a
    // different width would slide it sideways as the lamp comes on.
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0, color: PAPER,
    includeFontPadding: false,
  },

  ans: { position: 'absolute', left: DW_L, width: DW_W },
  ansInner: {
    height: ANS_H, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PLATE_FACE, boxShadow: LIP,
    alignItems: 'center', justifyContent: 'center',
  },
  ansText: {
    fontFamily: 'Inter_700Bold', fontSize: 9.5, letterSpacing: 0, color: INK,
    includeFontPadding: false,
  },
  onInk: { color: PAPER },
  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT },

  // ── the three tap events (group AH) ──────────────────────────────────────
  //
  // PHRASE — a plate carrying the paradox itself, in the doorway's own footprint.
  phraseWrap: {
    position: 'absolute', left: PHRASE_L, top: PHRASE_T, width: PHRASE_W,
    borderWidth: 2, borderColor: INK, borderRadius: 6, paddingVertical: 8, paddingHorizontal: 4, alignItems: 'center',
  },
  phraseText: {
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 0, color: INK, textAlign: 'center',
    includeFontPadding: false,
  },

  // PATH — a boundary-style dashed edge, never a fill (D31): a walk marked out
  // but not completed.
  path: { position: 'absolute', borderWidth: 1.5, borderColor: SHADE, borderStyle: 'dashed', borderRadius: 5 },

  // LOCK — a small padlock, INK, the same weight as any other held object.
  lockShackle: {
    position: 'absolute', width: 6, height: 5, borderWidth: 1.5, borderColor: INK,
    borderBottomWidth: 0, borderTopLeftRadius: 3, borderTopRightRadius: 3,
  },
  lockBody: { position: 'absolute', width: 10, height: 8, backgroundColor: INK, borderRadius: 1.5 },
});

// Ink runs from the header (226) to the ground line (500). Band 220…512 = 292 (H59).
export function Political12Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Political12Scene} band={[220, 512]} camera={CAM} />;
}
