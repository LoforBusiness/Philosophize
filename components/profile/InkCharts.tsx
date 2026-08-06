import { View, Text, StyleSheet } from 'react-native';

// ─────────────────────────────────────────────────────────────────────────────
// SMALL DRAWN FIGURES FOR THE PROFILE.
//
// Not the Insights charts. Those are whole cards with their own frames and
// titles, built to be the subject of a screen; dropping one into a profile
// section reads as a transplanted dashboard. These are inline marks that live
// INSIDE a section and answer the question that section already asked.
//
// Everything is a plain View. Nothing here is animated, nothing needs SVG, and a
// bar drawn as a rectangle is exactly as hand-made as one drawn as a path — the
// house style is a filled ink block on a faint track, and that is two Views.
//
// The palette is the profile's, passed in rather than imported, so a section can
// place one of these on paper or on ink without the figure having an opinion.
// ─────────────────────────────────────────────────────────────────────────────

export interface Ink {
  ink: string;
  soft: string;
  faint: string;
  paper: string;
}

// ── a ranked list of bars ────────────────────────────────────────────────────

export interface ShareRow {
  label: string;
  value: number;
  /**
   * WHAT THE READER ACTUALLY DID, in words — "9 opened · 2 saved".
   *
   * Not decoration. The score behind these bars is `views×3 + quotes×5 + lessons
   * in their branches`, and that last term is shared by every thinker in a branch,
   * so it acts as a large constant baseline: with real data the second and third
   * places came out at 76% and 76%, a dead tie. A tie is honest, but two bars the
   * same length with nothing to distinguish them reads as a rendering fault.
   *
   * The behaviour beside the bar fixes that without touching the score — which
   * must not change, because app/(app)/stats reads the identical formula and the
   * two screens ranking thinkers differently is exactly the class of bug this
   * codebase has been bitten by before.
   */
  detail?: string;
}

/**
 * WHO OR WHAT YOU KEEP RETURNING TO, in order, with the size of the gap visible.
 *
 * This replaces a line that said "TOP PHILOSOPHER — Nietzsche". A single name is
 * a fact with no shape: it cannot tell you whether Nietzsche is a landslide or
 * won by one saved quote, and the second and third places — which are the
 * interesting part of anyone's reading — were simply not there.
 *
 * Bars are proportional to the LEADER, not to the total, because the question is
 * "how far ahead", and a share-of-total bar for a six-way split is four
 * indistinguishable stubs.
 */
export function ShareBars({ rows, c, max = 4 }: { rows: ShareRow[]; c: Ink; max?: number }) {
  const top = rows.slice(0, max);
  if (top.length === 0) return null;
  const lead = Math.max(1, top[0].value);
  const bar = (r: ShareRow, i: number) => (
    <View style={[s.barTrack, { backgroundColor: c.faint }]}>
      <View
        style={[
          s.barFill,
          {
            backgroundColor: c.ink,
            // A floor of 6%, so a real but tiny score is still a mark on the page
            // rather than a name with nothing next to it.
            width: `${Math.max(6, Math.round((r.value / lead) * 100))}%`,
            // The runners-up are drawn lighter, so the leader reads first.
            opacity: i === 0 ? 1 : 0.32,
          },
        ]}
      />
    </View>
  );
  return (
    <View>
      {/* THE LEADER IS NOT REPEATED, IT IS PROMOTED.
          The first version printed the top name large and then again as the first
          row of the ranking directly beneath it, which reads as a rendering fault
          rather than as emphasis. Same information, one appearance: the leader
          gets the headline face with its bar under it, the rest are a list. */}
      <Text style={[s.leadName, { color: c.ink }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
        {top[0].label}
      </Text>
      {top[0].detail ? <Text style={[s.leadDetail, { color: c.soft }]}>{top[0].detail}</Text> : null}
      <View style={{ marginTop: 8 }}>{bar(top[0], 0)}</View>
      {top.length > 1 ? (
        <View style={s.bars}>
          {top.slice(1).map((r, k) => (
            <View key={r.label} style={s.barRow}>
              <Text style={[s.barLabel, { color: c.soft }]} numberOfLines={1}>{r.label}</Text>
              {bar(r, k + 1)}
              {r.detail ? (
                <Text style={[s.rowDetail, { color: c.soft }]} numberOfLines={1}>{r.detail}</Text>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

// ── one bar, split by composition ────────────────────────────────────────────

export interface Part {
  label: string;
  value: number;
}

/**
 * THE SHAPE OF SOMEONE'S READING, as one bar cut into its parts.
 *
 * Six separate bars would be a chart; one bar cut six ways is a PORTRAIT, and
 * that is the section this belongs in. It says at a glance whether the reader is
 * a specialist or a wanderer, which no ranked list does.
 *
 * The parts are hatched at descending density instead of coloured, because there
 * is no second colour in this app to reach for (§19). Density is a legitimate
 * ordering — the eye reads dense-to-sparse as most-to-least without a legend.
 */
export function StackBar({ parts, c }: { parts: Part[]; c: Ink }) {
  const live = parts.filter((p) => p.value > 0);
  const total = live.reduce((a, p) => a + p.value, 0);
  if (total <= 0) return null;
  return (
    <View>
      <View style={[s.stack, { borderColor: c.ink }]}>
        {live.map((p, i) => (
          <View
            key={p.label}
            style={{
              flex: p.value,
              backgroundColor: c.ink,
              opacity: Math.max(0.14, 1 - i * 0.19),
              borderRightWidth: i < live.length - 1 ? 1 : 0,
              borderRightColor: c.paper,
            }}
          />
        ))}
      </View>
      <View style={s.stackKey}>
        {live.slice(0, 3).map((p, i) => (
          <View key={p.label} style={s.keyItem}>
            <View style={[s.keyChip, { backgroundColor: c.ink, opacity: Math.max(0.14, 1 - i * 0.19) }]} />
            <Text style={[s.keyText, { color: c.soft }]} numberOfLines={1}>
              {p.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ── a fortnight, one bar a day ───────────────────────────────────────────────

/**
 * RECENT DAYS AS BARS, and empty days drawn as empty.
 *
 * A sparkline would join the dots and imply the reader was doing something on the
 * days they were not. Bars with gaps in them are the truth, and the gaps are the
 * interesting part: this is a habit graph, and a habit is exactly the pattern of
 * days that ARE missing.
 *
 * The last bar is the one you are standing in, so it is drawn solid where the
 * rest are lighter — today has a different status from history.
 */
export function DayBars({ values, c, height = 26 }: { values: number[]; c: Ink; height?: number }) {
  const peak = Math.max(1, ...values);
  return (
    <View style={[s.days, { height }]}>
      {values.map((v, i) => {
        const last = i === values.length - 1;
        return (
          <View key={i} style={s.dayCol}>
            {v > 0 ? (
              <View
                style={{
                  width: '100%',
                  // A minimum of 3px, so a day with one saved quote in it is still
                  // visibly a day that happened.
                  height: Math.max(3, Math.round((v / peak) * height)),
                  backgroundColor: c.ink,
                  opacity: last ? 1 : 0.55,
                  borderTopLeftRadius: 1.5,
                  borderTopRightRadius: 1.5,
                }}
              />
            ) : (
              <View style={{ width: '100%', height: 1.5, backgroundColor: c.faint }} />
            )}
          </View>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  leadName: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 21, includeFontPadding: false },
  leadDetail: {
    fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 11.5,
    marginTop: 3, includeFontPadding: false,
  },
  rowDetail: {
    fontFamily: 'Inter_500Medium', fontSize: 9.5, letterSpacing: 0.3,
    width: 62, textAlign: 'right', includeFontPadding: false,
  },
  bars: { gap: 8, marginTop: 11 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  barLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11.5,
    letterSpacing: 0.2,
    width: 92,
    includeFontPadding: false,
  },
  barLabelLead: { fontFamily: 'Inter_700Bold' },
  barTrack: { flex: 1, height: 7, borderRadius: 3.5, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3.5 },

  stack: {
    flexDirection: 'row',
    height: 13,
    borderWidth: 1.5,
    borderRadius: 3,
    overflow: 'hidden',
  },
  stackKey: { flexDirection: 'row', gap: 14, marginTop: 9, flexWrap: 'wrap' },
  keyItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  keyChip: { width: 8, height: 8, borderRadius: 1.5 },
  keyText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 9.5,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    includeFontPadding: false,
  },

  days: { flexDirection: 'row', alignItems: 'flex-end', gap: 2.5 },
  dayCol: { flex: 1, justifyContent: 'flex-end', height: '100%' },
});
