import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { isSupabaseConfigured, supabase, supabaseConfigError } from '../lib/supabase';

export default function Signup({ session, loading: authLoading }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600 dark:border-slate-800 dark:border-t-indigo-400" />
      </div>
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!isSupabaseConfigured) {
      toast.error(supabaseConfigError);
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        name: form.name,
        email: form.email,
      });

      if (profileError) {
        toast.error(profileError.message);
        setLoading(false);
        return;
      }
    }

    navigate('/dashboard', { replace: true });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-panel dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <BookOpen className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Start studying smarter</p>
            <h1 className="text-2xl font-semibold text-slate-950 dark:text-white">Create StudyNest</h1>
          </div>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {!isSupabaseConfigured ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
              Supabase keys are missing in <span className="font-medium">.env</span>.
            </div>
          ) : null}

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={form.name}
              onChange={(event) => setForm((value) => ({ ...value, name: event.target.value }))}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-slate-950 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="signup-email" className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Email
            </label>
            <input
              id="signup-email"
              type="email"
              required
              value={form.email}
              onChange={(event) => setForm((value) => ({ ...value, email: event.target.value }))}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-slate-950 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="signup-password" className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Password
            </label>
            <input
              id="signup-password"
              type="password"
              minLength={6}
              required
              value={form.password}
              onChange={(event) => setForm((value) => ({ ...value, password: event.target.value }))}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-slate-950 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
          Already registered?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}
