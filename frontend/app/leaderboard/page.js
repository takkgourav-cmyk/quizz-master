'use client';

import { useEffect, useState } from 'react';
import { FiAward } from 'react-icons/fi';
import { api } from '@/lib/api';
import { ui } from '@/lib/ui';
import Spinner from '@/components/Spinner';

export default function LeaderboardPage() {
  const [rows, setRows] = useState(null);

  useEffect(() => {
    api('/attempts/leaderboard').then(setRows).catch(() => setRows([]));
  }, []);

  return (
    <div className={ui.container}>
      <p className="section-eyebrow">THE QUIZLY COMMUNITY</p>
      <h1 className="mb-2 mt-2 flex items-center gap-3 text-4xl"><FiAward className="text-[#C96B43]" /> Leaderboard</h1>
      <p className="mb-8 text-sm text-slate-500">A running record of curiosity, practice, and progress.</p>
      {!rows ? <Spinner /> : (
        <div className={`${ui.card} overflow-x-auto p-0`}>
          <table className="w-full text-left">
            <thead className="text-[10px] uppercase tracking-[.16em] text-slate-500">
              <tr>{['Rank', 'Player', 'Best score', 'Average', 'Attempts'].map((head) => <th key={head} className="px-5 py-4 font-semibold">{head}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row._id} className={`border-t border-slate-100 transition hover:bg-[#F5F1E8] ${index < 3 ? 'leader-row-top' : ''}`}>
                  <td className="px-5 py-4"><span className={`inline-grid h-8 w-8 place-items-center rounded-md text-xs font-semibold ${index === 0 ? 'bg-[#C96B43] text-white' : 'bg-[#EAE4D8] text-[#5e5a53]'}`}>{String(index + 1).padStart(2, '0')}</span></td>
                  <td className="px-5 py-4 font-semibold">{row.name}</td>
                  <td className="px-5 py-4 font-semibold text-[#9f5538]">{row.best}%</td>
                  <td className="px-5 py-4">{row.avg}%</td>
                  <td className="px-5 py-4 text-slate-500">{row.attempts}</td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={5} className="px-5 py-12 text-center text-slate-400">No results yet. Be the first!</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
