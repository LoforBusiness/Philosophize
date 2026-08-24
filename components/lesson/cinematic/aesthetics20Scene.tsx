import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './aesthetics20Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER,
  useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

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

const TR = 0.82;

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
const P = BEATS.map((b) => b.p ?? 0);
const USES = BEATS.map((b) => b.uses ?? 0);
const SWAPS = BEATS.map((b) => b.swaps ?? 0);
const STRUCK = BEATS.map((b) => b.struck ?? 0);
const LIVE = BEATS.map((b) => b.live ?? 0);

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('aesthetics20'));

export default function Aesthetics20Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldFig = useHeld();
  const cv = useCarry(4);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / TR);
    const t = clock.value;

    const figS = keepHeld(heldFig, travelStance(
      X[p], X[n],
      carryFrom(heldFig, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));

    return {
      fig: pose(figS, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, 1, 1),
      uses: carry(cv, 1, n, USES[p], USES[n], tr),
      swaps: carry(cv, 2, n, SWAPS[p], SWAPS[n], tr),
      struck: carry(cv, 3, n, STRUCK[p], STRUCK[n], tr),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  return (
    <View style={styles.scene}>
      <Text style={[styles.cap, { left: CLAIM_X, width: CLAIM_W }]} pointerEvents="none">WHAT IT IS FOR</Text>
      <Text style={[styles.cap, { left: SUB_X, width: SUB_W }]} pointerEvents="none">WHAT ELSE DOES IT</Text>

      {ROWS.map((r, k) => <Row key={r.id} S={SCENE} index={k} />)}

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

  cap: {
    position: 'absolute', top: 232,
    fontFamily: 'Inter_700Bold', fontSize: 8, letterSpacing: 1.2, color: SOFT, includeFontPadding: false,
  },

  claim: {
    position: 'absolute', left: CLAIM_X, width: CLAIM_W, height: ROW_H,
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: PAPER,
    justifyContent: 'center', paddingHorizontal: 7,
  },
  claimText: {
    fontFamily: 'Inter_700Bold', fontSize: 8, letterSpacing: 0.7, color: INK, includeFontPadding: false,
  },
  sub: {
    position: 'absolute', left: SUB_X, width: SUB_W, height: ROW_H,
    borderWidth: 1.5, borderColor: SOFT, borderRadius: 3, backgroundColor: PAPER,
    justifyContent: 'center', paddingHorizontal: 7,
  },
  subText: {
    fontFamily: 'Inter_400Regular', fontSize: 9, color: SOFT, includeFontPadding: false,
  },
  arrow: {
    position: 'absolute', left: 191, width: 18, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 13, color: SOFT, includeFontPadding: false,
  },
  strike: { position: 'absolute', left: CLAIM_X, height: 2, backgroundColor: INK },

  hit: { position: 'absolute', left: CLAIM_X, width: CLAIM_W, height: ROW_H },
  hitBox: { width: CLAIM_W, height: ROW_H, borderRadius: 3 },
  right: { borderWidth: 3, borderColor: INK },
  wrong: { borderWidth: 1.5, borderColor: SOFT, borderStyle: 'dashed', opacity: 0.5 },
});

export function Aesthetics20Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Aesthetics20Scene} band={[226, 512]} camera={CAM} />;
}
