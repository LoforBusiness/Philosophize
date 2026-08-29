import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import {
  clamp01, ease01, lerp, mixStance, pose, type Bundle,
} from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './metaphysics31Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER, STONE, SHADE,
  useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// THREE NESTED ANSWERS. The slab, the ring drawn round the big hole, and the empty
// middle of that ring are three targets drawn INSIDE ONE ANOTHER, so the reader picks
// between them by tapping the rim or the centre of the same hole (E33). No row of
// cards can put that distinction; the picture can put it directly.
//
// · the slab is x 96…356, y 364…500 — it stands ON the ground line. Five RULE hatch
//   lines inside it at 22-unit pitch.
// · the big hole is centred (270, 432): an outer disc r 48 (the RIM target) and an
//   inner disc r 28 (the GAP target) drawn on top of it. The band between them is
//   the lining, and filling it INK is the correct-answer state (H61). It is 20 units
//   wide because that is 46dp at this lesson's 2.31 fit — at r 44 the ring came out
//   at 37dp, under the floor, and the ring is the CORRECT answer (E37b-2).
// · two plain holes at (140, 396) r 17 and (186, 394) r 12, so the count is three.
//   Only the big one is drawn with a visible lining band — it is the one under the
//   microscope, and three of them would be fussy at this size (A5).
// · the tally is at x 164…194, y 338…352, beside the kicker at x 96…156.
// · the RIM chip sits above the slab at x 236…306, y 336…356, with a 2-unit leader
//   running down to the top of the hole at y 384. The CHEESE chip is inside the
//   slab's empty bottom-left at x 106…198, y 464…488, clear of both small holes.
// · the figure is at x 46 facing right; its widest ink is a fist at x 79, seventeen
//   clear of the slab.
//
// ANSWERING RUNS THE ARGUMENT: `qv` fades the slab to 0.14 once the reader picks, and
// the three rings stay behind at full ink. What you counted is still there when the
// cheese is gone (H64).

// ── THE BLOCK ───────────────────────────────────────────────────────────────
// Front face and a skewed top face, standing on the ground line. The top face is
// SHORT (22 against 118) on purpose: a deep one reads as looking down into a box,
// and this is meant to be a block on a board at eye height.
const CH_L = 92;
const CH_W = 256;
const FACE_T = 380;
const FACE_H = 120;                 // 380 → 500, standing on GROUND
const TOP_H = 24;
const TOP_SKEW = '-28deg';
// The skew leans the top face right by h·tan(28°) ≈ 12.8, so it is drawn back by
// half that to keep the block centred over its own base.
const TOP_L = CH_L + 7;

const RIND_H = 7;                   // the darker band along the top of the face

// ── THE HOLES ───────────────────────────────────────────────────────────────
// Three, unevenly placed and unevenly sized, which is what makes it cheese
// rather than a punch-card. The big one is the one under the microscope: it is
// the only one drawn with a visible RIM band, because three of those at this
// size would be fussy (A5).
const BIG_CX = 268;
const BIG_CY = 448;                 // clear of the rind at 389 and the foot at 500
const BIG_R = 42;                   // the outer edge of the ring of cheese
const GAP_R = 25;                   // the empty middle
// 17 units of cheese between them. The ring is the CORRECT answer, so it has to
// be plainly a thing — it takes the lit tone the top face uses, edged in ink on
// both sides, and reads as a bit of cheese bent round the gap.

const SMALL = [
  { cx: 146, cy: 424, r: 16 },
  { cx: 196, cy: 470, r: 10 },
];

// ── THE THREE ANSWERS ───────────────────────────────────────────────────────
// One row of identical tabs, each on a leader to its own referent. Three tabs,
// three answers, and nothing else on the stage is tappable.
const TAB_H = 24;
const TAB_CHEESE = { left: 70, top: 336, width: 86 };
const TAB_RIM = { left: 196, top: 336, width: 62 };
const TAB_GAP = { left: 276, top: 336, width: 62 };

const KICK_T = 306;
const TICK_X = 160;
const TICK_T = 308;

const FIG_X = 46;

const G = BEATS.map((b) => b.g ?? 0);
const HOLES = BEATS.map((b) => b.holes ?? 0);
const TICKS = BEATS.map((b) => b.ticks ?? 0);
const CHIPS = BEATS.map((b) => b.chips ?? 0);

// THE CAMERA (H60b). `followMoves` reads the x track and gives each beat its own
// shot: it FOLLOWS him when a beat moves him far enough to be worth following,
// pushes close on a quote, and PULLS BACK to the whole band on a question or a
// summary — the beats the reader has to read and act on. Beats that do not set
// `x` stand at FIG_X, so a still lesson gets the one-in-three push rather than a
// camera that never rests.
const X = BEATS.map((b) => b.x ?? FIG_X);

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.drag ? 1 : 0));
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('metaphysics31'));

export default function Metaphysics31Scene({ clock, bt, bi, qv, i, picked, onPick, dragPos }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldS = useHeld();
  const cv = useCarry(3);
  const cur = BEATS[i];
  const revealing = (cur.pick ?? 0) > 0;

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.7);      // nobody walks; this is a pose blend
    const t = clock.value;
    const grow = ease01(bt.value / 0.9);
    const s = keepHeld(heldS, mixStance(carryFrom(heldS, n, emoteHold(G[p], t)), emoteLive(G[n], t, bt.value), tr));
    return {
      fig: pose(s, FIG_X, GROUND, K_FIG, 1, 1),
      // R7b — the knob opens the holes. The further the reader drags toward NEVER,
      // NOT ONCE, the more plainly the absences are there to be counted, which is the
      // thing paraphrase keeps failing to talk away.
      holes: carry(cv, 0, n, HOLES[p], reacting ? dragPos.value : HOLES[n], grow),
      ticks: carry(cv, 1, n, TICKS[p], TICKS[n], grow),
      chips: carry(cv, 2, n, CHIPS[p], CHIPS[n], grow),
      // The reveal rides the ANSWER, not the beat: the cheese dissolves as the
      // explanation appears, so the picture makes the point at the same moment
      // the words do.
      fade: revealing ? 1 - 0.86 * qv.value : 1,
    };
  });

  const D = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const slabStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.fade }));
  const chipStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.chips,
    transform: [{ translateY: (1 - SCENE.value.chips) * -6 }],
  }));
  const bigStyle = useAnimatedStyle(() => {
    const a = clamp01(SCENE.value.holes * 3 - 2);
    return { opacity: a, transform: [{ scale: 0.4 + 0.6 * a }] };
  });

  const answered = picked !== null;
  const live = (cur.pick ?? 0) > 0 && !!cur.interact;
  const rimOn = answered;                                    // the rim is the answer
  const wrong = (id: string) => answered && picked === id;

  return (
    <Animated.View style={styles.scene}>
      {/* THE BLOCK. It dissolves once the question is answered, and the rings
          stay behind at full ink — what you counted is still there when the
          cheese is gone (H64). */}
      <Animated.View style={slabStyle} pointerEvents="none">
        <View style={styles.topFace} />
        <View style={styles.face} />
        <View style={styles.rind} />
      </Animated.View>

      {/* the two plain holes */}
      {SMALL.map((h, k) => (
        <Hole key={k} index={k} cx={h.cx} cy={h.cy} r={h.r} SCENE={SCENE} />
      ))}

      {/* THE BIG HOLE — a ring of cheese around an empty middle, drawn one
          inside the other. It is the PICTURE of the distinction; the tabs below
          are how the reader answers it. */}
      <Animated.View style={[styles.bigWrap, bigStyle]} pointerEvents="none">
        {/* This one STAYS. The cavity is the thing the wrong answer names and it
            is drawn outside every Target, so no reaction reaches it. */}
        <View style={[styles.gapCavity, wrong('gap') && styles.dim]}>
          <View style={[styles.cavityLit, { borderRadius: GAP_R }]} />
        </View>
        <View style={[styles.rimBand, rimOn && styles.rimPicked]} />
        <View style={styles.rimEdge} />
      </Animated.View>

      {/* the count */}
      <Text style={styles.kicker} numberOfLines={1}>COUNTING</Text>
      {[0, 1, 2].map((j) => (
        <Tick key={j} j={j} SCENE={SCENE} />
      ))}

      {/* the three leaders, each running from a tab to what it names */}
      <Animated.View style={[styles.leadCheese, chipStyle]} pointerEvents="none" />
      <Animated.View style={[styles.leadRim, chipStyle]} pointerEvents="none" />
      <Animated.View style={[styles.leadGapDown, chipStyle]} pointerEvents="none" />
      <Animated.View style={[styles.leadGapIn, chipStyle]} pointerEvents="none" />

      <Animated.View style={[styles.tab, TAB_CHEESE, chipStyle]}>
        <Target id={'cheese'} correct={false} picked={picked} onPick={onPick}
          style={styles.fill}
          disabled={!live || answered}
        >
          {/* No dim here: this tab is INSIDE a Target, which already fades the
              reader's own miss to 0.5 and stamps it. A second 0.4 lands it at 0.20. */}
          <View style={styles.tabInner}>
            <Text style={styles.tabText} numberOfLines={1}>THE CHEESE</Text>
          </View>
        </Target>
      </Animated.View>

      <Animated.View style={[styles.tab, TAB_RIM, chipStyle]}>
        <Target id={'rim'} correct={true} picked={picked} onPick={onPick}
          style={styles.fill}
          disabled={!live || answered}
        >
          <View style={[styles.tabInner, rimOn && styles.tabPicked]}>
            <Text style={[styles.tabText, rimOn && styles.onInk]} numberOfLines={1}>THE RIM</Text>
          </View>
        </Target>
      </Animated.View>

      <Animated.View style={[styles.tab, TAB_GAP, chipStyle]}>
        <Target id={'gap'} correct={false} picked={picked} onPick={onPick}
          style={styles.fill}
          disabled={!live || answered}
        >
          {/* No dim here: this tab is INSIDE a Target, which already fades the
              reader's own miss to 0.5 and stamps it. A second 0.4 lands it at 0.20. */}
          <View style={styles.tabInner}>
            <Text style={styles.tabText} numberOfLines={1}>THE GAP</Text>
          </View>
        </Target>
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={D} k={K_FIG} />
    </Animated.View>
  );
}

/**
 * ONE HOLE, AND WHY IT IS TWO VIEWS.
 *
 * A hole the colour of the page is a dot. A cavity is DARK at its mouth with a
 * lit crescent low and to the right inside it — because the light in this app
 * comes from the top left and never moves (tone.ts), so the wall that catches it
 * is the far one. Two circles, one offset, and the disc becomes a void.
 */
function Hole({
  index, cx, cy, r, SCENE,
}: {
  index: number; cx: number; cy: number; r: number;
  SCENE: { value: { holes: number } };
}) {
  const st = useAnimatedStyle(() => {
    const a = clamp01(SCENE.value.holes * 3 - index);
    return { opacity: a, transform: [{ scale: 0.4 + 0.6 * a }] };
  });
  return (
    <Animated.View
      style={[
        styles.cavity,
        { left: cx - r, top: cy - r, width: r * 2, height: r * 2, borderRadius: r },
        st,
      ]}
      pointerEvents="none"
    >
      <View style={[styles.cavityLit, { borderRadius: r }]} />
    </Animated.View>
  );
}

/** One tally mark. */
function Tick({ j, SCENE }: { j: number; SCENE: { value: { ticks: number } } }) {
  const st = useAnimatedStyle(() => ({ opacity: clamp01(SCENE.value.ticks - j) }));
  return <Animated.View style={[styles.tick, { left: TICK_X + j * 10 }, st]} pointerEvents="none" />;
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 16, right: 16, top: GROUND, height: 1.5, backgroundColor: RULE },
  fill: { flex: 1 },

  // ── the block ─────────────────────────────────────────────────────────────
  // STONE for the body. This is the tone the flat scenes were missing: an
  // outline occupies no space on the page, and a filled mass does.
  face: {
    position: 'absolute', left: CH_L, top: FACE_T, width: CH_W, height: FACE_H,
    backgroundColor: STONE, borderWidth: 2, borderColor: INK,
  },
  // The lit face, skewed back. RULE rather than PAPER so it is plainly the same
  // material catching light rather than a different object.
  topFace: {
    position: 'absolute', left: TOP_L, top: FACE_T - TOP_H, width: CH_W, height: TOP_H,
    backgroundColor: RULE, borderWidth: 2, borderColor: INK,
    transform: [{ skewX: TOP_SKEW }],
  },
  // The rind: a darker band where the top face meets the front one.
  rind: {
    position: 'absolute', left: CH_L + 2, top: FACE_T + 2, width: CH_W - 4, height: RIND_H,
    backgroundColor: SHADE,
  },

  // ── a hole ────────────────────────────────────────────────────────────────
  cavity: { position: 'absolute', backgroundColor: SHADE, borderWidth: 2, borderColor: INK, overflow: 'hidden' },
  // The far wall, low and right, catching the light that falls from top left.
  cavityLit: {
    position: 'absolute', left: '22%', top: '30%', right: '-6%', bottom: '-6%',
    backgroundColor: STONE,
  },

  bigWrap: { position: 'absolute', left: BIG_CX - BIG_R, top: BIG_CY - BIG_R, width: BIG_R * 2, height: BIG_R * 2 },
  // The ring of cheese itself — the lining, which is the correct answer. It is
  // drawn as a band rather than an outline so that it is a THING you can point
  // at, which is the entire claim the lesson is testing.
  rimBand: {
    flex: 1, borderRadius: BIG_R,
    borderWidth: BIG_R - GAP_R, borderColor: RULE,
    backgroundColor: 'transparent',
  },
  // The outer edge of the ring, so the band has a boundary against the face.
  rimEdge: {
    position: 'absolute', left: 0, top: 0, right: 0, bottom: 0,
    borderRadius: BIG_R, borderWidth: 2, borderColor: INK,
  },
  rimPicked: { borderColor: INK },


  gapCavity: {
    position: 'absolute', left: BIG_R - GAP_R, top: BIG_R - GAP_R,
    width: GAP_R * 2, height: GAP_R * 2, borderRadius: GAP_R,
    backgroundColor: SHADE, borderWidth: 2, borderColor: INK, overflow: 'hidden',
  },


  // ── the count ─────────────────────────────────────────────────────────────
  kicker: {
    position: 'absolute', left: 96, top: KICK_T, width: 60,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.2, color: SOFT,
    includeFontPadding: false,
  },
  tick: { position: 'absolute', top: TICK_T, width: 3, height: 14, backgroundColor: INK },

  // ── the three answers ─────────────────────────────────────────────────────
  // Each leader stops ON its referent and nowhere else. The cheese line runs down
  // bare cheese at x 112 — the small hole spans 130…162, so a line at 138 would
  // have ended INSIDE a gap, pointing at the one part of the picture that is not
  // cheese (A1). The gap's leader turns a corner rather than running straight
  // down beside the rim's: two vertical lines twelve units apart, one meaning the
  // ring and one meaning the middle, is the ambiguity this layout exists to end.
  leadCheese: { position: 'absolute', left: 112, top: 360, width: 2, height: 62, backgroundColor: INK },
  leadRim: { position: 'absolute', left: 226, top: 360, width: 2, height: 76, backgroundColor: INK },
  leadGapDown: { position: 'absolute', left: 306, top: 360, width: 2, height: 88, backgroundColor: INK },
  leadGapIn: { position: 'absolute', left: BIG_CX + GAP_R, top: 447, width: 306 - (BIG_CX + GAP_R), height: 2, backgroundColor: INK },
  tab: { position: 'absolute', height: TAB_H },
  tabInner: {
    flex: 1, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: STONE,
    alignItems: 'center', justifyContent: 'center',
  },
  tabText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.4, color: INK,
    includeFontPadding: false,
  },
  tabPicked: { backgroundColor: INK, borderColor: INK },
  onInk: { color: PAPER },
  dim: { opacity: 0.4 },
});

// Ink runs from the kicker row (306) to the ground line (500). Band 306…512 = 206 (H59).
export function Metaphysics31Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Metaphysics31Scene} band={[306, 512]} camera={CAM} />;
}
