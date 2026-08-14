import {
  View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import {
  WALK, clamp01, dirsFrom, ease01, lerp, moveTr, pose, travelStance, type Bundle, } from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './epistemology9Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, facing,
} from './cinematicKit';
import { followMoves, kindOf, seedOf } from './camera';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';

// An easel with a hand-drawn MAP stage left, and the real LAND it claims to
// describe out on the horizon stage right. The figure walks between the two —
// shielding its eyes at the viewpoint, framing and writing at the easel — because
// the whole lesson is the gap between the drawing and the ground.
//
// ── COMPOSITION / OCCLUSION ─────────────────────────────────────────────────
// The figure only ever stands at x = 148 (the easel), 208 (mid) or 268 (the
// viewpoint), so its body + arms sweep x 100…316 and y 361…500. Therefore:
//   · every teaching prop — the map board (y 190…332), the landscape (y 108…232),
//     the two candidate maps (y 220…348), the "?" link (y 228…280) and the two
//     theory placards (y 244…340) — sits ENTIRELY ABOVE y = 350 and can never be
//     covered by the figure, whatever x it is standing at;
//   · the only ground-level furniture is the easel post + legs, which live in
//     x 66…97 — clear of the figure's leftmost reach (100) — and the cliff mark at
//     x 338, clear of its rightmost reach (316).
// The 1.5px ground rule is the floor itself and passes under the feet by design.

// ── the easel and its map board ──────────────────────────────────────────────
const BOARD_L = 16;
const BOARD_T = 190;
const BOARD_W = 134;
const BOARD_H = 142;

// ── the landscape on the horizon ─────────────────────────────────────────────
const LAND_L = 196;
const LAND_T = 108;
const LAND_W = 200;
const LAND_H = 124;
const LAND_BASE = 102;                                        // local horizon line

// ── the two candidate maps (Q1) ──────────────────────────────────────────────
const CARD_T = 220;
const CARD_W = 128;
const CARD_H = 108;
const CARD_A_L = 18;
const CARD_B_L = 158;
const CARD_BASE = 84;                                         // local ground inside a card

interface HillSpec { x: number; hw: number; h: number }

// The land, three times over: out on the horizon, sketched on the easel, and
// twice again on the answer cards — one faithful, one with a hill that is not there.
const BIG_HILLS: HillSpec[] = [{ x: 48, hw: 38, h: 64 }, { x: 112, hw: 46, h: 88 }];
const MAP_HILLS: HillSpec[] = [{ x: 26, hw: 20, h: 34 }, { x: 60, hw: 24, h: 44 }];
const A_HILLS: HillSpec[] = [{ x: 34, hw: 17, h: 28 }, { x: 66, hw: 21, h: 38 }];
const B_HILLS: HillSpec[] = [
  { x: 28, hw: 13, h: 22 }, { x: 56, hw: 17, h: 34 }, { x: 86, hw: 14, h: 24 },
];

const CARDS = [
  { id: 'a', label: 'MAP A', left: CARD_A_L, hills: A_HILLS, treeX: 104, correct: true },
  { id: 'b', label: 'MAP B', left: CARD_B_L, hills: B_HILLS, treeX: 110, correct: false },
];

const P = BEATS.map((b) => b.p ?? 0);
const X = BEATS.map((b) => b.x ?? 208);
// The camera, from the staging: it follows the figure this track describes,
// pulls back to scale 1 on every graded beat so a tap lands where it is aimed,
// and leans in on the quote. See followMoves in ./camera.ts.
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('epistemology9'));
const DIR = dirsFrom(X, 1);
const THEORY = BEATS.map((b) => b.theory ?? 0);

export default function Epistemology9Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldS = useHeld();
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;

  // A prop only fades in on the beat that CHANGES it; otherwise it stays solid, so
  // the drawing doesn't re-animate every time the reader taps forward.
  const landOn = (cur.land ?? 0) > 0;
  const landFade = (cur.land ?? 0) !== (prev?.land ?? 0);
  const mapOn = (cur.map ?? 0) > 0;
  const mapFade = (cur.map ?? 0) !== (prev?.map ?? 0);
  const linkOn = (cur.link ?? 0) > 0;
  const linkFade = (cur.link ?? 0) !== (prev?.link ?? 0);
  const cardsOn = (cur.cards ?? 0) > 0 && !!cur.interact;
  const cardsFade = (cur.cards ?? 0) !== (prev?.cards ?? 0);

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / moveTr(X[p], X[n], 0.85));
    const t = clock.value;
    const grow = ease01(bt.value / 0.55);

    // WALK is passed EXPLICITLY: a Gait left to a default parameter is not captured
    // into the worklet runtime and hard-crashes the screen.
    const s = keepHeld(heldS, travelStance(
      X[p], X[n],
      carryFrom(heldS, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));
    return {
      fig: pose(s, lerp(X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1),
      land: landOn ? (landFade ? grow : 1) : 0,
      map: mapOn ? (mapFade ? grow : 1) : 0,
      link: linkOn ? (linkFade ? grow : 1) : 0,
      cards: cardsOn ? (cardsFade ? grow : 1) : 0,
      theory: lerp(THEORY[p], THEORY[n], tr),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const landStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.land,
    transform: [{ translateY: (1 - SCENE.value.land) * -8 }],
  }));
  const mapStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.map,
    transform: [{ translateY: (1 - SCENE.value.map) * 8 }],
  }));
  const linkStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.link,
    transform: [{ scale: 0.86 + 0.14 * SCENE.value.link }],
  }));
  const cardsStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.cards,
    transform: [{ translateY: (1 - SCENE.value.cards) * 12 }],
  }));

  const answered = picked !== null;

  return (
    <Animated.View style={styles.scene}>
      {/* ── the ground, and the clifftop the viewpoint sits on ───────────────── */}
      <View style={styles.ground} pointerEvents="none" />
      <View style={styles.cliff} pointerEvents="none" />

      {/* ── the land itself, out on the horizon ──────────────────────────────── */}
      <Animated.View style={[styles.landWrap, landStyle]} pointerEvents="none">
        <Land
          x0={0} width={LAND_W} base={LAND_BASE}
          hills={BIG_HILLS} treeX={178} treeR={13} line={INK} fill={PAPER}
        />
        <Text style={styles.landLabel}>THE LAND</Text>
      </Animated.View>

      {/* ── the easel: post and legs live left of x=100, clear of the figure ─── */}
      <View style={styles.easelPost} pointerEvents="none" />
      <View style={styles.legL} pointerEvents="none" />
      <View style={styles.legR} pointerEvents="none" />

      {/* ── the map board (swapped out for the two candidates during Q1) ─────── */}
      {!cardsOn && (
        <View style={styles.board} pointerEvents="none">
          <Text style={styles.boardLabel}>THE MAP</Text>
          <Animated.View style={[styles.mapArea, mapStyle]} pointerEvents="none">
            <Land
              x0={0} width={110} base={84}
              hills={MAP_HILLS} treeX={96} treeR={8} line={INK} fill={PAPER}
            />
          </Animated.View>
        </View>
      )}

      {/* ── "how do you check the match?" — arrows both ways, and a ? ────────── */}
      {linkOn && (
        <Animated.View style={[styles.linkWrap, linkStyle]} pointerEvents="none">
          <View style={styles.arrowL} />
          <View style={[styles.dash, { left: 12 }]} />
          <View style={[styles.dash, { left: 20 }]} />
          <View style={[styles.dash, { left: 28 }]} />
          <View style={styles.badge}>
            <Text style={styles.badgeMark}>?</Text>
          </View>
          <View style={[styles.dash, { left: 88 }]} />
          <View style={[styles.dash, { left: 96 }]} />
          <View style={[styles.dash, { left: 104 }]} />
          <View style={styles.arrowR} />
        </Animated.View>
      )}

      {/* ── the rival theories, placarded on the right ───────────────────────── */}
      <Placard S={SCENE} k={0} top={244} head="COHERENCE" body="fits the web" />
      <Placard S={SCENE} k={1} top={296} head="PRAGMATISM" body="keeps working" />

      {/* ── Q1: two candidate maps. Tap the one that matches the land. ───────── */}
      {/* box-none, not none: this wrapper carries the tap targets, so it must let
          the Pressables receive touches while never swallowing a tap itself. */}
      {cardsOn && (
        <Animated.View style={[styles.cardLayer, cardsStyle]} pointerEvents="box-none">
          {CARDS.map((c) => {
            const chosen = picked === c.id;
            const right = answered && c.correct;
            const line = right ? PAPER : INK;
            const fill = right ? INK : PAPER;
            return (
              <Target id={c.id} correct={c.correct} picked={picked} onPick={onPick}
              key={c.id} style={[ styles.card, { left: c.left }, right && styles.cardRight, answered && chosen && !c.correct && styles.cardWrong, ]} disabled={answered}>
                <Text style={[styles.cardLabel, right && styles.cardLabelOn]}>{c.label}</Text>
                <Land
                  x0={8} width={110} base={CARD_BASE}
                  hills={c.hills} treeX={c.treeX} treeR={7} line={line} fill={fill}
                />
              </Target>
            );
          })}
          <Text style={styles.tapLabel}>TAP THE TRUE MAP</Text>
        </Animated.View>
      )}

      <Stickman D={DF} k={K_FIG} />
    </Animated.View>
  );
}

// ── ink-outline landscape parts, built from CSS border-triangles ─────────────
// A hill is TWO triangles: a solid `line` wedge with a slightly smaller `fill`
// wedge dropped inside it, which leaves an ink outline along both slopes. Swapping
// line/fill inverts the whole glyph for a card that has been filled with INK.

function Hill({ x, hw, h, base, line, fill }: HillSpec & { base: number; line: string; fill: string }) {
  const w = Math.min(6, Math.max(3, Math.round(h / 9)));
  const iw = Math.max(2, hw - w);
  const ih = Math.max(2, h - w - 2);
  return (
    <>
      <View
        pointerEvents="none"
        style={{
          position: 'absolute', left: x - hw, top: base - h, width: 0, height: 0,
          borderLeftWidth: hw, borderRightWidth: hw, borderBottomWidth: h,
          borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: line,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute', left: x - iw, top: base - ih, width: 0, height: 0,
          borderLeftWidth: iw, borderRightWidth: iw, borderBottomWidth: ih,
          borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: fill,
        }}
      />
    </>
  );
}

function Tree({ x, base, r, line, fill }: { x: number; base: number; r: number; line: string; fill: string }) {
  const bw = Math.max(2, r * 0.24);
  const cw = Math.max(1.6, r * 0.22);
  return (
    <>
      <View
        pointerEvents="none"
        style={{ position: 'absolute', left: x - bw / 2, top: base - r * 2.2, width: bw, height: r * 2.2, backgroundColor: line }}
      />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute', left: x - r, top: base - r * 3.9, width: r * 2, height: r * 2,
          borderRadius: r, borderWidth: cw, borderColor: line, backgroundColor: fill,
        }}
      />
    </>
  );
}

function Land({
  x0, width, base, hills, treeX, treeR, line, fill,
}: {
  x0: number; width: number; base: number;
  hills: HillSpec[]; treeX: number; treeR: number; line: string; fill: string;
}) {
  return (
    <>
      {hills.map((hl, k) => (
        <Hill key={k} x={hl.x} hw={hl.hw} h={hl.h} base={base} line={line} fill={fill} />
      ))}
      <Tree x={treeX} base={base} r={treeR} line={line} fill={fill} />
      {/* drawn last, so it caps the hills' bottom edges into one clean ground line */}
      <View
        pointerEvents="none"
        style={{ position: 'absolute', left: x0, top: base, width, height: 2, backgroundColor: line }}
      />
    </>
  );
}

function Placard({
  S, k, top, head, body,
}: { S: SharedValue<any>; k: number; top: number; head: string; body: string }) {
  const st = useAnimatedStyle(() => {
    const v = clamp01(S.value.theory - k);
    return { opacity: v, transform: [{ translateX: (1 - v) * 16 }] };
  });
  return (
    <Animated.View style={[styles.placard, { top }, st]} pointerEvents="none">
      <Text style={styles.placardHead}>{head}</Text>
      <Text style={styles.placardBody}>{body}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 24, top: GROUND, width: 316, height: 1.5, backgroundColor: RULE },
  cliff: { position: 'absolute', left: 338, top: GROUND, width: 1.5, height: 46, backgroundColor: RULE },

  // ── landscape ──────────────────────────────────────────────────────────────
  landWrap: { position: 'absolute', left: LAND_L, top: LAND_T, width: LAND_W, height: LAND_H },
  landLabel: {
    position: 'absolute', left: 100, top: 108, width: 100, textAlign: 'right',
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.6, color: SOFT,
    includeFontPadding: false,
  },

  // ── easel ──────────────────────────────────────────────────────────────────
  easelPost: { position: 'absolute', left: 81, top: BOARD_T + BOARD_H - 4, width: 4, height: 128, backgroundColor: SOFT },
  legL: { position: 'absolute', left: 72, top: 448, width: 3, height: 56, backgroundColor: SOFT, transform: [{ rotate: '12deg' }] },
  legR: { position: 'absolute', left: 88, top: 448, width: 3, height: 56, backgroundColor: SOFT, transform: [{ rotate: '-12deg' }] },
  board: {
    position: 'absolute', left: BOARD_L, top: BOARD_T, width: BOARD_W, height: BOARD_H,
    borderWidth: 2.5, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
  },
  boardLabel: {
    position: 'absolute', left: 0, right: 0, top: 9, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.6, color: SOFT,
    includeFontPadding: false,
  },
  mapArea: { position: 'absolute', left: 9, top: 30, width: 110, height: 90 },

  // ── the "check?" link between map and land ─────────────────────────────────
  linkWrap: { position: 'absolute', left: 158, top: 228, width: 120, height: 52 },
  arrowL: {
    position: 'absolute', left: 0, top: 20, width: 0, height: 0,
    borderTopWidth: 5, borderBottomWidth: 5, borderRightWidth: 9,
    borderTopColor: 'transparent', borderBottomColor: 'transparent', borderRightColor: INK,
  },
  arrowR: {
    position: 'absolute', left: 111, top: 20, width: 0, height: 0,
    borderTopWidth: 5, borderBottomWidth: 5, borderLeftWidth: 9,
    borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: INK,
  },
  dash: { position: 'absolute', top: 24, width: 6, height: 2, backgroundColor: SOFT },
  badge: {
    position: 'absolute', left: 36, top: 2, width: 48, height: 48, borderRadius: 24,
    borderWidth: 2.5, borderColor: INK, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  badgeMark: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 26, color: INK, lineHeight: 32,
    includeFontPadding: false,
  },

  // ── rival theories ─────────────────────────────────────────────────────────
  placard: {
    position: 'absolute', left: 276, width: 118, height: 44,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    justifyContent: 'center', paddingHorizontal: 9,
  },
  placardHead: { fontFamily: 'Inter_700Bold', fontSize: 8.5, letterSpacing: 1.4, color: SOFT,
    includeFontPadding: false,
  },
  placardBody: { fontFamily: 'Inter_700Bold', fontSize: 12, color: INK, marginTop: 2,
    includeFontPadding: false,
  },

  // ── Q1 cards ───────────────────────────────────────────────────────────────
  cardLayer: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H },
  card: {
    position: 'absolute', top: CARD_T, width: CARD_W, height: CARD_H,
    borderWidth: 2.5, borderColor: INK, borderRadius: 5, backgroundColor: PAPER, overflow: 'hidden',
  },
  cardRight: { backgroundColor: INK, borderColor: INK },
  cardWrong: { borderColor: SOFT, opacity: 0.45 },
  cardLabel: {
    position: 'absolute', left: 0, right: 0, top: 8, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 13, letterSpacing: 1.4, color: INK,
    includeFontPadding: false,
  },
  cardLabelOn: { color: PAPER },
  tapLabel: {
    position: 'absolute', left: CARD_A_L, top: 334, width: CARD_B_L + CARD_W - CARD_A_L, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1.6, color: INK,
    includeFontPadding: false,
  },
});

export function Epistemology9Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Epistemology9Scene} band={[96, 516]} camera={CAM} />;
}
