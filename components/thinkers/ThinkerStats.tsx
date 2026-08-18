// ─────────────────────────────────────────────────────────────────────────────
// A THINKER, AS THINGS YOU CAN LOOK AT RATHER THAN PARAGRAPHS YOU MUST READ.
//
// The profile had every fact it needed and presented all of them the same way:
// a heading, then prose, then another heading. Nothing on the page told you at a
// glance whether this was a Greek who lived to 71 or a German who lived to 44,
// which of the six branches they belong to, or whether you had met them before.
// All of that was already in the data and none of it was ever shown as a number.
//
// EVERY FIGURE HERE IS DERIVED, NEVER AUTHORED — see lib/utils/thinkerStats.ts.
// Nothing in this file can go stale against a record, because nothing in it is
// stored anywhere.
//
// The one rule these share: A STAT THAT CANNOT BE COMPUTED IS OMITTED, NOT
// FAKED. Six thinkers are dated only to a century and genuinely have no age; the
// tile disappears for them rather than printing a dash, because an empty slot
// with a label on it reads as a bug and an absent slot reads as a layout.
// ─────────────────────────────────────────────────────────────────────────────
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { C, ERA, TYPE, SPACE, RADIUS, type EraKey } from '@/constants/design';
import { ALL_BRANCHES } from '@/data';
import { timelinePos, yearLabel, FIRST_YEAR, LAST_YEAR, type Lifespan } from '@/lib/utils/lifespan';

export function eraColour(era: string): string {
  return ERA[era as EraKey] ?? C.inkSoft;
}

/** The era, said once, in its own colour. The profile's only piece of pure label. */
export function EraChip({ era }: { era: string }) {
  return (
    <View style={[styles.chip, { backgroundColor: eraColour(era) }]}>
      <Text style={styles.chipText}>{era}</Text>
    </View>
  );
}

/**
 * ONE BIG NUMBER AND WHAT IT MEANS.
 *
 * The number is `display` — the largest type in the system — because the whole
 * point is that it can be read without reading. A caption-sized figure beside a
 * caption-sized label is a table, and a table is what this screen already was.
 */
export function StatTile({ value, label, tint }: { value: string; label: string; tint?: string }) {
  return (
    <View style={styles.tile}>
      <Text style={[styles.tileValue, tint ? { color: tint } : null]}>{value}</Text>
      <Text style={styles.tileLabel}>{label}</Text>
    </View>
  );
}

/**
 * WHERE THEY SIT IN 2,650 YEARS.
 *
 * The single most orienting fact about a philosopher, and the profile never had
 * it: "1724–1804" means nothing to a beginner until it is a position on a line
 * with Socrates at one end.
 *
 * Two marks, and the difference matters. The BAR is the life, drawn only when
 * both ends are known. The DOT is `at`, which every thinker has — so a figure
 * dated "c. 6th century BCE" still appears on the line, with no bar, which is
 * an honest picture of what is known about them rather than a gap.
 */
export function LifeStrip({ life, era }: { life: Lifespan; era: string }) {
  const tint = eraColour(era);
  const dot = timelinePos(life.at);
  const hasBar = life.from !== null && life.to !== null;
  const a = hasBar ? timelinePos(life.from as number) : 0;
  const b = hasBar ? timelinePos(life.to as number) : 0;
  // Year 1. THE ONE TICK WORTH DRAWING, and it is what makes the rail readable
  // at all: without it "624 BCE" and "2026" are two labels 2,650 years apart and
  // a dot somewhere between them means nothing. With BCE/CE marked, a reader
  // places a thinker in a glance. Rendered without a label, because the tick's
  // position between the two end labels already says which side is which.
  const zero = timelinePos(0);
  return (
    <View style={styles.strip}>
      <View style={styles.stripRail}>
        <View style={[styles.stripZero, { left: `${zero * 100}%` }]} />
        {hasBar ? (
          <View
            style={[
              styles.stripLife,
              // AN 80-YEAR LIFE IS 3% OF THIS RAIL. Kant's bar rendered at 11px
              // directly under a 12px dot and was invisible — the strip looked
              // like it drew nothing but a position. The floor is 4% so a normal
              // lifetime reads as a span with width rather than as the dot's
              // shadow, which costs a little precision at this scale and buys
              // the only thing the bar is there to say.
              { left: `${a * 100}%`, width: `${Math.max(4, (b - a) * 100)}%`, backgroundColor: tint },
            ]}
          />
        ) : null}
        <View style={[styles.stripDot, { left: `${dot * 100}%`, backgroundColor: tint }]} />
      </View>
      <View style={styles.stripEnds}>
        <Text style={styles.stripEnd}>{yearLabel(FIRST_YEAR)}</Text>
        <Text style={styles.stripEnd}>{yearLabel(LAST_YEAR)}</Text>
      </View>
    </View>
  );
}

/**
 * WHICH OF THE SIX THIS THINKER IS FOR.
 *
 * `branchSlugs` runs 1–4 of 6, and showing the ones they DON'T touch is half the
 * information: an ethicist and a logician look identical as two words in a row
 * and completely different as two filled cells out of six. The unfilled cells
 * are the point, which is why this is a full row rather than a list of chips.
 */
export function BranchSpread({ slugs, era }: { slugs: string[]; era: string }) {
  const tint = eraColour(era);
  // TWO ROWS OF THREE, NOT ONE ROW OF SIX. Six cells across a phone gives each
  // label about 55px, and "Epistemology" and "Political Philosophy" both came
  // out as an abbreviation and an ellipsis — which is worse than useless here,
  // because the whole point of showing all six is that a reader can read the
  // ones that are NOT lit. Halving the count doubles the width and every name
  // fits. The 3-lit-of-6 reading survives the wrap.
  const rows = [ALL_BRANCHES.slice(0, 3), ALL_BRANCHES.slice(3, 6)];
  return (
    <View style={styles.spreadWrap}>
      {rows.map((row, i) => (
        <View key={i} style={styles.spread}>
          {row.map((b) => {
            const on = slugs.includes(b.slug);
            return (
              <View key={b.slug} style={styles.spreadCell}>
                <View style={[styles.spreadBar, on ? { backgroundColor: tint } : null]} />
                <Text
                  style={[styles.spreadLabel, on ? styles.spreadLabelOn : null]}
                  numberOfLines={1}
                >
                  {b.name}
                </Text>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

/**
 * WHO ELSE WAS ALIVE — the stat that turns a profile into a doorway.
 *
 * Every other number here describes one person. This one is the only thing on
 * the page that points somewhere else, which is what makes 322 thinkers feel
 * like a period rather than a list. Three names, chosen and justified in
 * `contemporariesOf`.
 */
export function ContemporariesRow({
  count, notable, era, onOpen,
}: {
  count: number;
  notable: { id: string; name: string; symbol: string }[];
  era: string;
  onOpen: (id: string) => void;
}) {
  if (count === 0) return null;
  const tint = eraColour(era);
  return (
    <View>
      <Text style={styles.contemLead}>
        <Text style={[styles.contemCount, { color: tint }]}>{count}</Text>
        {count === 1 ? ' thinker was alive at the same time' : ' thinkers were alive at the same time'}
      </Text>
      <View style={styles.contemRow}>
        {notable.map((n) => (
          <Pressable
            key={n.id}
            onPress={() => onOpen(n.id)}
            accessibilityRole="button"
            accessibilityLabel={`Open ${n.name}`}
            style={({ pressed }) => [styles.contemCard, pressed && styles.contemPressed]}
          >
            <Text style={styles.contemSymbol}>{n.symbol}</Text>
            <Text style={styles.contemName} numberOfLines={2}>{n.name}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACE[2],
    paddingVertical: SPACE[0],
    borderRadius: RADIUS.pill,
  },
  chipText: { ...TYPE.micro, color: C.paper },

  tile: { flex: 1, alignItems: 'center' },
  tileValue: { ...TYPE.display, color: C.ink },
  tileLabel: { ...TYPE.micro, color: C.inkSoft, textAlign: 'center', marginTop: SPACE[0] },

  strip: { gap: SPACE[0] },
  stripRail: {
    height: 12,
    justifyContent: 'center',
    borderRadius: RADIUS.pill,
    backgroundColor: C.hairline,
  },
  stripLife: { position: 'absolute', height: 12, borderRadius: RADIUS.pill },
  stripZero: { position: 'absolute', width: 1, height: 18, backgroundColor: C.dim },
  stripDot: {
    position: 'absolute',
    width: 12, height: 12, borderRadius: RADIUS.pill,
    borderWidth: 2, borderColor: C.paper,
    marginLeft: -6,
  },
  stripEnds: { flexDirection: 'row', justifyContent: 'space-between' },
  stripEnd: { ...TYPE.micro, color: C.inkSoft },

  spreadWrap: { gap: SPACE[1] },
  spread: { flexDirection: 'row', gap: SPACE[1] },
  spreadCell: { flex: 1, gap: SPACE[0] },
  spreadBar: { height: 8, borderRadius: RADIUS.pill, backgroundColor: C.hairline },
  spreadLabel: { ...TYPE.micro, color: C.dim, letterSpacing: 0.2 },
  spreadLabelOn: { color: C.ink },

  contemLead: { ...TYPE.body, color: C.inkSoft, marginBottom: SPACE[2] },
  contemCount: { ...TYPE.title },
  contemRow: { flexDirection: 'row', gap: SPACE[1] },
  contemCard: {
    flex: 1,
    alignItems: 'center',
    gap: SPACE[0],
    paddingVertical: SPACE[2],
    paddingHorizontal: SPACE[1],
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: C.hairline,
    backgroundColor: C.surface,
  },
  contemPressed: { backgroundColor: C.surfaceSoft },
  contemSymbol: { fontSize: 22 },
  contemName: { ...TYPE.label, color: C.ink, textAlign: 'center' },
});
