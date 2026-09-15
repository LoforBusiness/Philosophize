import { useCallback, useMemo, useRef, type ReactNode } from 'react';
import {
  View, Text, ScrollView, StyleSheet, useWindowDimensions, Linking,
  type LayoutChangeEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue, useAnimatedStyle, withSequence, withTiming, interpolate,
  Extrapolation, Easing, type SharedValue,
} from 'react-native-reanimated';
import ScreenTransition from '@/components/shared/ScreenTransition';
import SketchIcon, { type SketchIconName } from '@/components/shared/SketchIcon';
import Button from '@/components/ui/Button';
import { MetalPlate, StruckTile } from '@/components/profile/Struck';
import {
  METAL, INK, MID, GHOST, PAPER, PAPER_LIT, PAPER_SHADE, mix,
} from '@/components/shared/tone';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { C, SPACE } from '@/constants/design';
import { FALLBACK_PRICE, BILLING_PERIOD_LABEL } from '@/constants/subscription';
import { TERMS_URL, PRIVACY_URL } from '@/constants/legal';
import {
  compareRows, includedTiles, type Cell, type CompareRow, type IncludedTile,
} from '@/lib/utils/passCompare';
import { track } from '@/lib/posthog';

// ─────────────────────────────────────────────────────────────────────────────
// THE PASS TAB.
//
// A tab of its own, between Insights and Profile, because a paywall that only
// appears when a reader is BLOCKED is an ambush and one at a permanent address
// is a shop they can walk out of.
//
// ── IT WAS TWO CERTIFICATES, AND THAT WAS THE PROBLEM ───────────────────────
//
//   "it's a little bit too confusing because a lot of information, and it's
//    pretty difficult to understand what the different benefits are of each
//    plan ... look at Brilliant's page ... it shows two different sections."
//
// The tab printed a herald, an engraved Scholar's Pass with eleven ruled rows,
// the wall in days, and then an engraved Day Pass with the same eleven rows
// again. Everything on it was true and nothing on it was quick to read: to see
// what paying changes, a reader had to hold one certificate in their head while
// scrolling to the other.
//
// Brilliant answers the same question with one chart (researched against their
// own app, 2025): a Benefits column, a quiet Free column, and a Premium column
// raised in a bright frame, five short rows with a tick or a cross in each, and
// one chunky button. NN/g's rule for comparisons on a phone says the same thing
// from the other end: two options, only the rows that differ, and what both share
// merged rather than repeated. So this is that chart, in this app's materials:
//
//   · THE PASS COLUMN IS STRUCK GOLD, not a rainbow. The frame is the metal every
//     reward here is made of, lit from the top left, sitting on a hard lip the
//     way the app's buttons do. Its cells stamp in, one row after another, each
//     time the tab is opened.
//   · A LIMIT IS SAID IN WORDS where it is not zero. "1" lessons a day, "In order"
//     for units, "2 held" rest days. A cross appears only where the free tier has
//     none of the thing, because a cross beside "Start any unit" would say a free
//     reader cannot start one at all.
//   · WHAT BOTH PLANS SHARE IS SIX TILES, ONCE, below the button.
//
// ── EVERY CELL AND EVERY FIGURE IS STILL DERIVED ────────────────────────────
//
// §14's rule. `compareRows()` builds the chart from `PASS_LINES` and
// `includedTiles()` counts the library out of the tree; `npm run check:pass`
// re-derives both from the gates that enforce them and reads this file for any
// digit typed into its text.
// ─────────────────────────────────────────────────────────────────────────────

const GOLD = METAL.GOLD;
/** Gold dark enough to be read as a word on paper. check-pass measures it. */
const INK_GOLD = mix(GOLD.base, INK, 0.34);
/** The Free column's panel: a breath of the locked slate, the quieter of the two. */
const FREE_PANEL = mix(PAPER, GHOST, 0.16);
/** The "not at all" token. check-pass measures it on the panel, and the cross on it. */
const NO_DISC = mix(GHOST, INK, 0.36);
const RULE = mix(PAPER_SHADE, PAPER, 0.45);
const LIGHT_START = { x: 0.15, y: 0 } as const;
const LIGHT_END = { x: 0.85, y: 1 } as const;

// ── THE CHART'S GEOMETRY ────────────────────────────────────────────────────
//
// Set against the narrowest phone the app supports. At 320dp the content column
// is 272, so the benefit label keeps 110 once its own padding is taken off. The
// first draft gave the columns 70 and 96, and "Replay finished lessons" broke
// into three lines there, one word each.
const FREE_W = 64;
const PASS_W = 90;
/** The gold showing round the white card inside the Pass column. */
const FRAME = 6;
/** The hard lip under the Pass column. A shadow with no blur, as on a button. */
const LIP = 4;
/** How far the Pass column stands above the Free panel. */
const LIFT = 10;
const HEAD_H = 54;
const MARK = 26;

// ── THE ARRIVAL, AS WINDOWS OF ONE DRIVER ───────────────────────────────────
//
// One linear value, 0 → 1 on every visit. A glint crosses the gold first, then
// the Pass column's cells land one row at a time. The driver RESTS AT 1, so a
// screen that is never focused (a warmed tab, or a preview with no navigator)
// shows everything in place rather than waiting for an arrival that never comes.
const PLAY_MS = 1500;
const SHEEN_AT = 0.04;
const SHEEN_LEN = 0.42;
const SHEEN_H = 120;
const STAMP_AT = 0.26;
const STAMP_STEP = 0.09;
const STAMP_LEN = 0.22;

const TILE_ICON: Record<IncludedTile['id'], SketchIconName> = {
  library: 'book',
  thinkers: 'hat',
  quotes: 'bookmark',
  ranks: 'star',
  badges: 'spark',
  streak: 'flame',
};

export default function PassTab() {
  const isPro = useSubscriptionStore((s) => s.isPro);
  const monthly = useSubscriptionStore((s) => s.monthly);

  const { width: winW } = useWindowDimensions();
  const PAD = SPACE[4];
  const contentW = winW - PAD * 2;
  const tileW = Math.floor((contentW - SPACE[2] * 2) / 3);

  // The store's localized string when there is one, the shared fallback on web,
  // in Expo Go and before RevenueCat answers. Never a typed price.
  const price = monthly?.priceString ?? FALLBACK_PRICE;
  const period = BILLING_PERIOD_LABEL;

  // Local consts: TypeScript will not carry a narrowing of an IMPORTED binding
  // into a callback, because it cannot know the module has not reassigned it.
  const terms = TERMS_URL;
  const privacy = PRIVACY_URL;

  const rows = useMemo(() => compareRows(), []);
  const tiles = useMemo(() => includedTiles(), []);

  const play = useSharedValue(1);
  const tableH = useSharedValue(0);
  const onTable = (e: LayoutChangeEvent) => {
    tableH.value = e.nativeEvent.layout.height;
  };

  // ── ON FOCUS, NOT ON MOUNT, AND KEYED ON NOTHING ──────────────────────────
  //
  // Every tab is built before it is visited (app/(app)/_layout.tsx), so a mount
  // animation would play once, at startup, behind the launch screen, and never
  // again. And the callback depends on nothing that can change while the reader
  // is looking: `available` flips when RevenueCat answers, and a callback that
  // listed it would replay the whole arrival under a reader who had not moved,
  // which is the Insights fault §19 records. It is read from the store instead.
  //
  // A REF for the analytics flag, not state: nothing on screen depends on it.
  const seen = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (!seen.current) {
        seen.current = true;
        track('paywall_viewed', {
          available: useSubscriptionStore.getState().available,
          source: 'pass_tab',
        });
      }
      play.value = withSequence(
        withTiming(0, { duration: 0 }),
        withTiming(1, { duration: PLAY_MS, easing: Easing.linear }),
      );
    }, [play]),
  );

  /**
   * THE PURCHASE IS NOT RUN FROM HERE. The paywall route owns the busy state,
   * the failure notices and the restore path, and a second implementation of
   * those could disagree about whether somebody had just been charged. Nor is the
   * button gated on `available`: a price with no way to act on it, and no word
   * of why, is the worst screen this could show, and the route explains an
   * unavailable store properly.
   */
  const onSubscribe = () => {
    track('subscribe_clicked', { plan: 'monthly', billing: 'monthly', source: 'pass_tab' });
    router.push('/(app)/paywall');
  };

  return (
    <ScreenTransition bg={C.paper}>
      <SafeAreaView style={st.safe} edges={['top']}>
        {/* A warm light from the top left, the corner every struck thing in the
            app is lit from. Brilliant washes its header in colour; this is the
            same move in the one metal the tab is about. It is fully paper well
            before the box ends: a diagonal that stopped at the box's bottom edge
            left a hard line across the chart. */}
        <LinearGradient
          pointerEvents="none"
          colors={[mix(GOLD.lit, PAPER, 0.5), PAPER, PAPER]}
          locations={[0, 0.7, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.55, y: 1 }}
          style={st.glow}
        />

        <ScrollView
          contentContainerStyle={[st.body, { paddingHorizontal: PAD }]}
          showsVerticalScrollIndicator={false}
        >
          {/* The name never breaks across a line: "Scholar’s / Pass" left the
              product's name split with one word stranded under the other. */}
          <Text style={st.h1}>
            {isPro ? 'You hold the ' : 'Every lesson, every day, with the '}
            <Text style={st.h1Gold}>{'Scholar’s Pass'}</Text>
          </Text>

          {/* ── THE CHART ─────────────────────────────────────────────────── */}
          <View style={st.table} onLayout={onTable}>
            {/* The two columns are drawn first, as panels, and the rows are laid
                over them. That is what keeps a row one height across all three
                columns when its label wraps on a narrow phone. */}
            <View style={st.freePanel} />
            <View style={st.passFrame}>
              <View style={st.passLip} />
              <LinearGradient
                colors={[GOLD.lit, GOLD.base, mix(GOLD.base, GOLD.shade, 0.55)]}
                locations={[0, 0.42, 1]}
                start={LIGHT_START}
                end={LIGHT_END}
                style={st.passFace}
              >
                <Sheen play={play} tableH={tableH} />
                <View style={st.passCard}>
                  <View style={st.passCut} />
                </View>
              </LinearGradient>
            </View>

            <View style={st.headRow}>
              <Text style={st.headLabel}>Benefits</Text>
              <View style={st.freeCell}>
                <Text style={st.headFree}>Free</Text>
              </View>
              <View style={st.passCell}>
                <Text style={st.headPass}>Pass</Text>
              </View>
            </View>

            {rows.map((row, i) => (
              <Row key={row.id} row={row} index={i} play={play} />
            ))}
            <View style={st.tail} />
          </View>

          {/* ── THE PRICE AND THE DOOR ────────────────────────────────────── */}
          {isPro ? (
            <View style={st.held}>
              <MetalPlate metal={GOLD} label="ACTIVE" />
              <Text style={st.heldNote}>
                Every lesson is open to you. Manage or cancel the Pass any time from Settings.
              </Text>
            </View>
          ) : (
            <View style={st.buy}>
              <Text style={st.priceLine}>
                <Text style={st.price}>{price}</Text>
                {` a ${period} · Cancel any time`}
              </Text>
              <Button label="Get the Scholar’s Pass" size="lg" onPress={onSubscribe} />
            </View>
          )}

          {/* ── WHAT BOTH PLANS SHARE, ONCE ───────────────────────────────── */}
          <Text style={st.kicker}>EVERY PLAN INCLUDES</Text>
          <View style={st.tiles}>
            {tiles.map((t) => (
              <Tile key={t.id} tile={t} width={tileW} />
            ))}
          </View>

          <Text style={st.legal}>The Scholar’s Pass renews every {period} until cancelled.</Text>
          <View style={st.links}>
            <Text style={st.link} onPress={() => terms && Linking.openURL(terms)}>Terms</Text>
            <Text style={st.linkDot}>·</Text>
            <Text style={st.link} onPress={() => privacy && Linking.openURL(privacy)}>Privacy</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ScreenTransition>
  );
}

/** One benefit: its label, the Free cell, and the Pass cell landing in turn. */
function Row({ row, index, play }: { row: CompareRow; index: number; play: SharedValue<number> }) {
  return (
    <View style={st.row}>
      {/* The rule above each row runs across the label and the Free panel, and
          separately inside the white card. The first row's upper edge inside the
          card IS the card's own top, so it draws no second line there. */}
      <View style={st.ruleLeft} />
      {index > 0 ? <View style={st.rulePass} /> : null}

      <Text style={st.rowLabel}>{row.label}</Text>
      <View style={st.freeCell}>
        <Mark cell={row.free} tier="free" />
      </View>
      <View style={st.passCell}>
        <Stamp play={play} index={index}>
          <Mark cell={row.pass} tier="pass" />
        </Stamp>
      </View>
    </View>
  );
}

/**
 * A tick, a cross, or a few words.
 *
 * THE TICK IS A GOLD COIN WITH AN INK TICK, because ink is the readable one on
 * gold (`METAL.GOLD.on`) and because a coin is what this app pays rewards in.
 * THE CROSS IS FLAT AND COOL, the treatment a locked medal gets, so the two
 * tokens differ by material and not only by the mark on them.
 */
function Mark({ cell, tier }: { cell: Cell; tier: 'free' | 'pass' }) {
  if (cell.kind === 'yes') {
    return (
      <View style={st.coinHalo}>
        <LinearGradient
          colors={[GOLD.lit, GOLD.base]}
          start={LIGHT_START}
          end={LIGHT_END}
          style={st.coin}
        >
          <View style={st.tickShort} />
          <View style={st.tickLong} />
        </LinearGradient>
      </View>
    );
  }
  if (cell.kind === 'no') {
    return (
      <View style={st.noDisc}>
        <View style={[st.crossBar, st.crossA]} />
        <View style={[st.crossBar, st.crossB]} />
      </View>
    );
  }
  return <Text style={tier === 'pass' ? st.valuePass : st.valueFree}>{cell.text}</Text>;
}

/**
 * THE STRIKE, IN MINIATURE. The streak seal lands as a die coming down onto paper
 * (CLAUDE.md §7), and a cell lands the same way: from above the page,
 * accelerating, squashing on contact and settling. A spring from small to full
 * size would read as something inflating, which nothing on a chart does.
 */
function Stamp({ play, index, children }: { play: SharedValue<number>; index: number; children: ReactNode }) {
  const style = useAnimatedStyle(() => {
    const a = STAMP_AT + index * STAMP_STEP;
    const u = interpolate(play.value, [a, a + STAMP_LEN], [0, 1], Extrapolation.CLAMP);
    const f = Math.min(1, u / 0.55);
    const scale = u < 0.55
      ? 1.7 - 0.8 * f * f
      : interpolate(u, [0.55, 0.8, 1], [0.9, 1.05, 1]);
    return {
      opacity: interpolate(u, [0, 0.2], [0, 1], Extrapolation.CLAMP),
      transform: [{ scale }],
    };
  });
  return <Animated.View style={style}>{children}</Animated.View>;
}

/** The glint across the gold, once per visit. Clipped by the frame's own corners. */
function Sheen({ play, tableH }: { play: SharedValue<number>; tableH: SharedValue<number> }) {
  const style = useAnimatedStyle(() => {
    const u = interpolate(play.value, [SHEEN_AT, SHEEN_AT + SHEEN_LEN], [0, 1], Extrapolation.CLAMP);
    return {
      opacity: u > 0 && u < 1 ? 1 : 0,
      transform: [
        { translateY: -SHEEN_H + u * (tableH.value + SHEEN_H * 2) },
        { rotate: '-24deg' },
      ],
    };
  });
  return (
    <Animated.View pointerEvents="none" style={[st.sheen, style]}>
      <LinearGradient
        colors={[`${PAPER_LIT}00`, `${PAPER_LIT}B3`, `${PAPER_LIT}00`]}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}

/** Something every reader already has, as a figure and a noun. */
function Tile({ tile, width }: { tile: IncludedTile; width: number }) {
  return (
    <StruckTile pad={2} style={{ width }}>
      <View style={st.tileTop}>
        <SketchIcon name={TILE_ICON[tile.id]} size={17} color={INK_GOLD} />
        <Text style={st.tileFigure} numberOfLines={1}>{tile.figure}</Text>
      </View>
      <Text style={st.tileNoun} numberOfLines={2}>{tile.noun}</Text>
    </StruckTile>
  );
}

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.paper },
  glow: { position: 'absolute', left: 0, right: 0, top: 0, height: 360 },
  body: { paddingTop: SPACE[4], paddingBottom: SPACE[5] * 2 },

  h1: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 30, lineHeight: 37, color: INK,
    textAlign: 'center', includeFontPadding: false, paddingHorizontal: SPACE[1],
  },
  h1Gold: { color: INK_GOLD },

  // ── the chart ──
  table: { marginTop: SPACE[5] },
  // It runs 18pt under the gold column, so its right-hand corners are tucked
  // behind the frame rather than showing as a second rounded edge beside it.
  freePanel: {
    position: 'absolute', top: LIFT, bottom: LIP + FRAME,
    right: PASS_W - 18, width: FREE_W + 18,
    borderRadius: 18, backgroundColor: FREE_PANEL,
  },
  passFrame: { position: 'absolute', top: 0, bottom: 0, right: 0, width: PASS_W },
  // A SLAB, NOT `elevation`. On Android an elevated view is drawn above its
  // unelevated siblings whatever the JSX order, so a shadowed frame would sit
  // on top of the very rows it is meant to be behind.
  passLip: {
    position: 'absolute', left: 0, right: 0, top: LIP, bottom: 0,
    borderRadius: 20, backgroundColor: GOLD.rim,
  },
  passFace: {
    position: 'absolute', left: 0, right: 0, top: 0, bottom: LIP,
    borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: GOLD.shade,
  },
  passCard: {
    position: 'absolute', top: HEAD_H - 1, left: FRAME - 1, right: FRAME - 1, bottom: FRAME - 1,
    borderRadius: 14, backgroundColor: PAPER_LIT, overflow: 'hidden',
  },
  // The card is a window cut into the gold, so its top edge is the dark one.
  passCut: {
    position: 'absolute', left: 0, right: 0, top: 0, height: 1.5,
    backgroundColor: mix(GOLD.shade, PAPER_LIT, 0.4),
  },
  sheen: { position: 'absolute', left: -PASS_W / 2, width: PASS_W * 2, top: 0, height: SHEEN_H },

  headRow: { flexDirection: 'row', alignItems: 'center', height: HEAD_H, paddingTop: LIFT / 2 },
  headLabel: { flex: 1, fontFamily: 'Inter_700Bold', fontSize: 15, color: INK },
  headFree: { fontFamily: 'Inter_700Bold', fontSize: 15, color: MID },
  headPass: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 19, color: GOLD.on, includeFontPadding: false },

  row: { flexDirection: 'row', alignItems: 'center', minHeight: 56 },
  ruleLeft: {
    position: 'absolute', top: 0, left: 0, right: PASS_W, height: 1, backgroundColor: RULE,
  },
  rulePass: {
    position: 'absolute', top: 0, right: FRAME + SPACE[2], width: PASS_W - (FRAME + SPACE[2]) * 2,
    height: 1, backgroundColor: mix(GOLD.lit, PAPER_LIT, 0.35),
  },
  rowLabel: {
    flex: 1, fontFamily: 'Inter_500Medium', fontSize: 14, lineHeight: 18, color: INK,
    paddingRight: SPACE[2], paddingVertical: SPACE[2],
  },
  freeCell: { width: FREE_W, alignItems: 'center', justifyContent: 'center' },
  passCell: {
    width: PASS_W, alignItems: 'center', justifyContent: 'center', paddingHorizontal: FRAME,
  },
  tail: { height: FRAME + LIP + SPACE[2] },

  valueFree: { fontFamily: 'Inter_500Medium', fontSize: 13, color: MID, textAlign: 'center' },
  valuePass: { fontFamily: 'Inter_700Bold', fontSize: 13.5, color: INK, textAlign: 'center' },

  coinHalo: {
    width: MARK + 8, height: MARK + 8, borderRadius: (MARK + 8) / 2,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: mix(GOLD.lit, PAPER_LIT, 0.55),
  },
  coin: {
    width: MARK, height: MARK, borderRadius: MARK / 2, borderWidth: 1.5, borderColor: GOLD.shade,
    alignItems: 'center', justifyContent: 'center',
  },
  // Two bars rather than a glyph: exact at any size, where a font's checkmark is
  // a smudge. Their ends meet at the tick's lowest point.
  tickShort: {
    position: 'absolute', width: 9, height: 2.6, borderRadius: 1.3, backgroundColor: INK,
    transform: [{ translateX: -4.25 }, { translateY: 1.75 }, { rotate: '45deg' }],
  },
  tickLong: {
    position: 'absolute', width: 14, height: 2.6, borderRadius: 1.3, backgroundColor: INK,
    transform: [{ translateX: 2 }, { translateY: 0 }, { rotate: '-45deg' }],
  },
  noDisc: {
    width: MARK, height: MARK, borderRadius: MARK / 2, backgroundColor: NO_DISC,
    alignItems: 'center', justifyContent: 'center',
  },
  crossBar: { position: 'absolute', width: 12, height: 2.6, borderRadius: 1.3, backgroundColor: PAPER_LIT },
  crossA: { transform: [{ rotate: '45deg' }] },
  crossB: { transform: [{ rotate: '-45deg' }] },

  // ── the door ──
  buy: { marginTop: SPACE[4], gap: SPACE[2] },
  priceLine: { fontFamily: 'Inter_400Regular', fontSize: 13.5, color: MID, textAlign: 'center' },
  price: { fontFamily: 'Inter_700Bold', fontSize: 15, color: INK },
  held: { marginTop: SPACE[4], alignItems: 'center', gap: SPACE[2] },
  heldNote: {
    fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19, color: MID, textAlign: 'center',
  },

  // ── the tiles ──
  kicker: {
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.8, color: MID,
    marginTop: SPACE[5], marginBottom: SPACE[2],
  },
  // `flex-start`, because a wrapped row STRETCHES its children by default and
  // StruckTile's face does not stretch with its shadow: a tile beside a taller
  // one grew a bare strip under its gradient.
  tiles: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', gap: SPACE[2] },
  tileTop: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  tileFigure: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 19, color: INK, includeFontPadding: false,
  },
  tileNoun: { fontFamily: 'Inter_500Medium', fontSize: 11, lineHeight: 14, color: MID, marginTop: 3 },

  legal: {
    fontFamily: 'Inter_400Regular', fontSize: 10.5, lineHeight: 16, color: MID,
    textAlign: 'center', marginTop: SPACE[5],
  },
  links: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: SPACE[2],
    marginTop: SPACE[1],
  },
  link: {
    fontFamily: 'Inter_500Medium', fontSize: 11, color: C.ink, textDecorationLine: 'underline',
  },
  linkDot: { fontFamily: 'Inter_400Regular', fontSize: 11, color: MID },
});
