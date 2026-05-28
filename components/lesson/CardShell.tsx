import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

interface Props {
  progress: number;
  cardCount: number;
  currentIndex: number;
  onExit: () => void;
  children: React.ReactNode;
}

export default function CardShell({ cardCount, currentIndex, onExit, children }: Props) {
  return (
    <SafeAreaView className="flex-1 bg-midnight">
      {/* Progress bar + exit */}
      <View className="flex-row items-center gap-2 px-4 pt-2 pb-4">
        <Pressable onPress={onExit} className="p-1 active:opacity-60">
          <Ionicons name="close" size={24} color={Colors.gray500} />
        </Pressable>
        <View className="flex-1 flex-row gap-1">
          {Array.from({ length: cardCount }).map((_, i) => (
            <View
              key={i}
              className="h-1.5 rounded-full flex-1"
              style={{
                backgroundColor: i <= currentIndex ? Colors.gold : Colors.navyLight,
              }}
            />
          ))}
        </View>
      </View>

      {/* Card content */}
      <View className="flex-1">{children}</View>
    </SafeAreaView>
  );
}
