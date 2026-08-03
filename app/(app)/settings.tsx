import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  Modal,
  Linking,
  Platform,
  StyleSheet,
  AppState,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import SketchIcon, { type SketchIconName } from '@/components/shared/SketchIcon';
import ScreenTransition from '@/components/shared/ScreenTransition';
import { ProfileArtFill, ProfileAvatar } from '@/components/shared/ProfileArt';
import ProfileArtSheet from '@/components/shared/ProfileArtSheet';
import { backgroundById } from '@/data/profileBackgrounds';
import { PROFILE_FONTS, profileNameStyle, profileNameText } from '@/data/profileFonts';
import { signOut, deleteAccountCloud } from '@/lib/supabase/auth';
import { signOutSocial } from '@/lib/auth/social';
import { beginAccountDeletion } from '@/lib/supabase/sync';
import { addTombstone } from '@/lib/supabase/tombstone';
import { track } from '@/lib/posthog';
import { awardedRank } from '@/data/ranks';
import { useUserDataStore, type AppSettings } from '@/stores/userDataStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { purchases } from '@/lib/purchases';
import { ads } from '@/lib/ads';
import { notifications } from '@/lib/notifications';
import { FREE_DAILY_LESSON_LIMIT, lessonsWord } from '@/constants/subscription';
import { effectiveStreak } from '@/lib/utils/streak';
import { useTodayKey } from '@/lib/utils/useTodayKey';

const Page = '#F1EEE7';
const Paper = '#FFFFFF';
const Ink = '#1A1A1A';
const InkSoft = '#6B6B6B';
const InkFaint = '#E2E0D8';
const Gold = '#6B6B6B';
const Crimson = '#A83232';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const TIMES = ['06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM', '12:00 PM', '06:00 PM', '09:00 PM'];

// Where user feedback is sent (opens the user's mail app pre-addressed here).
const FEEDBACK_EMAIL = 'philosophizelearn@gmail.com';

type SectionKey = 'profile' | 'account' | 'notifications' | 'display' | 'privacy' | 'feedback' | 'subscription' | 'danger';

/**
 * The Notifications entry is present only in a binary that can actually schedule
 * one. `isSupported()` is false on web, in Expo Go, and in every APK built before
 * expo-notifications became a dependency — and an over-the-air update cannot add
 * a native module to an APK that shipped without one. Showing the section there
 * would put six switches on screen that could not possibly do anything, which is
 * the exact thing this rewrite exists to remove.
 */
const SECTIONS: { key: SectionKey; label: string; icon: SketchIconName }[] = [
  { key: 'profile', label: 'Profile', icon: 'person' },
  { key: 'account', label: 'Account', icon: 'settings' },
  ...(notifications.isSupported()
    ? [{ key: 'notifications' as const, label: 'Notifications', icon: 'bell' as const }]
    : []),
  // No 'learning' rail entry: its last control (auto-advance) is gone, and a rail
  // tab that opens an empty card is the same defect as a switch that does nothing.
  { key: 'display', label: 'Display', icon: 'book' },
  { key: 'privacy', label: 'Privacy', icon: 'lock' },
  { key: 'feedback', label: 'Feedback', icon: 'pencil' },
  { key: 'subscription', label: 'Subscription', icon: 'clock' },
  { key: 'danger', label: 'Danger Zone', icon: 'warning' },
];

export default function SettingsScreen() {
  const [section, setSection] = useState<SectionKey>('profile');
  const { width } = useWindowDimensions();
  const compact = width < 600;

  return (
    <ScreenTransition bg={Page}>
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top bar. There is no Save button: every control on every section writes
          to the store the moment it is touched. The one that used to sit here
          flashed "Saved ✓" and wrote nothing — it was reassurance about a commit
          that had already happened, which is indistinguishable from a button that
          does nothing. Profile keeps its own real Save, because Profile is the
          one section that holds a draft. */}
      <View style={[styles.topBar, compact && { paddingHorizontal: 14 }]}>
        <Text style={[styles.topTitle, compact && { fontSize: 26 }]}>Settings</Text>
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

  // Phone: a labelled rail down the side.
  //
  // This was icon-only, 52pt wide, and nine hand-drawn glyphs is far too fine a
  // distinction to navigate by — a bell, a mortarboard, a padlock and a clock all
  // read as "a small sketch", so finding Subscription meant tapping until it
  // appeared. The words cost 24pt of the content's width and remove the guessing
  // entirely, which is the right trade on a screen that is mostly rows of text.
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
              <SketchIcon name={s.icon} size={17} color={on ? Paper : InkSoft} />
              <Text
                numberOfLines={2}
                style={[styles.railLabel, on && { color: Paper, fontFamily: 'Inter_700Bold' }]}
              >
                {s.label}
              </Text>
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

function Row({ title, sub, children, last, stack, z }: { title: string; sub?: string; children?: React.ReactNode; last?: boolean; stack?: boolean; z?: number }) {
  const { width } = useWindowDimensions();
  const stacked = !!stack && width < 600;
  return (
    // `z` lifts a row (and any open dropdown inside it) above the rows below,
    // so dropdown options stay tappable instead of hiding behind the next row.
    <View style={[styles.row, stacked && styles.rowStacked, last && { borderBottomWidth: 0 }, z ? { zIndex: z } : null]}>
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
    case 'account':
      return <AccountSection />;
    case 'notifications':
      return <NotificationsSection />;
    case 'display':
      return <DisplaySection />;
    case 'privacy':
      return <PrivacySection />;
    case 'feedback':
      return <FeedbackSection />;
    case 'subscription':
      return <SubscriptionSection />;
    case 'danger':
      return <DangerSection />;
  }
}

/* ---------------- Profile ---------------- */

function ProfileSection() {
  const displayName = useUserDataStore((s) => s.displayName);
  const setProfile = useUserDataStore((s) => s.setProfile);
  const joinedAt = useUserDataStore((s) => s.joinedAt);
  const lessonsByBranch = useUserDataStore((s) => s.lessonsByBranch);
  const savedQuotes = useUserDataStore((s) => s.savedQuotes);
  const philosopherViews = useUserDataStore((s) => s.philosopherViews);
  const streakRaw = useUserDataStore((s) => s.streak);
  const lastLessonDate = useUserDataStore((s) => s.lastLessonDate);
  useTodayKey();
  const streak = effectiveStreak(streakRaw, lastLessonDate);
  const xp = useUserDataStore((s) => s.totalXP);
  const rankIndex = useUserDataStore((s) => s.rankIndex);

  const nameFont = useUserDataStore((s) => s.nameFont);
  const profileBackground = useUserDataStore((s) => s.profileBackground);
  const setNameFont = useUserDataStore((s) => s.setNameFont);
  const setProfileBackground = useUserDataStore((s) => s.setProfileBackground);

  // Everything is editable the moment the screen opens — there is no "edit
  // profile" mode to enter and no "done editing" to leave. Changes are held as a
  // DRAFT and only reach the store when Save changes is pressed, which is what
  // makes an always-on editor safe: nothing is committed by accident.
  const [draftName, setDraftName] = useState(displayName);
  const [draftFont, setDraftFont] = useState(nameFont);
  const [draftBg, setDraftBg] = useState(profileBackground);
  const [picker, setPicker] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const dirty =
    draftName.trim() !== displayName.trim() || draftFont !== nameFont || draftBg !== profileBackground;

  // A cloud sync can land while this screen is open. Adopt what it brought, but
  // never on top of unsaved edits — that would silently delete what was typed.
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;
  useEffect(() => {
    if (dirtyRef.current) return;
    setDraftName(displayName);
    setDraftFont(nameFont);
    setDraftBg(profileBackground);
  }, [displayName, nameFont, profileBackground]);

  function save() {
    const name = draftName.trim();
    if (name && name !== displayName) setProfile({ displayName: name });
    if (draftFont !== nameFont) setNameFont(draftFont);
    if (draftBg !== profileBackground) setProfileBackground(draftBg);
    if (!name) setDraftName(displayName); // an empty name is not a name
    setJustSaved(true);
  }

  useEffect(() => {
    if (!justSaved) return;
    const t = setTimeout(() => setJustSaved(false), 1800);
    return () => clearTimeout(t);
  }, [justSaved]);

  const lessons = Object.values(lessonsByBranch).reduce((a, b) => a + b, 0);
  const totalXP = xp;
  const { current } = awardedRank(rankIndex, totalXP);
  const join = joinedAt ? new Date(joinedAt) : new Date();
  const memberSince = `Member since ${MONTHS[join.getMonth()]} ${join.getFullYear()}`;
  const shownName = draftName.trim() || 'Philosopher';

  return (
    <Card>
      <Text style={styles.headerTitle}>Profile</Text>
      <View style={styles.hr} />

      <View style={styles.identity}>
        <ProfileAvatar size={84} backgroundId={draftBg} letter={shownName.charAt(0)} />
        <View style={{ flex: 1, marginLeft: 18 }}>
          <Text style={styles.idName} numberOfLines={1}>{shownName}</Text>
          <Text style={styles.idRank}>
            {current.name} · Rank {current.id}
          </Text>
          <Text style={styles.idMeta}>{memberSince}</Text>
        </View>
      </View>

      {/* THE THING THEY CAME HERE FOR. A live preview of the actual header, not a
          settings row with a chevron — it shows the art, the name in the chosen
          face, and the readability of one on the other, all at once. */}
      <Text style={styles.fieldLabel}>PICTURE &amp; BACKGROUND</Text>
      <Pressable
        onPress={() => setPicker(true)}
        style={({ pressed }) => [styles.artPreview, pressed && { opacity: 0.9 }]}
      >
        <ProfileArtFill backgroundId={draftBg} />
        <View style={styles.artPreviewInner}>
          <Text
            numberOfLines={1}
            style={[
              profileNameStyle(draftFont, 20),
              { color: backgroundById(draftBg).tone === 'dark' ? Paper : Ink },
            ]}
          >
            {profileNameText(draftFont, shownName)}
          </Text>
          <Text
            style={[
              styles.artPreviewName,
              { color: backgroundById(draftBg).tone === 'dark' ? '#C9C6BD' : '#5A574E' },
            ]}
          >
            {backgroundById(draftBg).name.toUpperCase()}
          </Text>
        </View>
        <View style={styles.artChange}>
          <SketchIcon name="pencil" size={13} color={Paper} />
          <Text style={styles.artChangeText}>CHANGE</Text>
        </View>
      </Pressable>

      <Text style={styles.fieldLabel}>DISPLAY NAME</Text>
      <TextInput
        value={draftName}
        onChangeText={setDraftName}
        style={styles.input}
        placeholder="Your name"
        placeholderTextColor={InkSoft}
        maxLength={60}
      />

      <Text style={styles.fieldLabel}>NAME FONT</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingVertical: 2, paddingRight: 4 }}
      >
        {PROFILE_FONTS.map((f) => {
          const on = f.id === draftFont;
          return (
            <Pressable
              key={f.id}
              onPress={() => setDraftFont(f.id)}
              style={({ pressed }) => [styles.fontChip, on && styles.fontChipOn, pressed && { opacity: 0.8 }]}
            >
              <Text
                numberOfLines={1}
                style={[profileNameStyle(f.id, 17), { color: on ? Paper : Ink }]}
              >
                {profileNameText(f.id, shownName)}
              </Text>
              <Text style={[styles.fontChipName, { color: on ? '#C9C6BD' : InkSoft }]}>
                {f.name.toUpperCase()}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Pressable
        onPress={save}
        disabled={!dirty}
        style={({ pressed }) => [
          styles.profileSaveBtn,
          !dirty && styles.profileSaveBtnOff,
          pressed && dirty && { opacity: 0.85 },
        ]}
      >
        <Text style={[styles.profileSaveText, !dirty && { color: InkSoft }]}>
          {justSaved && !dirty ? 'SAVED' : 'SAVE CHANGES'}
        </Text>
      </Pressable>

      <View style={styles.hr} />
      <View style={styles.miniStats}>
        <MiniStat value={lessons} label="Lessons" />
        <View style={styles.miniDiv} />
        <MiniStat value={savedQuotes.length} label="Quotes" />
        <View style={styles.miniDiv} />
        <MiniStat value={streak} label="Day Streak" />
      </View>

      <ProfileArtSheet
        visible={picker}
        value={draftBg}
        fontId={draftFont}
        name={shownName}
        onPick={setDraftBg}
        onClose={() => setPicker(false)}
      />
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

/* ---------------- Account ---------------- */

function AccountSection() {
  const email = useUserDataStore((s) => s.email);
  const settings = useUserDataStore((s) => s.settings);
  const setSetting = useUserDataStore((s) => s.setSetting);
  const [confirm, setConfirm] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const doSignOut = async () => {
    setConfirm(false);
    if (signingOut) return;
    setSigningOut(true);
    track('sign_out');
    // Supabase signOut fires SIGNED_OUT; the app's listeners then wipe local
    // data and detach the purchaser. We also clear the native Google session and
    // land the user back on the entry screen.
    try {
      await signOut();
    } catch {}
    try {
      await signOutSocial();
    } catch {}
    router.replace('/');
  };

  return (
    <Card>
      <Header title="Account" sub="The account you signed in with." />
      <View style={styles.hr} />

      <Text style={styles.fieldLabel}>SIGNED IN AS</Text>
      <Text style={styles.fieldValue}>{email || 'Your account'}</Text>

      <View style={styles.hr} />
      {/* Moved here from a "Data" section of its own, and made real: the sync
          layer now actually reads this before it uploads anything. It sits beside
          Sign Out because that is the pairing that matters — this is what decides
          whether signing out is safe. */}
      <Row title="Back Up Progress" sub="Keep this device's progress saved to your account">
        <Toggle value={settings.autoBackup} onChange={(v) => setSetting('autoBackup', v)} />
      </Row>
      {!settings.autoBackup ? (
        <View style={styles.notice}>
          <Text style={styles.noticeText}>
            Backup is off. Progress made from now on stays on this phone — it won't reach your other devices,
            and signing out will lose it.
          </Text>
        </View>
      ) : null}
      <Row title="Sign Out" sub="Sign out on this device — your progress stays saved to your account." last stack>
        <Pressable
          onPress={() => setConfirm(true)}
          disabled={signingOut}
          style={({ pressed }) => [styles.signOutBtn, pressed && { opacity: 0.85 }]}
        >
          <SketchIcon name="back" size={15} color={Ink} />
          <Text style={styles.signOutText}>{signingOut ? 'Signing out…' : 'Sign Out'}</Text>
        </Pressable>
      </Row>
      <Text style={styles.footNote}>
        Signing out clears your data from this device; it syncs back the next time you sign in with this account.
      </Text>

      <ConfirmModal
        visible={confirm}
        title="Sign Out"
        message="You'll be signed out on this device. Your progress is saved to your account and returns when you sign back in."
        confirmLabel="Sign Out"
        onConfirm={doSignOut}
        onCancel={() => setConfirm(false)}
      />
    </Card>
  );
}

/* ---------------- Notifications ---------------- */

function NotificationsSection() {
  const settings = useUserDataStore((s) => s.settings);
  const setSetting = useUserDataStore((s) => s.setSetting);
  // Whether the OS will let us through. Everything in this section depends on it,
  // and it can change while the app is backgrounded (the reader revoking it in
  // system settings), so it is re-read on every return to the foreground.
  const [granted, setGranted] = useState<boolean | null>(null);
  const [asking, setAsking] = useState(false);
  useEffect(() => {
    let alive = true;
    const read = () => {
      void notifications.hasPermission().then((g) => { if (alive) setGranted(g); });
    };
    read();
    const sub = AppState.addEventListener('change', (s) => { if (s === 'active') read(); });
    return () => { alive = false; sub.remove(); };
  }, []);

  const cycleTime = () => {
    const i = TIMES.indexOf(settings.reminderTime);
    setSetting('reminderTime', TIMES[(i + 1) % TIMES.length]);
  };

  // Turning one ON is the moment to ask — nobody wants a permission prompt for
  // reminders they have not asked for. If it is refused the switch stays off,
  // because a switch that is on while the OS silently drops every notification is
  // the same lie in a new costume.
  const enable = async (key: 'dailyReminder' | 'streakAlerts' | 'quoteOfDay', v: boolean) => {
    if (!v) { setSetting(key, false); return; }
    if (granted) { setSetting(key, true); return; }
    setAsking(true);
    const ok = await notifications.requestPermission();
    setAsking(false);
    setGranted(ok);
    if (ok) setSetting(key, true);
  };

  const blocked = granted === false;
  return (
    <Card>
      <Header title="Notifications" sub="Choose what interrupts your contemplation." />
      <View style={styles.hr} />

      {blocked ? (
        <View style={styles.notice}>
          <Text style={styles.noticeText}>
            {asking
              ? 'Waiting for permission…'
              : 'Notifications are switched off for Philosophize in your phone’s settings. Nothing below can be delivered until they are allowed.'}
          </Text>
          <Pressable
            onPress={() => Linking.openSettings().catch(() => {})}
            style={({ pressed }) => [styles.manageBtn, { alignSelf: 'flex-start', marginTop: 12 }, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.manageText}>Open phone settings</Text>
          </Pressable>
        </View>
      ) : null}

      <Row title="Daily Reminder" sub="A gentle nudge to return to your studies">
        <Toggle value={settings.dailyReminder && !blocked} onChange={(v) => void enable('dailyReminder', v)} />
      </Row>
      <Row title="Reminder Time" sub="When the daily nudge arrives">
        <Pressable onPress={cycleTime} style={styles.timePill}>
          <Text style={styles.timeText}>{settings.reminderTime}</Text>
          <SketchIcon name="clock" size={15} color={Ink} />
        </Pressable>
      </Row>
      <Row title="Streak Alerts" sub="A warning at 8pm on a day you haven't studied">
        <Toggle value={settings.streakAlerts && !blocked} onChange={(v) => void enable('streakAlerts', v)} />
      </Row>
      <Row title="Quote of the Day" sub="One quote each morning at 9am" last>
        <Toggle value={settings.quoteOfDay && !blocked} onChange={(v) => void enable('quoteOfDay', v)} />
      </Row>
      <Text style={styles.footNote}>
        These are scheduled on this phone, not sent from a server — they arrive whether or not you have a
        connection, and nothing about your studies leaves the device.
      </Text>
    </Card>
  );
}

/* ---------------- Display ---------------- */

function DisplaySection() {
  const settings = useUserDataStore((s) => s.settings);
  const setSetting = useUserDataStore((s) => s.setSetting);
  return (
    <Card>
      <Header title="Display" sub="What the app shows you, and where." />
      <View style={styles.hr} />
      <Row title="Daily Quote Card" sub="A fresh quote inside the app each day" last={!settings.widgetEnabled}>
        <Toggle value={settings.widgetEnabled} onChange={(v) => setSetting('widgetEnabled', v)} />
      </Row>
      {settings.widgetEnabled ? (
        <Row title="Where It Appears" sub="The screen the card is shown on" last stack>
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
      <Text style={styles.footNote}>
        This is the card inside the app. The Android home-screen widget is added from your home screen and
        keeps its own quote.
      </Text>
    </Card>
  );
}

/* ---------------- Learning — the whole section is gone ---------------- */

// THE DAILY GOAL WENT FIRST, then auto-advance, and with it the section.
//
// The goal's one reader outside this screen was the dot row under the streak on
// Home; that row was removed, which by §22 left a control writing a number nothing
// displayed. Auto-advance went for a different reason: it was not decoration — it
// worked, it was ON by default, and what it did was throw the reader into the next
// lesson the instant they finished one, so the moment they had just earned went by
// off-screen. Finishing a lesson now lands on the branch and plays the advance
// instead, which is the thing the toggle was standing in front of.
//
// Both keys are removed from DEFAULT_SETTINGS as well, not just from this screen.
// That is what lets sanitizeSettings() prune them from AsyncStorage and the cloud
// snapshot — a key left behind in the defaults is re-adopted on every load and
// pushed back up forever.

/* ---------------- Privacy ---------------- */

function PrivacySection() {
  const settings = useUserDataStore((s) => s.settings);
  const setSetting = useUserDataStore((s) => s.setSetting);
  // Only users whose jurisdiction requires it (EEA/UK/CH) are offered a way back
  // into the ad-consent form — everyone else was never asked in the first place,
  // so a "manage consent" row would be a confusing dead end. Read once on mount:
  // ads.initialize() runs at launch, long before Settings can be opened.
  const [adPrivacy, setAdPrivacy] = useState(false);
  useEffect(() => {
    setAdPrivacy(ads.privacyOptionsRequired());
  }, []);
  return (
    <Card>
      <Header title="Privacy" sub="What others can see, and what remains yours alone." />
      <View style={styles.hr} />
      {/* "Public Profile", "Show Streak Count" and "Show Rank & Badges" used to
          head this section. Nothing in the app can see another person's profile —
          there is no directory, no friends list, no sharing — so those three
          switches guarded a door that does not exist, and no amount of wiring
          could have made them true. They are gone rather than implemented. */}
      <Row
        title="Usage Analytics"
        sub="Help improve the app with anonymous data"
        last={!adPrivacy}
      >
        <Toggle value={settings.usageAnalytics} onChange={(v) => setSetting('usageAnalytics', v)} />
      </Row>
      {adPrivacy && (
        <Row title="Ad Privacy Settings" sub="Change or withdraw your consent for personalised ads" last>
          <Pressable
            onPress={() => ads.showPrivacyOptions()}
            style={({ pressed }) => [styles.manageBtn, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.manageText}>Manage</Text>
          </Pressable>
        </Row>
      )}
      <Text style={styles.footNote}>
        Your reading history, saved quotes, and personal notes are yours alone — no one else can see your
        profile, and nothing here is shared with other readers.
      </Text>
    </Card>
  );
}

/* ---------------- Feedback ---------------- */

function FeedbackSection() {
  const openMail = () => {
    const subject = encodeURIComponent('Philosophize feedback');
    const body = encodeURIComponent("Hi — here's my feedback on Philosophize:\n\n");
    Linking.openURL(`mailto:${FEEDBACK_EMAIL}?subject=${subject}&body=${body}`).catch(() => {});
  };
  return (
    <Card>
      <Header title="Feedback" sub="Found a bug, or have an idea? We'd love to hear from you." />
      <View style={styles.hr} />
      <Row title="Send feedback" sub="Opens your mail app, addressed to our team" last stack>
        <Pressable onPress={openMail} style={({ pressed }) => [styles.feedbackBtn, pressed && { opacity: 0.85 }]}>
          <SketchIcon name="pencil" size={15} color={Paper} />
          <Text style={styles.feedbackBtnText}>Email us</Text>
        </Pressable>
      </Row>
      <Text style={styles.footNote}>
        Or write to us directly at {FEEDBACK_EMAIL}. Every message is read by a real person.
      </Text>
    </Card>
  );
}

/* ---------------- Subscription ---------------- */

function SubscriptionSection() {
  const { width } = useWindowDimensions();
  const wide = width >= 720;
  const isPro = useSubscriptionStore((s) => s.isPro);
  const [confirmCancel, setConfirmCancel] = useState(false);
  useEffect(() => {
    track('paywall_viewed', { source: 'settings' });
  }, []);

  // Google Play / the App Store owns cancellation — an app can't cancel a store
  // subscription itself. Send the user to the store's manage-subscription page
  // (RevenueCat's managementURL when available, else the generic account page).
  const storeName = Platform.OS === 'ios' ? 'the App Store' : 'Google Play';
  const openManageSubscription = async () => {
    setConfirmCancel(false);
    track('subscription_manage_opened', { source: 'settings' });
    let url: string | null = null;
    try {
      url = await purchases.getManagementURL();
    } catch {}
    if (!url) {
      url =
        Platform.OS === 'ios'
          ? 'https://apps.apple.com/account/subscriptions'
          : 'https://play.google.com/store/account/subscriptions';
    }
    Linking.openURL(url).catch(() => {});
  };
  return (
    <Card>
      <Header title="Subscription" sub={isPro ? 'You have Scholar’s Pass.' : 'You are on the Free plan.'} />
      <View style={styles.hr} />
      <View style={[styles.planRow, !wide && { flexDirection: 'column' }]}>
        {/* Free */}
        <View style={[styles.planCard, !isPro && styles.planCurrent]}>
          {!isPro && (
            <View style={styles.currentTag}>
              <Text style={styles.currentTagText}>CURRENT</Text>
            </View>
          )}
          <Text style={styles.planName}>FREE</Text>
          <Text style={styles.planPrice}>$0</Text>
          <Text style={styles.planNote}>Forever free</Text>
          <View style={{ marginTop: 14, gap: 10 }}>
            <Check label={`${FREE_DAILY_LESSON_LIMIT} free ${lessonsWord(FREE_DAILY_LESSON_LIMIT)} per day`} />
            <Check label="Unlimited saved quotes" />
            <Check label="Full rank progression" />
            <Check label="All 50 badges" />
            <Check label="Philosopher bios" />
          </View>
          {!isPro && <Text style={styles.planFoot}>Your current plan</Text>}
        </View>

        {/* Scholar's Pass */}
        <View style={[styles.planCard, styles.planPro]}>
          {isPro && (
            <View style={styles.currentTag}>
              <Text style={styles.currentTagText}>CURRENT</Text>
            </View>
          )}
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
          </View>
          {isPro ? (
            <Text style={styles.planFoot}>Active — thank you for your support</Text>
          ) : (
            <Pressable
              onPress={() => router.push('/(app)/paywall')}
              style={({ pressed }) => [styles.upgradeBtn, pressed && { opacity: 0.85 }]}
            >
              <Text style={styles.upgradeText}>Upgrade — $6.99 / mo</Text>
            </Pressable>
          )}
        </View>
      </View>
      {isPro && (
        <Pressable
          onPress={() => setConfirmCancel(true)}
          style={({ pressed }) => [styles.cancelSubBtn, pressed && { backgroundColor: '#F7E9E9' }]}
        >
          <Text style={styles.cancelSubText}>Cancel subscription</Text>
        </Pressable>
      )}

      <Text style={styles.footNote}>
        Subscriptions renew monthly. Cancelling is done through {storeName}; your Scholar’s Pass stays active until the end of the current billing period.
      </Text>

      <ConfirmModal
        visible={confirmCancel}
        title="Cancel subscription"
        message={`This opens ${storeName}, where you can cancel Scholar’s Pass. Your access stays active until the end of the current billing period.`}
        confirmLabel={`Continue to ${storeName}`}
        onConfirm={openManageSubscription}
        onCancel={() => setConfirmCancel(false)}
      />
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
            // Suppress further cloud pushes so a debounced/in-flight snapshot
            // can't re-create the row mid-deletion.
            beginAccountDeletion();
            // Erase the cloud copy (row + auth user). If the row deletion can't
            // be confirmed (offline / policy not deployed), drop a tombstone so
            // the data is never resurrected and erasure is retried next login —
            // the user still gets to delete + sign out immediately.
            let result: { ok: boolean; userId: string | null } = { ok: true, userId: null };
            try {
              result = await deleteAccountCloud();
            } catch {
              result = { ok: false, userId: null };
            }
            if (result.userId && !result.ok) {
              try {
                await addTombstone(result.userId);
              } catch {}
            }
            deleteAccount();
            try {
              await signOut();
            } catch {}
            // Detach the purchaser identity so the next (anonymous) user doesn't
            // inherit this account's RevenueCat customer.
            try {
              await purchases.logOut();
            } catch {}
            router.replace('/');
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

  // Labelled rail (phone). 78 wide, and the number is measured rather than
  // judged: 'Notifications' is the longest word with nowhere to wrap, and in
  // Inter 700 at 9.5 it is 59.7pt. After the 1.5 borders, 4 of rail padding and
  // 2 of item padding on each side, 63pt is left — so it clears by 3.3pt. It is
  // BOLD that has to fit, because the selected label switches weight. An earlier
  // 76 with wider padding left 59pt and would have clipped it by half a point.
  rail: {
    width: 78,
    borderWidth: 1.5,
    borderColor: Ink,
    borderRadius: 4,
    backgroundColor: Paper,
    paddingVertical: 7,
    paddingHorizontal: 4,
    gap: 3,
  },
  railItem: { borderRadius: 4, alignItems: 'center', justifyContent: 'center', paddingVertical: 8, paddingHorizontal: 2, gap: 4 },
  railItemOn: { backgroundColor: Ink },
  railLabel: {
    fontFamily: 'Inter_500Medium', fontSize: 9.5, lineHeight: 12, color: InkSoft,
    textAlign: 'center', includeFontPadding: false,
  },
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
  identity: { flexDirection: 'row', alignItems: 'center' },

  // The picture-and-background control: a live miniature of the real header.
  artPreview: {
    height: 112,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: Ink,
    justifyContent: 'flex-end',
  },
  artPreviewInner: { padding: 12 },
  artPreviewName: {
    fontFamily: 'Inter_700Bold', fontSize: 8, letterSpacing: 1.6, marginTop: 4,
    includeFontPadding: false,
  },
  artChange: {
    position: 'absolute', top: 10, right: 10,
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Ink, borderRadius: 4, paddingHorizontal: 10, paddingVertical: 6,
  },
  artChangeText: { fontFamily: 'Inter_700Bold', fontSize: 9.5, color: Paper, letterSpacing: 1.4 },

  fontChip: {
    minWidth: 96,
    maxWidth: 190,
    borderWidth: 1.5,
    borderColor: InkFaint,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: Paper,
    alignItems: 'center',
  },
  fontChipOn: { backgroundColor: Ink, borderColor: Ink },
  fontChipName: {
    fontFamily: 'Inter_700Bold', fontSize: 7.5, letterSpacing: 1.3, marginTop: 5,
    includeFontPadding: false,
  },

  profileSaveBtn: {
    marginTop: 18,
    height: 48,
    borderRadius: 6,
    backgroundColor: Ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileSaveBtnOff: { backgroundColor: '#EFEEE9' },
  profileSaveText: { fontFamily: 'Inter_700Bold', fontSize: 13, color: Paper, letterSpacing: 2 },
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

  // Feedback
  feedbackBtn: { flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: Ink, borderRadius: 4, paddingHorizontal: 20, paddingVertical: 12 },
  feedbackBtnText: { fontFamily: 'Inter_700Bold', fontSize: 14, color: Paper },

  // An inline note that a control is currently unable to do its job (permission
  // refused, backup switched off). Ink on a tinted panel, not red — it is a state
  // of affairs, not an error.
  notice: { backgroundColor: '#F4F2EC', borderLeftWidth: 3, borderLeftColor: Ink, padding: 14, marginTop: 14 },
  noticeText: { fontFamily: 'Inter_400Regular', fontSize: 12.5, lineHeight: 19, color: Ink },

  // Privacy
  manageBtn: { borderWidth: 1.5, borderColor: Ink, borderRadius: 4, paddingHorizontal: 16, paddingVertical: 9, backgroundColor: Paper },
  manageText: { fontFamily: 'Inter_700Bold', fontSize: 13, color: Ink },

  // Account
  signOutBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1.5, borderColor: Ink, borderRadius: 4, paddingHorizontal: 18, paddingVertical: 11, backgroundColor: Paper },
  signOutText: { fontFamily: 'Inter_700Bold', fontSize: 13, color: Ink },

  // Cancel subscription
  cancelSubBtn: { alignSelf: 'flex-start', borderWidth: 1.5, borderColor: Crimson, borderRadius: 4, paddingHorizontal: 18, paddingVertical: 11, marginTop: 18 },
  cancelSubText: { fontFamily: 'Inter_700Bold', fontSize: 13, color: Crimson },

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
