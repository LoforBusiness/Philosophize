import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, clamp01, ease01, moveTr, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './logic40Script';
import {
  facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// TWO RULE CARDS FEEDING ONE TRAY, AND A STONE NOBODY HAS TURNED OVER.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · TWO RULE CARDS of 104×32 at x 140 (140…244) and x 282 (282…386), y 262…294.
//   Identical but for their words — the riddle is that nothing distinguishes
//   them, so a card drawn with more weight would give the answer away.
// · TWO FEEDS of 3 wide at x 190 and x 332, y 294…376, from each card's own
//   centre down into the tray. Their WIDTHS carry the reader's split, so more
//   evidence flowing to a rule is a thicker feed rather than a dimmed word (D35).
// · the TRAY is 246×48 at x 140, y 376…424 — the scene's filled mass (T2), which
//   is what the three white stones are read against.
// · THREE STONES of 34×34 at x 164 · 246 · 328, y 383…417, drawn as discs and
//   tapped as discs (E38: `radius` 17). The first two carry a check; the third is
//   empty from the first beat the tray exists, because a rule is a promise about
//   the case nobody has reached and that case has to be in the picture.
// · STONE LABELS of 62 wide at x 150 · 232 · 314, y 430 — outside the tray, so
//   they sit on paper and are drawn in INK rather than SOFT (T3).
// · the SEAM is 4 wide inside the tray, x 140…386, and appears only while the
//   split is live.
// · the figure stands at x 36 and walks to 96; his widest span at the walked mark
//   is x ≈ 71…121, nineteen units clear of the tray's left edge at 140.
//
// Ink runs y 244 (the caption) … y 500 (ground). BAND 240…512 = 272 — a 103-unit
// figure at 37.9%, inside H58's 38%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const CARD_X = [140, 282];
const CARD_Y = 262;
const CARD_W = 104;
const CARD_H = 32;
const CARD_CAP = ['ALL GREEN', 'ALL GRUE'];

const FEED_X = [190, 332];
const FEED_Y = CARD_Y + CARD_H;
const TRAY_X = 140;
const TRAY_Y = 376;
const TRAY_W = 246;
const TRAY_H = 48;
const FEED_H = TRAY_Y - FEED_Y;

const STONE_X = [164, 246, 328];
const STONE_Y = 383;
const STONE_D = 34;
const STONE_N = 3;
const STONE_CAP = ['CHECKED', 'CHECKED', 'NOT YET'];
const LABEL_X = [150, 232, 314];
const LABEL_Y = 430;
const LABEL_W = 62;
const STONE_ID = ['first', 'last', 'next'];
/** The one the two rules part company over. The other two are already in hand. */
const NEXT = 2;

const CAP_T = 244;
const FIG_X = 36;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const RULES = BEATS.map((b) => b.rules ?? 0);
const LINKS = BEATS.map((b) => (b.links ? 1 : 0));
const TRAY = BEATS.map((b) => (b.tray ? 1 : 0));
const CHECKED = BEATS.map((b) => b.checked ?? 0);
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));

// R7c — the stage follows the control on its own graded beat, and only there.
// Derived from the beat so it cannot fall out of step with the control.
const REACT = BEATS.map((b) => (b.interact?.split ? 1 : 0));

/** A feed's width at no share and at all of it. */
const FEED_THIN = 3;
const FEED_FAT = 12;

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('logic40'));

export default function Logic40Scene({ clock, bt, bi, i, picked, onPick, dragPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldFig = useHeld();
  const cv = useCarry(6);
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
      rules: carry(cv, 1, n, RULES[p], RULES[n], tr),
      linksOn: carry(cv, 2, n, LINKS[p], LINKS[n], tr),
      trayOn: carry(cv, 3, n, TRAY[p], TRAY[n], tr),
      checked: carry(cv, 4, n, CHECKED[p], CHECKED[n], tr),
      // R7b — the seam's position is the LEFT side's share, so `share` is GREEN's.
      // Off the split beat it rests at an even half and the seam is not drawn.
      share: carry(cv, 5, n, 0.5, reacting ? dragPos.value : 0.5, tr),
      seamOn: reacting ? 1 : 0,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const rulesStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.rules }));
  const trayStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.trayOn }));
  const leftFeed = useAnimatedStyle(() => ({
    opacity: SCENE.value.linksOn,
    width: FEED_THIN + (FEED_FAT - FEED_THIN) * SCENE.value.share,
  }));
  const rightFeed = useAnimatedStyle(() => ({
    opacity: SCENE.value.linksOn,
    width: FEED_THIN + (FEED_FAT - FEED_THIN) * (1 - SCENE.value.share),
  }));
  const seamStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.seamOn,
    left: TRAY_X + TRAY_W * SCENE.value.share - 2,
  }));

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={styles.cap} pointerEvents="none">TWO RULES, ONE TRAY</Text>

      <Animated.View style={[StyleSheet.absoluteFill, rulesStyle]} pointerEvents="none">
        {CARD_X.map((cx, k) => (
          <View key={cx}>
            <View style={[styles.card, { left: cx }]} />
            <Text style={[styles.cardText, { left: cx }]}>{CARD_CAP[k]}</Text>
          </View>
        ))}
      </Animated.View>

      <Animated.View style={[styles.feed, { left: FEED_X[0] }, leftFeed]} pointerEvents="none" />
      <Animated.View style={[styles.feed, { left: FEED_X[1] }, rightFeed]} pointerEvents="none" />

      <Animated.View style={[StyleSheet.absoluteFill, trayStyle]} pointerEvents="none">
        <View style={styles.tray} />
        <Animated.View style={[styles.seam, seamStyle]} />
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, trayStyle]}>
        {STONE_ID.map((id, k) => (
          <Target
            key={id}
            id={id}
            correct={k === NEXT}
            picked={picked}
            onPick={onPick}
            disabled={!live || answered}
            style={[styles.hit, { left: STONE_X[k] }]}
            radius={STONE_D / 2}
          >
            <View style={styles.stone} pointerEvents="none" />
            <Check S={SCENE} index={k} />
          </Target>
        ))}
        {LABEL_X.map((lx, k) => (
          <Text key={lx} style={[styles.stoneText, { left: lx }]} pointerEvents="none">{STONE_CAP[k]}</Text>
        ))}
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

/** The mark a stone carries once somebody has turned it over. */
function Check({ S, index }: { S: SharedValue<any>; index: number }) {
  const st = useAnimatedStyle(() => ({ opacity: clamp01(S.value.checked * STONE_N - index) }));
  return <Animated.View style={[styles.check, st]} pointerEvents="none" />;
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON — a subject standing on a filled mass
  // rather than on bare page.
  floor: { position: 'absolute', left: 0, right: 0, top: GROUND, bottom: 0, backgroundColor: RULE },

  cap: {
    position: 'absolute', left: TRAY_X, top: CAP_T, width: TRAY_W,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },

  card: {
    position: 'absolute', top: CARD_Y, width: CARD_W, height: CARD_H,
    borderWidth: 2, borderColor: INK, backgroundColor: PAPER,
  },
  cardText: {
    position: 'absolute', top: CARD_Y + 11, width: CARD_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1, color: INK, includeFontPadding: false,
  },

  // THE FEEDS CARRY THE SHARE IN THEIR WIDTH. A rule that the reader has given
  // most of the evidence to is drawn heavier; neither word ever dims.
  feed: { position: 'absolute', top: FEED_Y, height: FEED_H, backgroundColor: INK },

  tray: {
    position: 'absolute', left: TRAY_X, top: TRAY_Y, width: TRAY_W, height: TRAY_H,
    borderWidth: 2, borderColor: INK, backgroundColor: STONE,
  },
  seam: { position: 'absolute', top: TRAY_Y, width: 4, height: TRAY_H, backgroundColor: INK },

  hit: { position: 'absolute', top: STONE_Y, width: STONE_D, height: STONE_D },
  stone: {
    position: 'absolute', left: 0, top: 0, width: STONE_D, height: STONE_D, borderRadius: STONE_D / 2,
    borderWidth: 2, borderColor: INK, backgroundColor: PAPER,
  },
  check: {
    position: 'absolute', left: STONE_D / 2 - 6, top: STONE_D / 2 - 6, width: 12, height: 12, borderRadius: 6,
    backgroundColor: INK,
  },
  stoneText: {
    position: 'absolute', top: LABEL_Y, width: LABEL_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.5, color: INK, includeFontPadding: false,
  },
});

export function Logic40Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Logic40Scene} band={[240, 512]} camera={CAM} />;
}
