import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MotiView } from 'moti';
import SketchIcon from '@/components/shared/SketchIcon';
import ScreenTransition from '@/components/shared/ScreenTransition';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { FALLBACK_PRICE, FREE_DAILY_LESSON_LIMIT, lessonsWord } from '@/constants/subscription';
import { track } from '@/lib/posthog';

const Page = '#F1EEE7';
const Paper = '#FFFFFF';
const Ink = '#1A1A1A';
const InkSoft = '#6B6B6B';
const InkFaint = '#E2E0D8';

const TERMS_URL = 'https://philosophize.app/terms';
const PRIVACY_URL = 'https://philosophize.app/privacy';

const BENEFITS = [
  'Unlimited lessons every day',
  'No ads, ever',
];

export default function PaywallScreen() {
  const isPro = useSubscriptionStore((s) => s.isPro);
  const ready = useSubscriptionStore((s) => s.ready);
  const available = useSubscriptionStore((s) => s.available);
  const monthly = useSubscriptionStore((s) => s.monthly);
  const purchaseMonthly = useSubscriptionStore((s) => s.purchaseMonthly);
  const restore = useSubscriptionStore((s) => s.restore);
  const refresh = useSubscriptionStore((s) => s.refresh);

  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Re-pull the offering/entitlement when the paywall opens.
  useEffect(() => {
    track('paywall_viewed', { available });
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const price = monthly?.priceString ?? FALLBACK_PRICE;
  const close = () => router.back();

  const onSubscribe = async () => {
    if (busy) return;
    setNotice(null);
    setBusy(true);
    track('subscribe_clicked', { plan: 'scholars_pass', billing: 'monthly' });
    const outcome = await purchaseMonthly();
    setBusy(false);
    if (outcome === 'success') return; // the success state renders from isPro
    if (outcome === 'cancelled') return; // user backed out — say nothing
    if (outcome === 'unavailable')
      setNotice("Purchases run in the installed Philosophize app — this preview can't complete a real purchase.");
    else setNotice('Something went wrong starting your subscription. Please try again.');
  };

  const onRestore = async () => {
    if (busy) return;
    setNotice(null);
    setBusy(true);
    const outcome = await restore();
    setBusy(false);
    if (outcome === 'restored') setNotice('Your Scholar’s Pass has been restored.');
    else if (outcome === 'none') setNotice('No previous purchase found on this account.');
    else if (outcome === 'unavailable')
      setNotice("Restoring works in the installed Philosophize app only.");
    else setNotice('Could not restore right now. Please try again.');
  };

  // ── Already subscribed ──────────────────────────────────────────────
  if (isPro) {
    return (
      <ScreenTransition bg={Page}>
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <Header onClose={close} />
          <View style={styles.proWrap}>
            <View style={styles.seal}>
              <SketchIcon name="star-filled" color={Ink} size={40} />
            </View>
            <Text style={styles.thanksTitle}>You’re a Scholar</Text>
            <Text style={styles.thanksBody}>
              Scholar’s Pass is active — unlimited lessons, every day. Thank you for supporting the project.
            </Text>
            <Text style={styles.manageNote}>
              Manage or cancel anytime from your App Store / Google Play subscription settings.
            </Text>
            <Pressable onPress={close} style={({ pressed }) => [styles.cta, pressed && styles.pressed]}>
              <Text style={styles.ctaText}>Done</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </ScreenTransition>
    );
  }

  // ── Offer ───────────────────────────────────────────────────────────
  return (
    <ScreenTransition bg={Page}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <Header onClose={close} />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <MotiView from={{ opacity: 0, translateY: 8 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 360 }}>
            <Text style={styles.kicker}>SCHOLAR’S PASS</Text>
            <Text style={styles.title}>Think without limits.</Text>
            <Text style={styles.sub}>
              Free gives you {FREE_DAILY_LESSON_LIMIT} {lessonsWord(FREE_DAILY_LESSON_LIMIT)} a day, with ads. Scholar’s Pass removes the cap and the ads — keep going as long as the curiosity lasts.
            </Text>
          </MotiView>

          <View style={styles.card}>
            {BENEFITS.map((b, i) => (
              <View key={b} style={[styles.benefitRow, i === BENEFITS.length - 1 && { marginBottom: 0 }]}>
                <View style={styles.tick}>
                  <SketchIcon name="check" color={Ink} size={15} />
                </View>
                <Text style={styles.benefitText}>{b}</Text>
              </View>
            ))}
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.price}>{price}</Text>
            <Text style={styles.per}> / month</Text>
          </View>
          <Text style={styles.billNote}>Billed monthly · cancel anytime</Text>

          {!available && (
            <View style={styles.previewBanner}>
              <SketchIcon name="warning" color={InkSoft} size={16} />
              <Text style={styles.previewText}>
                You’re on the web / Expo Go preview. Real purchases work in the installed app build.
              </Text>
            </View>
          )}

          <Pressable
            onPress={onSubscribe}
            disabled={busy || !ready}
            style={({ pressed }) => [styles.cta, (busy || !ready) && styles.ctaDisabled, pressed && styles.pressed]}
          >
            {busy ? (
              <ActivityIndicator color={Paper} />
            ) : (
              <Text style={styles.ctaText}>Start — {price} / mo</Text>
            )}
          </Pressable>

          <Pressable onPress={onRestore} disabled={busy} style={styles.restoreBtn} hitSlop={8}>
            <Text style={styles.restoreText}>Restore purchase</Text>
          </Pressable>

          {notice && (
            <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.notice}>
              <Text style={styles.noticeText}>{notice}</Text>
            </MotiView>
          )}

          <Text style={styles.legal}>
            Payment is charged to your store account at confirmation. The subscription renews monthly
            unless cancelled at least 24 hours before the period ends. Manage or cancel in your store
            account settings.
          </Text>
          <View style={styles.linksRow}>
            <Pressable hitSlop={8} onPress={() => Linking.openURL(TERMS_URL)}>
              <Text style={styles.link}>Terms</Text>
            </Pressable>
            <Text style={styles.linkDot}>·</Text>
            <Pressable hitSlop={8} onPress={() => Linking.openURL(PRIVACY_URL)}>
              <Text style={styles.link}>Privacy</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ScreenTransition>
  );
}

function Header({ onClose }: { onClose: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onClose} hitSlop={12} style={styles.closeBtn}>
        <SketchIcon name="close" color={Ink} size={22} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { height: 52, justifyContent: 'center', paddingHorizontal: 18 },
  closeBtn: { width: 34, height: 34, alignItems: 'flex-start', justifyContent: 'center' },
  scroll: { paddingHorizontal: 26, paddingBottom: 40 },

  kicker: { fontFamily: 'Inter_700Bold', fontSize: 12, color: InkSoft, letterSpacing: 2, marginBottom: 8 },
  title: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 34, color: Ink, lineHeight: 38 },
  sub: { fontFamily: 'Inter_400Regular', fontSize: 15, color: InkSoft, lineHeight: 22, marginTop: 12 },

  card: {
    backgroundColor: Paper,
    borderWidth: 2,
    borderColor: Ink,
    borderRadius: 4,
    padding: 20,
    marginTop: 26,
  },
  benefitRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  tick: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: Ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  benefitText: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 15.5, color: Ink },

  priceRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', marginTop: 30 },
  price: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 40, color: Ink },
  per: { fontFamily: 'Inter_500Medium', fontSize: 16, color: InkSoft },
  billNote: { fontFamily: 'Inter_400Regular', fontSize: 13, color: InkSoft, textAlign: 'center', marginTop: 4 },

  previewBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FBF7EC',
    borderWidth: 1,
    borderColor: InkFaint,
    borderRadius: 4,
    padding: 12,
    marginTop: 18,
  },
  previewText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 12.5, color: InkSoft, lineHeight: 18 },

  cta: {
    backgroundColor: Ink,
    borderRadius: 4,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
    minHeight: 54,
  },
  ctaDisabled: { opacity: 0.45 },
  pressed: { opacity: 0.85 },
  ctaText: { fontFamily: 'Inter_700Bold', fontSize: 16, color: Paper, letterSpacing: 0.3 },

  restoreBtn: { alignItems: 'center', paddingVertical: 14 },
  restoreText: { fontFamily: 'Inter_500Medium', fontSize: 14, color: InkSoft, textDecorationLine: 'underline' },

  notice: {
    backgroundColor: Paper,
    borderWidth: 1,
    borderColor: InkFaint,
    borderRadius: 4,
    padding: 12,
    marginTop: 4,
  },
  noticeText: { fontFamily: 'Inter_400Regular', fontSize: 13, color: Ink, lineHeight: 19, textAlign: 'center' },

  legal: { fontFamily: 'Inter_400Regular', fontSize: 11, color: InkSoft, lineHeight: 16, marginTop: 26, textAlign: 'center' },
  linksRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 10 },
  link: { fontFamily: 'Inter_500Medium', fontSize: 12, color: Ink, textDecorationLine: 'underline' },
  linkDot: { color: InkSoft },

  // Already-subscribed state
  proWrap: { flex: 1, paddingHorizontal: 30, alignItems: 'center', justifyContent: 'center' },
  seal: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: Ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  thanksTitle: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 28, color: Ink, textAlign: 'center' },
  thanksBody: { fontFamily: 'Inter_400Regular', fontSize: 15, color: InkSoft, lineHeight: 22, textAlign: 'center', marginTop: 12 },
  manageNote: { fontFamily: 'Inter_400Regular', fontSize: 12.5, color: InkSoft, lineHeight: 18, textAlign: 'center', marginTop: 18 },
});
