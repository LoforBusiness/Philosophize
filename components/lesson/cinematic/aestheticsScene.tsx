import {
  View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { BEATS } from './aestheticsScript';
import {
  clamp01, ease01, emoteHold, emoteLive, lerp, mixStance, narratorHold, narratorLive, pose, stand, type Bundle, type Stance, } from './rig';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, PAPER, SIGH, useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { floorStyle, lipOf, PLATE_FACE } from './stageSkin';
import type { SceneApi } from './CinematicPlayer';
import { followMoves, kindOf, seedOf } from './camera';

// THE STAGE IS STRUCK IN THIS LESSON'S OWN BRANCH HUE (./stageTones).
// Same three tones, same luminance to the third decimal — so every contrast
// measured against the old greys still holds and nothing on the stage moved.
const TONE = stageTone('aesthetics');
const { RULE, STONE, SHADE } = TONE;
const LIP = lipOf(TONE);   // the ledge a toned plate stands on (scripts/skin-stage.mjs)

// ─────────────────────────────────────────────────────────────────────────────
// WHY THINGS FEEL BEAUTIFUL — Kant's two strange facts, drawn as a chart.
//
// Stage left, a framed sunset labelled BEAUTY glows and asks for nothing. Below
// it, an apple on a stand labelled APPETITE that the figure reaches to take.
// Stage right, a panel that carries the argument as information design and swaps
// halfway through the lesson:
//   · WHAT IT ASKS OF YOU — two bars: APPLE full, SUNSET empty (disinterest).
//   · WHO MUST AGREE — one pip for "I like it", eight for "It is beautiful"
//     (the judgement of taste reaching out for universal assent). The eight count
//     THEMSELVES IN, left to right, so assent is watched being gathered.
// A ripple travels from the figure to a small crowd as the second half opens.
//
// Hume gets his own chart in the empty lower-left quarter: a HACK↔MASTER axis
// with five scattered critics' verdicts that slide together into one tight band
// near the master end. That convergence IS his standard of taste — taste is
// personal, yet trained judges keep landing in the same place — and it plays as
// motion rather than as another sentence in the deck. Once raised it STAYS up for
// the rest of the lesson: nothing else ever occupies that quarter, and without it
// the bottom-left third of the stage was blank for the last four beats.
//
// CAMERA: none — design space is final space, so the figure stands on GROUND=500
// with its crown at ~361. Art occupies y 244..508 → band [234, 514].
// ─────────────────────────────────────────────────────────────────────────────

const TR = 0.82;

// the framed sunset
const FRAME_L = 24;
const FRAME_T = 246;
const FRAME_W = 144;
const FRAME_H = 108;
const SUN_CX = 69;                            // inside the frame's padding box
const SUN_CY = 66;
const SUN_R = 23;
const RAYS = [-70, -50, -30, -10, 10, 30, 50, 70];

// the glow, in stage coordinates, centred on the sun
const GLOW_R = 60;
const GLOW_CX = FRAME_L + 3 + SUN_CX;         // 96
const GLOW_CY = FRAME_T + 3 + SUN_CY;         // 315

// the chart panel
const P_L = 194;
const P_T = 244;
const P_W = 184;
const P_H = 104;
const TRACK_W = 108;

// 280, not 262, and the apple at 456, not 440: from the appetite on he leans toward
// the apple, and at 262 his head, hip and reaching hand were all drawn over it. The
// apple cannot go left — Hume's chart is at x 27..207 down to y 452 — so he stands
// back from it, reaching toward it with the hand stopping short.
const FIG_X = 280;
const APPLE_CX = 228;
const APPLE_CY = 456;
const APPLE_R = 15;

// Hume's standard of taste, in the quarter under the framed sunset that nothing
// else uses. Clear of the glow rings above (they bottom out at 375) and of the
// apple's stand to the right (x ≥ 213).
const CR_L = 26;
const CR_T = 386;
const CR_W = 176;
const CR_H = 66;
const AX_L = 14;                              // axis, card-relative
const AX_W = 146;
const CRIT_FROM = [16, 50, 80, 110, 140];     // five verdicts, all over the scale
const CRIT_TO = [116, 123, 130, 137, 144];    // …converging on one narrow band

// The ripple is centred just off the SPEAKER, not in the middle of the crowd, so
// it reads as the claim travelling outward from him to them. Radius 52 keeps its
// widest ring inside y 400..504 — the band's floor is 514.
const CROWD_X = [302, 328, 354, 380];
const RIPPLE_R = 52;
const RIPPLE_CX = 272;
const RIPPLE_CY = 452;

const HPOSE = BEATS.map((b) => b.hpose ?? 0);
const GLOW = BEATS.map((b) => (b.glow ? 1 : 0));
/**
 * A PROP DOES NOT LEAVE THE ROOM AND COME BACK.
 *
 * The apple's cue read 01001000 — on its stand for beat 1, gone for beats 2-3,
 * back for beat 4, gone again. It stands on a labelled plinth; a plinth whose
 * apple teleports away and returns is the kind of thing a reader notices without
 * being able to say what is wrong. This fills the gap between its first beat and
 * its last, and nothing beyond them, so it still arrives and leaves exactly when
 * the script intends. (`npm run check:props`.)
 */
function held(flags: number[]): number[] {
  const first = flags.indexOf(1);
  if (first < 0) return flags;
  const last = flags.lastIndexOf(1);
  return flags.map((_, i) => (i >= first && i <= last ? 1 : 0));
}
const APPLE = held(BEATS.map((b) => (b.apple ? 1 : 0)));
const CROWD = BEATS.map((b) => (b.crowd ? 1 : 0));
const CRIT = BEATS.map((b) => (b.critics ? 1 : 0));
/** 1 from the first beat whose flag is set, to the end: a thing that arrives and stays. */
function latch(flags: boolean[]): number[] {
  const first = flags.indexOf(true);
  return flags.map((_, k) => (first >= 0 && k >= first ? 1 : 0));
}
// ── EVERY TAP OF THE OPENING CHANGES THE PICTURE ────────────────────────────
// Eight taps of this lesson used to hold one frame, because the panel's first chart,
// its second chart, Hume's convergence and the crowd were all drawn before the
// sentence that names them. Each now arrives on its own words:
//   · the panel opens as the reader's VERDICT — “BEAUTIFUL”, stamped at once —
//     is named A JUDGEMENT OF TASTE, and lists the two questions that follow;
//   · Kant's chart builds a row at a time: the apple's bar fills on "you take an
//     apple", the sunset's NOTHING row on "you want nothing from it", the foot on
//     "free of desire";
//   · Hume's verdicts scatter on "masters above hacks" and CONVERGE on "make their
//     verdicts converge"; CRITIC and VERDICT point at each other on "circularity";
//   · WHO MUST AGREE opens on “I like it” with one pip, “it is beautiful” arrives
//     resting on one feeling (still one pip), and the other seven — with the crowd —
//     only on "demands the agreement of everyone".
const TASTE = latch(BEATS.map((b) => !!b.taste));
const QUESTIONS = latch(BEATS.map((b) => !!b.questions));
/** Kant's chart takes the panel from the beat the apple first arrives. */
const KANT = latch(BEATS.map((b) => !!b.apple));
const UNWANTED = latch(BEATS.map((b) => !!b.unwanted));
const DESIRELESS = latch(BEATS.map((b) => !!b.desireless));
const AGREE = latch(BEATS.map((b) => !!b.agree));
const CIRCULAR = latch(BEATS.map((b) => !!b.circular));
const ASSENT = latch(BEATS.map((b) => !!b.assent));
const CLAIM = latch(BEATS.map((b) => !!b.claim));
// The eight pips only count themselves in on the beat the crowd first appears.
const CROWDIN = CROWD.map((v, k) => (v === 1 && (k === 0 || CROWD[k - 1] === 0) ? 1 : 0));
const Q1 = BEATS.map((b) => (b.weigh === 'q1' ? 1 : 0));

function reachApple(t: number): Stance {
  'worklet';
  const s = stand(t);
  return { ...s, tilt: s.tilt - 0.06, neck: 0.10, fistR: { x: 25, y: -2 }, fistL: { x: -4, y: -4 } };
}
// THE MANNER (group M). Codes 0–6 are the seven narrator gestures and 7 is this
// lesson's reach for the apple. 8–11 are the put-upon poses — `SIGH` in
// cinematicKit — and they have to come from the WIDE library, because not one of
// the seven narrator gestures can fold its arms, put a hand on a hip or reach for
// its own forehead. Those four are the whole difference between a figure who is
// saying these lines and a figure who is cheerfully explaining underneath them.
//
// The range is bounded by two named codes rather than a bare `>= 8` so that the
// boundary moves if the repertoire ever does.
function hHold(code: number, t: number): Stance {
  'worklet';
  if (code === 7) return reachApple(t);
  if (code === 0) return stand(t);
  if (code >= SIGH.SHRUG && code <= SIGH.TEMPLE) return emoteHold(code, t);
  return narratorHold(code, t);
}
function hLive(code: number, t: number, bt: number): Stance {
  'worklet';
  if (code === 7) return reachApple(t);
  if (code === 0) return stand(t);
  if (code >= SIGH.SHRUG && code <= SIGH.TEMPLE) return emoteLive(code, t, bt);
  return narratorLive(code, t, bt);
}

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
const REACT = BEATS.map((b) => (b.interact?.split ? 1 : 0));
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('aesthetics'));

export default function AestheticsScene({ clock, bt, bi, qv, dragPos, i, gazeX, gazeY, gazeOn }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldFigS = useHeld();
  const cv = useCarry(12);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / TR);
    const t = clock.value;
    const q = clamp01(qv.value);

    const figS = keepHeld(heldFigS, mixStance(carryFrom(heldFigS, n,hHold(HPOSE[p], t)), hLive(HPOSE[n], t, bt.value), tr));
    // On Q1 the reaching hand and the apple fall away — pleasure that wants nothing.
    const appleOn = carry(cv, 0, n, APPLE[p], APPLE[n], tr, Q1[n] === 1 ? 1 - ease01(q) : 1);
    const glowOn = carry(cv, 1, n, GLOW[p], GLOW[n], tr, Q1[n] === 1 ? 1 + 0.4 * ease01(q) : 1);

    return {
      fig: lookPose(figS, FIG_X, GROUND, K_FIG, -1, 1, gazeX.value, gazeY.value, gazeOn.value),
      appleOn, glowOn, t,
      // R7b — the seam summons the crowd. Give the bar to EVERYBODY and the other
      // eight appear behind the judgement; give it back to ONLY YOURSELF and they go,
      // leaving one person liking something. That is the whole of Kant's oddity.
      crowdOn: carry(cv, 2, n, CROWD[p], reacting ? dragPos.value : CROWD[n], tr),
      criticsOn: carry(cv, 3, n, CRIT[p], CRIT[n], tr),
      // The verdicts slide together on the beat that says they converge, and STAY
      // together from then on — including while the card fades out, since a chart
      // that un-converges on its way off stage would undo its own point.
      converge: AGREE[n] === 1 ? (AGREE[p] === 1 ? 1 : ease01((bt.value - 0.45) / 1.15)) : 0,
      // Seconds since the crowd rose (or a large number if it was already up), so
      // the seven other assent pips can count themselves in one at a time.
      pipT: CROWDIN[n] === 1 ? bt.value : 9,
      // “BEAUTIFUL” is judged AT ONCE — it stamps down just after the lesson opens.
      stamp: n === 0 ? ease01((bt.value - 0.35) / 0.3) : 1,
      taste: carry(cv, 4, n, TASTE[p], TASTE[n], tr),
      asks: carry(cv, 5, n, QUESTIONS[p], QUESTIONS[n], tr),
      kant: carry(cv, 6, n, KANT[p], KANT[n], tr),
      unwanted: carry(cv, 7, n, UNWANTED[p], UNWANTED[n], tr),
      desireless: carry(cv, 8, n, DESIRELESS[p], DESIRELESS[n], tr),
      circular: carry(cv, 9, n, CIRCULAR[p], CIRCULAR[n], tr),
      assent: carry(cv, 10, n, ASSENT[p], ASSENT[n], tr),
      claim: carry(cv, 11, n, CLAIM[p], CLAIM[n], tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const appleStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.appleOn }));

  return (
    <View style={styles.scene}>
      <Glow S={SCENE} off={0} />
      <Glow S={SCENE} off={0.33} />
      <Glow S={SCENE} off={0.66} />
      <SunsetFrame />
      <Panel S={SCENE} />
      <Critics S={SCENE} />
      <Circularity S={SCENE} />
      <Crowd S={SCENE} />
      <View style={styles.ground} pointerEvents="none" />

      {/* the apple of appetite, on its labelled stand */}
      <Animated.View style={[StyleSheet.absoluteFill, appleStyle]} pointerEvents="none">
        <View style={styles.applePost} />
        <View style={styles.appleStem} />
        <View style={styles.apple} />
        <Text style={styles.appleLabel}>APPETITE</Text>
        <View style={styles.appleLead} />
      </Animated.View>

      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

// ── the sunset: a framed picture that glows ──────────────────────────────────

function Glow({ S, off }: { S: SharedValue<any>; off: number }) {
  const st = useAnimatedStyle(() => {
    const ph = ((S.value.t * 0.42 + off) % 1 + 1) % 1;
    return { opacity: S.value.glowOn * (1 - ph) * 0.5, transform: [{ scale: 0.4 + ph * 0.6 }] };
  });
  return <Animated.View style={[styles.glowRing, st]} pointerEvents="none" />;
}

function SunsetFrame() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={styles.frame}>
        <View style={styles.horizon} />
        {/* The ray bar is laid out CENTRED on the origin (left/top = −half), so
            translate→rotate→translate places it at a true radius in every
            direction; laying it out at 0,0 skews the fan by half its own size. */}
        {RAYS.map((a) => (
          <View
            key={a}
            style={[
              styles.ray,
              { transform: [{ translateX: SUN_CX }, { translateY: SUN_CY }, { rotate: `${a}deg` }, { translateY: -34 }] },
            ]}
          />
        ))}
        <View style={styles.sun} />
      </View>
      <Text style={styles.frameLabel}>BEAUTY</Text>
    </View>
  );
}

// ── the crowd the judgement of taste reaches for ─────────────────────────────

function Ripple({ S, off }: { S: SharedValue<any>; off: number }) {
  const st = useAnimatedStyle(() => {
    const ph = ((S.value.t * 0.5 + off) % 1 + 1) % 1;
    return { opacity: S.value.crowdOn * (1 - ph) * 0.45, transform: [{ scale: 0.4 + ph * 0.6 }] };
  });
  return <Animated.View style={[styles.ripple, st]} pointerEvents="none" />;
}

function Crowd({ S }: { S: SharedValue<any> }) {
  const wrap = useAnimatedStyle(() => ({ opacity: S.value.crowdOn }));
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Ripple S={S} off={0} />
      <Ripple S={S} off={0.5} />
      <Animated.View style={[StyleSheet.absoluteFill, wrap]}>
        {CROWD_X.map((x) => (
          <View key={x} style={{ position: 'absolute', left: x - 9, top: 440 }}>
            <View style={styles.crowdHead} />
            <View style={styles.crowdBody} />
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

// ── Hume: five critics' verdicts converging into a standard ──────────────────

function CriticTick({ S, from, to }: { S: SharedValue<any>; from: number; to: number }) {
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: lerp(from, to, S.value.converge) }] }));
  return <Animated.View style={[styles.critTick, st]} />;
}

function Critics({ S }: { S: SharedValue<any> }) {
  const wrap = useAnimatedStyle(() => ({ opacity: S.value.criticsOn }));
  return (
    <Animated.View style={[styles.critCard, wrap]} pointerEvents="none">
      <Text style={styles.critCap}>STANDARD OF TASTE</Text>
      {CRIT_FROM.map((f, k) => <CriticTick key={f} S={S} from={f} to={CRIT_TO[k]} />)}
      <View style={styles.critAxis} />
      <View style={[styles.critEnd, { left: AX_L }]} />
      <View style={[styles.critEnd, { left: AX_L + AX_W - 2 }]} />
      <Text style={[styles.critEndLabel, { left: 12 }]}>HACK</Text>
      <Text style={[styles.critEndLabel, { right: 12 }]}>MASTER</Text>
    </Animated.View>
  );
}

// "A true critic is recognised by sound verdicts, yet sound verdicts are defined
// as those of true critics." Two words under Hume's chart, each pointing at the
// other; the two arrows drift against each other, so the loop never settles.
function Circularity({ S }: { S: SharedValue<any> }) {
  const wrap = useAnimatedStyle(() => {
    const u = S.value.circular * S.value.criticsOn;
    return { opacity: u, transform: [{ translateY: (1 - S.value.circular) * -6 }] };
  });
  const over = useAnimatedStyle(() => ({ transform: [{ translateX: Math.sin(S.value.t * 2.1) * 1.5 }] }));
  const under = useAnimatedStyle(() => ({ transform: [{ translateX: -Math.sin(S.value.t * 2.1) * 1.5 }] }));
  return (
    <Animated.View style={[styles.loop, wrap]} pointerEvents="none">
      <Text style={styles.loopWord}>CRITIC</Text>
      <View style={styles.loopArrows}>
        <Animated.Text style={[styles.loopArrow, over]}>→</Animated.Text>
        <Animated.Text style={[styles.loopArrow, under]}>←</Animated.Text>
      </View>
      <Text style={styles.loopWord}>VERDICT</Text>
    </Animated.View>
  );
}

// ── the panel: two charts, swapped by the lesson's second half ───────────────

// A row of Kant's chart: a label and a track. The APPLE row arrives with the chart
// and its bar fills as it does (appetite asks for the apple); the SUNSET row writes
// in on its own beat with an empty track marked NOTHING.
function Bar({ S, top, which }: { S: SharedValue<any>; top: number; which: 'apple' | 'sunset' }) {
  const apple = which === 'apple';
  const rowStyle = useAnimatedStyle(() => {
    const u = apple ? 1 : S.value.unwanted;
    return { opacity: u, transform: [{ translateX: (1 - u) * -8 }] };
  });
  const fillStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: 0.02 + 0.98 * S.value.kant }] }));
  return (
    <Animated.View style={[styles.barRow, { top }, rowStyle]}>
      <Text style={styles.barLabel}>{apple ? 'APPLE' : 'SUNSET'}</Text>
      <View style={styles.track}>
        {apple ? <Animated.View style={[styles.trackFill, fillStyle]} /> : null}
        {apple ? null : <Text style={styles.trackNote}>NOTHING</Text>}
      </View>
    </Animated.View>
  );
}

// One pip = one person the claim reaches for. In the eight-pip row the FIRST is
// the speaker's own feeling, there as soon as the claim is written; the other seven
// count themselves in, left to right, only when the claim demands everyone's
// agreement — and on the question they follow the seam, as the crowd does.
function Pip({ S, k, row }: { S: SharedValue<any>; k: number; row: 'like' | 'claim' }) {
  const st = useAnimatedStyle(() => {
    if (row === 'like') return { opacity: 1, transform: [{ scale: 1 }] };
    if (k === 0) return { opacity: S.value.claim, transform: [{ scale: 0.5 + 0.5 * S.value.claim }] };
    const u = ease01((S.value.pipT - 0.55 - k * 0.085) / 0.24) * S.value.crowdOn;
    return { opacity: u, transform: [{ scale: 0.5 + 0.5 * u }] };
  });
  return <Animated.View style={[styles.pip, st]} />;
}

function Pips({ S, top, n, row }: { S: SharedValue<any>; top: number; n: number; row: 'like' | 'claim' }) {
  const out: number[] = [];
  for (let k = 0; k < n; k++) out.push(k);
  return (
    <View style={{ position: 'absolute', left: 12, top, flexDirection: 'row' }}>
      {out.map((k) => <Pip key={k} S={S} k={k} row={row} />)}
    </View>
  );
}

function Question({ S, top, n, text }: { S: SharedValue<any>; top: number; n: number; text: string }) {
  const st = useAnimatedStyle(() => {
    const u = clamp01(S.value.asks * 2 - n);
    return { opacity: u, transform: [{ translateX: (1 - u) * -8 }] };
  });
  return (
    <Animated.View style={[styles.qRow, { top }, st]}>
      <View style={styles.qBadge}><Text style={styles.qBadgeText}>{n + 1}</Text></View>
      <Text style={styles.qText}>{text}</Text>
    </Animated.View>
  );
}

// THREE CARDS IN ONE PANEL, in the order the lesson needs them: the reader's own
// VERDICT, then Kant's WHAT IT ASKS OF YOU, then WHO MUST AGREE. Each hands over by
// cross-fading in place, and each writes its rows in as the narration reaches them.
function Panel({ S }: { S: SharedValue<any> }) {
  const intro = useAnimatedStyle(() => ({ opacity: 1 - S.value.kant }));
  const first = useAnimatedStyle(() => ({ opacity: S.value.kant * (1 - S.value.assent) }));
  const second = useAnimatedStyle(() => ({ opacity: S.value.assent }));
  // The heading hands over through a gap rather than a blend, so the two never
  // sit on top of each other at half strength.
  const capVerdict = useAnimatedStyle(() => ({ opacity: 1 - clamp01(S.value.taste * 2) }));
  const capTaste = useAnimatedStyle(() => ({ opacity: clamp01(S.value.taste * 2 - 1) }));
  const stamp = useAnimatedStyle(() => ({
    opacity: S.value.stamp,
    transform: [{ scale: 1.35 - 0.35 * S.value.stamp }, { rotate: `${(1 - S.value.stamp) * -7}deg` }],
  }));
  const foot = useAnimatedStyle(() => ({
    opacity: S.value.desireless, transform: [{ translateY: (1 - S.value.desireless) * 5 }],
  }));
  const claimLabel = useAnimatedStyle(() => ({
    opacity: S.value.claim, transform: [{ translateX: (1 - S.value.claim) * -8 }],
  }));
  return (
    <View style={styles.panel} pointerEvents="none">
      <Animated.View style={[StyleSheet.absoluteFill, intro]}>
        <Animated.Text style={[styles.panelCap, capVerdict]}>YOUR VERDICT</Animated.Text>
        <Animated.Text style={[styles.panelCap, capTaste]}>A JUDGEMENT OF TASTE</Animated.Text>
        <Animated.Text style={[styles.verdict, stamp]}>“BEAUTIFUL”</Animated.Text>
        <Question S={S} top={54} n={0} text="WHAT PLEASURE?" />
        <Question S={S} top={76} n={1} text="SPEAKS FOR WHOM?" />
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, first]}>
        <Text style={styles.panelCap}>WHAT IT ASKS OF YOU</Text>
        <Bar S={S} top={26} which="apple" />
        <Bar S={S} top={54} which="sunset" />
        <Animated.Text style={[styles.panelFoot, foot]}>BEAUTY WANTS NOTHING</Animated.Text>
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, second]}>
        <Text style={styles.panelCap}>WHO MUST AGREE?</Text>
        <Text style={[styles.rowLabel, { top: 26 }]}>“I LIKE IT”</Text>
        <Pips S={S} top={42} n={1} row="like" />
        <Animated.Text style={[styles.rowLabel, { top: 62 }, claimLabel]}>“IT IS BEAUTIFUL”</Animated.Text>
        <Pips S={S} top={78} n={8} row="claim" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },

  glowRing: {
    position: 'absolute', left: GLOW_CX - GLOW_R, top: GLOW_CY - GLOW_R,
    width: GLOW_R * 2, height: GLOW_R * 2, borderRadius: GLOW_R,
    borderWidth: 1.5, borderColor: SOFT,
  },
  frame: {
    position: 'absolute', left: FRAME_L, top: FRAME_T, width: FRAME_W, height: FRAME_H,
    borderWidth: 3, borderColor: INK, backgroundColor: STONE, boxShadow: LIP, overflow: 'hidden',
  },
  frameLabel: {
    position: 'absolute', left: FRAME_L, top: FRAME_T + FRAME_H + 5, width: FRAME_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 2, color: SOFT, includeFontPadding: false,
  },
  horizon: { position: 'absolute', left: 0, right: 0, top: SUN_CY, height: 1.5, backgroundColor: INK },
  sun: {
    position: 'absolute', left: SUN_CX - SUN_R, top: SUN_CY - SUN_R, width: SUN_R * 2, height: SUN_R * 2,
    borderRadius: SUN_R, borderWidth: 2.5, borderColor: INK, backgroundColor: PAPER,
  },
  ray: { position: 'absolute', left: -1, top: -7, width: 2, height: 14, backgroundColor: INK },

  apple: {
    position: 'absolute', left: APPLE_CX - APPLE_R, top: APPLE_CY - APPLE_R,
    width: APPLE_R * 2, height: APPLE_R * 2, borderRadius: APPLE_R,
    borderWidth: 2.5, borderColor: INK, backgroundColor: PAPER,
  },
  appleStem: {
    position: 'absolute', left: APPLE_CX - 1, top: APPLE_CY - APPLE_R - 6, width: 2.5, height: 8,
    backgroundColor: INK, transform: [{ rotate: '18deg' }],
  },
  applePost: {
    position: 'absolute', left: APPLE_CX - 2, top: APPLE_CY + APPLE_R - 2, width: 4, height: GROUND - APPLE_CY - APPLE_R + 2,
    backgroundColor: SOFT,
  },
  // Callout LOW and to the LEFT of the stand, with a leader line running into the
  // post so it still reads as a label rather than a floating word. It cannot sit
  // centred under the apple (the figure's shins occupy x 248..276 all the way to
  // the ground) nor beside it (that band belongs to Hume's chart, y 386..452).
  appleLabel: {
    position: 'absolute', left: 128, top: 480, width: 78, textAlign: 'right',
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.8, color: SOFT, includeFontPadding: false,
  },
  appleLead: { position: 'absolute', left: 210, top: 485, width: 16, height: 1.5, backgroundColor: SOFT },

  critCard: {
    position: 'absolute', left: CR_L, top: CR_T, width: CR_W, height: CR_H,
    borderWidth: 2, borderColor: INK, borderRadius: 8, backgroundColor: PLATE_FACE, boxShadow: LIP,
  },
  critCap: {
    position: 'absolute', left: 12, top: 7,
    fontFamily: 'Inter_700Bold', fontSize: 9.5, letterSpacing: 1.2, color: INK, includeFontPadding: false,
  },
  // Verdict marks stand ON the axis, so their spread reads as disagreement and
  // their huddle reads as a verdict.
  critTick: { position: 'absolute', left: 0, top: 22, width: 2.5, height: 18, backgroundColor: INK, borderRadius: 1 },
  critAxis: { position: 'absolute', left: AX_L, top: 40, width: AX_W, height: 2, backgroundColor: INK },
  critEnd: { position: 'absolute', top: 35, width: 2, height: 8, backgroundColor: INK },
  critEndLabel: {
    position: 'absolute', top: 46,
    fontFamily: 'Inter_700Bold', fontSize: 10.5, letterSpacing: 0.6, color: INK, includeFontPadding: false,
  },

  ripple: {
    position: 'absolute', left: RIPPLE_CX - RIPPLE_R, top: RIPPLE_CY - RIPPLE_R,
    width: RIPPLE_R * 2, height: RIPPLE_R * 2, borderRadius: RIPPLE_R,
    borderWidth: 1.5, borderColor: SOFT,
  },
  crowdHead: { width: 18, height: 18, borderRadius: 9, backgroundColor: INK },
  crowdBody: { position: 'absolute', left: 7.5, top: 18, width: 3.5, height: 42, backgroundColor: INK },

  panel: {
    position: 'absolute', left: P_L, top: P_T, width: P_W, height: P_H,
    borderWidth: 2, borderColor: INK, borderRadius: 8, backgroundColor: STONE, boxShadow: LIP,
  },
  panelCap: {
    position: 'absolute', left: 12, top: 8,
    fontFamily: 'Inter_700Bold', fontSize: 9.5, letterSpacing: 1.3, color: INK, includeFontPadding: false,
  },
  panelFoot: {
    position: 'absolute', left: 12, top: 82,
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.1, color: INK, includeFontPadding: false,
  },
  barLabel: {
    width: 50, fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 0.4, color: INK, includeFontPadding: false,
  },
  track: {
    width: TRACK_W, height: 16, borderWidth: 1.5, borderColor: INK, borderRadius: 3,
    backgroundColor: STONE, boxShadow: LIP, overflow: 'hidden', justifyContent: 'center',
  },
  barRow: { position: 'absolute', left: 12, flexDirection: 'row', alignItems: 'center' },
  trackFill: {
    position: 'absolute', left: 0, top: 0, bottom: 0, width: TRACK_W,
    backgroundColor: INK, transformOrigin: '0% 50%',
  },
  trackNote: {
    textAlign: 'center', fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.2,
    color: INK, includeFontPadding: false,
  },
  rowLabel: {
    position: 'absolute', left: 12,
    fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 0.3, color: INK, includeFontPadding: false,
  },
  pip: { width: 14, height: 14, borderRadius: 3, borderWidth: 1.5, borderColor: INK, backgroundColor: INK, marginRight: 5 },

  // ── the verdict card (the panel's first face) ──────────────────────────────
  // “BEAUTIFUL” measures 123 at 16px (166 at the stamp's opening 1.35×, still
  // inside the face); the two questions 98 and 112 from x 33, so the widest line
  // ends at 145 in a 180-wide face. Rows end at 91 of 100.
  verdict: {
    position: 'absolute', left: 12, top: 24,
    fontFamily: 'Inter_700Bold', fontSize: 16, lineHeight: 20, letterSpacing: 1.5, color: INK,
    includeFontPadding: false, transformOrigin: '0% 50%',
  },
  qRow: { position: 'absolute', left: 12, height: 15, flexDirection: 'row', alignItems: 'center' },
  qBadge: {
    width: 15, height: 15, borderRadius: 3, backgroundColor: INK,
    alignItems: 'center', justifyContent: 'center', marginRight: 6,
  },
  qBadgeText: { fontFamily: 'Inter_700Bold', fontSize: 9.5, lineHeight: 12, color: PAPER, includeFontPadding: false },
  qText: {
    fontFamily: 'Inter_700Bold', fontSize: 10, lineHeight: 13, letterSpacing: 0.4, color: INK, includeFontPadding: false,
  },

  // ── Hume's circle, under his chart ─────────────────────────────────────────
  // x 28…128, y 458…476: under the card (its lip ends at 455), left of the apple's
  // APPETITE callout (its ink starts at x 143) and far from the figure (x ≥ 230).
  loop: { position: 'absolute', left: 28, top: 458, height: 18, flexDirection: 'row', alignItems: 'center' },
  loopWord: {
    fontFamily: 'Inter_700Bold', fontSize: 9, lineHeight: 11, letterSpacing: 0.6, color: INK, includeFontPadding: false,
  },
  loopArrows: { width: 14, height: 18, marginHorizontal: 4, alignItems: 'center', justifyContent: 'center' },
  loopArrow: {
    fontFamily: 'Inter_700Bold', fontSize: 9, lineHeight: 9, color: INK, includeFontPadding: false, textAlign: 'center',
  },
});

// Extremes: the chart panel's top edge (244) and the frame at 246 down to the
// figure's ankle joints (~507). The glow rings reach y 255..375 at full scale,
// the ripple rings y 400..504, Hume's chart y 386..452 with its circle under it at
// y 458..476, the crowd y 440..500 and the apple's callout y 468..480 — all inside
// the slice, with the figure's crown
// at ~361 sitting in the gap between the panel's floor (348) and Hume's card.
//
// 280 units is also the tightest band that still pays: the stage region is about
// 923×647 device px, so 647/280 ≈ 923/400. Crop harder and the WIDTH becomes the
// limit — the art stops growing while the risk of clipping keeps rising.
export function AestheticsLesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={AestheticsScene} band={[234, 514]} camera={CAM} />;
}
