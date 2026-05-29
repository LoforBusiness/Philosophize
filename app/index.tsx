import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';

export default function LandingScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.paper }}>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 32,
        }}
      >
        {/* Infinity symbol */}
        <Text
          style={{
            fontSize: 72,
            color: Colors.ink,
            marginBottom: 8,
            lineHeight: 84,
          }}
        >
          ∞
        </Text>

        {/* App name */}
        <Text
          style={{
            fontFamily: 'Caveat_700Bold',
            fontSize: 52,
            color: Colors.ink,
            textAlign: 'center',
            marginBottom: 16,
          }}
        >
          Philosophize
        </Text>

        {/* Tagline */}
        <Text
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 16,
            color: Colors.inkSoft,
            textAlign: 'center',
            lineHeight: 24,
            marginBottom: 64,
          }}
        >
          Philosophy doesn't have to be hard.{'\n'}
          Learn to think better — 5 minutes at a time.
        </Text>

        {/* Get Started button */}
        <Pressable
          onPress={() => router.push('/(auth)/signup')}
          style={({ pressed }) => ({
            backgroundColor: Colors.ink,
            borderRadius: 14,
            paddingVertical: 18,
            width: '100%',
            alignItems: 'center',
            marginBottom: 16,
            opacity: pressed ? 0.75 : 1,
          })}
        >
          <Text
            style={{
              fontFamily: 'Inter_700Bold',
              fontSize: 18,
              color: Colors.paper,
            }}
          >
            Get Started
          </Text>
        </Pressable>

        {/* Sign In button */}
        <Pressable
          onPress={() => router.push('/(auth)/login')}
          style={({ pressed }) => ({
            borderWidth: 2,
            borderColor: Colors.ink,
            borderRadius: 14,
            paddingVertical: 18,
            width: '100%',
            alignItems: 'center',
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <Text
            style={{
              fontFamily: 'Inter_500Medium',
              fontSize: 18,
              color: Colors.ink,
            }}
          >
            Sign In
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
