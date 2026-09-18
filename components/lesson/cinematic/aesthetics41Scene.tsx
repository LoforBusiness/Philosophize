import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, ease01, moveTr, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './aesthetics41Script';
import { facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, pickAt, lookPose,
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

// ─────────────────────────────────────────────────────────────────────────────
// A CANVAS INSIDE A FRAME INSIDE A WALL, AND ONE RING THAT WILL NOT SETTLE.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the WALL is 250×160 at x 136 (136…386), y 272…432 — the scene's filled STONE
//   mass, and the outermost of the three candidates (T2).
// · the FRAME is a 160×110 box at x 180 (180…340), y 296…406, drawn as a 10-unit
//   ink border so it is a real band with a width rather than a hairline. Its inner
//   face therefore runs x 190…330, y 306…396.
// · the CANVAS fills that inner face exactly, in paper, and carries a HORIZON rule
//   at y 356 and a 22-unit disc at x 280, y 316 — enough that it reads as a
//   picture rather than as a blank rectangle.
// · the RING is the boundary itself, and it is one object in two forms. Round the
//   WORK it sits at x 172…348, y 288…414, outside the frame band; round the ROOM
//   it pulls in to x 184…336, y 300…402, inside it. Solid in both, and DASHED when
//   it lands on the band itself — the only mark in this vocabulary that can say
//   "here, and also not quite here".
// · THREE PLATES of 84×26 at x 128 · 220 · 312 (128…396), top y 448 — below the
//   wall at 432 and above the ground, each carrying its own words (S11).
// · the figure stands at x 28 and walks to 88; his widest span at the walked mark
//   is x ≈ 63…113, fifteen units clear of the nearest plate at 128 and twenty-three
//   clear of the wall at 136.
//
// Ink runs y 244 (the caption) … y 500 (ground). BAND 240…512 = 272 — a 103-unit
// figure at 37.9%, inside H58's 38%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const WALL_X = 136;
const WALL_Y = 272;
const WALL_W = 250;
const WALL_H = 160;

const FRAME_X = 180;
const FRAME_Y = 296;
const FRAME_W = 160;
const FRAME_H = 110;
const FRAME_BAND = 10;

const CANVAS_X = FRAME_X + FRAME_BAND;
const CANVAS_Y = FRAME_Y + FRAME_BAND;
const CANVAS_W = FRAME_W - FRAME_BAND * 2;
const CANVAS_H = FRAME_H - FRAME_BAND * 2;

/** The ring, as an INSET from the frame's outer edge. Negative is outside it. */
const RING_OUT = -8;
const RING_IN = 4;

// ── group AH: still-tap events ────────────────────────────────────────────
/** How far the dashed line grows outward from the frame's right edge, into
 *  the wall's own remaining width (frame ends at 340, wall at 386). */
const SPREAD_W = 40;

const PLATE_X = [128, 220, 312];
const PLATE_Y = 448;
const PLATE_W = 84;
const PLATE_H = 26;
const PLATE_CAP = ['THE CANVAS', 'THE FRAME', 'THE WALL'];
const PLATE_ID = ['canvas', 'frame', 'wall'];
/** The one that will not settle. The other two settle immediately. */
const FRAME = 1;

const CAP_T = 244;
const FIG_X = 28;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const WALL = BEATS.map((b) => (b.wall ? 1 : 0));
const ART = BEATS.map((b) => (b.art ? 1 : 0));
const RING = BEATS.map((b) => (b.ring ? 1 : 0));
const PLATES = BEATS.map((b) => (b.plates ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));
// ── group AH: still-tap events ──────────────────────────────────────────────
const SETTLE = BEATS.map((b) => (b.settle ? 1 : 0));
const PARERGON = BEATS.map((b) => (b.parergon ? 1 : 0));
const GHOST = BEATS.map((b) => (b.ghost ? 1 : 0));
const SPREAD = BEATS.map((b) => (b.spread ? 1 : 0));

// R7c — the stage follows the control on its own graded beat, and only there.
// Derived from the beat so it cannot fall out of step with the control.
const REACT = BEATS.map((b) => (b.interact?.sort ? 1 : 0));

// THE SORT'S OWN BIN ORDER, never the shuffled row (X3): 0 the room · 1 the work
// · 2 neither. Each row is read off that bin's own words, and the three are
// authored so the ring travels outward rather than jumping.
//   room    — the frame is furniture, so the boundary is INSIDE it, round the paint.
//   work    — the frame belongs to the piece, so the boundary is OUTSIDE it.
//   neither — the boundary is the band itself, and it goes dashed.
const INSET_AT = [RING_IN, RING_OUT, RING_OUT];
const SOLID_AT = [1, 1, 0];
const DASH_AT = [0, 0, 1];

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('aesthetics41'));

export default function Aesthetics41Scene({ clock, bt, bi, i, picked, onPick, pickPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldFig = useHeld();
  const cv = useCarry(11);
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;
  // A track fades in on the beat that CHANGES its value; otherwise it holds, so
  // the stage doesn't re-animate a still tag on every later tap.
  const settleFade = (cur.settle ?? 0) !== (prev?.settle ?? 0);
  const parergonFade = (cur.parergon ?? 0) !== (prev?.parergon ?? 0);
  const ghostFade = (cur.ghost ?? 0) !== (prev?.ghost ?? 0);
  const spreadFade = (cur.spread ?? 0) !== (prev?.spread ?? 0);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    // A WALKING BEAT TAKES AS LONG AS THE WALK NEEDS (rig.moveTr).
    const tr = ease01(bt.value / moveTr(X[p], X[n], BASE_TR));
    const t = clock.value;
    const grow = ease01(bt.value / 0.55);

    const figS = keepHeld(heldFig, travelStance(
      X[p], X[n],
      carryFrom(heldFig, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));

    const on = RING[n];
    return {
      fig: lookPose(figS, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1, gazeX.value, gazeY.value, gazeOn.value),
      t,
      wallOn: carry(cv, 1, n, WALL[p], WALL[n], tr),
      artOn: carry(cv, 2, n, ART[p], ART[n], tr),
      inset: carry(cv, 3, n, RING_OUT, reacting ? pickAt(INSET_AT, pickPos.value) : RING_OUT, tr),
      solid: carry(cv, 4, n, RING[p], reacting ? on * pickAt(SOLID_AT, pickPos.value) : on, tr),
      dashed: carry(cv, 5, n, 0, reacting ? on * pickAt(DASH_AT, pickPos.value) : 0, tr),
      platesOn: carry(cv, 6, n, PLATES[p], PLATES[n], tr),
      // ── group AH: still-tap events ────────────────────────────────────────
      // beat 1 — "the canvas belongs to the work, and the wall belongs to the
      // room": a WORK tag settles on the canvas and a ROOM tag settles on the
      // wall, leaving the frame band bare.
      settle: carry(cv, 7, n, SETTLE[p], SETTLE[n], settleFade ? grow : 1),
      // beat 2 — Kant's own word for the frame pins onto the band itself.
      parergon: carry(cv, 8, n, PARERGON[p], PARERGON[n], parergonFade ? grow : 1),
      // beat 3 — "the painting would be the same painting without one": the
      // frame band dims, as if lifted away, while the canvas stays as it is.
      ghost: carry(cv, 9, n, GHOST[p], GHOST[n], ghostFade ? grow : 1),
      // beat 7 — "the boundary problem extends outward": a dashed line grows
      // from the frame's edge across the remaining wall.
      spread: carry(cv, 10, n, SPREAD[p], SPREAD[n], spreadFade ? grow : 1),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const wallStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.wallOn }));
  const artStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.artOn }));
  const platesStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.platesOn }));
  // BOTH RINGS ARE THE SAME RECTANGLE, and each style computes it inline: a
  // helper shared between two worklets is packed as a RemoteFunction and throws
  // on the UI thread, while a browser runs it perfectly (check:worklets).
  const solidStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.solid,
    left: FRAME_X + SCENE.value.inset,
    top: FRAME_Y + SCENE.value.inset,
    width: FRAME_W - SCENE.value.inset * 2,
    height: FRAME_H - SCENE.value.inset * 2,
  }));
  const dashStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.dashed,
    left: FRAME_X + SCENE.value.inset,
    top: FRAME_Y + SCENE.value.inset,
    width: FRAME_W - SCENE.value.inset * 2,
    height: FRAME_H - SCENE.value.inset * 2,
  }));
  // ── group AH: still-tap events ──────────────────────────────────────────
  // beat 1 — the canvas and the wall each settle under their own tag.
  const settleStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.settle }));
  // beat 2 — the frame's own name pins onto its band.
  const parergonStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.parergon }));
  // beat 3 — the frame band dims on its own, apart from the canvas group, so
  // "the same painting without one" reads as the frame alone fading.
  const frameStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.artOn * (1 - SCENE.value.ghost * 0.65),
  }));
  // beat 7 — a dashed line grows from the frame's right edge across the wall,
  // and a small dot rides its tip.
  const spreadLineStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.spread,
    transform: [{ scaleX: SCENE.value.spread }],
  }));
  const spreadDotStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.spread,
    transform: [{ translateX: SCENE.value.spread * SPREAD_W }],
  }));

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={styles.cap} pointerEvents="none">WHERE IS THE EDGE?</Text>

      <Animated.View style={[StyleSheet.absoluteFill, wallStyle]} pointerEvents="none">
        <View style={styles.wall} />
      </Animated.View>

      {/* The frame band has its OWN opacity (frameStyle), separate from the
          canvas group, so beat 3 can dim it alone — "the same painting
          without one." */}
      <Animated.View style={[StyleSheet.absoluteFill, frameStyle]} pointerEvents="none">
        <View style={styles.frame} />
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, artStyle]} pointerEvents="none">
        <View style={styles.canvas} />
        <View style={styles.horizon} />
        <View style={styles.sun} />
      </Animated.View>

      {/* beat 1 — the canvas settles under WORK, the wall settles under ROOM. */}
      <Animated.View style={[styles.workTag, settleStyle]} pointerEvents="none">
        <Text style={styles.settleText}>WORK</Text>
      </Animated.View>
      <Animated.View style={[styles.roomTag, settleStyle]} pointerEvents="none">
        <Text style={styles.settleText}>ROOM</Text>
      </Animated.View>

      {/* beat 2 — the frame's own name pins onto its band. */}
      <Animated.View style={[styles.parergonTag, parergonStyle]} pointerEvents="none">
        <Text style={styles.parergonText}>PARERGON</Text>
      </Animated.View>

      {/* ONE BOUNDARY IN TWO FORMS. Solid where the reader puts the frame on a
          side, dashed where they leave it on neither. */}
      <Animated.View style={[styles.ringSolid, solidStyle]} pointerEvents="none" />
      <Animated.View style={[styles.ringDashed, dashStyle]} pointerEvents="none" />

      {/* beat 7 — the boundary problem extends outward, past the frame's own
          edge and across the wall. */}
      <Animated.View style={[styles.spreadLine, spreadLineStyle]} pointerEvents="none" />
      <Animated.View style={[styles.spreadDot, spreadDotStyle]} pointerEvents="none" />

      <Animated.View style={[StyleSheet.absoluteFill, platesStyle]}>
        {PLATE_ID.map((id, k) => (
          <Target
            key={id}
            id={id}
            correct={k === FRAME}
            picked={picked}
            onPick={onPick}
            disabled={!live || answered}
            style={[styles.hit, { left: PLATE_X[k] }]}
            radius={4}
          >
            <View style={styles.plate} pointerEvents="none" />
            <Text style={styles.plateText} pointerEvents="none">{PLATE_CAP[k]}</Text>
          </Target>
        ))}
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON — a subject standing on a filled mass
  // rather than on bare page.
  floor: floorStyle(TONE, GROUND),

  cap: {
    position: 'absolute', left: WALL_X, top: CAP_T, width: WALL_W,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },

  wall: {
    position: 'absolute', left: WALL_X, top: WALL_Y, width: WALL_W, height: WALL_H,
    borderWidth: 2, borderColor: INK, backgroundColor: STONE, boxShadow: LIP,
  },
  // A BAND WITH A WIDTH, not a hairline — the whole lesson is about a thing that
  // occupies territory of its own.
  frame: {
    position: 'absolute', left: FRAME_X, top: FRAME_Y, width: FRAME_W, height: FRAME_H,
    borderWidth: FRAME_BAND, borderColor: INK, backgroundColor: PAPER,
  },
  canvas: {
    position: 'absolute', left: CANVAS_X, top: CANVAS_Y, width: CANVAS_W, height: CANVAS_H,
    backgroundColor: PAPER,
  },
  horizon: { position: 'absolute', left: CANVAS_X, top: 356, width: CANVAS_W, height: 2, backgroundColor: INK },
  sun: {
    position: 'absolute', left: 280, top: 316, width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: INK,
  },

  ringSolid: { position: 'absolute', borderWidth: 2.5, borderColor: INK },
  ringDashed: { position: 'absolute', borderWidth: 2.5, borderColor: INK, borderStyle: 'dashed' },

  // ── group AH: still-tap events ──────────────────────────────────────────
  // beat 1 — WORK settles over the canvas, ROOM settles on the wall's own
  // clear ground beside the frame. Small white tags, so neither reads as a
  // new mass (check:shade only counts a toned fill).
  workTag: {
    position: 'absolute', left: CANVAS_X + 4, top: CANVAS_Y + 4, width: 40, height: 13,
    borderWidth: 1.5, borderColor: INK, borderRadius: 5, backgroundColor: PLATE_FACE, boxShadow: LIP,
    alignItems: 'center', justifyContent: 'center',
  },
  roomTag: {
    position: 'absolute', left: 344, top: WALL_Y + 8, width: 40, height: 13,
    borderWidth: 1.5, borderColor: INK, borderRadius: 5, backgroundColor: PLATE_FACE, boxShadow: LIP,
    alignItems: 'center', justifyContent: 'center',
  },
  settleText: { fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.5, color: INK,
    includeFontPadding: false,
  },

  // beat 2 — the frame's own name, pinned so its foot overlaps the band it
  // names.
  parergonTag: {
    position: 'absolute', left: 225, top: 288, width: 70, height: 14,
    borderWidth: 1.5, borderColor: INK, borderRadius: 5, backgroundColor: PLATE_FACE, boxShadow: LIP,
    alignItems: 'center', justifyContent: 'center',
  },
  parergonText: { fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.4, color: INK,
    includeFontPadding: false,
  },

  // beat 7 — a dashed reach growing from the frame's right edge into the
  // wall's own remaining width, so the boundary problem visibly keeps going.
  spreadLine: {
    position: 'absolute', left: FRAME_X + FRAME_W, top: FRAME_Y + FRAME_H / 2 - 1, width: SPREAD_W, height: 0,
    borderTopWidth: 2, borderColor: SHADE, borderStyle: 'dashed', transformOrigin: '0% 50%',
  },
  spreadDot: {
    position: 'absolute', left: FRAME_X + FRAME_W - 3, top: FRAME_Y + FRAME_H / 2 - 3, width: 6, height: 6,
    borderRadius: 3, backgroundColor: INK,
  },

  hit: { position: 'absolute', top: PLATE_Y, width: PLATE_W, height: PLATE_H },
  plate: {
    position: 'absolute', left: 0, top: 0, width: PLATE_W, height: PLATE_H,
    borderWidth: 2, borderColor: INK, borderRadius: 8, backgroundColor: PAPER,
  },
  plateText: {
    position: 'absolute', left: 0, top: 8, width: PLATE_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.5, color: INK, includeFontPadding: false,
  },
});

export function Aesthetics41Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Aesthetics41Scene} band={[240, 512]} camera={CAM} />;
}
