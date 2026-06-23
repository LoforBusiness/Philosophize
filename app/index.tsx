import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  type KeyboardTypeOptions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Svg, { Path, Ellipse, G } from 'react-native-svg';
import SketchIcon, { type SketchIconName } from '@/components/shared/SketchIcon';
import { signIn, signUp } from '@/lib/supabase/auth';

const Page = '#FAFAF7';
const Ink = '#1A1A1A';
const InkSoft = '#6B6B6B';
const InkFaint = '#E8E8E3';
const FieldBg = '#F5F5F0';
const FaceMid = '#E2E0D8';
const Red = '#A83232';

type Mode = 'signin' | 'signup';

// A small line-art laurel wreath; the right branch mirrors the left. Lifted from
// the old landing hero so the auth screen keeps the same classical signature.
function Laurel() {
  const leaves = [
    { x: 38, y: 50, r: -42 },
    { x: 31, y: 41, r: -34 },
    { x: 25, y: 31, r: -26 },
    { x: 21, y: 22, r: -16 },
    { x: 19, y: 13, r: -6 },
  ];
  const Branch = () => (
    <>
      <Path d="M 41 58 C 27 51 18 36 19 13" stroke={Ink} strokeWidth={1.3} fill="none" strokeLinecap="round" />
      {leaves.map((l, i) => (
        <Ellipse
          key={i}
          cx={l.x}
          cy={l.y}
          rx={6}
          ry={3}
          fill={FaceMid}
          stroke={Ink}
          strokeWidth={1}
          transform={`rotate(${l.r} ${l.x} ${l.y})`}
        />
      ))}
    </>
  );
  return (
    <Svg width={84} height={64}>
      <Branch />
      <G transform="translate(84,0) scale(-1,1)">
        <Branch />
      </G>
    </Svg>
  );
}

interface FieldProps {
  label: string;
  icon?: SketchIconName;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  secure?: boolean;
  showPw?: boolean;
  onTogglePw?: () => void;
  fieldKey: string;
  focus: string | null;
  setFocus: (k: string | null) => void;
}

function Field({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize,
  secure,
  showPw,
  onTogglePw,
  fieldKey,
  focus,
  setFocus,
}: FieldProps) {
  const focused = focus === fieldKey;
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputRow, { borderColor: focused ? Ink : InkFaint }]}>
        {icon && (
          <View style={styles.leftIcon}>
            <SketchIcon name={icon} size={18} color={InkSoft} />
          </View>
        )}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={InkSoft}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          secureTextEntry={secure && !showPw}
          onFocus={() => setFocus(fieldKey)}
          onBlur={() => setFocus(null)}
          style={styles.input}
        />
        {secure && (
          <Pressable onPress={onTogglePw} hitSlop={8} style={styles.eye} accessibilityLabel="Toggle password visibility">
            <SketchIcon name="eye" size={18} color={showPw ? Ink : InkSoft} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

// First screen on launch when there's no Supabase session: a combined sign-in /
// create-account form. The X (and the "Continue without an account" link) drop
// the user into the app as a guest — the app is fully usable locally. A
// successful sign-in/sign-up is routed into the app by the auth listener in
// app/_layout.tsx, so this screen never navigates on success itself.
export default function AuthScreen() {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [focus, setFocus] = useState<string | null>(null);

  const isSignup = mode === 'signup';

  function skip() {
    router.replace('/(app)');
  }

  function switchMode() {
    setMode(isSignup ? 'signin' : 'signup');
    setError(null);
    setInfo(null);
  }

  async function handleSubmit() {
    if (loading) return;
    setError(null);
    setInfo(null);
    const e = email.trim();
    const u = username.trim();
    if (!e || !password || (isSignup && !u)) {
      setError('Please fill in all the fields.');
      return;
    }
    if (isSignup) {
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) {
        setError('Please enter a valid email address.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
    }
    setLoading(true);
    try {
      if (isSignup) {
        const data = await signUp(e, password, u);
        // If email confirmation is on, no session is returned — guide them to
        // confirm, then sign in. Otherwise the auth listener routes them in.
        if (!data.session) {
          setInfo(`Almost there — we sent a confirmation link to ${e}. Confirm it, then sign in.`);
          setMode('signin');
          setPassword('');
        }
      } else {
        await signIn(e, password);
        // The SIGNED_IN listener in app/_layout.tsx navigates into the app.
      }
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Skip — continue without an account */}
        <Pressable
          onPress={skip}
          hitSlop={10}
          accessibilityLabel="Continue without an account"
          style={({ pressed }) => [styles.close, pressed && { opacity: 0.6 }]}
        >
          <SketchIcon name="close" size={20} color={Ink} />
        </Pressable>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Masthead */}
          <View style={styles.masthead}>
            <Laurel />
            <Text style={styles.overline}>EST. ANTIQUITY · VOL. I</Text>
            <Text style={styles.wordmark}>PHILOSOPHIZE</Text>
            <Text style={styles.flourish}>◇ ◆ ◇</Text>
            <Text style={styles.tagline}>the art of thinking deeply</Text>
          </View>

          {/* Mode heading */}
          <Text style={styles.heading}>{isSignup ? 'Create your account' : 'Welcome back'}</Text>
          <Text style={styles.subhead}>
            {isSignup
              ? 'Save your streak, XP, and quotes — and carry them across devices.'
              : 'Sign in to pick up right where you left off.'}
          </Text>

          {/* Fields */}
          {isSignup && (
            <Field
              label="USERNAME"
              icon="person"
              value={username}
              onChangeText={setUsername}
              placeholder="Choose a username"
              autoCapitalize="none"
              fieldKey="username"
              focus={focus}
              setFocus={setFocus}
            />
          )}
          <Field
            label="EMAIL"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            fieldKey="email"
            focus={focus}
            setFocus={setFocus}
          />
          <Field
            label="PASSWORD"
            value={password}
            onChangeText={setPassword}
            placeholder={isSignup ? 'Min 6 characters' : '••••••••'}
            secure
            showPw={showPw}
            onTogglePw={() => setShowPw((v) => !v)}
            fieldKey="password"
            focus={focus}
            setFocus={setFocus}
          />

          {/* Error / info */}
          {error && (
            <View style={styles.msgRow}>
              <SketchIcon name="warning" size={16} color={Red} />
              <Text style={[styles.msg, { color: Red }]}>{error}</Text>
            </View>
          )}
          {info && (
            <View style={styles.msgRow}>
              <SketchIcon name="check" size={16} color={Ink} />
              <Text style={[styles.msg, { color: Ink }]}>{info}</Text>
            </View>
          )}

          {/* Submit */}
          <Pressable
            onPress={handleSubmit}
            disabled={loading}
            style={({ pressed }) => [styles.submit, (pressed || loading) && { opacity: 0.7 }]}
          >
            <Text style={styles.submitText}>
              {loading
                ? isSignup
                  ? 'Creating account…'
                  : 'Signing in…'
                : isSignup
                  ? 'Create Account'
                  : 'Sign In'}
            </Text>
          </Pressable>

          {/* Mode toggle */}
          <Pressable onPress={switchMode} hitSlop={6} style={styles.toggle}>
            <Text style={styles.toggleText}>
              {isSignup ? 'Already have an account? ' : 'New here? '}
              <Text style={styles.toggleStrong}>{isSignup ? 'Sign in' : 'Create one'}</Text>
            </Text>
          </Pressable>

          {/* Guest */}
          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.or}>or</Text>
            <View style={styles.line} />
          </View>
          <Pressable onPress={skip} hitSlop={8} style={styles.guest}>
            <Text style={styles.guestText}>Continue without an account</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Page },
  close: {
    position: 'absolute',
    top: 6,
    right: 16,
    zIndex: 10,
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: InkFaint,
    backgroundColor: Page,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 40, paddingBottom: 32 },

  masthead: { alignItems: 'center', marginBottom: 14 },
  overline: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10.5,
    letterSpacing: 2,
    color: InkSoft,
    marginTop: 6,
  },
  wordmark: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 30,
    letterSpacing: 1,
    color: Ink,
    marginTop: 6,
  },
  flourish: { fontFamily: 'Inter_400Regular', fontSize: 12, color: InkSoft, marginTop: 8, letterSpacing: 4 },
  tagline: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontStyle: 'italic',
    fontSize: 13,
    color: InkSoft,
    marginTop: 8,
  },

  heading: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 23,
    color: Ink,
    marginTop: 24,
    marginBottom: 6,
  },
  subhead: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13.5,
    lineHeight: 20,
    color: InkSoft,
    marginBottom: 22,
  },

  fieldWrap: { marginBottom: 16 },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    letterSpacing: 1,
    color: InkSoft,
    marginBottom: 7,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    backgroundColor: FieldBg,
    paddingHorizontal: 14,
  },
  leftIcon: { marginRight: 10 },
  input: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: Ink,
    paddingVertical: 15,
    // RN-web focus outline is redundant with our border treatment.
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null),
  },
  eye: { paddingVertical: 4, paddingLeft: 10 },

  msgRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 2, marginBottom: 6, paddingHorizontal: 2 },
  msg: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 18 },

  submit: {
    backgroundColor: Ink,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    marginTop: 8,
  },
  submitText: { fontFamily: 'Inter_700Bold', fontSize: 16.5, color: Page, letterSpacing: 0.3 },

  toggle: { alignItems: 'center', marginTop: 18 },
  toggleText: { fontFamily: 'Inter_400Regular', fontSize: 14.5, color: InkSoft },
  toggleStrong: { fontFamily: 'Inter_700Bold', color: Ink },

  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 24 },
  line: { flex: 1, height: 1, backgroundColor: InkFaint },
  or: { fontFamily: 'Inter_400Regular', fontSize: 12, color: InkSoft },

  guest: { alignItems: 'center', marginTop: 16, paddingVertical: 6 },
  guestText: { fontFamily: 'Inter_500Medium', fontSize: 14, color: InkSoft, textDecorationLine: 'underline' },
});
