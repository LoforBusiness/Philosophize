import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, clamp01, ease01, lerp, moveTr, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './political37Script';
import { facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { floorStyle, lipOf, PLATE_FACE } from './stageSkin';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// THE STAGE IS STRUCK IN THIS LESSON'S OWN BRANCH HUE (./stageTones).
// Same three tones, same luminance to the third decimal — so every contrast
// measured against the old greys still holds and nothing on the stage moved.
const TONE = stageTone('political-philosophy');
const { RULE, STONE, SHADE } = TONE;
const LIP = lipOf(TONE);   // the ledge a toned plate stands on (scripts/skin-stage.mjs)

// ─────────────────────────────────────────────────────────────────────────────
// TWO BALLOTS THE SAME SIZE, AND TWO VOICES THAT ARE NOT.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the two BALLOTS are 62×44 at x 158 and x 288, y 396…440, drawn from the same
//   constants and never resized. That is the point of them: the vote really is
//   equal, and nothing in this file can make one of them bigger.
// · the two MEGAPHONES sit above at y 292…384, each a 16-wide throat at the
//   ballot's centre opening out to a mouth. The quiet one's mouth is 34 wide and
//   FIXED. The loud one's runs 34…150 and is what the cap changes.
// · the CAP BAR is a 3-thick rule drawn across the loud mouth at its capped
//   width, from y 292 — the mark that says a limit was imposed, and it is drawn
//   only on the louder side because that is the only side a cap touches.
// · the two LABELS are 96×22 boxes at x 146 and x 276, y 452…474: EQUAL VOTE and
//   UNEQUAL REACH — and they are the answer targets for the final question, so a
//   third target, SPEECH, sits at x 206, y 262…284 on the megaphone itself.
// · the figure stands at x 54 and walks to 126; crown ~397. The first ballot
//   begins at x 158, so he is beside them.
//
// Ink runs y 262 (the speech target) … y 500 (ground). BAND 236…512 = 276 (H59),
// with the 103-unit figure at 37% (H58).
//
// THE QUIET MEGAPHONE NEVER GROWS. A cap takes reach from the loud voice; it does
// not hand any to the quiet one, and drawing it otherwise would be the scene
// telling a more comfortable story than the lesson does (A1).
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const BALLOT_Y = 396;
const BALLOT_W = 62;
const BALLOT_H = 44;
const BALLOT_X = [158, 288];

const HORN_TOP = 292;
const HORN_BOT = 384;
const QUIET_MOUTH = 34;
const LOUD_MAX = 150;

const LABEL_Y = 452;
const LABEL = [
  { id: 'vote', text: 'EQUAL VOTE', left: 146 },
  { id: 'reach', text: 'UNEQUAL REACH', left: 276 },
];

const CAP_T = 242;
const FIG_X = 54;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along:
// +1 where it rises, -1 where it falls, and HOLD while he stands still, so a
// figure who walks left to something keeps facing it while he talks about it.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const PAIR = BEATS.map((b) => (b.pair ? 1 : 0));
const HORNS = BEATS.map((b) => (b.horns ? 1 : 0));
const CAP = BEATS.map((b) => b.cap ?? 0);
const LIVE_D = BEATS.map((b) => (b.live_d ? 1 : 0));
const LABELS = BEATS.map((b) => (b.labels ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));
// group AH — one still-tap event each, set on exactly one beat and left to fade
// out on the next (cinematicKit's carry() and the "fade an event out, not off"
// recipe).
const NEAR = BEATS.map((b) => (b.near ? 1 : 0));
const EQ = BEATS.map((b) => (b.eq ? 1 : 0));
const VS = BEATS.map((b) => (b.vs ? 1 : 0));
const RANGE = BEATS.map((b) => (b.range ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('political37'));

export default function Political37Scene({ clock, bt, bi, i, picked, onPick, dragPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const heldFig = useHeld();
  const cv = useCarry(9);
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;
  const nearFade = (cur.near ?? 0) !== (prev?.near ?? 0);
  const eqFade = (cur.eq ?? 0) !== (prev?.eq ?? 0);
  const vsFade = (cur.vs ?? 0) !== (prev?.vs ?? 0);
  const rangeFade = (cur.range ?? 0) !== (prev?.range ?? 0);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    // A WALKING BEAT TAKES AS LONG AS THE WALK NEEDS (rig.moveTr). A fixed length
    // here sprinted every long journey and left the footfalls — which the player
    // computes from moveTr — arriving after the figure had stopped.
    const tr = ease01(bt.value / moveTr(X[p], X[n], BASE_TR));
    const t = clock.value;
    const grow = ease01(bt.value / 0.55);

    const figS = keepHeld(heldFig, travelStance(
      X[p], X[n],
      carryFrom(heldFig, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));

    // Reader's thumb on the drag beat, the script's own track everywhere else.
    const cap = LIVE_D[n] === 1 ? clamp01(dragPos.value) : carry(cv, 0, n, CAP[p], CAP[n], tr);
    return {
      fig: lookPose(figS, carry(cv, 1, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1, gazeX.value, gazeY.value, gazeOn.value),
      t,
      pairOn: carry(cv, 2, n, PAIR[p], PAIR[n], tr),
      hornsOn: carry(cv, 3, n, HORNS[p], HORNS[n], tr),
      cap,
      // The loud mouth shrinks toward the quiet one's width; it never goes below it,
      // and the quiet one never moves at all.
      loud: LOUD_MAX - (LOUD_MAX - QUIET_MOUTH) * cap,
      labelsOn: carry(cv, 4, n, LABELS[p], LABELS[n], tr),
      // group AH — who the quiet voice reaches, that the vote itself stays equal,
      // the split between the two positions, and one rule among the many a
      // democracy could set.
      nearOn: carry(cv, 5, n, NEAR[p], NEAR[n], tr, nearFade ? grow : 1),
      eqOn: carry(cv, 6, n, EQ[p], EQ[n], tr, eqFade ? grow : 1),
      vsOn: carry(cv, 7, n, VS[p], VS[n], tr, vsFade ? grow : 1),
      rangeOn: carry(cv, 8, n, RANGE[p], RANGE[n], tr, rangeFade ? grow : 1),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.drag && LIVE[i] === 1;

  const pairStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.pairOn }));
  const hornsStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.hornsOn }));
  const labelsStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.labelsOn }));
  const loudStyle = useAnimatedStyle(() => ({
    width: SCENE.value.loud,
    marginLeft: -SCENE.value.loud / 2,
  }));
  const capStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.cap > 0.02 ? 1 : 0,
    width: SCENE.value.loud + 12,
    marginLeft: -(SCENE.value.loud + 12) / 2,
  }));
  // group AH — who the quiet voice reaches, that the vote stays equal, the split
  // between the two positions, and one rule among the many a democracy could set.
  const nearStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.nearOn }));
  const eqStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.eqOn }));
  const vsStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.vsOn }));
  const rangeStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.rangeOn }));

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={styles.cap}>ELECTION DAY</Text>

      <Animated.View style={[StyleSheet.absoluteFill, hornsStyle]} pointerEvents="none">
        {/* the quiet voice — fixed, and it never grows */}
        <View style={[styles.throat, { left: BALLOT_X[0] + BALLOT_W / 2 - 8 }]} />
        <View style={[styles.mouth, { left: BALLOT_X[0] + BALLOT_W / 2, width: QUIET_MOUTH, marginLeft: -QUIET_MOUTH / 2 }]} />
        {/* the loud voice — the only thing a cap touches */}
        <View style={[styles.throat, { left: BALLOT_X[1] + BALLOT_W / 2 - 8 }]} />
        <Animated.View style={[styles.mouth, { left: BALLOT_X[1] + BALLOT_W / 2 }, loudStyle]} />
        <Animated.View style={[styles.capBar, { left: BALLOT_X[1] + BALLOT_W / 2 }, capStyle]} />
        {/* The few people close enough for the quiet voice to reach. */}
        <Animated.View style={[styles.nearDot, { left: BALLOT_X[0] + BALLOT_W / 2 - 12 }, nearStyle]} />
        <Animated.View style={[styles.nearDot, { left: BALLOT_X[0] + BALLOT_W / 2 + 8 }, nearStyle]} />
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, pairStyle]} pointerEvents="none">
        {BALLOT_X.map((bx) => (
          <View key={bx}>
            <View style={[styles.ballot, { left: bx }]} />
            <View style={[styles.tick, { left: bx + 12 }]} />
            <View style={[styles.tickTail, { left: bx + 8 }]} />
          </View>
        ))}
        {/* The ballots themselves stay exactly equal. */}
        <Animated.View style={[styles.eqBar, styles.eqBarTop, eqStyle]} />
        <Animated.View style={[styles.eqBar, styles.eqBarBot, eqStyle]} />
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, labelsStyle]}>
        {LABEL.map((l) => (
          <Target
            key={l.id}
            id={l.id}
            correct={false}
            picked={picked}
            onPick={onPick}
            disabled={!live || answered}
            style={[styles.label, { left: l.left }]}
          >
            <View
              style={[styles.labelBox, answered && picked === l.id && styles.labelWrong]}
              pointerEvents="none"
            />
            <Text style={styles.labelText}>{l.text}</Text>
          </Target>
        ))}
        <Target
          id="speech"
          correct
          picked={picked}
          onPick={onPick}
          disabled={!live || answered}
          style={styles.speech}
        >
          <View style={styles.speechBox} pointerEvents="none" />
          <Text style={styles.speechText}>SPEECH</Text>
        </Target>
        {/* The split between the two positions, and one rule among the many a
            democracy could set — same gap between the labels, never both at once. */}
        <Animated.View style={[styles.vsMark, vsStyle]} pointerEvents="none" />
        <Animated.View style={[styles.rangeDot, { left: 245 }, rangeStyle]} pointerEvents="none" />
        <Animated.View style={[styles.rangeDot, { left: 257 }, rangeStyle]} pointerEvents="none" />
        <Animated.View style={[styles.rangeDot, { left: 269 }, rangeStyle]} pointerEvents="none" />
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON. A rule on its own leaves the
  // figure and everything it is looking at standing on bare page;
  // political7 and political8 both stand their subject on a filled mass.
  floor: floorStyle(TONE, GROUND),

  cap: {
    position: 'absolute', left: 146, top: CAP_T, width: 240,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.5, color: SOFT, includeFontPadding: false,
  },

  ballot: {
    position: 'absolute', top: BALLOT_Y, width: BALLOT_W, height: BALLOT_H,
    borderWidth: 2, borderColor: INK, borderRadius: 8, backgroundColor: STONE, boxShadow: LIP,
  },
  tick: { position: 'absolute', top: BALLOT_Y + 16, width: 3, height: 16, backgroundColor: INK, transform: [{ rotate: '-40deg' }] },
  tickTail: { position: 'absolute', top: BALLOT_Y + 22, width: 3, height: 9, backgroundColor: INK, transform: [{ rotate: '40deg' }] },
  // group AH — the two ballots stay exactly equal: a plain "=" between them.
  eqBar: { position: 'absolute', left: 247, width: 14, height: 2, backgroundColor: SHADE },
  eqBarTop: { top: 414 },
  eqBarBot: { top: 422 },

  throat: { position: 'absolute', top: HORN_BOT - 18, width: 16, height: 18, backgroundColor: INK, borderRadius: 2 },
  mouth: { position: 'absolute', top: HORN_TOP, height: HORN_BOT - HORN_TOP - 18, borderWidth: 2.5, borderColor: INK, backgroundColor: PAPER, borderRadius: 3 },
  // The mark that says a limit was imposed. On the loud side only, because that is
  // the only side a cap reaches.
  capBar: { position: 'absolute', top: HORN_TOP - 8, height: 3, backgroundColor: INK, borderRadius: 2 },
  // group AH — the few people close enough for the quiet voice to reach.
  nearDot: { position: 'absolute', top: 282, width: 5, height: 5, borderRadius: 2.5, backgroundColor: SHADE },

  label: { position: 'absolute', top: LABEL_Y, width: 96, height: 22 },
  labelBox: {
    position: 'absolute', left: 0, top: 0, width: 96, height: 22,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PLATE_FACE, boxShadow: LIP,
  },
  labelWrong: { borderColor: SOFT, borderStyle: 'dashed' },
  labelText: {
    position: 'absolute', left: 0, top: 6, width: 96, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.9, color: INK, includeFontPadding: false,
  },
  // group AH — in the gap between the two labels: first the split between the two
  // positions in dispute, then one rule among the many a democracy could set.
  // Never both at once, so the one gap does double duty.
  vsMark: {
    position: 'absolute', left: 255, top: 459, width: 8, height: 8,
    backgroundColor: INK, transform: [{ rotate: '45deg' }],
  },
  rangeDot: { position: 'absolute', top: 461, width: 4, height: 4, borderRadius: 2, backgroundColor: INK },

  speech: { position: 'absolute', left: 206, top: 262, width: 88, height: 22 },
  speechBox: {
    position: 'absolute', left: 0, top: 0, width: 88, height: 22,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PLATE_FACE, boxShadow: LIP,
  },
  speechText: {
    position: 'absolute', left: 0, top: 6, width: 88, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.1, color: INK, includeFontPadding: false,
  },
});

export function Political37Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Political37Scene} band={[236, 512]} camera={CAM} />;
}
