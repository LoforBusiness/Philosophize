import { View, Text, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import SketchIcon from '@/components/shared/SketchIcon';
import { useUserDataStore } from '@/stores/userDataStore';
import { useUIStore } from '@/stores/uiStore';
import { getDailyQuote, todayLabel } from '@/lib/dailyQuote';

const Paper = '#FFFFFF';
const Ink = '#1A1A1A';
const InkSoft = '#6B6B6B';
const InkFaint = '#E2E0D8';

// A compact, hand-drawn black-&-white card that shows one new philosophical
// quote each day. Toggled on in Settings → Notifications and placed on the
// screen the user chooses. Tap the quote to open the philosopher; bookmark to
// save it. Self-contained — drop it anywhere.
export default function DailyQuoteWidget({ style }: { style?: StyleProp<ViewStyle> }) {
  const quote = getDailyQuote();
  const openPhilosopher = useUIStore((s) => s.openPhilosopher);
  const toggleQuote = useUserDataStore((s) => s.toggleQuote);
  const saved = useUserDataStore((s) => s.savedQuotes.some((q) => q.id === quote.id));

  const open = () => openPhilosopher(quote.philosopherId);

  return (
    <View style={[styles.wrap, style]}>
      <View style={styles.card}>
        <View style={styles.head}>
          <View style={styles.headLeft}>
            <SketchIcon name="spark" size={13} color={Ink} />
            <Text style={styles.kicker}>QUOTE OF THE DAY</Text>
          </View>
          <Text style={styles.date}>{todayLabel()}</Text>
        </View>
        <View style={styles.divider} />

        <Pressable onPress={open}>
          <Text style={styles.quote}>{`“${quote.text}”`}</Text>
        </Pressable>

        <View style={styles.footer}>
          <Pressable style={{ flex: 1 }} onPress={open}>
            <Text style={styles.author} numberOfLines={1}>— {quote.author.toUpperCase()}</Text>
          </Pressable>
          <Pressable hitSlop={10} onPress={() => toggleQuote({ ...quote, savedAt: Date.now() })}>
            <SketchIcon name={saved ? 'bookmark-filled' : 'bookmark'} size={16} color={saved ? Ink : InkSoft} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%' },
  card: {
    borderWidth: 1.5,
    borderColor: Ink,
    borderRadius: 4,
    backgroundColor: Paper,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 0,
    shadowOffset: { width: 2, height: 3 },
    elevation: 2,
  },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headLeft: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  kicker: { fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.5, color: Ink },
  date: { fontFamily: 'Inter_500Medium', fontSize: 9, letterSpacing: 1, color: InkSoft },
  divider: { height: 1, backgroundColor: InkFaint, marginTop: 10, marginBottom: 12 },
  quote: { fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 16, lineHeight: 24, color: Ink },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 14 },
  author: { fontFamily: 'Inter_500Medium', fontSize: 11, letterSpacing: 1.5, color: InkSoft },
});
