import { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, useAnimatedProps, withTiming, withDelay,
  Easing, type SharedValue,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import RankSeal from '@/components/shared/RankSeal';
import { rankOrder, rankDegree, type RankDef } from '@/data/ranks';
import { ORDER, ORDER_LABEL } from '@/constants/insignia';
import { LIP } from '@/constants/design';

// ─────────────────────────────────────────────────────────────────────────────
// THE RANK-UP MOMENT. Shown once, immediately after Finish, BEFORE the XP and
// streak screen — so the rarest thing that just happened gets the stage to
// itself instead of being a line item under an XP counter.
//
// ── IT USED TO SHOW A GLYPH AND NOTHING ELSE ───────────────────────────────
//
// A reader: "I also need the rank icons to be in the lesson when the user does
// rank up. Right now it is just a black-and-white look when you see the rank-up
// in lessons."
//
// They were exactly right, and it was worse than merely plain. Every other place
// a rank appears — Profile, the showcase, the ranks sheet — draws the real
// struck PIN: its order's material, its order's silhouette, its degree of
// finish. This screen drew `<Glyph>` on paper inside a thin ink ring. So the one
// moment in the whole app that exists to say "your rank changed" was the only
// one that showed the reader nothing about what it changed TO, and a reader who
// had just crossed from Lapis into Crimson — new colour, new shape — saw a black
// line drawing either side of the boundary.
//
// It shows both pins now, and the swap is the beat: the pin they HELD is on
// screen from the first frame, and at the burst it hands over to the pin they
// have just been given. That is the whole point of an escalating ladder
// (components/shared/rankShapes.ts) and this is the only screen that can ever
// show two rungs of it at once.
//
// The order is deliberate and reads top-to-bottom, one thing at a time:
//   1. the pin they held, with a bar filling all the way around it —
//      ACCELERATING, so the ring closes with a rush rather than a constant crawl
//   2. the new pin lands and the confetti bursts, both on the frame it closes
//   3. below the mark, the rank they WERE slides out and the rank they now ARE
//      slides in — the swap is the point, so it is its own beat
//   4. below the words, a bar fills to show how far the next rank is
//   5. only then does Continue appear
//
// Nothing overlaps: each step starts as the one before it lands. A tap anywhere
// runs the whole thing to its end state for anyone who has seen it before.
// ─────────────────────────────────────────────────────────────────────────────

const INK = '#1A1A1A';
const SOFT = '#6B6B6B';
const PAPER = '#FAFAF7';
const RULE = '#E4E1D8';

// The timeline, in ms from mount. Each is the moment that step BEGINS.
const T_RING = 120;
const D_RING = 1400;
export const T_BURST = T_RING + D_RING - 70;    // fires as the circle closes
const T_NAME = T_BURST + 230;
const T_BAR = T_NAME + 1200;
const T_CTA = T_BAR + 800;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ── the ring ────────────────────────────────────────────────────────────────
const BOX = 208;          // the mark's box on screen
const VB = 200;           // viewBox units
const R = 86;
/**
 * The pin inside the closing ring.
 *
 * 176 rather than something safely smaller: the ring's own diameter is 179px at
 * this box, and a frame only fills 66–96 units of its own 100, so a pin sized to
 * "obviously fit" leaves a visible moat between the two. The widest frame — the
 * imperial halo — comes out at 169px inside a 179px ring, which is the top rank
 * pressing against its own circle, and that is the right relationship for it.
 */
const PIN = 176;
const CIRC = 2 * Math.PI * R;

// ── confetti ────────────────────────────────────────────────────────────────
// Deterministic per-mount so a piece never re-randomises mid-flight, and spread
// by a decorrelated hash — stepping x and y from the same index marches them
// into a diagonal streak instead of a burst.
const hash = (n: number) => {
  const v = Math.sin(n * 12.9898) * 43758.5453;
  return v - Math.floor(v);
};

interface Piece {
  angle: number; dist: number; w: number; h: number;
  spin: number; delay: number; drop: number;
  /** Which of the order's four tones this scrap is cut from. */
  tone: number;
}

// Pieces leave from the RING, not the centre. Launching them at the middle threw
// them straight across the glyph, which read as the mark shattering rather than as
// a burst coming off it.
const START_R = 84;

function makePieces(n: number): Piece[] {
  const out: Piece[] = [];
  for (let i = 0; i < n; i++) {
    // even angular spread with a jitter, so it reads as a burst not a clock face
    const base = (i / n) * Math.PI * 2;
    const angle = base + (hash(i * 3.1) - 0.5) * 0.55;
    out.push({
      angle,
      dist: 44 + hash(i * 7.7) * 122,
      w: 5 + hash(i * 5.3) * 4,
      h: 11 + hash(i * 9.1) * 9,
      spin: (hash(i * 2.3) - 0.5) * 900,
      delay: hash(i * 4.7) * 0.14,
      drop: 30 + hash(i * 8.9) * 54,
      tone: Math.floor(hash(i * 6.1) * 4),
    });
  }
  return out;
}

function Confetti({ p, burst, tones }: { p: Piece; burst: SharedValue<number>; tones: string[] }) {
  const st = useAnimatedStyle(() => {
    const u = Math.max(0, Math.min(1, (burst.value - p.delay) / (1 - p.delay)));
    const out = 1 - Math.pow(1 - u, 2.2);            // fast out, easing to a stop
    const r = START_R + p.dist * out;                // leaves from the ring, not the glyph
    return {
      opacity: u <= 0 ? 0 : 1 - Math.max(0, (u - 0.62) / 0.38),
      transform: [
        { translateX: Math.cos(p.angle) * r },
        { translateY: Math.sin(p.angle) * r + p.drop * out * out },
        { rotate: `${p.spin * out}deg` },
        { scale: 0.5 + 0.5 * Math.min(1, u * 4) },
      ],
    };
  });
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          width: p.w,
          height: p.h,
          borderRadius: 1,
          // CUT FROM THE ORDER, not from ink. The burst used to be black and
          // white scraps whatever rank had just been reached, which is a
          // celebration that does not know what it is celebrating.
          backgroundColor: tones[p.tone],
          borderWidth: p.tone === 3 ? 1.2 : 0,
          borderColor: INK,
        },
        st,
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
  const intro = useSharedValue(0);
  const ring = useSharedValue(0);
  const burst = useSharedValue(0);
  const swap = useSharedValue(0);
  const bar = useSharedValue(0);
  const cta = useSharedValue(0);
  const [ready, setReady] = useState(false);
  const [down, setDown] = useState(false);
  const skipped = useRef(false);

  const pieces = useMemo(() => makePieces(34), []);

  // Both pins, and the material the new one is struck in. `to.id` is 1-based and
  // `rankOrder`/`rankDegree` want the index, which is where the -1 comes from.
  const toIndex = to.id - 1;
  const fromIndex = from.id - 1;
  const ins = ORDER[rankOrder(toIndex)];
  // Four scraps: the face, its highlight, its shade, and one in paper so the
  // burst still reads against a dark order.
  const tones = useMemo(() => [ins.base, ins.lit, ins.shade, PAPER], [ins]);
  // A promotion that CHANGES ORDER is the rarer event, and it is the one worth
  // naming — the shape and the colour both change on that step and on no other.
  const rising = rankOrder(toIndex) !== rankOrder(fromIndex);

  // How far into the NEW rank they already are, and what is left to the next.
  const span = next ? Math.max(1, next.xp - to.xp) : 1;
  const into = next ? Math.max(0, Math.min(span, totalXP - to.xp)) : span;
  const pct = next ? into / span : 1;
  const remaining = next ? Math.max(0, next.xp - totalXP) : 0;

  useEffect(() => {
    const s = (ms: number) => ms;
    intro.value = withTiming(1, { duration: 460, easing: Easing.out(Easing.cubic) });
    // ACCELERATING — Easing.in means it starts slow and rushes the last stretch,
    // which is what makes the circle feel like it is closing.
    ring.value = withDelay(s(T_RING), withTiming(1, { duration: D_RING, easing: Easing.in(Easing.cubic) }));
    burst.value = withDelay(s(T_BURST), withTiming(1, { duration: 1150, easing: Easing.linear }));
    swap.value = withDelay(s(T_NAME), withTiming(1, { duration: 620, easing: Easing.inOut(Easing.cubic) }));
    bar.value = withDelay(s(T_BAR), withTiming(1, { duration: 880, easing: Easing.out(Easing.cubic) }));
    cta.value = withDelay(s(T_CTA), withTiming(1, { duration: 380, easing: Easing.out(Easing.cubic) }));
    const id = setTimeout(() => setReady(true), T_CTA);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tap anywhere to run the sequence out to its end state.
  const skip = () => {
    if (skipped.current || ready) return;
    skipped.current = true;
    const q = { duration: 220, easing: Easing.out(Easing.cubic) };
    intro.value = withTiming(1, q);
    ring.value = withTiming(1, q);
    burst.value = withTiming(1, { duration: 320, easing: Easing.linear });
    swap.value = withTiming(1, q);
    bar.value = withTiming(1, q);
    cta.value = withTiming(1, q);
    setReady(true);
  };

  const markStyle = useAnimatedStyle(() => {
    const pop = Math.sin(Math.PI * Math.min(1, burst.value * 2.4)) * 0.075;
    return {
      opacity: intro.value,
      transform: [{ scale: 0.74 + 0.26 * intro.value + pop }],
    };
  });

  // THE HANDOVER. The old pin is on screen from the first frame and leaves on
  // the frame the ring closes; the new one arrives into the same space a beat
  // behind it, so the reader sees one become the other rather than a pin
  // appearing out of nothing.
  const oldPinStyle = useAnimatedStyle(() => {
    const u = Math.min(1, burst.value / 0.18);
    return { opacity: 1 - u, transform: [{ scale: 1 - 0.18 * u }] };
  });
  const newPinStyle = useAnimatedStyle(() => {
    const u = Math.max(0, Math.min(1, (burst.value - 0.06) / 0.22));
    return { opacity: u, transform: [{ scale: 0.62 + 0.38 * u }] };
  });

  const ringProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRC * (1 - ring.value),
  }));

  const eyebrowStyle = useAnimatedStyle(() => ({
    opacity: intro.value,
    transform: [{ translateY: (1 - intro.value) * 8 }],
  }));

  // The old name leaves first, the new one arrives just behind it.
  const oldStyle = useAnimatedStyle(() => {
    const u = Math.min(1, swap.value / 0.55);
    return { opacity: 1 - u, transform: [{ translateX: -u * 46 }] };
  });
  const newStyle = useAnimatedStyle(() => {
    const u = Math.max(0, (swap.value - 0.42) / 0.58);
    return { opacity: u, transform: [{ translateX: (1 - u) * 46 }] };
  });

  const fillStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: bar.value * pct }] }));
  const barBlockStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, bar.value * 3),
    transform: [{ translateY: (1 - Math.min(1, bar.value * 3)) * 10 }],
  }));
  const ctaStyle = useAnimatedStyle(() => ({
    opacity: cta.value,
    transform: [{ translateY: (1 - cta.value) * 12 }],
  }));

  return (
    <Pressable style={styles.root} onPress={skip}>
      <View style={styles.center}>
        <Animated.Text style={[styles.eyebrow, eyebrowStyle, { color: ins.base }]}>
          {rising ? `THE ${ORDER_LABEL[rankOrder(toIndex)].toUpperCase()} ORDER` : 'RANK UP'}
        </Animated.Text>

        {/* 1 — the mark, with the bar closing around it */}
        <Animated.View style={[styles.markWrap, markStyle]}>
          <Svg width={BOX} height={BOX} viewBox={`0 0 ${VB} ${VB}`} style={StyleSheet.absoluteFill as any}>
            <Circle cx={VB / 2} cy={VB / 2} r={R} stroke={ins.base} strokeWidth={2} fill="none" opacity={0.16} />
            <AnimatedCircle
              cx={VB / 2}
              cy={VB / 2}
              r={R}
              stroke={ins.base}
              strokeWidth={5}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              animatedProps={ringProps}
              transform={`rotate(-90 ${VB / 2} ${VB / 2})`}
            />
          </Svg>
          {/* The pin they held… */}
          <Animated.View style={[styles.pin, oldPinStyle]} pointerEvents="none">
            <RankSeal
              glyph={from.glyph}
              state="current"
              size={PIN}
              order={rankOrder(fromIndex)}
              degree={rankDegree(fromIndex)}
            />
          </Animated.View>
          {/* …and the one they have just been given. */}
          <Animated.View style={[styles.pin, newPinStyle]} pointerEvents="none">
            <RankSeal
              glyph={to.glyph}
              state="current"
              size={PIN}
              order={rankOrder(toIndex)}
              degree={rankDegree(toIndex)}
            />
          </Animated.View>

          {/* 2 — the burst, from the centre of the mark */}
          <View style={styles.confetti} pointerEvents="none">
            {pieces.map((p, k) => <Confetti key={k} p={p} burst={burst} tones={tones} />)}
          </View>
        </Animated.View>

        {/* 3 — the rank they were, out; the rank they are, in */}
        <View style={styles.nameRow}>
          <Animated.Text numberOfLines={1} style={[styles.nameOld, oldStyle]}>{from.name}</Animated.Text>
          <Animated.Text numberOfLines={1} style={[styles.nameNew, newStyle]}>{to.name}</Animated.Text>
        </View>

        {/* 4 — how far the next rank is */}
        <Animated.View style={[styles.barBlock, barBlockStyle]}>
          <View style={styles.track}>
            <Animated.View style={[styles.fill, fillStyle, { backgroundColor: ins.base }]} />
          </View>
          <Text style={styles.barLabel}>
            {next
              ? `${remaining.toLocaleString()} XP to ${next.name}`
              : 'Highest rank reached'}
          </Text>
        </Animated.View>
      </View>

      {/* 5 — and only now, the way out */}
      {/* THE WAY OUT, struck in the order they just reached — and on a ledge,
          not a fade. Dimming on press is what a DISABLED control does; every
          other button in the app depresses into its own lip. */}
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
  root: { flex: 1, backgroundColor: PAPER, paddingHorizontal: 28, paddingBottom: 40, paddingTop: 60 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  eyebrow: {
    fontFamily: 'Inter_700Bold', fontSize: 12, letterSpacing: 4,
    color: SOFT, marginBottom: 30,
  },

  markWrap: { width: BOX, height: BOX, alignItems: 'center', justifyContent: 'center' },
  pin: { position: 'absolute', width: PIN, height: PIN, alignItems: 'center', justifyContent: 'center' },
  // Room for the burst to travel beyond the mark without being clipped.
  confetti: {
    position: 'absolute', left: BOX / 2, top: BOX / 2,
    width: 0, height: 0, alignItems: 'center', justifyContent: 'center',
  },

  // Fixed height so the swap never nudges what sits below it.
  nameRow: {
    height: 52, alignSelf: 'stretch', marginTop: 26,
    alignItems: 'center', justifyContent: 'center',
  },
  nameOld: {
    position: 'absolute', fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 26, color: SOFT, textAlign: 'center',
  },
  nameNew: {
    position: 'absolute', fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 34, color: INK, textAlign: 'center',
  },

  barBlock: { alignSelf: 'stretch', alignItems: 'center', marginTop: 22 },
  track: {
    alignSelf: 'stretch', height: 6, borderRadius: 3,
    backgroundColor: RULE, overflow: 'hidden',
  },
  fill: {
    position: 'absolute', left: 0, top: 0, bottom: 0, width: '100%',
    backgroundColor: INK, borderRadius: 3, transformOrigin: '0% 50%',
  },
  barLabel: {
    fontFamily: 'Inter_500Medium', fontSize: 12.5, letterSpacing: 1.2,
    color: SOFT, marginTop: 12,
  },

  btn: { borderRadius: 14, paddingVertical: 18, alignItems: 'center' },
  btnLip: { position: 'absolute', left: 0, right: 0, top: LIP.button, bottom: 0, borderRadius: 14 },
  btnText: { fontFamily: 'Inter_700Bold', fontSize: 18 },
});
