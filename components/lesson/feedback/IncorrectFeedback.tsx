import { View, Text, Pressable } from 'react-native';
import { MotiView } from 'moti';
import { Colors } from '@/constants/Colors';

interface Props {
  explanation: string;
  onContinue: () => void;
}

export default function IncorrectFeedback({ explanation, onContinue }: Props) {
  return (
    <MotiView
      from={{ translateY: 120, opacity: 0 }}
      animate={{ translateY: 0, opacity: 1 }}
      transition={{ type: 'spring', damping: 20, stiffness: 200 }}
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: Colors.crimson,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
      }}
    >
      <View className="flex-row items-center gap-3 mb-3">
        <Text className="text-3xl">❌</Text>
        <Text style={{ fontFamily: 'Inter_700Bold' }} className="text-white text-lg">
          Not quite.
        </Text>
      </View>
      <Text style={{ fontFamily: 'Inter_400Regular' }} className="text-white text-base leading-6 mb-5">
        {explanation}
      </Text>
      <Pressable
        onPress={onContinue}
        className="bg-white rounded-2xl py-4 items-center active:opacity-80"
      >
        <Text style={{ fontFamily: 'Inter_700Bold' }} className="text-crimson text-lg">
          Got It →
        </Text>
      </Pressable>
    </MotiView>
  );
}
