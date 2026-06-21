import { AuthForm } from '@/components/auth-form';

export default function SignInPage({ searchParams }: { searchParams: { next?: string } }) {
  return <AuthForm mode="signin" next={searchParams.next} />;
}
