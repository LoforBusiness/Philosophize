import { memo, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { useFocusEffect } from 'expo-router';
import Animated, {
  useSharedValue, useDerivedValue, useFrameCallback, useAnimatedStyle,
  withTiming, withDelay, Easing, type SharedValue,
} from 'react-native-reanimated';
import Stickman from '@/components/lesson/cinematic/Stickman';
import { pose, type Bundle } from '@/components/lesson/cinematic/rig';
import { emoteAnyLive } from '@/components/lesson/cinematic/moves';
import { STREAK_EMBER, SLATE, SLATE_LIT, type StreakTier } from '@/constants/streak';
import {
  INK, PAPER, PAPER_LIT, DEEP, SAND, TEAL, OLIVE, SAGE, EMBER, EMBER_LIT,
  FLOOR, FLAT_EDGE, mix,
} from '@/components/shared/tone';
import {
  slab, Lit, Stroke, LINE, WOOD, WOOD_LIT, WOOD_SHADE, SHEET_SHADE,
} from '@/components/shared/drawn';
import TearCalendar from './TearCalendar';
import type { MoodState } from '@/lib/utils/streakMood';

// ─────────────────────────────────────────────────────────────────────────────
// THE MASCOT, IN HIS STUDY — the same stickman the lessons are made of, standing
// on the streak screen with an opinion about you.
//
// He is not a new character and that is the entire point. The reader has watched
// this figure walk, think, point and slump through a hundred lessons; putting him
// on the streak screen costs nothing to learn and inherits every bit of personality
// the rig already has.
//
// ── AND HE IS IN A ROOM NOW (2026-09-26) ────────────────────────────────────
//
// He used to stand on a single 1.5pt rule in the middle of white paper, above a
// 72pt number and a chip. Everything else a reader meets him in — the seated
// welcome's parlour, the professor's lecture room, the redesigned lessons — is a
// PLACE drawn in real objects, and the owner asked for the streak to look like
// them. So the streak's parts became things in a study:
//
//   · THE COUNT is today's sheet of a tear-off calendar on the wall
//     (TearCalendar — the same object heads the streak panel on Home and
//     Profile), and yesterday's sheets lie torn off on the floor under it;
//   · THE SOCIETY the reader is in is a plaque hung on the wall — an empty
//     dashed outline, with the first society's name, until it is earned;
//   · THE FUEL GAUGE is the desk lamp. `mood.glow` is full while the streak has
//     been fed and sinks across the evening (lib/utils/streakMood.ts), and it
//     used to dim a floor rule; now it dims the lamp, which is the thing in a
//     room that runs down at night. A lapsed streak's lamp is off.
//
// It dims the LAMP and never the number, for the reason the old rule gave: the
// count is the highest-contrast thing on the screen, and a hero number at 34%
// opacity reads as a disabled control rather than as urgency. And colour is never
// the only tell — ember and ash are 1.6 apart in lightness (check-streak) — so the
// POSE carries the state and everything here agrees with it.
//
// ── HE IS POSED BY THE MECHANIC, NOT BY THE SCREEN ──────────────────────────
//
// The pose is `mood.pose` and nothing here decides it. Which of the six he is doing
// is a property of the streak.
//
// ── THE ROOM IS VIEWS, AND IT HOLDS STILL ───────────────────────────────────
//
// No <Svg> anywhere (§19: the streak screen sits closest to the GPU budget), and
// nothing in the room animates after its entrance — the one thing that moves for
// ever is the figure, and he stops whenever `hold` says so (see the frame callback).
// The room is laid out in a fixed 360 × 236 design box and scaled to the width it
// is given, so a 320dp phone gets the same drawing smaller rather than a different
// one.
// ─────────────────────────────────────────────────────────────────────────────

/** The room's design box, scaled to fit. */
const RW = 360;
const RH = 236;
const GROUND = 204;
const K = 1.06;             // rig units → design units: the rig is 103 tall
const FIG_X = 172;
// The lamp is the palette's olive-green, not the pale cloth blue: the owner asked
// for the two pale blues to be seen less (2026-09-26), and a lamp is small enough
// to carry a stronger tone anyway.
const LAMP = mix(SAGE, OLIVE, 0.35);
const LAMP_SHADE = mix(OLIVE, INK, 0.1);

interface Props {
  mood: MoodState;
  /** A lapsed streak turns the room cool — see the ΔE note in check-streak. */
  alive: boolean;
  /** The streak as the reader sees it — `effectiveStreak`. */
  count: number;
  /** The society already held, and the next one to earn. */
  tier: StreakTier | null;
  next: StreakTier | null;
  /** Play the entrance. Off for a mascot that is already on screen. */
  delay?: number;
  /**
   * True while he must HOLD STILL, which is two situations rather than one: he
   * has been scrolled up out of the viewport, or the scroll is in motion. The
   * second is the one that matters for frame rate -- see the note on the frame
   * callback below. Optional, and ABSENT MEANS VISIBLE: a mascot with no
   * watcher animates, rather than one with a broken watcher freezing.
   */
  hold?: SharedValue<boolean>;
}

export default function StreakMascot({ mood, alive, count, tier, next, delay = 0, hold }: Props) {
  const { width: screenW } = useWindowDimensions();
  // The streak body pads SPACE[3] a side (app/(app)/streak.tsx `body`).
  const boxW = Math.min(RW, screenW - 32);
  const s = boxW / RW;

  const clock = useSharedValue(0);

  // AUTOSTART OFF, AND STOPPED WHEN THIS IS NOT THE SCREEN YOU ARE ON — and not
  // while he is scrolled past, and not while the page is MOVING. The last is the
  // expensive one: Android 12+ overscroll is a StretchEffect, a RenderEffect that
  // captures the whole scrolling subtree into an offscreen buffer, and that
  // capture can only be reused while nothing inside it changes. This figure
  // writes twenty-four view transforms a frame, so for as long as he animated,
  // the bounce re-rasterised the entire page at 120Hz. He is at the TOP of the
  // page, which is exactly where a reader overscrolls.
  //
  // Stopping the CLOCK stops all of it: `D` is derived from it, and the styles
  // from `D`, so a clock that does not advance costs one early return a frame.
  // Nothing jumps on the way back, because the paused frames are never
  // accumulated — `dt` is taken from the frame that actually ran.
  const frame = useFrameCallback((f) => {
    'worklet';
    if (hold?.value) return;
    let dt = (f.timeSincePreviousFrame ?? 16) / 1000;
    if (dt > 0.05) dt = 0.05;
    clock.value += dt;
  }, false);
  const frameRef = useRef<{ setActive: (v: boolean) => void } | null>(null);
  frameRef.current = frame;

  const build = useSharedValue(0);
  const inV = useSharedValue(0);
  const say = useSharedValue(0);

  // THE ENTRANCE BELONGS TO THE ARRIVAL, not to the mount: a tab screen is
  // mounted once, warmed at startup, and never unmounted, so an entrance keyed
  // on mount plays behind the launch screen and never again. Set to 0 first:
  // these are shared values on a mounted tree and hold what the last visit left.
  //
  // The room assembles first, piece by piece, the way the welcome's parlour
  // does; then he steps in; then he speaks.
  useFocusEffect(
    useCallback(() => {
      frameRef.current?.setActive(true);
      build.value = 0;
      inV.value = 0;
      say.value = 0;
      build.value = withDelay(delay, withTiming(1, { duration: 760, easing: Easing.linear }));
      inV.value = withDelay(delay + 380, withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) }));
      say.value = withDelay(delay + 840, withTiming(1, { duration: 380, easing: Easing.out(Easing.cubic) }));
      return () => frameRef.current?.setActive(false);
    }, [delay, build, inV, say]),
  );

  // THE POSE CROSSES ON A SHARED VALUE, NOT A PROP. `emoteAnyLive` takes the gesture
  // code as a number, so the mood can change under the worklet without the component
  // remounting and without a JS closure having to cross the boundary (§17 rule 6).
  const code = useSharedValue(mood.pose);
  useEffect(() => { code.value = mood.pose; }, [mood.pose]);

  // He faces the room's right, toward his desk and lamp.
  const D = useDerivedValue<Bundle>(() =>
    pose(emoteAnyLive(code.value, clock.value, clock.value), FIG_X, GROUND, K, 1, 1),
  );

  const figStyle = useAnimatedStyle(() => ({
    opacity: inV.value,
    transform: [{ translateY: (1 - inV.value) * 12 }],
  }));
  const sayStyle = useAnimatedStyle(() => ({
    opacity: say.value,
    transform: [{ translateY: (1 - say.value) * 6 }],
  }));

  const mark = alive ? STREAK_EMBER : SLATE;
  const glow = alive ? mood.glow : 0;
  const a11y = alive
    ? `${count} day${count === 1 ? '' : 's'} running${tier ? `. ${tier.name}` : ''}`
    : 'Streak lapsed';

  return (
    <View style={styles.wrap} pointerEvents="none">
      <View
        style={{ width: boxW, height: RH * s }}
        accessible
        accessibilityRole="image"
        accessibilityLabel={a11y}
      >
        <View style={[styles.room, { transform: [{ scale: s }] }]}>
          <Floor />
          <Piece build={build} i={0} ox={70} oy={20}>
            <Calendar count={count} mark={mark} alive={alive} />
          </Piece>
          <Piece build={build} i={1} ox={180} oy={22}>
            <Plaque tier={tier} next={next} alive={alive} />
          </Piece>
          <Piece build={build} i={2} ox={290} oy={GROUND}>
            <Desk />
          </Piece>
          <Piece build={build} i={3} ox={330} oy={138}>
            <Lamp glow={glow} alive={alive} />
          </Piece>
          <Piece build={build} i={4} ox={268} oy={138}>
            <DeskThings alive={alive} />
          </Piece>
          <Piece build={build} i={5} ox={70} oy={GROUND}>
            <TornPages count={count} alive={alive} />
          </Piece>
          <Animated.View style={[StyleSheet.absoluteFill, figStyle]}>
            <Stickman D={D} k={K} />
          </Animated.View>
        </View>
      </View>
      <Animated.View style={[styles.saidWrap, sayStyle]}>
        <Text style={styles.said}>{mood.line}</Text>
      </Animated.View>
    </View>
  );
}

/** Pops a group in on its turn, growing from its own foot (the parlour's entrance). */
function Piece({ build, i, ox, oy, children }: {
  build: SharedValue<number>; i: number; ox: number; oy: number; children: ReactNode;
}) {
  const style = useAnimatedStyle(() => {
    const u = Math.max(0, Math.min(1, (build.value - i * 0.1) / 0.45));
    const back = 1 + 2.2 * Math.pow(u - 1, 3) + 1.2 * Math.pow(u - 1, 2); // easeOutBack
    return {
      opacity: Math.min(1, u * 2.2),
      transform: [
        { translateX: ox }, { translateY: oy },
        { scale: 0.6 + 0.4 * back },
        { translateX: -ox }, { translateY: -oy },
      ],
    };
  });
  return <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>{children}</Animated.View>;
}

// ── the floor ───────────────────────────────────────────────────────────────
// The lessons' construction: a flat floor under a white top hairline, so the
// figure and the desk stand ON something instead of on bare page.
const Floor = memo(function Floor() {
  return (
    <>
      <View style={[styles.floor, { top: GROUND, height: RH - GROUND }]} />
      <View style={[styles.floorEdge, { top: GROUND - 1 }]} />
    </>
  );
});

// ── the calendar ────────────────────────────────────────────────────────────
// Hung from a nail on two strings, left of him, at his head height.
const CAL_X = 18;
const CAL_Y = 44;
const CAL_W = 90;
function Calendar({ count, mark, alive }: { count: number; mark: string; alive: boolean }) {
  const nail = { x: CAL_X + CAL_W / 2, y: 18 };
  return (
    <>
      <Stroke x1={nail.x} y1={nail.y} x2={CAL_X + CAL_W * 0.28} y2={CAL_Y - 2} w={1.6} />
      <Stroke x1={nail.x} y1={nail.y} x2={CAL_X + CAL_W * 0.72} y2={CAL_Y - 2} w={1.6} />
      <View style={[styles.nail, { left: nail.x - 3.5, top: nail.y - 3.5 }]} />
      <View style={{ position: 'absolute', left: CAL_X, top: CAL_Y }}>
        <TearCalendar
          value={count}
          width={CAL_W}
          mark={mark}
          band={alive ? `DAY${count === 1 ? '' : 'S'} RUNNING` : 'STREAK LAPSED'}
        />
      </View>
    </>
  );
}

/** Yesterday's sheets, torn off and dropped under the pad. */
function TornPages({ count, alive }: { count: number; alive: boolean }) {
  // Only days that exist: a two-day streak has one sheet on the floor, not three.
  const n = alive ? Math.min(3, Math.max(0, count - 1)) : 0;
  const lay = [
    { x: 30, rot: -14 },
    { x: 60, rot: 9 },
    { x: 88, rot: -5 },
  ];
  return (
    <>
      {lay.slice(0, n).map((p, i) => (
        <View
          key={i}
          style={[
            slab(p.x, GROUND + 5 + (i % 2) * 5, 26, 14, PAPER_LIT, SHEET_SHADE, 2, 2, 1.5),
            { transform: [{ rotate: `${p.rot}deg` }] },
          ]}
        >
          <View style={[styles.tornBand, { backgroundColor: mix(STREAK_EMBER, PAPER_LIT, 0.35) }]} />
          <Text style={styles.tornNum}>{count - 1 - i}</Text>
        </View>
      ))}
    </>
  );
}

// ── the society plaque ─────────────────────────────────────────────────────
// Struck in the palette's quiet dark with sand lettering — the "struck material"
// §7 settled on, where sand reads 7.38:1. Before the first society it is an empty
// outline on its nail, carrying the name it is waiting for.
const PL_X = 122;
const PL_Y = 30;
const PL_W = 120;
const PL_H = 40;
/** Playfair Bold capitals run about 0.76 of an em; fit the name inside the plaque. */
function plaqueFs(name: string, max: number): number {
  return Math.min(max, (PL_W - 16) / (name.length * 0.76));
}
function Plaque({ tier, next, alive }: { tier: StreakTier | null; next: StreakTier | null; alive: boolean }) {
  const nail = { x: PL_X + PL_W / 2, y: 12 };
  const held = tier && alive;
  return (
    <>
      <Stroke x1={nail.x} y1={nail.y} x2={PL_X + 18} y2={PL_Y + 1} w={1.4} />
      <Stroke x1={nail.x} y1={nail.y} x2={PL_X + PL_W - 18} y2={PL_Y + 1} w={1.4} />
      <View style={[styles.nail, { left: nail.x - 3, top: nail.y - 3, width: 6, height: 6 }]} />
      {held ? (
        <View style={slab(PL_X, PL_Y, PL_W, PL_H, DEEP, mix(DEEP, INK, 0.5), 6, 3)}>
          <Lit w={PL_W} h={PL_H} r={6} color={mix(DEEP, PAPER_LIT, 0.18)} />
          <Text style={styles.plaqueKicker}>SOCIETY</Text>
          <Text style={[styles.plaqueName, { fontSize: plaqueFs(tier!.name, 14) }]} numberOfLines={1}>
            {tier!.name.toUpperCase()}
          </Text>
        </View>
      ) : (
        <View style={styles.plaqueEmpty}>
          <Text style={styles.plaqueEmptyKicker}>AT {next?.at ?? 7} DAYS</Text>
          <Text
            style={[styles.plaqueEmptyName, { fontSize: plaqueFs(next?.name ?? 'Peripatetic', 12.5) }]}
            numberOfLines={1}
          >
            {(next?.name ?? 'Peripatetic').toUpperCase()}
          </Text>
        </View>
      )}
    </>
  );
}

// ── the desk ────────────────────────────────────────────────────────────────
// Side-on, right of him: a top on one leg and a drawer cabinet, in the palette's
// olive walked toward paper, the parlour's wood.
const DK_X = 232;
const DK_TOP = 140;
const DK_W = 118;
const Desk = memo(function Desk() {
  return (
    <>
      <View style={slab(DK_X + 8, DK_TOP + 8, 8, GROUND - DK_TOP - 8, WOOD_SHADE, WOOD_SHADE, 2, 0)} />
      <View style={slab(DK_X + 64, DK_TOP + 8, 48, GROUND - DK_TOP - 8, WOOD, WOOD_SHADE, 4, 0)}>
        <Lit w={48} h={24} r={4} color={WOOD_LIT} />
        <View style={[styles.drawerLine, { top: (GROUND - DK_TOP - 8) / 2 - 2 }]} />
        <View style={[styles.knob, { top: 12 }]} />
        <View style={[styles.knob, { top: (GROUND - DK_TOP - 8) / 2 + 10 }]} />
      </View>
      <View style={slab(DK_X, DK_TOP, DK_W, 12, WOOD, WOOD_SHADE, 3, 3)}>
        <Lit w={DK_W} h={12} r={3} color={WOOD_LIT} />
      </View>
    </>
  );
});

// ── on the desk: three books and a mug ─────────────────────────────────────
const DeskThings = memo(function DeskThings({ alive }: { alive: boolean }) {
  const books = [
    { x: DK_X + 6, w: 48, fill: TEAL },
    { x: DK_X + 10, w: 42, fill: OLIVE },
    { x: DK_X + 7, w: 45, fill: mix(SAGE, INK, 0.12) },
  ];
  return (
    <>
      {books.map((b, i) => {
        const y = DK_TOP - 11 * (i + 1);
        return (
          <View key={i} style={slab(b.x, y, b.w, 11, b.fill, mix(b.fill, INK, 0.4), 2.5, 0, 1.8)}>
            {/* the page block at the fore-edge */}
            <View style={[styles.pages, { width: 7 }]} />
          </View>
        );
      })}
      {/* the mug, and a thread of steam while the day is still warm */}
      <View style={slab(DK_X + 62, DK_TOP - 17, 15, 17, PAPER_LIT, SHEET_SHADE, 3, 0, 1.8)}>
        <View style={[styles.mugBand, { backgroundColor: alive ? EMBER : SLATE_LIT }]} />
      </View>
      <View style={[styles.mugHandle, { left: DK_X + 74, top: DK_TOP - 13 }]} />
      {alive ? (
        <>
          <Stroke x1={DK_X + 67} y1={DK_TOP - 22} x2={DK_X + 65} y2={DK_TOP - 30} w={1.4} color={FLAT_EDGE} />
          <Stroke x1={DK_X + 72} y1={DK_TOP - 21} x2={DK_X + 74} y2={DK_TOP - 32} w={1.4} color={FLAT_EDGE} />
        </>
      ) : null}
    </>
  );
});

// ── the lamp — the fuel gauge ──────────────────────────────────────────────
// A banker's arm lamp at the desk's far end. Its bulb and the pool of light round
// it follow `mood.glow`; off, the bulb is cold ash.
function Lamp({ glow, alive }: { glow: number; alive: boolean }) {
  const baseX = DK_X + DK_W - 30;
  const foot = { x: baseX + 13, y: DK_TOP - 6 };
  const elbow = { x: baseX + 6, y: DK_TOP - 46 };
  // The shade hangs off the arm's end, tipped so its mouth faces down and left,
  // onto the desk. Rotation θ carries the shade's cap up-right of its centre and
  // its mouth (where the bulb sits) down-left, so the arm meets the cap exactly.
  const th = (20 * Math.PI) / 180;
  const c = { x: baseX - 14, y: DK_TOP - 58 };
  const rot = (x: number, y: number) => ({
    x: c.x + x * Math.cos(th) - y * Math.sin(th),
    y: c.y + x * Math.sin(th) + y * Math.cos(th),
  });
  const cap = rot(0, -9);
  const bulb = rot(0, 10);
  const on = alive && glow > 0.02;
  const pool = mix(EMBER_LIT, PAPER_LIT, 0.6);
  return (
    <>
      {on ? (
        <>
          {/* the pool of light on the desk top, and a small bloom at the bulb */}
          <View
            style={[
              styles.pool,
              { left: bulb.x - 30, top: DK_TOP - 1, backgroundColor: pool, opacity: 0.2 + 0.5 * glow },
            ]}
          />
          <View
            style={[
              styles.halo,
              { left: bulb.x - 12, top: bulb.y - 12, backgroundColor: pool, opacity: 0.3 + 0.5 * glow },
            ]}
          />
        </>
      ) : null}
      <Stroke x1={foot.x} y1={foot.y} x2={elbow.x} y2={elbow.y} w={4} />
      <Stroke x1={elbow.x} y1={elbow.y} x2={cap.x} y2={cap.y} w={4} />
      <View style={[styles.joint, { left: elbow.x - 4, top: elbow.y - 4 }]} />
      <View style={slab(baseX, DK_TOP - 8, 27, 8, LAMP_SHADE, mix(LAMP_SHADE, INK, 0.4), 3, 0, 1.8)} />
      <View
        style={[
          styles.bulb,
          {
            left: bulb.x - 5, top: bulb.y - 5,
            backgroundColor: on ? mix(EMBER_LIT, PAPER_LIT, 0.35 * (1 - glow)) : SLATE_LIT,
          },
        ]}
      />
      {/* a dome shade, with a darker rim at its mouth */}
      <View
        style={[
          styles.shade,
          { left: c.x - 18, top: c.y - 9 },
          { transform: [{ rotate: `${(th * 180) / Math.PI}deg` }] },
        ]}
      >
        <View style={styles.shadeRim} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  room: { position: 'absolute', left: 0, top: 0, width: RW, height: RH, transformOrigin: 'top left' },
  floor: {
    position: 'absolute', left: 0, right: 0, backgroundColor: FLOOR,
    borderBottomLeftRadius: 14, borderBottomRightRadius: 14,
  },
  floorEdge: { position: 'absolute', left: 0, right: 0, height: 2, backgroundColor: FLAT_EDGE },
  nail: {
    position: 'absolute', width: 7, height: 7, borderRadius: 3.5,
    backgroundColor: INK,
  },

  tornBand: { position: 'absolute', left: 0, right: 0, top: 0, height: 3.5 },
  tornNum: {
    position: 'absolute', left: 0, right: 0, top: 2.5, textAlign: 'center',
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 7.5, lineHeight: 9, color: INK,
    includeFontPadding: false, fontVariant: ['lining-nums'],
  },

  plaqueKicker: {
    marginTop: 4, textAlign: 'center', fontFamily: 'Inter_700Bold', fontSize: 7,
    letterSpacing: 1.6, color: mix(SAND, DEEP, 0.2), includeFontPadding: false,
  },
  plaqueName: {
    textAlign: 'center', fontFamily: 'PlayfairDisplay_700Bold', fontSize: 14, lineHeight: 17,
    color: SAND, paddingHorizontal: 6, includeFontPadding: false,
  },
  plaqueEmpty: {
    position: 'absolute', left: PL_X, top: PL_Y, width: PL_W, height: PL_H,
    borderRadius: 6, borderWidth: 1.8, borderStyle: 'dashed', borderColor: mix(PAPER, INK, 0.45),
    alignItems: 'center', justifyContent: 'center', backgroundColor: PAPER,
  },
  plaqueEmptyKicker: {
    fontFamily: 'Inter_700Bold', fontSize: 7, letterSpacing: 1.4,
    color: mix(PAPER, INK, 0.62), includeFontPadding: false,
  },
  plaqueEmptyName: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 12.5, lineHeight: 16,
    color: mix(PAPER, INK, 0.62), paddingHorizontal: 6, includeFontPadding: false,
  },

  drawerLine: { position: 'absolute', left: 0, right: 0, height: LINE, backgroundColor: INK },
  knob: {
    position: 'absolute', left: 20, width: 6, height: 6, borderRadius: 3, backgroundColor: INK,
  },
  pages: {
    position: 'absolute', right: 1, top: 1.5, bottom: 1.5, borderRadius: 1.5, backgroundColor: PAPER_LIT,
  },
  mugBand: { position: 'absolute', left: 0, right: 0, top: 5, height: 3.5 },
  mugHandle: {
    position: 'absolute', width: 8, height: 9, borderRadius: 4, borderWidth: 1.8, borderColor: INK,
  },

  halo: { position: 'absolute', width: 24, height: 24, borderRadius: 12 },
  pool: { position: 'absolute', width: 46, height: 3, borderRadius: 1.5 },
  joint: {
    position: 'absolute', width: 8, height: 8, borderRadius: 4, backgroundColor: INK,
  },
  bulb: {
    position: 'absolute', width: 10, height: 10, borderRadius: 5, borderWidth: 1.6, borderColor: INK,
  },
  // Its own style, not slab(): react-native-web resolves a `borderRadius`
  // shorthand AFTER the per-corner longhands, so a dome built on slab() came out
  // a rounded rectangle.
  shade: {
    position: 'absolute', width: 36, height: 18, backgroundColor: LAMP,
    borderWidth: LINE, borderColor: INK, overflow: 'hidden',
    borderTopLeftRadius: 18, borderTopRightRadius: 18, borderBottomLeftRadius: 2, borderBottomRightRadius: 2,
  },
  shadeRim: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 4, backgroundColor: LAMP_SHADE },

  saidWrap: { paddingHorizontal: 18, marginTop: 2, maxWidth: 300 },
  said: {
    fontFamily: 'Caveat_700Bold',
    fontSize: 21,
    lineHeight: 25,
    textAlign: 'center',
    color: '#1A1A1A',
  },
});
