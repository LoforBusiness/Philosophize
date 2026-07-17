package expo.modules.widgetpin

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.os.Build
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

// Bridges Android's AppWidgetManager.requestPinAppWidget so the app can offer a
// one-tap "add the widget" flow instead of walking the user through the launcher.
// react-native-android-widget can't do this; it only reads/updates existing
// widgets. Everything here degrades to false on API < 26 or launchers that don't
// support pinning, and the JS side falls back to manual instructions.
class WidgetPinModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("WidgetPin")

    // Whether the current launcher supports the system pin dialog (API 26+).
    Function("isSupported") {
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return@Function false
      val context = appContext.reactContext ?: return@Function false
      val manager = AppWidgetManager.getInstance(context) ?: return@Function false
      manager.isRequestPinAppWidgetSupported
    }

    // Ask the launcher to pin the named widget. Returns true if the system
    // accepted the request (its confirm dialog appears) — not whether the user
    // ultimately confirmed; the home screen is re-checked when the app resumes.
    // The provider class is the one react-native-android-widget generates for a
    // widget with no custom packageName: "<applicationId>.widget.<WidgetName>".
    AsyncFunction("requestPin") { widgetName: String ->
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return@AsyncFunction false
      val context = appContext.reactContext ?: return@AsyncFunction false
      val manager = AppWidgetManager.getInstance(context) ?: return@AsyncFunction false
      if (!manager.isRequestPinAppWidgetSupported) return@AsyncFunction false
      val provider = ComponentName(context.packageName, "${context.packageName}.widget.$widgetName")
      manager.requestPinAppWidget(provider, null, null)
    }
  }
}
