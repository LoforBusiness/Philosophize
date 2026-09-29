// ─────────────────────────────────────────────────────────────────────────────
// A SUBJECT ON THE LEARN GRID — two to a row, or, for the one live subject, the
// full width of the page (`wide`).
//
// The depth kit, unmodified: a white face on the 2px `C.edge`, standing on a hard
// ledge in the SUBJECT'S OWN colour (lipOf), pressed in when tapped. The drawing sits
// on its own pale panel of that colour, so the grid reads as seven coloured objects
// on paper rather than seven coloured slabs — §19's "what made it cheap was AREA".
// ─────────────────────────────────────────────────────────────────────────────
import { View, Text, StyleSheet } from 'react-native';
import Card from '@/components/ui/Card';
import { C } from '@/constants/design';
import { lipOf } from '@/components/shared/tone';
import type { Subject } from '@/data/subjects';
import SubjectArt from './SubjectArt';
import { sceneTones } from './subjectScenes';
import { DoneTag, SoonTag } from './tag';
import { TILE_PAD, TILE_TITLE, CARD_TITLE, WIDE_ART, tileTitle } from './tileLayout';

export default function SubjectTile({
  subject, done, size, wide = false, onPress,
}: {
  subject: Subject;
  done: number;
  /** The tile's side (tileSize), or the page's content width when `wide`. */
  size: number;
  wide?: boolean;
  onPress: () => void;
}) {
  const t = sceneTones(subject.hue);
  const soon = subject.status === 'soon';
  const label = `${subject.name}${soon ? ', coming soon' : ''}`;

  if (wide) {
    return (
      <Card pad={0} onPress={onPress} ledge={lipOf(subject.hue)} accessibilityLabel={`Open ${label}`}
        containerStyle={{ width: size }}>
        <View style={styles.wideRow}>
          <View style={[styles.panel, { backgroundColor: t.tile, width: WIDE_ART, height: WIDE_ART }]}>
            <SubjectArt art={subject.slug} hue={subject.hue} size={WIDE_ART - 8} />
          </View>
          <View style={styles.wideText}>
            <Text style={styles.kicker}>
              {soon ? 'COMING SOON' : `${subject.courses.length} COURSES`}
            </Text>
            <Text style={styles.wideName} numberOfLines={1}>{subject.name}</Text>
            <Text style={styles.blurb} numberOfLines={2}>{subject.blurb}</Text>
            <View style={styles.tagRow}>{soon ? <SoonTag /> : <DoneTag done={done} />}</View>
          </View>
        </View>
      </Card>
    );
  }

  const art = size - 2 * TILE_PAD;
  return (
    <Card pad={0} onPress={onPress} ledge={lipOf(subject.hue)} accessibilityLabel={`Open ${label}`}
      containerStyle={{ width: size, alignSelf: 'stretch' }}>
      <View style={styles.body}>
        <View style={[styles.panel, { backgroundColor: t.tile, height: art * 0.78 }]}>
          <SubjectArt art={subject.slug} hue={subject.hue} size={art * 0.74} />
        </View>
        <Text style={styles.name} numberOfLines={2}>{tileTitle(subject, size)}</Text>
        <View style={styles.grow} />
        <View style={styles.tagRow}>{soon ? <SoonTag /> : <DoneTag done={done} />}</View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  panel: { borderRadius: 12, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  name: {
    fontFamily: TILE_TITLE.family, fontSize: TILE_TITLE.fontSize, lineHeight: TILE_TITLE.lineHeight,
    color: C.ink, marginTop: 10,
  },
  tagRow: { marginTop: 8, minHeight: 20 },
  // The row stretches both tiles to the taller one's height (Card relays the growth
  // to its face), and the tag sits at the FOOT, so two tiles side by side end level
  // when only one name wraps — found at 320dp, where "Personal Growth" takes two lines.
  body: { padding: TILE_PAD, flexGrow: 1 },
  grow: { flexGrow: 1 },
  wideRow: { flexDirection: 'row', alignItems: 'center', padding: TILE_PAD, gap: TILE_PAD },
  wideText: { flex: 1 },
  kicker: { fontFamily: 'Inter_500Medium', fontSize: 10, letterSpacing: 1.6, color: C.inkSoft },
  wideName: {
    fontFamily: CARD_TITLE.family, fontSize: CARD_TITLE.fontSize, lineHeight: CARD_TITLE.lineHeight,
    color: C.ink, marginTop: 2,
  },
  blurb: {
    fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 13, lineHeight: 18,
    color: C.inkSoft, marginTop: 2,
  },
});
