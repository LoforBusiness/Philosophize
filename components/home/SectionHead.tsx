import { View, Text, StyleSheet } from 'react-native';

// ─────────────────────────────────────────────────────────────────────────────
// ONE WAY TO NAME A SECTION.
//
// Home had three, for three sections: an ink tab stapled to the corner of the
// reflection, a plain grey kicker inside the thinker card, and nothing at all
// over the streak. Three answers to one question is how a page stops looking
// like anyone decided it — and the tab was the worst of them, because it hung
// in the 18dp gap between two cards and read as a sticker somebody had put on
// afterwards.
//
// A small-caps label with a rule running off to the edge is the oldest section
// head in print, and it does something none of the three did: it draws a LINE
// across the page, so the eye is told where one thing ends and the next begins
// without either of them needing to be in a box.
//
// The rule is INK, not the hairline grey. The page already carries faint ruled
// lines at #ECEAE2 (RuledPaper in the home screen), and a hairline rule sat on
// that texture is indistinguishable from it — the divider would read as part of
// the paper rather than as a mark made on it.
// ─────────────────────────────────────────────────────────────────────────────

const INK = '#1A1A1A';

export default function SectionHead({ children, style }: { children: string; style?: object }) {
  return (
    <View style={[styles.row, style]}>
      <Text style={styles.label}>{children}</Text>
      <View style={styles.rule} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  label: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9,
    color: INK,
    letterSpacing: 2.2,
    includeFontPadding: false,
  },
  // Optically centred rather than centred: a rule aligned to the middle of the
  // label's box sits low against small caps, which have no descenders to fill
  // the bottom of that box.
  rule: { flex: 1, height: 1, backgroundColor: INK, marginLeft: 12, marginTop: 1 },
});
