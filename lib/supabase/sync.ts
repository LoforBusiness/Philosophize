import { supabase } from './client';
import { useUserDataStore, type SavedQuote, type AppSettings } from '@/stores/userDataStore';

// The slice of userDataStore mirrored to the cloud — matches the store's
// `partialize`, so "what we persist locally" and "what we sync" stay identical.
export interface CloudState {
  savedQuotes: SavedQuote[];
  philosopherViews: Record<string, number>;
  lessonsByBranch: Record<string, number>;
  voiceEnabled: boolean;
  beliefResultId: string | null;
  streak: number;
  totalXP: number;
  lastLessonDate: string | null;
  joinedAt: number | null;
  earnedBadges: string[];
  badgesInitialized: boolean;
  displayName: string;
  email: string;
  bio: string;
  portrait: string;
  settings: AppSettings;
}

const SYNC_FIELDS: (keyof CloudState)[] = [
  'savedQuotes', 'philosopherViews', 'lessonsByBranch', 'voiceEnabled', 'beliefResultId',
  'streak', 'totalXP', 'lastLessonDate', 'joinedAt', 'earnedBadges', 'badgesInitialized',
  'displayName', 'email', 'bio', 'portrait', 'settings',
];

const capStr = (v: unknown, n: number) => (typeof v === 'string' ? v.slice(0, n) : v);

// Read the current syncable slice out of the live store, bounding string/array
// sizes so a corrupt or malicious local store can't push an oversized blob to
// its own user_state row (self-inflicted storage/cost bloat).
export function snapshotLocal(): CloudState {
  const s = useUserDataStore.getState() as any;
  const out: any = {};
  for (const k of SYNC_FIELDS) out[k] = s[k];
  out.displayName = capStr(out.displayName, 60);
  out.bio = capStr(out.bio, 600);
  out.email = capStr(out.email, 254);
  if (Array.isArray(out.savedQuotes) && out.savedQuotes.length > 5000) {
    out.savedQuotes = out.savedQuotes.slice(0, 5000);
  }
  return out as CloudState;
}

// Fetch the user's cloud snapshot (null if no row yet or on any error — sync is
// always best-effort and never blocks offline play).
export async function pullCloudState(userId: string): Promise<Partial<CloudState> | null> {
  try {
    const { data, error } = await supabase
      .from('user_state')
      .select('data')
      .eq('user_id', userId)
      .maybeSingle();
    if (error || !data) return null;
    return (data.data ?? {}) as Partial<CloudState>;
  } catch {
    return null;
  }
}

// Upsert the user's full snapshot. Returns whether it succeeded.
export async function pushCloudState(userId: string, data: CloudState): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_state')
      .upsert(
        { user_id: userId, data, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      );
    return !error;
  } catch {
    return false;
  }
}

// Delete the user's cloud snapshot (right-to-erasure). Requires the "delete own"
// RLS policy from migration 0002; best-effort and never throws.
export async function deleteCloudState(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('user_state').delete().eq('user_id', userId);
    return !error;
  } catch {
    return false;
  }
}

// ---- merge helpers ----

function mergeMax(a: Record<string, number> = {}, b: Record<string, number> = {}) {
  const out: Record<string, number> = { ...a };
  for (const k of Object.keys(b)) out[k] = Math.max(out[k] ?? 0, b[k] ?? 0);
  return out;
}

function mergeQuotes(a: SavedQuote[] = [], b: SavedQuote[] = []): SavedQuote[] {
  const byId = new Map<string, SavedQuote>();
  for (const q of [...a, ...b]) {
    const prev = byId.get(q.id);
    if (!prev || (q.savedAt ?? 0) > (prev.savedAt ?? 0)) byId.set(q.id, q);
  }
  return Array.from(byId.values()).sort((x, y) => (y.savedAt ?? 0) - (x.savedAt ?? 0));
}

const DEFAULT_NAME = 'Philosopher';
const DEFAULT_PORTRAIT = 'overthinker';

// A device whose profile is still all-defaults is "fresh": it adopts the cloud
// identity + settings wholesale on first login. A personalised device keeps its
// own and propagates it. Progress is always merged regardless.
function isFresh(local: CloudState): boolean {
  return (
    local.displayName === DEFAULT_NAME &&
    local.bio === '' &&
    local.portrait === DEFAULT_PORTRAIT &&
    !local.email
  );
}

// Merge a cloud snapshot into the local one. Progress never shrinks; profile and
// settings follow the "fresh device adopts cloud, else keep local" rule.
export function mergeStates(local: CloudState, remote: Partial<CloudState>): CloudState {
  if (!remote || Object.keys(remote).length === 0) return local;

  // --- progress: never lose anything ---
  const totalXP = Math.max(local.totalXP ?? 0, remote.totalXP ?? 0);
  const lessonsByBranch = mergeMax(local.lessonsByBranch, remote.lessonsByBranch);
  const philosopherViews = mergeMax(local.philosopherViews, remote.philosopherViews);
  const earnedBadges = Array.from(
    new Set([...(local.earnedBadges ?? []), ...(remote.earnedBadges ?? [])])
  );
  const savedQuotes = mergeQuotes(local.savedQuotes, remote.savedQuotes);
  const joinedAt =
    local.joinedAt != null && remote.joinedAt != null
      ? Math.min(local.joinedAt, remote.joinedAt)
      : local.joinedAt ?? remote.joinedAt ?? null;
  const badgesInitialized = !!(local.badgesInitialized || remote.badgesInitialized);

  // streak follows whichever side has the more recent activity date
  const ld = local.lastLessonDate ?? null;
  const rd = remote.lastLessonDate ?? null;
  let lastLessonDate: string | null;
  let streak: number;
  if (ld && rd) {
    if (rd > ld) {
      lastLessonDate = rd;
      streak = remote.streak ?? 0;
    } else if (ld > rd) {
      lastLessonDate = ld;
      streak = local.streak ?? 0;
    } else {
      lastLessonDate = ld;
      streak = Math.max(local.streak ?? 0, remote.streak ?? 0);
    }
  } else if (rd) {
    lastLessonDate = rd;
    streak = remote.streak ?? 0;
  } else {
    lastLessonDate = ld;
    streak = local.streak ?? 0;
  }

  // --- profile + settings: fresh device adopts cloud, else keep local ---
  const fresh = isFresh(local);
  const displayName = fresh && remote.displayName != null ? remote.displayName : local.displayName;
  const bio = fresh && remote.bio != null ? remote.bio : local.bio;
  const email = fresh && remote.email != null ? remote.email : local.email;
  const portrait = fresh && remote.portrait != null ? remote.portrait : local.portrait;
  const settings = fresh && remote.settings ? remote.settings : local.settings;
  const voiceEnabled = fresh && remote.voiceEnabled != null ? remote.voiceEnabled : local.voiceEnabled;
  const beliefResultId =
    fresh && remote.beliefResultId !== undefined ? remote.beliefResultId : local.beliefResultId;

  return {
    savedQuotes,
    philosopherViews,
    lessonsByBranch,
    voiceEnabled,
    beliefResultId,
    streak,
    totalXP,
    lastLessonDate,
    joinedAt,
    earnedBadges,
    badgesInitialized,
    displayName,
    email,
    bio,
    portrait,
    settings,
  };
}
