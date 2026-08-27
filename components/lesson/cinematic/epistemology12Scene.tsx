import {
  View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import {
  WALK, clamp01, dirsFrom, ease01, lerp, moveTr, pose, travelStance, type Bundle, } from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './epistemology12Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, facing, useCarry, carry,
} from './cinematicKit';
import { followMoves, kindOf, seedOf } from './camera';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';

// THREE PIPES FEEDING ONE TANK labelled WHAT YOU KNOW. The pipes are laid one per
// beat and each fills its own band of the tank; the third — testimony, the one that
// runs in from off-stage entirely — fills almost all of it. Q2 is answered on the
// stage: a belief-token lands in the tank and the reader taps the pipe that brought
// it. Each pipe is TRACED BACK OUT of the tank toward its own nameplate, so it is
// attached to the tank from the first frame and the reader watches where it comes
// FROM, which is the whole claim about testimony.
//
// COMPOSITION / OCCLUSION —
//   · the FIGURE stands at x = 56 for the first two beats, then WALKS 68 units to
//     x = 124 and holds there. Measured off the rig at the pose each beat actually
//     holds (B9a, not the nominal ±36): the widest are 21 "weigh" and 33
//     "release-open" at x 92.5 … 155.5, and the walk itself spans x 40 … 146.
//     Crown y 397.2 standing, 394.0 at the top of the gait's bob.
//   · the TANK is x 252 … 378, y 268 … 490 on a plinth to 498 — 96 units of clear
//     paper between it and the widest the figure ever gets. The figure never
//     touches it, so nothing here has to sit in the reachable band.
//   · the PIPES run at y 227–241 (testimony), 289–303 (perception), 351–365
//     (memory), with vertical legs at x 152–166 (memory's bend, y 322–365) and
//     x 358–372 (testimony's drop, y 227–270). Every run is at least 29 units above
//     the walking crown and the memory leg clears the figure's widest x by 8, so no
//     pipe is drawn on the figure and the figure is drawn on no pipe.
//     Testimony's run starts at x −44 — outside the crop, which is how the picture
//     says "this one starts a long way from you", and it costs the band nothing
//     (the player crops to x 0 … 400).
//   · the three PLATES sit at each pipe's SOURCE end, so the pipe emerges from its
//     own nameplate and every unit of its run stays visible: testimony x 22 … 144
//     (228 units of run to its right, 22 of tail to its left, running off the
//     crop), perception x 80 … 202 (its whole 48-unit stub, 4 clear of the plate),
//     memory x 26 … 148 (the bend at 152 and 102 units of run, 4 clear). Tops
//     212 / 274 / 336, each 44 tall, so the lowest ends at y 380 — fourteen clear
//     of a walking crown. Their x DOES overlap the figure's; the separation that
//     matters here is the vertical one, measured above. They are laid out directly
//     in stage coordinates and there is no scene-wide camera at all, so a tap
//     target is exactly where its art is (E37b).
//   · the tank's fill bands are x 255 … 375: perception y 461–487 (26), memory
//     431–461 (30), testimony 317–431 (114). Testimony is 67% of everything in the
//     tank, which is the lesson in one rectangle.
//   · the tank label is x 236 … 352, y 246 … 262 — 5 below the testimony run, 6
//     left of its downpipe, and ABOVE the tank rather than inside it, because the
//     fill would eventually reach it. The Q2 token sits in the headspace the fill
//     deliberately never claims: x 259 … 371, y 276 … 312, five clear of the
//     testimony band's top at 317.
//
// DELIBERATE EXCEPTIONS (A5) —
//   · the tank is 222 units tall against a 103-unit figure. That is a realistic
//     cistern beside a person, and it has to be that tall for three bands whose
//     RATIO is the argument to read at all (D32).
//   · the testimony pipe passes over the figure's head. The figure is kept clear of
//     the pipes — 153 units below that run — but a pipe that crosses the whole
//     stage cannot avoid crossing above him, and that is the point of it.
//   · the figure WALKS once, 68 units, and gestures the rest of the lesson. Every
//     other mark he could take is under a pipe or against the tank, and a move
//     shorter than 60 units reads as a shuffle (C18) — so the choreography that
//     carries this lesson is the PICTURE's, not his: three pipes arriving and a
//     tank filling. He is the one thing on stage that does not change.

// ── the tank ─────────────────────────────────────────────────────────────────
const TANK_L = 252;
const TANK_R = 378;
const TANK_T = 268;
const TANK_B = 490;
const WALL = 3;
const IN_L = TANK_L + WALL;                 // 255
const IN_W = TANK_R - TANK_L - WALL * 2;    // 120
const IN_B = TANK_B - WALL;                 // 487

// The three bands, bottom-up. 26 + 30 + 114 = 170 of the 216 units of interior, so
// the tank never quite fills and the headspace stays clear for the Q2 token.
const H_PERC = 26;
const H_MEM = 30;
const H_TEST = 114;
const T_PERC = IN_B - H_PERC;               // 461
const T_MEM = T_PERC - H_MEM;               // 431
const T_TEST = T_MEM - H_TEST;              // 317

// ── the pipes ────────────────────────────────────────────────────────────────
const BORE = 14;                            // pipe thickness
const Y_TEST = 227;                         // top edge of each horizontal run
const Y_PERC = 289;
const Y_MEM = 351;

const TEST_L = -44;                         // off-stage: it begins with other people
const TEST_W = 372 - TEST_L;                // 416
const TEST_DN_L = 358;
const TEST_DN_H = 270 - Y_TEST;             // 43, down through the tank's top edge

const PERC_L = 206;                         // a stub, entering just beside the tank
const PERC_W = 254 - PERC_L;                // 48

const MEM_L = 152;                          // memory bends: up out of its own elbow
const MEM_W = 254 - MEM_L;                  // 102
const MEM_DN_T = 322;
const MEM_DN_H = Y_MEM + BORE - MEM_DN_T;   // 43

// How each pipe's two segments split the one growth value, by their lengths, so the
// pipe is drawn as one continuous line back from the tank and is never in two
// disconnected pieces mid-transition.
const TEST_SPLIT = 0.15;                    // the drop, then the long run
const MEM_SPLIT = 0.70;                     // the run, then the bend

// ── the answer plates ────────────────────────────────────────────────────────
// SIZED FOR A FINGER (E37b-2). The band is 306 units, so on a 360dp phone the fit
// is min(0.88, 296/306) = 0.88: a 44-unit plate is 38.7dp and the 62-unit PITCH is
// 54.6dp. Android asks 48dp of a target and a fingertip covers ~45dp, so the slop
// below — exactly half the 18-unit gutter, never more, or the neighbour overlaps
// and the topmost silently wins — makes each plate 62 units / 54.6dp of live height
// on 54.6dp centres. The pitch was authored first and the plate filled into it.
const PLATE_W = 122;
const PLATE_H = 44;
const PLATE_PITCH = 62;
/** Half the gap — more would overlap the neighbour, and the topmost would win. */
const PLATE_SLOP = (PLATE_PITCH - PLATE_H) / 2;

// Each plate is parked at its own pipe's SOURCE end and stops 4 units short of the
// pipe itself, so nothing is drawn on a border and every unit of every run stays
// visible. Testimony's is the exception and has to be: its run enters from beyond
// the crop, so the plate sits ON it, with 22 units of tail still running off the
// left edge to say the pipe carries on past the frame.
const SOURCES = [
  { id: 'test', label: 'TESTIMONY', left: 22, top: 212, correct: true },
  { id: 'perc', label: 'PERCEPTION', left: 80, top: 212 + PLATE_PITCH, correct: false },
  { id: 'mem', label: 'MEMORY', left: 26, top: 212 + PLATE_PITCH * 2, correct: false },
];
const [S_TEST, S_PERC, S_MEM] = SOURCES;

const P = BEATS.map((b) => b.p ?? 0);
const X = BEATS.map((b) => b.x ?? 124);
// The camera, from the staging: it follows the figure this track describes,
// pulls back to scale 1 on every graded beat so a tap lands where it is aimed,
// and leans in on the quote. See followMoves in ./camera.ts.
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('epistemology12'));
const DIR = dirsFrom(X, 1);
const PIPES = BEATS.map((b) => b.pipes ?? 0);
const TOK = BEATS.map((b) => b.token ?? 0);

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.lever ? 1 : 0));

export default function Epistemology12Scene({ clock, bt, bi, i, picked, onPick, dragPos }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldS = useHeld();
  const cv = useCarry(3);
  const cur = BEATS[i];

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / moveTr(X[p], X[n], 0.85));
    const t = clock.value;

    // ONE channel drives all three pipes. `pv` blends the previous beat's count into
    // this one's, so a pipe that is already laid simply HOLDS at 1 instead of
    // redrawing itself every time the reader taps forward (C20c / H58).
    // R7c — the lever's three stops ARE the three pipes, so it lays and lifts them:
    // one for the world reaching you directly, three for the world reaching somebody
    // else first. The route the reader picks is the route the tank is fed by.
    const pv = carry(cv, 0, n, PIPES[p], reacting ? 1 + dragPos.value * 2 : PIPES[n], tr);
    const perc = clamp01(pv);
    const mem = clamp01(pv - 1);
    const test = clamp01(pv - 2);

    const s = keepHeld(heldS, travelStance(
      X[p], X[n],
      carryFrom(heldS, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));
    return {
      fig: pose(s, carry(cv, 1, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1),
      perc,
      mem,
      test,
      // Each segment gets a smoothstepped slice of its pipe's value, so both ends of
      // every slice have zero velocity and the two segments never separate (C22e).
      memRun: ease01(clamp01(mem / MEM_SPLIT)),
      memDown: ease01(clamp01((mem - MEM_SPLIT) / (1 - MEM_SPLIT))),
      testDown: ease01(clamp01(test / TEST_SPLIT)),
      testRun: ease01(clamp01((test - TEST_SPLIT) / (1 - TEST_SPLIT))),
      token: carry(cv, 2, n, TOK[p], TOK[n], tr),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);

  // Every pipe is traced BACK OUT of the tank, so its tank end is fixed and its
  // source end travels away across the stage.
  const percRunS = useAnimatedStyle(() => ({ transform: [{ scaleX: SCENE.value.perc }] }));
  const memRunS = useAnimatedStyle(() => ({ transform: [{ scaleX: SCENE.value.memRun }] }));
  const memDownS = useAnimatedStyle(() => ({ transform: [{ scaleY: SCENE.value.memDown }] }));
  const testRunS = useAnimatedStyle(() => ({ transform: [{ scaleX: SCENE.value.testRun }] }));
  const testDownS = useAnimatedStyle(() => ({ transform: [{ scaleY: SCENE.value.testDown }] }));

  // Each band rises off the top of the one below it, so the levels stack.
  const bandPercS = useAnimatedStyle(() => ({ transform: [{ scaleY: SCENE.value.perc }] }));
  const bandMemS = useAnimatedStyle(() => ({ transform: [{ scaleY: SCENE.value.mem }] }));
  const bandTestS = useAnimatedStyle(() => ({ transform: [{ scaleY: SCENE.value.test }] }));

  const percFade = useAnimatedStyle(() => ({ opacity: SCENE.value.perc }));
  const memFade = useAnimatedStyle(() => ({ opacity: SCENE.value.mem }));
  const testFade = useAnimatedStyle(() => ({ opacity: SCENE.value.test }));
  const tokenStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.token,
    transform: [{ translateY: (1 - SCENE.value.token) * -12 }],
  }));

  const answered = picked !== null;
  const live = (cur.pick ?? 0) > 0 && !!cur.interact;

  return (
    <Animated.View style={styles.scene}>
      {/* ── the pipes, laid one per beat ─────────────────────────────────────── */}
      <Animated.View style={[styles.pipe, styles.testRun, testRunS]} pointerEvents="none" />
      <Animated.View style={[styles.pipe, styles.testDown, testDownS]} pointerEvents="none" />
      <Animated.View style={[styles.pipe, styles.memDown, memDownS]} pointerEvents="none" />
      <Animated.View style={[styles.pipe, styles.memRun, memRunS]} pointerEvents="none" />
      <Animated.View style={[styles.pipe, styles.percRun, percRunS]} pointerEvents="none" />

      {/* ── the tank ─────────────────────────────────────────────────────────── */}
      <Text style={styles.tankLabel} pointerEvents="none">WHAT YOU KNOW</Text>
      <View style={styles.tank} pointerEvents="none" />
      <View style={styles.plinth} pointerEvents="none" />

      {/* what has arrived so far, in three visible bands */}
      <Animated.View style={[styles.band, styles.bandTest, bandTestS]} pointerEvents="none" />
      <Animated.View style={[styles.band, styles.bandMem, bandMemS]} pointerEvents="none" />
      <Animated.View style={[styles.band, styles.bandPerc, bandPercS]} pointerEvents="none" />
      <Animated.Text style={[styles.bandLabelOn, styles.labTest, testFade]} pointerEvents="none">
        TESTIMONY
      </Animated.Text>
      <Animated.Text style={[styles.bandLabel, styles.labMem, memFade]} pointerEvents="none">
        MEMORY
      </Animated.Text>
      <Animated.Text style={[styles.bandLabel, styles.labPerc, percFade]} pointerEvents="none">
        PERCEPTION
      </Animated.Text>

      {/* the belief that drops into the tank on Q2 */}
      <Animated.View style={[styles.token, tokenStyle]} pointerEvents="none">
        <Text style={styles.tokenText}>THE GREAT WALL{'\n'}OF CHINA EXISTS</Text>
      </Animated.View>

      {/* ── the plates: each pipe's nameplate, and the Q2 tap targets ────────── */}
      {live ? (
        SOURCES.map((s) => {
          const chosen = picked === s.id;
          return (
            <Target id={s.id} correct={s.correct} picked={picked} onPick={onPick}
              key={s.id} style={[styles.plateBox, { left: s.left, top: s.top }]} hitSlop={{ top: PLATE_SLOP, bottom: PLATE_SLOP, left: PLATE_SLOP, right: PLATE_SLOP }} disabled={answered}>
              <View
                style={[
                  styles.plate,
                  answered && s.correct && styles.plateRight,
                  answered && chosen && !s.correct && styles.plateWrong,
                ]}
              >
                <Text style={[styles.plateText, answered && s.correct && styles.plateTextOn]}>
                  {s.label}
                </Text>
              </View>
            </Target>
          );
        })
      ) : (
        <>
          <Animated.View
            style={[styles.plateBox, { left: S_TEST.left, top: S_TEST.top }, testFade]}
            pointerEvents="none"
          >
            <View style={styles.plate}><Text style={styles.plateText}>{S_TEST.label}</Text></View>
          </Animated.View>
          <Animated.View
            style={[styles.plateBox, { left: S_PERC.left, top: S_PERC.top }, percFade]}
            pointerEvents="none"
          >
            <View style={styles.plate}><Text style={styles.plateText}>{S_PERC.label}</Text></View>
          </Animated.View>
          <Animated.View
            style={[styles.plateBox, { left: S_MEM.left, top: S_MEM.top }, memFade]}
            pointerEvents="none"
          >
            <View style={styles.plate}><Text style={styles.plateText}>{S_MEM.label}</Text></View>
          </Animated.View>
        </>
      )}

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },

  // ── pipes ───────────────────────────────────────────────────────────────────
  // Drawn as outlines with a paper bore, so a pipe reads as a pipe and its free end
  // reads as a mouth. At 14 units on a 2.11× fit the bore is ~25px of open paper
  // inside a ~4px stroke, which stays legible at the size it really renders (B16c).
  pipe: { position: 'absolute', borderWidth: 2, borderColor: INK, backgroundColor: PAPER },
  testRun: { left: TEST_L, top: Y_TEST, width: TEST_W, height: BORE, transformOrigin: '100% 50%' },
  testDown: { left: TEST_DN_L, top: Y_TEST, width: BORE, height: TEST_DN_H, transformOrigin: '50% 100%' },
  percRun: { left: PERC_L, top: Y_PERC, width: PERC_W, height: BORE, transformOrigin: '100% 50%' },
  memDown: { left: MEM_L, top: MEM_DN_T, width: BORE, height: MEM_DN_H, transformOrigin: '50% 100%' },
  memRun: { left: MEM_L, top: Y_MEM, width: MEM_W, height: BORE, transformOrigin: '100% 50%' },

  // ── the tank ────────────────────────────────────────────────────────────────
  tank: {
    position: 'absolute', left: TANK_L, top: TANK_T,
    width: TANK_R - TANK_L, height: TANK_B - TANK_T,
    borderWidth: WALL, borderColor: INK, borderRadius: 5, backgroundColor: PAPER,
  },
  plinth: {
    position: 'absolute', left: TANK_L - 8, top: TANK_B,
    width: TANK_R - TANK_L + 16, height: 8, backgroundColor: INK, borderRadius: 2,
  },
  tankLabel: {
    position: 'absolute', left: 236, top: 246, width: 116, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 9.5, letterSpacing: 1.5, color: SOFT,
    includeFontPadding: false,
  },

  // ── what has arrived, in three bands ────────────────────────────────────────
  band: { position: 'absolute', left: IN_L, width: IN_W, transformOrigin: '50% 100%' },
  bandPerc: { top: T_PERC, height: H_PERC, backgroundColor: RULE, borderTopWidth: 1.5, borderTopColor: INK },
  bandMem: { top: T_MEM, height: H_MEM, backgroundColor: RULE, borderTopWidth: 1.5, borderTopColor: INK },
  bandTest: { top: T_TEST, height: H_TEST, backgroundColor: INK },
  bandLabel: {
    position: 'absolute', left: IN_L, width: IN_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.1, color: INK,
    includeFontPadding: false,
  },
  bandLabelOn: {
    position: 'absolute', left: IN_L, width: IN_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 12.5, letterSpacing: 1.4, color: PAPER,
    includeFontPadding: false,
  },
  labTest: { top: 367 },
  labMem: { top: 441 },
  labPerc: { top: 470 },

  // ── the belief that lands on Q2 ─────────────────────────────────────────────
  token: {
    position: 'absolute', left: 259, top: 276, width: 112, height: 36,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: STONE,
    alignItems: 'center', justifyContent: 'center',
  },
  tokenText: {
    fontFamily: 'Inter_700Bold', fontSize: 9.5, lineHeight: 12, letterSpacing: 0.3,
    color: INK, textAlign: 'center', includeFontPadding: false,
  },

  // ── the plates ──────────────────────────────────────────────────────────────
  plateBox: { position: 'absolute', width: PLATE_W },
  plate: {
    height: PLATE_H, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: STONE,
    alignItems: 'center', justifyContent: 'center',
  },
  plateRight: { backgroundColor: INK, borderColor: INK },
  plateWrong: { borderColor: SOFT, opacity: 0.45 },
  plateText: {
    fontFamily: 'Inter_700Bold', fontSize: 13, letterSpacing: 0.8, color: INK,
    includeFontPadding: false,
  },
  plateTextOn: { color: PAPER },
});

// Art runs from the top plate (212) down to the tank's plinth (498), so the band is
// [206, 512] — 306 units, exactly the pack's median, fitting at about 2.11× instead
// of the letterboxed 1.15×. Nothing is drawn above 212; the testimony run's tail at
// x −44 is outside the crop horizontally, which costs the band nothing.
export function Epistemology12Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Epistemology12Scene} band={[206, 512]} camera={CAM} />;
}
