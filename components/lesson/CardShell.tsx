import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SketchIcon from '@/components/shared/SketchIcon';
import LessonBackground from './LessonBackground';
import { sceneForVariant } from './inkScenes';
import { T } from './theme';

interface Props {
  cardCount: number;
  currentIndex: number;
  label: string;
  onExit: () => void;
  bgVariant?: number;
  children: React.ReactNode;
}

// Reading-shell: a close button and a segmented progress bar over a full-bleed
// illustrated ink scene; the lesson's words float on top. The chrome flips to
// white on the dark (night-sky) scenes.
export default function CardShell({ cardCount, currentIndex, label, onExit, bgVariant = 0, children }: Props) {
  const dark = sceneForVariant(bgVariant).meta.mode === 'dark';
  const c = dark
    ? {
        icon: '#F4F3EE',
        border: 'rgba(244,243,238,0.45)',
        label: 'rgba(244,243,238,0.75)',
        count: 'rgba(244,243,238,0.5)',
        segOn: '#F4F3EE',
        segOff: 'rgba(244,243,238,0.22)',
      }
    : {
        icon: T.inkSoft,
        border: T.border,
        label: T.inkSoft,
        count: T.dim,
        segOn: T.ink,
        segOff: T.segOff,
      };

  return (
    <View style={[styles.root, { backgroundColor: dark ? '#0E0E0E' : T.bg }]}>
      <LessonBackground variant={bgVariant} />
      <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.bar}>
        <Pressable onPress={onExit} style={[styles.xBtn, { borderColor: c.border }]} hitSlop={8}>
          <SketchIcon name="close" size={16} color={c.icon} />
        </Pressable>

        <View style={styles.center}>
          <View style={styles.barTopRow}>
            <Text style={[styles.label, { color: c.label }]} numberOfLines={1}>
              {label}
            </Text>
            <Text style={[styles.count, { color: c.count }]}>
              {Math.min(currentIndex + 1, cardCount)}/{cardCount}
            </Text>
          </View>
          <View style={styles.segs}>
            {Array.from({ length: cardCount }).map((_, i) => (
              <View key={i} style={[styles.seg, { backgroundColor: i <= currentIndex ? c.segOn : c.segOff }]} />
            ))}
          </View>
        </View>
      </View>

      <View style={{ flex: 1 }}>{children}</View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1, backgroundColor: 'transparent' },
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: { flex: 1 },
  barTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  label: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 9, letterSpacing: 1.5 },
  count: { fontFamily: 'Inter_500Medium', fontSize: 9, letterSpacing: 1, marginLeft: 8 },
  segs: { flexDirection: 'row', gap: 3 },
  seg: { flex: 1, height: 3, borderRadius: 2 },
});
