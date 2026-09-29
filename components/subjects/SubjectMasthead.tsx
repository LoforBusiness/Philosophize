// The top of a subject page: the way back, the subject's poster across the page
// (posters.ts), its name and its line. Flat — a masthead is read, not pressed, so the
// poster sits on a 2px rule of its own darker hue rather than on a ledge.
import { View, Text, Pressable, StyleSheet } from 'react-native';
import SketchIcon from '@/components/shared/SketchIcon';
import { C } from '@/constants/design';
import { mix } from '@/components/shared/tone';
import type { Subject } from '@/data/subjects';
import Poster from './Poster';
import { SoonTag } from './tag';
import { MAST_TITLE, MAST_ART_H } from './tileLayout';

export default function SubjectMasthead({
  subject, width, onBack,
}: {
  subject: Subject;
  /** The page's content width — the poster runs across all of it. */
  width: number;
  onBack: () => void;
}) {
  return (
    <View>
      <View style={styles.topBar}>
        <Pressable onPress={onBack} hitSlop={10} style={styles.backRow} accessibilityRole="button" accessibilityLabel="Back">
          <SketchIcon name="back" size={18} color={C.inkSoft} />
          <Text style={styles.brand}>SUBJECTS</Text>
        </Pressable>
      </View>
      <View style={[styles.frame, { borderColor: mix(subject.hue, C.ink, 0.35) }]}>
        <Poster art={subject.slug} hue={subject.hue} width={width - 4} height={MAST_ART_H} />
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
  frame: { borderRadius: 16, borderWidth: 2, overflow: 'hidden' },
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
