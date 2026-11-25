'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FiAward, FiBookOpen, FiLogIn, FiLogOut, FiMenu, FiUser, FiUserPlus, FiX } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { ui } from '@/lib/ui';

const linkClass = 'nav-link flex items-center gap-1.5 text-sm font-medium';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`site-nav sticky top-0 z-30 border-b transition-all ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="site-container flex min-h-[68px] items-center gap-6 py-3">
        <Link href="/" className="mr-auto flex items-center gap-2.5 text-xl font-extrabold tracking-tight text-[#252525]">
          <span className="brand-mark grid h-9 w-9 place-items-center rounded-xl">Q</span> Quizly
        </Link>
        <button type="button" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} onClick={() => setOpen(!open)} className="ml-auto grid h-10 w-10 place-items-center rounded-md border border-[#DDD6CA] text-[#252525] md:hidden">{open ? <FiX /> : <FiMenu />}</button>
        <div className={`nav-menu ${open ? 'mobile-open' : ''}`}>
        <Link href="/" onClick={() => setOpen(false)} className={linkClass}>
          <FiBookOpen /> Quizzes
        </Link>
        <Link href="/leaderboard" onClick={() => setOpen(false)} className={linkClass}>
          <FiAward /> Leaderboard
        </Link>
        {user ? (
          <>
            <Link href="/dashboard" className={linkClass} onClick={() => setOpen(false)}>
              <FiUser /> {user.name}
            </Link>
            <button onClick={() => { logout(); setOpen(false); }} className={linkClass}>
              <FiLogOut /> Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className={linkClass} onClick={() => setOpen(false)}>
              <FiLogIn /> Login
            </Link>
            <Link href="/register" onClick={() => setOpen(false)} className={`${ui.btn} !px-4 !py-2 text-sm`}>
              <FiUserPlus /> Sign up
            </Link>
          </>
        )}
        </div>
      </div>
    </nav>
  );
}
