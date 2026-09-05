import { useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, Pressable, StyleSheet, AccessibilityInfo,
  type StyleProp, type ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, useAnimatedProps, withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import ACounter, { counterStyle } from '@/components/shared/ACounter';
import {
  Underscore, revealTo, stepDelay, EASE_REVEAL, D_WIPE, D_RISE, D_ROLL, LEAD, STEP,
} from '@/components/stats/reveal';
import { StruckBar, StruckTile, StruckPanel, EMBOSS } from '@/components/profile/Struck';
import {
  INK, PAPER_LIT, MID, PANEL_BASE, ramp, mix, glow, METAL,
} from '@/components/shared/tone';
import { C } from '@/constants/design';
import { milestoneFor, type StatElement, type Milestone } from '@/lib/utils/statsMilestone';
import type { Discovery } from '@/lib/utils/statsDiscovery';
import { cue } from '@/lib/feedback';

// ─────────────────────────────────────────────────────────────────────────────
// THE INSIGHTS TAB'S PARTS.
//
// ── EVERYTHING IS STRUCK, AND NOT BY A NEW SYSTEM ───────────────────────────
//
// `components/profile/Struck.tsx` already draws bars, tiles and metal plates in
// the one light from `tone.ts`. This tab uses those rather than growing a
// parallel set — the whole argument for one light is that it never moves, and
// two files drawing the same object is how it starts moving.
//
// ── THE REVEAL, AND WHY NOTHING BOUNCES ANY MORE ────────────────────────────
//
// It used to. A row that grew squeezed back to 0.82 and then sprang 39% past
// its new length before settling, and every other animated part of the tab did
// a milder version of the same thing.
//
//   > "for the pie chart and the boxes above that, and when you click on one of
//   > the who you read most and the other one ... all of these ... 'bounce',
//   > this looks cheap and ai looking. I want a smooth reveal for the
//   > information."
//
// They are right, and `components/stats/reveal.tsx` carries the full argument
// and the measurements. The short of it: eight springs drove this screen and
// every one was underdamped, so nothing settled without going past itself
// first — and on a BAR, going past yourself means drawing a number that is not
// true for a fifth of a second, on the one row the reader is looking hardest at.
//
// WHAT SURVIVES IS THE DISTINCTION, WHICH WAS ALWAYS THE GOOD HALF. A row that
// grew since the reader last looked still says so; it just no longer says it by
// changing size. `grownKeys` in statsMilestone.ts still decides which, out of
// the fingerprint the tab already stores, and the answer is now an UNDERSCORE:
// a rule in the row's own colour, struck along it and then faded. Feedback with
// its own object, so the data is never the thing being distorted.
//
// ── AN ARRIVAL IS NOT A REACTION, AND CONFUSING THEM WAS A BUG ──────────────
//
//   > "sometimes if I'm in the statistics section and I click on a philosopher
//   > ... and then go back. Sometimes the information will go blank on the very
//   > top and will say zero lessons, zero thinkers, zero quotes, and zero days."
//
// Exactly what it says, and it was this file. Every animated part of the tab
// treated a change in the fingerprint as an ENTRANCE: shared values reset to 0,
// counters restarted from nothing, the ledger tiles dropped to `opacity: 0` and
// `scale: 0` and then counted back up over about a second. That is the right
// motion for arriving at the tab and completely wrong for anything that happens
// while the reader is already looking at it.
//
// And meeting a thinker from inside Insights does change the fingerprint —
// `recordPhilosopherView` increments the era's met count — so the reader's own
// tap made the screen announce itself as new and wipe its own top row. Which
// also explains the "sometimes": only a thinker they had NEVER MET moves a
// counted number. Opening someone already met changes nothing and the tab holds
// still, which is why it looked intermittent.
//
// So every animated part now takes `entrance`, and the two modes are:
//
//   entrance  — the reader has just arrived. Wipe in from nothing.
//   reaction  — they were already here. NOTHING resets and nothing moves.
//               Numbers roll from the value on screen to the new one, and the
//               rows that actually grew are marked with a rule.
//
// The screen decides which from whether the play landed on FOCUS or while
// already focused; see app/(app)/stats/index.tsx. `scripts/check-stats.mjs`
// asserts that no `playToken` effect in this folder zeroes a value without
// consulting `entrance` first, because that is the whole defect in one line.
//
// ── THE HEADROOM IS 30% AND IT IS LOAD-BEARING ──────────────────────────────
//
// Bars draw against `max × 1.3`, not `max`. If the leader sat at 100% of its
// track there would be nowhere for its ghost — so tapping the biggest bar, the
// one a reader taps first, would be the one tap that showed nothing.
//
// It is a CONSTANT: re-scaling on selection would move every bar at once, which
// is the camera cut §17's group L is about.
// ─────────────────────────────────────────────────────────────────────────────

/** See the note above. Also the floor `check-stats.mjs` measures ghosts against. */
export const HEADROOM = 1.3;
export const MIN_GHOST = 8 / 144;

// The reveal itself lives in reveal.tsx, so the tab has one vocabulary rather
// than one per file. Re-exported because three files drive this screen and a
// second import path is how two of them end up on different curves.
export { revealTo } from '@/components/stats/reveal';

// ── the ledger ───────────────────────────────────────────────────────────────

export interface LedgerItem { key: string; label: string; value: number; hue: string }

/**
 * FOUR NUMBERS THAT ONLY EVER GO UP.
 *
 * Deliberately not "12 of 34": a denominator drawn from the curriculum shrinks
 * a reader's achievement every time content ships, which is the complaint this
 * redesign started from. These are counts of things done, full stop.
 *
 * ── AND NONE OF THEM IS EVER ANIMATED THROUGH ZERO ─────────────────────────
 *
 * They used to count up from 0 on arrival, and the reader reported seeing the
 * zeros twice. The first report was a real defect — the entrance replaying on
 * a tap — and it was found and fixed and measured. The second was the ARRIVAL
 * ITSELF: re-enter the tab with anything new and all four totals plus the four
 * metrics legitimately read zero for up to a second and a half while they climb,
 * and to the person whose progress it is that is indistinguishable from a bug.
 *
 * It is not worth defending. A count-up is a flourish; "your figures are gone"
 * is a fright, and it is the ONE failure this readout can have. So the number
 * on a tile is true from the first frame it is drawn, the TILE does the
 * arriving, and the digits move only when the figure behind them actually
 * moves — which is also the only time a moving number tells the reader
 * anything. `check:stats` holds it: nothing that feeds a counter may be
 * assigned 0.
 */
export function Ledger({ items, playToken, animate, entrance, grown }: {
  items: LedgerItem[]; playToken: number; animate: boolean; entrance: boolean;
  grown: Set<string>;
}) {
  return (
    <View style={s.ledger}>
      {items.map((it, i) => (
        <LedgerTile
          key={it.key}
          item={it}
          index={i}
          playToken={playToken}
          animate={animate}
          entrance={entrance}
          pop={grown.has(it.key)}
        />
      ))}
    </View>
  );
}

function LedgerTile({ item, index, playToken, animate, entrance, pop }: {
  item: LedgerItem; index: number; playToken: number;
  animate: boolean; entrance: boolean; pop: boolean;
}) {
  const r = ramp(item.hue);
  // NEVER ZERO. See the note above the component.
  const n = useSharedValue(item.value);
  const rise = useSharedValue(animate && entrance ? 0 : 1);

  // AN ENTRANCE BELONGS TO A PLAY, AND A PLAY HAPPENS ONCE.
  //
  // `item.value` has to be a dependency — the number must follow the store even
  // when nothing bumps `playToken` — and that is exactly what made the first fix
  // fail. Measured in a browser: meeting a thinker ran this effect FOUR times,
  // and the third ran at `playToken` 1 with `entrance` still true, 71ms before
  // the screen had worked out that this was a reaction. So the number moved, the
  // effect fired on the value alone, and it replayed the arrival from zero using
  // last play's answer.
  //
  // `newPlay` is the whole guard: an arrival is something the SCREEN announces,
  // never something a changing figure can trigger by itself.
  const playedToken = useRef<number | null>(null);

  useEffect(() => {
    const newPlay = playedToken.current !== playToken;
    playedToken.current = playToken;

    if (!animate) { n.value = item.value; rise.value = 1; return; }

    if (newPlay && entrance) {
      // ARRIVING. The TILE rises; the figure on it is already true.
      n.value = item.value;
      rise.value = 0;
      rise.value = revealTo(1, stepDelay(index), D_RISE);
      return;
    }

    // REACTING, or simply following a figure that moved between plays. Either
    // way the reader is looking straight at these numbers, so they never leave
    // the screen: the tile does not move AT ALL, and the digits roll from
    // whatever is displayed to the new total. The tile whose number moved is
    // marked by its underscore instead — see the note in reveal.tsx. A rolling
    // numeral is already the clearest statement a counter can make; the old
    // squeeze around it was the screen saying the same thing twice, once by
    // distorting the object carrying it.
    n.value = withTiming(item.value, { duration: D_ROLL, easing: EASE_REVEAL });
  }, [playToken, animate, entrance, item.value, index, n, rise]);

  const props = useAnimatedProps(() => ({ text: `${Math.round(n.value)}` }) as never);
  // IT RISES; IT DOES NOT GROW. The tile used to scale from 0.72 to 1, and a
  // thing that grows into place reads as INFLATING however small the range —
  // the same note the streak seal got when it sprang from 0.4 ("it popped
  // rather than landing"). Ten points of travel and a fade says "settling into
  // place" without the object ever being the wrong size, which on a tile
  // carrying a figure is the whole point.
  const style = useAnimatedStyle(() => ({
    opacity: Math.min(1, rise.value * 1.6),
    transform: [{ translateY: (1 - rise.value) * 10 }],
  }));

  return (
    <Animated.View style={[s.ledgerCol, style]}>
      <StruckTile accent={r.base} pad={0} style={s.ledgerTile}>
        <View style={s.ledgerInner}>
          <ACounter
            editable={false}
            pointerEvents="none"
            underlineColorAndroid="transparent"
            defaultValue={`${item.value}`}
            style={[s.ledgerValue, { color: r.shade }, counterStyle]}
            animatedProps={props}
          />
          <Text style={s.ledgerLabel} numberOfLines={1}>{item.label}</Text>
        </View>
        {/* THE ONE TILE WHOSE FIGURE MOVED, said with a rule rather than with a
            squeeze. It waits for the arrival to finish so the two are never
            competing for the same moment. */}
        <Underscore
          hue={r.base}
          playToken={playToken}
          on={animate && pop}
          delay={entrance ? stepDelay(index) + D_RISE : 60}
        />
      </StruckTile>
    </Animated.View>
  );
}

// ── ranked bars ──────────────────────────────────────────────────────────────

export interface BarRow {
  key: string;
  label: string;
  value: number;
  hue: string;
  /** The composition line under the name when this row is picked. */
  detail: string;
  action: 'lesson' | 'quote' | 'thinker';
}

/**
 * A RANKED RUN OF STRUCK BARS, in the colour of whatever they are.
 *
 * Tapping one draws its ghost — how far the next round number is — and opens a
 * DISCOVERY, which is a thinker or a fact rather than a restatement of the
 * number already on the row. See lib/utils/statsDiscovery.ts for why.
 */
export function RankedBars({
  title, subtitle, accent, rows, playToken, animate, entrance, grown,
  discoverFor, onOpenThinker, hint, style,
}: {
  title: string; subtitle: string;
  /** The printer's rule in the panel head. */
  accent?: string;
  rows: BarRow[];
  playToken: number; animate: boolean;
  /** Arriving at the tab, or reacting to something done while here. See the top. */
  entrance: boolean;
  grown: Set<string>;
  discoverFor: (key: string) => Discovery | null;
  onOpenThinker: (id: string) => void;
  /** Shown until a row is picked. One per screen — twice reads as a stutter. */
  hint?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const [sel, setSel] = useState<string | null>(null);
  const [reduce, setReduce] = useState(false);
  const grow = useSharedValue(animate && entrance ? 0 : 1);

  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => { if (alive) setReduce(v); });
    return () => { alive = false; };
  }, []);

  const playedToken = useRef<number | null>(null);
  useEffect(() => {
    const newPlay = playedToken.current !== playToken;
    playedToken.current = playToken;
    // The shared sweep belongs to the ENTRANCE only. On a reaction the bars are
    // already drawn and already being read; re-running it from zero is the
    // "rebuilt rather than reacting" defect this file names for the grown row.
    if (!animate || reduce || !entrance) { grow.value = 1; return; }
    // See LedgerTile: an entrance is gated on a NEW PLAY, everywhere. These
    // effects have no figure in their dependencies today, so the guard is
    // currently free — which is the point of making it uniform. The one that did
    // have a figure in its dependencies is the one that shipped the bug.
    if (!newPlay) return;
    grow.value = 0;
    grow.value = revealTo(1, LEAD, D_WIPE);
  }, [playToken, animate, entrance, reduce, grow]);

  const max = rows.reduce((a, r) => (r.value > a ? r.value : a), 0);
  const scale = Math.max(1, max * HEADROOM);

  const selIndex = sel == null ? -1 : rows.findIndex((r) => r.key === sel);
  // The milestone is no longer PRINTED — it draws the ghost, and it carries the
  // accessibility hint, so a screen reader is still told what the dashed part
  // of the bar means. The card says something worth reading instead.
  const milestone: Milestone | null = useMemo(() => {
    if (selIndex < 0) return null;
    const els: StatElement[] = rows.map((r) => ({
      key: r.key, label: r.label, value: r.value, perAction: 1, action: r.action,
    }));
    return milestoneFor(els, selIndex, { minGhost: MIN_GHOST });
  }, [selIndex, rows]);

  const discovery = useMemo(() => (sel == null ? null : discoverFor(sel)), [sel, discoverFor]);

  const pick = (key: string) => {
    setSel((p) => (p === key ? null : key));
    cue('keep');
  };

  return (
    <StruckPanel title={title} subtitle={subtitle} accent={accent} style={[s.section, style]}>
      {rows.map((r, i) => (
        <BarLine
          key={r.key}
          row={r}
          index={i}
          count={rows.length}
          scale={scale}
          grow={grow}
          reduce={reduce}
          playToken={playToken}
          animate={animate}
          entrance={entrance}
          pop={grown.has(r.key)}
          selected={sel === r.key}
          ghost={sel === r.key && milestone && milestone.kind !== 'none'
            ? (milestone.projected - r.value) / scale
            : 0}
          ghostTo={milestone && milestone.kind !== 'none' ? milestone.projected : 0}
          hintText={sel === r.key && milestone ? milestone.copy : undefined}
          onPress={() => pick(r.key)}
        />
      ))}
      {selIndex >= 0 && discovery ? (
        <DiscoveryCard d={discovery} hue={rows[selIndex].hue} sub={rows[selIndex].detail} onOpen={onOpenThinker} />
      ) : hint ? (
        <Text style={s.hint}>Tap a row to meet someone from it.</Text>
      ) : null}
    </StruckPanel>
  );
}

function BarLine({
  row, index, count, scale, grow, reduce, playToken, animate, entrance, pop,
  selected, ghost, ghostTo, hintText, onPress,
}: {
  row: BarRow; index: number; count: number; scale: number;
  grow: SharedValue<number>; reduce: boolean; playToken: number;
  animate: boolean; entrance: boolean; pop: boolean;
  selected: boolean; ghost: number; ghostTo: number; hintText?: string; onPress: () => void;
}) {
  const r = ramp(row.hue);
  const pct = row.value / scale;

  // EVERY ROW RIDES THE ONE SWEEP NOW, grown or not.
  //
  // The grown row used to opt out of `grow` and run its own squeeze-and-
  // overshoot instead — which meant the row the reader cared about was the one
  // row whose LENGTH stopped being its value for a fifth of a second. It is
  // marked by an underscore below it instead: the measure is only ever the
  // measure, and the feedback is its own object. See reveal.tsx.
  //
  // The stagger stays a PROPORTION of the sweep rather than a delay per row, so
  // the whole panel still finishes together however many rows it has.
  const fillStyle = useAnimatedStyle(() => {
    const lead = (index / Math.max(1, count)) * 0.35;
    const t = Math.min(1, Math.max(0, (grow.value - lead) / (1 - lead)));
    return { transform: [{ scaleX: t }] };
  });

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${row.label}, ${row.value}`}
      accessibilityHint={hintText}
      style={({ pressed }) => [
        s.barRow,
        index < count - 1 && s.barRuled,
        pressed && { opacity: 0.75 },
      ]}
    >
      <View style={s.barTop}>
        {/* NO CHIP. A 9px square with a 1.5px border beside a label is a
            CHECKBOX everywhere else a reader has ever seen one, and five of them
            unticked down the left of a panel is the single most dashboard-like
            thing that was on this page. The row's colour is carried by its
            figure and its rule, both of which are already coloured. */}
        <Text style={[s.barLabel, selected && { color: r.shade }]} numberOfLines={1}>{row.label}</Text>
        <Text style={[s.barValue, EMBOSS, { color: r.base }]}>{row.value}</Text>
      </View>

      {/* The track is always full width and only the FILL grows, so the groove is
          there from the first frame and the measure fills into it.
          FLAT, AND FOUR UNITS TALL. `StruckBar` is a struck pill — a gradient, a
          lit rim, a groove lip top and bottom — which is right at the 9–10px
          Profile and the Pass draw it at, and at five rows on one panel reads as
          a row of glossy capsules. Left alone for its other three callers. */}
      <View style={s.barTrack}>
        {/* nativeID so a bounce harness can measure THIS row rather than guessing
            which transformed div is a bar. */}
        <View style={[s.barGroove, { backgroundColor: r.track }]}>
          <Animated.View
            nativeID={`barfill-${row.key}`}
            style={[s.barMeasure, { backgroundColor: r.base, width: `${Math.max(3, pct * 100)}%` }, fillStyle]}
          />
        </View>
        {ghost > 0 ? (
          <MotiView
            pointerEvents="none"
            // A GHOST IS A MEASURE, SO IT WIPES. It used to spring in at damping
            // 9 — a 31% overshoot on a dashed run whose whole job is to say
            // exactly how much further there is to go. It now extends from its
            // own left edge and stops, like everything else with a length.
            from={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ type: 'timing', duration: 420, easing: EASE_REVEAL }}
            style={[
              s.ghost,
              {
                left: `${pct * 100}%`,
                width: `${Math.min(1 - pct, ghost) * 100}%`,
                borderColor: r.shade,
              },
            ]}
          >
            {/* The target as a NUMERAL, not a sentence — the dashed run already
                says "this far", so the only thing missing is how far. */}
            <Text style={[s.ghostNum, { color: r.shade }]} numberOfLines={1}>{ghostTo}</Text>
          </MotiView>
        ) : null}
      </View>

      {/* THE ROW WHOSE FIGURE MOVED. It lands on the row's own hairline, so what
          the reader sees is the rule under this one row being struck in its
          colour — a mark in a ledger, which is what this panel is. */}
      <Underscore
        hue={r.base}
        playToken={playToken}
        on={animate && !reduce && pop}
        delay={entrance ? LEAD + D_WIPE * 0.6 : 60}
      />
    </Pressable>
  );
}

// ── the discovery card ───────────────────────────────────────────────────────

/**
 * WHAT A TAP IS FOR.
 *
 * It used to print "5 more lessons and Ethics reaches 20", which is a sentence
 * about a number already on the row. This is a thinker the reader has never
 * opened, or a fact about one they read constantly — and it ends in a door.
 */
export function DiscoveryCard({ d, hue, sub, onOpen, dark }: {
  d: Discovery; hue: string; sub?: string; onOpen: (id: string) => void;
  /** On the instrument panel. Ink ground, cream type, jewel rule. */
  dark?: boolean;
}) {
  const r = ramp(hue);
  const g = glow(hue);
  // ON THE PANEL THE COLOUR IS AN EDGE, NEVER A WORD. Three of the six jewel
  // tones sit under 4.5:1 on the panel ground — fine for a rule or an arrow,
  // not for text — so every character here is cream and the hue is the rail.
  const t = dark
    ? { rule: g.mark, bg: mix(PANEL_BASE, hue, 0.10), kicker: C.paperSoft,
        name: C.paper, meta: C.dim, body: C.paper, sub: C.dim, cta: C.paper, arrow: g.mark }
    : { rule: r.base, bg: 'transparent', kicker: r.shade,
        name: INK, meta: C.inkSoft, body: INK, sub: C.inkSoft, cta: r.shade, arrow: r.base };
  // THE TAP REVEAL, AND IT IS THE ONE THE READER NAMED.
  //
  // It used to spring in at damping 14 — a 16% overshoot — while also scaling
  // from 0.97 and sliding down from -6, so a card the reader had just summoned
  // arrived by three motions at once and then wobbled. That is the "cheap and ai
  // looking" in its purest form: motion applied to a thing rather than motion
  // that IS the thing arriving.
  //
  // So it is struck instead, in the order a printed card is made: the RULE draws
  // down first, then the type is set into it. Two motions, both on the reveal
  // curve, both stopping dead on their target. The whole thing is over in 400ms
  // and it reads as one gesture rather than three.
  return (
    <MotiView
      key={`${d.kicker}-${d.name ?? ''}-${d.body.slice(0, 12)}`}
      from={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ type: 'timing', duration: 180, easing: EASE_REVEAL }}
      style={[
        s.card,
        { backgroundColor: t.bg },
        !dark && s.cardPaper,
      ]}
    >
      {/* The rule is a drawn OBJECT rather than a border, so it can be struck.
          `s.card` carries the matching paddingLeft and `overflow: hidden` so it
          sits inside the card's own radius exactly as the border did. */}
      <MotiView
        pointerEvents="none"
        from={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ type: 'timing', duration: 260, easing: EASE_REVEAL }}
        style={[s.cardRule, { backgroundColor: t.rule }]}
      />
      <MotiView
        from={{ opacity: 0, translateY: 8 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 340, delay: 110, easing: EASE_REVEAL }}
      >
      <Text style={[s.cardKicker, { color: t.kicker }]} numberOfLines={1}>{d.kicker}</Text>

      {d.name ? (
        <View style={s.cardWho}>
          {d.symbol ? <Text style={s.cardSymbol}>{d.symbol}</Text> : null}
          {/* TWO LINES, AND THE DATES NEVER SHRINK. On one line the card read
              "Abu Sulayman al-Sijist... c. 912-9..." — both halves clipped, and
              a card whose whole job is to introduce someone cannot cut their
              name in half. 322 thinkers include a good many long ones. */}
          <Text style={[s.cardName, { color: t.name }]} numberOfLines={2}>{d.name}</Text>
          {d.meta ? <Text style={[s.cardMeta, { color: t.meta }]} numberOfLines={1}>{d.meta}</Text> : null}
        </View>
      ) : null}

      <Text style={[s.cardBody, { color: t.body }]}>{d.body}</Text>

      {sub ? <Text style={[s.cardSub, { color: t.sub }]} numberOfLines={1}>{sub}</Text> : null}

      {d.philosopherId ? (
        <Pressable
          onPress={() => { cue('keep'); onOpen(d.philosopherId as string); }}
          accessibilityRole="button"
          style={({ pressed }) => [s.cardCta, pressed && { opacity: 0.6 }]}
        >
          <Text style={[s.cardCtaText, { color: t.cta }]}>
            {d.kind === 'meet' ? `Meet ${d.name}` : `Read ${d.name}`}
          </Text>
          <Text style={[s.cardCtaText, { color: t.arrow }]}>→</Text>
        </Pressable>
      ) : null}
      </MotiView>
    </MotiView>
  );
}

// ── the thinker league ───────────────────────────────────────────────────────

export interface LeagueRow {
  id: string;
  name: string;
  hue: string;
  era: string;
  lessons: number;
  quotes: number;
  score: number;
}

/**
 * WHO YOU READ MOST — a ranked league, not a pie.
 *
 * Five names in a pie is the least readable form a ranking can take: it asks
 * the reader to compare five arcs and then hunt a legend for which arc is whom.
 * A league puts the ranking where a ranking belongs — in the order — and the
 * first three places wear the app's own metals, which is already what a badge
 * tier means here.
 *
 * Tapping does NOT jump straight to the profile any more. It opens a fact about
 * them first, because a tap that navigates away is the one interaction that
 * cannot tell you anything.
 */
export function ThinkerLeague({
  rows, playToken, animate, entrance, grown, discoverFor, onOpen, style,
}: {
  rows: LeagueRow[]; playToken: number; animate: boolean; entrance: boolean;
  grown: Set<string>;
  discoverFor: (id: string) => Discovery | null;
  onOpen: (id: string) => void; style?: StyleProp<ViewStyle>;
}) {
  const [sel, setSel] = useState<string | null>(null);
  const grow = useSharedValue(animate && entrance ? 0 : 1);
  const playedToken = useRef<number | null>(null);
  useEffect(() => {
    const newPlay = playedToken.current !== playToken;
    playedToken.current = playToken;
    // See RankedBars: the sweep is the arrival, not the answer to a tap.
    if (!animate || !entrance) { grow.value = 1; return; }
    // See LedgerTile: an entrance is gated on a NEW PLAY, everywhere. These
    // effects have no figure in their dependencies today, so the guard is
    // currently free — which is the point of making it uniform. The one that did
    // have a figure in its dependencies is the one that shipped the bug.
    if (!newPlay) return;
    grow.value = 0;
    grow.value = revealTo(1, LEAD + STEP, D_WIPE);
  }, [playToken, animate, entrance, grow]);

  const max = rows.reduce((a, r) => (r.score > a ? r.score : a), 0) || 1;
  const discovery = useMemo(() => (sel == null ? null : discoverFor(sel)), [sel, discoverFor]);
  const selRow = rows.find((r) => r.id === sel);

  return (
    <StruckPanel
      title="Who You Read Most"
      subtitle="lessons about them, and quotes of theirs you kept"
      accent={METAL.GOLD.base}
      style={[s.section, style]}
    >
      {rows.map((r, i) => (
        <LeagueLine
          key={r.id}
          row={r}
          place={i}
          count={rows.length}
          max={max}
          grow={grow}
          animate={animate}
          entrance={entrance}
          playToken={playToken}
          pop={grown.has(r.id)}
          selected={sel === r.id}
          onPress={() => { setSel((p) => (p === r.id ? null : r.id)); cue('keep'); }}
        />
      ))}
      {discovery && selRow ? (
        <DiscoveryCard d={discovery} hue={selRow.hue} onOpen={onOpen} />
      ) : (
        <Text style={s.hint}>Tap a name for something you did not know about them.</Text>
      )}
    </StruckPanel>
  );
}

function LeagueLine({
  row, place, count, max, grow, animate, entrance, playToken, pop, selected, onPress,
}: {
  row: LeagueRow; place: number; count: number; max: number;
  grow: SharedValue<number>; animate: boolean; entrance: boolean; playToken: number;
  pop: boolean; selected: boolean; onPress: () => void;
}) {
  const r = ramp(row.hue);

  // See BarLine: every row rides the one sweep, and the row that grew is marked
  // by a rule rather than by its own measure going somewhere it does not belong.
  const fillStyle = useAnimatedStyle(() => {
    const lead = (place / Math.max(1, count)) * 0.4;
    const t = Math.min(1, Math.max(0, (grow.value - lead) / (1 - lead)));
    return { transform: [{ scaleX: t }] };
  });

  const parts = [
    row.lessons ? `${row.lessons} lesson${row.lessons === 1 ? '' : 's'}` : null,
    row.quotes ? `${row.quotes} quote${row.quotes === 1 ? '' : 's'}` : null,
  ].filter(Boolean);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${row.name}, number ${place + 1} of ${count}`}
      style={({ pressed }) => [
        s.leagueRow,
        place < count - 1 && s.leagueRuled,
        pressed && { opacity: 0.75 },
      ]}
    >
      <View style={s.leagueTop}>
        {/* THE PLACE, AND IT IS TYPE RATHER THAN AN OBJECT. See the note above
            the styles: at 14pt inside a 30px disc a numeral is a label and had
            to be decorated to stop being boring; at 25pt in its own gutter it is
            the ornament, and needs nothing round it. */}
        <Text style={[s.placeNum, EMBOSS, { color: place === 0 ? METAL.GOLD.shade : C.inkSoft }]}>
          {place + 1}
        </Text>
        <Text style={[s.leagueName, EMBOSS, selected && { color: r.shade }]} numberOfLines={1}>
          {row.name}
        </Text>
        <Text style={[s.leagueEra, { color: r.shade }]} numberOfLines={1}>{row.era}</Text>
      </View>
      {/* THE MEASURE IS A HAIRLINE UNDER THE NAME, not a bar beside it. A ranked
          list already says the order; what a length adds is HOW FAR AHEAD, and
          two units of rule says that without putting a second glossy pill on the
          page. It is inset to the name's own left edge so the gutter stays a
          clean column of numerals. */}
      <View style={s.leagueUnder}>
        {/* THE SAME 30% HEADROOM THE ERA BARS USE. Without it the leader's rule
            runs the full width of the row every time, and a coloured line that
            reaches both margins under a name is an UNDERLINE, not a measure —
            it stops saying "furthest ahead" and starts saying nothing. */}
        <View style={[s.leagueRule, { backgroundColor: r.track }]}>
          <Animated.View
            nativeID={`barfill-${row.id}`}
            style={[s.leagueFill, { backgroundColor: r.base, width: `${Math.max(4, (row.score / (max * HEADROOM)) * 100)}%` }, fillStyle]}
          />
        </View>
        {parts.length ? <Text style={s.leagueParts}>{parts.join('  ·  ')}</Text> : null}
      </View>

      {/* The one name whose reading moved since the last visit. */}
      <Underscore
        hue={r.base}
        playToken={playToken}
        on={animate && pop}
        delay={entrance ? LEAD + STEP + D_WIPE * 0.6 : 60}
      />
    </Pressable>
  );
}

const s = StyleSheet.create({
  section: { marginTop: 28 },


  // ── ledger ──
  ledger: { flexDirection: 'row', gap: 8, marginTop: 22 },
  ledgerCol: { flex: 1 },
  ledgerTile: { flex: 1 },
  ledgerInner: { paddingVertical: 12, paddingHorizontal: 6, alignItems: 'center' },
  ledgerValue: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 26, lineHeight: 30,
    // Full width of the tile so the input cannot claim its own — see ACounter.
    width: '100%', textAlign: 'center', padding: 0, margin: 0,
  },
  ledgerLabel: {
    fontFamily: 'Inter_700Bold', fontSize: 8, letterSpacing: 0.9,
    color: C.inkSoft, marginTop: 3, textAlign: 'center',
  },

  // ── bars ──
  //
  // ONE VOCABULARY WITH THE LEAGUE ABOVE IT: a serif name on the left, a serif
  // figure on the right, a flat measure under them, a hairline between rows.
  // The two boxes answer different questions — one is an ORDER, one is a
  // DISTRIBUTION — so only this one keeps a length, but neither should look like
  // a different product from the other.
  barRow: { paddingVertical: 9 },
  barRuled: { borderBottomWidth: 1, borderBottomColor: C.hairline },
  barTop: { flexDirection: 'row', alignItems: 'baseline', gap: 10 },
  barLabel: { flex: 1, fontFamily: 'PlayfairDisplay_700Bold', fontSize: 16, color: INK },
  barValue: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 18 },
  barTrack: { position: 'relative', marginTop: 7 },
  barGroove: { height: 4, borderRadius: 2, overflow: 'hidden' },
  // The FILL is what grows, anchored at the left edge. RN scales about the
  // centre by default, which would grow a bar out of both ends of its groove.
  barMeasure: { height: 4, borderRadius: 2, transformOrigin: 'left' },
  ghost: {
    position: 'absolute', top: 0, height: 4,
    borderWidth: 1, borderStyle: 'dashed', borderRadius: 2,
    backgroundColor: 'transparent',
    transformOrigin: 'left',
  },
  // BELOW THE RULE, NOT INSIDE IT. The measure is four units tall now and a
  // 9.5pt numeral does not go in four units; it used to be centred inside a
  // 9px pill.
  ghostNum: { position: 'absolute', right: 0, top: 7, fontFamily: 'Inter_700Bold', fontSize: 9.5 },

  hint: {
    fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic',
    fontSize: 12.5, color: C.inkSoft, marginTop: 2,
  },

  // ── the discovery card ──
  // A LEFT RULE AND A HAIRLINE, not a tinted slab. The pastel fill behind this
  // card was one of the things that made the tab read as cheap — a wash of
  // colour behind prose is decoration, and the rule already says which row it
  // belongs to.
  // THE LEFT RULE IS DRAWN, NOT A BORDER — see the note on DiscoveryCard. The
  // 16 is the old 13 of padding plus the 3 the border used to occupy, so the
  // type sits exactly where it did; `overflow` keeps the drawn rule inside the
  // card's own radius, which is the one thing the border did for free.
  card: {
    borderRadius: 6, overflow: 'hidden',
    paddingLeft: 16, paddingRight: 13, paddingVertical: 11, marginTop: 6,
  },
  cardRule: {
    position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
    transformOrigin: 'top',
  },
  cardPaper: { borderTopWidth: 1, borderRightWidth: 1, borderBottomWidth: 1, borderColor: C.hairline },
  cardKicker: { fontFamily: 'Inter_700Bold', fontSize: 9.5, letterSpacing: 1.5 },
  cardWho: { flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', gap: 8, marginTop: 7 },
  cardSymbol: { fontSize: 15 },
  cardName: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 17, flexShrink: 1 },
  cardMeta: { fontFamily: 'Inter_400Regular', fontSize: 10.5, flexShrink: 0 },
  cardBody: {
    fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic',
    fontSize: 14.5, lineHeight: 21, marginTop: 6,
  },
  cardSub: { fontFamily: 'Inter_400Regular', fontSize: 10.5, marginTop: 8 },
  cardCta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  cardCtaText: { fontFamily: 'Inter_700Bold', fontSize: 11.5, letterSpacing: 0.6 },

  // ── league ──
  //
  // A LEAGUE TABLE, NOT FIVE BADGES. The place used to be a numeral inside a
  // 30px disc wearing however much furniture its rank had earned — ticks, then
  // arcs, then laurel sprigs, then rays and a second rim. That answered a real
  // note ("the numbers … look very boring and not very premium looking") in the
  // wrong currency, and the same reader threw it back: *"the one, two, three,
  // four, five circles and the designs on them … look really bad"*, and asked
  // for clean rather than complicated.
  //
  // Both notes are true at once, and the way through them is that A NUMERAL AT
  // LABEL SIZE IS A LABEL AND A NUMERAL AT DISPLAY SIZE IS THE ORNAMENT. At
  // 14pt in a disc it needed decoration to stop being boring; at 25pt in a
  // gutter of its own it is the largest thing in the row and needs nothing round
  // it. That is how a printed ranking has always done it.
  //
  // ONLY FIRST PLACE TAKES A METAL, and only because it is the only one that
  // CAN. Measured on paper the three metals run gold 5.66:1, bronze 8.36:1 and
  // silver 3.86:1 — silver is under the 4.5 a word needs, which is §19's "a tone
  // fitted for METAL is invisible on PAPER" for the fourth time. A podium where
  // one of the three places is unreadable is not a podium, so the leader is gold
  // and the rest are ink.
  leagueRow: { paddingVertical: 8 },
  leagueRuled: { borderBottomWidth: 1, borderBottomColor: C.hairline },
  leagueTop: { flexDirection: 'row', alignItems: 'baseline', gap: 10 },
  placeNum: {
    width: 26, textAlign: 'right',
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 25,
    includeFontPadding: false,
  },
  leagueName: { flex: 1, fontFamily: 'PlayfairDisplay_700Bold', fontSize: 15.5, color: INK },
  leagueEra: { fontFamily: 'Inter_700Bold', fontSize: 8.5, letterSpacing: 1.1 },
  // Inset by the gutter and its gap, so the rule and the breakdown both hang off
  // the name rather than off the numeral.
  leagueUnder: { marginLeft: 36, marginTop: 5 },
  leagueRule: { height: 3, borderRadius: 1.5, overflow: 'hidden' },
  leagueFill: { height: 3, borderRadius: 1.5, transformOrigin: 'left' },
  leagueParts: { fontFamily: 'Inter_400Regular', fontSize: 10.5, color: C.inkSoft, marginTop: 4 },
});
