import { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { notifications } from '@/lib/notifications';
import { useUserDataStore } from '@/stores/userDataStore';
import { useUIStore } from '@/stores/uiStore';
import { track } from '@/lib/posthog';

// ─────────────────────────────────────────────────────────────────────────────
// THE ONE ASK, SPENT WELL.
//
// The three reminder switches default to ON, but permission was only ever
// requested by TURNING A SWITCH ON — and they are already on. So a reader who
// never opened Settings had reminders enabled, a sync() that correctly refused
// to schedule against a permission it did not hold, and not one notification
// ever. Nothing was broken and nothing was delivered.
//
// Android gives an app one system prompt; refuse it and the only way back is
// through the phone's own settings. So it is not spent on launch, before the app
// has done anything worth being reminded about. It is spent here — on the reward
// screen, once, after a lesson has just been finished and the XP and streak have
// landed — because "same time tomorrow?" only means something to somebody who
// has just had a good three minutes.
//
// Declining still marks the ask as spent. A prompt that returns every time the
// reader finishes a lesson is worse than never asking.
// ─────────────────────────────────────────────────────────────────────────────

const Ink = '#1A1A1A';
const InkSoft = '#6B6B6B';
const Rule = '#ECEAE2';
const Paper = '#FAFAF7';

export default function NotifyPrompt() {
  const notifyAsked = useUserDataStore((s) => s.notifyAsked);
  const markNotifyAsked = useUserDataStore((s) => s.markNotifyAsked);
  const setSetting = useUserDataStore((s) => s.setSetting);
  const bumpReminders = useUIStore((s) => s.bumpReminders);
  // null = still checking. Nothing renders until we know, so the card never
  // flashes in front of someone who already granted it.
  const [granted, setGranted] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    if (!notifications.isSupported()) {
      setGranted(true); // nothing to ask for; treat as settled so we render nothing
      return;
    }
    void notifications.hasPermission().then((g) => {
      if (alive) setGranted(g);
    });
    return () => {
      alive = false;
    };
  }, []);

  const accept = async () => {
    if (busy) return;
    setBusy(true);
    const ok = await notifications.requestPermission();
    setBusy(false);
    markNotifyAsked();
    track('notify_prompt', { answer: ok ? 'granted' : 'denied' });
    // Only touched on a YES, and only to guarantee the daily nudge is on. A NO
    // leaves the stored switches exactly as they were: they already read as off
    // in Settings while permission is missing, and rewriting them here would
    // silently undo a preference the reader may have set deliberately.
    if (ok) setSetting('dailyReminder', true);
    // Say so explicitly. `dailyReminder` was almost certainly already true, so
    // the settings write above changes nothing and the scheduler would not
    // otherwise notice that the ANSWER changed.
    if (ok) bumpReminders();
    setGranted(ok);
  };

  const decline = () => {
    markNotifyAsked();
    track('notify_prompt', { answer: 'dismissed' });
  };

  if (notifyAsked) return null;
  if (granted !== false) return null; // still checking, already granted, or unsupported

  return (
    <Animated.View style={styles.wrap} entering={FadeInDown.duration(420).delay(900)}>
      <Text style={styles.head}>Same time tomorrow?</Text>
      <Text style={styles.body}>
        One quiet nudge a day, scheduled on this phone. Nothing is sent from a server, and nothing
        about your studies leaves the device.
      </Text>
      <Pressable
        onPress={() => void accept()}
        disabled={busy}
        style={({ pressed }) => [styles.yes, pressed && { opacity: 0.85 }]}
      >
        <Text style={styles.yesText}>{busy ? 'Asking…' : 'Yes, remind me'}</Text>
      </Pressable>
      <Pressable onPress={decline} hitSlop={8} style={styles.no}>
        <Text style={styles.noText}>Not now</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 26,
    borderWidth: 1,
    borderColor: Rule,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  head: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 18, color: Ink, marginBottom: 6 },
  body: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: InkSoft,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 14,
  },
  yes: {
    backgroundColor: Ink,
    borderRadius: 11,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  yesText: { fontFamily: 'Inter_700Bold', fontSize: 14.5, color: Paper, letterSpacing: 0.3 },
  no: { marginTop: 10, paddingVertical: 6, paddingHorizontal: 16 },
  noText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: InkSoft },
});
