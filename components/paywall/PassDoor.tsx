import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import Button from '@/components/ui/Button';
import { MetalPlate } from '@/components/profile/Struck';
import { METAL, INK, MID } from '@/components/shared/tone';
import { C, SPACE } from '@/constants/design';
import { FALLBACK_PRICE, BILLING_PERIOD_LABEL } from '@/constants/subscription';
import { trialLengthPhrase } from '@/lib/utils/trial';
import {
  conversionTerms, REMINDER_PROMISE, startNotice, startTrialLabel,
} from '@/lib/utils/trialTerms';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { track } from '@/lib/posthog';

// ─────────────────────────────────────────────────────────────────────────────
// THE DOOR UNDER THE CHART, ON THE PASS TAB AND IN SETTINGS.
//
//   "when a user is using the free version ... they are offered the free trial,
//    the three day free trial ... instead of just this pay six ninety nine."
//
// Two states, for a reader who does not hold the Pass. Which one they see is the
// store's answer, never this component's guess:
//
//   · GOOGLE PLAY OFFERS THEM A TRIAL (`canStartTrial()`): the trial is the
//     button. Straight under it, large, the promise that they will be reminded a
//     day before it ends. Under that, small, every term Google's policy asks for,
//     the automatic Scholar's Pass among them. All of it comes from
//     `lib/utils/trialTerms.ts`.
//   · NO TRIAL ON OFFER (they have had one, or it is not configured): the price
//     and the button. Promising free days the store will not give is the one thing
//     this door may never do.
//
// A reader who HOLDS the Pass, on the trial or paid, gets nothing from this
// component. The screen shows `TrialStatus` or the ACTIVE plate instead.
//
// THE TRIAL IS STARTED THROUGH THE STORE, which raises the conferral itself, so
// no screen raises its own ceremony (check-pass §9e).
// ─────────────────────────────────────────────────────────────────────────────

export type DoorSource = 'pass_tab' | 'settings';

export default function PassDoor({ source, compact = false }: {
  source: DoorSource;
  /**
   * SHORTER LABELS, for Settings' narrow card. At about 225pt "Start your 3-day
   * free trial" broke onto two lines with "trial" alone on the second. The plate
   * above the button already says how long the trial is, so the button does not
   * have to.
   */
  compact?: boolean;
}) {
  const isPro = useSubscriptionStore((s) => s.isPro);
  const canTrial = useSubscriptionStore((s) => s.canStartTrial());
  const trial = useSubscriptionStore((s) => s.monthly?.trial ?? null);
  const monthly = useSubscriptionStore((s) => s.monthly);
  const startTrial = useSubscriptionStore((s) => s.startTrial);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Offered once per mount, and only while there is a trial to offer.
  const offered = useRef(false);
  useEffect(() => {
    if (!canTrial || offered.current) return;
    offered.current = true;
    track('trial_offered', { source });
  }, [canTrial, source]);

  // The store's localized string, and the shared fallback on web, in Expo Go and
  // before RevenueCat answers. Never a typed price.
  const price = monthly?.priceString ?? FALLBACK_PRICE;
  const period = BILLING_PERIOD_LABEL;

  // A PAID PURCHASE IS NOT RUN FROM HERE. The paywall route owns the busy state,
  // the failure notices and the restore path.
  const subscribe = () => {
    track('subscribe_clicked', { plan: 'monthly', billing: 'monthly', source });
    router.push('/(app)/paywall');
  };

  // Google's sheet opens over this screen. A sheet the reader closes says
  // nothing; one that fails says so here, next to the button that opened it.
  const begin = async () => {
    if (busy) return;
    setNotice(null);
    setBusy(true);
    const outcome = await startTrial(source);
    setBusy(false);
    setNotice(startNotice(outcome));
  };

  if (isPro) return null;

  if (canTrial && trial) {
    return (
      <View style={st.door}>
        <MetalPlate
          metal={METAL.GOLD}
          label={`${trialLengthPhrase(trial).toUpperCase()} FREE`}
          style={st.plate}
        />
        <Button
          label={busy ? 'One moment…' : startTrialLabel(trial, compact)}
          size="lg"
          disabled={busy}
          onPress={() => void begin()}
        />
        <Text style={st.promise}>{REMINDER_PROMISE}</Text>
        <Text style={st.fine}>{conversionTerms(trial, price, period)}</Text>
        {notice ? <Text style={st.notice}>{notice}</Text> : null}
      </View>
    );
  }

  return (
    <View style={st.door}>
      <Text style={st.priceLine}>
        <Text style={st.price}>{price}</Text>
        {` a ${period} · Cancel any time`}
      </Text>
      <Button label={compact ? 'Get the Pass' : 'Get the Scholar’s Pass'} size="lg" onPress={subscribe} />
    </View>
  );
}

const st = StyleSheet.create({
  door: { gap: SPACE[2] },
  plate: { alignSelf: 'center' },
  // THE PROMISE IS THE LARGER LINE, the conversion terms the smaller one, in the
  // order the reader asked for. Ink rather than grey, so it reads as a statement
  // and not as a disclaimer.
  promise: {
    fontFamily: 'Inter_700Bold', fontSize: 14, lineHeight: 20, color: INK, textAlign: 'center',
  },
  fine: {
    fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 17, color: MID, textAlign: 'center',
  },
  notice: {
    fontFamily: 'Inter_500Medium', fontSize: 13, lineHeight: 19, color: C.ink, textAlign: 'center',
  },
  priceLine: { fontFamily: 'Inter_400Regular', fontSize: 13.5, color: MID, textAlign: 'center' },
  price: { fontFamily: 'Inter_700Bold', fontSize: 15, color: INK },
});
