import AuthPanel from '@/components/shared/AuthPanel';

// First screen on launch when there's no Supabase session. Renders the shared
// auth panel; the same panel also backs the in-app /sign-in route.
export default function AuthScreen() {
  return <AuthPanel />;
}
