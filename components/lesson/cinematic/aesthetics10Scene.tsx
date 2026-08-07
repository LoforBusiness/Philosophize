import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import {
  WALK, dirsFrom, ease01, emoteHold, emoteLive, lerp, moveTr, pose, seg, travelStance, type Bundle,
} from './rig';
import { BEATS } from './aesthetics10Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';

// A SCREEN upper right showing a masterfully-made film, and directly under it a
// second panel reading WHAT IT ASKS YOU TO FEEL. A shutter runs on a track across
// that lower panel only. The figure works it from the left jamb: Wilde draws it
// shut, the moralist shoves it back open, and on the third state a line is drawn
// from the lower panel up into the craft verdict inside the screen.
//
// Deliberately NOT a gallery: no wall, no rail, no frames side by side, no plinth.
// Five aesthetics lessons already use that room.
//
// COMPOSITION / OCCLUSION —
//   · the figure WALKS x = 44 → 110 once, on beat 2, and holds 110 for the rest.
//     A resting body spans x ≈ 74…146; the head disc only reaches x ≈ 88…130.
//   · the screen + panel column is x = 140…386. Everything the reader must READ
//     lives there, and the only part of the figure that ever enters it is the
//     working hand — which is the point: at x 110 the extended fist covers
//     x ≈ 137…148, so it lands ON the shutter's grab rail (abs x 142…156 when the
//     shutter is closed). The torso and head never cross 140.
//   · the screen is y 244…372 and the two camp boards are y 246…364 — both are
//     entirely ABOVE a standing crown at y 397 (y 393 at the top of a walk's bob),
//     so neither can be covered by the figure and neither covers him.
//   · the lower panel is y 400…462, i.e. beside the figure's head, but 10 units
//     clear of it in x. The camp boards (x 8…132) are 8 units clear of the column.
//   · the link arrow sits at x 350…362 — inside the verdict strip's right end but
//     clear of its centred text, which spans about x 187…339.
//
// A5 — DELIBERATE EXCEPTIONS:
//   · the shutter is opaque and covers the lower panel's words. That is normally
//     D31, and here it is the entire argument of the lesson: the reader is shown
//     what the panel says on beats 0–1 BEFORE Wilde closes it, so nothing is hidden
//     that was never readable.
//   · the shutter's throw is 246 units and the figure cannot travel with a handle
//     that far, so he works it only at the near (left) edge and the shutter runs on
//     its own track — which is how a heavy sliding door actually behaves. His hand
//     is on the rail at the moment it arrives, and on the empty jamb after it goes.

const COL_L = 140;
const COL_W = 246;               // the screen / panel column: x 140 … 386

const SCR_T = 244;
const SCR_H = 128;               // screen: y 244 … 372
const CELL_H = 42;               // filmstrip cells: y 274 … 316
const CELL_BARS = [22, 30, 14, 26, 18];

const VRD_L = 158;
const VRD_W = 210;
const VRD_T = 330;
const VRD_H = 34;                // craft verdict strip: y 330 … 364

const LINK_T = 372;              // the line from the panel up into the verdict
const LINK_H = 28;

const PAN_T = 400;
const PAN_H = 62;                // lower panel: y 400 … 462

const RAIL_L = 2;                // the shutter's grab rail, LOCAL to the slab
const RAIL_W = 14;               // → abs x 142 … 156 when the shutter is closed

// THE ANSWER BOARDS, SIZED FOR A FINGER (E37b-2).
// The band is 280 units, so on a 360dp phone the fit is min(0.88, 296/280) = 0.88.
// A 50-unit board is 44dp and a 68-unit pitch is 60dp — comfortably past the ~45dp
// a fingertip covers, and the slop below claims the whole 18-unit gutter so a tap
// can never land in dead space. Half the gap and no more: wider would overlap the
// neighbour and the topmost would silently win.
const BRD_L = 8;
const BRD_W = 124;
const BRD_H = 50;
const BRD_T = 246;               // boards at y 246…296 and 314…364
const BRD_GAP = 68;
const BRD_SLOP = (BRD_GAP - BRD_H) / 2;

const VERDICTS = ['', 'CRAFT: MASTERFUL', 'CRAFT: FLAWED AS ART'];

const BOARDS = [
  { id: 'wilde', label: 'WILDE', caption: 'CRAFT ONLY', correct: false },
  { id: 'moralist', label: 'MORALIST', caption: 'FEELING TOO', correct: true },
];

const P = BEATS.map((b) => b.p ?? 0);
const X = BEATS.map((b) => b.x ?? 110);
const DIR = dirsFrom(X, 1);
const FILM = BEATS.map((b) => b.film ?? 0);
const PANELV = BEATS.map((b) => b.panel ?? 0);
const SHUT = BEATS.map((b) => b.shut ?? 0);
const LINKV = BEATS.map((b) => b.link ?? 0);

export default function Aesthetics10Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;

  // Only the thing that CHANGED this beat re-draws itself; everything else holds,
  // so nothing replays behind the reader each time they tap (C20c / H58).
  const filmFade = (cur.film ?? 0) !== (prev?.film ?? 0);
  const panelFade = (cur.panel ?? 0) !== (prev?.panel ?? 0);
  const linkFade = (cur.link ?? 0) !== (prev?.link ?? 0);
  const verdictFade = (cur.verdict ?? 0) !== (prev?.verdict ?? 0);
  const verdictOn = (cur.verdict ?? 0) > 0;

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / moveTr(X[p], X[n], 0.85));
    const t = clock.value;
    const grow = ease01(bt.value / 0.55);

    const s = travelStance(
      X[p], X[n],
      emoteHold(P[p], t), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    );
    return {
      fig: pose(s, lerp(X[p], X[n], tr), GROUND, K_FIG, DIR[n], 1),
      film: lerp(FILM[p], FILM[n], tr) * (filmFade ? grow : 1),
      panel: lerp(PANELV[p], PANELV[n], tr) * (panelFade ? grow : 1),
      // The shutter runs over the LAST 60% of the transition, so on the beat he
      // walks in he arrives at the jamb first and draws it across after.
      shut: lerp(SHUT[p], SHUT[n], ease01(seg(tr, 0.4, 1))),
      link: lerp(LINKV[p], LINKV[n], tr) * (linkFade ? grow : 1),
      verdict: verdictOn ? (verdictFade ? grow : 1) : 0,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const filmStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.film }));
  const panelStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.panel }));
  const verdictStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.verdict }));
  const shutStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: (1 - SCENE.value.shut) * COL_W }],
  }));
  const linkStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.link,
    transform: [{ translateY: (1 - SCENE.value.link) * 8 }],
  }));

  const answered = picked !== null;
  const showBoards = (cur.boards ?? 0) > 0 && !!cur.interact;

  return (
    <Animated.View style={styles.scene}>
      {/* ── the screen, and the film running on it ─────────────────────────── */}
      <Animated.View style={[styles.screen, filmStyle]} pointerEvents="none">
        <Text style={styles.screenLabel}>THE FILM</Text>
        <View style={styles.strip} pointerEvents="none">
          {CELL_BARS.map((w, k) => (
            <View key={k} style={styles.cell} pointerEvents="none">
              <View style={[styles.cellBar, { width: w }]} pointerEvents="none" />
            </View>
          ))}
        </View>
      </Animated.View>

      {/* the verdict the craft alone earns — and what it becomes at the end */}
      <Animated.View style={[styles.verdict, verdictStyle]} pointerEvents="none">
        <Text style={styles.verdictText}>{VERDICTS[cur.verdict ?? 0]}</Text>
      </Animated.View>

      {/* ethicism: the line from the lower panel up into the craft verdict */}
      <Animated.View style={[styles.linkBar, linkStyle]} pointerEvents="none" />
      <Animated.View style={[styles.linkHead, linkStyle]} pointerEvents="none" />

      {/* ── the lower panel, and the shutter that can hide it ──────────────── */}
      <Animated.View style={[styles.panel, panelStyle]} pointerEvents="none">
        <Text style={styles.panelLabel}>WHAT IT ASKS YOU TO FEEL</Text>
        <Text style={styles.panelLine}>GLORY IN CRUELTY</Text>
      </Animated.View>

      <Animated.View style={[styles.shutClip, panelStyle]} pointerEvents="none">
        <Animated.View style={[styles.shutter, shutStyle]} pointerEvents="none">
          <View style={[styles.slat, { top: 15 }]} pointerEvents="none" />
          <View style={[styles.slat, { top: 30 }]} pointerEvents="none" />
          <View style={[styles.slat, { top: 45 }]} pointerEvents="none" />
          <View style={styles.rail} pointerEvents="none" />
        </Animated.View>
      </Animated.View>

      {/* ── Q1: which camp does the line belong on ─────────────────────────── */}
      {showBoards &&
        BOARDS.map((b, k) => {
          const chosen = picked === b.id;
          return (
            <Target id={b.id} correct={b.correct} picked={picked} onPick={onPick}
              key={b.id} style={[styles.board, { top: BRD_T + k * BRD_GAP }]} hitSlop={{ top: BRD_SLOP, bottom: BRD_SLOP, left: BRD_SLOP, right: BRD_SLOP }} disabled={answered}>
              <View
                style={[
                  styles.boardInner,
                  answered && b.correct && styles.boardRight,
                  answered && chosen && !b.correct && styles.boardWrong,
                ]}
              >
                <Text style={[styles.boardText, answered && b.correct && styles.boardTextOn]}>
                  {b.label}
                </Text>
                <Text style={[styles.boardCap, answered && b.correct && styles.boardCapOn]}>
                  {b.caption}
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

  screen: {
    position: 'absolute', left: COL_L, top: SCR_T, width: COL_W, height: SCR_H,
    borderWidth: 2.5, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
  },
  screenLabel: {
    position: 'absolute', left: 0, right: 0, top: 9, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.8, color: SOFT,
    includeFontPadding: false,
  },
  strip: {
    position: 'absolute', left: 16, right: 16, top: 30, height: CELL_H,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  cell: {
    width: 38, height: CELL_H, borderWidth: 1.5, borderColor: INK, borderRadius: 2,
    alignItems: 'center', justifyContent: 'center', backgroundColor: PAPER,
  },
  cellBar: { height: 4, borderRadius: 2, backgroundColor: INK },

  verdict: {
    position: 'absolute', left: VRD_L, top: VRD_T, width: VRD_W, height: VRD_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  verdictText: {
    fontFamily: 'Inter_700Bold', fontSize: 12.5, letterSpacing: 0.4, color: INK,
    includeFontPadding: false,
  },

  linkBar: { position: 'absolute', left: 355, top: LINK_T, width: 2.5, height: LINK_H, backgroundColor: INK },
  linkHead: {
    position: 'absolute', left: 352, top: 364, width: 8, height: 8,
    backgroundColor: INK, transform: [{ rotate: '45deg' }],
  },

  panel: {
    position: 'absolute', left: COL_L, top: PAN_T, width: COL_W, height: PAN_H,
    borderWidth: 2.5, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
  },
  panelLabel: {
    position: 'absolute', left: 0, right: 0, top: 8, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.5, letterSpacing: 1.2, color: SOFT,
    includeFontPadding: false,
  },
  panelLine: {
    position: 'absolute', left: 0, right: 0, top: 26, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 15, letterSpacing: 0.4, lineHeight: 20, color: INK,
    includeFontPadding: false,
  },

  shutClip: {
    position: 'absolute', left: COL_L, top: PAN_T, width: COL_W, height: PAN_H,
    borderRadius: 4, overflow: 'hidden',
  },
  shutter: { position: 'absolute', left: 0, top: 0, width: COL_W, height: PAN_H, backgroundColor: INK },
  slat: { position: 'absolute', left: 26, right: 10, height: 2, backgroundColor: PAPER, opacity: 0.5 },
  rail: {
    position: 'absolute', left: RAIL_L, top: 8, width: RAIL_W, height: PAN_H - 16,
    borderRadius: 3, backgroundColor: PAPER,
  },

  board: { position: 'absolute', left: BRD_L, width: BRD_W },
  boardInner: {
    height: BRD_H, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8,
  },
  boardRight: { backgroundColor: INK, borderColor: INK },
  boardWrong: { borderColor: SOFT, opacity: 0.45 },
  boardText: {
    fontFamily: 'Inter_700Bold', fontSize: 14, letterSpacing: 1.1, color: INK,
    includeFontPadding: false,
  },
  boardTextOn: { color: PAPER },
  boardCap: {
    marginTop: 4, fontFamily: 'Inter_500Medium', fontSize: 8.5, letterSpacing: 1, color: SOFT,
    includeFontPadding: false,
  },
  boardCapOn: { color: PAPER },
});

// The art runs from the screen's top edge (244) and the boards' top edge (246) down
// to the ground line (500). Nothing is drawn above or below, so the player crops to
// [232, 512] — a 280-unit band, which is exactly the point where the stage region's
// WIDTH becomes the limit and the crop is free: the whole scene renders at 2.31×
// instead of the 1.15× a full-height fit would give it.
export function Aesthetics10Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Aesthetics10Scene} band={[232, 512]} />;
}
