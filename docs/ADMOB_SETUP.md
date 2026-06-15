# Ads — Google AdMob setup

The **code is already wired** (`lib/ads/`, the launch init in `app/_layout.tsx`,
and the interstitial trigger in `components/lesson/LessonReward.tsx`). What's left
is account/dashboard/build work that can't be done from the repo.

> **Same native constraint as RevenueCat:** `react-native-google-mobile-ads` is a
> native module. In Expo Go and the web preview the app uses a safe **stub** — no
> ads, lesson completion just flows straight through. Real ads only run in a
> **native build** (dev client / TestFlight / store). See `docs/REVENUECAT_SETUP.md`
> §4 for the EAS build steps; one dev build covers both ads and subscriptions.

---

## The model (already implemented)

- Free users: **1 lesson/day** (`FREE_DAILY_LESSON_LIMIT` in
  `constants/subscription.ts`), and **one full-screen interstitial** right after
  finishing a lesson — fired on **Continue**, after the XP/streak screen.
- **Scholar's Pass subscribers see no ads** (gated on `isPro`; we don't even
  gather ad consent for them).
- Only the **interstitial** format is used — no rewarded, native, or banner ads.

---

## 1. AdMob account + app

1. Create/sign in at https://admob.google.com.
2. **Apps → Add app** — add an **iOS** app and an **Android** app (link them to
   your store listings once they exist; bundle id / package = `com.philosophize.app`).
3. Each app gets an **App ID** like `ca-app-pub-XXXXXXXX~YYYYYYYY`. Put the real
   ones in **`app.json`** under the `react-native-google-mobile-ads` plugin
   (currently set to Google's **test** App IDs):
   ```json
   ["react-native-google-mobile-ads", {
     "androidAppId": "ca-app-pub-REAL~ANDROID",
     "iosAppId": "ca-app-pub-REAL~IOS",
     "userTrackingUsageDescription": "…"
   }]
   ```

## 2. Interstitial ad units

1. In each app: **Ad units → Add ad unit → Interstitial**.
2. Copy each unit id (`ca-app-pub-XXXX/ZZZZ`) into **`.env.local`**:
   ```
   EXPO_PUBLIC_ADMOB_INTERSTITIAL_IOS=ca-app-pub-…/…
   EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID=ca-app-pub-…/…
   ```
   (In development the app ignores these and uses Google's reserved **test** unit,
   so you never risk policy strikes while testing.)

## 3. Consent & privacy (required)

- **GDPR/UMP:** in AdMob **Privacy & messaging → GDPR**, create a consent message.
  The app calls `AdsConsent.gatherConsent()` on launch (free users) and shows the
  form when required.
- **US state privacy:** create the corresponding message if you target those states.
- **iOS ATT:** the `userTrackingUsageDescription` in `app.json` provides the
  Info.plist string for the App Tracking Transparency prompt. Keep it accurate.
- **Test consent locally:** register a **test device** and use
  `AdsConsentDebugGeography.EEA` while developing (see the library docs) so you can
  exercise the EU consent form.

## 4. Test devices (avoid invalid traffic)

Never tap your own **production** ads. On a real build, grab the test-device id the
SDK logs on first ad load and add it in AdMob **Settings → Test devices**, or keep
using the development test unit. Self-clicking live ads can get the account banned.

## 5. Verify in a dev build

After `eas build --profile development` (see RevenueCat doc) and signing in as a
**free** user:

- Finish a lesson → reward (XP/streak) screen → tap **Continue** → a test
  interstitial appears → close it → you land on Home.
- Subscribe (sandbox) → finish a lesson → **no ad** on Continue.
- Hit the daily cap (the 2nd lesson) → the "That's your lesson for today" lock.

---

## How the code is structured (for future edits)

| Piece | File |
|---|---|
| app ids, unit ids, test fallback | `constants/ads.ts` |
| provider contract | `lib/ads/types.ts` |
| real AdMob wrapper (consent + interstitial) | `lib/ads/real.ts` |
| web/Expo Go stub | `lib/ads/stub.ts` |
| resolver (Expo Go → stub) | `lib/ads/index.ts` / `index.web.ts` |
| init for free users on launch | `app/_layout.tsx` |
| show interstitial on Continue | `components/lesson/LessonReward.tsx` |
| native plugin + ATT string | `app.json` |
| free daily cap | `constants/subscription.ts` (`FREE_DAILY_LESSON_LIMIT`) |

**Both monetization paths share one switch:** `isPro` (from
`stores/subscriptionStore.ts`). Pro removes the daily cap **and** all ads.
