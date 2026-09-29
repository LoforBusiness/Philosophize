// ─────────────────────────────────────────────────────────────────────────────
// A SUBJECT ON THE LEARN GRID — two to a row, or, for the one live subject, the
// full width of the page (`wide`).
//
// The depth kit's card — a white face on the 2px `C.edge`, standing on a hard ledge
// in the SUBJECT'S OWN colour (lipOf), pressed in when tapped — with the subject's
// poster filling its top edge to edge (posters.ts) and a label pinned to the poster's
// corner. The name and a tag sit on the white foot. Imprint's course covers are this
// shape, and the owner picked it on 2026-09-29.
// ─────────────────────────────────────────────────────────────────────────────
import { View, Text, StyleSheet } from 'react-native';
import Card from '@/components/ui/Card';
import { C } from '@/constants/design';
import { lipOf } from '@/components/shared/tone';
import type { Subject } from '@/data/subjects';
import Poster from './Poster';
import { ArtBadge, DoneTag, SoonTag } from './tag';
import { TILE_PAD, TILE_TITLE, CARD_TITLE, tileTitle, tileArtHeight, heroArtHeight } from './tileLayout';

/** The card face's own border, each side (Card). */
const BORDER = 2;

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
  const soon = subject.status === 'soon';
  const label = `${subject.name}${soon ? ', coming soon' : ''}`;
  const badge = soon ? 'SOON' : `${subject.courses.length} COURSES`;
  const artH = wide ? heroArtHeight(size) : tileArtHeight(size);

  return (
    <Card pad={0} onPress={onPress} ledge={lipOf(subject.hue)} accessibilityLabel={`Open ${label}`}
      containerStyle={wide ? { width: size } : { width: size, alignSelf: 'stretch' }}>
      <View>
        <Poster art={subject.slug} hue={subject.hue} width={size - 2 * BORDER} height={artH} style={styles.poster} />
        {/* On the grid the COMING SOON chip below says it already, and a pinned label
            covers the top of a tile this small; only the wide tile carries one. */}
        {wide ? <ArtBadge label={badge} hue={subject.hue} /> : null}
      </View>
      {wide ? (
        <View style={styles.wideFoot}>
          <Text style={styles.wideName} numberOfLines={1}>{subject.name}</Text>
          <Text style={styles.blurb} numberOfLines={2}>{subject.blurb}</Text>
          <View style={styles.tagRow}>{soon ? <SoonTag /> : <DoneTag done={done} />}</View>
        </View>
      ) : (
        <View style={styles.body}>
          <Text style={styles.name} numberOfLines={2}>{tileTitle(subject, size)}</Text>
          <View style={styles.grow} />
          <View style={styles.tagRow}>{soon ? <SoonTag /> : <DoneTag done={done} />}</View>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  // The face's radius less its border, so the poster's corners sit inside the rule.
  poster: { borderTopLeftRadius: 14, borderTopRightRadius: 14 },
  name: {
    fontFamily: TILE_TITLE.family, fontSize: TILE_TITLE.fontSize, lineHeight: TILE_TITLE.lineHeight,
    color: C.ink,
  },
  tagRow: { marginTop: 8, minHeight: 20 },
  // The row stretches both tiles to the taller one's height (Card relays the growth
  // to its face), and the tag sits at the FOOT, so two tiles side by side end level
  // when only one name wraps — found at 320dp, where "Personal Growth" takes two lines.
  body: { padding: TILE_PAD, paddingTop: 10, flexGrow: 1 },
  grow: { flexGrow: 1 },
  wideFoot: { paddingHorizontal: TILE_PAD + 2, paddingTop: 10, paddingBottom: TILE_PAD },
  wideName: {
    fontFamily: CARD_TITLE.family, fontSize: CARD_TITLE.fontSize, lineHeight: CARD_TITLE.lineHeight,
    color: C.ink,
  },
  blurb: {
    fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 13, lineHeight: 18,
    color: C.inkSoft, marginTop: 2,
  },
});
