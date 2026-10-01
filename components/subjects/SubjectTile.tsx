// ─────────────────────────────────────────────────────────────────────────────
// A SUBJECT ON THE LEARN GRID — two to a row, every subject the same size.
//
// The same construction as Home's card (SubjectCard): the picture fills the top, and
// the words sit on a foot in the deepest colour of that picture rather than on a white
// slip (foot.ts), on a ledge of that colour taken toward ink. The picture is a PNG
// drawn by `make:posters`, like the shelf's, so a grid of seven builds no SVG.
//
// No subject is drawn larger than another (2026-09-30): "I don't want philosophy to be
// on the very top covering two slots … each of the subjects have their equal amount of
// room." The `wide` tile went with that.
// ─────────────────────────────────────────────────────────────────────────────
import { View, Text, StyleSheet } from 'react-native';
import Card from '@/components/ui/Card';
import type { Subject } from '@/data/subjects';
import Poster from './Poster';
import { TILE_POSTER } from './posterArt';
import { DoneTag, SoonTag } from './tag';
import { footOf, lessonsIn, FOOT_TEXT, FOOT_SOFT } from './foot';
import { TILE_PAD, TILE_TITLE, tileTitle, tileArtHeight } from './tileLayout';

/** The card face's own border, each side (Card). */
const BORDER = 2;

export default function SubjectTile({
  subject, done, size, onPress,
}: {
  subject: Subject;
  done: number;
  /** The tile's side (tileSize). */
  size: number;
  onPress: () => void;
}) {
  const soon = subject.status === 'soon';
  const { foot, ledge } = footOf(subject);
  const n = lessonsIn(subject);
  return (
    <Card pad={0} onPress={onPress} ledge={ledge}
      style={{ backgroundColor: foot, borderColor: foot }}
      accessibilityLabel={`Open ${subject.name}${soon ? ', coming soon' : ''}`}
      containerStyle={{ width: size, alignSelf: 'stretch' }}>
      <Poster art={subject.slug} hue={subject.hue} width={size - 2 * BORDER} height={tileArtHeight(size)}
        style={styles.poster} image={TILE_POSTER[subject.slug]?.source} />
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={2}>{tileTitle(subject, size)}</Text>
        {/* The row stretches both tiles to the taller one (Card relays the growth to
            its face), and the tag sits at the FOOT, so a pair ends level when only one
            name wraps — found at 320dp, where "Personal Growth" takes two lines. */}
        <View style={styles.grow} />
        <View style={styles.tagRow}>
          {soon ? <SoonTag /> : done > 0 ? <DoneTag done={done} /> : (
            <Text style={styles.count} numberOfLines={1}>{n} {n === 1 ? 'LESSON' : 'LESSONS'}</Text>
          )}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  // The face's radius less its border, so the picture's corners sit inside the rule.
  poster: { borderTopLeftRadius: 14, borderTopRightRadius: 14 },
  body: { padding: TILE_PAD, paddingTop: 10, flexGrow: 1 },
  name: {
    fontFamily: TILE_TITLE.family, fontSize: TILE_TITLE.fontSize, lineHeight: TILE_TITLE.lineHeight,
    color: FOOT_TEXT,
  },
  grow: { flexGrow: 1 },
  tagRow: { marginTop: 8, minHeight: 20, justifyContent: 'center' },
  count: { fontFamily: 'Inter_700Bold', fontSize: 9.5, letterSpacing: 1.3, color: FOOT_SOFT },
});
