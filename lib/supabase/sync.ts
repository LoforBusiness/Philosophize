import { supabase } from './client';
import { useUserDataStore, type SavedQuote, type ProfileQuote, type AppSettings, type XpEvent } from '@/stores/userDataStore';
import { branchCountsFromUnits, unitsFromBranchCounts } from '@/data';
import { MAX_STRENGTH, type ReviewEntry, type ReviewState } from '@/lib/review';

// The slice of userDataStore mirrored to the cloud — matches the store's
// `partialize`, so "what we persist locally" and "what we sync" stay identical.
export interface CloudState {
  savedQuotes: SavedQuote[];
  profileQuote: ProfileQuote | null;
  philosopherViews: Record<string, number>;
  lessonsByUnit: Record<string, number>;
  lessonsByBranch: Record<string, number>;
  beliefResultId: string | null;
  streak: number;
  totalXP: number;
  xpEvents: XpEvent[];
  rankIndex: number;
  lastLessonDate: string | null;
  // Rest days, as two counters that only go up. See constants/streak.ts: a
  // single "remaining" figure would REFILL across devices under mergeMax, which
  // is the merge everything else here needs.
  restDaysEarned: number;
  restDaysUsed: number;
  // Spaced-repetition schedule. Deliberately NOT accompanied by reviewDayCount /
  // reviewDayDate: those are the free tier's daily allowance and stay per-device,
  // exactly like dailyLessonCount, which has never synced either.
  reviewState: ReviewState;
  startingBranch: string | null;
  // Synced so signing in on a second phone does not ask the three questions
  // again — the answer already travels with the account via startingBranch.
  onboardingVersion: number;
  joinedAt: number | null;
  earnedBadges: string[];
  badgesInitialized: boolean;
  displayName: string;
  email: string;
  bio: string;
  portrait: string;
  profileBackground: string;
  nameFont: string;
  settings: AppSettings;
}

const SYNC_FIELDS: (keyof CloudState)[] = [
  'savedQuotes', 'profileQuote', 'philosopherViews', 'lessonsByUnit', 'lessonsByBranch', 'beliefResultId',
  'streak', 'totalXP', 'xpEvents', 'rankIndex', 'lastLessonDate', 'joinedAt', 'earnedBadges', 'badgesInitialized',
  'displayName', 'email', 'bio', 'portrait', 'profileBackground', 'nameFont', 'settings',
  'restDaysEarned', 'restDaysUsed', 'reviewState', 'startingBranch', 'onboardingVersion',
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
  // The store already caps this, and so does the merge. Bounded a third time here
  // for the reason this function exists: a corrupt or hand-edited local blob must
  // not be able to push an unbounded array into its own row.
  if (Array.isArray(out.xpEvents) && out.xpEvents.length > XP_EVENTS_CAP) {
    out.xpEvents = out.xpEvents.slice(out.xpEvents.length - XP_EVENTS_CAP);
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

// While an account deletion is in flight, all pushes are suppressed so a
// debounced/in-flight snapshot can't re-create the row we're deleting. Reset
// when a fresh session starts syncing (useCloudSync.start).
let deleting = false;
export function beginAccountDeletion() {
  deleting = true;
}
export function resetAccountDeletion() {
  deleting = false;
}

// Upsert the user's full snapshot. Returns whether it succeeded.
export async function pushCloudState(userId: string, data: CloudState): Promise<boolean> {
  if (deleting) return false;
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

/**
 * Newest write wins, per lesson.
 *
 * The only merge in this file that is NOT "keep the larger", and deliberately:
 * a review entry can legitimately go DOWN. Missing its question drops a lesson
 * to strength 0 and makes it due tomorrow, and a max-merge would hand the old
 * mastery straight back — the reader would have just proved they had forgotten
 * something, and the sync would overrule them. So sort by the touch stamp.
 *
 * Entries are shape-checked on the way in rather than trusted: this row is
 * whatever was last written to the cloud, and a malformed `s` or `due` would
 * otherwise reach the scheduler and sit there permanently un-due.
 */
function validEntry(v: unknown): v is ReviewEntry {
  if (!v || typeof v !== 'object') return false;
  const e = v as Partial<ReviewEntry>;
  return (
    typeof e.s === 'number' && e.s >= 0 && e.s <= MAX_STRENGTH &&
    typeof e.due === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(e.due) &&
    typeof e.t === 'number' && Number.isFinite(e.t)
  );
}

function mergeReviewState(a: ReviewState = {}, b: ReviewState = {}): ReviewState {
  const out: ReviewState = {};
  for (const k of Object.keys(a)) if (validEntry(a[k])) out[k] = a[k];
  for (const k of Object.keys(b)) {
    const rb = b[k];
    if (!validEntry(rb)) continue;
    const cur = out[k];
    if (!cur || rb.t > cur.t) out[k] = rb;
  }
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

/**
 * Two logs of the same climb, interleaved in time.
 *
 * The entries are TOTALS, not deltas, so this cannot double-count: the same
 * moment recorded on two devices is one point, and a point only appears twice if
 * the totals genuinely differed. Deduped on the timestamp, which is also what
 * keeps a repeated sync from growing the log every round trip.
 *
 * Trimmed to the same cap the store uses. It has to be trimmed HERE as well as
 * there — a merge of two full logs is twice the cap, and the whole point of the
 * bound is that this array goes into the cloud snapshot on every sync.
 */
function mergeXpEvents(a: XpEvent[] = [], b: XpEvent[] = []): XpEvent[] {
  const byT = new Map<number, XpEvent>();
  for (const e of [...a, ...b]) {
    if (!e || !Number.isFinite(e.t) || !Number.isFinite(e.v)) continue;
    const prev = byT.get(e.t);
    // Same instant on both sides: keep the higher total, matching the
    // never-lose-progress rule the XP and rank merges already follow.
    if (!prev || e.v > prev.v) byT.set(e.t, { t: e.t, v: e.v });
  }
  const out = Array.from(byT.values()).sort((x, y) => x.t - y.t);
  return out.length > XP_EVENTS_CAP ? out.slice(out.length - XP_EVENTS_CAP) : out;
}

const XP_EVENTS_CAP = 200;

const DEFAULT_NAME = 'Philosopher';
const DEFAULT_PORTRAIT = 'overthinker';

// Adopt only KNOWN settings keys from a cloud snapshot, filling any missing key
// from the local defaults and dropping unknown/legacy ones. The row is self-
// authored under RLS, so this is robustness (not a trust boundary): it stops a
// fresh device from inheriting a malformed/partial settings shape from a corrupt
// or older-version cloud row.
function sanitizeSettings(remote: Partial<AppSettings> | undefined, base: AppSettings): AppSettings {
  if (!remote || typeof remote !== 'object') return base;
  const out = { ...base } as Record<string, unknown>;
  for (const k of Object.keys(base)) {
    const rv = (remote as Record<string, unknown>)[k];
    if (rv !== undefined) out[k] = rv;
  }
  return out as unknown as AppSettings;
}

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
  // Same rule as XP: keep the higher, so a device that is behind can never demote
  // a rank the user has already been awarded on another one.
  const rankIndex = Math.max(local.rankIndex ?? 0, remote.rankIndex ?? 0);
  const xpEvents = mergeXpEvents(local.xpEvents, remote.xpEvents);
  // Per-unit progress is canonical. A legacy cloud row only has lessonsByBranch;
  // reconstruct its per-unit shape before merging so old snapshots still count.
  const remoteUnits =
    remote.lessonsByUnit && Object.keys(remote.lessonsByUnit).length > 0
      ? remote.lessonsByUnit
      : unitsFromBranchCounts(remote.lessonsByBranch ?? {});
  const lessonsByUnit = mergeMax(local.lessonsByUnit, remoteUnits);
  // Derive the per-branch mirror from the merged units so the two never drift.
  const lessonsByBranch = branchCountsFromUnits(lessonsByUnit);
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
  // Rest days: max on BOTH halves. The higher earn count is the true one, and so
  // is the higher spend — which is exactly why they are stored apart. Taking the
  // max of a single "remaining" figure would hand back a rest day already spent
  // on another device, every time the two synced.
  const restDaysEarned = Math.max(local.restDaysEarned ?? 0, remote.restDaysEarned ?? 0);
  const restDaysUsed = Math.max(local.restDaysUsed ?? 0, remote.restDaysUsed ?? 0);
  const reviewState = mergeReviewState(local.reviewState, remote.reviewState);
  // Monotonic version: the higher is the one that has been through more of the
  // flow, so max never re-asks someone who has already answered.
  const onboardingVersion = Math.max(local.onboardingVersion ?? 0, remote.onboardingVersion ?? 0);

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
  // Type-guard each adopted field so a corrupt/legacy cloud row can't seed an
  // unexpected shape into local state on a fresh device.
  const fresh = isFresh(local);
  const displayName = fresh && typeof remote.displayName === 'string' ? remote.displayName : local.displayName;
  const bio = fresh && typeof remote.bio === 'string' ? remote.bio : local.bio;
  const email = fresh && typeof remote.email === 'string' ? remote.email : local.email;
  const portrait = fresh && typeof remote.portrait === 'string' ? remote.portrait : local.portrait;
  // The chosen art and name face travel with the account, on the same
  // fresh-device rule as the rest of the identity.
  const profileBackground =
    fresh && typeof remote.profileBackground === 'string' ? remote.profileBackground : local.profileBackground;
  const nameFont = fresh && typeof remote.nameFont === 'string' ? remote.nameFont : local.nameFont;
  const settings = fresh ? sanitizeSettings(remote.settings, local.settings) : local.settings;
  const beliefResultId =
    fresh && (typeof remote.beliefResultId === 'string' || remote.beliefResultId === null)
      ? remote.beliefResultId
      : local.beliefResultId;
  // Featured Profile quote is a personalisation: a fresh device adopts the
  // cloud's; a personalised device keeps its own choice.
  const profileQuote = fresh ? remote.profileQuote ?? null : local.profileQuote;
  // Where the welcome questions pointed them. A personalisation, so it follows
  // the same rule as the featured quote — a fresh device adopts the account's
  // answer, a device that has already been steered keeps its own.
  const startingBranch =
    fresh && (typeof remote.startingBranch === 'string' || remote.startingBranch === null)
      ? remote.startingBranch
      : local.startingBranch;

  return {
    savedQuotes,
    profileQuote,
    restDaysEarned,
    restDaysUsed,
    reviewState,
    startingBranch,
    onboardingVersion,
    philosopherViews,
    lessonsByUnit,
    lessonsByBranch,
    beliefResultId,
    streak,
    totalXP,
    xpEvents,
    rankIndex,
    lastLessonDate,
    joinedAt,
    earnedBadges,
    badgesInitialized,
    displayName,
    email,
    bio,
    portrait,
    profileBackground,
    nameFont,
    settings,
  };
}
