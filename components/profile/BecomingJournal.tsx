import { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  INK, MID, PAPER_LIT, DEEP, OLIVE, EMBER, FLAT_EDGE, mix,
} from '@/components/shared/tone';
import { LINE } from '@/components/shared/drawn';

// ─────────────────────────────────────────────────────────────────────────────
// WHO YOU'RE BECOMING, WRITTEN IN A JOURNAL (2026-09-26).
//
// It was a white card with a pencil icon in a circle and the sentence centred in
// italic: the quietest box on Profile, holding the one line on it written ABOUT
// the reader. The owner asked for it to be redesigned in the look of the welcome
// and the lessons, and the object this sentence already is — a running note on
// somebody, rewritten every lesson — is a journal entry. So it is drawn as one:
//
//   · a leather notebook in the palette's DEEP teal, its cover showing past the
//     page on two sides and a ledge under it, as every raised thing here stands;
//   · a lined page with a margin rule, and the sentence HANDWRITTEN on it in
//     Caveat — the same hand the mascot speaks in on the streak screen, because
//     this is the same character's opinion of you;
//   · an ember ribbon marking the page (the palette's spark, kept small), and a
//     fountain pen laid across the corner, which is the pencil icon it replaces
//     turned into the thing itself.
//
// All Views; nothing moves; the rules are drawn to a fixed pitch and clipped by
// the page, so the page is exactly as tall as the words and no taller.
// ─────────────────────────────────────────────────────────────────────────────

/** The line pitch of the ruling, and of the handwriting on it. */
const LH = 28;
const PAD_TOP = 34;
const PAD_BOTTOM = 26;
const MARGIN_X = 30;
const COVER = DEEP;
const COVER_EDGE = mix(DEEP, INK, 0.5);
const RULE = FLAT_EDGE;
const MARGIN = mix(EMBER, PAPER_LIT, 0.55);
const RIBBON = EMBER;
const RIBBON_SHADE = mix(EMBER, INK, 0.35);
const PEN = mix(DEEP, OLIVE, 0.35);
/** The strip down the page's right edge the ribbon hangs in; no word goes there. */
const RIBBON_GUTTER = 38;

export default memo(function BecomingJournal({ bio }: { bio: string }) {
  return (
    <View style={styles.wrap} accessible accessibilityLabel={bio}>
      {/* the cover, showing past the page along the left and the foot */}
      <View style={styles.cover} />
      {/* the page block, one step under the page */}
      <View style={styles.block} />

      <View style={styles.page}>
        {/* the ruling, to a fixed pitch, clipped by the page */}
        {Array.from({ length: 14 }, (_, k) => (
          <View key={k} style={[styles.rule, { top: PAD_TOP + LH * k + 19 }]} />
        ))}
        <View style={styles.margin} />
        <Text style={styles.kicker}>TODAY&rsquo;S ENTRY</Text>
        <Text style={styles.hand}>{bio}</Text>
      </View>

      {/* the ribbon marking the page, hanging out past its foot */}
      <View style={styles.ribbon} />

      {/* the pen, laid across the page's corner */}
      <View style={styles.pen} pointerEvents="none">
        <View style={styles.penNib} />
        <View style={styles.penGrip} />
        <View style={styles.penBody}>
          <View style={styles.penBand} />
        </View>
        <View style={styles.penCap} />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { paddingLeft: 10, paddingBottom: 16, marginRight: 4 },
  cover: {
    position: 'absolute', left: 0, right: -2, top: 8, bottom: 6,
    backgroundColor: COVER, borderRadius: 12, borderWidth: LINE, borderColor: INK,
    boxShadow: `0px 4px 0px ${COVER_EDGE}`,
  },
  block: {
    position: 'absolute', left: 13, right: 3, top: 6, bottom: 11,
    backgroundColor: mix(PAPER_LIT, INK, 0.08), borderRadius: 8, borderWidth: LINE * 0.8, borderColor: INK,
  },
  page: {
    marginRight: 8, borderRadius: 8, borderWidth: LINE, borderColor: INK, backgroundColor: PAPER_LIT,
    paddingTop: PAD_TOP, paddingBottom: PAD_BOTTOM, paddingLeft: MARGIN_X + 12, paddingRight: RIBBON_GUTTER,
    overflow: 'hidden',
  },
  rule: { position: 'absolute', left: 0, right: 0, height: 1.5, backgroundColor: RULE },
  margin: { position: 'absolute', top: 0, bottom: 0, left: MARGIN_X, width: 1.5, backgroundColor: MARGIN },
  kicker: {
    position: 'absolute', top: 12, left: MARGIN_X + 12,
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.8, color: MID,
  },
  hand: {
    fontFamily: 'Caveat_700Bold', fontSize: 23, lineHeight: LH, color: INK,
  },

  ribbon: {
    position: 'absolute', top: 2, right: 26, width: 12, bottom: 0,
    backgroundColor: RIBBON, borderLeftWidth: 1.5, borderRightWidth: 1.5, borderBottomWidth: 1.5,
    borderColor: RIBBON_SHADE, borderBottomLeftRadius: 2, borderBottomRightRadius: 2,
  },
  pen: {
    position: 'absolute', right: 58, bottom: 4, height: 11, flexDirection: 'row', alignItems: 'center',
    transform: [{ rotate: '-24deg' }],
  },
  penNib: {
    width: 0, height: 0, borderTopWidth: 4, borderBottomWidth: 4, borderRightWidth: 9,
    borderTopColor: 'transparent', borderBottomColor: 'transparent', borderRightColor: INK,
  },
  penGrip: { width: 9, height: 7, backgroundColor: mix(PEN, INK, 0.4), borderWidth: 1.5, borderColor: INK },
  penBody: {
    width: 56, height: 11, borderRadius: 3, backgroundColor: PEN, borderWidth: LINE * 0.8, borderColor: INK,
    justifyContent: 'center',
  },
  penBand: { position: 'absolute', right: 8, top: 0, bottom: 0, width: 4, backgroundColor: EMBER },
  penCap: {
    width: 8, height: 9, borderTopRightRadius: 4.5, borderBottomRightRadius: 4.5,
    backgroundColor: PEN, borderWidth: LINE * 0.8, borderLeftWidth: 0, borderColor: INK,
  },
});
