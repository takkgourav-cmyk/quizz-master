'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { FiLock, FiLogIn, FiMail, FiUser, FiUserPlus } from 'react-icons/fi';
import { api } from '@/lib/api';
import { ui } from '@/lib/ui';
import { useAuth } from '@/context/AuthContext';

export default function AuthForm({ register = false }) {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      const data = await api(register ? '/auth/register' : '/auth/login', { method: 'POST', body: form });
      login(data);
      toast.success(register ? 'Account created' : 'Welcome back');
      router.push('/');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  const field = (key, Icon, props) => (
    <label className="auth-field relative block">
      <span className="sr-only">{props.placeholder}</span>
      <Icon className="absolute left-4 top-4 text-slate-400" aria-hidden="true" />
      <input className={`${ui.input} pl-11`} required value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} {...props} />
    </label>
  );

  return (
    <div className="auth-stage mx-auto grid w-full max-w-5xl gap-5 px-4 py-12 md:grid-cols-[1fr_.85fr] md:py-16">
      <aside className="auth-aside hidden flex-col justify-between rounded-lg p-9 md:flex">
        <div>
          <span className="hero-kicker">QUIZLY · A PLACE TO PRACTICE</span>
          <h2 className="mt-8 max-w-sm text-5xl leading-[1.08]">A little curiosity goes a long way.</h2>
          <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">Thoughtful challenges and clear feedback make it easier to keep learning at your own pace.</p>
        </div>
        <p className="border-t border-white/15 pt-5 text-xs uppercase tracking-[.16em] text-[#d7c4b5]">Learn at your pace · Come back curious</p>
      </aside>
      <form onSubmit={submit} className={`${ui.card} form-card space-y-4 p-7 sm:p-9`}>
        <div className="mb-6">
          <p className="section-eyebrow">{register ? 'START YOUR JOURNEY' : 'PICK UP WHERE YOU LEFT OFF'}</p>
          <h1 className="mt-2 text-4xl">{register ? 'Create your account' : 'Welcome back'}</h1>
          <p className="mt-1 text-sm text-slate-500">{register ? 'Set up your account and choose a first challenge.' : 'Log in to continue learning.'}</p>
        </div>
        {register && field('name', FiUser, { placeholder: 'Full name' })}
        {field('email', FiMail, { type: 'email', placeholder: 'Email address' })}
        {field('password', FiLock, { type: 'password', placeholder: 'Password (6+ characters)', minLength: 6 })}
        <button className={`${ui.btn} w-full`} disabled={busy}>
          {register ? <FiUserPlus /> : <FiLogIn />} {busy ? 'Please wait...' : register ? 'Create account' : 'Log in'}
        </button>
        {!register && <p className="text-right text-sm"><Link href="/forgot-password" className="font-semibold text-[#9f5538]">Forgot password?</Link></p>}
        <p className="text-center text-sm text-slate-500">
          {register ? 'Already have an account?' : 'New here?'}{' '}
          <Link href={register ? '/login' : '/register'} className="font-semibold text-[#9f5538]">
            {register ? 'Log in' : 'Create an account'}
          </Link>
        </p>
      </form>
    </div>
  );
}
