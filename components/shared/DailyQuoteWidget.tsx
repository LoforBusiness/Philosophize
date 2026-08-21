import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import QuotePlate from '@/components/shared/QuotePlate';
import { useUserDataStore } from '@/stores/userDataStore';
import { useUIStore } from '@/stores/uiStore';
import { getDailyQuote, todayLabel } from '@/lib/dailyQuote';

// Quote of the Day. Toggled on in Settings and placed on the screen the reader
// chooses — Home, Profile or Insights — so it is self-contained: drop it
// anywhere.
//
// It used to draw its own bordered rectangle, one of four in the app that each
// drew a slightly different one. It now shows the shared struck plate
// (components/shared/QuotePlate.tsx), which is what gives it its era colour,
// its lit face and its ledge; the widget's own job is reduced to picking the
// day's quote and wiring the two actions. Tapping opens the thinker.
export default function DailyQuoteWidget({ style }: { style?: StyleProp<ViewStyle> }) {
  const quote = getDailyQuote();
  const openPhilosopher = useUIStore((s) => s.openPhilosopher);
  const toggleQuote = useUserDataStore((s) => s.toggleQuote);
  const saved = useUserDataStore((s) => s.savedQuotes.some((q) => q.id === quote.id));
  const profileQuote = useUserDataStore((s) => s.profileQuote);
  const setProfileQuote = useUserDataStore((s) => s.setProfileQuote);
  const featured = profileQuote?.id === quote.id;

  return (
    <View style={[styles.wrap, style]}>
      <QuotePlate
        text={quote.text}
        author={quote.author}
        philosopherId={quote.philosopherId}
        kicker="QUOTE OF THE DAY"
        kickerRight={todayLabel()}
        onPress={() => openPhilosopher(quote.philosopherId)}
        showChevron
        saved={saved}
        onToggleSave={() => toggleQuote({ ...quote, savedAt: Date.now() })}
        featured={featured}
        onToggleFeature={() =>
          setProfileQuote(
            featured
              ? null
              : {
                  id: quote.id,
                  text: quote.text,
                  author: quote.author,
                  philosopherId: quote.philosopherId,
                }
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%' },
});
