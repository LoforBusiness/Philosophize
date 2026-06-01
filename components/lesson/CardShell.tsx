import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SketchIcon from '@/components/shared/SketchIcon';
import { useNarration } from './NarrationContext';
import { T } from './theme';

interface Props {
  progress: number;
  cardCount: number;
  currentIndex: number;
  label: string;
  xp: number;
  onExit: () => void;
  children: React.ReactNode;
}

export default function CardShell({ cardCount, currentIndex, label, xp, onExit, children }: Props) {
  const { enabled, setEnabled, replay } = useNarration();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top bar */}
      <View style={styles.bar}>
        <Pressable onPress={onExit} style={styles.xBtn} hitSlop={8}>
          <SketchIcon name="close" size={16} color={T.creamSoft} />
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
              <View key={i} style={[styles.seg, { backgroundColor: i <= currentIndex ? T.cream : '#3A382F' }]} />
            ))}
          </View>
        </View>

        {/* Narration controls */}
        {enabled && (
          <Pressable onPress={replay} style={styles.ctrl} hitSlop={8}>
            <SketchIcon name="reload" size={15} color={T.creamSoft} />
          </Pressable>
        )}
        <Pressable onPress={() => setEnabled(!enabled)} style={styles.ctrl} hitSlop={8}>
          <SketchIcon name={enabled ? 'volume-on' : 'volume-off'} size={16} color={enabled ? T.cream : T.dim} />
        </Pressable>

        <View style={styles.xpPill}>
          <Text style={styles.xpStar}>★</Text>
          <Text style={styles.xpText}>+{xp} XP</Text>
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
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 12,
    gap: 8,
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
  label: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 9, color: T.creamSoft, letterSpacing: 1.5 },
  count: { fontFamily: 'Inter_500Medium', fontSize: 9, color: T.dim, letterSpacing: 1, marginLeft: 8 },
  segs: { flexDirection: 'row', gap: 3 },
  seg: { flex: 1, height: 3, borderRadius: 2 },
  ctrl: { padding: 3 },
  xpPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1.5,
    borderColor: T.border,
    borderRadius: 5,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },
  xpStar: { fontSize: 11, color: T.gold },
  xpText: { fontFamily: 'Inter_700Bold', fontSize: 11, color: T.cream, letterSpacing: 0.5 },
});
