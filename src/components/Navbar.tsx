import { useState } from 'react';
import { ShieldCheck, Menu, X, LogOut, User as UserIcon, LayoutDashboard, History, ScanText, Info, Mail } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { Link, useRouter } from '../lib/router';

const navLinks = [
  { to: '/', label: 'Home', icon: ShieldCheck },
  { to: '/detect', label: 'Detect', icon: ScanText },
  { to: '/history', label: 'History', icon: History, auth: true },
  { to: '/admin', label: 'Admin', icon: LayoutDashboard, admin: true },
  { to: '/about', label: 'About', icon: Info },
  { to: '/contact', label: 'Contact', icon: Mail },
];

export default function Navbar() {
  const { user, profile, isAdmin, signOut } = useAuth();
  const { route } = useRouter();
  const [open, setOpen] = useState(false);

  const links = navLinks.filter((l) => !l.auth || user).filter((l) => !l.admin || isAdmin);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-lg">
      <nav className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-700 to-sky-600 shadow-md">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <span className="font-display text-lg font-bold text-slate-900">
            Truth<span className="text-teal-700">Guard</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => {
            const active = route.path === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                  active ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>

        {/* Auth area */}
        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <div className="flex items-center gap-2">
              <Link to="/history" className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-100">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                  <UserIcon className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-slate-800 leading-tight">
                    {profile?.full_name || 'User'}
                  </p>
                  <p className="text-xs text-slate-500 leading-tight">
                    {isAdmin ? 'Admin' : 'User'}
                  </p>
                </div>
              </Link>
              <button onClick={signOut} className="btn-ghost" title="Sign out">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">Sign in</Link>
              <Link to="/register" className="btn-primary">Get Started</Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-slate-200 bg-white md:hidden animate-fade-in">
          <div className="container-page space-y-1 py-3">
            {links.map((l) => {
              const Icon = l.icon;
              const active = route.path === l.to;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                    active ? 'bg-teal-50 text-teal-700' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {l.label}
                </Link>
              );
            })}
            {user ? (
              <button
                onClick={() => { signOut(); setOpen(false); }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link to="/login" onClick={() => setOpen(false)} className="btn-secondary flex-1">Sign in</Link>
                <Link to="/register" onClick={() => setOpen(false)} className="btn-primary flex-1">Get Started</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
