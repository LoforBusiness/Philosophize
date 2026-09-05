// ─────────────────────────────────────────────────────────────────────────────
// EVERY EVENT THE APP SENDS, IN ONE PLACE.
//
// ── WHY THIS FILE EXISTS ────────────────────────────────────────────────────
//
// A dashboard can only chart events that are actually sent, and the failure mode
// is silent in the worst possible direction: PostHog does not know the difference
// between "nobody did this" and "nobody instrumented this". An insight built on
// an event no call site fires draws a flat line at zero forever, and a flat line
// at zero reads as a finding.
//
// That had already happened here twice over, and neither was visible from either
// end. `question_answered` fires only in `LessonRunner` — the CARD runner — so
// 84% of the corpus answers its questions without telling anyone. And nothing at
// all fires when a free reader hits the daily limit, which is the single loudest
// signal of paywall pressure the app has.
//
// So the taxonomy is data, `npm run check:events` re-derives it from the source,
// and the PostHog build sheet is generated from the same list rather than typed
// out beside it.
//
// ── ZERO IMPORTS, for the reason rig.ts and tone.ts have zero imports ───────
//
// A validator has to load this in plain Node and compare it against a grep of
// the app. It also means the same list can be printed as a PostHog setup sheet
// without booting React Native.
//
// ── THREE RULES FOR ADDING ONE ──────────────────────────────────────────────
//
// 1. NAME IT ONCE AND NEVER RENAME IT. PostHog keys history on the string; a
//    rename does not migrate anything, it starts a second event with an empty
//    past and quietly breaks every insight built on the first.
// 2. PREFER A PROPERTY TO AN EVENT. "The streak went up" is not its own event —
//    it is `streak_increased` on `lesson_completed`, where it arrives with the
//    branch, the score and the XP already attached. An event that can only ever
//    fire alongside another event should have been a property of it.
// 3. NOTHING PERSONAL, EVER. `lib/posthog.ts` scrubs a fixed list of keys on the
//    way out (`text`, `quote`, `author`, `name`, `bio`, `email`, …) and drops
//    autocapture's element trees wholesale. A property declared here with one of
//    those names will be deleted in flight and the chart built on it will be
//    empty — `check:events` fails the build rather than letting that ship.
// ─────────────────────────────────────────────────────────────────────────────

export interface EventSpec {
  /** What the event means, in one line — this is what the build sheet prints. */
  note: string;
  /** Property keys it carries. Order is documentation, not contract. */
  props: string[];
  /** Roughly where it fires, so a reader can find the call site. */
  where: string;
}

/**
 * THE EVENTS, grouped the way a dashboard reads them rather than the way the
 * code is laid out.
 */
export const EVENTS = {
  // ── lifecycle ─────────────────────────────────────────────────────────────
  $screen: {
    note: 'A route change. Sent by hand: PostHog screen autocapture does not understand Expo Router.',
    props: ['$screen_name'],
    where: 'app/_layout.tsx — ScreenTracker',
  },
  app_installed: {
    note: 'First launch on this device, once ever.',
    props: [],
    where: 'app/_layout.tsx',
  },
  app_opened: {
    note: 'A cold start, once per process — and it carries the streak, so a broken run is a filter rather than an event.',
    props: ['streak', 'days_missed', 'streak_alive'],
    where: 'app/_layout.tsx',
  },
  app_backgrounded: {
    note: 'The reader left the app. With app_opened this is what makes a session length.',
    props: ['seconds'],
    where: 'app/_layout.tsx — AppState',
  },
  onboarding_completed: {
    note: 'The welcome flow finished, with the branch they chose to start in.',
    props: ['starting_branch'],
    where: 'stores/userDataStore.ts',
  },
  update_required_shown: {
    note: 'The forced-update wall covered the app. How many readers a gate raise is actually stopping.',
    props: ['build', 'minimum'],
    where: 'components/shared/UpdateGate.tsx',
  },

  // ── the core loop ─────────────────────────────────────────────────────────
  lesson_started: {
    note: 'A lesson opened. `format` is the cinematic takeover: cards are the old runner.',
    props: ['lesson_id', 'branch_slug', 'unit_id', 'format', 'total_cards'],
    where: 'app/(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId].tsx',
  },
  lesson_completed: {
    note: 'A lesson finished and the XP was banked.',
    props: [
      'branch_slug', 'lesson_id', 'format', 'xp', 'correct', 'total', 'seconds',
      'new_streak', 'streak_increased', 'rest_days_spent',
    ],
    where: 'components/lesson/LessonReward.tsx — commit()',
  },
  lesson_abandoned: {
    note: 'They left without finishing, and how many seconds in. The other half of every completion rate.',
    props: ['lesson_id', 'branch_slug', 'unit_id', 'format', 'seconds'],
    where: 'app/(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId].tsx',
  },
  question_answered: {
    note: 'One graded answer. `control` is HOW it was answered — see group R of the rule book.',
    props: ['lesson_id', 'branch_slug', 'format', 'card_type', 'control', 'correct'],
    // THE ONE HOLE LEFT, and it is the biggest single gap in this taxonomy: only
    // the CARD runner fires this, and cards are 36 of 222 lessons. The 186
    // cinematic lessons answer their questions without telling anyone, so every
    // per-question chart covers 16% of the corpus and says nothing about it.
    // CinematicPlayer.tsx is where it goes — one call beside the `cue('right')`
    // / `cue('rethink')` pair, carrying the beat's own control name.
    where: 'components/lesson/LessonRunner.tsx — CARDS ONLY, see the note above',
  },

  // ── progression ───────────────────────────────────────────────────────────
  rank_up: {
    note: 'A rank was conferred. Not the same as crossing the XP threshold — see awardedRank().',
    props: ['rank', 'rank_id', 'total_xp'],
    where: 'stores/userDataStore.ts',
  },
  badge_earned: {
    note: 'A badge was struck.',
    props: ['badge_id', 'badge_name'],
    where: 'stores/userDataStore.ts — recomputeBadges()',
  },
  // NO `streak_broken`, DELIBERATELY, and it is rule 2 in its purest form.
  // A streak breaking is the one thing here that nobody DOES — the reader's
  // contribution is not turning up — so there is no moment to fire it at except
  // the next time they appear, which makes it a property of appearing.
  // `app_opened where streak_alive is false and streak > 0` is the same cohort,
  // arrives with the streak length already attached, and needs no stored flag to
  // stop it firing twice.
  quote_saved: {
    note: 'A quotation went into the collection. One of the two curiosity loops.',
    props: ['quote_id', 'philosopher_id'],
    where: 'stores/userDataStore.ts — toggleQuote',
  },
  quote_removed: {
    note: 'And back out again. The pair is what says whether the collection is kept or churned.',
    props: ['quote_id', 'philosopher_id'],
    where: 'stores/userDataStore.ts — toggleQuote',
  },
  philosopher_viewed: {
    note: 'A thinker was opened for the first time. Repeat opens do not fire.',
    props: ['philosopher_id'],
    where: 'stores/userDataStore.ts',
  },
  philosopher_quiz_completed: {
    note: 'A thinker quiz was finished.',
    props: ['philosopher_id', 'correct', 'total', 'perfect'],
    where: 'stores/userDataStore.ts',
  },

  // ── money ─────────────────────────────────────────────────────────────────
  paywall_viewed: {
    note: 'The offer was shown. `source` is the moment that raised it and is the whole point of the event — `pass_tab` is somebody who WENT LOOKING, which is a different intention from every other source and the only one that is not a wall.',
    props: ['source', 'available'],
    where: 'components/shared/PaywallContent.tsx, app/(app)/settings.tsx, app/(app)/pass.tsx',
  },
  daily_limit_reached: {
    note: 'A free reader ran out of lessons for the day. The loudest pressure signal the app has.',
    props: ['branch_slug', 'lesson_id', 'limit'],
    where: 'components/paywall/DailyLimit.tsx',
  },
  lesson_locked_viewed: {
    note: 'A gated lesson was opened. `reason` is pro | unreached — "paying would fix this" versus "read the unit first".',
    props: ['reason', 'branch_slug', 'lesson_id', 'gated_by_pro'],
    where: 'components/paywall/LessonLocked.tsx',
  },
  rate_prompt_shown: {
    note: 'The rating sheet was raised. `ask_number` is 1 for the onboarding ask and counts up from there -- the cadence is ONE raise per local calendar day until the reader answers, so somebody who never rates will climb. Two of these inside one local day means lib/utils/rateCadence.ts has been broken.',
    props: ['ask_number'],
    where: 'components/shared/RatePrompt.tsx',
  },
  rate_prompt_answered: {
    note: 'They picked stars and submitted. `went_to_store` is a SECOND event on the same rating, sent only if they then opened Play -- so stars alone is the in-app feedback and the pair is the store conversion. Note the stars are what THEY said in our sheet, not what they left on Play, which no app can see.',
    props: ['stars', 'went_to_store', 'ask_number'],
    where: 'components/shared/RatePrompt.tsx',
  },
  trial_offered: {
    note: 'The three-day trial was put in front of a free reader, after a lesson and before the ad. Paired with `trial_started` it is the only conversion rate this offer has -- there is no separate decline event, because offered-minus-started IS the decline.',
    props: ['source', 'lessons_left'],
    where: 'components/paywall/TrialOffer.tsx',
  },
  trial_started: {
    note: 'They took it. Granted by the app, not by the store -- nobody was charged and nothing will convert, so this is NOT a revenue event and must never be given a `$revenue` property.',
    props: ['days', 'source'],
    where: 'stores/subscriptionStore.ts',
  },
  trial_ended: {
    note: 'The three days ran out. Sent by the clock in subscriptionStore, so it arrives on whichever foreground notices -- it dates the expiry, not the moment of sending.',
    props: ['days'],
    where: 'stores/subscriptionStore.ts',
  },
  subscribe_clicked: {
    note: 'The purchase sheet was opened.',
    props: ['plan', 'billing', 'source'],
    where: 'components/shared/PaywallContent.tsx, app/(app)/pass.tsx',
  },
  subscribe_succeeded: {
    note: 'The entitlement went live. `$revenue` is the property PostHog revenue views read.',
    props: ['plan', 'product_id', '$revenue', 'revenue', 'currency', 'price_string', 'period'],
    where: 'stores/subscriptionStore.ts',
  },
  subscription_manage_opened: {
    note: 'Sent to the store to manage or cancel. The app cannot see what happens next — only a RevenueCat webhook can.',
    props: ['source'],
    where: 'app/(app)/settings.tsx',
  },

  // ── ads ───────────────────────────────────────────────────────────────────
  ad_shown: {
    note: 'The interstitial played. There are no rewarded ads and no click callback — AdMob does not hand those back.',
    props: ['placement'],
    where: 'lib/ads/real.ts',
  },
  ad_failed: {
    note: 'It was asked for and there was nothing to show. Fill rate, from the app side.',
    props: ['placement', 'reason'],
    where: 'lib/ads/real.ts',
  },

  // ── settings and profile ──────────────────────────────────────────────────
  notify_prompt: {
    note: 'The reminder permission ask was answered.',
    props: ['answer'],
    where: 'components/lesson/NotifyPrompt.tsx',
  },
  sign_out: {
    note: 'Signed out, which wipes local progress.',
    props: [],
    where: 'app/(app)/settings.tsx',
  },
  profile_quote_set: {
    note: 'A quotation was pinned to the profile.',
    props: ['quote_id', 'philosopher_id'],
    where: 'stores/userDataStore.ts',
  },
  profile_background_set: {
    note: 'Profile artwork changed.',
    props: ['background_id'],
    where: 'stores/userDataStore.ts',
  },
  profile_font_set: {
    note: 'Profile name font changed.',
    props: ['font_id'],
    where: 'stores/userDataStore.ts',
  },
} as const satisfies Record<string, EventSpec>;

export type EventName = keyof typeof EVENTS;

/**
 * PERSON PROPERTIES — what a reader IS, as opposed to what they did.
 *
 * These are what every "broken down by" in the dashboard hangs off, and the app
 * set none of them until the analytics review: `identify()` was called with the
 * Supabase id and a `signup_method` and nothing else, so "free versus Scholar's
 * Pass behaviour" — the comparison that answers whether the ads are costing more
 * engagement than they earn — could not be drawn at all.
 *
 * DELIBERATELY FOUR. A person property is a join key, not a fact sheet: anything
 * that changes often belongs on the event, where it is stamped at the moment it
 * was true rather than overwritten. `subscription_tier` is the exception that
 * proves it — it changes rarely and every question about money needs it.
 */
export const PERSON_PROPS = [
  'subscription_tier',   // free | scholars_pass
  'platform',            // ios | android | web
  'app_build',           // versionCode, so a cohort can be pinned to a binary
  'signup_method',       // email | apple | google
] as const;

/**
 * THE SCRUBBER'S LIST, restated so a checker can compare against it.
 *
 * `lib/posthog.ts` deletes these keys from every outgoing property bag. A
 * property declared above with one of these names would be dropped in flight and
 * the insight built on it would be permanently empty — which is the one failure
 * that looks exactly like a real answer.
 */
export const SCRUBBED = [
  'email', 'name', 'displayName', 'bio', 'text', 'quote', 'note', 'username', 'author',
] as const;
