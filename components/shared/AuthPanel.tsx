import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Linking,
  type KeyboardTypeOptions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Svg, { Path, Ellipse, G } from 'react-native-svg';
import SketchIcon, { type SketchIconName } from '@/components/shared/SketchIcon';
import { signIn, signUp } from '@/lib/supabase/auth';
import {
  socialAuthAvailable,
  isAppleSignInAvailable,
  signInWithApple,
  signInWithGoogle,
} from '@/lib/auth/social';
import { TERMS_URL, PRIVACY_URL } from '@/constants/legal';

const Page = '#FAFAF7';
const Ink = '#1A1A1A';
const InkSoft = '#6B6B6B';
const InkFaint = '#E8E8E3';
const FieldBg = '#F5F5F0';
const FaceMid = '#E2E0D8';
const Red = '#A83232';

type Mode = 'signin' | 'signup';
type Step = 'email' | 'credentials';

const emailValid = (e: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e.trim());

// --- Brand + provider marks --------------------------------------------------

// A small line-art laurel wreath; the right branch mirrors the left.
function Laurel() {
  const leaves = [
    { x: 38, y: 50, r: -42 }, { x: 31, y: 41, r: -34 }, { x: 25, y: 31, r: -26 },
    { x: 21, y: 22, r: -16 }, { x: 19, y: 13, r: -6 },
  ];
  const Branch = () => (
    <>
      <Path d="M 41 58 C 27 51 18 36 19 13" stroke={Ink} strokeWidth={1.3} fill="none" strokeLinecap="round" />
      {leaves.map((l, i) => (
        <Ellipse key={i} cx={l.x} cy={l.y} rx={6} ry={3} fill={FaceMid} stroke={Ink} strokeWidth={1}
          transform={`rotate(${l.r} ${l.x} ${l.y})`} />
      ))}
    </>
  );
  return (
    <Svg width={72} height={56} viewBox="0 0 84 64">
      <Branch />
      <G transform="translate(84,0) scale(-1,1)"><Branch /></G>
    </Svg>
  );
}

function AppleGlyph({ color = '#FAFAF7', size = 17 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size * (512 / 384)} viewBox="0 0 384 512">
      <Path
        fill={color}
        d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"
      />
    </Svg>
  );
}

function GoogleGlyph({ size = 17 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <Path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
      <Path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <Path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </Svg>
  );
}

// --- Inputs ------------------------------------------------------------------

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
  autoFocus?: boolean;
  fieldKey: string;
  focus: string | null;
  setFocus: (k: string | null) => void;
  onSubmitEditing?: () => void;
}

function Field({
  label, icon, value, onChangeText, placeholder, keyboardType, autoCapitalize,
  secure, showPw, onTogglePw, autoFocus, fieldKey, focus, setFocus, onSubmitEditing,
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
          autoFocus={autoFocus}
          secureTextEntry={secure && !showPw}
          onFocus={() => setFocus(fieldKey)}
          onBlur={() => setFocus(null)}
          onSubmitEditing={onSubmitEditing}
          returnKeyType="go"
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

// --- Social buttons ----------------------------------------------------------

function GoogleButton({ onPress, busy }: { onPress: () => void; busy: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={busy} style={({ pressed }) => [styles.social, styles.socialLight, pressed && { opacity: 0.85 }]}>
      {busy ? <ActivityIndicator color={Ink} /> : (
        <>
          <GoogleGlyph />
          <Text style={[styles.socialText, { color: Ink }]}>Continue with Google</Text>
        </>
      )}
    </Pressable>
  );
}

function AppleButton({ onPress, busy }: { onPress: () => void; busy: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={busy} style={({ pressed }) => [styles.social, styles.socialDark, pressed && { opacity: 0.85 }]}>
      {busy ? <ActivityIndicator color={Page} /> : (
        <>
          <AppleGlyph />
          <Text style={[styles.socialText, { color: Page }]}>Continue with Apple</Text>
        </>
      )}
    </Pressable>
  );
}

// --- Screen ------------------------------------------------------------------

// The first screen on launch when there's no Supabase session, and the in-app
// /sign-in route. A clean B&W login/sign-up: a single email field that advances
// to a password step, plus Continue-with-Google / Continue-with-Apple (native
// only; hidden on web where they can't run) and a guest skip. A successful
// sign-in of any kind is routed into the app by app/_layout.tsx onAuthStateChange.
export default function AuthPanel() {
  const [step, setStep] = useState<Step>('email');
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState<null | 'apple' | 'google'>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [focus, setFocus] = useState<string | null>(null);
  const [appleAvailable, setAppleAvailable] = useState(false);

  const isSignup = mode === 'signup';
  const showSocial = socialAuthAvailable || appleAvailable;

  useEffect(() => {
    isAppleSignInAvailable().then(setAppleAvailable);
  }, []);

  function skip() {
    if (router.canGoBack()) router.back();
    else router.replace('/(app)');
  }

  function continueWithEmail() {
    setError(null);
    if (!emailValid(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setEmail(email.trim());
    setInfo(null);
    setStep('credentials');
  }

  function switchMode() {
    setMode(isSignup ? 'signin' : 'signup');
    setError(null);
    setInfo(null);
  }

  async function submitCredentials() {
    if (loading) return;
    setError(null);
    setInfo(null);
    const e = email.trim();
    const u = username.trim();
    if (!password || (isSignup && !u)) {
      setError('Please fill in all the fields.');
      return;
    }
    if (isSignup && password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      if (isSignup) {
        const data = await signUp(e, password, u);
        if (!data.session) {
          setInfo(`Almost there — we sent a confirmation link to ${e}. Confirm it, then sign in.`);
          setMode('signin');
          setPassword('');
        }
      } else {
        await signIn(e, password);
      }
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSocial(provider: 'apple' | 'google') {
    if (busy) return;
    setError(null);
    setInfo(null);
    setBusy(provider);
    const res = provider === 'apple' ? await signInWithApple() : await signInWithGoogle();
    setBusy(null);
    if (res.status === 'error') setError(res.message ?? 'Sign-in failed. Please try again.');
    // success → onAuthStateChange routes; canceled → silently stay
  }

  const openUrl = (url: string | null) => {
    if (url) Linking.openURL(url).catch(() => {});
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        {/* Top-left back (credentials step) / top-right skip (email step) */}
        {step === 'credentials' ? (
          <Pressable
            onPress={() => { setStep('email'); setError(null); setInfo(null); }}
            hitSlop={10}
            accessibilityLabel="Back"
            style={({ pressed }) => [styles.topBack, pressed && { opacity: 0.6 }]}
          >
            <SketchIcon name="back" size={22} color={Ink} />
          </Pressable>
        ) : (
          <Pressable
            onPress={skip}
            hitSlop={10}
            accessibilityLabel="Continue without an account"
            style={({ pressed }) => [styles.close, pressed && { opacity: 0.6 }]}
          >
            <SketchIcon name="close" size={20} color={Ink} />
          </Pressable>
        )}

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Masthead */}
          <View style={styles.masthead}>
            <Laurel />
            <Text style={styles.wordmark}>PHILOSOPHIZE</Text>
            <Text style={styles.tagline}>the art of thinking deeply</Text>
          </View>

          {step === 'email' ? (
            <>
              <Text style={styles.prompt}>Enter your email to get started</Text>

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
                onSubmitEditing={continueWithEmail}
              />

              {error && <Message tone="error" text={error} />}

              <Pressable onPress={continueWithEmail} style={({ pressed }) => [styles.primary, pressed && { opacity: 0.85 }]}>
                <Text style={styles.primaryText}>Continue with Email</Text>
              </Pressable>

              {/* Choose intent up front so new users aren't dropped into a "Welcome
                  back" password screen with no way to create an account. */}
              <Pressable onPress={switchMode} hitSlop={6} style={styles.toggleTight}>
                <Text style={styles.toggleText}>
                  {isSignup ? 'Already have an account? ' : 'New here? '}
                  <Text style={styles.toggleStrong}>{isSignup ? 'Sign in' : 'Create an account'}</Text>
                </Text>
              </Pressable>

              {showSocial && (
                <>
                  <View style={styles.divider}>
                    <View style={styles.line} />
                    <Text style={styles.or}>OR</Text>
                    <View style={styles.line} />
                  </View>
                  {socialAuthAvailable && <GoogleButton onPress={() => handleSocial('google')} busy={busy === 'google'} />}
                  {appleAvailable && <AppleButton onPress={() => handleSocial('apple')} busy={busy === 'apple'} />}
                </>
              )}

              <Pressable onPress={skip} hitSlop={8} style={styles.guest}>
                <Text style={styles.guestText}>Continue without an account</Text>
              </Pressable>

              <Text style={styles.terms}>
                By continuing, you agree to our{' '}
                {TERMS_URL ? (
                  <>
                    <Text style={styles.termsLink} onPress={() => openUrl(TERMS_URL)}>Terms</Text>
                    {' '}and{' '}
                  </>
                ) : null}
                <Text style={styles.termsLink} onPress={() => openUrl(PRIVACY_URL)}>Privacy Policy</Text>.
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.heading}>{isSignup ? 'Create your account' : 'Welcome back'}</Text>
              <Text style={styles.prompt}>{email.trim()}</Text>

              {isSignup && (
                <Field
                  label="USERNAME"
                  icon="person"
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Choose a username"
                  autoCapitalize="none"
                  autoFocus
                  fieldKey="username"
                  focus={focus}
                  setFocus={setFocus}
                />
              )}

              <Field
                label="PASSWORD"
                value={password}
                onChangeText={setPassword}
                placeholder={isSignup ? 'Min 6 characters' : '••••••••'}
                secure
                showPw={showPw}
                onTogglePw={() => setShowPw((v) => !v)}
                autoFocus={!isSignup}
                fieldKey="password"
                focus={focus}
                setFocus={setFocus}
                onSubmitEditing={submitCredentials}
              />

              {error && <Message tone="error" text={error} />}
              {info && <Message tone="info" text={info} />}

              <Pressable onPress={submitCredentials} disabled={loading} style={({ pressed }) => [styles.primary, (pressed || loading) && { opacity: 0.7 }]}>
                <Text style={styles.primaryText}>
                  {loading ? (isSignup ? 'Creating account…' : 'Signing in…') : isSignup ? 'Create Account' : 'Sign In'}
                </Text>
              </Pressable>

              <Pressable onPress={switchMode} hitSlop={6} style={styles.toggle}>
                <Text style={styles.toggleText}>
                  {isSignup ? 'Already have an account? ' : 'New here? '}
                  <Text style={styles.toggleStrong}>{isSignup ? 'Sign in' : 'Create one'}</Text>
                </Text>
              </Pressable>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Message({ tone, text }: { tone: 'error' | 'info'; text: string }) {
  const color = tone === 'error' ? Red : Ink;
  return (
    <View style={styles.msgRow}>
      <SketchIcon name={tone === 'error' ? 'warning' : 'check'} size={16} color={color} />
      <Text style={[styles.msg, { color }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Page },
  close: {
    position: 'absolute', top: 6, right: 16, zIndex: 10,
    width: 38, height: 38, borderRadius: 19, borderWidth: 1.5, borderColor: InkFaint,
    backgroundColor: Page, alignItems: 'center', justifyContent: 'center',
  },
  topBack: { position: 'absolute', top: 10, left: 14, zIndex: 10, padding: 8 },
  scroll: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 36, paddingBottom: 28, justifyContent: 'center' },

  masthead: { alignItems: 'center', marginBottom: 22 },
  wordmark: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 28, letterSpacing: 1, color: Ink, marginTop: 8 },
  tagline: { fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 13, color: InkSoft, marginTop: 6 },

  heading: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 24, color: Ink, textAlign: 'center', marginBottom: 4 },
  prompt: { fontFamily: 'Inter_400Regular', fontSize: 14, color: InkSoft, textAlign: 'center', marginBottom: 22 },

  fieldWrap: { marginBottom: 14 },
  label: { fontFamily: 'Inter_500Medium', fontSize: 12, letterSpacing: 1, color: InkSoft, marginBottom: 7 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 12,
    backgroundColor: FieldBg, paddingHorizontal: 14,
  },
  leftIcon: { marginRight: 10 },
  input: {
    flex: 1, fontFamily: 'Inter_400Regular', fontSize: 16, color: Ink, paddingVertical: 15,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null),
  },
  eye: { paddingVertical: 4, paddingLeft: 10 },

  msgRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 2, marginBottom: 8, paddingHorizontal: 2 },
  msg: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 18 },

  primary: { backgroundColor: Ink, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 6 },
  primaryText: { fontFamily: 'Inter_700Bold', fontSize: 16, color: Page, letterSpacing: 0.3 },

  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 18 },
  line: { flex: 1, height: 1, backgroundColor: InkFaint },
  or: { fontFamily: 'Inter_500Medium', fontSize: 11, letterSpacing: 1, color: InkSoft },

  social: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    borderRadius: 14, paddingVertical: 15, marginBottom: 12, minHeight: 52,
  },
  socialLight: { backgroundColor: Page, borderWidth: 1.5, borderColor: Ink },
  socialDark: { backgroundColor: Ink },
  socialText: { fontFamily: 'Inter_700Bold', fontSize: 15.5, letterSpacing: 0.2 },

  toggle: { alignItems: 'center', marginTop: 18 },
  toggleTight: { alignItems: 'center', marginTop: 14 },
  toggleText: { fontFamily: 'Inter_400Regular', fontSize: 14.5, color: InkSoft },
  toggleStrong: { fontFamily: 'Inter_700Bold', color: Ink },

  guest: { alignItems: 'center', marginTop: 18, paddingVertical: 6 },
  guestText: { fontFamily: 'Inter_500Medium', fontSize: 14, color: InkSoft, textDecorationLine: 'underline' },

  terms: {
    fontFamily: 'Inter_400Regular', fontSize: 11.5, lineHeight: 17, color: InkSoft,
    textAlign: 'center', marginTop: 22, paddingHorizontal: 8,
  },
  termsLink: { fontFamily: 'Inter_500Medium', color: Ink, textDecorationLine: 'underline' },
});
