// The two small pills a subject or branch wears: how much of it is the reader's own,
// and that it is not open yet. Both are flat — a pill here is a LABEL, not a button,
// so it carries no ledge (the depth kit's rule: a thing you only read has an edge,
// a thing you press stands on one).
import { View, Text, StyleSheet } from 'react-native';
import StatSticker from '@/components/shared/StatSticker';
import { C } from '@/constants/design';
import { TINT, TINT_EDGE, FLOOR, FLOOR_CUT, PAPER_LIT, mix } from '@/components/shared/tone';
import { PILL } from './tileLayout';

/** "N DONE" — a count and never "N of M", because the library grows (CLAUDE.md §19). */
export function DoneTag({ done }: { done: number }) {
  if (done <= 0) return null;
  return (
    <View style={[styles.pill, styles.done]}>
      <StatSticker name="lessons" size={14} />
      <Text style={styles.doneText} numberOfLines={1}>{done} DONE</Text>
    </View>
  );
}

export function SoonTag() {
  return (
    <View style={[styles.pill, styles.soon]}>
      <Text style={styles.soonText} numberOfLines={1}>COMING SOON</Text>
    </View>
  );
}

/**
 * The label pinned to a poster's top-right corner — "SOON" or "6 COURSES" — the way
 * Imprint pins NEW on a course cover. White on an ink rule, so it reads on any hue;
 * the words take the subject's own colour, darkened toward ink so they hold 4.5:1.
 */
export function ArtBadge({ label, hue }: { label: string; hue: string }) {
  return (
    <View style={styles.badge}>
      <Text style={[styles.badgeText, { color: mix(hue, C.ink, 0.3) }]} numberOfLines={1}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute', top: 9, right: 9, backgroundColor: PAPER_LIT, borderRadius: 999,
    borderWidth: 2, borderColor: C.ink, paddingHorizontal: 7, paddingVertical: 2,
    boxShadow: `0px 2px 0px ${C.ink}`,
  },
  badgeText: { fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.1 },
  pill: {
    alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5,
    borderRadius: 999, borderWidth: 1.5, paddingHorizontal: PILL.padX, paddingVertical: 3,
  },
  done: { backgroundColor: TINT, borderColor: TINT_EDGE, paddingLeft: 5 },
  doneText: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1, color: C.ink },
  soon: { backgroundColor: FLOOR, borderColor: FLOOR_CUT },
  soonText: { fontFamily: 'Inter_700Bold', fontSize: PILL.fontSize, letterSpacing: PILL.letterSpacing, color: C.inkSoft },
});
