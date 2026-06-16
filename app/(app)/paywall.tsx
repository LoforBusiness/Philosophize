import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenTransition from '@/components/shared/ScreenTransition';
import PaywallContent from '@/components/shared/PaywallContent';

const Page = '#F1EEE7';

// Full-screen Scholar's Pass route — pushed from Settings. (The post-lesson and
// daily-limit moments use the slide-up PaywallSheet instead; both share
// PaywallContent.)
export default function PaywallScreen() {
  return (
    <ScreenTransition bg={Page}>
      <SafeAreaView style={{ flex: 1, backgroundColor: Page }} edges={['top', 'bottom']}>
        <PaywallContent onClose={() => router.back()} source="route" />
      </SafeAreaView>
    </ScreenTransition>
  );
}
