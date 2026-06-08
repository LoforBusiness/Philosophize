import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SketchIcon from '@/components/shared/SketchIcon';
import { T } from './theme';

interface Props {
  cardCount: number;
  currentIndex: number;
  label: string;
  onExit: () => void;
  children: React.ReactNode;
}

// Light reading-shell: a close button and a segmented progress bar. No narration
// controls, no XP pill — clean, Blinkist-style.
export default function CardShell({ cardCount, currentIndex, label, onExit, children }: Props) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.bar}>
        <Pressable onPress={onExit} style={styles.xBtn} hitSlop={8}>
          <SketchIcon name="close" size={16} color={T.inkSoft} />
        </Pressable>

        <View style={styles.center}>
          <View style={styles.barTopRow}>
            <Text style={styles.label} numberOfLines={1}>
              {label}
            </Text>
            <Text style={styles.count}>
              {Math.min(currentIndex + 1, cardCount)}/{cardCount}
            </Text>
          </View>
          <View style={styles.segs}>
            {Array.from({ length: cardCount }).map((_, i) => (
              <View key={i} style={[styles.seg, { backgroundColor: i <= currentIndex ? T.ink : T.segOff }]} />
            ))}
          </View>
        </View>
      </View>

      <View style={{ flex: 1 }}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 6,
    paddingBottom: 12,
    gap: 12,
  },
  xBtn: {
    width: 34,
    height: 34,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: T.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: { flex: 1 },
  barTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  label: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 9, color: T.inkSoft, letterSpacing: 1.5 },
  count: { fontFamily: 'Inter_500Medium', fontSize: 9, color: T.dim, letterSpacing: 1, marginLeft: 8 },
  segs: { flexDirection: 'row', gap: 3 },
  seg: { flex: 1, height: 3, borderRadius: 2 },
});
