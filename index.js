// Custom entry point. Boots Expo Router as usual, and on Android additionally
// registers the home-screen widget's headless task handler so the widget can
// render even when the app isn't open.
import 'expo-router/entry';
import { Platform } from 'react-native';

// Android-only + lazy require: react-native-android-widget is a native Android
// module, so we never import or run it on web/iOS (keeps those bundles working).
if (Platform.OS === 'android') {
  const { registerWidgetTaskHandler } = require('react-native-android-widget');
  const { widgetTaskHandler } = require('./components/widget/widget-task-handler');
  registerWidgetTaskHandler(widgetTaskHandler);
}
