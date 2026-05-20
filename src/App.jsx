import { useEffect, useState } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Notes from './pages/Notes';
import Search from './pages/Search';
import Signup from './pages/Signup';
import Watch from './pages/Watch';
import { isSupabaseConfigured, supabase } from './lib/supabase';

function useDarkMode() {
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem('studynest-theme');
    return stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('studynest-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  return [darkMode, setDarkMode];
}

function AuthenticatedLayout({ user, profile, darkMode, onToggleDarkMode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <Navbar user={user} profile={profile} darkMode={darkMode} onToggleDarkMode={onToggleDarkMode} />
      <main className="mx-auto w-full max-w-7xl px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-8">
        <Outlet context={{ user, profile }} />
      </main>
    </div>
  );
}

function RootRedirect({ session, loading }) {
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600 dark:border-slate-800 dark:border-t-indigo-400" />
      </div>
    );
  }

  return <Navigate to={session ? '/dashboard' : '/login'} replace />;
}

export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useDarkMode();
  const user = session?.user ?? null;

  useEffect(() => {
    let mounted = true;

    async function hydrateSession() {
      if (!isSupabaseConfigured) {
        if (mounted) {
          setLoading(false);
        }
        return;
      }

      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      if (mounted) {
        setSession(currentSession);
        setLoading(false);
      }
    }

    hydrateSession();

    const subscription = isSupabaseConfigured
      ? supabase.auth.onAuthStateChange((_event, nextSession) => {
          setSession(nextSession);
          setLoading(false);
        }).data.subscription
      : null;

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      if (!user) {
        setProfile(null);
        return;
      }

      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();

      if (active) {
        setProfile(data);
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [user]);

  return (
    <Routes>
      <Route path="/login" element={<Login session={session} loading={loading} />} />
      <Route path="/signup" element={<Signup session={session} loading={loading} />} />

      <Route element={<ProtectedRoute session={session} loading={loading} />}>
        <Route
          element={
            <AuthenticatedLayout
              user={user}
              profile={profile}
              darkMode={darkMode}
              onToggleDarkMode={() => setDarkMode((value) => !value)}
            />
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/search" element={<Search />} />
          <Route path="/watch" element={<Watch />} />
          <Route path="/notes" element={<Notes />} />
        </Route>
      </Route>

      <Route path="/" element={<RootRedirect session={session} loading={loading} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
