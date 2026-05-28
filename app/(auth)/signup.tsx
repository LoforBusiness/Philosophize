import { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { signUp } from '@/lib/supabase/auth';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    if (!email || !password || !username) return;
    setLoading(true);
    try {
      await signUp(email, password, username);
    } catch (e: any) {
      Alert.alert('Sign up failed', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient colors={[Colors.midnight, Colors.navy]} className="flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 items-center justify-center px-8"
      >
        <Text
          style={{ fontFamily: 'PlayfairDisplay_700Bold' }}
          className="text-parchment text-3xl mb-2"
        >
          Begin Your Journey
        </Text>
        <Text
          style={{ fontFamily: 'Inter_400Regular' }}
          className="text-gray-300 text-base mb-10"
        >
          Create your philosopher's profile
        </Text>

        <TextInput
          value={username}
          onChangeText={setUsername}
          placeholder="Choose a username"
          placeholderTextColor={Colors.gray500}
          autoCapitalize="none"
          className="bg-navy-light text-parchment w-full rounded-xl px-4 py-4 mb-4 text-base"
          style={{ fontFamily: 'Inter_400Regular' }}
        />
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor={Colors.gray500}
          keyboardType="email-address"
          autoCapitalize="none"
          className="bg-navy-light text-parchment w-full rounded-xl px-4 py-4 mb-4 text-base"
          style={{ fontFamily: 'Inter_400Regular' }}
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password (min 6 characters)"
          placeholderTextColor={Colors.gray500}
          secureTextEntry
          className="bg-navy-light text-parchment w-full rounded-xl px-4 py-4 mb-8 text-base"
          style={{ fontFamily: 'Inter_400Regular' }}
        />

        <Pressable
          onPress={handleSignup}
          disabled={loading}
          className="bg-gold w-full py-4 rounded-2xl items-center mb-4 active:opacity-80"
        >
          <Text style={{ fontFamily: 'Inter_700Bold' }} className="text-midnight text-lg">
            {loading ? 'Creating account...' : 'Start Learning'}
          </Text>
        </Pressable>

        <Pressable onPress={() => router.push('/(auth)/login')} className="py-2">
          <Text style={{ fontFamily: 'Inter_400Regular' }} className="text-gray-300 text-base">
            Already have an account?{' '}
            <Text className="text-gold">Sign in</Text>
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
