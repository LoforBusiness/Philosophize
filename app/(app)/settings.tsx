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
import * as Application from 'expo-application';
import { router } from 'expo-router';
import SketchIcon, { type SketchIconName } from '@/components/shared/SketchIcon';
import ScreenTransition from '@/components/shared/ScreenTransition';
import Button from '@/components/ui/Button';
import UICard from '@/components/ui/Card';
import { C, TYPE, SPACE, RADIUS, type TypeKey } from '@/constants/design';
import { ProfileArtFill, ProfileAvatar } from '@/components/shared/ProfileArt';
import ProfileArtSheet from '@/components/shared/ProfileArtSheet';
import { SvgXml } from 'react-native-svg';
import { backgroundById } from '@/data/profileBackgrounds';
import { WIDGET_BACKGROUNDS } from '@/components/widget/backgrounds';

/** The swatch's own size, so the scene is drawn to the shape it is shown at.
 *  Must match `sceneThumb` below — a scene is a function of its box now. */
const WIDGET_SWATCH_W = 66;
const WIDGET_SWATCH_H = 29;
import { PROFILE_FONTS, profileNameStyle, profileNameText } from '@/data/profileFonts';
import { signOut, deleteAccountCloud } from '@/lib/supabase/auth';
import { signOutSocial } from '@/lib/auth/social';
import { beginAccountDeletion } from '@/lib/supabase/sync';
import { addTombstone } from '@/lib/supabase/tombstone';
import { track } from '@/lib/posthog';
import { awardedRank } from '@/data/ranks';
import { useUserDataStore, type AppSettings } from '@/stores/userDataStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { useUIStore } from '@/stores/uiStore';
import { purchases } from '@/lib/purchases';
import { ads } from '@/lib/ads';
import { notifications } from '@/lib/notifications';
import { sound } from '@/lib/sound';
import { cue, soundSupported } from '@/lib/feedback';
import { FREE_DAILY_LESSON_LIMIT, lessonsWord } from '@/constants/subscription';
import { effectiveStreak } from '@/lib/utils/streak';
import { restDaysHeld } from '@/constants/streak';
import { useTodayKey } from '@/lib/utils/useTodayKey';

// THE SEVEN LOCAL COLOUR CONSTANTS ARE GONE. They were `Page #F1EEE7`,
// `Paper #FFFFFF`, `Ink #1A1A1A`, `InkSoft #6B6B6B`, `InkFaint #E2E0D8`,
// `Gold #6B6B6B` and `Crimson #A83232` — and `Gold` was the same hex as
// `InkSoft`, which is the whole problem in one line: two names for one grey,
// so nothing could tell you whether a difference was meant. Everything now
// reads from `constants/design.ts`, and `scripts/check-ui.mjs` fails the build
// if a colour of this screen's own ever comes back.
//
// A note on the two near-whites, because they are not interchangeable:
// `C.surface` is a SURFACE (the card under your finger, the knob) and `C.paper`
// is the FOREGROUND used on ink (button text, an icon on a filled row). The
// contrast pair the validator measures is `paper on ink`, so type on a black
// fill takes `paper`; a panel takes `surface`.

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const TIMES = ['06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM', '12:00 PM', '06:00 PM', '09:00 PM'];

// Where user feedback is sent (opens the user's mail app pre-addressed here).
const FEEDBACK_EMAIL = 'philosophizelearn@gmail.com';

type SectionKey = 'profile' | 'account' | 'notifications' | 'sound' | 'display' | 'privacy' | 'feedback' | 'subscription' | 'danger';

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
  // Sound earns its entry the same way (§22): `settings.soundEffects` is read by
  // lib/feedback.ts, outside this screen. Spoken narration used to head this
  // section and was removed entirely — see SoundSection.
  { key: 'sound', label: 'Sound', icon: 'mic' },
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
    <ScreenTransition bg={C.surfaceSoft}>
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top bar. There is no Save button: every control on every section writes
          to the store the moment it is touched. The one that used to sit here
          flashed "Saved ✓" and wrote nothing — it was reassurance about a commit
          that had already happened, which is indistinguishable from a button that
          does nothing. Profile keeps its own real Save, because Profile is the
          one section that holds a draft. */}
      <View style={[styles.topBar, compact && { paddingHorizontal: SPACE[2] }]}>
        <Text style={styles.topTitle}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, compact && { paddingHorizontal: SPACE[2] }]} showsVerticalScrollIndicator={false}>
        <View style={[styles.layout, styles.layoutRow, { gap: compact ? SPACE[2] : SPACE[3] }]}>
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
              <SketchIcon name={s.icon} size={17} color={on ? C.paper : C.inkSoft} />
              <Text
                numberOfLines={2}
                style={[styles.railLabel, on && { color: C.paper, fontFamily: 'Inter_700Bold' }]}
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
            <SketchIcon name={s.icon} size={18} color={on ? C.ink : C.inkSoft} />
            <Text
              style={[styles.navText, on && { color: C.ink, fontFamily: 'Inter_700Bold' }]}
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

/** A section panel. This used to be a hand-rolled View with its own border, its
 *  own radius and a hard offset shadow; it is the shared `Card` now, at the
 *  screen's own padding — the ONE surface definition the whole app draws. It
 *  keeps no `onPress`, so by the affordance rule it correctly has no lip: a
 *  section is a sheet of paper, not a button. */
function Card({ children }: { children: React.ReactNode }) {
  const { width } = useWindowDimensions();
  return <UICard pad={width < 600 ? 3 : 4}>{children}</UICard>;
}

function Header({ title, sub, icon }: { title: string; sub?: string; icon?: SketchIconName }) {
  return (
    <View style={styles.headerBlock}>
      <View style={styles.headerRow}>
        {icon ? <SketchIcon name={icon} size={20} color={C.ink} /> : null}
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
      <View style={stacked ? { width: '100%' } : { flex: 1, paddingRight: SPACE[2] }}>
        <Text style={styles.rowTitle}>{title}</Text>
        {sub ? <Text style={styles.rowSub}>{sub}</Text> : null}
      </View>
      <View style={stacked ? { width: '100%', marginTop: SPACE[2], alignItems: 'flex-start' } : undefined}>
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
            <Text style={[styles.segText, on && { color: C.paper }]}>{o.label}</Text>
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
    case 'sound':
      return <SoundSection />;
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
  const restDaysEarned = useUserDataStore((s) => s.restDaysEarned);
  const restDaysUsed = useUserDataStore((s) => s.restDaysUsed);
  useTodayKey();
  const streak = effectiveStreak(
    streakRaw,
    lastLessonDate,
    restDaysHeld(restDaysEarned, restDaysUsed),
  );
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
        <View style={{ flex: 1, marginLeft: SPACE[3] }}>
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
              profileNameStyle(draftFont, TYPE.title.fontSize),
              { color: backgroundById(draftBg).tone === 'dark' ? C.paper : C.ink },
            ]}
          >
            {profileNameText(draftFont, shownName)}
          </Text>
          <Text
            style={[
              styles.artPreviewName,
              // Both of these were their own hex — `#C9C6BD` and `#5A574E`, a pale
              // grey and a warm one, four points from tokens that already existed.
              { color: backgroundById(draftBg).tone === 'dark' ? C.dim : C.inkSoft },
            ]}
          >
            {backgroundById(draftBg).name.toUpperCase()}
          </Text>
        </View>
        <View style={styles.artChange}>
          <SketchIcon name="pencil" size={13} color={C.paper} />
          <Text style={styles.artChangeText}>CHANGE</Text>
        </View>
      </Pressable>

      <Text style={styles.fieldLabel}>DISPLAY NAME</Text>
      <TextInput
        value={draftName}
        onChangeText={setDraftName}
        style={styles.input}
        placeholder="Your name"
        placeholderTextColor={C.inkSoft}
        maxLength={60}
      />

      <Text style={styles.fieldLabel}>NAME FONT</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: SPACE[1], paddingVertical: SPACE[0], paddingRight: SPACE[0] }}
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
                style={[profileNameStyle(f.id, TYPE.body.fontSize), { color: on ? C.paper : C.ink }]}
              >
                {profileNameText(f.id, shownName)}
              </Text>
              <Text style={[styles.fontChipName, { color: on ? C.dim : C.inkSoft }]}>
                {f.name.toUpperCase()}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* The one real Save on this screen (Profile holds a draft; nothing else
          does). Same handler, same disabled rule, same two labels — the shared
          Button draws it now, so its dimmed state and its press come from the
          same place as every other button in the app. */}
      <Button
        label={justSaved && !dirty ? 'SAVED' : 'SAVE CHANGES'}
        onPress={save}
        disabled={!dirty}
        size="lg"
        style={{ marginTop: SPACE[3] }}
      />

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
        <Button
          label={signingOut ? 'Signing out…' : 'Sign Out'}
          onPress={() => setConfirm(true)}
          disabled={signingOut}
          variant="secondary"
          icon="back"
        />
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
  const bumpReminders = useUIStore((s) => s.bumpReminders);
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
    // The same trap as the reward-screen prompt: this switch READ as off only
    // because permission was missing, so the stored value was very likely
    // already true and `setSetting` is a no-op. Without this the scheduler sees
    // no change and nothing is laid down until the next foreground.
    if (ok) bumpReminders();
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
              : 'Notifications are switched off for Deeply in your phone’s settings. Nothing below can be delivered until they are allowed.'}
          </Text>
          <Button
            label="Open phone settings"
            onPress={() => Linking.openSettings().catch(() => {})}
            variant="secondary"
            style={{ alignSelf: 'flex-start', marginTop: SPACE[2] }}
          />
        </View>
      ) : null}

      <Row title="Daily Reminder" sub="A gentle nudge to return to your studies">
        <Toggle value={settings.dailyReminder && !blocked} onChange={(v) => void enable('dailyReminder', v)} />
      </Row>
      <Row title="Reminder Time" sub="When the daily nudge arrives">
        {/* Still one tap, still cycling through TIMES, still showing the stored
            value as its label. The clock now sits before the time rather than
            after it, because that is the order the shared Button draws an icon —
            the alternative was a second, near-identical button definition. */}
        <Button label={settings.reminderTime} onPress={cycleTime} variant="secondary" icon="clock" />
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

/**
 * The home-screen widget's backdrop, chosen from thumbnails rather than a list of
 * names — these are pictures, and "Colonnade" tells you nothing about what you are
 * about to put on your home screen.
 *
 * Each thumbnail is the real scene SVG at the widget's own proportions, so what is
 * previewed is exactly what Android will draw. Picking one re-renders any PLACED
 * widget immediately; without that the change would not show until the next
 * three-hour refresh and would read as broken. The require is dynamic and wrapped
 * because it reaches react-native-android-widget, which does not exist on web or
 * in Expo Go.
 */
function WidgetSceneRow() {
  const chosen = useUserDataStore((s) => s.settings.widgetBackground);
  const setSetting = useUserDataStore((s) => s.setSetting);
  const pick = (id: string) => {
    setSetting('widgetBackground', id);
    try {
      require('@/lib/widget/render').refreshQuoteWidget();
    } catch {}
  };
  return (
    <View style={styles.sceneRow}>
      {WIDGET_BACKGROUNDS.map((b) => {
        const on = b.id === chosen;
        return (
          <Pressable key={b.id} onPress={() => pick(b.id)} style={styles.sceneItem} hitSlop={4}>
            <View style={[styles.sceneThumb, on && styles.sceneThumbOn]}>
              <SvgXml xml={b.svg(WIDGET_SWATCH_W, WIDGET_SWATCH_H)} width="100%" height="100%" />
            </View>
            <Text style={[styles.sceneName, on && styles.sceneNameOn]} numberOfLines={1}>
              {b.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

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
      <View style={styles.hr} />
      <Row title="Home-Screen Widget" sub="The scene the quote is printed on" last stack>
        <WidgetSceneRow />
      </Row>
      <Text style={styles.footNote}>
        The card inside the app and the Android home-screen widget keep their own quotes. The scene above is
        the home-screen one; changing it redraws the widget straight away.
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

/* ---------------- Sound ---------------- */

/**
 * SPOKEN NARRATION WAS HERE, AND IS GONE.
 *
 * The lessons read themselves aloud for a day. The voice was the best the device
 * had — the picker that found it worked, and the answer it gave was the same on
 * every listen — but device text-to-speech has no emotion to give, and a flat
 * reading of writing this deliberate was worse than silence. The alternatives that
 * can act are all cloud services or GPU models; none of them is free without an
 * account, a card, or hardware, and none was worth those for a voice-over.
 *
 * So the whole of it went: the hook, the word-by-word reveal it paced, the switch,
 * and the store key behind it. The narration line is a plain paragraph again.
 *
 * `lib/voice.ts` deliberately SURVIVES. It is device-voice selection, and the
 * dormant story scenes (§12) still import it — deleting it would break files this
 * change has no business touching.
 */
function SoundSection() {
  const settingsAll = useUserDataStore((s) => s.settings);
  const setSettingAll = useUserDataStore((s) => s.setSetting);

  return (
    <Card>
      <Header title="Sound" sub="Whether the app answers when you touch it." icon="mic" />
      <View style={styles.hr} />

      {/* SOUND AND HAPTICS SHARE ONE SWITCH, and one key, because they are one
          idea: whether the app answers when you touch it. Splitting them would
          give the reader two controls for a single sensation and put the burden
          of a distinction on them that only exists inside the code.

          The sub-line changes with what the binary can actually do. `expo-audio`
          arrived after the shipped builds, and §22's rule is absolute — an
          over-the-air update cannot add a native module — so on a current install
          this switch governs the taps you FEEL and nothing more. Saying so is the
          same honesty the Notifications section practises by being absent: better
          a control that states its reach than one that quietly half-works. */}
      <Row
        title="Sound & haptics"
        sub={
          soundSupported()
            ? 'Footfalls, taps, and a chime when a lesson ends. Short, quiet, mixed under whatever else you are playing — and silent when your phone is.'
            : 'Taps answer with a small vibration. Sounds arrive with the next app update — they need a part of the app that only a new install can carry.'
        }
        last
      >
        <Toggle
          value={settingsAll.soundEffects}
          onChange={(v) => {
            setSettingAll('soundEffects', v);
            sound.setEnabled(v);
            // Answer the switch with the thing the switch controls. It used to
            // preview the button tap; that sound no longer exists, so it previews
            // the note a correct answer makes instead — which is a better sample
            // of what turning this on actually gets you.
            if (v) cue('right');
          }}
        />
      </Row>
    </Card>
  );
}

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
          <Button label="Manage" onPress={() => ads.showPrivacyOptions()} variant="secondary" />
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
    const subject = encodeURIComponent('Deeply feedback');
    const body = encodeURIComponent("Hi — here's my feedback on Deeply:\n\n");
    Linking.openURL(`mailto:${FEEDBACK_EMAIL}?subject=${subject}&body=${body}`).catch(() => {});
  };
  return (
    <Card>
      <Header title="Feedback" sub="Found a bug, or have an idea? We'd love to hear from you." />
      <View style={styles.hr} />
      <Row title="Send feedback" sub="Opens your mail app, addressed to our team" last stack>
        <Button label="Email us" onPress={openMail} icon="pencil" />
      </Row>
      <Text style={styles.footNote}>
        Or write to us directly at {FEEDBACK_EMAIL}. Every message is read by a real person.
      </Text>
      <VersionLine />
    </Card>
  );
}

/**
 * The version, and the way in to the lesson tester.
 *
 * Seven taps. The count is local state and the unlock is session-scoped in
 * uiStore, never persisted — so it cannot be left switched on by accident on a
 * real user's phone, and a reader who taps a version number seven times by
 * accident has still done nothing but reveal a list of lessons that record
 * nothing. Once unlocked the row below it appears; in a dev build it is already
 * there. See app/(app)/devlessons.tsx for why this is not a feature.
 */
function VersionLine() {
  const devUnlocked = useUIStore((s) => s.devUnlocked);
  const unlockDev = useUIStore((s) => s.unlockDev);
  const [taps, setTaps] = useState(0);
  const build = Application.nativeBuildVersion ?? '—';
  return (
    <>
      <Pressable
        onPress={() => {
          const n = taps + 1;
          setTaps(n);
          if (n >= 7) unlockDev();
        }}
      >
        <Text style={styles.footNote}>
          Version {Application.nativeApplicationVersion ?? '1.0.0'} ({build})
          {!devUnlocked && taps >= 3 ? `  ·  ${7 - taps} more` : ''}
        </Text>
      </Pressable>
      {devUnlocked && (
        <Row title="Lesson tester" sub="Open any lesson. Nothing is recorded." last stack>
          <Button
            label="Browse lessons"
            // The typed-route table is generated by Metro at dev-server start, so
            // a route added while it is not running is not in the union yet.
            onPress={() => router.push('/(app)/devlessons' as never)}
            icon="book"
          />
        </Row>
      )}
    </>
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
        {/* `planCol` carries the flex that `planCard` used to, because the
            shared Card puts a `style` prop on its FACE, not on the box that
            has to share the row. */}
        <View style={styles.planCol}>
          <UICard pad={3}>
            {!isPro && (
              <View style={styles.currentTag}>
                <Text style={styles.currentTagText}>CURRENT</Text>
              </View>
            )}
            <Text style={styles.planName}>FREE</Text>
            <Text style={styles.planPrice}>$0</Text>
            <Text style={styles.planNote}>Forever free</Text>
            <View style={{ marginTop: SPACE[2], gap: SPACE[1] }}>
              <Check label={`${FREE_DAILY_LESSON_LIMIT} free ${lessonsWord(FREE_DAILY_LESSON_LIMIT)} per day`} />
              <Check label="Unlimited saved quotes" />
              <Check label="Full rank progression" />
              <Check label="All 50 badges" />
              <Check label="Philosopher bios" />
            </View>
            {!isPro && <Text style={styles.planFoot}>Your current plan</Text>}
          </UICard>
        </View>

        {/* Scholar's Pass */}
        <View style={styles.planCol}>
          <UICard pad={3}>
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
            <View style={{ marginTop: SPACE[2], gap: SPACE[1] }}>
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
              <Button
                label="Upgrade — $6.99 / mo"
                onPress={() => router.push('/(app)/paywall')}
                size="lg"
                style={{ marginTop: SPACE[3] }}
              />
            )}
          </UICard>
        </View>
      </View>
      {isPro && (
        <Button
          label="Cancel subscription"
          onPress={() => setConfirmCancel(true)}
          variant="destructive"
          style={{ alignSelf: 'flex-start', marginTop: SPACE[3] }}
        />
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

// Danger Zone carries the longest descriptions on the screen, and the shared
// destructive Button (paddingHorizontal 20, border 2 — wider than the old
// bespoke danger button's 16/1.5) left the text column no slack at all: titles
// broke one word per line and descriptions ran to six. `Row` already has a
// `stack` variant built for exactly this — full-width text, control beneath —
// so DangerRow is a thin wrapper around it rather than a second stacking
// mechanism of its own.
function DangerRow({ title, sub, label, onPress, last }: { title: string; sub: string; label: string; onPress: () => void; last?: boolean }) {
  return (
    <Row title={title} sub={sub} last={last} stack>
      <Button label={label} onPress={onPress} variant="destructive" />
    </Row>
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
        {/* The scrim WAS `rgba(0,0,0,0.45)` on the backdrop itself — the one
            colour on this screen that was not even a hex. It is the same wash
            drawn as ink at 45% on the dismiss layer that was already sitting
            there, so the dialog above it keeps its full opacity and tapping
            outside still cancels. */}
        <Pressable style={[StyleSheet.absoluteFill, styles.modalScrim]} onPress={onCancel} />
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalMsg}>{message}</Text>
          <View style={styles.modalBtns}>
            {!single && (
              <Button label="Cancel" onPress={onCancel} variant="secondary" />
            )}
            <Button
              label={confirmLabel}
              onPress={onConfirm}
              variant={destructive ? 'destructive' : 'primary'}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

/**
 * One of the five roles from `TYPE`, as a React Native text style.
 *
 * TYPE names the face `family` rather than `fontFamily` because
 * `constants/design.ts` holds no React and must be readable by plain Node —
 * this is the one line that translates. Everything below sets its size through
 * this function, which is why the type scale cannot drift: there is no font
 * size on this screen that is a number typed into a style.
 *
 * TWO OVERRIDES ARE USED DELIBERATELY BELOW, and both are principled:
 *  · `fontFamily` is put back to Playfair on the EDITORIAL text — a card's
 *    heading, a row's italic sub-line, a footnote. Those are the app's voice,
 *    and swapping them for Inter would be a change of register, not a
 *    decluttering. Sizes and line-heights still come from the scale.
 *  · `letterSpacing: 0` on sentence-case `micro`. Micro's 1.5 tracking is for
 *    all-caps kickers (FREE, CURRENT, DISPLAY NAME). On a sentence-case label
 *    it is just extra width, and in two places here — the rail and the widget
 *    swatch — width is exactly what there is none of.
 */
const role = (k: TypeKey) => ({
  fontFamily: TYPE[k].family,
  fontSize: TYPE[k].fontSize,
  lineHeight: TYPE[k].lineHeight,
  letterSpacing: TYPE[k].letterSpacing ?? 0,
});

const PLAYFAIR_HEAD = 'PlayfairDisplay_700Bold';
const PLAYFAIR_CAPTION = 'PlayfairDisplay_400Regular';

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.surfaceSoft },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACE[3],
    paddingTop: SPACE[1],
    paddingBottom: SPACE[2],
  },
  // One size, not two. The compact override shrank this to 26 — a step of six
  // points that no other heading on the screen took, so it read as a different
  // heading rather than the same one on a smaller phone.
  topTitle: { ...role('display'), color: C.ink },

  scroll: { paddingHorizontal: SPACE[3], paddingBottom: SPACE[5] },
  layout: { gap: SPACE[3] },
  layoutRow: { flexDirection: 'row', alignItems: 'flex-start' },
  contentWrap: { flex: 1 },

  // Sidebar (wide)
  sidebar: {
    width: 210,
    borderWidth: 2,
    borderColor: C.ink,
    borderRadius: RADIUS.card,
    backgroundColor: C.surface,
    padding: SPACE[2],
    gap: SPACE[0],
  },
  sidebarHead: { ...role('micro'), color: C.inkSoft, marginBottom: SPACE[1] },

  // Labelled rail (phone). RE-MEASURED for the type scale, because the width of
  // this rail is a function of the label's size and nothing else.
  //
  // It was 78 wide for a 9.5pt label, and 9.5 is not on the scale. The nearest
  // role is `micro` at 11. 'Notifications' is the longest word and it has
  // nowhere to wrap, so it sets the width: at Inter 700 9.5 it measured 59.7pt,
  // which is 6.28 × the font size, so at 11 it is 69.1pt. Inside 92: less 2×2 of
  // border, 2×4 of rail padding and 2×4 of item padding leaves 72pt — it clears
  // by 2.9, the same margin the old 78 had. It is BOLD that has to fit, because
  // the selected label switches weight.
  //
  // Item padding is 4 rather than the old 2 because 2 is not on the rhythm; the
  // 14 extra points of rail width are what buying that costs, and they come out
  // of a content column that is 262 wide on a 390pt phone.
  rail: {
    width: 92,
    borderWidth: 2,
    borderColor: C.ink,
    borderRadius: RADIUS.card,
    backgroundColor: C.surface,
    paddingVertical: SPACE[1],
    paddingHorizontal: SPACE[0],
    gap: SPACE[0],
  },
  railItem: { borderRadius: RADIUS.card, alignItems: 'center', justifyContent: 'center', paddingVertical: SPACE[1], paddingHorizontal: SPACE[0], gap: SPACE[0] },
  railItemOn: { backgroundColor: C.ink },
  railLabel: {
    ...role('micro'), letterSpacing: 0, color: C.inkSoft,
    textAlign: 'center', includeFontPadding: false,
  },
  navItem: { flexDirection: 'row', alignItems: 'center', gap: SPACE[1], paddingVertical: SPACE[2], paddingHorizontal: SPACE[1], borderRadius: RADIUS.card, borderWidth: 2, borderColor: 'transparent' },
  navItemOn: { borderColor: C.ink, borderStyle: 'dashed' },
  navText: { flex: 1, ...role('label'), color: C.inkSoft },

  // THE SECTION PANEL IS `components/ui/Card` NOW. The rule that was here —
  // 1.5 of ink border, a 4pt radius, and a hard 3×4 offset shadow in a colour
  // (`#000`) that was in nobody's palette — is deleted, not converted: the one
  // surface definition lives in the shared component.

  headerBlock: { marginBottom: SPACE[0] },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: SPACE[1] },
  headerTitle: { ...role('title'), color: C.ink },
  headerSub: { ...role('label'), fontFamily: PLAYFAIR_CAPTION, fontStyle: 'italic', color: C.inkSoft, marginTop: SPACE[0] },
  hr: { height: 1, backgroundColor: C.hairline, marginVertical: SPACE[3] },

  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACE[3], borderBottomWidth: 1, borderBottomColor: C.hairline },
  rowStacked: { flexDirection: 'column', alignItems: 'stretch' },
  // A row's title is a heading in the editorial voice, at body size — 16 over an
  // italic 13, where it used to be 15 over 12. Two sizes one point apart is the
  // clutter this whole change is about: the eye cannot tell whether they were
  // meant to be different.
  rowTitle: { ...role('body'), fontFamily: PLAYFAIR_HEAD, color: C.ink },
  rowSub: { ...role('label'), fontFamily: PLAYFAIR_CAPTION, fontStyle: 'italic', color: C.inkSoft, marginTop: SPACE[0] },

  // Toggle. THE GEOMETRY IS NOW THE SAME IN BOTH STATES, which it was not: the
  // off track carried a 1.5 border and the on track carried none, so the 18pt
  // knob had 20pt of room in one state and 17 in the other and shifted as you
  // flipped it. The border is always 2 and only its colour changes — ink when
  // on, the accent when off — so 28 − 4 of border − 8 of padding leaves exactly
  // the knob's 16 either way.
  track: { width: 48, height: 28, borderRadius: RADIUS.pill, padding: SPACE[0], borderWidth: 2, justifyContent: 'center' },
  trackOn: { backgroundColor: C.ink, borderColor: C.ink, alignItems: 'flex-end' },
  trackOff: { backgroundColor: C.surfaceSoft, borderColor: C.HUE, alignItems: 'flex-start' },
  knob: { width: 16, height: 16, borderRadius: RADIUS.pill },
  knobOn: { backgroundColor: C.paper },
  knobOff: { backgroundColor: C.HUE },

  // Segmented
  segmented: { flexDirection: 'row', borderWidth: 2, borderColor: C.HUE, borderRadius: RADIUS.button, overflow: 'hidden' },
  segBtn: { paddingHorizontal: SPACE[2], paddingVertical: SPACE[1], backgroundColor: C.surface },
  segBtnOn: { backgroundColor: C.ink },
  segText: { ...role('label'), color: C.ink },

  // Check rows
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: SPACE[1] },
  checkBox: { width: 18, height: 18, borderWidth: 2, borderColor: C.HUE, borderRadius: RADIUS.pill, alignItems: 'center', justifyContent: 'center' },
  checkMark: { ...role('micro'), letterSpacing: 0, color: C.ink },
  checkLabel: { flex: 1, ...role('label'), color: C.ink },

  // Profile
  identity: { flexDirection: 'row', alignItems: 'center' },

  // The picture-and-background control: a live miniature of the real header.
  artPreview: {
    height: 112,
    borderRadius: RADIUS.card,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: C.ink,
    justifyContent: 'flex-end',
  },
  artPreviewInner: { padding: SPACE[2] },
  artPreviewName: {
    ...role('micro'), marginTop: SPACE[0],
    includeFontPadding: false,
  },
  artChange: {
    position: 'absolute', top: SPACE[1], right: SPACE[1],
    flexDirection: 'row', alignItems: 'center', gap: SPACE[0],
    backgroundColor: C.ink, borderRadius: RADIUS.pill, paddingHorizontal: SPACE[1], paddingVertical: SPACE[0],
  },
  artChangeText: { ...role('micro'), color: C.paper },

  fontChip: {
    minWidth: 96,
    maxWidth: 190,
    borderWidth: 2,
    borderColor: C.hairline,
    borderRadius: RADIUS.button,
    paddingHorizontal: SPACE[2],
    paddingVertical: SPACE[1],
    backgroundColor: C.surface,
    alignItems: 'center',
  },
  fontChipOn: { backgroundColor: C.ink, borderColor: C.ink },
  fontChipName: {
    ...role('micro'), marginTop: SPACE[0],
    includeFontPadding: false,
  },

  // `profileSaveBtn` / `profileSaveBtnOff` / `profileSaveText` are gone with the
  // hand-rolled Save. Its disabled fill was `#EFEEE9` — a fourth off-white,
  // three points from one that already existed.
  idName: { ...role('title'), color: C.ink },
  // `Gold` used to colour these two, and `Gold` was `#6B6B6B` — the very same
  // hex as `InkSoft`. One grey under two names, which is exactly how a palette
  // grows to nine without anyone deciding anything.
  idRank: { ...role('label'), fontFamily: PLAYFAIR_CAPTION, fontStyle: 'italic', color: C.inkSoft, marginTop: SPACE[0] },
  idMeta: { ...role('label'), color: C.inkSoft, marginTop: SPACE[0] },
  fieldLabel: { ...role('micro'), color: C.inkSoft, marginTop: SPACE[3], marginBottom: SPACE[1] },
  fieldValue: { ...role('body'), fontFamily: PLAYFAIR_HEAD, color: C.ink },
  input: {
    borderWidth: 2, borderColor: C.ink, borderRadius: RADIUS.button,
    paddingHorizontal: SPACE[2], paddingVertical: SPACE[1],
    // Face and size from the scale, but NO lineHeight: a line height on a
    // TextInput clips the text vertically on Android. This is the one place a
    // role is taken apart rather than spread.
    fontFamily: TYPE.body.family, fontSize: TYPE.body.fontSize, color: C.ink,
  },
  miniStats: { flexDirection: 'row', alignItems: 'center' },
  miniDiv: { width: 1, height: 36, backgroundColor: C.hairline },
  miniValue: { ...role('title'), color: C.ink },
  miniLabel: { ...role('label'), color: C.inkSoft, marginTop: SPACE[0] },

  footNote: { ...role('label'), fontFamily: PLAYFAIR_CAPTION, fontStyle: 'italic', color: C.inkSoft, marginTop: SPACE[3] },

  // Widget scene picker. The thumbnails keep the widget's own 2.27:1 so the
  // preview is the shape of the thing being chosen, not a crop of it.
  sceneRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACE[1], marginTop: SPACE[0] },
  sceneItem: { width: 66 },
  sceneThumb: {
    width: 66,
    height: 29,
    // The one radius on this screen that is not a token, and it is deliberate:
    // RADIUS.card at 12 on a box only 29 tall eats the picture's corners. This
    // is the shape of the thing being previewed, not the app's own edge.
    borderRadius: 7,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: C.hairline,
    backgroundColor: C.surface,
  },
  sceneThumbOn: { borderWidth: 2, borderColor: C.ink },
  sceneName: {
    ...role('micro'),
    letterSpacing: 0,
    color: C.inkSoft,
    marginTop: SPACE[0],
    textAlign: 'center',
  },
  sceneNameOn: { fontFamily: 'Inter_700Bold', color: C.ink },

  // Subscription. The two plan panels are `components/ui/Card` now; `planCol`
  // is what is left of `planCard` — the flex that made them share the row.
  planRow: { flexDirection: 'row', gap: SPACE[2] },
  planCol: { flex: 1 },
  currentTag: { position: 'absolute', top: SPACE[1], right: SPACE[1], backgroundColor: C.ink, borderRadius: RADIUS.pill, paddingHorizontal: SPACE[1], paddingVertical: SPACE[0] },
  currentTagText: { ...role('micro'), color: C.paper },
  proKicker: { ...role('micro'), color: C.ink },
  planName: { ...role('micro'), color: C.inkSoft },
  planPrice: { ...role('display'), color: C.ink, marginTop: SPACE[0] },
  perMo: { ...role('label'), color: C.inkSoft },
  planNote: { ...role('label'), fontFamily: PLAYFAIR_CAPTION, fontStyle: 'italic', color: C.inkSoft, marginTop: SPACE[0] },
  planFoot: { ...role('label'), fontFamily: PLAYFAIR_CAPTION, fontStyle: 'italic', color: C.inkSoft, textAlign: 'center', marginTop: SPACE[3] },
  andMore: { flexDirection: 'row', alignItems: 'center', gap: SPACE[1], marginVertical: SPACE[0] },
  andLine: { flex: 1, height: 1, backgroundColor: C.hairline },
  andMoreText: { ...role('micro'), letterSpacing: 0, fontFamily: PLAYFAIR_CAPTION, fontStyle: 'italic', color: C.inkSoft },

  // An inline note that a control is currently unable to do its job (permission
  // refused, backup switched off). Ink on a tinted panel, not red — it is a state
  // of affairs, not an error.
  notice: { backgroundColor: C.surfaceSoft, borderLeftWidth: 4, borderLeftColor: C.ink, borderRadius: RADIUS.card, padding: SPACE[2], marginTop: SPACE[2] },
  noticeText: { ...role('body'), color: C.ink },

  // EIGHT HAND-ROLLED BUTTON RULES ARE GONE — `upgradeBtn`, `feedbackBtn`,
  // `manageBtn`, `signOutBtn`, `cancelSubBtn`, `dangerBtn`, `timePill`,
  // `modalCancel`/`modalConfirm`, and the text rule each carried. Between them
  // they used four radii, three border widths and five paddings to draw what is
  // one component with four variants.

  // Modal
  modalBackdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACE[4] },
  modalScrim: { backgroundColor: C.ink, opacity: 0.45 },
  modalCard: { width: '100%', maxWidth: 380, backgroundColor: C.surface, borderWidth: 2, borderColor: C.ink, borderRadius: RADIUS.card, padding: SPACE[4] },
  modalTitle: { ...role('title'), color: C.ink },
  modalMsg: { ...role('body'), color: C.inkSoft, marginTop: SPACE[1] },
  modalBtns: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: SPACE[1], marginTop: SPACE[4] },
});
