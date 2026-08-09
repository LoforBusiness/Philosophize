import { useEffect, useState } from 'react';
import {
  View, Text, Pressable, ScrollView, StyleSheet, ActivityIndicator, Linking, useWindowDimensions,
} from 'react-native';
import { MotiView } from 'moti';
import SketchIcon from '@/components/shared/SketchIcon';
import PassCard from '@/components/shared/PassCard';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { useUserDataStore } from '@/stores/userDataStore';
import { awardedRank } from '@/data/ranks';
import { FALLBACK_PRICE, FREE_DAILY_LESSON_LIMIT, lessonsWord } from '@/constants/subscription';
import { track } from '@/lib/posthog';

// The Scholar's Pass offer, factored out so it can render BOTH as a full-screen
// route (app/(app)/paywall.tsx, pushed from Settings) and as a dismissible
// slide-up sheet (PaywallSheet, after a lesson / from the daily-limit gate).
// The host supplies how "close" behaves (router.back vs. closing the sheet).

const Paper = '#FFFFFF';
const Ink = '#1A1A1A';
const InkSoft = '#6B6B6B';
const InkFaint = '#E2E0D8';

const TERMS_URL = 'https://philosophize.app/terms';
const PRIVACY_URL = 'https://philosophize.app/privacy';

// Only things that are actually built and actually differ by tier. The list has
// been kept honest deliberately — §14 has imagined several premium features over
// time, and a paywall that promises one before it exists is the fastest way to
// make every other line on it untrustworthy.
//
// SET SHORT, because they are ENGRAVED ON THE CARD now rather than listed in a
// column beside it. Each is one line on a face about 250pt wide, so the prose
// versions ("Rest days that keep a streak alive, five at a time") ran off the
// edge. Terse is also the right voice for a printed pass — a card states its
// terms, it does not sell them.
const BENEFITS = [
  'Every lesson, every day',
  'Five rest days, held',
  'No advertisement, ever',
];

export default function PaywallContent({
  onClose,
  source,
}: {
  onClose: () => void;
  source?: string;
}) {
  const isPro = useSubscriptionStore((s) => s.isPro);
  const ready = useSubscriptionStore((s) => s.ready);
  const available = useSubscriptionStore((s) => s.available);
  const monthly = useSubscriptionStore((s) => s.monthly);
  const purchaseMonthly = useSubscriptionStore((s) => s.purchaseMonthly);
  const restore = useSubscriptionStore((s) => s.restore);
  const refresh = useSubscriptionStore((s) => s.refresh);

  // The card is in the reader's own name and carries the rank they hold. It is
  // the difference between a product shot and a thing addressed to them, and it
  // costs two store reads.
  const displayName = useUserDataStore((s) => s.displayName);
  const rankIndex = useUserDataStore((s) => s.rankIndex);
  const totalXP = useUserDataStore((s) => s.totalXP);
  const rank = awardedRank(rankIndex, totalXP);

  const { width: winW } = useWindowDimensions();
  // 26pt of page padding either side, and never wider than a card wants to be
  // held — beyond ~360 it stops reading as something in the hand.
  const cardW = Math.min(360, winW - 52);

  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Re-pull the offering/entitlement when the paywall opens.
  useEffect(() => {
    track('paywall_viewed', { available, source });
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const price = monthly?.priceString ?? FALLBACK_PRICE;

  const onSubscribe = async () => {
    if (busy) return;
    setNotice(null);
    setBusy(true);
    track('subscribe_clicked', { plan: 'scholars_pass', billing: 'monthly', source });
    const outcome = await purchaseMonthly();
    setBusy(false);
    if (outcome === 'success') return; // the success state renders from isPro
    if (outcome === 'cancelled') return; // user backed out — say nothing
    if (outcome === 'unavailable')
      setNotice("Purchases run in the installed Deeply app — this preview can't complete a real purchase.");
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
    else if (outcome === 'unavailable') setNotice('Restoring works in the installed Deeply app only.');
    else setNotice('Could not restore right now. Please try again.');
  };

  // ── Already subscribed ──────────────────────────────────────────────
  if (isPro) {
    return (
      <View style={styles.safe}>
        <Header onClose={onClose} />
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
          <Pressable onPress={onClose} style={({ pressed }) => [styles.cta, pressed && styles.pressed]}>
            <Text style={styles.ctaText}>Done</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ── Offer ───────────────────────────────────────────────────────────
  return (
    <View style={styles.safe}>
      <Header onClose={onClose} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* THE CARD IS THE PITCH. The benefits are printed ON the pass rather
            than listed beside it, because the object is what is being offered —
            a ticked feature table beside a drawn card would be two designs
            arguing. The same component draws the day pass on the limit screen
            with a stamp across it, so a reader meets this object twice and the
            second meeting needs no explanation. */}
        <MotiView
          from={{ opacity: 0, translateY: 14 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 460 }}
          style={styles.cardWrap}
        >
          <PassCard
            variant="scholar"
            name={displayName || 'Philosopher'}
            rank={rank.current.name}
            glyph={rank.current.glyph}
            lines={BENEFITS}
            width={cardW}
          />
        </MotiView>

        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 400, delay: 240 }}
        >
          <Text style={styles.title}>Think without limits.</Text>
          <Text style={styles.sub}>
            Free gives you {FREE_DAILY_LESSON_LIMIT} {lessonsWord(FREE_DAILY_LESSON_LIMIT)} a day, with ads.
            The Pass lifts the cap, keeps your streak safe, and never stamps.
          </Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>{price}</Text>
            <Text style={styles.per}> / month</Text>
          </View>
          <Text style={styles.billNote}>Billed monthly · cancel anytime</Text>
        </MotiView>

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
          {busy ? <ActivityIndicator color={Paper} /> : <Text style={styles.ctaText}>Start — {price} / mo</Text>}
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
    </View>
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
  // The card leads, so the headline is set smaller than it was and centred under
  // it — at 34pt above a drawn object the two competed for the same job.
  cardWrap: { marginTop: 4, marginBottom: 26 },
  title: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 27,
    color: Ink,
    lineHeight: 32,
    textAlign: 'center',
  },
  sub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14.5,
    color: InkSoft,
    lineHeight: 21,
    marginTop: 10,
    textAlign: 'center',
  },


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
