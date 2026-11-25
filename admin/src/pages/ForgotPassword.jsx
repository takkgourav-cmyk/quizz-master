import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiEye, FiEyeOff, FiLock, FiMail } from 'react-icons/fi';
import { api } from '../lib/api';
import { ui } from '../ui';

const formatTime = (seconds) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

export default function ForgotPassword() {
  const navigate = useNavigate();
  const inputRefs = useRef([]);
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
    if (step === 2) inputRefs.current[0]?.focus();
  }, [step]);

  const requestCode = async (resend = false) => {
    setBusy(true);
    setError('');
    try {
      const path = resend ? '/admin/auth/resend-reset-otp' : '/admin/auth/forgot-password';
      const result = await api(path, { method: 'POST', body: { email } });
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
      inputRefs.current[Math.min(digits.length, 6) - 1]?.focus();
      return;
    }
    const next = [...otp];
    next[index] = digits;
    setOtp(next);
    if (digits && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const verify = async (event) => {
    event.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) return setError('Enter all six digits.');
    setBusy(true);
    setError('');
    try {
      const result = await api('/admin/auth/verify-reset-otp', { method: 'POST', body: { email, otp: code } });
      setResetToken(result.resetToken);
      setExpiresIn(result.expiresIn || 600);
      setStep(3);
      toast.success('Email verified. Choose a new password.');
    } catch (cause) {
      setError(cause.message || 'That code could not be verified.');
    } finally {
      setBusy(false);
    }
  };

  const reset = async (event) => {
    event.preventDefault();
    setError('');
    if (password.length < 8 || password.length > 128 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) return setError('Use 8 to 128 characters with at least one letter and one number.');
    if (password !== confirmPassword) return setError('Your passwords do not match.');
    setBusy(true);
    try {
      const result = await api('/admin/auth/reset-password', { method: 'POST', body: { email, resetToken, password } });
      localStorage.removeItem('adminToken');
      setResetToken('');
      toast.success(result.message);
      navigate('/login', { replace: true });
    } catch (cause) {
      setError(cause.message || 'Unable to update your password.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="admin-page grid min-h-screen place-items-center bg-[#EAE4D8] px-4 py-10">
      <section className={`${ui.card} w-full max-w-xl p-6 sm:p-9`}>
        <Link to="/login" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#9f5538]"><FiArrowLeft /> Back to admin login</Link>
        <div className="mb-8 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.13em] text-slate-500" aria-label={`Step ${step} of 3`}>
          {['Email', 'Verify', 'New password'].map((label, index) => <div key={label} className={`flex items-center gap-2 ${step === index + 1 ? 'text-[#9f5538]' : ''}`}><span className={`grid h-7 w-7 place-items-center rounded-full border ${step === index + 1 ? 'border-[#C96B43] bg-[#C96B43] text-white' : 'border-[#DDD6CA]'}`}>{index + 1}</span><span className="hidden sm:inline">{label}</span>{index < 2 && <span className="mx-1 h-px w-5 bg-[#DDD6CA] sm:w-10" />}</div>)}
        </div>

        {step === 1 && <form onSubmit={(event) => { event.preventDefault(); requestCode(); }}>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[.18em] text-[#9f5538]">ADMIN ACCOUNT RECOVERY</p>
          <h1 className="text-4xl">Forgot your password?</h1>
          <p className="mb-7 mt-2 text-sm leading-6 text-slate-500">Enter your admin email address. If it matches an admin account, we’ll send a one-time code.</p>
          <label className="relative block"><span className="sr-only">Admin email</span><FiMail className="absolute left-3.5 top-3.5 text-slate-400" /><input className={`${ui.input} pl-10`} type="email" autoComplete="email" maxLength={254} placeholder="Admin email address" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
          {error && <p className="mt-3 text-sm text-rose-600" role="alert">{error}</p>}
          <button className={`${ui.btn} mt-5 w-full`} disabled={busy}>{busy ? 'Requesting code…' : 'Send verification code'}</button>
        </form>}

        {step === 2 && <form onSubmit={verify}>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[.18em] text-[#9f5538]">ADMIN EMAIL VERIFICATION</p>
          <h1 className="text-4xl">Check your inbox</h1>
          <p className="mb-7 mt-2 text-sm leading-6 text-slate-500">Enter the six-digit code sent to <strong className="break-all text-[#252525]">{email}</strong>. It expires in {formatTime(expiresIn)}.</p>
          <div className="grid grid-cols-6 gap-2 sm:gap-3" onPaste={(event) => { const text = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6); if (text) { event.preventDefault(); setDigit(0, text); } }}>
            {otp.map((digit, index) => <input key={index} ref={(node) => { inputRefs.current[index] = node; }} className="otp-input" aria-label={`Verification digit ${index + 1}`} inputMode="numeric" autoComplete={index === 0 ? 'one-time-code' : 'off'} maxLength={6} value={digit} onChange={(event) => setDigit(index, event.target.value)} onKeyDown={(event) => { if (event.key === 'Backspace' && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus(); if (event.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1]?.focus(); if (event.key === 'ArrowRight' && index < 5) inputRefs.current[index + 1]?.focus(); }} />)}
          </div>
          {error && <p className="mt-3 text-sm text-rose-600" role="alert">{error}</p>}
          {expiresIn === 0 && <p className="mt-3 text-sm text-rose-600">This code has expired. Request a new one to continue.</p>}
          <button className={`${ui.btn} mt-6 w-full`} disabled={busy || expiresIn === 0}>{busy ? 'Verifying…' : 'Verify code'}</button>
          <div className="mt-5 flex items-center justify-between gap-3 text-sm"><button type="button" className="font-semibold text-[#9f5538] disabled:text-[#A99B88]" disabled={busy || resendIn > 0} onClick={() => requestCode(true)}>{resendIn > 0 ? `Resend in ${formatTime(resendIn)}` : 'Resend code'}</button><button type="button" className="text-slate-500 underline underline-offset-4" onClick={() => { setError(''); setStep(1); }}>Change email</button></div>
        </form>}

        {step === 3 && <form onSubmit={reset}>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[.18em] text-[#9f5538]">NEW ADMIN PASSWORD</p>
          <h1 className="text-4xl">Set a new password</h1>
          <p className="mb-7 mt-2 text-sm leading-6 text-slate-500">This verified reset session expires in {formatTime(expiresIn)}. Use at least 8 characters, including a letter and a number.</p>
          <label className="relative mb-3 block"><span className="sr-only">New password</span><FiLock className="absolute left-3.5 top-3.5 text-slate-400" /><input className={`${ui.input} pl-10 pr-11`} type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="New password" minLength={8} maxLength={128} required value={password} onChange={(event) => setPassword(event.target.value)} /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-3.5 text-slate-400">{showPassword ? <FiEyeOff /> : <FiEye />}</button></label>
          <label className="relative block"><span className="sr-only">Confirm new password</span><FiLock className="absolute left-3.5 top-3.5 text-slate-400" /><input className={`${ui.input} pl-10 pr-11`} type={showConfirm ? 'text' : 'password'} autoComplete="new-password" placeholder="Confirm new password" minLength={8} maxLength={128} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /><button type="button" aria-label={showConfirm ? 'Hide password' : 'Show password'} onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-3.5 text-slate-400">{showConfirm ? <FiEyeOff /> : <FiEye />}</button></label>
          {error && <p className="mt-3 text-sm text-rose-600" role="alert">{error}</p>}
          {expiresIn === 0 && <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-rose-600"><span>Your reset session expired.</span><button type="button" className="font-semibold text-[#9f5538] underline underline-offset-4" onClick={() => { setResetToken(''); setStep(1); setError(''); }}>Start again</button></div>}
          <button className={`${ui.btn} mt-5 w-full`} disabled={busy || expiresIn === 0}>{busy ? 'Updating password…' : 'Update admin password'}</button>
        </form>}
      </section>
    </main>
  );
}
