// ─────────────────────────────────────────────────────────────────────────────
// A SUBJECT IN HOME'S CAROUSEL — a large card, most of the screen wide, so the next
// one peeks in from the right and says "there is more this way" without an arrow.
//
// The same parts as a Learn tile, laid out bigger: the drawing on its pale panel,
// the full name, the one-line blurb, and a tag. Brilliant's home shelf is this shape.
// ─────────────────────────────────────────────────────────────────────────────
import { View, Text, StyleSheet } from 'react-native';
import Card from '@/components/ui/Card';
import { C } from '@/constants/design';
import { lipOf } from '@/components/shared/tone';
import type { Subject } from '@/data/subjects';
import SubjectArt from './SubjectArt';
import { sceneTones } from './subjectScenes';
import { DoneTag, SoonTag } from './tag';
import { CARD_PAD, CARD_TITLE } from './tileLayout';

export default function SubjectCard({
  subject, done, width, onPress,
}: {
  subject: Subject;
  done: number;
  width: number;
  onPress: () => void;
}) {
  const t = sceneTones(subject.hue);
  const soon = subject.status === 'soon';
  const inner = width - 2 * CARD_PAD;
  const panelH = Math.round(inner * 0.66);
  return (
    <Card pad={0} onPress={onPress} ledge={lipOf(subject.hue)}
      accessibilityLabel={`Open ${subject.name}${soon ? ', coming soon' : ''}`}
      containerStyle={{ width }}>
      <View style={{ padding: CARD_PAD }}>
        <View style={[styles.panel, { backgroundColor: t.tile, height: panelH }]}>
          <SubjectArt art={subject.slug} hue={subject.hue} size={panelH - 10} />
        </View>
        <Text style={styles.name} numberOfLines={2}>{subject.name}</Text>
        <Text style={styles.blurb} numberOfLines={2}>{subject.blurb}</Text>
        <View style={styles.tagRow}>
          {soon ? <SoonTag /> : done > 0 ? <DoneTag done={done} /> : (
            <Text style={styles.start}>{subject.courses.length} COURSES · START HERE</Text>
          )}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  panel: { borderRadius: 14, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  name: {
    fontFamily: CARD_TITLE.family, fontSize: CARD_TITLE.fontSize, lineHeight: CARD_TITLE.lineHeight,
    color: C.ink, marginTop: 12,
  },
  blurb: {
    fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 13.5, lineHeight: 19,
    color: C.inkSoft, marginTop: 3,
  },
  tagRow: { marginTop: 10, minHeight: 22, justifyContent: 'center' },
  start: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.2, color: C.HUE },
});
