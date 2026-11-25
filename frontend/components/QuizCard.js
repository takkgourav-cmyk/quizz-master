import Link from 'next/link';
import { FiArrowUpRight, FiClock, FiHelpCircle } from 'react-icons/fi';
import { ui } from '@/lib/ui';

const levelMark = { easy: '01', medium: '02', hard: '03' };

export default function QuizCard({ quiz }) {
  return (
    <Link href={`/quiz/${quiz._id}`} className={`${ui.card} quiz-card quiz-card-reveal group block`}>
      <div className="mb-6 flex items-center justify-between border-b border-[#DDD6CA] pb-4">
        <span className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#A99B88]">{quiz.category?.name || 'General'}</span>
        <span className="text-sm font-medium text-[#A99B88]">{levelMark[quiz.difficulty] || '00'}</span>
      </div>
      <h3 className="min-h-[3.5rem] text-2xl leading-tight">{quiz.title}</h3>
      <p className="mt-2 line-clamp-2 min-h-[2.75rem] text-sm leading-6 text-slate-500">{quiz.description}</p>
      <div className="mt-6 flex items-center justify-between border-t border-[#DDD6CA] pt-4 text-xs text-slate-500">
        <span className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><FiHelpCircle /> {quiz.questionLimit > 0 ? Math.min(quiz.questionLimit, quiz.questionCount) : quiz.questionCount} questions</span>
          <span className="flex items-center gap-1.5"><FiClock /> {quiz.timeLimit} min</span>
        </span>
        <span className="flex items-center gap-1 font-semibold text-[#9f5538] transition group-hover:gap-2">Begin <FiArrowUpRight /></span>
      </div>
    </Link>
  );
}
