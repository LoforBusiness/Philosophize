import AuthPanel from '@/components/shared/AuthPanel';

// In-app sign-in route, reached from the Profile "Sign in" CTA for guests.
// Presented over the app; the panel's X / "Continue without an account" goes
// back here (vs. entering the app as a guest when it's the launch screen).
export default function SignInScreen() {
  return <AuthPanel />;
}
