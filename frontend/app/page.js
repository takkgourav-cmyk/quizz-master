'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiAward, FiCheckCircle, FiClock, FiInbox, FiSearch, FiTrendingUp } from 'react-icons/fi';
import { api } from '@/lib/api';
import { ui } from '@/lib/ui';
import { useAuth } from '@/context/AuthContext';
import QuizCard from '@/components/QuizCard';
import Spinner from '@/components/Spinner';
import QuizOrb from '@/components/QuizOrb';
import { FiArrowDown, FiZap } from 'react-icons/fi';

const features = [
  { icon: FiClock, title: 'Timed challenges', text: 'Race the clock. Quizzes auto-submit when time is up.' },
  { icon: FiCheckCircle, title: 'Instant results', text: 'Get your score with a full answer review and explanations.' },
  { icon: FiAward, title: 'Live leaderboard', text: 'Compete with other learners and climb the ranks.' },
  { icon: FiTrendingUp, title: 'Track progress', text: 'See your history, averages and pass rate in one place.' },
];

const steps = [
  { title: 'Create a free account', text: 'Sign up in seconds, no credit card needed.' },
  { title: 'Pick a quiz', text: 'Filter by category and difficulty to find your match.' },
  { title: 'Learn and compete', text: 'Finish, review your answers and beat your best score.' },
];

export default function HomePage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({ search: '', category: '', difficulty: '', page: 1 });
  const [data, setData] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api('/categories').then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (!data?.items?.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    let context;
    let cancelled = false;
    import('gsap').then(async ({ default: gsap }) => {
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      context = gsap.context(() => {
        gsap.fromTo('.quiz-card-reveal', { y: 20, opacity: 0 }, {
          y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power2.out',
          scrollTrigger: { trigger: '.quiz-card-reveal', start: 'top 90%', once: true },
          clearProps: 'all',
        });
      });
    });
    return () => { cancelled = true; context?.revert(); };
  }, [data]);

  useEffect(() => {
    const timer = setTimeout(() => {
      api(`/quizzes?${new URLSearchParams(filters)}`)
        .then(setData)
        .catch(() => setData({ items: [], pages: 0 }));
    }, 250);
    return () => clearTimeout(timer);
  }, [filters]);

  useEffect(() => {
    let context;
    let cancelled = false;
    import('gsap').then(async ({ default: gsap }) => {
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      context = gsap.context(() => {
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        gsap.fromTo('.hero-copy > *',
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, duration: reduceMotion ? 0 : 0.75, stagger: 0.1, ease: 'power3.out', clearProps: 'all' }
        );
        if (!reduceMotion) {
          gsap.utils.toArray('.scroll-reveal, .quiz-card-reveal').forEach((element) => {
            gsap.fromTo(element, { y: 28, opacity: 0 }, {
              y: 0, opacity: 1, duration: 0.65, ease: 'power2.out',
              scrollTrigger: { trigger: element, start: 'top 88%', once: true },
            });
          });
        }
      });
    });
    return () => { cancelled = true; context?.revert(); };
  }, []);

  const change = (key) => (event) => setFilters({ ...filters, [key]: event.target.value, page: 1 });

  return (
    <>
      <div className={ui.container}>
        <section className="hero-panel relative isolate mb-14 grid min-h-[440px] items-center overflow-hidden rounded-[2rem] px-7 py-12 sm:px-12 lg:grid-cols-[1.1fr_.9fr]">
          <div className="hero-copy relative z-10 max-w-2xl">
            <span className="hero-kicker"><span className="hero-dot" /> YOUR NEXT LEVEL STARTS HERE</span>
            <h1 className="mt-6 text-5xl font-black leading-[1.02] tracking-[-0.055em] text-white sm:text-7xl">Make every<br /><span className="hero-gradient">answer count.</span></h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-[#d4cec3] sm:text-lg">Thoughtful challenges, clear feedback, and a better sense of how far you’ve come.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#quizzes" className="hero-primary">Explore quizzes <FiArrowDown aria-hidden="true" /></a>
              {!user && <Link href="/register" className="hero-secondary">Create your free account</Link>}
            </div>
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium tracking-wide text-[#c8c0b4] sm:text-sm">
              <span><FiZap className="inline" /> Instant feedback</span><span><FiZap className="inline" /> Timed challenges</span><span><FiZap className="inline" /> Progress that sticks</span>
            </div>
          </div>
          <div className="hero-art absolute inset-y-0 right-0 w-full min-h-[360px] opacity-70 sm:opacity-100 lg:relative lg:min-h-[400px] lg:w-auto">
            <QuizOrb />
            <div className="hero-score"><span className="hero-score-icon"><FiZap /></span><span><b>Stay curious</b><small>One quiz at a time</small></span></div>
          </div>
        </section>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div><p className="section-eyebrow">FIND YOUR NEXT CHALLENGE</p><h2 id="quizzes" className="mt-1 scroll-mt-24 text-3xl font-extrabold tracking-tight">Explore quizzes</h2></div>
          <span className="text-sm text-slate-500">Pick a topic. Trust your first instinct.</span>
        </div>
        <div className="mb-6 grid gap-3 sm:grid-cols-4">
          <div className="relative sm:col-span-2">
            <FiSearch className="absolute left-4 top-4 text-slate-400" />
            <input className={`${ui.input} pl-11`} placeholder="Search quizzes..." onChange={change('search')} />
          </div>
          <select className={ui.input} onChange={change('category')}>
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>{category.name}</option>
            ))}
          </select>
          <select className={ui.input} onChange={change('difficulty')}>
            <option value="">Any level</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        {!data ? (
          <Spinner />
        ) : data.items.length === 0 ? (
          <div className={`${ui.card} py-14 text-center`}>
            <FiInbox className="mx-auto text-slate-300" size={48} />
            <h3 className="mt-3 text-lg font-bold">No quizzes found</h3>
            <p className="text-slate-500">Try a different search, or check back soon.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((quiz) => <QuizCard key={quiz._id} quiz={quiz} />)}
          </div>
        )}

        {data?.pages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <button className={ui.ghost} disabled={filters.page < 2} onClick={() => setFilters({ ...filters, page: filters.page - 1 })}>Prev</button>
            <span className="text-sm text-slate-500">{filters.page} / {data.pages}</span>
            <button className={ui.ghost} disabled={filters.page >= data.pages} onClick={() => setFilters({ ...filters, page: filters.page + 1 })}>Next</button>
          </div>
        )}
      </div>

      <section className="site-section scroll-reveal border-y light-surface">
        <div className={ui.container}>
          <div className="mb-7 text-center"><p className="section-eyebrow">FOLLOW YOUR CURIOSITY</p><h2 className="mt-2 text-3xl font-extrabold tracking-tight">Explore by category</h2><p className="mt-2 text-sm text-slate-500">Choose a subject and find your next focused session.</p></div>
          <div className="flex flex-wrap justify-center gap-3">
            <button type="button" onClick={() => setFilters({ ...filters, category: '', page: 1 })} className={`category-chip rounded-full px-5 py-3 text-sm font-semibold ${!filters.category ? 'is-active' : ''}`}>All topics</button>
            {categories.map((category) => <button type="button" key={category._id} onClick={() => { setFilters({ ...filters, category: category._id, page: 1 }); document.getElementById('quizzes')?.scrollIntoView({ behavior: 'smooth' }); }} className={`category-chip rounded-full px-5 py-3 text-sm font-semibold ${filters.category === category._id ? 'is-active' : ''}`}>{category.name}<span className="ml-2 text-violet-300/70">↗</span></button>)}
          </div>
        </div>
      </section>

      <section className="site-section scroll-reveal border-y light-surface">
        <div className={ui.container}>
          <p className="section-eyebrow text-center">MADE FOR MOMENTUM</p><h2 className="mb-8 mt-2 text-center text-3xl font-extrabold tracking-tight">Small sessions. Real progress.</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, text }) => (
              <div key={title} className={`${ui.card} scroll-reveal text-center`}>
                <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-lg bg-[#EAE4D8] text-[#9f5538]">
                  <Icon size={24} />
                </span>
                <h3 className="font-bold">{title}</h3>
                <p className="mt-1 text-sm text-slate-500">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`${ui.container} scroll-reveal`}>
        <h2 className="mb-8 text-center text-3xl font-bold">How it works</h2>
        <div className="grid gap-5 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.title} className={`${ui.card} scroll-reveal text-center`}>
              <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-lg bg-[#252525] text-xl font-semibold text-white">
                {index + 1}
              </span>
              <h3 className="font-bold">{step.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-14">
        <div className="cta-panel scroll-reveal px-6 py-12 text-center text-white">
          <h2 className="text-3xl font-bold">Ready to challenge yourself?</h2>
          <p className="mb-6 mt-2 opacity-90">Join now and take your first quiz in under a minute.</p>
          <Link href={user ? '/#quizzes' : '/register'} className={ui.white}>
            {user ? 'Pick a quiz' : 'Get started free'}
          </Link>
        </div>
      </section>
    </>
  );
}
