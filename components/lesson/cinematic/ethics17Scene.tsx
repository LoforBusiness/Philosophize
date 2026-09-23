import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, clamp01, ease01, moveTr, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './ethics17Script';
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
const TONE = stageTone('ethics');
const { RULE, STONE, SHADE } = TONE;
const LIP = lipOf(TONE);   // the ledge a toned plate stands on (scripts/skin-stage.mjs)

// ─────────────────────────────────────────────────────────────────────────────
// A CARD, EIGHT COPIES OF IT, AND A BAR THAT PAYS FOR THEM.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the MAXIM is a 152×42 card at x 124…276, y 230…272, 2-thick ink border. It is
//   the only bordered object at the top of the stage, so it reads as the thing
//   being tested rather than a caption.
// · the COPIES are eight 32×24 cards at y 294…318, lefts 34 · 78 · 122 · 166 ·
//   210 · 254 · 298 · 342 — the run ends at x 374. Each slides UP from the maxim
//   card's own position as `copies` passes it, so they are visibly the same
//   object handed out rather than eight new ones appearing.
// · the STOCK is a bar at x 34…366, y 336…356, captioned BEING BELIEVED at y 324.
//   Its fill is `trust`; it is the only thing on the stage that goes DOWN.
// · the FIGURE walks x 200 → 132 → 268 on GROUND 500; crown ≈ 397, and the lowest
//   ink above him is the bar at 356, so 41 units stay clear at every stop.
//
// Ink runs y 230 (the maxim) … y 500. BAND 224…512 = 288, which puts the 103-unit
// figure at 36%.
//
// THE THREE TARGETS ARE THE THREE THINGS ALREADY DRAWN — the maxim, a copy, and
// the bar. Nothing is added for the question, so the reader answers about the
// picture they have been watching rather than about a control that just arrived.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const MAXIM_X = 124;
const MAXIM_Y = 230;
const MAXIM_W = 152;
const MAXIM_H = 42;

const COPY_Y = 294;
const COPY_W = 32;
const COPY_H = 24;
const COPY_X = [34, 78, 122, 166, 210, 254, 298, 342];
/** The tappable copy's box, grown to hold its own name above it (AN1). THE COPIES
 *  sets at 54.9 units at 8pt, so 56 is the narrowest box that holds it. */
const COPY_CAP_W = 56;
const COPY_CAP_H = 20;

const BAR_X = 34;
const BAR_Y = 336;
const BAR_W = 332;
const BAR_H = 20;

const FIG_X = 200;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along:
// +1 where it rises, -1 where it falls, and HOLD while he stands still, so a
// figure who walks left to something keeps facing it while he talks about it.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const MAXIM = BEATS.map((b) => b.maxim ?? 0);
const COPIES = BEATS.map((b) => b.copies ?? 0);
const TRUST = BEATS.map((b) => b.trust ?? 0);
const LIVE = BEATS.map((b) => b.live ?? 0);
const NOTE = BEATS.map((b) => b.note ?? 0);

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.sort ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('ethics17'));

export default function Ethics17Scene({ clock, bt, bi, i, picked, onPick, dragPos, pickPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldFig = useHeld();
  const cv = useCarry(4);
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;
  // ANIMATE ONLY WHAT CHANGED (C20c) — a one-shot flash, so it fires only on the
  // beat that raises its own point, never on a beat that merely holds it.
  const noteNow = (cur.note ?? 0) > 0 && (cur.note ?? 0) !== (prev?.note ?? 0) ? (cur.note ?? 0) : 0;
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
      maxim: carry(cv, 1, n, MAXIM[p], MAXIM[n], tr),
      copies: carry(cv, 2, n, COPIES[p], COPIES[n], tr),
      // R7b — the seam fills the BEING BELIEVED bar. Slide toward ON THE MURDERER
      // and telling the truth costs the stock nothing; slide the other way and the
      // bar drains, which is the price Kant refuses to pay.
      trust: carry(cv, 3, n, TRUST[p], reacting ? pickPos.value : TRUST[n], tr),
      // THE NOTE'S OWN PROGRESS, 0..1 across 1.1s of the beat it belongs to,
      // flatly 0 on every other beat — one flash per tap, not a loop.
      note: noteNow ? ease01(bt.value / 1.1) : 0,
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  // The name arrives with the things it names, on the copies' own track.
  const copiesInStyle = useAnimatedStyle(() => ({ opacity: clamp01(SCENE.value.copies * 8 - 1) }));
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const maximStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.maxim }));
  const fillStyle = useAnimatedStyle(() => ({ width: (BAR_W - 4) * SCENE.value.trust }));
  // Fades in over the first fifth of its window and out over the last, so it
  // arrives and leaves rather than cutting.
  const noteStyle = useAnimatedStyle(() => {
    const u = SCENE.value.note;
    return { opacity: u <= 0 || u >= 1 ? 0 : Math.min(1, Math.min(u, 1 - u) / 0.2) };
  });

  const copies = [0, 1, 2, 3, 4, 5, 6, 7];

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      {/* THE MAXIM, and the first target. */}
      <Animated.View style={[StyleSheet.absoluteFill, maximStyle]}>
        <Target
          id="maxim"
          correct={false}
          picked={picked}
          onPick={onPick}
          disabled={!live || answered}
          style={styles.maximHit}
        >
          <View
            style={[styles.maxim, answered && picked === 'maxim' && styles.wrong]}
            pointerEvents="none"
          >
            <Text style={styles.maximText}>LIE WHEN IT SUITS ME</Text>
          </View>
        </Target>
      </Animated.View>

      {copies.map((c) => <Copy key={c} S={SCENE} index={c} />)}

      {/* One copy is tappable — the second, so the hit box is nowhere near the
          edge of the stage and cannot be reached by accident. */}
      <Target
        id="copy"
        correct={false}
        picked={picked}
        onPick={onPick}
        disabled={!live || answered}
        style={[styles.copyHit, { left: COPY_X[1] - (COPY_CAP_W - COPY_W) / 2 }]}
      >
        {/* AN1 — THE COPIES ARE NAMED. The other two choices are a lettered card
            and a captioned bar; this was a blank 32-unit rectangle, so one of the
            three had nothing to choose it by. The name goes ABOVE the row: below it
            is BEING BELIEVED, which is a different answer's caption, and a word of
            one choice sitting under another is worse than no word at all. It rides
            the copies' own track, so it arrives when they do and is never on stage
            beside the notes that use this gap on beats 1–3. */}
        <Animated.View style={[styles.copyName, copiesInStyle]} pointerEvents="none">
          <Text style={styles.copyNameT}>THE COPIES</Text>
        </Animated.View>
        <View
          style={[styles.copyHitBox, answered && picked === 'copy' && styles.wrong]}
          pointerEvents="none"
        />
      </Target>

      {/* ── group AH: one flash per still tap, in the clear gap between the
          maxim card (bottom 272) and the bar's own caption (top 324) — empty
          until the copies spread down into it at beat 4. ── */}
      {/* Beat 1: Kant's answer — no exception, not even for this. */}
      {noteNow === 1 && (
        <Animated.View style={[styles.noteWrap, noteStyle]} pointerEvents="none">
          <View style={styles.notePlate}>
            <Text style={styles.noteWordT}>NO EXCEPTIONS</Text>
          </View>
        </Animated.View>
      )}
      {/* Beat 2: consistency is the argument; revulsion is set aside. */}
      {noteNow === 2 && (
        <Animated.View style={[styles.noteWrap, noteStyle]} pointerEvents="none">
          <Text style={styles.noteBigT}>CONSISTENCY</Text>
          <Text style={styles.noteStruckT}>not revulsion</Text>
        </Animated.View>
      )}
      {/* Beat 3: naming the card already on stage as the maxim. */}
      {noteNow === 3 && (
        <Animated.View style={[styles.noteWrap, noteStyle]} pointerEvents="none">
          <Text style={styles.noteArrowT}>▲</Text>
          <Text style={styles.noteWordT}>THIS IS THE MAXIM</Text>
        </Animated.View>
      )}

      {/* THE STOCK. The bar and its caption are one target: it is a single thing
          on the stage and splitting the hit box would be a puzzle about tapping.
          THE CAPTION IS THEREFORE INSIDE IT (S11). It used to be drawn alongside,
          twelve units above a bar that rises ten and swells six percent when the
          reader picks it — so the bar's PAPER face came up over BEING BELIEVED and
          wiped it, on the beat the reader got it right. A thing and the word for
          it ride together or the gap between them is not a gap. */}
      <Target
        id="trust"
        correct
        picked={picked}
        onPick={onPick}
        disabled={!live || answered}
        style={styles.barHit}
      >
        <Text style={styles.barCap} pointerEvents="none">BEING BELIEVED</Text>
        <View
          style={[styles.barBox, answered && picked === 'trust' && styles.rightBox]}
          pointerEvents="none"
        >
          <Animated.View style={[styles.barFill, fillStyle]} />
        </View>
      </Target>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

/**
 * One handed-out copy. It travels from the maxim card's own position to its slot
 * in the row, so the spread reads as distribution rather than as eight things
 * fading up in place.
 */
function Copy({ S, index }: { S: { value: { copies: number } }; index: number }) {
  const toX = COPY_X[index];
  const fromX = MAXIM_X + (MAXIM_W - COPY_W) / 2;
  const st = useAnimatedStyle(() => {
    const u = clamp01(S.value.copies * 8 - index);
    return {
      opacity: u,
      transform: [{ translateX: (toX - fromX) * u }, { translateY: (COPY_Y - MAXIM_Y - 8) * u }],
    };
  });
  return <Animated.View pointerEvents="none" style={[styles.copy, { left: fromX, top: MAXIM_Y + 8 }, st]} />;
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON. A rule on its own leaves the
  // figure and everything it is looking at standing on bare page;
  // political7 and political8 both stand their subject on a filled mass.
  floor: floorStyle(TONE, GROUND),

  maximHit: { position: 'absolute', left: MAXIM_X, top: MAXIM_Y, width: MAXIM_W, height: MAXIM_H },
  maxim: {
    width: MAXIM_W, height: MAXIM_H, borderWidth: 2, borderColor: INK, borderRadius: 8,
    backgroundColor: PLATE_FACE, boxShadow: LIP, alignItems: 'center', justifyContent: 'center',
  },
  maximText: {
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1, color: INK, includeFontPadding: false,
  },

  copy: {
    position: 'absolute', width: COPY_W, height: COPY_H,
    borderWidth: 1.5, borderColor: SOFT, borderRadius: 2, backgroundColor: STONE, boxShadow: LIP,
  },
  copyHit: {
    position: 'absolute', top: COPY_Y - COPY_CAP_H, width: COPY_CAP_W, height: COPY_H + COPY_CAP_H,
  },
  copyName: { position: 'absolute', left: 0, right: 0, top: 0, alignItems: 'center' },
  copyNameT: {
    // 8.6, not 8: this lesson's stage fit is 0.94, so 8 reaches the reader at 7.5
    // and `check:legible` calls that a blank box (D34). THE COPIES then sets at 58.5
    // with the house 0.8 of tracking and the slot is 56, so the tracking comes down
    // to 0.4 rather than the box growing into its neighbours (AN4).
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.4, color: SOFT, includeFontPadding: false,
  },
  copyHitBox: {
    position: 'absolute', left: (COPY_CAP_W - COPY_W) / 2, top: COPY_CAP_H,
    width: COPY_W, height: COPY_H, borderRadius: 2,
  },

  // Positioned against the TARGET now, not the stage, so it rides the answer lift
  // with the bar it names.
  barCap: {
    position: 'absolute', left: 0, top: -12, width: 200,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },
  barHit: { position: 'absolute', left: BAR_X, top: BAR_Y, width: BAR_W, height: BAR_H },
  barBox: {
    width: BAR_W, height: BAR_H, borderWidth: 2, borderColor: INK, borderRadius: 3,
    backgroundColor: PAPER, justifyContent: 'center', paddingHorizontal: 2,
  },
  barFill: { height: BAR_H - 8, backgroundColor: INK, borderRadius: 1 },

  rightBox: { borderColor: INK, borderWidth: 3 },
  wrong: { borderColor: SOFT },

  // ── the three tap events (group AH), one flash each in the gap above the
  // bar. A plain word for the plain answer (beat 1); a kept term beside a
  // struck one for the contrast (beat 2); an arrow naming what is already
  // drawn above it (beat 3).
  noteWrap: {
    position: 'absolute', left: 60, top: 280, width: 280, alignItems: 'center', justifyContent: 'center',
  },
  notePlate: {
    width: 150, borderWidth: 2, borderColor: INK, borderRadius: 6, backgroundColor: PLATE_FACE, boxShadow: LIP,
    paddingHorizontal: 10, paddingVertical: 5, alignItems: 'center',
  },
  noteWordT: {
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 0.8, color: INK, includeFontPadding: false,
    textAlign: 'center',
  },
  noteBigT: {
    fontFamily: 'Inter_700Bold', fontSize: 13, letterSpacing: 0.6, color: INK, includeFontPadding: false,
  },
  noteStruckT: {
    fontFamily: 'Inter_700Bold', fontSize: 9.5, color: SOFT, includeFontPadding: false,
    textDecorationLine: 'line-through', marginTop: 2,
  },
  noteArrowT: {
    fontFamily: 'Inter_700Bold', fontSize: 12, color: SOFT, includeFontPadding: false,
  },
});

export function Ethics17Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Ethics17Scene} band={[224, 512]} camera={CAM} />;
}
