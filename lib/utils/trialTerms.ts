import type { TrialPeriod } from '@/lib/purchases/types';
import { trialAdjective, trialLengthPhrase } from '@/lib/utils/trial';

// ─────────────────────────────────────────────────────────────────────────────
// WHAT THE FREE TRIAL SAYS, IN ONE PLACE.
//
//   "I want it to explicitly say that the user will be notified a day before the
//    trial expires. And in smaller letters, it will say it will automatically
//    convert to a scholar's pass."
//
// Google Play's policy asks the same thing from the other side. Before a trial
// starts, the app must say how long it lasts, what it costs afterwards, when it
// turns into a paid subscription and how to cancel.
//
// Every screen that offers the trial takes its sentences from here: the Pass tab,
// Settings, the offer after a lesson and the paywall. So does every one that shows
// a trial running: the conferral, the trial panel and the reminder notification.
// `check:pass` §9 fails a door that types its own. Four doors with four wordings
// would be four chances for one of them to leave out the charge.
//
// No React and no store, so plain Node can read it.
// ─────────────────────────────────────────────────────────────────────────────

/** Where a Google Play subscription is cancelled. The trial exists only there. */
export const STORE = 'Google Play';

/** The button. The short form is for Settings' narrow card, which broke the long one. */
export function startTrialLabel(t: TrialPeriod, compact = false): string {
  return compact ? 'Start the free trial' : `Start your ${trialAdjective(t)} free trial`;
}

/** THE PROMISE, set large, straight under the button. */
export const REMINDER_PROMISE = 'We’ll remind you a day before your free trial ends.';

/** THE TERMS, set small under the promise: every one Google's policy asks for. */
export function conversionTerms(t: TrialPeriod, price: string, period: string): string {
  return `After ${trialLengthPhrase(t)} it automatically becomes a Scholar’s Pass at ${price} a ${period}, unless you cancel. Cancel any time before then, in ${STORE} or from Settings in the app, and you won’t be charged.`;
}

/** What a running trial turns into. Said on every screen that shows one. */
export function autoConvertLine(price: string, period: string): string {
  return `If you do nothing, it automatically becomes a Scholar’s Pass at ${price} a ${period}.`;
}

/** Under the Cancel button. */
export function cancelHowLine(when: string): string {
  return `Cancelling happens in ${STORE}. Cancel before the trial ends and you won’t be charged. You keep the Pass until ${when} either way.`;
}

/** The trial, once it has been cancelled. Said under "You won't be charged". */
export function cancelledLine(when: string): string {
  return `The Scholar’s Pass stays open until ${when}, then closes by itself.`;
}

/** The step before Google Play opens, so nobody lands there wondering what to press. */
export function cancelSteps(when: string): string {
  return `${STORE} opens on your Scholar’s Pass. Tap Cancel subscription there. You won’t be charged, and the Pass stays open until ${when}.`;
}

/** Under the button that restarts a cancelled trial. */
export const RESTART_LINE = `A cancelled trial can be restarted in ${STORE} until it ends.`;

/** The small print under the paywall's trial button. */
export function trialLegal(price: string, period: string): string {
  return `Starting the free trial costs nothing today. When it ends, ${STORE} charges ${price} and it renews every ${period} until you cancel. Cancel any time in ${STORE} or from Settings in the app. Cancel before the trial ends and you won’t be charged.`;
}

/** The conferral's terms, for a trial that has just started. */
export function startedTerms(when: string, price: string, period: string): string {
  return `Free until ${when}. ${autoConvertLine(price, period)} Cancel before then, in ${STORE} or from Settings, and you won’t be charged.`;
}

/** The notification laid down a day before the trial ends. */
export function reminderNotification(price: string, period: string): { title: string; body: string } {
  return {
    title: 'Your free trial ends tomorrow',
    body: `If you do nothing, it automatically becomes a Scholar’s Pass at ${price} a ${period}. Tap to cancel it, and you won’t be charged.`,
  };
}

/** What a trial that could not start says. A sheet the reader closed says nothing. */
export function startNotice(outcome: string): string | null {
  if (outcome === 'unavailable') return 'Free trials start in the installed Ashmere app.';
  if (outcome === 'error') return 'The free trial could not start. Please try again.';
  return null;
}
