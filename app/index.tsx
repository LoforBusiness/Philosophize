import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';

export default function LandingScreen() {
  return (
    <LinearGradient
      colors={[Colors.midnight, Colors.navy]}
      className="flex-1 items-center justify-center px-8"
    >
      <Text className="text-gold text-6xl mb-4">∞</Text>
      <Text
        style={{ fontFamily: 'PlayfairDisplay_700Bold' }}
        className="text-parchment text-4xl text-center mb-3"
      >
        Philosophize
      </Text>
      <Text
        style={{ fontFamily: 'Inter_400Regular' }}
        className="text-gray-300 text-lg text-center mb-16 leading-7"
      >
        Philosophy doesn't have to be hard.{'\n'}
        Learn to think better — 5 minutes at a time.
      </Text>

      <Pressable
        onPress={() => router.push('/(auth)/signup')}
        className="bg-gold w-full py-4 rounded-2xl items-center mb-4 active:opacity-80"
      >
        <Text
          style={{ fontFamily: 'Inter_700Bold' }}
          className="text-midnight text-lg"
        >
          Get Started
        </Text>
      </Pressable>

      <Pressable
        onPress={() => router.push('/(auth)/login')}
        className="border border-gold w-full py-4 rounded-2xl items-center active:opacity-80"
      >
        <Text
          style={{ fontFamily: 'Inter_500Medium' }}
          className="text-gold text-lg"
        >
          I already have an account
        </Text>
      </Pressable>
    </LinearGradient>
  );
}
