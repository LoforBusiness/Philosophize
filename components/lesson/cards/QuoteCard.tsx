import { View, Text, Pressable, StyleSheet } from 'react-native';
import SketchIcon from '@/components/shared/SketchIcon';
import { useUserDataStore } from '@/stores/userDataStore';
import type { QuoteCard as QuoteCardType } from '@/data/types';
import { T } from '../theme';

interface Props {
  card: QuoteCardType;
  branchSlug?: string | null;
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// A reading card built around one philosopher's quote. The quotation sits in
// marks, with the author and the era it was written, plus a Save button that
// bookmarks the quote into the user's collection (same store as everywhere else).
export default function QuoteCard({ card, branchSlug }: Props) {
  const toggleQuote = useUserDataStore((s) => s.toggleQuote);
  const saved = useUserDataStore((s) => s.savedQuotes.some((q) => q.id === card.id));

  const onToggle = () =>
    toggleQuote({
      id: card.id,
      text: card.quote,
      author: card.author,
      philosopherId: card.philosopherId ?? slugify(card.author),
      branchSlugs: branchSlug ? [branchSlug] : [],
      savedAt: Date.now(),
    });

  return (
    <View style={styles.root}>
      <View style={styles.card}>
        <Text style={styles.kicker}>WORTH KEEPING</Text>
        <Text style={styles.mark}>“</Text>
        <Text style={styles.quote}>{card.quote}</Text>

        <View style={styles.rule} />
        <Text style={styles.author}>{card.author}</Text>
        <Text style={styles.meta}>{card.work ? `${card.work} · ${card.era}` : card.era}</Text>

        <Pressable
          onPress={onToggle}
          hitSlop={8}
          style={({ pressed }) => [styles.saveBtn, saved && styles.saveBtnOn, pressed && { opacity: 0.85 }]}
        >
          <SketchIcon name={saved ? 'bookmark-filled' : 'bookmark'} size={17} color={saved ? T.bg : T.ink} />
          <Text style={[styles.saveText, saved && { color: T.bg }]}>{saved ? 'Saved' : 'Save quote'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'center', paddingHorizontal: 22, paddingVertical: 18 },
  card: {
    backgroundColor: T.panel,
    borderWidth: 1.5,
    borderColor: T.ink,
    borderRadius: 26,
    paddingHorizontal: 26,
    paddingTop: 22,
    paddingBottom: 26,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  kicker: { fontFamily: 'Inter_500Medium', fontSize: 10, color: T.gold, letterSpacing: 3 },
  mark: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 56,
    lineHeight: 56,
    color: T.dim,
    marginTop: 2,
    marginBottom: -8,
  },
  quote: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontStyle: 'italic',
    fontSize: 23,
    lineHeight: 34,
    color: T.ink,
  },
  rule: { height: 1, backgroundColor: T.border, marginTop: 20, marginBottom: 14, width: 40 },
  author: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 17, color: T.ink },
  meta: { fontFamily: 'Inter_400Regular', fontSize: 12.5, color: T.inkSoft, marginTop: 3 },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    borderWidth: 1.5,
    borderColor: T.ink,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 22,
    backgroundColor: T.panel,
  },
  saveBtnOn: { backgroundColor: T.ink },
  saveText: { fontFamily: 'Inter_700Bold', fontSize: 13, color: T.ink },
});
