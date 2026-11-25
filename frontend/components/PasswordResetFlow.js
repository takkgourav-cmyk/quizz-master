'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiEye, FiEyeOff, FiLock, FiMail } from 'react-icons/fi';
import { api } from '@/lib/api';
import { ui } from '@/lib/ui';
import { useAuth } from '@/context/AuthContext';

const formatTime = (seconds) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

export default function PasswordResetFlow() {
  const router = useRouter();
  const { clearSession } = useAuth();
  const otpRefs = useRef([]);
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [resetToken, setResetToken] = useState('');
  const [expiresIn, setExpiresIn] = useState(0);
  const [resendIn, setResendIn] = useState(0);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (step !== 2 && step !== 3) return undefined;
    const timer = window.setInterval(() => {
      setExpiresIn((value) => Math.max(0, value - 1));
      setResendIn((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [step]);

  useEffect(() => {
    if (step === 2) otpRefs.current[0]?.focus();
  }, [step]);

  const requestCode = async (resend = false) => {
    setBusy(true);
    setError('');
    try {
      const result = await api(resend ? '/auth/resend-reset-otp' : '/auth/forgot-password', { method: 'POST', body: { email } });
      if (!resend) setStep(2);
      setOtp(Array(6).fill(''));
      setExpiresIn(300);
      setResendIn(60);
      if (resend) toast.info(result.message);
    } catch (cause) {
      setError(cause.message || 'Unable to request a code right now.');
    } finally {
      setBusy(false);
    }
  };

  const setDigit = (index, rawValue) => {
    const digits = rawValue.replace(/\D/g, '');
    if (digits.length > 1) {
      const next = Array(6).fill('');
      digits.slice(0, 6).split('').forEach((digit, offset) => { next[offset] = digit; });
      setOtp(next);
      otpRefs.current[Math.min(digits.length, 6) - 1]?.focus();
      return;
    }
    const next = [...otp];
    next[index] = digits;
    setOtp(next);
    if (digits && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const onOtpKeyDown = (index, event) => {
    if (event.key === 'Backspace') {
      if (otp[index]) {
        const next = [...otp];
        next[index] = '';
        setOtp(next);
      } else if (index > 0) otpRefs.current[index - 1]?.focus();
    }
    if (event.key === 'ArrowLeft' && index > 0) otpRefs.current[index - 1]?.focus();
    if (event.key === 'ArrowRight' && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const verifyCode = async (event) => {
    event.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) return setError('Enter all six digits.');
    setBusy(true);
    setError('');
    try {
      const result = await api('/auth/verify-reset-otp', { method: 'POST', body: { email, otp: code } });
      setResetToken(result.resetToken);
      setStep(3);
      setExpiresIn(result.expiresIn || 600);
      toast.success('Email verified. Choose a new password.');
    } catch (cause) {
      setError(cause.message || 'That code could not be verified.');
    } finally {
      setBusy(false);
    }
  };

  const updatePassword = async (event) => {
    event.preventDefault();
    setError('');
    if (password.length < 8 || password.length > 128 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      setError('Use 8 to 128 characters with at least one letter and one number.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Your passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      const result = await api('/auth/reset-password', { method: 'POST', body: { email, resetToken, password } });
      setResetToken('');
      clearSession();
      toast.success(result.message);
      router.replace('/login');
    } catch (cause) {
      setError(cause.message || 'Unable to update your password.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="auth-stage mx-auto w-full max-w-2xl px-4 py-12 sm:py-16">
      <div className={`${ui.card} form-card p-6 sm:p-10`}>
        <Link href="/login" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#9f5538]"><FiArrowLeft /> Back to login</Link>
        <div className="mb-8 flex items-center gap-3" aria-label={`Step ${step} of 3`}>
          {['Email', 'Verify', 'New password'].map((label, index) => <div key={label} className={`reset-step-indicator flex items-center gap-2 text-xs font-semibold uppercase tracking-[.13em] ${step === index + 1 ? 'is-active' : ''}`}><span className={`grid h-7 w-7 place-items-center rounded-full border ${step === index + 1 ? 'border-[#C96B43] bg-[#C96B43] text-white' : 'border-[#DDD6CA]'}`}>{index + 1}</span><span className="hidden sm:inline">{label}</span>{index < 2 && <span className="mx-1 h-px w-5 bg-[#DDD6CA] sm:w-10" />}</div>)}
        </div>

        {step === 1 && <form onSubmit={(event) => { event.preventDefault(); requestCode(); }}>
          <p className="section-eyebrow">ACCOUNT RECOVERY</p>
          <h1 className="mt-2 text-4xl">Forgot your password?</h1>
          <p className="mb-7 mt-2 text-sm leading-6 text-slate-500">Enter the email address associated with your account. If it matches, we’ll send a one-time verification code.</p>
          <label className="auth-field relative block"><span className="sr-only">Email address</span><FiMail className="absolute left-4 top-4 text-slate-400" aria-hidden="true" /><input className={`${ui.input} pl-11`} type="email" autoComplete="email" required maxLength={254} placeholder="Email address" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
          {error && <p className="mt-3 text-sm text-rose-600" role="alert">{error}</p>}
          <button className={`${ui.btn} mt-5 w-full`} disabled={busy}>{busy ? 'Requesting code…' : 'Send verification code'}</button>
        </form>}

        {step === 2 && <form onSubmit={verifyCode}>
          <p className="section-eyebrow">EMAIL VERIFICATION</p>
          <h1 className="mt-2 text-4xl">Check your inbox</h1>
          <p className="mb-7 mt-2 text-sm leading-6 text-slate-500">Enter the six-digit code sent to <strong className="break-all text-[#252525]">{email}</strong>. The code expires in {formatTime(expiresIn)}.</p>
          <div className="grid grid-cols-6 gap-2 sm:gap-3" onPaste={(event) => { const text = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6); if (text) { event.preventDefault(); setDigit(0, text); } }}>
            {otp.map((digit, index) => <input key={index} ref={(node) => { otpRefs.current[index] = node; }} className="otp-input" aria-label={`Verification digit ${index + 1}`} inputMode="numeric" autoComplete={index === 0 ? 'one-time-code' : 'off'} maxLength={6} value={digit} onChange={(event) => setDigit(index, event.target.value)} onKeyDown={(event) => onOtpKeyDown(index, event)} />)}
          </div>
          {error && <p className="mt-3 text-sm text-rose-600" role="alert">{error}</p>}
          {expiresIn === 0 && <p className="mt-3 text-sm text-rose-600">This code has expired. Request a new one to continue.</p>}
          <button className={`${ui.btn} mt-6 w-full`} disabled={busy || expiresIn === 0}>{busy ? 'Verifying…' : 'Verify code'}</button>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm"><button type="button" className="font-semibold text-[#9f5538] disabled:text-[#A99B88]" onClick={() => requestCode(true)} disabled={busy || resendIn > 0}>{resendIn > 0 ? `Resend in ${formatTime(resendIn)}` : 'Resend code'}</button><button type="button" className="text-slate-500 underline underline-offset-4" onClick={() => { setError(''); setStep(1); }}>Change email</button></div>
        </form>}

        {step === 3 && <form onSubmit={updatePassword}>
          <p className="section-eyebrow">SET A NEW PASSWORD</p>
          <h1 className="mt-2 text-4xl">Make it a strong one.</h1>
          <p className="mb-7 mt-2 text-sm leading-6 text-slate-500">Your verified reset session expires in {formatTime(expiresIn)}. Choose at least 8 characters, including a letter and a number.</p>
          <label className="auth-field relative mb-3 block"><span className="sr-only">New password</span><FiLock className="absolute left-4 top-4 text-slate-400" aria-hidden="true" /><input className={`${ui.input} pl-11 pr-12`} type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="New password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} maxLength={128} /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-4 text-slate-400">{showPassword ? <FiEyeOff /> : <FiEye />}</button></label>
          <label className="auth-field relative block"><span className="sr-only">Confirm new password</span><FiLock className="absolute left-4 top-4 text-slate-400" aria-hidden="true" /><input className={`${ui.input} pl-11 pr-12`} type={showConfirm ? 'text' : 'password'} autoComplete="new-password" placeholder="Confirm new password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required minLength={8} maxLength={128} /><button type="button" aria-label={showConfirm ? 'Hide password' : 'Show password'} onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-4 text-slate-400">{showConfirm ? <FiEyeOff /> : <FiEye />}</button></label>
          {error && <p className="mt-3 text-sm text-rose-600" role="alert">{error}</p>}
          {expiresIn === 0 && <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-rose-600"><span>Your reset session expired.</span><button type="button" className="font-semibold text-[#9f5538] underline underline-offset-4" onClick={() => { setResetToken(''); setStep(1); setError(''); }}>Start again</button></div>}
          <button className={`${ui.btn} mt-5 w-full`} disabled={busy || expiresIn === 0}>{busy ? 'Updating password…' : 'Update password'}</button>
        </form>}
      </div>
    </section>
  );
}
