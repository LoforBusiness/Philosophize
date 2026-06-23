# Scholar's Pass — RevenueCat setup

This is the human checklist for turning the in-app subscription on. The **code is
already wired** (`lib/purchases`, `stores/subscriptionStore.ts`, the paywall, and
the daily-lesson gate). What's left is account/dashboard/build work that can't be
done from the repo.

> **Why you can't test purchases in Expo Go or web:** `react-native-purchases` is
> a native module. In Expo Go and the web preview the app uses a safe **stub** that
> always reports "not subscribed" and disables buying. Real purchases only run in a
> **native build** (development client, TestFlight/internal, or store). Everything
> else (the paywall UI, the daily gate, the locked screen) is fully testable today.

---

## 0. Decisions already baked in

- **Gate:** free users may complete **`FREE_DAILY_LESSON_LIMIT` lessons/day**
  (currently **1**, in `constants/subscription.ts`); subscribers are unlimited.
- **Ads:** free users see an interstitial after each lesson; **Pro removes all
  ads.** Both the cap and the ads key off the same `isPro`. See
  `docs/ADMOB_SETUP.md`.
- **Product:** **monthly only**, displayed at **$6.99/mo** (the live price comes
  from the store once configured).
- **Entitlement id:** `scholars_pass` · **Offering id:** `default`
  (both in `constants/subscription.ts`).
- **Paywall:** custom screen at `app/(app)/paywall.tsx` (your B&W aesthetic).

If you change the entitlement/offering/product ids, change them in
`constants/subscription.ts` **and** the dashboard so they match.

---

## 1. App Store Connect (iOS)

1. Create the app record (bundle id **`com.philosophize.app`** — set in `app.json`;
   change it there *before* your first build if you want a different one, since IAP
   products are tied to the bundle id).
2. **In-App Purchases → Auto-Renewable Subscription**:
   - Product ID: `philosophize_scholars_pass_monthly`
   - Subscription group: e.g. `scholars_pass`
   - Duration: 1 month · Price: $6.99 (or your tier)
3. Fill in localization + review screenshot, and add the **Paid Apps agreement**
   (Business section) — IAP returns nothing until that's signed.
4. Create a **Sandbox tester** (Users and Access → Sandbox) for test purchases.

## 2. Google Play Console (Android)

1. Create the app (package **`com.philosophize.app`**).
2. **Monetize → Subscriptions** → create subscription `philosophize_scholars_pass_monthly`
   with a monthly base plan at your price.
3. Add license testers (Setup → License testing) so test purchases don't charge.

## 2b. Reviewer / tester access (paywall bypass)

App-store reviewers (and internal testers) need to clear the paywall **without**
relying on a sandbox purchase, which can be flaky during review. There is a
code-side allow-list for this:

- `REVIEWER_EMAILS` in `constants/subscription.ts` lists the accounts that are
  treated as Pro **without a purchase**. Matching is case-insensitive on the
  signed-in Supabase email; when it matches, `isPro` is forced on, so the
  paywall, the daily-lesson gate, and ads are all skipped.
- It is re-derived from the auth email on every sign-in (`subscriptionStore`
  `init`/`setUser`, fed from `app/_layout.tsx`), and is **never** persisted.

To use it for a Play review:

1. Make sure the reviewer account exists in **Supabase → Authentication → Users**
   and is **confirmed** (create it with *Auto Confirm User* checked, or confirm it).
2. Add that exact email to `REVIEWER_EMAILS`, then **rebuild and upload a new AAB** —
   the bypass only exists in a build that contains this code.
3. On the Play Console **App access** page, give the reviewer those same
   credentials, and note that subscriptions are accessed via this test login.

> ⚠️ **This is a hardcoded unlock that ships in the production bundle.** Anyone who
> signs in with a listed account (email **and** password) gets Pro for free.
> Keep the list to throwaway tester accounts and **remove/rotate the entries after
> review**.

---

## 3. RevenueCat dashboard

1. Create a **Project**, then add an **iOS app** and an **Android app**.
   - iOS: paste your App Store Connect **App-Specific Shared Secret**.
   - Android: upload the **Play service-account credentials** JSON.
2. **Products** → import/add `philosophize_scholars_pass_monthly` for both stores.
3. **Entitlements** → create **`scholars_pass`** and attach both products to it.
4. **Offerings** → create/confirm the **`default`** offering with a **Monthly**
   package pointing at the product. (The app reads `offerings.current.monthly`.)
5. **API keys** → copy the **public SDK keys** into `.env.local`:
   ```
   EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_...
   EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_...
   ```

## 4. Build a native app to test (EAS)

```bash
npm i -g eas-cli           # if needed
eas login
eas build:configure        # writes projectId into app.json (first time only)

# Development client (debuggable, talks to your Metro server):
eas build --profile development --platform ios      # or android
# then:
npx expo start --dev-client
```

Install the dev build on a device/simulator, sign in, and you'll hit the **real**
RevenueCat flow. Use your **sandbox / license-test** account to purchase without
being charged. Verify:

- Paywall shows the **live localized price** (not the `$6.99` fallback).
- Completing a sandbox purchase flips the user to Pro (Settings shows "CURRENT" on
  Scholar's Pass; the daily gate no longer triggers).
- **Restore purchase** re-grants the entitlement on a fresh install.

## 5. Optional, later — server-side truth

Today entitlement is read **client-side** from RevenueCat (cached on-device, which
suits the app's local-first design). If you ever gate a *server* feature or want a
server copy of subscription status, add a **RevenueCat webhook → Supabase**
(an `is_pro` column / row), and check it server-side. Not required for launch.

---

## How the code is structured (for future edits)

| Piece | File |
|---|---|
| ids, daily limit, fallback price, reviewer allow-list | `constants/subscription.ts` |
| provider contract + errors | `lib/purchases/types.ts` |
| real RevenueCat wrapper | `lib/purchases/real.ts` |
| web/Expo Go stub | `lib/purchases/stub.ts` |
| resolver (Expo Go → stub) | `lib/purchases/index.ts` / `index.web.ts` |
| `isPro` state, purchase/restore | `stores/subscriptionStore.ts` |
| configure on launch / identity | `app/_layout.tsx` |
| paywall UI | `app/(app)/paywall.tsx` |
| daily-limit gate + locked screen | `app/(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId].tsx` |
| daily counter | `stores/userDataStore.ts` (`bumpDailyLessons`) + `components/lesson/LessonReward.tsx` |
| plan cards + upgrade entry | `app/(app)/settings.tsx` |
