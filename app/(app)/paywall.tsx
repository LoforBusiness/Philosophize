import { router } from 'expo-router';
import ScreenTransition from '@/components/shared/ScreenTransition';
import HardPaywall from '@/components/paywall/HardPaywall';
import { C } from '@/constants/design';

// Full-screen Scholar's Pass route. Since the hard paywall (2026-09-25) it draws
// the one paywall, `HardPaywall`, the same screen the sheet and the lesson
// route draw.
export default function PaywallScreen() {
  const leave = () => (router.canGoBack() ? router.back() : router.replace('/(app)'));
  return (
    <ScreenTransition bg={C.paper}>
      <HardPaywall source="route" onClose={leave} onUnlocked={leave} />
    </ScreenTransition>
  );
}
