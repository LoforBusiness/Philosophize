import {
  View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import {
  WALK, clamp01, dirsFrom, ease01, lerp, moveTr, pose, seg, travelStance, type Bundle, } from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './epistemology8Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld,
  facing, useCarry, carry,
} from './cinematicKit';
import { followMoves, kindOf, seedOf } from './camera';
import type { SceneApi } from './CinematicPlayer';
import { TargetRing } from './Target';

// A pile of spare BECAUSE-blocks downstage far-left, and a tower of reasons hanging
// stage-right that grows DOWNWARD — each new reason wedged UNDER the last, because
// support goes beneath, not on top. The figure hauls a block across and sets it
// down, twice. Late in the lesson the tower dissolves and the only three exits take
// its place; Q1 is answered by tapping one of them.
//
// ── COMPOSITION / OCCLUSION ──────────────────────────────────────────────────
// The figure only ever stands at x = 98 (the pile), 176 (the escapes) and 196 (the
// tower). Its body-plus-arms envelope is therefore x 50 → 244.
//   · the block pile lives in x 2 → 48   (left of the envelope)
//   · the tower       lives in x 248 → 378 (right of it; figure never passes 196)
//   · the escape cards live in x 240 → 386, and are only on stage while the figure
//     stands at 98 or 176 (envelope ends at 224)
// Nothing the figure teaches from is ever behind it. The only art that shares its
// x is the block it carries, which is meant to move with it.

// ── the block pile (stage-left, on the ground) ───────────────────────────────
const PILE_L = 3;
const PILE_W = 44;
const PILE_TOPS = [484, 468, 452];      // bottom-up; index 2 is the block taken first

// ── the tower of reasons (stage-right, hanging with no floor under it) ───────
const TOWER_L = 248;
const TOWER_W = 130;
const ROW_TOP = 190;
// 58, not 48: a two-line reason ("the timetable says so") plus its label needs the
// room once Android's default font padding is counted, or the second line clips.
const ROW_H = 58;
const ROW_GAP = 7;

const ROWS = [
  { lab: 'CLAIM', txt: 'The bus comes at 8' },
  { lab: 'BECAUSE', txt: 'the timetable says so' },
  { lab: 'BECAUSE', txt: 'the city printed it' },
  { lab: 'BECAUSE', txt: '…and so on?' },
];

// ── the three escapes (same column, once the tower dissolves) ────────────────
const ESC_L = 240;
const ESC_W = 146;
const ESC_H = 46;
const ESC_GAP = 7;
const ESC_TOP = 194;

const ESCAPES = [
  { id: 'never', label: 'IT NEVER ENDS', kind: 0, correct: false },
  { id: 'circle', label: 'IT LOOPS IN A CIRCLE', kind: 1, correct: false },
  { id: 'bedrock', label: 'IT HITS BEDROCK', kind: 2, correct: true },
];

// ── the block in the figure's hands ──────────────────────────────────────────
const CARRY_W = 56;
const CARRY_H = 26;
const CARRY_TOP = 442;                  // hand height for gestures 42 / 31 / 43 / 27

const P = BEATS.map((b) => b.p ?? 0);
const X = BEATS.map((b) => b.x ?? 98);
// The camera, from the staging: it follows the figure this track describes,
// pulls back to scale 1 on every graded beat so a tap lands where it is aimed,
// and leans in on the quote. See followMoves in ./camera.ts.
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('epistemology8'));
const DIR = dirsFrom(X, 1);
const TOWER = BEATS.map((b) => b.tower ?? 0);
const PILE = BEATS.map((b) => b.pile ?? 0);
const HOLD = BEATS.map((b) => b.hold ?? 0);

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.plot ? 1 : 0));

export default function Epistemology8Scene({ clock, bt, bi, i, picked, onPick, dragPos }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldS = useHeld();
  const cv = useCarry(5);
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;

  // The escapes only fade on the beat that CHANGES them, so the cards don't
  // re-animate every time the reader taps forward (same rule as the tower rows,
  // which ride a row COUNT that is constant on beats that don't add a block).
  const escFade = (cur.esc ?? 0) !== (prev?.esc ?? 0);
  const escOn = (cur.esc ?? 0) > 0;
  const towerOn = (cur.tower ?? 0) > 0 || (prev?.tower ?? 0) > 0;
  const intro = i === 0;                // gentle open on the very first beat only

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / moveTr(X[p], X[n], 0.85));
    const t = clock.value;
    const grow = ease01(bt.value / 0.55);
    const open = intro ? grow : 1;

    // WALK is passed EXPLICITLY: a Gait left to a default parameter is not captured
    // into the worklet runtime and hard-crashes the screen.
    const s = keepHeld(heldS, travelStance(
      X[p], X[n],
      carryFrom(heldS, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));
    const fx = carry(cv, 0, n, X[p], X[n], tr);
    return {
      fig: pose(s, fx, GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1),
      // The carried block rides in front of the figure and only appears / vanishes
      // in the last stretch of the travel — picked up on arrival, set down on
      // arrival — so it is visible for the whole walk across. Its offset swings
      // with the FACING across the beat rather than snapping, so turning around at
      // the pile shifts the block to the new front instead of teleporting it.
      carryX: fx + carry(cv, 1, n, DIR[p], DIR[n], tr) * 12,
      hold: carry(cv, 2, n, HOLD[p], HOLD[n], seg(tr, 0.78, 1)),
      pile: carry(cv, 3, n, PILE[p], PILE[n], seg(tr, 0.6, 0.92), open),
      // R7b — the drawn curve builds the tower. `pos` on a plot is the MEAN height of
      // the line (see ShapePlot), and the question is how much a loop of reasons holds
      // up as the web widens — so the reader's own curve is how many rows stand.
      tower: carry(cv, 4, n, TOWER[p], reacting ? 1 + dragPos.value * 3 : TOWER[n], tr, open),
      esc: escOn ? (escFade ? grow : 1) : 0,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const carryStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.hold,
    transform: [{ translateX: SCENE.value.carryX - CARRY_W / 2 }],
  }));
  // The tower and the escape cards share one column, so anything the tower draws is
  // multiplied by (1 - esc): the escapes rising is exactly the tower dissolving, and
  // the two never double-print on top of each other during the swap.
  const towerLabelStyle = useAnimatedStyle(() => ({
    opacity: clamp01(SCENE.value.tower) * (1 - SCENE.value.esc),
  }));
  const dotsStyle = useAnimatedStyle(() => ({
    opacity: clamp01((SCENE.value.tower - 3.4) * 2.2) * (1 - SCENE.value.esc),
  }));
  const escLabelStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.esc }));

  const answered = picked !== null;
  const showPick = (cur.pick ?? 0) > 0 && !!cur.interact;
  const land = cur.land ?? 0;

  return (
    <Animated.View style={styles.scene}>
      {/* ── the spare blocks waiting on the ground, stage-left ───────────────── */}
      <Text style={styles.pileLabel} pointerEvents="none">REASONS</Text>
      {PILE_TOPS.map((top, k) => (
        <PileBlock key={k} S={SCENE} k={k} top={top} />
      ))}

      {/* ── the tower of reasons, hanging with no floor beneath it ───────────── */}
      {towerOn ? (
        <>
          <Animated.Text style={[styles.towerLabel, towerLabelStyle]} pointerEvents="none">
            THE CHAIN
          </Animated.Text>
          {ROWS.map((r, k) => (
            <TowerRow key={r.txt} S={SCENE} k={k} lab={r.lab} txt={r.txt} ghost={k === ROWS.length - 1} />
          ))}
          <Animated.View style={[styles.dots, dotsStyle]} pointerEvents="none">
            <View style={[styles.dot, { opacity: 0.9 }]} />
            <View style={[styles.dot, { opacity: 0.55 }]} />
            <View style={[styles.dot, { opacity: 0.25 }]} />
          </Animated.View>
        </>
      ) : null}

      {/* ── the three escapes; Q1 is answered by tapping one ─────────────────── */}
      {escOn ? (
        <>
          <Animated.Text style={[styles.escHead, escLabelStyle]} pointerEvents="none">
            {showPick ? 'TAP ONE ↓' : 'WHERE DOES IT STOP?'}
          </Animated.Text>
          {ESCAPES.map((e, k) => {
            const chosen = picked === e.id;
            const filled = (showPick && answered && e.correct) || land === k + 1;
            const dimmed =
              (showPick && answered && chosen && !e.correct) || (land > 0 && land !== k + 1);
            return (
              <EscapeCard
                key={e.id}
                S={SCENE}
                k={k}
                label={e.label}
                kind={e.kind}
                filled={filled}
                dimmed={dimmed}
                disabled={!showPick || answered}
                onPress={() => onPick(e.id, e.correct)}
              />
            );
          })}
        </>
      ) : null}

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />

      {/* Drawn AFTER the figure, so the block reads as held in front of the body. */}
      <Animated.View style={[styles.carry, carryStyle]} pointerEvents="none">
        <Text numberOfLines={1} style={styles.carryText}>BECAUSE</Text>
      </Animated.View>
    </Animated.View>
  );
}

// ── pieces ────────────────────────────────────────────────────────────────────

function PileBlock({ S, k, top }: { S: SharedValue<any>; k: number; top: number }) {
  const st = useAnimatedStyle(() => ({ opacity: clamp01(S.value.pile - k) }));
  return <Animated.View style={[styles.pileBlock, { top }, st]} pointerEvents="none" />;
}

function TowerRow({
  S, k, lab, txt, ghost,
}: { S: SharedValue<any>; k: number; lab: string; txt: string; ghost: boolean }) {
  // Slides DOWN into place — each reason is wedged under the one above it.
  const st = useAnimatedStyle(() => {
    const o = clamp01(S.value.tower - k);
    return { opacity: o * (1 - S.value.esc), transform: [{ translateY: (1 - o) * -12 }] };
  });
  const claim = k === 0;
  return (
    <Animated.View
      style={[
        styles.row,
        { top: ROW_TOP + k * (ROW_H + ROW_GAP) },
        claim && styles.rowClaim,
        ghost && styles.rowGhost,
        st,
      ]}
      pointerEvents="none"
    >
      <Text style={[styles.rowLab, claim && styles.rowLabOn, ghost && styles.rowSoft]}>{lab}</Text>
      <Text style={[styles.rowTxt, claim && styles.rowTxtOn, ghost && styles.rowSoft]}>{txt}</Text>
    </Animated.View>
  );
}

function EscapeCard({
  S, k, label, kind, filled, dimmed, disabled, onPress,
}: {
  S: SharedValue<any>;
  k: number;
  label: string;
  kind: number;
  filled: boolean;
  dimmed: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  // Staggered so the three exits arrive one after another rather than as a slab.
  const st = useAnimatedStyle(() => {
    const o = clamp01((S.value.esc - k * 0.16) / 0.62);
    return { opacity: o, transform: [{ translateX: (1 - o) * 14 }] };
  });
  return (
    <Animated.View style={[styles.escWrap, { top: ESC_TOP + k * (ESC_H + ESC_GAP) }, st]}>
      <Pressable disabled={disabled} onPress={onPress}>
        <View style={[styles.escCard, filled && styles.escOn, dimmed && styles.escDim]}>
          <EscIcon kind={kind} on={filled} />
          <Text style={[styles.escLabel, filled && styles.escLabelOn]}>{label}</Text>
        </View>
        <TargetRing answered={disabled} radius={4} />
      </Pressable>
    </Animated.View>
  );
}

/** The three little diagrams, built from Views and CSS border-triangles. */
function EscIcon({ kind, on }: { kind: number; on: boolean }) {
  const c = on ? PAPER : INK;
  if (kind === 0) {
    // an endless dotted line marching down and fading out
    return (
      <View style={styles.diag} pointerEvents="none">
        {[0, 1, 2, 3, 4].map((k) => (
          <View key={k} style={[styles.dash, { top: 2 + k * 7, backgroundColor: c, opacity: 1 - k * 0.18 }]} />
        ))}
      </View>
    );
  }
  if (kind === 1) {
    // a ring of reasons chasing its own tail
    return (
      <View style={styles.diag} pointerEvents="none">
        <View style={[styles.ring, { borderColor: c }]} />
        <View style={[styles.arrowR, { borderLeftColor: c }]} />
        <View style={[styles.arrowL, { borderRightColor: c }]} />
      </View>
    );
  }
  // two blocks landing on a solid slab
  return (
    <View style={styles.diag} pointerEvents="none">
      <View style={[styles.mini, { top: 1, borderColor: c }]} />
      <View style={[styles.mini, { top: 10, borderColor: c }]} />
      <View style={[styles.slab, { backgroundColor: c }]} />
      <View style={[styles.hatch, { left: 4, backgroundColor: c }]} />
      <View style={[styles.hatch, { left: 16, backgroundColor: c }]} />
      <View style={[styles.hatch, { left: 28, backgroundColor: c }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 24, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON. A rule on its own leaves the
  // figure and everything it is looking at standing on bare page;
  // political7 and political8 both stand their subject on a filled mass.
  floor: { position: 'absolute', left: 0, right: 0, top: GROUND, bottom: 0, backgroundColor: RULE },

  // ── the pile ────────────────────────────────────────────────────────────────
  pileLabel: {
    position: 'absolute', left: 0, top: 434, width: 70, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 9.8, letterSpacing: 1.1, color: SOFT,
    includeFontPadding: false,
  },
  pileBlock: {
    position: 'absolute', left: PILE_L, width: PILE_W, height: 15,
    borderWidth: 2, borderColor: INK, borderRadius: 2, backgroundColor: STONE,
  },

  // ── the tower ───────────────────────────────────────────────────────────────
  towerLabel: {
    position: 'absolute', left: TOWER_L, top: 170, width: TOWER_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 9.8, letterSpacing: 1.6, color: SOFT,
    includeFontPadding: false,
  },
  row: {
    position: 'absolute', left: TOWER_L, width: TOWER_W, height: ROW_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: STONE,
    paddingHorizontal: 7, paddingTop: 5, justifyContent: 'flex-start',
  },
  rowClaim: { backgroundColor: INK, borderColor: INK },
  rowGhost: { borderColor: SOFT, backgroundColor: STONE },
  rowLab: { fontFamily: 'Inter_700Bold', fontSize: 9.8, letterSpacing: 1.3, color: INK, marginBottom: 2, includeFontPadding: false },
  rowLabOn: { color: PAPER, opacity: 0.75 },
  rowTxt: { fontFamily: 'Inter_700Bold', fontSize: 11.5, lineHeight: 14, color: INK, includeFontPadding: false },
  rowTxtOn: { color: PAPER },
  rowSoft: { color: SOFT },

  dots: {
    position: 'absolute', left: TOWER_L, top: ROW_TOP + 4 * (ROW_H + ROW_GAP) + 2,
    width: TOWER_W, alignItems: 'center',
  },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: INK, marginBottom: 6 },

  // ── the three escapes ───────────────────────────────────────────────────────
  escHead: {
    position: 'absolute', left: ESC_L, top: 170, width: ESC_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 9.8, letterSpacing: 1.6, color: SOFT,
    includeFontPadding: false,
  },
  escWrap: { position: 'absolute', left: ESC_L, width: ESC_W },
  escCard: {
    flexDirection: 'row', alignItems: 'center', height: ESC_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: STONE,
    paddingHorizontal: 8,
  },
  escOn: { backgroundColor: INK, borderColor: INK },
  escDim: { borderColor: SOFT, opacity: 0.55 },
  escLabel: {
    flex: 1, marginLeft: 8,
    fontFamily: 'Inter_700Bold', fontSize: 12, lineHeight: 15, letterSpacing: 0.3, color: INK,
    includeFontPadding: false,
  },
  escLabelOn: { color: PAPER },

  diag: { width: 34, height: 34 },
  dash: { position: 'absolute', left: 7, width: 20, height: 3, borderRadius: 1.5 },
  ring: { position: 'absolute', left: 3, top: 3, width: 28, height: 28, borderRadius: 14, borderWidth: 2.5 },
  arrowR: {
    position: 'absolute', left: 25, top: 2, width: 0, height: 0,
    borderTopWidth: 4, borderBottomWidth: 4, borderLeftWidth: 7,
    borderTopColor: 'transparent', borderBottomColor: 'transparent',
    transform: [{ rotate: '55deg' }],
  },
  arrowL: {
    position: 'absolute', left: 2, top: 24, width: 0, height: 0,
    borderTopWidth: 4, borderBottomWidth: 4, borderRightWidth: 7,
    borderTopColor: 'transparent', borderBottomColor: 'transparent',
    transform: [{ rotate: '55deg' }],
  },
  mini: { position: 'absolute', left: 7, width: 20, height: 7, borderWidth: 2, borderRadius: 1 },
  slab: { position: 'absolute', left: 1, top: 20, width: 32, height: 8, borderRadius: 1 },
  hatch: { position: 'absolute', top: 29, width: 2, height: 4 },

  // ── the carried block ───────────────────────────────────────────────────────
  carry: {
    position: 'absolute', left: 0, top: CARRY_TOP, width: CARRY_W, height: CARRY_H,
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: STONE,
    alignItems: 'center', justifyContent: 'center',
  },
  // 56 WIDE, AND THE COMMENT THAT USED TO BE HERE WAS WRONG BY A THIRD.
  //
  // It said "the glyphs alone are only 35.3" and set the box to 44 on that basis.
  // BECAUSE at Inter 700 9.8 with no tracking is 46.1dp, measured against the real
  // face — so the word overran its 40 units of content by 6.1 and had been doing it
  // since the box was tuned. `check-readable` reported exactly 6px past its box,
  // which is how the number was found.
  //
  // That is the whole argument for group S in one label: an estimate stated as a
  // measurement, written down in a comment, and believed for as long as nothing
  // could contradict it. Tracking stays at 0 — the tower's own labels keep theirs
  // and have the room for them — and 52 units of content leaves 12% of margin,
  // which is what D30 asks for.
  carryText: { fontFamily: 'Inter_700Bold', fontSize: 9.8, letterSpacing: 0, color: INK,
    includeFontPadding: false,
  },
});

// Measured across every beat: the highest ink is the tower/escape heading at y = 170
// (which rises 12 units under its fade-in, so 158 at its most extreme) and the lowest
// is the figure's shadow at 506. The old [96, 516] reserved 74 empty rows above the
// heading, which cost real size: at 420 tall the band was HEIGHT-limited and the
// whole lesson rendered at 0.75 with a side letterbox. At 360 tall it renders at
// 0.87 — about 17% bigger — and still clears the fade-in's rise by 6 units.
export function Epistemology8Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Epistemology8Scene} band={[152, 512]} camera={CAM} />;
}
