import React from 'react';
import { Platform } from 'react-native';
import { QuoteWidget } from '@/components/widget/QuoteWidget';
import { getRotatingQuote, todayLabel } from '@/lib/dailyQuote';
import { readPinnedQuote } from './pin';
import { readWidgetStreak } from './streak';

// Single source of truth for what the home-screen widget shows: the pinned quote
// (or the 3-hour rotation) plus the live day streak. Used by the headless widget
// task AND by every in-app refresh trigger, so the two can never drift apart.

export async function buildQuoteWidget(): Promise<React.ReactElement> {
  const [pinned, streak] = await Promise.all([readPinnedQuote(), readWidgetStreak()]);
  const q = pinned ?? getRotatingQuote();
  return (
    <QuoteWidget
      text={q.text}
      author={q.author}
      dateLabel={todayLabel()}
      philosopherId={q.philosopherId}
      streak={streak}
    />
  );
}

// Ask Android to re-render the widget now (best-effort; never throws, no-op off
// Android or when no widget is placed). Call after anything the widget displays
// changes: streak advances, a quote is pinned/unpinned, or the app comes up.
export async function refreshQuoteWidget(): Promise<void> {
  if (Platform.OS !== 'android') return;
  try {
    const { requestWidgetUpdate } = require('react-native-android-widget');
    const element = await buildQuoteWidget();
    requestWidgetUpdate({
      widgetName: 'QuoteOfTheDay',
      renderWidget: () => element,
      widgetNotFound: () => {},
    });
  } catch {}
}
