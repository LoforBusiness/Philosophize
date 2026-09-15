import { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import Button from '@/components/ui/Button';
import { MetalPlate } from '@/components/profile/Struck';
import { METAL, INK, MID } from '@/components/shared/tone';
import { C, SPACE } from '@/constants/design';
import { FALLBACK_PRICE, BILLING_PERIOD_LABEL, TRIAL_DAYS } from '@/constants/subscription';
import { trialActive, trialLeft, trialLabel, trialLengthPhrase } from '@/lib/utils/trial';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { track } from '@/lib/posthog';

// ─────────────────────────────────────────────────────────────────────────────
// THE DOOR UNDER THE CHART, ON THE PASS TAB AND IN SETTINGS.
//
//   "when a user is using the free version ... they are offered the free trial,
//    the three day free trial ... I want the three day free offer shown there
//    instead of just this pay six ninety nine."
//
// Three states, and which one a reader sees is the store's answer, never this
// component's guess:
//
//   · A TRIAL LEFT TO GIVE (`canStartTrial()`): the trial is the button. The price
//     is still here, as a quiet link under it, because somebody who has already
//     decided should not have to take a free trial to be allowed to pay.
//   · ON THE TRIAL: how long is left, and the Pass offered to keep. `isPro` is true
//     inside a trial, which is exactly why this reads `entitled || isReviewer` to
//     know who is PAYING: a reader on the trial has nothing to cancel.
//   · THE TRIAL SPENT: the price and the button, as before. A trial is offered
//     once; three free days offered nightly to somebody who used them in March
//     would be a promise the app cannot keep.
//
// A paying reader gets nothing from this component. The screen shows what they
// hold instead.
//
// THE TRIAL IS STARTED THROUGH THE STORE, which raises the conferral itself, so
// no screen raises its own ceremony (check-pass §9e). And it cannot charge: the
// trial is a date on this device, and `check-pass` §9g fails the build if
// starting or ending it ever reaches billing.
// ─────────────────────────────────────────────────────────────────────────────

export type DoorSource = 'pass_tab' | 'settings';

export default function PassDoor({ source, compact = false }: {
  source: DoorSource;
  /**
   * SHORTER LABELS, for Settings' narrow card. At about 225pt "Start your 3-day
   * free trial" broke onto two lines with "trial" alone on the second, and "Keep
   * the Scholar’s Pass" left "Pass" the same way. The plate above the button
   * already says how long the trial is, so the button does not have to.
   */
  compact?: boolean;
}) {
  const paying = useSubscriptionStore((s) => s.entitled || s.isReviewer);
  const canTrial = useSubscriptionStore((s) => s.canStartTrial());
  const trialEndsAt = useSubscriptionStore((s) => s.trialEndsAt);
  const monthly = useSubscriptionStore((s) => s.monthly);
  const startTrial = useSubscriptionStore((s) => s.startTrial);

  // THE COUNTDOWN MOVES ONCE A MINUTE, and only while there is a trial to count.
  // The store flips `isPro` itself when the trial ends, which re-renders this; the
  // tick is only so "2 days left" does not sit there all afternoon.
  const [, setTick] = useState(0);
  const now = Date.now();
  const onTrial = !paying && trialActive(trialEndsAt, now);
  useEffect(() => {
    if (!onTrial) return;
    const id = setInterval(() => setTick((n) => n + 1), 60_000);
    return () => clearInterval(id);
  }, [onTrial]);

  // Offered once per mount, and never to a reader who is paying.
  const offered = useRef(false);
  useEffect(() => {
    if (paying || !canTrial || offered.current) return;
    offered.current = true;
    track('trial_offered', { source });
  }, [paying, canTrial, source]);

  // The store's localized string, and the shared fallback on web, in Expo Go and
  // before RevenueCat answers. Never a typed price.
  const price = monthly?.priceString ?? FALLBACK_PRICE;
  const period = BILLING_PERIOD_LABEL;
  const days = trialLengthPhrase();

  // THE PURCHASE IS NOT RUN FROM HERE. The paywall route owns the busy state, the
  // failure notices and the restore path.
  const subscribe = () => {
    track('subscribe_clicked', { plan: 'monthly', billing: 'monthly', source });
    router.push('/(app)/paywall');
  };

  if (paying) return null;

  if (canTrial) {
    return (
      <View style={st.door}>
        <MetalPlate metal={METAL.GOLD} label={`${days.toUpperCase()} FREE`} style={st.plate} />
        <Button
          label={compact ? 'Start the free trial' : `Start your ${TRIAL_DAYS}-day free trial`}
          size="lg"
          onPress={() => startTrial(source)}
        />
        <Text style={st.fine}>
          No card and no charge. After {days} you go back to the free plan, unless you choose to subscribe.
        </Text>
        <Pressable onPress={subscribe} hitSlop={8} style={st.altWrap}>
          <Text style={st.alt}>Or subscribe now for {price} a {period}</Text>
        </Pressable>
      </View>
    );
  }

  if (onTrial) {
    return (
      <View style={st.door}>
        <MetalPlate
          metal={METAL.GOLD}
          label={trialLabel(trialLeft(trialEndsAt, now)).toUpperCase()}
          style={st.plate}
        />
        <Text style={st.note}>
          Your free trial is on. It ends by itself, and nothing is charged.
        </Text>
        <Text style={st.priceLine}>
          <Text style={st.price}>{price}</Text>
          {` a ${period} keeps every lesson open after it`}
        </Text>
        <Button label={compact ? 'Keep the Pass' : 'Keep the Scholar’s Pass'} size="lg" onPress={subscribe} />
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
  fine: {
    fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 17, color: MID, textAlign: 'center',
  },
  note: {
    fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19, color: MID, textAlign: 'center',
  },
  altWrap: { alignSelf: 'center', paddingVertical: SPACE[1] },
  alt: {
    fontFamily: 'Inter_500Medium', fontSize: 13, color: C.ink, textDecorationLine: 'underline',
    textAlign: 'center',
  },
  priceLine: { fontFamily: 'Inter_400Regular', fontSize: 13.5, color: MID, textAlign: 'center' },
  price: { fontFamily: 'Inter_700Bold', fontSize: 15, color: INK },
});
