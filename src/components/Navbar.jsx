import { BookOpen, ChevronDown, Download, LayoutDashboard, LogOut, Moon, NotebookPen, Search, Sun } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

function getInitials(profile, user) {
  const source = profile?.name || user?.email || 'Student';
  const pieces = source.trim().split(/\s+/).filter(Boolean);

  return pieces
    .slice(0, 2)
    .map((piece) => piece[0]?.toUpperCase())
    .join('');
}

const navItems = [
  { to: '/search', label: 'Search', icon: Search },
  { to: '/notes', label: 'My Notes', icon: NotebookPen },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
];

function ProfileMenu({ initials, displayName, email, onInstall, onLogout }) {
  const menuRef = useRef(null);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(event) {
      if (!menuRef.current?.contains(event.target)) {
        setProfileOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setProfileOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setProfileOpen((value) => !value)}
        className="flex items-center gap-2 rounded-lg border border-transparent px-1 py-1 hover:border-slate-200 hover:bg-slate-100 dark:hover:border-slate-800 dark:hover:bg-slate-900"
        aria-expanded={profileOpen}
        aria-haspopup="menu"
        title="My profile"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 font-semibold text-white">
          {initials}
        </span>
        <ChevronDown className="hidden h-4 w-4 text-slate-500 dark:text-slate-400 sm:block" />
      </button>

      {profileOpen ? (
        <div
          className="absolute right-0 z-50 mt-3 w-64 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-panel dark:border-slate-800 dark:bg-slate-900"
          role="menu"
        >
          <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
            <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{displayName}</p>
            {email ? <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{email}</p> : null}
          </div>

          <button
            type="button"
            onClick={onInstall}
            className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
            role="menuitem"
          >
            <Download className="h-4 w-4" />
            <span>Install App</span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/40"
            role="menuitem"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default function Navbar({ user, profile, darkMode, onToggleDarkMode }) {
  const navigate = useNavigate();
  const initials = getInitials(profile, user);
  const displayName = profile?.name || 'Student';
  const email = user?.email || '';
  const [installPrompt, setInstallPrompt] = useState(null);

  useEffect(() => {
    function handleBeforeInstallPrompt(event) {
      event.preventDefault();
      setInstallPrompt(event);
    }

    function handleInstalled() {
      setInstallPrompt(null);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  async function handleInstallApp() {
    if (!installPrompt) {
      toast('Open the production preview or use Chrome menu > Save and share > Install StudyNest.');
      return;
    }

    installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  }

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast.error(error.message);
      return;
    }

    navigate('/login', { replace: true });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <NavLink to="/dashboard" className="flex items-center gap-2 text-xl font-semibold text-slate-950 dark:text-white">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <BookOpen className="h-5 w-5" />
            </span>
            <span>StudyNest</span>
          </NavLink>

          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={onToggleDarkMode}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              title={darkMode ? 'Light mode' : 'Dark mode'}
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <ProfileMenu
              initials={initials}
              displayName={displayName}
              email={email}
              onInstall={handleInstallApp}
              onLogout={handleLogout}
            />
          </div>
        </div>

        <nav className="hidden gap-2 overflow-x-auto lg:flex">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                [
                  'flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium',
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900',
                ].join(' ')
              }
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <button
            type="button"
            onClick={onToggleDarkMode}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            title={darkMode ? 'Light mode' : 'Dark mode'}
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <ProfileMenu
            initials={initials}
            displayName={displayName}
            email={email}
            onInstall={handleInstallApp}
            onLogout={handleLogout}
          />
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-3 pb-[env(safe-area-inset-bottom)] pt-2 shadow-panel backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-3 gap-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                [
                  'flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 text-xs font-medium',
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900',
                ].join(' ')
              }
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  );
}
