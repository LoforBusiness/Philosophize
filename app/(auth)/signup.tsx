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
import SketchIcon from '@/components/shared/SketchIcon';
import { Colors } from '@/constants/Colors';
import { signUp } from '@/lib/supabase/auth';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  async function handleSignup() {
    const e = email.trim();
    const u = username.trim();
    if (!e || !password || !u) return;
    // Fail fast on the client (Supabase also enforces its own rules server-side).
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Password too short', 'Use at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await signUp(e, password, u);
    } catch (err: any) {
      Alert.alert('Sign up failed', err.message);
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
            <SketchIcon name="back" size={24} color={Colors.ink} />
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
              Begin Your Journey
            </Text>
            <Text
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 16,
                color: Colors.inkSoft,
                marginBottom: 40,
              }}
            >
              Create your philosopher's profile
            </Text>

            {/* Username input */}
            <Text
              style={{
                fontFamily: 'Inter_500Medium',
                fontSize: 14,
                color: Colors.ink,
                marginBottom: 8,
              }}
            >
              Username
            </Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="Choose a username"
              placeholderTextColor={Colors.inkSoft}
              autoCapitalize="none"
              onFocus={() => setUsernameFocused(true)}
              onBlur={() => setUsernameFocused(false)}
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 16,
                color: Colors.ink,
                borderWidth: 2,
                borderColor: usernameFocused ? Colors.ink : '#E8E8E3',
                borderRadius: 12,
                backgroundColor: '#F5F5F0',
                paddingHorizontal: 16,
                paddingVertical: 16,
                marginBottom: 24,
              }}
            />

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
              placeholder="Min 6 characters"
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

            {/* Start Learning button */}
            <Pressable
              onPress={handleSignup}
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
                {loading ? 'Creating account...' : 'Start Learning'}
              </Text>
            </Pressable>

            {/* Sign in link */}
            <Pressable
              onPress={() => router.push('/(auth)/login')}
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
                Already have an account?{' '}
                <Text style={{ fontFamily: 'Inter_700Bold' }}>Sign in</Text>
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
