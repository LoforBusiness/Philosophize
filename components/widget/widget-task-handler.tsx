import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { QuoteWidget } from './QuoteWidget';
import { getRotatingQuote, todayLabel } from '@/lib/dailyQuote';
import { readPinnedQuote } from '@/lib/widget/pin';

// Headless task that Android invokes for widget lifecycle events. It runs WITHOUT
// the app's UI, so it must be self-contained: it reads the user's pinned quote (if
// any), otherwise recomputes the current 3-hour-rotation quote, then re-renders.
// Registered in index.js via registerWidgetTaskHandler so it's available to the
// headless JS bundle.
export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const pinned = await readPinnedQuote();
  const q = pinned ?? getRotatingQuote();
  const element = (
    <QuoteWidget
      text={q.text}
      author={q.author}
      dateLabel={todayLabel()}
      philosopherId={q.philosopherId}
    />
  );

  switch (props.widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED':
    case 'WIDGET_CLICK':
      // For WIDGET_CLICK the OPEN_URI action already opens the deep link; we just
      // refresh the quote so a tap also advances the view if a window rolled over.
      props.renderWidget(element);
      break;
    case 'WIDGET_DELETED':
    default:
      break;
  }
}
