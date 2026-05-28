import { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { signIn } from '@/lib/supabase/auth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) return;
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (e: any) {
      Alert.alert('Login failed', e.message);
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
          Welcome Back
        </Text>
        <Text
          style={{ fontFamily: 'Inter_400Regular' }}
          className="text-gray-300 text-base mb-10"
        >
          Continue your philosophy journey
        </Text>

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
          placeholder="Password"
          placeholderTextColor={Colors.gray500}
          secureTextEntry
          className="bg-navy-light text-parchment w-full rounded-xl px-4 py-4 mb-8 text-base"
          style={{ fontFamily: 'Inter_400Regular' }}
        />

        <Pressable
          onPress={handleLogin}
          disabled={loading}
          className="bg-gold w-full py-4 rounded-2xl items-center mb-4 active:opacity-80"
        >
          <Text style={{ fontFamily: 'Inter_700Bold' }} className="text-midnight text-lg">
            {loading ? 'Signing in...' : 'Sign In'}
          </Text>
        </Pressable>

        <Pressable onPress={() => router.back()} className="py-2">
          <Text style={{ fontFamily: 'Inter_400Regular' }} className="text-gray-300 text-base">
            Don't have an account?{' '}
            <Text className="text-gold">Sign up</Text>
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
