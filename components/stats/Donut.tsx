import { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, type GestureResponderEvent } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import Svg, { Circle, Defs, G, LinearGradient, Line, Stop } from 'react-native-svg';
import { PANEL_BASE, PANEL_RULE, glow, mix } from '@/components/shared/tone';
import { C } from '@/constants/design';

// ─────────────────────────────────────────────────────────────────────────────
// THE DIAL — the ring at the top of the instrument.
//
// ── WHY IT IS THIN NOW ──────────────────────────────────────────────────────
//
//   > "the graph is too kidesh ... not just a bunch of colors that make the app
//   > feel cheep."
//
// The previous ring was 26px of saturated colour on white, which is a great deal
// of pigment and reads as poster paint. Nothing was wrong with the hues: this
// one carries the same six branches at 14px on near-black, cut to jewel tones by
// `glow()`, and the whole difference is AREA and GROUND. A thin arc of amber on
// black is a filament; a fat one on paper is a crayon.
//
// ── THE TICKS ARE NOT DECORATION ────────────────────────────────────────────
//
// Sixty of them, every six degrees, every fifth one longer. They are what makes
// a circle read as an INSTRUMENT rather than as a pie: a bezel implies the ring
// is measured against something, and it gives the eye a scale to judge a
// segment against. They are also the cheapest depth available — a second, finer,
// entirely static ring outside the first.
//
// ── AND STILL NOT ONE ANIMATED SVG PROPERTY ─────────────────────────────────
//
// §17. Arcs and ticks are computed once. The only thing that moves is a scale
// transform on the wrapper — see `pop`, and `bounceTo` in InsightBoard for the
// squeeze-then-overshoot it carries.
// ─────────────────────────────────────────────────────────────────────────────

export interface Segment { key: string; label: string; value: number; hue: string }

interface Props {
  segments: Segment[];
  total: number;
  totalLabel: string;
  size?: number;
  selected?: string | null;
  onSelect?: (key: string) => void;
  pop: SharedValue<number>;
}

const STROKE = 14;
const GAP_DEG = 3;
const TICKS = 60;

export default function Donut({
  segments, total, totalLabel, size = 132, selected, onSelect, pop,
}: Props) {
  const r = (size - STROKE) / 2 - 8;          // 8 leaves room for the tick bezel
  const circ = 2 * Math.PI * r;
  const sum = segments.reduce((a, x) => a + x.value, 0);

  const arcs = useMemo(() => {
    if (sum <= 0) return [];
    const drawn = segments.filter((x) => x.value > 0);
    let acc = 0;
    return drawn.map((x) => {
      const frac = x.value / sum;
      const startDeg = acc * 360;
      const endDeg = (acc + frac) * 360;
      acc += frac;
      const span = Math.max(0.8, (endDeg - startDeg) - (drawn.length > 1 ? GAP_DEG : 0));
      return {
        ...x,
        startDeg,
        endDeg,
        len: (span / 360) * circ,
        // THE QUARTER TURN IS IN THE DASH, not in a <G rotation>: a
        // userSpaceOnUse gradient is rotated by its own group, so putting the
        // −90 on a <G> spins the one light along with the ring.
        offset: -(startDeg / 360) * circ + circ / 4,
        g: glow(x.hue),
      };
    });
  }, [segments, sum, circ]);

  const ticks = useMemo(() => {
    const rIn = r + STROKE / 2 + 3;
    return Array.from({ length: TICKS }, (_, i) => {
      const rad = (((i / TICKS) * 360 - 90) * Math.PI) / 180;
      const long = i % 5 === 0;
      const rOut = rIn + (long ? 5 : 2.5);
      return {
        x1: size / 2 + Math.cos(rad) * rIn,
        y1: size / 2 + Math.sin(rad) * rIn,
        x2: size / 2 + Math.cos(rad) * rOut,
        y2: size / 2 + Math.sin(rad) * rOut,
        long,
      };
    });
  }, [r, size]);

  const ringStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));

  // Anything in the hole or outside the ring is deliberately inert — a stray
  // thumb means "none of them", not "the nearest one".
  const hit = (e: GestureResponderEvent) => {
    if (!onSelect || arcs.length === 0) return;
    const { locationX, locationY } = e.nativeEvent;
    const dx = locationX - size / 2;
    const dy = locationY - size / 2;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < r - STROKE / 2 - 6 || dist > r + STROKE / 2 + 8) return;
    const deg = ((Math.atan2(dy, dx) * 180) / Math.PI + 90 + 360) % 360;
    const found = arcs.find((a) => deg >= a.startDeg && deg < a.endDeg);
    if (found) onSelect(found.key);
  };

  return (
    <View style={styles.wrap}>
      <Pressable onPress={hit} accessibilityRole="none">
        {/* A STABLE ID SO A HARNESS CAN FIND IT. `document.querySelector('svg')`
            used to be good enough and stopped being so the moment the dial grew
            a tick bezel and the ledger grew icons — the sampler started reading
            rotation matrices off tick marks and reporting negative "scales".
            Same reasoning as `#beat-progress` and `#drag-strip` in §21. */}
        <Animated.View nativeID="dial" style={[{ width: size, height: size }, ringStyle]}>
          <Svg width={size} height={size}>
            <Defs>
              {arcs.map((a) => (
                <LinearGradient
                  key={`g-${a.key}`}
                  id={`seg-${a.key}`}
                  gradientUnits="userSpaceOnUse"
                  x1={size * 0.12} y1={0} x2={size * 0.88} y2={size}
                >
                  <Stop offset="0%" stopColor={a.g.mark} />
                  <Stop offset="100%" stopColor={a.g.deep} />
                </LinearGradient>
              ))}
            </Defs>

            {ticks.map((t, i) => (
              <Line
                key={`t${i}`}
                x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
                stroke={t.long ? mix(PANEL_RULE, C.paper, 0.28) : PANEL_RULE}
                strokeWidth={1}
              />
            ))}

            {/* The groove the ring sits in, so an empty reader still sees the
                shape of the thing they are about to fill. */}
            <Circle
              cx={size / 2} cy={size / 2} r={r}
              stroke={mix(PANEL_BASE, C.paper, 0.09)} strokeWidth={STROKE} fill="none"
            />

            <G>
              {arcs.map((a) => {
                const on = selected === a.key;
                return (
                  <Circle
                    key={a.key}
                    cx={size / 2} cy={size / 2} r={r}
                    stroke={`url(#seg-${a.key})`}
                    strokeWidth={on ? STROKE + 4 : STROKE}
                    strokeDasharray={`${a.len} ${circ - a.len}`}
                    strokeDashoffset={a.offset}
                    strokeLinecap="butt"
                    fill="none"
                    // Dimmed, not drained: below about 0.6 the unselected arcs
                    // lose their hue and the dial reads grey the moment anything
                    // is picked, which is the dullness this was rebuilt to fix.
                    opacity={selected && !on ? 0.62 : 1}
                  />
                );
              })}
            </G>
          </Svg>

          <View style={styles.hub} pointerEvents="none">
            <Text style={styles.hubValue}>{total}</Text>
            <Text style={styles.hubLabel}>{totalLabel}</Text>
          </View>
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  hub: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center',
  },
  hubValue: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 30, lineHeight: 34,
    color: C.paper,
  },
  hubLabel: {
    fontFamily: 'Inter_700Bold', fontSize: 7, letterSpacing: 1.4,
    color: C.dim, marginTop: 1,
  },
});
