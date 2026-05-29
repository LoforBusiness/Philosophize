import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  progress: number;
  cardCount: number;
  currentIndex: number;
  onExit: () => void;
  children: React.ReactNode;
}

export default function CardShell({ cardCount, currentIndex, onExit, children }: Props) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAF7' }}>
      {/* Progress bar + exit */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 12,
          gap: 10,
        }}
      >
        <Pressable onPress={onExit} style={{ padding: 4, opacity: 1 }} hitSlop={8}>
          <Ionicons name="close" size={22} color="#6B6B6B" />
        </Pressable>

        <View style={{ flex: 1, flexDirection: 'row', gap: 3 }}>
          {Array.from({ length: cardCount }).map((_, i) => (
            <View
              key={i}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                backgroundColor: i <= currentIndex ? '#1A1A1A' : '#E8E8E3',
              }}
            />
          ))}
        </View>
      </View>

      {/* Card content */}
      <View style={{ flex: 1, backgroundColor: '#FAFAF7' }}>{children}</View>
    </SafeAreaView>
  );
}
