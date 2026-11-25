import AuthForm from '@/components/AuthForm';

export const metadata = { title: 'Create account', robots: { index: false, follow: false } };

export default function RegisterPage() {
  return <AuthForm register />;
}
