import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { buildQuoteWidget } from '@/lib/widget/render';

// Headless task that Android invokes for widget lifecycle events. It runs WITHOUT
// the app's UI, so it must be self-contained: buildQuoteWidget reads the pinned
// quote (or the 3-hour rotation) and the live streak from storage, then renders.
// Registered in index.js via registerWidgetTaskHandler so it's available to the
// headless JS bundle.
export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  switch (props.widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED':
    case 'WIDGET_CLICK':
      // For WIDGET_CLICK the OPEN_URI action already opens the deep link; we just
      // refresh so a tap also advances the quote if a rotation window rolled over.
      props.renderWidget(await buildQuoteWidget());
      break;
    case 'WIDGET_DELETED':
    default:
      break;
  }
}
