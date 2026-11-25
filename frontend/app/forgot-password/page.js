import PasswordResetFlow from '@/components/PasswordResetFlow';

export const metadata = {
  title: 'Reset password',
  description: 'Verify your email and securely reset your Quizly password.',
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return <PasswordResetFlow />;
}
