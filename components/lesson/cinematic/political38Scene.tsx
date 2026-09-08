import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, ease01, moveTr, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './political38Script';
import {
  facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, pickAt, lookPose,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// HOME, THE MEMBER, AND THE CORD THAT RUNS BETWEEN THEM.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · two BLOCKS of 84×56 at x 140 and x 302, y 272…328. HOME reads SAYS NO, and
//   the MEMBER's own line is the one thing on the stage the answer can change.
// · the CORD spans the 78 between them at y 300, drawn as FIVE segments of 16 at
//   x 226 · 240 · 254 · 268 · 282, dropped by 0 · 9 · 12 · 9 · 0 times the slack.
//   A hanging cord is a curve, and five straight pieces are the cheapest honest
//   version of one — a single bar could only ever be taut.
// · THE MEMBER'S LINE IS TWO WORDS STACKED AND CROSS-FADED. At no slack it reads
//   NO, which is what home said; at full slack it reads AS HE SEES IT. That is
//   the delegate and the trustee in one cell, and it is why the slack is worth
//   drawing rather than describing.
// · the three CARDS are 80×40 at y 380, x 140 · 223 · 306, each inside its own
//   Target (E39) and carrying its own two lines.
// · the figure stands at x 52 and walks to 98; his right edge is 124, clear of
//   HOME's 140.
//
// Ink runs y 244 (the caption) … y 500 (ground). BAND 230…512 = 282 — a 103-unit
// figure at 36.5%, inside H58's 38%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const BLK_Y = 272;
const BLK_W = 84;
const BLK_H = 56;
const HOME_X = 140;
const MEMB_X = 302;

const CORD_Y = 300;
const SEG_N = 5;
const SEG_W = 16;
const SEG_X0 = 226;
const SEG_PITCH = 14;
/** How far each piece of the cord hangs at full slack. */
const SAG = [0, 9, 12, 9, 0];

const CD_Y = 380;
const CD_W = 80;
const CD_H = 40;
const CD_X = [140, 223, 306];
// TWO LINES, TWO <Text>s — a newline inside one string measures as ONE line to
// `check:fits`, and that is the instrument that has to be able to see this.
const CD_CAP = [['WHAT YOU', 'INSTRUCT'], ['HIS OWN', 'JUDGEMENT'], ['THE PARTY', 'LINE']];
const CD_ID = ['instruct', 'judgement', 'party'];
/** The one a messenger cannot carry. */
const OWED = 1;

const CAP_T = 244;
const FIG_X = 52;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along:
// +1 where it rises, -1 where it falls, and HOLD while he stands still.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const CHAMBER = BEATS.map((b) => (b.chamber ? 1 : 0));
const CORD = BEATS.map((b) => (b.cord ? 1 : 0));
const CARDS = BEATS.map((b) => (b.cards ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));

// R7b — the stage follows the control on its own graded beat, and only there.
const REACT = BEATS.map((b) => (b.interact?.poll ? 1 : 0));

// THE THREE ANSWERS AS THREE CORDS, in the BALLOT'S OWN ORDER — `pickPos` runs
// across the options as the author wrote them, and that is the only order a
// picture may follow, because the rows the reader sees are shuffled.
//                    delegate · trustee · partisan
const SLACK_AT = [0, 1, 0.55];
// THE CORD STARTS TAUT, AND NOT HALFWAY. A resting slack of 0.5 would cross-fade
// the member's two lines at half opacity each — two words printed over one
// another, which is D35's smear in the shape of a word. It starts as a delegate's
// cord, and the reader is the one who gives it slack.
const SLACK_REST = 0;

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('political38'));

export default function Political38Scene({ clock, bt, bi, i, picked, onPick, pickPos, gazeX, gazeY, gazeOn }: SceneApi) {
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
      chamberOn: carry(cv, 1, n, CHAMBER[p], CHAMBER[n], tr),
      cordOn: carry(cv, 2, n, CORD[p], CORD[n], tr),
      cardsOn: carry(cv, 3, n, CARDS[p], CARDS[n], tr),
      // R7c — the ballot is the cord. The reader pulls it taut or lets it hang,
      // and the member's own line changes with it.
      slack: carry(cv, 4, n, SLACK_REST, reacting ? pickAt(SLACK_AT, pickPos.value) : SLACK_REST, tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const chamberStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.chamberOn }));
  const cordStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.cordOn }));
  const cardsStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.cardsOn }));
  const obeyStyle = useAnimatedStyle(() => ({ opacity: 1 - SCENE.value.slack }));
  const judgeStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.slack }));

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={styles.cap} pointerEvents="none">HOME, AND THE ROOM HE VOTES IN</Text>

      <Animated.View style={[StyleSheet.absoluteFill, chamberStyle]} pointerEvents="none">
        <View style={[styles.block, { left: HOME_X }]} />
        <Text style={[styles.blockName, { left: HOME_X }]}>HOME</Text>
        <Text style={[styles.blockLine, { left: HOME_X }]}>SAYS NO</Text>

        <View style={[styles.block, { left: MEMB_X }]} />
        <Text style={[styles.blockName, { left: MEMB_X }]}>MEMBER</Text>
        <Animated.View style={[StyleSheet.absoluteFill, obeyStyle]}>
          <Text style={[styles.blockLine, { left: MEMB_X }]}>VOTES NO</Text>
        </Animated.View>
        <Animated.View style={[StyleSheet.absoluteFill, judgeStyle]}>
          <Text style={[styles.blockLine, { left: MEMB_X }]}>AS HE SEES IT</Text>
        </Animated.View>
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, cordStyle]} pointerEvents="none">
        {SAG.map((_, j) => <Seg key={j} S={SCENE} index={j} />)}
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, cardsStyle]}>
        {CD_X.map((cx, k) => (
          <Target
            key={cx}
            id={CD_ID[k]}
            correct={k === OWED}
            picked={picked}
            onPick={onPick}
            disabled={!live || answered}
            style={[styles.hit, { left: cx }]}
          >
            <View
              style={[
                styles.card,
                answered && picked === CD_ID[k] && k !== OWED && styles.cardWrong,
                answered && k === OWED && styles.cardRight,
              ]}
              pointerEvents="none"
            >
              <Text style={[styles.cardText, answered && k === OWED && styles.cardTextOn]}>{CD_CAP[k][0]}</Text>
              <Text style={[styles.cardText, styles.cardText2, answered && k === OWED && styles.cardTextOn]}>{CD_CAP[k][1]}</Text>
            </View>
          </Target>
        ))}
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

/** One piece of the cord. Five of them make a hang that one bar could not. */
function Seg({ S, index }: { S: SharedValue<any>; index: number }) {
  const drop = SAG[index];
  const st = useAnimatedStyle(() => ({ transform: [{ translateY: drop * S.value.slack }] }));
  return <Animated.View style={[styles.seg, { left: SEG_X0 + index * SEG_PITCH }, st]} />;
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON — political7 and political8 both stand
  // their subject on a filled mass rather than on bare page.
  floor: { position: 'absolute', left: 0, right: 0, top: GROUND, bottom: 0, backgroundColor: RULE },

  cap: {
    position: 'absolute', left: 140, top: CAP_T, width: 246,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },

  block: {
    position: 'absolute', top: BLK_Y, width: BLK_W, height: BLK_H,
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: STONE,
  },
  blockName: {
    position: 'absolute', top: BLK_Y + 10, width: BLK_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1, color: INK, includeFontPadding: false,
  },
  blockLine: {
    position: 'absolute', top: BLK_Y + 32, width: BLK_W, textAlign: 'center',
    fontFamily: 'Inter_500Medium', fontSize: 8.6, letterSpacing: 0.5, color: INK, includeFontPadding: false,
  },

  seg: { position: 'absolute', top: CORD_Y, width: SEG_W, height: 2.5, borderRadius: 1, backgroundColor: INK },

  hit: { position: 'absolute', top: CD_Y, width: CD_W, height: CD_H },
  card: {
    position: 'absolute', left: 0, top: 0, width: CD_W, height: CD_H,
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: PAPER,
  },
  cardRight: { backgroundColor: INK },
  cardWrong: { borderColor: SOFT, borderStyle: 'dashed' },
  cardText: {
    position: 'absolute', left: 0, top: 9, width: CD_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.5, color: INK, includeFontPadding: false,
  },
  cardText2: { top: 21 },
  cardTextOn: { color: PAPER },
});

export function Political38Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Political38Scene} band={[230, 512]} camera={CAM} />;
}
