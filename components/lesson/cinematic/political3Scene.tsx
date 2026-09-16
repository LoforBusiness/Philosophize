import {
  View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, lerp, mixStance, pose, type Bundle } from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './political3Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, reactPose,
} from './cinematicKit';
import { stageTone } from './stageTones';
import type { SceneApi } from './CinematicPlayer';
import { followMoves, kindOf, seedOf } from './camera';

// THE STAGE IS STRUCK IN THIS LESSON'S OWN BRANCH HUE (./stageTones).
// Same three tones, same luminance to the third decimal — so every contrast
// measured against the old greys still holds and nothing on the stage moved.
const { RULE, STONE, SHADE } = stageTone('political-philosophy');
const LIP = `0px 3px 0px ${SHADE}`;   // the shaded lip a toned plate stands on (scripts/lip-stage.mjs)

// The right to rule, drawn as a CIRCUIT and a COMPARISON.
//
// MIDDLE — one corridor that holds two opposite diagrams, on exactly the same two
// rails. On the hook it is BARE FORCE: a heavy arrow driven DOWN the top rail from
// ruler to ruled, and on the bottom rail a struck-out return arrow — nothing is
// owed back. From the contract beat that is replaced, rail for rail, by the
// CIRCUIT: a scroll of consent travels UP the top rail from the ruled to the
// ruler, and protected rights flow back along the bottom one. Because the two
// diagrams share their geometry, the swap itself teaches the beat's distinction —
// power compels, legitimacy is owed. On the Locke beat the whole exchange is then
// stamped HELD IN TRUST, struck on at an angle like a clerk's seal.
//
// TOP — the comparison, two panels either side of a VS divider. It first holds
// POWER (makes you obey) against LEGITIMACY (makes you owe), then swaps to
// Rousseau's split: the WILL OF ALL drawn as arrows pulling every which way, the
// GENERAL WILL as the same arrows in rank.
//
// ── EVERY TAP OF THE OPENING CHANGES THE PICTURE ────────────────────────────
// Four taps of this opener used to hold one frame, and one put the whole Hobbes-
// to-Locke circuit up on a sentence about the state of nature. Now each sentence
// brings what it names: the POWER / LEGITIMACY panel on the sentence that defines
// them; on "a condition with no government … a state of war" the crown lifts off
// the ruler and the corridor holds two arrows meeting head on; on "escape the war by
// covenant … set up a sovereign" the consent scroll travels and the crown comes
// back; the RIGHTS PROTECTED return arrives with Locke, who is the one that says
// it; the 1776 Declaration is pinned up on the sentence about it, in the panel
// corridor Rousseau's panel then takes over; and GENERAL WILL is struck in ink on
// "citizens who obey the general will". Everything that shares a corridor hands
// over with the same staggered gate the force diagram and the circuit already use.
//
// COMPOSITION / OCCLUSION CONTRACT
//   · Subject at x = 66 (spans ~18–114), ruler at x = 334 (spans ~286–382), both
//     on GROUND = 500 with crowns near y 361.
//   · Every corridor part — both diagrams — lives in x 122–278 between them, and
//     every panel sits at y 240–322, above both crowns.
//   · The ruler's crown is the one prop that sits over a figure, at y 326–346 —
//     deliberately, and still 15 units clear of the head.
//   · The force diagram and the circuit hand over with a STAGGERED gate rather
//     than a cross-fade, so the corridor never shows both at half opacity.
//   · Nothing is drawn above y 222 or below the ankle joints at y ≈ 507.4, hence
//     band [214, 512].

const SUB_X = 66;
const R_X = 334;

const BOX_W = 172;
const BOX_H = 82;
const BOX_T = 240;
const BOX_L = [14, 214];

const COR_L = 122;                 // the corridor between the two figures
const COR_W = 156;
const UP_Y = 389;                  // the consent arrow
const DOWN_Y = 458;                // the protection arrow
const SCROLL_W = 32;
const CLASH_GAP = 6;               // between the two arrowheads of the state of war

// The Declaration, pinned in the panel corridor (x 134..266, y 240..316): the
// panels are down on both beats it is up, and it is gone before Rousseau's arrive.
const DECL_L = 134;
const DECL_T = 240;
const DECL_W = 132;
const DECL_H = 76;

// Mode 1 sets power against legitimacy; mode 2 is Rousseau's split. The panels
// keep their geometry and swap only their words, so nothing ever reflows.
interface Panel {
  title: string;
  left: { name: string; sub: string };
  right: { name: string; sub: string };
}
const PANELS: (Panel | null)[] = [
  null,
  {
    title: 'TWO DIFFERENT THINGS',
    left: { name: 'POWER', sub: 'makes you obey' },
    right: { name: 'LEGITIMACY', sub: 'makes you owe' },
  },
  {
    title: 'ROUSSEAU SPLITS THEM',
    left: { name: 'WILL OF ALL', sub: 'the sum of private wants' },
    right: { name: 'GENERAL WILL', sub: 'what serves everyone' },
  },
];

// Six arrows per panel: scattered on the left (private wants pulling apart),
// in rank on the right (one direction that serves the whole).
const SCATTER = ['-38deg', '22deg', '-12deg', '44deg', '-55deg', '14deg'];
const ALIGNED = ['0deg', '0deg', '0deg', '0deg', '0deg', '0deg'];

const SUB_CODE = BEATS.map((b) => b.sub ?? 0);
const R_CODE = BEATS.map((b) => b.r ?? 0);
const SCROLL = BEATS.map((b) => b.scroll ?? 0);
const FORCE = BEATS.map((b) => b.force ?? 0);
const FLOW = BEATS.map((b) => b.flow ?? 0);
const SEAL = BEATS.map((b) => b.seal ?? 0);
const NAT = BEATS.map((b) => b.nat ?? 0);
const CROWN = BEATS.map((b) => b.crown ?? 1);
const RIGHTS = BEATS.map((b) => b.rights ?? 0);
const DECL = BEATS.map((b) => b.decl ?? 0);
const WILL = BEATS.map((b) => b.will ?? 0);
const PAIR_ON = BEATS.map((b) => ((b.pair ?? 0) > 0 ? 1 : 0));
// A beat that shows no panel still remembers the last one, so the fade-OUT keeps
// the words it was showing instead of blanking mid-transition.
const PAIR_MODE = (() => {
  let last = 1;
  return BEATS.map((b) => {
    if ((b.pair ?? 0) > 0) last = b.pair as number;
    return last;
  });
})();

// THE CAMERA (H60b). `followMoves` reads the x track and gives each beat its own
// shot: it FOLLOWS the subject when a beat moves far enough to be worth following,
// pushes close on a quote, and PULLS BACK to the whole band on a question or a
// summary — the beats the reader has to read and act on.
// Two figures at 66 and 334, so the track is the point BETWEEN them (200) — following
// either one alone would frame the other out, and here the pair is the subject.
const X = BEATS.map((b) => b.x ?? 200);

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.drag ? 1 : 0));
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('political3'));

export default function Political3Scene({ clock, bt, bi, i, dragPos }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldSub = useHeld();
  const cv = useCarry(10);
  const heldR = useHeld();
  const mode = PAIR_MODE[i];
  const panel = PANELS[mode] ?? PANELS[1]!;
  const rots = mode === 2 ? SCATTER : null;

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.85);
    const t = clock.value;

    const sub = keepHeld(heldSub, mixStance(carryFrom(heldSub, n, emoteHold(SUB_CODE[p], t)), emoteLive(SUB_CODE[n], t, bt.value), tr));
    const r = keepHeld(heldR, mixStance(carryFrom(heldR, n, emoteHold(R_CODE[p], t)), emoteLive(R_CODE[n], t, bt.value), tr));
    return {
      sub: reactPose(sub, SUB_X, GROUND, K_FIG, 1, 1),
      ruler: pose(r, R_X, GROUND, K_FIG, -1, 1),
      // The scroll's journey is DELAYED into the back half of the transition, so it
      // is still near the subject's end of the rail at the moment the circuit
      // becomes visible — otherwise it would pop into view already delivered.
      scroll: ease01(clamp01((carry(cv, 0, n, SCROLL[p], SCROLL[n], tr) - 0.45) / 0.55)),
      // R7c — the HELD IN TRUST stamp is exactly what the drag is about: at 'they are
      // the same thing' it is struck across the circuit, and it lifts as the reader
      // says a vote reaches less and less of the general will.
      seal: carry(cv, 1, n, SEAL[p], reacting ? 1 - dragPos.value : SEAL[n], tr),
      // The panels share their corridor with the Declaration, so they take the same
      // staggered gate as the two diagrams below: off by 45%, on from 55%.
      pair: ease01(clamp01((carry(cv, 2, n, PAIR_ON[p], PAIR_ON[n], tr) - 0.55) / 0.45)),
      // The corridor's two diagrams hand over in stages: force is off the rails by
      // 45% of the transition, the circuit goes up from 55%, and the corridor is
      // briefly — deliberately — empty between them. Cross-fading them left both at
      // half opacity on top of each other, which on a phone reads as a smudge.
      force: ease01(clamp01((carry(cv, 3, n, FORCE[p], FORCE[n], tr) - 0.55) / 0.45)),
      flow: ease01(clamp01((carry(cv, 4, n, FLOW[p], FLOW[n], tr) - 0.55) / 0.45)),
      // The state of nature is the third tenant of that corridor, on the same gate.
      nat: ease01(clamp01((carry(cv, 5, n, NAT[p], NAT[n], tr) - 0.55) / 0.45)),
      crown: carry(cv, 6, n, CROWN[p], CROWN[n], tr),
      // The return half only ever arrives onto a circuit that is already up.
      rights: carry(cv, 7, n, RIGHTS[p], RIGHTS[n], tr),
      decl: ease01(clamp01((carry(cv, 8, n, DECL[p], DECL[n], tr) - 0.55) / 0.45)),
      will: carry(cv, 9, n, WILL[p], WILL[n], tr),
      t,
    };
  });

  const DS = useDerivedValue<Bundle>(() => SCENE.value.sub);
  const DR = useDerivedValue<Bundle>(() => SCENE.value.ruler);

  const forceStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.force }));
  const flowStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.flow }));
  const scrollStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.flow,
    transform: [{ translateX: lerp(0, COR_W - SCROLL_W - 18, SCENE.value.scroll) }],
  }));
  // The seal lands like a stamp: oversized, then driven down onto the page.
  const sealStyle = useAnimatedStyle(() => {
    const u = ease01(SCENE.value.seal);
    return { opacity: clamp01(SCENE.value.seal * 2), transform: [{ rotate: '-5deg' }, { scale: 1 + 0.55 * (1 - u) }] };
  });
  const pairStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.pair,
    transform: [{ translateY: (1 - SCENE.value.pair) * -8 }],
  }));
  const natStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.nat }));
  // No government: the crown lifts clear of the ruler and goes; the covenant sets it back down.
  const crownStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.crown,
    transform: [{ translateY: (1 - SCENE.value.crown) * -14 }],
  }));
  // Protection flows back from the ruler's end, so the arrow arrives travelling left.
  // It rides the circuit's gate too, so the summary takes both halves down together.
  const rightsStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.rights * SCENE.value.flow,
    transform: [{ translateX: (1 - SCENE.value.rights) * 14 }],
  }));
  const declStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.decl,
    transform: [{ translateY: (1 - SCENE.value.decl) * -8 }, { rotate: '-2deg' }],
  }));
  // The GENERAL WILL panel is struck, not tinted: its ink face comes up as its
  // stone face's words go, so no ink word ever sits under the ink plate.
  const willStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.will }));
  const willOffStyle = useAnimatedStyle(() => ({ opacity: 1 - SCENE.value.will }));

  return (
    <Animated.View style={styles.scene}>
      {/* ── the comparison panels ────────────────────────────────────────────── */}
      <Animated.View style={[StyleSheet.absoluteFill, pairStyle]} pointerEvents="none">
        <Text style={styles.title}>{panel.title}</Text>

        <View style={[styles.box, { left: BOX_L[0] }]}>
          <Text style={styles.boxName}>{panel.left.name}</Text>
          <Text style={styles.boxSub}>{panel.left.sub}</Text>
          {rots ? <ArrowRow rots={SCATTER} /> : null}
        </View>

        <View style={[styles.box, { left: BOX_L[1] }]}>
          <Animated.View style={[StyleSheet.absoluteFill, willOffStyle]}>
            <Text style={styles.boxName}>{panel.right.name}</Text>
            <Text style={styles.boxSub}>{panel.right.sub}</Text>
            {rots ? <ArrowRow rots={ALIGNED} /> : null}
          </Animated.View>
        </View>
        {/* the same panel, struck in ink — only Rousseau's split ever strikes it */}
        {rots ? (
          <Animated.View style={[styles.boxOn, { left: BOX_L[1] }, willStyle]}>
            <Text style={[styles.boxName, styles.onInk]}>{panel.right.name}</Text>
            <Text style={[styles.boxSub, styles.onInk]}>{panel.right.sub}</Text>
            <ArrowRow rots={ALIGNED} color={PAPER} />
          </Animated.View>
        ) : null}

        <View style={styles.divider} />
        <View style={styles.chip}><Text style={styles.chipText}>VS</Text></View>
      </Animated.View>

      {/* ── the Declaration of 1776, pinned where the panels were ───────────── */}
      <Animated.View style={[styles.decl, declStyle]} pointerEvents="none">
        <Text style={styles.declTitle} numberOfLines={1}>DECLARATION</Text>
        <Text style={styles.declSub} numberOfLines={1}>OF INDEPENDENCE</Text>
        <View style={styles.declRule} />
        <Text style={styles.declYear} numberOfLines={1}>1776</Text>
        <Text style={styles.declIdeas} numberOfLines={1}>CONSENT · RIGHTS</Text>
      </Animated.View>

      {/* ── the crown, riding above the ruler ────────────────────────────────── */}
      <Animated.View style={[styles.crown, crownStyle]} pointerEvents="none">
        <View style={[styles.crownPt, { left: 1 }]} />
        <View style={[styles.crownPt, { left: 14 }]} />
        <View style={[styles.crownPt, { left: 27 }]} />
        <View style={styles.crownBand} />
      </Animated.View>

      {/* ── the state of nature: no government, and two wills meeting head on ── */}
      <Animated.View style={[StyleSheet.absoluteFill, natStyle]} pointerEvents="none">
        <Text style={styles.natLabel}>STATE OF NATURE</Text>
        <View style={[styles.clashShaft, { left: COR_L, width: COR_W / 2 - CLASH_GAP / 2 - 12 }]} />
        <View style={[styles.clashHeadR, { left: COR_L + COR_W / 2 - CLASH_GAP / 2 - 13 }]} />
        <View style={[styles.clashShaft, { left: COR_L + COR_W / 2 + CLASH_GAP / 2 + 12, width: COR_W / 2 - CLASH_GAP / 2 - 12 }]} />
        <View style={[styles.clashHeadL, { left: COR_L + COR_W / 2 + CLASH_GAP / 2 }]} />
        <Text style={styles.warLabel}>A STATE OF WAR</Text>
      </Animated.View>

      {/* ── bare force: one heavy arrow down, and nothing owed back ──────────── */}
      <Animated.View style={[StyleSheet.absoluteFill, forceStyle]} pointerEvents="none">
        <Text style={styles.forceLabel}>FORCE</Text>
        <View style={styles.forceShaft} />
        <View style={styles.forceHead} />
        <View style={styles.oweShaft} />
        <View style={styles.oweHead} />
        <View style={styles.oweCross}>
          <View style={[styles.oweCrossBar, { transform: [{ rotate: '45deg' }] }]} />
          <View style={[styles.oweCrossBar, { transform: [{ rotate: '-45deg' }] }]} />
        </View>
        <Text style={styles.oweLabel}>NOTHING OWED</Text>
      </Animated.View>

      {/* ── the circuit: consent up, protected rights back down ──────────────── */}
      <Animated.View style={[StyleSheet.absoluteFill, flowStyle]} pointerEvents="none">
        <Text style={styles.upLabel}>CONSENT</Text>
        <View style={styles.upShaft} />
        <View style={styles.upHead} />
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, rightsStyle]} pointerEvents="none">
        <View style={styles.downShaft} />
        <View style={styles.downHead} />
        <Text style={styles.downLabel}>RIGHTS PROTECTED</Text>
      </Animated.View>

      {/* the scroll of consent, travelling the top arrow */}
      <Animated.View style={[styles.scroll, scrollStyle]} pointerEvents="none">
        <View style={styles.scrollBody} />
        <View style={[styles.scrollCap, { left: -2 }]} />
        <View style={[styles.scrollCap, { right: -2 }]} />
      </Animated.View>

      {/* the stamp Locke's whole argument hangs on */}
      <Animated.View style={[styles.seal, sealStyle]} pointerEvents="none">
        <Text style={styles.sealText}>HELD IN TRUST</Text>
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DS} k={K_FIG} />
      <Stickman role="second" D={DR} k={K_FIG} />
    </Animated.View>
  );
}

/** Six little arrows — scattered for the will of all, in rank for the general will. */
function ArrowRow({ rots, color = INK }: { rots: string[]; color?: string }) {
  return (
    <View style={styles.arrowRow} pointerEvents="none">
      {rots.map((rot, k) => (
        <View key={k} style={[styles.arrow, { left: k * 25, transform: [{ rotate: rot }] }]}>
          <View style={[styles.arrowShaft, { backgroundColor: color }]} />
          <View style={[styles.arrowHead, { borderLeftColor: color }]} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 16, right: 16, top: GROUND, height: 1.5, backgroundColor: RULE },

  title: {
    position: 'absolute', left: 0, top: 222, width: STAGE_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 10.5, lineHeight: 13.5, letterSpacing: 1.6, color: SOFT,
    includeFontPadding: false,
  },
  box: {
    position: 'absolute', top: BOX_T, width: BOX_W, height: BOX_H,
    borderWidth: 2, borderColor: INK, borderRadius: 5, backgroundColor: STONE, boxShadow: LIP,
  },
  boxName: {
    position: 'absolute', left: 0, top: 9, width: BOX_W - 4, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 13.5, letterSpacing: 0.8, color: INK,
    includeFontPadding: false,
  },
  boxSub: {
    position: 'absolute', left: 8, top: 29, width: BOX_W - 20, textAlign: 'center',
    fontFamily: 'Inter_400Regular', fontSize: 10, lineHeight: 13, letterSpacing: 0.2, color: INK,
    includeFontPadding: false,
  },
  // The struck GENERAL WILL: the box's own rectangle, border and all, in ink.
  boxOn: {
    position: 'absolute', top: BOX_T, width: BOX_W, height: BOX_H,
    borderWidth: 2, borderColor: INK, borderRadius: 5, backgroundColor: INK,
  },
  onInk: { color: PAPER },
  divider: { position: 'absolute', left: 199.25, top: 250, width: 1.5, height: 62, backgroundColor: RULE },
  chip: {
    position: 'absolute', left: 185, top: 271, width: 30, height: 20, borderRadius: 3,
    borderWidth: 1.5, borderColor: SOFT, backgroundColor: STONE, boxShadow: LIP,
    alignItems: 'center', justifyContent: 'center',
  },
  chipText: { fontFamily: 'Inter_700Bold', fontSize: 9.5, letterSpacing: 1, color: INK, includeFontPadding: false },

  arrowRow: { position: 'absolute', left: 9, top: 56, width: BOX_W - 22, height: 18 },
  arrow: { position: 'absolute', top: 3, width: 21, height: 12 },
  arrowShaft: { position: 'absolute', left: 0, top: 4.75, width: 13, height: 2.5, backgroundColor: INK },
  arrowHead: {
    position: 'absolute', left: 12, top: 0.5, width: 0, height: 0,
    borderTopWidth: 5.5, borderBottomWidth: 5.5, borderLeftWidth: 9,
    borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: INK,
  },

  crown: { position: 'absolute', left: R_X - 18, top: 326, width: 36, height: 20 },
  crownPt: {
    position: 'absolute', top: 0, width: 0, height: 0,
    borderLeftWidth: 4, borderRightWidth: 4, borderBottomWidth: 10,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: INK,
  },
  crownBand: { position: 'absolute', top: 10, width: 36, height: 8, backgroundColor: INK, borderRadius: 2 },

  // ── bare force: the same two rails, run the other way ───────────────────────
  // Deliberately heavier than the consent arrow (5 units of shaft against 2.5, a
  // 13-unit head against 11): power is the loud one, and it points DOWN at the
  // ruled rather than up from them.
  forceLabel: {
    position: 'absolute', left: COR_L, top: 362, width: COR_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 11, lineHeight: 14, letterSpacing: 1.6, color: INK,
    includeFontPadding: false,
  },
  forceShaft: { position: 'absolute', left: COR_L + 12, top: UP_Y - 1.25, width: COR_W - 12, height: 5, backgroundColor: INK },
  forceHead: {
    position: 'absolute', left: COR_L, top: UP_Y - 6.75, width: 0, height: 0,
    borderTopWidth: 8, borderBottomWidth: 8, borderRightWidth: 13,
    borderTopColor: 'transparent', borderBottomColor: 'transparent', borderRightColor: INK,
  },
  oweShaft: { position: 'absolute', left: COR_L, top: DOWN_Y, width: COR_W - 12, height: 2.5, backgroundColor: SOFT },
  oweHead: {
    position: 'absolute', left: COR_L + COR_W - 12, top: DOWN_Y - 4.75, width: 0, height: 0,
    borderTopWidth: 6, borderBottomWidth: 6, borderLeftWidth: 11,
    borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: SOFT,
  },
  // Struck across the return arrow: obedience is taken, nothing flows back.
  oweCross: {
    position: 'absolute', left: COR_L + COR_W / 2 - 17, top: DOWN_Y - 15.75, width: 34, height: 34,
    alignItems: 'center', justifyContent: 'center',
  },
  oweCrossBar: { position: 'absolute', width: 34, height: 3.5, backgroundColor: INK, borderRadius: 2 },
  oweLabel: {
    position: 'absolute', left: COR_L, top: 476, width: COR_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 10.5, lineHeight: 13, letterSpacing: 1.4, color: SOFT,
    includeFontPadding: false,
  },

  // ── the state of nature: the force diagram's weight, pointed at each other ──
  // Caption at 362 (where FORCE and CONSENT sit), the two heads meeting at x 200
  // on the top rail, and the consequence under them at 404 — the stamp's slot,
  // which is empty on the one beat this is up.
  natLabel: {
    position: 'absolute', left: COR_L, top: 362, width: COR_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 11, lineHeight: 14, letterSpacing: 1.6, color: INK,
    includeFontPadding: false,
  },
  clashShaft: { position: 'absolute', top: UP_Y - 1.25, height: 5, backgroundColor: INK },
  clashHeadR: {
    position: 'absolute', top: UP_Y - 6.75, width: 0, height: 0,
    borderTopWidth: 8, borderBottomWidth: 8, borderLeftWidth: 13,
    borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: INK,
  },
  clashHeadL: {
    position: 'absolute', top: UP_Y - 6.75, width: 0, height: 0,
    borderTopWidth: 8, borderBottomWidth: 8, borderRightWidth: 13,
    borderTopColor: 'transparent', borderBottomColor: 'transparent', borderRightColor: INK,
  },
  warLabel: {
    position: 'absolute', left: COR_L, top: 404, width: COR_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 11, lineHeight: 14, letterSpacing: 1.4, color: INK,
    includeFontPadding: false,
  },

  // ── the Declaration ───────────────────────────────────────────────────────
  decl: {
    position: 'absolute', left: DECL_L, top: DECL_T, width: DECL_W, height: DECL_H,
    backgroundColor: PAPER, borderWidth: 2, borderColor: INK, borderRadius: 2,
    alignItems: 'center', paddingTop: 6,
  },
  declTitle: {
    fontFamily: 'Inter_700Bold', fontSize: 10.5, lineHeight: 13, letterSpacing: 1.2, color: INK,
    includeFontPadding: false,
  },
  declSub: {
    fontFamily: 'Inter_700Bold', fontSize: 9, lineHeight: 12, letterSpacing: 0.6, color: INK,
    includeFontPadding: false,
  },
  declRule: { width: 84, height: 1.5, backgroundColor: SOFT, marginTop: 3, marginBottom: 2 },
  declYear: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 15, lineHeight: 18, color: INK,
    includeFontPadding: false,
  },
  declIdeas: {
    fontFamily: 'Inter_500Medium', fontSize: 9, lineHeight: 12, letterSpacing: 0.8, color: INK,
    includeFontPadding: false,
  },

  upLabel: {
    position: 'absolute', left: COR_L, top: 362, width: COR_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 11, lineHeight: 14, letterSpacing: 1.6, color: INK,
    includeFontPadding: false,
  },
  upShaft: { position: 'absolute', left: COR_L, top: UP_Y, width: COR_W - 10, height: 2.5, backgroundColor: INK },
  upHead: {
    position: 'absolute', left: COR_L + COR_W - 11, top: UP_Y - 4.75, width: 0, height: 0,
    borderTopWidth: 6, borderBottomWidth: 6, borderLeftWidth: 11,
    borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: INK,
  },
  downShaft: { position: 'absolute', left: COR_L + 10, top: DOWN_Y, width: COR_W - 10, height: 2.5, backgroundColor: SOFT },
  downHead: {
    position: 'absolute', left: COR_L, top: DOWN_Y - 4.75, width: 0, height: 0,
    borderTopWidth: 6, borderBottomWidth: 6, borderRightWidth: 11,
    borderTopColor: 'transparent', borderBottomColor: 'transparent', borderRightColor: SOFT,
  },
  downLabel: {
    position: 'absolute', left: COR_L, top: 468, width: COR_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 11, lineHeight: 14, letterSpacing: 1.4, color: SOFT,
    includeFontPadding: false,
  },

  scroll: { position: 'absolute', left: COR_L + 4, top: UP_Y - 5, width: SCROLL_W, height: 13 },
  scrollBody: { position: 'absolute', left: 4, width: SCROLL_W - 8, height: 13, backgroundColor: PAPER, borderWidth: 1.5, borderColor: INK, borderRadius: 2 },
  scrollCap: { position: 'absolute', top: -1.5, width: 6, height: 16, borderRadius: 3, borderWidth: 1.5, borderColor: INK, backgroundColor: PAPER },

  seal: {
    position: 'absolute', left: 142, top: 406, width: 116, height: 40,
    borderWidth: 2.5, borderColor: INK, borderRadius: 4, backgroundColor: STONE, boxShadow: LIP,
    alignItems: 'center', justifyContent: 'center',
  },
  sealText: { fontFamily: 'Inter_700Bold', fontSize: 12.5, letterSpacing: 1, color: INK, includeFontPadding: false },
});

// MEASURED BAND, top and bottom.
//   TOP    the panel title at y 222. The ruler's crown prop tops out at 326 and
//          both crowns sit near 361, so nothing on any beat is drawn higher.
//   BOTTOM the ground line is at 501.5, but the true extreme is the ankle JOINTS:
//          circles of radius STR.limb·K_FIG/2 = 7.43 centred exactly on GROUND, so
//          ink reaches y = 507.4. The lowest prop is the force diagram's NOTHING
//          OWED caption at 489.
// [214, 512] therefore holds the stamp, both diagrams, the crown and both figures
// on every beat with 8 units of margin at the top and 4.6 at the foot, and renders
// the scene ~2.17× instead of the letterboxed 1.15×. The seal is scaled up to 1.55×
// as it lands, but it grows about its own CENTRE (406→446 becomes 395→457), so the
// stamp is comfortably inside the band at its largest.
export function Political3Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Political3Scene} band={[214, 512]} camera={CAM} />;
}
