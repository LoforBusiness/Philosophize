// The top of a subject page: the way back, the subject's drawing on its own pale
// panel, its name and its line. Flat — a masthead is read, not pressed.
import { View, Text, Pressable, StyleSheet } from 'react-native';
import SketchIcon from '@/components/shared/SketchIcon';
import { C } from '@/constants/design';
import type { Subject } from '@/data/subjects';
import SubjectArt from './SubjectArt';
import { sceneTones } from './subjectScenes';
import { SoonTag } from './tag';
import { MAST_TITLE } from './tileLayout';

export default function SubjectMasthead({ subject, onBack }: { subject: Subject; onBack: () => void }) {
  const t = sceneTones(subject.hue);
  return (
    <View>
      <View style={styles.topBar}>
        <Pressable onPress={onBack} hitSlop={10} style={styles.backRow} accessibilityRole="button" accessibilityLabel="Back">
          <SketchIcon name="back" size={18} color={C.inkSoft} />
          <Text style={styles.brand}>SUBJECTS</Text>
        </Pressable>
      </View>
      <View style={[styles.panel, { backgroundColor: t.tile, borderColor: t.tileEdge }]}>
        <SubjectArt art={subject.slug} hue={subject.hue} size={132} />
      </View>
      <Text style={styles.name}>{subject.name}</Text>
      <Text style={styles.blurb}>{subject.blurb}</Text>
      {subject.status === 'soon' ? <View style={styles.tag}><SoonTag /></View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: { paddingTop: 4, paddingBottom: 12 },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start' },
  brand: { fontFamily: 'Inter_500Medium', fontSize: 11, color: C.inkSoft, letterSpacing: 2 },
  panel: {
    height: 152, borderRadius: 16, borderWidth: 2, alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  name: {
    fontFamily: MAST_TITLE.family, fontSize: MAST_TITLE.fontSize, lineHeight: MAST_TITLE.lineHeight,
    color: C.ink, marginTop: 14,
  },
  blurb: {
    fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 15, lineHeight: 21,
    color: C.inkSoft, marginTop: 2,
  },
  tag: { marginTop: 10 },
});

