import { View, Text, Pressable } from 'react-native';
import { MotiView } from 'moti';
import { useNarrateOnMount } from '../useNarrateOnMount';
import { T } from '../theme';

interface Props {
  explanation: string;
  xpEarned: number;
  onContinue: () => void;
}

export default function CorrectFeedback({ explanation, xpEarned, onContinue }: Props) {
  useNarrateOnMount(`Correct. ${explanation}`);
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
        backgroundColor: T.greenBg,
        borderTopWidth: 1.5,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderColor: T.green,
        padding: 24,
        paddingBottom: 40,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 18, color: T.green, flex: 1 }}>✓ Correct</Text>
        <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 14, color: T.green }}>+{xpEarned} XP</Text>
      </View>
      <Text style={{ fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 15, color: T.cream, lineHeight: 23, marginBottom: 20 }}>
        {explanation}
      </Text>
      <Pressable
        onPress={onContinue}
        style={({ pressed }) => ({ backgroundColor: T.cream, borderRadius: 8, paddingVertical: 15, alignItems: 'center', opacity: pressed ? 0.85 : 1 })}
      >
        <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 13, color: T.ink, letterSpacing: 1 }}>CONTINUE →</Text>
      </Pressable>
    </MotiView>
  );
}
