import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// A quote the user has pinned to the Android home-screen widget. Stored under its
// own small AsyncStorage key (not the big user-data blob) so the headless widget
// task can read it cheaply, without the app running. When nothing is pinned the
// widget falls back to its 3-hour rotation.
export const PINNED_QUOTE_KEY = 'philosophize-widget-pinned';

export interface PinnedQuotePayload {
  text: string;
  author: string;
  philosopherId: string;
}

export async function readPinnedQuote(): Promise<PinnedQuotePayload | null> {
  try {
    const raw = await AsyncStorage.getItem(PINNED_QUOTE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (
      p &&
      typeof p.text === 'string' &&
      typeof p.author === 'string' &&
      typeof p.philosopherId === 'string'
    ) {
      return p as PinnedQuotePayload;
    }
  } catch {}
  return null;
}

// Persist (or clear) the pinned quote, then ask Android to refresh the widget
// immediately so the home screen updates now instead of at the next OS window.
// No-op for the native refresh on web/iOS (those have no widget); the storage
// write is harmless everywhere.
export async function writePinnedQuote(p: PinnedQuotePayload | null): Promise<void> {
  try {
    if (p) await AsyncStorage.setItem(PINNED_QUOTE_KEY, JSON.stringify(p));
    else await AsyncStorage.removeItem(PINNED_QUOTE_KEY);
  } catch {}

  if (Platform.OS !== 'android') return;
  try {
    const { requestWidgetUpdate } = require('react-native-android-widget');
    const React = require('react');
    const { QuoteWidget } = require('@/components/widget/QuoteWidget');
    const { getRotatingQuote, todayLabel } = require('@/lib/dailyQuote');
    const q = p ?? getRotatingQuote();
    requestWidgetUpdate({
      widgetName: 'QuoteOfTheDay',
      renderWidget: () =>
        React.createElement(QuoteWidget, {
          text: q.text,
          author: q.author,
          dateLabel: todayLabel(),
          philosopherId: q.philosopherId,
        }),
      widgetNotFound: () => {},
    });
  } catch {}
}
