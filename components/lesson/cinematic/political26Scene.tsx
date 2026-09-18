import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, ease01, moveTr, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './political26Script';
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
// A DECISION WITH A STAMP ON IT, FED FROM A BALLOT BOX AND FROM A TABLE.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the DECISION is a 110×28 plate at x 136 (136…246), y 268…296, carrying its own
//   word, with a 30-unit STAMP under it at x 166, y 302…332. The stamp is the
//   legitimacy: a ring that fills from nothing to solid.
// · TWO SOURCES stand at the foot, both 60×46 filled STONE at x 136 and x 206
//   (136…266), y 380…426 — a BALLOT BOX with a slot cut in its lid, and a TABLE
//   whose top is rounded. Their names sit under them at y 432, in ink on paper.
// · TWO FEEDS run from each source up to the stamp, at x 164 and x 234, y 336…380.
//   Their WIDTHS carry the reader's seam, so a source doing more of the work is a
//   heavier pipe rather than a dimmed label (D35).
// · THREE PLATES of 140×26 in a COLUMN at x 256 (256…396), tops y 336 · 376 · 416
//   (H60b) — the readings are sentences rather than labels, and a row of them at
//   this width would not fit beside the sources.
// · the figure stands at x 28 and walks to 88; his widest span at the walked mark
//   is x ≈ 63…113, twenty-three units clear of the ballot box at 136.
//
// Ink runs y 244 (the caption) … y 500 (ground). BAND 240…512 = 272 — a 103-unit
// figure at 37.9%, inside H58's 38%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const DEC_X = 136;
const DEC_Y = 268;
const DEC_W = 110;
const DEC_H = 28;

const STAMP_X = 166;
const STAMP_Y = 302;
const STAMP_D = 30;

// NARROWER, AND FURTHER LEFT. At 60 wide from x 136 the table ran to 266, under
// the answer column's left edge at 256, and the column's third plate was painted
// straight across the NG of REASONING (S9). At 56 wide from x 128 the pair ends at
// 248, eight units short of the plates, and the figure's widest span at the walked
// mark (113) still clears the ballot box by fifteen.
const SRC_X = [128, 192];
const SRC_Y = 380;
const SRC_W = 56;
const SRC_H = 46;
const SRC_CAP = ['COUNTING', 'REASONING'];
const SRC_LABEL_Y = 432;

/** Each feed's left edge, two units left of its source's centre: its width grows rightward. */
const FEED_X = [154, 218];
const FEED_Y = 336;
const FEED_H = 44;
const FEED_THIN = 3;
const FEED_FAT = 13;

// group AH — the open column beside the sources, before the answer plates ever
// stand there (PLATES is 0 on all three still beats these marks belong to).
const TALLY_X = [296, 303, 310, 317];

const PLATE_X = 256;
const PLATE_W = 140;
const PLATE_H = 26;
const PLATE_Y = [336, 376, 416];
const PLATE_CAP = ['IT TESTS NOTHING', 'VOTING IS ALWAYS WRONG', 'EXPERTS SHOULD DECIDE'];
const PLATE_ID = ['untested', 'antivote', 'experts'];
/** What a bare tally skips. The other two read the argument as anti-democratic. */
const UNTESTED = 0;

const CAP_T = 244;
const FIG_X = 28;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const DEC = BEATS.map((b) => (b.decision ? 1 : 0));
const BOX = BEATS.map((b) => (b.box ? 1 : 0));
const TABLE = BEATS.map((b) => (b.table ? 1 : 0));
const FEEDS = BEATS.map((b) => (b.feeds ? 1 : 0));
const PLATES = BEATS.map((b) => (b.plates ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));
// group AH — one-shot marks for the three still taps, drawn in the open column
// to the right of the sources (where the answer plates sit on their own beat).
const TALLY = BEATS.map((b) => ((b.tally ?? 0) > 0 ? 1 : 0));
const AGREE = BEATS.map((b) => ((b.agree ?? 0) > 0 ? 1 : 0));
const WEIGH = BEATS.map((b) => ((b.weigh ?? 0) > 0 ? 1 : 0));

// R7c — the stage follows the control on its own graded beat, and only there.
// Derived from the beat so it cannot fall out of step with the control.
const REACT = BEATS.map((b) => (b.interact?.split ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('political26'));

export default function Political26Scene({ clock, bt, bi, i, picked, onPick, dragPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldFig = useHeld();
  const cv = useCarry(10);
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;
  // A mark fades IN on the beat that asks for it and back OUT on the next, rather
  // than cutting (see "AND FADE AN EVENT OUT, NOT OFF").
  const tallyFade = (cur.tally ?? 0) !== (prev?.tally ?? 0);
  const agreeFade = (cur.agree ?? 0) !== (prev?.agree ?? 0);
  const weighFade = (cur.weigh ?? 0) !== (prev?.weigh ?? 0);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    // A WALKING BEAT TAKES AS LONG AS THE WALK NEEDS (rig.moveTr).
    const tr = ease01(bt.value / moveTr(X[p], X[n], BASE_TR));
    const t = clock.value;
    const grow = ease01(bt.value / 0.55);

    const figS = keepHeld(heldFig, travelStance(
      X[p], X[n],
      carryFrom(heldFig, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));

    return {
      fig: lookPose(figS, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1, gazeX.value, gazeY.value, gazeOn.value),
      t,
      decOn: carry(cv, 1, n, DEC[p], DEC[n], tr),
      boxOn: carry(cv, 2, n, BOX[p], BOX[n], tr),
      tableOn: carry(cv, 3, n, TABLE[p], TABLE[n], tr),
      feedsOn: carry(cv, 4, n, FEEDS[p], FEEDS[n], tr),
      // R7b — the seam's position is the LEFT side's share, and LEFT is the
      // counting. The stamp fills from what is left over, which is the reasoning.
      counted: carry(cv, 5, n, 0.5, reacting ? dragPos.value : 0.5, tr),
      platesOn: carry(cv, 6, n, PLATES[p], PLATES[n], tr),
      // group AH — one-shot, fades in on its own beat and back out on the next.
      tally: carry(cv, 7, n, TALLY[p], TALLY[n], tallyFade ? grow : 1),
      agree: carry(cv, 8, n, AGREE[p], AGREE[n], agreeFade ? grow : 1),
      weigh: carry(cv, 9, n, WEIGH[p], WEIGH[n], weighFade ? grow : 1),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const decStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.decOn }));
  // Small tally marks: "adding up the preferences people already have."
  const tallyStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.tally }));
  // A checkmark: "everyone it affects could agree to it in rational discussion."
  const agreeStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.agree }));
  // An "=" mark: "a vote gives each person the same weight."
  const weighStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.weigh }));
  const boxStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.boxOn }));
  const tableStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.tableOn }));
  const platesStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.platesOn }));
  const leftFeed = useAnimatedStyle(() => ({
    opacity: SCENE.value.feedsOn,
    width: FEED_THIN + (FEED_FAT - FEED_THIN) * SCENE.value.counted,
  }));
  const rightFeed = useAnimatedStyle(() => ({
    opacity: SCENE.value.feedsOn,
    width: FEED_THIN + (FEED_FAT - FEED_THIN) * (1 - SCENE.value.counted),
  }));
  // THE STAMP FILLS FROM THE REASONING ONLY. That is the claim, not a flourish.
  const fillStyle = useAnimatedStyle(() => {
    const d = (STAMP_D - 8) * (1 - SCENE.value.counted);
    return {
      opacity: SCENE.value.feedsOn,
      width: d, height: d, borderRadius: d / 2,
      left: STAMP_X + STAMP_D / 2 - d / 2,
      top: STAMP_Y + STAMP_D / 2 - d / 2,
    };
  });

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={styles.cap} pointerEvents="none">WHAT MAKES IT BIND</Text>

      <Animated.View style={[StyleSheet.absoluteFill, decStyle]} pointerEvents="none">
        <View style={styles.decision} />
        <Text style={styles.decisionText}>THE DECISION</Text>
        <View style={styles.stamp} />
      </Animated.View>
      <Animated.View style={[styles.stampFill, fillStyle]} pointerEvents="none" />

      <Animated.View style={[styles.feed, { left: FEED_X[0] }, leftFeed]} pointerEvents="none" />
      <Animated.View style={[styles.feed, { left: FEED_X[1] }, rightFeed]} pointerEvents="none" />

      {/* group AH — three one-shot marks in the open column beside the sources. */}
      <Animated.View style={tallyStyle} pointerEvents="none">
        {TALLY_X.map((tx) => <View key={tx} style={[styles.tallyBar, { left: tx }]} />)}
      </Animated.View>
      <Animated.View style={agreeStyle} pointerEvents="none">
        <View style={styles.checkA} />
        <View style={styles.checkB} />
      </Animated.View>
      <Animated.View style={weighStyle} pointerEvents="none">
        <View style={[styles.weighBar, { top: 356 }]} />
        <View style={[styles.weighBar, { top: 366 }]} />
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, boxStyle]} pointerEvents="none">
        <View style={[styles.source, { left: SRC_X[0] }]} />
        {/* THE SLOT — a ballot box is a box you cannot see into, with one way in. */}
        <View style={styles.slot} />
        <Text style={[styles.sourceText, { left: SRC_X[0] - 4 }]}>{SRC_CAP[0]}</Text>
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, tableStyle]} pointerEvents="none">
        <View style={[styles.source, styles.round, { left: SRC_X[1] }]} />
        <Text style={[styles.sourceText, { left: SRC_X[1] - 4 }]}>{SRC_CAP[1]}</Text>
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, platesStyle]}>
        {PLATE_ID.map((id, k) => (
          <Target
            key={id}
            id={id}
            correct={k === UNTESTED}
            picked={picked}
            onPick={onPick}
            disabled={!live || answered}
            style={[styles.hit, { top: PLATE_Y[k] }]}
            radius={4}
          >
            <View style={styles.plate} pointerEvents="none" />
            <Text style={styles.plateText} pointerEvents="none">{PLATE_CAP[k]}</Text>
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
  // THE FLOOR THE GROUND LINE SITS ON — a subject standing on a filled mass
  // rather than on bare page.
  floor: floorStyle(TONE, GROUND),

  cap: {
    position: 'absolute', left: DEC_X, top: CAP_T, width: 250,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },

  decision: {
    position: 'absolute', left: DEC_X, top: DEC_Y, width: DEC_W, height: DEC_H,
    borderWidth: 2, borderColor: INK, backgroundColor: PAPER,
  },
  decisionText: {
    position: 'absolute', left: DEC_X, top: DEC_Y + 9, width: DEC_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.6, color: INK, includeFontPadding: false,
  },
  stamp: {
    position: 'absolute', left: STAMP_X, top: STAMP_Y, width: STAMP_D, height: STAMP_D, borderRadius: STAMP_D / 2,
    borderWidth: 2.5, borderColor: INK,
  },
  stampFill: { position: 'absolute', backgroundColor: INK },

  // THE FEEDS CARRY THE SHARE IN THEIR WIDTH, so no word ever has to be dimmed.
  feed: { position: 'absolute', top: FEED_Y, height: FEED_H, backgroundColor: INK },

  source: {
    position: 'absolute', top: SRC_Y, width: SRC_W, height: SRC_H,
    borderWidth: 2, borderColor: INK, backgroundColor: STONE, boxShadow: LIP,
  },
  round: { borderTopLeftRadius: 22, borderTopRightRadius: 22 },
  slot: { position: 'absolute', left: SRC_X[0] + (SRC_W - 28) / 2, top: SRC_Y + 8, width: 28, height: 4, backgroundColor: INK },
  // Four units either side of its source rather than five: at five the two name
  // boxes overlapped by two units in the gap between the sources.
  sourceText: {
    position: 'absolute', top: SRC_LABEL_Y, width: SRC_W + 8, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.5, color: INK, includeFontPadding: false,
  },

  hit: { position: 'absolute', left: PLATE_X, width: PLATE_W, height: PLATE_H },
  plate: {
    position: 'absolute', left: 0, top: 0, width: PLATE_W, height: PLATE_H,
    borderWidth: 2, borderColor: INK, borderRadius: 8, backgroundColor: PAPER,
  },
  plateText: {
    position: 'absolute', left: 0, top: 8, width: PLATE_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.5, color: INK, includeFontPadding: false,
  },

  // ── the three tap events (group AH) ────────────────────────────────────────
  // Tally marks: preferences being added up.
  tallyBar: { position: 'absolute', top: 352, width: 2, height: 18, backgroundColor: INK, borderRadius: 1 },
  // A checkmark: agreement reached in discussion.
  checkA: { position: 'absolute', left: 298, top: 365, width: 7, height: 2.5, backgroundColor: INK, borderRadius: 1, transform: [{ rotate: '45deg' }] },
  checkB: { position: 'absolute', left: 302, top: 361, width: 15, height: 2.5, backgroundColor: INK, borderRadius: 1, transform: [{ rotate: '-50deg' }] },
  // An "=" mark: each vote weighed the same.
  weighBar: { position: 'absolute', left: 296, width: 24, height: 3, backgroundColor: INK, borderRadius: 1 },
});

export function Political26Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Political26Scene} band={[240, 512]} camera={CAM} />;
}
