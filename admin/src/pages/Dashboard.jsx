import { useState } from 'react';
import { FiAward, FiFileText, FiMail, FiTarget, FiTrendingUp, FiUsers } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { api } from '../lib/api';
import useFetch from '../hooks/useFetch';
import PageHeader from '../components/PageHeader';
import Spinner from '../components/Spinner';
import { ui } from '../ui';

const formatDay = (date) => new Date(date).toLocaleDateString(undefined, { weekday: 'short' });

export default function Dashboard() {
  const { data, loading } = useFetch('/admin/stats');
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  if (loading || !data) return <Spinner />;

  const cards = [
    { label: 'Total users', value: data.users, icon: FiUsers, tone: 'bg-indigo-50 text-indigo-600' },
    { label: 'Quizzes', value: data.quizzes, icon: FiFileText, tone: 'bg-amber-50 text-amber-600' },
    { label: 'Attempts', value: data.attempts, icon: FiTarget, tone: 'bg-emerald-50 text-emerald-600' },
    { label: 'Average score', value: `${data.avgScore}%`, icon: FiTrendingUp, tone: 'bg-pink-50 text-pink-600' },
    { label: 'Pass rate', value: `${data.passRate}%`, icon: FiAward, tone: 'bg-sky-50 text-sky-600' },
  ];
  const peak = Math.max(1, ...data.last7Days.map((day) => day.count));

  const sendTestEmail = async (event) => {
    event.preventDefault();
    setSending(true);
    try {
      const response = await api('/admin/email/test', { method: 'POST', body: email ? { to: email } : {} });
      toast.success(response.message);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Platform analytics at a glance" />
      <form onSubmit={sendTestEmail} className={`${ui.card} mb-6 flex flex-col gap-3 sm:flex-row sm:items-center`}>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-600"><FiMail size={19} /></span>
        <div className="mr-auto"><h2 className="font-semibold">Email delivery</h2><p className="text-sm text-slate-500">Send an SMTP test to your admin email or another address.</p></div>
        <input className={`${ui.input} sm:max-w-xs`} type="email" placeholder="Recipient (optional)" value={email} onChange={(event) => setEmail(event.target.value)} />
        <button type="submit" disabled={sending} className={`${ui.btn} shrink-0`}>{sending ? 'Sending…' : 'Send test'}</button>
      </form>
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className={ui.card}>
            <span className={`mb-3 grid h-10 w-10 place-items-center rounded-xl ${tone}`}>
              <Icon size={20} />
            </span>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <div className={`${ui.card} lg:col-span-2`}>
          <h2 className="mb-4 font-semibold">Attempts in the last 7 days</h2>
          <div className="flex h-48 items-end gap-3">
            {data.last7Days.map((day) => (
              <div key={day.date} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">{day.count}</span>
                <div
                  className="admin-chart-bar w-full rounded-t-sm"
                  style={{ height: `${Math.max(4, (day.count / peak) * 100)}%` }}
                />
                <span className="text-xs text-slate-400">{formatDay(day.date)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className={ui.card}>
          <h2 className="mb-4 font-semibold">Top quizzes</h2>
          {data.topQuizzes.length === 0 && <p className="text-sm text-slate-400">No attempts yet</p>}
          <ul className="space-y-3">
            {data.topQuizzes.map((quiz) => (
              <li key={quiz._id} className="flex items-center justify-between text-sm">
                <span className="truncate pr-2 font-medium">{quiz.title}</span>
                <span className="whitespace-nowrap text-slate-500">
                  {quiz.attempts} · {quiz.avg}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={`${ui.card} overflow-x-auto p-0`}>
        <h2 className="p-5 pb-2 font-semibold">Recent attempts</h2>
        <table className="w-full">
          <thead>
            <tr>
              {['User', 'Quiz', 'Score', 'Result'].map((head) => (
                <th key={head} className={ui.th}>{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.recent.map((attempt) => (
              <tr key={attempt._id}>
                <td className={ui.td}>{attempt.user?.name}</td>
                <td className={ui.td}>{attempt.quiz?.title}</td>
                <td className={ui.td}>{attempt.percent}%</td>
                <td className={ui.td}><StatusBadge passed={attempt.passed} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function StatusBadge({ passed }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${passed ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
      {passed ? 'Passed' : 'Failed'}
    </span>
  );
}
