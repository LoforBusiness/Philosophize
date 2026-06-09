import { View, Text, StyleSheet } from 'react-native';
// gesture-handler's ScrollView cooperates with the lesson pager's horizontal
// Pan: vertical scrolls stay here, horizontal swipes go to the pager. The core
// RN ScrollView sits outside the gesture system and made swiping feel "stuck".
import { ScrollView } from 'react-native-gesture-handler';
import { T } from './theme';

interface Props {
  text: string;
  kicker?: string;       // small caps label above the passage
  size?: number;         // body font size
  source?: string;       // optional attribution (example cards)
}

// A single Blinkist-style reading card: a bordered paper card, centred on the
// page, holding a short kicker label and a few lines of text. Fully static —
// no narration, no reveal animation. Navigation is handled by the runner
// (swipe / Back / Next), so this card carries no buttons of its own.
export default function StatementScreen({ text, kicker, size = 23, source }: Props) {
  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {kicker ? <Text style={styles.kicker}>{kicker}</Text> : null}
          <Text style={[styles.body, { fontSize: size, lineHeight: Math.round(size * 1.46) }]}>
            {text}
          </Text>
          {source ? <Text style={styles.source}>— {source}</Text> : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'transparent' },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 22, paddingVertical: 18 },
  card: {
    backgroundColor: T.panel,
    borderWidth: 1.5,
    borderColor: T.ink,
    borderRadius: 26,
    paddingHorizontal: 26,
    paddingVertical: 32,
    // soft rounded-card shadow
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  kicker: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: T.gold,
    letterSpacing: 3,
    marginBottom: 14,
  },
  body: {
    fontFamily: 'PlayfairDisplay_400Regular',
    color: T.ink,
  },
  source: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontStyle: 'italic',
    fontSize: 13,
    color: T.inkSoft,
    marginTop: 16,
  },
});
