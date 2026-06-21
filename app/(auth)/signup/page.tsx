import { AuthForm } from '@/components/auth-form';

export default function SignUpPage({ searchParams }: { searchParams: { next?: string } }) {
  return <AuthForm mode="signup" next={searchParams.next} />;
}
