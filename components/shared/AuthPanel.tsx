import { useEffect, useState, type ReactNode } from 'react';
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
  useWindowDimensions,
  type KeyboardTypeOptions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { MotiView } from 'moti';
import { Easing } from 'react-native-reanimated';
import SketchIcon, { type SketchIconName } from '@/components/shared/SketchIcon';
import LaunchFigure from '@/components/launch/LaunchFigure';
import type { LaunchScene } from '@/components/launch/launchScenes';
import { C, RADIUS, LIP } from '@/constants/design';
import { touch } from '@/lib/feedback';
import { signIn, signUp } from '@/lib/supabase/auth';
import {
  socialAuthAvailable,
  isAppleSignInAvailable,
  signInWithApple,
  signInWithGoogle,
} from '@/lib/auth/social';
import { TERMS_URL, PRIVACY_URL } from '@/constants/legal';

// ─────────────────────────────────────────────────────────────────────────────
// THE DOOR, redesigned 2026-09-08 around a reference the reader supplied: a big
// warm headline, one character in the middle of the page, a stack of equal
// "Continue with…" buttons, and an underlined escape hatch at the bottom — the
// shape most consumer onboarding has converged on, translated into this app's
// own materials:
//
//   · the headline is set in Playfair, left-aligned, and speaks in the app's
//     voice — a door, not a slogan;
//   · the character is THE character: the seated coffee-sipper from the launch
//     scenes (and the launcher icon), mounted live off the real rig via
//     LaunchFigure, breathing on his stone. The numbers under MASCOT_SCENE are
//     the shipped `sip` scene's own measured ones — see launchArt's `perch`
//     comment for why the seat's crown is exactly y581;
//   · the buttons are the design system's CHUNK (components/ui/Button.tsx's
//     construction: a HUE slab behind the face, the face drops onto it) — built
//     locally here only because these need a provider glyph where Button takes
//     a SketchIcon name. Same LIP, same RADIUS, same FACE recipe;
//   · email now leads to its own step instead of opening on a form, so the
//     first screen has nothing to fill in — reduce sign-up friction is the one
//     thing every onboarding reference agrees on.
//
// Three steps: landing (choose a door) → email → credentials. All of the auth
// logic is unchanged; a successful sign-in of any kind is routed into the app
// by app/_layout.tsx onAuthStateChange.
// ─────────────────────────────────────────────────────────────────────────────

const Page = '#FAFAF7';
const Ink = '#1A1A1A';
const InkSoft = '#6B6B6B';
const InkFaint = '#E8E8E3';
const FieldBg = '#F5F5F0';
const FaceMid = '#E2E0D8';
const Red = '#A83232';

type Mode = 'signin' | 'signup';
type Step = 'landing' | 'email' | 'credentials';

const emailValid = (e: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e.trim());

// --- The mascot --------------------------------------------------------------

// The `sip` launch scene's own measured placement: x 200 on a crest whose base
// is 604, ground y ≈ 592, figure scale 0.69 — and the stone he sits on with its
// crown at y581, the number launchArt derives from the lowest hip ink of the
// seated pose (581.18–581.72 across the whole idle cycle). Re-deriving any of
// this here would only give it a chance to drift from the pose it fits.
const MASCOT_SCENE: LaunchScene = {
  key: 'sip',
  activity: 'sip',
  x: 200,
  groundY: 592,
  k: 0.69,
  dir: 1,
  crest: { base: 604, amp: 12, off: -60, per: 155 },
  shadow: '#A9A395',
  cast: { dir: 1, len: 0.55 },
};

// The window of the 400×800 stage the panel shows: the figure, his stone, and
// air for the clouds. Cropped-and-scaled the same way LaunchScreen cover-fits
// its stage — one transform, origin at the stage's own 0,0.
//
// WIDE ON PURPOSE. A first cut framed him at 256 units across and the figure
// came out ~170px tall — twice launch size — and at that magnification the
// seated silhouette reads as a lump: the rig's poses are tuned for the ~90px
// the launch scenes draw them at (§19's whole silhouette chapter). 328 units
// puts him back at the size the pose was designed for.
const MASCOT_VIEW = { x: 50, y: 446, w: 300, h: 180 };

function Mascot({ width }: { width: number }) {
  const s = width / MASCOT_VIEW.w;
  return (
    <View
      style={{ width, height: MASCOT_VIEW.h * s, overflow: 'hidden', alignSelf: 'center' }}
      pointerEvents="none"
    >
      <View
        style={{
          position: 'absolute',
          left: -MASCOT_VIEW.x * s,
          top: -MASCOT_VIEW.y * s,
          width: 400,
          height: 800,
          transform: [{ scale: s }],
          transformOrigin: '0% 0%',
        }}
      >
        {/* Soft mid-paper clouds, the reference's own furniture translated into
            this app's quietest tone. Behind everything. */}
        <View style={[styles.cloud, { left: 74, top: 470, width: 56, height: 13 }]} />
        <View style={[styles.cloud, { left: 274, top: 496, width: 44, height: 11 }]} />
        <View style={[styles.cloud, { left: 122, top: 514, width: 30, height: 9 }]} />
        {/* The ground he is on — one ink rule, hand-width, under his feet. */}
        <View style={styles.groundLine} />
        {/* The stone. Flat-topped on purpose: launchArt's perch comment — a
            shoulder makes it a mound to stand beside, a flat top says seat. */}
        <View style={styles.stone} />
        <LaunchFigure scene={MASCOT_SCENE} />
      </View>
    </View>
  );
}

// --- Provider marks ----------------------------------------------------------

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

// --- The chunk, with a glyph slot --------------------------------------------

// components/ui/Button.tsx's construction, restated because these buttons carry
// a provider mark where Button takes a SketchIcon name: a solid HUE slab behind
// the face, offset down by the lip; pressing drops the face onto it. Same LIP,
// same RADIUS, same face recipes as the system's primary/secondary variants, so
// this screen presses like every adopted screen does.
function ChunkButton({
  label, onPress, disabled, dark, leading,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  dark?: boolean;
  leading?: ReactNode;
}) {
  const [down, setDown] = useState(false);
  const lip = disabled ? 0 : LIP.button;
  const drop = down ? lip : 0;
  return (
    <Pressable
      onPress={disabled ? undefined : () => { touch(); onPress(); }}
      onPressIn={() => setDown(true)}
      onPressOut={() => setDown(false)}
      disabled={disabled}
      accessibilityRole="button"
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      <View style={{ paddingBottom: lip }}>
        {lip > 0 && (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute', top: lip, left: 0, right: 0, bottom: 0,
              backgroundColor: C.HUE, borderRadius: RADIUS.button,
            }}
          />
        )}
        <MotiView
          animate={{ translateY: drop }}
          transition={{ type: 'timing', duration: 90, easing: Easing.out(Easing.quad) }}
          style={[styles.chunkFace, dark ? styles.chunkDark : styles.chunkLight]}
        >
          {leading ? <View style={styles.chunkGlyph}>{leading}</View> : null}
          <Text style={[styles.chunkLabel, { color: dark ? Page : Ink }]}>{label}</Text>
        </MotiView>
      </View>
    </Pressable>
  );
}

// --- The entrance ------------------------------------------------------------

// The landing arrives as a cascade — headline, mascot, then each door in turn —
// instead of appearing fully set. One shape, staggered by delay, all timing
// (no springs: the doors are a stack, and a stack that overshoots at four
// different amplitudes reads as jelly).
function Rise({ delay, children }: { delay: number; children: ReactNode }) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 16 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 460, delay, easing: Easing.out(Easing.cubic) }}
    >
      {children}
    </MotiView>
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

// --- Screen ------------------------------------------------------------------

// The first screen on launch when there's no Supabase session, and the in-app
// /sign-in route. A successful sign-in of any kind is routed into the app by
// app/_layout.tsx onAuthStateChange; the X / "Continue without an account" goes
// back (or enters the app as a guest when this is the launch-time screen).
//
// `showAllDoors` is for PREVIEW AND MARKETING RENDERS ONLY: it shows every
// provider button regardless of platform availability, because the browser —
// where this project photographs itself (§21) — cannot run native Google/Apple
// sign-in and hides them, and a screenshot without the Google door misreads as
// the design lacking one. Nothing in the app passes it; the handlers behind
// the forced buttons still fail safely.
export default function AuthPanel({ showAllDoors = false }: { showAllDoors?: boolean } = {}) {
  const { width } = useWindowDimensions();
  const [step, setStep] = useState<Step>('landing');
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
  const googleDoor = socialAuthAvailable || showAllDoors;
  const appleDoor = appleAvailable || showAllDoors;

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

  const mascotW = Math.min(width - 64, 340);

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        {/* Landing: X to skip, top-right. Deeper steps: back, top-left. */}
        {step === 'landing' ? (
          <Pressable
            onPress={skip}
            hitSlop={10}
            accessibilityLabel="Continue without an account"
            style={({ pressed }) => [styles.close, pressed && { opacity: 0.6 }]}
          >
            <SketchIcon name="close" size={20} color={Ink} />
          </Pressable>
        ) : (
          <Pressable
            onPress={() => {
              setStep(step === 'credentials' ? 'email' : 'landing');
              setError(null);
              setInfo(null);
            }}
            hitSlop={10}
            accessibilityLabel="Back"
            style={({ pressed }) => [styles.topBack, pressed && { opacity: 0.6 }]}
          >
            <SketchIcon name="back" size={22} color={Ink} />
          </Pressable>
        )}

        {/* The landing fills the page — headline at the top, mascot breathing
            in the middle, the doors anchored below — where the form steps stay
            centred (a keyboard owns their bottom half anyway). */}
        <ScrollView
          contentContainerStyle={step === 'landing' ? styles.scrollLanding : styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {step === 'landing' ? (
            <>
              {/* The voice is a door, not a slogan — and the chair is the one
                  he is already sitting on. */}
              <Rise delay={0}>
                <Text style={styles.hello}>Welcome.{'\n'}Pull up a chair.</Text>
              </Rise>

              <View style={styles.mascotZone}>
                <Rise delay={140}>
                  <Mascot width={mascotW} />
                </Rise>
              </View>

              {error && <Message tone="error" text={error} />}

              <View style={styles.doors}>
                <Rise delay={280}>
                  <ChunkButton
                    dark
                    label="Continue with email"
                    onPress={() => { setError(null); setInfo(null); setStep('email'); }}
                  />
                </Rise>
                {googleDoor && (
                  <Rise delay={360}>
                    <ChunkButton
                      label="Continue with Google"
                      onPress={() => handleSocial('google')}
                      disabled={busy === 'google'}
                      leading={busy === 'google' ? <ActivityIndicator color={Ink} size="small" /> : <GoogleGlyph />}
                    />
                  </Rise>
                )}
                {appleDoor && (
                  <Rise delay={440}>
                    <ChunkButton
                      dark
                      label="Continue with Apple"
                      onPress={() => handleSocial('apple')}
                      disabled={busy === 'apple'}
                      leading={busy === 'apple' ? <ActivityIndicator color={Page} size="small" /> : <AppleGlyph />}
                    />
                  </Rise>
                )}
              </View>

              <Rise delay={520}>
                <Pressable onPress={skip} hitSlop={8} style={styles.guest}>
                  <Text style={styles.guestText}>Continue without an account</Text>
                </Pressable>
              </Rise>

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
          ) : step === 'email' ? (
            <>
              <Text style={styles.heading}>What's your email?</Text>
              <Text style={styles.prompt}>
                {isSignup ? "We'll start your account with it." : "We'll find your account with it."}
              </Text>

              <Field
                label="EMAIL"
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoFocus
                fieldKey="email"
                focus={focus}
                setFocus={setFocus}
                onSubmitEditing={continueWithEmail}
              />

              {error && <Message tone="error" text={error} />}

              <View style={styles.submitWrap}>
                <ChunkButton dark label="Continue" onPress={continueWithEmail} />
              </View>

              {/* Choose intent up front so new users aren't dropped into a "Welcome
                  back" password screen with no way to create an account. */}
              <Pressable onPress={switchMode} hitSlop={6} style={styles.toggle}>
                <Text style={styles.toggleText}>
                  {isSignup ? 'Already have an account? ' : 'New here? '}
                  <Text style={styles.toggleStrong}>{isSignup ? 'Sign in' : 'Create an account'}</Text>
                </Text>
              </Pressable>
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

              <View style={styles.submitWrap}>
                <ChunkButton
                  dark
                  label={loading ? (isSignup ? 'Creating account…' : 'Signing in…') : isSignup ? 'Create Account' : 'Sign In'}
                  onPress={submitCredentials}
                  disabled={loading}
                />
              </View>

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
  scroll: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 30, paddingBottom: 26, justifyContent: 'center' },
  scrollLanding: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 30, paddingBottom: 26 },

  // Landing
  hello: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 32,
    lineHeight: 41,
    color: Ink,
    marginTop: 34,
  },
  mascotZone: { flex: 1, justifyContent: 'center', marginVertical: 6 },
  doors: { gap: 12 },

  cloud: { position: 'absolute', backgroundColor: FaceMid, borderRadius: 999 },
  // Full-bleed across the mascot's window (the window clips it), so the ground
  // reads as the world's edge rather than a drawn stick.
  groundLine: {
    position: 'absolute', left: 40, top: 592, width: 330, height: 2,
    backgroundColor: Ink,
  },
  stone: {
    position: 'absolute', left: 166, top: 581, width: 45, height: 14,
    backgroundColor: '#F2F0E9', borderColor: Ink, borderWidth: 2,
    borderTopLeftRadius: 4, borderTopRightRadius: 4,
  },

  // The chunk
  chunkFace: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    borderRadius: RADIUS.button, paddingVertical: 15, paddingHorizontal: 20, minHeight: 52,
  },
  chunkDark: { backgroundColor: Ink },
  chunkLight: { backgroundColor: Page, borderWidth: 2, borderColor: C.HUE },
  chunkGlyph: { width: 22, alignItems: 'center' },
  chunkLabel: { fontFamily: 'Inter_700Bold', fontSize: 15.5, letterSpacing: 0.2 },

  // Steps
  heading: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 26, color: Ink, textAlign: 'center', marginBottom: 6 },
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

  submitWrap: { marginTop: 6 },

  toggle: { alignItems: 'center', marginTop: 18 },
  toggleText: { fontFamily: 'Inter_400Regular', fontSize: 14.5, color: InkSoft },
  toggleStrong: { fontFamily: 'Inter_700Bold', color: Ink },

  guest: { alignItems: 'center', marginTop: 18, paddingVertical: 6 },
  guestText: { fontFamily: 'Inter_500Medium', fontSize: 14, color: InkSoft, textDecorationLine: 'underline' },

  terms: {
    fontFamily: 'Inter_400Regular', fontSize: 11.5, lineHeight: 17, color: InkSoft,
    textAlign: 'center', marginTop: 16, paddingHorizontal: 8,
  },
  termsLink: { fontFamily: 'Inter_500Medium', color: Ink, textDecorationLine: 'underline' },
});
