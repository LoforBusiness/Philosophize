import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, lerp, mixStance, pose, type Bundle } from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './ethics4Script';
import { K_FIG, STAGE_W, STAGE_H, INK, SOFT, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, reactPose,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { floorStyle, lipOf, PLATE_FACE } from './stageSkin';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// THE STAGE IS STRUCK IN THIS LESSON'S OWN BRANCH HUE (./stageTones).
// Same three tones, same luminance to the third decimal — so every contrast
// measured against the old greys still holds and nothing on the stage moved.
const TONE = stageTone('ethics');
const { RULE, STONE, SHADE } = TONE;
const LIP = lipOf(TONE);   // the ledge a toned plate stands on (scripts/skin-stage.mjs)

// ─────────────────────────────────────────────────────────────────────────────
// A TWO-LAYER DIAGRAM with the argument happening inside it.
//
//   the SURFACE (y 206–276)   two culture tablets, side by side, whose rows are
//                             written in one at a time — codes that plainly differ,
//                             with a ≠ standing in the gutter between them
//   the ARGUERS  (y 287–434)  two figures under their own emblems, facing off
//   the FLOOR   (y 444–510)   Brown's human universals as a bar chart: four traits,
//                             four bars, every one of them running the full track
//
// On the verdict beat the tablets give way to two big stamps, so Q2 is answered by
// tapping the stage. The camera is identity — design coordinates ARE final stage
// coordinates, so the band below can be read straight off these constants.
// ─────────────────────────────────────────────────────────────────────────────

const A_X = 118;
const B_X = 282;
const FIG_G = 434;                       // the ground the two arguers stand on

// ── the surface: two codes that differ ──────────────────────────────────────
const TAB_T = 206;
const TAB_H = 70;
const TAB_W = 176;
const TAB_L = 14;
const TAB_R = 210;
const CODE_ROW = [234, 247, 260];
const CODE_A = ['BURY THE DEAD', 'HEADS COVERED', 'NO PORK'];
const CODE_B = ['BURN THE DEAD', 'HEADS BARE', 'NO BEEF'];

// ── the floor: every bar full, because every society has it ─────────────────
const CHART_T = 460;
const PITCH = 13;
const BAR_L = 152;
const BAR_W = 188;
const BAR_H = 11;
const TRAITS = ['FAIRNESS', 'RECIPROCITY', 'NO MURDER', 'INCEST TABOO'];

// ── the scene-answered verdict (Q2) ─────────────────────────────────────────
// 176 × 48 each — comfortably past the 132 × 38 floor for a thumb, and the labels
// are three short words so they sit on one line at 14px.
const V_T = 224;
const VERDICTS = [
  { id: 'follows', label: 'IT FOLLOWS', x: TAB_L, correct: false },
  { id: 'doesnt', label: 'IT DOES NOT', x: TAB_R, correct: true },
];

const A_CODE = BEATS.map((b) => b.a ?? 0);
const B_CODE = BEATS.map((b) => b.b ?? 0);
const FLOOR = BEATS.map((b) => b.floor ?? 0);
const ROWS = BEATS.map((b) => b.rows ?? 0);
const NOTE = BEATS.map((b) => b.note ?? 0);

// ── group AH: one still-tap annotation per beat that names a new claim ──────
// A one-shot flash in the gutter between the two arguers (or, for 6/7, beside
// the floor chart), timed to the beat's OWN sentence — never carried across
// beats, so it costs no cross-beat interpolation. Text for the four claim tags.
const NOTE_TEXT: Record<number, string> = {
  1: 'A STRONGER CLAIM?',
  2: 'MORAL RELATIVISM',
  3: 'DOESN’T FOLLOW',
  4: 'WRONG EVERYWHERE',
};

// THE CAMERA (H60b). `followMoves` reads the x track and gives each beat its own
// shot: it FOLLOWS the subject when a beat moves far enough to be worth following,
// pushes close on a quote, and PULLS BACK to the whole band on a question or a
// summary — the beats the reader has to read and act on.
// Two figures at 118 and 282, so the track is the point BETWEEN them (200) — following
// either one alone would frame the other out, and here the pair is the subject.
const X = BEATS.map((b) => b.x ?? 200);

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.drag ? 1 : 0));
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('ethics4'));

export default function Ethics4Scene({ clock, bt, bi, i, picked, onPick, dragPos }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldA = useHeld();
  const cv = useCarry(2);
  const heldB = useHeld();
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;
  const answered = picked !== null;
  const asking = !!cur.interact;
  // ANIMATE ONLY WHAT CHANGED (C20c) — a one-shot, so it fires only on the beat
  // that introduces it, never on a beat that merely holds the same claim.
  const noteNow = (cur.note ?? 0) > 0 && (cur.note ?? 0) !== (prev?.note ?? 0) ? (cur.note ?? 0) : 0;

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.85);
    const t = clock.value;

    const a = keepHeld(heldA, mixStance(carryFrom(heldA, n, emoteHold(A_CODE[p], t)), emoteLive(A_CODE[n], t, bt.value), tr));
    const b = keepHeld(heldB, mixStance(carryFrom(heldB, n, emoteHold(B_CODE[p], t)), emoteLive(B_CODE[n], t, bt.value), tr));
    return {
      a: reactPose(a, A_X, FIG_G, K_FIG, 1, 1),
      b: pose(b, B_X, FIG_G, K_FIG, -1, 1),
      // R7b — the knob puts the shared floor out. Drag toward NOTHING IS RIGHT OR
      // WRONG and the common ground under both cultures fades, so the reader watches
      // the claim cost something rather than being told it does. Inverted on purpose:
      // the far end of the rail is the end with no floor left.
      floor: carry(cv, 0, n, FLOOR[p], reacting ? 1 - dragPos.value : FLOOR[n], tr),
      rows: carry(cv, 1, n, ROWS[p], ROWS[n], tr),
      // THE ANNOTATION'S OWN PROGRESS, 0..1 across 1.1s of the beat it belongs
      // to, flatly 0 on every other beat — one flash per tap, not a loop.
      note: noteNow ? ease01(bt.value / 1.1) : 0,
      t,
    };
  });

  const DA = useDerivedValue<Bundle>(() => SCENE.value.a);
  const DB = useDerivedValue<Bundle>(() => SCENE.value.b);
  const chartStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.floor }));
  // Fades in over the first fifth of its window and out over the last, so it
  // arrives and settles rather than snapping on, and is invisible at rest.
  const noteStyle = useAnimatedStyle(() => {
    const u = SCENE.value.note;
    return { opacity: u <= 0 || u >= 1 ? 0 : Math.min(1, Math.min(u, 1 - u) / 0.2) };
  });

  return (
    <Animated.View style={styles.scene}>
      {/* ── the surface: two tablets of differing custom ─────────────────── */}
      {!asking && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Text style={styles.layerLabel}>THE SURFACE — THESE CODES DIFFER</Text>
          <Tablet left={TAB_L} name="CULTURE A" emblem="tri" rows={CODE_A} S={SCENE} />
          <Tablet left={TAB_R} name="CULTURE B" emblem="dia" rows={CODE_B} S={SCENE} />
          {/* ≠ in the 20-unit gutter between the tablets: the surface does not match.
              It answers the four ALLs on the floor chart — differ up here, identical
              down there — so the two layers read as one argument. */}
          <View style={styles.neq}>
            <View style={[styles.neqBar, { top: 8 }]} />
            <View style={[styles.neqBar, { top: 16 }]} />
            <View style={styles.neqSlash} />
          </View>
        </View>
      )}

      {/* ── the two arguers ───────────────────────────────────────────────── */}
      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DA} k={K_FIG} />
      <Stickman role="second" D={DB} k={K_FIG} />

      {/* ── the floor: Brown's universals, drawn as a bar chart ───────────── */}
      <Animated.View style={[StyleSheet.absoluteFill, chartStyle]} pointerEvents="none">
        <Text style={styles.chartHdr}>THE FLOOR — FOUND IN EVERY SOCIETY DOCUMENTED</Text>
        {TRAITS.map((tr, k) => (
          <Text key={`t${tr}`} style={[styles.traitT, { top: CHART_T + k * PITCH }]}>{tr}</Text>
        ))}
        {TRAITS.map((tr, k) => <Bar key={`b${tr}`} S={SCENE} k={k} />)}
        {TRAITS.map((tr, k) => (
          <Text key={`v${tr}`} style={[styles.valT, { top: CHART_T + k * PITCH }]}>ALL</Text>
        ))}
      </Animated.View>

      {/* ── group AH: one flash per still tap, naming this beat's own claim ── */}
      {(noteNow === 1 || noteNow === 2 || noteNow === 3 || noteNow === 4) && (
        <Animated.View style={[styles.noteRow, noteStyle]} pointerEvents="none">
          <View
            style={[
              styles.noteTagLine,
              noteNow === 1 && styles.noteTagDashed,
              noteNow === 4 && styles.noteTagBoxed,
            ]}
          >
            <Text style={[styles.noteText, noteNow === 3 && styles.noteTextStruck]}>
              {NOTE_TEXT[noteNow]}
            </Text>
            {noteNow === 3 && <View style={styles.noteStrike} />}
          </View>
        </Animated.View>
      )}

      {/* Beat 8's analogy: two guesses about the Earth's shape, only one true —
          FLAT struck through, ROUND left standing, the same way the argument
          treats a culture's code. */}
      {noteNow === 5 && (
        <Animated.View style={[styles.noteRow, noteStyle]} pointerEvents="none">
          <View style={styles.earthPair}>
            <Text style={styles.earthWord}>FLAT</Text>
            <View style={styles.earthStrike} />
          </View>
          <Text style={[styles.earthWord, styles.earthWordOn]}>ROUND</Text>
        </Animated.View>
      )}

      {/* Beat 10: a bracket beside the three universals this sentence actually
          names (reciprocity, murder, incest) — not fairness, the fourth bar. */}
      {noteNow === 6 && (
        <Animated.View style={[styles.bracket, noteStyle]} pointerEvents="none">
          <View style={styles.bracketSpine} />
          <View style={[styles.bracketTick, { top: 0 }]} />
          <View style={[styles.bracketTick, { bottom: 0 }]} />
        </Animated.View>
      )}

      {/* Beat 11: the floor is BENEATH the surface's differences, literally —
          a line dropping from where the arguers stand toward the chart below. */}
      {noteNow === 7 && (
        <Animated.View style={[styles.bridge, noteStyle]} pointerEvents="none" />
      )}

      {/* ── Q2 answered in the scene: two verdict stamps ──────────────────── */}
      {asking && (
        <>
          <Text style={styles.askLabel}>TAP YOUR VERDICT</Text>
          {VERDICTS.map((v) => (
            <Target id={v.id} correct={v.correct} picked={picked} onPick={onPick}
              key={v.id} style={[styles.vHit, { left: v.x, top: V_T }]} disabled={answered}>
              <View
                style={[
                  styles.vBox,
                  answered && v.correct && styles.vRight,
                  answered && picked === v.id && !v.correct && styles.vWrong,
                ]}
              >
                <Text style={[styles.vText, answered && v.correct && styles.vTextOn]}>{v.label}</Text>
              </View>
            </Target>
          ))}
        </>
      )}
    </Animated.View>
  );
}

/** One culture's code: its emblem, its name, and rows that get written in. */
function Tablet({
  left, name, emblem, rows, S,
}: { left: number; name: string; emblem: 'tri' | 'dia'; rows: string[]; S: SharedValue<any> }) {
  return (
    <View style={[styles.tablet, { left }]} pointerEvents="none">
      <View style={styles.tabHead}>
        {emblem === 'tri' ? <View style={styles.triangle} /> : <View style={styles.diamond} />}
        <Text style={styles.tabName}>{name}</Text>
      </View>
      <View style={styles.tabRule} />
      {rows.map((r, k) => <CodeRow key={r} S={S} text={r} k={k} />)}
    </View>
  );
}

function CodeRow({ S, text, k }: { S: SharedValue<any>; text: string; k: number }) {
  const st = useAnimatedStyle(() => {
    const on = clamp01(S.value.rows - k);
    return { opacity: on, transform: [{ translateX: (1 - on) * -12 }] };
  });
  return (
    <Animated.View style={[styles.codeRow, { top: CODE_ROW[k] - TAB_T }, st]}>
      <Text style={styles.codeDash}>·</Text>
      <Text style={styles.codeT}>{text}</Text>
    </Animated.View>
  );
}

/** One universal's bar. Scaled, never re-laid-out — a width animation relayouts. */
function Bar({ S, k }: { S: SharedValue<any>; k: number }) {
  const fill = useAnimatedStyle(() => ({
    transform: [{ scaleX: clamp01((S.value.floor - k * 0.09) / 0.55) }],
  }));
  return (
    <View style={[styles.barTrack, { top: CHART_T + k * PITCH }]} pointerEvents="none">
      <Animated.View style={[styles.barFill, fill]} />
    </View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 24, right: 24, top: FIG_G, height: 1.5, backgroundColor: RULE },

  layerLabel: {
    position: 'absolute', left: 0, right: 0, top: 190, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 9.5, letterSpacing: 1.6, color: SOFT,
    includeFontPadding: false,
  },

  // TONE, NOT WHITE. This scene drew every prop as an outline on paper — two
  // values and no depth, which is the flat case `check:shade` exists to find.
  // The structural mass takes STONE, a secondary surface takes RULE, and what
  // carries the message stays PAPER, so the picture has things at different
  // values rather than everything a shade darker. See cinematicKit's ramp.
  tablet: {
    position: 'absolute', top: TAB_T, width: TAB_W, height: TAB_H,
    borderWidth: 2, borderColor: INK, borderRadius: 8, backgroundColor: STONE, boxShadow: LIP,
  },
  tabHead: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 10, paddingTop: 6 },
  tabName: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.4, color: INK,
    includeFontPadding: false,
  },
  tabRule: { marginTop: 5, marginHorizontal: 8, height: 1, backgroundColor: RULE },
  triangle: {
    width: 0, height: 0,
    borderLeftWidth: 8, borderRightWidth: 8, borderBottomWidth: 14,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: INK,
  },
  diamond: { width: 12, height: 12, borderWidth: 2.5, borderColor: INK, transform: [{ rotate: '45deg' }] },

  neq: { position: 'absolute', left: 189, top: 228, width: 22, height: 26 },
  neqBar: { position: 'absolute', left: 3.5, width: 15, height: 2.5, backgroundColor: INK, borderRadius: 1 },
  neqSlash: {
    position: 'absolute', left: 0, top: 11, width: 22, height: 2.5,
    backgroundColor: INK, borderRadius: 1, transform: [{ rotate: '-62deg' }],
  },

  codeRow: { position: 'absolute', left: 10, right: 8, flexDirection: 'row', alignItems: 'center', gap: 6 },
  codeDash: { fontFamily: 'Inter_700Bold', fontSize: 11, color: SOFT,
    includeFontPadding: false,
  },
  codeT: { fontFamily: 'Inter_700Bold', fontSize: 10.5, letterSpacing: 0.3, color: INK, includeFontPadding: false },

  chartHdr: {
    position: 'absolute', left: 0, right: 0, top: 444, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 9.5, letterSpacing: 1.4, color: SOFT,
    includeFontPadding: false,
  },
  traitT: {
    position: 'absolute', left: 20, width: 124, textAlign: 'right', height: BAR_H, lineHeight: BAR_H,
    fontFamily: 'Inter_700Bold', fontSize: 9.5, letterSpacing: 0.4, color: INK, includeFontPadding: false,
  },
  barTrack: {
    position: 'absolute', left: BAR_L, width: BAR_W, height: BAR_H,
    borderWidth: 1, borderColor: RULE, backgroundColor: RULE, overflow: 'hidden',
  },
  barFill: {
    position: 'absolute', left: 0, top: 0, width: '100%', height: '100%',
    backgroundColor: INK, transformOrigin: '0% 50%',
  },
  valT: {
    position: 'absolute', left: BAR_L + BAR_W + 8, width: 40, height: BAR_H, lineHeight: BAR_H,
    fontFamily: 'Inter_700Bold', fontSize: 9.5, letterSpacing: 0.8, color: INK, includeFontPadding: false,
  },

  // ── group AH: the seven still-tap flashes, one per beat, in the free strip
  // of paper between the ground line (434) and the (still-hidden) floor
  // header (444) — real estate no other element occupies before beat 9.
  noteRow: {
    position: 'absolute', left: 60, right: 60, top: 436,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 14,
  },
  noteTagLine: {
    position: 'relative', paddingHorizontal: 6, paddingBottom: 2,
    borderBottomWidth: 2, borderBottomColor: INK,
  },
  noteTagDashed: { borderBottomColor: SOFT, borderStyle: 'dashed' },
  noteTagBoxed: {
    borderWidth: 1.5, borderColor: INK, borderRadius: 4, paddingVertical: 3,
    backgroundColor: PLATE_FACE, boxShadow: LIP,
  },
  noteText: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 0.6, color: INK,
    includeFontPadding: false,
  },
  noteTextStruck: { color: SOFT },
  noteStrike: { position: 'absolute', left: 0, right: 0, top: '50%', height: 1.5, marginTop: -0.75, backgroundColor: SOFT },

  earthPair: { position: 'relative' },
  earthWord: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 0.6, color: SOFT,
    includeFontPadding: false,
  },
  earthWordOn: { color: INK },
  earthStrike: { position: 'absolute', left: 0, right: 0, top: '50%', height: 1.5, marginTop: -0.75, backgroundColor: SOFT },

  // The bracket beside the floor chart's own three named rows, clear of the
  // trait labels (which start at x = 20).
  bracket: { position: 'absolute', left: 8, top: CHART_T + PITCH, width: 6, height: PITCH * 2 + BAR_H },
  bracketSpine: { position: 'absolute', left: 2, top: 0, bottom: 0, width: 2, backgroundColor: INK },
  bracketTick: { position: 'absolute', left: 0, width: 6, height: 2, backgroundColor: INK },

  // The floor sits BENEATH the surface's differences — a line dropping from
  // where the arguers stand toward the chart, stopping short of its header.
  bridge: { position: 'absolute', left: 199, top: 282, width: 2, height: 160, backgroundColor: SHADE },

  askLabel: {
    position: 'absolute', left: 0, right: 0, top: 200, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.4, color: SOFT,
    includeFontPadding: false,
  },
  vHit: { position: 'absolute', width: TAB_W },
  vBox: {
    height: 48, borderWidth: 2.5, borderColor: INK, borderRadius: 5, backgroundColor: PLATE_FACE, boxShadow: LIP,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8,
  },
  vRight: { backgroundColor: INK, borderColor: INK },
  vWrong: { borderColor: SOFT },
  vText: { fontFamily: 'Inter_700Bold', fontSize: 14, letterSpacing: 0.3, color: INK, includeFontPadding: false },
  vTextOn: { color: PAPER },
});

// The band. Topmost ink is the surface label at y 190 (the verdict label sits at 200);
// the lowest is the last universals bar, whose track runs to 460 + 3×13 + 11 = 510.
// The arguers' crowns reach y ≈ 288 at their bounciest and their ankle joints reach
// 441, both comfortably inside. Cropping to 334 units instead of 560 renders the whole
// scene at ~1.95× rather than the letterboxed 1.15×.
export function Ethics4Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Ethics4Scene} band={[184, 518]} camera={CAM} />;
}
