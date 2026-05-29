import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { signIn } from '@/lib/supabase/auth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

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
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.paper }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back arrow */}
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({
              padding: 16,
              alignSelf: 'flex-start',
              opacity: pressed ? 0.5 : 1,
            })}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.ink} />
          </Pressable>

          {/* Content */}
          <View style={{ flex: 1, paddingHorizontal: 32, paddingTop: 16, paddingBottom: 32 }}>
            {/* Heading */}
            <Text
              style={{
                fontFamily: 'Caveat_700Bold',
                fontSize: 40,
                color: Colors.ink,
                marginBottom: 8,
              }}
            >
              Welcome Back
            </Text>
            <Text
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 16,
                color: Colors.inkSoft,
                marginBottom: 40,
              }}
            >
              Continue your philosophy journey
            </Text>

            {/* Email input */}
            <Text
              style={{
                fontFamily: 'Inter_500Medium',
                fontSize: 14,
                color: Colors.ink,
                marginBottom: 8,
              }}
            >
              Email
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={Colors.inkSoft}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 16,
                color: Colors.ink,
                borderWidth: 2,
                borderColor: emailFocused ? Colors.ink : '#E8E8E3',
                borderRadius: 12,
                backgroundColor: '#F5F5F0',
                paddingHorizontal: 16,
                paddingVertical: 16,
                marginBottom: 24,
              }}
            />

            {/* Password input */}
            <Text
              style={{
                fontFamily: 'Inter_500Medium',
                fontSize: 14,
                color: Colors.ink,
                marginBottom: 8,
              }}
            >
              Password
            </Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={Colors.inkSoft}
              secureTextEntry
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 16,
                color: Colors.ink,
                borderWidth: 2,
                borderColor: passwordFocused ? Colors.ink : '#E8E8E3',
                borderRadius: 12,
                backgroundColor: '#F5F5F0',
                paddingHorizontal: 16,
                paddingVertical: 16,
                marginBottom: 40,
              }}
            />

            {/* Sign In button */}
            <Pressable
              onPress={handleLogin}
              disabled={loading}
              style={({ pressed }) => ({
                backgroundColor: Colors.ink,
                borderRadius: 14,
                paddingVertical: 18,
                width: '100%',
                alignItems: 'center',
                marginBottom: 24,
                opacity: pressed || loading ? 0.7 : 1,
              })}
            >
              <Text
                style={{
                  fontFamily: 'Inter_700Bold',
                  fontSize: 18,
                  color: Colors.paper,
                }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Text>
            </Pressable>

            {/* Sign up link */}
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => ({
                alignItems: 'center',
                paddingVertical: 8,
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Text
                style={{
                  fontFamily: 'Inter_400Regular',
                  fontSize: 16,
                  color: Colors.ink,
                }}
              >
                Don't have an account?{' '}
                <Text style={{ fontFamily: 'Inter_700Bold' }}>Sign up</Text>
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
