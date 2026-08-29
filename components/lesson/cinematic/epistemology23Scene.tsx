import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, clamp01, ease01, moveTr, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './epistemology23Script';
import {
  facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER,
  useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target, { useAnswerRise } from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// A HOPPER, A MOUTH THAT OPENS, A MESH THAT TIGHTENS, AND A TRAY.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the HOPPER is a 160×28 box at x 120…280, y 214…242, captioned CLAIMS ARRIVING.
// · the SIEVE body runs y 254…322, x 100…300. Its MOUTH is two shutters that
//   close in from either side at y 254: each is 100 wide at `mouth` 0 and 10 wide
//   at 1, so the opening is 20…200 units and the SETTING IS THE GEOMETRY rather
//   than a label.
// · the MESH is nine 2-thick uprights across y 292…306, spaced by `mesh`: 42
//   apart when loose and 12 apart when tight. Nothing about the mesh moves the
//   shutters and nothing about the shutters moves the mesh, which is the claim
//   the whole scene exists to make.
// · the TRAY is a 160×24 box at x 120…280, y 338…362 — WHAT YOU BELIEVE.
// · the CLAIMS are twelve 8px discs. They fall from the hopper on `fall`; how far
//   each gets is decided in the frame worklet from the two settings, so a disc
//   that is stopped is stopped AT the mesh and not faded out above it.
// · the FIGURE walks x 200 → 132 → 268 on GROUND 500; crown ≈ 397, and the tray
//   ends at y 362, so 35 units stay clear at every stop.
//
// Ink runs y 214 (the hopper) … y 500. BAND 208…512 = 304, with the 103-unit
// figure at 34%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const HOP_X = 120;
const HOP_Y = 214;
const HOP_W = 160;
const HOP_H = 28;

const SIEVE_X = 100;
const SIEVE_W = 200;
const MOUTH_Y = 254;
const MESH_Y = 292;
const SIEVE_BOT = 322;

const TRAY_X = 120;
const TRAY_Y = 338;
const TRAY_W = 160;
const TRAY_H = 24;

const DROPS = 12;
const DOT = 8;

const FIG_X = 200;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along:
// +1 where it rises, -1 where it falls, and HOLD while he stands still, so a
// figure who walks left to something keeps facing it while he talks about it.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const SIEVE = BEATS.map((b) => b.sieve ?? 0);
const MOUTH = BEATS.map((b) => b.mouth ?? 0);
const MESH = BEATS.map((b) => b.mesh ?? 0);
const FALL = BEATS.map((b) => b.fall ?? 0);
const LIVE = BEATS.map((b) => b.live ?? 0);

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.field ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('epistemology23'));

export default function Epistemology23Scene({ clock, bt, bi, i, picked, onPick, dragPos, dragPos2 }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldFig = useHeld();
  const cv = useCarry(5);
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
      fig: pose(figS, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1),
      sieve: carry(cv, 1, n, SIEVE[p], SIEVE[n], tr),
      // R7b — the pad IS the sieve. Across, the mouth of the hopper opens: the
      // further right, the more it hears.
      mouth: carry(cv, 2, n, MOUTH[p], reacting ? dragPos.value : MOUTH[n], tr),
      // And up, the mesh tightens: the higher the token, the harder it checks. Two
      // axes, two parts of one machine, and the reader builds it.
      mesh: carry(cv, 3, n, MESH[p], reacting ? dragPos2.value : MESH[n], tr),
      fall: carry(cv, 4, n, FALL[p], FALL[n], tr),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const allStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.sieve }));
  const lShut = useAnimatedStyle(() => ({ width: 10 + 90 * (1 - SCENE.value.mouth) }));
  const rShut = useAnimatedStyle(() => ({ width: 10 + 90 * (1 - SCENE.value.mouth) }));

  const bars: number[] = [];
  for (let k = 0; k < 9; k += 1) bars.push(k);
  const drops: number[] = [];
  for (let k = 0; k < DROPS; k += 1) drops.push(k);

  // THE MESH IS THE ANSWER, so the bars and their caption rise together (E39).
  const meshRise = useAnswerRise(picked, 'mesh', true);

  return (
    <View style={styles.scene}>
      <Animated.View style={[StyleSheet.absoluteFill, allStyle]} pointerEvents="none">
        <View style={styles.hopper} />
        <Text style={styles.hopText}>CLAIMS ARRIVING</Text>

        <View style={styles.wallL} />
        <View style={styles.wallR} />
        <View style={styles.tray} />
        <Text style={styles.trayText}>WHAT YOU BELIEVE</Text>
      </Animated.View>

      {drops.map((k) => <Drop key={k} S={SCENE} index={k} />)}

      {/* THE MOUTH — two shutters, so the opening is a real width. */}
      <Animated.View style={[StyleSheet.absoluteFill, allStyle]} pointerEvents="none">
        <Animated.View style={[styles.shutter, { left: SIEVE_X }, lShut]} />
        <Animated.View style={[styles.shutterR, rShut]} />
        <Text style={[styles.partCap, { top: MOUTH_Y - 7 }]}>THE MOUTH</Text>

        <Animated.View style={meshRise} pointerEvents="none">
          {bars.map((k) => <MeshBar key={k} S={SCENE} index={k} />)}
          <Text style={[styles.partCap, { top: MESH_Y + 18 }]}>THE MESH</Text>
        </Animated.View>
      </Animated.View>

      <Target
        id="mouth" correct={false} picked={picked} onPick={onPick}
        disabled={!live || answered} style={[styles.hit, { top: MOUTH_Y - 8, height: 26 }]}
      >
        <View style={[styles.hitBox, { height: 26 }, answered && picked === 'mouth' && styles.wrong]} pointerEvents="none" />
      </Target>
      <Target
        id="mesh" correct picked={picked} onPick={onPick}
        disabled={!live || answered} style={[styles.hit, { top: MESH_Y - 6, height: 30 }]}
      >
        <View style={[styles.hitBox, { height: 30 }, answered && styles.right]} pointerEvents="none" />
      </Target>
      <Target
        id="tray" correct={false} picked={picked} onPick={onPick}
        disabled={!live || answered} style={[styles.hit, { top: TRAY_Y, height: TRAY_H }]}
      >
        <View style={[styles.hitBox, { height: TRAY_H }, answered && picked === 'tray' && styles.wrong]} pointerEvents="none" />
      </Target>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

/** One upright of the mesh. Tighter spacing is a finer sieve. */
function MeshBar({ S, index }: { S: { value: { mesh: number } }; index: number }) {
  const st = useAnimatedStyle(() => {
    const gap = 42 - 30 * S.value.mesh;
    return { left: 200 + (index - 4) * gap - 1 };
  });
  return <Animated.View pointerEvents="none" style={[styles.meshBar, st]} />;
}

/**
 * One claim. How far it falls is decided from the two settings in the frame:
 * outside the mouth it never enters, and caught by the mesh it stops AT the mesh
 * rather than fading — a claim that vanished in mid-air would be a picture of
 * nothing happening.
 */
function Drop({ S, index }: { S: { value: { mouth: number; mesh: number; fall: number } }; index: number }) {
  // Spread across the hopper's width, deterministic and even.
  const at = (index + 0.5) / DROPS;
  const x = HOP_X + 6 + at * (HOP_W - 12);
  const st = useAnimatedStyle(() => {
    const half = (10 + 190 * S.value.mouth) / 2;
    const insideMouth = Math.abs(x - 200) < half;
    // A finer mesh lets a smaller fraction through, and which discs pass is
    // fixed by their own index so nothing flickers between frames.
    const passes = insideMouth && at > S.value.mesh * 0.82;
    const to = !insideMouth ? MOUTH_Y - 10 : passes ? TRAY_Y - DOT : MESH_Y - DOT;
    return {
      opacity: S.value.fall,
      transform: [{ translateY: (to - HOP_Y - HOP_H) * clamp01(S.value.fall) }],
    };
  });
  return <Animated.View pointerEvents="none" style={[styles.drop, { left: x - DOT / 2, top: HOP_Y + HOP_H }, st]} />;
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON. A rule on its own leaves the
  // figure and everything it is looking at standing on bare page;
  // political7 and political8 both stand their subject on a filled mass.
  floor: { position: 'absolute', left: 0, right: 0, top: GROUND, bottom: 0, backgroundColor: RULE },

  hopper: {
    position: 'absolute', left: HOP_X, top: HOP_Y, width: HOP_W, height: HOP_H,
    borderWidth: 1.5, borderColor: SOFT, borderRadius: 3, backgroundColor: STONE,
  },
  hopText: {
    position: 'absolute', left: HOP_X, top: HOP_Y + 10, width: HOP_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.9, color: INK, includeFontPadding: false,
  },

  wallL: { position: 'absolute', left: SIEVE_X, top: MOUTH_Y, width: 2, height: SIEVE_BOT - MOUTH_Y, backgroundColor: INK },
  wallR: { position: 'absolute', left: SIEVE_X + SIEVE_W - 2, top: MOUTH_Y, width: 2, height: SIEVE_BOT - MOUTH_Y, backgroundColor: INK },

  shutter: { position: 'absolute', top: MOUTH_Y - 3, height: 6, backgroundColor: INK, borderRadius: 3 },
  shutterR: { position: 'absolute', right: 100, top: MOUTH_Y - 3, height: 6, backgroundColor: INK, borderRadius: 3 },
  meshBar: { position: 'absolute', top: MESH_Y, width: 2, height: 14, backgroundColor: INK },
  partCap: {
    position: 'absolute', left: SIEVE_X, width: SIEVE_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.9, color: SOFT, includeFontPadding: false,
  },

  drop: { position: 'absolute', width: DOT, height: DOT, borderRadius: DOT / 2, backgroundColor: INK },

  tray: {
    position: 'absolute', left: TRAY_X, top: TRAY_Y, width: TRAY_W, height: TRAY_H,
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: STONE,
  },
  trayText: {
    position: 'absolute', left: TRAY_X, top: TRAY_Y + 8, width: TRAY_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.9, color: INK, includeFontPadding: false,
  },

  hit: { position: 'absolute', left: SIEVE_X - 4, width: SIEVE_W + 8 },
  hitBox: { width: SIEVE_W + 8, borderRadius: 4 },
  right: { borderWidth: 3, borderColor: INK },
  wrong: { borderWidth: 1.5, borderColor: SOFT, borderStyle: 'dashed' },
});

export function Epistemology23Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Epistemology23Scene} band={[208, 512]} camera={CAM} />;
}
