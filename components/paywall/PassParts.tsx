import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import SketchIcon from '@/components/shared/SketchIcon';
import RankSeal from '@/components/shared/RankSeal';
import { StruckBar, StruckTile, MetalPlate } from '@/components/profile/Struck';
import { INK, PAPER_LIT, PAPER_SHADE, FAINT, METAL, SHADOW, ramp } from '@/components/shared/tone';
import { C, SPACE, BRANCH, type BranchKey } from '@/constants/design';
import { rankProgress, rankOrder, rankDegree } from '@/data/ranks';
import {
  PASS_LINES, libraryStanding, paceLabel,
  msToRenewal, renewalLabel, allowanceLabel,
} from '@/lib/utils/passValue';

// ─────────────────────────────────────────────────────────────────────────────
// THE PARTS THE THREE PASS SCREENS ARE BUILT FROM.
//
// One family: the offer, the daily limit, and the locked lesson. They used to be
// three unrelated drawings — a card, a stamped card, and a lock icon in a circle
// — which is why hitting the wall and then seeing the offer felt like two apps
// arguing. Everything below is shared, so a reader who meets one has met them
// all.
//
// ── WHAT MAKES THEM "GAMIFIED", GIVEN THE APP IS INK ON PAPER ───────────────
//
// Not colour, and not a new one: `constants/streak.ts` names the paywall
// explicitly as somewhere the ember may NOT go, and it is right to. What these
// borrow instead is the language the profile already earned — struck things, lit
// from one direction, top-left, that never moves (tone.ts, §19). A bar is a
// groove with something raised in it. A plate is metal. A branch is its own hue,
// which `design.ts` licenses as a LABEL rather than a mood.
//
// The one thing that IS new is that the offer is drawn out of the reader's own
// account. A rank they hold, six bars at the heights they actually stand at, and
// a wait measured in the days it would really take. Nothing here is a stock
// illustration of a benefit, which is the reason it can be trusted at all — and
// why `scripts/check-pass.mjs` re-derives every claim from the gate enforcing it.
//
// NO COLOUR IS DECLARED IN THIS FILE. Every value comes from `C`, `BRANCH`,
// `tone` or an insignia, and check-pass fails the build on a stray hex — the
// same rule check-ui holds the converted screens to.
//
// ── TWO MEASURED RULES THESE SCREENS LIVE UNDER ─────────────────────────────
//
// · `C.inkSoft` IS A PAPER TONE. On paper it is 5.33:1; in the shaded corner of
//   a StruckTile, where the face has run down to `PAPER_SHADE`, it is 3.07:1 —
//   under the floor. So secondary text inside a struck tile is `C.ink` or the
//   branch's own `ramp(hue).shade` (4.66:1 at worst), never inkSoft. It is the
//   same trap §19 records for the quote plate's byline, one surface along.
// · A `MetalPlate` LABEL IS AT MOST TWO WORDS. Its text is measured against the
//   metal's `base` (tone.ts's documented contract, which check-ui owns), and a
//   longer label runs far enough across the diagonal to sit on `shade`, where
//   gold reads 2.94:1. Shortening the label is this family's fix; restyling
//   `METAL` would repaint every medal and rank pin in the app.
// ─────────────────────────────────────────────────────────────────────────────

/** The one light, as LinearGradient endpoints. Matches tone.LIGHT and Struck.tsx. */
const LIGHT_START = { x: 0.15, y: 0 } as const;
const LIGHT_END = { x: 0.85, y: 1 } as const;

/**
 * The same colour at zero alpha — the clear end of a fade.
 *
 * NOT a new colour, which is why it is derived rather than written down: it is
 * whatever ground it is handed, made transparent. The bare keyword `transparent`
 * would be wrong here for a reason worth recording — a gradient from
 * `transparent` to a colour interpolates through transparent BLACK on iOS and
 * the web, so a fade into warm paper picks up a grey bloom halfway across. And
 * `mix(ground, INK, 0)` is just `ground` again, which paints a solid slab over
 * the very marks the fade is supposed to reveal.
 */
const clear = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, 0)`;
};

// ── the clock ────────────────────────────────────────────────────────────────

/**
 * "6h 12m" until the free allowance renews, refreshed on the minute.
 *
 * ALIGNED TO THE MINUTE BOUNDARY rather than ticking every 60s from mount. A
 * plain `setInterval(60_000)` drifts by however far into the current minute the
 * screen happened to open, so the label can sit a whole minute stale — and at
 * the end it would count "1m" for up to 119 seconds, which is exactly where a
 * countdown is being read most carefully. Re-arming to the next boundary each
 * time costs one timer and is always right.
 *
 * The `key` on the returned value changes with the label, so a caller can drop
 * it into a Text without re-rendering anything else.
 */
export function useRenewal(): { label: string; ms: number } {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    let id: ReturnType<typeof setTimeout>;
    const arm = () => {
      const d = new Date();
      setNow(d);
      // To the top of the next minute, plus a hair so we land after it.
      id = setTimeout(arm, 60_000 - (d.getSeconds() * 1000 + d.getMilliseconds()) + 50);
    };
    arm();
    return () => clearTimeout(id);
  }, []);
  const ms = msToRenewal(now);
  return { label: renewalLabel(ms), ms };
}

// ── the reader, as they actually stand ───────────────────────────────────────

/**
 * WHO IS BEING OFFERED THIS, drawn from what they hold.
 *
 * The pin is the rank they have been CONFERRED (`rankProgress`, which reads the
 * awarded index rather than what the XP alone would buy), struck in its own
 * order with its own degree — the same object the Profile and the rank-up
 * ceremony draw, at a size that lets the arc toward the next rank read.
 *
 * A product shot would have been easier and it is the thing being avoided: this
 * screen opens on the reader, not on the merchandise.
 */
export function Standing({
  name, rankIndex, totalXP, streak, compact = false,
}: {
  name: string;
  rankIndex: number;
  totalXP: number;
  streak: number;
  compact?: boolean;
}) {
  const p = rankProgress(rankIndex, totalXP);
  return (
    <View style={s.standRow}>
      <RankSeal
        glyph={p.current.glyph}
        state="current"
        size={compact ? 48 : 62}
        progress={p.next ? p.pct : null}
        order={rankOrder(p.index)}
        degree={rankDegree(p.index)}
      />
      <View style={s.standBody}>
        <Text style={s.standName} numberOfLines={1}>{name}</Text>
        <Text style={s.standRank} numberOfLines={1}>{p.current.name}</Text>
        <View style={s.standMetaRow}>
          <Text style={s.standMeta}>{totalXP.toLocaleString()} XP</Text>
          {streak > 0 ? (
            <>
              <Text style={s.standDot}>·</Text>
              <Text style={s.standMeta}>
                {streak} day{streak === 1 ? '' : 's'} running
              </Text>
            </>
          ) : null}
        </View>
      </View>
    </View>
  );
}

// ── the library, and the wall in front of it ─────────────────────────────────

/**
 * HOW LONG THE FREE TIER ACTUALLY TAKES, drawn rather than asserted.
 *
 * One tick per remaining day, in a run that overflows the screen and fades out
 * under a scrim, against a SINGLE tick for the Pass. The asymmetry is the whole
 * argument, and it is an argument nobody has to be told: a run of marks longer
 * than the page you are holding reads as "too long" before the number under it
 * has been read.
 *
 * ── IT MUST NOT OVERFLOW WHEN THE WAIT IS SHORT (A1) ────────────────────────
 *
 * The picture has to do what the text says, which is the oldest rule in this
 * repo and applies to a chart exactly as it applies to a lesson. A reader eight
 * lessons from the end has an eight-day wait, and a run trailing off the edge
 * would be telling them it is endless. So `shown` is capped at what fits AND at
 * the real figure, and the fade is drawn only when there is genuinely more than
 * is on screen.
 */
export function TheWall({
  left, days, ground = C.paper,
}: {
  /** Lessons still unopened. */
  left: number;
  /** Days those take at the free allowance. */
  days: number;
  /** The surface behind, so the fade dissolves into it rather than into white. */
  ground?: string;
}) {
  // 46 marks at 3 + 4 is 322pt — wider than any phone's content column, so the
  // run reaches the edge on every device without measuring one.
  const CAP = 46;
  const shown = Math.max(1, Math.min(days, CAP));
  const overflows = days > shown;

  if (left <= 0) return null; // nothing left to wait for — say nothing

  return (
    <View style={s.wall}>
      <View style={s.wallRow}>
        <Text style={s.wallKicker}>AT {allowanceLabel().toUpperCase()}</Text>
        <Text style={s.wallFigure}>{paceLabel(days)}</Text>
      </View>
      <View style={s.tickBox}>
        <View style={s.tickRun}>
          {Array.from({ length: shown }, (_, i) => (
            <View key={i} style={s.tick} />
          ))}
        </View>
        {overflows ? (
          <LinearGradient
            colors={[clear(ground), ground]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={s.tickFade}
            pointerEvents="none"
          />
        ) : null}
      </View>

      <View style={[s.wallRow, s.wallRowSecond]}>
        <Text style={s.wallKicker}>WITH THE PASS</Text>
        <Text style={[s.wallFigure, s.wallFigureLit]}>no wait at all</Text>
      </View>
      <View style={s.tickBox}>
        <View style={s.tickRun}>
          {/* One mark, struck in gold, for the one sitting it would take. Same
              size as a free tick so the two runs are comparable at a glance —
              a bigger mark here would be arguing with a different unit. */}
          {/* STRUCK FROM THE SHADED HALF OF THE METAL, not the lit half. Gold's
              `base` measures 2.51:1 on paper — a mark nobody would see — which is
              fine on a medal, where it sits inside a rim, and useless for a 3pt
              bar standing alone on the page. Running base → shade → rim puts the
              body of the mark at 5.66:1 and keeps it plainly a metal rather than
              a second grey tick. */}
          <LinearGradient
            colors={[METAL.GOLD.base, METAL.GOLD.shade, METAL.GOLD.rim]}
            start={LIGHT_START}
            end={LIGHT_END}
            style={s.tickLit}
          />
        </View>
      </View>
    </View>
  );
}

/**
 * "14 OF 222 OPENED" with the proportion under it.
 *
 * Deliberately the same drawing as the badge shelf's `ShelfCount` — a count, a
 * total, and a struck bar — because it is the same kind of fact and a reader has
 * already learned to read it on the Profile.
 */
export function LibraryLine({
  lessonsByBranch, tint = METAL.GOLD.base,
}: {
  lessonsByBranch: Record<string, number>;
  tint?: string;
}) {
  const lib = libraryStanding(lessonsByBranch);
  return (
    <View>
      <View style={s.libTop}>
        <Text style={s.libNum}>
          <Text style={s.libDone}>{lib.done}</Text>
          <Text style={s.libTotal}> of {lib.total} lessons opened</Text>
        </Text>
        <Text style={s.libPct}>{Math.round(lib.pct * 100)}%</Text>
      </View>
      <StruckBar pct={lib.pct} fill={ramp(tint)} height={9} notches style={{ marginTop: SPACE[1] }} />
    </View>
  );
}

// ── the five differences ─────────────────────────────────────────────────────

/**
 * FREE AGAINST THE PASS, as a comparison rather than a list of ticks.
 *
 * A ticked feature table says what you would GET. The value of a subscription is
 * the DIFFERENCE, and two of the five rows here — replay and starting a unit out
 * of order — were missing from the old paywall entirely, so the two biggest
 * things the Pass buys were being given away for nothing.
 *
 * THE PASS COLUMN IS ONE PANEL BEHIND THE ROWS, not a background on each cell.
 * Absolutely positioned, spanning the table's whole height, so it carries ONE
 * gradient along the one light — a per-cell gradient would restart the lighting
 * on every row and five little lit rectangles do not read as a raised column.
 * It also means the rows lay out normally and the panel cannot fall out of
 * alignment with them however the text wraps.
 */
export function PassTable({ width }: { width: number }) {
  // The pass column, and the free column beside it. The label takes the rest.
  //
  // FREE IS WIDER THAN IT LOOKS LIKE IT NEEDS TO BE, and the rest-day row is why:
  // "2 held · 1 per 10" measures ~95pt, so at 0.26 of the content width it broke
  // after "per" and left the 10 alone on a line of its own. The longest value
  // decides this column, not the average one.
  const COL = Math.max(96, Math.min(126, Math.round(width * 0.32)));
  const FREE = Math.max(84, Math.min(112, Math.round(width * 0.30)));

  return (
    <View style={s.table}>
      {/* The raised column, behind everything, one light for its whole height. */}
      <View style={[s.passPanelShadow, { width: COL }]} pointerEvents="none">
        <LinearGradient
          colors={[PAPER_LIT, C.surface, PAPER_SHADE]}
          locations={[0, 0.55, 1]}
          start={LIGHT_START}
          end={LIGHT_END}
          style={s.passPanel}
        />
      </View>

      <View style={s.headRow}>
        <View style={{ flex: 1 }} />
        <Text style={[s.headFree, { width: FREE }]}>FREE</Text>
        <View style={{ width: COL, alignItems: 'center' }}>
          <MetalPlate metal={METAL.GOLD} label="THE PASS" />
        </View>
      </View>

      {PASS_LINES.map((line, i) => (
        <View key={line.id} style={s.row}>
          {/* THE RULE STOPS AT THE RAISED COLUMN. It was a `borderTopWidth` on
              the whole row, which drew a hairline straight across the lifted
              panel — and a line ruled over an object is the fastest way to
              flatten it back into the page. Absolutely positioned so it ends
              exactly where the panel begins, whatever the column measures. */}
          {i > 0 ? <View style={[s.rowRule, { right: COL }]} pointerEvents="none" /> : null}
          <Text style={s.rowLabel} numberOfLines={2}>{line.label}</Text>
          <View style={{ width: FREE, alignItems: 'center', paddingHorizontal: 4 }}>
            {line.free === null ? (
              // NOT "no", and not a cross. An em-rule is what a printed table
              // puts in a cell where the thing does not apply, and it is quieter
              // than a red mark — this column is a fact, not a punishment.
              <Text style={s.rowNone}>—</Text>
            ) : (
              <Text style={s.rowFree} numberOfLines={2}>{line.free}</Text>
            )}
          </View>
          {/* Padded, so a value can never sit flush against the panel's rim.
              "Any unit, whenever" measured 108pt in a 109pt column and touched
              both edges — it read as text escaping the card. */}
          <View style={{ width: COL, alignItems: 'center', paddingHorizontal: SPACE[1] }}>
            <Text style={s.rowPass} numberOfLines={2}>{line.pass}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

// ── what is waiting ──────────────────────────────────────────────────────────

/**
 * THE LESSON THEY WOULD HAVE OPENED, named.
 *
 * "Come back tomorrow" is a refusal. "Two Dots and a Crowd — tomorrow" is an
 * appointment, and the difference costs one lookup. The tile takes the branch's
 * own hue as its top edge, which is the same signal the mastery rows use, so the
 * reader knows which shelf it is off before reading the label.
 */
export function NextUp({
  branchSlug, branchName, title, position, total, caption,
}: {
  branchSlug: string;
  branchName: string;
  title: string;
  /** 1-based position in the branch, for "LESSON 15 OF 37". */
  position: number;
  total: number;
  caption: string;
}) {
  const hue = BRANCH[branchSlug as BranchKey] ?? C.ink;
  const r = ramp(hue);
  return (
    <StruckTile accent={hue} pad={3} style={s.nextTile}>
      <Text style={[s.nextKicker, { color: r.shade }]}>
        {branchName.toUpperCase()} · {position} OF {total}
      </Text>
      <Text style={s.nextTitle} numberOfLines={2}>{title}</Text>
      <View style={s.nextFoot}>
        <SketchIcon name="clock" size={13} color={C.ink} />
        <Text style={s.nextCaption}>{caption}</Text>
      </View>
    </StruckTile>
  );
}

// ── a section heading, shared by all three screens ───────────────────────────

export function Rule({ label }: { label: string }) {
  return (
    <View style={s.ruleRow}>
      <View style={s.ruleLine} />
      <Text style={s.ruleLabel}>{label}</Text>
      <View style={s.ruleLine} />
    </View>
  );
}

// The paywall carries the app's largest type — the price is the loudest thing on
// it by design — so the sizes here are not confined to `TYPE`'s five-step scale
// the way a converted screen's are. Colour IS confined; see the header.
const s = StyleSheet.create({
  // ── standing ──
  standRow: { flexDirection: 'row', alignItems: 'center', gap: SPACE[2] },
  standBody: { flex: 1 },
  standName: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 22, lineHeight: 27, color: C.ink,
  },
  standRank: {
    fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1.2, color: C.inkSoft, marginTop: 1,
  },
  standMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
  standMeta: { fontFamily: 'Inter_400Regular', fontSize: 12, color: C.inkSoft },
  standDot: { color: C.dim, fontSize: 12 },

  // ── the wall ──
  wall: { marginTop: SPACE[1] },
  wallRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  wallRowSecond: { marginTop: SPACE[3] },
  wallKicker: {
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.6, color: C.inkSoft,
  },
  wallFigure: { fontFamily: 'Inter_500Medium', fontSize: 13, color: C.ink },
  wallFigureLit: { fontFamily: 'Inter_700Bold' },
  tickBox: { height: 20, marginTop: 6, overflow: 'hidden', justifyContent: 'center' },
  tickRun: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  tick: { width: 3, height: 16, borderRadius: 1, backgroundColor: C.inkSoft },
  tickLit: { width: 3, height: 16, borderRadius: 1 },
  tickFade: { position: 'absolute', right: 0, top: 0, bottom: 0, width: 72 },

  // ── library line ──
  libTop: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  libNum: { includeFontPadding: false },
  libDone: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 20, color: C.ink },
  libTotal: { fontFamily: 'Inter_400Regular', fontSize: 12, color: C.inkSoft },
  libPct: {
    fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1, color: C.inkSoft,
    includeFontPadding: false,
  },

  // ── table ──
  table: { marginTop: SPACE[2] },
  passPanelShadow: {
    position: 'absolute', right: 0, top: 0, bottom: 0,
    borderRadius: 10,
    shadowColor: INK,
    shadowOffset: { width: SHADOW.dx, height: SHADOW.dy + 1 },
    shadowOpacity: SHADOW.opacity,
    shadowRadius: 4,
    elevation: 2,
  },
  passPanel: {
    flex: 1, borderRadius: 10, borderWidth: 1, borderColor: FAINT,
  },
  headRow: {
    flexDirection: 'row', alignItems: 'center', paddingBottom: SPACE[1], paddingTop: SPACE[1],
  },
  headFree: {
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.4, color: C.dim, textAlign: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 11 },
  rowRule: { position: 'absolute', left: 0, top: 0, height: 1, backgroundColor: C.hairline },
  rowLabel: {
    flex: 1, fontFamily: 'Inter_500Medium', fontSize: 12.5, lineHeight: 17, color: C.ink,
    paddingRight: SPACE[1],
  },
  rowFree: {
    fontFamily: 'Inter_400Regular', fontSize: 11.5, lineHeight: 15, color: C.inkSoft,
    textAlign: 'center',
  },
  rowNone: { fontFamily: 'Inter_400Regular', fontSize: 14, color: C.inkSoft },
  rowPass: {
    fontFamily: 'Inter_700Bold', fontSize: 11.5, lineHeight: 15, color: C.ink, textAlign: 'center',
  },

  // ── next up ──
  nextTile: { marginTop: SPACE[2] },
  nextKicker: { fontFamily: 'Inter_700Bold', fontSize: 9.5, letterSpacing: 1.3 },
  nextTitle: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 19, lineHeight: 24, color: C.ink, marginTop: 4,
  },
  nextFoot: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: SPACE[1] },
  nextCaption: { fontFamily: 'Inter_500Medium', fontSize: 12, color: C.ink },

  // ── rule ──
  ruleRow: { flexDirection: 'row', alignItems: 'center', gap: SPACE[2], marginTop: SPACE[4] },
  ruleLine: { flex: 1, height: 1, backgroundColor: C.hairline },
  ruleLabel: {
    fontFamily: 'Inter_700Bold', fontSize: 9.5, letterSpacing: 1.8, color: C.inkSoft,
  },
});
