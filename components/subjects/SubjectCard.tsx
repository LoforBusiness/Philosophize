// ─────────────────────────────────────────────────────────────────────────────
// A SUBJECT IN HOME'S CAROUSEL — a large card, most of the screen wide, so the next
// one peeks in from the right and says "there is more this way" without an arrow.
//
// The poster fills the top of the card edge to edge, in the subject's own colour,
// with a label pinned to its corner (Imprint's course covers, Brilliant's shelf);
// the name, the one-line blurb and a tag sit on the white foot under it. The owner
// picked this over the small drawing on a pale panel on 2026-09-29.
// ─────────────────────────────────────────────────────────────────────────────
import { View, Text, StyleSheet } from 'react-native';
import Card from '@/components/ui/Card';
import { C } from '@/constants/design';
import { lipOf } from '@/components/shared/tone';
import type { Subject } from '@/data/subjects';
import Poster from './Poster';
import { CARD_POSTER } from './posterArt';
import { ArtBadge, DoneTag, SoonTag } from './tag';
import { CARD_PAD, CARD_TITLE, cardArtHeight } from './tileLayout';

/** The card face's own border, each side (Card). */
const BORDER = 2;

export default function SubjectCard({
  subject, done, width, onPress,
}: {
  subject: Subject;
  done: number;
  width: number;
  onPress: () => void;
}) {
  const soon = subject.status === 'soon';
  return (
    <Card pad={0} onPress={onPress} ledge={lipOf(subject.hue)}
      accessibilityLabel={`Open ${subject.name}${soon ? ', coming soon' : ''}`}
      containerStyle={{ width }}>
      <View>
        <Poster art={subject.slug} hue={subject.hue} width={width - 2 * BORDER} height={cardArtHeight(width)} style={styles.poster}
          image={CARD_POSTER[subject.slug]?.source} />
        <ArtBadge label={soon ? 'SOON' : `${subject.courses.length} COURSES`} hue={subject.hue} />
      </View>
      <View style={styles.foot}>
        <Text style={styles.name} numberOfLines={2}>{subject.name}</Text>
        <Text style={styles.blurb} numberOfLines={2}>{subject.blurb}</Text>
        <View style={styles.tagRow}>
          {soon ? <SoonTag /> : done > 0 ? <DoneTag done={done} /> : (
            <Text style={styles.start}>START HERE</Text>
          )}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  // The face's radius less its border, so the poster's corners sit inside the rule.
  poster: { borderTopLeftRadius: 14, borderTopRightRadius: 14 },
  foot: { padding: CARD_PAD, paddingTop: 12 },
  name: {
    fontFamily: CARD_TITLE.family, fontSize: CARD_TITLE.fontSize, lineHeight: CARD_TITLE.lineHeight,
    color: C.ink,
  },
  blurb: {
    fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 13.5, lineHeight: 19,
    color: C.inkSoft, marginTop: 3,
  },
  tagRow: { marginTop: 10, minHeight: 22, justifyContent: 'center' },
  start: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.2, color: C.HUE },
});
