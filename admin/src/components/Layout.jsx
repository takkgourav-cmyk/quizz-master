import { NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { FiBarChart2, FiFileText, FiGrid, FiLogOut, FiTag, FiUsers } from 'react-icons/fi';

const links = [
  { to: '/', label: 'Dashboard', icon: FiGrid },
  { to: '/quizzes', label: 'Quizzes', icon: FiFileText },
  { to: '/categories', label: 'Categories', icon: FiTag },
  { to: '/attempts', label: 'Reports', icon: FiBarChart2 },
  { to: '/users', label: 'Users', icon: FiUsers },
];

export default function Layout() {
  const navigate = useNavigate();
  if (!localStorage.getItem('adminToken')) return <Navigate to="/login" replace />;

  const logout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  return (
    <div className="admin-page md:flex">
      <aside className="admin-sidebar flex items-center gap-1 overflow-x-auto border-b p-3 md:fixed md:inset-y-0 md:w-64 md:flex-col md:items-stretch md:border-b-0 md:border-r md:p-5">
        <div className="mr-4 flex items-center gap-2.5 text-xl font-extrabold md:mb-6 md:mr-0">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-[#C96B43] text-white">Q</span>
          <span className="admin-brand-copy hidden sm:inline">Quizly<span className="ml-2 text-[10px] font-semibold uppercase tracking-[.18em] text-slate-500">Studio</span></span>
        </div>
        <div className="admin-nav-links flex items-center gap-1 overflow-x-auto md:flex-col md:items-stretch">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `admin-link flex items-center gap-3 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                isActive ? 'active-link' : ''
              }`
            }
          >
            <Icon size={18} /> {label}
          </NavLink>
        ))}
        </div>
        <div className="hidden items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3 md:mt-auto md:flex">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#EAE4D8] text-sm font-bold text-[#9f5538]">G</span>
          <span><b className="block text-sm text-slate-800">Gourav</b><small className="text-xs text-slate-500">Administrator</small></span>
        </div>
        <button
          onClick={logout}
          className="ml-auto flex items-center gap-3 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50 md:ml-0 md:mt-auto"
        >
          <FiLogOut size={18} /> Log out
        </button>
      </aside>
      <main className="admin-main w-full flex-1 p-4 sm:p-8 md:ml-64">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
