import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, ease01, moveTr, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './political39Script';
import {
  facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// A COUNT, THE LAW IT MADE, AND A GAUGE OF HOW FAR THAT LAW REACHES.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the TALLY is one bar 246×26 at x 140, y 262, split at 60% — 147.6 of INK for
//   the sixty and 98.4 of STONE for the forty, with YOU printed in the short end.
//   One bar and not two, because the argument is about a single decision.
// · a 2-wide LINK runs y 288…302 at x 261, into the LAW plate 140×30 at x 192.
// · the BINDING GAUGE is a 140-wide track at x 192, y 340, with a fill that scales
//   from its left edge. Its word sits OUTSIDE the track at x 148, because a label
//   inside a bar being scaled in x is a squashed label.
// · the four REASONS are 120×40 plates in two rows — x 140 and x 266, y 362 and
//   y 408 — each inside its own Target (E39) and carrying two lines.
// · THE GAUGE IS THE PLOT'S READOUT. `dragPos` on a plot is the drawn curve's mean
//   height, so a reader who draws a duty that holds everywhere fills the gauge and
//   one who draws a floor of nothing empties it. It rests full while the lesson is
//   simply talking, because until the question is asked the law binds.
// · the figure stands at x 52 and walks to 98; his right edge is 124, clear of the
//   tally's 140.
//
// Ink runs y 244 (the caption) … y 500 (ground). BAND 230…512 = 282 — a 103-unit
// figure at 36.5%, inside H58's 38%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const BAR_X = 140;
const BAR_W = 246;
const BAR_Y = 262;
const BAR_H = 26;
/** The share that voted for it. The picture is one decision, not two camps. */
const FOR = 0.6;

const LAW_X = 192;
const LAW_W = 140;
const LAW_Y = 302;
const LAW_H = 30;

const GAUGE_Y = 340;
const GAUGE_H = 10;

const RS_W = 120;
const RS_H = 40;
const RS_X = [140, 266, 140, 266];
const RS_Y = [362, 362, 408, 408];
// TWO LINES, TWO <Text>s — a newline inside one string measures as ONE line to
// `check:fits`, and that is the instrument that has to be able to see this.
const RS_CAP = [
  ['YOU AGREED TO', 'THE RULES'],
  ['YOU HAD AN', 'EQUAL SAY'],
  ['THEY HAVE', 'MORE PEOPLE'],
  ['A CROWD IS', 'MORE OFTEN RIGHT'],
];
const RS_ID = ['agreed', 'equal', 'more', 'crowd'];
/** The one that is a fact about force rather than an argument. */
const FORCE = 2;

const CAP_T = 244;
const FIG_X = 52;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along:
// +1 where it rises, -1 where it falls, and HOLD while he stands still.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const TALLY = BEATS.map((b) => (b.tally ? 1 : 0));
const LAW = BEATS.map((b) => (b.law ? 1 : 0));
const REASONS = BEATS.map((b) => (b.reasons ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));

// R7b — the stage follows the control on its own graded beat, and only there.
const REACT = BEATS.map((b) => (b.interact?.plot ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('political39'));

export default function Political39Scene({ clock, bt, bi, i, picked, onPick, dragPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldFig = useHeld();
  const cv = useCarry(5);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    // A WALKING BEAT TAKES AS LONG AS THE WALK NEEDS (rig.moveTr).
    const tr = ease01(bt.value / moveTr(X[p], X[n], BASE_TR));
    const t = clock.value;

    const figS = keepHeld(heldFig, travelStance(
      X[p], X[n],
      carryFrom(heldFig, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));

    return {
      fig: lookPose(figS, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1, gazeX.value, gazeY.value, gazeOn.value),
      t,
      tallyOn: carry(cv, 1, n, TALLY[p], TALLY[n], tr),
      lawOn: carry(cv, 2, n, LAW[p], LAW[n], tr),
      reasonsOn: carry(cv, 3, n, REASONS[p], REASONS[n], tr),
      // R7c — `dragPos` on a plot is the MEAN height of the curve the reader has
      // drawn, which is exactly what this gauge means: how far, on average, the
      // law still reaches once it has gone wrong.
      binds: carry(cv, 4, n, LAW[p], reacting ? dragPos.value : LAW[n], tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const tallyStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.tallyOn }));
  const lawStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.lawOn }));
  const reasonsStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.reasonsOn }));
  const bindStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: SCENE.value.binds }] }));

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={styles.cap} pointerEvents="none">ONE VOTE, AND WHAT IT MADE</Text>

      <Animated.View style={[StyleSheet.absoluteFill, tallyStyle]} pointerEvents="none">
        <View style={styles.barFor} />
        <View style={styles.barAgainst} />
        <Text style={styles.forText}>FOR 60</Text>
        <Text style={styles.againstText}>YOU, AND 39 MORE</Text>
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, lawStyle]} pointerEvents="none">
        <View style={styles.link} />
        <View style={styles.law} />
        <Text style={styles.lawText}>IT IS THE LAW</Text>
        <Text style={styles.gaugeName}>BINDS</Text>
        <View style={styles.gaugeTrack} />
        <Animated.View style={[styles.gaugeFill, bindStyle]} />
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, reasonsStyle]}>
        {RS_ID.map((id, k) => (
          <Target
            key={id}
            id={id}
            correct={k === FORCE}
            picked={picked}
            onPick={onPick}
            disabled={!live || answered}
            style={[styles.hit, { left: RS_X[k], top: RS_Y[k] }]}
          >
            <View
              style={[
                styles.reason,
                answered && picked === RS_ID[k] && k !== FORCE && styles.reasonWrong,
                answered && k === FORCE && styles.reasonRight,
              ]}
              pointerEvents="none"
            >
              <Text style={[styles.reasonText, answered && k === FORCE && styles.reasonTextOn]}>{RS_CAP[k][0]}</Text>
              <Text style={[styles.reasonText, styles.reasonText2, answered && k === FORCE && styles.reasonTextOn]}>{RS_CAP[k][1]}</Text>
            </View>
          </Target>
        ))}
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON — political7 and political8 both stand
  // their subject on a filled mass rather than on bare page.
  floor: { position: 'absolute', left: 0, right: 0, top: GROUND, bottom: 0, backgroundColor: RULE },

  cap: {
    position: 'absolute', left: BAR_X, top: CAP_T, width: BAR_W,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },

  barFor: {
    position: 'absolute', left: BAR_X, top: BAR_Y, width: BAR_W * FOR, height: BAR_H,
    borderTopLeftRadius: 3, borderBottomLeftRadius: 3, borderWidth: 2, borderColor: INK, backgroundColor: INK,
  },
  barAgainst: {
    position: 'absolute', left: BAR_X + BAR_W * FOR, top: BAR_Y, width: BAR_W * (1 - FOR), height: BAR_H,
    borderTopRightRadius: 3, borderBottomRightRadius: 3, borderWidth: 2, borderColor: INK, backgroundColor: STONE,
  },
  forText: {
    position: 'absolute', left: BAR_X, top: BAR_Y + 9, width: BAR_W * FOR, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1, color: PAPER, includeFontPadding: false,
  },
  againstText: {
    position: 'absolute', left: BAR_X + BAR_W * FOR, top: BAR_Y + 9, width: BAR_W * (1 - FOR), textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.5, color: INK, includeFontPadding: false,
  },

  link: { position: 'absolute', left: 261, top: BAR_Y + BAR_H, width: 2, height: LAW_Y - BAR_Y - BAR_H, backgroundColor: INK },
  law: {
    position: 'absolute', left: LAW_X, top: LAW_Y, width: LAW_W, height: LAW_H,
    borderWidth: 2.5, borderColor: INK, borderRadius: 3, backgroundColor: STONE,
  },
  lawText: {
    position: 'absolute', left: LAW_X, top: LAW_Y + 11, width: LAW_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1, color: INK, includeFontPadding: false,
  },

  // THE WORD IS OUTSIDE THE TRACK. A label inside a bar that scales in x is a
  // squashed label, which is the one thing this gauge must never do.
  gaugeName: {
    position: 'absolute', left: 140, top: GAUGE_Y + 1, width: 48,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.8, color: SOFT, includeFontPadding: false,
  },
  gaugeTrack: {
    position: 'absolute', left: LAW_X, top: GAUGE_Y, width: LAW_W, height: GAUGE_H,
    borderRadius: 2, borderWidth: 1.5, borderColor: SOFT,
  },
  gaugeFill: {
    position: 'absolute', left: LAW_X, top: GAUGE_Y, width: LAW_W, height: GAUGE_H,
    borderRadius: 2, backgroundColor: INK, transformOrigin: '0% 50%',
  },

  hit: { position: 'absolute', width: RS_W, height: RS_H },
  reason: {
    position: 'absolute', left: 0, top: 0, width: RS_W, height: RS_H,
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: PAPER,
  },
  reasonRight: { backgroundColor: INK },
  reasonWrong: { borderColor: SOFT, borderStyle: 'dashed' },
  reasonText: {
    position: 'absolute', left: 0, top: 9, width: RS_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.5, color: INK, includeFontPadding: false,
  },
  reasonText2: { top: 21 },
  reasonTextOn: { color: PAPER },
});

export function Political39Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Political39Scene} band={[230, 512]} camera={CAM} />;
}
