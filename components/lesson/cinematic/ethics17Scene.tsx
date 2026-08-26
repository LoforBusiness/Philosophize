import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, moveTr, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './ethics17Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER,
  useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// A CARD, EIGHT COPIES OF IT, AND A BAR THAT PAYS FOR THEM.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the MAXIM is a 152×42 card at x 124…276, y 230…272, 2-thick ink border. It is
//   the only bordered object at the top of the stage, so it reads as the thing
//   being tested rather than a caption.
// · the COPIES are eight 32×24 cards at y 294…318, lefts 34 · 78 · 122 · 166 ·
//   210 · 254 · 298 · 342 — the run ends at x 374. Each slides UP from the maxim
//   card's own position as `copies` passes it, so they are visibly the same
//   object handed out rather than eight new ones appearing.
// · the STOCK is a bar at x 34…366, y 336…356, captioned BEING BELIEVED at y 324.
//   Its fill is `trust`; it is the only thing on the stage that goes DOWN.
// · the FIGURE walks x 200 → 132 → 268 on GROUND 500; crown ≈ 397, and the lowest
//   ink above him is the bar at 356, so 41 units stay clear at every stop.
//
// Ink runs y 230 (the maxim) … y 500. BAND 224…512 = 288, which puts the 103-unit
// figure at 36%.
//
// THE THREE TARGETS ARE THE THREE THINGS ALREADY DRAWN — the maxim, a copy, and
// the bar. Nothing is added for the question, so the reader answers about the
// picture they have been watching rather than about a control that just arrived.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const MAXIM_X = 124;
const MAXIM_Y = 230;
const MAXIM_W = 152;
const MAXIM_H = 42;

const COPY_Y = 294;
const COPY_W = 32;
const COPY_H = 24;
const COPY_X = [34, 78, 122, 166, 210, 254, 298, 342];

const BAR_X = 34;
const BAR_Y = 336;
const BAR_W = 332;
const BAR_H = 20;

const FIG_X = 200;

const X = BEATS.map((b) => b.x ?? FIG_X);
const P = BEATS.map((b) => b.p ?? 0);
const MAXIM = BEATS.map((b) => b.maxim ?? 0);
const COPIES = BEATS.map((b) => b.copies ?? 0);
const TRUST = BEATS.map((b) => b.trust ?? 0);
const LIVE = BEATS.map((b) => b.live ?? 0);

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.split ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('ethics17'));

export default function Ethics17Scene({ clock, bt, bi, i, picked, onPick, dragPos }: SceneApi) {
  const reacting = REACT[i] === 1;
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

    const figS = keepHeld(heldFig, travelStance(
      X[p], X[n],
      carryFrom(heldFig, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));

    return {
      fig: pose(figS, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, 1, 1),
      maxim: carry(cv, 1, n, MAXIM[p], MAXIM[n], tr),
      copies: carry(cv, 2, n, COPIES[p], COPIES[n], tr),
      // R7b — the seam fills the BEING BELIEVED bar. Slide toward ON THE MURDERER
      // and telling the truth costs the stock nothing; slide the other way and the
      // bar drains, which is the price Kant refuses to pay.
      trust: carry(cv, 3, n, TRUST[p], reacting ? dragPos.value : TRUST[n], tr),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const maximStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.maxim }));
  const fillStyle = useAnimatedStyle(() => ({ width: (BAR_W - 4) * SCENE.value.trust }));

  const copies = [0, 1, 2, 3, 4, 5, 6, 7];

  return (
    <View style={styles.scene}>
      {/* THE MAXIM, and the first target. */}
      <Animated.View style={[StyleSheet.absoluteFill, maximStyle]}>
        <Target
          id="maxim"
          correct={false}
          picked={picked}
          onPick={onPick}
          disabled={!live || answered}
          style={styles.maximHit}
        >
          <View
            style={[styles.maxim, answered && picked === 'maxim' && styles.wrong]}
            pointerEvents="none"
          >
            <Text style={styles.maximText}>LIE WHEN IT SUITS ME</Text>
          </View>
        </Target>
      </Animated.View>

      {copies.map((c) => <Copy key={c} S={SCENE} index={c} />)}

      {/* One copy is tappable — the second, so the hit box is nowhere near the
          edge of the stage and cannot be reached by accident. */}
      <Target
        id="copy"
        correct={false}
        picked={picked}
        onPick={onPick}
        disabled={!live || answered}
        style={[styles.copyHit, { left: COPY_X[1] }]}
      >
        <View
          style={[styles.copyHitBox, answered && picked === 'copy' && styles.wrong]}
          pointerEvents="none"
        />
      </Target>

      {/* THE STOCK. The bar and its caption are one target: it is a single thing
          on the stage and splitting the hit box would be a puzzle about tapping. */}
      <Text style={styles.barCap} pointerEvents="none">BEING BELIEVED</Text>
      <Target
        id="trust"
        correct
        picked={picked}
        onPick={onPick}
        disabled={!live || answered}
        style={styles.barHit}
      >
        <View
          style={[styles.barBox, answered && picked === 'trust' && styles.rightBox]}
          pointerEvents="none"
        >
          <Animated.View style={[styles.barFill, fillStyle]} />
        </View>
      </Target>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

/**
 * One handed-out copy. It travels from the maxim card's own position to its slot
 * in the row, so the spread reads as distribution rather than as eight things
 * fading up in place.
 */
function Copy({ S, index }: { S: { value: { copies: number } }; index: number }) {
  const toX = COPY_X[index];
  const fromX = MAXIM_X + (MAXIM_W - COPY_W) / 2;
  const st = useAnimatedStyle(() => {
    const u = clamp01(S.value.copies * 8 - index);
    return {
      opacity: u,
      transform: [{ translateX: (toX - fromX) * u }, { translateY: (COPY_Y - MAXIM_Y - 8) * u }],
    };
  });
  return <Animated.View pointerEvents="none" style={[styles.copy, { left: fromX, top: MAXIM_Y + 8 }, st]} />;
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },

  maximHit: { position: 'absolute', left: MAXIM_X, top: MAXIM_Y, width: MAXIM_W, height: MAXIM_H },
  maxim: {
    width: MAXIM_W, height: MAXIM_H, borderWidth: 2, borderColor: INK, borderRadius: 4,
    backgroundColor: PAPER, alignItems: 'center', justifyContent: 'center',
  },
  maximText: {
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1, color: INK, includeFontPadding: false,
  },

  copy: {
    position: 'absolute', width: COPY_W, height: COPY_H,
    borderWidth: 1.5, borderColor: SOFT, borderRadius: 2, backgroundColor: PAPER,
  },
  copyHit: { position: 'absolute', top: COPY_Y, width: COPY_W, height: COPY_H },
  copyHitBox: { width: COPY_W, height: COPY_H, borderRadius: 2 },

  barCap: {
    position: 'absolute', left: BAR_X, top: BAR_Y - 12, width: 200,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },
  barHit: { position: 'absolute', left: BAR_X, top: BAR_Y, width: BAR_W, height: BAR_H },
  barBox: {
    width: BAR_W, height: BAR_H, borderWidth: 2, borderColor: INK, borderRadius: 3,
    backgroundColor: PAPER, justifyContent: 'center', paddingHorizontal: 2,
  },
  barFill: { height: BAR_H - 8, backgroundColor: INK, borderRadius: 1 },

  rightBox: { borderColor: INK, borderWidth: 3 },
  wrong: { borderColor: SOFT, opacity: 0.45 },
});

export function Ethics17Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Ethics17Scene} band={[224, 512]} camera={CAM} />;
}
