import { View, Text, Pressable } from 'react-native';
import { MotiView } from 'moti';

interface Props {
  explanation: string;
  xpEarned: number;
  onContinue: () => void;
}

export default function CorrectFeedback({ explanation, xpEarned, onContinue }: Props) {
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
        backgroundColor: '#EAF3EE',
        borderTopWidth: 2,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        borderColor: '#3D7A55',
        padding: 24,
        paddingBottom: 40,
      }}
    >
      {/* Header row */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          marginBottom: 8,
        }}
      >
        <Text
          style={{
            fontFamily: 'Caveat_700Bold',
            fontSize: 32,
            color: '#3D7A55',
            lineHeight: 36,
          }}
        >
          ✓
        </Text>
        <Text
          style={{
            fontFamily: 'Inter_700Bold',
            fontSize: 20,
            color: '#1A1A1A',
            flex: 1,
          }}
        >
          Correct!
        </Text>
        <Text
          style={{
            fontFamily: 'Inter_500Medium',
            fontSize: 14,
            color: '#3D7A55',
          }}
        >
          +{xpEarned} XP
        </Text>
      </View>

      {/* Explanation */}
      <Text
        style={{
          fontFamily: 'Inter_400Regular',
          fontSize: 16,
          color: '#1A1A1A',
          lineHeight: 24,
          marginBottom: 20,
        }}
      >
        {explanation}
      </Text>

      {/* Continue button */}
      <Pressable
        onPress={onContinue}
        style={({ pressed }) => ({
          backgroundColor: '#1A1A1A',
          borderRadius: 14,
          paddingVertical: 16,
          alignItems: 'center',
          opacity: pressed ? 0.75 : 1,
        })}
      >
        <Text
          style={{
            fontFamily: 'Inter_700Bold',
            fontSize: 17,
            color: '#FAFAF7',
          }}
        >
          Continue →
        </Text>
      </Pressable>
    </MotiView>
  );
}
