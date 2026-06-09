import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  Modal,
  PanResponder,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import SketchIcon, { type SketchIconName } from '@/components/shared/SketchIcon';
import Portrait from '@/components/shared/Portrait';
import ScreenTransition from '@/components/shared/ScreenTransition';
import { signOut } from '@/lib/supabase/auth';
import { rankForXP } from '@/data/ranks';
import { useUserDataStore, type AppSettings } from '@/stores/userDataStore';

const Page = '#F1EEE7';
const Paper = '#FFFFFF';
const Ink = '#1A1A1A';
const InkSoft = '#6B6B6B';
const InkFaint = '#E2E0D8';
const Gold = '#6B6B6B';
const Crimson = '#A83232';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const TIMES = ['06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM', '12:00 PM', '06:00 PM', '09:00 PM'];
const LANGS = ['English', 'Español', 'Français', 'Deutsch', 'Italiano', 'Português', 'Latina'];

type SectionKey = 'profile' | 'notifications' | 'learning' | 'privacy' | 'language' | 'subscription' | 'data' | 'danger';
const SECTIONS: { key: SectionKey; label: string; icon: SketchIconName }[] = [
  { key: 'profile', label: 'Profile', icon: 'person' },
  { key: 'notifications', label: 'Notifications', icon: 'bell' },
  { key: 'learning', label: 'Learning', icon: 'grad' },
  { key: 'privacy', label: 'Privacy', icon: 'lock' },
  { key: 'language', label: 'Language', icon: 'globe' },
  { key: 'subscription', label: 'Subscription', icon: 'clock' },
  { key: 'data', label: 'Data', icon: 'database' },
  { key: 'danger', label: 'Danger Zone', icon: 'warning' },
];

export default function SettingsScreen() {
  const [section, setSection] = useState<SectionKey>('profile');
  const [saved, setSaved] = useState(false);
  const { width } = useWindowDimensions();
  const compact = width < 600;

  function onSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <ScreenTransition bg={Page}>
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top bar */}
      <View style={[styles.topBar, compact && { paddingHorizontal: 14 }]}>
        <Text style={[styles.topTitle, compact && { fontSize: 26 }]}>Settings</Text>
        <Pressable onPress={onSave} style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.85 }]}>
          <Text style={styles.saveBtnText}>{saved ? 'Saved ✓' : 'Save Changes'}</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, compact && { paddingHorizontal: 12 }]} showsVerticalScrollIndicator={false}>
        <View style={[styles.layout, styles.layoutRow, { gap: compact ? 10 : 16 }]}>
          <Sidebar section={section} onSelect={setSection} compact={compact} />
          <View style={styles.contentWrap}>
            <Section section={section} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
    </ScreenTransition>
  );
}

/* ---------------- Sidebar ---------------- */

function Sidebar({ section, onSelect, compact }: { section: SectionKey; onSelect: (s: SectionKey) => void; compact: boolean }) {
  const { width } = useWindowDimensions();

  // Phone: a compact icon-only rail on the side, so the content keeps its width.
  if (compact) {
    return (
      <View style={styles.rail}>
        {SECTIONS.map((s) => {
          const on = s.key === section;
          return (
            <Pressable
              key={s.key}
              onPress={() => onSelect(s.key)}
              accessibilityLabel={s.label}
              style={[styles.railItem, on && styles.railItemOn]}
            >
              <SketchIcon name={s.icon} size={20} color={on ? Paper : InkSoft} />
            </Pressable>
          );
        })}
      </View>
    );
  }

  // Wide: full labeled sidebar.
  const w = Math.min(210, Math.max(150, Math.round(width * 0.32)));
  return (
    <View style={[styles.sidebar, { width: w }]}>
      <Text style={styles.sidebarHead}>SECTIONS</Text>
      {SECTIONS.map((s) => {
        const on = s.key === section;
        return (
          <Pressable key={s.key} onPress={() => onSelect(s.key)} style={[styles.navItem, on && styles.navItemOn]}>
            <SketchIcon name={s.icon} size={18} color={on ? Ink : InkSoft} />
            <Text
              style={[styles.navText, on && { color: Ink, fontFamily: 'Inter_700Bold' }]}
              numberOfLines={1}
            >
              {s.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/* ---------------- Shared controls ---------------- */

function Card({ children }: { children: React.ReactNode }) {
  const { width } = useWindowDimensions();
  const pad = width < 600 ? 16 : 22;
  return <View style={[styles.card, { padding: pad }]}>{children}</View>;
}

function Header({ title, sub, icon }: { title: string; sub?: string; icon?: SketchIconName }) {
  return (
    <View style={styles.headerBlock}>
      <View style={styles.headerRow}>
        {icon ? <SketchIcon name={icon} size={20} color={Ink} /> : null}
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
      {sub ? <Text style={styles.headerSub}>{sub}</Text> : null}
    </View>
  );
}

function Row({ title, sub, children, last, stack }: { title: string; sub?: string; children?: React.ReactNode; last?: boolean; stack?: boolean }) {
  const { width } = useWindowDimensions();
  const stacked = !!stack && width < 600;
  return (
    <View style={[styles.row, stacked && styles.rowStacked, last && { borderBottomWidth: 0 }]}>
      <View style={stacked ? { width: '100%' } : { flex: 1, paddingRight: 12 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        {sub ? <Text style={styles.rowSub}>{sub}</Text> : null}
      </View>
      <View style={stacked ? { width: '100%', marginTop: 12, alignItems: 'flex-start' } : undefined}>
        {children}
      </View>
    </View>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <Pressable onPress={() => onChange(!value)} style={[styles.track, value ? styles.trackOn : styles.trackOff]}>
      <View style={[styles.knob, value ? styles.knobOn : styles.knobOff]} />
    </Pressable>
  );
}

function Slider({ value, onChange, min, max, step }: { value: number; onChange: (v: number) => void; min: number; max: number; step: number }) {
  const [w, setW] = useState(0);
  const set = (locationX: number) => {
    if (w <= 0) return;
    const ratio = Math.max(0, Math.min(1, locationX / w));
    const raw = min + ratio * (max - min);
    const snapped = Math.round(raw / step) * step;
    onChange(Math.max(min, Math.min(max, snapped)));
  };
  const pan = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (e) => set(e.nativeEvent.locationX),
    onPanResponderMove: (e) => set(e.nativeEvent.locationX),
  });
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <View style={styles.sliderArea} onLayout={(e) => setW(e.nativeEvent.layout.width)} {...pan.panHandlers}>
      <View style={styles.sliderTrack} />
      <View style={[styles.sliderFill, { width: `${pct}%` }]} />
      <View style={[styles.sliderKnob, { left: `${pct}%` }]} />
    </View>
  );
}

function Segmented({ value, options, onChange }: { value: string; options: { key: string; label: string }[]; onChange: (k: string) => void }) {
  return (
    <View style={styles.segmented}>
      {options.map((o) => {
        const on = o.key === value;
        return (
          <Pressable key={o.key} onPress={() => onChange(o.key)} style={[styles.segBtn, on && styles.segBtnOn]}>
            <Text style={[styles.segText, on && { color: Paper }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function Dropdown({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ position: 'relative', zIndex: 20 }}>
      <Pressable onPress={() => setOpen((o) => !o)} style={styles.dropdown}>
        <Text style={styles.dropdownText}>{value}</Text>
        <SketchIcon name="chevron-down" size={16} color={Ink} />
      </Pressable>
      {open && (
        <View style={styles.dropdownList}>
          {options.map((opt) => (
            <Pressable
              key={opt}
              onPress={() => {
                onChange(opt);
                setOpen(false);
              }}
              style={({ pressed }) => [styles.dropdownItem, pressed && { backgroundColor: '#F0EFEA' }]}
            >
              <Text style={[styles.dropdownItemText, opt === value && { fontFamily: 'Inter_700Bold' }]}>{opt}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

function Check({ label }: { label: string }) {
  return (
    <View style={styles.checkRow}>
      <View style={styles.checkBox}>
        <Text style={styles.checkMark}>✓</Text>
      </View>
      <Text style={styles.checkLabel}>{label}</Text>
    </View>
  );
}

/* ---------------- Section router ---------------- */

function Section({ section }: { section: SectionKey }) {
  switch (section) {
    case 'profile':
      return <ProfileSection />;
    case 'notifications':
      return <NotificationsSection />;
    case 'learning':
      return <LearningSection />;
    case 'privacy':
      return <PrivacySection />;
    case 'language':
      return <LanguageSection />;
    case 'subscription':
      return <SubscriptionSection />;
    case 'data':
      return <DataSection />;
    case 'danger':
      return <DangerSection />;
  }
}

/* ---------------- Profile ---------------- */

function ProfileSection() {
  const displayName = useUserDataStore((s) => s.displayName);
  const email = useUserDataStore((s) => s.email);
  const setProfile = useUserDataStore((s) => s.setProfile);
  const joinedAt = useUserDataStore((s) => s.joinedAt);
  const lessonsByBranch = useUserDataStore((s) => s.lessonsByBranch);
  const savedQuotes = useUserDataStore((s) => s.savedQuotes);
  const philosopherViews = useUserDataStore((s) => s.philosopherViews);
  const streak = useUserDataStore((s) => s.streak);
  const xp = useUserDataStore((s) => s.totalXP);

  const [edit, setEdit] = useState(false);

  const lessons = Object.values(lessonsByBranch).reduce((a, b) => a + b, 0);
  const totalXP = xp + savedQuotes.length * 10 + Object.keys(philosopherViews).length * 5;
  const { current } = rankForXP(totalXP);
  const join = joinedAt ? new Date(joinedAt) : new Date();
  const memberSince = `Member since ${MONTHS[join.getMonth()]} ${join.getFullYear()}`;

  return (
    <Card>
      <View style={styles.profileHeadRow}>
        <Text style={styles.headerTitle}>Profile</Text>
        <Pressable
          onPress={() => setEdit((e) => !e)}
          style={({ pressed }) => [styles.editBtn, pressed && { backgroundColor: '#F0EFEA' }]}
          hitSlop={6}
        >
          <SketchIcon name="pencil" size={14} color={Ink} />
          <Text style={styles.editText}>{edit ? 'Done editing' : 'Edit profile'}</Text>
        </Pressable>
      </View>
      <View style={styles.hr} />

      <View style={styles.identity}>
        <View style={styles.avatar}>
          <Portrait size={64} color={Ink} />
        </View>
        <View style={{ flex: 1, marginLeft: 18 }}>
          <Text style={styles.idName}>{displayName || 'Philosopher'}</Text>
          <Text style={styles.idRank}>
            {current.name} · Rank {current.id}
          </Text>
          <Text style={styles.idMeta}>{memberSince}</Text>
        </View>
      </View>

      <View style={styles.hr} />

      <Text style={styles.fieldLabel}>DISPLAY NAME</Text>
      {edit ? (
        <TextInput value={displayName} onChangeText={(t) => setProfile({ displayName: t })} style={styles.input} placeholder="Your name" placeholderTextColor={InkSoft} />
      ) : (
        <Text style={styles.fieldValue}>{displayName || '—'}</Text>
      )}

      <Text style={styles.fieldLabel}>EMAIL</Text>
      {edit ? (
        <TextInput value={email} onChangeText={(t) => setProfile({ email: t })} style={styles.input} placeholder="you@example.com" placeholderTextColor={InkSoft} autoCapitalize="none" keyboardType="email-address" />
      ) : (
        <Text style={styles.fieldValue}>{email || '—'}</Text>
      )}

      <View style={styles.hr} />
      <View style={styles.miniStats}>
        <MiniStat value={lessons} label="Lessons" />
        <View style={styles.miniDiv} />
        <MiniStat value={savedQuotes.length} label="Quotes" />
        <View style={styles.miniDiv} />
        <MiniStat value={streak} label="Day Streak" />
      </View>
    </Card>
  );
}

function MiniStat({ value, label }: { value: number; label: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={styles.miniValue}>{value}</Text>
      <Text style={styles.miniLabel}>{label}</Text>
    </View>
  );
}

/* ---------------- Notifications ---------------- */

function NotificationsSection() {
  const settings = useUserDataStore((s) => s.settings);
  const setSetting = useUserDataStore((s) => s.setSetting);
  const cycleTime = () => {
    const i = TIMES.indexOf(settings.reminderTime);
    setSetting('reminderTime', TIMES[(i + 1) % TIMES.length]);
  };
  return (
    <Card>
      <Header title="Notifications" sub="Choose what interrupts your contemplation." />
      <View style={styles.hr} />
      <Row title="Daily Reminder" sub="A gentle nudge to return to your studies">
        <Toggle value={settings.dailyReminder} onChange={(v) => setSetting('dailyReminder', v)} />
      </Row>
      <Row title="Reminder Time" sub="When to receive your daily prompt">
        <Pressable onPress={cycleTime} style={styles.timePill}>
          <Text style={styles.timeText}>{settings.reminderTime}</Text>
          <SketchIcon name="clock" size={15} color={Ink} />
        </Pressable>
      </Row>
      <Row title="Streak Alerts" sub="Warn me before my streak breaks">
        <Toggle value={settings.streakAlerts} onChange={(v) => setSetting('streakAlerts', v)} />
      </Row>
      <Row title="Badge Earned" sub="Notify when a new badge is unlocked">
        <Toggle value={settings.badgeEarned} onChange={(v) => setSetting('badgeEarned', v)} />
      </Row>
      <Row title="Weekly Summary" sub="A digest of your week's progress">
        <Toggle value={settings.weeklySummary} onChange={(v) => setSetting('weeklySummary', v)} />
      </Row>
      <Row title="Quote of the Day" sub="One quote, delivered each morning">
        <Toggle value={settings.quoteOfDay} onChange={(v) => setSetting('quoteOfDay', v)} />
      </Row>
      <Row title="Daily Quote Widget" sub="Show a fresh quote inside the app each day" last={!settings.widgetEnabled}>
        <Toggle value={settings.widgetEnabled} onChange={(v) => setSetting('widgetEnabled', v)} />
      </Row>
      {settings.widgetEnabled ? (
        <Row title="Widget Placement" sub="Where the widget appears in the app" last stack>
          <Segmented
            value={settings.widgetPlacement}
            onChange={(k) => setSetting('widgetPlacement', k as AppSettings['widgetPlacement'])}
            options={[
              { key: 'home', label: 'Home' },
              { key: 'profile', label: 'Profile' },
              { key: 'insights', label: 'Insights' },
            ]}
          />
        </Row>
      ) : null}
    </Card>
  );
}

/* ---------------- Learning ---------------- */

function LearningSection() {
  const settings = useUserDataStore((s) => s.settings);
  const setSetting = useUserDataStore((s) => s.setSetting);
  const goal = settings.dailyGoalMinutes;
  const goalLabel = goal >= 60 ? `${Math.round((goal / 60) * 10) / 10} hr` : `${goal} min`;

  return (
    <Card>
      <Header title="Learning" sub="Calibrate the pace of your practice." />
      <View style={styles.hr} />
      <View style={styles.goalRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.rowTitle}>Daily Goal</Text>
          <Text style={styles.rowSub}>{goal} minutes per day</Text>
        </View>
        <Text style={styles.goalValue}>{goalLabel}</Text>
      </View>
      <Slider value={goal} onChange={(v) => setSetting('dailyGoalMinutes', v)} min={5} max={120} step={5} />
      <View style={styles.sliderEnds}>
        <Text style={styles.endLabel}>5 min</Text>
        <Text style={styles.endLabel}>2 hrs</Text>
      </View>
      <View style={[styles.hr, { marginTop: 18 }]} />
      <Row title="Auto-advance" sub="Move to next lesson when one is complete" last>
        <Toggle value={settings.autoAdvance} onChange={(v) => setSetting('autoAdvance', v)} />
      </Row>
    </Card>
  );
}

/* ---------------- Privacy ---------------- */

function PrivacySection() {
  const settings = useUserDataStore((s) => s.settings);
  const setSetting = useUserDataStore((s) => s.setSetting);
  return (
    <Card>
      <Header title="Privacy" sub="What others can see, and what remains yours alone." />
      <View style={styles.hr} />
      <Row title="Public Profile" sub="Allow others to discover your philosopher journey">
        <Toggle value={settings.publicProfile} onChange={(v) => setSetting('publicProfile', v)} />
      </Row>
      <Row title="Show Streak Count" sub="Display your current streak on your profile">
        <Toggle value={settings.showStreak} onChange={(v) => setSetting('showStreak', v)} />
      </Row>
      <Row title="Show Rank & Badges" sub="Let others see your earned rank and badges">
        <Toggle value={settings.showRankBadges} onChange={(v) => setSetting('showRankBadges', v)} />
      </Row>
      <Row title="Usage Analytics" sub="Help improve the app with anonymous data" last>
        <Toggle value={settings.usageAnalytics} onChange={(v) => setSetting('usageAnalytics', v)} />
      </Row>
      <Text style={styles.footNote}>
        Your reading history, saved quotes, and personal notes are always private and never shared.
      </Text>
    </Card>
  );
}

/* ---------------- Language ---------------- */

function LanguageSection() {
  const settings = useUserDataStore((s) => s.settings);
  const setSetting = useUserDataStore((s) => s.setSetting);
  return (
    <Card>
      <Header title="Language" sub="The tongue in which philosophy speaks to you." />
      <View style={styles.hr} />
      <Row title="App Language" sub="The language used throughout the interface" stack>
        <Dropdown value={settings.appLanguage} options={LANGS} onChange={(v) => setSetting('appLanguage', v)} />
      </Row>
      <Row title="Quote Display" sub="How philosopher quotes appear" last stack>
        <Segmented
          value={settings.quoteDisplay}
          onChange={(k) => setSetting('quoteDisplay', k as AppSettings['quoteDisplay'])}
          options={[
            { key: 'original', label: 'Original' },
            { key: 'translated', label: 'Translated' },
            { key: 'both', label: 'Both' },
          ]}
        />
      </Row>
      <Text style={styles.footNote}>
        Translations are community-reviewed. Original Greek and Latin texts are always preserved in source lessons.
      </Text>
    </Card>
  );
}

/* ---------------- Subscription ---------------- */

function SubscriptionSection() {
  const { width } = useWindowDimensions();
  const wide = width >= 720;
  const [notice, setNotice] = useState(false);
  return (
    <Card>
      <Header title="Subscription" sub="You are on the Free plan." />
      <View style={styles.hr} />
      <View style={[styles.planRow, !wide && { flexDirection: 'column' }]}>
        {/* Free */}
        <View style={[styles.planCard, styles.planCurrent]}>
          <View style={styles.currentTag}>
            <Text style={styles.currentTagText}>CURRENT</Text>
          </View>
          <Text style={styles.planName}>FREE</Text>
          <Text style={styles.planPrice}>$0</Text>
          <Text style={styles.planNote}>Forever free</Text>
          <View style={{ marginTop: 14, gap: 10 }}>
            <Check label="1 free lesson per day" />
            <Check label="Unlimited saved quotes" />
            <Check label="Full rank progression" />
            <Check label="All 50 badges" />
            <Check label="Philosopher bios" />
          </View>
          <Text style={styles.planFoot}>Your current plan</Text>
        </View>

        {/* Scholar's Pass */}
        <View style={[styles.planCard, styles.planPro]}>
          <Text style={styles.proKicker}>SCHOLAR'S PASS</Text>
          <Text style={styles.planPrice}>
            $6.99 <Text style={styles.perMo}>/month</Text>
          </Text>
          <Text style={styles.planNote}>Billed monthly · cancel anytime</Text>
          <View style={{ marginTop: 14, gap: 10 }}>
            <Check label="Everything in Free" />
            <View style={styles.andMore}>
              <View style={styles.andLine} />
              <Text style={styles.andMoreText}>& more</Text>
              <View style={styles.andLine} />
            </View>
            <Check label="Unlimited lessons per day" />
            <Check label="Ad-free experience" />
            <Check label="Streak freeze to protect your streak" />
          </View>
          <Pressable onPress={() => setNotice(true)} style={({ pressed }) => [styles.upgradeBtn, pressed && { opacity: 0.85 }]}>
            <Text style={styles.upgradeText}>Upgrade — $6.99 / mo</Text>
          </Pressable>
        </View>
      </View>
      <Text style={styles.footNote}>
        Subscriptions renew monthly. You may cancel at any time from this page. Access continues until the end of the billing period.
      </Text>

      <ConfirmModal
        visible={notice}
        title="Coming soon"
        message="Paid plans aren't available yet — every feature is free during development. Thank you for the support!"
        confirmLabel="Got it"
        single
        onConfirm={() => setNotice(false)}
        onCancel={() => setNotice(false)}
      />
    </Card>
  );
}

/* ---------------- Data ---------------- */

function DataSection() {
  const settings = useUserDataStore((s) => s.settings);
  const setSetting = useUserDataStore((s) => s.setSetting);
  return (
    <Card>
      <Header title="Data & Storage" sub="Your progress, exports, and backups." />
      <View style={styles.hr} />
      <Row title="Auto Backup" sub="Automatically back up progress to the cloud" last>
        <Toggle value={settings.autoBackup} onChange={(v) => setSetting('autoBackup', v)} />
      </Row>
    </Card>
  );
}

/* ---------------- Danger Zone ---------------- */

function DangerSection() {
  const resetProgress = useUserDataStore((s) => s.resetProgress);
  const clearSavedQuotes = useUserDataStore((s) => s.clearSavedQuotes);
  const revokeBadges = useUserDataStore((s) => s.revokeBadges);
  const deleteAccount = useUserDataStore((s) => s.deleteAccount);

  const [confirm, setConfirm] = useState<null | { title: string; message: string; label: string; run: () => void }>(null);

  const ask = (title: string, message: string, label: string, run: () => void) =>
    setConfirm({ title, message, label, run });

  return (
    <Card>
      <Header title="Danger Zone" sub={undefined} icon="warning" />
      <View style={styles.hr} />

      <DangerRow
        title="Reset Learning Progress"
        sub="Erase all XP, ranks, and completed lessons. Cannot be undone."
        label="Reset Progress"
        onPress={() => ask('Reset Learning Progress', 'This erases all XP, ranks, and completed lessons. This cannot be undone.', 'Reset Progress', resetProgress)}
      />
      <DangerRow
        title="Clear Saved Quotes"
        sub="Permanently delete all quotes you have collected."
        label="Clear Quotes"
        onPress={() => ask('Clear Saved Quotes', 'This permanently deletes every quote you have collected.', 'Clear Quotes', clearSavedQuotes)}
      />
      <DangerRow
        title="Revoke All Badges"
        sub="Remove all earned badges from your profile."
        label="Revoke Badges"
        onPress={() => ask('Revoke All Badges', 'This removes all earned badges from your profile. They re-earn as you keep progressing.', 'Revoke Badges', revokeBadges)}
      />
      <DangerRow
        title="Delete Account"
        sub="Permanently delete your account and all associated data."
        label="Delete Account"
        last
        onPress={() =>
          ask('Delete Account', 'This permanently deletes your account and all associated data. This cannot be undone.', 'Delete Account', async () => {
            deleteAccount();
            try {
              await signOut();
            } catch {}
            router.replace('/(app)');
          })
        }
      />

      <Text style={styles.footNote}>
        These actions are irreversible. Proceed only with full intention — as a philosopher should.
      </Text>

      <ConfirmModal
        visible={!!confirm}
        title={confirm?.title ?? ''}
        message={confirm?.message ?? ''}
        confirmLabel={confirm?.label ?? 'Confirm'}
        destructive
        onConfirm={() => {
          confirm?.run();
          setConfirm(null);
        }}
        onCancel={() => setConfirm(null)}
      />
    </Card>
  );
}

function DangerRow({ title, sub, label, onPress, last }: { title: string; sub: string; label: string; onPress: () => void; last?: boolean }) {
  return (
    <View style={[styles.row, last && { borderBottomWidth: 0 }]}>
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSub}>{sub}</Text>
      </View>
      <Pressable onPress={onPress} style={({ pressed }) => [styles.dangerBtn, pressed && { backgroundColor: '#F7E9E9' }]}>
        <Text style={styles.dangerBtnText}>{label}</Text>
      </Pressable>
    </View>
  );
}

/* ---------------- Confirm modal ---------------- */

function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel,
  destructive,
  single,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  destructive?: boolean;
  single?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel} statusBarTranslucent>
      <View style={styles.modalBackdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalMsg}>{message}</Text>
          <View style={styles.modalBtns}>
            {!single && (
              <Pressable onPress={onCancel} style={({ pressed }) => [styles.modalCancel, pressed && { opacity: 0.7 }]}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
            )}
            <Pressable
              onPress={onConfirm}
              style={({ pressed }) => [styles.modalConfirm, destructive && { backgroundColor: Crimson, borderColor: Crimson }, pressed && { opacity: 0.85 }]}
            >
              <Text style={[styles.modalConfirmText, destructive && { color: Paper }]}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Page },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 14,
  },
  topTitle: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 32, color: Ink },
  saveBtn: { backgroundColor: Ink, borderRadius: 4, paddingHorizontal: 18, paddingVertical: 11 },
  saveBtnText: { fontFamily: 'Inter_700Bold', fontSize: 13, color: Paper },

  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  layout: { gap: 16 },
  layoutRow: { flexDirection: 'row', alignItems: 'flex-start' },
  layoutCol: { flexDirection: 'column' },
  contentWrap: { flex: 1 },

  // Sidebar (wide)
  sidebar: {
    width: 210,
    borderWidth: 1.5,
    borderColor: Ink,
    borderRadius: 4,
    backgroundColor: Paper,
    padding: 14,
    gap: 4,
  },
  sidebarHead: { fontFamily: 'Inter_500Medium', fontSize: 10, color: InkSoft, letterSpacing: 2, marginBottom: 10 },

  // Compact icon rail (phone)
  rail: {
    width: 52,
    borderWidth: 1.5,
    borderColor: Ink,
    borderRadius: 4,
    backgroundColor: Paper,
    paddingVertical: 8,
    paddingHorizontal: 6,
    gap: 4,
  },
  railItem: { width: 40, height: 40, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  railItemOn: { backgroundColor: Ink },
  navItem: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 11, paddingHorizontal: 7, borderRadius: 4, borderWidth: 1.5, borderColor: 'transparent' },
  navItemOn: { borderColor: Ink, borderStyle: 'dashed' },
  navText: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 13, color: InkSoft },

  // Sidebar (narrow chips)
  chipRow: { gap: 8, paddingBottom: 4 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1.5, borderColor: InkFaint, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7 },
  chipOn: { borderColor: Ink, borderStyle: 'dashed' },
  chipText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: InkSoft },

  // Card
  card: {
    borderWidth: 1.5,
    borderColor: Ink,
    borderRadius: 4,
    backgroundColor: Paper,
    padding: 22,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 0,
    shadowOffset: { width: 3, height: 4 },
    elevation: 2,
  },
  headerBlock: { marginBottom: 4 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 22, color: Ink },
  headerSub: { fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 13, color: InkSoft, marginTop: 4 },
  hr: { height: 1, backgroundColor: InkFaint, marginVertical: 16 },

  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: InkFaint },
  rowStacked: { flexDirection: 'column', alignItems: 'stretch' },
  rowTitle: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 15, color: Ink },
  rowSub: { fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 12, color: InkSoft, marginTop: 3 },

  // Toggle
  track: { width: 46, height: 26, borderRadius: 5, padding: 3, justifyContent: 'center' },
  trackOn: { backgroundColor: Ink, alignItems: 'flex-end' },
  trackOff: { backgroundColor: Paper, borderWidth: 1.5, borderColor: Ink, alignItems: 'flex-start' },
  knob: { width: 18, height: 18, borderRadius: 3 },
  knobOn: { backgroundColor: Paper },
  knobOff: { backgroundColor: Ink },

  // Time pill
  timePill: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1.5, borderColor: Ink, borderRadius: 4, paddingHorizontal: 12, paddingVertical: 8 },
  timeText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: Ink },

  // Slider
  goalRow: { flexDirection: 'row', alignItems: 'center' },
  goalValue: { fontFamily: 'Inter_500Medium', fontSize: 13, color: InkSoft },
  sliderArea: { height: 28, justifyContent: 'center', marginTop: 14 },
  sliderTrack: { position: 'absolute', left: 0, right: 0, height: 3, backgroundColor: InkFaint, borderRadius: 2 },
  sliderFill: { position: 'absolute', left: 0, height: 3, backgroundColor: Ink, borderRadius: 2 },
  sliderKnob: { position: 'absolute', width: 18, height: 18, marginLeft: -9, borderRadius: 3, backgroundColor: Ink },
  sliderEnds: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  endLabel: { fontFamily: 'Inter_400Regular', fontSize: 11, color: InkSoft },

  // Segmented
  segmented: { flexDirection: 'row', borderWidth: 1.5, borderColor: Ink, borderRadius: 4, overflow: 'hidden' },
  segBtn: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: Paper },
  segBtnOn: { backgroundColor: Ink },
  segText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: Ink },

  // Dropdown
  dropdown: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1.5, borderColor: Ink, borderRadius: 4, paddingHorizontal: 14, paddingVertical: 9 },
  dropdownText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: Ink },
  dropdownList: { position: 'absolute', top: '100%', right: 0, marginTop: 4, minWidth: 150, backgroundColor: Paper, borderWidth: 1.5, borderColor: Ink, borderRadius: 4, overflow: 'hidden', zIndex: 30 },
  dropdownItem: { paddingHorizontal: 14, paddingVertical: 10 },
  dropdownItemText: { fontFamily: 'Inter_400Regular', fontSize: 13, color: Ink },

  // Check rows
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkBox: { width: 16, height: 16, borderWidth: 1.5, borderColor: Ink, borderRadius: 3, alignItems: 'center', justifyContent: 'center' },
  checkMark: { fontFamily: 'Inter_700Bold', fontSize: 10, color: Ink, lineHeight: 12 },
  checkLabel: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 13, color: Ink },

  // Profile
  profileHeadRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 7, borderWidth: 1.5, borderColor: Ink, borderRadius: 4, paddingHorizontal: 14, paddingVertical: 9, backgroundColor: Paper },
  editText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: Ink },
  identity: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 84, height: 84, borderRadius: 6, borderWidth: 1.5, borderColor: Ink, alignItems: 'center', justifyContent: 'center' },
  idName: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 22, color: Ink },
  idRank: { fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 13, color: Gold, marginTop: 3 },
  idMeta: { fontFamily: 'Inter_400Regular', fontSize: 12, color: Gold, marginTop: 5 },
  changeLink: { fontFamily: 'Inter_400Regular', fontSize: 12, color: InkSoft, textDecorationLine: 'underline' },
  fieldLabel: { fontFamily: 'Inter_700Bold', fontSize: 10, color: InkSoft, letterSpacing: 1.5, marginTop: 16, marginBottom: 6 },
  fieldValue: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 16, color: Ink },
  bioValue: { fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 15, color: Ink },
  input: { borderWidth: 1.5, borderColor: Ink, borderRadius: 4, paddingHorizontal: 12, paddingVertical: 9, fontFamily: 'Inter_400Regular', fontSize: 15, color: Ink },
  miniStats: { flexDirection: 'row', alignItems: 'center' },
  miniDiv: { width: 1, height: 36, backgroundColor: InkFaint },
  miniValue: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 22, color: Ink },
  miniLabel: { fontFamily: 'Inter_400Regular', fontSize: 11, color: InkSoft, marginTop: 2 },

  footNote: { fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 12, color: InkSoft, lineHeight: 19, marginTop: 18 },

  // Subscription
  planRow: { flexDirection: 'row', gap: 14 },
  planCard: { flex: 1, borderWidth: 2, borderColor: Ink, borderRadius: 4, padding: 18 },
  planCurrent: {},
  planPro: {},
  currentTag: { position: 'absolute', top: -1, right: -1, backgroundColor: Ink, paddingHorizontal: 10, paddingVertical: 4 },
  currentTagText: { fontFamily: 'Inter_700Bold', fontSize: 9, color: Paper, letterSpacing: 1 },
  proKicker: { fontFamily: 'Inter_700Bold', fontSize: 11, color: Ink, letterSpacing: 1 },
  planName: { fontFamily: 'Inter_700Bold', fontSize: 12, color: InkSoft, letterSpacing: 1 },
  planPrice: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 30, color: Ink, marginTop: 6 },
  perMo: { fontFamily: 'Inter_400Regular', fontSize: 13, color: InkSoft },
  planNote: { fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 12, color: InkSoft, marginTop: 4 },
  planFoot: { fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 12, color: InkSoft, textAlign: 'center', marginTop: 18 },
  andMore: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 2 },
  andLine: { flex: 1, height: 1, backgroundColor: InkFaint },
  andMoreText: { fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 11, color: InkSoft },
  upgradeBtn: { backgroundColor: Ink, borderRadius: 4, paddingVertical: 13, alignItems: 'center', marginTop: 18 },
  upgradeText: { fontFamily: 'Inter_700Bold', fontSize: 14, color: Paper },

  // Danger
  dangerBtn: { borderWidth: 1.5, borderColor: Crimson, borderRadius: 4, paddingHorizontal: 16, paddingVertical: 10 },
  dangerBtnText: { fontFamily: 'Inter_700Bold', fontSize: 13, color: Crimson },

  // Modal
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', padding: 28 },
  modalCard: { width: '100%', maxWidth: 380, backgroundColor: Paper, borderWidth: 2, borderColor: Ink, borderRadius: 8, padding: 22 },
  modalTitle: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 20, color: Ink },
  modalMsg: { fontFamily: 'Inter_400Regular', fontSize: 14, color: InkSoft, lineHeight: 21, marginTop: 10 },
  modalBtns: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 20 },
  modalCancel: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 4, borderWidth: 1.5, borderColor: Ink },
  modalCancelText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: Ink },
  modalConfirm: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 4, borderWidth: 1.5, borderColor: Ink, backgroundColor: Ink },
  modalConfirmText: { fontFamily: 'Inter_700Bold', fontSize: 13, color: Paper },

  // Narration voice picker
  voiceCard: { width: '100%', maxWidth: 420, backgroundColor: Paper, borderWidth: 2, borderColor: Ink, borderRadius: 8, paddingHorizontal: 20, paddingTop: 18, paddingBottom: 16 },
  voiceHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  voiceHint: { fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 12.5, color: InkSoft, marginTop: 4, marginBottom: 12 },
  voiceRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: InkFaint, borderRadius: 6, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 8 },
  voiceRowOn: { borderColor: Ink, borderStyle: 'dashed', backgroundColor: '#F4F2EC' },
  voiceName: { fontFamily: 'Inter_500Medium', fontSize: 14, color: Ink },
  voiceSub: { fontFamily: 'Inter_400Regular', fontSize: 11, color: InkSoft, marginTop: 2 },
  voiceCheck: { fontFamily: 'Inter_700Bold', fontSize: 16, color: Ink },
  voiceEmpty: { fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 13, color: InkSoft, textAlign: 'center', paddingVertical: 20 },

  // Portrait picker
  pickerCard: { backgroundColor: Paper, borderWidth: 2, borderColor: Ink, borderRadius: 8, paddingHorizontal: 22, paddingTop: 20, paddingBottom: 18 },
  pickerHead: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  pickerTitle: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 24, color: Ink },
  pickerSub: { fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 13, color: InkSoft, marginTop: 3 },
  pickerClose: { paddingHorizontal: 4, paddingVertical: 2 },
  pickerCloseText: { fontFamily: 'Inter_400Regular', fontSize: 18, color: Ink },
  pickerGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  tile: { aspectRatio: 1, borderWidth: 1.5, borderColor: Ink, borderRadius: 4, backgroundColor: Paper, alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8 },
  tileOn: { backgroundColor: Ink },
  tileName: { fontFamily: 'Inter_500Medium', fontSize: 11, color: Ink, textAlign: 'center', paddingHorizontal: 2 },
  pickerFoot: { fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 12, color: InkSoft, marginTop: 14 },
});
