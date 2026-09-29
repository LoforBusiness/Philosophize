// The two small pills a subject or branch wears: how much of it is the reader's own,
// and that it is not open yet. Both are flat — a pill here is a LABEL, not a button,
// so it carries no ledge (the depth kit's rule: a thing you only read has an edge,
// a thing you press stands on one).
import { View, Text, StyleSheet } from 'react-native';
import StatSticker from '@/components/shared/StatSticker';
import { C } from '@/constants/design';
import { TINT, TINT_EDGE, FLOOR, FLOOR_CUT } from '@/components/shared/tone';

/** "N DONE" — a count and never "N of M", because the library grows (CLAUDE.md §19). */
export function DoneTag({ done }: { done: number }) {
  if (done <= 0) return null;
  return (
    <View style={[styles.pill, styles.done]}>
      <StatSticker name="lessons" size={14} />
      <Text style={styles.doneText}>{done} DONE</Text>
    </View>
  );
}

export function SoonTag() {
  return (
    <View style={[styles.pill, styles.soon]}>
      <Text style={styles.soonText}>COMING SOON</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5,
    borderRadius: 999, borderWidth: 1.5, paddingHorizontal: 8, paddingVertical: 3,
  },
  done: { backgroundColor: TINT, borderColor: TINT_EDGE, paddingLeft: 5 },
  doneText: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1, color: C.ink },
  soon: { backgroundColor: FLOOR, borderColor: FLOOR_CUT },
  soonText: { fontFamily: 'Inter_700Bold', fontSize: 9.5, letterSpacing: 1.2, color: C.inkSoft },
});
