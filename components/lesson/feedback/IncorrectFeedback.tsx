import { View, Text, Pressable } from 'react-native';
import { MotiView } from 'moti';
import { T } from '../theme';

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
        backgroundColor: T.redBg,
        borderTopWidth: 1.5,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderColor: T.red,
        padding: 24,
        paddingBottom: 40,
      }}
    >
      <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 18, color: T.red, marginBottom: 10 }}>✕ Not quite</Text>
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
