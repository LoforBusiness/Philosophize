import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, AppState, Linking } from 'react-native';
import Button from '@/components/ui/Button';
import { INK, MID } from '@/components/shared/tone';
import { C, SPACE, RADIUS } from '@/constants/design';
import { TRIAL_EMAIL_REMINDERS } from '@/constants/subscription';
import { notifications } from '@/lib/notifications';
import { reminderAt, whenLabel } from '@/lib/utils/trial';
import { useUserDataStore } from '@/stores/userDataStore';
import { useUIStore } from '@/stores/uiStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { track } from '@/lib/posthog';

// ─────────────────────────────────────────────────────────────────────────────
// THE ASK FOR THE TRIAL'S REMINDER.
//
//   "I want a prompting to turn notifications on when the user starts a free
//    trial. Because that notification will also tell them that a day before the
//    trial ends, you can cancel. So the user won't get charged."
//
// Shown on the conferral the moment a trial starts, and again on the trial's own
// panel for as long as the answer is still no. It is the one permission ask in
// the app with a concrete reason attached, a charge on a date, so it says the
// date.
//
// Four states, and each one says only what is true:
//
//   · ALLOWED: the date the reminder will arrive. Nothing to ask.
//   · NOT YET ASKED: the ask, with the date it would arrive.
//   · REFUSED: Android will not show its prompt twice, so the only way left is the
//     phone's own settings, and the button goes there.
//   · LESS THAN A DAY LEFT: nothing at all. A reminder "a day before" that moment
//     has already passed, and asking for it would be a promise nobody keeps.
//
// The email line appears only once the reminder email is really being sent
// (`TRIAL_EMAIL_REMINDERS`) and the reader has an account with an address.
// ─────────────────────────────────────────────────────────────────────────────

export default function TrialReminderAsk({ endsAt, source, compact = false }: {
  /** When the trial ends, in epoch ms. */
  endsAt: number | null;
  /** Which screen asked, for analytics. */
  source: string;
  compact?: boolean;
}) {
  const markNotifyAsked = useUserDataStore((s) => s.markNotifyAsked);
  const bumpReminders = useUIStore((s) => s.bumpReminders);
  const email = useSubscriptionStore((s) => s.email);
  const supported = notifications.isSupported();

  // null = still checking, so the card never flashes in front of somebody who
  // already allowed it. Re-read on every return to the foreground, because the
  // reader may have just switched notifications on in the phone's settings.
  const [granted, setGranted] = useState<boolean | null>(null);
  const [refused, setRefused] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!supported) return;
    let alive = true;
    const read = () => {
      void notifications.hasPermission().then((g) => { if (alive) setGranted(g); });
    };
    read();
    const sub = AppState.addEventListener('change', (s) => { if (s === 'active') read(); });
    return () => { alive = false; sub.remove(); };
  }, [supported]);

  const due = endsAt != null ? reminderAt(endsAt) : null;
  const dueWhen = due != null && due > Date.now() ? whenLabel(due) : null;
  const emailLine = TRIAL_EMAIL_REMINDERS && email
    ? `We’ll also email ${email} a day before it ends.`
    : null;

  const turnOn = async () => {
    if (busy) return;
    setBusy(true);
    const ok = await notifications.requestPermission();
    setBusy(false);
    // It spends the reward screen's ask as well: one question about
    // notifications is plenty, and this one came with a reason.
    markNotifyAsked();
    track('notify_prompt', { answer: ok ? 'granted' : 'denied', source });
    setGranted(ok);
    if (!ok) setRefused(true);
    // The settings did not change, so nothing else would tell the scheduler the
    // answer did (see uiStore.remindersNonce).
    if (ok) bumpReminders();
  };

  const notNow = () => {
    setDismissed(true);
    markNotifyAsked();
    track('notify_prompt', { answer: 'dismissed', source });
  };

  const email_ = emailLine ? <Text style={st.line}>{emailLine}</Text> : null;

  // Web and Expo Go cannot schedule anything, so the only reminder that could
  // reach them is the email.
  if (!supported) return email_;
  if (granted === null) return null;

  if (granted) {
    if (!dueWhen) return email_;
    return (
      <View style={st.set} nativeID="trial-reminder">
        <Text style={st.setText}>{`Reminder set for ${dueWhen}.`}</Text>
        {email_}
      </View>
    );
  }

  if (refused) {
    return (
      <View style={[st.card, compact && st.cardCompact]} nativeID="trial-reminder-ask">
        <Text style={st.body}>
          Notifications are off for Ashmere, so the reminder can’t reach this phone. You can
          allow them in your phone’s settings.
        </Text>
        <Button
          label="Open phone settings"
          variant="secondary"
          onPress={() => { void Linking.openSettings().catch(() => {}); }}
        />
        {email_}
      </View>
    );
  }

  if (dismissed || !dueWhen) return email_;

  return (
    <View style={[st.card, compact && st.cardCompact]} nativeID="trial-reminder-ask">
      <Text style={[st.head, compact && st.headCompact]}>Get a reminder the day before it ends</Text>
      <Text style={st.body}>
        {`So you can cancel before you’re charged, if it isn’t for you. It would arrive on ${dueWhen}.`}
      </Text>
      <Button
        label={busy ? 'Asking…' : 'Turn on reminders'}
        onPress={() => void turnOn()}
        disabled={busy}
        size={compact ? 'md' : 'lg'}
      />
      <Button label="Not now" variant="ghost" onPress={notNow} />
      {email_}
    </View>
  );
}

const st = StyleSheet.create({
  card: {
    alignSelf: 'stretch',
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.hairline,
    borderRadius: RADIUS.card,
    padding: SPACE[3],
    gap: SPACE[2],
  },
  cardCompact: { padding: SPACE[2] },
  head: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 17, lineHeight: 22, color: INK, textAlign: 'center',
  },
  headCompact: { fontSize: 15, lineHeight: 20 },
  body: {
    fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19, color: MID, textAlign: 'center',
  },
  set: { alignSelf: 'stretch', gap: SPACE[1] },
  setText: {
    fontFamily: 'Inter_500Medium', fontSize: 13, lineHeight: 19, color: INK, textAlign: 'center',
  },
  line: {
    fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 17, color: MID, textAlign: 'center',
  },
});
