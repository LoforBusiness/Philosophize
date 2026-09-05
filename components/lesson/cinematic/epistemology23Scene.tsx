import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, clamp01, ease01, moveTr, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './epistemology23Script';
import {
  facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SHADE, SOFT, RULE, PAPER,
  useHeld, carryFrom, keepHeld, useCarry, carry, pickAt, lookPose,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target, { useAnswerRise } from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// A HOPPER, A MOUTH THAT OPENS, A MESH THAT TIGHTENS, AND A TRAY.
//
// ── WHAT WAS WRONG WITH THE FIRST BUILD, MEASURED ───────────────────────────
//
// A reader named this lesson: "a lot of the words are covered or the shading is
// bad, so you cannot quite clearly tell what is being said above the stickman …
// the visuals above the stickman are clunky and not like a game." Rendered beat
// by beat, all of it was there and none of it was visible to any check:
//
//   · THE CAPTIONS SAT INSIDE THE MACHINE. `THE MOUTH` was printed at MOUTH_Y−7
//     and the mouth's own rail runs at MOUTH_Y, so the rail crossed the word on
//     every beat of the lesson. `check:readable`'s STRIKE could not see it,
//     because that rule looks for something painted ON TOP of a word and the
//     caption was painted last. A word drawn over a line is still a word with a
//     line through it.
//   · THE FALLING CLAIMS LANDED ON THOSE CAPTIONS. Twelve ink discs came to rest
//     in a row along `THE MESH`.
//   · THE THREE ANSWER TARGETS WERE FULL-WIDTH BLANK BARS, stacked, each 203
//     units across and holding nothing — S11 exactly, three beats of a reader
//     being asked to choose between three empty rectangles that also covered the
//     labels of the parts they stood for.
//   · THE MACHINE WAS AN OUTLINE. Two 2-unit walls, nine ticks and two stubs on
//     bare paper: the diagram of a sieve rather than a sieve, which is §13's
//     cheese finding in another branch.
//   · IT STOPPED. `fall` went 0→1 on beat 1 and was pinned at 1 for the other
//     seven, so a machine whose first line is "claims arrive all day" ran once
//     and then froze for the rest of the lesson.
//
// ── THE COMPOSITION, IN NUMBERS (H56) ───────────────────────────────────────
//
// · the CHUTE is 208×26 at x 96…304, y 200…226 — STONE, ink rim, captioned
//   CLAIMS ARRIVING inside itself.
// · the THROAT is the sieve body, x 96…304, y 250…332, filled STONE with 3-unit
//   ink walls. Its interior is a TONE rather than paper so that an open mouth
//   reads as a way in, and so the ink claims have something to be seen against.
// · the MOUTH is two shutters closing in from either side at y 250: each is 104
//   wide at `mouth` 0 and 12 at 1, so the opening runs 0…184 units and THE
//   SETTING IS THE GEOMETRY rather than a label. Each carries a paper lit edge
//   along its top, so a plate reads as a plate.
// · the MESH is nine 2.5-unit uprights in a SHADE slot at y 292…316, spaced by
//   `mesh`: 24 apart when loose, 11 when tight — 24 because 8 gaps have to fit
//   the 202-unit interior, and at 40 the outer two bars stood outside the sieve. Nothing about the mesh moves the
//   shutters and nothing about the shutters moves the mesh, which is the claim
//   the whole scene exists to make.
// · the TRAY is 168×28 at x 116…284, y 346…374, and it FILLS: what survives the
//   mesh piles up in it.
// · THE THREE PART NAMES LIVE IN THE MARGIN, x 6…88, each on a hairline leader to
//   the part it names. That is the fix for the collisions above and it is also
//   what a labelled instrument looks like — nothing is printed across the
//   machine, so nothing can ever be printed across a word.
// · the CLAIMS are twelve 8-unit discs on a continuous loop off `clock`, each on
//   its own phase. Where each one STOPS is decided in the frame worklet from the
//   two settings, so a disc that is turned away is turned away AT the shutter and
//   a disc that is caught is caught AT the mesh.
// · the FIGURE walks x 200 → 132 → 268 on GROUND 500; crown ≈ 397, and the tray
//   ends at y 374, so 23 units stay clear at every stop. A claim falls 12 units
//   to a shutter, 62 to the mesh and 115 to the tray — every fall positive.
//
// Ink runs y 200 (the chute) … y 500. BAND 196…512 = 316, with the 103-unit
// figure at 33%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const CH_X = 96;
// THE CHUTE SITS HIGH ENOUGH THAT A CLAIM CAN ACTUALLY FALL. At the first
// numbers (bottom 240, mouth 248) the gap was 8 units and a disc is 8 tall, so a
// claim turned away by a shutter had to travel −3 units to reach its resting
// place: it drifted UP out of the chute. Every fall is positive now — 12 units to
// the shutter, 62 to the mesh, 115 to the tray — which is also what makes the
// three fates tell themselves apart at a glance.
const CH_Y = 200;
const CH_W = 208;
const CH_H = 26;

const SV_X = 96;
const SV_W = 208;
const WALL = 3;
const MOUTH_Y = 250;
const MESH_Y = 296;
const SLOT_Y = 292;
const SLOT_H = 24;
const SIEVE_BOT = 332;

const TRAY_X = 116;
const TRAY_Y = 346;
const TRAY_W = 168;
const TRAY_H = 28;

const DROPS = 12;
const DOT = 8;
/** Loops a second. Slow enough to follow one disc, quick enough to read as a flow. */
const RATE = 0.34;

const LAB_X = 6;
const LAB_W = 82;

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
//
// IT USED TO READ `field`, AND HAD READ IT SINCE THE PAD WAS RETIRED. A `field`
// was two axes and this scene took both — the pad WAS the sieve. When the pads
// became ballots the flag kept naming a control no script has, so `reacting` was
// permanently false and the machine sat still while the reader answered. It was
// invisible to `check:react`, whose test was whether the scene mentions
// `dragPos` — which it did, inside a branch that could never run.
const REACT = BEATS.map((b) => (b.interact?.poll ? 1 : 0));

// EACH OPTION IS A SETTING OF THE MACHINE, and the script's own header is where
// these came from — the four failure modes it lists, in the order the ballot
// declares them. `pickPos` is 0..1 across those options in the AUTHOR's order
// (never the shuffled row order), so the reader watches the mouth and the mesh
// travel to the character they are choosing.
//
//   shut   narrow mouth, coarse mesh  — hears little and believes it
//   crank  wide mouth,   coarse mesh  — all in, all kept
//   dogma  narrow mouth, fine mesh    — nothing gets a hearing
//   good   wide mouth,   fine mesh    — hears everything, keeps almost none
const POLL_MOUTH = [0.16, 0.94, 0.16, 0.94];
const POLL_MESH = [0.18, 0.18, 0.94, 0.94];

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('epistemology23'));

export default function Epistemology23Scene({ clock, bt, bi, i, picked, onPick, pickPos, gazeX, gazeY, gazeOn }: SceneApi) {
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
      fig: lookPose(figS, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1, gazeX.value, gazeY.value, gazeOn.value),
      sieve: carry(cv, 1, n, SIEVE[p], SIEVE[n], tr),
      // The mouth decides what gets a hearing…
      mouth: carry(cv, 2, n, MOUTH[p], reacting ? pickAt(POLL_MOUTH, pickPos.value) : MOUTH[n], tr),
      // …and the mesh decides what survives it. Two settings, one machine, and on
      // the graded beat the reader moves both at once by naming a character.
      mesh: carry(cv, 3, n, MESH[p], reacting ? pickAt(POLL_MESH, pickPos.value) : MESH[n], tr),
      fall: carry(cv, 4, n, FALL[p], FALL[n], tr),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const allStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.sieve }));
  const lShut = useAnimatedStyle(() => ({ width: 12 + 92 * (1 - SCENE.value.mouth) }));
  const rShut = useAnimatedStyle(() => ({ width: 12 + 92 * (1 - SCENE.value.mouth) }));

  // WHAT IS IN THE TRAY. A claim survives when it is inside the mouth AND past
  // the mesh, so the pile is the product of the two settings — which is the
  // lesson's own arithmetic, drawn.
  const pile = useAnimatedStyle(() => {
    const through = SCENE.value.mouth * (1 - SCENE.value.mesh * 0.82);
    return { height: (TRAY_H - 7) * clamp01(through) * SCENE.value.fall };
  });

  const bars: number[] = [];
  for (let k = 0; k < 9; k += 1) bars.push(k);
  const drops: number[] = [];
  for (let k = 0; k < DROPS; k += 1) drops.push(k);

  // THE MESH IS THE ANSWER, so the bars and their caption rise together (E39).
  const meshRise = useAnswerRise(picked, 'mesh', true);

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />

      <Animated.View style={[StyleSheet.absoluteFill, allStyle]} pointerEvents="none">
        {/* THE CHUTE. Filled and rimmed, with its own name inside it — a caption
            that lives in the object it names can never be printed across a
            neighbour, which is the whole reason the two part labels moved out to
            the margin below. */}
        <View style={styles.chute} />
        <View style={styles.chuteLip} />
        <Text style={styles.chuteText}>CLAIMS ARRIVING</Text>

        {/* THE THROAT — a filled body, not two hairlines. The interior is a tone
            so the opening reads as a way IN and the ink claims have a ground. */}
        <View style={styles.throat} />
        <View style={styles.wallL} />
        <View style={styles.wallR} />
        <View style={styles.slot} />
      </Animated.View>

      {drops.map((k) => <Drop key={k} S={SCENE} index={k} />)}

      <Animated.View style={[StyleSheet.absoluteFill, allStyle]} pointerEvents="none">
        {/* THE TRAY, AND WHAT HAS COLLECTED IN IT. */}
        <View style={styles.tray} />
        <Animated.View style={[styles.pile, pile]} />
        <Text style={styles.trayText}>WHAT YOU BELIEVE</Text>
      </Animated.View>

      {/* THE MOUTH — two shutters over the throat, each with a lit top edge so a
          plate reads as a plate rather than as a bar. */}
      <Animated.View style={[StyleSheet.absoluteFill, allStyle]} pointerEvents="none">
        <Animated.View style={[styles.shutter, { left: SV_X }, lShut]}>
          <View style={styles.shutterLit} />
        </Animated.View>
        <Animated.View style={[styles.shutterR, rShut]}>
          <View style={styles.shutterLit} />
        </Animated.View>

        <Animated.View style={meshRise} pointerEvents="none">
          {bars.map((k) => <MeshBar key={k} S={SCENE} index={k} />)}
        </Animated.View>
      </Animated.View>

      {/* ── THE THREE PARTS, EACH A TARGET THAT CONTAINS ITS OWN NAME ──────────
          The old build offered three identical full-width blank bars and printed
          the part names underneath them, inside the machine. Now the label IS the
          target's content (S11: a thing and the word for it ride together), it
          sits in the margin where nothing else is drawn, and a hairline leader
          runs from it to the part — so the reader can see what they are choosing
          between before they choose. */}
      <PartTarget
        id="mouth" correct={false} picked={picked} live={live} answered={answered} onPick={onPick}
        top={MOUTH_Y - 11} height={26} label="THE MOUTH"
      />
      <PartTarget
        id="mesh" correct picked={picked} live={live} answered={answered} onPick={onPick}
        top={SLOT_Y - 3} height={30} label="THE MESH"
      />
      <PartTarget
        id="tray" correct={false} picked={picked} live={live} answered={answered} onPick={onPick}
        top={TRAY_Y - 1} height={TRAY_H + 2} label="THE TRAY"
      />

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

/**
 * One part of the machine, named in the margin and joined to itself by a leader.
 *
 * The Target wraps the LABEL rather than a bare strip of the stage, so the box
 * the reader is asked to press is never empty, and the leader is what says which
 * part of the machine that name belongs to.
 */
function PartTarget({ id, correct, picked, live, answered, onPick, top, height, label }: {
  id: string; correct: boolean; picked: string | null; live: boolean; answered: boolean;
  onPick: (id: string, ok: boolean) => void; top: number; height: number; label: string;
}) {
  const chosen = answered && picked === id;
  return (
    <>
      <View style={[styles.leader, { top: top + height / 2 }]} pointerEvents="none" />
      <Target
        id={id} correct={correct} picked={picked} onPick={onPick}
        disabled={!live || answered}
        style={[styles.hit, { top, height }]}
      >
        <View
          style={[
            styles.hitBox,
            { height },
            answered && correct && styles.right,
            chosen && !correct && styles.wrong,
          ]}
          pointerEvents="none"
        >
          <Text style={styles.partCap} numberOfLines={2}>{label}</Text>
        </View>
      </Target>
    </>
  );
}

/** One upright of the mesh. Tighter spacing is a finer sieve. */
function MeshBar({ S, index }: { S: { value: { mesh: number } }; index: number }) {
  const st = useAnimatedStyle(() => {
    // THE SPAN HAS TO FIT INSIDE THE THROAT. Nine bars at the loose 40 spanned
    // 320 units against an interior of 202, so the two outermost sat outside the
    // sieve entirely — a mesh with bars floating in the paper beside it. The
    // widest legal gap is (SV_W - 2*WALL) / 8.
    const gap = 24 - 13 * S.value.mesh;
    return { left: 200 + (index - 4) * gap - 1.25 };
  });
  return <Animated.View pointerEvents="none" style={[styles.meshBar, st]} />;
}

/**
 * One claim, on a loop.
 *
 * IT KEEPS ARRIVING, and that is the fix for the biggest thing wrong with the
 * first build: `fall` moved 0→1 once and stayed there, so a machine introduced
 * with "claims arrive all day" delivered twelve of them and then held perfectly
 * still for six beats. Each disc now runs its own phase off the monotonic clock,
 * so the flow never stops and the reader can watch one claim's fate rather than
 * a frozen row of dots.
 *
 * Where it STOPS is decided in the frame from the two settings: outside the
 * mouth it is turned away AT the shutter, caught by the mesh it stops AT the
 * mesh, and only what passes both reaches the tray. A claim that faded out in
 * mid-air would be a picture of nothing happening.
 */
function Drop({ S, index }: { S: { value: { mouth: number; mesh: number; fall: number; t: number } }; index: number }) {
  // Spread across the chute, deterministic and even, and each on its own phase so
  // the twelve read as a stream rather than as a rank.
  const at = (index + 0.5) / DROPS;
  const x = CH_X + 10 + at * (CH_W - 20);
  const phase0 = index / DROPS;
  const st = useAnimatedStyle(() => {
    const half = (6 + 178 * S.value.mouth) / 2;
    const insideMouth = Math.abs(x - 200) < half;
    // Which discs pass is fixed by their own index, so nothing flickers between
    // frames as the mesh tightens.
    const passes = insideMouth && at > S.value.mesh * 0.82;
    // Turned away, it comes to rest ON the shutter; caught, ON the mesh; and one
    // that survives both drops IN at the tray's rim rather than into the middle
    // of the tray — the caption lives there, and a claim landing on a word is the
    // exact fault this rebuild is about.
    const to = !insideMouth ? MOUTH_Y - 4 - DOT : passes ? TRAY_Y - DOT + 3 : MESH_Y - DOT;

    const ph = (S.value.t * RATE + phase0) % 1;
    const from = CH_Y + CH_H;
    // The last fifth of the phase is the claim resting where it ended up, so a
    // disc that has been turned away is visibly sitting on the shutter.
    const travel = ph < 0.8 ? ph / 0.8 : 1;
    const rest = ph < 0.8 ? 0 : (ph - 0.8) / 0.2;
    return {
      opacity: S.value.fall * (ph < 0.06 ? ph / 0.06 : rest > 0.6 ? 1 - (rest - 0.6) / 0.4 : 1),
      transform: [{ translateY: (to - from) * clamp01(travel) }],
    };
  });
  return <Animated.View pointerEvents="none" style={[styles.drop, { left: x - DOT / 2, top: CH_Y + CH_H }, st]} />;
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON. A rule on its own leaves the
  // figure and everything it is looking at standing on bare page;
  // political7 and political8 both stand their subject on a filled mass.
  floor: { position: 'absolute', left: 0, right: 0, top: GROUND, bottom: 0, backgroundColor: RULE },

  chute: {
    position: 'absolute', left: CH_X, top: CH_Y, width: CH_W, height: CH_H,
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: STONE,
  },
  /** The shadow the lip throws inside the chute — one View, and it becomes a box. */
  chuteLip: {
    position: 'absolute', left: CH_X + 2, top: CH_Y + CH_H - 8, width: CH_W - 4, height: 6,
    backgroundColor: SHADE,
  },
  chuteText: {
    position: 'absolute', left: CH_X, top: CH_Y + 8, width: CH_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 0.9, color: INK, includeFontPadding: false,
  },

  throat: {
    position: 'absolute', left: SV_X, top: MOUTH_Y, width: SV_W, height: SIEVE_BOT - MOUTH_Y,
    backgroundColor: STONE,
  },
  wallL: { position: 'absolute', left: SV_X, top: MOUTH_Y, width: WALL, height: SIEVE_BOT - MOUTH_Y, backgroundColor: INK },
  wallR: { position: 'absolute', left: SV_X + SV_W - WALL, top: MOUTH_Y, width: WALL, height: SIEVE_BOT - MOUTH_Y, backgroundColor: INK },
  /** The recess the mesh sits in, so the bars read as mounted in a frame. */
  slot: {
    position: 'absolute', left: SV_X + WALL, top: SLOT_Y, width: SV_W - WALL * 2, height: SLOT_H,
    backgroundColor: SHADE,
  },

  shutter: { position: 'absolute', top: MOUTH_Y - 4, height: 10, backgroundColor: INK, borderRadius: 2 },
  shutterR: { position: 'absolute', right: STAGE_W - SV_X - SV_W, top: MOUTH_Y - 4, height: 10, backgroundColor: INK, borderRadius: 2 },
  /** One light, top-left, and it never moves (§19) — so a plate has a lit edge. */
  shutterLit: { position: 'absolute', left: 2, right: 2, top: 1, height: 1.5, backgroundColor: PAPER, opacity: 0.55 },

  meshBar: { position: 'absolute', top: MESH_Y, width: 2.5, height: 18, backgroundColor: INK },

  drop: { position: 'absolute', width: DOT, height: DOT, borderRadius: DOT / 2, backgroundColor: INK },

  tray: {
    position: 'absolute', left: TRAY_X, top: TRAY_Y, width: TRAY_W, height: TRAY_H,
    borderWidth: 2.5, borderColor: INK, borderRadius: 3, backgroundColor: STONE,
  },
  /** What survived, standing in the tray — anchored to its floor so it grows UP. */
  pile: {
    position: 'absolute', left: TRAY_X + 4, width: TRAY_W - 8,
    bottom: STAGE_H - (TRAY_Y + TRAY_H) + 3.5, backgroundColor: INK, opacity: 0.82, borderRadius: 1,
  },
  trayText: {
    position: 'absolute', left: TRAY_X, top: TRAY_Y + 9, width: TRAY_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 0.9, color: INK, includeFontPadding: false,
  },

  // ── THE MARGIN, WHICH IS WHERE EVERY PART NAME NOW LIVES ────────────────────
  // Nothing else is drawn left of x 96, so a label here cannot be crossed by a
  // rail, covered by a shutter or landed on by a claim — all three of which
  // happened when these sat inside the machine.
  leader: { position: 'absolute', left: LAB_X + LAB_W + 3, width: SV_X - LAB_X - LAB_W - 3, height: 1, backgroundColor: RULE },
  hit: { position: 'absolute', left: LAB_X, width: LAB_W },
  hitBox: { width: LAB_W, borderRadius: 4, justifyContent: 'center', paddingHorizontal: 3 },
  partCap: {
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 0.7, color: SOFT,
    textAlign: 'right', includeFontPadding: false,
  },
  right: { borderWidth: 2.5, borderColor: INK },
  wrong: { borderWidth: 1.5, borderColor: SOFT, borderStyle: 'dashed' },
});

export function Epistemology23Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Epistemology23Scene} band={[196, 512]} camera={CAM} />;
}
