import {
  View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { WALK, clamp01, ease01, lerp, mixStance, moveTr, pose, strideStance, type Bundle } from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './ethics5Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import { followMoves, kindOf, seedOf } from './camera';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';

// A lone traveller walks through snowy Athens — a colonnade behind them, snow
// drifting past — while the lesson's spine hangs overhead as a piece of
// information design:
//
// THERE USED TO BE TWO WALKERS HERE AND THAT WAS A BUG. This scene began as a
// Socrates-and-student dialogue; the script was later rewritten into the Axial Age
// (Greece / India / China), and neither figure is named or referred to anywhere in
// the narration any more. The second walker had no role, was the same size, faced
// the same way, and — because both were handed the SAME x0/x1 — drew the same gait
// habit and the same footfall from `strideStance`, so the two marched in perfect
// lockstep and read as one figure duplicated. A companion has to earn its place in
// the story first; if one is ever added back, give it a `seed` so it walks like
// somebody else.
//
//   · THE AXIAL TIMELINE  a three-lane chart (GREECE / INDIA / CHINA) drawn against
//     one 900→100 BCE axis, with the axial window 800–200 BCE marked by two guides.
//     Each thinker drops into their lane as the narration names them, and the three
//     ink pills land in the SAME slice of the axis — which is the whole claim.
//   · Q1 THE FORK         two full signposts planted above the walkers' heads; tap
//     one and the walker steps toward it.
//   · Q2 THE BALANCE      a wide beam with two big pans; tap a pan and it sinks.
//
// Every constant here is a FINAL stage coordinate and the band at the bottom of the
// file reads straight off them. That was once because the camera was identity; it
// is now simply how the scene is written, and the camera moves under it (H60b). Composition rule: nothing but snow is ever drawn below y = 348 in the middle
// of the stage, so no chart, sign or pan can ever cover a walker (crown ≈ 357).

// The pair used to span bx .. bx+118, so their visual centre sat 59 to the right of
// the scripted `sx`. The lone walker stands on that centre instead, which keeps the
// composition — and the beat-by-beat framing against the colonnade and the chart —
// exactly as it was measured.
//
// The 59 used to be added at DRAW time, so the script's number was not the figure's
// position. That was invisible until the lesson got a camera, which has to aim at
// the figure: pointed at the script's number it would have framed 59 units of empty
// snow to his left on every beat. The offset is folded into the data now and this
// constant is gone. Deltas are unaffected — stride and travel time both read the
// difference between two beats, and a constant added to both cancels.

// ── the colonnade ────────────────────────────────────────────────────────────
const COL_T = 348;
const COL_H = GROUND - COL_T;               // 152
const COLUMNS = [48, 132, 268, 352];
const STYLO_T = 494;                        // the step the colonnade stands on

// ── the axial timeline ───────────────────────────────────────────────────────
const AXIS_L = 100;
const AXIS_R = 380;
const YEAR_L = 900;                         // the year sitting at AXIS_L
const YEAR_R = 100;                         // the year sitting at AXIS_R
/** Where a BCE year falls on the axis. Plain JS — resolved once, at module scope. */
const atYear = (y: number) => AXIS_L + ((YEAR_L - y) * (AXIS_R - AXIS_L)) / (YEAR_L - YEAR_R);

const TITLE_T = 214;
const YEARS_T = 233;
const GUIDE_T = 248;
const GUIDE_B = 342;
const PILL_H = 26;
const LANES = [
  { id: 'greece', name: 'GREECE', row: 268, label: 'SOCRATES', year: 399, w: 100, step: 2 },
  { id: 'india', name: 'INDIA', row: 300, label: 'DHARMA', year: 600, w: 88, step: 3 },
  { id: 'china', name: 'CHINA', row: 332, label: 'CONFUCIUS', year: 500, w: 108, step: 3 },
];

// ── Q1: the fork of two paths ────────────────────────────────────────────────
const FORK_HDR_T = 226;
const SIGN_T = 252;
const SIGN_W = 152;
const SIGN_H = 52;
const POST_T = SIGN_T + SIGN_H;             // 304
const FORKS = [
  { id: 'solitude', label: 'IN SOLITUDE', left: 30, correct: false },
  { id: 'among', label: 'AMONG OTHERS', left: 218, correct: true },
];

// ── Q2: the balance ──────────────────────────────────────────────────────────
const BAL_HDR_T = 216;
const BEAM_Y = 250;                         // the beam's own top edge
const BEAM_W = 180;
const BEAM_L = 200 - BEAM_W / 2;            // 110
const PAN_T = 274;
const PAN_W = 148;
const PAN_H = 52;
const PANS = [
  { id: 'fact', title: 'PROVEN FACT', sub: 'settled history', side: -1, correct: false },
  { id: 'thesis', title: 'A THESIS', sub: 'an interpretation', side: 1, correct: true },
];

// The WALKER'S OWN x, under the name validate-cinematic reads. It used to be a
// local `sx` holding the pair's left edge, with the figure drawn 59 units right
// of it — so a camera aimed at the script's number would have framed empty snow.
// The offset now lives in the data, and the draw below just reads it.
const X = BEATS.map((b) => b.x ?? 259);
// H60b: moving is the default. The header used to note that the camera here was
// IDENTITY, which was true and was not a reason — it made every constant in the
// file a final stage coordinate, an authoring convenience, not a composition
// choice. The chart, the signposts and the balance all live above y=348 and a
// close push shows y 345..561, so this is only safe now that those report a
// must-see box (H60c) and hold the shot open.
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('ethics5'));
const SOC = BEATS.map((b) => b.soc ?? 0);
const FORK = BEATS.map((b) => b.fork ?? 0);
const BAL = BEATS.map((b) => b.balance ?? 0);
const CHART = BEATS.map((b) => b.chart ?? 0);

export default function Ethics5Scene({ clock, bt, bi, qv, i, picked, onPick }: SceneApi) {
  const heldSocS = useHeld();
  const cv = useCarry(4);
  const cur = BEATS[i];
  // Answer-direction constants resolved on the JS thread — the worklet stays free of
  // array methods, and strideStance is called DIRECTLY (calling it from a nested
  // worklet, which itself calls walk/mixStance, hard-crashes the runtime).
  const forkAnswered = (cur.fork ?? 0) > 0 && picked !== null;
  const balAnswered = (cur.balance ?? 0) > 0 && picked !== null;
  const stepX = picked === 'solitude' ? -22 : picked === 'among' ? 22 : 0;
  const tiltDir = picked === 'thesis' ? 1 : picked === 'fact' ? -1 : 0;

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / moveTr(X[p], X[n], 0.85));
    const t = clock.value;
    const moving = Math.abs(X[n] - X[p]) > 1;

    // Standing, the blend starts from the pose LAST DRAWN rather than from
    // SOC[p] — see group L. Walking, strideStance sets the whole body from the
    // distance covered and there is nothing to carry, so it is left alone.
    const socS = keepHeld(heldSocS, moving
      ? strideStance(X[p], X[n], emoteHold(SOC[n], t), tr, WALK)
      : mixStance(carryFrom(heldSocS, n, emoteHold(SOC[p], t)), emoteLive(SOC[n], t, bt.value), tr));

    // The walker only ever shifts SIDEWAYS on an answer — never up or down, so the
    // band below can be measured once and stays true on every beat.
    const dx = (forkAnswered ? qv.value : 0) * stepX;
    const bx = carry(cv, 0, n, X[p], X[n], tr) + dx;

    return {
      soc: pose(socS, bx, GROUND, K_FIG, 1, 1),
      fork: carry(cv, 1, n, FORK[p], FORK[n], tr),
      balance: carry(cv, 2, n, BAL[p], BAL[n], tr),
      chart: carry(cv, 3, n, CHART[p], CHART[n], tr),
      tilt: balAnswered ? qv.value * tiltDir : 0,
      t,
    };
  });

  const DSoc = useDerivedValue<Bundle>(() => SCENE.value.soc);
  const axisStyle = useAnimatedStyle(() => ({ opacity: clamp01(SCENE.value.chart) }));
  const forkStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.fork }));
  const balStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.balance }));
  const beamStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${SCENE.value.tilt * 10}deg` }] }));

  const answered = picked !== null;
  const showFork = (cur.fork ?? 0) > 0 && !!cur.interact;
  const showBal = (cur.balance ?? 0) > 0 && !!cur.interact;

  return (
    <Animated.View style={styles.scene}>
      {/* ── the Axial-Age timeline, hung above the walkers ─────────────────── */}
      <Animated.View style={[styles.fill, axisStyle]} pointerEvents="none">
        <Text style={styles.chartTitle}>THE AXIAL AGE</Text>
        <Text style={[styles.yearMark, { left: atYear(800) - 32 }]}>800 BCE</Text>
        <Text style={[styles.yearMark, { left: atYear(200) - 32 }]}>200 BCE</Text>
        <View style={[styles.guide, { left: atYear(800) - 0.75 }]} />
        <View style={[styles.guide, { left: atYear(200) - 0.75 }]} />
        {LANES.map((l) => (
          <View key={`r${l.id}`} style={[styles.laneRule, { top: l.row - 0.75 }]} />
        ))}
        {LANES.map((l) => (
          <Text key={`n${l.id}`} style={[styles.laneName, { top: l.row - 6 }]}>{l.name}</Text>
        ))}
      </Animated.View>
      {LANES.map((l) => <Pill key={l.id} l={l} S={SCENE} />)}

      {/* ── the colonnade + the ground it stands on ────────────────────────── */}
      {COLUMNS.map((x) => <Column key={x} x={x} />)}
      <View style={styles.stylobate} pointerEvents="none" />
      <View style={styles.ground} pointerEvents="none" />

      {/* snow */}
      {SNOW.map((s, k) => <Flake key={k} S={SCENE} s={s} k={k} />)}

      {/* the walker */}
      <Stickman D={DSoc} k={K_FIG} />

      {/* ── Q1: two signposts planted above the walkers' heads ─────────────── */}
      {showFork && (
        <Animated.View style={[styles.fill, forkStyle]}>
          <Text style={styles.sceneHdr} pointerEvents="none">TAP WHERE VIRTUE GROWS</Text>
          {FORKS.map((f) => (
            <View key={`p${f.id}`} style={[styles.postWrap, { left: f.left }]} pointerEvents="none">
              <View style={styles.post} />
              <View style={styles.postFoot} />
            </View>
          ))}
          {FORKS.map((f) => (
            <Signpost key={f.id} f={f} answered={answered} picked={picked} onPick={onPick} />
          ))}
        </Animated.View>
      )}

      {/* ── Q2: the balance. The frame is decoration and must NEVER eat a tap ─ */}
      <Animated.View style={[styles.fill, balStyle]} pointerEvents="none">
        <Text style={styles.balHdr}>TAP A PAN TO TIP THE SCALE</Text>
        <View style={styles.balPost} />
        <View style={styles.balFoot} />
        <Animated.View style={[styles.balBeam, beamStyle]}>
          <View style={[styles.balHang, { left: 2 }]} />
          <View style={[styles.balHang, { right: 2 }]} />
        </Animated.View>
      </Animated.View>
      {showBal && PANS.map((pn) => (
        <Pan key={pn.id} pn={pn} S={SCENE} answered={answered} picked={picked} onPick={onPick} />
      ))}
    </Animated.View>
  );
}

// 137 and 330 share no factor, so the flakes walk right across the stage instead of
// bunching into one narrow column the way a small multiplier does.
const SNOW = Array.from({ length: 18 }, (_, k) => ({ x: 34 + (k * 137) % 330, ph: (k * 0.137) % 1, sp: 0.18 + (k % 5) * 0.03 }));
const SNOW_T = 348;
const SNOW_B = GROUND - 6;

function Flake({ S, s, k }: { S: SharedValue<any>; s: { x: number; ph: number; sp: number }; k: number }) {
  const st = useAnimatedStyle(() => {
    const f = ((S.value.t * s.sp + s.ph) % 1 + 1) % 1;
    const y = lerp(SNOW_T, SNOW_B, f);
    const sway = Math.sin(S.value.t * 1.3 + k) * 10;
    return { opacity: 0.5 + 0.4 * Math.sin(f * Math.PI), transform: [{ translateX: sway }, { translateY: y - SNOW_T }] };
  });
  return <Animated.View style={[styles.flake, { left: s.x, top: SNOW_T }, st]} />;
}

/** A fluted column: capital, fluted shaft, base — kept faint so it reads behind. */
function Column({ x }: { x: number }) {
  return (
    <View style={[styles.colWrap, { left: x - 20 }]} pointerEvents="none">
      <View style={styles.colCap} />
      <View style={styles.colShaft}>
        <View style={[styles.flute, { left: 9 }]} />
        <View style={[styles.flute, { left: 19 }]} />
      </View>
      <View style={styles.colBase} />
    </View>
  );
}

/** One thinker, dropping into their lane on the beat that names them. */
function Pill({ l, S }: { l: typeof LANES[number]; S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const u = clamp01(S.value.chart - (l.step - 1));
    return { opacity: u, transform: [{ translateY: (1 - u) * -12 }] };
  });
  return (
    <Animated.View
      style={[styles.pill, { left: atYear(l.year) - l.w / 2, top: l.row - PILL_H / 2, width: l.w }, st]}
      pointerEvents="none"
    >
      <Text style={styles.pillT}>{l.label}</Text>
    </Animated.View>
  );
}

function Signpost({ f, answered, picked, onPick }: {
  f: { id: string; label: string; left: number; correct: boolean };
  answered: boolean; picked: string | null; onPick: (id: string, correct: boolean) => void;
}) {
  const chosen = picked === f.id;
  return (
    <Target id={f.id} correct={f.correct} picked={picked} onPick={onPick}
              style={[styles.signHit, { left: f.left }]} disabled={answered}>
      <View style={[styles.sign, answered && f.correct && styles.signRight, answered && chosen && !f.correct && styles.signWrong]}>
        <Text style={[styles.signT, answered && f.correct && styles.onPaper]}>{f.label}</Text>
      </View>
    </Target>
  );
}

function Pan({ pn, S, answered, picked, onPick }: {
  pn: { id: string; title: string; sub: string; side: number; correct: boolean };
  S: SharedValue<any>; answered: boolean; picked: string | null; onPick: (id: string, correct: boolean) => void;
}) {
  const chosen = picked === pn.id;
  const st = useAnimatedStyle(() => ({ transform: [{ translateY: S.value.tilt * pn.side * 16 }] }));
  return (
    <Animated.View style={[styles.panHit, { left: 200 + pn.side * (BEAM_W / 2) - PAN_W / 2 }, st]}>
      <Target id={pn.id} correct={pn.correct} picked={picked} onPick={onPick}
              disabled={answered}>
        <View style={[styles.pan, answered && pn.correct && styles.panRight, answered && chosen && !pn.correct && styles.panWrong]}>
          <Text style={[styles.panT, answered && pn.correct && styles.onPaper]}>{pn.title}</Text>
          <Text style={[styles.panSub, answered && pn.correct && styles.onPaper]}>{pn.sub}</Text>
        </View>
      </Target>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  fill: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 },
  ground: { position: 'absolute', left: 24, right: 24, top: GROUND, height: 1.5, backgroundColor: RULE },
  stylobate: { position: 'absolute', left: 20, right: 20, top: STYLO_T, height: 1.5, backgroundColor: RULE },
  flake: { position: 'absolute', width: 5, height: 5, borderRadius: 3, backgroundColor: SOFT },
  onPaper: { color: PAPER },

  // ── the colonnade ──────────────────────────────────────────────────────────
  colWrap: { position: 'absolute', top: COL_T, width: 40, height: COL_H },
  colCap: { width: 40, height: 9, borderWidth: 2, borderColor: RULE, backgroundColor: PAPER },
  colShaft: { width: 30, height: COL_H - 18, marginLeft: 5, borderLeftWidth: 2, borderRightWidth: 2, borderColor: RULE },
  flute: { position: 'absolute', top: 6, bottom: 6, width: 1.5, backgroundColor: RULE },
  colBase: { width: 40, height: 9, borderWidth: 2, borderColor: RULE, backgroundColor: PAPER },

  // ── the axial timeline ─────────────────────────────────────────────────────
  chartTitle: {
    position: 'absolute', left: 0, right: 0, top: TITLE_T, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 12, letterSpacing: 2.6, color: INK, includeFontPadding: false,
  },
  yearMark: {
    position: 'absolute', top: YEARS_T, width: 64, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1, color: SOFT, includeFontPadding: false,
  },
  guide: { position: 'absolute', top: GUIDE_T, width: 1.5, height: GUIDE_B - GUIDE_T, backgroundColor: RULE },
  laneRule: { position: 'absolute', left: AXIS_L, width: AXIS_R - AXIS_L, height: 1.5, backgroundColor: RULE },
  laneName: {
    position: 'absolute', left: 8, width: 84, textAlign: 'right',
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.2, color: SOFT, includeFontPadding: false,
  },
  pill: {
    position: 'absolute', height: PILL_H, borderRadius: 5, backgroundColor: INK,
    alignItems: 'center', justifyContent: 'center',
  },
  pillT: { fontFamily: 'Inter_700Bold', fontSize: 13, letterSpacing: 0.6, color: PAPER, includeFontPadding: false },

  // ── shared scene instruction ───────────────────────────────────────────────
  sceneHdr: {
    position: 'absolute', left: 0, right: 0, top: FORK_HDR_T, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },

  // ── Q1: the signposts ──────────────────────────────────────────────────────
  signHit: { position: 'absolute', top: SIGN_T, width: SIGN_W },
  sign: {
    width: SIGN_W, height: SIGN_H, borderWidth: 2.5, borderColor: INK, borderRadius: 5,
    backgroundColor: STONE, alignItems: 'center', justifyContent: 'center',
  },
  signRight: { backgroundColor: INK, borderColor: INK },
  signWrong: { borderColor: SOFT, opacity: 0.45 },
  signT: { fontFamily: 'Inter_700Bold', fontSize: 15, letterSpacing: 0.4, color: INK, includeFontPadding: false },
  postWrap: { position: 'absolute', top: POST_T, width: SIGN_W, alignItems: 'center' },
  post: { width: 5, height: 22, backgroundColor: INK, borderRadius: 2 },
  postFoot: { width: 34, height: 4, backgroundColor: INK, borderRadius: 2 },

  // ── Q2: the balance ────────────────────────────────────────────────────────
  balHdr: {
    position: 'absolute', left: 0, right: 0, top: BAL_HDR_T, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },
  balPost: { position: 'absolute', left: 197.5, top: BEAM_Y, width: 5, height: 94, backgroundColor: INK, borderRadius: 2 },
  balFoot: { position: 'absolute', left: 172, top: BEAM_Y + 94, width: 56, height: 5, backgroundColor: INK, borderRadius: 2 },
  balBeam: {
    position: 'absolute', left: BEAM_L, top: BEAM_Y, width: BEAM_W, height: 4,
    backgroundColor: INK, borderRadius: 2, transformOrigin: '50% 50%',
  },
  balHang: { position: 'absolute', top: 0, width: 2.5, height: 18, backgroundColor: SOFT },
  panHit: { position: 'absolute', top: PAN_T, width: PAN_W },
  pan: {
    width: PAN_W, height: PAN_H, borderWidth: 2.5, borderColor: INK, borderRadius: 6,
    backgroundColor: STONE, alignItems: 'center', justifyContent: 'center',
  },
  panRight: { backgroundColor: INK, borderColor: INK },
  panWrong: { borderColor: SOFT, opacity: 0.45 },
  panT: { fontFamily: 'Inter_700Bold', fontSize: 14.5, letterSpacing: 0.5, color: INK, includeFontPadding: false },
  panSub: { fontFamily: 'Inter_400Regular', fontSize: 10.5, color: SOFT, marginTop: 3, includeFontPadding: false },
});

// The band, measured with the camera GONE (design coordinates are final coordinates):
// the chart title tops out at 214 and the balance caption at 216; the timeline runs
// down to the China pill's base at 345; the signposts 252–330; the balance beam swings
// 234–268 at ±10°, its pans 258–342 and its foot to 349; the colonnade 348–500; snow
// 348–499; the walkers' crowns ≈357 down to feet planted at 500 (the fork answer moves
// them SIDEWAYS only); and the ground rule ends at 501.5. Cropping to [206, 508]
// renders the stage at ~2.14× instead of the letterboxed 1.15×.
export function Ethics5Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Ethics5Scene} band={[206, 508]} camera={CAM} />;
}
