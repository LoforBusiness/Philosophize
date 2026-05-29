import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ALL_PHILOSOPHERS } from '@/data/philosophers';

const Paper = '#FAFAF7';
const Ink = '#1A1A1A';
const InkSoft = '#6B6B6B';
const InkFaint = '#E8E8E3';

export default function PhilosophersScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Thinkers</Text>
        <Text style={styles.subtitle}>Twenty minds worth meeting.</Text>

        <View style={styles.divider} />

        <View style={styles.grid}>
          {ALL_PHILOSOPHERS.map((p) => (
            <Pressable
              key={p.id}
              onPress={() => router.push(`/(app)/philosophers/${p.id}`)}
              style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed,
              ]}
            >
              <Text style={styles.symbol}>{p.symbol}</Text>
              <Text style={styles.name} numberOfLines={2}>
                {p.name}
              </Text>
              <Text style={styles.lifespan}>{p.lifespan}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Paper },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  title: {
    fontFamily: 'Caveat_700Bold',
    fontSize: 44,
    color: Ink,
    paddingTop: 12,
    lineHeight: 50,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: InkSoft,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: InkFaint,
    marginTop: 16,
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    width: '47%',
    flexGrow: 1,
    borderWidth: 2,
    borderColor: Ink,
    borderRadius: 14,
    backgroundColor: Paper,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  cardPressed: { backgroundColor: '#F0EFEA' },
  symbol: { fontSize: 32, marginBottom: 8 },
  name: {
    fontFamily: 'Caveat_700Bold',
    fontSize: 22,
    color: Ink,
    textAlign: 'center',
    lineHeight: 24,
  },
  lifespan: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: InkSoft,
    marginTop: 4,
  },
});
