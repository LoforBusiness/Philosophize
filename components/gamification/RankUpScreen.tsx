import { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withRepeat, Easing, type SharedValue,
} from 'react-native-reanimated';
import RankSeal from '@/components/shared/RankSeal';
import { RANKS, rankOrder, rankDegree, type RankDef } from '@/data/ranks';
import { ORDER, ORDER_LABEL } from '@/constants/insignia';
import { C, LIP } from '@/constants/design';
import { mix, LOCK_FACE, LOCK_EDGE, SHINE } from '@/components/shared/tone';
import { LINE } from '@/components/shared/drawn';

// ─────────────────────────────────────────────────────────────────────────────
// THE RANK-UP MOMENT. Shown once, immediately after Finish, BEFORE the XP and
// streak screens, so the rarest thing that can happen on a completion has the
// stage to itself.
//
// ── THE SECOND DESIGN (2026-09-29) ─────────────────────────────────────────
//
// A reader: "It looks pretty cheap and it does not look very unique." The first
// design was a thin ring filling round the pin, rectangle confetti, and the old
// name sliding out while the new one slid in over the same spot. All three were
// generic, and the last one put two names on top of each other for a third of a
// second.
//
// It is an OBJECT now, drawn the way the rest of the app is drawn: the pin sits
// in a SOCKET with six empty stones set round its rim, and the stones light one
// by one in step with the six rising notes the rank-up sound already plays
// (scripts/make-sounds.mjs, `riseAndBurst`, 0.62…1.29s into a clip that starts
// 120ms after this mounts). The build is heard and SEEN at the same moments.
// While it builds, the old pin strains in its socket. On the burst it turns over
// like a coin and comes up as the new pin, a shockwave leaves the rim, the rays
// of the order open behind it and cut sparks fly. Then the new name is STRUCK on
// a plate that drops onto its ledge, and the old one is said once, small, below.
// Nothing ever shares a spot with anything else.
//
// ONE CLOCK RUNS ALL OF IT. `t` is milliseconds since mount, linear, and every
// part of the screen is a function of it. That is group L in one line: a tap
// that skips runs the same clock to its end, so the end state is exactly the one
// the full performance arrives at and nothing can be left half-played.
//
// Only Views. Rays, stones and sparks are all plain Views under transforms —
// an animated <Svg> of this size costs about ten frames a second on a phone
// (§17 rule 7), and a celebration that stutters is worse than none.
// ─────────────────────────────────────────────────────────────────────────────

// The timeline, in ms from mount. Each is the moment that step BEGINS.
const T_BUILD = 120;
/** When the new pin comes up. The sound's burst lands here — see RANKUP_PEAK. */
export const T_BURST = 1450;
const T_NAME = T_BURST + 300;
const T_BAR = T_NAME + 620;
const T_CTA = T_BAR + 720;
const T_END = T_CTA + 500;

/**
 * The six stones light on the six glockenspiel notes of the build, which sit at
 * 0.62, 0.86, 1.03, 1.15, 1.23 and 1.29s into the sound. The sound starts at
 * T_BUILD, so on this screen's clock they are these. They close in on the burst
 * because the notes do.
 */
const STONE_AT = [0.62, 0.86, 1.03, 1.15, 1.23, 1.29].map((s) => T_BUILD + Math.round(s * 1000));

// ── the stage, in its own 300-unit square, scaled to the phone ─────────────
const S = 300;
const MID = S / 2;
const SOCKET = 226;          // the plate the pin is set in
const PIN = 164;
const STONE = 24;
const STONE_R = SOCKET / 2 - 6;   // stones sit ON the rim, half over the edge
const RAY_LEN = 190;
const RAYS = 12;

const clamp01 = (x: number) => {
  'worklet';
  return x < 0 ? 0 : x > 1 ? 1 : x;
};
/** 0→1 across [a, a+d] ms. */
const span = (t: number, a: number, d: number) => {
  'worklet';
  return clamp01((t - a) / d);
};
/** Overshoots to about 1.1 and settles — a thing landing, not a thing inflating. */
const backOut = (u: number) => {
  'worklet';
  const k = 1.9;
  const v = u - 1;
  return 1 + (k + 1) * v * v * v + k * v * v;
};

// ── sparks ─────────────────────────────────────────────────────────────────
// Deterministic per mount, spread by a decorrelated hash so they never march.
const hash = (n: number) => {
  const v = Math.sin(n * 12.9898) * 43758.5453;
  return v - Math.floor(v);
};

interface Spark {
  angle: number; dist: number; size: number; spin: number;
  delay: number; drop: number; tone: number; gem: boolean;
}

function makeSparks(n: number): Spark[] {
  const out: Spark[] = [];
  for (let i = 0; i < n; i++) {
    const base = (i / n) * Math.PI * 2;
    out.push({
      angle: base + (hash(i * 3.1) - 0.5) * 0.5,
      dist: 70 + hash(i * 7.7) * 120,
      size: 9 + hash(i * 5.3) * 9,
      spin: (hash(i * 2.3) - 0.5) * 540,
      delay: hash(i * 4.7) * 90,
      drop: 30 + hash(i * 8.9) * 70,
      tone: Math.floor(hash(i * 6.1) * 3),
      gem: hash(i * 9.9) > 0.4,
    });
  }
  return out;
}

/**
 * One spark: a cut gem (a diamond) or a bead, in the order's own tones with the
 * app's ink outline, so it reads as a drawn object and not as a coloured speck.
 */
function SparkView({ p, t, tones }: { p: Spark; t: SharedValue<number>; tones: string[] }) {
  const st = useAnimatedStyle(() => {
    const u = span(t.value, T_BURST + p.delay, 1050);
    const out = 1 - Math.pow(1 - u, 2.4);
    const r = SOCKET / 2 - 10 + p.dist * out;
    return {
      opacity: u <= 0 ? 0 : 1 - span(u, 0.66, 0.34),
      transform: [
        { translateX: Math.cos(p.angle) * r },
        { translateY: Math.sin(p.angle) * r + p.drop * u * u },
        { rotate: `${(p.gem ? 45 : 0) + p.spin * out}deg` },
        { scale: (0.3 + 0.7 * span(u, 0, 0.12)) * (1 - 0.35 * u) },
      ],
    };
  });
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.spark,
        {
          width: p.size, height: p.size,
          marginLeft: -p.size / 2, marginTop: -p.size / 2,
          borderRadius: p.gem ? 2 : p.size / 2,
          backgroundColor: tones[p.tone],
        },
        st,
      ]}
    />
  );
}

/** A stone in the socket's rim: grey and flat until its note, then struck. */
function Stone({ k, t, lit, base, shade }: {
  k: number; t: SharedValue<number>; lit: string; base: string; shade: string;
}) {
  const a = -Math.PI / 2 + (k / 6) * Math.PI * 2;
  const x = MID + Math.cos(a) * STONE_R - STONE / 2;
  const y = MID + Math.sin(a) * STONE_R - STONE / 2;
  const on = useAnimatedStyle(() => {
    const u = span(t.value, STONE_AT[k], 160);
    return {
      opacity: u > 0 ? 1 : 0,
      transform: [{ scale: u <= 0 ? 0.4 : backOut(u) }],
    };
  });
  // A ring that leaves the stone as it lights: the note, drawn.
  const ping = useAnimatedStyle(() => {
    const u = span(t.value, STONE_AT[k], 380);
    return {
      opacity: u <= 0 || u >= 1 ? 0 : 1 - u,
      transform: [{ scale: 1 + u * 1.3 }],
    };
  });
  return (
    <View pointerEvents="none" style={[styles.stoneBox, { left: x, top: y }]}>
      <View style={styles.stoneEmpty} />
      <Animated.View style={[styles.stonePing, { borderColor: base }, ping]} />
      <Animated.View style={[styles.stoneLit, { backgroundColor: base, borderBottomColor: shade }, on]}>
        <View style={[styles.stoneGlint, { backgroundColor: lit }]} />
      </Animated.View>
    </View>
  );
}

/** One ray of the order's light, a wedge whose tip is at the pin's centre. */
function Ray({ k, color }: { k: number; color: string }) {
  return (
    <View
      pointerEvents="none"
      style={[
        styles.ray,
        {
          borderTopColor: color,
          transform: [{ rotate: `${(k / RAYS) * 360}deg` }],
        },
      ]}
    />
  );
}

interface Props {
  from: RankDef;          // the rank they just left
  to: RankDef;            // the rank they just reached
  next: RankDef | null;   // the one after that, if any
  totalXP: number;
  onDone: () => void;
}

export default function RankUpScreen({ from, to, next, totalXP, onDone }: Props) {
  const { width } = useWindowDimensions();
  const t = useSharedValue(0);
  const spin = useSharedValue(0);
  const [ready, setReady] = useState(false);
  const [down, setDown] = useState(false);
  const skipped = useRef(false);

  const sparks = useMemo(() => makeSparks(22), []);

  // Both pins, and the material the new one is struck in. `to.id` is 1-based and
  // `rankOrder`/`rankDegree` want the index, which is where the -1 comes from.
  const toIndex = to.id - 1;
  const fromIndex = from.id - 1;
  const ins = ORDER[rankOrder(toIndex)];
  const tones = useMemo(() => [ins.lit, ins.base, C.paper], [ins]);
  const rayA = useMemo(() => mix(ins.base, C.paper, 0.84), [ins]);
  const rayB = useMemo(() => mix(ins.base, C.paper, 0.92), [ins]);
  const socketFace = useMemo(() => mix(ins.base, C.paper, 0.9), [ins]);
  const plateLip = ins.base;
  // A promotion that CHANGES ORDER is the rarer event, and it is the one worth
  // naming — the shape and the colour both change on that step and on no other.
  const rising = rankOrder(toIndex) !== rankOrder(fromIndex);

  // How far into the NEW rank they already are, and what is left to the next.
  const gap = next ? Math.max(1, next.xp - to.xp) : 1;
  const into = next ? Math.max(0, Math.min(gap, totalXP - to.xp)) : gap;
  const pct = next ? into / gap : 1;
  const remaining = next ? Math.max(0, next.xp - totalXP) : 0;

  // The stage is designed at 300 and scaled to fit a narrow phone.
  const box = Math.min(S, width - 40);
  const k = box / S;

  useEffect(() => {
    t.value = withTiming(T_END, { duration: T_END, easing: Easing.linear });
    spin.value = withRepeat(withTiming(360, { duration: 40000, easing: Easing.linear }), -1);
    const id = setTimeout(() => setReady(true), T_CTA);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tap anywhere to run the same clock out to its end state.
  const skip = () => {
    if (skipped.current || ready) return;
    skipped.current = true;
    t.value = withTiming(T_END, { duration: 320, easing: Easing.out(Easing.cubic) });
    setReady(true);
  };

  const tagStyle = useAnimatedStyle(() => {
    const u = span(t.value, 0, 380);
    return { opacity: u, transform: [{ translateY: (1 - u) * -10 }] };
  });

  const socketStyle = useAnimatedStyle(() => {
    const u = span(t.value, 0, 420);
    // The whole socket kicks once on the burst, as if the pin was driven home.
    const hit = span(t.value, T_BURST, 260);
    const kick = hit > 0 && hit < 1 ? Math.sin(Math.PI * hit) * 0.06 : 0;
    return { opacity: u, transform: [{ scale: 0.86 + 0.14 * backOut(u) + kick }] };
  });

  // THE OLD PIN STRAINS. A tremble that grows with the build — cubic, so it is
  // barely there at the first stone and shaking by the sixth — then it turns
  // edge-on in the last 130ms before the burst.
  const oldPin = useAnimatedStyle(() => {
    const b = span(t.value, T_BUILD, T_BURST - T_BUILD);
    const amp = b * b * b * 5;
    const shake = Math.sin(t.value * 0.09) * amp;
    const turn = span(t.value, T_BURST - 130, 130);
    return {
      opacity: turn >= 1 ? 0 : 1,
      transform: [
        { perspective: 700 },
        { rotateY: `${turn * 90}deg` },
        { rotate: `${shake}deg` },
        { scale: 1 + b * 0.05 },
      ],
    };
  });
  // …and comes up as the new pin, landing past full size and settling.
  const newPin = useAnimatedStyle(() => {
    const u = span(t.value, T_BURST, 300);
    return {
      opacity: u > 0 ? 1 : 0,
      transform: [
        { perspective: 700 },
        { rotateY: `${(1 - span(u, 0, 0.5)) * -90}deg` },
        { scale: 1.05 * backOut(u) - 0.05 * u },
      ],
    };
  });

  const flashStyle = useAnimatedStyle(() => {
    const u = span(t.value, T_BURST, 420);
    return {
      opacity: u <= 0 ? 0 : 0.85 * (1 - u),
      transform: [{ scale: 0.5 + u * 0.9 }],
    };
  });
  const waveStyle = useAnimatedStyle(() => {
    const u = span(t.value, T_BURST, 620);
    const e = 1 - Math.pow(1 - u, 3);
    return {
      opacity: u <= 0 || u >= 1 ? 0 : 1 - u,
      transform: [{ scale: 0.95 + e * 0.95 }],
    };
  });
  const raysStyle = useAnimatedStyle(() => {
    const u = span(t.value, T_BURST, 520);
    return {
      opacity: u,
      transform: [{ rotate: `${spin.value}deg` }, { scale: 0.5 + 0.5 * backOut(u) }],
    };
  });

  // THE NAME IS STRUCK: the plate falls ACCELERATING onto its ledge, squashes on
  // contact and recovers — the streak seal's physics, one screen over.
  const plateStyle = useAnimatedStyle(() => {
    const fall = span(t.value, T_NAME, 200);
    const land = span(t.value, T_NAME + 200, 220);
    const squash = land > 0 && land < 1 ? Math.sin(Math.PI * land) * 0.07 : 0;
    return {
      opacity: span(fall, 0, 0.3),
      transform: [
        { translateY: -46 * (1 - fall * fall) },
        { scaleX: 1 + squash * 0.6 },
        { scaleY: 1 - squash },
      ],
    };
  });
  const fromStyle = useAnimatedStyle(() => {
    const u = span(t.value, T_NAME + 380, 320);
    return { opacity: u, transform: [{ translateY: (1 - u) * 6 }] };
  });

  const barBlock = useAnimatedStyle(() => {
    const u = span(t.value, T_BAR, 300);
    return { opacity: u, transform: [{ translateY: (1 - u) * 12 }] };
  });
  const fillStyle = useAnimatedStyle(() => {
    const u = span(t.value, T_BAR + 160, 760);
    const e = 1 - Math.pow(1 - u, 3);
    return { transform: [{ scaleX: Math.max(0.0001, e * Math.max(pct, 0.05)) }] };
  });
  const ctaStyle = useAnimatedStyle(() => {
    const u = span(t.value, T_CTA, 360);
    return { opacity: u, transform: [{ translateY: (1 - u) * 14 }] };
  });

  return (
    <Pressable style={styles.root} onPress={skip}>
      <Animated.View style={[styles.tagWrap, tagStyle]}>
        <View style={[styles.tagLip, { backgroundColor: ins.shade }]} />
        <View style={[styles.tag, { backgroundColor: ins.base }]}>
          <Text style={[styles.tagText, { color: ins.on }]}>
            {rising ? `NEW ORDER · ${ORDER_LABEL[rankOrder(toIndex)].toUpperCase()}` : 'RANK UP'}
          </Text>
        </View>
      </Animated.View>

      <View style={styles.center}>
        {/* THE STAGE: rays, socket, stones, pins, burst — at 300 units, scaled. */}
        <View style={{ width: box, height: box }}>
          <View style={[styles.stage, { left: (box - S) / 2, top: (box - S) / 2, transform: [{ scale: k }] }]}>
            <Animated.View style={[styles.rays, raysStyle]} pointerEvents="none">
              {Array.from({ length: RAYS }, (_, i) => (
                <Ray key={i} k={i} color={i % 2 ? rayB : rayA} />
              ))}
            </Animated.View>

            <Animated.View style={[styles.socketWrap, socketStyle]}>
              <View style={[styles.socketLip, { backgroundColor: ins.shade }]} />
              <View style={[styles.socket, { backgroundColor: socketFace }]} />
              <View style={[styles.socketWell, { borderColor: mix(ins.base, C.paper, 0.7) }]} />
              {STONE_AT.map((_, i) => (
                <Stone key={i} k={i} t={t} lit={ins.lit} base={ins.base} shade={ins.shade} />
              ))}
            </Animated.View>

            <Animated.View style={[styles.flash, { backgroundColor: ins.lit }, flashStyle]} pointerEvents="none" />
            <Animated.View style={[styles.wave, { borderColor: ins.base }, waveStyle]} pointerEvents="none" />

            {/* The pin they held… */}
            <Animated.View style={[styles.pin, oldPin]} pointerEvents="none">
              <RankSeal
                glyph={from.glyph}
                state="current"
                size={PIN}
                order={rankOrder(fromIndex)}
                degree={rankDegree(fromIndex)}
              />
            </Animated.View>
            {/* …and the one they have just been given. */}
            <Animated.View style={[styles.pin, newPin]} pointerEvents="none">
              <RankSeal
                glyph={to.glyph}
                state="current"
                size={PIN}
                order={rankOrder(toIndex)}
                degree={rankDegree(toIndex)}
              />
            </Animated.View>

            <View style={styles.sparks} pointerEvents="none">
              {sparks.map((p, i) => <SparkView key={i} p={p} t={t} tones={tones} />)}
            </View>
          </View>
        </View>

        {/* THE NAME, struck on a plate. The old one is said once, small, below —
            never in the same place, so the two can never overlap. */}
        <Animated.View style={[styles.plateWrap, plateStyle]}>
          <View style={[styles.plateLip, { backgroundColor: plateLip }]} />
          <View style={styles.plate}>
            <Text style={[styles.plateKicker, { color: ins.shade }]}>
              RANK {to.id} OF {RANKS.length}
            </Text>
            <Text style={styles.plateName} numberOfLines={1} adjustsFontSizeToFit>
              {to.name}
            </Text>
          </View>
        </Animated.View>
        <Animated.Text style={[styles.fromLine, fromStyle]} numberOfLines={1}>
          Up from {from.name}
        </Animated.Text>

        {/* How far the next rank is. */}
        <Animated.View style={[styles.barBlock, barBlock]}>
          <View style={styles.barHead}>
            <Text style={styles.barLabel} numberOfLines={1}>
              {next ? `NEXT · ${next.name.toUpperCase()}` : 'THE TOP OF THE LADDER'}
            </Text>
            <Text style={styles.barFigure}>
              {next ? `${remaining.toLocaleString()} XP to go` : 'Highest rank'}
            </Text>
          </View>
          <View style={styles.track}>
            <Animated.View style={[styles.fill, { backgroundColor: ins.base }, fillStyle]}>
              <View style={styles.shine} />
            </Animated.View>
          </View>
        </Animated.View>
      </View>

      {/* THE WAY OUT, struck in the order they just reached, on a ledge. Dimming
          on press is what a DISABLED control does; every other button in the app
          depresses into its own lip. */}
      <Animated.View style={ctaStyle} pointerEvents={ready ? 'auto' : 'none'}>
        <View style={{ paddingBottom: LIP.button }}>
          <View pointerEvents="none" style={[styles.btnLip, { backgroundColor: ins.shade }]} />
          <Pressable
            onPress={onDone}
            onPressIn={() => setDown(true)}
            onPressOut={() => setDown(false)}
            style={[
              styles.btn,
              { backgroundColor: ins.base, transform: [{ translateY: down ? LIP.button : 0 }] },
            ]}
          >
            <Text style={[styles.btnText, { color: ins.on }]}>Continue →</Text>
          </Pressable>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.paper, paddingHorizontal: 24, paddingBottom: 40, paddingTop: 58 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Above the stage in paint order: the rays reach this high on a short phone.
  tagWrap: { alignSelf: 'center', paddingBottom: 3, zIndex: 2 },
  tagLip: { position: 'absolute', left: 0, right: 0, top: 3, bottom: 0, borderRadius: 999 },
  tag: {
    borderRadius: 999, paddingHorizontal: 16, paddingVertical: 7,
    borderWidth: LINE, borderColor: C.ink,
  },
  tagText: { fontFamily: 'Inter_700Bold', fontSize: 11.5, letterSpacing: 2.4 },

  stage: { position: 'absolute', width: S, height: S },
  rays: { position: 'absolute', left: 0, top: 0, width: S, height: S },
  ray: {
    position: 'absolute',
    left: MID - 22, top: MID - RAY_LEN,
    width: 0, height: 0,
    borderLeftWidth: 22, borderRightWidth: 22, borderTopWidth: RAY_LEN,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
    transformOrigin: '50% 100%',
  },

  socketWrap: {
    position: 'absolute', left: 0, top: 0, width: S, height: S,
  },
  socketLip: {
    position: 'absolute', left: MID - SOCKET / 2, top: MID - SOCKET / 2 + 7,
    width: SOCKET, height: SOCKET, borderRadius: SOCKET / 2,
  },
  socket: {
    position: 'absolute', left: MID - SOCKET / 2, top: MID - SOCKET / 2,
    width: SOCKET, height: SOCKET, borderRadius: SOCKET / 2,
    borderWidth: LINE, borderColor: C.ink,
  },
  // The cut the pin sits in: one hairline ring inside the rim.
  socketWell: {
    position: 'absolute', left: MID - SOCKET / 2 + 22, top: MID - SOCKET / 2 + 22,
    width: SOCKET - 44, height: SOCKET - 44, borderRadius: (SOCKET - 44) / 2,
    borderWidth: 2,
  },

  stoneBox: { position: 'absolute', width: STONE, height: STONE },
  stoneEmpty: {
    position: 'absolute', left: 0, top: 0, width: STONE, height: STONE, borderRadius: STONE / 2,
    backgroundColor: LOCK_FACE, borderWidth: LINE, borderColor: LOCK_EDGE,
  },
  stonePing: {
    position: 'absolute', left: 0, top: 0, width: STONE, height: STONE, borderRadius: STONE / 2,
    borderWidth: 3,
  },
  stoneLit: {
    position: 'absolute', left: 0, top: 0, width: STONE, height: STONE, borderRadius: STONE / 2,
    borderWidth: LINE, borderColor: C.ink, borderBottomWidth: 5, overflow: 'hidden',
  },
  stoneGlint: {
    position: 'absolute', left: 4, top: 3, width: 7, height: 5, borderRadius: 3,
  },

  flash: {
    position: 'absolute', left: MID - 110, top: MID - 110, width: 220, height: 220, borderRadius: 110,
  },
  wave: {
    position: 'absolute', left: MID - SOCKET / 2, top: MID - SOCKET / 2,
    width: SOCKET, height: SOCKET, borderRadius: SOCKET / 2, borderWidth: 6,
  },
  pin: {
    position: 'absolute', left: MID - PIN / 2, top: MID - PIN / 2,
    width: PIN, height: PIN, alignItems: 'center', justifyContent: 'center',
  },
  sparks: { position: 'absolute', left: MID, top: MID, width: 0, height: 0 },
  spark: {
    position: 'absolute', left: 0, top: 0,
    borderWidth: 1.6, borderColor: C.ink,
  },

  plateWrap: { alignSelf: 'stretch', marginTop: 18, paddingBottom: 6, marginHorizontal: 18 },
  plateLip: { position: 'absolute', left: 0, right: 0, top: 6, bottom: 0, borderRadius: 16 },
  plate: {
    backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: LINE, borderColor: C.ink,
    paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center',
  },
  plateKicker: { fontFamily: 'Inter_700Bold', fontSize: 10.5, letterSpacing: 2.6 },
  plateName: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 30, lineHeight: 38,
    color: C.ink, marginTop: 2, textAlign: 'center',
  },
  fromLine: {
    fontFamily: 'Inter_500Medium', fontSize: 13, color: C.inkSoft, marginTop: 12,
  },

  barBlock: { alignSelf: 'stretch', marginTop: 22, marginHorizontal: 6 },
  barHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8, gap: 10 },
  barLabel: { flexShrink: 1, fontFamily: 'Inter_700Bold', fontSize: 10.5, letterSpacing: 1.8, color: C.inkSoft },
  barFigure: { fontFamily: 'Inter_700Bold', fontSize: 12.5, color: C.ink, fontVariant: ['tabular-nums'] },
  track: {
    height: 18, borderRadius: 9, borderWidth: LINE, borderColor: C.ink,
    backgroundColor: LOCK_FACE, overflow: 'hidden',
  },
  fill: {
    position: 'absolute', left: 0, top: 0, bottom: 0, width: '100%',
    transformOrigin: '0% 50%',
  },
  shine: { position: 'absolute', left: 6, right: 6, top: 3, height: 4, borderRadius: 2, backgroundColor: SHINE },

  btn: { borderRadius: 14, paddingVertical: 18, alignItems: 'center' },
  btnLip: { position: 'absolute', left: 0, right: 0, top: LIP.button, bottom: 0, borderRadius: 14 },
  btnText: { fontFamily: 'Inter_700Bold', fontSize: 18 },
});
