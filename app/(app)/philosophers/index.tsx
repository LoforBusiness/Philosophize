import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ALL_PHILOSOPHERS, getPhilosopherById } from '@/data/philosophers';
import { useUserDataStore } from '@/stores/userDataStore';
import { useUIStore } from '@/stores/uiStore';

const Paper = '#FAFAF7';
const Ink = '#1A1A1A';
const InkSoft = '#6B6B6B';
const InkFaint = '#E8E8E3';

export default function PhilosophersScreen() {
  const beliefResultId = useUserDataStore((s) => s.beliefResultId);
  const beliefPhil = beliefResultId ? getPhilosopherById(beliefResultId) : null;
  const openPhilosopher = useUIStore((s) => s.openPhilosopher);

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

        {/* Belief quiz entry */}
        <Pressable
          onPress={() => router.push('/(app)/philosophers/quiz')}
          style={({ pressed }) => [styles.quizCard, pressed && { backgroundColor: '#262626' }]}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.quizTitle}>What would you believe?</Text>
            <Text style={styles.quizSub}>
              {beliefPhil
                ? `You think most like ${beliefPhil.name} · tap to retake`
                : 'Answer 8 questions, meet your closest thinker'}
            </Text>
          </View>
          <Text style={styles.quizArrow}>→</Text>
        </Pressable>

        <View style={styles.grid}>
          {ALL_PHILOSOPHERS.map((p) => (
            <Pressable
              key={p.id}
              onPress={() => openPhilosopher(p.id)}
              style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed,
              ]}
            >
              <View style={styles.letterCircle}>
                <Text style={styles.letter}>{p.name.charAt(0)}</Text>
              </View>
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
  quizCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Ink,
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    gap: 12,
  },
  quizTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 22,
    color: Paper,
    marginBottom: 4,
  },
  quizSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#C9C9C2',
  },
  quizArrow: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    color: Paper,
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
  letterCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: Ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  letter: {
    fontFamily: 'Caveat_700Bold',
    fontSize: 34,
    color: Ink,
    lineHeight: 40,
  },
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
