import { useCallback, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, cancelAnimation, Easing, type SharedValue,
} from 'react-native-reanimated';
import Glyph from '@/components/shared/Glyph';
import {
  STREAK_TIERS, STREAK_DEEP, SLATE_LIT, tierFor, nextTier, type StreakTier,
} from '@/constants/streak';
import { DEEP, EMBER, SAND, SAND_LIT, PAPER_LIT, INK, mix } from '@/components/shared/tone';
import { LINE } from '@/components/shared/drawn';

// ─────────────────────────────────────────────────────────────────────────────
// THE SOCIETY, AS THE THING IT IS.
//
// "Make the society seem more important." It was a white card with a grey
// caption, one sentence and a thin bar — the same weight as the rest-day
// explainer under it, for the one thing on the streak screen that says what the
// reader has BECOME rather than what they have counted.
//
// So it is struck in the society's own material now: the palette's quiet dark
// teal with sand lettering, the plaque on the mascot's wall made large (§7 put
// sand on DEEP at 7.38:1, and it is the plate every struck title in the app
// uses). On it:
//
//   · THE SEAL — a wax seal with a scalloped edge and the society's emblem,
//     in the ember when it is held, a dashed sand outline when it is not yet.
//   · THE NAME — large, with how long ago they were admitted.
//   · THE WAY TO THE NEXT ONE — a bar and a count of days.
//   · THE LADDER — all ten seals on one rail, earned ones struck, the next one
//     outlined, the rest dark. Tap any seal to read what it takes.
//
// It arrives once per visit (the seal lands, the rail fills, the seals light in
// turn) and then holds perfectly still: this page sits over Android's overscroll
// stretch, and anything that moves for ever re-rasterises the whole page on every
// frame of a bounce (see streak.tsx).
// ─────────────────────────────────────────────────────────────────────────────

const PANEL = DEEP;
const PANEL_LEDGE = mix(DEEP, INK, 0.45);
const PANEL_RULE = mix(DEEP, PAPER_LIT, 0.16);
const LOCKED = mix(DEEP, INK, 0.28);
const LOCKED_EDGE = mix(DEEP, PAPER_LIT, 0.26);
const ENTER_MS = 900;

const clamp01 = (x: number) => {
  'worklet';
  return x < 0 ? 0 : x > 1 ? 1 : x;
};
const backOut = (u: number) => {
  'worklet';
  const k = 1.9;
  const v = u - 1;
  return 1 + (k + 1) * v * v * v + k * v * v;
};

type SealState = 'held' | 'next' | 'locked';

/**
 * A society's seal: a wax disc with a scalloped rim, the emblem in paper. The
 * scallop is twelve small discs behind the face in the same colour — the
 * silhouette is what says "seal" at a glance, and it costs no SVG.
 */
function Seal({ tier, size, state, alive, scallop = false }: {
  tier: StreakTier; size: number; state: SealState; alive: boolean; scallop?: boolean;
}) {
  const wax = alive ? EMBER : SLATE_LIT;
  const face = state === 'held' ? wax : state === 'next' ? 'transparent' : LOCKED;
  const edge = state === 'held' ? INK : state === 'next' ? SAND : LOCKED_EDGE;
  const mark = state === 'held' ? PAPER_LIT : state === 'next' ? SAND : LOCKED_EDGE;
  const bumps = 12;
  const bump = size * 0.26;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {scallop && state === 'held'
        ? Array.from({ length: bumps }, (_, i) => {
            const a = (i / bumps) * Math.PI * 2;
            const r = size / 2 - bump * 0.3;
            return (
              <View
                key={i}
                style={{
                  position: 'absolute', width: bump, height: bump, borderRadius: bump / 2,
                  left: size / 2 + Math.cos(a) * r - bump / 2,
                  top: size / 2 + Math.sin(a) * r - bump / 2,
                  backgroundColor: wax, borderWidth: LINE, borderColor: INK,
                }}
              />
            );
          })
        : null}
      <View
        style={{
          width: scallop ? size * 0.9 : size, height: scallop ? size * 0.9 : size,
          borderRadius: size, backgroundColor: face,
          borderWidth: state === 'held' ? LINE : 1.8, borderColor: edge,
          borderStyle: state === 'next' ? 'dashed' : 'solid',
          alignItems: 'center', justifyContent: 'center',
          ...(state === 'held' ? { borderBottomWidth: Math.max(3, size * 0.07), borderBottomColor: STREAK_DEEP } : null),
        }}
      >
        {scallop && state === 'held' ? (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute', width: size * 0.66, height: size * 0.66, borderRadius: size,
              borderWidth: 1.5, borderColor: mix(wax, PAPER_LIT, 0.45),
            }}
          />
        ) : null}
        <Glyph name={tier.glyph} size={size * (scallop ? 0.42 : 0.52)} color={mark} weight={scallop ? 2.6 : 2.4} />
      </View>
    </View>
  );
}

/** One step of the ladder: lights in turn on arrival. */
function Rung({ tier, k, state, alive, selected, onPress, enter }: {
  tier: StreakTier; k: number; state: SealState; alive: boolean; selected: boolean;
  onPress: () => void; enter: SharedValue<number>;
}) {
  const st = useAnimatedStyle(() => {
    const u = clamp01((enter.value - 0.25 - k * 0.05) / 0.3);
    return { opacity: 0.25 + 0.75 * u, transform: [{ scale: 0.6 + 0.4 * backOut(u) }] };
  });
  return (
    <Pressable onPress={onPress} hitSlop={6} style={styles.rung}>
      <Animated.View style={st}>
        <Seal tier={tier} size={24} state={state} alive={alive} />
      </Animated.View>
      <Text style={[styles.rungDay, state === 'held' && styles.rungDayHeld, selected && styles.rungDaySel]}>
        {tier.at}
      </Text>
      {selected ? <View style={styles.caret} /> : null}
    </Pressable>
  );
}

export default function SocietyCard({ streak, alive }: { streak: number; alive: boolean }) {
  const tier = alive ? tierFor(streak) : null;
  const next = nextTier(alive ? streak : 0);
  const heldIdx = tier ? STREAK_TIERS.indexOf(tier) : -1;
  const [picked, setPicked] = useState<number | null>(null);
  const sel = picked ?? (next ? STREAK_TIERS.indexOf(next) : heldIdx);
  const selTier = STREAK_TIERS[sel];

  const enter = useSharedValue(0);
  useFocusEffect(
    useCallback(() => {
      enter.value = 0;
      enter.value = withTiming(1, { duration: ENTER_MS, easing: Easing.linear });
      return () => cancelAnimation(enter);
    }, [enter]),
  );

  const sealStyle = useAnimatedStyle(() => {
    const u = clamp01(enter.value / 0.4);
    return { transform: [{ scale: 0.5 + 0.5 * backOut(u) }, { rotate: `${(1 - u) * -18}deg` }] };
  });

  // The rail fills to the held society's seal, and a little way toward the next
  // one in proportion to the days already put in.
  const prevAt = tier ? tier.at : 0;
  const frac = next ? clamp01Plain((streak - prevAt) / Math.max(1, next.at - prevAt)) : 0;
  const railTo = heldIdx < 0 ? frac * 0.5 : Math.min(STREAK_TIERS.length - 1, heldIdx + (next ? frac : 0));
  const railStyle = useAnimatedStyle(() => {
    const u = clamp01((enter.value - 0.2) / 0.6);
    const e = 1 - Math.pow(1 - u, 3);
    return { width: `${(railTo / (STREAK_TIERS.length - 1)) * 100 * e}%` };
  });

  const toNext = next ? next.at - (alive ? streak : 0) : 0;
  const sinceJoined = tier ? streak - tier.at : 0;
  const stateOf = (i: number): SealState => (i <= heldIdx ? 'held' : next && STREAK_TIERS[i] === next ? 'next' : 'locked');

  return (
    <View style={styles.wrap}>
      <View style={styles.ledge} />
      <View style={styles.card}>
        <View style={styles.top}>
          <Text style={styles.kicker}>THE SOCIETY</Text>
          <View style={[styles.pill, tier ? styles.pillOn : styles.pillOff]}>
            <Text style={[styles.pillText, !tier && { color: SAND }]}>
              {tier ? 'MEMBER' : 'NOT YET A MEMBER'}
            </Text>
          </View>
        </View>

        <View style={styles.hero}>
          <Animated.View style={sealStyle}>
            <Seal tier={tier ?? next ?? STREAK_TIERS[0]} size={86} state={tier ? 'held' : 'next'} alive={alive} scallop />
          </Animated.View>
          <View style={styles.heroText}>
            <Text style={styles.name} numberOfLines={2}>{(tier ?? next ?? STREAK_TIERS[0]).name}</Text>
            <Text style={styles.admitted}>
              {tier
                ? sinceJoined === 0 ? 'Admitted today' : `Admitted ${sinceJoined} ${sinceJoined === 1 ? 'day' : 'days'} ago`
                : `Admits you at ${(next ?? STREAK_TIERS[0]).at} days`}
            </Text>
            <Text style={styles.blurb}>{(tier ?? next ?? STREAK_TIERS[0]).blurb}</Text>
          </View>
        </View>

        {next ? (
          <View style={styles.nextRow}>
            <Text style={styles.nextText}>
              <Text style={styles.nextBig}>{toNext}</Text>
              {` ${toNext === 1 ? 'day' : 'days'} to ${next.name}`}
            </Text>
          </View>
        ) : (
          <Text style={styles.nextText}>Every society has admitted you. There are no more.</Text>
        )}

        {/* THE LADDER: all ten, on one rail. */}
        <View style={styles.ladder}>
          <View style={styles.railTrack}>
            <Animated.View style={[styles.railFill, { backgroundColor: alive ? EMBER : SLATE_LIT }, railStyle]} />
          </View>
          <View style={styles.rungs}>
            {STREAK_TIERS.map((t, i) => (
              <Rung
                key={t.at}
                tier={t}
                k={i}
                state={stateOf(i)}
                alive={alive}
                selected={i === sel}
                onPress={() => setPicked(i)}
                enter={enter}
              />
            ))}
          </View>
        </View>

        {/* What the tapped seal takes. */}
        <View style={styles.detail}>
          <Text style={styles.detailName}>{selTier.name}</Text>
          <Text style={styles.detailWhen}>
            {sel <= heldIdx ? 'Held' : `${selTier.at} days in a row`}
          </Text>
        </View>
      </View>
    </View>
  );
}

function clamp01Plain(x: number) {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

const styles = StyleSheet.create({
  wrap: { paddingBottom: 5 },
  ledge: { position: 'absolute', left: 0, right: 0, top: 5, bottom: 0, borderRadius: 18, backgroundColor: PANEL_LEDGE },
  card: {
    backgroundColor: PANEL, borderRadius: 18, borderWidth: LINE, borderColor: INK,
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 12,
  },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  kicker: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 2.6, color: SAND },
  pill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1.6 },
  pillOn: { backgroundColor: EMBER, borderColor: INK },
  pillOff: { backgroundColor: 'transparent', borderColor: mix(SAND, DEEP, 0.4) },
  pillText: { fontFamily: 'Inter_700Bold', fontSize: 9.5, letterSpacing: 1.6, color: PAPER_LIT },

  hero: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 14 },
  heroText: { flex: 1 },
  name: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 26, lineHeight: 31, color: PAPER_LIT },
  admitted: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1.2, color: SAND, marginTop: 2 },
  blurb: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 18, color: SAND_LIT, marginTop: 6 },

  nextRow: {},
  nextText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: SAND_LIT, marginTop: 14 },
  nextBig: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 20, color: PAPER_LIT },

  ladder: { marginTop: 14 },
  railTrack: {
    position: 'absolute', left: 12, right: 12, top: 9, height: 6, borderRadius: 3,
    backgroundColor: LOCKED, overflow: 'hidden',
  },
  railFill: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 3 },
  rungs: { flexDirection: 'row', justifyContent: 'space-between' },
  rung: { alignItems: 'center', width: 26 },
  rungDay: { fontFamily: 'Inter_700Bold', fontSize: 9, color: LOCKED_EDGE, marginTop: 4, fontVariant: ['tabular-nums'] },
  rungDayHeld: { color: SAND },
  rungDaySel: { color: PAPER_LIT },
  caret: { width: 14, height: 3, borderRadius: 2, backgroundColor: PAPER_LIT, marginTop: 3 },

  detail: {
    flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between',
    marginTop: 10, paddingTop: 10, borderTopWidth: 1.5, borderTopColor: PANEL_RULE,
  },
  detailName: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 15, color: PAPER_LIT },
  detailWhen: { fontFamily: 'Inter_700Bold', fontSize: 10.5, letterSpacing: 1.4, color: SAND },
});
