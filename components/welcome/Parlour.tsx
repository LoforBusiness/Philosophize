import { memo } from 'react';
import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import {
  INK, PAPER_LIT, TEAL, OLIVE, SAGE, DEEP, EMBER, EMBER_LIT, FLAT_FACE, FLAT_EDGE, TINT, TINT_EDGE, mix,
} from '@/components/shared/tone';
import { clamp01, easeOutCubic, easeOutBack } from './ease';
import { GROUND, X_SEAT, K_SEAT, T_ROOM, T_SAT, LINE_T, LINE_END } from './seatedHost';
import { VOICE_LINES } from './welcomeVoice';

// ─────────────────────────────────────────────────────────────────────────────
// THE PARLOUR — the room the seated host talks from.
//
// Everything here is drawn the way the app's depth kit draws a thing that stands
// (§19, group AG): flat fills, one ink outline at one weight, a hard ledge of the
// object's own shade under it, and a lit strip along its top edge. No gradients,
// and no gold — the wood is the palette's olive, the upholstery its teal walked
// toward paper, and the one warm colour is the ember, kept to sparks (a book's
// spine, the pendulum's bob, the lamp's bulb).
//
// THE CHAIR IS LIGHT ON PURPOSE. The figure is solid ink and he sits IN FRONT of
// it, so a dark chair would swallow his back and his head — the branch road's rule
// that "nothing dark may stand at his height" (§17), in a room. The upholstery is
// TEAL 55% of the way to paper, which ink reads against at about 5:1.
//
// All of it is Views in the 400 × 800 stage, except two small static shapes (the
// lamp shade and the bust) that are an <Svg> each, a few dozen units across — the
// §19 GPU rule is about area, and these are the size of a thumbnail.
//
// What moves, and what moves it:
//   · every piece POPS IN at the start, in turn, on a spring — the room assembling
//     itself before he walks into it;
//   · the tea steams, the clock's pendulum swings and its minute hand goes round —
//     the room is running whether or not anybody is talking;
//   · the cushion gives as he sits, and the lamp switches on once he has;
//   · at "As Socrates once said" the bust on the shelf catches the light and its
//     name-plate drops in.
// ─────────────────────────────────────────────────────────────────────────────

const LINE = 2.4;

// ── EVERY PIECE IS SIZED IN THE FIGURE'S OWN UNITS ──────────────────────────
// A first draft typed stage numbers for each piece and put a two-hundred-unit man in
// a chair built for one of half that. So the room is laid out in RIG units — the ones
// his seat height, his thigh and his head are measured in — about the point where his
// chair stands, and scaled by the same K the figure is drawn at. Change K_SEAT and the
// room grows with him.
const K = K_SEAT;
/** Stage x of a point `rx` rig units right of where the chair stands. */
const gx = (rx: number) => X_SEAT + rx * K;
/** Stage y of a point `ry` rig units above the floor. */
const gy = (ry: number) => GROUND - ry * K;
/** A length in rig units, in stage units. */
const u = (n: number) => n * K;
const UPH = mix(TEAL, FLAT_FACE, 0.55);
const UPH_LIT = mix(TEAL, FLAT_FACE, 0.74);
const UPH_SHADE = mix(TEAL, FLAT_FACE, 0.33);
const WOOD = mix(OLIVE, FLAT_FACE, 0.18);
const WOOD_LIT = mix(OLIVE, FLAT_FACE, 0.45);
const WOOD_SHADE = mix(OLIVE, INK, 0.35);
const MARBLE = FLAT_FACE;
const MARBLE_SHADE = mix(FLAT_FACE, INK, 0.14);
const LAMP_OFF = mix(SAGE, INK, 0.08);
const LAMP_ON = mix(SAGE, PAPER_LIT, 0.62);
const STEAM = mix(FLAT_FACE, INK, 0.22);

/** When the Socrates line reaches the name. */
const SOCRATES_LINE = VOICE_LINES.findIndex((l) => /Socrates/.test(l.text));
const T_SOCRATES = SOCRATES_LINE >= 0
  ? LINE_T[SOCRATES_LINE] + VOICE_LINES[SOCRATES_LINE].words[1]
  : 1e9;
const T_SOCRATES_OFF = SOCRATES_LINE >= 0 ? LINE_END[SOCRATES_LINE] + 1.2 : 1e9;

/** A raised piece: fill, ink outline, a lit strip along the top, a hard ledge below. */
function slab(x: number, y: number, w: number, h: number, fill: string, shade: string, r = 5, lip = 3): ViewStyle {
  return {
    position: 'absolute', left: x, top: y, width: w, height: h,
    backgroundColor: fill, borderRadius: r, borderWidth: LINE, borderColor: INK,
    boxShadow: `0px ${lip}px 0px ${shade}`,
  };
}
function Lit({ w, h, r, color }: { w: number; h: number; r: number; color: string }) {
  const band = Math.max(2.5, Math.min(5, h * 0.22));
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute', left: 3, top: 2, width: Math.max(0, w - 6 - 2 * LINE), height: band,
        borderRadius: Math.min(r, band), backgroundColor: color,
      }}
    />
  );
}

/** Pops a group in on a spring, `i`-th in turn, growing from its own foot. */
function Pop({ clock, i, children, ox, oy }: {
  clock: SharedValue<number>; i: number; children: React.ReactNode; ox: number; oy: number;
}) {
  const style = useAnimatedStyle(() => {
    // From T_ROOM, not 0: the clock starts as the launch screen begins to lift, and
    // that outro runs about a second, so a room built at 0 assembles behind it.
    const u = clamp01((clock.value - T_ROOM - i * 0.075) / 0.42);
    return {
      opacity: easeOutCubic(clamp01(u * 2.2)),
      transform: [
        { translateX: ox }, { translateY: oy },
        { scale: 0.55 + 0.45 * easeOutBack(u) },
        { translateX: -ox }, { translateY: -oy },
      ],
    };
  });
  return <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>{children}</Animated.View>;
}

// ── the chair ───────────────────────────────────────────────────────────────
// Side-on, facing right, and built round where his pelvis lands (X_SEAT, ground −40).
// Every part sits BEHIND him, so nothing of the chair is ever drawn across the figure.
const CX = X_SEAT;

const Chair = memo(function Chair({ clock }: { clock: SharedValue<number> }) {
  // The cushion takes his weight: a squash as the seat lands, then it settles.
  const cushion = useAnimatedStyle(() => {
    const v = clamp01((clock.value - (T_SAT - 0.12)) / 0.5);
    const give = v <= 0 || v >= 1 ? 0 : Math.sin(Math.PI * v) * Math.exp(-2.4 * v);
    return { transform: [{ translateY: 3 * give }, { scaleY: 1 - 0.14 * give }] };
  });
  const backW = u(15);
  const backH = u(57);
  return (
    <>
      {/* the back, raked a few degrees, with three buttons down it */}
      <View style={[slab(gx(-23), gy(65), backW, backH, UPH, UPH_SHADE, u(7)), { transform: [{ rotate: '-6deg' }] }]}>
        <Lit w={backW} h={backH} r={u(7)} color={UPH_LIT} />
        {[12, 25, 38].map((y) => (
          <View key={y} style={{ position: 'absolute', left: backW / 2 - LINE - 2.5, top: u(y), width: 5, height: 5, borderRadius: 2.5, backgroundColor: UPH_SHADE }} />
        ))}
      </View>
      {/* the far arm, the panel under it, and its scroll */}
      <View style={slab(gx(9), gy(25), u(8), u(12), UPH_SHADE, mix(UPH_SHADE, INK, 0.3), 4, 0)} />
      <View style={slab(gx(-19), gy(28), u(35), u(7.5), UPH, UPH_SHADE, u(3.7))}>
        <Lit w={u(35)} h={u(7.5)} r={u(3.7)} color={UPH_LIT} />
      </View>
      <View style={slab(gx(13), gy(30.5), u(10), u(10), UPH_LIT, UPH_SHADE, u(5))} />
      {/* legs, the skirt, then the cushion he sits on */}
      <View style={slab(gx(-20), gy(8), u(5), u(8.6), WOOD, WOOD_SHADE, 3, 0)} />
      <View style={slab(gx(16), gy(8), u(5), u(8.6), WOOD, WOOD_SHADE, 3, 0)} />
      <View style={slab(gx(-22), gy(13.5), u(44), u(7), UPH_SHADE, mix(UPH_SHADE, INK, 0.3), 5)} />
      <Animated.View style={[slab(gx(-20), gy(15.5), u(42), u(8), UPH_LIT, UPH, u(4)), { transformOrigin: '50% 100%' }, cushion]}>
        <Lit w={u(42)} h={u(8)} r={u(4)} color={FLAT_FACE} />
      </Animated.View>
    </>
  );
});

// ── the floor lamp, behind the chair ────────────────────────────────────────
const LX = gx(-46);
const LAMP_TOP = gy(93);
const SHADE_W = u(25);
const SHADE_H = u(20);
const SHADE_D = 'M8 2 L38 2 L46 34 L0 34 Z';

const Lamp = memo(function Lamp({ clock }: { clock: SharedValue<number> }) {
  // It switches on once he is sitting, with a small flare at the bulb.
  const on = useAnimatedStyle(() => ({ opacity: easeOutCubic(clamp01((clock.value - (T_SAT + 0.25)) / 0.18)) }));
  const flare = useAnimatedStyle(() => {
    const v = clamp01((clock.value - (T_SAT + 0.25)) / 0.55);
    const a = v <= 0 || v >= 1 ? 0 : Math.sin(Math.PI * v);
    return { opacity: a, transform: [{ scale: 0.6 + 0.8 * v }] };
  });
  const shade = (fill: string) => (
    <Svg width={SHADE_W} height={SHADE_H} viewBox="-1 0 48 38">
      <Path d={SHADE_D} fill={fill} stroke={INK} strokeWidth={LINE * (38 / SHADE_H)} strokeLinejoin="round" />
    </Svg>
  );
  return (
    <>
      <View style={slab(LX - u(10), GROUND - u(5.5), u(22), u(5.5), WOOD, WOOD_SHADE, 5, 2)} />
      <View style={{ position: 'absolute', left: LX - 1.5, top: LAMP_TOP + SHADE_H - 4, width: 4, height: GROUND - LAMP_TOP - SHADE_H, backgroundColor: INK, borderRadius: 2 }} />
      <View style={{ position: 'absolute', left: LX + 0.5 - SHADE_W / 2, top: LAMP_TOP }}>{shade(LAMP_OFF)}</View>
      <Animated.View style={[{ position: 'absolute', left: LX + 0.5 - SHADE_W / 2, top: LAMP_TOP }, on]}>
        {shade(LAMP_ON)}
        {/* the bulb, under the shade's rim — the room's one spark of warmth */}
        <View style={{ position: 'absolute', left: SHADE_W / 2 - u(3.2), top: SHADE_H - 3, width: u(6.4), height: u(4), borderBottomLeftRadius: u(3.2), borderBottomRightRadius: u(3.2), backgroundColor: EMBER_LIT, borderWidth: 1.6, borderColor: INK }} />
      </Animated.View>
      <Animated.View style={[{ position: 'absolute', left: LX - 22, top: LAMP_TOP + SHADE_H - 20, width: 44, height: 44 }, flare]}>
        {[0, 1, 2, 3, 4].map((k) => {
          const a = (-150 + k * 30) * (Math.PI / 180);
          return (
            <View
              key={k}
              style={{
                position: 'absolute', left: 22 + Math.cos(a + Math.PI) * 30 - 5, top: 22 - Math.sin(a + Math.PI) * 30 - 1.5,
                width: 10, height: 3, borderRadius: 1.5, backgroundColor: EMBER,
                transform: [{ rotate: `${(-a * 180) / Math.PI}deg` }],
              }}
            />
          );
        })}
      </Animated.View>
    </>
  );
});

// ── the side table, with tea ────────────────────────────────────────────────
const TX = gx(62);
const TABLE_TOP = gy(31);
const CUP_W = u(9.5);
const CUP_H = u(8);
const CUP_X = TX - u(12);
const CUP_Y = TABLE_TOP - u(3) - CUP_H + 2;

const RISE = u(15);
const WISP_W = u(2.2);
const WISP_H = u(7);

function Wisp({ clock, k }: { clock: SharedValue<number>; k: number }) {
  // Each wisp rises, sways and thins on its own phase, for ever: the room is warm
  // and somebody has just poured.
  const style = useAnimatedStyle(() => {
    const P = 2.6;
    const t = clock.value + k * (P / 3);
    const v = (t % P) / P;
    const sway = Math.sin(t * 1.7 + k * 2.1) * 4 * v;
    return {
      opacity: Math.sin(Math.PI * v) * 0.85,
      transform: [{ translateX: sway }, { translateY: -RISE * v }, { scaleX: 1 - 0.35 * v }, { scaleY: 0.7 + 0.6 * v }],
    };
  });
  return (
    <Animated.View
      style={[{ position: 'absolute', left: CUP_X + CUP_W * 0.25 + k * WISP_W, top: CUP_Y - WISP_H, width: WISP_W, height: WISP_H, borderRadius: WISP_W / 2, backgroundColor: STEAM }, style]}
    />
  );
}

const SideTable = memo(function SideTable({ clock }: { clock: SharedValue<number> }) {
  return (
    <>
      <View style={slab(TX - u(13), GROUND - u(5.5), u(26), u(5.5), WOOD, WOOD_SHADE, 6, 2)} />
      <View style={slab(TX - u(3.5), TABLE_TOP + u(5), u(7), GROUND - TABLE_TOP - u(9), WOOD, WOOD_SHADE, 4, 0)} />
      <View style={slab(TX - u(21), TABLE_TOP, u(42), u(6), WOOD_LIT, WOOD_SHADE, u(3))}>
        <Lit w={u(42)} h={u(6)} r={u(3)} color={mix(WOOD_LIT, FLAT_FACE, 0.5)} />
      </View>
      {/* two books lying flat, the top one with an ember spine */}
      <View style={slab(TX + u(4), TABLE_TOP - u(5.5), u(14), u(5.5), DEEP, mix(DEEP, INK, 0.4), 2, 0)} />
      <View style={slab(TX + u(5.5), TABLE_TOP - u(10.5), u(11.5), u(5), EMBER, mix(EMBER, INK, 0.4), 2, 0)} />
      {/* the saucer, the cup, its handle */}
      <View style={slab(CUP_X - u(2.6), TABLE_TOP - u(3), CUP_W + u(5.2), u(3), FLAT_FACE, FLAT_EDGE, 3, 0)} />
      <View style={[slab(CUP_X, CUP_Y, CUP_W, CUP_H, FLAT_FACE, FLAT_EDGE, 3, 0), { borderBottomLeftRadius: u(4), borderBottomRightRadius: u(4) }]}>
        <View style={{ position: 'absolute', left: 0, right: 0, top: u(1.5), height: u(1.6), backgroundColor: TEAL }} />
      </View>
      <View style={{ position: 'absolute', left: CUP_X + CUP_W - 3, top: CUP_Y + u(1.4), width: u(4.6), height: u(4.2), borderRadius: u(2.3), borderWidth: 2, borderColor: INK }} />
      {[0, 1, 2].map((k) => <Wisp key={k} clock={clock} k={k} />)}
    </>
  );
});

// ── the shelf: books, and Socrates ──────────────────────────────────────────
const SHELF_Y = gy(74);
const SX = gx(40);
const SHELF_W = u(62);
const BOOKS = [
  { w: u(6.2), h: u(18), c: DEEP },
  { w: u(5), h: u(15.5), c: SAGE },
  { w: u(6.8), h: u(19.5), c: TEAL },
  { w: u(5.6), h: u(16.5), c: OLIVE },
];
const BUST_W = u(26);
const BUST_H = u(29.5);
const BUST_X = SX + SHELF_W - BUST_W - u(4);
// A bust in side profile, facing left toward the room: skull, a full beard (the one
// thing everybody knows about his face), a short neck and draped shoulders.
const BUST_D =
  'M20 4 C29 4 33 11 32 18 L33 22 L31 23 L31 27 C31 30 28 31 26 31 L27 34 ' +
  'C33 35 39 38 40 44 L40 48 L2 48 L2 44 C3 39 8 36 13 35 ' +
  'C8 33 6 29 7 24 C4 22 5 18 8 17 C8 9 13 4 20 4 Z';
const BEARD_D = 'M9 23 C10 30 15 34 22 33 C18 31 14 28 13 23 Z';

const Shelf = memo(function Shelf({ clock }: { clock: SharedValue<number> }) {
  const glint = useAnimatedStyle(() => {
    const v = clamp01((clock.value - T_SOCRATES) / 0.7);
    const a = v <= 0 || v >= 1 ? 0 : Math.sin(Math.PI * v);
    return { opacity: a, transform: [{ scale: 0.4 + 0.9 * a }, { rotate: `${45 + 90 * v}deg` }] };
  });
  const ring = useAnimatedStyle(() => {
    const on = clamp01((clock.value - T_SOCRATES) / 0.35) * (1 - clamp01((clock.value - T_SOCRATES_OFF) / 0.4));
    return { opacity: easeOutCubic(on) };
  });
  const plate = useAnimatedStyle(() => {
    const v = clamp01((clock.value - (T_SOCRATES + 0.1)) / 0.45);
    return {
      opacity: easeOutCubic(clamp01(v * 2)),
      transform: [{ translateY: -10 * (1 - easeOutBack(v)) }, { scale: 0.7 + 0.3 * easeOutBack(v) }],
    };
  });
  let x = SX + u(3);
  return (
    <>
      {/* brackets, then the plank */}
      <View style={{ position: 'absolute', left: SX + u(7), top: SHELF_Y + u(4), width: 5, height: u(8), backgroundColor: WOOD_SHADE, borderRadius: 2 }} />
      <View style={{ position: 'absolute', left: SX + SHELF_W - u(10), top: SHELF_Y + u(4), width: 5, height: u(8), backgroundColor: WOOD_SHADE, borderRadius: 2 }} />
      {BOOKS.map((b, i) => {
        const left = x;
        x += b.w + 1;
        return (
          <View key={i} style={[slab(left, SHELF_Y - b.h, b.w, b.h, b.c, mix(b.c, INK, 0.4), 2, 0), i === 2 ? { transform: [{ rotate: '8deg' }], transformOrigin: '100% 100%' } : null]}>
            <View style={{ position: 'absolute', left: 0, right: 0, top: u(3), height: 2, backgroundColor: mix(b.c, FLAT_FACE, 0.5) }} />
          </View>
        );
      })}
      {/* the halo he is lit by when his name is said */}
      <Animated.View style={[{ position: 'absolute', left: BUST_X - u(3), top: SHELF_Y - BUST_H - u(3.5), width: BUST_W + u(6), height: BUST_W + u(6), borderRadius: (BUST_W + u(6)) / 2, borderWidth: 3, borderColor: EMBER_LIT, backgroundColor: mix(TEAL, FLAT_FACE, 0.86) }, ring]} />
      <View style={{ position: 'absolute', left: BUST_X, top: SHELF_Y - BUST_H + 1 }}>
        <Svg width={BUST_W} height={BUST_H} viewBox="0 0 44 50">
          <Path d={BUST_D} fill={MARBLE} stroke={INK} strokeWidth={LINE * (44 / BUST_W)} strokeLinejoin="round" />
          <Path d={BEARD_D} fill={MARBLE_SHADE} />
        </Svg>
      </View>
      <View style={slab(SX, SHELF_Y, SHELF_W, u(4.5), WOOD_LIT, WOOD_SHADE, 3)} />
      {/* his name, which drops in when it is said */}
      <Animated.View style={[styles.plate, { left: BUST_X - u(3), top: SHELF_Y + u(8) }, plate]}>
        <Text style={styles.plateText}>SOCRATES</Text>
      </Animated.View>
      <Animated.View style={[{ position: 'absolute', left: BUST_X + BUST_W * 0.62, top: SHELF_Y - BUST_H - u(2), width: 12, height: 12, backgroundColor: FLAT_FACE, borderWidth: 2, borderColor: INK, borderRadius: 2 }, glint]} />
    </>
  );
});

// ── the grandfather clock, at the right-hand wall ───────────────────────────
const KX = 336;
const KW = u(28);
const KTOP = gy(104);
const HOOD_H = u(34);
const CASE_TOP = KTOP + HOOD_H - 6;
const BASE_H = u(14);
const CASE_H = GROUND - BASE_H - CASE_TOP + 4;
const FACE = u(20);

const Clock = memo(function Clock({ clock }: { clock: SharedValue<number> }) {
  const pendulum = useAnimatedStyle(() => ({ transform: [{ rotate: `${Math.sin(clock.value * Math.PI) * 13}deg` }] }));
  const minute = useAnimatedStyle(() => ({ transform: [{ rotate: `${(clock.value * 9) % 360}deg` }] }));
  const winW = KW * 0.56;
  const winH = CASE_H - u(16);
  return (
    <>
      <View style={slab(KX - 3, GROUND - BASE_H, KW + 6, BASE_H, WOOD, WOOD_SHADE, 4, 2)} />
      <View style={slab(KX, CASE_TOP, KW, CASE_H, WOOD, WOOD_SHADE, 5, 0)}>
        <Lit w={KW} h={CASE_H} r={5} color={WOOD_LIT} />
      </View>
      {/* the case's window, and the pendulum swinging behind it */}
      <View style={{ position: 'absolute', left: KX + (KW - winW) / 2, top: CASE_TOP + u(7), width: winW, height: winH, borderRadius: winW / 2, backgroundColor: mix(TEAL, FLAT_FACE, 0.8), borderWidth: 2, borderColor: INK, overflow: 'hidden' }}>
        <Animated.View style={[{ position: 'absolute', left: winW / 2 - 4, top: -6, width: 4, height: winH * 0.8, transformOrigin: '50% 0%' }, pendulum]}>
          <View style={{ position: 'absolute', left: 1, top: 0, width: 2, height: winH * 0.66, backgroundColor: INK }} />
          <View style={{ position: 'absolute', left: -5, top: winH * 0.62, width: 14, height: 14, borderRadius: 7, backgroundColor: EMBER, borderWidth: 2, borderColor: INK }} />
        </Animated.View>
      </View>
      <View style={slab(KX - 3, KTOP, KW + 6, HOOD_H, WOOD, WOOD_SHADE, (KW + 6) / 2, 0)}>
        <Lit w={KW + 6} h={HOOD_H} r={(KW + 6) / 2} color={WOOD_LIT} />
      </View>
      {/* the face */}
      <View style={{ position: 'absolute', left: KX + (KW - FACE) / 2, top: KTOP + (HOOD_H - FACE) / 2 + 1, width: FACE, height: FACE, borderRadius: FACE / 2, backgroundColor: FLAT_FACE, borderWidth: 2, borderColor: INK }}>
        {[0, 90, 180, 270].map((a) => (
          <View key={a} style={{ position: 'absolute', left: FACE / 2 - 3, top: 1, width: 2, height: 3.5, backgroundColor: INK, transformOrigin: `50% ${FACE / 2 - 3}px`, transform: [{ rotate: `${a}deg` }] }} />
        ))}
        <View style={{ position: 'absolute', left: FACE / 2 - 3.2, top: FACE / 2 - 9, width: 2.4, height: 7, backgroundColor: INK, borderRadius: 1, transformOrigin: '50% 100%', transform: [{ rotate: '-60deg' }] }} />
        <Animated.View style={[{ position: 'absolute', left: FACE / 2 - 2.9, top: FACE / 2 - 12.5, width: 1.8, height: 10.5, backgroundColor: INK, borderRadius: 1, transformOrigin: '50% 100%' }, minute]} />
        <View style={{ position: 'absolute', left: FACE / 2 - 4, top: FACE / 2 - 4, width: 3.6, height: 3.6, borderRadius: 1.8, backgroundColor: EMBER }} />
      </View>
    </>
  );
});

// ── the window: night outside, and it is moving ─────────────────────────────
// High on the wall, well above his head, so its dark glass is never behind the
// figure (the one place a dark mass may not go). The moon holds still; the stars
// breathe, each on its own phase, and every so often one falls — the smallest
// possible reward for somebody who watches the room rather than the words.
const WX = 22;
const WY = 148;
const WW = 72;
const WH = 150;
const NIGHT = DEEP;
const STARS = [
  { x: 14, y: 30, r: 2.2, p: 0.0 },
  { x: 50, y: 22, r: 1.6, p: 1.3 },
  { x: 30, y: 62, r: 1.8, p: 2.1 },
  { x: 58, y: 84, r: 2.0, p: 0.7 },
  { x: 18, y: 104, r: 1.5, p: 2.9 },
  { x: 44, y: 118, r: 1.9, p: 1.8 },
];

function Star({ clock, x, y, r, p }: { clock: SharedValue<number>; x: number; y: number; r: number; p: number }) {
  const style = useAnimatedStyle(() => {
    const a = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(clock.value * 2.2 + p * 2.4));
    return { opacity: a, transform: [{ scale: 0.75 + 0.45 * a }] };
  });
  return <Animated.View style={[{ position: 'absolute', left: x - r, top: y - r, width: 2 * r, height: 2 * r, borderRadius: r, backgroundColor: FLAT_FACE }, style]} />;
}

const Window = memo(function Window({ clock }: { clock: SharedValue<number> }) {
  // A shooting star every nine seconds, across the top of the glass.
  const fall = useAnimatedStyle(() => {
    const P = 9;
    const v = ((clock.value + 3.5) % P) / 0.7;
    const on = v < 1 ? Math.sin(Math.PI * v) : 0;
    return { opacity: on, transform: [{ translateX: 60 * v }, { translateY: 26 * v }, { rotate: '23deg' }] };
  });
  const inner = WW - 2 * LINE;
  return (
    <>
      <View style={[slab(WX, WY, WW, WH, NIGHT, WOOD_SHADE, WW / 2, 0), { borderBottomLeftRadius: 4, borderBottomRightRadius: 4, overflow: 'hidden' }]}>
        {STARS.map((st, i) => <Star key={i} clock={clock} {...st} />)}
        {/* the moon: a disc with the night laid over most of it */}
        <View style={{ position: 'absolute', left: 36, top: 40, width: 20, height: 20, borderRadius: 10, backgroundColor: FLAT_FACE }} />
        <View style={{ position: 'absolute', left: 42, top: 36, width: 20, height: 20, borderRadius: 10, backgroundColor: NIGHT }} />
        <Animated.View style={[{ position: 'absolute', left: -6, top: 10, width: 16, height: 2, borderRadius: 1, backgroundColor: FLAT_FACE }, fall]} />
        {/* the glazing bars */}
        <View style={{ position: 'absolute', left: inner / 2 - 2, top: 0, bottom: 0, width: 4, backgroundColor: WOOD_LIT }} />
        <View style={{ position: 'absolute', left: 0, right: 0, top: WH * 0.5, height: 4, backgroundColor: WOOD_LIT }} />
      </View>
      <View style={slab(WX - 6, WY + WH - 2, WW + 12, 9, WOOD_LIT, WOOD_SHADE, 3)} />
    </>
  );
});

// ── a painting on the far wall ──────────────────────────────────────────────
const PX = 304;
const PY = 164;
const PW = 72;
const PH = 58;

function Painting() {
  return (
    <View style={slab(PX, PY, PW, PH, WOOD, WOOD_SHADE, 3)}>
      <View style={{ position: 'absolute', left: 5, top: 5, right: 5, bottom: 5, backgroundColor: mix(TEAL, FLAT_FACE, 0.82), overflow: 'hidden', borderWidth: 1.5, borderColor: INK }}>
        <View style={{ position: 'absolute', left: 30, top: 8, width: 9, height: 9, borderRadius: 4.5, backgroundColor: EMBER }} />
        <View style={{ position: 'absolute', left: -20, top: 22, width: 70, height: 50, borderRadius: 35, backgroundColor: SAGE, borderWidth: 1.5, borderColor: INK }} />
        <View style={{ position: 'absolute', left: 22, top: 28, width: 70, height: 50, borderRadius: 35, backgroundColor: mix(TEAL, FLAT_FACE, 0.35), borderWidth: 1.5, borderColor: INK }} />
      </View>
    </View>
  );
}

// ── the rug ─────────────────────────────────────────────────────────────────
function Rug() {
  return (
    <View style={{ position: 'absolute', left: gx(-52), top: GROUND - 4, width: u(148), height: 16, borderRadius: 8, backgroundColor: TINT, borderWidth: 2, borderColor: TINT_EDGE }}>
      <View style={{ position: 'absolute', left: 10, right: 10, top: 4, height: 2, borderRadius: 1, backgroundColor: TINT_EDGE }} />
    </View>
  );
}

/** The room, in stage units. Drawn under the figure. */
export default function Parlour({ clock }: { clock: SharedValue<number> }) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Pop clock={clock} i={0} ox={gx(22)} oy={GROUND}><Rug /></Pop>
      <Pop clock={clock} i={1} ox={WX + WW / 2} oy={WY + WH}><Window clock={clock} /></Pop>
      <Pop clock={clock} i={2} ox={PX + PW / 2} oy={PY + PH}><Painting /></Pop>
      <Pop clock={clock} i={3} ox={KX + KW / 2} oy={GROUND}><Clock clock={clock} /></Pop>
      <Pop clock={clock} i={4} ox={SX + SHELF_W / 2} oy={SHELF_Y}><Shelf clock={clock} /></Pop>
      <Pop clock={clock} i={5} ox={LX} oy={GROUND}><Lamp clock={clock} /></Pop>
      <Pop clock={clock} i={6} ox={TX} oy={GROUND}><SideTable clock={clock} /></Pop>
      <Pop clock={clock} i={7} ox={CX} oy={GROUND}><Chair clock={clock} /></Pop>
    </View>
  );
}

/** Where the floor meets the wall, for the screen to draw the floor from. */
export const FLOOR_Y = GROUND;

const styles = StyleSheet.create({
  plate: {
    position: 'absolute', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
    backgroundColor: FLAT_FACE, borderWidth: 1.6, borderColor: INK,
    boxShadow: `0px 2px 0px ${FLAT_EDGE}`,
  },
  plateText: { fontFamily: 'Inter_700Bold', fontSize: 8.5, letterSpacing: 1.2, color: INK },
});
