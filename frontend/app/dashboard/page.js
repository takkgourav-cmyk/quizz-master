'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiCheckCircle, FiFileText, FiTrendingUp } from 'react-icons/fi';
import { api } from '@/lib/api';
import { ui } from '@/lib/ui';
import { useAuth } from '@/context/AuthContext';
import Spinner from '@/components/Spinner';

export default function DashboardPage() {
  const { user, ready } = useAuth();
  const [attempts, setAttempts] = useState(null);

  useEffect(() => {
    if (user) api('/attempts/me').then(setAttempts).catch(() => setAttempts([]));
  }, [user]);

  if (!ready) return <Spinner />;
  if (!user) return <div className={`${ui.container} text-center`}><Link href="/login" className={ui.btn}>Log in to see your progress</Link></div>;
  if (!attempts) return <Spinner />;

  const average = attempts.length ? Math.round(attempts.reduce((sum, item) => sum + item.percent, 0) / attempts.length) : 0;
  const stats = [
    { label: 'Quizzes taken', value: attempts.length, icon: FiFileText },
    { label: 'Average score', value: `${average}%`, icon: FiTrendingUp },
    { label: 'Quizzes passed', value: attempts.filter((item) => item.passed).length, icon: FiCheckCircle },
  ];

  return (
    <div className={ui.container}>
      <p className="section-eyebrow">YOUR LEARNING RECORD</p>
      <h1 className="mb-8 mt-2 text-4xl">Welcome back, {user.name}</h1>
      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon }, index) => (
          <div key={label} className={`${ui.card} relative overflow-hidden`}>
            <span className="mb-7 grid h-10 w-10 place-items-center rounded-md bg-[#EAE4D8] text-[#9f5538]"><Icon size={19} /></span>
            <p className="text-4xl font-semibold tracking-tight">{value}</p>
            <p className="mt-1 text-sm text-slate-500">{label}</p>
            <span className="absolute right-5 top-5 text-xs font-medium text-[#A99B88]">0{index + 1}</span>
          </div>
        ))}
      </div>

      <div className="mb-4 flex items-end justify-between gap-4">
        <div><p className="section-eyebrow">RECENT SESSIONS</p><h2 className="mt-1 text-2xl">Your history</h2></div>
        <Link href="/#quizzes" className="text-sm font-semibold text-[#9f5538]">Find a quiz ↗</Link>
      </div>
      <div className={`${ui.card} dashboard-history overflow-x-auto p-0`}>
        <table className="w-full text-left text-sm">
          <thead className="text-[10px] uppercase tracking-[.15em] text-slate-500"><tr>{['Quiz', 'Answers', 'Score', 'Result', 'Date', ''].map((head) => <th key={head} className="px-5 py-3 font-semibold">{head}</th>)}</tr></thead>
          <tbody>
            {attempts.map((attempt) => (
              <tr key={attempt._id} className="border-t border-slate-100 first:border-0">
                <td className="px-5 py-4 font-semibold">{attempt.quiz?.title}</td>
                <td className="px-5 py-4 text-slate-500">{attempt.correctCount} correct · {attempt.incorrectCount} wrong</td>
                <td className="px-5 py-4 font-semibold">{attempt.percent}%</td>
                <td className="px-5 py-4"><span className={`rounded px-2.5 py-1 text-xs font-semibold ${attempt.passed ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>{attempt.passed ? 'Passed' : 'Keep practicing'}</span></td>
                <td className="px-5 py-4 text-slate-500">{new Date(attempt.createdAt).toLocaleDateString()}</td>
                <td className="px-5 py-4"><Link href={`/result/${attempt._id}`} className="font-semibold text-[#9f5538]">Review</Link></td>
              </tr>
            ))}
            {attempts.length === 0 && <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-400">You have not taken any quiz yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
